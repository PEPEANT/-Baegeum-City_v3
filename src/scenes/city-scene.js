import { Input } from "../core/input.js";
import { angleTo } from "../core/math.js";
import { cityMap } from "../data/city-map.js";
import { compactBaegeumMapLayout } from "../data/baegeum-city-compact-layout.js";
import { diceCityMap } from "../data/dice-city-map.js";
import { interiors } from "../data/interiors.js";
import { MAP_IDS } from "../data/map-registry.js";
import { applyWorldEditorDraft } from "../data/world-editor-draft.js";
import { Player } from "../entities/player.js";
import { Npc } from "../entities/npc.js";
import { readCityHudLabels, updateCityHudLabels } from "./city-hud.js";
import { resolveStartupMapId, resolveStartupSpawn } from "./city-startup.js";
import { createRuntimeInterior, createRuntimeMap } from "./city-scene-runtime.js";
import { Camera } from "../systems/camera.js";
import { CollisionWorld } from "../systems/collision.js";
import { findInteriorInteraction, runInteriorInteraction } from "../systems/interior-interaction-runtime.js";
import { commitLocalGameAction, createVenueEntryEnvelope, createVenueExitEnvelope } from "../systems/local-action-runtime.js";
import { findMapTransitionInteraction, runMapTransitionInteraction } from "../systems/map-transition-interaction.js";
import { createMapTransitionEnvelope } from "../systems/map-transition-runtime.js";
import { NavGraph } from "../systems/navigation.js";
import { createCityPlayerState, createTablePlayerState, createVenueLobbyPlayerState, createVenuePlayerState } from "../systems/player-state.js";
import { patchRuntimeState } from "../systems/runtime-state-facade.js";
import { dueTimeEvents, WorldClock } from "../systems/world-clock.js";
import { WorldChat } from "../systems/world-chat.js";
import { WorldRenderer } from "../renderers/world-renderer.js";
import { applyStoredSkinToPlayer, assignNpcSkin } from "../skins/drawing-world-adapter.js";

