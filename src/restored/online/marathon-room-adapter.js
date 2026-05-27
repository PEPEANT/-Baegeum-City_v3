import { canUseRestoredOnlineLobby, createRestoredOnlineAdapterSnapshot, createRestoredUnavailableOnlineAdapter, validateRestoredOnlineAdapter } from "./online-adapter-contract.js";
import { createRestoredMarathonChannelSet, validateRestoredMarathonChannelContract } from "./marathon-channel-adapter.js";
import { createRestoredMarathonNetcodeProfile, createRestoredMarathonPingSample, createRestoredMarathonReconciliationHint } from "./marathon-netcode-contract.js";
import { createServerBackedMarathonRoomAdapter } from "./marathon-server-room-adapter.js";
import { RESTORED_MARATHON_AUTHORITY, RESTORED_MARATHON_CONTRACT_VERSION, RESTORED_MARATHON_DEFAULT_MAX_SPECTATORS, RESTORED_MARATHON_MAX_RUNNERS, canJoinRestoredMarathonRoom, countRestoredMarathonRunners, countRestoredMarathonSpectators, createRestoredMarathonOnlinePacket, createRestoredMarathonParticipant, createRestoredMarathonRoom, validateRestoredMarathonOnlinePacket } from "../games/marathon-contract.js";

export const RESTORED_MARATHON_ROOM_ADAPTER_VERSION = "restored-marathon-room-adapter-001";
export const RESTORED_MARATHON_DEV_QUERY_FLAG = "devOnline";
export { createServerBackedMarathonRoomAdapter } from "./marathon-server-room-adapter.js";

const DEV_PROVIDER = "dev_marathon_room";
const DEV_ROOM_ID = "room:singularity-race:dev-001";
const DEFAULT_MAP_VERSION = "baegeum-city-v2-map-001";
const DEFAULT_VENUE_SCHEMA_VERSION = "venue-schema-001";

export function createUnavailableMarathonRoomAdapter(reason = "dev_flag_missing") {
  return Object.freeze({
    adapterVersion: RESTORED_MARATHON_ROOM_ADAPTER_VERSION,
    adapterType: "unavailable",
    provider: "none",
    devOnly: true,
    reason,
    online: createRestoredUnavailableOnlineAdapter(reason),
    channels: createRestoredMarathonChannelSet(),
    rooms: Object.freeze([])
  });
}

export function createDevConnectedMarathonRoomAdapter(options = {}) {
  const serverTimeMs = Math.max(0, Number(options.serverTimeMs || 1000));
  const room = createRestoredMarathonRoom({
    roomId: options.roomId || DEV_ROOM_ID,
    displayName: options.displayName || "Singularity Race Dev Room 001",
    authority: RESTORED_MARATHON_AUTHORITY.SERVER_REQUIRED,
    maxRunners: RESTORED_MARATHON_MAX_RUNNERS,
    maxSpectators: options.maxSpectators ?? RESTORED_MARATHON_DEFAULT_MAX_SPECTATORS,
    mapVersion: options.mapVersion || DEFAULT_MAP_VERSION,
    phase: "lobby",
    serverTimeMs
  });
  return Object.freeze({
    adapterVersion: RESTORED_MARATHON_ROOM_ADAPTER_VERSION,
    adapterType: "dev_mock",
    provider: DEV_PROVIDER,
    devOnly: true,
    reason: "dev_query_enabled",
    online: createRestoredOnlineAdapterSnapshot({
      adapterType: "dev_mock",
      provider: DEV_PROVIDER,
      canConnect: true,
      canOpenLobby: true,
      state: {
        status: "connected",
        provider: DEV_PROVIDER,
        clientId: options.clientId || "client:singularity-dev",
        serverTimeMs,
        lobbyEnabled: true
      }
    }),
    channels: createRestoredMarathonChannelSet({ roomId: room.roomId }),
    rooms: Object.freeze([room])
  });
}

export function createMarathonRoomAdapterForMode(options = {}) {
  if (options.serverTransport) return createServerBackedMarathonRoomAdapter({ transport: options.serverTransport, rooms: options.serverRooms });
  return options.devOnline
    ? createDevConnectedMarathonRoomAdapter(options)
    : createUnavailableMarathonRoomAdapter(options.reason);
}

export function canOpenConnectedMarathonLobby(adapter) {
  return Boolean(
    adapter
      && adapter.adapterVersion === RESTORED_MARATHON_ROOM_ADAPTER_VERSION
      && (adapter.adapterType === "dev_mock" || adapter.adapterType === "server_transport")
      && canUseRestoredOnlineLobby(adapter.online)
      && adapter.rooms?.length
  );
}

