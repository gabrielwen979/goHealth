const MAZE_ROWS = [
  "###########",
  "#S....#...#",
  "###.#.#.#.#",
  "#...#...#.#",
  "#.###.#.#.#",
  "#.....C...#",
  "#.###.###.#",
  "#...#.....#",
  "#.#.#####.#",
  "#.........#",
  "###########",
];

const MAZE_WIDTH = MAZE_ROWS[0].length;
const MAZE_HEIGHT = MAZE_ROWS.length;
const CHEST = { x: 6, y: 5 };
const EXIT = { x: 9, y: 9 };
const START = { x: 1, y: 1 };
const BOARD_SIZE = 5;
const CHEST_TARGET_SCORE = 50;
const GEM_TYPES = [
  { id: "fire", symbol: "🔥", name: "火" },
  { id: "water", symbol: "💧", name: "水" },
  { id: "wood", symbol: "🌿", name: "木" },
  { id: "earth", symbol: "🪨", name: "土" },
  { id: "lightning", symbol: "⚡", name: "雷" },
];
const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const mazeGrid = document.querySelector("#mazeGrid");
const mazeMessage = document.querySelector("#mazeMessage");
const chestStatus = document.querySelector("#chestStatus");
const scoreValue = document.querySelector("#scoreValue");
const highScoreValue = document.querySelector("#highScoreValue");
const levelLabel = document.querySelector("#levelLabel");
const gameMessage = document.querySelector("#gameMessage");
const accountMessage = document.querySelector("#accountMessage");
const sessionLabel = document.querySelector("#sessionLabel");
const syncIndicator = document.querySelector("#syncIndicator");
const authForm = document.querySelector("#authForm");
const emailInput = document.querySelector("#emailInput");
const passwordInput = document.querySelector("#passwordInput");
const signInButton = document.querySelector("#signInButton");
const signUpButton = document.querySelector("#signUpButton");
const anonymousButton = document.querySelector("#anonymousButton");
const signOutButton = document.querySelector("#signOutButton");
const installButton = document.querySelector("#installButton");
const matchDialog = document.querySelector("#matchDialog");
const matchBoardElement = document.querySelector("#matchBoard");
const matchScoreElement = document.querySelector("#matchScore");
const matchMessage = document.querySelector("#matchMessage");
const riddleDialog = document.querySelector("#riddleDialog");
const riddleMessage = document.querySelector("#riddleMessage");
const victoryDialog = document.querySelector("#victoryDialog");
const victorySummary = document.querySelector("#victorySummary");

let supabaseClient = null;
let currentSession = null;
let currentUserId = null;
let gameReady = false;
let authEventsReady = false;
let saveQueue = Promise.resolve();
let deferredInstallPrompt = null;
let matchBoard = [];
let selectedGemIndex = null;
let matchBusy = false;
let chestScore = 0;
let gameState = createInitialState();

function createInitialState() {
  return {
    current_level: 1,
    player_pos: { x: START.x, y: START.y },
    high_score: 0,
    score: 0,
    chest_cleared: false,
    completed: false,
  };
}

function showMessage(element, message, kind = "") {
  element.textContent = message;
  if (kind) element.dataset.kind = kind;
  else delete element.dataset.kind;
}

function isInteger(value) {
  return Number.isInteger(value);
}

function isInsideMaze(position) {
  return position.x >= 0
    && position.x < MAZE_WIDTH
    && position.y >= 0
    && position.y < MAZE_HEIGHT;
}

function isWalkable(position) {
  if (!isInsideMaze(position)) return false;
  // Walls stop movement; the chest tile itself is walkable so entering it can trigger its match challenge.
  return MAZE_ROWS[position.y][position.x] !== "#";
}

function isChest(position) {
  return position.x === CHEST.x && position.y === CHEST.y;
}

function isExit(position) {
  return position.x === EXIT.x && position.y === EXIT.y;
}

