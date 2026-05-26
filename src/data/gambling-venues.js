import { VENUE_SCHEMA_VERSION, worldChannelIdForMap } from "./runtime-contract.js";

export const venueMetadataStorageKey = "baegeum-city-v2-venue-metadata-v1";

export const venueGameTypes = [
  ["blackjack", "블랙잭"],
  ["odd-even", "홀짝"],
  ["horse-racing", "경마"],
  ["roulette", "룰렛"],
  ["slot", "슬롯"],
  ["baccarat", "바카라"],
  ["poker", "포커"],
  ["dice", "주사위"],
  ["lottery", "복권"],
  ["exchange", "칩교환"],
  ["sports-bet", "사설토토"],
  ["high-low", "하이로우"],
  ["vip", "VIP"]
].map(([value, label]) => ({ value, label }));
const venueGameTypeValues = new Set(venueGameTypes.map((type) => type.value));

export const gamblingVenues = [
  venue("blackjack-casino", "블랙잭카지노", "blackjack", 1000),
  venue("odd-even-casino", "홀짝카지노", "odd-even", 500),
  venue("horse-track", "경마장", "horse-racing", 1000),
  venue("roulette-casino", "룰렛카지노", "roulette", 1000),
  venue("slot-casino", "슬롯카지노", "slot", 100),
  venue("baccarat-casino", "바카라카지노", "baccarat", 1000),
  venue("poker-room", "포커룸", "poker", 2000),
  venue("dice-casino", "주사위카지노", "dice", 500),
  venue("lottery-shop", "복권방", "lottery", 1000),
  venue("chip-exchange", "칩교환소", "exchange", 0, "support"),
  venue("private-toto", "사설토토", "sports-bet", 1000),
  venue("high-low-casino", "하이로우카지노", "high-low", 500),
  venue("vip-casino", "VIP카지노", "vip", 10000)
];

function venue(id, sign, gameType, minBet, venueType = "gambling") {
  const channels = createVenueChannels(id);
  return {
    id,
    sign,
    name: sign,
    gameType,
    venueType,
    minBet,
    venueSchemaVersion: VENUE_SCHEMA_VERSION,
    districtId: `gambling-${gameType}`,
    doorId: `${id}-front`,
    interiorId: `interior-${id}`,
    onlineRoomId: channels.venue,
    channels,
    entrance: { source: "front-center", offsetY: 22 },
    signAnchor: { source: "entrance", offsetY: -42 }
  };
}

export function createVenueMetadata(venue, rect, index = 0) {
  const branch = index >= gamblingVenues.length ? `-${index + 1}` : "";
  const id = `${venue.id}${branch}`;
  const entrance = {
    x: Math.round(rect.x + rect.w * 0.5),
    y: Math.round(rect.y + rect.h + (venue.entrance?.offsetY || 22))
  };
  const channels = createVenueChannels(id);
  return {
    id,
    sign: venue.sign,
    name: venue.name,
    gameType: venue.gameType,
    venueType: venue.venueType,
    minBet: venue.minBet,
    venueSchemaVersion: VENUE_SCHEMA_VERSION,
    districtId: venue.districtId,
    rect: copyRect(rect),
    entrance,
    signAnchor: { x: entrance.x, y: entrance.y + (venue.signAnchor?.offsetY || -42) },
    doorId: `${id}-front`,
    interiorId: `interior-${id}`,
    onlineRoomId: channels.venue,
    channels
  };
}

export function createVenueChannels(id, mapId) {
  const channelId = venueChannelId(id);
  return {
    world: worldChannelIdForMap(mapId),
    venue: `venue:${channelId}`,
    table: `table:${channelId}:main`,
    spectator: `spectator:${channelId}`,
    admin: `admin:${channelId}`
  };
}

function venueChannelId(id) {
  return /-\d+$/.test(id) ? id : `${id}-01`;
}

export function readStoredVenueMetadata(storage = defaultVenueStorage()) {
  return inspectStoredVenueMetadata(storage).metadata;
}

