/**
 * maze.js —《肉墊的夢境編織》迷宮引擎
 *
 * 只對 window 暴露一個命名空間：window.CatMaze
 *   CatMaze.create(canvas, options) → { move, openChest, getPosition, resize, destroy }
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

  /** 360px 寬螢幕下，圖磚邊長的下限（契約要求 ≥ 22px）。 */
  var MIN_TILE = 22;
  /** 圖磚邊長上限，避免桌機寬螢幕時迷宮被放得過大。 */
  var MAX_TILE = 40;
  /** 迷宮寬度（欄數）上限：15 欄 × 24px = 360px，確保窄螢幕圖磚 ≥ 22px。 */
  var MAX_COLS = 15;
  /** 迷宮高度（列數）上限。 */
  var MAX_ROWS = 19;

  /** 腳印淡入時間（毫秒）。 */
  var PAW_FADE_MS = 420;
  /** 小花淡入時間（毫秒）。 */
  var FLOWER_FADE_MS = 700;
  /** 貓咪從一格滑到下一格的動畫時間（毫秒）。 */
  var SLIDE_MS = 110;
  /** 走過的格子留下小花的機率。 */
  var FLOWER_CHANCE = 0.4;

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
   * 依關卡計算迷宮大小（皆為奇數）。寬度每 4 關 +2（上限 15），高度每 3 關 +2（上限 19）。
   * 第 1 關為 9×9，圖磚邊長在 360px 下為 40px；最大 15 欄時仍有 24px ≥ 22px。
   * @param {number} level 關卡
   * @returns {{cols:number, rows:number}} 欄數與列數
   */
  function sizeForLevel(level) {
    var cols = Math.min(MAX_COLS, 9 + 2 * Math.floor((level - 1) / 4));
    var rows = Math.min(MAX_ROWS, 9 + 2 * Math.floor((level - 1) / 3));
    return { cols: cols, rows: rows };
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
    var startKey = from.x + ',' + from.y;
    reach[startKey] = true;
    var queue = [from];
    var head = 0;
    var found = null;
    while (head < queue.length) {
      var cur = queue[head++];
      if (to && cur.x === to.x && cur.y === to.y) {
        found = cur;
        break;
      }
      var names = ['up', 'down', 'left', 'right'];
      for (var i = 0; i < names.length; i++) {
        var d = DIRS[names[i]];
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
    var names = ['up', 'down', 'left', 'right'];
    for (var i = 0; i < names.length; i++) {
      var nx = x + DIRS[names[i]].dx;
      var ny = y + DIRS[names[i]].dy;
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
   * @param {Array<{x:number,y:number}>} path 主路徑
   * @param {Object<string, boolean>} region 首選候選範圍（可達格）
   * @param {Object<string, boolean>} fallbackRegion 備援候選範圍
   * @param {Object<string, boolean>} taken 已被占用的格子（起點、終點、障礙、其他寶箱）
   * @param {function(): number} rng 種子亂數
   * @returns {{x:number,y:number}|null} 寶箱位置；找不到回傳 null
   */
  function pickChestCell(grid, onPath, path, region, fallbackRegion, taken, rng) {
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
   * 決定性地生成某關卡的完整描述。
   *
   * 流程：
   *   1. 以 level 為種子（mulberry32）+ DFS 雕出完美迷宮。
   *   2. 用 BFS 求起點→終點的唯一路徑。
   *   3. 障礙物放在路徑後段（第一座約 60%；第 3 關起改為 45% 與 75% 兩座）。
   *   4. 每座障礙物各配一個寶箱：寶箱位於「起點在該障礙物（與其後障礙物）封住時仍可達」的區域，
   *      優先放在岔路死巷。第二個寶箱優先放在第一座障礙物之後、第二座之前的區域。
   *
   * @param {number} levelInput 關卡（≥1 的整數；其他值視為 1）
   * @returns {{level:number, cols:number, rows:number, grid:number[][],
   *   start:{x:number,y:number}, goal:{x:number,y:number},
   *   path:Array<{x:number,y:number}>,
   *   obstacles:Array<{id:string,x:number,y:number,chestId:string}>,
   *   chests:Array<{id:string,x:number,y:number,obstacleId:string}>}} 關卡描述
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

    // 障礙物在路徑上的相對位置（路徑後段）
    var fractions = level >= 3 ? [0.45, 0.75] : [0.6];
    var obstacleIdx = [];
    for (var f = 0; f < fractions.length; f++) {
      var idx = Math.floor(path.length * fractions[f]);
      // 至少離起點 3 格、離終點 2 格；且與前一座至少相隔 2 格
      idx = Math.max(3, Math.min(path.length - 3, idx));
      if (obstacleIdx.length > 0 && idx < obstacleIdx[obstacleIdx.length - 1] + 2) {
        idx = obstacleIdx[obstacleIdx.length - 1] + 2;
      }
      if (idx > path.length - 3) {
        break; // 路徑太短放不下第二座，只保留已放的
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

    // 先把所有障礙視為牆，得到「第一座障礙之前」的區域
    var allBlocked = {};
    for (var a = 0; a < obstacles.length; a++) {
      allBlocked[obstacles[a].x + ',' + obstacles[a].y] = true;
    }
    var beforeFirst = bfs(grid, start, null, allBlocked).reach;

    for (var c = 0; c < obstacles.length; c++) {
      var region = beforeFirst;
      var fallback = beforeFirst;
      if (c > 0) {
        // 第 c 座之前、但只封住「第 c 座及之後」的障礙：自起點可達（假設前面的障礙已被清除）
        var blockedFromC = {};
        for (var b = c; b < obstacles.length; b++) {
          blockedFromC[obstacles[b].x + ',' + obstacles[b].y] = true;
        }
        var reachable = bfs(grid, start, null, blockedFromC).reach;
        // 首選：第一座障礙之後才進得去的區域（需先開第一個寶箱，體驗更有層次）
        var beyond = {};
        for (var k in reachable) {
          if (!beforeFirst[k]) {
            beyond[k] = true;
          }
        }
        region = beyond;
        fallback = reachable;
      }
      var spot = pickChestCell(grid, onPath, path, region, fallback, taken, rng);
      if (!spot) {
        // 理論上不會發生（起點旁至少有 path[1]、path[2] 可用），保險起見退回路徑上障礙前一格
        spot = path[obstacleIdx[c] - 1];
      }
      taken[spot.x + ',' + spot.y] = true;
      chests.push({ id: 'c' + (c + 1), x: spot.x, y: spot.y, obstacleId: 'o' + (c + 1) });
    }

    return {
      level: level,
      cols: cols,
      rows: rows,
      grid: grid,
      start: start,
      goal: goal,
      path: path,
      obstacles: obstacles,
      chests: chests
    };
  }

  // ---------------------------------------------------------------------------
  // 迷宮實例（含碰撞、繪圖）
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
   * @param {function(string)} [options.onChest] 踩上寶箱（每個寶箱只觸發一次，直到 openChest）
   * @param {function(string)} [options.onBlocked] 被擋下，參數為 'wall' | 'obstacle'
   * @param {function()} [options.onGoal] 抵達終點大門
   * @returns {{move:Function, openChest:Function, getPosition:Function,
   *   resize:Function, destroy:Function}} 迷宮控制介面
   */
  function create(canvas, options) {
    var opts = options || {};
    var data = generate(opts.level);
    var cols = data.cols;
    var rows = data.rows;
    var grid = data.grid;

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

    // 繪圖尺寸（由 resize 設定）
    var ctx = canvas.getContext('2d');
    var tile = MIN_TILE;
    var dpr = 1;

    // 貓咪滑動動畫：從 slideFrom 在 SLIDE_MS 內移到 pos
    var slideFrom = null;
    var slideStart = 0;

    // 軌跡：以 "x,y" 為鍵，每格最多一個腳印與一朵小花
    var trail = {};

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
     * 讓貓咪朝 dir 方向走一步並回傳結果。
     *
     * 碰撞判定順序（由先至後）：
     *   1. 方向名稱無效 → 視為 'wall'（不移動）。
     *   2. 邊界：目標格超出 0..cols-1 / 0..rows-1 → 'wall'，觸發 onBlocked('wall')。
     *   3. 牆：grid 上該格為 1 → 'wall'，觸發 onBlocked('wall')。
     *   4. 障礙物：該格有尚未清除的障礙物 → 'obstacle'，觸發 onBlocked('obstacle')，位置不變。
     *   5. 通過：更新位置、留下腳印、觸發 onMove(pos)。
     *   6. 終點判定：位置等於終點大門 → 觸發 onGoal() 並回傳 'goal'（優先於寶箱；終點不會放寶箱）。
     *   7. 寶箱判定：該格有尚未開啟的寶箱，且還沒觸發過 → 標記已觸發、onChest(id)、回傳 'chest'；
     *      已觸發過（尚未 openChest）則不重複觸發，回傳 'moved'。
     *   8. 其他 → 'moved'。
     *
     * @param {string} dir 'up' | 'down' | 'left' | 'right'
     * @returns {string} 'moved' | 'wall' | 'obstacle' | 'chest' | 'goal'
     */
    function move(dir) {
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
        safeCall(opts.onBlocked, 'obstacle');
        return 'obstacle';
      }

      // 通過碰撞判定 → 實際移動
      leaveTrail(pos.x, pos.y, dir);
      slideFrom = { x: pos.x, y: pos.y };
      slideStart = nowMs();
      pos = { x: nx, y: ny };
      safeCall(opts.onMove, { x: pos.x, y: pos.y });

      // 終點判定：只要踩上右下角大門格即視為抵達
      if (nx === data.goal.x && ny === data.goal.y) {
        safeCall(opts.onGoal);
        return 'goal';
      }

      // 寶箱判定：每個寶箱只觸發一次，直到 openChest 將其移除
      var chest = chestAt(nx, ny);
      if (chest && !chest.triggered) {
        chest.triggered = true;
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
     * 依容器寬度重算圖磚大小與 canvas 解析度（處理 devicePixelRatio）。
     * 圖磚邊長 = floor(可用寬度 / cols)，限制在 [MIN_TILE, MAX_TILE]：
     * 360px 寬、最多 15 欄時恰為 24px，因此永遠 ≥ 22px。
     */
    function resize() {
      var parent = canvas.parentElement;
      var avail = (parent && parent.clientWidth) || canvas.clientWidth || 360;
      tile = Math.max(MIN_TILE, Math.min(MAX_TILE, Math.floor(avail / cols)));
      dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
      var cssW = tile * cols;
      var cssH = tile * rows;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      if (canvas.style) {
        canvas.style.width = cssW + 'px';
        canvas.style.height = cssH + 'px';
      }
      ctx = canvas.getContext('2d');
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
     * 繪製整個畫面：背景牆 → 路面 → 軌跡（小花、肉墊）→ 大門 → 障礙 → 寶箱 → 貓咪。
     * @param {number} t 目前時間（毫秒）
     */
    function draw(t) {
      if (!ctx) {
        return;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cols * tile, rows * tile);

      // 牆（翡翠綠）與路面（薄荷奶油，棋盤微差）
      var x;
      var y;
      for (y = 0; y < rows; y++) {
        for (x = 0; x < cols; x++) {
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
      for (key in trail) {
        e = trail[key];
        if (e.flower) {
          var fp = key.split(',');
          var fa = Math.min(1, (t - e.flower.t) / FLOWER_FADE_MS);
          ctx.globalAlpha = Math.max(0, fa);
          art('drawFlower', [
            ctx,
            (Number(fp[0]) + 0.5 + e.flower.ox) * tile,
            (Number(fp[1]) + 0.5 + e.flower.oy) * tile,
            tile * 0.38,
            e.flower.variant
          ]);
          ctx.globalAlpha = 1;
        }
      }
      for (key in trail) {
        e = trail[key];
        var pp = key.split(',');
        var pa = Math.min(1, (t - e.t) / PAW_FADE_MS) * 0.65;
        art('drawPaw', [
          ctx,
          (Number(pp[0]) + 0.5 + e.ox) * tile,
          (Number(pp[1]) + 0.5 + e.oy) * tile,
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

      var cp = drawPos(t);
      art('drawCat', [ctx, (cp.x + 0.5) * tile, (cp.y + 0.5) * tile, tile * 0.9, facing]);
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

    /**
     * 銷毀實例：取消動畫迴圈並釋放狀態，之後 move 一律回傳 'wall' 且不觸發回呼。
     */
    function destroy() {
      destroyed = true;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      trail = {};
      ctx = null;
    }

    resize();
    rafId = window.requestAnimationFrame(frame);

    return {
      move: move,
      openChest: openChest,
      getPosition: getPosition,
      resize: resize,
      destroy: destroy
    };
  }

  window.CatMaze = { create: create, generate: generate };
})();
