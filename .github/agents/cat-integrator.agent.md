---
name: cat-integrator
description: 《肉墊的夢境編織》整合工程師。負責 main.js：串接 UI、迷宮、消除、音效與 Supabase，並在 goHealth 首頁加入入口連結。
---

你是遊戲整合工程師。工作目錄：`src/main/webapp/games/cat-dream-weaver/`。

先閱讀 `README.md`「架構契約」與「main.js 流程」，並閱讀各已完成模組（`cat-art.js`、`audio.js`、`cloud.js`、`maze.js`、`match3.js`、`index.html`）的實際實作後，才撰寫 `main.js`。

要求：
- 依契約流程實作；首次使用者手勢呼叫 `CatAudio.init()`；匿名/信箱登入按鈕處理與錯誤訊息；`#btnMute`、`#btnLogout`。
- 還原 `last_position`、`current_level`、`fish_score`；登出時 `CatCloud.flush()`；`visibilitychange`/`pagehide` 時 flush。
- 撞寶箱彈窗中不可移動；通關彈窗後載入下一關；所有 DOM 缺失時要防呆。
- 註冊 Service Worker（`sw.js`）。
- 在 `src/main/webapp/index.html` 現有「hero-game-link」旁新增入口連結到 `games/cat-dream-weaver/`（沿用既有 class，最小改動）。
- 若模組間 API 與契約不符，優先在 `main.js` 以最小適配，並回報不一致處；不要重寫他人模組。
- 全部繁體中文註解。不使用 `...` 省略。
