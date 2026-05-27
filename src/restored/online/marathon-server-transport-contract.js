export const RESTORED_MARATHON_SERVER_TRANSPORT_VERSION = "restored-marathon-server-transport-001";

export const RESTORED_MARATHON_SERVER_TRANSPORT_STATUSES = Object.freeze(["unavailable", "connecting", "connected", "disconnected_grace", "expired"]);
export const RESTORED_MARATHON_SERVER_TRANSPORT_PROVIDERS = Object.freeze(["none", "websocket", "firebase", "dev_mock"]);
export const RESTORED_MARATHON_SERVER_AUTH_MODES = Object.freeze(["none", "session", "firebase-auth", "custom-token"]);
export const RESTORED_MARATHON_SERVER_PACKET_TYPES = Object.freeze(["hello", "hello_result", "join_request", "join_result", "chat_send", "chat_delivered", "chat_history", "input_update", "skill_use", "attack_action", "checkpoint_reward", "respawn_notice", "state_snapshot", "race_finalized", "disconnect_notice"]);

const DEFAULT_CAPABILITIES = Object.freeze({ rooms: false, chat: false, input: false, snapshots: false, admin: false });

const FORBIDDEN_CONFIG_KEY = /(api[-_]?key|secret|password|credential|private[-_]?key|token)$/i;

export function createUnavailableRestoredMarathonServerTransport(reason = "server_transport_not_configured") {
  return createRestoredMarathonServerTransportSnapshot({
    provider: "none",
    status: "unavailable",
    lastError: reason,
    capabilities: DEFAULT_CAPABILITIES
  });
}

export function createRestoredMarathonServerTransportConfig(options = {}) {
  const provider = normalizeProvider(options.provider);
  return Object.freeze({
    version: RESTORED_MARATHON_SERVER_TRANSPORT_VERSION,
    provider,
    mode: options.mode || defaultModeForProvider(provider),
    endpointId: safeText(options.endpointId, 160),
    roomPath: safeText(options.roomPath || "rooms/singularity-race", 160),
    authMode: normalizeAuthMode(options.authMode),
    requiresAuth: options.requiresAuth ?? (provider === "websocket" || provider === "firebase"),
    reconnectGraceMs: Math.max(0, Number(options.reconnectGraceMs || 8000)),
    capabilities: Object.freeze({ ...DEFAULT_CAPABILITIES, ...(options.capabilities || {}) })
  });
}