function validateGameState(value) {
  if (!value || typeof value !== "object") return null;
  const position = value.player_pos;
  if (
    !position
    || !isInteger(position.x)
    || !isInteger(position.y)
    || !isWalkable(position)
  ) {
    return null;
  }
  const score = Number.isSafeInteger(value.score) && value.score >= 0 ? value.score : 0;
  const highScore = Number.isSafeInteger(value.high_score) && value.high_score >= 0
    ? Math.max(value.high_score, score)
    : score;
  return {
    current_level: 1,
    player_pos: { x: position.x, y: position.y },
    high_score: highScore,
    score,
    chest_cleared: value.chest_cleared === true,
    completed: value.completed === true,
  };
}

function localSaveKey(userId = currentUserId) {
  return `text-maze-save-v1:${userId || "guest"}`;
}

function readLocalSave(userId = currentUserId) {
  try {
    const saved = localStorage.getItem(localSaveKey(userId));
    if (!saved) return null;
    const parsed = validateGameState(JSON.parse(saved));
    if (!parsed) {
      showMessage(accountMessage, "本機存檔格式無效，已改用新進度。", "error");
      return null;
    }
    return parsed;
  } catch (error) {
    console.error("Could not read the text maze local save.", error);
    showMessage(accountMessage, "無法讀取本機存檔，請檢查瀏覽器儲存空間。", "error");
    return null;
  }
}

function writeLocalSave() {
  try {
    localStorage.setItem(localSaveKey(), JSON.stringify(gameState));
    return true;
  } catch (error) {
    console.error("Could not write the text maze local save.", error);
    showMessage(accountMessage, "本機儲存失敗；請檢查瀏覽器儲存空間設定。", "error");
    return false;
  }
}

function updateAccountUI(session) {
  currentSession = session;
  currentUserId = session?.user?.id || null;
  const email = session?.user?.email;
  if (!session) {
    sessionLabel.textContent = "離線遊玩";
    signInButton.hidden = false;
    signUpButton.hidden = false;
    anonymousButton.hidden = false;
    signOutButton.hidden = true;
    syncIndicator.classList.remove("is-online", "is-error");
    return;
  }
  const identity = email || (session.user.is_anonymous ? "匿名玩家" : "已登入玩家");
  sessionLabel.textContent = identity;
  signInButton.hidden = true;
  signUpButton.hidden = true;
  anonymousButton.hidden = true;
  signOutButton.hidden = false;
  syncIndicator.classList.add("is-online");
  syncIndicator.classList.remove("is-error");
}

function renderGame() {
  const cells = [];
  for (let y = 0; y < MAZE_HEIGHT; y += 1) {
    for (let x = 0; x < MAZE_WIDTH; x += 1) {
      const position = { x, y };
      const symbol = MAZE_ROWS[y][x];
      const isPlayer = gameState.player_pos.x === x && gameState.player_pos.y === y;
      const isTreasure = isChest(position) && !gameState.chest_cleared;
      const isDoor = isExit(position);
      let className = "maze-cell";
      let label = "";
      if (symbol === "#") {
        className += " wall";
        label = "牆";
      } else if (isPlayer) {
        className += " player";
        label = "你";
      } else if (isTreasure) {
        className += " chest";
        label = "◆";
      } else if (isDoor) {
        className += " goal";
        label = "門";
      }
      cells.push(
        `<div class="${className}" role="gridcell" aria-label="${y + 1} 行 ${x + 1} 列：${label || "道路"}">${label}</div>`,
      );
    }
  }
  mazeGrid.innerHTML = cells.join("");
  scoreValue.textContent = String(gameState.score);
  highScoreValue.textContent = String(gameState.high_score);
  levelLabel.textContent = String(gameState.current_level).padStart(2, "0");
  chestStatus.textContent = gameState.chest_cleared ? "寶箱已開啟" : "寶箱未開啟";
  chestStatus.classList.toggle("is-cleared", gameState.chest_cleared);
  document.querySelectorAll("[data-move], #resetButton").forEach((control) => {
    control.disabled = !gameReady || gameState.completed;
  });
  document.querySelector("#resetButton").disabled = !gameReady;
}

