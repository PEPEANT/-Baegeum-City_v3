import { WORLD_CHANNEL_ID } from "../data/runtime-contract.js";

const BEST_THRESHOLD = 5;
const BASE_POSTS = [
  { id: "casino-street-guide", title: "블랙잭카지노 앞 동선 이제 좀 도시 같아짐", author: "도시답사러", views: 128, likes: 7, comments: 3 },
  { id: "odd-even-loop", title: "홀짝카지노 첫 베팅 루프는 입구 연결 뒤에 붙이는 게 맞음", author: "칩없는놈", views: 91, likes: 4, comments: 2 },
  { id: "race-track-rumor", title: "경마장 간판 켜지는 시간 따로 있으면 재밌을 듯", author: "배금신문", views: 77, likes: 6, comments: 1 },
  { id: "chip-exchange-tip", title: "칩교환소 위치는 미니맵에 먼저 찍어줘야 함", author: "지갑요정", views: 52, likes: 2, comments: 0 }
];

export function createVirtualInternetSnapshot(context = {}) {
  const clock = normalizeClock(context.clock);
  const channel = context.chat?.channel || context.channel || WORLD_CHANNEL_ID;
  const location = resolveLocation(context);
  return {
    clock,
    channel,
    locationName: location.name,
    locationType: location.type,
    posts: createDisCommunityPosts({ ...context, clock, channel, location })
  };
}

export function createDisCommunityPosts(context = {}) {
  const clock = normalizeClock(context.clock);
  const location = context.location || resolveLocation(context);
  const eventPost = timeEventPost(clock, location);
  const channelPost = {
    id: `channel-${safeId(context.channel)}`,
    title: `${location.name} 채널 열림: ${context.channel || WORLD_CHANNEL_ID}`,
    author: "배금도시봇",
    gameTime: gameTimeText(clock),
    views: location.type === "venue" ? 64 : 42,
    likes: location.type === "venue" ? 6 : 3,
    comments: location.type === "venue" ? 2 : 1
  };
  return [channelPost, eventPost, ...chatPosts(context), ...BASE_POSTS]
    .filter(Boolean)
    .map((post, index) => normalizePost(post, clock, index));
}

export function bestThreshold() {
  return BEST_THRESHOLD;
}

function chatPosts(context) {
  const chat = context.chat;
  const channel = context.channel || chat?.channel;
  const history = chat?.history?.(channel) || chat?.messages || [];
  return history
    .filter((message) => message.author !== "system" && message.text)
    .slice(-2)
    .reverse()
    .map((message, index) => ({
      id: `chat-${message.id || index}`,
      title: `방금 채팅: ${message.text}`,
      author: message.name || "guest",
      gameTime: message.worldTime || gameTimeText(normalizeClock(context.clock)),
      views: 18 + index * 7,
      likes: 1,
      comments: 0
    }));
}

function timeEventPost(clock, location) {
  if (clock.phaseKey === "night") {
    return {
      id: "night-rumor",
      title: `${clock.dayLabel} 이후 ${location.name} 근처에 밤 루머 도는 중`,
      author: "야간제보",
      views: 133,
      likes: 9,
      comments: 4
    };
  }
  if (clock.minuteOfDay >= 1140 && clock.minuteOfDay < 1260) {
    return {
      id: "casino-peak",
      title: "저녁 피크타임이라 카지노 거리 사람 몰리는 중",
      author: "현장반장",
      views: 104,
      likes: 8,
      comments: 3
    };
  }
  return {
    id: "daily-open",
    title: `${clock.dayLabel} 도시 게시판 갱신됨`,
    author: "운영알림",
    views: 36,
    likes: 2,
    comments: 0
  };
}

function normalizePost(post, clock, index) {
  return {
    id: post.id || `post-${index}`,
    title: post.title || "제목 없음",
    author: post.author || "익명",
    gameTime: post.gameTime || gameTimeText(clock, -index * 7),
    views: Number(post.views) || 0,
    likes: Number(post.likes) || 0,
    comments: Number(post.comments) || 0
  };
}

function resolveLocation(context) {
  const venue = context.venue || context.currentInterior;
  if (venue) return { type: "venue", name: venue.sign || venue.name || "카지노" };
  if (context.scene && context.scene !== "city") return { type: "venue", name: String(context.scene) };
  return { type: "city", name: "배금도시" };
}

function normalizeClock(clock = {}) {
  const minuteOfDay = Number.isFinite(clock.minuteOfDay) ? clock.minuteOfDay : 480;
  return {
    day: Number(clock.day) || 1,
    minuteOfDay,
    phaseKey: clock.phaseKey || "day",
    timeText: clock.timeText || "08:00",
    dayLabel: clock.dayLabel || "DAY 01"
  };
}

function gameTimeText(clock, offset = 0) {
  const minute = ((clock.minuteOfDay + offset) % 1440 + 1440) % 1440;
  const hour = Math.floor(minute / 60);
  const min = minute % 60;
  return `${clock.dayLabel} ${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function safeId(value) {
  return String(value || "world").replace(/[^a-z0-9:_-]/gi, "-");
}
