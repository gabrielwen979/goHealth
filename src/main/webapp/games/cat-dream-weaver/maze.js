/**
 * maze.js —《肉墊的夢境編織》迷宮引擎（進階版：編織迷宮、戰爭迷霧、鏡頭捲動、觸控操作）
 *
 * 只對 window 暴露一個命名空間：window.CatMaze
 *   CatMaze.create(canvas, options) → { move, openChest, getPosition, getStats, resize,
 *                                       setTouchEnabled, destroy }
 *   CatMaze.generate(level)         → 純資料的關卡描述（不需 canvas，供測試與除錯使用）
 *
 * 座標系統為「圖磚座標」{x, y}：x 向右、y 向下，格狀地圖大小為 cols × rows（皆為奇數）。
 * grid[y][x] === 1 表示牆、0 表示路。起點固定 (1,1)，終點大門在右下角路格 (cols-2, rows-2)。
 *
 * 所有繪圖皆呼叫 window.CatArt.*（由 cat-art.js 提供）；若某個繪圖函式不存在則略過該項，
 * 因此在 Node 單元測試中可以只傳入 stub。
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 常數
  // ---------------------------------------------------------------------------

  /** 四個方向對應的圖磚位移，以及肉墊腳印的旋轉角（弧度；肉墊預設朝上＝0）。 */
  var DIRS = {
    up: { dx: 0, dy: -1, rot: 0 },
    down: { dx: 0, dy: 1, rot: Math.PI },
    left: { dx: -1, dy: 0, rot: -Math.PI / 2 },
    right: { dx: 1, dy: 0, rot: Math.PI / 2 }
  };
  var DIR_NAMES = ['up', 'down', 'left', 'right'];

  /** 圖磚邊長上限，避免桌機寬螢幕時迷宮被放得過大。 */
  var MAX_TILE = 40;
  /** 「完整顯示整座迷宮」時可接受的最小圖磚邊長；低於此值就改用跟隨鏡頭。 */
  var FIT_MIN_TILE = 20;
  /** 鏡頭模式的圖磚邊長範圍（手機直式約 30px，仍遠大於 14px 下限）。 */
  var CAM_MIN_TILE = 24;
  var CAM_MAX_TILE = 32;

  /** 迷宮欄數 / 列數上限（手機直式約 21×25）。 */
  var MAX_COLS = 21;
  var MAX_ROWS = 25;

  /** 腳印淡入時間（毫秒）。 */
  var PAW_FADE_MS = 420;
  /** 小花淡入時間（毫秒）。 */
  var FLOWER_FADE_MS = 700;
  /** 貓咪從一格滑到下一格的動畫時間（毫秒）。 */
  var SLIDE_MS = 110;
  /** 自動走路每一步的間隔（毫秒）。 */
  var AUTO_STEP_MS = 110;
  /** 走過的格子留下小花的機率。 */
  var FLOWER_CHANCE = 0.4;
  /** 滑動手勢的最小位移（像素）。 */
  var SWIPE_MIN_PX = 18;
  /** 從第幾關開始出現黑霧（第 1 關即有）。 */
  var FOG_START_LEVEL = 1;
  /** 迷霧視野半徑下限（圖磚）。 */
  var FOG_MIN_RADIUS = 2;
  /** 從第幾關開始，終點大門也隱藏在黑霧中（需靠近才看得到）。 */
  var GOAL_HIDDEN_LEVEL = 8;

  // ---------------------------------------------------------------------------
  // 小工具
  // ---------------------------------------------------------------------------

  /**
   * mulberry32 種子亂數產生器：相同種子永遠產生相同序列，是「同關卡迷宮恆定」的基礎。
   * @param {number} seed 32 位元整數種子
   * @returns {function(): number} 每次呼叫回傳 [0,1) 的浮點數
   */
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /**
   * 以 rng 對陣列做 Fisher–Yates 洗牌（就地修改）。
   * @param {Array} arr 要洗牌的陣列
   * @param {function(): number} rng 種子亂數
   * @returns {Array} 同一個陣列
   */
  function shuffle(arr, rng) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  /**
   * 從非空陣列中以 rng 取一個元素。
   * @param {Array} arr 非空陣列
   * @param {function(): number} rng 種子亂數
   * @returns {*} 被選中的元素
   */
  function pick(arr, rng) {
    return arr[Math.floor(rng() * arr.length)];
  }

  /**
   * 將任意輸入正規化為 ≥ 1 的整數關卡。
   * @param {*} level 關卡
   * @returns {number} 合法關卡
   */
  function normalizeLevel(level) {
    var n = Math.floor(Number(level));
    return isFinite(n) && n >= 1 ? n : 1;
  }

  /**
   * 依關卡計算迷宮大小（皆為奇數）：
   * 欄數每 3 關 +2（上限 21），列數每 2 關 +2（上限 25）。
   * 第 1 關 9×9，第 4 關 11×11，第 10 關 15×19，第 19 關起 21×25（手機直式上限）。
   * @param {number} level 關卡
   * @returns {{cols:number, rows:number}} 欄數與列數
   */
  function sizeForLevel(level) {
    var cols = Math.min(MAX_COLS, 9 + 2 * Math.floor((level - 1) / 3));
    var rows = Math.min(MAX_ROWS, 9 + 2 * Math.floor((level - 1) / 2));
    return { cols: cols, rows: rows };
  }

  /**
   * 依關卡決定障礙物（與寶箱）數量：1–2 關 1 個、3–4 關 2 個、5–7 關 3 個、
   * 8–11 關 4 個、12 關起 5 個。
   * @param {number} level 關卡
   * @returns {number} 目標數量（實際數量可能因路徑太短而較少）
   */
  function obstacleCountForLevel(level) {
    if (level >= 12) {
      return 5;
    }
    if (level >= 8) {
      return 4;
    }
    if (level >= 5) {
      return 3;
    }
    if (level >= 3) {
      return 2;
    }
    return 1;
  }

  /**
   * 依關卡計算迷霧視野半徑（圖磚）。第 4 關前不起霧（回傳 0）；
   * 第 4–6 關 7，之後每 3 關縮小 1，最小為 3。
   * @param {number} level 關卡
   * @returns {number} 半徑；0 代表無迷霧
   */
  function fogRadiusForLevel(level) {
    if (level < FOG_START_LEVEL) {
      return 0;
    }
    // 視野半徑：第 1 關 5 格，之後每 3 關縮小 1 格，最低 2 格
    return Math.max(FOG_MIN_RADIUS, 5 - Math.floor((level - FOG_START_LEVEL) / 3));
  }

  /**
   * 安全呼叫外部傳入的回呼：回呼丟出例外時只記錄，不讓引擎狀態被破壞。
   * @param {Function|undefined} fn 回呼
   * @param {*} arg 唯一參數
   */
  function safeCall(fn, arg) {
    if (typeof fn !== 'function') {
      return;
    }
    try {
      fn(arg);
    } catch (err) {
      if (typeof console !== 'undefined' && console.error) {
        console.error('[CatMaze] 回呼發生錯誤：', err);
      }
    }
  }

  /**
   * 取得目前時間（毫秒）。
   * @returns {number} 毫秒時間戳
   */
  function nowMs() {
    if (typeof performance !== 'undefined' && performance.now) {
      return performance.now();
    }
    return Date.now();
  }

  // ---------------------------------------------------------------------------
  // 迷宮生成（純資料，無 DOM 相依）
  // ---------------------------------------------------------------------------

  /**
   * 以遞迴回溯（DFS，使用顯式堆疊避免爆 call stack）在奇數座標格點上雕出「完美迷宮」：
   * 任兩個路格之間恰好只有一條路徑，沒有環。
   * @param {number} cols 欄數（奇數）
   * @param {number} rows 列數（奇數）
   * @param {function(): number} rng 種子亂數
   * @returns {number[][]} grid[y][x]，1 為牆、0 為路
   */
  function carveMaze(cols, rows, rng) {
    var grid = [];
    for (var y = 0; y < rows; y++) {
      var row = [];
      for (var x = 0; x < cols; x++) {
        row.push(1);
      }
      grid.push(row);
    }
    grid[1][1] = 0;
    var stack = [{ x: 1, y: 1 }];
    var steps = [{ dx: 2, dy: 0 }, { dx: -2, dy: 0 }, { dx: 0, dy: 2 }, { dx: 0, dy: -2 }];
    while (stack.length > 0) {
      var cur = stack[stack.length - 1];
      var order = shuffle(steps.slice(), rng);
      var carved = false;
      for (var i = 0; i < order.length; i++) {
        var nx = cur.x + order[i].dx;
        var ny = cur.y + order[i].dy;
        // 只往「仍是牆」且位於外框內側的奇數格點前進
        if (nx > 0 && ny > 0 && nx < cols - 1 && ny < rows - 1 && grid[ny][nx] === 1) {
          grid[cur.y + order[i].dy / 2][cur.x + order[i].dx / 2] = 0; // 打通中間的牆
          grid[ny][nx] = 0;
          stack.push({ x: nx, y: ny });
          carved = true;
          break;
        }
      }
      if (!carved) {
        stack.pop(); // 四周都走過了 → 回溯
      }
    }
    return grid;
  }

  /**
   * 廣度優先搜尋（BFS）。可指定額外被視為「牆」的格子（例如尚未清除的障礙物）。
   * @param {number[][]} grid 地圖
   * @param {{x:number,y:number}} from 起點
   * @param {{x:number,y:number}|null} to 終點；為 null 時僅做可達範圍洪水填充
   * @param {Object<string, boolean>} blocked 以 "x,y" 為鍵的額外阻擋格
   * @returns {{path: Array<{x:number,y:number}>|null, reach: Object<string, boolean>}}
   *   path 為 from→to 的最短路徑（含兩端；不可達為 null）；reach 為可達格集合
   */
  function bfs(grid, from, to, blocked) {
    var rows = grid.length;
    var cols = grid[0].length;
    var prev = {};
    var reach = {};
    reach[from.x + ',' + from.y] = true;
    var queue = [from];
    var head = 0;
    var found = null;
    while (head < queue.length) {
      var cur = queue[head++];
      if (to && cur.x === to.x && cur.y === to.y) {
        found = cur;
        break;
      }
      for (var i = 0; i < DIR_NAMES.length; i++) {
        var d = DIRS[DIR_NAMES[i]];
        var nx = cur.x + d.dx;
        var ny = cur.y + d.dy;
        var key = nx + ',' + ny;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) {
          continue;
        }
        if (grid[ny][nx] === 1 || reach[key] || (blocked && blocked[key])) {
          continue;
        }
        reach[key] = true;
        prev[key] = cur;
        queue.push({ x: nx, y: ny });
      }
    }
    var path = null;
    if (found) {
      path = [];
      var node = found;
      while (node) {
        path.push({ x: node.x, y: node.y });
        node = prev[node.x + ',' + node.y] || null;
      }
      path.reverse();
    }
    return { path: path, reach: reach };
  }

  /**
   * 計算某格的開放鄰居數量（用來辨識死巷：只有 1 個開放鄰居）。
   * @param {number[][]} grid 地圖
   * @param {number} x 圖磚 x
   * @param {number} y 圖磚 y
   * @returns {number} 開放鄰居數
   */
  function openNeighbors(grid, x, y) {
    var n = 0;
    for (var i = 0; i < DIR_NAMES.length; i++) {
      var nx = x + DIRS[DIR_NAMES[i]].dx;
      var ny = y + DIRS[DIR_NAMES[i]].dy;
      if (ny >= 0 && ny < grid.length && nx >= 0 && nx < grid[0].length && grid[ny][nx] === 0) {
        n++;
      }
    }
    return n;
  }

  /**
   * 為一座障礙物挑選守護它的寶箱位置。
   *
   * 可解性保證：候選格只來自 region（把「尚未清除、且位於該障礙物之前或之上的障礙」視為牆後，
   * 自起點仍可走到的格子），因此寶箱一定能在不穿過該障礙物的前提下到達。
   * 優先順序：岔路死巷 → 岔路任意格 → 主路徑上的格子；fallbackRegion 為備援範圍。
   *
   * @param {number[][]} grid 地圖
   * @param {Object<string, boolean>} onPath 主路徑格集合
   * @param {Object<string, boolean>} region 首選候選範圍（可達格）
   * @param {Object<string, boolean>} fallbackRegion 備援候選範圍
   * @param {Object<string, boolean>} taken 已被占用的格子（起點、終點、障礙、其他寶箱）
   * @param {function(): number} rng 種子亂數
   * @returns {{x:number,y:number}|null} 寶箱位置；找不到回傳 null
   */
  function pickChestCell(grid, onPath, region, fallbackRegion, taken, rng) {
    var regions = [region, fallbackRegion];
    for (var r = 0; r < regions.length; r++) {
      var deadEnds = [];
      var branches = [];
      var mains = [];
      for (var y = 0; y < grid.length; y++) {
        for (var x = 0; x < grid[0].length; x++) {
          var key = x + ',' + y;
          if (!regions[r][key] || taken[key] || grid[y][x] === 1) {
            continue;
          }
          if (onPath[key]) {
            mains.push({ x: x, y: y });
          } else if (openNeighbors(grid, x, y) === 1) {
            deadEnds.push({ x: x, y: y });
          } else {
            branches.push({ x: x, y: y });
          }
        }
      }
      var pools = [deadEnds, branches, mains];
      for (var p = 0; p < pools.length; p++) {
        if (pools[p].length > 0) {
          return pick(pools[p], rng);
        }
      }
    }
    return null;
  }

  /**
   * 「編織」迷宮：在完美迷宮上額外打通一些牆，製造環路（多條路可選），同時保留大量死巷當誘餌。
   *
   * 為了不破壞關卡可解性與「障礙物有意義」這件事，每打通一面牆都要通過兩道檢查：
   *   1. 牆兩側的路格都不能是死巷（開放鄰居 ≥ 2），避免把死巷／寶箱巷接通而消滅誘餌。
   *   2. 打通後，每一座障礙物仍然是起點→終點的「割點」（單獨封住它，終點就不可達）；
   *      否則玩家能繞過障礙，障礙就失去意義。不通過就把牆補回去。
   *
   * 因為只是「加邊」，原本寶箱在障礙之前可達的性質不會被破壞。
   *
   * @param {number[][]} grid 地圖（就地修改）
   * @param {number} loops 想要打通的牆數量
   * @param {Array<{x:number,y:number}>} obstacles 障礙物座標
   * @param {{x:number,y:number}} start 起點
   * @param {{x:number,y:number}} goal 終點
   * @param {function(): number} rng 種子亂數
   */
  function braid(grid, loops, obstacles, start, goal, rng) {
    var rows = grid.length;
    var cols = grid[0].length;
    var cands = [];
    for (var y = 1; y < rows - 1; y++) {
      for (var x = 1; x < cols - 1; x++) {
        if (grid[y][x] !== 1) {
          continue;
        }
        // 只考慮「兩側皆為路」的直線牆；x、y 同為偶數的是立柱，不處理
        var horiz = grid[y][x - 1] === 0 && grid[y][x + 1] === 0;
        var vert = grid[y - 1][x] === 0 && grid[y + 1][x] === 0;
        if (horiz !== vert) {
          cands.push({ x: x, y: y, h: horiz });
        }
      }
    }
    shuffle(cands, rng);
    var done = 0;
    for (var i = 0; i < cands.length && done < loops; i++) {
      var c = cands[i];
      var a = c.h ? { x: c.x - 1, y: c.y } : { x: c.x, y: c.y - 1 };
      var b = c.h ? { x: c.x + 1, y: c.y } : { x: c.x, y: c.y + 1 };
      if (openNeighbors(grid, a.x, a.y) < 2 || openNeighbors(grid, b.x, b.y) < 2) {
        continue; // 保留死巷
      }
      grid[c.y][c.x] = 0;
      var ok = true;
      for (var o = 0; o < obstacles.length && ok; o++) {
        var blocked = {};
        blocked[obstacles[o].x + ',' + obstacles[o].y] = true;
        if (bfs(grid, start, goal, blocked).path) {
          ok = false; // 出現繞過障礙的捷徑 → 還原
        }
      }
      if (ok) {
        done++;
      } else {
        grid[c.y][c.x] = 1;
      }
    }
  }

  /**
   * 決定性地生成某關卡的完整描述。
   *
   * 流程：
   *   1. 以 level 為種子（mulberry32）+ DFS 雕出完美迷宮。
   *   2. 用 BFS 求起點→終點的唯一路徑。
   *   3. 依關卡放 1–5 座障礙物於路徑中後段（第 1 座約 60%；多座時均勻分布於 30%–85%）。
   *   4. 每座障礙物各配一個寶箱：寶箱位於「起點在該障礙物（與其後障礙物）封住時仍可達」的區域，
   *      優先放在「清除前一座障礙才進得去」的岔路死巷。
   *   5. 第 3 關起「編織」：打通部分牆形成環路，但每座障礙物仍保持為割點（不可繞過）。
   *   6. 重新計算最短路徑與參考最佳步數。
   *
   * @param {number} levelInput 關卡（≥1 的整數；其他值視為 1）
   * @returns {{level:number, cols:number, rows:number, grid:number[][],
   *   start:{x:number,y:number}, goal:{x:number,y:number},
   *   path:Array<{x:number,y:number}>,
   *   obstacles:Array<{id:string,x:number,y:number,chestId:string}>,
   *   chests:Array<{id:string,x:number,y:number,obstacleId:string}>,
   *   fogRadius:number, shortestSteps:number, optimalSteps:number}} 關卡描述
   */
  function generate(levelInput) {
    var level = normalizeLevel(levelInput);
    var size = sizeForLevel(level);
    var cols = size.cols;
    var rows = size.rows;
    // 混入固定常數，讓相鄰關卡的亂數序列差異夠大；仍是 level 的純函式 → 決定性
    var rng = mulberry32((Math.imul(level, 2654435761) ^ 0x9e3779b9) >>> 0);
    var grid = carveMaze(cols, rows, rng);
    var start = { x: 1, y: 1 };
    var goal = { x: cols - 2, y: rows - 2 };
    var path = bfs(grid, start, goal, null).path;

    var onPath = {};
    for (var i = 0; i < path.length; i++) {
      onPath[path[i].x + ',' + path[i].y] = true;
    }

    // 障礙物在路徑上的相對位置
    var want = obstacleCountForLevel(level);
    var fractions = [];
    if (want === 1) {
      fractions = [0.6];
    } else {
      var lo = want === 2 ? 0.45 : 0.3;
      var hi = want === 2 ? 0.75 : 0.85;
      for (var q = 0; q < want; q++) {
        fractions.push(lo + ((hi - lo) * q) / (want - 1));
      }
    }
    var obstacleIdx = [];
    for (var f = 0; f < fractions.length; f++) {
      var idx = Math.floor(path.length * fractions[f]);
      // 至少離起點 3 格、離終點 2 格；與前一座至少相隔 3 格
      idx = Math.max(3, Math.min(path.length - 3, idx));
      if (obstacleIdx.length > 0 && idx < obstacleIdx[obstacleIdx.length - 1] + 3) {
        idx = obstacleIdx[obstacleIdx.length - 1] + 3;
      }
      if (idx > path.length - 3) {
        break; // 路徑太短放不下更多，只保留已放的
      }
      obstacleIdx.push(idx);
    }

    var obstacles = [];
    var chests = [];
    var taken = {};
    taken[start.x + ',' + start.y] = true;
    taken[goal.x + ',' + goal.y] = true;
    for (var o = 0; o < obstacleIdx.length; o++) {
      var cell = path[obstacleIdx[o]];
      obstacles.push({ id: 'o' + (o + 1), x: cell.x, y: cell.y, chestId: 'c' + (o + 1) });
      taken[cell.x + ',' + cell.y] = true;
    }

    // 寶箱：第 c 個寶箱的候選區域＝「第 c 座及其後障礙封住」時自起點可達的格子，
    // 首選「清除第 c-1 座後才多出來的區域」，讓玩家必須依序破關。
    for (var c = 0; c < obstacles.length; c++) {
      var blockedFromC = {};
      for (var b = c; b < obstacles.length; b++) {
        blockedFromC[obstacles[b].x + ',' + obstacles[b].y] = true;
      }
      var reachable = bfs(grid, start, null, blockedFromC).reach;
      var region = reachable;
      if (c > 0) {
        var blockedFromPrev = {};
        for (var bp = c - 1; bp < obstacles.length; bp++) {
          blockedFromPrev[obstacles[bp].x + ',' + obstacles[bp].y] = true;
        }
        var beforePrev = bfs(grid, start, null, blockedFromPrev).reach;
        region = {};
        for (var k in reachable) {
          if (!beforePrev[k]) {
            region[k] = true;
          }
        }
      }
      var spot = pickChestCell(grid, onPath, region, reachable, taken, rng);
      if (!spot) {
        // 理論上不會發生，保險起見退回路徑上障礙前一格
        spot = path[obstacleIdx[c] - 1];
      }
      taken[spot.x + ',' + spot.y] = true;
      chests.push({ id: 'c' + (c + 1), x: spot.x, y: spot.y, obstacleId: 'o' + (c + 1) });
    }

    // 第 3 關起編織：環路數量隨關卡增加（約佔房間數 2.5%×(level-2)，上限 22%）
    if (level >= 3) {
      var cells = ((cols - 1) / 2) * ((rows - 1) / 2);
      var loops = Math.ceil(cells * Math.min(0.22, 0.025 * (level - 2)));
      braid(grid, loops, obstacles, start, goal, rng);
    }

    // 編織後可能出現捷徑，重新計算最短路徑
    path = bfs(grid, start, goal, null).path;

    // 參考最佳步數：依序取得 c1..cn（取第 c 個時，第 c 座及之後的障礙仍擋著），最後走向終點
    var optimal = 0;
    var cur = start;
    for (var s = 0; s < chests.length; s++) {
      var blk = {};
      for (var t = s; t < obstacles.length; t++) {
        blk[obstacles[t].x + ',' + obstacles[t].y] = true;
      }
      var leg = bfs(grid, cur, { x: chests[s].x, y: chests[s].y }, blk).path;
      optimal += leg ? leg.length - 1 : 0;
      cur = { x: chests[s].x, y: chests[s].y };
    }
    var lastLeg = bfs(grid, cur, goal, null).path;
    optimal += lastLeg ? lastLeg.length - 1 : 0;

    return {
      level: level,
      cols: cols,
      rows: rows,
      grid: grid,
      start: start,
      goal: goal,
      path: path,
      obstacles: obstacles,
      chests: chests,
      fogRadius: fogRadiusForLevel(level),
      shortestSteps: path.length - 1,
      optimalSteps: optimal
    };
  }

  // ---------------------------------------------------------------------------
  // 迷宮實例（含碰撞、繪圖、觸控）
  // ---------------------------------------------------------------------------

  /**
   * 呼叫 CatArt 的繪圖函式；CatArt 或該函式不存在時直接略過（容錯、方便測試）。
   * @param {string} name CatArt 函式名稱
   * @param {Array} args 傳入參數
   */
  function art(name, args) {
    var lib = typeof window !== 'undefined' ? window.CatArt : null;
    if (lib && typeof lib[name] === 'function') {
      lib[name].apply(lib, args);
    }
  }

  /**
   * 建立迷宮實例並開始以 requestAnimationFrame 重繪。
   * @param {HTMLCanvasElement} canvas 繪圖用 canvas
   * @param {Object} options 選項
   * @param {number} options.level 關卡
   * @param {{x:number,y:number}} [options.startPos] 起始位置；為牆/越界時回到 (1,1)（可站在障礙格上，供還原「剛清除障礙」時的存檔）
   * @param {function({x:number,y:number})} [options.onMove] 每次成功移動
   * @param {function(number)} [options.onStep] 每次成功移動後呼叫，參數為累計步數
   * @param {function(string)} [options.onChest] 踩上寶箱（每個寶箱只觸發一次，直到 openChest）
   * @param {function(string)} [options.onBlocked] 被擋下，參數為 'wall' | 'obstacle'
   * @param {function()} [options.onGoal] 抵達終點大門
   * @returns {{move:Function, openChest:Function, getPosition:Function, getStats:Function,
   *   resize:Function, setTouchEnabled:Function, destroy:Function}} 迷宮控制介面
   */
  function create(canvas, options) {
    var opts = options || {};
    var data = generate(opts.level);
    var cols = data.cols;
    var rows = data.rows;
    var grid = data.grid;
    var fogR = data.fogRadius; // 0 代表無迷霧

    // 可變狀態：寶箱與障礙會被清除
    var chests = data.chests.map(function (c) {
      return { id: c.id, x: c.x, y: c.y, obstacleId: c.obstacleId, triggered: false };
    });
    var obstacles = data.obstacles.map(function (o) {
      return { id: o.id, x: o.x, y: o.y };
    });

    var pos = { x: data.start.x, y: data.start.y };
    var facing = 'down';
    var destroyed = false;
    var rafId = 0;
    var steps = 0; // 累計成功移動步數
    var touchEnabled = true;

    // 繪圖尺寸（由 resize 設定）：tile 為圖磚 CSS 邊長；viewW/viewH 為可視區（CSS 像素）
    var ctx = canvas.getContext('2d');
    var tile = FIT_MIN_TILE;
    var dpr = 1;
    var viewW = cols * tile;
    var viewH = rows * tile;
    // 鏡頭左上角（世界像素座標）；迷宮比可視區大時會跟隨貓咪平滑捲動
    var camX = 0;
    var camY = 0;
    var camReady = false;
    var lastDrawT = 0;

    // 貓咪滑動動畫：從 slideFrom 在 SLIDE_MS 內移到 pos
    var slideFrom = null;
    var slideStart = 0;

    // 軌跡：以 "x,y" 為鍵，每格最多一個腳印與一朵小花
    var trail = {};
    // 迷霧：走過的格子（含起點）與已被發現的寶箱 / 障礙物 id
    var visited = {};
    var discovered = {};

    // 迷霧圖層與柔邊精靈（延遲建立）
    var fogCanvas = null;
    var fogCtx = null;
    var softSprite = null;
    var softSpriteKey = '';

    // 觸控 / 自動走路狀態
    var gesture = null; // 目前手勢
    var activePointers = 0; // 目前按下的指標數（多指時忽略）
    var multiTouch = false;
    var walkPath = null; // 自動走路剩餘節點
    var walkTimer = 0;
    var autoStepping = false; // 自動走路呼叫 move 時為 true，避免被當成「新輸入」取消

    /**
     * 判斷某格是否為可走的路（不含障礙物判定）。
     * @param {number} x 圖磚 x
     * @param {number} y 圖磚 y
     * @returns {boolean} 在界內且為路格才回傳 true
     */
    function isFloor(x, y) {
      return x >= 0 && y >= 0 && x < cols && y < rows && grid[y][x] === 0;
    }

    /**
     * 尋找位於某格上、尚未被清除的障礙物。
     * @param {number} x 圖磚 x
     * @param {number} y 圖磚 y
     * @returns {Object|null} 障礙物或 null
     */
    function obstacleAt(x, y) {
      for (var i = 0; i < obstacles.length; i++) {
        if (obstacles[i].x === x && obstacles[i].y === y) {
          return obstacles[i];
        }
      }
      return null;
    }

    /**
     * 尋找位於某格上、尚未被開啟的寶箱。
     * @param {number} x 圖磚 x
     * @param {number} y 圖磚 y
     * @returns {Object|null} 寶箱或 null
     */
    function chestAt(x, y) {
      for (var i = 0; i < chests.length; i++) {
        if (chests[i].x === x && chests[i].y === y) {
          return chests[i];
        }
      }
      return null;
    }

    // 處理 startPos：必須是界內的路格，否則回到 (1,1)。
    // 玩家清除障礙後可能存檔在障礙格上，因此允許；呼叫端（main.js）會依位置重新開啟已通過的寶箱。
    var sp = opts.startPos;
    if (
      sp &&
      Number.isInteger(sp.x) &&
      Number.isInteger(sp.y) &&
      isFloor(sp.x, sp.y)
    ) {
      pos = { x: sp.x, y: sp.y };
    }
    visited[pos.x + ',' + pos.y] = true;

    /**
     * 更新「已發現」的寶箱與障礙物：只要進入迷霧視野半徑就算發現，之後即使離開也持續顯示。
     * 無迷霧的關卡不需要這個資訊。
     */
    function updateDiscovery() {
      if (!fogR) {
        return;
      }
      var r2 = (fogR + 0.5) * (fogR + 0.5);
      var i;
      for (i = 0; i < chests.length; i++) {
        var dxc = chests[i].x - pos.x;
        var dyc = chests[i].y - pos.y;
        if (dxc * dxc + dyc * dyc <= r2) {
          discovered['c:' + chests[i].id] = true;
        }
      }
      for (i = 0; i < obstacles.length; i++) {
        var dxo = obstacles[i].x - pos.x;
        var dyo = obstacles[i].y - pos.y;
        if (dxo * dxo + dyo * dyo <= r2) {
          discovered['o:' + obstacles[i].id] = true;
        }
      }
    }
    updateDiscovery();

    /**
     * 在剛離開的格子留下肉墊腳印（依移動方向旋轉、左右腳交錯偏移），並隨機點綴小花。
     * @param {number} x 離開的圖磚 x
     * @param {number} y 離開的圖磚 y
     * @param {string} dir 移動方向名稱
     */
    function leaveTrail(x, y, dir) {
      var d = DIRS[dir];
      var key = x + ',' + y;
      var t = nowMs();
      var entry = trail[key] || { flower: null, step: 0 };
      // 垂直於前進方向的偏移，讓連續腳印呈現左右交錯的自然步伐
      var side = (x + y) % 2 === 0 ? 1 : -1;
      entry.rot = d.rot;
      entry.ox = -d.dy * side * 0.12;
      entry.oy = d.dx * side * 0.12;
      entry.t = t;
      if (!entry.flower && Math.random() < FLOWER_CHANCE) {
        entry.flower = {
          variant: Math.floor(Math.random() * 4),
          ox: (Math.random() - 0.5) * 0.5,
          oy: (Math.random() - 0.5) * 0.5,
          t: t
        };
      }
      trail[key] = entry;
    }

    /**
     * 取消目前的自動走路（若有）。
     */
    function cancelWalk() {
      if (walkTimer) {
        clearTimeout(walkTimer);
        walkTimer = 0;
      }
      walkPath = null;
    }

    /**
     * 讓貓咪朝 dir 方向走一步並回傳結果。
     *
     * 碰撞判定順序（由先至後）：
     *   1. 方向名稱無效 → 視為 'wall'（不移動）。
     *   2. 邊界：目標格超出 0..cols-1 / 0..rows-1 → 'wall'，觸發 onBlocked('wall')。
     *   3. 牆：grid 上該格為 1 → 'wall'，觸發 onBlocked('wall')。
     *   4. 障礙物：該格有尚未清除的障礙物 → 'obstacle'，觸發 onBlocked('obstacle')，位置不變。
     *   5. 通過：更新位置、步數 +1、留下腳印、觸發 onMove(pos) 與 onStep(steps)。
     *   6. 終點判定：位置等於終點大門 → 觸發 onGoal() 並回傳 'goal'（優先於寶箱；終點不會放寶箱）。
     *   7. 寶箱判定：該格有尚未開啟的寶箱，且還沒觸發過 → 標記已觸發、onChest(id)、回傳 'chest'；
     *      已觸發過（尚未 openChest）則不重複觸發，回傳 'moved'。
     *   8. 其他 → 'moved'。
     *
     * 任何「外部」呼叫（鍵盤、方向鈕、滑動）都會先取消進行中的自動走路；
     * 自動走路本身透過 autoStepping 旗標呼叫同一個 move，因此與手動走路走完全相同的判定與回呼。
     *
     * @param {string} dir 'up' | 'down' | 'left' | 'right'
     * @returns {string} 'moved' | 'wall' | 'obstacle' | 'chest' | 'goal'
     */
    function move(dir) {
      if (!autoStepping) {
        cancelWalk();
      }
      var d = DIRS[dir];
      if (destroyed || !d) {
        return 'wall';
      }
      facing = dir; // 即使撞牆，貓咪也會轉向該方向
      var nx = pos.x + d.dx;
      var ny = pos.y + d.dy;

      // 邊界與牆（isFloor 已包含越界檢查）
      if (!isFloor(nx, ny)) {
        safeCall(opts.onBlocked, 'wall');
        return 'wall';
      }
      // 障礙物：擋住前進，直到對應寶箱被 openChest 清除
      if (obstacleAt(nx, ny)) {
        discovered['o:' + obstacleAt(nx, ny).id] = true; // 撞到的障礙一定算發現
        safeCall(opts.onBlocked, 'obstacle');
        return 'obstacle';
      }

      // 通過碰撞判定 → 實際移動
      leaveTrail(pos.x, pos.y, dir);
      slideFrom = { x: pos.x, y: pos.y };
      slideStart = nowMs();
      pos = { x: nx, y: ny };
      visited[nx + ',' + ny] = true;
      steps++;
      updateDiscovery();
      safeCall(opts.onMove, { x: pos.x, y: pos.y });
      safeCall(opts.onStep, steps);

      // 終點判定：只要踩上右下角大門格即視為抵達
      if (nx === data.goal.x && ny === data.goal.y) {
        cancelWalk();
        safeCall(opts.onGoal);
        return 'goal';
      }

      // 寶箱判定：每個寶箱只觸發一次，直到 openChest 將其移除
      var chest = chestAt(nx, ny);
      if (chest && !chest.triggered) {
        chest.triggered = true;
        cancelWalk();
        safeCall(opts.onChest, chest.id);
        return 'chest';
      }
      return 'moved';
    }

    /**
     * 開啟寶箱：移除該寶箱，並清除它守護的障礙物。未知或已開啟的 id 會被忽略。
     * @param {string} chestId 寶箱 id（來自 onChest）
     * @returns {boolean} 是否真的開啟了一個寶箱
     */
    function openChest(chestId) {
      for (var i = 0; i < chests.length; i++) {
        if (chests[i].id === chestId) {
          var guarded = chests[i].obstacleId;
          chests.splice(i, 1);
          obstacles = obstacles.filter(function (o) {
            return o.id !== guarded;
          });
          return true;
        }
      }
      return false;
    }

    /**
     * 取得貓咪目前的圖磚座標（回傳副本，外部修改不影響內部狀態）。
     * @returns {{x:number,y:number}} 目前位置
     */
    function getPosition() {
      return { x: pos.x, y: pos.y };
    }

    /**
     * 取得關卡統計，供 HUD 顯示步數。
     * @returns {{steps:number, level:number, cols:number, rows:number, optimalSteps:number,
     *   shortestSteps:number, fogRadius:number, chestsLeft:number, obstaclesLeft:number}}
     *   optimalSteps 為「依序取得全部寶箱再到終點」的參考最短步數；shortestSteps 為起點到終點最短路徑長
     */
    function getStats() {
      return {
        steps: steps,
        level: data.level,
        cols: cols,
        rows: rows,
        optimalSteps: data.optimalSteps,
        shortestSteps: data.shortestSteps,
        fogRadius: fogR,
        chestsLeft: chests.length,
        obstaclesLeft: obstacles.length
      };
    }

    // -------------------------------------------------------------------------
    // 版面：圖磚大小與鏡頭
    // -------------------------------------------------------------------------

    /**
     * 依容器大小重算圖磚、可視區與 canvas 解析度（處理 devicePixelRatio）。
     *
     * 1. 先計算「整座迷宮塞進容器」的圖磚邊長 fit；fit ≥ 20 就完整顯示（上限 40px）。
     * 2. 否則（大迷宮在手機上）改用 24–32px 的舒適圖磚，canvas 只做成容器大小，
     *    由鏡頭跟隨貓咪平滑捲動。圖磚邊長永遠 ≥ 20px，遠大於 14px 的可讀下限。
     */
    function resize() {
      if (destroyed) {
        return;
      }
      var parent = canvas.parentElement;
      var availW = (parent && parent.clientWidth) || canvas.clientWidth || 360;
      var availH = (parent && parent.clientHeight) || 0;
      if (availH < 120) {
        availH = 100000; // 容器高度未知時只依寬度決定
      }
      var fit = Math.floor(Math.min(availW / cols, availH / rows));
      if (fit >= FIT_MIN_TILE) {
        tile = Math.min(MAX_TILE, fit);
      } else {
        tile = Math.max(CAM_MIN_TILE, Math.min(CAM_MAX_TILE, Math.floor(availW / 13)));
      }
      dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
      viewW = Math.min(cols * tile, Math.floor(availW));
      viewH = Math.min(rows * tile, Math.floor(availH));
      canvas.width = Math.round(viewW * dpr);
      canvas.height = Math.round(viewH * dpr);
      if (canvas.style) {
        canvas.style.width = viewW + 'px';
        canvas.style.height = viewH + 'px';
      }
      ctx = canvas.getContext('2d');
      fogCanvas = null; // 尺寸變了，迷霧圖層需重建
      fogCtx = null;
      softSprite = null;
      camReady = false;
    }

    /**
     * 取得貓咪的繪製位置（圖磚座標，可為小數）：移動後 SLIDE_MS 內由舊格平滑滑向新格。
     * @param {number} t 目前時間
     * @returns {{x:number,y:number}} 繪製位置
     */
    function drawPos(t) {
      if (!slideFrom) {
        return pos;
      }
      var k = (t - slideStart) / SLIDE_MS;
      if (k >= 1) {
        slideFrom = null;
        return pos;
      }
      return {
        x: slideFrom.x + (pos.x - slideFrom.x) * k,
        y: slideFrom.y + (pos.y - slideFrom.y) * k
      };
    }

    /**
     * 更新鏡頭：目標是讓貓咪位於可視區中央，並夾在迷宮邊界內；以指數平滑逼近（約 80ms 時間常數）。
     * 迷宮完整可見時 viewW === 世界寬，鏡頭恆為 0。
     * @param {{x:number,y:number}} cp 貓咪繪製位置（圖磚座標）
     * @param {number} dt 距離上一幀的毫秒數
     */
    function updateCamera(cp, dt) {
      var maxX = Math.max(0, cols * tile - viewW);
      var maxY = Math.max(0, rows * tile - viewH);
      var tx = Math.max(0, Math.min(maxX, (cp.x + 0.5) * tile - viewW / 2));
      var ty = Math.max(0, Math.min(maxY, (cp.y + 0.5) * tile - viewH / 2));
      if (!camReady) {
        camX = tx;
        camY = ty;
        camReady = true;
        return;
      }
      var k = 1 - Math.exp(-Math.max(0, dt) / 80);
      camX += (tx - camX) * k;
      camY += (ty - camY) * k;
    }

    // -------------------------------------------------------------------------
    // 繪圖
    // -------------------------------------------------------------------------

    /**
     * 取得（必要時建立）柔邊圓形精靈：中心不透明、邊緣淡出的黑色徑向漸層，
     * 用來在迷霧圖層上以 destination-out 「挖洞」顯示已走過的格子與已發現的物件。
     * @returns {HTMLCanvasElement} 精靈 canvas（邊長 = 2.4 個圖磚 × dpr）
     */
    function getSoftSprite() {
      var key = tile + ':' + dpr;
      if (softSprite && softSpriteKey === key) {
        return softSprite;
      }
      var s = Math.ceil(tile * 2.4 * dpr);
      var c = document.createElement('canvas');
      c.width = s;
      c.height = s;
      var g = c.getContext('2d');
      var grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(0.45, 'rgba(0,0,0,0.9)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, s, s);
      softSprite = c;
      softSpriteKey = key;
      return c;
    }

    /**
     * 繪製戰爭迷霧：
     *   1. 在離屏圖層填滿深藍夜色。
     *   2. 以 destination-out 挖出：貓咪視野（徑向漸層，邊緣柔和）、走過的格子（較淡）、
     *      已發現的寶箱/障礙物、終點大門周圍（永遠看得到方向）。
     *   3. 將圖層疊到主畫布，再於終點加一圈會呼吸的金色光暈。
     * @param {number} t 目前時間（毫秒）
     * @param {{x:number,y:number}} cp 貓咪繪製位置（圖磚座標）
     */
    function drawFog(t, cp) {
      if (!fogCanvas) {
        fogCanvas = document.createElement('canvas');
        fogCanvas.width = canvas.width;
        fogCanvas.height = canvas.height;
        fogCtx = fogCanvas.getContext('2d');
      }
      var f = fogCtx;
      var sprite = getSoftSprite();
      var half = tile * 1.2;
      var key;
      f.setTransform(1, 0, 0, 1, 0, 0);
      f.globalCompositeOperation = 'source-over';
      f.globalAlpha = 1;
      f.clearRect(0, 0, fogCanvas.width, fogCanvas.height);
      f.fillStyle = '#000';
      f.fillRect(0, 0, fogCanvas.width, fogCanvas.height);

      // 之後以「世界像素」座標作畫（扣掉鏡頭）
      f.setTransform(dpr, 0, 0, dpr, -camX * dpr, -camY * dpr);
      f.globalCompositeOperation = 'destination-out';

      // 走過的格子：只留淡淡記憶，讓玩家得自己記路
      f.globalAlpha = 0.4;
      for (key in visited) {
        var vp = key.split(',');
        var vx = (Number(vp[0]) + 0.5) * tile;
        var vy = (Number(vp[1]) + 0.5) * tile;
        if (vx + half < camX || vx - half > camX + viewW || vy + half < camY || vy - half > camY + viewH) {
          continue;
        }
        f.drawImage(sprite, vx - half, vy - half, half * 2, half * 2);
      }

      // 已發現的寶箱 / 障礙物：持續可見
      f.globalAlpha = 0.95;
      var i;
      for (i = 0; i < chests.length; i++) {
        if (discovered['c:' + chests[i].id]) {
          f.drawImage(sprite, (chests[i].x + 0.5) * tile - half, (chests[i].y + 0.5) * tile - half, half * 2, half * 2);
        }
      }
      for (i = 0; i < obstacles.length; i++) {
        if (discovered['o:' + obstacles[i].id]) {
          f.drawImage(sprite, (obstacles[i].x + 0.5) * tile - half, (obstacles[i].y + 0.5) * tile - half, half * 2, half * 2);
        }
      }

      // 終點大門：低關卡永遠可見；高關卡隱藏在黑霧中
      var gx = (data.goal.x + 0.5) * tile;
      var gy = (data.goal.y + 0.5) * tile;
      var goalVisible = data.level < GOAL_HIDDEN_LEVEL;
      if (goalVisible) {
        f.globalAlpha = 1;
        f.drawImage(sprite, gx - half * 1.4, gy - half * 1.4, half * 2.8, half * 2.8);
      }

      // 貓咪視野：實心到 (R-1.2) 格，之後平滑淡出到 (R+0.6) 格
      var cx = (cp.x + 0.5) * tile;
      var cy = (cp.y + 0.5) * tile;
      var outer = (fogR + 0.6) * tile;
      var inner = Math.max(0, (fogR - 1.2) * tile);
      var grad = f.createRadialGradient(cx, cy, inner, cx, cy, outer);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      f.fillStyle = grad;
      f.globalAlpha = 1;
      f.fillRect(cx - outer, cy - outer, outer * 2, outer * 2);

      // 疊到主畫布
      f.globalCompositeOperation = 'source-over';
      f.globalAlpha = 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(fogCanvas, 0, 0);

      // 終點金色呼吸光暈（畫在迷霧之上；高關卡隱藏）
      if (!goalVisible) {
        return;
      }
      ctx.setTransform(dpr, 0, 0, dpr, -camX * dpr, -camY * dpr);
      var pulse = 0.28 + 0.12 * Math.sin(t / 380);
      var glow = ctx.createRadialGradient(gx, gy, tile * 0.2, gx, gy, tile * 1.7);
      glow.addColorStop(0, 'rgba(255,226,140,' + pulse.toFixed(3) + ')');
      glow.addColorStop(1, 'rgba(255,226,140,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(gx - tile * 1.7, gy - tile * 1.7, tile * 3.4, tile * 3.4);
    }

    /**
     * 繪製整個畫面：背景牆 → 路面 → 軌跡（小花、肉墊）→ 大門 → 障礙 → 寶箱 → 貓咪 → 迷霧。
     * 只繪製鏡頭可視範圍內的圖磚。
     * @param {number} t 目前時間（毫秒）
     */
    function draw(t) {
      if (!ctx) {
        return;
      }
      var cp = drawPos(t);
      updateCamera(cp, lastDrawT ? t - lastDrawT : 0);
      lastDrawT = t;

      ctx.setTransform(dpr, 0, 0, dpr, -camX * dpr, -camY * dpr);
      ctx.clearRect(camX, camY, viewW, viewH);

      var x0 = Math.max(0, Math.floor(camX / tile));
      var y0 = Math.max(0, Math.floor(camY / tile));
      var x1 = Math.min(cols - 1, Math.floor((camX + viewW) / tile));
      var y1 = Math.min(rows - 1, Math.floor((camY + viewH) / tile));

      // 牆（翡翠綠）與路面（薄荷奶油，棋盤微差）
      var x;
      var y;
      for (y = y0; y <= y1; y++) {
        for (x = x0; x <= x1; x++) {
          if (grid[y][x] === 1) {
            ctx.fillStyle = '#1f8f6f';
            ctx.fillRect(x * tile, y * tile, tile, tile);
            ctx.fillStyle = '#34b58f';
            ctx.fillRect(x * tile + 2, y * tile + 2, tile - 4, tile - 4);
          } else {
            ctx.fillStyle = (x + y) % 2 === 0 ? '#f0fcf5' : '#e3f7ec';
            ctx.fillRect(x * tile, y * tile, tile, tile);
          }
        }
      }

      // 軌跡：先畫小花、再畫肉墊（腳印在上），皆為淡入
      var key;
      var e;
      var kp;
      for (key in trail) {
        e = trail[key];
        if (e.flower) {
          kp = key.split(',');
          var fa = Math.min(1, (t - e.flower.t) / FLOWER_FADE_MS);
          ctx.globalAlpha = Math.max(0, fa);
          art('drawFlower', [
            ctx,
            (Number(kp[0]) + 0.5 + e.flower.ox) * tile,
            (Number(kp[1]) + 0.5 + e.flower.oy) * tile,
            tile * 0.38,
            e.flower.variant
          ]);
          ctx.globalAlpha = 1;
        }
      }
      for (key in trail) {
        e = trail[key];
        kp = key.split(',');
        var pa = Math.min(1, (t - e.t) / PAW_FADE_MS) * 0.65;
        art('drawPaw', [
          ctx,
          (Number(kp[0]) + 0.5 + e.ox) * tile,
          (Number(kp[1]) + 0.5 + e.oy) * tile,
          tile * 0.55,
          Math.max(0, pa),
          e.rot
        ]);
      }

      // 終點大門：貓咪站在門上時為開啟狀態
      var atGoal = pos.x === data.goal.x && pos.y === data.goal.y;
      art('drawGate', [ctx, (data.goal.x + 0.5) * tile, (data.goal.y + 0.5) * tile, tile, atGoal]);

      var i;
      for (i = 0; i < obstacles.length; i++) {
        art('drawObstacle', [ctx, (obstacles[i].x + 0.5) * tile, (obstacles[i].y + 0.5) * tile, tile]);
      }
      for (i = 0; i < chests.length; i++) {
        art('drawChest', [ctx, (chests[i].x + 0.5) * tile, (chests[i].y + 0.5) * tile, tile, t]);
      }

      art('drawCat', [ctx, (cp.x + 0.5) * tile, (cp.y + 0.5) * tile, tile * 0.9, facing]);

      if (fogR) {
        drawFog(t, cp);
      }
    }

    /**
     * requestAnimationFrame 迴圈；destroy 後不再排程下一幀。
     * @param {number} t 瀏覽器提供的時間戳
     */
    function frame(t) {
      if (destroyed) {
        return;
      }
      draw(typeof t === 'number' ? t : nowMs());
      rafId = window.requestAnimationFrame(frame);
    }

    // -------------------------------------------------------------------------
    // 觸控 / 滑鼠：滑動、拖曳跟隨、點擊走到目標
    // -------------------------------------------------------------------------

    /**
     * 兩個相鄰格之間的方向名稱。
     * @param {{x:number,y:number}} a 起格
     * @param {{x:number,y:number}} b 終格
     * @returns {string|null} 方向；不相鄰回傳 null
     */
    function dirBetween(a, b) {
      for (var i = 0; i < DIR_NAMES.length; i++) {
        var d = DIRS[DIR_NAMES[i]];
        if (a.x + d.dx === b.x && a.y + d.dy === b.y) {
          return DIR_NAMES[i];
        }
      }
      return null;
    }

    /**
     * 自動走路的一步：取出路徑下一格並呼叫 move（與手動走路同一條判定路徑）。
     * 回傳值不是 'moved'（撞障礙、踩到寶箱、到終點）或路徑走完就停止；
     * 否則在 AUTO_STEP_MS 後排程下一步。
     */
    function walkTick() {
      walkTimer = 0;
      if (destroyed || !walkPath || walkPath.length === 0) {
        walkPath = null;
        return;
      }
      var next = walkPath[0];
      var dir = dirBetween(pos, next);
      if (!dir) {
        walkPath = null; // 位置被外部改動，路徑失效
        return;
      }
      walkPath.shift();
      autoStepping = true;
      var res;
      try {
        res = move(dir);
      } finally {
        autoStepping = false;
      }
      if (res !== 'moved' || !walkPath || walkPath.length === 0) {
        walkPath = null;
        return;
      }
      walkTimer = setTimeout(walkTick, AUTO_STEP_MS);
    }

    /**
     * 點擊目標格 → 以 BFS 求最短路徑（未清除的障礙視為牆）並開始自動走路。
     * 目標必須是可走且可達的路格，且不是貓咪目前所在格。
     * @param {number} tx 目標圖磚 x
     * @param {number} ty 目標圖磚 y
     * @returns {boolean} 是否開始走路
     */
    function walkTo(tx, ty) {
      cancelWalk();
      if (!isFloor(tx, ty) || (tx === pos.x && ty === pos.y)) {
        return false;
      }
      var blocked = {};
      for (var i = 0; i < obstacles.length; i++) {
        blocked[obstacles[i].x + ',' + obstacles[i].y] = true;
      }
      if (blocked[tx + ',' + ty]) {
        return false;
      }
      var res = bfs(grid, pos, { x: tx, y: ty }, blocked);
      if (!res.path || res.path.length < 2) {
        return false;
      }
      walkPath = res.path.slice(1);
      walkTick(); // 第一步立即執行，回饋更即時
      return true;
    }

    /**
     * 將指標事件座標換成圖磚座標（考慮 canvas 縮放與鏡頭位移）。
     * @param {PointerEvent} e 指標事件
     * @returns {{x:number,y:number}} 圖磚座標
     */
    function eventToTile(e) {
      var rect = canvas.getBoundingClientRect();
      var sx = rect.width ? viewW / rect.width : 1;
      var sy = rect.height ? viewH / rect.height : 1;
      var wx = (e.clientX - rect.left) * sx + camX;
      var wy = (e.clientY - rect.top) * sy + camY;
      return { x: Math.floor(wx / tile), y: Math.floor(wy / tile) };
    }

    /**
     * 指標按下：開始一個手勢。多指（第二根手指或非主要指標）會取消整個手勢；
     * 滑鼠只接受左鍵。任何新輸入都會取消進行中的自動走路。
     * @param {PointerEvent} e 指標事件
     */
    function onPointerDown(e) {
      if (!touchEnabled || destroyed) {
        return;
      }
      activePointers++;
      if (activePointers > 1 || e.isPrimary === false) {
        multiTouch = true;
        gesture = null;
        return;
      }
      if (e.pointerType === 'mouse' && e.button !== 0) {
        return;
      }
      multiTouch = false;
      cancelWalk();
      if (e.preventDefault) {
        e.preventDefault();
      }
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch (err) {
        // 某些環境無法捕捉指標，忽略即可
      }
      gesture = {
        id: e.pointerId,
        sx: e.clientX,
        sy: e.clientY,
        ax: e.clientX, // 錨點：上一次觸發移動時的手指位置
        ay: e.clientY,
        dragging: false,
        dead: false // 踩到寶箱/終點後，同一次拖曳不再繼續移動
      };
    }

    /**
     * 指標移動：
     *   - 位移超過 18px → 判定為滑動，朝「主軸方向」走一步，並重設錨點。
     *   - 之後手指在主軸上每再移動約一個圖磚邊長，就再走一步（貓咪持續跟著手指）。
     * @param {PointerEvent} e 指標事件
     */
    function onPointerMove(e) {
      if (!gesture || e.pointerId !== gesture.id || gesture.dead || multiTouch || !touchEnabled) {
        return;
      }
      if (e.preventDefault) {
        e.preventDefault();
      }
      var guard = 0;
      while (guard++ < 8) {
        var dx = e.clientX - gesture.ax;
        var dy = e.clientY - gesture.ay;
        var horizontal = Math.abs(dx) >= Math.abs(dy);
        var major = horizontal ? dx : dy;
        var thr = gesture.dragging ? tile : SWIPE_MIN_PX;
        if (Math.abs(major) < thr) {
          return;
        }
        var dir = horizontal ? (major > 0 ? 'right' : 'left') : major > 0 ? 'down' : 'up';
        var first = !gesture.dragging;
        gesture.dragging = true;
        if (first) {
          gesture.ax = e.clientX;
          gesture.ay = e.clientY;
        } else if (horizontal) {
          gesture.ax += (major > 0 ? 1 : -1) * tile;
          gesture.ay = e.clientY;
        } else {
          gesture.ay += (major > 0 ? 1 : -1) * tile;
          gesture.ax = e.clientX;
        }
        var res = move(dir);
        if (res === 'chest' || res === 'goal') {
          gesture.dead = true;
          return;
        }
        if (first) {
          return;
        }
      }
    }

    /**
     * 指標放開：若整個手勢都沒有構成滑動，視為「點擊」，走向被點的格子。
     * @param {PointerEvent} e 指標事件
     */
    function onPointerUp(e) {
      activePointers = Math.max(0, activePointers - 1);
      var g = gesture;
      if (activePointers === 0) {
        multiTouch = false;
      }
      if (!g || e.pointerId !== g.id) {
        return;
      }
      gesture = null;
      if (!touchEnabled || destroyed || g.dragging || g.dead) {
        return;
      }
      if (e.type === 'pointercancel') {
        return;
      }
      var tp = eventToTile(e);
      walkTo(tp.x, tp.y);
    }

    /**
     * 指標取消（系統中斷手勢）：只清理狀態，不觸發點擊。
     * @param {PointerEvent} e 指標事件
     */
    function onPointerCancel(e) {
      onPointerUp({ type: 'pointercancel', pointerId: e.pointerId });
    }

    /**
     * 開關畫布上的觸控 / 滑鼠操作（預設開啟）。關閉時會取消進行中的手勢與自動走路。
     * @param {boolean} enabled 是否啟用
     */
    function setTouchEnabled(enabled) {
      touchEnabled = !!enabled;
      if (!touchEnabled) {
        gesture = null;
        cancelWalk();
      }
    }

    /**
     * 銷毀實例：取消動畫迴圈與自動走路、移除所有事件監聽並釋放狀態，
     * 之後 move 一律回傳 'wall' 且不觸發回呼。
     */
    function destroy() {
      destroyed = true;
      cancelWalk();
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerCancel);
      if (canvas.style) {
        canvas.style.touchAction = prevTouchAction;
      }
      gesture = null;
      trail = {};
      visited = {};
      fogCanvas = null;
      fogCtx = null;
      ctx = null;
    }

    // 初始化：畫布禁止瀏覽器手勢（避免頁面捲動）、掛上 Pointer Events
    var prevTouchAction = canvas.style ? canvas.style.touchAction : '';
    if (canvas.style) {
      canvas.style.touchAction = 'none';
    }
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerCancel);

    resize();
    rafId = window.requestAnimationFrame(frame);

    return {
      move: move,
      openChest: openChest,
      getPosition: getPosition,
      getStats: getStats,
      resize: resize,
      setTouchEnabled: setTouchEnabled,
      destroy: destroy
    };
  }

  window.CatMaze = { create: create, generate: generate };
})();
