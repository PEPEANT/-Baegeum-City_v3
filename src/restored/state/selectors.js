function numeric(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function sumCollectionValue(collection, valueOf) {
  if (!collection) return 0;
  return Object.values(collection).reduce((total, item) => total + valueOf(item), 0);
}

function isValuePreservingItem(item) {
  return item?.type !== "consumable";
}

export function getRestoredStockValue(state) {
  return sumCollectionValue(state?.stocks, (stock) => numeric(stock.price) * numeric(stock.qty));
}

export function getRestoredLuxuryValue(state) {
  return sumCollectionValue(state?.luxury, (item) => (
    isValuePreservingItem(item) ? numeric(item.price) * numeric(item.count) : 0
  ));
}

export function getRestoredRealEstateValue(state) {
  return sumCollectionValue(state?.realEstate, (asset) => numeric(asset.price) * numeric(asset.count));
}

export function getRestoredOwnershipValue(state) {
  return getRestoredRealEstateValue(state) + getRestoredLuxuryValue(state);
}

export function getRestoredTotalAsset(state) {
  return numeric(state?.cash) + getRestoredStockValue(state) + getRestoredLuxuryValue(state);
}

export function getRestoredRank(state, ranks) {
  const totalAsset = getRestoredTotalAsset(state);
  return ranks.find((rank) => totalAsset < rank.limit) || ranks[ranks.length - 1] || null;
}

export function getRestoredRankIndex(state, ranks) {
  return ranks.indexOf(getRestoredRank(state, ranks));
}

export function listRestoredInventoryItems(state) {
  return Object.entries(state?.luxury || {})
    .filter(([, item]) => numeric(item?.count) > 0)
    .map(([id, item]) => ({
      id,
      name: item.name,
      count: numeric(item.count),
      img: item.img,
      type: item.type || "asset",
      desc: item.desc || "",
      price: numeric(item.price)
    }));
}

export function hasRestoredPhone(state) {
  return numeric(state?.luxury?.phone?.count) > 0 || hasRestoredSmartPhone(state);
}

export function hasRestoredSmartPhone(state) {
  return numeric(state?.luxury?.smartphone?.count) > 0;
}
