# 肉墊的夢境編織：銀漸層英短的大冒險

專為女性玩家設計的貓咪療癒益智 PWA：上方是「英短綠寶石迷宮」，撞到毛線球寶箱會彈出 5x5「萌貓寶物消除」，達 50 分後清除障礙繼續前進。

## 本機執行

```sh
python3 -m http.server 8080 --directory src/main/webapp
```

開啟 `http://localhost:8080/games/cat-dream-weaver/`（PWA / Service Worker 需要 HTTPS 或 localhost）。

## Supabase 設定

1. 在 Supabase SQL Editor 執行 [`supabase.sql`](./supabase.sql)（建立 `game_saves`、啟用 RLS、建立 Policy）。
2. Authentication → 啟用 Anonymous sign-ins（匿名登入）；信箱登入使用一般 Email provider。
3. 預設沿用 goHealth 首頁的 `../../supabase-config.js`；若要獨立專案，改 [`supabase-config.js`](./supabase-config.js) 的 URL 與 Anon Key（公開金鑰，**不可**放 `service_role`）。
4. 未設定 Supabase 時遊戲仍可玩，進度存在 localStorage。

> ⚠️ `game_saves.user_id` 為 unique。若與 `games/text-maze` 共用同一個 Supabase 專案，兩款遊戲會覆寫彼此的存檔列，建議使用獨立專案或獨立資料表。

---

## 架構契約（所有 Agent 必須遵守）

純靜態、無打包工具，皆為 classic script，全域命名空間。`index.html` 載入順序：

1. `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
2. `../../supabase-config.js`、`supabase-config.js`
3. `cat-art.js` → `audio.js` → `cloud.js` → `maze.js` → `match3.js` → `main.js`

所有模組以 IIFE 包裝，只對 `window` 暴露一個命名空間；跨模組呼叫音效時需 `window.CatAudio?.xxx()` 防呆。所有 JS 註解使用繁體中文。

### 存檔資料形狀（game_state JSONB）

```js
{ current_level: 1, last_position: { x: 1, y: 1 }, fish_score: 0 }
```

### `CatArt`（cat-art.js）— 以 Canvas 2D 繪製，座標為中心點、size 為像素邊長

| 函式 | 說明 |
| --- | --- |
| `CatArt.drawCat(ctx, cx, cy, size, facing)` | 圓臉、綠寶石大眼、銀灰漸層毛色、貓耳的英短剪影；facing 為 `'up'｜'down'｜'left'｜'right'`（眼神/頭微偏） |
| `CatArt.drawPaw(ctx, cx, cy, size, alpha, rotation)` | 粉嫩肉墊腳印 🐾（1 大墊 + 4 小墊） |
| `CatArt.drawFlower(ctx, cx, cy, size, variant)` | 小花朵，variant 0–3 不同色 |
| `CatArt.drawChest(ctx, cx, cy, size, t)` | 毛線球寶箱，t 為毫秒時間用於輕微晃動 |
| `CatArt.drawGate(ctx, cx, cy, size, open)` | 終點大門（拱門＋貓耳裝飾） |
| `CatArt.drawObstacle(ctx, cx, cy, size)` | 擋路障礙（糾纏的毛線團/荊棘），需與寶箱視覺可區分 |

### `CatAudio`（audio.js）— 全部為 Web Audio API 合成，不使用外部檔案

`init()`（必須在使用者手勢內呼叫，會 resume AudioContext）、`step()`（沙沙聲＋確保呼嚕聲持續約 700ms 後淡出）、`startPurr()`、`stopPurr()`、`crystal()`（水晶碰撞）、`meow()`（高頻柔和喵）、`win()`（水晶＋喵）、`setMuted(bool)`、`isMuted()`。

### `CatCloud`（cloud.js）— Supabase Auth + 進度

| 函式 | 說明 |
| --- | --- |
| `init()` → `Promise<{configured:boolean}>` | 建立 client、還原 session；未設定時不丟例外 |
| `getUser()` | `{id, name, email, isAnonymous}` 或 `null` |
| `onAuthChange(cb)` | 登入/登出時 `cb(user|null)` |
| `signInAnonymously()` | 匿名登入並隨機賦予法式名稱（Lily、Chloe…），存入 `user_metadata.display_name` |
| `signInWithEmail(email, pw)` / `signUpWithEmail(email, pw)` / `signOut()` | 皆回傳 `Promise<{ok:boolean, message:string}>`，不丟例外，message 為繁中 |
| `loadProgress()` → `Promise<state|null>` | 讀雲端 `game_saves`，失敗/未設定時讀 localStorage（以 user id 分鍵）；取較新者 |
| `saveProgress(state)` | 同步寫 localStorage，並在背景 debounce（≈800ms）`upsert(..., {onConflict:'user_id'})`；不阻塞、不丟例外；`flush()` 立即送出 |
| `randomFrenchName()` | 隨機法式名稱 |

未設定 Supabase 時，`signInAnonymously()` 退化為「本機訪客」（在 localStorage 產生訪客 id 與法式名稱），讓遊戲離線仍可玩。

### `CatMaze`（maze.js）— 迷宮與碰撞

座標為「圖磚座標」`{x,y}`，格狀地圖 `cols × rows`（皆為奇數），`1` 為牆、`0` 為路。起點固定 `(1,1)`，終點大門在右下角路格。迷宮依 `level` 以種子亂數**決定性生成**（同關卡永遠相同，確保 `last_position` 可還原）。以 360px 寬螢幕為準，圖磚邊長須 ≥ 22px。

```js
const maze = CatMaze.create(canvas, {
  level, startPos,            // startPos 無效（牆/越界）時回到 (1,1)
  onMove(pos),                // 每次成功移動
  onChest(chestId),           // 踩上寶箱的圖磚（每個寶箱只觸發一次，直到 openChest 前不重複）
  onBlocked(kind),            // kind: 'wall' | 'obstacle'
  onGoal(),                   // 抵達終點大門
});
maze.move('up'|'down'|'left'|'right'); // 回傳 'moved'|'wall'|'obstacle'|'chest'|'goal'
maze.openChest(chestId);   // 寶箱移除，並清除其守護的障礙物
maze.getPosition();        // {x,y}
maze.resize();             // 容器尺寸改變時呼叫（處理 devicePixelRatio）
maze.destroy();
```

關卡必定可解：障礙物位於通往終點的唯一路徑上，守護它的寶箱必定在障礙物之前可到達；小貓走過的路徑留下肉墊腳印與小花（淡入），畫面以 `requestAnimationFrame` 重繪。

### `CatMatch3`（match3.js）— 5x5 消除與粒子特效

```js
const game = CatMatch3.start(canvas, {
  targetScore: 50,
  onScore(score),     // 分數變動
  onComplete(score),  // 達標且動畫結束後呼叫一次
});
game.destroy();
```

元素：粉綠寶石 💎、香檳金香水瓶 🧪、小魚乾 🐟、粉紅毛線球 🧶（Canvas `fillText` 繪製於圓角底磚上）。支援點選相鄰兩格與滑動交換；交換後無三連線則還原；三連線以上消除→重力下落→補新→連鎖；每顆 10 分，連鎖有加成；初始盤面不可有現成三連線且必須有可行步，無解時自動洗牌。消除時產生星光閃爍與肉墊爆開粒子（`requestAnimationFrame`），並呼叫 `CatAudio?.crystal()`。

### `index.html` DOM 契約（由 UI Agent 提供、`main.js` 使用）

顯示/隱藏一律使用 `hidden` 屬性（CSS 需 `[hidden]{display:none!important}`）。

| 區塊 | id / 屬性 |
| --- | --- |
| 加載畫面 | `#loadingScreen`（貓耳、貓尾動畫） |
| 登入畫面 | `#authScreen`、`#btnAnonymous`、`#authEmail`、`#authPassword`、`#btnEmailLogin`、`#btnEmailSignup`、`#authMessage` |
| 遊戲畫面 | `#gameScreen`、`#hudPlayer`、`#hudLevel`、`#hudScore`、`#btnMute`、`#btnLogout`、`#mazeCanvas`、`#toast` |
| 方向鈕 | `#dpad` 內 4 個 `button[data-dir="up|down|left|right"]` |
| 消除彈窗 | `#matchModal`、`#matchCanvas`、`#matchScore`、`#matchTarget` |
| 通關彈窗 | `#winModal`、`#winTitle`、`#winText`、`#btnNextLevel` |

