const DIS_GAMBLING_ROUTES = Object.freeze({
  home: "dis/home",
  gamble: "dis/gamble",
  oddEven: "dis/gamble-odd-even",
  ladder: "dis/gamble-ladder",
  singularity: "dis/singularity",
  singularityRead: "dis/singularity-read",
  singularityWrite: "dis/singularity-write",
});

const DIS_GAMBLING_KEYWORDS = [
  "도박",
  "홀짝",
  "사다리",
  "먹튀",
  "배팅",
  "베팅",
  "토토",
  "사설",
  "불법",
  "바카라",
  "카지노",
];

function getDisInternetLocationLabel(targetState = state) {
  return typeof getCurrentLocationLabel === "function"
    ? getCurrentLocationLabel(targetState)
    : "배금시";
}

function getDisInternetFeedEntries(targetState = state) {
  const locationLabel = getDisInternetLocationLabel(targetState);
  const marketCycle = typeof getMarketCycleSnapshot === "function"
    ? getMarketCycleSnapshot(targetState)
    : null;
  const economy = typeof getTodayEconomy === "function"
    ? getTodayEconomy(targetState)
    : null;
  const newsPack = economy?.newsPack || {};
  const stockMarket = typeof getStockMarketSnapshot === "function"
    ? getStockMarketSnapshot(targetState)
    : null;
  const featuredMemeCoin = typeof getFeaturedMemeCoinSnapshot === "function"
    ? getFeaturedMemeCoinSnapshot(targetState)
    : null;
  const economyHeadline = typeof getEconomyHeadline === "function"
    ? getEconomyHeadline(targetState)
    : "오늘 경제 지표가 아직 정리되지 않았습니다.";
  const mealPrice = typeof getIndexedPrice === "function"
    ? getIndexedPrice(3500, targetState)
    : 3500;

  const entries = [
    {
      id: "economy",
      kicker: economy?.monthLabel ? `${economy.monthLabel} MACRO` : "ECONOMY",
      title: newsPack.macro?.title || economyHeadline,
      body: `${newsPack.macro?.body || ""} ${locationLabel} 기준 한 끼는 약 ${formatCash(mealPrice)}, 생활물가 지수는 ${economy ? economy.priceIndex.toFixed(2) : "1.00"}입니다.`.trim(),
      tone: economy && economy.priceChangePercent > 0 ? "accent" : "success",
      tags: [locationLabel, "경제", "물가", "생활비", "식비", economy?.phaseLabel || "시장"],
    },
    stockMarket
      ? {
          id: "market",
          kicker: "MARKET",
          title: newsPack.stocks?.title || `오늘 증시 ${stockMarket.marketTrend}`,
          body: `${newsPack.stocks?.body || ""} 시장 변동은 ${stockMarket.movementText}, 예상 수익권은 ${stockMarket.successChanceText} 수준입니다.`.trim(),
          tone: stockMarket.marketChangePercent >= 0 ? "success" : "fail",
          tags: ["증시", "주식", stockMarket.marketTrend, stockMarket.movementText, economy?.phaseLabel || "시장"],
        }
      : {
          id: "market",
          kicker: "MARKET",
          title: "증시 분석 대기",
          body: "아직 시장 데이터가 부족해 다음 묶음에서 다시 갱신됩니다.",
          tone: "accent",
          tags: ["증시", "시장", "대기"],
        },
    economy
      ? {
          id: "exchange",
          kicker: "FX",
          title: newsPack.safe?.title || "환율 체감 지표",
          body: `${newsPack.safe?.body || ""} 환율 체감지수 ${economy.exchangeIndex}, 기준 변동 ${economy.exchangeChange > 0 ? "+" : ""}${economy.exchangeChange}p입니다.`.trim(),
          tone: "accent",
          tags: ["환율", "외환", "체감지표", String(economy.exchangeIndex), economy?.safeAssetDirection?.label || "방어"],
        }
      : {
          id: "exchange",
          kicker: "FX",
          title: "환율 속보 대기",
          body: "환율 정보가 아직 유입되지 않았습니다. 다음 이슈 묶음에서 다시 확인해 보세요.",
          tone: "accent",
          tags: ["환율", "외환", "대기"],
        },
    {
      id: "local",
      kicker: "LOCAL",
      title: newsPack.local?.title || `${locationLabel} 실시간`,
      body: `${newsPack.local?.body || ""} ${marketCycle?.next ? `다음 달 ${marketCycle.next.monthLabel}은 ${marketCycle.next.phaseLabel} 쪽으로 기울 전망입니다.` : `${typeof formatTurnLabel === "function" ? formatTurnLabel(targetState.day) : `${targetState.day}턴`} 현재 위치 기준으로 생활 정보와 모집 공고가 빠르게 묶여 올라오고 있습니다.`}`.trim(),
      tone: "accent",
      tags: [locationLabel, "실시간", "동네", "공고", economy?.monthLabel || "현재"],
    },
  ];

  if (featuredMemeCoin) {
    entries.unshift({
      id: "meme",
      kicker: featuredMemeCoin.eventKicker || "MEME",
      title: newsPack.crypto?.title || featuredMemeCoin.event.headline,
      body: `${newsPack.crypto?.body || featuredMemeCoin.event.body} ${featuredMemeCoin.label} 기준 예상 흐름은 ${featuredMemeCoin.movementText}입니다.`,
      tone: featuredMemeCoin.direction === "up" ? "success" : "fail",
      tags: [
        featuredMemeCoin.label,
        "밈코인",
        featuredMemeCoin.eventKicker || "MEME",
        economy?.phaseLabel || "시장",
        ...(featuredMemeCoin.topics || []),
      ],
    });
  }

  return entries;
}

function getDisInternetTopics(targetState = state) {
  const locationLabel = getDisInternetLocationLabel(targetState);
  const featuredMemeCoin = typeof getFeaturedMemeCoinSnapshot === "function"
    ? getFeaturedMemeCoinSnapshot(targetState)
    : null;
  const topicPool = [
    "물가",
    "증시",
    "환율",
    "알바",
    locationLabel,
    featuredMemeCoin?.label || null,
    featuredMemeCoin?.eventKicker || null,
    "실시간",
  ].filter(Boolean);

  return [...new Set(topicPool)].slice(0, 6);
}

function normalizeDisSearchQuery(query = "") {
  return String(query || "").trim();
}

function isDisGamblingQuery(query = "") {
  const normalized = normalizeDisSearchQuery(query).toLowerCase();
  return normalized
    ? DIS_GAMBLING_KEYWORDS.some((keyword) => normalized.includes(keyword))
    : false;
}

