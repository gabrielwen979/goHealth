/*
 * match3.js —《肉墊的夢境編織》5x5 萌貓寶物消除（含關卡難度、障礙物、特殊寶物、步數限制）
 *
 * 對外只暴露一個命名空間：window.CatMatch3
 *   CatMatch3.start(canvas, {
 *     targetScore, onScore(score), onComplete(score),            // 舊有選項（向下相容）
 *     level, moves, onMovesChange(left), onFail({score,reason})   // 新增選項（皆為選填）
 *   }) → { destroy() }
 *   CatMatch3.difficultyFor(level) → { targetScore, moves, gemTypes, frozen, stone }
 *   CatMatch3._internals = { findMatches, hasMove, findMove, createBoard、listMoves、planStep、shuffleBoard、sim 等 }（供 Node 測試）
 *
 * 架構概觀：
 *   1. 純邏輯層：不依賴 DOM / Canvas，可直接在 Node 中測試與模擬。
 *      - 數字盤面 board[r][c]：0~5 = 寶石種類；null = 空格；
 *        -1 = 冰凍毛線障礙、-2 = 石頭障礙、-3 = 彩虹特殊寶物（可交換但不參與三連線）。
 *      - 格子盤面 grid[r][c]：{type, special, block, hp} 物件；動畫層的磚塊是它的超集合（多了 x/y/scale/alpha）。
 *   2. 動畫層：每個磚塊是帶有 x / y（格座標，可為小數）、scale、alpha 的物件，
 *      以時間為基礎的補間（tween）驅動；async/await 串起「交換 → 消除 → 下落 → 補新 → 連鎖」。
 *   3. 特效層：固定大小的粒子池（星光閃爍 + 肉墊爆開）與光束，避免連鎖時大量配置物件造成卡頓。
 *   4. 輸入層：Pointer Events，支援「點選相鄰兩格」與「滑動」，動畫期間鎖定輸入。
 */
