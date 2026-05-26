const DIS_COMMUNITY_APP_ID_STORAGE_KEY = "mammoncity.firebaseAppId";
const DIS_COMMUNITY_IDENTITY_STORAGE_KEY = "mammoncity.disCommunityIdentityKey";
const DIS_COMMUNITY_LIKE_HISTORY_STORAGE_KEY = "mammoncity.disCommunityLikeHistory";
const DIS_COMMUNITY_COLLECTION_ID = "dcSingularityPosts";
const DIS_COMMUNITY_MAX_POSTS = 40;
let disCommunityAuthPromise = null;
let disCommunityRealtimeStarted = false;
let disCommunityRealtimeUnsubscribe = null;
let disCommunityCachedPosts = [];
let disCommunityConnectionState = {
  mode: "offline",
  live: false,
  ready: false,
  statusLabel: "오프라인 미리보기",
  detail: "Firebase 연결 전",
  userId: "",
};

function createDisCommunityIdentityKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `diggle:${crypto.randomUUID()}`;
  }

  return `diggle:${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function getDisCommunityIdentityKey() {
  if (typeof localStorage === "undefined") {
    return "";
  }

  const storedKey = String(localStorage.getItem(DIS_COMMUNITY_IDENTITY_STORAGE_KEY) || "").trim();
  if (storedKey) {
    return storedKey;
  }

  const generatedKey = createDisCommunityIdentityKey();
  try {
    localStorage.setItem(DIS_COMMUNITY_IDENTITY_STORAGE_KEY, generatedKey);
  } catch (error) {
    console.warn("[dis-community] identity 저장 실패:", error);
  }
  return generatedKey;
}

function getDisCommunityTodayKey() {
  try {
    return new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch (error) {
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const seoulTime = new Date(utcTime + (9 * 60 * 60 * 1000));
    const year = seoulTime.getFullYear();
    const month = String(seoulTime.getMonth() + 1).padStart(2, "0");
    const day = String(seoulTime.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

function getDisCommunityLikeHistory() {
  if (typeof localStorage === "undefined") {
    return {};
  }

  try {
    const rawValue = localStorage.getItem(DIS_COMMUNITY_LIKE_HISTORY_STORAGE_KEY);
    if (!rawValue) {
      return {};
    }

    const parsed = JSON.parse(rawValue);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return parsed;
  } catch (error) {
    console.warn("[dis-community] 추천 기록 파싱 실패:", error);
    return {};
  }
}

function persistDisCommunityLikeHistory(history = {}) {
  if (typeof localStorage === "undefined") {
    return history;
  }

  const safeHistory = history && typeof history === "object" && !Array.isArray(history)
    ? history
    : {};

  try {
    localStorage.setItem(DIS_COMMUNITY_LIKE_HISTORY_STORAGE_KEY, JSON.stringify(safeHistory));
  } catch (error) {
    console.warn("[dis-community] 추천 기록 저장 실패:", error);
  }

  return safeHistory;
}

function pruneDisCommunityLikeHistory(history = {}) {
  const normalizedHistory = history && typeof history === "object" && !Array.isArray(history)
    ? history
    : {};
  const todayKey = getDisCommunityTodayKey();
  const recentDays = [todayKey];

  try {
    const todayDate = new Date(`${todayKey}T00:00:00+09:00`);
    for (let offset = 1; offset <= 6; offset += 1) {
      const nextDate = new Date(todayDate.getTime() - (offset * 24 * 60 * 60 * 1000));
      const year = nextDate.getUTCFullYear();
      const month = String(nextDate.getUTCMonth() + 1).padStart(2, "0");
      const day = String(nextDate.getUTCDate()).padStart(2, "0");
      recentDays.push(`${year}-${month}-${day}`);
    }
  } catch (error) {
    return normalizedHistory;
  }

  const prunedHistory = {};
  recentDays.forEach((dayKey) => {
    const dayEntry = normalizedHistory[dayKey];
    if (dayEntry && typeof dayEntry === "object" && !Array.isArray(dayEntry)) {
      prunedHistory[dayKey] = dayEntry;
    }
  });

  return prunedHistory;
}

function hasDisCommunityLikedToday(postId = "") {
  const normalizedPostId = String(postId || "").trim();
  if (!normalizedPostId) {
    return false;
  }

  const identityKey = getDisCommunityIdentityKey();
  const todayKey = getDisCommunityTodayKey();
  const likeHistory = pruneDisCommunityLikeHistory(getDisCommunityLikeHistory());
  const dayEntry = likeHistory[todayKey];

  if (!dayEntry || typeof dayEntry !== "object") {
    return false;
  }

  return String(dayEntry[normalizedPostId] || "") === identityKey;
}

function markDisCommunityLikedToday(postId = "") {
  const normalizedPostId = String(postId || "").trim();
  if (!normalizedPostId) {
    return false;
  }

  const identityKey = getDisCommunityIdentityKey();
  const todayKey = getDisCommunityTodayKey();
  const likeHistory = pruneDisCommunityLikeHistory(getDisCommunityLikeHistory());
  const dayEntry = likeHistory[todayKey] && typeof likeHistory[todayKey] === "object"
    ? { ...likeHistory[todayKey] }
    : {};

  dayEntry[normalizedPostId] = identityKey;
  likeHistory[todayKey] = dayEntry;
  persistDisCommunityLikeHistory(likeHistory);
  return true;
}

function unmarkDisCommunityLikedToday(postId = "") {
  const normalizedPostId = String(postId || "").trim();
  if (!normalizedPostId) {
    return false;
  }

  const todayKey = getDisCommunityTodayKey();
  const likeHistory = pruneDisCommunityLikeHistory(getDisCommunityLikeHistory());
  const dayEntry = likeHistory[todayKey];

  if (!dayEntry || typeof dayEntry !== "object" || !Object.prototype.hasOwnProperty.call(dayEntry, normalizedPostId)) {
    return false;
  }

  delete dayEntry[normalizedPostId];
  if (Object.keys(dayEntry).length) {
    likeHistory[todayKey] = dayEntry;
  } else {
    delete likeHistory[todayKey];
  }
  persistDisCommunityLikeHistory(likeHistory);
  return true;
}

function getDisCommunityStateTarget(targetState = null) {
  if (targetState && typeof targetState === "object") {
    return targetState;
  }

  return typeof state !== "undefined" && state && typeof state === "object"
    ? state
    : null;
}

function createDefaultDisCommunityState() {
  return {
    selectedPostId: "",
    tab: "all",
    draft: {
      author: "",
      title: "",
      content: "",
    },
    commentDraft: {
      author: "",
      content: "",
    },
  };
}

function syncDisCommunityState(targetState = null) {
  const resolvedTargetState = getDisCommunityStateTarget(targetState);
  if (!resolvedTargetState) {
    return createDefaultDisCommunityState();
  }

  const defaults = createDefaultDisCommunityState();
  const rawState = resolvedTargetState.disCommunity && typeof resolvedTargetState.disCommunity === "object"
    ? resolvedTargetState.disCommunity
    : {};

  resolvedTargetState.disCommunity = {
    ...defaults,
    ...rawState,
    selectedPostId: String(rawState.selectedPostId || ""),
    tab: rawState.tab === "best" ? "best" : "all",
    draft: {
      ...defaults.draft,
      ...(rawState.draft || {}),
    },
    commentDraft: {
      ...defaults.commentDraft,
      ...(rawState.commentDraft || {}),
    },
  };

  return resolvedTargetState.disCommunity;
}

function setDisCommunitySelectedPostId(postId = "", targetState = null) {
  const communityState = syncDisCommunityState(targetState);
  communityState.selectedPostId = String(postId || "").trim();
  return communityState.selectedPostId;
}

function setDisCommunityTab(tab = "all", targetState = null) {
  const communityState = syncDisCommunityState(targetState);
  communityState.tab = tab === "best" ? "best" : "all";
  return communityState.tab;
}

function setDisCommunityDraftField(field = "", value = "", targetState = null) {
  const communityState = syncDisCommunityState(targetState);
  if (!communityState.draft || typeof communityState.draft !== "object") {
    communityState.draft = { ...createDefaultDisCommunityState().draft };
  }

  if (Object.prototype.hasOwnProperty.call(communityState.draft, field)) {
    communityState.draft[field] = String(value ?? "");
  }

  return communityState.draft[field] || "";
}

function setDisCommunityCommentDraftField(field = "", value = "", targetState = null) {
  const communityState = syncDisCommunityState(targetState);
  if (!communityState.commentDraft || typeof communityState.commentDraft !== "object") {
    communityState.commentDraft = { ...createDefaultDisCommunityState().commentDraft };
  }

  if (Object.prototype.hasOwnProperty.call(communityState.commentDraft, field)) {
    communityState.commentDraft[field] = String(value ?? "");
  }

  return communityState.commentDraft[field] || "";
}

function normalizeDisCommunityTimestamp(value, fallback = Date.now()) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }

  if (value && typeof value.toMillis === "function") {
    return Math.max(0, Math.floor(value.toMillis()));
  }

  if (value && typeof value.seconds === "number") {
    return Math.max(0, Math.floor(value.seconds * 1000));
  }

  return Math.max(0, Math.floor(fallback || Date.now()));
}

function normalizeDisCommunityComment(comment = {}, index = 0) {
  return {
    id: String(comment.id || `comment-${Date.now()}-${index}`),
    author: String(comment.author || "익명"),
    content: String(comment.content || ""),
    createdAt: normalizeDisCommunityTimestamp(comment.createdAt, Date.now() - (index * 60000)),
  };
}

function normalizeDisCommunityPost(post = {}, index = 0) {
  const createdAt = normalizeDisCommunityTimestamp(post.createdAt, Date.now() - (index * 120000));
  const comments = Array.isArray(post.comments)
    ? post.comments.map((comment, commentIndex) => normalizeDisCommunityComment(comment, commentIndex))
    : [];

  return {
    id: String(post.id || `post-${createdAt}-${index}`),
    title: String(post.title || "제목 없음"),
    author: String(post.author || "익명"),
    content: String(post.content || ""),
    createdAt,
    views: Math.max(0, Math.floor(Number(post.views) || 0)),
    likes: Math.max(0, Math.floor(Number(post.likes) || 0)),
    comments,
  };
}

function cloneDisCommunityPost(post = {}) {
  return normalizeDisCommunityPost(post);
}

function getDisCommunityAppId() {
  const storageAppId = typeof localStorage !== "undefined"
    ? String(localStorage.getItem(DIS_COMMUNITY_APP_ID_STORAGE_KEY) || "").trim()
    : "";
  const windowAppId = typeof window !== "undefined"
    ? String(window.__MAMMONCITY_FIREBASE_APP_ID__ || "").trim()
    : "";

  return windowAppId || storageAppId || "mammoncity";
}

function isDisCommunityFirebaseReady() {
  return Boolean(
    typeof firebase !== "undefined"
    && typeof firebase.firestore === "function"
    && typeof window !== "undefined"
    && window.__FIREBASE_CONFIG_SET__,
  );
}

function canUseDisCommunityAuth() {
  return Boolean(
    isDisCommunityFirebaseReady()
    && typeof firebase.auth === "function",
  );
}

function getDisCommunityCollectionRef() {
  if (!isDisCommunityFirebaseReady()) {
    return null;
  }

  return firebase.firestore()
    .collection("artifacts")
    .doc(getDisCommunityAppId())
    .collection("public")
    .doc("data")
    .collection(DIS_COMMUNITY_COLLECTION_ID);
}

function updateDisCommunityConnectionState(patch = {}) {
  disCommunityConnectionState = {
    ...disCommunityConnectionState,
    ...patch,
  };
}

function getDisCommunityConnectionState() {
  return {
    ...disCommunityConnectionState,
  };
}

function getDisCommunityPosts() {
  return disCommunityCachedPosts.map((post) => cloneDisCommunityPost(post));
}

function getDisCommunityPostById(postId = "") {
  const normalizedPostId = String(postId || "").trim();
  if (!normalizedPostId) {
    return null;
  }

  const post = disCommunityCachedPosts.find((entry) => entry.id === normalizedPostId);
  return post ? cloneDisCommunityPost(post) : null;
}

function renderDisCommunityIfPossible() {
  if (typeof renderGame === "function") {
    renderGame();
  }
}

async function ensureDisCommunityAuth() {
  if (!canUseDisCommunityAuth()) {
    return null;
  }

  const auth = firebase.auth();
  if (auth.currentUser) {
    updateDisCommunityConnectionState({
      userId: auth.currentUser.uid || "",
    });
    return auth.currentUser;
  }

  if (!disCommunityAuthPromise) {
    disCommunityAuthPromise = auth.signInAnonymously()
      .then((credential) => {
        updateDisCommunityConnectionState({
          userId: credential?.user?.uid || "",
        });
        return credential?.user || null;
      })
      .catch((error) => {
        console.warn("[dis-community] 익명 로그인 실패:", error);
        updateDisCommunityConnectionState({
          mode: "error",
          live: false,
          ready: false,
          statusLabel: "연결 실패",
          detail: "익명 로그인 실패",
          userId: "",
        });
        return null;
      })
      .finally(() => {
        disCommunityAuthPromise = null;
      });
  }

  return disCommunityAuthPromise;
}

function hydrateDisCommunitySnapshot(posts = []) {
  const normalizedPosts = posts
    .map((post, index) => normalizeDisCommunityPost(post, index))
    .sort((left, right) => right.createdAt - left.createdAt);

  disCommunityCachedPosts = normalizedPosts;
}

function ensureDisCommunityRealtime(targetState = null) {
  syncDisCommunityState(targetState);

  if (disCommunityRealtimeStarted) {
    return;
  }

  if (!isDisCommunityFirebaseReady()) {
    updateDisCommunityConnectionState({
      mode: "offline",
      live: false,
      ready: false,
      statusLabel: "오프라인 미리보기",
      detail: "Firebase 연결 전",
      userId: "",
    });
    return;
  }

  disCommunityRealtimeStarted = true;
  updateDisCommunityConnectionState({
    mode: "connecting",
    live: false,
    ready: false,
    statusLabel: "연결 중",
    detail: "실시간 갤러리 접속 중",
  });

  Promise.resolve()
    .then(() => ensureDisCommunityAuth())
    .then(() => {
      const collectionRef = getDisCommunityCollectionRef();
      if (!collectionRef) {
        updateDisCommunityConnectionState({
          mode: "offline",
          live: false,
          ready: false,
          statusLabel: "오프라인 미리보기",
          detail: "Firebase 경로 없음",
        });
        disCommunityRealtimeStarted = false;
        return;
      }

      disCommunityRealtimeUnsubscribe = collectionRef
        .orderBy("createdAt", "desc")
        .limit(DIS_COMMUNITY_MAX_POSTS)
        .onSnapshot((snapshot) => {
          const nextPosts = snapshot.docs.map((entry) => ({
            id: entry.id,
            ...entry.data(),
          }));
          hydrateDisCommunitySnapshot(nextPosts);
          updateDisCommunityConnectionState({
            mode: "live",
            live: true,
            ready: true,
            statusLabel: "실시간 온라인",
            detail: `게시글 ${disCommunityCachedPosts.length}개 동기화`,
          });
          renderDisCommunityIfPossible();
        }, (error) => {
          console.warn("[dis-community] 실시간 구독 실패:", error);
          updateDisCommunityConnectionState({
            mode: "error",
            live: false,
            ready: false,
            statusLabel: "연결 실패",
            detail: "실시간 구독 실패",
          });
          disCommunityRealtimeStarted = false;
          renderDisCommunityIfPossible();
        });
    })
    .catch((error) => {
      console.warn("[dis-community] 초기화 실패:", error);
      updateDisCommunityConnectionState({
        mode: "error",
        live: false,
        ready: false,
        statusLabel: "연결 실패",
        detail: "실시간 갤러리 초기화 실패",
      });
      disCommunityRealtimeStarted = false;
      renderDisCommunityIfPossible();
    });
}

function createDisCommunityLocalPost(payload = {}) {
  return normalizeDisCommunityPost({
    id: `local-post-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    title: payload.title,
    author: payload.author,
    content: payload.content,
    createdAt: Date.now(),
    views: 0,
    likes: 0,
    comments: [],
  });
}

