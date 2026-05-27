import { createRestoredMarathonChannelSet } from "./marathon-channel-adapter.js";
import { applyRestoredMarathonProviderServerPacket, createRestoredMarathonProviderHello, createRestoredMarathonProviderJoinRequest, createRestoredMarathonProviderSession } from "./marathon-server-provider-adapter.js";
import { createRestoredMarathonServerTransportSnapshot, createRestoredMarathonTransportEnvelope } from "./marathon-server-transport-contract.js";
import { validateRestoredMarathonServerSessionContract } from "./marathon-server-session-contract.js";
import { validateRestoredMarathonServerStateContract } from "./marathon-server-state-contract.js";
import { createRestoredMarathonWebSocketDevServerMock } from "./marathon-websocket-dev-server-mock.js";

const DEFAULT_ROOM_ID = "room:singularity-race:ws-dev-001";
const DEFAULT_MAP_VERSION = "baegeum-city-v2-map-001";

export function validateRestoredMarathonWebSocketDevServerMockContract() {
  const errors = [];
  const server = createRestoredMarathonWebSocketDevServerMock({ clock: () => 1000 });
  const stateValidation = validateRestoredMarathonServerStateContract();
  const sessionValidation = validateRestoredMarathonServerSessionContract(createRestoredMarathonChannelSet({ roomId: DEFAULT_ROOM_ID }));
  if (!stateValidation.ok) errors.push(...stateValidation.errors);
  if (!sessionValidation.ok) errors.push(...sessionValidation.errors);
  const connected = server.connectClient({ clientId: "client:test" });
  if (!connected.ok || connected.transport.provider !== "websocket") errors.push("client should connect through websocket dev provider");
  if (!server.createRoomAdapter(connected.transport).online.canOpenLobby) errors.push("connected mock transport should create a lobby-capable adapter");
  const providerFlow = assertProviderFlow(server, connected, errors);
  const joined = providerFlow?.joined || server.joinRoom(connected.transport, { participantId: "runner:test", nickname: "Tester", sequence: 2, mapVersion: DEFAULT_MAP_VERSION });
  if (!joined.ok || joined.joinResult.type !== "join_result") errors.push("server mock join should return join_result");
  const started = server.startRace(connected.transport, joined.room.roomId, { serverTimeMs: 1000 });
  if (!started.ok || started.room.phase !== "racing") errors.push("server mock should start a server-owned race");
  assertSpectatorAndChat(server, joined, errors);
  assertMovementAndAuthority(server, connected.transport, joined.room.roomId, errors);
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

function assertProviderFlow(server, connected, errors) {
  let session = createRestoredMarathonProviderSession({ transport: connected.transport });
  const hello = createRestoredMarathonProviderHello(session, { requestedRole: "player" });
  if (!hello.ok) {
    errors.push(`provider hello should pass: ${hello.reason}`);
    return null;
  }
  const helloApplied = applyRestoredMarathonProviderServerPacket(hello.session, connected.helloResult);
  if (!helloApplied.ok) {
    errors.push(`provider hello_result should apply: ${helloApplied.reason}`);
    return null;
  }
  const joinRequest = createRestoredMarathonProviderJoinRequest(helloApplied.session, {
    roomId: DEFAULT_ROOM_ID,
    participantId: "runner:test",
    nickname: "Tester",
    mapVersion: DEFAULT_MAP_VERSION
  });
  if (!joinRequest.ok) {
    errors.push(`provider join_request should pass: ${joinRequest.reason}`);
    return null;
  }
  const joined = server.joinRoom(connected.transport, joinRequest.packet.payload);
  const joinedApplied = applyRestoredMarathonProviderServerPacket(joinRequest.session, joined.joinResult);
  if (!joined.ok || !joinedApplied.ok) {
    errors.push(`provider join_result should apply: ${joined.reason || joinedApplied.reason}`);
    return { joined };
  }
  const replay = server.replayChatHistory(connected.transport, joined.room.roomId, {});
  const historyPacket = createRestoredMarathonTransportEnvelope("chat_history", {
    serverOwned: true,
    messages: replay.messages || []
  }, { clientId: "server:ws-dev", roomId: joined.room.roomId, sequence: joined.joinResult.sequence + 1, serverTimeMs: 1000 });
  const historyApplied = applyRestoredMarathonProviderServerPacket(joinedApplied.session, historyPacket);
  const snapshot = server.createStateSnapshot(joined.room.roomId, { sequence: joined.joinResult.sequence + 2 });
  const snapshotApplied = applyRestoredMarathonProviderServerPacket(historyApplied.session, snapshot.snapshot);
  if (!historyApplied.ok || !snapshot.ok || !snapshotApplied.ok || snapshotApplied.session.step !== "snapshot_ready") {
    errors.push("provider flow should reach snapshot_ready with server replay and snapshot");
  }
  return { joined, session: snapshotApplied.session };
}

function assertSpectatorAndChat(server, joined, errors) {
  const spectatorConnected = server.connectClient({ clientId: "client:spectator", role: "spectator" });
  const spectatorJoin = server.joinRoom(spectatorConnected.transport, { participantId: "spectator:test", participantType: "spectator", nickname: "Spectator", sequence: 3, mapVersion: DEFAULT_MAP_VERSION });
  if (!spectatorJoin.ok) errors.push("server mock should allow spectator mid-race join");
  const lateRunnerJoin = server.joinRoom(server.connectClient({ clientId: "client:late-runner" }).transport, { participantId: "runner:late", participantType: "player", nickname: "Late Runner", sequence: 3, mapVersion: DEFAULT_MAP_VERSION });
  if (!lateRunnerJoin.ok || lateRunnerJoin.joinResult.payload.participantType !== "spectator" || !lateRunnerJoin.joinResult.payload.convertedToSpectator) errors.push("server mock should convert late runner join into spectator join");
  const spectatorInput = envelope("input_update", { participantId: "spectator:test", pace: "push", raceTimeMs: 1000, direction: { x: 1, y: 0 } },
    { clientId: "client:spectator", roomId: joined.room.roomId, sequence: 4 });
  if (server.ingestClientEnvelope(spectatorConnected.transport, spectatorInput, { receivedAtMs: 1000, elapsedMs: 1000 }).ok) errors.push("spectator input should be blocked by session permissions");
  const roomChannel = createRestoredMarathonChannelSet({ roomId: joined.room.roomId }).find((channel) => channel.type === "room");
  const hostTransport = server.connectClient({ clientId: "client:host", role: "host", displayName: "Host" }).transport;
  const hostChat = envelope("chat_send", { messageId: "message:host:1", channelId: roomChannel.channelId, senderId: "spoofed", senderType: "player", text: "host room notice" },
    { clientId: hostTransport.clientId, roomId: joined.room.roomId, sequence: 5 });
  const delivered = server.ingestClientEnvelope(hostTransport, hostChat, { receivedAtMs: 1000 });
  if (!delivered.ok || delivered.serverEnvelope.payload.senderId === "spoofed") errors.push("server chat should ignore spoofed sender metadata");
  const replay = server.replayChatHistory(server.connectClient({ clientId: "client:spectator-replay", role: "spectator" }).transport, joined.room.roomId, { channelId: roomChannel.channelId });
  if (!replay.ok || !replay.messages.some((message) => message.text === "host room notice")) errors.push("spectator should receive server-owned room chat replay");
}

function assertMovementAndAuthority(server, transport, roomId, errors) {
  const input = envelope("input_update", { participantId: "runner:test", pace: "push", raceTimeMs: 1000, direction: { x: 1, y: 0 } },
    { clientId: transport.clientId, roomId, sequence: 4 });
  const moved = server.ingestClientEnvelope(transport, input, { receivedAtMs: 1000, elapsedMs: 1000 });
  if (!moved.ok || moved.room.participants[0].progressMeters <= 0) errors.push("server mock should apply valid client input");
  const forbidden = envelope("race_finalized", { ok: true }, { clientId: transport.clientId, roomId, sequence: 5 });
  if (server.ingestClientEnvelope(transport, forbidden, { receivedAtMs: 1000 }).ok) errors.push("client must not send server-owned finalization");
  const snapshot = server.createStateSnapshot(roomId, { sequence: 6, serverRunner: { x: 72, y: 0, progress: 2 } });
  if (!snapshot.ok) errors.push("server mock should create authoritative snapshots");
  if (!snapshot.snapshot.payload.serverOwned || !snapshot.snapshot.payload.pingSample || !snapshot.snapshot.payload.reconciliation) errors.push("snapshot should include ping and reconciliation data");
  if (!server.createPingSample({ clientSentAtMs: 1000, serverReceivedAtMs: 1030, serverSentAtMs: 1032, clientReceivedAtMs: 1062 }).serverOwned) errors.push("server mock should expose ping samples");
  if (!createSpamCheck(server, transport, roomId)) errors.push("server mock should rate-limit action packet spam");
}

function createSpamCheck(server, transport, roomId) {
  for (let sequence = 10; sequence < 50; sequence += 1) {
    const spam = envelope("input_update", { participantId: "runner:test", pace: "push", raceTimeMs: sequence },
      { clientId: transport.clientId, roomId, sequence });
    const result = server.ingestClientEnvelope(transport, spam, { receivedAtMs: 1000 });
    if (!result.ok) return result.reason === "rate_limited";
  }
  return false;
}

function envelope(type, payload, options) {
  return createRestoredMarathonTransportEnvelope(type, payload, {
    serverTimeMs: 1000,
    ...options
  });
}

export function createDisconnectedRestoredMarathonDevServerSnapshot() {
  return createRestoredMarathonServerTransportSnapshot({ provider: "dev_mock", status: "expired", lastError: "validation_only" });
}
