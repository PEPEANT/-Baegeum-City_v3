import {
  canUseRestoredMarathonChannel,
  createRestoredMarathonChatMessage,
  findRestoredMarathonChannel
} from "./marathon-channel-adapter.js";

export const RESTORED_MARATHON_SERVER_SESSION_VERSION = "restored-marathon-server-session-001";

export const RESTORED_MARATHON_SERVER_ROLES = Object.freeze(["player", "spectator", "host", "admin", "system"]);

const PACKET_PERMISSIONS = Object.freeze({
  player: Object.freeze(["join_request", "chat_send", "input_update", "skill_use", "attack_action", "disconnect_notice"]),
  spectator: Object.freeze(["join_request", "chat_send", "disconnect_notice"]),
  host: Object.freeze(["chat_send", "host_control", "disconnect_notice"]),
  admin: Object.freeze(["chat_send", "host_control", "admin_control", "disconnect_notice"]),
  system: Object.freeze(["chat_delivered", "state_snapshot", "race_finalized", "checkpoint_reward", "respawn_notice"])
});

export function createRestoredMarathonServerSession(options = {}) {
  const role = normalizeServerRole(options.role || options.participantType);
  const participantType = normalizeParticipantType(options.participantType || role);
  return Object.freeze({
    version: RESTORED_MARATHON_SERVER_SESSION_VERSION,
    sessionId: safeId(options.sessionId || `session:${options.clientId || role}`),
    clientId: safeId(options.clientId || ""),
    roomId: safeId(options.roomId || ""),
    participantId: safeId(options.participantId || ""),
    participantType,
    role,
    chatRole: role === "host" ? "admin" : role,
    displayName: safeText(options.displayName || labelForRole(role), 40),
    joinedAtMs: Math.max(0, Number(options.joinedAtMs || 0)),
    serverOwned: true,
    permissions: Object.freeze({
      canChat: role !== "system",
      canViewSnapshots: role !== "system",
      canMove: role === "player",
      canUseSkill: role === "player",
      canAttack: role === "player",
      canHostControl: role === "host" || role === "admin",
      canAdminControl: role === "admin"
    })
  });
}

export function resolveRestoredMarathonServerJoinRole(room = {}, request = {}) {
  const requestedRole = normalizeServerRole(request.role || request.participantType);
  if (requestedRole === "host" || requestedRole === "admin") {
    return Object.freeze({ role: requestedRole, participantType: "spectator", converted: false, reason: "authority_session" });
  }
  const requestedType = normalizeParticipantType(request.participantType || requestedRole);
  const phase = room.phase || "lobby";
  if (requestedType === "player" && phase !== "lobby") {
    return Object.freeze({ role: "spectator", participantType: "spectator", converted: true, reason: "late_join_spectator" });
  }
  return Object.freeze({ role: requestedType, participantType: requestedType, converted: false, reason: "" });
}

export function canRestoredMarathonServerSessionSendPacket(session = {}, packetType = "") {
  const role = normalizeServerRole(session.role);
  return (PACKET_PERMISSIONS[role] || []).includes(packetType);
}

export function createRestoredMarathonServerChatHistory(options = {}) {
  const messages = normalizeMessages(options.messages || []);
  const limit = Math.max(20, Number(options.limit || 500));
  const kept = messages.slice(-limit);
  return Object.freeze({
    version: RESTORED_MARATHON_SERVER_SESSION_VERSION,
    roomId: safeId(options.roomId || ""),
    serverOwned: true,
    limit,
    lastSequence: kept.reduce((max, message) => Math.max(max, Number(message.sequence || 0)), 0),
    messages: Object.freeze(kept)
  });
}

export function appendRestoredMarathonServerChatMessage(historyInput = {}, channels = [], sessionInput = {}, input = {}) {
  const history = createRestoredMarathonServerChatHistory(historyInput);
  const session = createRestoredMarathonServerSession(sessionInput);
  if (!canRestoredMarathonServerSessionSendPacket(session, "chat_send")) return failure("chat_not_allowed", history);
  const channel = findRestoredMarathonChannel(channels, input.channelId);
  if (!channel) return failure("channel_not_found", history);
  if (!canUseRestoredMarathonChannel(channel, session.chatRole, "send")) return failure("channel_send_not_allowed", history);
  const text = safeText(input.text, 240);
  if (!text) return failure("chat_text_required", history);
  const sequence = history.lastSequence + 1;
  const message = createRestoredMarathonChatMessage({
    id: input.messageId || `${channel.channelId}:${session.sessionId}:${sequence}`,
    channelId: channel.channelId,
    senderId: session.participantId || session.clientId || session.sessionId,
    senderType: session.chatRole,
    displayName: session.displayName,
    text,
    sequence,
    createdAtMs: input.createdAtMs ?? sequence,
    moderationStatus: "approved"
  });
  const next = createRestoredMarathonServerChatHistory({
    ...history,
    messages: [...history.messages, message],
    limit: history.limit
  });
  return Object.freeze({ ok: true, reason: "", history: next, message });
}

