/**
 * main.js —《肉墊的夢境編織》整合層
 *
 * 串接 index.html 的 UI、CatMaze（迷宮）、CatMatch3（消除）、CatAudio（音效）與 CatCloud（登入與存檔）。
 * 流程：CatCloud.init() → 隱藏加載畫面 → 未登入顯示登入畫面；已登入則載入進度後進入遊戲。
 * 只負責整合，不重寫其他模組；所有模組與 DOM 皆以防呆方式存取。
 */
(function () {
  'use strict';

  // ---------- 常數 ----------
  var MATCH_TARGET = 50; // 消除小遊戲的目標分數
  var TOAST_MS = 2400; // 提示訊息顯示時間
  var START_POS = { x: 1, y: 1 }; // 每一關的固定起點（與 maze.js 一致）
  var DIRECTION_KEYS = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', W: 'up', s: 'down', S: 'down', a: 'left', A: 'left', d: 'right', D: 'right'
  };

  // ---------- DOM 取得（缺少時為 null，之後一律防呆） ----------
  function byId(id) {
    return document.getElementById(id);
  }

  var el = {
    loadingScreen: byId('loadingScreen'),
    authScreen: byId('authScreen'),
    gameScreen: byId('gameScreen'),
    btnAnonymous: byId('btnAnonymous'),
    authEmail: byId('authEmail'),
    authPassword: byId('authPassword'),
    btnEmailLogin: byId('btnEmailLogin'),
    btnEmailSignup: byId('btnEmailSignup'),
    authMessage: byId('authMessage'),
    hudPlayer: byId('hudPlayer'),
    hudLevel: byId('hudLevel'),
    hudScore: byId('hudScore'),
    btnMute: byId('btnMute'),
    btnLogout: byId('btnLogout'),
    mazeCanvas: byId('mazeCanvas'),
    toast: byId('toast'),
    dpad: byId('dpad'),
    matchModal: byId('matchModal'),
    matchCanvas: byId('matchCanvas'),
    matchScore: byId('matchScore'),
    matchTarget: byId('matchTarget'),
    winModal: byId('winModal'),
    winTitle: byId('winTitle'),
    winText: byId('winText'),
    btnNextLevel: byId('btnNextLevel')
  };

  // ---------- 遊戲狀態 ----------
  var state = null; // { current_level, last_position, fish_score }
  var maze = null; // CatMaze 實例
  var match = null; // CatMatch3 實例
  var activeChestId = null; // 目前彈窗對應的寶箱 id（字串，如 'c1'）
  var winPending = false; // 通關彈窗顯示中，禁止移動
  var activeUserId = null; // 目前已進入遊戲（或正在進入）的使用者 id
  var enterToken = 0; // 每次進入或離開遊戲遞增，用來丟棄過期的非同步結果
  var authBusy = false; // 登入請求進行中
  var toastTimer = 0;
  var resizeQueued = false;
  var audioUnlocked = false;

  // ---------- 小工具 ----------
  function setText(node, text) {
    if (node) node.textContent = String(text);
  }

  function setHidden(node, hidden) {
    if (node) node.hidden = Boolean(hidden);
  }

  function isModalOpen() {
    return Boolean(match) || winPending;
  }

  function audio(name) {
    var lib = window.CatAudio;
    if (lib && typeof lib[name] === 'function') {
      try {
        lib[name]();
      } catch (error) {
        // 音效失敗不可影響遊戲流程
      }
    }
  }

  // 顯示短暫提示；先隱藏再顯示，讓 CSS 進場動畫在連續提示時能重播
  function showToast(message) {
    if (!el.toast) return;
    el.toast.hidden = true;
    el.toast.textContent = message;
    void el.toast.offsetWidth;
    el.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      if (el.toast) el.toast.hidden = true;
    }, TOAST_MS);
  }

  function setAuthMessage(message) {
    setText(el.authMessage, message || '');
  }

  // 切換主畫面：'auth' 或 'game'（加載畫面一律隱藏）
  function showScreen(name) {
    setHidden(el.loadingScreen, true);
    setHidden(el.authScreen, name !== 'auth');
    setHidden(el.gameScreen, name !== 'game');
  }

  // ---------- 存檔狀態 ----------
  function toInt(value, min, fallback) {
    var n = Math.floor(Number(value));
    return isFinite(n) && n >= min ? n : fallback;
  }

  // 將雲端或本機讀回的資料整理成完整、型別正確的存檔狀態
  function normalizeState(raw) {
    var source = raw && typeof raw === 'object' ? raw : {};
    var pos = source.last_position && typeof source.last_position === 'object' ? source.last_position : {};
    return {
      current_level: toInt(source.current_level, 1, 1),
      last_position: { x: toInt(pos.x, 0, START_POS.x), y: toInt(pos.y, 0, START_POS.y) },
      fish_score: toInt(source.fish_score, 0, 0)
    };
  }

  function saveState() {
    if (!state) return;
    var cloud = window.CatCloud;
    if (cloud && typeof cloud.saveProgress === 'function') {
      try {
        cloud.saveProgress({
          current_level: state.current_level,
          last_position: { x: state.last_position.x, y: state.last_position.y },
          fish_score: state.fish_score
        });
      } catch (error) {
        // 存檔失敗不可影響遊戲流程
      }
    }
  }

  function flushProgress() {
    var cloud = window.CatCloud;
    if (cloud && typeof cloud.flush === 'function') {
      try {
        return Promise.resolve(cloud.flush()).catch(function () {});
      } catch (error) {
        return Promise.resolve();
      }
    }
    return Promise.resolve();
  }

  function updateHud() {
    if (!state) return;
    setText(el.hudLevel, state.current_level); // HTML 已有「第 」「 關」，這裡只放數值
    setText(el.hudScore, state.fish_score);
  }

  // ---------- 音效 ----------
  function updateMuteButton() {
    if (!el.btnMute) return;
    var lib = window.CatAudio;
    var muted = Boolean(lib && typeof lib.isMuted === 'function' && lib.isMuted());
    el.btnMute.textContent = muted ? '🔇' : '🔊';
    el.btnMute.setAttribute('aria-pressed', muted ? 'true' : 'false');
    el.btnMute.title = muted ? '開啟音效' : '關閉音效';
  }

  // AudioContext 必須在使用者手勢內建立；init() 回傳 boolean，成功後即不再重試
  function unlockAudio() {
    if (audioUnlocked) return;
    var lib = window.CatAudio;
    if (!lib || typeof lib.init !== 'function') return;
    try {
      audioUnlocked = lib.init() === true;
    } catch (error) {
      audioUnlocked = false;
    }
  }

  // ---------- 迷宮 ----------
  function destroyMaze() {
    if (maze) {
      try {
        maze.destroy();
      } catch (error) {
        // 忽略銷毀時的例外
      }
      maze = null;
    }
  }

  function destroyMatch() {
    if (match) {
      try {
        match.destroy();
      } catch (error) {
        // 忽略銷毀時的例外
      }
      match = null;
    }
    activeChestId = null;
  }

  // 以相同關卡資料找出玩家已越過的障礙，並開啟其寶箱。
  // 存檔只記錄位置，不記錄已開寶箱；迷宮是無環的樹狀圖，
  // 若自起點只封住某障礙就到不了玩家所在格，代表玩家當時已清除該障礙。
  function openPassedChests(instance, level, pos) {
    var lib = window.CatMaze;
    if (!instance || !lib || typeof lib.generate !== 'function') return;
    if (pos.x === START_POS.x && pos.y === START_POS.y) return;
    var data = lib.generate(level);
    if (!data || !data.grid || !data.obstacles) return;
    var target = pos.x + ',' + pos.y;
    data.obstacles.forEach(function (obstacle) {
      var blocked = {};
      blocked[obstacle.x + ',' + obstacle.y] = true;
      if (!isReachable(data.grid, data.start, blocked, target)) {
        instance.openChest(obstacle.chestId);
      }
    });
  }

  // 自 from 出發、避開 blocked 格，判斷是否能走到 targetKey（"x,y"）
  function isReachable(grid, from, blocked, targetKey) {
    var seen = {};
    var queue = [{ x: from.x, y: from.y }];
    var steps = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    seen[from.x + ',' + from.y] = true;
    for (var head = 0; head < queue.length; head++) {
      var cur = queue[head];
      if (cur.x + ',' + cur.y === targetKey) return true;
      for (var i = 0; i < steps.length; i++) {
        var nx = cur.x + steps[i][0];
        var ny = cur.y + steps[i][1];
        var key = nx + ',' + ny;
        if (ny < 0 || ny >= grid.length || nx < 0 || nx >= grid[0].length) continue;
        if (grid[ny][nx] === 1 || seen[key] || blocked[key]) continue;
        seen[key] = true;
        queue.push({ x: nx, y: ny });
      }
    }
    return false;
  }

  // 依目前 state 建立（或重建）當前關卡的迷宮
  function startLevel() {
    destroyMaze();
    if (!state || !el.mazeCanvas || !window.CatMaze) {
      showToast('迷宮載入失敗，請重新整理頁面。');
      return;
    }
    updateHud();
    var level = state.current_level;
    maze = window.CatMaze.create(el.mazeCanvas, {
      level: level,
      startPos: state.last_position,
      onMove: handleMove,
      onChest: handleChest,
      onBlocked: handleBlocked,
      onGoal: handleGoal
    });
    // maze.js 會把無效的起點改回 (1,1)，以實際位置為準並同步回存檔狀態
    state.last_position = maze.getPosition();
    openPassedChests(maze, level, state.last_position);
    saveState();
    queueMazeResize();
  }

  function handleMove(pos) {
    if (!state || !pos) return;
    state.last_position = { x: pos.x, y: pos.y };
    audio('step');
    saveState();
  }

  function handleBlocked(kind) {
    if (kind === 'obstacle') {
      audio('meow');
      showToast('毛線團擋住去路了，先去找寶箱吧！');
    }
  }

  // 撞到寶箱：彈出消除小遊戲，期間不可移動
  function handleChest(chestId) {
    if (match || winPending) return;
    activeChestId = String(chestId);
    audio('crystal');
    setText(el.matchScore, 0);
    setText(el.matchTarget, MATCH_TARGET);
    setHidden(el.matchModal, false);
    if (!el.matchCanvas || !window.CatMatch3) {
      // 無法顯示消除遊戲時直接開箱，避免玩家被擋死
      finishMatch(activeChestId, 0);
      return;
    }
    var chestIdAtStart = activeChestId;
    try {
      match = window.CatMatch3.start(el.matchCanvas, {
        targetScore: MATCH_TARGET,
        onScore: function (score) {
          setText(el.matchScore, score);
        },
        onComplete: function (score) {
          finishMatch(chestIdAtStart, score);
        }
      });
    } catch (error) {
      match = null;
      finishMatch(chestIdAtStart, 0);
    }
  }

  // 消除達標：累計小魚乾、關閉彈窗、清除障礙並存檔
  function finishMatch(chestId, score) {
    if (!state || chestId !== activeChestId) return;
    var gain = Math.max(0, Math.floor(Number(score) || 0));
    state.fish_score += gain;
    destroyMatch();
    setHidden(el.matchModal, true);
    if (maze) maze.openChest(chestId);
    updateHud();
    saveState();
    audio('meow');
    showToast(gain > 0 ? '獲得 ' + gain + ' 條小魚乾，障礙清除了！' : '寶箱打開了，障礙清除了！');
  }

  // 抵達終點：升一關、回到起點並存檔，顯示通關彈窗
  function handleGoal() {
    if (!state || winPending) return;
    var clearedLevel = state.current_level;
    winPending = true;
    audio('win');
    state.current_level = clearedLevel + 1;
    state.last_position = { x: START_POS.x, y: START_POS.y };
    saveState();
    setText(el.winText, '小貓順利通關第 ' + clearedLevel + ' 關，累積了 ' + state.fish_score + ' 條小魚乾！準備好下一場冒險了嗎？');
    setHidden(el.winModal, false);
    if (el.btnNextLevel && typeof el.btnNextLevel.focus === 'function') el.btnNextLevel.focus();
  }

  function goNextLevel() {
    if (!winPending) return;
    winPending = false;
    setHidden(el.winModal, true);
    startLevel();
  }

  // 統一的移動入口：彈窗開啟、尚未進入遊戲時一律忽略
  function tryMove(dir) {
    if (!maze || !state || isModalOpen()) return;
    if (el.gameScreen && el.gameScreen.hidden) return;
    try {
      maze.move(dir);
    } catch (error) {
      // 移動失敗不應讓整個遊戲中斷
    }
  }

  function queueMazeResize() {
    if (resizeQueued) return;
    resizeQueued = true;
    window.requestAnimationFrame(function () {
      resizeQueued = false;
      if (maze) maze.resize(); // maze.js 自行設定 canvas 尺寸，視窗改變時需重新呼叫
    });
  }

  // ---------- 進入與離開遊戲 ----------
  function resetPlayState() {
    destroyMatch();
    destroyMaze();
    winPending = false;
    state = null;
    setHidden(el.matchModal, true);
    setHidden(el.winModal, true);
    setHidden(el.toast, true);
    audio('stopPurr');
  }

  async function enterGame(user) {
    if (!user) return;
    if (activeUserId === user.id) {
      setText(el.hudPlayer, user.name); // 同一使用者只更新名稱
      return;
    }
    resetPlayState();
    activeUserId = user.id;
    var token = ++enterToken;
    setText(el.hudPlayer, user.name);

    var saved = null;
    try {
      saved = await window.CatCloud.loadProgress();
    } catch (error) {
      saved = null; // 讀取失敗視為新遊戲
    }
    var current = window.CatCloud.getUser();
    if (token !== enterToken || !current || current.id !== user.id) return; // 等待期間已登出或換人

    state = normalizeState(saved);
    showScreen('game');
    startLevel();
  }

  function leaveGame(message) {
    enterToken += 1;
    activeUserId = null;
    resetPlayState();
    showScreen('auth');
    if (typeof message === 'string') setAuthMessage(message);
  }

  function onAuthChange(user) {
    if (user) {
      enterGame(user);
    } else if (activeUserId !== null) {
      leaveGame();
    }
  }

  // ---------- 登入畫面 ----------
  function setAuthBusy(busy) {
    authBusy = busy;
    [el.btnAnonymous, el.btnEmailLogin, el.btnEmailSignup].forEach(function (button) {
      if (button) button.disabled = busy;
    });
  }

  // 統一處理登入動作：顯示處理中、捕捉例外、顯示結果；成功且已有使用者時進入遊戲
  async function runAuth(action) {
    if (authBusy) return;
    unlockAudio();
    setAuthBusy(true);
    setAuthMessage('處理中，請稍候');
    try {
      var result = await action();
      setAuthMessage(result && result.message ? result.message : '');
      if (result && result.ok) {
        var user = window.CatCloud.getUser();
        if (user) enterGame(user);
      }
    } catch (error) {
      setAuthMessage('發生未預期的錯誤，請稍後再試。');
    } finally {
      setAuthBusy(false);
    }
  }

  function readCredentials() {
    return {
      email: el.authEmail ? el.authEmail.value.trim() : '',
      password: el.authPassword ? el.authPassword.value : ''
    };
  }

  function bindAuth() {
    if (el.btnAnonymous) {
      el.btnAnonymous.addEventListener('click', function () {
        runAuth(function () {
          return window.CatCloud.signInAnonymously();
        });
      });
    }
    if (el.btnEmailLogin) {
      el.btnEmailLogin.addEventListener('click', function (event) {
        event.preventDefault(); // 按鈕在 form 內，避免表單送出
        var c = readCredentials();
        runAuth(function () {
          return window.CatCloud.signInWithEmail(c.email, c.password);
        });
      });
    }
    if (el.btnEmailSignup) {
      el.btnEmailSignup.addEventListener('click', function (event) {
        event.preventDefault();
        var c = readCredentials();
        runAuth(function () {
          return window.CatCloud.signUpWithEmail(c.email, c.password);
        });
      });
    }
  }

  // ---------- 遊戲內控制 ----------
  function bindGame() {
    if (el.dpad) {
      el.dpad.addEventListener('pointerdown', function (event) {
        var button = event.target && event.target.closest ? event.target.closest('button[data-dir]') : null;
        if (!button) return;
        event.preventDefault(); // 避免長按選字、雙擊縮放與搶走焦點
        unlockAudio();
        tryMove(button.getAttribute('data-dir'));
      });
    }

    document.addEventListener('keydown', function (event) {
      var dir = DIRECTION_KEYS[event.key];
      if (!dir || event.ctrlKey || event.metaKey || event.altKey) return;
      if (!el.gameScreen || el.gameScreen.hidden) return;
      var tag = event.target && event.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      event.preventDefault(); // 避免方向鍵捲動頁面
      unlockAudio();
      tryMove(dir);
    });

    if (el.btnNextLevel) el.btnNextLevel.addEventListener('click', goNextLevel);

    if (el.btnMute) {
      el.btnMute.addEventListener('click', function () {
        unlockAudio();
        var lib = window.CatAudio;
        if (lib && typeof lib.setMuted === 'function' && typeof lib.isMuted === 'function') {
          lib.setMuted(!lib.isMuted());
        }
        updateMuteButton();
      });
    }

    if (el.btnLogout) {
      el.btnLogout.addEventListener('click', async function () {
        el.btnLogout.disabled = true;
        try {
          await flushProgress();
        } catch (error) {
          // 存檔失敗仍允許返回首頁
        }
        window.location.href = '../../index.html';
      });
    }

    // 第一次使用者手勢時建立 AudioContext（不同瀏覽器對手勢事件的認定不同，故多事件並用）
    ['pointerup', 'touchend', 'click', 'keydown'].forEach(function (type) {
      document.addEventListener(type, function onFirstGesture() {
        unlockAudio();
        if (audioUnlocked) document.removeEventListener(type, onFirstGesture, true);
      }, true);
    });

    window.addEventListener('resize', queueMazeResize);
    window.addEventListener('orientationchange', queueMazeResize);

    // 離開頁面或切到背景時，立即把進度送出
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') flushProgress();
    });
    window.addEventListener('pagehide', function () {
      flushProgress();
    });
  }

  // ---------- Service Worker ----------
  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    var register = function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register);
  }

  // ---------- 啟動 ----------
  async function boot() {
    bindAuth();
    bindGame();
    updateMuteButton();
    registerServiceWorker();

    var cloud = window.CatCloud;
    if (!cloud) {
      showScreen('auth');
      setAuthMessage('雲端模組載入失敗，請重新整理頁面。');
      return;
    }

    try {
      await cloud.init();
    } catch (error) {
      // init 不應丟例外；萬一失敗仍讓玩家進入登入畫面
    }

    cloud.onAuthChange(onAuthChange);
    var user = cloud.getUser();
    if (user) {
      enterGame(user);
    } else {
      showScreen('auth');
    }
  }

  boot();
})();
