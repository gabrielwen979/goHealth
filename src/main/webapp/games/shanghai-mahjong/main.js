/* 上海麻將：UI 與遊戲流程（串接 MjEngine / MjRender） */
(function () {
  'use strict';

  var BEST_KEY = 'shanghaiMahjong.best.v1';
  var COMBO_WINDOW = 3000;

  var DIFFS = {
    normal: { name: '普通', hints: 5, shuffles: 3, undos: 3, showFree: true, limit: 0, penalty: 0, timePenalty: 0,
      note: '5 次提示、3 次洗牌、3 次復原；標示自由牌，不限時。' },
    hard: { name: '困難', hints: 3, shuffles: 1, undos: 1, showFree: false, limit: 15 * 60, penalty: 20, timePenalty: 0,
      note: '3 次提示、1 次洗牌、1 次復原；不標示自由牌，限時 15 分鐘，選錯扣 20 分。' },
    master: { name: '大師', hints: 0, shuffles: 0, undos: 0, showFree: false, limit: 10 * 60, penalty: 20, timePenalty: 10,
      note: '無提示、洗牌、復原；不標示自由牌，限時 10 分鐘，選錯扣 20 分並加罰 10 秒。' }
  };

  var $ = function (id) { return document.getElementById(id); };
  var el = {
    start: $('startScreen'), game: $('gameScreen'), diffPicker: $('difficultyPicker'), diffNote: $('difficultyNote'),
    layoutSel: $('layoutSelect'), bestNote: $('bestNote'), startBtn: $('startBtn'),
    remaining: $('hudRemaining'), time: $('hudTime'), score: $('hudScore'),
    canvas: $('board'), wrap: $('boardWrap'), toast: $('toast'),
    hintBtn: $('hintBtn'), undoBtn: $('undoBtn'), shuffleBtn: $('shuffleBtn'), restartBtn: $('restartBtn'),
    hintCount: $('hintCount'), undoCount: $('undoCount'), shuffleCount: $('shuffleCount'),
    menuBtn: $('menuBtn'), pauseBtn: $('pauseBtn'),
    pauseOverlay: $('pauseOverlay'), resumeBtn: $('resumeBtn'), pauseMenuBtn: $('pauseMenuBtn'),
    dialog: $('dialogOverlay'), dTitle: $('dialogTitle'), dBody: $('dialogBody'), dActions: $('dialogActions')
  };

  var cfg = { difficulty: 'normal', layoutId: null };
  var S = null; // 目前對局狀態
  var renderer = null;
  var ro = null;
  var tickId = 0;
  var toastId = 0;
  var hintId = 0;

  /* ---------- 最佳成績 ---------- */
  function loadBest() {
    try { return JSON.parse(localStorage.getItem(BEST_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveBest(key, score) {
    var b = loadBest();
    if (!(b[key] >= score)) {
      b[key] = score;
      try { localStorage.setItem(BEST_KEY, JSON.stringify(b)); } catch (e) { /* 忽略儲存失敗 */ }
      return true;
    }
    return false;
  }
  function bestKey() { return cfg.layoutId + '|' + cfg.difficulty; }

  /* ---------- 開始畫面 ---------- */
  function stars(n) { return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n); }

  function fillLayouts() {
    var list = MjEngine.LAYOUTS || [];
    el.layoutSel.innerHTML = '';
    list.forEach(function (l) {
      var o = document.createElement('option');
      o.value = l.id;
      o.textContent = l.name + '（' + (l.tiles || '?') + ' 張）　難度 ' + stars(l.level || 1);
      el.layoutSel.appendChild(o);
    });
    cfg.layoutId = list.length ? list[0].id : null;
    el.layoutSel.value = cfg.layoutId;
  }

  function refreshStart() {
    var d = DIFFS[cfg.difficulty];
    el.diffNote.textContent = d.note;
    Array.prototype.forEach.call(el.diffPicker.children, function (b) {
      b.setAttribute('aria-checked', String(b.dataset.value === cfg.difficulty));
    });
    var best = loadBest()[bestKey()];
    el.bestNote.textContent = best ? '此牌型與難度最高分：' + best : '尚無此牌型與難度的紀錄';
  }

  /* ---------- 工具 ---------- */
  function fmt(sec) {
    sec = Math.max(0, Math.ceil(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }
  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add('show');
    clearTimeout(toastId);
    toastId = setTimeout(function () { el.toast.classList.remove('show'); }, 1600);
  }
  function clearHint() {
    clearTimeout(hintId);
    if (renderer) renderer.setHint(null, null);
  }

  /* ---------- 對局 ---------- */
  function startGame(seed) {
    var d = DIFFS[cfg.difficulty];
    if (seed == null) seed = (Math.random() * 0x7fffffff) | 0;
    var game = MjEngine.newGame({ layout: cfg.layoutId, seed: seed, difficulty: cfg.difficulty });
    S = {
      game: game, seed: seed, d: d, diff: cfg.difficulty, layoutId: cfg.layoutId,
      score: 0, elapsed: 0, lastTick: performance.now(), lastRemove: 0,
      hints: d.hints, shuffles: d.shuffles, undos: d.undos,
      awards: [], mistakes: 0, hintsUsed: 0,
      selected: null, busy: false, paused: false, over: false
    };
    el.start.hidden = true;
    el.game.hidden = false;
    closeDialog();
    el.pauseOverlay.hidden = true;
    el.wrap.classList.remove('hidden-board');

    if (!renderer) {
      renderer = MjRender.create(el.canvas, game, { showFree: d.showFree });
      renderer.onTileTap = onTileTap;
      ro = new ResizeObserver(function () { renderer.resize(); renderer.draw(); });
      ro.observe(el.wrap);
    } else {
      renderer.setGame(game);
    }
    renderer.setShowFree(d.showFree);
    renderer.setSelected(null);
    renderer.setHint(null, null);
    renderer.resize();
    renderer.draw();
    window.__mj = { game: game, renderer: renderer, state: S, cfg: cfg };

    updateHud();
    clearInterval(tickId);
    tickId = setInterval(tick, 250);
  }

  function tick() {
    if (!S || S.paused || S.over) { if (S) S.lastTick = performance.now(); return; }
    var now = performance.now();
    S.elapsed += (now - S.lastTick) / 1000;
    S.lastTick = now;
    if (S.d.limit && S.elapsed >= S.d.limit) { S.elapsed = S.d.limit; updateHud(); timeUp(); return; }
    updateHud();
  }

  function updateHud() {
    if (!S) return;
    el.remaining.textContent = S.game.remaining();
    el.score.textContent = S.score;
    var left = S.d.limit ? S.d.limit - S.elapsed : null;
    el.time.textContent = fmt(left == null ? S.elapsed : left);
    el.time.classList.toggle('warn', left != null && left <= 60);
    el.hintCount.textContent = '(' + S.hints + ')';
    el.undoCount.textContent = '(' + S.undos + ')';
    el.shuffleCount.textContent = '(' + S.shuffles + ')';
    var off = S.over || S.paused;
    el.hintBtn.disabled = off || S.hints <= 0;
    el.undoBtn.disabled = off || S.undos <= 0 || !S.game.canUndo();
    el.shuffleBtn.disabled = off || S.shuffles <= 0;
    el.restartBtn.disabled = false;
  }

  function onTileTap(id) {
    if (!S || S.busy || S.paused || S.over) return;
    var g = S.game;
    if (!g.isFree(id)) {
      if (S.d.showFree) toast('這張牌被擋住了');
      else wrong(id, true);
      return;
    }
    clearHint();
    if (S.selected === id) { S.selected = null; renderer.setSelected(null); return; }
    if (S.selected == null) { S.selected = id; renderer.setSelected(id); return; }
    var a = S.selected;
    if (g.canMatch(a, id)) { doMatch(a, id); return; }
    wrong(id, false);
  }

  // 錯誤操作：困難/大師扣分；非自由牌只在無標示時算失誤
  function wrong(id, blocked) {
    if (S.diff !== 'normal') {
      S.mistakes++;
      S.score = Math.max(0, S.score - S.d.penalty);
      if (S.d.timePenalty) S.elapsed += S.d.timePenalty;
      toast('失誤 −' + S.d.penalty + ' 分' + (S.d.timePenalty ? '、+' + S.d.timePenalty + ' 秒' : ''));
      updateHud();
    }
    if (!blocked) { S.selected = id; renderer.setSelected(id); }
  }

  function doMatch(a, b) {
    var g = S.game;
    if (!g.remove(a, b)) { S.selected = null; renderer.setSelected(null); return; }
    S.selected = null;
    renderer.setSelected(null);
    var now = performance.now();
    var combo = S.lastRemove && now - S.lastRemove <= COMBO_WINDOW;
    S.comboCount = combo ? (S.comboCount || 0) + 1 : 0;
    var award = 100 + (combo ? Math.min(S.comboCount, 10) * 20 : 0);
    S.lastRemove = now;
    S.score += award;
    S.awards.push(award);
    if (combo) toast('連擊 ×' + (S.comboCount + 1) + '　+' + award);
    S.busy = true;
    updateHud();
    renderer.animateRemove(a, b, function () {
      S.busy = false;
      afterMove();
    });
  }

  function afterMove() {
    if (!S || S.over) return;
    updateHud();
    if (S.game.isWon()) return win();
    if (S.game.isStuck()) handleStuck();
  }

  function handleStuck() {
    if (S.shuffles > 0) {
      showDialog('無步可走', '<p>目前沒有可消除的配對，自動為你洗牌。</p>', [
        { text: '洗牌', primary: true, fn: function () { closeDialog(); doShuffle(true); } }
      ]);
      return;
    }
    var acts = [];
    if (S.undos > 0 && S.game.canUndo()) {
      acts.push({ text: '復原一步 (' + S.undos + ')', primary: true, fn: function () { closeDialog(); doUndo(); } });
    }
    acts.push({ text: '再玩一次（同一盤）', fn: function () { startGame(S.seed); } });
    acts.push({ text: '換新牌局', fn: function () { startGame(); } });
    gameOver('遊戲結束', '<p>已無可消除的牌，剩餘 ' + S.game.remaining() + ' 張。</p>', acts);
  }

  function timeUp() {
    if (S.over) return;
    gameOver('時間到', '<p>剩餘 ' + S.game.remaining() + ' 張，得分 ' + S.score + '。</p>', [
      { text: '再玩一次（同一盤）', primary: true, fn: function () { startGame(S.seed); } },
      { text: '換新牌局', fn: function () { startGame(); } },
      { text: '回到選單', fn: toMenu }
    ]);
  }

  function gameOver(title, body, acts) {
    var keep = acts.some(function (a) { return a.text.indexOf('復原') === 0; });
    if (!keep) S.over = true;
    acts.push({ text: '回到選單', fn: toMenu });
    showDialog(title, body, acts);
    updateHud();
  }

  function win() {
    S.over = true;
    var d = S.d;
    var bonus = 0;
    if (d.limit) bonus = Math.round((d.limit - S.elapsed) * 2);
    else bonus = Math.max(0, Math.round((900 - S.elapsed) * 1));
    S.score += bonus;
    var n = 3;
    if (S.mistakes > 3 || S.hintsUsed > 3) n--;
    if (d.limit ? S.elapsed > d.limit * 0.7 : S.elapsed > 600) n--;
    n = Math.max(1, n);
    if (S.diff !== 'normal') n = Math.min(5, n + (S.diff === 'master' ? 2 : 1));
    var isBest = saveBest(S.layoutId + '|' + S.diff, S.score);
    updateHud();
    if (renderer.animateWin) renderer.animateWin();
    showDialog('通關！', '<div class="stars">' + stars(n) + '</div>' +
      '<div class="big">' + S.score + '</div>' +
      '<div>用時 ' + fmt(S.elapsed) + '　時間獎勵 +' + bonus + '</div>' +
      '<div>失誤 ' + S.mistakes + ' 次' + (isBest ? '　🏆 新紀錄' : '') + '</div>', [
      { text: '再玩一次', primary: true, fn: function () { startGame(); } },
      { text: '更換牌型', fn: toMenu }
    ]);
  }

  /* ---------- 道具 ---------- */
  function doHint() {
    if (!S || S.busy || S.paused || S.over || S.hints <= 0) return;
    var p = S.game.findPair();
    if (!p) return;
    S.hints--;
    S.hintsUsed++;
    S.selected = null;
    renderer.setSelected(null);
    renderer.setHint(p[0], p[1]);
    clearTimeout(hintId);
    hintId = setTimeout(function () { renderer.setHint(null, null); }, 2500);
    updateHud();
  }

  function doUndo() {
    if (!S || S.busy || S.paused || S.over || S.undos <= 0 || !S.game.canUndo()) return;
    var p = S.game.undo();
    if (!p) return;
    S.undos--;
    S.score = Math.max(0, S.score - (S.awards.pop() || 0));
    S.selected = null;
    renderer.setSelected(null);
    clearHint();
    renderer.draw();
    updateHud();
  }

  function doShuffle(auto) {
    if (!S || S.busy || S.paused || S.over || S.shuffles <= 0) return;
    S.shuffles--;
    S.selected = null;
    renderer.setSelected(null);
    clearHint();
    S.busy = true;
    var ok = S.game.shuffle();
    var done = function () {
      S.busy = false;
      updateHud();
      if (!ok) return handleStuck();
      if (S.game.isStuck()) handleStuck();
    };
    if (renderer.animateShuffle) renderer.animateShuffle(done); else { renderer.draw(); done(); }
    updateHud();
  }

  /* ---------- 暫停 / 對話框 / 導覽 ---------- */
  function setPaused(p) {
    if (!S || S.over || p === S.paused) return;
    S.paused = p;
    S.lastTick = performance.now();
    el.pauseOverlay.hidden = !p;
    el.wrap.classList.toggle('hidden-board', p);
    if (p) { S.selected = null; renderer.setSelected(null); clearHint(); }
    updateHud();
    if (p) el.resumeBtn.focus(); else renderer.draw();
  }

  function showDialog(title, bodyHtml, acts) {
    el.dTitle.textContent = title;
    el.dBody.innerHTML = bodyHtml;
    el.dActions.innerHTML = '';
    acts.forEach(function (a) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn' + (a.primary ? ' btn-primary' : '');
      b.textContent = a.text;
      b.addEventListener('click', a.fn);
      el.dActions.appendChild(b);
    });
    el.dialog.hidden = false;
    var first = el.dActions.firstChild;
    if (first) first.focus();
  }
  function closeDialog() { el.dialog.hidden = true; }

  function toMenu() {
    clearInterval(tickId);
    closeDialog();
    if (S) S.over = true;
    el.pauseOverlay.hidden = true;
    el.game.hidden = true;
    el.start.hidden = false;
    refreshStart();
  }

  function confirmRestart() {
    if (!S || S.over) { startGame(S ? S.seed : null); return; }
    var wasPaused = S.paused;
    S.paused = true;
    showDialog('重玩這一盤？', '<p>目前進度將會重置，牌局相同。</p>', [
      { text: '重玩', primary: true, fn: function () { startGame(S.seed); } },
      { text: '取消', fn: function () { closeDialog(); S.paused = wasPaused; S.lastTick = performance.now(); updateHud(); } }
    ]);
  }

  /* ---------- 事件 ---------- */
  el.diffPicker.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-value]');
    if (!b) return;
    cfg.difficulty = b.dataset.value;
    refreshStart();
  });
  el.layoutSel.addEventListener('change', function () { cfg.layoutId = el.layoutSel.value; refreshStart(); });
  el.startBtn.addEventListener('click', function () { startGame(); });
  el.hintBtn.addEventListener('click', doHint);
  el.undoBtn.addEventListener('click', doUndo);
  el.shuffleBtn.addEventListener('click', function () { doShuffle(false); });
  el.restartBtn.addEventListener('click', confirmRestart);
  el.pauseBtn.addEventListener('click', function () { setPaused(true); });
  el.resumeBtn.addEventListener('click', function () { setPaused(false); });
  el.pauseMenuBtn.addEventListener('click', toMenu);
  el.menuBtn.addEventListener('click', function () {
    if (!S || S.over) return toMenu();
    var wasPaused = S.paused;
    S.paused = true;
    showDialog('回到選單？', '<p>目前進度將不會保留。</p>', [
      { text: '回到選單', primary: true, fn: toMenu },
      { text: '取消', fn: function () { closeDialog(); S.paused = wasPaused; S.lastTick = performance.now(); updateHud(); } }
    ]);
  });

  document.addEventListener('keydown', function (e) {
    if (!S || el.game.hidden || !el.dialog.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key.toLowerCase();
    if (k === 'escape') { setPaused(!S.paused); }
    else if (k === 'h') doHint();
    else if (k === 'u') doUndo();
    else if (k === 's') doShuffle(false);
  });
  document.addEventListener('visibilitychange', function () { if (document.hidden) setPaused(true); });
  // 阻擋棋盤上的長按選單、雙擊縮放與捏合
  ['contextmenu', 'selectstart', 'gesturestart', 'dblclick'].forEach(function (t) {
    el.wrap.addEventListener(t, function (e) { e.preventDefault(); });
  });

  /* ---------- 初始化 ---------- */
  if (typeof MjEngine === 'undefined' || typeof MjRender === 'undefined') {
    el.startBtn.disabled = true;
    el.bestNote.textContent = '遊戲模組載入失敗，請重新整理。';
  } else {
    fillLayouts();
    refreshStart();
  }
})();
