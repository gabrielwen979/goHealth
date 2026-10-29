/* 上海麻將 繪圖模組：Canvas 3D 立體麻將牌、點選判定、動畫。全域 MjRender。 */
(function (global) {
  'use strict';

  var SERIF = '"Songti TC","STSong","Noto Serif CJK TC","Noto Serif TC","PMingLiU","Source Han Serif TC","SimSun",serif';
  var NUM = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
  var WINDS = ['東', '南', '西', '北'];
  var DRAG = ['中', '發', '白'];
  var FLOWER = ['梅', '蘭', '竹', '菊'];
  var SEASON = ['春', '夏', '秋', '冬'];
  var FLOWER_COL = ['#c2185b', '#7b1fa2', '#2e7d32', '#e08a00'];
  var SEASON_COL = ['#2e9e4f', '#d84315', '#b8741a', '#1e6fb8'];

  var RATIO = 1.22;   // 牌面高寬比（格子為正方形，縱向拉長讓牌更像麻將）
  var LK = 0.5;       // 每層位移 / 側面厚度（相對於半格寬）
  var PAD = 6;

  // ---- 條子 / 筒子 排列（正規化座標 0..1）----
  var BAM = {
    2: { sw: .17, sh: .34, p: [[.5, .27], [.5, .73]] },
    3: { sw: .17, sh: .34, p: [[.5, .27], [.3, .73], [.7, .73]] },
    4: { sw: .17, sh: .34, p: [[.3, .27], [.7, .27], [.3, .73], [.7, .73]] },
    5: { sw: .17, sh: .32, p: [[.25, .24], [.75, .24], [.25, .76], [.75, .76], [.5, .5, 1]] },
    6: { sw: .15, sh: .34, p: [[.2, .27], [.5, .27], [.8, .27], [.2, .73], [.5, .73], [.8, .73]] },
    7: { sw: .14, sh: .27, p: [[.5, .18, 1], [.2, .5], [.5, .5], [.8, .5], [.2, .82], [.5, .82], [.8, .82]] },
    8: { sw: .12, sh: .34, p: [[.14, .27], [.38, .27], [.62, .27], [.86, .27], [.14, .73], [.38, .73], [.62, .73], [.86, .73]] },
    9: { sw: .14, sh: .27, p: [[.2, .17], [.5, .17, 1], [.8, .17], [.2, .5], [.5, .5, 1], [.8, .5], [.2, .83], [.5, .83, 1], [.8, .83]] }
  };
  var DOT = {
    1: { r: .36, p: [[.5, .5]] },
    2: { r: .21, p: [[.5, .26], [.5, .74]] },
    3: { r: .17, p: [[.27, .2], [.5, .5], [.73, .8]] },
    4: { r: .2, p: [[.3, .27], [.7, .27], [.3, .73], [.7, .73]] },
    5: { r: .17, p: [[.27, .24], [.73, .24], [.5, .5], [.27, .76], [.73, .76]] },
    6: { r: .15, p: [[.3, .2], [.7, .2], [.3, .5], [.7, .5], [.3, .8], [.7, .8]] },
    7: { r: .13, p: [[.22, .14], [.5, .26], [.78, .38], [.3, .66], [.7, .66], [.3, .88], [.7, .88]] },
    8: { r: .12, p: [[.3, .14], [.7, .14], [.3, .38], [.7, .38], [.3, .62], [.7, .62], [.3, .86], [.7, .86]] },
    9: { r: .13, p: [[.2, .2], [.5, .2], [.8, .2], [.2, .5], [.5, .5], [.8, .5], [.2, .8], [.5, .8], [.8, .8]] }
  };
  var DOT_COL = ['#1f7a3d', '#c62828', '#1c5fa8'];

  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function mix(c1, c2, t) {
    return 'rgb(' + Math.round(lerp(c1[0], c2[0], t)) + ',' + Math.round(lerp(c1[1], c2[1], t)) + ',' + Math.round(lerp(c1[2], c2[2], t)) + ')';
  }
  var JADE = [38, 125, 96], JADE_DK = [20, 78, 62], CREAM = [244, 236, 205];

  // ---- 牌面圖案 ----
  function drawGlyph(ctx, face, x, y, w, h) {
    var ix = x + w * .12, iy = y + h * .1, iw = w * .76, ih = h * .8;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var cx = x + w / 2, cy = y + h / 2;
    if (face <= 8) { // 萬子：紅色數字 + 萬
      ctx.fillStyle = '#c62828';
      ctx.font = 'bold ' + (w * .46) + 'px ' + SERIF;
      ctx.fillText(NUM[face], cx, y + h * .32);
      ctx.fillStyle = '#7a1212';
      ctx.font = 'bold ' + (w * .5) + 'px ' + SERIF;
      ctx.fillText('萬', cx, y + h * .70);
    } else if (face <= 17) {
      drawBamboo(ctx, face - 9 + 1, ix, iy, iw, ih);
    } else if (face <= 26) {
      drawDots(ctx, face - 18 + 1, ix, iy, iw, ih);
    } else if (face <= 30) {
      ctx.fillStyle = '#1d2330';
      ctx.font = 'bold ' + (w * .7) + 'px ' + SERIF;
      ctx.fillText(WINDS[face - 27], cx, cy + h * .02);
    } else if (face <= 33) {
      var d = face - 31;
      if (d === 0) { ctx.fillStyle = '#d32020'; ctx.font = 'bold ' + (w * .72) + 'px ' + SERIF; ctx.fillText('中', cx, cy + h * .02); }
      else if (d === 1) { ctx.fillStyle = '#1b8a3c'; ctx.font = 'bold ' + (w * .7) + 'px ' + SERIF; ctx.fillText('發', cx, cy + h * .02); }
      else { // 白板：藍色圓角框
        ctx.strokeStyle = '#2757b5';
        ctx.lineWidth = Math.max(1.5, w * .06);
        rr(ctx, x + w * .2, y + h * .2, w * .6, h * .6, w * .1);
        ctx.stroke();
        ctx.lineWidth = Math.max(1, w * .025);
        rr(ctx, x + w * .28, y + h * .28, w * .44, h * .44, w * .06);
        ctx.stroke();
      }
    } else {
      var isSeason = face >= 38;
      var k = isSeason ? face - 38 : face - 34;
      var col = isSeason ? SEASON_COL[k] : FLOWER_COL[k];
      ctx.fillStyle = col;
      ctx.font = 'bold ' + (w * .62) + 'px ' + SERIF;
      ctx.fillText(isSeason ? SEASON[k] : FLOWER[k], cx, cy + h * .08);
      // 小花飾（花=五瓣花，季=葉形）
      var ox = x + w * .24, oy = y + h * .17, pr = w * .06;
      ctx.fillStyle = col;
      if (!isSeason) {
        for (var i = 0; i < 5; i++) {
          var a = i * Math.PI * 2 / 5;
          ctx.beginPath(); ctx.arc(ox + Math.cos(a) * pr * 1.2, oy + Math.sin(a) * pr * 1.2, pr, 0, 7); ctx.fill();
        }
        ctx.fillStyle = '#ffd54f';
        ctx.beginPath(); ctx.arc(ox, oy, pr * .8, 0, 7); ctx.fill();
      } else {
        ctx.beginPath();
        ctx.ellipse(ox, oy, pr * 1.6, pr * .8, -0.6, 0, 7); ctx.fill();
        ctx.strokeStyle = '#fffbe6'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(ox - pr, oy + pr * .6); ctx.lineTo(ox + pr, oy - pr * .6); ctx.stroke();
      }
    }
    ctx.restore();
  }

  function stick(ctx, cx, cy, sw, sh, col) {
    var x = cx - sw / 2, y = cy - sh / 2;
    ctx.fillStyle = col;
    rr(ctx, x, y, sw, sh, sw * .45); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    rr(ctx, x + sw * .15, y + sh * .06, sw * .22, sh * .88, sw * .1); ctx.fill();
    ctx.strokeStyle = 'rgba(0,40,10,.55)';
    ctx.lineWidth = Math.max(1, sw * .12);
    ctx.beginPath();
    ctx.moveTo(x, cy); ctx.lineTo(x + sw, cy);
    ctx.moveTo(x, y + sh * .25); ctx.lineTo(x + sw, y + sh * .25);
    ctx.moveTo(x, y + sh * .75); ctx.lineTo(x + sw, y + sh * .75);
    ctx.stroke();
  }

  function drawBamboo(ctx, rank, x, y, w, h) {
    if (rank === 1) { // 一條：小鳥
      var cx = x + w / 2, cy = y + h / 2, s = w;
      ctx.fillStyle = '#1f7a3d';
      ctx.beginPath(); ctx.ellipse(cx, cy + h * .06, s * .3, h * .24, -.25, 0, 7); ctx.fill();
      ctx.fillStyle = '#c62828';
      ctx.beginPath(); ctx.moveTo(cx - s * .28, cy + h * .12); ctx.quadraticCurveTo(cx - s * .6, cy + h * .38, cx - s * .38, cy + h * .46); ctx.lineTo(cx - s * .15, cy + h * .22); ctx.fill();
      ctx.fillStyle = '#1b5e2f';
      ctx.beginPath(); ctx.arc(cx + s * .26, cy - h * .22, s * .16, 0, 7); ctx.fill();
      ctx.fillStyle = '#e8a600';
      ctx.beginPath(); ctx.moveTo(cx + s * .38, cy - h * .26); ctx.lineTo(cx + s * .58, cy - h * .2); ctx.lineTo(cx + s * .38, cy - h * .15); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(cx + s * .3, cy - h * .25, s * .035, 0, 7); ctx.fill();
      ctx.fillStyle = '#c62828';
      ctx.beginPath(); ctx.ellipse(cx - s * .08, cy + h * .02, s * .13, h * .09, -.3, 0, 7); ctx.fill();
      ctx.strokeStyle = '#6b4a14'; ctx.lineWidth = Math.max(1, s * .04);
      ctx.beginPath(); ctx.moveTo(cx + s * .05, cy + h * .26); ctx.lineTo(cx + s * .05, cy + h * .4); ctx.stroke();
      return;
    }
    var L = BAM[rank];
    for (var i = 0; i < L.p.length; i++) {
      var q = L.p[i];
      var col = q[2] ? '#c62828' : (rank === 9 ? ['#1f7a3d', '#c62828', '#1c5fa8'][i % 3] : '#1f7a3d');
      stick(ctx, x + q[0] * w, y + q[1] * h, w * L.sw, h * L.sh, col);
    }
  }

  function drawDots(ctx, rank, x, y, w, h) {
    var L = DOT[rank];
    for (var i = 0; i < L.p.length; i++) {
      var q = L.p[i], r = L.r * w;
      var cx = x + q[0] * w, cy = y + q[1] * h;
      var col = (rank === 5 && i === 2) ? DOT_COL[1] : DOT_COL[(rank === 1 ? 1 : i) % 3];
      if (rank === 1) col = DOT_COL[1];
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
      ctx.fillStyle = '#fffaf0';
      ctx.beginPath(); ctx.arc(cx, cy, r * .78, 0, 7); ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(cx, cy, r * .62, 0, 7); ctx.fill();
      ctx.fillStyle = '#fffaf0';
      ctx.beginPath(); ctx.arc(cx, cy, r * .3, 0, 7); ctx.fill();
      ctx.fillStyle = rank === 1 ? '#1f7a3d' : col;
      ctx.beginPath(); ctx.arc(cx, cy, r * .16, 0, 7); ctx.fill();
      if (rank === 1) { // 一筒花紋
        ctx.strokeStyle = '#fffaf0'; ctx.lineWidth = Math.max(1, r * .06);
        for (var k = 0; k < 8; k++) {
          var a = k * Math.PI / 4;
          ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r * .34, cy + Math.sin(a) * r * .34); ctx.lineTo(cx + Math.cos(a) * r * .58, cy + Math.sin(a) * r * .58); ctx.stroke();
        }
      }
    }
  }

  function star(ctx, x, y, r, rot) {
    ctx.beginPath();
    for (var i = 0; i < 8; i++) {
      var a = rot + i * Math.PI / 4, rad = i % 2 ? r * .3 : r;
      ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
    }
    ctx.closePath();
  }

  // ---------------------------------------------------------------
  function create(canvas, game, opts) {
    opts = opts || {};
    var ctx = canvas.getContext('2d');
    var r = {};
    var order = [], byId = {};
    var selected = null, hintA = null, hintB = null, showFree = true;
    var ghosts = [], particles = [], removeAnims = [];
    var shuffleAnim = null, winAnim = null;
    var raf = 0, lastTs = 0;
    var cssW = 0, cssH = 0, dpr = 1;
    var ux = 10, uy = 12, L = 5, ox = 0, oy = 0;
    var freeCache = null;

    canvas.style.touchAction = 'none';

    function now() { return (global.performance && performance.now) ? performance.now() : Date.now(); }

    function rebuild() {
      byId = {};
      var tiles = game ? game.tiles : [];
      for (var i = 0; i < tiles.length; i++) byId[tiles[i].id] = tiles[i];
      // 繪製順序：層 z → x+y → y → x（由後往前，後畫的在上方）
      order = tiles.slice().sort(function (a, b) {
        return (a.z - b.z) || ((a.x + a.y) - (b.x + b.y)) || (a.y - b.y) || (a.x - b.x);
      });
    }

    // 牌面左上角的螢幕座標：每上一層往左上位移 L
    function pos(t) {
      return { x: ox + t.x * ux - t.z * L, y: oy + t.y * uy - t.z * L, w: 2 * ux, h: 2 * uy };
    }

    r.resize = function () {
      var par = canvas.parentElement;
      cssW = canvas.clientWidth || (par && par.clientWidth) || 300;
      cssH = canvas.clientHeight || (par && par.clientHeight) || 300;
      dpr = global.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(cssW * dpr));
      canvas.height = Math.max(1, Math.round(cssH * dpr));
      var bw = game ? game.width : 1, bh = game ? game.height : 1, ly = game ? Math.max(1, game.layers) : 1;
      // 整個盤面（含 3D 深度）塞進畫布：寬 = bw*ux + ly*L，高 = bh*uy + ly*L
      var k = LK;
      var fx = (cssW - PAD * 2) / (bw + ly * k);
      var fy = (cssH - PAD * 2) / (bh * RATIO + ly * k);
      ux = Math.max(2, Math.min(fx, fy, 60));
      uy = ux * RATIO;
      L = ux * k;
      var tw = bw * ux + ly * L, th = bh * uy + ly * L;
      ox = (cssW - tw) / 2 + (ly - 1) * L;
      oy = (cssH - th) / 2 + (ly - 1) * L;
      r.draw();
    };

    function isFree(t) {
      if (freeCache && freeCache[t.id] !== undefined) return freeCache[t.id];
      var v = true;
      try { v = game.isFree ? !!game.isFree(t.id) : true; } catch (e) { v = true; }
      if (freeCache) freeCache[t.id] = v;
      return v;
    }

    // 單張牌的完整 3D 繪製
    function drawTile(t, o) {
      o = o || {};
      var p = pos(t);
      var x = p.x + (o.dx || 0), y = p.y + (o.dy || 0), w = p.w, h = p.h;
      var sx = o.sx === undefined ? 1 : o.sx;
      ctx.save();
      if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
      if (sx !== 1) { // 翻轉效果：以牌中心水平縮放
        var mx = x + (w + L) / 2;
        ctx.translate(mx, 0); ctx.scale(sx, 1); ctx.translate(-mx, 0);
      }
      var rad = w * .16;
      // 陰影（落在下一層／桌面）
      if (!o.noShadow) {
        ctx.fillStyle = 'rgba(0,0,0,.10)';
        rr(ctx, x + L * 1.5, y + L * 1.5, w + L * .4, h + L * .4, rad); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,.14)';
        rr(ctx, x + L * 1.15, y + L * 1.15, w + L * .2, h + L * .2, rad); ctx.fill();
      }
      // 厚度：由遠到近 玉綠 → 象牙
      var steps = 5;
      for (var i = steps; i >= 1; i--) {
        var f = i / steps, d = L * f;
        var col = f > .45 ? mix(JADE_DK, JADE, (1 - f) / .55) : mix(JADE, CREAM, (.45 - f) / .45 * .85);
        ctx.fillStyle = col;
        rr(ctx, x + d, y + d, w, h, rad); ctx.fill();
      }
      ctx.strokeStyle = 'rgba(10,40,30,.55)'; ctx.lineWidth = 1;
      rr(ctx, x + L, y + L, w, h, rad); ctx.stroke();
      // 正面
      var g = ctx.createLinearGradient(x, y, x + w, y + h);
      g.addColorStop(0, '#fffef6'); g.addColorStop(.55, '#f8f0d6'); g.addColorStop(1, '#e8dcb6');
      ctx.fillStyle = g;
      rr(ctx, x, y, w, h, rad); ctx.fill();
      drawGlyph(ctx, t.face, x, y, w, h);
      // 左上高光
      var hg = ctx.createLinearGradient(x, y, x + w * .8, y + h * .6);
      hg.addColorStop(0, 'rgba(255,255,255,.65)'); hg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = hg;
      rr(ctx, x, y, w, h, rad); ctx.fill();
      ctx.strokeStyle = 'rgba(120,100,60,.75)'; ctx.lineWidth = 1;
      rr(ctx, x + .5, y + .5, w - 1, h - 1, rad); ctx.stroke();
      // 可用／不可用：未解鎖牌壓暗
      if (o.dim) {
        ctx.fillStyle = 'rgba(20,45,50,.38)';
        rr(ctx, x, y, w, h, rad); ctx.fill();
      }
      // 發光（提示 / 選取 / 消除）
      if (o.glow > 0) {
        ctx.save();
        ctx.shadowColor = o.glowColor || '#ffd54f';
        ctx.shadowBlur = 8 + 16 * o.glow;
        ctx.strokeStyle = o.glowColor || '#ffcc33';
        ctx.lineWidth = 2 + 2 * o.glow;
        ctx.globalAlpha *= Math.min(1, .4 + o.glow);
        rr(ctx, x, y, w, h, rad); ctx.stroke();
        ctx.restore();
        ctx.fillStyle = 'rgba(255,230,120,' + (.12 + .28 * o.glow) + ')';
        rr(ctx, x, y, w, h, rad); ctx.fill();
      }
      ctx.restore();
    }

    function tileOpts(t, ts) {
      var o = {};
      if (showFree && !isFree(t)) o.dim = true;
      if (t.id === selected) { o.glow = 1; o.glowColor = '#ff9800'; o.dy = -L * .5; o.dx = -L * .3; }
      else if (t.id === hintA || t.id === hintB) {
        o.glow = .5 + .5 * Math.sin(ts / 170); o.glowColor = '#ffe066';
      }
      if (shuffleAnim) {
        var u = Math.min(1, (ts - shuffleAnim.start) / shuffleAnim.dur);
        // 依位置錯開的翻牌
        var ph = Math.max(0, Math.min(1, u * 1.6 - (t.x / (game.width || 1)) * .6));
        o.sx = Math.max(.04, Math.abs(Math.cos(Math.PI * ph)));
        o.dy = (o.dy || 0) - Math.sin(Math.PI * ph) * L * 1.2;
      }
      if (winAnim) {
        var wt = (ts - winAnim.start) / 1000;
        var b = Math.sin(wt * 5 - (t.x + t.y) * .12 - t.z);
        if (wt < 2.4 && b > 0) o.dy = (o.dy || 0) - b * ux * .9;
      }
      return o;
    }

    r.draw = function () {
      if (!cssW) return;
      var ts = now();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);
      if (!game) return;
      freeCache = {};
      var i, t;
      for (i = 0; i < order.length; i++) {
        t = order[i];
        if (t.removed) continue;
        drawTile(t, tileOpts(t, ts));
      }
      // 消除中的「殘影」牌浮在最上層
      for (i = 0; i < ghosts.length; i++) {
        var gh = ghosts[i], p = Math.min(1, (ts - gh.start) / gh.dur);
        var e = 1 - Math.pow(1 - p, 3);
        drawTile(gh.t, {
          dy: -e * ux * 1.1, dx: -e * ux * .3,
          alpha: p < .45 ? 1 : Math.max(0, 1 - (p - .45) / .55),
          glow: Math.sin(Math.min(1, p * 1.5) * Math.PI * .8) + .2,
          glowColor: '#fff2a8', noShadow: p > .3
        });
      }
      freeCache = null;
      for (i = 0; i < particles.length; i++) {
        var q = particles[i], a = Math.max(0, 1 - q.age / q.life);
        ctx.globalAlpha = a;
        ctx.fillStyle = q.color;
        star(ctx, q.x, q.y, q.size * (.6 + .4 * a), q.rot);
        ctx.fill();
        if (q.paw) { ctx.beginPath(); ctx.arc(q.x, q.y, q.size * .35, 0, 7); ctx.fill(); }
      }
      ctx.globalAlpha = 1;
    };

    function spawn(t, n, big) {
      var p = pos(t), cx = p.x + p.w / 2, cy = p.y + p.h / 2;
      var cols = ['#ffe066', '#fff4b0', '#ffb3d1', '#b8f0ff', '#ffffff'];
      for (var i = 0; i < n; i++) {
        var a = Math.random() * Math.PI * 2, sp = (big ? 90 : 50) + Math.random() * 160;
        particles.push({
          x: cx + (Math.random() - .5) * p.w * .6, y: cy + (Math.random() - .5) * p.h * .6,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, age: 0, life: .55 + Math.random() * .5,
          size: ux * (.35 + Math.random() * .55), rot: Math.random() * 3,
          color: cols[(Math.random() * cols.length) | 0], paw: Math.random() < .25
        });
      }
    }

    function isActive() {
      return ghosts.length || particles.length || shuffleAnim || winAnim || hintA != null || hintB != null;
    }
    function kick() { if (!raf) { lastTs = now(); raf = requestAnimationFrame(loop); } }

    function loop() {
      raf = 0;
      var ts = now(), dt = Math.min(.05, (ts - lastTs) / 1000);
      lastTs = ts;
      var i;
      for (i = particles.length - 1; i >= 0; i--) {
        var q = particles[i];
        q.age += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 260 * dt; q.vx *= .98; q.rot += dt * 4;
        if (q.age >= q.life) particles.splice(i, 1);
      }
      for (i = removeAnims.length - 1; i >= 0; i--) {
        var ra = removeAnims[i];
        if (ts - ra.start >= ra.dur) {
          removeAnims.splice(i, 1);
          ghosts = ghosts.filter(function (g) { return g.anim !== ra; });
          if (ra.done) { try { ra.done(); } catch (e) { console.error(e); } }
        }
      }
      if (shuffleAnim && ts - shuffleAnim.start >= shuffleAnim.dur) {
        var sd = shuffleAnim.done; shuffleAnim = null;
        if (sd) { try { sd(); } catch (e) { console.error(e); } }
      }
      if (winAnim) {
        var wt = (ts - winAnim.start) / 1000;
        if (wt < 3.5 && Math.random() < .5 && order.length) {
          // 勝利時在畫面上隨機噴出星光
          var rx = Math.random() * cssW, ry = Math.random() * cssH * .8;
          for (var k = 0; k < 6; k++) {
            particles.push({ x: rx, y: ry, vx: (Math.random() - .5) * 240, vy: -Math.random() * 160, age: 0, life: .8 + Math.random() * .6,
              size: ux * (.4 + Math.random() * .6), rot: Math.random() * 3, color: ['#ffe066', '#ffb3d1', '#b8f0ff', '#fff'][k % 4], paw: k % 3 === 0 });
          }
        }
        if (wt > 4.2) winAnim = null;
      }
      r.draw();
      if (isActive()) raf = requestAnimationFrame(loop);
    }

    // ---- 公開 API ----
    r.setGame = function (g) {
      game = g; ghosts = []; particles = []; removeAnims = []; shuffleAnim = null; winAnim = null;
      selected = hintA = hintB = null;
      rebuild(); r.resize();
    };
    r.setSelected = function (id) { selected = id == null ? null : id; r.draw(); };
    r.setHint = function (a, b) {
      hintA = a == null ? null : a; hintB = b == null ? null : b;
      r.draw(); if (isActive()) kick();
    };
    r.setShowFree = function (v) { showFree = !!v; r.draw(); };

    r.animateRemove = function (a, b, done) {
      var ra = { start: now(), dur: 450, done: done };
      removeAnims.push(ra);
      [a, b].forEach(function (id) {
        var t = byId[id];
        if (!t) return;
        ghosts.push({ t: t, start: ra.start, dur: ra.dur, anim: ra });
        spawn(t, 12, true);
      });
      if (hintA === a || hintA === b || hintB === a || hintB === b) { hintA = hintB = null; }
      if (selected === a || selected === b) selected = null;
      r.draw(); kick();
    };
    r.animateShuffle = function (done) {
      shuffleAnim = { start: now(), dur: 650, done: done };
      kick();
    };
    r.animateWin = function () {
      winAnim = { start: now() };
      kick();
    };

    // ---- 點選判定 ----
    function hitTest(px, py) {
      var slop = Math.max(2, ux * .2);
      for (var i = order.length - 1; i >= 0; i--) {
        var t = order[i];
        if (t.removed) continue;
        var p = pos(t);
        // 整個 3D 足跡：正面 + 右／下側面（外接矩形，含手指容錯）
        if (px >= p.x - slop && px <= p.x + p.w + L + slop && py >= p.y - slop && py <= p.y + p.h + L + slop) return t;
      }
      return null;
    }
    r.hitTest = function (px, py) { var t = hitTest(px, py); return t ? t.id : null; };

    var down = null;
    function local(e) {
      var b = canvas.getBoundingClientRect();
      return { x: (e.clientX - b.left) * (cssW / (b.width || cssW)), y: (e.clientY - b.top) * (cssH / (b.height || cssH)) };
    }
    function onDown(e) { down = { cx: e.clientX, cy: e.clientY, id: e.pointerId }; }
    function onUp(e) {
      if (!down) return;
      var d = Math.hypot(e.clientX - down.cx, e.clientY - down.cy);
      down = null;
      if (d > 10) return;
      var p = local(e), t = hitTest(p.x, p.y);
      if (t && typeof r.onTileTap === 'function') r.onTileTap(t.id);
    }
    function onCancel() { down = null; }
    function onMove(e) {
      if (e.pointerType === 'touch') return;
      var p = local(e);
      canvas.style.cursor = hitTest(p.x, p.y) ? 'pointer' : 'default';
    }
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onCancel);
    canvas.addEventListener('pointermove', onMove);

    r.onTileTap = opts.onTileTap || null;

    r.destroy = function () {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onCancel);
      canvas.removeEventListener('pointermove', onMove);
      ghosts = []; particles = []; removeAnims = [];
    };

    rebuild();
    r.resize();
    return r;
  }

  global.MjRender = { create: create };
})(typeof window !== 'undefined' ? window : this);
