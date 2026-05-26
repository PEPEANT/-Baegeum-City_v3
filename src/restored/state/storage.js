import { INITIAL_RESTORED_STATE, createInitialRestoredState } from "./initial-state.js";
import { mergeRestoredProfileState } from "../player/profile-contract.js";
import { RESTORED_STORAGE_KEY } from "./save-contract.js";

export { RESTORED_STORAGE_KEY };

function encodeBase64(text) {
  if (typeof btoa === "function") return btoa(text);
  return Buffer.from(text, "utf8").toString("base64");
}

function decodeBase64(encoded) {
  if (typeof atob === "function") return atob(encoded);
  return Buffer.from(encoded, "base64").toString("utf8");
}

export function encodeRestoredSaveCode(state) {
  return encodeBase64(encodeURIComponent(JSON.stringify(state)));
}

export function decodeRestoredSaveCode(code) {
  const decodedText = decodeURIComponent(decodeBase64(code));
  return JSON.parse(decodedText);
}

export function restoreCashOnlyFromSaveCode(code) {
  try {
    const loadedData = decodeRestoredSaveCode(code);
    if (loadedData.cash === undefined || Number.isNaN(Number(loadedData.cash))) {
      return Object.freeze({ ok: false, error: "missing_cash" });
    }
    return Object.freeze({ ok: true, cash: Number(loadedData.cash), loadedData });
  } catch (error) {
    return Object.freeze({ ok: false, error: "invalid_code", detail: error });
  }
}

export function saveRestoredGame(storage, state) {
  storage.setItem(RESTORED_STORAGE_KEY, JSON.stringify(state));
}

export function loadRestoredGame(storage) {
  const state = createInitialRestoredState();
  const raw = storage.getItem(RESTORED_STORAGE_KEY);
  if (!raw) return state;

  try {
    mergeSavedRestoredState(state, JSON.parse(raw), INITIAL_RESTORED_STATE);
  } catch (error) {
    console.error(error);
  }

  return state;
}

export function mergeSavedRestoredState(targetState, savedState, initialState = INITIAL_RESTORED_STATE) {
  targetState.cash = savedState.cash || 0;

  if (savedState.stocks) {
    Object.keys(savedState.stocks).forEach((key) => {
      if (targetState.stocks[key]) Object.assign(targetState.stocks[key], savedState.stocks[key]);
    });
  }

  Object.keys(initialState.luxury).forEach((key) => {
    if (!targetState.luxury[key]) {
      targetState.luxury[key] = JSON.parse(JSON.stringify(initialState.luxury[key]));
      return;
    }
    const savedCount = savedState.luxury?.[key]?.count ?? targetState.luxury[key].count;
    Object.assign(targetState.luxury[key], initialState.luxury[key]);
    targetState.luxury[key].count = savedCount;
  });

  if (savedState.realEstate) {
    Object.keys(savedState.realEstate).forEach((key) => {
      if (targetState.realEstate[key]) {
        targetState.realEstate[key].count = savedState.realEstate[key].count;
      }
    });
  }

  if (savedState.location) {
    targetState.location = { ...targetState.location, ...savedState.location };
  }

  if (savedState.profile) {
    targetState.profile = mergeRestoredProfileState(targetState.profile, savedState.profile);
  }

  if (savedState.account) {
    targetState.account = { ...targetState.account, ...savedState.account };
  }

  if (savedState.online) {
    targetState.online = { ...targetState.online, ...savedState.online };
  }

  targetState.futures = savedState.futures || [];
  targetState.partners = savedState.partners || [];
  targetState.relationshipLogs = Array.isArray(savedState.relationshipLogs) ? savedState.relationshipLogs : [];
  targetState.partners.forEach((partner) => {
    if (partner.isLover === undefined) partner.isLover = false;
    if (partner.title === undefined) partner.title = "지인";
  });

  return targetState;
}
