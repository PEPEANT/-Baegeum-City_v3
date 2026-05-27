import {
  RESTORED_MARATHON_CHAT_STORAGE_KEY,
  appendLocalRestoredMarathonMessage,
  createInitialRestoredMarathonChannelMessages,
  createRestoredMarathonChannelSet,
  findRestoredMarathonChannel
} from "./marathon-channel-adapter.js";

export const RESTORED_MARATHON_DEV_CHAT_TRANSPORT_VERSION = "restored-marathon-dev-chat-transport-001";
export const RESTORED_MARATHON_CHAT_BROADCAST_NAME = "singularity-race:chat-relay:v1";

export function createRestoredMarathonDevChatTransport(options = {}) {
  const context = createTransportContext(options);

  return Object.freeze({
    version: RESTORED_MARATHON_DEV_CHAT_TRANSPORT_VERSION,
    mode: "dev_local_relay",
    clientId: context.clientId,
    role: context.role,
    storageKey: context.storageKey,
    broadcastName: context.broadcastName,
    loadMessages: (fallback) => loadTransportMessages(context, fallback),
    seedMessages: (fallback) => seedTransportMessages(context, fallback),
    submitMessage: (messages, input) => submitTransportMessage(context, messages, input),
    pushSystemMessage: (messages, input) => pushTransportSystemMessage(context, messages, input),
    saveMessages: (messages, meta) => saveTransportMessages(context, messages, meta),
    subscribe: (onMessages) => subscribeTransportMessages(context, onMessages)
  });
}

function createTransportContext(options) {
  const channels = options.channels?.length ? options.channels : createRestoredMarathonChannelSet();
  const role = options.role || "player";
  const broadcastName = options.broadcastName || RESTORED_MARATHON_CHAT_BROADCAST_NAME;
  return Object.freeze({
    channels,
    role,
    clientId: options.clientId || `client:${role}:local`,
    storage: options.storage || createMemoryStorage(),
    storageKey: options.storageKey || RESTORED_MARATHON_CHAT_STORAGE_KEY,
    messageLimit: Math.max(20, Number(options.messageLimit || 500)),
    clock: typeof options.clock === "function" ? options.clock : (() => 0),
    eventTarget: options.eventTarget || null,
    broadcastName,
    broadcast: openBroadcast(options.broadcastFactory, broadcastName)
  });
}

function loadTransportMessages(context, fallback = createInitialRestoredMarathonChannelMessages(context.channels)) {
  const parsed = readJsonArray(context.storage, context.storageKey);
  return parsed.length ? Object.freeze(parsed) : Object.freeze(fallback);
}

function seedTransportMessages(context, fallback = createInitialRestoredMarathonChannelMessages(context.channels)) {
  const loaded = readJsonArray(context.storage, context.storageKey);
  if (loaded.length) return Object.freeze(loaded);
  saveTransportMessages(context, fallback, { reason: "seed" });
  return Object.freeze(fallback);
}

function submitTransportMessage(context, messages = [], input = {}) {
  const result = appendLocalRestoredMarathonMessage(messages, context.channels, {
    createdAtMs: context.clock(),
    ...input
  }, context.role);
  if (!result.ok) return result;
  const saved = saveTransportMessages(context, result.messages, {
    channelId: input.channelId,
    lastMessageId: result.message.id,
    reason: "message"
  });
  return saved.ok ? result : Object.freeze({ ...result, ok: false, reason: saved.reason });
}

function pushTransportSystemMessage(context, messages = [], input = {}) {
  const channel = findRestoredMarathonChannel(context.channels, input.channelId);
  if (!channel) return Object.freeze({ ok: false, reason: "channel_not_found", messages: Object.freeze(messages) });
  const next = Object.freeze([...messages, createSystemMessage(context, messages, input)]);
  const saved = saveTransportMessages(context, next, { channelId: input.channelId, reason: "system" });
  return Object.freeze({ ok: saved.ok, reason: saved.ok ? "" : saved.reason, messages: next });
}

function createSystemMessage(context, messages, input) {
  return Object.freeze({
    id: input.id || `${input.channelId}:system:${messages.length + 1}`,
    channelId: input.channelId,
    senderId: "system",
    senderType: "system",
    displayName: "SYSTEM",
    text: String(input.text || "").slice(0, 240),
    sequence: messages.length + 1,
    createdAtMs: input.createdAtMs ?? context.clock(),
    moderationStatus: "approved"
  });
}

function saveTransportMessages(context, messages = [], meta = {}) {
  const next = Object.freeze(messages.slice(-context.messageLimit));
  const saved = writeJson(context.storage, context.storageKey, next);
  if (!saved.ok) return saved;
  publishTransportMessage(context, {
    type: "chat_messages_updated",
    channelId: meta.channelId || "",
    lastMessageId: meta.lastMessageId || "",
    messageCount: next.length,
    reason: meta.reason || "save"
  });
  return Object.freeze({ ok: true, reason: "", messages: next });
}

