import { WORLD_CHANNEL_ID } from "../data/runtime-contract.js";

const MAX_CHAT_LENGTH = 160;
const MAX_CHAT_HISTORY = 50;
const BUBBLE_LIFETIME = 5200;

export class WorldChat {
  constructor({ player, clockSnapshot, channel = WORLD_CHANNEL_ID } = {}) {
    this.player = player;
    this.clockSnapshot = clockSnapshot;
    this.channel = safeChannel(channel) || WORLD_CHANNEL_ID;
    this.messagesByChannel = new Map();
    this.bubbles = new Map();
    this.addSystemMessage("월드 채팅 준비됨", { broadcast: false });
  }

  get messages() {
    return this.history();
  }

  history(channel = this.channel) {
    return this.ensureChannel(channel);
  }

  setChannel(channel, options = {}) {
    const nextChannel = safeChannel(channel) || WORLD_CHANNEL_ID;
    if (nextChannel === this.channel) return;
    this.channel = nextChannel;
    this.ensureChannel(nextChannel);
    if (options.systemText) this.addSystemMessage(options.systemText, { broadcast: false });
    window.dispatchEvent(new CustomEvent("baegeum:chat-channel", {
      detail: { channel: this.channel, messages: this.messages }
    }));
  }

  submit(rawText) {
    const text = safeText(rawText);
    if (!text) return null;
    return this.addMessage({
      id: createId(),
      channel: this.channel,
      author: this.player?.id || "local-player",
      name: this.player?.name || "YOU",
      color: "#8fe0ff",
      text,
      at: Date.now(),
      worldTime: this.clockSnapshot?.()?.timeText || ""
    });
  }

  addSystemMessage(text, options = {}) {
    return this.addMessage({
      id: createId(),
      channel: this.channel,
      author: "system",
      name: "system",
      color: "#697184",
      text: safeText(text),
      at: Date.now(),
      worldTime: this.clockSnapshot?.()?.timeText || ""
    }, { bubble: false, ...options });
  }

  addMessage(message, options = {}) {
    const entry = normalizeMessage(message, this.channel);
    if (!entry.text) return null;
    const messages = this.ensureChannel(entry.channel);
    messages.push(entry);
    if (messages.length > MAX_CHAT_HISTORY) messages.splice(0, messages.length - MAX_CHAT_HISTORY);
    if (options.bubble !== false && entry.author !== "system") {
      this.bubbles.set(entry.author, { text: entry.text, expiresAt: Date.now() + BUBBLE_LIFETIME });
    }
    if (options.broadcast !== false) {
      window.dispatchEvent(new CustomEvent("baegeum:chat", { detail: entry }));
    }
    return entry;
  }

  ensureChannel(channel) {
    const safe = safeChannel(channel) || WORLD_CHANNEL_ID;
    if (!this.messagesByChannel.has(safe)) this.messagesByChannel.set(safe, []);
    return this.messagesByChannel.get(safe);
  }

  bubbleFor(entity) {
    const key = entity?.id || "";
    const bubble = this.bubbles.get(key);
    if (!bubble) return null;
    if (bubble.expiresAt < Date.now()) {
      this.bubbles.delete(key);
      return null;
    }
    return bubble;
  }
}

function normalizeMessage(message, fallbackChannel) {
  return {
    id: message.id || createId(),
    channel: message.channel || fallbackChannel,
    author: message.author || "system",
    name: message.name || "guest",
    color: message.color || "#8fe0ff",
    text: safeText(message.text),
    at: Number(message.at) || Date.now(),
    worldTime: message.worldTime || ""
  };
}

function safeText(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, MAX_CHAT_LENGTH);
}

function safeChannel(value) {
  return String(value || "").trim();
}

function createId() {
  return globalThis.crypto?.randomUUID?.() || `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