export function inspectStoredVenueMetadata(storage = defaultVenueStorage()) {
  if (!storage?.getItem) return venueMetadataReadResult("missing_storage", null, []);
  const raw = storage.getItem(venueMetadataStorageKey);
  if (raw === null) return venueMetadataReadResult("missing", raw, []);
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return venueMetadataReadResult("corrupt", raw, []);
    return venueMetadataReadResult("ok", raw, normalizeVenueMetadataList(parsed));
  } catch (error) {
    return venueMetadataReadResult("corrupt", raw, [], error);
  }
}

export function writeStoredVenueMetadata(drafts, storage = defaultVenueStorage()) {
  const normalized = normalizeVenueMetadataList(drafts);
  if (storage?.setItem) storage.setItem(venueMetadataStorageKey, JSON.stringify(normalized));
  return normalized;
}

export function upsertStoredVenueMetadata(draft, storage = defaultVenueStorage()) {
  const normalized = normalizeVenueMetadataDraft(draft);
  const current = readStoredVenueMetadata(storage);
  if (!normalized) return current;
  const index = current.findIndex((item) => item.id === normalized.id);
  if (index >= 0) current[index] = { ...current[index], ...normalized };
  else current.push(normalized);
  return writeStoredVenueMetadata(current, storage);
}

export function normalizeVenueMetadataDraft(draft) {
  const id = cleanText(draft?.id);
  if (!id) return null;
  const normalized = { id };
  const sign = cleanText(draft.sign);
  const gameType = cleanGameType(draft.gameType);
  const venueType = cleanText(draft.venueType);
  const minBet = cleanNonNegativeInteger(draft.minBet);
  const entrance = cleanPoint(draft.entrance);
  const signAnchor = cleanPoint(draft.signAnchor);
  const interiorId = cleanText(draft.interiorId);
  if (sign) normalized.sign = sign;
  if (gameType) normalized.gameType = gameType;
  if (venueType) normalized.venueType = venueType;
  if (minBet !== null) normalized.minBet = minBet;
  if (entrance) normalized.entrance = entrance;
  if (signAnchor) normalized.signAnchor = signAnchor;
  if (interiorId) normalized.interiorId = interiorId;
  return normalized;
}

export function mergeVenueMetadata(base, draft) {
  if (!draft || draft.id !== base.id) return base;
  const channels = createVenueChannels(base.id);
  const minBet = cleanNonNegativeInteger(draft.minBet);
  return {
    ...base,
    sign: cleanText(draft.sign) || base.sign,
    name: cleanText(draft.sign) || base.name,
    gameType: cleanGameType(draft.gameType) || base.gameType,
    venueType: cleanText(draft.venueType) || base.venueType,
    minBet: minBet ?? base.minBet,
    venueSchemaVersion: VENUE_SCHEMA_VERSION,
    entrance: mergePoint(base.entrance, draft.entrance),
    signAnchor: mergePoint(base.signAnchor, draft.signAnchor),
    interiorId: cleanText(draft.interiorId) || base.interiorId,
    onlineRoomId: channels.venue,
    channels
  };
}

function mergePoint(base, draft) {
  return {
    x: Number.isFinite(Number(draft?.x)) ? Math.round(Number(draft.x)) : base.x,
    y: Number.isFinite(Number(draft?.y)) ? Math.round(Number(draft.y)) : base.y
  };
}

function defaultVenueStorage() {
  return typeof localStorage === "undefined" ? null : localStorage;
}

function normalizeVenueMetadataList(drafts) {
  if (!Array.isArray(drafts)) return [];
  return drafts.map(normalizeVenueMetadataDraft).filter(Boolean);
}

function venueMetadataReadResult(status, raw, metadata, error = null) {
  return {
    key: venueMetadataStorageKey,
    status,
    raw,
    metadata,
    error: error ? String(error.message || error) : null
  };
}

function cleanGameType(value) {
  const type = cleanText(value);
  return venueGameTypeValues.has(type) ? type : "";
}

function cleanNonNegativeInteger(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(0, Math.round(number));
}

function cleanPoint(point) {
  const x = Number(point?.x);
  const y = Number(point?.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x: Math.round(x), y: Math.round(y) };
}

function copyRect(rect) {
  return { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.w), h: Math.round(rect.h) };
}

function cleanText(value) {
  return String(value || "").trim();
}
