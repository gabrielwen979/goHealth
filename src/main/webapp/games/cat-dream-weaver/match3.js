/*
 * match3.js —《肉墊的夢境編織》5x5 萌貓寶物消除
 *
 * 對外只暴露一個命名空間：window.CatMatch3
 *   CatMatch3.start(canvas, { targetScore, onScore(score), onComplete(score) }) → { destroy() }
 *   CatMatch3._internals = { findMatches, hasMove, findMove, createBoard 等 }（供 Node 單元測試）
 *
 * 架構概觀：
 *   1. 純邏輯層：以二維陣列 board[r][c]（0~3 的元素編號，null 代表空格）做消除判定，
 *      不依賴 DOM / Canvas，可直接在 Node 中測試。
 *   2. 動畫層：每個磚塊是帶有 x / y（格座標，可為小數）、scale、alpha 的物件，
 *      以時間為基礎的補間（tween）驅動；async/await 串起「交換 → 消除 → 下落 → 補新 → 連鎖」。
 *   3. 特效層：固定大小的粒子池（星光閃爍 + 肉墊爆開），避免連鎖時大量配置物件造成卡頓。
 *   4. 輸入層：Pointer Events，支援「點選相鄰兩格」與「滑動」，動畫期間鎖定輸入。
 */
(function () {
  'use strict';

  // ───────────────────────── 常數 ─────────────────────────

  var SIZE = 5; // 盤面為 SIZE x SIZE
  var KINDS = 4; // 元素種類數
  var POINTS_PER_TILE = 10; // 每顆基本分數
  var MAX_PARTICLES = 160; // 粒子池上限

  // 四種元素的 emoji 與莫蘭迪色底磚（粉綠寶石、香檳金香水瓶、小魚乾、粉紅毛線球）
  var EMOJI = ['\uD83D\uDC8E', '\uD83E\uDDEA', '\uD83D\uDC1F', '\uD83E\uDDF6'];
  var TILE_COLORS = [
    { top: '#cfe0d3', bottom: '#aac4b1' }, // 💎 鼠尾草綠
    { top: '#f0e3c4', bottom: '#d9c496' }, // 🧪 香檳金
    { top: '#c4d3e0', bottom: '#9fb3c6' }, // 🐟 霧藍灰
    { top: '#f0cfd6', bottom: '#dba9b5' }  // 🧶 乾燥玫瑰粉
  ];
  var EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

  // ───────────────────────── 純邏輯：消除判定 ─────────────────────────

  /**
   * 判定盤面上所有「水平或垂直連續 ≥3 顆同種元素」的格子。
   *
   * 算法（一次掃描、一次標記）：
   *   - 先逐列（水平）掃描：用 run 記錄目前連續相同元素的起點與長度，
   *     當元素改變或到達列尾時，若長度 ≥3，就把這段 run 的每一格標記為「待清除」。
   *   - 再逐欄（垂直）以相同方式掃描。
   *   - 兩個方向使用同一張 marked 表，因此 L 形、T 形、十字形的交叉格只會被標記一次，
   *     並且這些消除會「同時」被回報，之後由呼叫端一次清除（而不是邊找邊清）。
   *   - null / undefined 的空格視為不同於任何元素，不會形成連線。
   *
   * @param {Array<Array<number|null>>} board 二維陣列 board[r][c]
   * @returns {Array<{r:number,c:number}>} 不重複的待清除格子，依列優先排序
   */
  function findMatches(board) {
    var rows = board.length;
    var cols = rows > 0 ? board[0].length : 0;
    var marked = [];
    var r;
    var c;
    for (r = 0; r < rows; r++) {
      marked.push(new Array(cols).fill(false));
    }

    // 以 getter 抽象方向，讓水平與垂直共用同一段掃描程式
    function scanLine(length, getCell, markCell) {
      var runStart = 0;
      for (var i = 1; i <= length; i++) {
        var prev = getCell(i - 1);
        var cur = i < length ? getCell(i) : undefined; // 越界視為「元素改變」以結算最後一段
        var sameAsPrev = i < length && cur !== null && cur !== undefined && cur === prev;
        if (!sameAsPrev) {
          var runLen = i - runStart;
          if (runLen >= 3 && prev !== null && prev !== undefined) {
            for (var k = runStart; k < i; k++) {
              markCell(k);
            }
          }
          runStart = i;
        }
      }
    }

    // 水平掃描：每一列
    for (r = 0; r < rows; r++) {
      (function (row) {
        scanLine(
          cols,
          function (i) { return board[row][i]; },
          function (i) { marked[row][i] = true; }
        );
      })(r);
    }
    // 垂直掃描：每一欄
    for (c = 0; c < cols; c++) {
      (function (col) {
        scanLine(
          rows,
          function (i) { return board[i][col]; },
          function (i) { marked[i][col] = true; }
        );
      })(c);
    }

    var result = [];
    for (r = 0; r < rows; r++) {
      for (c = 0; c < cols; c++) {
        if (marked[r][c]) {
          result.push({ r: r, c: c });
        }
      }
    }
    return result;
  }

  /**
   * 找出一個「交換後會產生消除」的可行步；沒有則回傳 null。
   * 只需嘗試每格與右邊、下邊鄰格交換（其餘方向由對稱性涵蓋）。
   * 交換在原陣列上進行並立刻換回，因此不會改變傳入的盤面。
   *
   * @returns {{a:{r:number,c:number}, b:{r:number,c:number}}|null}
   */
  function findMove(board) {
    var rows = board.length;
    var cols = rows > 0 ? board[0].length : 0;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var neighbors = [{ r: r, c: c + 1 }, { r: r + 1, c: c }];
        for (var n = 0; n < neighbors.length; n++) {
          var nr = neighbors[n].r;
          var nc = neighbors[n].c;
          if (nr >= rows || nc >= cols) {
            continue;
          }
          if (board[r][c] === null || board[nr][nc] === null) {
            continue;
          }
          swapCells(board, r, c, nr, nc);
          var ok = findMatches(board).length > 0;
          swapCells(board, r, c, nr, nc);
          if (ok) {
            return { a: { r: r, c: c }, b: { r: nr, c: nc } };
          }
        }
      }
    }
    return null;
  }

  /** 盤面是否至少存在一個可行步 */
  function hasMove(board) {
    return findMove(board) !== null;
  }

  function swapCells(board, r1, c1, r2, c2) {
    var t = board[r1][c1];
    board[r1][c1] = board[r2][c2];
    board[r2][c2] = t;
  }

  function randInt(n) {
    return Math.floor(Math.random() * n);
  }

  /**
   * 產生合法的初始盤面：
   *   - 逐格隨機填入，若該格會與左側兩格或上方兩格同種而形成三連線，就排除該元素重抽，
   *     因此初始盤面「不可能」有現成三連線；
   *   - 填完後若沒有可行步，就整盤重生（重生機率極低，迴圈必定很快結束）。
   */
  function createBoard() {
    for (var attempt = 0; attempt < 1000; attempt++) {
      var board = [];
      for (var r = 0; r < SIZE; r++) {
        var row = [];
        for (var c = 0; c < SIZE; c++) {
          var banned = {};
          if (c >= 2 && row[c - 1] === row[c - 2]) {
            banned[row[c - 1]] = true;
          }
          if (r >= 2 && board[r - 1][c] === board[r - 2][c]) {
            banned[board[r - 1][c]] = true;
          }
          var choices = [];
          for (var k = 0; k < KINDS; k++) {
            if (!banned[k]) {
              choices.push(k);
            }
          }
          row.push(choices[randInt(choices.length)]);
        }
        board.push(row);
      }
      if (findMatches(board).length === 0 && hasMove(board)) {
        return board;
      }
    }
    // 理論上不會到這裡；保底回傳一個固定的合法盤面
    return [
      [0, 1, 0, 1, 2],
      [2, 3, 2, 3, 0],
      [0, 1, 1, 0, 1],
      [3, 2, 3, 2, 3],
      [1, 0, 1, 3, 0]
    ].map(function (row) { return row.slice(); });
  }

  /**
   * 洗牌：保留現有元素，隨機重排（Fisher-Yates），直到「無現成三連線且有可行步」。
   * 若 200 次仍失敗（元素分布極端時可能發生），改為整盤重新產生。
   *
   * @param {Array<Array<number>>} board 目前盤面（會被就地改寫）
   * @returns {Array<Array<number>>} 洗牌後的同一個 board
   */
  function shuffleBoard(board) {
    var flat = [];
    var r;
    var c;
    for (r = 0; r < SIZE; r++) {
      for (c = 0; c < SIZE; c++) {
        flat.push(board[r][c]);
      }
    }
    for (var attempt = 0; attempt < 200; attempt++) {
      for (var i = flat.length - 1; i > 0; i--) {
        var j = randInt(i + 1);
        var t = flat[i];
        flat[i] = flat[j];
        flat[j] = t;
      }
      for (r = 0; r < SIZE; r++) {
        for (c = 0; c < SIZE; c++) {
          board[r][c] = flat[r * SIZE + c];
        }
      }
      if (findMatches(board).length === 0 && hasMove(board)) {
        return board;
      }
    }
    var fresh = createBoard();
    for (r = 0; r < SIZE; r++) {
      for (c = 0; c < SIZE; c++) {
        board[r][c] = fresh[r][c];
      }
    }
    return board;
  }

  /**
   * 重力下落（純邏輯版，供測試與說明）：每一欄把非空元素往下壓實，頂部補 null。
   * 動畫層使用相同規則，但針對磚塊物件而非元素編號。
   */
  function applyGravity(board) {
    for (var c = 0; c < SIZE; c++) {
      var write = SIZE - 1;
      for (var r = SIZE - 1; r >= 0; r--) {
        if (board[r][c] !== null) {
          board[write][c] = board[r][c];
          if (write !== r) {
            board[r][c] = null;
          }
          write--;
        }
      }
      for (var k = write; k >= 0; k--) {
        board[k][c] = null;
      }
    }
    return board;
  }

  /**
   * 連鎖計分：每顆 10 分；第 n 次連鎖（n 從 1 起算）的倍率為 1 + 0.5 * (n - 1)。
   * 例：首次消 3 顆 = 30；第二次連鎖消 3 顆 = 45；第三次 = 60。
   */
  function scoreFor(count, chain) {
    return Math.round(count * POINTS_PER_TILE * (1 + 0.5 * (chain - 1)));
  }

  // ───────────────────────── 緩動函式 ─────────────────────────

  function easeOutCubic(t) {
    var u = 1 - t;
    return 1 - u * u * u;
  }
  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
  // 輕微回彈：用於下落落地時的「軟綿綿」手感
  function easeOutBack(t) {
    var s = 1.2;
    var u = t - 1;
    return 1 + (s + 1) * u * u * u + s * u * u;
  }

  // ───────────────────────── 繪圖輔助 ─────────────────────────

  function roundRectPath(ctx, x, y, w, h, r) {
    var rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
  }

  /**
   * 畫「四角星光」：以四個尖角（上下左右）的星形 + 一條較細的斜向十字光芒組成。
   * 尖角用二次曲線往中心收束，看起來像閃爍的鑽石光點。
   */
  function drawSparkle(ctx, x, y, size, alpha, rotation, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fillStyle = color;
    var inner = size * 0.18; // 內凹程度，越小越尖
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.quadraticCurveTo(inner, -inner, size, 0);
    ctx.quadraticCurveTo(inner, inner, 0, size);
    ctx.quadraticCurveTo(-inner, inner, -size, 0);
    ctx.quadraticCurveTo(-inner, -inner, 0, -size);
    ctx.closePath();
    ctx.fill();
    // 細十字光（斜 45 度）增加閃亮感
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-size * 0.55, -size * 0.04, size * 1.1, size * 0.08);
    ctx.fillRect(-size * 0.04, -size * 0.55, size * 0.08, size * 1.1);
    ctx.restore();
  }

  /** 肉墊：優先使用 CatArt.drawPaw；若不存在則自行畫一個粉嫩圓墊 + 四個小圓 */
  function drawPawParticle(ctx, x, y, size, alpha, rotation) {
    var art = window.CatArt;
    if (art && typeof art.drawPaw === 'function') {
      art.drawPaw(ctx, x, y, size, alpha, rotation);
      return;
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation || 0);
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fillStyle = '#f4b6c6';
    ctx.beginPath();
    ctx.ellipse(0, size * 0.14, size * 0.28, size * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    var toes = [[-0.3, -0.16], [-0.11, -0.34], [0.11, -0.34], [0.3, -0.16]];
    for (var i = 0; i < toes.length; i++) {
      ctx.beginPath();
      ctx.arc(toes[i][0] * size, toes[i][1] * size, size * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ───────────────────────── 遊戲主體 ─────────────────────────

  /**
   * 啟動一局消除遊戲。
   * @param {HTMLCanvasElement} canvas
   * @param {{targetScore?:number,onScore?:function,onComplete?:function}} opts
   */
  function start(canvas, opts) {
    opts = opts || {};
    var targetScore = typeof opts.targetScore === 'number' ? opts.targetScore : 50;
    var onScore = typeof opts.onScore === 'function' ? opts.onScore : null;
    var onComplete = typeof opts.onComplete === 'function' ? opts.onComplete : null;

    var ctx = canvas.getContext('2d');
    var destroyed = false;
    var busy = true; // 動畫期間為 true，鎖定輸入
    var completed = false; // onComplete 只呼叫一次
    var score = 0;
    var rafId = 0;

    // 畫布版面（CSS 像素）；每幀依實際尺寸/DPR 重新計算
    var cssW = 0;
    var cssH = 0;
    var dpr = 1;
    var boardX = 0;
    var boardY = 0;
    var cell = 0;
    var cssLocked = false;

    // 盤面：grid[r][c] 為磚塊物件 {type, x, y, scale, alpha}，x / y 為「格座標」
    var grid = [];
    var selected = null; // 目前被點選的格 {r, c}
    var tweens = [];
    var particles = [];
    var banner = { text: '', t: 0, active: false }; // 連鎖提示文字
    var clock = 0; // 最近一幀的時間（ms），供閃爍/脈動使用

    // 預先配置粒子池：之後只重複使用，不再 new
    for (var pi = 0; pi < MAX_PARTICLES; pi++) {
      particles.push({
        active: false, kind: 0, x: 0, y: 0, vx: 0, vy: 0,
        age: 0, life: 1, size: 10, rot: 0, vr: 0, color: '#fff', phase: 0
      });
    }

    // ── 補間（tween）系統 ──
    // tween(duration, update, easing) 回傳 Promise；每幀由 frame() 推進，
    // 結束時以 p = 1 呼叫 update 一次再 resolve，確保終點數值精確。
    function tween(duration, update, easing) {
      return new Promise(function (resolve) {
        tweens.push({ dur: Math.max(1, duration), update: update, ease: easing || easeInOutQuad, start: -1, done: resolve });
      });
    }

    function wait(ms) {
      return tween(ms, function () {}, function (t) { return t; });
    }

    function stepTweens(now) {
      // 先複製，避免 resolve 後的續行同步新增 tween 影響本輪迭代
      var current = tweens;
      tweens = [];
      for (var i = 0; i < current.length; i++) {
        var tw = current[i];
        if (tw.start < 0) {
          tw.start = now;
        }
        var p = Math.min(1, (now - tw.start) / tw.dur);
        tw.update(tw.ease(p));
        if (p >= 1) {
          tw.done();
        } else {
          tweens.push(tw);
        }
      }
    }

    // ── 盤面 / 磚塊 ──

    function makeTile(type, r, c) {
      return { type: type, x: c, y: r, scale: 1, alpha: 1 };
    }

    function typeBoard() {
      var b = [];
      for (var r = 0; r < SIZE; r++) {
        var row = [];
        for (var c = 0; c < SIZE; c++) {
          row.push(grid[r][c] ? grid[r][c].type : null);
        }
        b.push(row);
      }
      return b;
    }

    function initGrid() {
      var board = createBoard();
      grid = [];
      for (var r = 0; r < SIZE; r++) {
        var row = [];
        for (var c = 0; c < SIZE; c++) {
          row.push(makeTile(board[r][c], r, c));
        }
        grid.push(row);
      }
    }

    function setScore(v) {
      score = v;
      if (onScore) {
        try { onScore(score); } catch (e) { /* 回呼錯誤不應中斷遊戲 */ }
      }
    }

    // ── 粒子（星光 + 肉墊） ──

    function acquireParticle() {
      for (var i = 0; i < particles.length; i++) {
        if (!particles[i].active) {
          return particles[i];
        }
      }
      return null; // 池已滿就放棄這顆，避免卡頓
    }

    var SPARKLE_COLORS = ['#fff7d6', '#ffffff', '#ffe3ef', '#e6f4ea'];

    /**
     * 在格子中心產生「星光閃爍」與「肉墊爆開」粒子。
     *   - 星光：向四周緩慢漂移，生命週期內以 sin 曲線淡入淡出，並疊加高頻 sin 造成閃爍。
     *   - 肉墊：由中心向外噴出（含微小重力下墜），邊飛邊旋轉並線性漸隱。
     */
    function burstAt(cx, cy, chain) {
      var i;
      var sparkleCount = 3 + Math.min(chain, 3);
      for (i = 0; i < sparkleCount; i++) {
        var s = acquireParticle();
        if (!s) {
          break;
        }
        var ang = Math.random() * Math.PI * 2;
        var spd = (0.25 + Math.random() * 0.55) * cell * 0.9; // px / 秒
        s.active = true;
        s.kind = 0;
        s.x = cx + (Math.random() - 0.5) * cell * 0.4;
        s.y = cy + (Math.random() - 0.5) * cell * 0.4;
        s.vx = Math.cos(ang) * spd;
        s.vy = Math.sin(ang) * spd;
        s.age = 0;
        s.life = 500 + Math.random() * 400;
        s.size = cell * (0.1 + Math.random() * 0.14);
        s.rot = Math.random() * Math.PI;
        s.vr = (Math.random() - 0.5) * 3;
        s.color = SPARKLE_COLORS[randInt(SPARKLE_COLORS.length)];
        s.phase = Math.random() * Math.PI * 2;
      }
      var pawCount = chain > 1 ? 2 : 1;
      for (i = 0; i < pawCount; i++) {
        var p = acquireParticle();
        if (!p) {
          break;
        }
        var a2 = Math.random() * Math.PI * 2;
        var sp2 = (0.9 + Math.random() * 0.9) * cell;
        p.active = true;
        p.kind = 1;
        p.x = cx;
        p.y = cy;
        p.vx = Math.cos(a2) * sp2;
        p.vy = Math.sin(a2) * sp2 - cell * 0.5; // 先往上噴再落下
        p.age = 0;
        p.life = 650 + Math.random() * 250;
        p.size = cell * (0.22 + Math.random() * 0.12);
        p.rot = Math.random() * Math.PI * 2;
        p.vr = (Math.random() - 0.5) * 4;
        p.phase = 0;
      }
    }

    function updateParticles(dt) {
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (!p.active) {
          continue;
        }
        p.age += dt;
        if (p.age >= p.life) {
          p.active = false;
          continue;
        }
        var sec = dt / 1000;
        p.x += p.vx * sec;
        p.y += p.vy * sec;
        p.rot += p.vr * sec;
        if (p.kind === 1) {
          p.vy += cell * 2.2 * sec; // 肉墊受輕微重力
          p.vx *= 0.985;
        } else {
          p.vx *= 0.97; // 星光逐漸減速，像漂浮的光點
          p.vy *= 0.97;
        }
      }
    }

    function drawParticles() {
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (!p.active) {
          continue;
        }
        var prog = p.age / p.life;
        if (p.kind === 0) {
          // 淡入淡出包絡 × 快速閃爍
          var env = Math.sin(Math.PI * prog);
          var twinkle = 0.65 + 0.35 * Math.sin(p.age * 0.03 + p.phase);
          drawSparkle(ctx, p.x, p.y, p.size * (0.7 + 0.5 * env), env * twinkle, p.rot, p.color);
        } else {
          // 肉墊：前 15% 快速出現，之後線性漸隱
          var fade = prog < 0.15 ? prog / 0.15 : 1 - (prog - 0.15) / 0.85;
          drawPawParticle(ctx, p.x, p.y, p.size, fade * 0.9, p.rot);
        }
      }
    }

    // ── 版面 ──

    // 取得畫布的 CSS 尺寸；畫布尚未顯示（例如彈窗隱藏）時回傳 false
    function measure() {
      var w = canvas.clientWidth;
      var h = canvas.clientHeight;
      if (!w || !h) {
        return false;
      }
      // 若畫布沒有任何 CSS 尺寸（寬高完全由屬性決定），先把 CSS 尺寸固定下來，
      // 否則之後為了 DPR 放大 canvas.width 會連帶撐大版面
      if (!cssLocked) {
        cssLocked = true;
        var cs = window.getComputedStyle ? window.getComputedStyle(canvas) : null;
        if (cs && !canvas.style.width && !canvas.style.height &&
            parseFloat(cs.width) === canvas.width && parseFloat(cs.height) === canvas.height) {
          canvas.style.width = w + 'px';
          canvas.style.height = h + 'px';
        }
      }
      var ratio = window.devicePixelRatio || 1;
      if (w !== cssW || h !== cssH || ratio !== dpr) {
        cssW = w;
        cssH = h;
        dpr = ratio;
        canvas.width = Math.round(cssW * dpr);
        canvas.height = Math.round(cssH * dpr);
      }
      var side = Math.min(cssW, cssH);
      var pad = side * 0.03;
      cell = (side - pad * 2) / SIZE;
      boardX = (cssW - cell * SIZE) / 2;
      boardY = (cssH - cell * SIZE) / 2;
      return true;
    }

    // ── 繪製 ──

    function drawTile(t) {
      var cx = boardX + (t.x + 0.5) * cell;
      var cy = boardY + (t.y + 0.5) * cell;
      var half = cell * 0.5 * 0.9 * t.scale;
      if (half <= 0.5 || t.alpha <= 0) {
        return;
      }
      var col = TILE_COLORS[t.type];
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, t.alpha));
      // 柔和陰影
      ctx.shadowColor = 'rgba(90, 70, 80, 0.22)';
      ctx.shadowBlur = cell * 0.12;
      ctx.shadowOffsetY = cell * 0.04;
      var grad = ctx.createLinearGradient(cx, cy - half, cx, cy + half);
      grad.addColorStop(0, col.top);
      grad.addColorStop(1, col.bottom);
      ctx.fillStyle = grad;
      roundRectPath(ctx, cx - half, cy - half, half * 2, half * 2, cell * 0.24 * t.scale);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      // 上緣高光
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = Math.max(1, cell * 0.025);
      ctx.stroke();
      // 元素 emoji
      ctx.font = Math.round(cell * 0.5 * t.scale) + 'px ' + EMOJI_FONT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#000';
      ctx.fillText(EMOJI[t.type], cx, cy + cell * 0.03);
      ctx.restore();
    }

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      // 盤面底板
      var pad = cell * 0.08;
      ctx.save();
      ctx.shadowColor = 'rgba(120, 90, 100, 0.18)';
      ctx.shadowBlur = cell * 0.2;
      ctx.fillStyle = '#f6eee9';
      roundRectPath(ctx, boardX - pad, boardY - pad, cell * SIZE + pad * 2, cell * SIZE + pad * 2, cell * 0.32);
      ctx.fill();
      ctx.restore();
      // 格線底洞：每格一個淡淡的凹槽
      ctx.fillStyle = 'rgba(190, 165, 160, 0.16)';
      for (var r = 0; r < SIZE; r++) {
        for (var c = 0; c < SIZE; c++) {
          roundRectPath(ctx, boardX + c * cell + cell * 0.05, boardY + r * cell + cell * 0.05, cell * 0.9, cell * 0.9, cell * 0.24);
          ctx.fill();
        }
      }

      // 磚塊（裁切在底板內，新磚從上方落入時不會畫到盤面外）
      ctx.save();
      roundRectPath(ctx, boardX - pad, boardY - pad, cell * SIZE + pad * 2, cell * SIZE + pad * 2, cell * 0.32);
      ctx.clip();
      for (r = 0; r < SIZE; r++) {
        for (c = 0; c < SIZE; c++) {
          if (grid[r] && grid[r][c]) {
            drawTile(grid[r][c]);
          }
        }
      }
      ctx.restore();

      // 選取框：呼吸脈動的白色外框
      if (selected && grid[selected.r] && grid[selected.r][selected.c]) {
        var pulse = 0.5 + 0.5 * Math.sin(clock * 0.008);
        var sx = boardX + selected.c * cell + cell * 0.04;
        var sy = boardY + selected.r * cell + cell * 0.04;
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, ' + (0.7 + 0.3 * pulse).toFixed(2) + ')';
        ctx.shadowColor = 'rgba(244, 160, 190, 0.9)';
        ctx.shadowBlur = cell * (0.1 + 0.1 * pulse);
        ctx.lineWidth = Math.max(2, cell * 0.06);
        roundRectPath(ctx, sx, sy, cell * 0.92, cell * 0.92, cell * 0.26);
        ctx.stroke();
        ctx.restore();
      }

      drawParticles();

      // 連鎖提示：向上飄並淡出
      if (banner.active) {
        var bp = Math.min(1, banner.t / 900);
        ctx.save();
        ctx.globalAlpha = bp < 0.2 ? bp / 0.2 : 1 - (bp - 0.2) / 0.8;
        ctx.font = 'bold ' + Math.round(cell * 0.5) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = cell * 0.08;
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.fillStyle = '#d97c9b';
        var by = boardY + cell * 2.5 - bp * cell * 0.6;
        ctx.strokeText(banner.text, cssW / 2, by);
        ctx.fillText(banner.text, cssW / 2, by);
        ctx.restore();
      }
    }

    // ── 主迴圈（requestAnimationFrame） ──

    var lastTime = 0;
    function frame(now) {
      if (destroyed) {
        return;
      }
      rafId = window.requestAnimationFrame(frame);
      var dt = lastTime ? Math.min(64, now - lastTime) : 16; // 限制單幀 dt，避免切分頁回來後粒子瞬間爆跳
      lastTime = now;
      clock = now;
      if (!measure()) {
        return; // 畫布隱藏時暫停繪製與補間，顯示後再繼續
      }
      stepTweens(now);
      updateParticles(dt);
      if (banner.active) {
        banner.t += dt;
        if (banner.t >= 900) {
          banner.active = false;
        }
      }
      draw();
    }

    // ── 遊戲流程（async） ──

    function inRange(r, c) {
      return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
    }

    function isAdjacent(a, b) {
      return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
    }

    /** 讓兩個磚塊動畫互換位置，並同步更新 grid */
    async function animateSwap(a, b) {
      var ta = grid[a.r][a.c];
      var tb = grid[b.r][b.c];
      var ax = ta.x;
      var ay = ta.y;
      var bx = tb.x;
      var by = tb.y;
      grid[a.r][a.c] = tb;
      grid[b.r][b.c] = ta;
      await tween(170, function (p) {
        ta.x = ax + (bx - ax) * p;
        ta.y = ay + (by - ay) * p;
        tb.x = bx + (ax - bx) * p;
        tb.y = by + (ay - by) * p;
      }, easeInOutQuad);
    }

    /**
     * 嘗試交換兩個相鄰格：
     *   1. 先交換並播放動畫；
     *   2. 若交換後沒有任何三連線，動畫還原；
     *   3. 否則進入「消除 → 下落 → 補新 → 連鎖」迴圈。
     */
    async function trySwap(a, b) {
      busy = true;
      selected = null;
      await animateSwap(a, b);
      if (destroyed) {
        return;
      }
      if (findMatches(typeBoard()).length === 0) {
        await animateSwap(a, b); // 無消除：還原
        if (destroyed) {
          return;
        }
        busy = false;
        return;
      }
      await resolveBoard();
    }

    /**
     * 連鎖主迴圈：
     *   while 盤面有三連線：
     *     chain++ → 計分 → 特效 → 縮小消失 → 重力下落 → 頂部補新 → 再掃描
     * 全部穩定後：若無可行步就洗牌；若達標則在動畫結束後呼叫一次 onComplete。
     */
    async function resolveBoard() {
      var chain = 0;
      var matches = findMatches(typeBoard());
      while (matches.length > 0) {
        chain++;
        await clearCells(matches, chain);
        if (destroyed) {
          return;
        }
        await dropAndRefill();
        if (destroyed) {
          return;
        }
        matches = findMatches(typeBoard());
      }

      // 穩定後確保至少有可行步，否則洗牌
      while (!hasMove(typeBoard())) {
        await reshuffleAnimated();
        if (destroyed) {
          return;
        }
      }

      if (score >= targetScore && !completed) {
        completed = true;
        await wait(450); // 讓最後一波粒子有時間播完
        if (destroyed) {
          return;
        }
        if (onComplete) {
          try { onComplete(score); } catch (e) { /* 回呼錯誤不應中斷 */ }
        }
        return; // 完成後維持鎖定
      }
      busy = false;
    }

    /** 一次清除所有標記格：計分、噴粒子、縮小淡出，最後從 grid 移除 */
    async function clearCells(cells, chain) {
      setScore(score + scoreFor(cells.length, chain));
      if (window.CatAudio && typeof window.CatAudio.crystal === 'function') {
        try { window.CatAudio.crystal(); } catch (e) { /* 音效失敗不影響遊戲 */ }
      }
      var tiles = [];
      for (var i = 0; i < cells.length; i++) {
        var t = grid[cells[i].r][cells[i].c];
        tiles.push(t);
        burstAt(boardX + (t.x + 0.5) * cell, boardY + (t.y + 0.5) * cell, chain);
      }
      if (chain >= 2) {
        banner.text = '連鎖 x' + chain + '！';
        banner.t = 0;
        banner.active = true;
      }
      // 前 30% 先微微膨脹，之後縮小並淡出，營造「啵」一聲的彈出感
      await tween(260, function (p) {
        var s = p < 0.3 ? 1 + 0.2 * (p / 0.3) : 1.2 * (1 - (p - 0.3) / 0.7);
        for (var k = 0; k < tiles.length; k++) {
          tiles[k].scale = Math.max(0, s);
          tiles[k].alpha = p < 0.3 ? 1 : 1 - (p - 0.3) / 0.7;
        }
      }, function (t) { return t; });
      for (var j = 0; j < cells.length; j++) {
        grid[cells[j].r][cells[j].c] = null;
      }
    }

    /**
     * 重力下落 + 頂部補新：
     *   對每一欄由下往上掃描，把非空磚塊「壓實」到最下方（write 指標），
     *   欄頂剩下的空位數量即為需補的新磚；新磚從盤面上方（負的 y）開始掉入，
     *   各磚塊的起訖位置記錄下來，用同一個 tween 以 easeOutBack 一起落下。
     */
    async function dropAndRefill() {
      var moves = [];
      var maxDist = 0;
      for (var c = 0; c < SIZE; c++) {
        var write = SIZE - 1;
        for (var r = SIZE - 1; r >= 0; r--) {
          var t = grid[r][c];
          if (t) {
            if (write !== r) {
              grid[write][c] = t;
              grid[r][c] = null;
              moves.push({ tile: t, fromY: t.y, toY: write });
              maxDist = Math.max(maxDist, write - r);
            }
            write--;
          }
        }
        var missing = write + 1; // 欄頂的空位數
        for (var k = write; k >= 0; k--) {
          var nt = makeTile(randInt(KINDS), k, c);
          nt.y = k - missing; // 疊在盤面上方，依序掉入
          grid[k][c] = nt;
          moves.push({ tile: nt, fromY: nt.y, toY: k });
          maxDist = Math.max(maxDist, missing);
        }
      }
      if (moves.length === 0) {
        return;
      }
      await tween(160 + maxDist * 70, function (p) {
        for (var i = 0; i < moves.length; i++) {
          var m = moves[i];
          m.tile.y = m.fromY + (m.toY - m.fromY) * p;
        }
      }, easeOutBack);
      for (var i = 0; i < moves.length; i++) {
        moves[i].tile.y = moves[i].toY; // 修正回彈造成的殘餘誤差
      }
    }

    /** 無解時洗牌：全部縮小 → 重排元素 → 彈回，並以星光提示 */
    async function reshuffleAnimated() {
      var r;
      var c;
      await tween(180, function (p) {
        for (r = 0; r < SIZE; r++) {
          for (c = 0; c < SIZE; c++) {
            grid[r][c].scale = 1 - 0.85 * p;
          }
        }
      }, easeInOutQuad);
      if (destroyed) {
        return;
      }
      var board = shuffleBoard(typeBoard());
      for (r = 0; r < SIZE; r++) {
        for (c = 0; c < SIZE; c++) {
          grid[r][c].type = board[r][c];
          burstAt(boardX + (c + 0.5) * cell, boardY + (r + 0.5) * cell, 0);
        }
      }
      await tween(240, function (p) {
        for (r = 0; r < SIZE; r++) {
          for (c = 0; c < SIZE; c++) {
            grid[r][c].scale = 0.15 + 0.85 * p;
          }
        }
      }, easeOutBack);
      for (r = 0; r < SIZE; r++) {
        for (c = 0; c < SIZE; c++) {
          grid[r][c].scale = 1;
        }
      }
    }

    // ── 輸入（Pointer Events） ──

    var drag = null; // {id, r, c, x, y, swiped}

    function cellAt(ev) {
      var rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return null;
      }
      // 轉回邏輯 CSS 像素，相容被 CSS 縮放的畫布
      var x = (ev.clientX - rect.left) * (cssW / rect.width);
      var y = (ev.clientY - rect.top) * (cssH / rect.height);
      var c = Math.floor((x - boardX) / cell);
      var r = Math.floor((y - boardY) / cell);
      if (!inRange(r, c)) {
        return null;
      }
      return { r: r, c: c, x: x, y: y };
    }

    function onPointerDown(ev) {
      if (busy || destroyed || (ev.button !== undefined && ev.button > 0)) {
        return;
      }
      var hit = cellAt(ev);
      if (!hit) {
        return;
      }
      ev.preventDefault();
      drag = { id: ev.pointerId, r: hit.r, c: hit.c, x: hit.x, y: hit.y, swiped: false };
      if (canvas.setPointerCapture) {
        try { canvas.setPointerCapture(ev.pointerId); } catch (e) { /* 部分環境不支援 */ }
      }
    }

    /**
     * 滑動判定：手指在起始格內移動超過 0.35 格後，依位移較大的軸決定方向，
     * 與該方向的鄰格交換；每次按下只觸發一次。
     */
    function onPointerMove(ev) {
      if (!drag || drag.swiped || ev.pointerId !== drag.id || busy || destroyed) {
        return;
      }
      var rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }
      var x = (ev.clientX - rect.left) * (cssW / rect.width);
      var y = (ev.clientY - rect.top) * (cssH / rect.height);
      var dx = x - drag.x;
      var dy = y - drag.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < cell * 0.35) {
        return;
      }
      var target = { r: drag.r, c: drag.c };
      if (Math.abs(dx) >= Math.abs(dy)) {
        target.c += dx > 0 ? 1 : -1;
      } else {
        target.r += dy > 0 ? 1 : -1;
      }
      drag.swiped = true;
      if (inRange(target.r, target.c)) {
        trySwap({ r: drag.r, c: drag.c }, target);
      }
    }

    /** 點選：第一次選取；再點相鄰格交換；點同一格取消；點非相鄰格改選新格 */
    function onPointerUp(ev) {
      if (!drag || ev.pointerId !== drag.id) {
        return;
      }
      var d = drag;
      drag = null;
      if (d.swiped || busy || destroyed) {
        return;
      }
      var hit = cellAt(ev);
      if (!hit || hit.r !== d.r || hit.c !== d.c) {
        return;
      }
      var here = { r: hit.r, c: hit.c };
      if (selected && selected.r === here.r && selected.c === here.c) {
        selected = null;
      } else if (selected && isAdjacent(selected, here)) {
        trySwap({ r: selected.r, c: selected.c }, here);
      } else {
        selected = here;
      }
    }

    function onPointerCancel(ev) {
      if (drag && ev.pointerId === drag.id) {
        drag = null;
      }
    }

    canvas.style.touchAction = 'none'; // 避免滑動手勢被瀏覽器當成捲動
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerCancel);

    // ── 啟動 ──

    initGrid();
    measure();
    setScore(0);
    busy = false;
    rafId = window.requestAnimationFrame(frame);

    return {
      /** 取消 RAF 與事件；並解除所有等待中的補間，讓 async 流程自然結束 */
      destroy: function () {
        if (destroyed) {
          return;
        }
        destroyed = true;
        if (rafId) {
          window.cancelAnimationFrame(rafId);
        }
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.removeEventListener('pointercancel', onPointerCancel);
        var pending = tweens;
        tweens = [];
        for (var i = 0; i < pending.length; i++) {
          pending[i].done();
        }
        drag = null;
        selected = null;
      }
    };
  }

  window.CatMatch3 = {
    start: start,
    // 供 Node 單元測試的純邏輯（不依賴 DOM）
    _internals: {
      findMatches: findMatches,
      hasMove: hasMove,
      findMove: findMove,
      createBoard: createBoard,
      shuffleBoard: shuffleBoard,
      applyGravity: applyGravity,
      scoreFor: scoreFor
    }
  };
})();