function createDisIllegalLinkEntry(query = "") {
  const normalized = normalizeDisSearchQuery(query);
  return {
    id: "illegal-gamble-link",
    kicker: "SHADOW LINK",
    title: normalized
      ? `${normalized} 관련 미러 주소 발견`
      : "사설 미러 주소 발견",
    body: "플레이스토어에 없는 사설 홀짝·사다리 링크입니다. 접속은 가능하지만 가끔 당첨금을 들고 사라집니다.",
    tone: "accent",
    tags: ["도박", "홀짝", "사다리", "먹튀", "사설"],
    route: DIS_GAMBLING_ROUTES.gamble,
    routeLabel: "접속",
  };
}

function getDisInternetSearchResults(query = "", targetState = state) {
  const normalizedQuery = normalizeDisSearchQuery(query);
  if (!normalizedQuery) {
    return [];
  }

  const tokens = normalizedQuery.toLowerCase().split(/\s+/).filter(Boolean);
  const results = getDisInternetFeedEntries(targetState)
    .filter((entry) => {
      const haystack = [
        entry.kicker,
        entry.title,
        entry.body,
        ...(entry.tags || []),
      ].join(" ").toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });

  const marketplaceEntry = typeof buildDiggleRouteSearchEntry === "function"
    ? buildDiggleRouteSearchEntry(normalizedQuery, targetState)
    : null;
  if (marketplaceEntry) {
    results.unshift(marketplaceEntry);
  }

  if (isDisGamblingQuery(normalizedQuery)) {
    results.unshift(createDisIllegalLinkEntry(normalizedQuery));
  }

  return results.slice(0, 6);
}

function getDisInternetSearchSummary(query = "", targetState = state) {
  const normalizedQuery = normalizeDisSearchQuery(query);
  if (!normalizedQuery) {
    return {
      kicker: "SEARCH",
      title: "검색어를 입력하세요",
      body: "물가, 증시, 환율, 다이스 코인처럼 궁금한 키워드를 바로 찾을 수 있습니다.",
      tone: "accent",
    };
  }

  if (isDisGamblingQuery(normalizedQuery)) {
    return {
      kicker: "SEARCH",
      title: `${normalizedQuery} 관련 숨은 링크 발견`,
      body: "검색 결과 사이에 플레이스토어 밖 사설 링크가 섞였습니다. 접속은 가능하지만 안전하지 않습니다.",
      tone: "fail",
    };
  }

  const results = getDisInternetSearchResults(normalizedQuery, targetState);
  if (!results.length) {
    return {
      kicker: "SEARCH",
      title: `${normalizedQuery} 결과 없음`,
      body: "다른 키워드로 다시 검색해 보세요.",
      tone: "fail",
    };
  }

  return {
    kicker: "SEARCH",
    title: `${normalizedQuery} 검색 결과 ${results.length}건`,
    body: results[0].body,
    tone: results[0].tone || "accent",
  };
}

function buildDisSearchResultsMarkup(query = "", targetState = state) {
  const normalizedQuery = normalizeDisSearchQuery(query);
  if (!normalizedQuery) {
    const featuredEntries = getDisInternetFeedEntries(targetState).slice(0, 3);
    if (!featuredEntries.length) {
      return '<div class="dis-search-empty">추천 이슈를 아직 불러오지 못했습니다.</div>';
    }

    return featuredEntries.map((entry) => buildPhoneAppCardMarkup({
      label: entry.kicker,
      title: entry.title,
      body: entry.body,
      tone: entry.tone || "",
    })).join("");
  }

  const results = getDisInternetSearchResults(normalizedQuery, targetState);
  if (!results.length) {
    return `<div class="dis-search-empty">"${escapePhoneAppHtml(normalizedQuery)}" 검색 결과가 없습니다. 다른 키워드로 다시 찾아보세요.</div>`;
  }

  return results.map((entry) => buildPhoneAppCardMarkup({
    label: entry.kicker,
    title: entry.title,
    body: entry.body,
    tone: entry.tone || "",
    actionsHtml: entry.route
      ? buildPhoneRouteButtonMarkup({
          route: entry.route,
          label: entry.routeLabel || "열기",
          className: "dis-illegal-link-btn",
        })
      : "",
  })).join("");
}

function buildDiggleSuggestionListMarkup(query = "", targetState = state) {
  const normalizedQuery = normalizeDisSearchQuery(query);
  if (!normalizedQuery) {
    return "";
  }

  const rawResults = getDisInternetSearchResults(normalizedQuery, targetState);
  const suggestionEntries = [];
  const seen = new Set();

  rawResults.forEach((entry) => {
    const label = entry.route
      ? (entry.title || "숨은 링크 열기")
      : (entry.title || `${normalizedQuery} 검색하기`);
    const key = `${entry.route ? "route" : "query"}:${entry.route || label}`;
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    suggestionEntries.push({
      type: entry.route ? "route" : "query",
      label,
      route: entry.route || "",
      query: entry.route ? "" : label.replace(" 검색하기", ""),
    });
  });

  const topicSuggestions = getDisInternetTopics(targetState)
    .map((topic) => ({
      type: "query",
      label: `${topic} 검색하기`,
      query: topic,
    }))
    .filter((entry) => entry.label.toLowerCase().includes(normalizedQuery.toLowerCase()));

  topicSuggestions.forEach((entry) => {
    const key = `query:${entry.query}`;
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    suggestionEntries.push(entry);
  });

  if (!suggestionEntries.length) {
    suggestionEntries.push({
      type: "query",
      label: `${normalizedQuery} 검색하기`,
      query: normalizedQuery,
    });
  }

  return `
    <div class="diggle-suggestions-box">
      <div class="diggle-suggestions-rule"></div>
      <ul class="diggle-suggestions-list">
        ${suggestionEntries.slice(0, 6).map((entry) => `
          <li>
            ${entry.type === "route"
              ? buildPhoneRouteButtonMarkup({
                  route: entry.route,
                  label: entry.label,
                  className: "diggle-suggestion-item is-route",
                })
              : buildPhoneAppActionButtonMarkup({
                  action: "dis-run-search",
                  label: entry.label,
                  data: { query: entry.query },
                  className: "diggle-suggestion-item",
                })}
          </li>
        `).join("")}
      </ul>
    </div>
  `;
}

function buildDiggleStatusMarkup(query = "", targetState = state) {
  const status = typeof getPhoneAppStatus === "function"
    ? getPhoneAppStatus("dis", targetState)
    : null;

  if (!status && !normalizeDisSearchQuery(query)) {
    return "";
  }

  const resolved = status || getDisInternetSearchSummary(query, targetState);
  return `
    <div class="diggle-status-box${resolved?.tone ? ` is-${escapePhoneAppHtml(resolved.tone)}` : ""}">
      <div class="diggle-status-title">${escapePhoneAppHtml(resolved?.title || "Diggle")}</div>
      <div class="diggle-status-body">${escapePhoneAppHtml(resolved?.body || "검색어를 입력해 주세요.")}</div>
    </div>
  `;
}

function getDiggleSearchHistoryEntries() {
  return typeof getDiggleHistoryRouteEntries === "function"
    ? getDiggleHistoryRouteEntries()
    : [
        {
          label: "도박",
          route: DIS_GAMBLING_ROUTES.gamble,
        },
        {
          label: "뉴스",
          route: "news/home",
        },
      ];
}

