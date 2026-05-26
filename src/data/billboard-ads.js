export const BILLBOARD_ADS = [
  {
    id: "dis-inside",
    label: "DIS Inside",
    headline: "disinside.net",
    tagline: "Connecting Streets",
    bg: "#3f4f94",
    fg: "#ffffff",
    accent: "#dfe7ff",
    icon: "di"
  },
  {
    id: "casino-night",
    label: "카지노 야간",
    headline: "LUCKY HALL",
    tagline: "24H TABLES",
    bg: "#46172f",
    fg: "#ffe78a",
    accent: "#f06e9c",
    icon: "7"
  },
  {
    id: "quick-loan",
    label: "수상한 대출",
    headline: "FAST CASH",
    tagline: "NO QUESTIONS",
    bg: "#2d3d35",
    fg: "#f4d76d",
    accent: "#8bd0a0",
    icon: "₩"
  },
  {
    id: "street-jobs",
    label: "거리 알바",
    headline: "NIGHT JOBS",
    tagline: "TODAY PAID",
    bg: "#28313a",
    fg: "#eaf0e3",
    accent: "#7ec7d8",
    icon: "!"
  },
  {
    id: "city-warning",
    label: "도시 경고",
    headline: "KEEP CLEAR",
    tagline: "CAMERA ZONE",
    bg: "#4a3424",
    fg: "#ffd36b",
    accent: "#df6d55",
    icon: "!"
  }
];

const ALIASES = {
  campaign: "dis-inside",
  supply: "quick-loan",
  warning: "city-warning",
  checkpoint: "casino-night",
  orders: "street-jobs"
};

export function billboardAdOptions() {
  return BILLBOARD_ADS.map((ad) => ({ ...ad }));
}

export function resolveBillboardAd(item) {
  const id = normalizeBillboardAdId(item?.adId || ALIASES[item?.variant] || seededAdId(item));
  return BILLBOARD_ADS.find((ad) => ad.id === id) || BILLBOARD_ADS[0];
}

export function setBillboardAdId(item, adId) {
  if (!isBillboard(item)) return null;
  item.adId = normalizeBillboardAdId(adId);
  return resolveBillboardAd(item);
}

export function normalizeBillboardAdId(adId) {
  return BILLBOARD_ADS.some((ad) => ad.id === adId) ? adId : BILLBOARD_ADS[0].id;
}

export function isBillboard(item) {
  return item?.type === "billboard" || item?.presetId === "billboard";
}

function seededAdId(item) {
  const seed = Math.abs(Math.round((item?.x || 0) * 17 + (item?.y || 0) * 31));
  return BILLBOARD_ADS[seed % BILLBOARD_ADS.length].id;
}
