import { RESTORED_MARATHON_AUTHORITY, RESTORED_MARATHON_CONTRACT_VERSION, RESTORED_MARATHON_DEFAULT_MAX_SPECTATORS, RESTORED_MARATHON_MAX_RUNNERS, canJoinRestoredMarathonRoom, countRestoredMarathonRunners, createRestoredMarathonParticipant, createRestoredMarathonRoom } from "../games/marathon-contract.js";
import { createRestoredMarathonChannelSet } from "./marathon-channel-adapter.js";
import { createRestoredMarathonNetcodeProfile, createRestoredMarathonPingSample, createRestoredMarathonReconciliationHint, shouldAcceptRestoredMarathonRelayPacket } from "./marathon-netcode-contract.js";
import { appendRestoredMarathonServerChatMessage, canRestoredMarathonServerSessionSendPacket, createRestoredMarathonServerChatHistory, createRestoredMarathonServerSession, replayRestoredMarathonServerChatHistory, resolveRestoredMarathonServerJoinRole } from "./marathon-server-session-contract.js";
import { applyRestoredMarathonServerInputEnvelope, createRestoredMarathonServerRunnerSnapshot, startRestoredMarathonServerRoom } from "./marathon-server-state-contract.js";
import { createConfiguredRestoredMarathonServerTransport, createRestoredMarathonTransportEnvelope, validateRestoredMarathonTransportEnvelope } from "./marathon-server-transport-contract.js";
import { createServerBackedMarathonRoomAdapter } from "./marathon-server-room-adapter.js";

export const RESTORED_MARATHON_WEBSOCKET_DEV_SERVER_VERSION = "restored-marathon-websocket-dev-server-mock-001";

const DEFAULT_ENDPOINT_ID = "ws://127.0.0.1:4173/dev/singularity-race";
const DEFAULT_ROOM_ID = "room:singularity-race:ws-dev-001";
const DEFAULT_MAP_VERSION = "baegeum-city-v2-map-001";
const DEFAULT_VENUE_SCHEMA_VERSION = "venue-schema-001";
const CLIENT_PACKET_TYPES = Object.freeze(["chat_send", "input_update", "skill_use", "attack_action"]);

export function createRestoredMarathonWebSocketDevServerMock(options = {}) {
  const context = createServerContext(options);
  return Object.freeze({
    version: RESTORED_MARATHON_WEBSOCKET_DEV_SERVER_VERSION,
    mode: "websocket_dev_server_mock",
    endpointId: context.endpointId,
    connectClient: (client) => connectClient(context, client),
    listRooms: () => listRooms(context),
    createRoomAdapter: (transport) => createRoomAdapter(context, transport),
    joinRoom: (transport, request) => joinRoom(context, transport, request),
    startRace: (transport, roomId, options) => startRace(context, transport, roomId, options),
    ingestClientEnvelope: (transport, envelope, meta) => ingestClientEnvelope(context, transport, envelope, meta),
    replayChatHistory: (transport, roomId, options) => replayChatHistory(context, transport, roomId, options),
    createPingSample: (timing, previous) => createPingSample(context, timing, previous),
    createStateSnapshot: (roomId, options) => createStateSnapshot(context, roomId, options),
    getPackets: (roomId) => getPackets(context, roomId)
  });
}

function createServerContext(options) {
  const roomId = options.roomId || DEFAULT_ROOM_ID;
  const room = createRestoredMarathonRoom({ roomId, displayName: options.displayName || "Singularity Race Local WS Dev Room", authority: RESTORED_MARATHON_AUTHORITY.SERVER_REQUIRED, maxRunners: RESTORED_MARATHON_MAX_RUNNERS, maxSpectators: options.maxSpectators ?? RESTORED_MARATHON_DEFAULT_MAX_SPECTATORS, course: options.course, mapVersion: options.mapVersion || DEFAULT_MAP_VERSION, phase: "lobby", serverTimeMs: Number(options.serverTimeMs || 0) });
  return {
    endpointId: options.endpointId || DEFAULT_ENDPOINT_ID,
    clock: typeof options.clock === "function" ? options.clock : (() => room.serverTimeMs),
    rooms: new Map([[roomId, room]]),
    clients: new Map(),
    sessions: new Map(),
    channelsByRoom: new Map([[roomId, createRestoredMarathonChannelSet({ roomId })]]),
    chatHistories: new Map([[roomId, createRestoredMarathonServerChatHistory({ roomId })]]),
    packetsByRoom: new Map([[roomId, []]]),
    netcodeProfile: createRestoredMarathonNetcodeProfile(options.netcodeProfile),
    lastPingSample: null,
    packetLimit: Math.max(20, Number(options.packetLimit || 120)),
    pressureWindowMs: Math.max(250, Number(options.pressureWindowMs || 1000))
  };
}