export function getConnectedMarathonRoomSummaries(adapter) {
  if (!canOpenConnectedMarathonLobby(adapter)) return Object.freeze([]);
  return Object.freeze(adapter.rooms.map((roomInput) => {
    const room = createRestoredMarathonRoom(roomInput);
    return Object.freeze({
      roomId: room.roomId,
      displayName: room.displayName,
      phase: room.phase,
      authority: room.authority,
      players: countRestoredMarathonRunners(room.participants),
      maxPlayers: room.maxRunners,
      spectators: countRestoredMarathonSpectators(room.participants),
      maxSpectators: room.maxSpectators,
      mapVersion: room.mapVersion,
      protocolVersion: room.protocolVersion
    });
  }));
}

export function joinConnectedMarathonRoom(adapter, request = {}) {
  if (!canOpenConnectedMarathonLobby(adapter)) return joinFailure("connected_lobby_not_available");
  const room = createRestoredMarathonRoom(adapter.rooms.find((item) => item.roomId === request.roomId) || adapter.rooms[0]);
  const participantType = request.participantType === "spectator" ? "spectator" : "player";
  const joinCheck = canJoinRestoredMarathonRoom(room, participantType);
  if (!joinCheck.ok) return joinFailure(joinCheck.errors.join(";") || "join_blocked");
  if (request.mapVersion && request.mapVersion !== room.mapVersion) return joinFailure("map_version_mismatch");
  if (request.protocolVersion && request.protocolVersion !== RESTORED_MARATHON_CONTRACT_VERSION) return joinFailure("protocol_version_mismatch");
  if (request.venueSchemaVersion && request.venueSchemaVersion !== DEFAULT_VENUE_SCHEMA_VERSION) return joinFailure("venue_schema_mismatch");

  const participantId = request.participantId || "runner:you";
  const nickname = request.nickname || "YOU";
  const sequence = Math.max(1, Number(request.sequence || 1));
  const serverTimeMs = Math.max(adapter.online.state.serverTimeMs, Number(request.serverTimeMs || 0));
  const joinRequest = createRestoredMarathonOnlinePacket("join_request", {
    roomId: room.roomId,
    participantId,
    sequence,
    serverTimeMs,
    nickname,
    participantType,
    skinPreset: request.skinPreset || "",
    mapVersion: room.mapVersion,
    venueSchemaVersion: DEFAULT_VENUE_SCHEMA_VERSION,
    protocolVersion: RESTORED_MARATHON_CONTRACT_VERSION
  });
  const joinedRoom = appendJoinedParticipant(room, { participantId, nickname, participantType });
  const joinResult = createRestoredMarathonOnlinePacket("join_result", {
    roomId: joinedRoom.roomId,
    participantId,
    sequence,
    serverTimeMs,
    ok: true,
    playerId: participantId,
    participantType,
    phase: joinedRoom.phase,
    mapId: joinedRoom.course.mapId,
    spawnId: "baegeum-marathon-stadium-spawn",
    mapVersion: joinedRoom.mapVersion,
    venueSchemaVersion: DEFAULT_VENUE_SCHEMA_VERSION,
    protocolVersion: RESTORED_MARATHON_CONTRACT_VERSION
  });
  return Object.freeze({
    ok: true,
    reason: "",
    joinRequest,
    joinResult,
    room: joinedRoom,
    session: Object.freeze(joinResult.payload)
  });
}

export function createConnectedMarathonStateSnapshot(roomInput, options = {}) {
  const room = createRestoredMarathonRoom(roomInput);
  const sequence = Math.max(1, Number(options.sequence || 1));
  const serverTimeMs = Math.max(room.serverTimeMs, Number(options.serverTimeMs || 0));
  const profile = createRestoredMarathonNetcodeProfile(options.netcodeProfile);
  return createRestoredMarathonOnlinePacket("state_snapshot", {
    roomId: room.roomId,
    participantId: options.participantId || "",
    sequence,
    serverTimeMs,
    snapshotId: `snapshot:${room.roomId}:${sequence}`,
    serverOwned: true,
    serverTickHz: profile.serverTickHz,
    snapshotHz: profile.snapshotHz,
    phase: room.phase,
    authority: room.authority,
    pingSample: createRestoredMarathonPingSample(options.pingTiming || {
      clientSentAtMs: Math.max(0, serverTimeMs - 76),
      serverReceivedAtMs: Math.max(0, serverTimeMs - 40),
      serverSentAtMs: Math.max(0, serverTimeMs - 38),
      clientReceivedAtMs: serverTimeMs
    }, options.previousPingSample, profile),
    reconciliation: createRestoredMarathonReconciliationHint(options.localRunner || {}, options.serverRunner || {}, { elapsedMs: options.elapsedMs ?? 50 }, profile),
    participants: room.participants
  });
}

