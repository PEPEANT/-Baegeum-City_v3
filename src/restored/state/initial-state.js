import {
  createInitialRestoredAccountState
} from "../account/session-contract.js";
import { createRestoredLuxuryState, createRestoredRealEstateState } from "../data/asset-catalog.js";
import { createInitialRestoredLocationState } from "../data/location-catalog.js";
import { createRestoredCryptoState, createRestoredStockState } from "../data/market-catalog.js";
import { createInitialRestoredOnlineState } from "../online/online-adapter-contract.js";
import { createInitialRestoredProfileState } from "../player/profile-contract.js";

export const RESTORED_INITIAL_STATE_VERSION = "restored-initial-state-003";

export const EXCHANGE_RATE = 1350;

function createRestoredStateShape() {
  return {
    cash: 10000,
    stocks: createRestoredStockState(),
    crypto: createRestoredCryptoState(),
    futures: [],
    realEstate: createRestoredRealEstateState(),
    luxury: createRestoredLuxuryState(),
    profile: createInitialRestoredProfileState(),
    account: createInitialRestoredAccountState(),
    online: createInitialRestoredOnlineState(),
    location: createInitialRestoredLocationState(),
    newsHistory: [],
    partners: [],
    relationshipLogs: []
  };
}

export const INITIAL_RESTORED_STATE = Object.freeze(createRestoredStateShape());

export function cloneRestoredState(state = INITIAL_RESTORED_STATE) {
  return JSON.parse(JSON.stringify(state));
}

export function createInitialRestoredState() {
  return createRestoredStateShape();
}