export function validateRestoredMarathonServerTransportConfig(config = {}) {
  const errors = [];
  if (config.version !== RESTORED_MARATHON_SERVER_TRANSPORT_VERSION) errors.push("transport config version mismatch");
  if (!RESTORED_MARATHON_SERVER_TRANSPORT_PROVIDERS.includes(config.provider)) errors.push("unsupported transport provider");
  if ((config.provider === "websocket" || config.provider === "firebase") && !config.endpointId) errors.push("remote transport endpointId required");
  if (!RESTORED_MARATHON_SERVER_AUTH_MODES.includes(config.authMode)) errors.push("unsupported auth mode");
  for (const key of Object.keys(config)) {
    if (FORBIDDEN_CONFIG_KEY.test(key)) errors.push(`secret-like config key is not allowed: ${key}`);
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

export function createConfiguredRestoredMarathonServerTransport(configInput = {}, state = {}) {
  const config = createRestoredMarathonServerTransportConfig(configInput);
  const validation = validateRestoredMarathonServerTransportConfig(config);
  if (!validation.ok) return createUnavailableRestoredMarathonServerTransport(validation.errors.join(", "));
  return createRestoredMarathonServerTransportSnapshot({
    provider: config.provider,
    mode: config.mode,
    status: state.status || "connecting",
    endpointId: config.endpointId,
    clientId: state.clientId || "",
    roomId: state.roomId || "",
    serverTimeMs: state.serverTimeMs || 0,
    reconnectGraceMs: config.reconnectGraceMs,
    capabilities: config.capabilities,
    lastError: state.lastError || ""
  });
}

export function createRestoredMarathonServerTransportSnapshot(options = {}) {
  const status = normalizeStatus(options.status);
  const provider = normalizeProvider(options.provider);
  return Object.freeze({
    version: RESTORED_MARATHON_SERVER_TRANSPORT_VERSION,
    provider,
    mode: options.mode || "websocket_pending",
    status,
    endpointId: options.endpointId || "",
    clientId: options.clientId || "",
    roomId: options.roomId || "",
    serverTimeMs: Math.max(0, Number(options.serverTimeMs || 0)),
    reconnectGraceMs: Math.max(0, Number(options.reconnectGraceMs || 0)),
    lastError: options.lastError || "",
    capabilities: Object.freeze({ ...DEFAULT_CAPABILITIES, ...(options.capabilities || {}) })
  });
}

export function canUseRestoredMarathonServerTransport(snapshot) {
  return Boolean(
    snapshot
      && snapshot.version === RESTORED_MARATHON_SERVER_TRANSPORT_VERSION
      && snapshot.status === "connected"
      && snapshot.provider !== "none"
      && snapshot.endpointId
      && snapshot.clientId
  );
}

export function createRestoredMarathonTransportEnvelope(type, payload = {}, options = {}) {
  return Object.freeze({
    transportVersion: RESTORED_MARATHON_SERVER_TRANSPORT_VERSION,
    type: RESTORED_MARATHON_SERVER_PACKET_TYPES.includes(type) ? type : "hello",
    clientId: options.clientId || payload.clientId || "",
    roomId: options.roomId || payload.roomId || "",
    sequence: Math.max(1, Number(options.sequence || payload.sequence || 1)),
    serverTimeMs: Math.max(0, Number(options.serverTimeMs || payload.serverTimeMs || 0)),
    payload: Object.freeze({ ...payload })
  });
}

export function createRestoredMarathonChatSendEnvelope(message = {}, options = {}) {
  return createRestoredMarathonTransportEnvelope("chat_send", {
    messageId: message.id || "",
    channelId: message.channelId || "",
    senderId: message.senderId || "",
    senderType: message.senderType || "player",
    text: String(message.text || "").slice(0, 240)
  }, options);
}

export function createRestoredMarathonInputEnvelope(input = {}, options = {}) {
  return createRestoredMarathonTransportEnvelope("input_update", {
    participantId: input.participantId || "",
    pace: input.pace || "steady",
    mode: input.mode || "",
    direction: normalizeDirection(input.direction),
    raceTimeMs: Math.max(0, Number(input.raceTimeMs || 0))
  }, options);
}

export function createRestoredMarathonSkillEnvelope(skillUse = {}, options = {}) {
  return createRestoredMarathonTransportEnvelope("skill_use", {
    participantId: skillUse.participantId || "",
    characterId: skillUse.characterId || "",
    skillId: skillUse.skillId || "",
    targetId: skillUse.targetId || ""
  }, options);
}

export function createRestoredMarathonAttackEnvelope(attack = {}, options = {}) {
  return createRestoredMarathonTransportEnvelope("attack_action", {
    attackerId: attack.attackerId || "",
    aim: attack.aim || { x: 1, y: 0 },
    origin: attack.origin || { x: 0, y: 0 }
  }, options);
}

export function validateRestoredMarathonTransportEnvelope(envelope = {}) {
  const errors = [];
  if (envelope.transportVersion !== RESTORED_MARATHON_SERVER_TRANSPORT_VERSION) errors.push("transport version mismatch");
  if (!RESTORED_MARATHON_SERVER_PACKET_TYPES.includes(envelope.type)) errors.push("unknown packet type");
  if (!envelope.clientId) errors.push("clientId required");
  if (Number(envelope.sequence || 0) < 1) errors.push("positive sequence required");
  if (envelope.type !== "hello" && envelope.type !== "hello_result" && !envelope.roomId) errors.push("roomId required");
  if (envelope.type === "chat_send") validateChatSendPayload(envelope.payload, errors);
  if (envelope.type === "input_update") validateInputPayload(envelope.payload, errors);
  if (envelope.type === "skill_use" && !envelope.payload?.skillId) errors.push("skill_use skillId required");
  if (envelope.type === "attack_action" && !envelope.payload?.attackerId) errors.push("attack_action attackerId required");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

export function validateRestoredMarathonServerTransportContract() {
  const errors = [];
  const unavailable = createUnavailableRestoredMarathonServerTransport();
  if (canUseRestoredMarathonServerTransport(unavailable)) errors.push("unavailable transport must stay closed");
  const wsConfig = createRestoredMarathonServerTransportConfig({ provider: "websocket", endpointId: "ws:local-dev", authMode: "session",
    capabilities: { rooms: true, chat: true, input: true, snapshots: true } });
  if (!validateRestoredMarathonServerTransportConfig(wsConfig).ok) errors.push("websocket config should validate");
  const secretConfig = validateRestoredMarathonServerTransportConfig({ ...wsConfig, apiKey: "do-not-store" });
  if (secretConfig.ok) errors.push("transport config must reject embedded secrets");
  const connected = createRestoredMarathonServerTransportSnapshot({ provider: "websocket", status: "connected", endpointId: "ws:local-dev",
    clientId: "client:test", roomId: "room:singularity-race:dev-001", capabilities: { rooms: true, chat: true, input: true, snapshots: true } });
  if (!canUseRestoredMarathonServerTransport(connected)) errors.push("connected transport should be usable");
  const chatEnvelope = createRestoredMarathonChatSendEnvelope({ id: "message:1", channelId: "lobby:singularity-race:public",
    senderId: "player:test", text: "hello" }, { clientId: connected.clientId, roomId: connected.roomId, sequence: 2 });
  if (!validateRestoredMarathonTransportEnvelope(chatEnvelope).ok) errors.push("chat envelope should validate");
  const inputEnvelope = createRestoredMarathonInputEnvelope({ participantId: "runner:test", pace: "push", raceTimeMs: 1000 },
    { clientId: connected.clientId, roomId: connected.roomId, sequence: 3 });
  if (!validateRestoredMarathonTransportEnvelope(inputEnvelope).ok) errors.push("input envelope should validate");
  const skillEnvelope = createRestoredMarathonSkillEnvelope({ participantId: "runner:test", characterId: "runner:dororong", skillId: "skill:steady-boost" },
    { clientId: connected.clientId, roomId: connected.roomId, sequence: 4 });
  if (!validateRestoredMarathonTransportEnvelope(skillEnvelope).ok) errors.push("skill envelope should validate");
  const badChat = validateRestoredMarathonTransportEnvelope({ ...chatEnvelope, payload: { text: "missing channel" } });
  if (badChat.ok) errors.push("chat_send must require channel and message id");
  const historyEnvelope = createRestoredMarathonTransportEnvelope("chat_history", { serverOwned: true, messages: [] },
    { clientId: "server:test", roomId: connected.roomId, sequence: 6 });
  if (!validateRestoredMarathonTransportEnvelope(historyEnvelope).ok) errors.push("server chat history envelope should validate");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

function validateChatSendPayload(payload = {}, errors) {
  if (!payload.messageId) errors.push("chat messageId required");
  if (!payload.channelId) errors.push("chat channelId required");
  if (!payload.text) errors.push("chat text required");
}

function validateInputPayload(payload = {}, errors) {
  if (!payload.participantId) errors.push("input participantId required");
  if (!["recover", "steady", "push", "sprint"].includes(payload.pace)) errors.push("input pace invalid");
  if (Math.abs(Number(payload.direction?.x || 0)) > 1 || Math.abs(Number(payload.direction?.y || 0)) > 1) errors.push("input direction invalid");
}

function normalizeStatus(status) {
  return RESTORED_MARATHON_SERVER_TRANSPORT_STATUSES.includes(status) ? status : "unavailable";
}

function normalizeProvider(provider) {
  return RESTORED_MARATHON_SERVER_TRANSPORT_PROVIDERS.includes(provider) ? provider : "none";
}

function normalizeAuthMode(mode) {
  return RESTORED_MARATHON_SERVER_AUTH_MODES.includes(mode) ? mode : "none";
}

function defaultModeForProvider(provider) {
  if (provider === "firebase") return "firebase_pending";
  if (provider === "websocket") return "websocket_pending";
  if (provider === "dev_mock") return "dev_server_mock";
  return "unavailable";
}

function safeText(value, maxLength) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function normalizeDirection(direction = {}) {
  return Object.freeze({
    x: clampDirection(direction.x),
    y: clampDirection(direction.y)
  });
}

function clampDirection(value) {
  const number = Number(value || 0);
  return Math.max(-1, Math.min(1, Number.isFinite(number) ? number : 0));
}