function connectClient(context, options = {}) {
  const clientId = safeId(options.clientId || `client:ws-dev:${context.clients.size + 1}`);
  const role = normalizeClientRole(options.role);
  const transport = createConfiguredRestoredMarathonServerTransport({ provider: "websocket", endpointId: context.endpointId, authMode: "session",
    requiresAuth: false, capabilities: { rooms: true, chat: true, input: true, snapshots: true, admin: false } },
  { status: "connected", clientId, serverTimeMs: context.clock() });
  const session = createRestoredMarathonServerSession({ clientId, role, displayName: options.displayName || role, joinedAtMs: context.clock() });
  context.clients.set(clientId, { clientId, participantId: "", roomId: "", participantType: role === "spectator" ? "spectator" : "player" });
  context.sessions.set(clientId, session);
  const helloResult = createRestoredMarathonTransportEnvelope("hello_result",
    { ok: true, targetClientId: clientId, roomCount: context.rooms.size, protocolVersion: RESTORED_MARATHON_CONTRACT_VERSION },
    { clientId: "server:ws-dev", sequence: 1, serverTimeMs: context.clock() });
  return Object.freeze({ ok: true, transport, helloResult, rooms: listRooms(context) });
}

function listRooms(context) {
  return Object.freeze(Array.from(context.rooms.values()).map((room) => createRestoredMarathonRoom(room)));
}

function createRoomAdapter(context, transport) {
  if (!isKnownConnectedTransport(context, transport)) return createServerBackedMarathonRoomAdapter({ transport, rooms: [] });
  return createServerBackedMarathonRoomAdapter({ transport, rooms: listRooms(context) });
}

function joinRoom(context, transport = {}, request = {}) {
  const connected = ensureKnownTransport(context, transport);
  if (!connected.ok) return failure(connected.reason);
  const roomId = request.roomId || context.rooms.keys().next().value;
  const room = context.rooms.get(roomId);
  if (!room) return failure("room_not_found");
  if (request.mapVersion && request.mapVersion !== room.mapVersion) return failure("map_version_mismatch");
  if (request.venueSchemaVersion && request.venueSchemaVersion !== DEFAULT_VENUE_SCHEMA_VERSION) return failure("venue_schema_mismatch");
  const assigned = resolveRestoredMarathonServerJoinRole(room, request);
  const participantType = assigned.participantType;
  const joinCheck = canJoinRestoredMarathonRoom(room, participantType);
  if (!joinCheck.ok) return failure(joinCheck.errors.join(";") || "join_blocked");
  const participantId = participantIdForJoin(transport.clientId, request.participantId, participantType);
  const joinedRoom = appendParticipant(room, { participantId, nickname: request.nickname || participantId, participantType });
  context.rooms.set(roomId, joinedRoom);
  context.clients.set(transport.clientId, { clientId: transport.clientId, participantId, roomId, participantType });
  const session = createRestoredMarathonServerSession({ clientId: transport.clientId, participantId, participantType, role: assigned.role, roomId,
    displayName: request.nickname || assigned.role, joinedAtMs: context.clock() });
  context.sessions.set(transport.clientId, session);
  const sequence = Math.max(1, Number(request.sequence || 2));
  const joinRequest = createRestoredMarathonTransportEnvelope("join_request", {
    participantId, nickname: request.nickname || participantId, participantType: request.participantType || participantType,
    mapVersion: room.mapVersion, venueSchemaVersion: DEFAULT_VENUE_SCHEMA_VERSION,
    protocolVersion: RESTORED_MARATHON_CONTRACT_VERSION
  }, { clientId: transport.clientId, roomId, sequence, serverTimeMs: context.clock() });
  const joinResult = createRestoredMarathonTransportEnvelope("join_result", {
    ok: true, playerId: participantId, participantType, phase: joinedRoom.phase,
    serverAssignedRole: assigned.role, convertedToSpectator: assigned.converted, conversionReason: assigned.reason,
    chatReplay: replayChatHistoryForSession(context, roomId, session, { limit: 20 }).messages,
    mapId: joinedRoom.course.mapId, spawnId: "baegeum-marathon-stadium-spawn",
    mapVersion: joinedRoom.mapVersion, venueSchemaVersion: DEFAULT_VENUE_SCHEMA_VERSION,
    protocolVersion: RESTORED_MARATHON_CONTRACT_VERSION
  }, { clientId: "server:ws-dev", roomId, sequence: sequence + 1, serverTimeMs: context.clock() });
  savePackets(context, roomId, [joinRequest, joinResult]);
  return Object.freeze({ ok: true, reason: "", room: joinedRoom, joinRequest, joinResult });
}