(function () {
  'use strict';

  // ───────────────────────── 常數 ─────────────────────────

  var SIZE = 5; // 盤面為 SIZE x SIZE
  var BASE_KINDS = 4; // 預設元素種類數（未指定關卡時與舊版相同）
  var MAX_KINDS = 6; // 元素種類上限
  var POINTS_PER_TILE = 10; // 每顆基本分數
  var CRACK_BONUS = 10; // 敲開冰凍毛線的額外分數
  var BREAK_BONUS = 20; // 擊碎石頭的額外分數
  var MAX_PARTICLES = 160; // 粒子池上限
  var MAX_BEAMS = 40; // 光束上限

  // 特殊寶物種類（tile.special）
  var SP_NONE = 0;
  var SP_ROW = 1; // 炸藥球：觸發時十字爆破，清掉整列與整欄（上下左右）
  var SP_COL = 2; // 保留舊值（不再產生；若出現視同炸藥球）
  var BOMB_CHANCE_3 = 0.22; // 普通三連消也有機率留下炸藥球
  var SP_RAINBOW = 3; // 彩虹：與相鄰寶石交換，清掉盤面上所有同種寶石

  // 障礙種類（tile.block）
  var BLK_NONE = 0;
  var BLK_FROZEN = 1; // 冰凍毛線：旁邊有一次消除就會破裂，破裂前不能交換、不會下落
  var BLK_STONE = 2; // 石頭：需被相鄰消除命中 2 次，不能交換、不會下落

  // 數字盤面中代表特殊格的值
  var V_FROZEN = -1;
  var V_STONE = -2;
  var V_RAINBOW = -3;

  // 六種元素：💎 🧪 🐟 🧶（前四種為主題寶物）、🐾（第 3 關起）、🌸（第 7 關起）
  var EMOJI = ['\uD83D\uDC8E', '\uD83E\uDDEA', '\uD83D\uDC1F', '\uD83E\uDDF6', '\uD83D\uDC3E', '\uD83C\uDF38'];
  var TILE_COLORS = [
    { top: '#cfe0d3', bottom: '#aac4b1' }, // 💎 鼠尾草綠
    { top: '#f0e3c4', bottom: '#d9c496' }, // 🧪 香檳金
    { top: '#c4d3e0', bottom: '#9fb3c6' }, // 🐟 霧藍灰
    { top: '#f0cfd6', bottom: '#dba9b5' }, // 🧶 乾燥玫瑰粉
    { top: '#dcd3ea', bottom: '#b9aad2' }, // 🐾 薰衣草紫
    { top: '#f6d9c8', bottom: '#e3b49a' }  // 🌸 蜜桃橘
  ];
  var EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

  // 可被外部（測試）替換的亂數來源，方便用固定種子做可重現的模擬
  var rng = Math.random;
  // 補新時避開「立刻連線」種類的機率（0 = 純隨機）；依關卡設定，見 start()
  var refillAvoid = 0;

  function randInt(n) {
    return Math.floor(rng() * n);
  }

  // ───────────────────────── 難度曲線 ─────────────────────────

  /**
   * 依關卡回傳難度參數（main.js 直接把結果傳給 start 即可）。
   *   - targetScore：第 1 關 50，快速爬升後緩慢上升（見 TARGET_RAMP）
   *   - moves：步數限制，隨關卡遞減並有下限（越後面越緊）
   *   - gemTypes：寶石種類，1~2 關 4 種、3~6 關 5 種、7 關起 6 種
   *   - frozen：冰凍毛線數量，第 3 關起出現
   *   - stone：石頭數量，第 6 關起出現
   * 曲線經由 Node 機器人模擬校準（見 _internals.sim），參數集中在此處方便再調整。
   */
  function difficultyFor(level) {
    var L = Math.max(1, Math.floor(Number(level) || 1));
    var gemTypes = L >= 7 ? 6 : (L >= 3 ? 5 : 4);
    var frozen = L >= 3 ? Math.min(6, 1 + Math.floor((L - 3) / 2)) : 0;
    var stone = L >= 6 ? Math.min(4, 1 + Math.floor((L - 6) / 3)) : 0;
    var targetScore = TARGET_PLATEAU;
    if (L < TARGET_RAMP.length) {
      targetScore = TARGET_RAMP[L];
    } else {
      targetScore = TARGET_PLATEAU + TARGET_STEP * (L - TARGET_RAMP.length + 1);
    }
    var moves = MOVES_TABLE(L);
    return { targetScore: targetScore, moves: moves, gemTypes: gemTypes, frozen: frozen, stone: stone };
  }

  // 目標分數：第 1 關 50（教學關），第 2~6 關快速爬升，之後緩慢上升；
  // 由機器人模擬校準——5x5 小盤面的連鎖加成讓「每步」約得 45~60 分，
  // 因此後期目標遠高於 400，難度主要靠「目標 / 步數」的比值與障礙物控制。
  var TARGET_RAMP = [0, 50, 250, 400, 500, 570, 625];
  var TARGET_PLATEAU = 640;
  var TARGET_STEP = 4;

  // 步數曲線：第 1 關 40 步（原 20 步的兩倍），之後逐步縮減至下限
  function MOVES_TABLE(L) {
    return Math.max(MOVES_FLOOR, 40 - Math.floor((L - 1) * MOVES_SLOPE));
  }
  var MOVES_FLOOR = 30;
  var MOVES_SLOPE = 0.9;

  // ───────────────────────── 純邏輯：消除判定 ─────────────────────────

  /** 該值是否為「固定不動」的障礙（冰凍毛線 / 石頭） */
  function isFixedValue(v) {
    return v === V_FROZEN || v === V_STONE;
  }

  /** 該值是否可被玩家交換（寶石或彩虹） */
  function isSwappableValue(v) {
    return v !== null && v !== undefined && (v >= 0 || v === V_RAINBOW);
  }

  /**
   * 找出所有「水平或垂直連續 ≥3 顆同種寶石」的連線段（run）。
   *
   * 算法（一次掃描、一次標記）：
   *   - 先逐列（水平）掃描：用 runStart 記錄目前連續相同寶石的起點，
   *     當寶石改變或到達列尾時，若長度 ≥3，就把這段 run 記錄下來。
   *   - 再逐欄（垂直）以相同方式掃描。
   *   - 只有 v >= 0 的值（真正的寶石）能形成連線；null、障礙（-1/-2）、彩虹（-3）都會中斷連線。
   *
   * @returns {Array<{dir:string, cells:Array<{r:number,c:number}>}>} dir 為 'h' 或 'v'
   */
  function findRuns(board) {
    var rows = board.length;
    var cols = rows > 0 ? board[0].length : 0;
    var runs = [];
    var r;
    var c;

    // 以 getter 抽象方向，讓水平與垂直共用同一段掃描程式
    function scanLine(length, getCell, makeCell, dir) {
      var runStart = 0;
      for (var i = 1; i <= length; i++) {
        var prev = getCell(i - 1);
        var cur = i < length ? getCell(i) : undefined; // 越界視為「寶石改變」以結算最後一段
        var sameAsPrev = i < length && cur !== null && cur !== undefined && cur >= 0 && cur === prev;
        if (!sameAsPrev) {
          var runLen = i - runStart;
          if (runLen >= 3 && prev !== null && prev !== undefined && prev >= 0) {
            var cells = [];
            for (var k = runStart; k < i; k++) {
              cells.push(makeCell(k));
            }
            runs.push({ dir: dir, cells: cells });
          }
          runStart = i;
        }
      }
    }

    for (r = 0; r < rows; r++) {
      (function (row) {
        scanLine(cols, function (i) { return board[row][i]; }, function (i) { return { r: row, c: i }; }, 'h');
      })(r);
    }
    for (c = 0; c < cols; c++) {
      (function (col) {
        scanLine(rows, function (i) { return board[i][col]; }, function (i) { return { r: i, c: col }; }, 'v');
      })(c);
    }
    return runs;
  }

  /**
   * 判定盤面上所有待清除的格子（水平 / 垂直連線的聯集，交叉格只算一次，L/T/十字形同時清除）。
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
    var runs = findRuns(board);
    for (var i = 0; i < runs.length; i++) {
      for (var k = 0; k < runs[i].cells.length; k++) {
        marked[runs[i].cells[k].r][runs[i].cells[k].c] = true;
      }
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

  function swapCells(board, r1, c1, r2, c2) {
    var t = board[r1][c1];
    board[r1][c1] = board[r2][c2];
    board[r2][c2] = t;
  }

  /**
   * 這一步交換是否有效：
   *   - 兩格都必須可交換（障礙與空格不行）；
   *   - 任一格是彩虹 → 一定有效（彩虹與相鄰寶石交換即觸發）；
   *   - 否則交換後必須產生三連線。
   * 交換在原陣列上進行並立刻換回，因此不會改變傳入的盤面。
   */
  function isValidSwap(board, r1, c1, r2, c2) {
    var a = board[r1][c1];
    var b = board[r2][c2];
    if (!isSwappableValue(a) || !isSwappableValue(b)) {
      return false;
    }
    if (a === V_RAINBOW || b === V_RAINBOW) {
      return true;
    }
    if (a === b) {
      return false; // 同種交換不會有變化
    }
    swapCells(board, r1, c1, r2, c2);
    var ok = findRuns(board).length > 0;
    swapCells(board, r1, c1, r2, c2);
    return ok;
  }

  /** 列出所有有效步（每格只與右、下鄰格配對，其餘方向由對稱性涵蓋） */
  function listMoves(board) {
    var rows = board.length;
    var cols = rows > 0 ? board[0].length : 0;
    var out = [];
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (c + 1 < cols && isValidSwap(board, r, c, r, c + 1)) {
          out.push({ a: { r: r, c: c }, b: { r: r, c: c + 1 } });
        }
        if (r + 1 < rows && isValidSwap(board, r, c, r + 1, c)) {
          out.push({ a: { r: r, c: c }, b: { r: r + 1, c: c } });
        }
      }
    }
    return out;
  }

  /** 找出一個有效步；沒有則回傳 null */
  function findMove(board) {
    var rows = board.length;
    var cols = rows > 0 ? board[0].length : 0;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (c + 1 < cols && isValidSwap(board, r, c, r, c + 1)) {
          return { a: { r: r, c: c }, b: { r: r, c: c + 1 } };
        }
        if (r + 1 < rows && isValidSwap(board, r, c, r + 1, c)) {
          return { a: { r: r, c: c }, b: { r: r + 1, c: c } };
        }
      }
    }
    return null;
  }

  /** 盤面是否至少存在一個可行步 */
  function hasMove(board) {
    return findMove(board) !== null;
  }

  // ───────────────────────── 純邏輯：格子盤面（grid） ─────────────────────────

  /** 建立一個格子物件；動畫層的磚塊在此基礎上再加 x / y / scale / alpha */
  function makeCellObj(type) {
    return { type: type, special: SP_NONE, block: BLK_NONE, hp: 0 };
  }

  /** 格子盤面 → 數字盤面（障礙 -1/-2、彩虹 -3、空格 null） */
  function boardOf(grid) {
    var b = [];
    for (var r = 0; r < SIZE; r++) {
      var row = [];
      for (var c = 0; c < SIZE; c++) {
        var t = grid[r][c];
        if (!t) {
          row.push(null);
        } else if (t.block === BLK_FROZEN) {
          row.push(V_FROZEN);
        } else if (t.block === BLK_STONE) {
          row.push(V_STONE);
        } else if (t.special === SP_RAINBOW) {
          row.push(V_RAINBOW);
        } else {
          row.push(t.type);
        }
      }
      b.push(row);
    }
    return b;
  }

  /**
   * 產生合法的初始數字盤面（不含特殊寶物）：
   *   - 先隨機決定障礙位置（石頭 / 冰凍毛線，上限合計 10 個）；
   *   - 其餘格逐格隨機填入，若該格會與左側兩格或上方兩格同種而形成三連線，就排除該寶石重抽，
   *     因此初始盤面「不可能」有現成三連線（障礙會中斷連線，所以不影響判斷）；
   *   - 填完後若沒有可行步，就整盤重生。
   * 冰凍毛線的底下寶石種類另存於 hidden（board 只顯示 -1）。
   *
   * @returns {{board:Array, hidden:Array}} hidden[r][c] 為冰凍格底下的寶石種類（其餘為 null）
   */
  function buildInitial(kinds, nFrozen, nStone) {
    kinds = Math.max(3, Math.min(MAX_KINDS, kinds || BASE_KINDS));
    nFrozen = Math.max(0, nFrozen || 0);
    nStone = Math.max(0, nStone || 0);
    while (nFrozen + nStone > 10) {
      nFrozen--;
    }
    for (var attempt = 0; attempt < 2000; attempt++) {
      var board = [];
      var hidden = [];
      var r;
      var c;
      for (r = 0; r < SIZE; r++) {
        board.push(new Array(SIZE).fill(0));
        hidden.push(new Array(SIZE).fill(null));
      }
      // 隨機挑選障礙位置：把 25 格洗牌後取前 N 格
      var spots = [];
      for (var i = 0; i < SIZE * SIZE; i++) {
        spots.push(i);
      }
      for (var j = spots.length - 1; j > 0; j--) {
        var jj = randInt(j + 1);
        var tmp = spots[j];
        spots[j] = spots[jj];
        spots[jj] = tmp;
      }
      var isBlock = {};
      for (var s = 0; s < nStone + nFrozen; s++) {
        var pr = Math.floor(spots[s] / SIZE);
        var pc = spots[s] % SIZE;
        isBlock[spots[s]] = true;
        if (s < nStone) {
          board[pr][pc] = V_STONE;
        } else {
          board[pr][pc] = V_FROZEN;
          hidden[pr][pc] = randInt(kinds);
        }
      }
      for (r = 0; r < SIZE; r++) {
        for (c = 0; c < SIZE; c++) {
          if (isBlock[r * SIZE + c]) {
            continue;
          }
          var banned = {};
          if (c >= 2 && board[r][c - 1] >= 0 && board[r][c - 1] === board[r][c - 2]) {
            banned[board[r][c - 1]] = true;
          }
          if (r >= 2 && board[r - 1][c] >= 0 && board[r - 1][c] === board[r - 2][c]) {
            banned[board[r - 1][c]] = true;
          }
          var choices = [];
          for (var k = 0; k < kinds; k++) {
            if (!banned[k]) {
              choices.push(k);
            }
          }
          board[r][c] = choices[randInt(choices.length)];
        }
      }
      if (findMatches(board).length === 0 && hasMove(board)) {
        return { board: board, hidden: hidden };
      }
    }
    // 理論上不會到這裡；保底回傳一個固定的合法盤面（4 種寶石、無障礙）
    return {
      board: [
        [0, 1, 0, 1, 2],
        [2, 3, 2, 3, 0],
        [0, 1, 1, 0, 1],
        [3, 2, 3, 2, 3],
        [1, 0, 1, 3, 0]
      ],
      hidden: [
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null]
      ]
    };
  }

  /** 舊 API：只回傳數字盤面（預設 4 種寶石、無障礙，與舊版行為一致） */
  function createBoard(kinds, nFrozen, nStone) {
    var res = buildInitial(kinds || BASE_KINDS, nFrozen, nStone);
    return res.board.map(function (row) { return row.slice(); });
  }

  /** 建立格子盤面；factory(type) 用來建立格子（動畫層傳入 makeTile，模擬層用預設） */
  function createGrid(kinds, nFrozen, nStone, factory) {
    var make = factory || makeCellObj;
    var res = buildInitial(kinds, nFrozen, nStone);
    var grid = [];
    for (var r = 0; r < SIZE; r++) {
      var row = [];
      for (var c = 0; c < SIZE; c++) {
        var v = res.board[r][c];
        var cell;
        if (v === V_STONE) {
          cell = make(0, r, c);
          cell.block = BLK_STONE;
          cell.hp = 2;
        } else if (v === V_FROZEN) {
          cell = make(res.hidden[r][c], r, c);
          cell.block = BLK_FROZEN;
          cell.hp = 1;
        } else {
          cell = make(v, r, c);
        }
        row.push(cell);
      }
      grid.push(row);
    }
    return grid;
  }

  /**
   * 洗牌（數字盤面版）：只重排「可移動」的格子（寶石與彩虹），障礙與空格原地不動，
   * 重複 Fisher-Yates 直到「無現成三連線且有可行步」。200 次仍失敗就整盤重新產生可移動格。
   */
  function shuffleBoard(board) {
    var pos = [];
    var vals = [];
    var r;
    var c;
    for (r = 0; r < SIZE; r++) {
      for (c = 0; c < SIZE; c++) {
        if (isSwappableValue(board[r][c])) {
          pos.push({ r: r, c: c });
          vals.push(board[r][c]);
        }
      }
    }
    for (var attempt = 0; attempt < 200; attempt++) {
      for (var i = vals.length - 1; i > 0; i--) {
        var j = randInt(i + 1);
        var t = vals[i];
        vals[i] = vals[j];
        vals[j] = t;
      }
      for (var p = 0; p < pos.length; p++) {
        board[pos[p].r][pos[p].c] = vals[p];
      }
      if (findMatches(board).length === 0 && hasMove(board)) {
        return board;
      }
    }
    // 重排無法解決（種類分布極端）→ 以約束填色重新指派可移動格的寶石種類
    var kinds = 0;
    for (var q = 0; q < vals.length; q++) {
      kinds = Math.max(kinds, vals[q] + 1);
    }
    kinds = Math.max(3, kinds);
    for (var tries = 0; tries < 500; tries++) {
      for (r = 0; r < SIZE; r++) {
        for (c = 0; c < SIZE; c++) {
          if (!isSwappableValue(board[r][c]) || board[r][c] === V_RAINBOW) {
            continue;
          }
          var banned = {};
          if (c >= 2 && board[r][c - 1] >= 0 && board[r][c - 1] === board[r][c - 2]) {
            banned[board[r][c - 1]] = true;
          }
          if (r >= 2 && board[r - 1][c] >= 0 && board[r - 1][c] === board[r - 2][c]) {
            banned[board[r - 1][c]] = true;
          }
          var choices = [];
          for (var k = 0; k < kinds; k++) {
            if (!banned[k]) {
              choices.push(k);
            }
          }
          board[r][c] = choices[randInt(choices.length)];
        }
      }
      if (findMatches(board).length === 0 && hasMove(board)) {
        return board;
      }
    }
    return board;
  }

  /**
   * 格子盤面洗牌：把「可移動磚塊」（無障礙的格子，含特殊寶物）整個物件重新排列，
   * 障礙位置不變；結果保證無現成三連線且有可行步（盡力而為，極端情況見 shuffleBoard 的保底）。
   * 呼叫端需要自行把磚塊的 x / y 同步到新位置。
   */
  function shuffleGrid(grid, kinds) {
    var pos = [];
    var tiles = [];
    var r;
    var c;
    for (r = 0; r < SIZE; r++) {
      for (c = 0; c < SIZE; c++) {
        if (grid[r][c] && grid[r][c].block === BLK_NONE) {
          pos.push({ r: r, c: c });
          tiles.push(grid[r][c]);
        }
      }
    }
    var tries = 0;
    for (tries = 0; tries < 300; tries++) {
      for (var i = tiles.length - 1; i > 0; i--) {
        var j = randInt(i + 1);
        var t = tiles[i];
        tiles[i] = tiles[j];
        tiles[j] = t;
      }
      for (var p = 0; p < pos.length; p++) {
        grid[pos[p].r][pos[p].c] = tiles[p];
      }
      var b = boardOf(grid);
      if (findMatches(b).length === 0 && hasMove(b)) {
        return true;
      }
    }
    // 保底：把普通寶石（非特殊）重新以約束填色指派種類
    for (tries = 0; tries < 500; tries++) {
      for (r = 0; r < SIZE; r++) {
        for (c = 0; c < SIZE; c++) {
          var cell = grid[r][c];
          if (!cell || cell.block !== BLK_NONE) {
            continue;
          }
          var banned = {};
          if (c >= 2 && sameGem(grid[r][c - 1], grid[r][c - 2])) {
            banned[grid[r][c - 1].type] = true;
          }
          if (r >= 2 && sameGem(grid[r - 1][c], grid[r - 2][c])) {
            banned[grid[r - 1][c].type] = true;
          }
          var choices = [];
          for (var k = 0; k < kinds; k++) {
            if (!banned[k]) {
              choices.push(k);
            }
          }
          cell.type = choices[randInt(choices.length)];
        }
      }
      var b2 = boardOf(grid);
      if (findMatches(b2).length === 0 && hasMove(b2)) {
        return true;
      }
    }
    return false;
  }

  function sameGem(a, b) {
    return !!a && !!b && a.block === BLK_NONE && b.block === BLK_NONE &&
      a.special !== SP_RAINBOW && b.special !== SP_RAINBOW && a.type === b.type;
  }

  // ───────────────────────── 純邏輯：消除計畫（含特殊寶物與障礙） ─────────────────────────

  function keyOf(r, c) {
    return r * SIZE + c;
  }

  /** 盤面上出現最多的寶石種類（彩虹被連鎖誤觸時使用；同數量隨機） */
  function mostCommonType(grid) {
    var counts = {};
    var best = -1;
    var bestN = 0;
    var cands = [];
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        var t = grid[r][c];
        if (t && t.block === BLK_NONE && t.special !== SP_RAINBOW) {
          counts[t.type] = (counts[t.type] || 0) + 1;
        }
      }
    }
    for (var k in counts) {
      if (counts[k] > bestN) {
        bestN = counts[k];
        cands = [Number(k)];
      } else if (counts[k] === bestN) {
        cands.push(Number(k));
      }
    }
    if (cands.length > 0) {
      best = cands[randInt(cands.length)];
    }
    return best;
  }

  /**
   * 規劃「這一輪消除」，只計算不修改盤面（動畫層先拿計畫播動畫，再 commitPlan 套用）。
   *
   * 步驟：
   *   1. findRuns 找出所有 ≥3 連線；其寶石全部進入「清除集合」。
   *   2. 特殊寶物誕生：4 連線 → 在連線上挑一格變成「橫/直向清除」寶物（水平連線 → 橫向，垂直 → 直向）；
   *      5 連線以上 → 變成「彩虹」。優先使用玩家剛交換的格子（opt.hints），否則取連線中央。
   *      這一格不會被清除，而是升級成特殊寶物。
   *   3. 特殊寶物連鎖觸發：清除集合中若含特殊寶物，就以 BFS 把它的效果範圍（整列 / 整欄 / 同種全部）
   *      加進清除集合；被波及的特殊寶物會繼續觸發。
   *   4. 障礙命中：每個被清除的寶石，其上下左右相鄰的障礙會被「命中」一次（同一障礙一輪只算一次）；
   *      特殊寶物的範圍若覆蓋障礙，也算命中。冰凍毛線命中即破裂（變回普通寶石，不被清除）；
   *      石頭 hp 2 → 1（出現裂痕）→ 0（被擊碎、當作清除）。
   *
   * @param {Array} grid 格子盤面
   * @param {{hints?:Array<{r,c}>, forced?:Array<{r,c,target}>}} opt
   *        hints：玩家交換的兩格（用來決定特殊寶物誕生位置）；
   *        forced：強制觸發的彩虹（交換觸發），target 為要清除的種類，-1 表示全部。
   * @returns {{clear:Array, spawns:Array, hits:Array, beams:Array, gems:number, bonus:number, triggered:number}}
   */
  function planStep(grid, opt) {
    opt = opt || {};
    var board = boardOf(grid);
    var runs = findRuns(board);
    var clear = {};
    var queue = [];
    var hitSet = {};
    var beams = [];
    var rainbowTarget = {};
    var triggered = 0;

    function addClear(r, c) {
      var k = keyOf(r, c);
      if (!clear[k]) {
        clear[k] = true;
        queue.push(k);
      }
    }
    function addCoverage(r, c) {
      // 特殊寶物的範圍：一般格進入清除集合；障礙只命中不清除
      var t = grid[r][c];
      if (!t) {
        return;
      }
      if (t.block !== BLK_NONE) {
        hitSet[keyOf(r, c)] = true;
      } else {
        addClear(r, c);
      }
    }

    var i;
    var k;
    for (i = 0; i < runs.length; i++) {
      for (k = 0; k < runs[i].cells.length; k++) {
        addClear(runs[i].cells[k].r, runs[i].cells[k].c);
      }
    }
    if (opt.forced) {
      for (i = 0; i < opt.forced.length; i++) {
        var f = opt.forced[i];
        addClear(f.r, f.c);
        rainbowTarget[keyOf(f.r, f.c)] = f.target;
      }
    }

    // 特殊寶物誕生：決定位置（不會被清除）
    var spawnMap = {};
    var spawns = [];
    for (i = 0; i < runs.length; i++) {
      var run = runs[i];
      if (run.cells.length < 4) {
        // 三連消：有機率在中間格留下炸藥球（炸藥球出現得更頻繁）
        if (run.cells.length === 3 && (opt.noRandom ? false : Math.random() < BOMB_CHANCE_3)) {
          var mid = run.cells[1];
          if (grid[mid.r][mid.c].special === SP_NONE && !spawnMap[keyOf(mid.r, mid.c)]) {
            spawnMap[keyOf(mid.r, mid.c)] = SP_ROW;
            spawns.push({ r: mid.r, c: mid.c, special: SP_ROW });
          }
        }
        continue;
      }
      var cands = [];
      for (k = 0; k < run.cells.length; k++) {
        var cc = run.cells[k];
        if (grid[cc.r][cc.c].special === SP_NONE && !spawnMap[keyOf(cc.r, cc.c)]) {
          cands.push(cc);
        }
      }
      if (cands.length === 0) {
        continue;
      }
      var pick = null;
      if (opt.hints) {
        for (var h = 0; h < opt.hints.length && !pick; h++) {
          for (k = 0; k < cands.length; k++) {
            if (cands[k].r === opt.hints[h].r && cands[k].c === opt.hints[h].c) {
              pick = cands[k];
              break;
            }
          }
        }
      }
      if (!pick) {
        pick = cands[Math.min(cands.length - 1, Math.floor(run.cells.length / 2))];
      }
      var kind = run.cells.length >= 5 ? SP_RAINBOW : SP_ROW;
      spawnMap[keyOf(pick.r, pick.c)] = kind;
      spawns.push({ r: pick.r, c: pick.c, special: kind });
    }

    // L / T 形：橫直兩條連線交叉的格子必定產生炸藥球
    for (i = 0; i < runs.length; i++) {
      for (var j2 = i + 1; j2 < runs.length; j2++) {
        if (runs[i].dir === runs[j2].dir) {
          continue;
        }
        for (k = 0; k < runs[i].cells.length; k++) {
          var sc = runs[i].cells[k];
          var shared = runs[j2].cells.some(function (o) { return o.r === sc.r && o.c === sc.c; });
          if (shared && grid[sc.r][sc.c].special === SP_NONE && !spawnMap[keyOf(sc.r, sc.c)]) {
            spawnMap[keyOf(sc.r, sc.c)] = SP_ROW;
            spawns.push({ r: sc.r, c: sc.c, special: SP_ROW });
          }
        }
      }
    }

    // 特殊寶物連鎖觸發（BFS）
    for (var qi = 0; qi < queue.length; qi++) {
      var key = queue[qi];
      var qr = Math.floor(key / SIZE);
      var qc = key % SIZE;
      var cell = grid[qr][qc];
      if (!cell || cell.block !== BLK_NONE || spawnMap[key]) {
        continue;
      }
      var x;
      if (cell.special === SP_ROW || cell.special === SP_COL) {
        // 炸藥球：十字爆破，整列 + 整欄
        triggered++;
        beams.push({ kind: 'row', r: qr, c: qc });
        beams.push({ kind: 'col', r: qr, c: qc });
        for (x = 0; x < SIZE; x++) {
          addCoverage(qr, x);
          addCoverage(x, qc);
        }
      } else if (cell.special === SP_RAINBOW) {
        triggered++;
        var target = rainbowTarget[key];
        if (target === undefined) {
          target = mostCommonType(grid);
        }
        for (var rr = 0; rr < SIZE; rr++) {
          for (var cc2 = 0; cc2 < SIZE; cc2++) {
            var tt = grid[rr][cc2];
            if (tt && tt.block === BLK_NONE && tt.special !== SP_RAINBOW && (target === -1 || tt.type === target)) {
              addClear(rr, cc2);
              beams.push({ kind: 'line', r: qr, c: qc, r2: rr, c2: cc2 });
            } else if (tt && tt.block !== BLK_NONE && target === -1) {
              hitSet[keyOf(rr, cc2)] = true;
            }
          }
        }
      }
    }

    // 升級中的格子不清除
    for (var sk in spawnMap) {
      delete clear[sk];
    }

    // 相鄰命中：每個被清除的格子，若其上下左右有障礙就命中
    var dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (var ck in clear) {
      var cr = Math.floor(ck / SIZE);
      var ccol = ck % SIZE;
      for (var d = 0; d < 4; d++) {
        var nr = cr + dirs[d][0];
        var nc = ccol + dirs[d][1];
        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && grid[nr][nc] && grid[nr][nc].block !== BLK_NONE) {
          hitSet[keyOf(nr, nc)] = true;
        }
      }
    }

    // 整理輸出
    var clearList = [];
    var gems = 0;
    var bonus = 0;
    var hits = [];
    var rr2;
    var cc3;
    for (rr2 = 0; rr2 < SIZE; rr2++) {
      for (cc3 = 0; cc3 < SIZE; cc3++) {
        var kk = keyOf(rr2, cc3);
        if (clear[kk]) {
          clearList.push({ r: rr2, c: cc3 });
          gems++;
        }
        if (hitSet[kk]) {
          var bt = grid[rr2][cc3];
          if (bt.block === BLK_FROZEN) {
            hits.push({ r: rr2, c: cc3, kind: 'crack' });
            bonus += CRACK_BONUS;
          } else if (bt.hp > 1) {
            hits.push({ r: rr2, c: cc3, kind: 'dent' });
          } else {
            hits.push({ r: rr2, c: cc3, kind: 'break' });
            clearList.push({ r: rr2, c: cc3 }); // 石頭被擊碎：加入清除（不計寶石分）
            bonus += BREAK_BONUS;
          }
        }
      }
    }
    return { clear: clearList, spawns: spawns, hits: hits, beams: beams, gems: gems, bonus: bonus, triggered: triggered };
  }

  /** 套用計畫到格子盤面：清除、特殊寶物升級、冰凍破裂、石頭裂痕（不處理下落） */
  function commitPlan(grid, plan) {
    var i;
    for (i = 0; i < plan.spawns.length; i++) {
      grid[plan.spawns[i].r][plan.spawns[i].c].special = plan.spawns[i].special;
    }
    for (i = 0; i < plan.hits.length; i++) {
      var h = plan.hits[i];
      var t = grid[h.r][h.c];
      if (!t) {
        continue;
      }
      if (h.kind === 'crack') {
        t.block = BLK_NONE;
        t.hp = 0;
      } else if (h.kind === 'dent') {
        t.hp = 1;
      }
    }
    for (i = 0; i < plan.clear.length; i++) {
      grid[plan.clear[i].r][plan.clear[i].c] = null;
    }
  }

  /**
   * 補新磚的種類：以 refillAvoid 的機率「避開」會立刻與現有鄰格連成三連線的種類，
   * 降低 5x5 小盤面上「補新自己連鎖」的運氣成分，讓分數更取決於玩家的選擇
   * （否則隨機補新的連鎖加成會讓目標分數幾乎自動達成）。其餘情況為純隨機。
   */
  function pickRefillType(grid, r, c, kinds) {
    var t = randInt(kinds);
    if (refillAvoid <= 0 || rng() >= refillAvoid) {
      return t;
    }
    for (var tries = 0; tries < kinds; tries++) {
      if (!wouldMatch(grid, r, c, t)) {
        return t;
      }
      t = (t + 1) % kinds;
    }
    return t;
  }

  /** 假設 (r,c) 放入種類 t，水平或垂直是否會形成 ≥3 連線（只看已存在的普通寶石） */
  function wouldMatch(grid, r, c, t) {
    function same(rr, cc) {
      var x = rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE ? grid[rr][cc] : null;
      return !!x && x.block === BLK_NONE && x.special !== SP_RAINBOW && x.type === t;
    }
    var h = 1;
    var cc2;
    for (cc2 = c - 1; same(r, cc2); cc2--) { h++; }
    for (cc2 = c + 1; same(r, cc2); cc2++) { h++; }
    var v = 1;
    var rr2;
    for (rr2 = r - 1; same(rr2, c); rr2--) { v++; }
    for (rr2 = r + 1; same(rr2, c); rr2++) { v++; }
    return h >= 3 || v >= 3;
  }

  /**
   * 重力下落 + 補新（格子盤面版，動畫層與模擬共用）：
   *   - 障礙（冰凍 / 石頭）不會移動，把每一欄切成若干「區段」，各區段內的磚塊各自往下壓實；
   *   - 區段頂端的空位補新磚（最上方區段的新磚從盤面外落入；被障礙隔開的下方區段則原地「冒出」）。
   * @returns {Array<{tile, fromY, toY}>} 需要動畫的移動清單；新磚帶有 pop 標記（原地冒出）
   */
  function gravityGrid(grid, kinds, factory) {
    var make = factory || makeCellObj;
    var moves = [];
    for (var c = 0; c < SIZE; c++) {
      var r = SIZE - 1;
      while (r >= 0) {
        if (grid[r][c] && grid[r][c].block !== BLK_NONE) {
          r--;
          continue;
        }
        // 區段：由 r 往上，直到遇到障礙或盤面頂端
        var top = r;
        while (top - 1 >= 0 && !(grid[top - 1][c] && grid[top - 1][c].block !== BLK_NONE)) {
          top--;
        }
        var write = r;
        for (var rr = r; rr >= top; rr--) {
          var t = grid[rr][c];
          if (t) {
            if (write !== rr) {
              grid[write][c] = t;
              grid[rr][c] = null;
              moves.push({ tile: t, fromY: t.y === undefined ? rr : t.y, toY: write, pop: false });
            }
            write--;
          }
        }
        var missing = write - top + 1;
        for (var k = write; k >= top; k--) {
          var nt = make(pickRefillType(grid, k, c, kinds), k, c);
          var fromY = top === 0 ? k - missing : k;
          grid[k][c] = nt;
          moves.push({ tile: nt, fromY: fromY, toY: k, pop: top !== 0 });
        }
        r = top - 1;
      }
    }
    return moves;
  }

  /** 數字盤面的重力（供測試）：障礙固定，其他非空值在各區段內往下壓實，頂部補 null */
  function applyGravity(board) {
    for (var c = 0; c < SIZE; c++) {
      var r = SIZE - 1;
      while (r >= 0) {
        if (isFixedValue(board[r][c])) {
          r--;
          continue;
        }
        var top = r;
        while (top - 1 >= 0 && !isFixedValue(board[top - 1][c])) {
          top--;
        }
        var write = r;
        for (var rr = r; rr >= top; rr--) {
          if (board[rr][c] !== null) {
            board[write][c] = board[rr][c];
            if (write !== rr) {
              board[rr][c] = null;
            }
            write--;
          }
        }
        for (var k = write; k >= top; k--) {
          board[k][c] = null;
        }
        r = top - 1;
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

  // ───────────────────────── 純邏輯：模擬（供 Node 機器人校準難度） ─────────────────────────

  /**
   * 在格子盤面上套用一步（無動畫）：交換 → 連鎖結算 → 必要時洗牌。
   * @returns {number} 這一步得到的分數；無效步回傳 -1（盤面不變）
   */
  function simPlay(grid, mv, kinds) {
    var board = boardOf(grid);
    if (!isValidSwap(board, mv.a.r, mv.a.c, mv.b.r, mv.b.c)) {
      return -1;
    }
    var ta = grid[mv.a.r][mv.a.c];
    var tb = grid[mv.b.r][mv.b.c];
    grid[mv.a.r][mv.a.c] = tb;
    grid[mv.b.r][mv.b.c] = ta;
    var forced = null;
    if (ta.special === SP_RAINBOW || tb.special === SP_RAINBOW) {
      forced = [];
      var bothRainbow = ta.special === SP_RAINBOW && tb.special === SP_RAINBOW;
      if (ta.special === SP_RAINBOW) {
        forced.push({ r: mv.b.r, c: mv.b.c, target: bothRainbow ? -1 : tb.type });
      }
      if (tb.special === SP_RAINBOW) {
        forced.push({ r: mv.a.r, c: mv.a.c, target: bothRainbow ? -1 : ta.type });
      }
    }
    var total = 0;
    var chain = 0;
    var first = true;
    for (var guard = 0; guard < 60; guard++) {
      var plan = planStep(grid, { hints: first ? [mv.a, mv.b] : null, forced: first ? forced : null });
      first = false;
      if (plan.clear.length === 0) {
        break;
      }
      chain++;
      total += scoreFor(plan.gems, chain) + plan.bonus;
      commitPlan(grid, plan);
      gravityGrid(grid, kinds, null);
    }
    var guard2 = 0;
    while (!hasMove(boardOf(grid)) && guard2++ < 20) {
      shuffleGrid(grid, kinds);
    }
    return total;
  }

  /**
   * 模擬一局：bot 為 'random'（隨機有效步）或 'greedy'（挑第一輪得分最高的有效步，同分隨機）。
   * @returns {{win:boolean, score:number, movesUsed:number}}
   */
  function simGame(cfg, bot) {
    var kinds = cfg.gemTypes;
    var grid = createGrid(kinds, cfg.frozen, cfg.stone, null);
    var score = 0;
    var used = 0;
    while (used < cfg.moves && score < cfg.targetScore) {
      var moves = listMoves(boardOf(grid));
      if (moves.length === 0) {
        shuffleGrid(grid, kinds);
        continue;
      }
      var mv;
      if (bot === 'greedy') {
        var bestScore = -1;
        var bests = [];
        for (var i = 0; i < moves.length; i++) {
          var m = moves[i];
          var ta = grid[m.a.r][m.a.c];
          var tb = grid[m.b.r][m.b.c];
          grid[m.a.r][m.a.c] = tb;
          grid[m.b.r][m.b.c] = ta;
          var forced = null;
          if (ta.special === SP_RAINBOW || tb.special === SP_RAINBOW) {
            forced = [];
            var both = ta.special === SP_RAINBOW && tb.special === SP_RAINBOW;
            if (ta.special === SP_RAINBOW) {
              forced.push({ r: m.b.r, c: m.b.c, target: both ? -1 : tb.type });
            }
            if (tb.special === SP_RAINBOW) {
              forced.push({ r: m.a.r, c: m.a.c, target: both ? -1 : ta.type });
            }
          }
          var plan = planStep(grid, { hints: [m.a, m.b], forced: forced });
          var sc = scoreFor(plan.gems, 1) + plan.bonus;
          grid[m.a.r][m.a.c] = ta;
          grid[m.b.r][m.b.c] = tb;
          if (sc > bestScore) {
            bestScore = sc;
            bests = [m];
          } else if (sc === bestScore) {
            bests.push(m);
          }
        }
        mv = bests[randInt(bests.length)];
      } else {
        mv = moves[randInt(moves.length)];
      }
      score += simPlay(grid, mv, kinds);
      used++;
    }
    return { win: score >= cfg.targetScore, score: score, movesUsed: used };
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
  function linear(t) {
    return t;
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
   * @param {{targetScore?:number,onScore?:function,onComplete?:function,
   *          level?:number,moves?:number,onMovesChange?:function,onFail?:function}} opts
   */
  function start(canvas, opts) {
    opts = opts || {};
    var hasLevel = typeof opts.level === 'number' && opts.level >= 1;
    var diff = hasLevel ? difficultyFor(opts.level) : { targetScore: 50, moves: 0, gemTypes: BASE_KINDS, frozen: 0, stone: 0 };
    var targetScore = typeof opts.targetScore === 'number' ? opts.targetScore : diff.targetScore;
    var kinds = typeof opts.gemTypes === 'number' ? Math.max(3, Math.min(MAX_KINDS, opts.gemTypes)) : diff.gemTypes;
    var nFrozen = typeof opts.frozen === 'number' ? opts.frozen : diff.frozen;
    var nStone = typeof opts.stone === 'number' ? opts.stone : diff.stone;
    // 步數：只有明確傳入 moves 才啟用限制（舊版呼叫方式維持無限步）
    var limited = typeof opts.moves === 'number' && opts.moves > 0;
    var movesTotal = limited ? Math.floor(opts.moves) : 0;
    var movesLeft = movesTotal;
    var onScore = typeof opts.onScore === 'function' ? opts.onScore : null;
    var onComplete = typeof opts.onComplete === 'function' ? opts.onComplete : null;
    var onMovesChange = typeof opts.onMovesChange === 'function' ? opts.onMovesChange : null;
    var onFail = typeof opts.onFail === 'function' ? opts.onFail : null;

    var ctx = canvas.getContext('2d');
    // 有指定關卡時啟用「補新避免自己連鎖」；舊版呼叫（未傳 level）維持純隨機補新
    refillAvoid = hasLevel ? 1 : 0;
    var destroyed = false;
    var busy = true; // 動畫期間為 true，鎖定輸入
    var completed = false; // onComplete 只呼叫一次
    var failed = false; // 步數用完：顯示重試覆蓋層
    var failT = 0; // 覆蓋層淡入計時（ms）
    var retryBtn = null; // 重試按鈕的 CSS 像素矩形 {x,y,w,h}
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

    // 盤面：grid[r][c] 為磚塊物件 {type, special, block, hp, x, y, scale, alpha, dx, pop}，x / y 為「格座標」
    var grid = [];
    var selected = null; // 目前被點選的格 {r, c}
    var tweens = [];
    var particles = [];
    var beams = []; // 特殊寶物的光束 {kind, x1, y1, x2, y2, r, c, t, life}
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
      return tween(ms, function () {}, linear);
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
      return { type: type, special: SP_NONE, block: BLK_NONE, hp: 0, x: c, y: r, scale: 1, alpha: 1, dx: 0, pop: false };
    }

    function typeBoard() {
      return boardOf(grid);
    }

    function initGrid() {
      grid = createGrid(kinds, nFrozen, nStone, makeTile);
    }

    function safeCall(fn, arg) {
      if (fn) {
        try { fn(arg); } catch (e) { /* 回呼錯誤不應中斷遊戲 */ }
      }
    }

    function setScore(v) {
      score = v;
      safeCall(onScore, score);
    }

    function setMoves(v) {
      movesLeft = v;
      if (limited) {
        safeCall(onMovesChange, movesLeft);
      }
    }

    // ── 粒子（星光 + 肉墊）與光束 ──

    function acquireParticle() {
      for (var i = 0; i < particles.length; i++) {
        if (!particles[i].active) {
          return particles[i];
        }
      }
      return null; // 池已滿就放棄這顆，避免卡頓
    }

    var SPARKLE_COLORS = ['#fff7d6', '#ffffff', '#ffe3ef', '#e6f4ea'];

    /** 放一顆星光（不含肉墊），供特殊寶物的呼吸閃爍與光束使用 */
    function sparkleAt(cx, cy, speedScale, color) {
      var s = acquireParticle();
      if (!s) {
        return;
      }
      var ang = Math.random() * Math.PI * 2;
      var spd = (0.2 + Math.random() * 0.5) * cell * (speedScale || 0.8);
      s.active = true;
      s.kind = 0;
      s.x = cx + (Math.random() - 0.5) * cell * 0.5;
      s.y = cy + (Math.random() - 0.5) * cell * 0.5;
      s.vx = Math.cos(ang) * spd;
      s.vy = Math.sin(ang) * spd;
      s.age = 0;
      s.life = 450 + Math.random() * 400;
      s.size = cell * (0.1 + Math.random() * 0.14);
      s.rot = Math.random() * Math.PI;
      s.vr = (Math.random() - 0.5) * 3;
      s.color = color || SPARKLE_COLORS[randInt(SPARKLE_COLORS.length)];
      s.phase = Math.random() * Math.PI * 2;
    }

    /**
     * 在格子中心產生「星光閃爍」與「肉墊爆開」粒子。
     *   - 星光：向四周緩慢漂移，生命週期內以 sin 曲線淡入淡出，並疊加高頻 sin 造成閃爍。
     *   - 肉墊：由中心向外噴出（含微小重力下墜），邊飛邊旋轉並線性漸隱。
     */
    function burstAt(cx, cy, chain) {
      var i;
      var sparkleCount = 3 + Math.min(chain, 3);
      for (i = 0; i < sparkleCount; i++) {
        sparkleAt(cx, cy, 0.9);
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

    function addBeam(b) {
      if (beams.length >= MAX_BEAMS) {
        beams.shift();
      }
      b.t = 0;
      beams.push(b);
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
      for (var b = beams.length - 1; b >= 0; b--) {
        beams[b].t += dt;
        if (beams[b].t >= beams[b].life) {
          beams.splice(b, 1);
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

    /**
     * 光束：特殊寶物觸發時的視覺效果。
     *   - row / col：整列 / 整欄的柔和白光帶，亮度隨時間先升後降（sin 曲線），並沿光帶撒星光；
     *   - line：彩虹寶物連到每個被清除寶石的彩色細線，從起點往目標「生長」後淡出。
     */
    function drawBeams() {
      for (var i = 0; i < beams.length; i++) {
        var b = beams[i];
        var prog = b.t / b.life;
        var env = Math.sin(Math.PI * Math.min(1, prog));
        ctx.save();
        if (b.kind === 'row' || b.kind === 'col') {
          var horiz = b.kind === 'row';
          var bx = horiz ? boardX : boardX + b.c * cell;
          var by = horiz ? boardY + b.r * cell : boardY;
          var bw = horiz ? cell * SIZE : cell;
          var bh = horiz ? cell : cell * SIZE;
          var grad = horiz ? ctx.createLinearGradient(0, by, 0, by + bh) : ctx.createLinearGradient(bx, 0, bx + bw, 0);
          grad.addColorStop(0, 'rgba(255,255,255,0)');
          grad.addColorStop(0.5, 'rgba(255,247,214,' + (0.85 * env).toFixed(3) + ')');
          grad.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(bx, by, bw, bh);
        } else {
          var g = Math.min(1, prog * 3); // 前 1/3 時間線條由起點長到目標
          var ex = b.x1 + (b.x2 - b.x1) * g;
          var ey = b.y1 + (b.y2 - b.y1) * g;
          var lg = ctx.createLinearGradient(b.x1, b.y1, b.x2, b.y2);
          lg.addColorStop(0, 'rgba(255,170,200,' + (0.9 * env).toFixed(3) + ')');
          lg.addColorStop(0.5, 'rgba(255,230,150,' + (0.9 * env).toFixed(3) + ')');
          lg.addColorStop(1, 'rgba(160,215,255,' + (0.9 * env).toFixed(3) + ')');
          ctx.strokeStyle = lg;
          ctx.lineWidth = Math.max(1.5, cell * 0.05);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(b.x1, b.y1);
          ctx.lineTo(ex, ey);
          ctx.stroke();
        }
        ctx.restore();
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
      cell = (side - pad * 2) / SIZE; // 畫布邊長 ≥ 235px 時每格 ≥ 44px
      boardX = (cssW - cell * SIZE) / 2;
      boardY = (cssH - cell * SIZE) / 2;
      return true;
    }

    // ── 繪製 ──

    /** 畫單一磚塊：寶石 / 特殊寶物 / 冰凍毛線 / 石頭 */
    function drawTile(t) {
      var cx = boardX + (t.x + 0.5) * cell + (t.dx || 0) * cell;
      var cy = boardY + (t.y + 0.5) * cell;
      var half = cell * 0.5 * 0.9 * t.scale;
      if (half <= 0.5 || t.alpha <= 0) {
        return;
      }
      var isStone = t.block === BLK_STONE;
      var isRainbow = t.special === SP_RAINBOW && t.block === BLK_NONE;
      var left = cx - half;
      var top = cy - half;
      var radius = cell * 0.24 * t.scale;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, t.alpha));
      // 柔和陰影
      ctx.shadowColor = 'rgba(90, 70, 80, 0.22)';
      ctx.shadowBlur = cell * 0.12;
      ctx.shadowOffsetY = cell * 0.04;
      var grad = ctx.createLinearGradient(cx, cy - half, cx, cy + half);
      if (isStone) {
        grad.addColorStop(0, '#d2cdca');
        grad.addColorStop(1, '#9d9794');
      } else if (isRainbow) {
        // 彩虹寶物：柔和的粉彩漸層，並隨時間緩慢位移
        var shift = (clock * 0.0004) % 1;
        grad = ctx.createLinearGradient(cx - half, cy - half, cx + half, cy + half);
        var stops = ['#f7c8d4', '#f7e2b8', '#cfe6c8', '#bcd8ee', '#d9c8ee'];
        for (var si = 0; si < stops.length; si++) {
          grad.addColorStop(si / (stops.length - 1), stops[(si + Math.floor(shift * stops.length)) % stops.length]);
        }
      } else {
        var col = TILE_COLORS[t.type] || TILE_COLORS[0];
        grad.addColorStop(0, col.top);
        grad.addColorStop(1, col.bottom);
      }
      ctx.fillStyle = grad;
      roundRectPath(ctx, left, top, half * 2, half * 2, radius);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      // 上緣高光
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = Math.max(1, cell * 0.025);
      ctx.stroke();

      var isBomb = t.special === SP_ROW || t.special === SP_COL;
      if (isStone) {
        drawStoneFace(cx, cy, half, t.hp);
      } else if (isBomb && t.block === BLK_NONE) {
        // 炸藥球：大顆 💣，左上角保留原本寶石以便辨識顏色
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000';
        ctx.font = Math.round(cell * 0.52 * t.scale) + 'px ' + EMOJI_FONT;
        ctx.fillText('\uD83D\uDCA3', cx + half * 0.06, cy + half * 0.08);
        ctx.font = Math.round(cell * 0.24 * t.scale) + 'px ' + EMOJI_FONT;
        ctx.fillText(EMOJI[t.type], cx - half * 0.55, cy - half * 0.55);
      } else {
        // 元素 emoji（彩虹寶物用 🌈）
        ctx.font = Math.round(cell * 0.5 * t.scale) + 'px ' + EMOJI_FONT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000';
        ctx.fillText(isRainbow ? '\uD83C\uDF08' : EMOJI[t.type], cx, cy + cell * 0.03);
      }

      if (t.block === BLK_NONE && t.special !== SP_NONE) {
        // 特殊寶物的呼吸光暈
        var pulse = 0.5 + 0.5 * Math.sin(clock * 0.006 + t.x * 1.3 + t.y);
        ctx.strokeStyle = 'rgba(255, 236, 170, ' + (0.55 + 0.4 * pulse).toFixed(2) + ')';
        ctx.shadowColor = 'rgba(255, 220, 120, 0.9)';
        ctx.shadowBlur = cell * (0.1 + 0.1 * pulse);
        ctx.lineWidth = Math.max(2, cell * 0.05);
        roundRectPath(ctx, left, top, half * 2, half * 2, radius);
        ctx.stroke();
        ctx.shadowColor = 'transparent';
      }
      if (t.block === BLK_FROZEN) {
        drawFrozenOverlay(left, top, half, radius);
      }
      ctx.restore();
    }

    /** 石頭：幾塊切面 + 高光；hp=1 時加上裂痕 */
    function drawStoneFace(cx, cy, half, hp) {
      var s = half;
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.6, cy - s * 0.1);
      ctx.lineTo(cx - s * 0.25, cy - s * 0.62);
      ctx.lineTo(cx + s * 0.3, cy - s * 0.5);
      ctx.lineTo(cx + s * 0.05, cy - s * 0.05);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(70,60,60,0.18)';
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.05, cy - s * 0.05);
      ctx.lineTo(cx + s * 0.6, cy + s * 0.1);
      ctx.lineTo(cx + s * 0.35, cy + s * 0.6);
      ctx.lineTo(cx - s * 0.3, cy + s * 0.5);
      ctx.closePath();
      ctx.fill();
      if (hp <= 1) {
        ctx.strokeStyle = 'rgba(60,50,52,0.75)';
        ctx.lineWidth = Math.max(1.5, cell * 0.035);
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.1, cy - s * 0.8);
        ctx.lineTo(cx + s * 0.05, cy - s * 0.35);
        ctx.lineTo(cx - s * 0.2, cy - s * 0.05);
        ctx.lineTo(cx + s * 0.12, cy + s * 0.3);
        ctx.lineTo(cx - s * 0.05, cy + s * 0.8);
        ctx.stroke();
      }
      ctx.restore();
    }

    /** 冰凍毛線：半透明冰藍霜 + 交錯的白色毛線（裡面隱約看得到寶石），暗示「先敲開才能動」 */
    function drawFrozenOverlay(left, top, half, radius) {
      ctx.save();
      roundRectPath(ctx, left, top, half * 2, half * 2, radius);
      ctx.fillStyle = 'rgba(224, 238, 250, 0.62)';
      ctx.fill();
      ctx.clip();
      ctx.strokeStyle = 'rgba(255,255,255,0.95)';
      ctx.lineWidth = Math.max(2, cell * 0.05);
      ctx.lineCap = 'round';
      var x0 = left;
      var y0 = top;
      var w = half * 2;
      var i;
      for (i = 0; i < 4; i++) {
        // 兩個方向的斜向毛線，像纏繞的蜘蛛網
        var o = (i + 0.5) / 4 * w * 2;
        ctx.beginPath();
        ctx.moveTo(x0 + o - w, y0 + w);
        ctx.lineTo(x0 + o, y0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x0 + w - o + w, y0 + w);
        ctx.lineTo(x0 + w - o, y0);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(150,185,215,0.55)';
      ctx.lineWidth = Math.max(1, cell * 0.02);
      ctx.beginPath();
      ctx.moveTo(x0 + w * 0.1, y0 + w * 0.5);
      ctx.lineTo(x0 + w * 0.9, y0 + w * 0.5);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = 'rgba(170,200,230,0.9)';
      ctx.lineWidth = Math.max(1.5, cell * 0.03);
      roundRectPath(ctx, left, top, half * 2, half * 2, radius);
      ctx.stroke();
      ctx.restore();
    }

    /** 步數用完時的覆蓋層：半透明遮罩 + 溫柔的文字卡 + 「再試一次」按鈕 */
    function drawFailOverlay() {
      var a = Math.min(1, failT / 350);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(84, 66, 76, 0.5)';
      ctx.fillRect(0, 0, cssW, cssH);
      var cw = cell * 4;
      var ch = cell * 2.5;
      var cx = cssW / 2 - cw / 2;
      var cy = cssH / 2 - ch / 2 + (1 - a) * cell * 0.3;
      ctx.shadowColor = 'rgba(80,60,70,0.3)';
      ctx.shadowBlur = cell * 0.3;
      ctx.fillStyle = '#fbf3ee';
      roundRectPath(ctx, cx, cy, cw, ch, cell * 0.3);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#7a5a68';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold ' + Math.round(cell * 0.36) + 'px sans-serif';
      ctx.fillText('\uD83D\uDC3E 步數用完了', cssW / 2, cy + ch * 0.22);
      ctx.font = Math.round(cell * 0.24) + 'px sans-serif';
      ctx.fillStyle = '#9a7a88';
      ctx.fillText('小貓還想再織一次夢，試試看吧', cssW / 2, cy + ch * 0.43);
      var bw = cw * 0.6;
      var bh = cell * 0.7;
      var bx = cssW / 2 - bw / 2;
      var by = cy + ch * 0.62;
      retryBtn = { x: bx, y: by, w: bw, h: bh };
      var bg = ctx.createLinearGradient(0, by, 0, by + bh);
      bg.addColorStop(0, '#f2b5c7');
      bg.addColorStop(1, '#e298b0');
      ctx.fillStyle = bg;
      roundRectPath(ctx, bx, by, bw, bh, bh / 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold ' + Math.round(cell * 0.3) + 'px sans-serif';
      ctx.fillText('再試一次', cssW / 2, by + bh / 2 + 1);
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
      drawBeams();
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

      if (failed) {
        drawFailOverlay();
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
      if (failed) {
        failT += dt;
      }
      // 特殊寶物與冰凍毛線的環境閃光：每個特殊寶物每秒約 1.5 顆星光
      for (var r = 0; r < SIZE; r++) {
        for (var c = 0; c < SIZE; c++) {
          var t = grid[r] && grid[r][c];
          if (t && t.block === BLK_NONE && t.special !== SP_NONE && Math.random() < dt * 0.0015) {
            sparkleAt(boardX + (t.x + 0.5) * cell, boardY + (t.y + 0.5) * cell, 0.5, '#fff3c4');
          }
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

    function cellCenter(r, c) {
      return { x: boardX + (c + 0.5) * cell, y: boardY + (r + 0.5) * cell };
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

    /** 障礙不能交換時的回饋：左右輕晃一下 */
    async function wiggle(tile) {
      await tween(260, function (p) {
        tile.dx = Math.sin(p * Math.PI * 4) * 0.08 * (1 - p);
      }, linear);
      tile.dx = 0;
    }

    /**
     * 嘗試交換兩個相鄰格：
     *   1. 任一格是障礙 → 晃動提示、不扣步數；
     *   2. 先交換並播放動畫；
     *   3. 若交換後沒有任何三連線（也沒有彩虹），動畫還原、不扣步數；
     *   4. 否則扣 1 步，進入「消除 → 下落 → 補新 → 連鎖」迴圈。
     */
    async function trySwap(a, b) {
      busy = true;
      selected = null;
      var ca = grid[a.r][a.c];
      var cb = grid[b.r][b.c];
      if (!ca || !cb) {
        busy = false;
        return;
      }
      if (ca.block !== BLK_NONE || cb.block !== BLK_NONE) {
        await wiggle(ca.block !== BLK_NONE ? ca : cb);
        if (destroyed) {
          return;
        }
        busy = false;
        return;
      }
      await animateSwap(a, b);
      if (destroyed) {
        return;
      }
      var rainbowSwap = ca.special === SP_RAINBOW || cb.special === SP_RAINBOW;
      if (!rainbowSwap && findMatches(typeBoard()).length === 0) {
        await animateSwap(a, b); // 無消除：還原
        if (destroyed) {
          return;
        }
        busy = false;
        return;
      }
      if (limited) {
        setMoves(movesLeft - 1);
      }
      // 彩虹交換：以「另一顆」的種類為目標；兩顆都是彩虹則清除全部
      var forced = null;
      if (rainbowSwap) {
        forced = [];
        var both = ca.special === SP_RAINBOW && cb.special === SP_RAINBOW;
        // 交換後 ca 在 b 位置、cb 在 a 位置
        if (ca.special === SP_RAINBOW) {
          forced.push({ r: b.r, c: b.c, target: both ? -1 : cb.type });
        }
        if (cb.special === SP_RAINBOW) {
          forced.push({ r: a.r, c: a.c, target: both ? -1 : ca.type });
        }
      }
      await resolveBoard([a, b], forced);
    }

    /**
     * 連鎖主迴圈：
     *   loop：planStep 規劃 → chain++ → 計分 → 特效 → 縮小消失 → 重力下落 → 頂部補新 → 再規劃
     * 全部穩定後：若無可行步就洗牌；達標則在動畫結束後呼叫一次 onComplete；
     * 否則若步數用完則顯示失敗覆蓋層並呼叫 onFail。
     */
    async function resolveBoard(hints, forced) {
      var chain = 0;
      var first = true;
      for (var guard = 0; guard < 80; guard++) {
        var plan = planStep(grid, { hints: first ? hints : null, forced: first ? forced : null });
        first = false;
        if (plan.clear.length === 0) {
          break;
        }
        chain++;
        await playPlan(plan, chain);
        if (destroyed) {
          return;
        }
        await dropAndRefill();
        if (destroyed) {
          return;
        }
      }

      // 穩定後確保至少有可行步，否則洗牌（障礙位置保留）
      var shuffles = 0;
      while (!hasMove(typeBoard()) && shuffles++ < 20) {
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
        safeCall(onComplete, score);
        return; // 完成後維持鎖定
      }
      if (limited && movesLeft <= 0 && !completed) {
        await wait(500);
        if (destroyed) {
          return;
        }
        failed = true;
        failT = 0;
        safeCall(onFail, { score: score, reason: 'moves' });
        return; // 等待玩家點「再試一次」
      }
      busy = false;
    }

    /**
     * 播放一輪消除：
     *   - 計分、音效、清除磚塊的粒子；
     *   - 特殊寶物誕生：磚塊立刻升級並彈跳脈動，撒出一圈星光；
     *   - 特殊寶物觸發：整列 / 整欄白光帶、彩虹連線；
     *   - 障礙命中：冰凍破裂（冰屑星光）、石頭震動並出現裂痕；
     *   - 前 30% 先微微膨脹，之後縮小並淡出，營造「啵」一聲的彈出感。
     */
    async function playPlan(plan, chain) {
      var gain = scoreFor(plan.gems, chain) + plan.bonus;
      setScore(score + gain);
      if (window.CatAudio && typeof window.CatAudio.crystal === 'function') {
        try { window.CatAudio.crystal(); } catch (e) { /* 音效失敗不影響遊戲 */ }
      }
      var i;
      var tiles = [];
      for (i = 0; i < plan.clear.length; i++) {
        var t = grid[plan.clear[i].r][plan.clear[i].c];
        tiles.push(t);
        var cc = cellCenter(plan.clear[i].r, plan.clear[i].c);
        burstAt(cc.x, cc.y, chain);
      }
      // 特殊寶物誕生：立刻升級
      var born = [];
      for (i = 0; i < plan.spawns.length; i++) {
        var sp = plan.spawns[i];
        var st = grid[sp.r][sp.c];
        st.special = sp.special;
        born.push(st);
        var sc = cellCenter(sp.r, sp.c);
        for (var k = 0; k < 8; k++) {
          sparkleAt(sc.x, sc.y, 1.4, '#fff3c4');
        }
      }
      // 光束
      for (i = 0; i < plan.beams.length; i++) {
        var bm = plan.beams[i];
        if (bm.kind === 'line') {
          var p1 = cellCenter(bm.r, bm.c);
          var p2 = cellCenter(bm.r2, bm.c2);
          addBeam({ kind: 'line', x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, life: 520 });
        } else {
          addBeam({ kind: bm.kind, r: bm.r, c: bm.c, life: 480 });
          var steps = 0;
          for (steps = 0; steps < SIZE; steps++) {
            var pt = bm.kind === 'row' ? cellCenter(bm.r, steps) : cellCenter(steps, bm.c);
            sparkleAt(pt.x, pt.y, 0.8, '#fff7d6');
          }
        }
      }
      // 障礙命中
      var hitTiles = [];
      for (i = 0; i < plan.hits.length; i++) {
        var h = plan.hits[i];
        hitTiles.push(grid[h.r][h.c]);
        var hc = cellCenter(h.r, h.c);
        burstAt(hc.x, hc.y, h.kind === 'dent' ? 1 : 2);
      }
      if (chain >= 2) {
        banner.text = '連鎖 x' + chain + '！';
      } else if (plan.spawns.length > 0) {
        banner.text = '特殊寶物誕生！';
      } else if (plan.triggered > 0) {
        banner.text = '特殊爆發！';
      } else {
        banner.text = '';
      }
      if (banner.text) {
        banner.t = 0;
        banner.active = true;
      }
      await tween(plan.triggered > 0 ? 340 : 260, function (p) {
        var s = p < 0.3 ? 1 + 0.2 * (p / 0.3) : 1.2 * (1 - (p - 0.3) / 0.7);
        var k2;
        for (k2 = 0; k2 < tiles.length; k2++) {
          tiles[k2].scale = Math.max(0, s);
          tiles[k2].alpha = p < 0.3 ? 1 : 1 - (p - 0.3) / 0.7;
        }
        // 新誕生的特殊寶物與被命中的障礙：用 sin 做一次彈跳
        var bump = 1 + 0.18 * Math.sin(p * Math.PI);
        for (k2 = 0; k2 < born.length; k2++) {
          born[k2].scale = bump;
        }
        for (k2 = 0; k2 < hitTiles.length; k2++) {
          if (hitTiles[k2].block !== BLK_NONE) {
            hitTiles[k2].scale = bump;
            hitTiles[k2].dx = Math.sin(p * Math.PI * 5) * 0.05 * (1 - p);
          }
        }
      }, linear);
      for (i = 0; i < born.length; i++) {
        born[i].scale = 1;
      }
      for (i = 0; i < hitTiles.length; i++) {
        hitTiles[i].scale = 1;
        hitTiles[i].dx = 0;
      }
      commitPlan(grid, plan);
    }

    /**
     * 重力下落 + 頂部補新：
     *   由 gravityGrid 決定每顆磚塊的起訖位置（障礙固定、區段內壓實、頂部補新），
     *   再用同一個 tween 以 easeOutBack 一起落下；被障礙隔開的下方區段，新磚原地從 0 放大「冒出」。
     */
    async function dropAndRefill() {
      var moves = gravityGrid(grid, kinds, makeTile);
      var maxDist = 0;
      var i;
      for (i = 0; i < moves.length; i++) {
        var m = moves[i];
        if (m.pop) {
          m.tile.y = m.toY;
          m.tile.scale = 0;
        } else {
          m.tile.y = m.fromY;
          maxDist = Math.max(maxDist, m.toY - m.fromY);
        }
      }
      if (moves.length === 0) {
        return;
      }
      await tween(160 + maxDist * 70, function (p) {
        for (var j = 0; j < moves.length; j++) {
          var mv = moves[j];
          if (mv.pop) {
            mv.tile.scale = Math.max(0, p);
          } else {
            mv.tile.y = mv.fromY + (mv.toY - mv.fromY) * p;
          }
        }
      }, easeOutBack);
      for (i = 0; i < moves.length; i++) {
        moves[i].tile.y = moves[i].toY; // 修正回彈造成的殘餘誤差
        moves[i].tile.scale = 1;
      }
    }

    /** 無解時洗牌：可移動磚塊縮小 → 重排 → 彈回，並以星光提示；障礙原地不動 */
    async function reshuffleAnimated() {
      var r;
      var c;
      banner.text = '重新洗牌～';
      banner.t = 0;
      banner.active = true;
      await tween(180, function (p) {
        for (r = 0; r < SIZE; r++) {
          for (c = 0; c < SIZE; c++) {
            if (grid[r][c] && grid[r][c].block === BLK_NONE) {
              grid[r][c].scale = 1 - 0.85 * p;
            }
          }
        }
      }, easeInOutQuad);
      if (destroyed) {
        return;
      }
      shuffleGrid(grid, kinds);
      for (r = 0; r < SIZE; r++) {
        for (c = 0; c < SIZE; c++) {
          var t = grid[r][c];
          if (t && t.block === BLK_NONE) {
            t.x = c;
            t.y = r;
            var pt = cellCenter(r, c);
            sparkleAt(pt.x, pt.y, 0.9);
          }
        }
      }
      await tween(240, function (p) {
        for (r = 0; r < SIZE; r++) {
          for (c = 0; c < SIZE; c++) {
            if (grid[r][c] && grid[r][c].block === BLK_NONE) {
              grid[r][c].scale = 0.15 + 0.85 * p;
            }
          }
        }
      }, easeOutBack);
      for (r = 0; r < SIZE; r++) {
        for (c = 0; c < SIZE; c++) {
          if (grid[r][c]) {
            grid[r][c].scale = 1;
          }
        }
      }
    }

    /** 重試：重新產生盤面、分數與步數歸零，以「全部彈出」動畫開局 */
    async function restart() {
      failed = false;
      retryBtn = null;
      completed = false;
      busy = true;
      selected = null;
      initGrid();
      var r;
      var c;
      for (r = 0; r < SIZE; r++) {
        for (c = 0; c < SIZE; c++) {
          grid[r][c].scale = 0;
        }
      }
      setScore(0);
      setMoves(movesTotal);
      await tween(320, function (p) {
        for (var rr = 0; rr < SIZE; rr++) {
          for (var cc = 0; cc < SIZE; cc++) {
            grid[rr][cc].scale = Math.max(0, p);
          }
        }
      }, easeOutBack);
      if (destroyed) {
        return;
      }
      for (r = 0; r < SIZE; r++) {
        for (c = 0; c < SIZE; c++) {
          grid[r][c].scale = 1;
        }
      }
      busy = false;
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
        return { r: -1, c: -1, x: x, y: y, outside: true };
      }
      return { r: r, c: c, x: x, y: y };
    }

    function onPointerDown(ev) {
      if (destroyed || (ev.button !== undefined && ev.button > 0)) {
        return;
      }
      // 失敗覆蓋層：只有「再試一次」按鈕可以點
      if (failed) {
        var fh = cellAt(ev);
        if (fh && retryBtn && fh.x >= retryBtn.x && fh.x <= retryBtn.x + retryBtn.w &&
            fh.y >= retryBtn.y && fh.y <= retryBtn.y + retryBtn.h) {
          ev.preventDefault();
          restart();
        }
        return;
      }
      if (busy) {
        return;
      }
      var hit = cellAt(ev);
      if (!hit || hit.outside) {
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

    /** 點選：第一次選取；再點相鄰格交換；點同一格取消；點非相鄰格改選新格；點障礙會晃動提示 */
    function onPointerUp(ev) {
      if (!drag || ev.pointerId !== drag.id) {
        return;
      }
      var d = drag;
      drag = null;
      if (d.swiped || busy || destroyed || failed) {
        return;
      }
      var hit = cellAt(ev);
      if (!hit || hit.outside || hit.r !== d.r || hit.c !== d.c) {
        return;
      }
      var here = { r: hit.r, c: hit.c };
      var tile = grid[here.r][here.c];
      if (tile && tile.block !== BLK_NONE) {
        selected = null;
        busy = true;
        wiggle(tile).then(function () {
          if (!destroyed) {
            busy = false;
          }
        });
        return;
      }
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
    if (limited) {
      safeCall(onMovesChange, movesLeft);
    }
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

  var api = {
    start: start,
    difficultyFor: difficultyFor,
    // 供 Node 單元測試的純邏輯（不依賴 DOM）
    _internals: {
      findMatches: findMatches,
      findRuns: findRuns,
      hasMove: hasMove,
      findMove: findMove,
      listMoves: listMoves,
      isValidSwap: isValidSwap,
      createBoard: createBoard,
      createGrid: createGrid,
      shuffleBoard: shuffleBoard,
      shuffleGrid: shuffleGrid,
      applyGravity: applyGravity,
      scoreFor: scoreFor,
      boardOf: boardOf,
      planStep: planStep,
      commitPlan: commitPlan,
      gravityGrid: gravityGrid,
      sim: {
        play: simPlay,
        game: simGame,
        setRandom: function (fn) { rng = fn || Math.random; },
        tune: function (floor, slope) { MOVES_FLOOR = floor; MOVES_SLOPE = slope; },
        setAvoid: function (p) { refillAvoid = p; }
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.CatMatch3 = api;
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