function upsertDisCommunityLocalPost(nextPost) {
  const normalizedPost = normalizeDisCommunityPost(nextPost);
  const remainingPosts = disCommunityCachedPosts.filter((post) => post.id !== normalizedPost.id);
  disCommunityCachedPosts = [normalizedPost, ...remainingPosts]
    .sort((left, right) => right.createdAt - left.createdAt)
    .slice(0, DIS_COMMUNITY_MAX_POSTS);
  renderDisCommunityIfPossible();
  return normalizedPost;
}

function replaceDisCommunityLocalPost(nextPost) {
  const normalizedPost = normalizeDisCommunityPost(nextPost);
  disCommunityCachedPosts = disCommunityCachedPosts
    .map((post) => (post.id === normalizedPost.id ? normalizedPost : post))
    .sort((left, right) => right.createdAt - left.createdAt);
  renderDisCommunityIfPossible();
  return normalizedPost;
}

async function submitDisCommunityPost(payload = {}, targetState = null) {
  const resolvedTargetState = getDisCommunityStateTarget(targetState);
  const title = String(payload.title || "").trim();
  const author = String(payload.author || "").trim() || "익명";
  const content = String(payload.content || "").trim();

  if (!title || !content) {
    return {
      ok: false,
      reason: "empty",
    };
  }

  const localPost = createDisCommunityLocalPost({ title, author, content });
  const connectionReady = isDisCommunityFirebaseReady();
  if (!connectionReady) {
    const createdPost = upsertDisCommunityLocalPost(localPost);
    if (resolvedTargetState) {
      setDisCommunitySelectedPostId(createdPost.id, resolvedTargetState);
    }
    return {
      ok: true,
      online: false,
      postId: createdPost.id,
    };
  }

  try {
    await ensureDisCommunityAuth();
    const collectionRef = getDisCommunityCollectionRef();
    const docRef = await collectionRef.add({
      title,
      author,
      content,
      createdAt: Date.now(),
      views: 0,
      likes: 0,
      comments: [],
    });
    upsertDisCommunityLocalPost({
      ...localPost,
      id: docRef.id,
    });
    if (resolvedTargetState) {
      setDisCommunitySelectedPostId(docRef.id, resolvedTargetState);
    }
    return {
      ok: true,
      online: true,
      postId: docRef.id,
    };
  } catch (error) {
    console.warn("[dis-community] 글 작성 실패:", error);
    const createdPost = upsertDisCommunityLocalPost(localPost);
    if (resolvedTargetState) {
      setDisCommunitySelectedPostId(createdPost.id, resolvedTargetState);
    }
    updateDisCommunityConnectionState({
      mode: "offline",
      live: false,
      ready: false,
      statusLabel: "오프라인 저장",
      detail: "로컬 미리보기로 저장됨",
    });
    return {
      ok: true,
      online: false,
      postId: createdPost.id,
    };
  }
}