function buildDiggleSearchHistoryMarkup() {
  const historyEntries = getDiggleSearchHistoryEntries();
  if (!historyEntries.length) {
    return "";
  }

  return `
    <section class="diggle-history-box" aria-label="검색 기록">
      <div class="diggle-history-header">
        <span class="diggle-history-title">검색 기록</span>
      </div>
      <div class="diggle-history-list">
        ${historyEntries.map((entry) => buildPhoneRouteButtonMarkup({
          route: entry.route,
          label: entry.label,
          className: "diggle-history-chip",
        })).join("")}
      </div>
    </section>
  `;
}

function buildDisSearchScreenMarkup({ stageMode = false, targetState = state } = {}) {
  const currentQuery = normalizeDisSearchQuery(targetState.disSearchQuery || "");

  return `
    <div class="dis-app dis-browser-app diggle-app">
      <div class="diggle-topbar">
        <div class="diggle-top-links">
          <span>메일</span>
          <span>이미지</span>
        </div>
        <button class="diggle-login-btn" type="button">로그인</button>
      </div>

      <div class="diggle-main">
        <div class="diggle-logo" aria-label="Diggle">
          <span class="is-blue">D</span><span class="is-red">i</span><span class="is-yellow">g</span><span class="is-blue">g</span><span class="is-green">l</span><span class="is-red">e</span>
        </div>

        <section class="diggle-search-shell">
          <div class="diggle-search-bar${currentQuery ? " is-open" : ""}">
            <span class="diggle-search-icon">⌕</span>
            <input
              id="dis-search-input"
              class="diggle-search-input"
              type="search"
              value="${escapePhoneAppHtml(currentQuery)}"
              placeholder="Diggle 검색 또는 URL 입력"
              data-dis-search-input
              autocomplete="off"
            />
            <span class="diggle-search-mic">🎤</span>
          </div>
          ${buildDiggleSuggestionListMarkup(currentQuery, targetState)}
        </section>

        <div class="diggle-action-row">
          ${buildPhoneAppActionButtonMarkup({
            action: "dis-run-search",
            label: "Diggle 검색",
            className: "diggle-action-btn",
          })}
        </div>

        ${buildDiggleStatusMarkup(currentQuery, targetState)}
        ${buildDiggleSearchHistoryMarkup()}
      </div>

      <div class="diggle-footer">
        <div class="diggle-footer-links">
          <span>광고</span>
          <span>비즈니스</span>
          <span>Diggle 검색의 원리</span>
        </div>
        <div class="diggle-footer-links">
          <span>개인정보처리방침</span>
          <span>약관</span>
          <span>설정</span>
        </div>
      </div>
    </div>
  `;
}