export class CityGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.map = this.createMapForMapId(resolveStartupMapId());
    this.world = this.map;
    this.input = new Input(window);
    this.player = new Player(resolveStartupSpawn(this.map));
    applyStoredSkinToPlayer(this.player);
    this.camera = new Camera(canvas, this.map);
    this.renderer = new WorldRenderer(this.ctx);
    this.scene = "city";
    this.currentInterior = null;
    this.lastCityPosition = { ...this.map.playerSpawn };
    this.clock = new WorldClock();
    this.clockSnapshot = this.clock.snapshot();
    this.contract = {
      mapId: this.map.mapId,
      sceneId: this.map.sceneId,
      spawnId: this.map.defaultSpawnId,
      worldChannelId: this.map.worldChannelId,
      mapVersion: this.map.mapVersion,
      venueSchemaVersion: this.map.venueSchemaVersion
    };
    this.playerState = createCityPlayerState(this.contract);
    this.chat = new WorldChat({ player: this.player, clockSnapshot: () => this.clockSnapshot, channel: this.playerState.chatChannelId });
    this.executedActionRequestIds = new Set();
    this.actionHistory = [];
    this.lastActionEnvelope = null;
    this.debugNav = false;
    this.nearbyDoor = null;
    this.nearbyInteraction = null;
    this.lastTime = 0;
    this.cityCollision = new CollisionWorld({
      width: this.map.width,
      height: this.map.height,
      obstacles: this.cityBlockers()
    });
    this.interiorCollision = null;
    this.navGraph = new NavGraph(this.map.navGraph, this.cityBlockers());
    this.npcs = this.createNpcs();
    this.labels = readCityHudLabels();
    this.publishRuntimeState({ game: this });
    window.addEventListener("resize", () => this.camera.resize());
  }

  start() {
    this.canvas.focus();
    this.publishClock();
    requestAnimationFrame((time) => this.loop(time));
  }

  loop(time) {
    const dt = Math.min(0.05, (time - (this.lastTime || time)) / 1000 || 0);
    this.lastTime = time;
    this.update(dt);
    this.draw();
    this.input.endFrame();
    requestAnimationFrame((next) => this.loop(next));
  }

  update(dt) {
    this.updateClock(dt);
    if (this.input.consume("KeyG")) this.debugNav = !this.debugNav;
    if (this.scene === "city") this.updateCity(dt);
    else this.updateInterior(dt);
    this.updateHud();
  }

  updateCity(dt) {
    this.movePlayer(dt, this.cityCollision);
    for (const npc of this.npcs) npc.update(dt, this.cityCollision);
    this.nearbyInteraction = findMapTransitionInteraction(this);
    this.nearbyDoor = this.nearbyInteraction ? null : this.cityCollision.nearestDoor(this.player, this.map.buildings);
    if (this.input.consume("KeyE")) {
      if (this.nearbyInteraction) runMapTransitionInteraction(this, this.nearbyInteraction);
      else if (this.nearbyDoor) this.enterInterior(this.nearbyDoor);
    }
    this.camera.follow(this.player, dt);
  }

  updateInterior(dt) {
    this.movePlayer(dt, this.interiorCollision);
    this.nearbyInteraction = findInteriorInteraction(this);
    this.nearbyDoor = this.nearbyInteraction?.nearbyDoor || null;
    if (this.nearbyInteraction && this.input.consume("KeyE")) runInteriorInteraction(this, this.nearbyInteraction);
    this.camera.follow(this.player, dt);
  }

  movePlayer(dt, collision) {
    const move = this.input.movementVector();
    if (!move.moving) {
      this.player.moving = false;
      return;
    }
    this.player.angle = angleTo(0, 0, move.x, move.y);
    this.player.facing = move.x < -0.05 ? -1 : 1;
    this.player.moving = true;
    const next = collision.moveCircle(this.player, move.x * this.player.speed * dt, move.y * this.player.speed * dt);
    this.player.setPosition(next);
  }

  enterInterior(entry) {
    const interior = createRuntimeInterior(interiors[entry.door.targetSceneId], entry);
    if (!interior) return;
    const envelope = createVenueEntryEnvelope({ entry, interior, playerState: this.playerState, contract: this.contract });
    if (!commitLocalGameAction(this, envelope).ok) return;
    this.lastCityPosition = entry.door.returnSpawn || { x: this.player.x, y: this.player.y };
    this.scene = interior.id;
    this.currentInterior = interior;
    this.playerState = createVenuePlayerState(interior, this.contract);
    this.publishPlayerState();
    this.chat.setChannel(interior.channels?.venue || this.playerState.chatChannelId, { systemText: `${interior.name} 입장` });
    this.player.setPosition(interior.spawn);
    this.camera.world = { width: 1100, height: 820 };
    this.camera.x = 0;
    this.camera.y = 0;
    this.interiorCollision = new CollisionWorld({
      width: 1100,
      height: 820,
      obstacles: interior.walls
    });
  }

  exitInterior() {
    const envelope = createVenueExitEnvelope({ interior: this.currentInterior, playerState: this.playerState, contract: this.contract });
    if (!commitLocalGameAction(this, envelope).ok) return;
    this.scene = "city";
    this.currentInterior = null;
    this.playerState = createCityPlayerState(this.contract);
    this.publishPlayerState();
    this.chat.setChannel(this.playerState.chatChannelId, { systemText: "도시 채팅으로 돌아옴" });
    this.player.setPosition(this.lastCityPosition);
    this.camera.world = this.map;
    this.camera.x = Math.max(0, this.player.x - this.camera.width / 2);
    this.camera.y = Math.max(0, this.player.y - this.camera.height / 2);
  }

  sitTable(envelope) {
    if (!commitLocalGameAction(this, envelope).ok) return false;
    const effect = envelope.effects.find((item) => item.type === "player_state_patch");
    this.playerState = createTablePlayerState({ ...this.playerState, ...effect?.payload });
    this.publishPlayerState();
    this.chat.setChannel(this.playerState.chatChannelId, { systemText: "테이블 채팅으로 이동" });
    return true;
  }

  leaveTable(envelope) {
    if (!commitLocalGameAction(this, envelope).ok) return false;
    const effect = envelope.effects.find((item) => item.type === "player_state_patch");
    this.playerState = createVenueLobbyPlayerState({ ...this.playerState, ...effect?.payload });
    this.publishPlayerState();
    this.chat.setChannel(this.playerState.chatChannelId, { systemText: "건물 채팅으로 돌아옴" });
    return true;
  }

  transitionMap(transition) {
    const envelope = createMapTransitionEnvelope({ transition, playerState: this.playerState, contract: this.contract });
    if (!commitLocalGameAction(this, envelope).ok) return false;
    const state = envelope.effects.find((item) => item.type === "player_state_patch")?.payload;
    const nextMap = this.createMapForMapId(state.mapId);
    this.applyCityMap(nextMap, state);
    this.chat.setChannel(this.playerState.chatChannelId, { systemText: `${transition.label} 도착` });
    return true;
  }
  applyCityMap(map, state) {
    this.map = map;
    this.world = map;
    this.scene = "city";
    this.currentInterior = null;
    this.contract = this.contractForMap(map);
    this.playerState = { ...state, mapVersion: map.mapVersion, venueSchemaVersion: map.venueSchemaVersion };
    this.player.setPosition(this.spawnPoint(map, state.spawnId));
    this.camera.world = map;
    this.camera.x = Math.max(0, this.player.x - this.camera.width / 2);
    this.camera.y = Math.max(0, this.player.y - this.camera.height / 2);
    this.cityCollision = new CollisionWorld({ width: map.width, height: map.height, obstacles: this.cityBlockers() });
    this.navGraph = new NavGraph(map.navGraph, this.cityBlockers());
    this.npcs = this.createNpcs();
    this.nearbyDoor = null;
    this.nearbyInteraction = null;
    this.publishRuntimeState({ game: this });
  }

  draw() {
    this.camera.apply(this.ctx);
    if (this.scene === "city") this.renderer.drawCity(this);
    else this.renderer.drawInterior(this);
    this.ctx.restore();
    this.renderer.drawTimeOverlay(this);
    if (this.scene === "city") this.renderer.drawMinimap(this);
  }

  updateClock(dt) {
    const previous = this.clock.minuteOfDay;
    if (!this.clock.update(dt)) return;
    this.lastTimeEvents = dueTimeEvents(previous, this.clock.minuteOfDay);
    this.publishClock();
  }

  publishClock() {
    this.clockSnapshot = this.clock.snapshot();
    this.publishRuntimeState();
    window.dispatchEvent(new CustomEvent("baegeum:clock", { detail: this.clockSnapshot }));
  }

  publishRuntimeState(extra = {}) {
    patchRuntimeState({
      clock: this.clock,
      clockSnapshot: this.clockSnapshot,
      chat: this.chat,
      contract: this.contract,
      playerState: this.playerState,
      actionHistory: this.actionHistory,
      lastActionEnvelope: this.lastActionEnvelope,
      ...extra
    });
  }

  publishPlayerState() {
    patchRuntimeState({ playerState: this.playerState });
  }
  createMapForMapId(mapId) {
    const source = mapId === MAP_IDS.DICE_CITY ? diceCityMap : (window.IronLine?.map01 || cityMap);
    const drafted = applyWorldEditorDraft(source, { mapId });
    const map = mapId === MAP_IDS.BAEGEUM_CITY ? compactBaegeumMapLayout(drafted) : drafted;
    return createRuntimeMap(map);
  }

  contractForMap(map) {
    return {
      mapId: map.mapId,
      sceneId: map.sceneId,
      spawnId: map.defaultSpawnId,
      worldChannelId: map.worldChannelId,
      mapVersion: map.mapVersion,
      venueSchemaVersion: map.venueSchemaVersion
    };
  }

  cityBlockers() {
    return [
      ...this.map.obstacles,
      ...this.map.buildings.map((building) => building.rect)
    ];
  }

  createNpcs() {
    const fallbackSeeds = (this.map.navGraph?.nodes || []).slice(0, 10).map((node) => node.id);
    const seeds = this.map.mapId === MAP_IDS.BAEGEUM_CITY
      ? ["blue_base", "west_low_road", "mid_north", "b_point", "east_center", "d_east", "red_mid", "c_point", "d_point", "red_gate_out"]
      : fallbackSeeds;
    return seeds.map((id, index) => {
      const npc = new Npc(index, this.navGraph.nodeById.get(id) || this.map.playerSpawn, this.navGraph);
      assignNpcSkin(npc, index);
      return npc;
    });
  }

  spawnPoint(map, spawnId) {
    return map.navGraph?.nodes?.find((node) => node.id === spawnId) || map.spawns?.[spawnId] || map.playerSpawn;
  }

  updateHud() {
    updateCityHudLabels(this);
  }
}
