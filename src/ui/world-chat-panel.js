import { getRuntimeGame } from "../systems/runtime-state-facade.js";

const game = getRuntimeGame();
const chat = game?.chat;
const elements = {
  toggle: document.getElementById("chatToggle"),
  panel: document.getElementById("worldChatPanel"),
  room: document.getElementById("worldChatRoom"),
  log: document.getElementById("chatLog"),
  form: document.getElementById("chatForm"),
  input: document.getElementById("chatInput")
};

if (chat && Object.values(elements).every(Boolean)) {
  elements.room.textContent = chat.channel;
  renderMessages(chat.messages);
  elements.toggle.addEventListener("click", () => setOpen(elements.panel.classList.contains("is-closed")));
  elements.input.addEventListener("keydown", handleInputKeydown);
  elements.form.addEventListener("submit", submitChat);
  window.addEventListener("keydown", handleGlobalKeydown);
  window.addEventListener("baegeum:chat", handleChatMessage);
  window.addEventListener("baegeum:chat-channel", handleChatChannel);
}

function handleInputKeydown(event) {
  event.stopPropagation();
  if (event.key === "Escape") setOpen(false);
}

function handleGlobalKeydown(event) {
  if (isTypingTarget(event.target) || isPhoneOpen()) return;
  if (event.code !== "KeyT" && event.code !== "Enter") return;
  event.preventDefault();
  setOpen(true);
}

function submitChat(event) {
  event.preventDefault();
  const message = chat.submit(elements.input.value);
  if (!message) return;
  elements.input.value = "";
}

function handleChatMessage(event) {
  if (event.detail?.channel !== chat.channel) return;
  appendMessage(event.detail, true);
}

function handleChatChannel(event) {
  elements.room.textContent = event.detail?.channel || chat.channel;
  renderMessages(event.detail?.messages || chat.messages);
}

function setOpen(open) {
  elements.panel.classList.toggle("is-closed", !open);
  elements.toggle.classList.toggle("active", open);
  elements.toggle.setAttribute("aria-expanded", open ? "true" : "false");
  if (open) window.setTimeout(() => elements.input.focus(), 0);
  else elements.input.blur();
}

function renderMessages(messages) {
  elements.log.replaceChildren();
  for (const message of messages) appendMessage(message, false);
  elements.log.scrollTop = elements.log.scrollHeight;
}

function appendMessage(message, shouldScroll) {
  const row = document.createElement("div");
  row.className = "world-chat-message";
  const name = document.createElement("div");
  name.className = "world-chat-name";
  name.textContent = message.name || "guest";
  name.style.color = message.color || "#8fe0ff";
  const text = document.createElement("div");
  text.className = "world-chat-text";
  text.textContent = message.text || "";
  row.append(name, text);
  elements.log.append(row);
  if (shouldScroll) elements.log.scrollTop = elements.log.scrollHeight;
}

function isTypingTarget(target) {
  const tag = target?.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable;
}

function isPhoneOpen() {
  return document.body.classList.contains("phone-focus-active") || document.body.classList.contains("phone-stage-active");
}