function subscribeTransportMessages(context, onMessages) {
  if (typeof onMessages !== "function") return () => {};
  const onStorage = (event) => {
    if (event?.key && event.key !== context.storageKey) return;
    onMessages(loadTransportMessages(context));
  };
  const onBroadcast = (event) => {
    if (!shouldAcceptBroadcast(context, event)) return;
    onMessages(loadTransportMessages(context));
  };
  context.eventTarget?.addEventListener?.("storage", onStorage);
  if (context.broadcast) context.broadcast.onmessage = onBroadcast;
  return () => closeTransportSubscription(context, onStorage);
}

function shouldAcceptBroadcast(context, event) {
  if (!event?.data || event.data.sourceClientId === context.clientId) return false;
  return event.data.type === "chat_messages_updated";
}

function closeTransportSubscription(context, onStorage) {
  context.eventTarget?.removeEventListener?.("storage", onStorage);
  if (context.broadcast) context.broadcast.onmessage = null;
  context.broadcast?.close?.();
}

function publishTransportMessage(context, payload) {
  context.broadcast?.postMessage?.({
    ...payload,
    sourceClientId: context.clientId,
    storageKey: context.storageKey,
    transportVersion: RESTORED_MARATHON_DEV_CHAT_TRANSPORT_VERSION
  });
}

export function validateRestoredMarathonDevChatTransportContract() {
  const errors = [];
  const channels = createRestoredMarathonChannelSet();
  const storage = createMemoryStorage();
  const broadcastFactory = createMemoryBroadcastFactory();
  const transport = createRestoredMarathonDevChatTransport({
    channels, role: "player", clientId: "client:player:test", storage, broadcastFactory, clock: () => 100
  });
  const adminTransport = createRestoredMarathonDevChatTransport({
    channels, role: "admin", clientId: "client:admin:test", storage, broadcastFactory, clock: () => 101
  });
  const spectatorTransport = createRestoredMarathonDevChatTransport({ channels, role: "spectator", clientId: "client:spectator:test", storage, broadcastFactory, clock: () => 102 });
  let relayedCount = 0;
  const unsubscribe = adminTransport.subscribe((messages) => {
    relayedCount = messages.length;
  });
  const seeded = transport.seedMessages();
  const lobby = channels.find((item) => item.type === "lobby");
  const admin = channels.find((item) => item.type === "admin");
  if (!seeded.every((item) => item.channelId)) errors.push("seed messages must be channelized");
  const sent = transport.submitMessage(seeded, { channelId: lobby.channelId, senderId: "player:test", senderType: "player", text: "hello" });
  if (!sent.ok) errors.push(`player lobby send should pass: ${sent.reason}`);
  const blocked = transport.submitMessage(sent.messages, { channelId: admin.channelId, senderId: "player:test", senderType: "player", text: "nope" });
  if (blocked.ok) errors.push("player admin send must be blocked");
  const room = channels.find((item) => item.type === "room");
  const spectatorSent = spectatorTransport.submitMessage(sent.messages, { channelId: room.channelId, senderId: "spectator:test", senderType: "spectator", text: "watching" });
  if (!spectatorSent.ok) errors.push(`spectator room send should pass: ${spectatorSent.reason}`);
  if (transport.loadMessages().length !== spectatorSent.messages.length) errors.push("transport must reload saved messages");
  unsubscribe();
  if (relayedCount !== spectatorSent.messages.length) errors.push("broadcast relay must notify another local client");
  let history = spectatorSent.messages;
  for (let index = 0; index < 510; index += 1) history = transport.submitMessage(history, { channelId: lobby.channelId, senderId: "player:test", senderType: "player", text: `m${index}` }).messages;
  if (transport.loadMessages().length !== 500) errors.push("dev chat history should retain the latest 500 messages");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

export function createMemoryStorage() {
  const state = new Map();
  return Object.freeze({
    getItem(key) {
      return state.has(key) ? state.get(key) : null;
    },
    setItem(key, value) {
      state.set(key, String(value));
    }
  });
}

function readJsonArray(storage, storageKey) {
  try {
    const parsed = JSON.parse(storage.getItem(storageKey) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeJson(storage, storageKey, value) {
  try {
    storage.setItem(storageKey, JSON.stringify(value));
    return Object.freeze({ ok: true, reason: "" });
  } catch {
    return Object.freeze({ ok: false, reason: "storage_unavailable" });
  }
}

function openBroadcast(factory, name) {
  if (typeof factory !== "function") return null;
  try {
    return factory(name);
  } catch {
    return null;
  }
}

function createMemoryBroadcastFactory() {
  const ports = new Map();
  return (name) => {
    const channelPorts = ports.get(name) || [];
    const port = {
      onmessage: null,
      postMessage(data) {
        for (const peer of channelPorts) {
          if (peer !== port) peer.onmessage?.({ data });
        }
      },
      close() {
        ports.set(name, channelPorts.filter((peer) => peer !== port));
      }
    };
    channelPorts.push(port);
    ports.set(name, channelPorts);
    return port;
  };
}
