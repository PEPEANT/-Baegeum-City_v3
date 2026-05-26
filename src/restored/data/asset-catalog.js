export const RESTORED_ASSET_CATALOG_VERSION = "restored-asset-catalog-002";

export const RESTORED_REAL_ESTATE_CATALOG = Object.freeze([
  Object.freeze({ id: "oneroom", name: "원룸", price: 80000, rent: 300, img: "🏠" }),
  Object.freeze({ id: "apt", name: "아파트", price: 1500000, rent: 6000, img: "🌆" }),
  Object.freeze({ id: "building", name: "빌딩", price: 5000000, rent: 25000, img: "🏦" })
]);

export const RESTORED_LUXURY_CATALOG = Object.freeze([
  Object.freeze({
    id: "phone",
    name: "폴더폰",
    price: 500,
    img: "📱",
    type: "essential",
    desc: "뉴스 열람"
  }),
  Object.freeze({
    id: "smartphone",
    name: "스마트폰",
    price: 3000,
    img: "📲",
    type: "essential",
    desc: "코인 시세 확인"
  }),
  Object.freeze({ id: "energy_drink", name: "에너지 드링크", price: 8, img: "🥤", type: "consumable", desc: "에너지 회복", fixedPrice: true }),
  Object.freeze({
    id: "gold",
    name: "금괴 1kg",
    price: 65000,
    img: "🧈",
    type: "asset",
    desc: "안전 자산",
    fixedPrice: false
  }),
  Object.freeze({ id: "bag", name: "루이비통 가방", price: 3000, img: "👜", type: "asset", desc: "명품", fixedPrice: true }),
  Object.freeze({ id: "shoes", name: "명품 구두", price: 1500, img: "👠", type: "asset", desc: "명품", fixedPrice: true }),
  Object.freeze({ id: "ring", name: "다이아 반지", price: 5000, img: "💍", type: "asset", desc: "청혼용", fixedPrice: true }),
  Object.freeze({ id: "rolex", name: "롤렉스", price: 15000, img: "⌚", type: "asset", desc: "성공의 상징", fixedPrice: true }),
  Object.freeze({ id: "sedan", name: "고급 세단", price: 60000, img: "🚘", type: "asset", desc: "편안한 승차감", fixedPrice: true }),
  Object.freeze({ id: "supercar", name: "람보르기니", price: 300000, img: "🏎️", type: "asset", desc: "부의 상징", fixedPrice: true })
]);

function createCountedState(catalog, extraFields = () => ({})) {
  return Object.fromEntries(catalog.map((item) => [
    item.id,
    {
      ...extraFields(item),
      name: item.name,
      price: item.price,
      count: 0,
      img: item.img
    }
  ]));
}

export function createRestoredRealEstateState() {
  return createCountedState(RESTORED_REAL_ESTATE_CATALOG, (item) => ({ rent: item.rent }));
}

export function createRestoredLuxuryState() {
  return createCountedState(RESTORED_LUXURY_CATALOG, (item) => ({
    desc: item.desc,
    fixedPrice: item.fixedPrice,
    type: item.type
  }));
}

export function validateRestoredAssetCatalog() {
  const errors = [];

  for (const item of [...RESTORED_REAL_ESTATE_CATALOG, ...RESTORED_LUXURY_CATALOG]) {
    if (!item.id) errors.push("asset id is required");
    if (!item.name) errors.push(`${item.id || "unknown"} name is required`);
    if (!Number.isFinite(Number(item.price))) errors.push(`${item.id || "unknown"} price is required`);
    if (!item.img) errors.push(`${item.id || "unknown"} img is required`);
  }
  for (const item of RESTORED_REAL_ESTATE_CATALOG) {
    if (!Number.isFinite(Number(item.rent))) errors.push(`${item.id} rent is required`);
  }
  for (const item of RESTORED_LUXURY_CATALOG) {
    if (!item.type) errors.push(`${item.id} type is required`);
    if (!item.desc) errors.push(`${item.id} desc is required`);
  }

  return Object.freeze({ ok: errors.length === 0, errors });
}