function setGameReady(ready) {
  gameReady = ready;
  renderGame();
}

function renderMatchBoard() {
  matchBoardElement.innerHTML = matchBoard.map((gem, index) => {
    if (!gem) {
      return '<button class="gem-tile" type="button" disabled aria-label="空格"></button>';
    }
    const gemType = GEM_TYPES.find((type) => type.id === gem);
    const selected = index === selectedGemIndex ? " selected" : "";
    return `<button class="gem-tile gem-${gem}${selected}" type="button" role="gridcell" data-gem-index="${index}" aria-label="${gemType.name}元素，第 ${Math.floor(index / BOARD_SIZE) + 1} 行第 ${(index % BOARD_SIZE) + 1} 列">${gemType.symbol}</button>`;
  }).join("");
}

function randomGem() {
  return GEM_TYPES[Math.floor(Math.random() * GEM_TYPES.length)].id;
}

function swapGems(board, firstIndex, secondIndex) {
  const firstGem = board[firstIndex];
  board[firstIndex] = board[secondIndex];
  board[secondIndex] = firstGem;
}

function findMatches(board) {
  // Scan each row and column for runs of 3+; a Set counts intersecting runs only once.
  const matched = new Set();
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    let start = 0;
    while (start < BOARD_SIZE) {
      const gem = board[row * BOARD_SIZE + start];
      if (!gem) {
        start += 1;
        continue;
      }
      let end = start + 1;
      while (end < BOARD_SIZE && board[row * BOARD_SIZE + end] === gem) end += 1;
      if (end - start >= 3) {
        for (let column = start; column < end; column += 1) {
          matched.add(row * BOARD_SIZE + column);
        }
      }
      start = end;
    }
  }
  for (let column = 0; column < BOARD_SIZE; column += 1) {
    let start = 0;
    while (start < BOARD_SIZE) {
      const gem = board[start * BOARD_SIZE + column];
      if (!gem) {
        start += 1;
        continue;
      }
      let end = start + 1;
      while (end < BOARD_SIZE && board[end * BOARD_SIZE + column] === gem) end += 1;
      if (end - start >= 3) {
        for (let row = start; row < end; row += 1) {
          matched.add(row * BOARD_SIZE + column);
        }
      }
      start = end;
    }
  }
  return [...matched];
}

function hasPossibleMatch(board) {
  for (let index = 0; index < board.length; index += 1) {
    const column = index % BOARD_SIZE;
    const neighbors = [];
    if (column < BOARD_SIZE - 1) neighbors.push(index + 1);
    if (index + BOARD_SIZE < board.length) neighbors.push(index + BOARD_SIZE);
    for (const neighbor of neighbors) {
      swapGems(board, index, neighbor);
      const canMatch = findMatches(board).length > 0;
      swapGems(board, index, neighbor);
      if (canMatch) return true;
    }
  }
  return false;
}

function createMatchBoard() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const board = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, randomGem);
    if (findMatches(board).length === 0 && hasPossibleMatch(board)) return board;
  }
  return Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) =>
    GEM_TYPES[(index + Math.floor(index / BOARD_SIZE)) % GEM_TYPES.length].id,
  );
}

function openChest() {
  if (gameState.chest_cleared || gameState.completed) return;
  chestScore = gameState.score;
  matchBoard = createMatchBoard();
  selectedGemIndex = null;
  showMessage(matchMessage, "選一個元素，再選旁邊的元素交換。");
  matchScoreElement.textContent = String(chestScore);
  renderMatchBoard();
  if (!matchDialog.open) matchDialog.showModal();
}

