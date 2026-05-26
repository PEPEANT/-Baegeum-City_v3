import "./billboard-ad-renderer.js";
import { drawDrawingWorldCharacter } from "../skins/drawing-world-adapter.js";
import { drawChatBubble } from "./chat-bubble-renderer.js";
import { drawHorseRacingInteriorProp } from "./horse-racing-interior-renderer.js";
import { drawMapTransitions } from "./map-transition-renderer.js";
import { drawSimpleScenery } from "./simple-scenery-renderer.js";
import { drawCityBoundaryObstacles } from "./city-boundary-renderer.js";
export class WorldRenderer {
  constructor(ctx) {
    this.ctx = ctx;
  }
  drawCity(game) {
    if (!this.drawOriginalBase(game)) {
      this.drawGround(game.map);
      this.drawRoads(game.map);
      this.drawObstacles(game.map.obstacles);
      drawSimpleScenery(this.ctx, game.map.scenery);
      this.drawBuildings(game.map.buildings, game.nearbyDoor);
    } else {
      this.drawDoorLinks(game.map.buildings, game.nearbyDoor);
      this.drawBuildingSigns(game.map.buildings);
    }
    drawMapTransitions(this.ctx, game.map.mapTransitions, game.nearbyInteraction?.transition);
    this.drawDebugNav(game);
    for (const npc of game.npcs) {
      this.drawPerson(npc, "#ecd08a", npc.name);
      drawChatBubble(this.ctx, game, npc);
    }
    this.drawPerson(game.player, "#8fe0ff", "YOU");
    drawChatBubble(this.ctx, game, game.player);
  }
  drawOriginalBase(game) {
    if (game.map.mapId !== "baegeum-city") return false;
    const proto = window.IronLine?.Renderer?.prototype;
    if (!proto?.drawTerrain || !proto?.drawObstacles || !proto?.drawScenery) return false;
    const original = this.originalRenderer || (this.originalRenderer = Object.create(proto));
    original.ctx = this.ctx;
    proto.drawTerrain.call(original, game);
    proto.drawObstacles.call(original, game);
    drawCityBoundaryObstacles(this.ctx, game.map.obstacles);
    proto.drawScenery.call(original, game);
    return true;
  }
  drawInterior(game) {
    const interior = game.currentInterior;
    const theme = interior.theme || { floor: "#312e28", wall: "#4c3d2d", prop: "#a9814d" };
    this.ctx.fillStyle = theme.floor;
    this.ctx.fillRect(0, 0, 1100, 820);
    this.roundRect(interior.bounds, "#d9c897", theme.wall, 18);
    for (const prop of interior.props) this.drawInteriorProp(prop, theme);
    for (const wall of interior.walls) this.roundRect(wall, theme.wall, "#2f251d", 2);
    this.drawDoor(interior.exit, true);
    this.drawPerson(game.player, "#8fe0ff", "YOU");
    drawChatBubble(this.ctx, game, game.player);
    this.ctx.fillStyle = "#2a2017";
    this.ctx.font = "28px Dotum, '돋움', 'Malgun Gothic', sans-serif";
    this.ctx.fillText(interior.name, interior.bounds.x + 30, interior.bounds.y + 54);
  }
  drawMinimap(game) {
    const proto = window.IronLine?.Renderer?.prototype;
    if (!proto?.drawMinimap || isPhoneFocusActive()) return false;
    const original = this.originalRenderer || (this.originalRenderer = Object.create(proto));
    original.ctx = this.ctx;
    original.camera = {
      x: game.camera.x,
      y: game.camera.y,
      width: game.camera.width,
      height: 156,
      viewWidth: game.camera.width,
      viewHeight: game.camera.height,
      zoom: 1
    };
    proto.drawMinimap.call(original, createMinimapGame(game));
    return true;
  }
  drawTimeOverlay(game) {
    const clock = game.clockSnapshot;
    if (!clock?.overlayAlpha) return;
    this.ctx.save();
    this.ctx.fillStyle = clock.overlayColor;
    this.ctx.fillRect(0, 0, game.camera.width, game.camera.height);
    if (clock.phaseKey === "night") {
      this.ctx.fillStyle = "rgba(255, 218, 126, 0.08)";
      this.ctx.beginPath();
      this.ctx.arc(game.player.x - game.camera.x, game.player.y - game.camera.y, 130, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }
  drawGround(map) {
    this.ctx.fillStyle = "#78835e";
    this.ctx.fillRect(0, 0, map.width, map.height);
    for (const patch of map.patches || map.terrainPatches || []) {
      this.ctx.beginPath();
      this.ctx.fillStyle = patch.color;
      this.ctx.arc(patch.x, patch.y, patch.r, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
  drawRoads(map) {
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    for (const road of map.roads) {
      this.ctx.strokeStyle = "#4f4d45";
      this.ctx.lineWidth = map.roadWidth + 18;
      this.strokePath(road);
      this.ctx.strokeStyle = "#756f5f";
      this.ctx.lineWidth = map.roadWidth;
      this.strokePath(road);
      this.ctx.strokeStyle = "rgba(237, 224, 179, 0.32)";
      this.ctx.lineWidth = 5;
      this.strokePath(road);
    }
  }
  drawObstacles(obstacles) {
    drawCityBoundaryObstacles(this.ctx, obstacles);
    for (const item of obstacles) {
      if (item.kind !== "city-boundary") this.roundRect(item, item.kind === "base-wall" ? "#52564b" : "#68675e", "#3b3a34", 5);
    }
  }
  drawBuildings(buildings, nearby) {
    for (const building of buildings) {
      const active = nearby?.building?.id === building.id;
      this.roundRect(building.rect, active ? "#7a6845" : "#58615a", "#2d342f", 7);
      this.ctx.fillStyle = "rgba(255, 241, 173, 0.22)";
      this.ctx.fillRect(building.rect.x + 16, building.rect.y + 18, Math.max(24, building.rect.w - 32), 10);
      for (const door of building.doors) this.drawDoor(door, active);
      this.drawBuildingSign(building);
    }
  }
  drawDoorLinks(buildings, nearby) {
    for (const building of buildings) {
      const active = nearby?.building?.id === building.id;
      for (const door of building.doors || []) this.drawDoor(door, active);
    }
  }
  drawDoor(door, active) {
    this.ctx.beginPath();
    this.ctx.fillStyle = active ? "#f6d36a" : "#c18547";
    this.ctx.arc(door.x, door.y, active ? 18 : 13, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = "#33261c";
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
  }

  drawBuildingSigns(buildings) {
    for (const building of buildings) this.drawBuildingSign(building);
  }

  drawBuildingSign(building) {
    const label = building.sign || building.name;
    if (!label) return;
    const rect = building.rect;
    const door = building.doors?.[0];
    const signHeight = 34;
    const anchor = building.signAnchor || (door ? { x: door.x, y: door.y - 42 } : null);
    const y = anchor ? anchor.y - signHeight / 2 : rect.y - signHeight - 10;
    const x = anchor?.x || rect.x + rect.w / 2;
    this.ctx.save();
    this.ctx.font = "bold 22px 'Malgun Gothic', sans-serif";
    const width = Math.max(92, this.ctx.measureText(label).width + 28);
    this.ctx.fillStyle = building.venueType === "support" ? "rgba(14, 48, 42, 0.94)" : "rgba(48, 18, 28, 0.94)";
    this.ctx.strokeStyle = "rgba(255, 215, 102, 0.9)";
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.roundRect(x - width / 2, y, width, signHeight, 8);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.fillStyle = "#ffe186";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(label, x, y + signHeight / 2 + 1);
    this.ctx.restore();
  }

  drawInteriorProp(prop, theme) {
    if (drawHorseRacingInteriorProp(this.ctx, prop)) return;
    if (prop.role === "exchange-atm") return this.drawExchangeAtm(prop);
    this.roundRect(prop, theme.prop, "#5d4328", 8);
    if (!prop.label) return;
    this.ctx.save();
    this.ctx.fillStyle = "#fff0ba";
    this.ctx.font = "16px 'Malgun Gothic', sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(prop.label, prop.x + prop.w / 2, prop.y + prop.h / 2);
    this.ctx.restore();
  }

  drawExchangeAtm(prop) {
    this.roundRect(prop, "#16202a", "#7dd3fc", 10);
    this.ctx.save();
    this.ctx.fillStyle = "#06141c";
    this.ctx.fillRect(prop.x + 18, prop.y + 14, prop.w - 36, 24);
    this.ctx.fillStyle = "#67e8f9";
    this.ctx.font = "bold 13px Orbitron, 'Malgun Gothic', sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText("EXCHANGE", prop.x + prop.w / 2, prop.y + 27);
    this.ctx.fillStyle = "#ffd36b";
    this.ctx.font = "15px 'Malgun Gothic', sans-serif";
    this.ctx.fillText(prop.label || "환전 ATM", prop.x + prop.w / 2, prop.y + 60);
    this.ctx.restore();
  }

  drawPerson(entity, color, label) {
    if (drawDrawingWorldCharacter(this.ctx, entity, { color, label })) return;
    this.ctx.save();
    this.ctx.translate(entity.x, entity.y);
    this.ctx.rotate(entity.angle || 0);
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
    this.ctx.beginPath();
    this.ctx.ellipse(3, 5, entity.radius + 4, entity.radius, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, entity.radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = "#26302a";
    this.ctx.fillRect(5, -3, entity.radius + 6, 6);
    this.ctx.restore();
    this.ctx.fillStyle = "rgba(24, 28, 21, 0.8)";
    this.ctx.font = "12px Dotum, '돋움', 'Malgun Gothic', sans-serif";
    this.ctx.fillText(label, entity.x - 16, entity.y - entity.radius - 12);
  }

  drawDebugNav(game) {
    if (!game.debugNav) return;
    this.ctx.strokeStyle = "rgba(255, 237, 150, 0.45)";
    this.ctx.lineWidth = 3;
    for (const [a, b] of game.map.navGraph.edges) {
      const from = game.navGraph.nodeById.get(a);
      const to = game.navGraph.nodeById.get(b);
      if (from && to) this.line(from.x, from.y, to.x, to.y);
    }
  }

  strokePath(points) {
    this.ctx.beginPath();
    points.forEach((point, index) => index ? this.ctx.lineTo(point.x, point.y) : this.ctx.moveTo(point.x, point.y));
    this.ctx.stroke();
  }

  line(x1, y1, x2, y2) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  roundRect(rect, fill, stroke, radius = 6) {
    this.ctx.beginPath();
    this.ctx.roundRect(rect.x, rect.y, rect.w, rect.h, radius);
    this.ctx.fillStyle = fill;
    this.ctx.fill();
    this.ctx.strokeStyle = stroke;
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
  }
}
function createMinimapGame(game) {
  const team = window.IronLine?.constants?.TEAM?.BLUE || "blue";
  return {
    world: game.map,
    settings: { mobileControls: false },
    deploymentOpen: false,
    hud: { commandRadio: { open: false } },
    adminObserverMode: false,
    player: { ...game.player, team, hp: 100 },
    capturePoints: createMinimapCapturePoints(game.map),
    tanks: [],
    humvees: [],
    crews: [],
    infantry: game.npcs.map((npc) => ({ ...npc, alive: true, team, inVehicle: false })),
    drones: [],
    onlineSession: {
      playerId: "local",
      players: [{ id: "local", participantType: "player", team }]
    }
  };
}

function createMinimapCapturePoints(map) {
  const owner = window.IronLine?.constants?.TEAM?.NEUTRAL || "neutral";
  if (Array.isArray(map.capturePoints) && map.capturePoints.length) {
    return map.capturePoints.map((point) => ({ ...point, owner: point.owner || owner }));
  }
  return (map.buildings || []).slice(0, 6).map((building) => ({
    name: String(building.name || "?").slice(0, 1),
    x: building.rect.x + building.rect.w / 2,
    y: building.rect.y + building.rect.h / 2,
    owner
  }));
}

function isPhoneFocusActive() {
  return document.body.classList.contains("phone-focus-active") || document.body.classList.contains("phone-stage-active");
}