export function validateRestoredMarathonRoomAdapter(adapter) {
  const errors = [];
  if (!adapter || typeof adapter !== "object") return Object.freeze({ ok: false, errors: Object.freeze(["adapter must be an object"]) });
  if (adapter.adapterVersion !== RESTORED_MARATHON_ROOM_ADAPTER_VERSION) errors.push("adapter version mismatch");
  const onlineValidation = validateRestoredOnlineAdapter(adapter.online);
  errors.push(...onlineValidation.errors);
  if (adapter.adapterType === "dev_mock" && adapter.devOnly !== true) errors.push("dev mock adapter must be marked devOnly");
  if (adapter.adapterType === "server_transport" && adapter.devOnly === true) errors.push("server transport adapter must not be devOnly");
  if (adapter.adapterType === "unavailable" && adapter.rooms?.length) errors.push("unavailable adapter must not expose rooms");
  if (canOpenConnectedMarathonLobby(adapter) && adapter.adapterType === "dev_mock" && adapter.provider !== DEV_PROVIDER) {
    errors.push("dev connected marathon lobby must use the dev provider");
  }
  for (const room of adapter.rooms || []) {
    if (room.authority !== RESTORED_MARATHON_AUTHORITY.SERVER_REQUIRED) errors.push("connected marathon rooms must require server authority");
    if (room.maxRunners > RESTORED_MARATHON_MAX_RUNNERS) errors.push("room max runners exceeds marathon cap");
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

export function validateRestoredMarathonRoomAdapterContract() {
  const unavailable = createUnavailableMarathonRoomAdapter();
  const connected = createDevConnectedMarathonRoomAdapter();
  const join = joinConnectedMarathonRoom(connected, { participantId: "runner:test", sequence: 1 });
  const snapshot = createConnectedMarathonStateSnapshot(join.room, { participantId: "runner:test", sequence: 2 });
  const summary = getConnectedMarathonRoomSummaries(connected)[0];
  const racingAdapter = Object.freeze({
    ...connected,
    rooms: Object.freeze([createRestoredMarathonRoom({ ...connected.rooms[0], phase: "racing" })])
  });
  const spectatorJoin = joinConnectedMarathonRoom(racingAdapter, { participantId: "spectator:test", participantType: "spectator", sequence: 3 });
  const lateRunnerJoin = joinConnectedMarathonRoom(racingAdapter, { participantId: "runner:late", participantType: "player", sequence: 4 });
  const validations = [
    validateRestoredMarathonRoomAdapter(unavailable),
    validateRestoredMarathonRoomAdapter(connected),
    validateRestoredMarathonOnlinePacket(join.joinRequest),
    validateRestoredMarathonOnlinePacket(join.joinResult),
    validateRestoredMarathonOnlinePacket(snapshot)
  ];
  const errors = validations.flatMap((validation) => validation.errors);
  const channelValidation = validateRestoredMarathonChannelContract();
  errors.push(...channelValidation.errors);
  if (canOpenConnectedMarathonLobby(unavailable)) errors.push("unavailable adapter opened a lobby");
  if (!canOpenConnectedMarathonLobby(connected)) errors.push("dev connected adapter did not open a lobby");
  if (!join.ok) errors.push("dev join did not return join_result ok");
  if (summary?.maxSpectators !== RESTORED_MARATHON_DEFAULT_MAX_SPECTATORS) errors.push("room summary should expose spectator capacity");
  if (!spectatorJoin.ok) errors.push("spectator should be allowed to join a racing room");
  if (lateRunnerJoin.ok) errors.push("late runner should not be allowed to join a racing room");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

function appendJoinedParticipant(room, request) {
  const type = request.participantType === "spectator" ? "spectator" : "player";
  const participant = createRestoredMarathonParticipant({
    participantId: request.participantId,
    displayName: request.nickname,
    type,
    lane: type === "player" ? countRestoredMarathonRunners(room.participants) + 1 : 1
  });
  return createRestoredMarathonRoom({
    ...room,
    authority: RESTORED_MARATHON_AUTHORITY.SERVER_REQUIRED,
    participants: Object.freeze([...room.participants, participant])
  });
}

function joinFailure(reason) {
  return Object.freeze({ ok: false, reason, joinRequest: null, joinResult: null, room: null, session: null });
}