function applyGravityAndRefill() {
  for (let column = 0; column < BOARD_SIZE; column += 1) {
    const remaining = [];
    for (let row = BOARD_SIZE - 1; row >= 0; row -= 1) {
      const gem = matchBoard[row * BOARD_SIZE + column];
      if (gem) remaining.push(gem);
    }
    for (let row = BOARD_SIZE - 1; row >= 0; row -= 1) {
      const remainingIndex = BOARD_SIZE - 1 - row;
      matchBoard[row * BOARD_SIZE + column] = remaining[remainingIndex] || randomGem();
    }
  }
}

function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function resolveMatches() {
  // Award points per removed tile, drop survivors toward the bottom, refill, then resolve cascades.
  let cascadeCount = 0;
  let matches = findMatches(matchBoard);
  while (matches.length > 0 && cascadeCount < 20) {
    cascadeCount += 1;
    const earned = matches.length * 10;
    chestScore += earned;
    gameState.score += earned;
    gameState.high_score = Math.max(gameState.high_score, gameState.score);
    matchScoreElement.textContent = String(chestScore);
    showMessage(matchMessage, `消除 ${matches.length} 個元素，獲得 ${earned} 分。`, "success");
    for (const index of matches) matchBoard[index] = null;
    renderMatchBoard();
    await wait(140);
    applyGravityAndRefill();
    renderMatchBoard();
    await wait(90);
    await saveProgress();
    if (chestScore >= CHEST_TARGET_SCORE) {
      finishChest();
      return;
    }
    matches = findMatches(matchBoard);
  }
  if (cascadeCount >= 20) {
    showMessage(matchMessage, "連鎖次數過多，棋盤已穩定，請繼續消除。");
  } else {
    showMessage(matchMessage, "再交換相鄰元素，累積至 50 分即可開箱。");
  }
  if (!hasPossibleMatch(matchBoard)) {
    matchBoard = createMatchBoard();
    renderMatchBoard();
    showMessage(matchMessage, "棋盤已重新排列，請繼續挑戰。");
  }
}

async function chooseGem(index) {
  if (matchBusy || !matchDialog.open || !Number.isInteger(index)) return;
  if (selectedGemIndex === null) {
    selectedGemIndex = index;
    renderMatchBoard();
    return;
  }
  if (selectedGemIndex === index) {
    selectedGemIndex = null;
    renderMatchBoard();
    return;
  }
  const first = selectedGemIndex;
  const rowDistance = Math.abs(Math.floor(first / BOARD_SIZE) - Math.floor(index / BOARD_SIZE));
  const columnDistance = Math.abs((first % BOARD_SIZE) - (index % BOARD_SIZE));
  if (rowDistance + columnDistance !== 1) {
    selectedGemIndex = index;
    renderMatchBoard();
    showMessage(matchMessage, "請選擇上下或左右相鄰的元素。");
    return;
  }
  selectedGemIndex = null;
  swapGems(matchBoard, first, index);
  const matches = findMatches(matchBoard);
  if (matches.length === 0) {
    swapGems(matchBoard, first, index);
    renderMatchBoard();
    showMessage(matchMessage, "這次沒有連線消除，再試一次。", "error");
    return;
  }
  matchBusy = true;
  matchBoardElement.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
  });
  renderMatchBoard();
  try {
    await resolveMatches();
  } catch (error) {
    console.error("Could not resolve the element match board.", error);
    showMessage(matchMessage, "儲存進度時發生問題；消除分數已保留在本機。", "error");
  } finally {
    matchBusy = false;
    if (matchDialog.open) renderMatchBoard();
  }
}

function finishChest() {
  gameState.chest_cleared = true;
  gameState.high_score = Math.max(gameState.high_score, gameState.score);
  if (matchDialog.open) matchDialog.close();
  renderGame();
  showMessage(mazeMessage, "寶箱開啟！前往迷宮右下方的出口。", "success");
  showMessage(gameMessage, "元素寶箱已清除，繼續尋找出口。", "success");
  void saveProgress();
}

function openRiddle() {
  if (!gameState.chest_cleared) {
    showMessage(mazeMessage, "出口被封印了，先完成寶箱消除。", "error");
    return;
  }
  if (!riddleDialog.open) {
    showMessage(riddleMessage, "選出正確答案即可通關。");
    riddleDialog.showModal();
  }
}