async function submitDisCommunityComment(postId = "", payload = {}) {
  const normalizedPostId = String(postId || "").trim();
  const author = String(payload.author || "").trim() || "익명";
  const content = String(payload.content || "").trim();

  if (!normalizedPostId || !content) {
    return {
      ok: false,
      reason: "empty",
    };
  }

  const currentPost = getDisCommunityPostById(normalizedPostId);
  if (!currentPost) {
    return {
      ok: false,
      reason: "missing",
    };
  }

  const nextComment = normalizeDisCommunityComment({
    id: `comment-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    author,
    content,
    createdAt: Date.now(),
  });

  if (!isDisCommunityFirebaseReady()) {
    replaceDisCommunityLocalPost({
      ...currentPost,
      comments: [...(currentPost.comments || []), nextComment],
    });
    return {
      ok: true,
      online: false,
    };
  }

  try {
    await ensureDisCommunityAuth();
    const collectionRef = getDisCommunityCollectionRef();
    replaceDisCommunityLocalPost({
      ...currentPost,
      comments: [...(currentPost.comments || []), nextComment],
    });
    await collectionRef.doc(normalizedPostId).update({
      comments: firebase.firestore.FieldValue.arrayUnion(nextComment),
    });
    return {
      ok: true,
      online: true,
    };
  } catch (error) {
    console.warn("[dis-community] 댓글 작성 실패:", error);
    replaceDisCommunityLocalPost({
      ...currentPost,
      comments: [...(currentPost.comments || []), nextComment],
    });
    updateDisCommunityConnectionState({
      mode: "offline",
      live: false,
      ready: false,
      statusLabel: "오프라인 저장",
      detail: "댓글을 로컬에 저장함",
    });
    return {
      ok: true,
      online: false,
    };
  }
}

async function incrementDisCommunityPostMetric(postId = "", metric = "views", amount = 1) {
  const normalizedPostId = String(postId || "").trim();
  if (!normalizedPostId || !["views", "likes"].includes(metric)) {
    return false;
  }

  const currentPost = getDisCommunityPostById(normalizedPostId);
  if (!currentPost) {
    return false;
  }

  const normalizedAmount = Math.max(1, Math.floor(Number(amount) || 1));
  if (!isDisCommunityFirebaseReady()) {
    replaceDisCommunityLocalPost({
      ...currentPost,
      [metric]: Math.max(0, Math.floor(Number(currentPost[metric]) || 0) + normalizedAmount),
    });
    return true;
  }

  try {
    await ensureDisCommunityAuth();
    const collectionRef = getDisCommunityCollectionRef();
    replaceDisCommunityLocalPost({
      ...currentPost,
      [metric]: Math.max(0, Math.floor(Number(currentPost[metric]) || 0) + normalizedAmount),
    });
    await collectionRef.doc(normalizedPostId).update({
      [metric]: firebase.firestore.FieldValue.increment(normalizedAmount),
    });
    return true;
  } catch (error) {
    console.warn(`[dis-community] ${metric} 갱신 실패:`, error);
    replaceDisCommunityLocalPost({
      ...currentPost,
      [metric]: Math.max(0, Math.floor(Number(currentPost[metric]) || 0) + normalizedAmount),
    });
    return true;
  }
}

function incrementDisCommunityPostView(postId = "") {
  return incrementDisCommunityPostMetric(postId, "views", 1);
}

async function likeDisCommunityPost(postId = "") {
  const normalizedPostId = String(postId || "").trim();
  if (!normalizedPostId) {
    return {
      ok: false,
      reason: "missing",
    };
  }

  const currentPost = getDisCommunityPostById(normalizedPostId);
  if (!currentPost) {
    return {
      ok: false,
      reason: "missing",
    };
  }

  if (hasDisCommunityLikedToday(normalizedPostId)) {
    return {
      ok: false,
      reason: "daily-limit",
    };
  }

  markDisCommunityLikedToday(normalizedPostId);
  const incremented = await incrementDisCommunityPostMetric(normalizedPostId, "likes", 1);

  if (!incremented) {
    unmarkDisCommunityLikedToday(normalizedPostId);
    return {
      ok: false,
      reason: "missing",
    };
  }

  return {
    ok: true,
    reason: "liked",
  };
}

// Ownership, guest PIN, and edit/delete support overrides.
function createDefaultDisCommunityState() {
  return {
    selectedPostId: "",
    editingPostId: "",
    verifiedGuestPostId: "",
    tab: "all",
    draft: {
      author: "",
      title: "",
      content: "",
      guestPin: "",
    },
    commentDraft: {
      author: "",
      content: "",
      guestPin: "",
    },
  };
}

function normalizeDisCommunityGuestPin(value = "") {
  return String(value ?? "").replace(/\D+/g, "").slice(0, 4);
}

function isDisCommunityGuestPinValid(value = "") {
  return normalizeDisCommunityGuestPin(value).length === 4;
}

function createDisCommunityGuestPinHash(value = "") {
  const normalizedPin = normalizeDisCommunityGuestPin(value);
  if (normalizedPin.length !== 4) {
    return "";
  }

  const source = `mammon-dis-guest:${normalizedPin}`;
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = ((hash << 5) - hash) + source.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(16).padStart(8, "0");
}

function syncDisCommunityState(targetState = null) {
  const resolvedTargetState = getDisCommunityStateTarget(targetState);
  if (!resolvedTargetState) {
    return createDefaultDisCommunityState();
  }

  const defaults = createDefaultDisCommunityState();
  const rawState = resolvedTargetState.disCommunity && typeof resolvedTargetState.disCommunity === "object"
    ? resolvedTargetState.disCommunity
    : {};

  resolvedTargetState.disCommunity = {
    ...defaults,
    ...rawState,
    selectedPostId: String(rawState.selectedPostId || ""),
    editingPostId: String(rawState.editingPostId || ""),
    verifiedGuestPostId: String(rawState.verifiedGuestPostId || ""),
    tab: rawState.tab === "best" ? "best" : "all",
    draft: {
      ...defaults.draft,
      ...(rawState.draft || {}),
      guestPin: normalizeDisCommunityGuestPin(rawState?.draft?.guestPin || ""),
    },
    commentDraft: {
      ...defaults.commentDraft,
      ...(rawState.commentDraft || {}),
      guestPin: normalizeDisCommunityGuestPin(rawState?.commentDraft?.guestPin || ""),
    },
  };

  return resolvedTargetState.disCommunity;
}

function setDisCommunitySelectedPostId(postId = "", targetState = null) {
  const communityState = syncDisCommunityState(targetState);
  communityState.selectedPostId = String(postId || "").trim();
  return communityState.selectedPostId;
}

function setDisCommunityEditingPostId(postId = "", targetState = null) {
  const communityState = syncDisCommunityState(targetState);
  communityState.editingPostId = String(postId || "").trim();
  return communityState.editingPostId;
}

function setDisCommunityVerifiedGuestPostId(postId = "", targetState = null) {
  const communityState = syncDisCommunityState(targetState);
  communityState.verifiedGuestPostId = String(postId || "").trim();
  return communityState.verifiedGuestPostId;
}

function setDisCommunityTab(tab = "all", targetState = null) {
  const communityState = syncDisCommunityState(targetState);
  communityState.tab = tab === "best" ? "best" : "all";
  return communityState.tab;
}

function setDisCommunityDraftField(field = "", value = "", targetState = null) {
  const communityState = syncDisCommunityState(targetState);
  if (!communityState.draft || typeof communityState.draft !== "object") {
    communityState.draft = { ...createDefaultDisCommunityState().draft };
  }

  if (Object.prototype.hasOwnProperty.call(communityState.draft, field)) {
    communityState.draft[field] = field === "guestPin"
      ? normalizeDisCommunityGuestPin(value)
      : String(value ?? "");
  }

  return communityState.draft[field] || "";
}

function setDisCommunityCommentDraftField(field = "", value = "", targetState = null) {
  const communityState = syncDisCommunityState(targetState);
  if (!communityState.commentDraft || typeof communityState.commentDraft !== "object") {
    communityState.commentDraft = { ...createDefaultDisCommunityState().commentDraft };
  }

  if (Object.prototype.hasOwnProperty.call(communityState.commentDraft, field)) {
    communityState.commentDraft[field] = field === "guestPin"
      ? normalizeDisCommunityGuestPin(value)
      : String(value ?? "");
  }

  return communityState.commentDraft[field] || "";
}

function resetDisCommunityComposer(targetState = null, { preserveAuthor = true } = {}) {
  const communityState = syncDisCommunityState(targetState);
  const preservedAuthor = preserveAuthor
    ? String(communityState?.draft?.author || "")
    : "";

  communityState.editingPostId = "";
  communityState.verifiedGuestPostId = "";
  communityState.draft = {
    ...createDefaultDisCommunityState().draft,
    author: preservedAuthor,
  };

  return communityState.draft;
}

function normalizeDisCommunityOptionalTimestamp(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }

  if (value && typeof value.toMillis === "function") {
    return Math.max(0, Math.floor(value.toMillis()));
  }

  if (value && typeof value.seconds === "number") {
    return Math.max(0, Math.floor(value.seconds * 1000));
  }

  return 0;
}

function normalizeDisCommunityComment(comment = {}, index = 0) {
  const authorKey = String(comment.authorKey || "").trim();
  const guestPinHash = String(comment.guestPinHash || "").trim();
  const ownershipMode = String(
    comment.ownershipMode
      || (guestPinHash
        ? "guest"
        : (authorKey.startsWith("auth:") ? "account" : ""))
  ).trim();

  return {
    id: String(comment.id || `comment-${Date.now()}-${index}`),
    author: String(comment.author || "Anonymous"),
    content: String(comment.content || ""),
    authorKey,
    ownershipMode,
    guestPinHash,
    createdAt: normalizeDisCommunityTimestamp(comment.createdAt, Date.now() - (index * 60000)),
  };
}

function normalizeDisCommunityPost(post = {}, index = 0) {
  const createdAt = normalizeDisCommunityTimestamp(post.createdAt, Date.now() - (index * 120000));
  const comments = Array.isArray(post.comments)
    ? post.comments.map((comment, commentIndex) => normalizeDisCommunityComment(comment, commentIndex))
    : [];
  const authorKey = String(post.authorKey || "").trim();
  const guestPinHash = String(post.guestPinHash || "").trim();
  const ownershipMode = String(
    post.ownershipMode
      || (guestPinHash
        ? "guest"
        : (authorKey.startsWith("auth:") ? "account" : ""))
  ).trim();

  return {
    id: String(post.id || `post-${createdAt}-${index}`),
    title: String(post.title || "Untitled"),
    author: String(post.author || "Anonymous"),
    content: String(post.content || ""),
    authorKey,
    ownershipMode,
    guestPinHash,
    createdAt,
    editedAt: normalizeDisCommunityOptionalTimestamp(post.editedAt),
    views: Math.max(0, Math.floor(Number(post.views) || 0)),
    likes: Math.max(0, Math.floor(Number(post.likes) || 0)),
    comments,
  };
}

function cloneDisCommunityPost(post = {}) {
  return normalizeDisCommunityPost(post);
}

function getDisCommunitySignedInAuthorKey() {
  if (typeof getSignedInAccountProfileId === "function") {
    const accountProfileId = String(getSignedInAccountProfileId() || "").trim();
    if (accountProfileId) {
      return accountProfileId;
    }
  }

  if (!canUseDisCommunityAuth()) {
    return "";
  }

  try {
    const currentUser = firebase.auth().currentUser;
    if (currentUser && !currentUser.isAnonymous && currentUser.uid) {
      return `auth:${String(currentUser.uid || "").trim()}`;
    }
  } catch (error) {
    return "";
  }

  return "";
}

function getDisCommunityAuthorKey() {
  return getDisCommunitySignedInAuthorKey() || `guest:${getDisCommunityIdentityKey()}`;
}

function getDisCommunityOwnershipMode() {
  return getDisCommunitySignedInAuthorKey() ? "account" : "guest";
}

function isDisCommunityLocalPostId(postId = "") {
  return String(postId || "").trim().startsWith("local-post-");
}

function isDisCommunityGuestOwnedPost(post = {}) {
  return String(post?.ownershipMode || "").trim() === "guest"
    || Boolean(String(post?.guestPinHash || "").trim());
}

function canDisCommunityManagePost(post = {}, { guestPin = "" } = {}) {
  if (!post || typeof post !== "object") {
    return false;
  }

  if (isDisCommunityGuestOwnedPost(post)) {
    const normalizedPostId = String(post.id || "").trim();
    if (normalizedPostId && String(state?.disCommunity?.verifiedGuestPostId || "").trim() === normalizedPostId) {
      return true;
    }

    const expectedHash = String(post.guestPinHash || "").trim();
    if (!expectedHash) {
      return false;
    }

    return createDisCommunityGuestPinHash(guestPin) === expectedHash;
  }

  const signedInAuthorKey = getDisCommunitySignedInAuthorKey();
  return Boolean(signedInAuthorKey && signedInAuthorKey === String(post.authorKey || "").trim());
}

function canDisCommunityRequestPostManagement(post = {}) {
  if (!post || typeof post !== "object") {
    return false;
  }

  if (isDisCommunityGuestOwnedPost(post)) {
    return true;
  }

  return canDisCommunityManagePost(post);
}

function beginDisCommunityPostEdit(postId = "", targetState = null, { guestPin = "" } = {}) {
  const resolvedTargetState = getDisCommunityStateTarget(targetState);
  const normalizedPostId = String(postId || "").trim();
  const currentPost = getDisCommunityPostById(normalizedPostId);

  if (!normalizedPostId || !currentPost) {
    return {
      ok: false,
      reason: "missing",
    };
  }

  const guestOwned = isDisCommunityGuestOwnedPost(currentPost);
  if (guestOwned) {
    if (!canDisCommunityManagePost(currentPost, { guestPin })) {
      return {
        ok: false,
        reason: guestPin ? "pin-mismatch" : "pin-invalid",
      };
    }
  } else if (!canDisCommunityManagePost(currentPost)) {
    return {
      ok: false,
      reason: "forbidden",
    };
  }

  if (resolvedTargetState) {
    setDisCommunitySelectedPostId(normalizedPostId, resolvedTargetState);
    setDisCommunityEditingPostId(normalizedPostId, resolvedTargetState);
    setDisCommunityVerifiedGuestPostId(guestOwned ? normalizedPostId : "", resolvedTargetState);
    setDisCommunityDraftField("author", currentPost.author, resolvedTargetState);
    setDisCommunityDraftField("title", currentPost.title, resolvedTargetState);
    setDisCommunityDraftField("content", currentPost.content, resolvedTargetState);
    setDisCommunityDraftField("guestPin", "", resolvedTargetState);
  }

  return {
    ok: true,
    postId: normalizedPostId,
  };
}

function createDisCommunityLocalPost(payload = {}) {
  return normalizeDisCommunityPost({
    id: `local-post-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    title: payload.title,
    author: payload.author,
    content: payload.content,
    authorKey: payload.authorKey,
    ownershipMode: payload.ownershipMode,
    guestPinHash: payload.guestPinHash,
    createdAt: Date.now(),
    views: 0,
    likes: 0,
    comments: [],
  });
}

