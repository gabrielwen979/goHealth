// 《肉墊的夢境編織》雲端模組：Supabase Auth + 進度讀寫（暴露 window.CatCloud）
// 設計重點：
//   1. 本機優先：saveProgress 同步寫 localStorage，雲端同步在背景進行，失敗一律靜默。
//   2. 未設定 Supabase（或 SDK 載入失敗）時退化為「本機訪客」，遊戲仍可離線遊玩。
//   3. 雲端寫入經 debounce 並「序列化」：同一時間最多一個請求在飛，避免亂序覆蓋。
(function () {
  "use strict";

  // ---------- 常數 ----------
  const STORAGE_PREFIX = "catDreamWeaver.";
  const SAVE_KEY_PREFIX = STORAGE_PREFIX + "save.";
  const GUEST_KEY = STORAGE_PREFIX + "guest"; // 本機訪客身分 {id, name}
  const GUEST_ACTIVE_KEY = STORAGE_PREFIX + "guestActive"; // 訪客是否為目前登入狀態
  const TABLE = "game_saves";
  const DEBOUNCE_MS = 800; // saveProgress 的 debounce 時間
  const REQUEST_TIMEOUT_MS = 8000; // 雲端請求逾時，避免卡住載入畫面
  const MAX_LEVEL = 9999;
  const MAX_COORD = 999;
  const MAX_SCORE = 99999999;
  const MIN_PASSWORD_LENGTH = 6;

  const FRENCH_NAMES = [
    "Lily", "Chloe", "Camille", "Margaux", "Élodie", "Manon", "Juliette",
    "Inès", "Océane", "Céleste", "Léa", "Zoé", "Amélie", "Capucine",
    "Colette", "Apolline", "Solène", "Éloïse", "Mélodie", "Adèle",
  ];

  // ---------- 模組狀態 ----------
  let client = null; // Supabase client；未設定時為 null
  let configured = false;
  let initPromise = null;
  let currentUser = null; // {id, name, email, isAnonymous}
  let currentIsGuest = false; // true 代表本機訪客（不可同步雲端）
  const listeners = new Set();

  // 雲端寫入佇列狀態
  let pending = null; // 等待送出的最新快照 {userId, state, savedAt}
  let debounceTimer = null;
  let syncPromise = null; // 目前正在執行的同步迴圈；null 代表閒置
  let dirty = false; // 上次送出失敗，待下次機會重試

  // ---------- 小工具 ----------
  function getStorage() {
    try {
      return window.localStorage || null;
    } catch (error) {
      return null; // 隱私模式可能禁止存取
    }
  }

  function storageGet(key) {
    const storage = getStorage();
    if (!storage) return null;
    try {
      return storage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function storageSet(key, value) {
    const storage = getStorage();
    if (!storage) return;
    try {
      storage.setItem(key, value);
    } catch (error) {
      // 空間不足或被禁止時靜默略過，遊戲仍可繼續
    }
  }

  function storageRemove(key) {
    const storage = getStorage();
    if (!storage) return;
    try {
      storage.removeItem(key);
    } catch (error) {
      // 靜默略過
    }
  }

  function readJson(key) {
    const raw = storageGet(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (error) {
      return null; // 資料損毀視為不存在
    }
  }

  function randomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function randomFrenchName() {
    return FRENCH_NAMES[randomInt(FRENCH_NAMES.length)];
  }

  // 沒有名稱時，以 id 雜湊挑選法式名稱，確保同一位玩家顯示穩定
  function stableFrenchName(id) {
    let hash = 0;
    const text = String(id || "");
    for (let i = 0; i < text.length; i += 1) {
      hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
    }
    return FRENCH_NAMES[hash % FRENCH_NAMES.length];
  }

  function newGuestId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return "guest-" + window.crypto.randomUUID();
    }
    return "guest-" + Date.now().toString(36) + "-" + randomInt(1e9).toString(36);
  }

  function withTimeout(promise, ms) {
    let timer = null;
    const timeout = new Promise(function (_resolve, reject) {
      timer = setTimeout(function () {
        reject(new Error("timeout"));
      }, ms);
    });
    return Promise.race([promise, timeout]).finally(function () {
      clearTimeout(timer);
    });
  }

  // ---------- 存檔資料驗證與清洗 ----------
  function defaultState() {
    return { current_level: 1, last_position: { x: 1, y: 1 }, fish_score: 0 };
  }

  // 轉為限定範圍內的整數；型別錯誤、NaN、無限大都退回預設值
  function toInt(value, min, max, fallback) {
    if (typeof value === "string" && value.trim() !== "") value = Number(value);
    if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
    return Math.min(max, Math.max(min, Math.floor(value)));
  }

  // 任何輸入都會回傳完整、型別正確的 game_state（缺欄位補預設、超出範圍夾限）
  function sanitizeState(input) {
    const base = defaultState();
    const source = input && typeof input === "object" && !Array.isArray(input) ? input : {};
    const pos = source.last_position && typeof source.last_position === "object" ? source.last_position : {};
    return {
      current_level: toInt(source.current_level, 1, MAX_LEVEL, base.current_level),
      last_position: {
        x: toInt(pos.x, 0, MAX_COORD, base.last_position.x),
        y: toInt(pos.y, 0, MAX_COORD, base.last_position.y),
      },
      fish_score: toInt(source.fish_score, 0, MAX_SCORE, base.fish_score),
    };
  }

  // ---------- 本機存檔（以 user id 分鍵） ----------
  function readLocalSave(userId) {
    const entry = readJson(SAVE_KEY_PREFIX + userId);
    if (!entry || typeof entry !== "object" || !entry.state) return null;
    const savedAt = Number(entry.savedAt);
    return { state: sanitizeState(entry.state), savedAt: Number.isFinite(savedAt) ? savedAt : 0 };
  }

  function writeLocalSave(userId, state, savedAt) {
    storageSet(SAVE_KEY_PREFIX + userId, JSON.stringify({ state: state, savedAt: savedAt }));
  }

  // ---------- 使用者與事件 ----------
  function normalizeUser(rawUser) {
    if (!rawUser) return null;
    const meta = rawUser.user_metadata || {};
    const email = rawUser.email || null;
    const isAnonymous = Boolean(rawUser.is_anonymous) || (!email && !rawUser.phone);
    const name = meta.display_name || (email ? email.split("@")[0] : stableFrenchName(rawUser.id));
    return { id: rawUser.id, name: name, email: email, isAnonymous: isAnonymous };
  }

  function userSignature(user) {
    return user ? [user.id, user.name, user.email, user.isAnonymous].join("|") : "";
  }

  // 只有身分真的改變才通知，避免 TOKEN_REFRESHED 等事件造成重複回呼
  function setCurrentUser(user, isGuest) {
    const changed = userSignature(user) !== userSignature(currentUser);
    currentUser = user;
    currentIsGuest = Boolean(user) && isGuest;
    if (!changed) return;
    listeners.forEach(function (callback) {
      try {
        callback(user ? Object.assign({}, user) : null);
      } catch (error) {
        // 單一監聽者出錯不應影響其他監聽者
      }
    });
  }

  function getUser() {
    return currentUser ? Object.assign({}, currentUser) : null;
  }

  function onAuthChange(callback) {
    if (typeof callback !== "function") return function () {};
    listeners.add(callback);
    return function unsubscribe() {
      listeners.delete(callback);
    };
  }

  // 是否可以和雲端同步：需要 client、已登入且非本機訪客
  function canUseCloud() {
    return Boolean(client && currentUser && !currentIsGuest);
  }

  // ---------- 本機訪客 ----------
  function getOrCreateGuest() {
    const saved = readJson(GUEST_KEY);
    if (saved && typeof saved.id === "string" && typeof saved.name === "string") return saved;
    const guest = { id: newGuestId(), name: randomFrenchName() };
    storageSet(GUEST_KEY, JSON.stringify(guest));
    return guest;
  }

  function enterGuestMode() {
    const guest = getOrCreateGuest();
    storageSet(GUEST_ACTIVE_KEY, "1");
    setCurrentUser({ id: guest.id, name: guest.name, email: null, isAnonymous: true }, true);
    return getUser();
  }

  // ---------- 初始化 ----------
  function isValidConfig(config) {
    if (!config || typeof config !== "object") return false;
    const url = String(config.url || "");
    const key = String(config.anonKey || config.publishableKey || "");
    return /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)
      && !/YOUR-/i.test(url)
      && key.length > 0
      && !/^YOUR-/i.test(key);
  }

  async function doInit() {
    const config = window.catDreamWeaverSupabaseConfig || window.goHealthSupabaseConfig;
    const hasSdk = Boolean(window.supabase && typeof window.supabase.createClient === "function");

    if (isValidConfig(config) && hasSdk) {
      try {
        client = window.supabase.createClient(config.url, config.anonKey || config.publishableKey, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
        });
        configured = true;
      } catch (error) {
        client = null;
        configured = false;
      }
    }

    if (client) {
      // 注意：onAuthStateChange 的回呼內不可 await 其他 Supabase 呼叫（會死鎖），這裡只同步更新狀態
      try {
        client.auth.onAuthStateChange(function (_event, session) {
          if (session && session.user) {
            setCurrentUser(normalizeUser(session.user), false);
          } else if (!currentIsGuest) {
            setCurrentUser(null, false);
          }
        });
        const result = await withTimeout(client.auth.getSession(), REQUEST_TIMEOUT_MS);
        const session = result && result.data && result.data.session;
        if (session && session.user) setCurrentUser(normalizeUser(session.user), false);
      } catch (error) {
        // 還原 session 失敗視為未登入，不丟例外
      }
    }

    // 沒有雲端身分時，若上次是以本機訪客離開，則還原訪客
    if (!currentUser && storageGet(GUEST_ACTIVE_KEY) === "1") enterGuestMode();

    registerLifecycleFlush();
    return { configured: configured };
  }

  function init() {
    if (!initPromise) initPromise = doInit();
    return initPromise;
  }

  // ---------- 登入 / 註冊 / 登出 ----------
  function translateAuthError(error, fallback) {
    const text = String((error && error.message) || "").toLowerCase();
    if (text.indexOf("invalid login credentials") >= 0) return "信箱或密碼不正確。";
    if (text.indexOf("email not confirmed") >= 0) return "信箱尚未驗證，請先到信箱點擊驗證連結。";
    if (text.indexOf("already registered") >= 0 || text.indexOf("already been registered") >= 0) {
      return "此信箱已註冊，請直接登入。";
    }
    if (text.indexOf("password") >= 0 && text.indexOf("least") >= 0) return "密碼長度不足，請至少輸入 6 個字元。";
    if (text.indexOf("rate limit") >= 0 || text.indexOf("too many") >= 0) return "操作太頻繁，請稍後再試。";
    if (text.indexOf("anonymous") >= 0 && text.indexOf("disabled") >= 0) return "尚未啟用匿名登入。";
    if (text.indexOf("fetch") >= 0 || text.indexOf("network") >= 0 || text.indexOf("timeout") >= 0) {
      return "網路連線不穩，請稍後再試。";
    }
    return fallback;
  }

  function validateCredentials(email, password) {
    const cleanEmail = String(email || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return { message: "請輸入有效的信箱。" };
    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
      return { message: "密碼至少需要 " + MIN_PASSWORD_LENGTH + " 個字元。" };
    }
    return { email: cleanEmail };
  }

  async function signInAnonymously() {
    await init();
    if (currentUser) {
      return { ok: true, message: "歡迎回來，" + currentUser.name + "！" };
    }
    if (!client) {
      const guest = enterGuestMode();
      return { ok: true, message: "已進入本機訪客模式，你好 " + guest.name + "！進度只會存在這台裝置。" };
    }

    const name = randomFrenchName();
    try {
      const result = await withTimeout(
        client.auth.signInAnonymously({ options: { data: { display_name: name } } }),
        REQUEST_TIMEOUT_MS
      );
      if (result.error || !result.data || !result.data.user) throw result.error || new Error("no user");

      let user = result.data.user;
      // 若伺服器沒有帶回 display_name，補寫一次
      if (!(user.user_metadata && user.user_metadata.display_name)) {
        try {
          const updated = await withTimeout(client.auth.updateUser({ data: { display_name: name } }), REQUEST_TIMEOUT_MS);
          if (updated && updated.data && updated.data.user) user = updated.data.user;
          else user = Object.assign({}, user, { user_metadata: Object.assign({}, user.user_metadata, { display_name: name }) });
        } catch (error) {
          user = Object.assign({}, user, { user_metadata: Object.assign({}, user.user_metadata, { display_name: name }) });
        }
      }
      const normalized = normalizeUser(Object.assign({}, user, { is_anonymous: true }));
      storageRemove(GUEST_ACTIVE_KEY);
      setCurrentUser(normalized, false);
      return { ok: true, message: "歡迎，" + normalized.name + "！" };
    } catch (error) {
      // 雲端無法匿名登入時（網路中斷、未啟用匿名登入）退化為本機訪客，維持可玩
      const guest = enterGuestMode();
      return {
        ok: true,
        message: translateAuthError(error, "雲端暫時無法使用") + "已改用本機訪客「" + guest.name + "」，進度存在這台裝置。",
      };
    }
  }

  async function signInWithEmail(email, password) {
    await init();
    if (!client) return { ok: false, message: "尚未設定 Supabase，請改用「本機訪客」遊玩。" };
    const checked = validateCredentials(email, password);
    if (!checked.email) return { ok: false, message: checked.message };
    try {
      const result = await withTimeout(
        client.auth.signInWithPassword({ email: checked.email, password: password }),
        REQUEST_TIMEOUT_MS
      );
      if (result.error) return { ok: false, message: translateAuthError(result.error, "登入失敗，請稍後再試。") };
      const user = result.data && result.data.user;
      if (user) {
        storageRemove(GUEST_ACTIVE_KEY);
        setCurrentUser(normalizeUser(user), false);
      }
      return { ok: true, message: "登入成功，歡迎回來！" };
    } catch (error) {
      return { ok: false, message: translateAuthError(error, "登入失敗，請稍後再試。") };
    }
  }

  async function signUpWithEmail(email, password) {
    await init();
    if (!client) return { ok: false, message: "尚未設定 Supabase，請改用「本機訪客」遊玩。" };
    const checked = validateCredentials(email, password);
    if (!checked.email) return { ok: false, message: checked.message };
    try {
      const result = await withTimeout(
        client.auth.signUp({
          email: checked.email,
          password: password,
          options: { data: { display_name: randomFrenchName() } },
        }),
        REQUEST_TIMEOUT_MS
      );
      if (result.error) return { ok: false, message: translateAuthError(result.error, "註冊失敗，請稍後再試。") };
      const data = result.data || {};
      // Supabase 為防止信箱探測，已註冊的信箱會回傳 identities 為空陣列
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return { ok: false, message: "此信箱已註冊，請直接登入。" };
      }
      if (data.session && data.user) {
        storageRemove(GUEST_ACTIVE_KEY);
        setCurrentUser(normalizeUser(data.user), false);
        return { ok: true, message: "註冊成功，已自動登入！" };
      }
      return { ok: true, message: "註冊成功！請到信箱點擊驗證連結後再登入。" };
    } catch (error) {
      return { ok: false, message: translateAuthError(error, "註冊失敗，請稍後再試。") };
    }
  }

  async function signOut() {
    await init();
    try {
      // 登出前先把尚未送出的進度寫出，登出後就沒有權限寫了
      await flush();
      if (currentIsGuest || !client) {
        storageRemove(GUEST_ACTIVE_KEY); // 保留訪客身分與存檔，下次進入訪客模式可接續
        setCurrentUser(null, false);
        return { ok: true, message: "已登出。" };
      }
      const result = await withTimeout(client.auth.signOut(), REQUEST_TIMEOUT_MS);
      if (result && result.error) return { ok: false, message: "登出失敗，請稍後再試。" };
      setCurrentUser(null, false);
      return { ok: true, message: "已登出，下次見！" };
    } catch (error) {
      return { ok: false, message: "登出失敗，請稍後再試。" };
    }
  }

  // ---------- 進度讀取 ----------
  // 非同步流程：
  //   1. 先讀本機（同步、必定可用）。
  //   2. 若可用雲端，查詢 game_saves（含逾時）；查詢失敗就直接採用本機。
  //   3. 雲端與本機都有時比較時間戳，取較新者；本機較新代表上次離線進度尚未上傳，順便補送。
  async function loadProgress() {
    await init();
    const user = currentUser;
    if (!user) return null;

    const local = readLocalSave(user.id);
    if (!canUseCloud()) return local ? local.state : null;

    let remote = null;
    let remoteOk = false;
    try {
      const result = await withTimeout(
        client.from(TABLE).select("game_state, updated_at").eq("user_id", user.id).maybeSingle(),
        REQUEST_TIMEOUT_MS
      );
      if (!result.error) {
        remoteOk = true;
        if (result.data && result.data.game_state) {
          const parsed = Date.parse(result.data.updated_at);
          remote = {
            state: sanitizeState(result.data.game_state),
            savedAt: Number.isFinite(parsed) ? parsed : 0,
          };
        }
      }
    } catch (error) {
      remoteOk = false;
    }

    // 等待期間若已切換使用者，結果不再適用
    if (!currentUser || currentUser.id !== user.id) return null;

    if (!remoteOk) return local ? local.state : null;
    if (!remote) {
      // 雲端沒有存檔；若本機有（例如離線時玩過），補上傳
      if (local) queueCloudSave(user.id, local.state, local.savedAt);
      return local ? local.state : null;
    }
    if (local && local.savedAt > remote.savedAt) {
      queueCloudSave(user.id, local.state, local.savedAt);
      return local.state;
    }
    writeLocalSave(user.id, remote.state, remote.savedAt); // 雲端較新（或相同），同步回本機
    return remote.state;
  }

  // ---------- 進度寫入 ----------
  // 非同步流程：
  //   saveProgress → 同步寫 localStorage → 以最新快照覆蓋 pending → 重設 800ms 計時器。
  //   計時到或 flush() → runSync：同一時間只跑一個迴圈，逐一送出 pending，
  //   送出期間新進來的快照只會覆蓋 pending（只保留最新），上一筆完成後才送下一筆，
  //   因此雲端請求絕不會同時在飛，也就不會出現舊資料覆蓋新資料。
  function queueCloudSave(userId, state, savedAt) {
    pending = { userId: userId, state: state, savedAt: savedAt };
    scheduleFlush();
  }

  function scheduleFlush() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      debounceTimer = null;
      runSync();
    }, DEBOUNCE_MS);
  }

  function saveProgress(state) {
    try {
      const user = currentUser;
      if (!user) return;
      const clean = sanitizeState(state);
      const savedAt = Date.now();
      writeLocalSave(user.id, clean, savedAt);
      if (canUseCloud()) queueCloudSave(user.id, clean, savedAt);
    } catch (error) {
      // 存檔絕不可影響遊戲流程
    }
  }

  // 執行同步迴圈；若已有迴圈在跑則直接回傳同一個 Promise
  function runSync() {
    if (syncPromise) return syncPromise;
    const running = (async function () {
      while (pending) {
        const snapshot = pending;
        pending = null;
        // 使用者已切換（登出/換帳號）時丟棄，避免用錯身分寫入
        if (!canUseCloud() || currentUser.id !== snapshot.userId) continue;
        try {
          const result = await withTimeout(
            client.from(TABLE).upsert(
              {
                user_id: snapshot.userId,
                game_state: snapshot.state,
                updated_at: new Date(snapshot.savedAt).toISOString(),
              },
              { onConflict: "user_id" }
            ),
            REQUEST_TIMEOUT_MS
          );
          if (result && result.error) throw result.error;
          dirty = false;
        } catch (error) {
          // 失敗靜默：本機已保存；若期間沒有更新的快照，保留這筆等待下次重試
          if (!pending) pending = snapshot;
          dirty = true;
          break; // 不在失敗後立刻重試，避免無限迴圈；等下次 save / flush / online 事件
        }
      }
    })();
    syncPromise = running;
    // 迴圈結束才釋放；不可寫在 async 函式內的 finally，否則無 await 時會先於賦值執行
    running.then(function () {
      if (syncPromise === running) syncPromise = null;
    });
    return running;
  }

  // 立即送出尚未同步的進度（取消 debounce）；永遠 resolve，不丟例外
  async function flush() {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    try {
      if (syncPromise) await syncPromise; // 先等進行中的請求，保持順序
      if (pending) await runSync();
    } catch (error) {
      // 靜默
    }
  }

  // 頁面隱藏、關閉或網路恢復時盡量把進度送出
  let lifecycleRegistered = false;
  function registerLifecycleFlush() {
    if (lifecycleRegistered || typeof window.addEventListener !== "function") return;
    lifecycleRegistered = true;
    window.addEventListener("pagehide", function () {
      flush();
    });
    window.addEventListener("online", function () {
      if (dirty || pending) flush();
    });
    if (window.document && typeof window.document.addEventListener === "function") {
      window.document.addEventListener("visibilitychange", function () {
        if (window.document.visibilityState === "hidden") flush();
      });
    }
  }

  window.CatCloud = {
    init: init,
    getUser: getUser,
    onAuthChange: onAuthChange,
    signInAnonymously: signInAnonymously,
    signInWithEmail: signInWithEmail,
    signUpWithEmail: signUpWithEmail,
    signOut: signOut,
    loadProgress: loadProgress,
    saveProgress: saveProgress,
    flush: flush,
    randomFrenchName: randomFrenchName,
    // 額外輔助（契約之外）
    sanitizeState: sanitizeState,
  };
})();