async function answerRiddle(answer) {
  // The door accepts only the exact correct answer; incorrect choices leave the riddle open.
  if (answer !== "玉山") {
    showMessage(riddleMessage, "答案不正確，再想想台灣的最高峰。", "error");
    return;
  }
  gameState.completed = true;
  gameState.high_score = Math.max(gameState.high_score, gameState.score);
  if (riddleDialog.open) riddleDialog.close();
  victorySummary.textContent = `你完成第 ${gameState.current_level} 關，取得 ${gameState.score} 分。`;
  victoryDialog.showModal();
  renderGame();
  showMessage(gameMessage, "恭喜通關！冒險進度已更新。", "success");
  await saveProgress();
}

async function movePlayer(direction) {
  if (!gameReady || gameState.completed || matchDialog.open || riddleDialog.open || victoryDialog.open) return;
  const delta = DIRECTIONS[direction];
  if (!delta) return;
  const destination = {
    x: gameState.player_pos.x + delta.x,
    y: gameState.player_pos.y + delta.y,
  };
  if (!isWalkable(destination)) {
    // A wall collision never changes the player's saved coordinates.
    showMessage(mazeMessage, "前方是牆，換個方向試試。");
    return;
  }
  if (isExit(destination) && !gameState.chest_cleared) {
    showMessage(mazeMessage, "出口被封印了，先完成寶箱消除。", "error");
    return;
  }
  gameState.player_pos = destination;
  renderGame();
  showMessage(
    mazeMessage,
    isChest(destination) ? "發現元素寶箱！完成消除即可開啟。" : "繼續探索迷宮。",
  );
  showMessage(gameMessage, "進度已儲存至本機。");
  await saveProgress();
  if (isChest(destination)) openChest();
  if (isExit(destination)) openRiddle();
}

function loadRemoteSave(userId) {
  return supabaseClient
    .from("game_saves")
    .select("game_state")
    .eq("user_id", userId)
    .maybeSingle();
}

async function loadProgressForSession(session) {
  const nextUserId = session?.user?.id || null;
  const localProgress = readLocalSave(nextUserId);
  currentSession = session;
  currentUserId = nextUserId;
  updateAccountUI(session);
  if (!nextUserId || !supabaseClient) {
    gameState = localProgress || createInitialState();
    setGameReady(true);
    if (gameState.completed) showVictoryOnRestore();
    return;
  }
  try {
    // Each Auth user owns one row; a missing cloud row falls back to that user's local save.
    const { data, error } = await loadRemoteSave(nextUserId);
    if (error) throw error;
    const remoteProgress = validateGameState(data?.game_state);
    gameState = remoteProgress || localProgress || createInitialState();
    setGameReady(true);
    if (remoteProgress) {
      showMessage(accountMessage, "已從 Supabase 載入你的冒險進度。", "success");
      try {
        localStorage.setItem(localSaveKey(nextUserId), JSON.stringify(remoteProgress));
      } catch (storageError) {
        console.error("Could not cache the remote text maze save.", storageError);
      }
    } else {
      showMessage(accountMessage, localProgress
        ? "雲端尚無存檔，已載入此帳號的本機進度。"
        : "已登入，移動後將自動同步至 Supabase。", "success");
      await saveProgress();
    }
    if (gameState.completed) showVictoryOnRestore();
  } catch (error) {
    console.error("Could not load the text maze cloud save.", error);
    gameState = localProgress || createInitialState();
    setGameReady(true);
    syncIndicator.classList.remove("is-online");
    syncIndicator.classList.add("is-error");
    showMessage(accountMessage, `雲端載入失敗，已改用本機進度：${error.message}`, "error");
  }
}

function showVictoryOnRestore() {
  victorySummary.textContent = `你完成第 ${gameState.current_level} 關，取得 ${gameState.score} 分。`;
  if (!victoryDialog.open) victoryDialog.showModal();
}