function removeDisCommunityLocalPost(postId = "") {
  const normalizedPostId = String(postId || "").trim();
  if (!normalizedPostId) {
    return false;
  }

  const previousCount = disCommunityCachedPosts.length;
  disCommunityCachedPosts = disCommunityCachedPosts
    .filter((post) => post.id !== normalizedPostId)
    .sort((left, right) => right.createdAt - left.createdAt);
  renderDisCommunityIfPossible();
  return disCommunityCachedPosts.length !== previousCount;
}

async function submitDisCommunityPost(payload = {}, targetState = null) {
  const resolvedTargetState = getDisCommunityStateTarget(targetState);
  const communityState = syncDisCommunityState(resolvedTargetState);
  const title = String(payload.title || "").trim();
  const author = String(payload.author || "").trim() || "Anonymous";
  const content = String(payload.content || "").trim();
  const editingPostId = String(communityState?.editingPostId || "").trim();
  const guestPin = normalizeDisCommunityGuestPin(payload.guestPin || communityState?.draft?.guestPin || "");

  if (!title || !content) {
    return { ok: false, reason: "empty" };
  }

  if (editingPostId) {
    const currentPost = getDisCommunityPostById(editingPostId);
    if (!currentPost) {
      return { ok: false, reason: "missing" };
    }

    const guestOwned = isDisCommunityGuestOwnedPost(currentPost);
    if (guestOwned && String(communityState?.verifiedGuestPostId || "").trim() !== editingPostId) {
      return { ok: false, reason: "pin-invalid" };
    }

    if (!guestOwned && !canDisCommunityManagePost(currentPost)) {
      return { ok: false, reason: "forbidden" };
    }

    const nextPost = {
      ...currentPost,
      title,
      author,
      content,
      editedAt: Date.now(),
    };

    const finishEdit = (online) => {
      replaceDisCommunityLocalPost(nextPost);
      if (resolvedTargetState) {
        setDisCommunitySelectedPostId(editingPostId, resolvedTargetState);
        resetDisCommunityComposer(resolvedTargetState, { preserveAuthor: true });
        setDisCommunityDraftField("author", author, resolvedTargetState);
      }

      return {
        ok: true,
        online,
        postId: editingPostId,
        mode: "edit",
      };
    };

    if (!isDisCommunityFirebaseReady() || isDisCommunityLocalPostId(editingPostId)) {
      return finishEdit(false);
    }

    try {
      await ensureDisCommunityAuth();
      const collectionRef = getDisCommunityCollectionRef();
      replaceDisCommunityLocalPost(nextPost);
      await collectionRef.doc(editingPostId).update({
        title,
        author,
        content,
        editedAt: nextPost.editedAt,
      });
      return finishEdit(true);
    } catch (error) {
      console.warn("[dis-community] edit failed:", error);
      updateDisCommunityConnectionState({
        mode: "offline",
        live: false,
        ready: false,
        statusLabel: "Offline edit",
        detail: "Post updated locally.",
      });
      return finishEdit(false);
    }
  }

  const ownershipMode = getDisCommunityOwnershipMode();
  const authorKey = getDisCommunityAuthorKey();
  const guestPinHash = ownershipMode === "guest"
    ? createDisCommunityGuestPinHash(guestPin)
    : "";

  if (ownershipMode === "guest" && !guestPinHash) {
    return { ok: false, reason: "pin-invalid" };
  }

  const localPost = createDisCommunityLocalPost({
    title,
    author,
    content,
    authorKey,
    ownershipMode,
    guestPinHash,
  });

  const finishCreate = (postId, online) => {
    if (resolvedTargetState) {
      setDisCommunitySelectedPostId(postId, resolvedTargetState);
      resetDisCommunityComposer(resolvedTargetState, { preserveAuthor: true });
      setDisCommunityDraftField("author", author, resolvedTargetState);
    }

    return {
      ok: true,
      online,
      postId,
      mode: "create",
    };
  };

  if (!isDisCommunityFirebaseReady()) {
    const createdPost = upsertDisCommunityLocalPost(localPost);
    return finishCreate(createdPost.id, false);
  }

  try {
    await ensureDisCommunityAuth();
    const collectionRef = getDisCommunityCollectionRef();
    const docRef = await collectionRef.add({
      title,
      author,
      content,
      authorKey,
      ownershipMode,
      guestPinHash,
      createdAt: Date.now(),
      editedAt: 0,
      views: 0,
      likes: 0,
      comments: [],
    });
    upsertDisCommunityLocalPost({
      ...localPost,
      id: docRef.id,
    });
    return finishCreate(docRef.id, true);
  } catch (error) {
    console.warn("[dis-community] post failed:", error);
    const createdPost = upsertDisCommunityLocalPost(localPost);
    updateDisCommunityConnectionState({
      mode: "offline",
      live: false,
      ready: false,
      statusLabel: "Offline save",
      detail: "Post stored locally.",
    });
    return finishCreate(createdPost.id, false);
  }
}

