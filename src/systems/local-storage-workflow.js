import {
  STORAGE_DIAGNOSTIC_STATUSES,
  inspectLocalStorage
} from "./local-storage-diagnostics.js";

export const LOCAL_STORAGE_WORKFLOW_STATUSES = Object.freeze({
  CLEAN: "clean",
  STALE: "stale",
  CORRUPT: "corrupt",
  UNAVAILABLE: "unavailable"
});

const staleStatuses = new Set([
  STORAGE_DIAGNOSTIC_STATUSES.OK,
  STORAGE_DIAGNOSTIC_STATUSES.MIGRATED
]);

const blockingIds = new Set([
  "player-economy",
  "economy-ledger",
  "odd-even-rounds",
  "world-editor-draft:baegeum-city",
  "world-editor-draft:dice-city",
  "world-editor-draft:legacy",
  "venue-metadata"
]);

export function summarizeLocalStorageWorkflow(storage = defaultStorage()) {
  const items = inspectLocalStorage(storage);
  const corrupt = items.filter((item) => item.status === STORAGE_DIAGNOSTIC_STATUSES.CORRUPT);
  const unavailable = items.filter((item) => item.status === STORAGE_DIAGNOSTIC_STATUSES.UNAVAILABLE);
  const stale = items.filter((item) => staleStatuses.has(item.status));
  const blockingStale = stale.filter((item) => blockingIds.has(item.id));
  const status = workflowStatus({ items, corrupt, unavailable, stale });
  return {
    status,
    clean: status === LOCAL_STORAGE_WORKFLOW_STATUSES.CLEAN,
    stale: stale.length > 0,
    corrupt: corrupt.length > 0,
    blocking: corrupt.length > 0 || blockingStale.length > 0,
    counts: countStatuses(items),
    staleIds: stale.map((item) => item.id),
    corruptIds: corrupt.map((item) => item.id),
    blockingIds: [...new Set([...corrupt, ...blockingStale].map((item) => item.id))],
    items: items.map(compactStorageItem)
  };
}

export function createLocalStorageWorkflowLabel(summary = {}) {
  if (summary.status === LOCAL_STORAGE_WORKFLOW_STATUSES.CLEAN) return "clean: no saved project state";
  if (summary.status === LOCAL_STORAGE_WORKFLOW_STATUSES.CORRUPT) {
    return `corrupt: ${summary.corruptIds?.join(", ") || "unknown key"}`;
  }
  if (summary.status === LOCAL_STORAGE_WORKFLOW_STATUSES.UNAVAILABLE) return "unavailable: storage cannot be inspected";
  return `stale: ${summary.staleIds?.join(", ") || "saved project state"}`;
}

function workflowStatus({ items, corrupt, unavailable, stale }) {
  if (corrupt.length) return LOCAL_STORAGE_WORKFLOW_STATUSES.CORRUPT;
  if (items.length && unavailable.length === items.length) return LOCAL_STORAGE_WORKFLOW_STATUSES.UNAVAILABLE;
  if (stale.length) return LOCAL_STORAGE_WORKFLOW_STATUSES.STALE;
  return LOCAL_STORAGE_WORKFLOW_STATUSES.CLEAN;
}

function countStatuses(items) {
  return items.reduce((counts, item) => {
    counts[item.status] = (counts[item.status] || 0) + 1;
    return counts;
  }, {});
}

function compactStorageItem(item) {
  return {
    id: item.id,
    key: item.key,
    owner: item.owner,
    status: item.status,
    format: item.format,
    legacy: Boolean(item.legacy),
    mapId: item.mapId || null
  };
}

function defaultStorage() {
  return typeof localStorage === "undefined" ? null : localStorage;
}