async function saveProgress() {
  const localSaved = writeLocalSave();
  if (!currentSession || !supabaseClient || !localSaved) return;
  const snapshot = JSON.parse(JSON.stringify(gameState));
  const userId = currentUserId;
  // Serialize snapshots so fast movement cannot let an older upsert overwrite a newer save.
  saveQueue = saveQueue
    .catch(() => undefined)
    .then(async () => {
      const { error } = await supabaseClient
        .from("game_saves")
        // user_id is unique and also protected by the table's auth.uid() RLS policies.
        .upsert(
          {
            user_id: userId,
            game_state: snapshot,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
      if (error) throw error;
    });
  try {
    await saveQueue;
    if (userId === currentUserId) {
      syncIndicator.classList.add("is-online");
      syncIndicator.classList.remove("is-error");
      showMessage(gameMessage, "進度已同步至 Supabase。", "success");
    }
  } catch (error) {
    console.error("Could not save the text maze cloud progress.", error);
    if (userId === currentUserId) {
      syncIndicator.classList.remove("is-online");
      syncIndicator.classList.add("is-error");
      showMessage(gameMessage, `雲端同步失敗，本機進度仍已保留：${error.message}`, "error");
    }
  }
}

async function signInWithPassword(event) {
  event.preventDefault();
  if (!supabaseClient) {
    showMessage(accountMessage, "尚未設定 Supabase。請先填寫 supabase-config.js 的專案 URL 與公開金鑰。", "error");
    return;
  }
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!email || !password) {
    showMessage(accountMessage, "請輸入 Email 和密碼。", "error");
    return;
  }
  signInButton.disabled = true;
  try {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    showMessage(accountMessage, "登入成功，正在載入進度…", "success");
  } catch (error) {
    showMessage(accountMessage, `登入失敗：${error.message}`, "error");
  } finally {
    signInButton.disabled = false;
  }
}

async function signUpWithPassword() {
  if (!supabaseClient) {
    showMessage(accountMessage, "尚未設定 Supabase。請先填寫 supabase-config.js 的專案 URL 與公開金鑰。", "error");
    return;
  }
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!email || password.length < 8) {
    showMessage(accountMessage, "請輸入有效 Email，密碼至少 8 碼。", "error");
    return;
  }
  signUpButton.disabled = true;
  try {
    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    if (error) throw error;
    if (data.session) {
      showMessage(accountMessage, "帳號建立成功，正在同步遊戲進度。", "success");
    } else {
      showMessage(accountMessage, "帳號已建立。請依 Supabase 郵件驗證設定完成驗證，再登入遊戲。", "success");
    }
  } catch (error) {
    showMessage(accountMessage, `建立帳號失敗：${error.message}`, "error");
  } finally {
    signUpButton.disabled = false;
  }
}

async function signInAnonymously() {
  if (!supabaseClient) {
    showMessage(accountMessage, "尚未設定 Supabase；目前可直接離線遊玩，進度儲存在此裝置。", "error");
    return;
  }
  anonymousButton.disabled = true;
  try {
    const { error } = await supabaseClient.auth.signInAnonymously();
    if (error) throw error;
    showMessage(accountMessage, "匿名登入成功，遊戲進度會同步至此匿名帳號。", "success");
  } catch (error) {
    console.error("Could not create an anonymous text maze session.", error);
    showMessage(accountMessage, `匿名登入失敗：${error.message}。你仍可離線遊玩。`, "error");
  } finally {
    anonymousButton.disabled = false;
  }
}

async function signOut() {
  if (!supabaseClient) return;
  signOutButton.disabled = true;
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    showMessage(accountMessage, "已登出；目前改用訪客本機進度。");
  } catch (error) {
    showMessage(accountMessage, `登出失敗：${error.message}`, "error");
  } finally {
    signOutButton.disabled = false;
  }
}