### `main.js` 流程

`CatCloud.init()` → 隱藏加載畫面 → 未登入顯示 `#authScreen`，已登入 `loadProgress()` 後進入遊戲；方向鈕（`pointerdown`）與鍵盤（方向鍵 / WASD）呼叫 `maze.move`，每次移動呼叫 `CatAudio.step()` 與 `CatCloud.saveProgress`；`onChest` → 開啟 `#matchModal` 並 `CatMatch3.start`；`onComplete` → `fish_score += 分數`、關閉彈窗、`maze.openChest`、存檔；`onGoal` → `CatAudio.win()`、`current_level + 1`、存檔、顯示 `#winModal`。

### 檔案清單

`index.html`、`styles.css`、`cat-art.js`、`audio.js`、`cloud.js`、`maze.js`、`match3.js`、`main.js`、`supabase-config.js`、`supabase.sql`、`manifest.json`、`sw.js`、`icon.svg`、`icon-192.png`、`icon-512.png`、`apple-touch-icon.png`。

## 難度升級後的新增 API（v4）

- `CatMaze.create` 新增 `onStep(steps)`；實例新增 `getStats()`（steps / optimalSteps / shortestSteps / fogRadius…）與 `setTouchEnabled(bool)`。畫布支援滑動、拖曳與點擊自動走路；第 4 關起有迷霧，大地圖使用跟隨鏡頭。
- `CatMatch3.difficultyFor(level)` 回傳 `{targetScore, moves, gemTypes, frozen, stone}`；`start` 新增 `level`、`moves`、`onMovesChange(left)`、`onFail({score, reason})`。第 3 關起有第 5 種寶石與冰凍毛線球，第 6 關起有石頭，四連消產生整行/列特效寶石，五連消產生彩虹寶石。