export function replayRestoredMarathonServerChatHistory(historyInput = {}, channels = [], sessionInput = {}, options = {}) {
  const history = createRestoredMarathonServerChatHistory(historyInput);
  const session = createRestoredMarathonServerSession(sessionInput);
  const afterSequence = Math.max(0, Number(options.afterSequence || 0));
  const limit = Math.max(1, Math.min(100, Number(options.limit || 50)));
  const visible = history.messages.filter((message) => {
    const channel = findRestoredMarathonChannel(channels, message.channelId);
    return channel
      && (!options.channelId || message.channelId === options.channelId)
      && Number(message.sequence || 0) > afterSequence
      && message.moderationStatus === "approved"
      && canUseRestoredMarathonChannel(channel, session.chatRole, "read");
  });
  const messages = visible.slice(-limit);
  return Object.freeze({
    ok: true,
    reason: "",
    serverOwned: true,
    roomId: history.roomId,
    afterSequence,
    lastSequence: history.lastSequence,
    hasMore: visible.length > messages.length,
    messages: Object.freeze(messages)
  });
}

export function validateRestoredMarathonServerSessionContract(channels = []) {
  const errors = [];
  const room = { phase: "racing" };
  const late = resolveRestoredMarathonServerJoinRole(room, { participantType: "player" });
  if (!late.converted || late.participantType !== "spectator") errors.push("late player join must become spectator");
  const spectator = createRestoredMarathonServerSession({ clientId: "client:spectator", participantId: "spectator:test", participantType: "spectator" });
  if (canRestoredMarathonServerSessionSendPacket(spectator, "input_update")) errors.push("spectator must not send input");
  if (!canRestoredMarathonServerSessionSendPacket(spectator, "chat_send")) errors.push("spectator must send chat");
  const host = createRestoredMarathonServerSession({ clientId: "client:host", role: "host", displayName: "Host" });
  if (!host.permissions.canHostControl || host.permissions.canAdminControl) errors.push("host permissions should be separated from admin");
  const roomChannel = channels.find((channel) => channel.type === "room") || channels[0];
  const adminChannel = channels.find((channel) => channel.type === "admin") || channels[0];
  const empty = createRestoredMarathonServerChatHistory({ roomId: "room:test" });
  const hostChat = appendRestoredMarathonServerChatMessage(empty, channels, host, { channelId: roomChannel?.channelId, text: "start soon" });
  if (!hostChat.ok || hostChat.message.senderType !== "admin") errors.push("host room chat should be delivered as trusted admin chat role");
  const spectatorReplay = replayRestoredMarathonServerChatHistory(hostChat.history, channels, spectator, { channelId: roomChannel?.channelId });
  if (!spectatorReplay.messages.some((message) => message.text === "start soon")) errors.push("spectator should replay host room chat");
  const blocked = appendRestoredMarathonServerChatMessage(hostChat.history, channels, spectator, { channelId: adminChannel?.channelId, text: "nope" });
  if (blocked.ok) errors.push("spectator must not send admin chat");
  const hidden = replayRestoredMarathonServerChatHistory(hostChat.history, channels, spectator, { channelId: adminChannel?.channelId });
  if (hidden.messages.length) errors.push("spectator must not replay admin channel");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

function normalizeServerRole(role) {
  return RESTORED_MARATHON_SERVER_ROLES.includes(role) ? role : "player";
}

function normalizeParticipantType(type) {
  return type === "spectator" ? "spectator" : "player";
}

function normalizeMessages(messages) {
  return Object.freeze([...messages].sort((a, b) => Number(a.sequence || 0) - Number(b.sequence || 0)));
}

function failure(reason, history) {
  return Object.freeze({ ok: false, reason, history, message: null });
}

function safeId(value) {
  return String(value || "").replace(/[^a-z0-9:_-]/gi, "_").slice(0, 120);
}

function safeText(value, maxLength) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function labelForRole(role) {
  if (role === "host") return "HOST";
  if (role === "admin") return "ADMIN";
  if (role === "spectator") return "SPECTATOR";
  return "PLAYER";
}