async function deleteDisCommunityPost(postId = "", targetState = null, { guestPin = "" } = {}) {
  const resolvedTargetState = getDisCommunityStateTarget(targetState);
  const normalizedPostId = String(postId || "").trim();
  const currentPost = getDisCommunityPostById(normalizedPostId);

  if (!normalizedPostId || !currentPost) {
    return { ok: false, reason: "missing" };
  }

  const guestOwned = isDisCommunityGuestOwnedPost(currentPost);
  if (guestOwned) {
    const normalizedGuestPin = normalizeDisCommunityGuestPin(guestPin);
    if (!isDisCommunityGuestPinValid(normalizedGuestPin)) {
      return { ok: false, reason: "pin-invalid" };
    }
    if (!canDisCommunityManagePost(currentPost, { guestPin: normalizedGuestPin })) {
      return { ok: false, reason: "pin-mismatch" };
    }
  } else if (!canDisCommunityManagePost(currentPost)) {
    return { ok: false, reason: "forbidden" };
  }

  removeDisCommunityLocalPost(normalizedPostId);
  if (resolvedTargetState) {
    if (String(resolvedTargetState?.disCommunity?.selectedPostId || "").trim() === normalizedPostId) {
      setDisCommunitySelectedPostId("", resolvedTargetState);
    }
    if (String(resolvedTargetState?.disCommunity?.editingPostId || "").trim() === normalizedPostId) {
      resetDisCommunityComposer(resolvedTargetState, { preserveAuthor: true });
    }
    if (String(resolvedTargetState?.disCommunity?.verifiedGuestPostId || "").trim() === normalizedPostId) {
      setDisCommunityVerifiedGuestPostId("", resolvedTargetState);
    }
  }

  if (!isDisCommunityFirebaseReady() || isDisCommunityLocalPostId(normalizedPostId)) {
    return {
      ok: true,
      online: false,
      postId: normalizedPostId,
    };
  }

  try {
    await ensureDisCommunityAuth();
    const collectionRef = getDisCommunityCollectionRef();
    await collectionRef.doc(normalizedPostId).delete();
    return {
      ok: true,
      online: true,
      postId: normalizedPostId,
    };
  } catch (error) {
    console.warn("[dis-community] delete failed:", error);
    updateDisCommunityConnectionState({
      mode: "offline",
      live: false,
      ready: false,
      statusLabel: "Offline delete",
      detail: "Post removed locally.",
    });
    return {
      ok: true,
      online: false,
      postId: normalizedPostId,
    };
  }
}

