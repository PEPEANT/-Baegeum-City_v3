import { gamblingVenues } from "./gambling-venues.js";

const gameProps = {
  blackjack: ["블랙잭 테이블", "딜러석", "칩 트레이"],
  "odd-even": ["홀짝 테이블", "배당판", "주사위 보관함"],
  "horse-racing": ["경마 중계석", "마권 창구", "대기 라운지"],
  roulette: ["룰렛 테이블", "베팅판", "딜러석"],
  slot: ["슬롯 머신", "잭팟 전광판", "환전 카운터"],
  baccarat: ["바카라 테이블", "슈 박스", "VIP 좌석"],
  poker: ["포커 테이블", "카드룸", "관전석"],
  dice: ["주사위 테이블", "배당판", "칩 박스"],
  lottery: ["복권 판매대", "당첨 확인기", "대기줄"],
  exchange: ["칩 교환 창구", "현금 금고", "수수료 안내판"],
  "sports-bet": ["토토 접수대", "경기 전광판", "배당표"],
  "high-low": ["하이로우 테이블", "카드 덱", "칩 트레이"],
  vip: ["VIP 테이블", "샴페인 바", "전용 금고"]
};

const casinoTones = [
  { floor: "#2b1620", wall: "#4f2431", prop: "#8c5a36" },
  { floor: "#1f2632", wall: "#3d465a", prop: "#6f7d9a" },
  { floor: "#2c2416", wall: "#5a4222", prop: "#a07338" },
  { floor: "#172a25", wall: "#2f5b4d", prop: "#4f9278" }
];

export const interiors = Object.fromEntries(gamblingVenues.map((venue, index) => [venue.interiorId, createCasinoInterior(venue, index)]));

function createCasinoInterior(venue, index) {
  if (venue.gameType === "horse-racing") return createHorseRacingInterior(venue, index);
  const tone = casinoTones[index % casinoTones.length];
  const labels = gameProps[venue.gameType] || ["게임 테이블", "카운터", "대기석"];
  const exchangeAtm = { x: 720, y: 405, w: 132, h: 86, label: "환전 ATM", role: "exchange-atm", id: `exchange-atm:${venue.id}` };
  return {
    id: venue.interiorId,
    name: venue.sign,
    gameType: venue.gameType,
    venueType: venue.venueType,
    onlineRoomId: venue.onlineRoomId,
    minBet: venue.minBet,
    theme: tone,
    spawn: { x: 520, y: 610 },
    exit: { id: `${venue.id}-exit`, x: 520, y: 670, label: `${venue.sign} 밖으로` },
    bounds: { x: 120, y: 90, w: 820, h: 600 },
    walls: roomWalls(),
    props: [
      { x: 350, y: 185, w: 330, h: 150, label: labels[0], role: "main-table" },
      { x: 705, y: 220, w: 130, h: 72, label: labels[1], role: "counter" },
      { x: 210, y: 455, w: 220, h: 64, label: labels[2], role: "lounge" },
      exchangeAtm
    ]
  };
}

function createHorseRacingInterior(venue, index) {
  const tone = { floor: "#0f0f0f", wall: "#2d2d2d", prop: casinoTones[index % casinoTones.length].prop };
  const exchangeAtm = { x: 810, y: 590, w: 108, h: 62, label: "환전 ATM", role: "exchange-atm", id: `exchange-atm:${venue.id}` };
  return {
    id: venue.interiorId,
    name: venue.sign,
    gameType: venue.gameType,
    venueType: venue.venueType,
    onlineRoomId: venue.onlineRoomId,
    minBet: venue.minBet,
    theme: tone,
    spawn: { x: 520, y: 624 },
    exit: { id: `${venue.id}-exit`, x: 520, y: 670, label: `${venue.sign} 밖으로` },
    bounds: { x: 112, y: 82, w: 848, h: 608 },
    walls: roomWalls(),
    props: [
      { x: 160, y: 126, w: 790, h: 154, role: "horse-scoreboard", label: "황금말대회", horses: horseBoardRows() },
      { x: 164, y: 294, w: 782, h: 176, role: "horse-track", lanes: 5 },
      { x: 138, y: 470, w: 835, h: 96, role: "horse-grandstand", rows: 3, sections: 4, seatsPerSection: 18 },
      { x: 208, y: 568, w: 596, h: 92, role: "horse-betting-station", label: "티켓 & 배팅", windows: 4 },
      exchangeAtm
    ]
  };
}

function horseBoardRows() {
  return [
    ["1", "RED HARE", "1.8", "READY"],
    ["2", "BLUE DRAGON", "2.5", "READY"],
    ["3", "GREEN WIND", "4.2", "READY"],
    ["4", "PURPLE YAM", "7.5", "READY"],
    ["5", "GOLDEN", "12.0", "WARNING"]
  ];
}

function roomWalls() {
  return [
    { x: 120, y: 90, w: 820, h: 34 },
    { x: 120, y: 656, w: 360, h: 34 },
    { x: 560, y: 656, w: 380, h: 34 },
    { x: 120, y: 90, w: 34, h: 600 },
    { x: 906, y: 90, w: 34, h: 600 }
  ];
}
