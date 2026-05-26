import { bestThreshold, createVirtualInternetSnapshot } from "../../systems/virtual-internet.js";
import { getRuntimeState } from "../../systems/runtime-state-facade.js";

export function isDisRoute(route = "") {
  return String(route || "").startsWith("dis/");
}

export function buildDisPreviewMarkup({ compact = false, context = null } = {}) {
  const feed = createVirtualInternetSnapshot(context || readRuntimeContext());
  return compact ? buildCompactMarkup(feed) : buildListMarkup(feed);
}

function buildCompactMarkup(feed) {
  const posts = feed.posts.slice(0, 3);
  return `
    <section class="dis-community-compact-shell">
      <div class="dis-community-compact-head">
        <div class="dis-community-compact-kicker">DIS LIVE</div>
        <div class="dis-community-compact-title">특이점이 온다</div>
        <div class="dis-community-compact-note">${escapeHtml(feed.locationName)} · ${escapeHtml(feed.clock.dayLabel)}</div>
      </div>
      ${connectionBadge(posts.length, feed)}
      <div class="dis-community-compact-list">
        ${posts.map((post) => `
          <button class="dis-community-compact-item" type="button">
            <span class="dis-community-compact-item-title">${bestBadge(post)}${escapeHtml(post.title)}${commentCount(post, "compact")}</span>
            <span class="dis-community-compact-item-meta">${escapeHtml(`${post.author} · 추천 ${post.likes || 0}`)}</span>
          </button>
        `).join("")}
      </div>
      <div class="dis-community-compact-actions">
        <button class="dis-community-compact-action is-primary" type="button">갤러리 전체보기</button>
        <button class="dis-community-compact-action" type="button">글쓰기</button>
      </div>
    </section>
  `;
}

function buildListMarkup(feed) {
  const bestPosts = feed.posts.filter((post) => (post.likes || 0) >= bestThreshold());
  return `
    <div class="dis-app dis-browser-app">
      <div class="dis-community-shell" data-dis-channel="${escapeHtml(feed.channel)}">
        <div class="dis-community-topbar">
          <div class="dis-community-topbar-title">특이점이 온다 갤러리</div>
          <div class="dis-community-topbar-actions">
            <button class="dis-community-header-btn" type="button">글쓰기</button>
            <button class="dis-community-header-btn" type="button">홈</button>
          </div>
        </div>
        ${connectionBadge(feed.posts.length, feed)}
        <div class="dis-community-tabs" role="tablist">
          <button class="dis-community-tab is-active" type="button">전체글</button>
          <button class="dis-community-tab" type="button">개념글 (${bestPosts.length})</button>
        </div>
        <div class="dis-community-board">
          ${bestSection(bestPosts)}
          <div class="dis-community-post-list">
            ${feed.posts.map((post) => postRow(post)).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function bestSection(posts) {
  if (!posts.length) return "";
  return `
    <div class="dis-community-best-section">
      <div class="dis-community-best-header">개념글</div>
      ${posts.slice(0, 3).map((post) => `
        <button class="dis-community-best-row" type="button">
          <span class="dis-community-best-title">${escapeHtml(post.title)}</span>
          <span class="dis-community-best-likes">추천 ${escapeHtml(post.likes)}</span>
        </button>
      `).join("")}
    </div>
  `;
}

function postRow(post) {
  return `
    <button class="dis-community-post-row" type="button">
      <div class="dis-community-post-title-row">
        ${bestBadge(post)}
        <span class="dis-community-post-title">${escapeHtml(post.title)}</span>
        ${commentCount(post)}
      </div>
      <div class="dis-community-post-meta-row">
        <span>${escapeHtml(post.author)}</span>
        <span>${escapeHtml(formatTimestamp(post.gameTime || post.createdAt))}</span>
        <span class="is-views">조회 ${escapeHtml(post.views || 0)}</span>
        <span class="is-likes">추천 ${escapeHtml(post.likes || 0)}</span>
      </div>
    </button>
  `;
}

function connectionBadge(postCount, feed) {
  return `
    <div class="dis-community-conn-row">
      <span class="dis-community-conn-dot"></span>
      <span class="dis-community-conn-text">${escapeHtml(feed.channel)} · ${escapeHtml(feed.clock.dayLabel)}</span>
      <span class="dis-community-post-count">글 ${escapeHtml(postCount)}개</span>
    </div>
  `;
}

function bestBadge(post) {
  return (post.likes || 0) >= bestThreshold() ? '<span class="dis-community-best-badge">개념</span> ' : "";
}

function commentCount(post, variant = "row") {
  const count = post.comments || 0;
  if (!count) return "";
  const className = variant === "compact" ? "dis-community-compact-comment-count" : "dis-community-post-comment-count";
  return ` <span class="${className}">[${escapeHtml(count)}]</span>`;
}

function formatTimestamp(value) {
  if (String(value || "").startsWith("DAY ")) {
    const [day, number] = String(value).split(" ");
    return `${day} ${number || ""}`.trim();
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}.${date.getMonth() + 1}.${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function readRuntimeContext() {
  const runtime = getRuntimeState();
  const game = runtime.game || {};
  return {
    clock: runtime.clockSnapshot,
    chat: runtime.chat,
    channel: runtime.chat?.channel,
    scene: game.scene,
    venue: game.currentInterior
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