function startRace(context, transport = {}, roomId = DEFAULT_ROOM_ID, options = {}) {
  const connected = ensureKnownTransport(context, transport);
  if (!connected.ok) return failure(connected.reason);
  const room = context.rooms.get(roomId);
  if (!room) return failure("room_not_found");
  const startedRoom = startRestoredMarathonServerRoom(room, { serverTimeMs: options.serverTimeMs ?? context.clock() });
  context.rooms.set(roomId, startedRoom);
  return Object.freeze({ ok: true, reason: "", room: startedRoom, packets: getPackets(context, roomId) });
}

function ingestClientEnvelope(context, transport = {}, envelope = {}, meta = {}) {
  const connected = ensureKnownTransport(context, transport);
  if (!connected.ok) return failure(connected.reason);
  const validation = validateRestoredMarathonTransportEnvelope(envelope);
  if (!validation.ok) return failure(validation.errors.join(", "));
  if (envelope.clientId !== transport.clientId) return failure("client_mismatch");
  if (!CLIENT_PACKET_TYPES.includes(envelope.type)) return failure("server_authority_required");
  const session = context.sessions.get(transport.clientId);
  if (!canRestoredMarathonServerSessionSendPacket(session, envelope.type)) return failure("session_permission_denied");
  if (!context.rooms.has(envelope.roomId)) return failure("room_not_found");
  const packets = getPackets(context, envelope.roomId);
  const receivedAtMs = Number(meta.receivedAtMs ?? context.clock());
  const guard = shouldAcceptRestoredMarathonRelayPacket(packets, envelope, {
    profile: context.netcodeProfile,
    nowMs: receivedAtMs,
    windowMs: context.pressureWindowMs
  });
  if (!guard.ok) return Object.freeze({ ...failure(guard.reason), pressure: guard.pressure });
  const accepted = Object.freeze({ ...envelope, receivedAtMs, direction: "client_to_server" });
  const movement = envelope.type === "input_update"
    ? applyRestoredMarathonServerInputEnvelope(context.rooms.get(envelope.roomId), accepted, { elapsedMs: meta.elapsedMs, receivedAtMs })
    : null;
  if (movement && !movement.ok) return Object.freeze({ ...failure(movement.reason), pressure: guard.pressure });
  if (movement?.ok) context.rooms.set(envelope.roomId, movement.room);
  const chat = envelope.type === "chat_send" ? appendServerChat(context, envelope, session, receivedAtMs) : null;
  if (chat && !chat.ok) return failure(chat.reason);
  const serverEnvelope = chat?.serverEnvelope || null;
  const nextPackets = savePackets(context, envelope.roomId, serverEnvelope ? [accepted, serverEnvelope] : [accepted]);
  return Object.freeze({ ok: true, reason: "", room: movement?.room || context.rooms.get(envelope.roomId), packets: nextPackets, pressure: guard.pressure, serverEnvelope });
}

function replayChatHistory(context, transport = {}, roomId = DEFAULT_ROOM_ID, options = {}) {
  const connected = ensureKnownTransport(context, transport);
  if (!connected.ok) return failure(connected.reason);
  return replayChatHistoryForSession(context, roomId, context.sessions.get(transport.clientId), options);
}

