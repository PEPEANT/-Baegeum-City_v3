import {
  createVenueMetadata,
  gamblingVenues,
  mergeVenueMetadata,
  readStoredVenueMetadata,
  venueGameTypes,
  writeStoredVenueMetadata
} from "../data/gambling-venues.js";

const state = {
  base: [],
  drafts: new Map(),
  current: 0,
  controls: {}
};

const channelInputIds = new Set([
  "bgVenueChannelInput",
  "bgTableChannelInput",
  "bgSpectatorChannelInput",
  "bgAdminChannelInput"
]);

window.addEventListener("load", init);

function init() {
  const buildings = (window.IronLine?.map01?.obstacles || []).filter((item) => item.kind === "building");
  if (!buildings.length) return;
  state.base = buildings.map((rect, index) => createVenueMetadata(gamblingVenues[index % gamblingVenues.length], rect, index));
  state.drafts = new Map(readStoredVenueMetadata().map((item) => [item.id, item]));
  document.body.insertAdjacentHTML("beforeend", panelHtml());
  bindControls();
  fillSelect();
  selectVenue(0);
}

function panelHtml() {
  return `
    <aside class="baegeum-editor-panel" aria-label="배금도시 도박장 설계">
      <header>
        <strong>배금도시 설계 v1</strong>
        <span>도박장 메타데이터</span>
      </header>
      <label><span>건물</span><select id="bgVenueSelect"></select></label>
      <div class="two-col">
        <label><span>간판</span><input id="bgSignInput" type="text"></label>
        <label><span>타입</span><select id="bgGameTypeSelect"></select></label>
      </div>
      <div class="two-col">
        <label><span>최소 베팅</span><input id="bgMinBetInput" type="number" min="0" step="100"></label>
        <label><span>실내 씬 ID</span><input id="bgInteriorInput" type="text"></label>
      </div>
      <div class="two-col">
        <label><span>입구 X</span><input id="bgEntranceXInput" type="number" step="1"></label>
        <label><span>입구 Y</span><input id="bgEntranceYInput" type="number" step="1"></label>
      </div>
      <div class="two-col">
        <label><span>간판 X</span><input id="bgSignXInput" type="number" step="1"></label>
        <label><span>간판 Y</span><input id="bgSignYInput" type="number" step="1"></label>
      </div>
      <label><span>건물 채널</span><input id="bgVenueChannelInput" type="text"></label>
      <label><span>테이블 채널</span><input id="bgTableChannelInput" type="text"></label>
      <div class="two-col">
        <label><span>관전자 채널</span><input id="bgSpectatorChannelInput" type="text"></label>
        <label><span>관리자 채널</span><input id="bgAdminChannelInput" type="text"></label>
      </div>
      <div class="button-row">
        <button id="bgResetVenueButton" type="button">선택 초기화</button>
        <button id="bgCopyVenueButton" type="button">JSON 복사</button>
      </div>
      <textarea id="bgVenueOutput" spellcheck="false"></textarea>
      <p id="bgVenueStatus">원본 맵은 유지하고 배금도시 레이어만 저장합니다.</p>
    </aside>
  `;
}

function bindControls() {
  state.controls = {
    select: document.getElementById("bgVenueSelect"),
    sign: document.getElementById("bgSignInput"),
    gameType: document.getElementById("bgGameTypeSelect"),
    minBet: document.getElementById("bgMinBetInput"),
    interiorId: document.getElementById("bgInteriorInput"),
    entranceX: document.getElementById("bgEntranceXInput"),
    entranceY: document.getElementById("bgEntranceYInput"),
    signX: document.getElementById("bgSignXInput"),
    signY: document.getElementById("bgSignYInput"),
    venueChannel: document.getElementById("bgVenueChannelInput"),
    tableChannel: document.getElementById("bgTableChannelInput"),
    spectatorChannel: document.getElementById("bgSpectatorChannelInput"),
    adminChannel: document.getElementById("bgAdminChannelInput"),
    output: document.getElementById("bgVenueOutput"),
    status: document.getElementById("bgVenueStatus")
  };
  for (const input of channelInputs()) input.readOnly = true;
  state.controls.select.addEventListener("change", () => selectVenue(Number(state.controls.select.value)));
  for (const input of editableInputs()) input.addEventListener("input", saveFromInputs);
  document.getElementById("bgResetVenueButton").addEventListener("click", resetCurrent);
  document.getElementById("bgCopyVenueButton").addEventListener("click", copyOutput);
}