async function submitDisCommunityComment(postId = "", payload = {}) {
  const normalizedPostId = String(postId || "").trim();
  const author = String(payload.author || "").trim() || "Anonymous";
  const content = String(payload.content || "").trim();
  const ownershipMode = typeof getDisCommunityOwnershipMode === "function"
    ? getDisCommunityOwnershipMode()
    : "guest";
  const authorKey = typeof getDisCommunityAuthorKey === "function"
    ? getDisCommunityAuthorKey()
    : "";
  const guestPin = normalizeDisCommunityGuestPin(payload.guestPin || "");
  const guestPinHash = ownershipMode === "guest"
    ? createDisCommunityGuestPinHash(guestPin)
    : "";

  if (!normalizedPostId || !content) {
    return {
      ok: false,
      reason: "empty",
    };
  }

  if (ownershipMode === "guest" && !guestPinHash) {
    return {
      ok: false,
      reason: "pin-invalid",
    };
  }

  const currentPost = getDisCommunityPostById(normalizedPostId);
  if (!currentPost) {
    return {
      ok: false,
      reason: "missing",
    };
  }

  const nextComment = normalizeDisCommunityComment({
    id: `comment-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    author,
    content,
    authorKey,
    ownershipMode,
    guestPinHash,
    createdAt: Date.now(),
  });

  if (!isDisCommunityFirebaseReady()) {
    replaceDisCommunityLocalPost({
      ...currentPost,
      comments: [...(currentPost.comments || []), nextComment],
    });
    return {
      ok: true,
      online: false,
    };
  }

  try {
    await ensureDisCommunityAuth();
    const collectionRef = getDisCommunityCollectionRef();
    replaceDisCommunityLocalPost({
      ...currentPost,
      comments: [...(currentPost.comments || []), nextComment],
    });
    await collectionRef.doc(normalizedPostId).update({
      comments: firebase.firestore.FieldValue.arrayUnion(nextComment),
    });
    return {
      ok: true,
      online: true,
    };
  } catch (error) {
    console.warn("[dis-community] comment submit failed:", error);
    replaceDisCommunityLocalPost({
      ...currentPost,
      comments: [...(currentPost.comments || []), nextComment],
    });
    updateDisCommunityConnectionState({
      mode: "offline",
      live: false,
      ready: false,
      statusLabel: "Offline sync",
      detail: "Comment saved locally.",
    });
    return {
      ok: true,
      online: false,
    };
  }
}

