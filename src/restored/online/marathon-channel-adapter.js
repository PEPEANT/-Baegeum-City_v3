export const RESTORED_MARATHON_CHANNEL_ADAPTER_VERSION = "restored-marathon-channel-adapter-001";

export const RESTORED_MARATHON_CHAT_STORAGE_KEY = "singularity-race:chat:v1";

export const RESTORED_MARATHON_CHANNEL_TYPES = Object.freeze([
  "lobby",
  "room",
  "spectator",
  "admin",
  "system"
]);

export const RESTORED_MARATHON_CHAT_ROLES = Object.freeze([
  "player",
  "spectator",
  "admin",
  "system"
]);

const DEFAULT_ROOM_ID = "room:singularity-race:dev-001";

export function createRestoredMarathonChannelSet(options = {}) {
  const roomId = options.roomId || DEFAULT_ROOM_ID;
  const slug = roomId.replace(/^room:/, "");
  return Object.freeze([
    channel("lobby:singularity-race:public", "lobby", "로비", "public", ["player", "spectator", "admin"]),
    channel(`room:${slug}`, "room", "레이스 룸", "participants", ["player", "spectator", "admin"]),
    channel(`spectator:${slug}`, "spectator", "관전자", "public", ["player", "spectator", "admin"]),
    channel(`admin:${slug}`, "admin", "관리자", "admin", ["admin"]),
    channel("system:singularity-race:notice", "system", "공지", "public", ["admin"])
  ]);
}

export function findRestoredMarathonChannel(channels, channelId) {
  return (channels || []).find((item) => item.channelId === channelId) || null;
}

export function filterVisibleRestoredMarathonChannels(channels, role = "player") {
  return Object.freeze((channels || []).filter((item) => canUseRestoredMarathonChannel(item, role, "read")));
}

export function canUseRestoredMarathonChannel(channelInput, role = "player", mode = "read") {
  const channel = normalizeChannel(channelInput);
  const normalizedRole = RESTORED_MARATHON_CHAT_ROLES.includes(role) ? role : "player";
  if (mode === "send") return channel.canSend.includes(normalizedRole);
  if (normalizedRole === "admin") return true;
  if (channel.visibility === "admin") return false;
  if (channel.visibility === "participants") return normalizedRole === "player" || normalizedRole === "spectator";
  return true;
}

export function createRestoredMarathonChatMessage(options = {}) {
  const senderType = RESTORED_MARATHON_CHAT_ROLES.includes(options.senderType) ? options.senderType : "player";
  const sequence = Math.max(1, Number(options.sequence || 1));
  const channelId = options.channelId || "lobby:singularity-race:public";
  return Object.freeze({
    id: options.id || `${channelId}:${senderType}:${sequence}`,
    channelId,
    senderId: options.senderId || senderType,
    senderType,
    displayName: options.displayName || labelForSender(senderType),
    text: String(options.text || "").slice(0, 240),
    sequence,
    createdAtMs: Math.max(0, Number(options.createdAtMs || sequence)),
    moderationStatus: options.moderationStatus || (senderType === "system" ? "approved" : "local")
  });
}

export function createInitialRestoredMarathonChannelMessages(channels = createRestoredMarathonChannelSet()) {
  const lobby = findByType(channels, "lobby");
  const spectator = findByType(channels, "spectator");
  const admin = findByType(channels, "admin");
  return Object.freeze([
    createRestoredMarathonChatMessage({
      channelId: lobby.channelId,
      senderType: "system",
      displayName: "SYSTEM",
      text: "Singularity Race lobby channel is ready.",
      sequence: 1
    }),
    createRestoredMarathonChatMessage({
      channelId: spectator.channelId,
      senderType: "system",
      displayName: "SYSTEM",
      text: "Spectator channel is ready for public viewing.",
      sequence: 2
    }),
    createRestoredMarathonChatMessage({
      channelId: admin.channelId,
      senderType: "system",
      displayName: "SYSTEM",
      text: "Admin channel is dev-only until real server auth exists.",
      sequence: 3
    })
  ]);
}

export function appendLocalRestoredMarathonMessage(messages = [], channels = [], input = {}, role = "player") {
  const channel = findRestoredMarathonChannel(channels, input.channelId);
  if (!channel) return Object.freeze({ ok: false, reason: "channel_not_found", messages: Object.freeze(messages) });
  if (!canUseRestoredMarathonChannel(channel, role, "send")) {
    return Object.freeze({ ok: false, reason: "send_not_allowed", messages: Object.freeze(messages) });
  }
  const message = createRestoredMarathonChatMessage({
    ...input,
    sequence: input.sequence || messages.length + 1
  });
  return Object.freeze({ ok: true, reason: "", message, messages: Object.freeze([...messages, message]) });
}

export function validateRestoredMarathonChannelContract() {
  const channels = createRestoredMarathonChannelSet();
  const errors = [];
  for (const item of channels) {
    if (!RESTORED_MARATHON_CHANNEL_TYPES.includes(item.type)) errors.push(`unknown channel type: ${item.type}`);
    if (!item.channelId.includes(":")) errors.push(`invalid channel id: ${item.channelId}`);
  }
  if (filterVisibleRestoredMarathonChannels(channels, "player").some((item) => item.type === "admin")) {
    errors.push("player must not see admin channel");
  }
  if (!filterVisibleRestoredMarathonChannels(channels, "admin").some((item) => item.type === "admin")) {
    errors.push("admin must see admin channel");
  }
  if (!filterVisibleRestoredMarathonChannels(channels, "spectator").some((item) => item.type === "room")) {
    errors.push("spectator must see shared race room chat");
  }
  const blocked = appendLocalRestoredMarathonMessage([], channels, { channelId: findByType(channels, "admin").channelId, text: "x" }, "player");
  if (blocked.ok) errors.push("player must not send admin messages");
  const spectatorRoom = appendLocalRestoredMarathonMessage([], channels, { channelId: findByType(channels, "room").channelId, senderType: "spectator", text: "watching" }, "spectator");
  if (!spectatorRoom.ok) errors.push("spectator must send shared race room messages");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

function channel(channelId, type, label, visibility, canSend) {
  return Object.freeze({ channelId, type, label, visibility, canSend: Object.freeze(canSend) });
}

function normalizeChannel(channelInput) {
  return channelInput && typeof channelInput === "object"
    ? channelInput
    : channel("", "lobby", "", "public", []);
}

function findByType(channels, type) {
  return (channels || []).find((item) => item.type === type) || channels[0];
}

function labelForSender(senderType) {
  if (senderType === "admin") return "ADMIN";
  if (senderType === "spectator") return "SPECTATOR";
  if (senderType === "system") return "SYSTEM";
  return "YOU";
}