function fillSelect() {
  state.controls.gameType.innerHTML = venueGameTypes.map((item) => `<option value="${item.value}">${item.label}</option>`).join("");
  state.controls.select.innerHTML = state.base
    .map((item, index) => `<option value="${index}">${index + 1}. ${merged(item).sign}</option>`)
    .join("");
}

function selectVenue(index) {
  state.current = Math.max(0, Math.min(index || 0, state.base.length - 1));
  state.controls.select.value = String(state.current);
  const meta = merged(state.base[state.current]);
  state.controls.sign.value = meta.sign;
  state.controls.gameType.value = meta.gameType;
  state.controls.minBet.value = meta.minBet;
  state.controls.interiorId.value = meta.interiorId;
  state.controls.entranceX.value = meta.entrance.x;
  state.controls.entranceY.value = meta.entrance.y;
  state.controls.signX.value = meta.signAnchor.x;
  state.controls.signY.value = meta.signAnchor.y;
  state.controls.venueChannel.value = meta.channels.venue;
  state.controls.tableChannel.value = meta.channels.table;
  state.controls.spectatorChannel.value = meta.channels.spectator;
  state.controls.adminChannel.value = meta.channels.admin;
  renderOutput();
}

function saveFromInputs() {
  const base = state.base[state.current];
  const draft = {
    id: base.id,
    sign: state.controls.sign.value,
    gameType: state.controls.gameType.value,
    venueType: base.venueType,
    minBet: Number(state.controls.minBet.value) || 0,
    entrance: point(state.controls.entranceX, state.controls.entranceY),
    signAnchor: point(state.controls.signX, state.controls.signY),
    interiorId: state.controls.interiorId.value,
    channels: base.channels
  };
  state.drafts.set(base.id, draft);
  const stored = persist();
  fillSelect();
  state.controls.select.value = String(state.current);
  renderOutput(stored ? "저장됨. 게임 탭을 새로고침하면 반영됩니다." : "저장소가 막혀 JSON만 갱신했습니다.");
}

function resetCurrent() {
  state.drafts.delete(state.base[state.current].id);
  persist();
  fillSelect();
  selectVenue(state.current);
  renderOutput("선택 건물을 기본값으로 되돌렸습니다.");
}

function persist() {
  if (typeof localStorage === "undefined") return false;
  writeStoredVenueMetadata([...state.drafts.values()]);
  return true;
}

function renderOutput(message = "배금도시 도박장 JSON 준비됨.") {
  state.controls.output.value = JSON.stringify(exportMetadata(), null, 2);
  state.controls.status.textContent = message;
}

async function copyOutput() {
  await navigator.clipboard?.writeText(state.controls.output.value);
  renderOutput("JSON을 클립보드에 복사했습니다.");
}

function exportMetadata() {
  return state.base.map((item) => merged(item));
}

function merged(item) {
  return mergeVenueMetadata(item, state.drafts.get(item.id));
}

function editableInputs() {
  return Object.values(state.controls).filter((item) =>
    item.id !== "bgVenueSelect" && !channelInputIds.has(item.id) && (item instanceof HTMLInputElement || item instanceof HTMLSelectElement)
  );
}

function channelInputs() {
  return Object.values(state.controls).filter((item) => channelInputIds.has(item.id));
}

function point(xInput, yInput) {
  return { x: Math.round(Number(xInput.value) || 0), y: Math.round(Number(yInput.value) || 0) };
}