async function resetGame() {
  const highScore = gameState.high_score;
  gameState = createInitialState();
  gameState.high_score = highScore;
  chestScore = 0;
  selectedGemIndex = null;
  matchBusy = false;
  if (matchDialog.open) matchDialog.close();
  if (riddleDialog.open) riddleDialog.close();
  if (victoryDialog.open) victoryDialog.close();
  showMessage(mazeMessage, "移動角色，找到寶箱。");
  showMessage(gameMessage, "新的一趟冒險開始了。");
  renderGame();
  await saveProgress();
}

function onMatchBoardClick(event) {
  const button = event.target.closest("[data-gem-index]");
  if (!button) return;
  void chooseGem(Number(button.dataset.gemIndex));
}

document.querySelectorAll("[data-move]").forEach((button) => {
  button.addEventListener("click", () => void movePlayer(button.dataset.move));
});

document.querySelector(".dpad .wait-button").addEventListener("click", () => {
  showMessage(mazeMessage, "休息一下，再繼續探索。");
});

document.addEventListener("keydown", (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
  if (matchDialog.open || riddleDialog.open || victoryDialog.open) return;
  const keyDirection = {
    ArrowUp: "up",
    w: "up",
    W: "up",
    ArrowDown: "down",
    s: "down",
    S: "down",
    ArrowLeft: "left",
    a: "left",
    A: "left",
    ArrowRight: "right",
    d: "right",
    D: "right",
  };
  const direction = keyDirection[event.key];
  if (!direction) return;
  event.preventDefault();
  void movePlayer(direction);
});

matchBoardElement.addEventListener("click", onMatchBoardClick);
document.querySelector("#closeMatchButton").addEventListener("click", () => matchDialog.close());
document.querySelector("#closeRiddleButton").addEventListener("click", () => riddleDialog.close());
document.querySelector(".answer-list").addEventListener("click", (event) => {
  const answerButton = event.target.closest("[data-answer]");
  if (answerButton) void answerRiddle(answerButton.dataset.answer);
});
document.querySelector("#resetButton").addEventListener("click", () => void resetGame());
document.querySelector("#playAgainButton").addEventListener("click", () => void resetGame());
authForm.addEventListener("submit", (event) => void signInWithPassword(event));
signUpButton.addEventListener("click", () => void signUpWithPassword());
anonymousButton.addEventListener("click", () => void signInAnonymously());
signOutButton.addEventListener("click", () => void signOut());

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installButton.hidden = true;
});

async function initializeGame() {
  renderGame();
  const config = window.textMazeSupabaseConfig;
  const isConfigured = config
    && /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(config.url)
    && config.publishableKey
    && !config.publishableKey.startsWith("YOUR_");
  if (isConfigured && window.supabase?.createClient) {
    try {
      supabaseClient = window.supabase.createClient(config.url, config.publishableKey);
      const { data, error } = await supabaseClient.auth.getSession();
      if (error) throw error;
      await loadProgressForSession(data.session);
      authEventsReady = true;
      supabaseClient.auth.onAuthStateChange((_event, session) => {
        if (!authEventsReady) return;
        window.setTimeout(() => {
          void loadProgressForSession(session);
        }, 0);
      });
    } catch (error) {
      console.error("Could not initialize Supabase for the text maze.", error);
      gameState = readLocalSave(null) || createInitialState();
      setGameReady(true);
      syncIndicator.classList.add("is-error");
      showMessage(accountMessage, `Supabase 尚未連線，先使用本機進度：${error.message}`, "error");
    }
  } else {
    gameState = readLocalSave(null) || createInitialState();
    setGameReady(true);
    showMessage(accountMessage, "目前為離線模式。填入 Supabase 設定後即可啟用帳號與跨裝置同步。");
  }
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    try {
      await navigator.serviceWorker.register("./service-worker.js");
    } catch (error) {
      console.error("Could not register the text maze service worker.", error);
      showMessage(gameMessage, "離線快取尚未啟用；連線後仍可正常遊玩。", "error");
    }
  }
  if (gameState.completed) showVictoryOnRestore();
}

void initializeGame();
