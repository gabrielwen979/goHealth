/**
 * 《肉墊的夢境編織》音效模組 CatAudio
 * 全部音效皆以 Web Audio API 即時合成，不使用任何外部音檔。
 * 對外只暴露 window.CatAudio：
 *   init / step / startPurr / stopPurr / crystal / meow / win / setMuted / isMuted
 *
 * 瀏覽器自動播放政策：init() 必須在使用者手勢（click / pointerdown / keydown）內呼叫，
 * 才會建立並 resume AudioContext；未 init 時其餘函式一律安靜返回，不丟例外。
 */
(function () {
  'use strict';

  // ---------- 常數 ----------
  var STORAGE_KEY = 'catDreamWeaver.muted'; // localStorage 的靜音設定鍵
  var MASTER_VOLUME = 0.8;                  // 主音量（未靜音時的 master gain）
  var PURR_IDLE_MS = 700;                   // step() 之後呼嚕聲持續的毫秒數
  var PURR_FADE_IN = 0.25;                  // 呼嚕聲淡入秒數
  var PURR_FADE_OUT = 0.35;                 // 呼嚕聲淡出秒數
  var PURR_LEVEL = 0.05;                    // 呼嚕聲峰值音量（刻意極低，不蓋過其他音效）

  // ---------- 內部狀態 ----------
  var ctx = null;          // AudioContext
  var master = null;       // 主增益節點，負責靜音
  var noiseBuffer = null;  // 共用的白噪音 buffer（沙沙聲）
  var muted = loadMuted(); // 靜音狀態（未 init 前也可查詢）
  var purr = null;         // 目前的呼嚕聲節點組；null 表示沒有
  var purrManual = false;  // 是否由 startPurr() 手動持續
  var purrTimer = null;    // step() 設定的閒置淡出計時器

  // ---------- 工具函式 ----------

  // 讀取持久化的靜音設定；localStorage 不可用（隱私模式等）時預設為不靜音
  function loadMuted() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  // 寫入靜音設定；失敗時忽略
  function saveMuted(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
    } catch (e) {
      // 無法持久化時僅保留於記憶體
    }
  }

  // 是否已可發聲（已 init 且 context 未關閉）
  function ready() {
    return !!ctx && !!master && ctx.state !== 'closed';
  }

  // 在 [min, max] 區間內取均勻隨機數
  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  // 安全地停止並斷開節點（節點可能已停止，須吞掉例外）
  function safeStop(node, when) {
    try {
      node.stop(when);
    } catch (e) {
      // 已停止或尚未啟動，忽略
    }
  }

  // 安全地斷開節點連線
  function safeDisconnect(node) {
    try {
      node.disconnect();
    } catch (e) {
      // 已斷開，忽略
    }
  }

  // 建立 1 秒的單聲道白噪音 buffer（每個取樣為 -1 到 1 的均勻隨機值）
  function createNoiseBuffer(audioCtx) {
    var length = audioCtx.sampleRate;
    var buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // 套用靜音：以 setTargetAtTime 平滑切換，避免爆音
  function applyMute() {
    if (!ready()) return;
    var target = muted ? 0 : MASTER_VOLUME;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(target, ctx.currentTime, 0.02);
  }

  // ---------- 初始化 ----------

  /**
   * 建立（或重用）AudioContext 並 resume。需在使用者手勢內呼叫。
   * 支援 webkitAudioContext。回傳是否成功可用。
   */
  function init() {
    try {
      if (!ctx) {
        var Ctor = window.AudioContext || window.webkitAudioContext;
        if (!Ctor) return false;
        ctx = new Ctor();
        master = ctx.createGain();
        master.gain.value = muted ? 0 : MASTER_VOLUME;
        master.connect(ctx.destination);
        noiseBuffer = createNoiseBuffer(ctx);
      }
      if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
        var p = ctx.resume();
        if (p && typeof p.catch === 'function') p.catch(function () {});
      }
      return true;
    } catch (e) {
      ctx = null;
      master = null;
      noiseBuffer = null;
      return false;
    }
  }

  // ---------- 草地沙沙聲 ----------

  /**
   * 草地沙沙聲：白噪音 → bandpass（中心頻率 3000 到 6000Hz 隨機，Q 約 1.2）→ 增益包絡。
   * 包絡：約 6ms 起音，之後指數衰減至約 80ms 結束，模擬腳掌輕踩草葉。
   * 每次隨機化中心頻率、音量與播放起點，避免機械重複感。
   */
  function playRustle() {
    var now = ctx.currentTime;
    var src = ctx.createBufferSource();
    src.buffer = noiseBuffer;

    var band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = rand(3000, 6000);
    band.Q.value = rand(0.9, 1.6);

    var env = ctx.createGain();
    var peak = rand(0.10, 0.18);
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(peak, now + 0.006);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    src.connect(band);
    band.connect(env);
    env.connect(master);

    // 隨機選取 buffer 的起點（buffer 長 1 秒，取 0 到 0.8 秒之間）
    src.start(now, rand(0, 0.8), 0.1);
    src.stop(now + 0.1);
    src.onended = function () {
      safeDisconnect(src);
      safeDisconnect(band);
      safeDisconnect(env);
    };
  }

  // ---------- 貓咪呼嚕聲 ----------

  /**
   * 建立呼嚕聲節點組並淡入。
   * 合成原理：
   *   載波：triangle 振盪器，頻率約 70 到 110Hz 隨機，經 lowpass（約 240Hz）去除高頻刺耳感。
   *   調變：25Hz 正弦 LFO 驅動 AM 增益（0.5 ± 0.5），產生貓咪呼嚕特有的「嚕嚕嚕」顫動。
   *   輸出：envelope 增益負責淡入淡出，峰值極低（約 0.05）。
   */
  function buildPurr() {
    var now = ctx.currentTime;

    var carrier = ctx.createOscillator();
    carrier.type = 'triangle';
    carrier.frequency.value = rand(70, 110);

    var lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 240;
    lowpass.Q.value = 0.7;

    // AM 增益：基準 0.5，再加上 LFO（振幅 0.5）→ 增益在 0 到 1 之間以 25Hz 擺動
    var am = ctx.createGain();
    am.gain.value = 0.5;

    var lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = rand(24, 27);

    var lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0.5;

    var env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(PURR_LEVEL, now + PURR_FADE_IN);

    lfo.connect(lfoDepth);
    lfoDepth.connect(am.gain);
    carrier.connect(lowpass);
    lowpass.connect(am);
    am.connect(env);
    env.connect(master);

    carrier.start(now);
    lfo.start(now);

    return {
      carrier: carrier,
      lfo: lfo,
      lowpass: lowpass,
      am: am,
      lfoDepth: lfoDepth,
      env: env,
      stopTimer: null,
      fadingOut: false
    };
  }

  // 清除閒置淡出計時器
  function clearPurrTimer() {
    if (purrTimer !== null) {
      clearTimeout(purrTimer);
      purrTimer = null;
    }
  }

  // 確保呼嚕聲正在播放（若正在淡出則拉回；若不存在則新建）
  function ensurePurr() {
    if (!purr) {
      purr = buildPurr();
      return;
    }
    if (purr.fadingOut) {
      if (purr.stopTimer !== null) {
        clearTimeout(purr.stopTimer);
        purr.stopTimer = null;
      }
      purr.fadingOut = false;
      var now = ctx.currentTime;
      purr.env.gain.cancelScheduledValues(now);
      purr.env.gain.setValueAtTime(Math.max(purr.env.gain.value, 0.0001), now);
      purr.env.gain.linearRampToValueAtTime(PURR_LEVEL, now + PURR_FADE_IN);
    }
  }

  // 淡出並在淡出結束後釋放節點
  function fadeOutPurr() {
    if (!purr || purr.fadingOut) return;
    var current = purr;
    current.fadingOut = true;
    if (ready()) {
      var now = ctx.currentTime;
      current.env.gain.cancelScheduledValues(now);
      current.env.gain.setValueAtTime(Math.max(current.env.gain.value, 0.0001), now);
      current.env.gain.linearRampToValueAtTime(0.0001, now + PURR_FADE_OUT);
    }
    current.stopTimer = setTimeout(function () {
      var when = ready() ? ctx.currentTime : 0;
      safeStop(current.carrier, when);
      safeStop(current.lfo, when);
      safeDisconnect(current.carrier);
      safeDisconnect(current.lfo);
      safeDisconnect(current.lowpass);
      safeDisconnect(current.am);
      safeDisconnect(current.lfoDepth);
      safeDisconnect(current.env);
      if (purr === current) purr = null;
    }, Math.round(PURR_FADE_OUT * 1000) + 60);
  }

  // 重新計時：閒置 PURR_IDLE_MS 後淡出（手動模式下不計時）
  function schedulePurrIdle() {
    clearPurrTimer();
    if (purrManual) return;
    purrTimer = setTimeout(function () {
      purrTimer = null;
      if (!purrManual) fadeOutPurr();
    }, PURR_IDLE_MS);
  }

  /** 手動開始呼嚕聲，持續到呼叫 stopPurr() */
  function startPurr() {
    if (!ready()) return;
    purrManual = true;
    clearPurrTimer();
    ensurePurr();
  }

  /** 手動停止呼嚕聲（淡出） */
  function stopPurr() {
    purrManual = false;
    clearPurrTimer();
    if (!ready()) return;
    fadeOutPurr();
  }

  // ---------- 步伐 ----------

  /** 每走一步：播放沙沙聲，並確保呼嚕聲持續（最後一步後約 700ms 淡出） */
  function step() {
    if (!ready()) return;
    try {
      playRustle();
      ensurePurr();
      schedulePurrIdle();
    } catch (e) {
      // 音效失敗不可影響遊戲流程
    }
  }

  // ---------- 水晶碰撞聲 ----------

  /**
   * 在指定時間播放一次水晶碰撞聲。
   * 合成原理：4 個正弦波，頻率約為 1318Hz（E6）、1760Hz（A6）、2637Hz（E7）、3136Hz（G7），
   * 各自乘上略偏離整數比的失諧係數（1.000、1.003、0.997、1.005），形成玻璃般的泛音。
   * 包絡：約 4ms 快速起音，之後指數衰減約 0.6 秒；高泛音音量較小、衰減較快。
   * baseScale 可整體移調（win 琶音使用），volume 為整體音量。
   */
  function crystalAt(when, baseScale, volume) {
    var freqs = [1318.5, 1760, 2637, 3136];
    var detune = [1.0, 1.003, 0.997, 1.005];
    var gains = [0.5, 0.4, 0.25, 0.18];
    var decays = [0.6, 0.55, 0.45, 0.4];

    for (var i = 0; i < freqs.length; i++) {
      var osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freqs[i] * detune[i] * baseScale;

      var env = ctx.createGain();
      var peak = gains[i] * volume;
      env.gain.setValueAtTime(0.0001, when);
      env.gain.linearRampToValueAtTime(peak, when + 0.004);
      env.gain.exponentialRampToValueAtTime(0.0001, when + decays[i]);

      osc.connect(env);
      env.connect(master);
      osc.start(when);
      osc.stop(when + decays[i] + 0.05);
      attachCleanup(osc, env);
    }
  }

  // 振盪器結束後斷開節點，讓垃圾回收
  function attachCleanup(osc, env) {
    osc.onended = function () {
      safeDisconnect(osc);
      safeDisconnect(env);
    };
  }

  /** 水晶碰撞聲 */
  function crystal() {
    if (!ready()) return;
    try {
      crystalAt(ctx.currentTime, 1, 0.22);
    } catch (e) {
      // 忽略
    }
  }

  // ---------- 貓咪喵聲 ----------

  /**
   * 在指定時間播放一聲柔和的喵。
   * 合成原理：
   *   聲源：sawtooth，基頻滑音 400Hz → 700Hz（0.3 秒）→ 450Hz（0.6 秒），模擬喵的升降調。
   *   共振峰：兩個並聯 bandpass，約 800Hz（Q 5，較強）與 2400Hz（Q 8，較弱）模擬貓的母音「ㄇㄧㄠ」。
   *   柔化：再經 lowpass（約 5000Hz）削去高頻刺耳成分，讓聲音溫柔。
   *   包絡：約 90ms 柔和起音，尾端指數淡出至 0.6 秒。
   */
  function meowAt(when, volume) {
    var dur = 0.6;

    var osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, when);
    osc.frequency.linearRampToValueAtTime(700, when + 0.3);
    osc.frequency.linearRampToValueAtTime(450, when + dur);

    var f1 = ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f1.frequency.value = 800;
    f1.Q.value = 5;

    var f2 = ctx.createBiquadFilter();
    f2.type = 'bandpass';
    f2.frequency.value = 2400;
    f2.Q.value = 8;

    var g1 = ctx.createGain();
    g1.gain.value = 1.0;
    var g2 = ctx.createGain();
    g2.gain.value = 0.45;

    var soften = ctx.createBiquadFilter();
    soften.type = 'lowpass';
    soften.frequency.value = 5000;
    soften.Q.value = 0.5;

    var env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, when);
    env.gain.linearRampToValueAtTime(volume, when + 0.09);
    env.gain.setValueAtTime(volume, when + 0.3);
    env.gain.exponentialRampToValueAtTime(0.0001, when + dur);

    osc.connect(f1);
    osc.connect(f2);
    f1.connect(g1);
    f2.connect(g2);
    g1.connect(soften);
    g2.connect(soften);
    soften.connect(env);
    env.connect(master);

    osc.start(when);
    osc.stop(when + dur + 0.05);
    osc.onended = function () {
      safeDisconnect(osc);
      safeDisconnect(f1);
      safeDisconnect(f2);
      safeDisconnect(g1);
      safeDisconnect(g2);
      safeDisconnect(soften);
      safeDisconnect(env);
    };
  }

  /** 喵聲 */
  function meow() {
    if (!ready()) return;
    try {
      meowAt(ctx.currentTime, 0.35);
    } catch (e) {
      // 忽略
    }
  }

  // ---------- 通關 ----------

  /**
   * 通關音效：水晶琶音（由低到高五個音，每 0.09 秒一個，以倍率移調）接著一聲喵。
   * 以 E6（1318Hz）為基準，倍率 0.8、1.0、1.2、1.6、2.0 約為 C6、E6、G6、C7、E7，構成明亮的 C 大調上行琶音。
   */
  function win() {
    if (!ready()) return;
    try {
      var start = ctx.currentTime + 0.02;
      var scales = [0.8, 1.0, 1.2, 1.6, 2.0];
      for (var i = 0; i < scales.length; i++) {
        crystalAt(start + i * 0.09, scales[i], 0.16);
      }
      meowAt(start + scales.length * 0.09 + 0.1, 0.35);
    } catch (e) {
      // 忽略
    }
  }

  // ---------- 靜音 ----------

  /** 設定靜音（master gain 淡到 0 或還原），並持久化到 localStorage */
  function setMuted(value) {
    muted = !!value;
    saveMuted(muted);
    applyMute();
  }

  /** 目前是否靜音 */
  function isMuted() {
    return muted;
  }

  window.CatAudio = {
    init: init,
    step: step,
    startPurr: startPurr,
    stopPurr: stopPurr,
    crystal: crystal,
    meow: meow,
    win: win,
    setMuted: setMuted,
    isMuted: isMuted
  };
})();