function formatDisCommunityTimestamp(timestamp = 0) {
  const normalizedTimestamp = Math.max(0, Math.floor(Number(timestamp) || 0));
  if (!normalizedTimestamp) {
    return "";
  }

  const date = new Date(normalizedTimestamp);
  return `${date.getFullYear()}.${date.getMonth() + 1}.${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

const DIS_COMMUNITY_BEST_THRESHOLD = 5;

function buildDisCommunityRoute(screenId = "singularity") {
  const normalizedScreenId = String(screenId || "singularity").trim().toLowerCase() || "singularity";
  return `dis/${normalizedScreenId}`;
}

function buildDisCommunityConnectionBadgeMarkup(postCount = 0) {
  const connection = typeof getDisCommunityConnectionState === "function"
    ? getDisCommunityConnectionState()
    : { mode: "offline", statusLabel: "오프라인", detail: "실시간 미연결" };
  const dotClass = connection.mode === "live"
    ? " is-live"
    : connection.mode === "connecting"
      ? " is-connecting"
      : connection.mode === "error"
        ? " is-error"
        : "";

  return `
    <div class="dis-community-conn-row">
      <span class="dis-community-conn-dot${dotClass}"></span>
      <span class="dis-community-conn-text">${escapePhoneAppHtml(connection.statusLabel || "오프라인")}</span>
      ${postCount > 0 ? `<span class="dis-community-post-count">글 ${escapePhoneAppHtml(String(postCount))}개</span>` : ""}
    </div>
  `;
}

function buildDisCommunityCompactMarkup(targetState = state) {
  if (typeof ensureDisCommunityRealtime === "function") {
    ensureDisCommunityRealtime(targetState);
  }

  const posts = typeof getDisCommunityPosts === "function"
    ? getDisCommunityPosts().slice(0, 3)
    : [];

  return `
    <section class="dis-community-compact-shell">
      <div class="dis-community-compact-head">
        <div class="dis-community-compact-kicker">특이점갤 LIVE</div>
        <div class="dis-community-compact-title">특이점이 온다</div>
        <div class="dis-community-compact-note">최근 글 미리보기 · 펼치기에서 전체 목록·댓글 확인</div>
      </div>
      ${buildDisCommunityConnectionBadgeMarkup(posts.length)}
      <div class="dis-community-compact-list">
        ${posts.length
          ? posts.map((post) => `
            <button
              class="dis-community-compact-item"
              type="button"
              data-phone-action="dis-open-community-post-stage"
              data-post-id="${escapePhoneAppHtml(post.id)}"
            >
              <span class="dis-community-compact-item-title">${(post.likes || 0) >= DIS_COMMUNITY_BEST_THRESHOLD ? '<span class="dis-community-best-badge">개념</span> ' : ""}${escapePhoneAppHtml(post.title)}${post.comments?.length ? ` <span class="dis-community-compact-comment-count">[${post.comments.length}]</span>` : ""}</span>
              <span class="dis-community-compact-item-meta">${escapePhoneAppHtml(`${post.author} · 추천 ${post.likes || 0}`)}</span>
            </button>
          `).join("")
          : '<div class="dis-community-empty">아직 올라온 글이 없습니다.</div>'}
      </div>
      <div class="dis-community-compact-actions">
        ${buildPhoneAppActionButtonMarkup({
          action: "dis-open-community-stage",
          label: "갤러리 전체보기",
          className: "dis-community-compact-action is-primary",
        })}
        ${buildPhoneAppActionButtonMarkup({
          action: "dis-open-community-write-stage",
          label: "글쓰기",
          className: "dis-community-compact-action",
        })}
      </div>
    </section>
  `;
}

function buildDisCommunityPostRowMarkup(post) {
  const isBest = (post.likes || 0) >= DIS_COMMUNITY_BEST_THRESHOLD;
  const commentCount = post.comments?.length || 0;
  return `
    <button
      class="dis-community-post-row"
      type="button"
      data-phone-action="dis-open-community-post"
      data-post-id="${escapePhoneAppHtml(post.id)}"
    >
      <div class="dis-community-post-title-row">
        ${isBest ? '<span class="dis-community-best-badge">개념</span>' : ""}
        <span class="dis-community-post-title">${escapePhoneAppHtml(post.title)}</span>
        ${commentCount > 0 ? `<span class="dis-community-post-comment-count">[${escapePhoneAppHtml(String(commentCount))}]</span>` : ""}
      </div>
      <div class="dis-community-post-meta-row">
        <span>${escapePhoneAppHtml(post.author)}</span>
        <span>${escapePhoneAppHtml(formatDisCommunityTimestamp(post.createdAt))}</span>
        <span class="is-views">조회 ${escapePhoneAppHtml(String(post.views || 0))}</span>
        <span class="is-likes">추천 ${escapePhoneAppHtml(String(post.likes || 0))}</span>
      </div>
    </button>
  `;
}

function buildDisCommunityListStageMarkup(targetState = state) {
  if (typeof ensureDisCommunityRealtime === "function") {
    ensureDisCommunityRealtime(targetState);
  }

  const posts = typeof getDisCommunityPosts === "function"
    ? getDisCommunityPosts()
    : [];

  const activeTab = targetState?.disCommunity?.tab === "best" ? "best" : "all";
  const bestPosts = posts.filter((p) => (p.likes || 0) >= DIS_COMMUNITY_BEST_THRESHOLD);
  const displayPosts = activeTab === "best" ? bestPosts : posts;

  const bestSectionMarkup = activeTab === "all" && bestPosts.length > 0
    ? `
      <div class="dis-community-best-section">
        <div class="dis-community-best-header">🔥 개념글</div>
        ${bestPosts.slice(0, 3).map((post) => `
          <button
            class="dis-community-best-row"
            type="button"
            data-phone-action="dis-open-community-post"
            data-post-id="${escapePhoneAppHtml(post.id)}"
          >
            <span class="dis-community-best-title">${escapePhoneAppHtml(post.title)}</span>
            <span class="dis-community-best-likes">추천 ${escapePhoneAppHtml(String(post.likes || 0))}</span>
          </button>
        `).join("")}
      </div>
    `
    : "";

  return `
    <div class="dis-community-shell">
      <div class="dis-community-topbar">
        <div class="dis-community-topbar-title">특이점이 온다 갤러리</div>
        <div class="dis-community-topbar-actions">
          ${buildPhoneRouteButtonMarkup({
            route: DIS_GAMBLING_ROUTES.singularityWrite,
            label: "글쓰기",
            className: "dis-community-header-btn",
          })}
          ${buildPhoneRouteButtonMarkup({
            route: DIS_GAMBLING_ROUTES.home,
            label: "홈",
            className: "dis-community-header-btn",
          })}
        </div>
      </div>

      ${buildDisCommunityConnectionBadgeMarkup(posts.length)}

      <div class="dis-community-tabs" role="tablist">
        ${buildPhoneAppActionButtonMarkup({
          action: "dis-switch-community-tab",
          label: "전체글",
          data: { tab: "all" },
          className: `dis-community-tab${activeTab === "all" ? " is-active" : ""}`,
        })}
        ${buildPhoneAppActionButtonMarkup({
          action: "dis-switch-community-tab",
          label: `개념글${bestPosts.length > 0 ? ` (${bestPosts.length})` : ""}`,
          data: { tab: "best" },
          className: `dis-community-tab${activeTab === "best" ? " is-active" : ""}`,
        })}
      </div>

      <div class="dis-community-board">
        ${bestSectionMarkup}
        <div class="dis-community-post-list">
          ${displayPosts.length
            ? displayPosts.map((post) => buildDisCommunityPostRowMarkup(post)).join("")
            : `<div class="dis-community-empty">${activeTab === "best" ? "아직 개념글이 없습니다. (추천 ${DIS_COMMUNITY_BEST_THRESHOLD}개 이상)" : "아직 올라온 글이 없습니다. 첫 글을 남겨보세요."}</div>`}
        </div>
      </div>
    </div>
  `;
}

function buildDisCommunityReadStageMarkup(targetState = state) {
  if (typeof ensureDisCommunityRealtime === "function") {
    ensureDisCommunityRealtime(targetState);
  }

  const selectedPostId = targetState?.disCommunity?.selectedPostId || "";
  const post = typeof getDisCommunityPostById === "function"
    ? getDisCommunityPostById(selectedPostId)
    : null;

  if (!post) {
    return `
      <div class="dis-community-shell">
        <div class="dis-community-topbar">
          <div class="dis-community-topbar-title">특이점이 온다 갤러리</div>
          <div class="dis-community-topbar-actions">
            ${buildPhoneRouteButtonMarkup({
              route: DIS_GAMBLING_ROUTES.singularity,
              label: "목록",
              className: "dis-community-header-btn",
            })}
          </div>
        </div>
        <div class="dis-community-empty">게시글을 찾지 못했습니다. 목록으로 돌아가서 다시 선택해 주세요.</div>
      </div>
    `;
  }

  const isBest = (post.likes || 0) >= DIS_COMMUNITY_BEST_THRESHOLD;
  const likedToday = typeof hasDisCommunityLikedToday === "function"
    ? hasDisCommunityLikedToday(post.id)
    : false;

  return `
    <div class="dis-community-shell">
      <div class="dis-community-topbar">
        <div class="dis-community-topbar-title">특이점이 온다 갤러리</div>
        <div class="dis-community-topbar-actions">
          ${buildPhoneRouteButtonMarkup({
            route: DIS_GAMBLING_ROUTES.singularity,
            label: "목록",
            className: "dis-community-header-btn",
          })}
          ${buildPhoneRouteButtonMarkup({
            route: DIS_GAMBLING_ROUTES.singularityWrite,
            label: "글쓰기",
            className: "dis-community-header-btn",
          })}
        </div>
      </div>

      ${buildDisCommunityConnectionBadgeMarkup()}

      <div class="dis-community-read-shell">
        <div class="dis-community-read-head">
          <div class="dis-community-read-title">
            ${isBest ? '<span class="dis-community-best-badge">개념</span> ' : ""}${escapePhoneAppHtml(post.title)}
          </div>
          <div class="dis-community-read-meta">
            <span>${escapePhoneAppHtml(post.author)}</span>
            <span>${escapePhoneAppHtml(formatDisCommunityTimestamp(post.createdAt))}</span>
            <span>조회 ${escapePhoneAppHtml(String(post.views || 0))}</span>
            <span>추천 ${escapePhoneAppHtml(String(post.likes || 0))}</span>
          </div>
        </div>
        <div class="dis-community-read-body">${escapePhoneAppHtml(post.content).replaceAll("\n", "<br />")}</div>
        <div class="dis-community-read-actions">
          ${buildPhoneAppActionButtonMarkup({
            action: "dis-like-community-post",
            disabled: likedToday,
            label: `👍 추천 ${post.likes || 0}`,
            data: { postId: post.id },
            className: "dis-community-action-btn is-primary",
          })}
          ${buildPhoneRouteButtonMarkup({
            route: DIS_GAMBLING_ROUTES.singularityWrite,
            label: "글쓰기",
            className: "dis-community-action-btn",
          })}
        </div>

        <section class="dis-community-comment-block">
          <div class="dis-community-comment-head">댓글 ${escapePhoneAppHtml(String(post.comments?.length || 0))}개</div>
          <div class="dis-community-comment-list">
            ${post.comments?.length
              ? post.comments.map((comment) => `
                <div class="dis-community-comment-item">
                  <div class="dis-community-comment-meta">
                    <span>${escapePhoneAppHtml(comment.author)}</span>
                    <span>${escapePhoneAppHtml(formatDisCommunityTimestamp(comment.createdAt))}</span>
                  </div>
                  <div class="dis-community-comment-body">${escapePhoneAppHtml(comment.content).replaceAll("\n", "<br />")}</div>
                </div>
              `).join("")
              : '<div class="dis-community-empty is-comment">아직 댓글이 없습니다.</div>'}
          </div>
          <div class="dis-community-form">
            <input
              class="dis-community-input"
              type="text"
              value="${escapePhoneAppHtml(targetState?.disCommunity?.commentDraft?.author || "")}"
              placeholder="닉네임"
              data-dis-community-input="comment-author"
            />
            <textarea
              class="dis-community-textarea is-comment"
              rows="3"
              placeholder="댓글을 남겨보세요"
              data-dis-community-input="comment-content"
            >${escapePhoneAppHtml(targetState?.disCommunity?.commentDraft?.content || "")}</textarea>
            ${buildPhoneAppActionButtonMarkup({
              action: "dis-submit-community-comment",
              label: "댓글 등록",
              data: { postId: post.id },
              className: "dis-community-submit-btn",
            })}
          </div>
        </section>
      </div>
    </div>
  `;
}

function buildDisCommunityWriteStageMarkup(targetState = state) {
  if (typeof ensureDisCommunityRealtime === "function") {
    ensureDisCommunityRealtime(targetState);
  }

  return `
    <div class="dis-community-shell">
      <div class="dis-community-topbar">
        <div class="dis-community-topbar-title">글쓰기</div>
        <div class="dis-community-topbar-actions">
          ${buildPhoneRouteButtonMarkup({
            route: DIS_GAMBLING_ROUTES.singularity,
            label: "목록",
            className: "dis-community-header-btn",
          })}
        </div>
      </div>

      ${buildDisCommunityConnectionBadgeMarkup()}

      <div class="dis-community-form is-write">
        <input
          class="dis-community-input"
          type="text"
          value="${escapePhoneAppHtml(targetState?.disCommunity?.draft?.author || "")}"
          placeholder="닉네임"
          data-dis-community-input="author"
        />
        <input
          class="dis-community-input"
          type="text"
          value="${escapePhoneAppHtml(targetState?.disCommunity?.draft?.title || "")}"
          placeholder="제목"
          data-dis-community-input="title"
        />
        <textarea
          class="dis-community-textarea"
          rows="9"
          placeholder="내용을 입력하세요"
          data-dis-community-input="content"
        >${escapePhoneAppHtml(targetState?.disCommunity?.draft?.content || "")}</textarea>
        ${buildPhoneAppActionButtonMarkup({
          action: "dis-submit-community-post",
          label: "실시간 글 등록",
          className: "dis-community-submit-btn is-primary",
        })}
      </div>
    </div>
  `;
}

function buildDisCommunityListStageMarkup(targetState = state) {
  if (typeof ensureDisCommunityRealtime === "function") {
    ensureDisCommunityRealtime(targetState);
  }

  const posts = typeof getDisCommunityPosts === "function"
    ? getDisCommunityPosts()
    : [];

  const activeTab = targetState?.disCommunity?.tab === "best" ? "best" : "all";
  const bestPosts = posts.filter((p) => (p.likes || 0) >= DIS_COMMUNITY_BEST_THRESHOLD);
  const displayPosts = activeTab === "best" ? bestPosts : posts;

  const bestSectionMarkup = activeTab === "all" && bestPosts.length > 0
    ? `
      <div class="dis-community-best-section">
        <div class="dis-community-best-header">개념글</div>
        ${bestPosts.slice(0, 3).map((post) => `
          <button
            class="dis-community-best-row"
            type="button"
            data-phone-action="dis-open-community-post"
            data-post-id="${escapePhoneAppHtml(post.id)}"
          >
            <span class="dis-community-best-title">${escapePhoneAppHtml(post.title)}</span>
            <span class="dis-community-best-likes">추천 ${escapePhoneAppHtml(String(post.likes || 0))}</span>
          </button>
        `).join("")}
      </div>
    `
    : "";

  return `
    <div class="dis-community-shell">
      <div class="dis-community-topbar">
        <div class="dis-community-topbar-title">특이점이 온다 갤러리</div>
        <div class="dis-community-topbar-actions">
          ${buildPhoneAppActionButtonMarkup({
            action: "dis-open-community-write-stage",
            label: "글쓰기",
            className: "dis-community-header-btn",
          })}
          ${buildPhoneRouteButtonMarkup({
            route: DIS_GAMBLING_ROUTES.home,
            label: "홈",
            className: "dis-community-header-btn",
          })}
        </div>
      </div>

      ${buildDisCommunityConnectionBadgeMarkup(posts.length)}

      <div class="dis-community-tabs" role="tablist">
        ${buildPhoneAppActionButtonMarkup({
          action: "dis-switch-community-tab",
          label: "전체글",
          data: { tab: "all" },
          className: `dis-community-tab${activeTab === "all" ? " is-active" : ""}`,
        })}
        ${buildPhoneAppActionButtonMarkup({
          action: "dis-switch-community-tab",
          label: `개념글${bestPosts.length > 0 ? ` (${bestPosts.length})` : ""}`,
          data: { tab: "best" },
          className: `dis-community-tab${activeTab === "best" ? " is-active" : ""}`,
        })}
      </div>

      <div class="dis-community-board">
        ${bestSectionMarkup}
        <div class="dis-community-post-list">
          ${displayPosts.length
            ? displayPosts.map((post) => buildDisCommunityPostRowMarkup(post)).join("")
            : `<div class="dis-community-empty">${activeTab === "best" ? `아직 개념글이 없습니다. (추천 ${DIS_COMMUNITY_BEST_THRESHOLD}개 이상)` : "아직 올라온 글이 없습니다. 첫 글을 남겨보세요."}</div>`}
        </div>
      </div>
    </div>
  `;
}

function buildDisCommunityReadStageMarkup(targetState = state) {
  if (typeof ensureDisCommunityRealtime === "function") {
    ensureDisCommunityRealtime(targetState);
  }

  const selectedPostId = targetState?.disCommunity?.selectedPostId || "";
  const post = typeof getDisCommunityPostById === "function"
    ? getDisCommunityPostById(selectedPostId)
    : null;

  if (!post) {
    return `
      <div class="dis-community-shell">
        <div class="dis-community-topbar">
          <div class="dis-community-topbar-title">특이점이 온다 갤러리</div>
          <div class="dis-community-topbar-actions">
            ${buildPhoneRouteButtonMarkup({
              route: DIS_GAMBLING_ROUTES.singularity,
              label: "목록",
              className: "dis-community-header-btn",
            })}
          </div>
        </div>
        <div class="dis-community-empty">게시글을 찾지 못했습니다. 목록으로 돌아가 다시 선택해 주세요.</div>
      </div>
    `;
  }

  const isBest = (post.likes || 0) >= DIS_COMMUNITY_BEST_THRESHOLD;
  const likedToday = typeof hasDisCommunityLikedToday === "function"
    ? hasDisCommunityLikedToday(post.id)
    : false;
  const canManagePost = typeof canDisCommunityRequestPostManagement === "function"
    ? canDisCommunityRequestPostManagement(post)
    : false;
  const guestOwned = typeof isDisCommunityGuestOwnedPost === "function"
    ? isDisCommunityGuestOwnedPost(post)
    : false;
  const showGuestCommentPinInput = typeof getDisCommunityOwnershipMode === "function"
    ? getDisCommunityOwnershipMode() !== "account"
    : true;

  return `
    <div class="dis-community-shell">
      <div class="dis-community-topbar">
        <div class="dis-community-topbar-title">특이점이 온다 갤러리</div>
        <div class="dis-community-topbar-actions">
          ${buildPhoneRouteButtonMarkup({
            route: DIS_GAMBLING_ROUTES.singularity,
            label: "목록",
            className: "dis-community-header-btn",
          })}
          ${buildPhoneAppActionButtonMarkup({
            action: "dis-open-community-write-stage",
            label: "글쓰기",
            className: "dis-community-header-btn",
          })}
        </div>
      </div>

      ${buildDisCommunityConnectionBadgeMarkup()}

      <div class="dis-community-read-shell">
        <div class="dis-community-read-head">
          <div class="dis-community-read-title">
            ${isBest ? '<span class="dis-community-best-badge">개념</span> ' : ""}${escapePhoneAppHtml(post.title)}
          </div>
          <div class="dis-community-read-meta">
            <span>${escapePhoneAppHtml(post.author)}</span>
            <span>${escapePhoneAppHtml(formatDisCommunityTimestamp(post.createdAt))}</span>
            <span>조회 ${escapePhoneAppHtml(String(post.views || 0))}</span>
            <span>추천 ${escapePhoneAppHtml(String(post.likes || 0))}</span>
          </div>
        </div>
        <div class="dis-community-read-body">${escapePhoneAppHtml(post.content).replaceAll("\n", "<br />")}</div>
        <div class="dis-community-read-actions">
          ${buildPhoneAppActionButtonMarkup({
            action: "dis-like-community-post",
            disabled: likedToday,
            label: `👍 추천 ${post.likes || 0}`,
            data: { postId: post.id },
            className: "dis-community-action-btn is-primary",
          })}
          ${canManagePost ? buildPhoneAppActionButtonMarkup({
            action: "dis-edit-community-post",
            label: "수정",
            data: { postId: post.id },
            className: "dis-community-action-btn",
          }) : ""}
          ${canManagePost ? buildPhoneAppActionButtonMarkup({
            action: "dis-delete-community-post",
            label: "삭제",
            data: { postId: post.id },
            className: "dis-community-action-btn is-danger",
          }) : ""}
          ${buildPhoneAppActionButtonMarkup({
            action: "dis-open-community-write-stage",
            label: "글쓰기",
            className: "dis-community-action-btn",
          })}
        </div>
        ${guestOwned
          ? '<div class="dis-community-manage-note">게스트 글 수정/삭제는 비밀번호 4자리가 필요하다.</div>'
          : ""}

        <section class="dis-community-comment-block">
          <div class="dis-community-comment-head">댓글 ${escapePhoneAppHtml(String(post.comments?.length || 0))}개</div>
          <div class="dis-community-comment-list">
            ${post.comments?.length
              ? post.comments.map((comment) => `
                <div class="dis-community-comment-item">
                  <div class="dis-community-comment-meta">
                    <span>${escapePhoneAppHtml(comment.author)}</span>
                    <span>${escapePhoneAppHtml(formatDisCommunityTimestamp(comment.createdAt))}</span>
                  </div>
                  <div class="dis-community-comment-body">${escapePhoneAppHtml(comment.content).replaceAll("\n", "<br />")}</div>
                </div>
              `).join("")
              : '<div class="dis-community-empty is-comment">아직 댓글이 없습니다.</div>'}
          </div>
          <div class="dis-community-form">
            <div class="dis-community-inline-row">
              <input
                class="dis-community-input is-inline-main"
              type="text"
              value="${escapePhoneAppHtml(targetState?.disCommunity?.commentDraft?.author || "")}"
              placeholder="닉네임"
              data-dis-community-input="comment-author"
              />
              ${showGuestCommentPinInput ? `
                <input
                  class="dis-community-input is-inline-side"
                  type="password"
                  inputmode="numeric"
                  maxlength="4"
                  value="${escapePhoneAppHtml(targetState?.disCommunity?.commentDraft?.guestPin || "")}"
                  placeholder="비밀번호 4자리"
                  data-dis-community-input="comment-guest-pin"
                />
              ` : ""}
            </div>
            <textarea
              class="dis-community-textarea is-comment"
              rows="3"
              placeholder="댓글을 남겨보세요"
              data-dis-community-input="comment-content"
            >${escapePhoneAppHtml(targetState?.disCommunity?.commentDraft?.content || "")}</textarea>
            ${buildPhoneAppActionButtonMarkup({
              action: "dis-submit-community-comment",
              label: "댓글 등록",
              data: { postId: post.id },
              className: "dis-community-submit-btn",
            })}
          </div>
        </section>
      </div>
    </div>
  `;
}

function buildDisCommunityWriteStageMarkup(targetState = state) {
  if (typeof ensureDisCommunityRealtime === "function") {
    ensureDisCommunityRealtime(targetState);
  }

  const editingPostId = String(targetState?.disCommunity?.editingPostId || "").trim();
  const showGuestPinInput = !editingPostId
    && (typeof getDisCommunityOwnershipMode === "function"
      ? getDisCommunityOwnershipMode() !== "account"
      : true);

  return `
    <div class="dis-community-shell">
      <div class="dis-community-topbar">
        <div class="dis-community-topbar-title">${editingPostId ? "글 수정" : "글쓰기"}</div>
        <div class="dis-community-topbar-actions">
          ${buildPhoneRouteButtonMarkup({
            route: DIS_GAMBLING_ROUTES.singularity,
            label: "목록",
            className: "dis-community-header-btn",
          })}
        </div>
      </div>

      ${buildDisCommunityConnectionBadgeMarkup()}

      <div class="dis-community-form is-write">
        <div class="dis-community-inline-row">
          <input
            class="dis-community-input is-inline-main"
          type="text"
          value="${escapePhoneAppHtml(targetState?.disCommunity?.draft?.author || "")}"
          placeholder="닉네임"
          data-dis-community-input="author"
          />
          ${showGuestPinInput ? `
            <input
              class="dis-community-input is-inline-side"
              type="password"
              inputmode="numeric"
              maxlength="4"
              value="${escapePhoneAppHtml(targetState?.disCommunity?.draft?.guestPin || "")}"
              placeholder="비밀번호 4자리"
              data-dis-community-input="guest-pin"
            />
          ` : ""}
        </div>
        <input
          class="dis-community-input"
          type="text"
          value="${escapePhoneAppHtml(targetState?.disCommunity?.draft?.title || "")}"
          placeholder="제목"
          data-dis-community-input="title"
        />
        <textarea
          class="dis-community-textarea"
          rows="9"
          placeholder="내용을 입력하세요"
          data-dis-community-input="content"
        >${escapePhoneAppHtml(targetState?.disCommunity?.draft?.content || "")}</textarea>
        ${false ? `
          <input
            class="dis-community-input"
            type="password"
            inputmode="numeric"
            maxlength="4"
            value="${escapePhoneAppHtml(targetState?.disCommunity?.draft?.guestPin || "")}"
            placeholder="게스트 비밀번호 4자리"
            data-dis-community-input="guest-pin"
          />
        ` : ""}
        ${buildPhoneAppActionButtonMarkup({
          action: "dis-submit-community-post",
          label: editingPostId ? "수정 반영" : "실시간 글 등록",
          className: "dis-community-submit-btn is-primary",
        })}
      </div>
    </div>
  `;
}

function buildDisCommunityScreenMarkup({ stageMode = false, screenId = "singularity", targetState = state } = {}) {
  if (!stageMode) {
    return buildDisCommunityCompactMarkup(targetState);
  }

  if (screenId === "singularity-read") {
    return buildDisCommunityReadStageMarkup(targetState);
  }

  if (screenId === "singularity-write") {
    return buildDisCommunityWriteStageMarkup(targetState);
  }

  return buildDisCommunityListStageMarkup(targetState);
}

function getDisGambleDraftValue(gameId = "odd-even", targetState = state) {
  const drafts = targetState?.disGambleDrafts && typeof targetState.disGambleDrafts === "object"
    ? targetState.disGambleDrafts
    : null;
  const fallback = gameId === "ladder" ? "5000" : "1000";
  return escapePhoneAppHtml(String(drafts?.[gameId] || fallback));
}

function buildDisGambleNavMarkup(activeRoute = DIS_GAMBLING_ROUTES.gamble) {
  const navItems = [
    { route: DIS_GAMBLING_ROUTES.gamble, label: "로비" },
    { route: DIS_GAMBLING_ROUTES.oddEven, label: "홀짝" },
    { route: DIS_GAMBLING_ROUTES.ladder, label: "사다리" },
  ];

  return `
    <div class="dis-gamble-nav">
      ${navItems.map((item) => `
        <button
          class="dis-gamble-nav-btn ${activeRoute === item.route ? "is-active" : ""}"
          type="button"
          data-phone-route="${escapePhoneAppHtml(item.route)}"
        >${escapePhoneAppHtml(item.label)}</button>
      `).join("")}
    </div>
  `;
}

function buildDisGambleHeroMarkup({
  title = "사설 미러 링크",
  subtitle = "",
  balance = 0,
  status = "불안정",
} = {}) {
  return `
    <section class="dis-gamble-hero">
      <div class="dis-gamble-hero-copy">
        <span class="dis-gamble-hero-kicker">NEON SHADOW</span>
        <strong class="dis-gamble-hero-title">${escapePhoneAppHtml(title)}</strong>
        ${subtitle ? `<span class="dis-gamble-hero-body">${escapePhoneAppHtml(subtitle)}</span>` : ""}
      </div>
      <div class="dis-gamble-hero-pills">
        <div class="dis-gamble-pill is-balance">
          <span class="dis-gamble-pill-label">보유 현금</span>
          <strong class="dis-gamble-pill-value">${escapePhoneAppHtml(formatMoney(balance))}</strong>
        </div>
        <div class="dis-gamble-pill is-status">
          <span class="dis-gamble-pill-label">링크 상태</span>
          <strong class="dis-gamble-pill-value">${escapePhoneAppHtml(status)}</strong>
        </div>
      </div>
    </section>
  `;
}

function buildDisGambleHubScreenMarkup({ stageMode = false, targetState = state } = {}) {
  const balance = typeof getWalletBalance === "function"
    ? getWalletBalance(targetState)
    : targetState.money;

  return `
    <div class="dis-app dis-gamble-app">
      ${buildPhoneAppScreenHeaderMarkup({
        title: "사설 미러 링크",
        showHomeButton: !stageMode,
        homeButtonLabel: "검색",
      })}
      ${buildDisGambleHeroMarkup({
        title: "네온 미러 로비",
        balance,
      })}
      ${buildDisGambleNavMarkup(DIS_GAMBLING_ROUTES.gamble)}
      ${buildPhoneAppStatusMarkup("dis", buildPhoneAppCardMarkup({
        title: "조용한 접속",
        tone: "accent",
      }))}

      <div class="dis-gamble-route-list">
        <button class="dis-gamble-route-card" type="button" data-phone-route="${DIS_GAMBLING_ROUTES.oddEven}">
          <span class="dis-gamble-route-kicker">ODD / EVEN</span>
          <strong class="dis-gamble-route-title">홀짝</strong>
          <span class="dis-gamble-route-meta">즉시 정산 · 2.0x</span>
        </button>

        <button class="dis-gamble-route-card is-ladder" type="button" data-phone-route="${DIS_GAMBLING_ROUTES.ladder}">
          <span class="dis-gamble-route-kicker">LADDER</span>
          <strong class="dis-gamble-route-title">사다리</strong>
          <span class="dis-gamble-route-meta">3줄 선택 · 2.4x</span>
        </button>
      </div>
    </div>
  `;
}

function buildDisOddEvenScreenMarkup({ stageMode = false, targetState = state } = {}) {
  const balance = typeof getWalletBalance === "function"
    ? getWalletBalance(targetState)
    : targetState.money;

  return `
    <div class="dis-app dis-gamble-app">
      ${buildPhoneAppScreenHeaderMarkup({
        title: "홀짝",
        showHomeButton: !stageMode,
        homeButtonLabel: "검색",
      })}
      ${buildDisGambleHeroMarkup({
        title: "홀짝 게임",
        balance,
        status: "즉시 정산",
      })}
      ${buildDisGambleNavMarkup(DIS_GAMBLING_ROUTES.oddEven)}
      ${buildPhoneAppStatusMarkup("dis")}

      <section class="dis-gamble-panel">
        <div class="dis-gamble-board is-odd-even">
          <div class="dis-gamble-board-icon">🎲</div>
          <div class="dis-gamble-board-copy">
            <div class="dis-gamble-board-title">홀짝 즉시 추첨</div>
          </div>
          <div class="dis-gamble-board-badges">
            <span class="dis-gamble-board-badge">배당 2.0x</span>
            <span class="dis-gamble-board-badge is-risk">먹튀 주의</span>
          </div>
        </div>
        <div class="dis-gamble-panel-top">
          <span class="dis-gamble-panel-label">현재 현금</span>
          <strong class="dis-gamble-panel-value">${escapePhoneAppHtml(formatMoney(balance))}</strong>
        </div>
        <label class="dis-gamble-input-wrap" for="dis-odd-even-bet">
          <span class="dis-gamble-input-label">베팅 금액</span>
          <input
            id="dis-odd-even-bet"
            class="dis-gamble-input"
            type="number"
            min="1000"
            step="1000"
            inputmode="numeric"
            placeholder="1000"
            value="${getDisGambleDraftValue("odd-even", targetState)}"
            data-dis-gamble-input="odd-even"
          />
        </label>
        <div class="dis-gamble-quick-row">
          ${[
            { amount: 1000, label: "1천" },
            { amount: 5000, label: "5천" },
            { amount: 10000, label: "1만" },
            { amount: 30000, label: "3만" },
          ].map((entry) => buildPhoneAppActionButtonMarkup({
            action: "dis-set-gamble-bet",
            label: entry.label,
            data: { gameId: "odd-even", amount: entry.amount },
            className: "dis-gamble-quick-btn",
          })).join("")}
        </div>
        <div class="dis-gamble-choice-row">
          <button class="dis-gamble-choice-btn" type="button" data-phone-action="dis-play-odd-even" data-choice="odd">
            <span class="dis-gamble-choice-main">홀</span>
            <span class="dis-gamble-choice-sub">1 · 3 · 5</span>
          </button>
          <button class="dis-gamble-choice-btn is-even" type="button" data-phone-action="dis-play-odd-even" data-choice="even">
            <span class="dis-gamble-choice-main">짝</span>
            <span class="dis-gamble-choice-sub">2 · 4 · 6</span>
          </button>
        </div>
      </section>

    </div>
  `;
}

function buildDisLadderScreenMarkup({ stageMode = false, targetState = state } = {}) {
  const balance = typeof getWalletBalance === "function"
    ? getWalletBalance(targetState)
    : targetState.money;

  return `
    <div class="dis-app dis-gamble-app">
      ${buildPhoneAppScreenHeaderMarkup({
        title: "사다리",
        showHomeButton: !stageMode,
        homeButtonLabel: "검색",
      })}
      ${buildDisGambleHeroMarkup({
        title: "사다리 게임",
        balance,
        status: "고변동",
      })}
      ${buildDisGambleNavMarkup(DIS_GAMBLING_ROUTES.ladder)}
      ${buildPhoneAppStatusMarkup("dis")}

      <section class="dis-gamble-panel">
        <div class="dis-gamble-board is-ladder">
          <div class="dis-gamble-ladder-visual">
            <span>좌</span>
            <span>중</span>
            <span>우</span>
            <span>│╲│</span>
            <span>│╱│</span>
            <span>│╲│</span>
          </div>
          <div class="dis-gamble-board-copy">
            <div class="dis-gamble-board-title">사다리 즉시 정산</div>
          </div>
          <div class="dis-gamble-board-badges">
            <span class="dis-gamble-board-badge">배당 2.4x</span>
            <span class="dis-gamble-board-badge is-risk">고액 위험</span>
          </div>
        </div>
        <div class="dis-gamble-panel-top">
          <span class="dis-gamble-panel-label">현재 현금</span>
          <strong class="dis-gamble-panel-value">${escapePhoneAppHtml(formatMoney(balance))}</strong>
        </div>
        <label class="dis-gamble-input-wrap" for="dis-ladder-bet">
          <span class="dis-gamble-input-label">베팅 금액</span>
          <input
            id="dis-ladder-bet"
            class="dis-gamble-input"
            type="number"
            min="1000"
            step="1000"
            inputmode="numeric"
            placeholder="1000"
            value="${getDisGambleDraftValue("ladder", targetState)}"
            data-dis-gamble-input="ladder"
          />
        </label>
        <div class="dis-gamble-quick-row">
          ${[
            { amount: 1000, label: "1천" },
            { amount: 5000, label: "5천" },
            { amount: 10000, label: "1만" },
            { amount: 30000, label: "3만" },
          ].map((entry) => buildPhoneAppActionButtonMarkup({
            action: "dis-set-gamble-bet",
            label: entry.label,
            data: { gameId: "ladder", amount: entry.amount },
            className: "dis-gamble-quick-btn",
          })).join("")}
        </div>
        <div class="dis-gamble-choice-row is-ladder">
          <button class="dis-gamble-choice-btn" type="button" data-phone-action="dis-play-ladder" data-lane="left">
            <span class="dis-gamble-choice-main">좌</span>
            <span class="dis-gamble-choice-sub">LEFT</span>
          </button>
          <button class="dis-gamble-choice-btn is-even" type="button" data-phone-action="dis-play-ladder" data-lane="center">
            <span class="dis-gamble-choice-main">중</span>
            <span class="dis-gamble-choice-sub">CENTER</span>
          </button>
          <button class="dis-gamble-choice-btn is-ladder" type="button" data-phone-action="dis-play-ladder" data-lane="right">
            <span class="dis-gamble-choice-main">우</span>
            <span class="dis-gamble-choice-sub">RIGHT</span>
          </button>
        </div>
      </section>

    </div>
  `;
}

function getDisAppManifest(targetState = state) {
  return {
    id: "dis",
    label: "디시인사이드",
    icon: "💬",
    openRoute: DIS_GAMBLING_ROUTES.singularity,
    screenMode: "fullbleed",
    installable: false,
    isAvailable: () => (
      typeof canUsePhoneApps === "function"
        ? canUsePhoneApps(targetState)
        : true
    ),
    buildScreenMarkup: ({ stageMode = false, screenId = "home" } = {}) => {
      if (screenId === "singularity" || screenId === "singularity-read" || screenId === "singularity-write") {
        return buildDisCommunityScreenMarkup({ stageMode, screenId, targetState });
      }

      if (screenId === "gamble") {
        return buildDisGambleHubScreenMarkup({ stageMode, targetState });
      }

      if (screenId === "gamble-odd-even") {
        return buildDisOddEvenScreenMarkup({ stageMode, targetState });
      }

      if (screenId === "gamble-ladder") {
        return buildDisLadderScreenMarkup({ stageMode, targetState });
      }

      return buildDisSearchScreenMarkup({ stageMode, targetState });
    },
  };
}