function createStateSnapshot(context, roomId = DEFAULT_ROOM_ID, options = {}) {
  const room = context.rooms.get(roomId);
  if (!room) return failure("room_not_found");
  const sequence = Math.max(1, Number(options.sequence || 1));
  const serverTimeMs = context.clock();
  const pingSample = createPingSample(context, options.pingTiming || {
    clientSentAtMs: Math.max(0, serverTimeMs - 76),
    serverReceivedAtMs: Math.max(0, serverTimeMs - 40),
    serverSentAtMs: Math.max(0, serverTimeMs - 38),
    clientReceivedAtMs: serverTimeMs
  }, options.previousPingSample);
  const snapshot = createRestoredMarathonTransportEnvelope("state_snapshot", {
    snapshotId: `snapshot:${roomId}:${sequence}`,
    serverOwned: true,
    serverTickHz: context.netcodeProfile.serverTickHz,
    snapshotHz: context.netcodeProfile.snapshotHz,
    movementAuthority: "server",
    phase: room.phase,
    authority: room.authority,
    pingSample,
    reconciliation: createRestoredMarathonReconciliationHint(options.localRunner || {}, options.serverRunner || {}, { elapsedMs: options.elapsedMs ?? 50 }, context.netcodeProfile),
    participants: room.participants.map((participant) => createRestoredMarathonServerRunnerSnapshot(participant, room))
  }, { clientId: "server:ws-dev", roomId, sequence, serverTimeMs });
  return Object.freeze({ ok: true, reason: "", snapshot, packets: savePackets(context, roomId, [snapshot]) });
}

function appendParticipant(room, request) {
  if (room.participants.some((participant) => participant.participantId === request.participantId)) return room;
  const type = request.participantType === "spectator" ? "spectator" : "player";
  const participant = createRestoredMarathonParticipant({ participantId: request.participantId, displayName: request.nickname, type,
    lane: type === "player" ? countRestoredMarathonRunners(room.participants) + 1 : 1 });
  return createRestoredMarathonRoom({ ...room, authority: RESTORED_MARATHON_AUTHORITY.SERVER_REQUIRED, participants: Object.freeze([...room.participants, participant]) });
}

function appendServerChat(context, envelope, session, receivedAtMs) {
  const channels = channelsForRoom(context, envelope.roomId);
  const history = context.chatHistories.get(envelope.roomId) || createRestoredMarathonServerChatHistory({ roomId: envelope.roomId });
  const appended = appendRestoredMarathonServerChatMessage(history, channels, session, { ...envelope.payload, createdAtMs: receivedAtMs });
  if (!appended.ok) return appended;
  context.chatHistories.set(envelope.roomId, appended.history);
  return Object.freeze({ ok: true, reason: "", serverEnvelope: createRestoredMarathonTransportEnvelope("chat_delivered",
    { ...appended.message, delivered: true, serverOwned: true },
    { clientId: "server:ws-dev", roomId: envelope.roomId, sequence: envelope.sequence + 1, serverTimeMs: context.clock() }) });
}

function replayChatHistoryForSession(context, roomId, session, options = {}) {
  return replayRestoredMarathonServerChatHistory(context.chatHistories.get(roomId), channelsForRoom(context, roomId), session, options);
}

function channelsForRoom(context, roomId) {
  if (!context.channelsByRoom.has(roomId)) context.channelsByRoom.set(roomId, createRestoredMarathonChannelSet({ roomId }));
  return context.channelsByRoom.get(roomId);
}

function createPingSample(context, timing = {}, previous) { const sample = createRestoredMarathonPingSample(timing, previous ?? context.lastPingSample, context.netcodeProfile); context.lastPingSample = sample; return sample; }

function savePackets(context, roomId, packets) {
  const existing = context.packetsByRoom.get(roomId) || [];
  const next = Object.freeze([...existing, ...packets].slice(-context.packetLimit));
  context.packetsByRoom.set(roomId, next);
  return next;
}

function getPackets(context, roomId = DEFAULT_ROOM_ID) { return Object.freeze([...(context.packetsByRoom.get(roomId) || [])]); }

function ensureKnownTransport(context, transport) { return isKnownConnectedTransport(context, transport) ? Object.freeze({ ok: true, reason: "" }) : Object.freeze({ ok: false, reason: "transport_not_connected" }); }

function isKnownConnectedTransport(context, transport = {}) { return transport.provider === "websocket" && transport.status === "connected" && transport.endpointId === context.endpointId && context.clients.has(transport.clientId); }

function failure(reason) { return Object.freeze({ ok: false, reason, room: null, packets: Object.freeze([]) }); }

function safeId(value) { return String(value || "").replace(/[^a-z0-9:_-]/gi, "_").slice(0, 80) || "client:ws-dev"; }

function participantIdForJoin(clientId, requestedId, participantType) {
  const prefix = participantType === "spectator" ? "spectator:" : "runner:";
  const candidate = safeId(requestedId || `${prefix}${clientId}`);
  return candidate.startsWith(prefix) ? candidate : `${prefix}${safeId(clientId)}`;
}

function normalizeClientRole(role) { return ["player", "spectator", "host", "admin"].includes(role) ? role : "player"; }
