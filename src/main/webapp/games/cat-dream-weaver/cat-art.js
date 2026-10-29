/* 《肉墊的夢境編織》Canvas 繪圖：貓咪、肉墊、花朵、毛線球寶箱、大門、障礙物。
 * 座標皆為「中心點」，size 為像素邊長；純繪圖、不含遊戲邏輯。 */
(function () {
  'use strict';

  var TAU = Math.PI * 2;

  // 莫蘭迪配色
  var C = {
    pink: '#F3E8EE',
    sage: '#E2EDE4',
    blue: '#D6E4EB',
    gold: '#E6D3B6',
    goldDeep: '#C9AE86',
    padPink: '#F2B5C4',
    padPinkDeep: '#E59CB0',
    outline: '#6B7280'
  };

  // 繪製橢圓路徑
  function ellipse(ctx, x, y, rx, ry, rot) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rot || 0, 0, TAU);
  }

  // 圓潤貓耳：底部兩點 (x1,y1)(x2,y2)，尖端 (tx,ty)
  function earPath(ctx, x1, y1, x2, y2, tx, ty) {
    var mx = (x1 + x2) / 2;
    var my = (y1 + y2) / 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(x1 + (tx - x1) * 0.35, y1 + (ty - y1) * 0.75, tx, ty);
    ctx.quadraticCurveTo(x2 + (tx - x2) * 0.35, y2 + (ty - y2) * 0.75, x2, y2);
    ctx.quadraticCurveTo(mx, my + (y1 - ty) * 0.08, x1, y1);
    ctx.closePath();
  }

  function sparkle(ctx, x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.quadraticCurveTo(x, y, x, y + r);
    ctx.quadraticCurveTo(x, y, x - r, y);
    ctx.quadraticCurveTo(x, y, x, y - r);
    ctx.closePath();
    ctx.fill();
  }

  // ---------- 英短貓 ----------
  function drawCat(ctx, cx, cy, size, facing) {
    var s = size;
    var dx = 0;
    var dy = 0;
    if (facing === 'left') dx = -0.045;
    else if (facing === 'right') dx = 0.045;
    else if (facing === 'up') dy = -0.04;
    else dy = 0.03;
    var hx = cx + dx * s;
    var hy = cy + 0.05 * s + dy * s;

    ctx.save();

    // 身體
    var body = ctx.createLinearGradient(cx, cy + 0.2 * s, cx, cy + 0.5 * s);
    body.addColorStop(0, '#C3C8D0');
    body.addColorStop(1, '#9CA3AF');
    ctx.fillStyle = body;
    ellipse(ctx, cx + dx * 0.4 * s, cy + 0.37 * s, 0.27 * s, 0.14 * s);
    ctx.fill();

    // 耳朵
    var earSides = [-1, 1];
    for (var i = 0; i < 2; i++) {
      var k = earSides[i];
      var bx1 = hx + k * 0.1 * s;
      var bx2 = hx + k * 0.38 * s;
      var by = hy - 0.17 * s;
      var tx = hx + k * 0.33 * s;
      var ty = hy - 0.41 * s;
      var eg = ctx.createLinearGradient(tx, ty, hx + k * 0.24 * s, by);
      eg.addColorStop(0, '#8E95A1');
      eg.addColorStop(1, '#BCC1CA');
      ctx.fillStyle = eg;
      earPath(ctx, bx1, by + 0.03 * s, bx2, by + 0.03 * s, tx, ty);
      ctx.fill();
      ctx.fillStyle = '#F2C4D0';
      earPath(
        ctx,
        hx + k * 0.17 * s, by + 0.01 * s,
        hx + k * 0.33 * s, by + 0.01 * s,
        hx + k * 0.31 * s, hy - 0.3 * s
      );
      ctx.fill();
    }

    // 圓臉：銀灰漸層
    var fur = ctx.createRadialGradient(hx - 0.1 * s, hy - 0.14 * s, 0.04 * s, hx, hy, 0.46 * s);
    fur.addColorStop(0, '#F5F6F8');
    fur.addColorStop(0.55, '#CFD3DA');
    fur.addColorStop(1, '#9AA1AD');
    ctx.fillStyle = fur;
    ellipse(ctx, hx, hy, 0.42 * s, 0.355 * s);
    ctx.fill();
    ctx.lineWidth = Math.max(1, s * 0.016);
    ctx.strokeStyle = 'rgba(107,114,128,0.55)';
    ctx.stroke();

    // 圓嘟嘟臉頰
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ellipse(ctx, hx - 0.2 * s, hy + 0.09 * s, 0.16 * s, 0.13 * s);
    ctx.fill();
    ellipse(ctx, hx + 0.2 * s, hy + 0.09 * s, 0.16 * s, 0.13 * s);
    ctx.fill();

    // 額頭淡紋
    ctx.strokeStyle = 'rgba(120,127,140,0.45)';
    ctx.lineWidth = Math.max(1, s * 0.022);
    ctx.lineCap = 'round';
    for (var j = -1; j <= 1; j++) {
      ctx.beginPath();
      ctx.moveTo(hx + j * 0.07 * s, hy - 0.3 * s);
      ctx.lineTo(hx + j * 0.06 * s, hy - 0.2 * s);
      ctx.stroke();
    }

    // 綠寶石大眼
    var ex = dx * 0.5 * s;
    var ey = dy * 0.7 * s;
    var eyeY = hy - 0.025 * s + ey;
    for (var m = -1; m <= 1; m += 2) {
      var ox = hx + m * 0.165 * s + ex;
      var rx = 0.105 * s;
      var ry = 0.12 * s;
      var eg2 = ctx.createRadialGradient(ox, eyeY - 0.03 * s, 0.01 * s, ox, eyeY, ry);
      eg2.addColorStop(0, '#D9F7DF');
      eg2.addColorStop(0.45, '#6CCB98');
      eg2.addColorStop(1, '#2E8B63');
      ctx.fillStyle = eg2;
      ellipse(ctx, ox, eyeY, rx, ry);
      ctx.fill();
      ctx.lineWidth = Math.max(1, s * 0.014);
      ctx.strokeStyle = '#4B5563';
      ctx.stroke();
      // 瞳孔隨面向偏移
      var px = ox + dx * 0.9 * s;
      var py = eyeY + dy * 0.9 * s;
      ctx.fillStyle = '#1F2937';
      ellipse(ctx, px, py, 0.04 * s, 0.085 * s);
      ctx.fill();
      // 高光
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ellipse(ctx, ox - 0.03 * s, eyeY - 0.045 * s, 0.026 * s, 0.03 * s);
      ctx.fill();
      ellipse(ctx, ox + 0.035 * s, eyeY + 0.04 * s, 0.014 * s, 0.014 * s);
      ctx.fill();
    }

    // 鼻與嘴
    var nx = hx + ex * 0.8;
    var ny = hy + 0.1 * s + ey * 0.8;
    ctx.fillStyle = '#E8A0B2';
    ctx.beginPath();
    ctx.moveTo(nx - 0.04 * s, ny - 0.02 * s);
    ctx.quadraticCurveTo(nx, ny - 0.035 * s, nx + 0.04 * s, ny - 0.02 * s);
    ctx.quadraticCurveTo(nx + 0.02 * s, ny + 0.03 * s, nx, ny + 0.035 * s);
    ctx.quadraticCurveTo(nx - 0.02 * s, ny + 0.03 * s, nx - 0.04 * s, ny - 0.02 * s);
    ctx.fill();
    ctx.strokeStyle = 'rgba(90,98,110,0.75)';
    ctx.lineWidth = Math.max(1, s * 0.015);
    ctx.beginPath();
    ctx.moveTo(nx, ny + 0.035 * s);
    ctx.lineTo(nx, ny + 0.06 * s);
    ctx.moveTo(nx, ny + 0.06 * s);
    ctx.quadraticCurveTo(nx - 0.03 * s, ny + 0.09 * s, nx - 0.065 * s, ny + 0.065 * s);
    ctx.moveTo(nx, ny + 0.06 * s);
    ctx.quadraticCurveTo(nx + 0.03 * s, ny + 0.09 * s, nx + 0.065 * s, ny + 0.065 * s);
    ctx.stroke();

    // 腮紅
    ctx.fillStyle = 'rgba(240,160,180,0.35)';
    ellipse(ctx, hx - 0.28 * s + ex * 0.6, hy + 0.1 * s, 0.05 * s, 0.032 * s);
    ctx.fill();
    ellipse(ctx, hx + 0.28 * s + ex * 0.6, hy + 0.1 * s, 0.05 * s, 0.032 * s);
    ctx.fill();

    // 鬍鬚
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = Math.max(1, s * 0.013);
    for (var w = -1; w <= 1; w += 2) {
      for (var n = 0; n < 2; n++) {
        ctx.beginPath();
        ctx.moveTo(hx + w * 0.26 * s, hy + (0.1 + n * 0.035) * s);
        ctx.lineTo(hx + w * 0.47 * s, hy + (0.07 + n * 0.08) * s);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // ---------- 肉墊腳印 ----------
  function drawPaw(ctx, cx, cy, size, alpha, rotation) {
    var s = size;
    ctx.save();
    ctx.globalAlpha = alpha == null ? 1 : Math.max(0, Math.min(1, alpha));
    ctx.translate(cx, cy);
    ctx.rotate(rotation || 0);
    var g = ctx.createLinearGradient(0, -0.3 * s, 0, 0.3 * s);
    g.addColorStop(0, C.padPink);
    g.addColorStop(1, C.padPinkDeep);
    ctx.fillStyle = g;
    // 大墊（圓潤倒三角感）
    ctx.beginPath();
    ctx.moveTo(0, 0.04 * s);
    ctx.bezierCurveTo(0.2 * s, 0.02 * s, 0.3 * s, 0.2 * s, 0.17 * s, 0.31 * s);
    ctx.bezierCurveTo(0.09 * s, 0.37 * s, 0.04 * s, 0.31 * s, 0, 0.31 * s);
    ctx.bezierCurveTo(-0.04 * s, 0.31 * s, -0.09 * s, 0.37 * s, -0.17 * s, 0.31 * s);
    ctx.bezierCurveTo(-0.3 * s, 0.2 * s, -0.2 * s, 0.02 * s, 0, 0.04 * s);
    ctx.fill();
    // 4 個小墊
    var toes = [
      [-0.3, -0.03, 0.085, 0.105, -0.35],
      [-0.1, -0.2, 0.085, 0.11, -0.1],
      [0.1, -0.2, 0.085, 0.11, 0.1],
      [0.3, -0.03, 0.085, 0.105, 0.35]
    ];
    for (var i = 0; i < toes.length; i++) {
      var t = toes[i];
      ellipse(ctx, t[0] * s, t[1] * s, t[2] * s, t[3] * s, t[4]);
      ctx.fill();
    }
    ctx.restore();
  }

  // ---------- 小花 ----------
  var FLOWERS = [
    { petal: '#F4B8C8', petalEdge: '#E39AB0', heart: '#F6DFA3' }, // 粉
    { petal: '#CFC3E6', petalEdge: '#B3A3D4', heart: '#F6E3A8' }, // 薰衣草
    { petal: '#F6E0A0', petalEdge: '#E4C676', heart: '#EBA9B9' }, // 奶油黃
    { petal: '#BBD6EA', petalEdge: '#9BBFD8', heart: '#F6E3A8' }  // 霧藍
  ];

  function drawFlower(ctx, cx, cy, size, variant) {
    var s = size;
    var f = FLOWERS[((variant | 0) % 4 + 4) % 4];
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(((variant | 0) * 0.35) % TAU);
    for (var i = 0; i < 5; i++) {
      var a = (i / 5) * TAU - Math.PI / 2;
      var px = Math.cos(a) * 0.2 * s;
      var py = Math.sin(a) * 0.2 * s;
      var g = ctx.createRadialGradient(px, py, 0.01 * s, px, py, 0.17 * s);
      g.addColorStop(0, f.petal);
      g.addColorStop(1, f.petalEdge);
      ctx.fillStyle = g;
      ellipse(ctx, px, py, 0.16 * s, 0.19 * s, a + Math.PI / 2);
      ctx.fill();
    }
    ctx.fillStyle = f.heart;
    ellipse(ctx, 0, 0, 0.12 * s, 0.12 * s);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ellipse(ctx, -0.035 * s, -0.04 * s, 0.035 * s, 0.03 * s);
    ctx.fill();
    ctx.restore();
  }

  // ---------- 毛線球寶箱 ----------
  function drawChest(ctx, cx, cy, size, t) {
    var s = size;
    var time = t || 0;
    var wobble = Math.sin(time / 260) * 0.09;
    var pulse = 1 + Math.sin(time / 420) * 0.035;
    var r = 0.36 * s;

    ctx.save();
    // 外圍微光
    var glow = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, s * 0.55);
    glow.addColorStop(0, 'rgba(230,211,182,0.55)');
    glow.addColorStop(1, 'rgba(230,211,182,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(cx - s * 0.6, cy - s * 0.6, s * 1.2, s * 1.2);

    // 垂下的線尾
    ctx.strokeStyle = '#E58FA8';
    ctx.lineWidth = Math.max(1.5, s * 0.05);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx + 0.2 * s, cy + 0.3 * s);
    ctx.bezierCurveTo(
      cx + 0.4 * s, cy + 0.42 * s,
      cx + 0.2 * s + Math.sin(time / 300) * 0.04 * s, cy + 0.5 * s,
      cx + 0.34 * s, cy + 0.47 * s
    );
    ctx.stroke();

    ctx.translate(cx, cy + 0.02 * s);
    ctx.rotate(wobble);
    ctx.scale(pulse, pulse);

    // 球體
    var g = ctx.createRadialGradient(-0.12 * s, -0.14 * s, 0.03 * s, 0, 0, r * 1.1);
    g.addColorStop(0, '#FBD3DF');
    g.addColorStop(0.6, '#F2A9BE');
    g.addColorStop(1, '#D9829B');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();

    // 纏繞的毛線紋（限制在球內）
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.clip();
    ctx.strokeStyle = 'rgba(190,95,125,0.55)';
    ctx.lineWidth = Math.max(1, s * 0.022);
    for (var i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.ellipse(i * 0.07 * s, 0, 0.3 * s, r * 1.05, 0.6, 0, TAU);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,240,245,0.5)';
    for (var k = -2; k <= 2; k++) {
      ctx.beginPath();
      ctx.ellipse(k * 0.08 * s, 0.02 * s, 0.34 * s, r * 0.95, -0.7, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();

    // 金色蝴蝶結（寶箱標記）
    ctx.fillStyle = C.gold;
    ctx.strokeStyle = C.goldDeep;
    ctx.lineWidth = Math.max(1, s * 0.015);
    for (var b = -1; b <= 1; b += 2) {
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.92);
      ctx.quadraticCurveTo(b * 0.2 * s, -r * 1.35, b * 0.2 * s, -r * 0.82);
      ctx.quadraticCurveTo(b * 0.1 * s, -r * 0.7, 0, -r * 0.92);
      ctx.fill();
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, -r * 0.9, 0.04 * s, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // 高光
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ellipse(ctx, -0.14 * s, -0.12 * s, 0.07 * s, 0.045 * s, -0.7);
    ctx.fill();
    ctx.restore();

    // 閃爍星光
    var tw = (Math.sin(time / 220) + 1) / 2;
    sparkle(ctx, cx + 0.38 * s, cy - 0.3 * s, (0.06 + tw * 0.05) * s, 'rgba(255,248,225,0.95)');
    sparkle(ctx, cx - 0.4 * s, cy - 0.12 * s, (0.04 + (1 - tw) * 0.05) * s, 'rgba(255,248,225,0.9)');
  }

  // ---------- 終點大門 ----------
  function archPath(ctx, x, y, w, h) {
    var r = w / 2;
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.arc(x + r, y + r, r, Math.PI, 0, false);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
  }

  function drawGate(ctx, cx, cy, size, open) {
    var s = size;
    var w = 0.74 * s;
    var h = 0.84 * s;
    var x = cx - w / 2;
    var y = cy - h / 2 + 0.06 * s;

    ctx.save();

    // 貓耳裝飾（拱門頂左右）
    for (var k = -1; k <= 1; k += 2) {
      var ex = cx + k * 0.25 * s;
      var ey = y + 0.12 * s;
      ctx.fillStyle = C.goldDeep;
      earPath(ctx, ex - 0.12 * s, ey, ex + 0.12 * s, ey, ex + k * 0.04 * s, y - 0.12 * s);
      ctx.fill();
      ctx.fillStyle = '#F2C4D0';
      earPath(ctx, ex - 0.065 * s, ey - 0.005 * s, ex + 0.065 * s, ey - 0.005 * s, ex + k * 0.03 * s, y - 0.05 * s);
      ctx.fill();
    }

    // 拱框
    var frame = ctx.createLinearGradient(x, y, x + w, y + h);
    frame.addColorStop(0, '#F0E2C8');
    frame.addColorStop(1, C.goldDeep);
    ctx.fillStyle = frame;
    archPath(ctx, x, y, w, h);
    ctx.fill();
    ctx.lineWidth = Math.max(1, s * 0.02);
    ctx.strokeStyle = '#B79A6E';
    ctx.stroke();

    // 門洞
    var ix = x + 0.09 * s;
    var iw = w - 0.18 * s;
    var iy = y + 0.09 * s;
    var ih = h - 0.09 * s;
    if (open) {
      var glow = ctx.createRadialGradient(cx, iy + ih * 0.55, 0.02 * s, cx, iy + ih * 0.55, iw * 0.8);
      glow.addColorStop(0, '#FFFBEA');
      glow.addColorStop(0.5, '#F6E3B8');
      glow.addColorStop(1, '#D6E4EB');
      ctx.fillStyle = glow;
      archPath(ctx, ix, iy, iw, ih);
      ctx.fill();
      // 兩扇向外開的門板
      ctx.fillStyle = '#9DB6C6';
      for (var d = -1; d <= 1; d += 2) {
        ctx.beginPath();
        ctx.moveTo(cx + d * iw / 2, iy + ih);
        ctx.lineTo(cx + d * iw / 2, iy + iw / 2);
        ctx.lineTo(cx + d * iw * 0.27, iy + iw * 0.62);
        ctx.lineTo(cx + d * iw * 0.27, iy + ih);
        ctx.closePath();
        ctx.fill();
      }
      sparkle(ctx, cx - 0.06 * s, cy + 0.02 * s, 0.07 * s, 'rgba(255,255,255,0.95)');
      sparkle(ctx, cx + 0.1 * s, cy + 0.17 * s, 0.045 * s, 'rgba(255,255,255,0.9)');
    } else {
      var door = ctx.createLinearGradient(ix, iy, ix + iw, iy + ih);
      door.addColorStop(0, '#8FAAB9');
      door.addColorStop(1, '#6F8E9F');
      ctx.fillStyle = door;
      archPath(ctx, ix, iy, iw, ih);
      ctx.fill();
      // 門板縫與橫條
      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.lineWidth = Math.max(1, s * 0.015);
      ctx.beginPath();
      ctx.moveTo(cx, iy);
      ctx.lineTo(cx, iy + ih);
      ctx.stroke();
      // 肉墊門把
      ctx.fillStyle = C.gold;
      ellipse(ctx, cx - 0.07 * s, cy + 0.16 * s, 0.035 * s, 0.035 * s);
      ctx.fill();
      ellipse(ctx, cx + 0.07 * s, cy + 0.16 * s, 0.035 * s, 0.035 * s);
      ctx.fill();
    }
    // 拱頂小肉墊徽記
    drawPaw(ctx, cx, y + 0.17 * s, 0.17 * s, 0.95, 0);

    ctx.restore();
  }

  // ---------- 障礙：糾纏毛線團 + 荊棘 ----------
  function drawObstacle(ctx, cx, cy, size) {
    var s = size;
    var r = 0.33 * s;
    ctx.save();
    ctx.translate(cx, cy);

    // 荊棘刺
    ctx.fillStyle = '#6F7F70';
    var spikes = 11;
    for (var i = 0; i < spikes; i++) {
      var a = (i / spikes) * TAU + 0.2;
      var l = i % 2 ? 0.14 : 0.2;
      var bx = Math.cos(a) * r * 0.85;
      var by = Math.sin(a) * r * 0.85;
      ctx.beginPath();
      ctx.moveTo(bx + Math.cos(a + Math.PI / 2) * 0.04 * s, by + Math.sin(a + Math.PI / 2) * 0.04 * s);
      ctx.lineTo(Math.cos(a) * (r + l * s), Math.sin(a) * (r + l * s));
      ctx.lineTo(bx - Math.cos(a + Math.PI / 2) * 0.04 * s, by - Math.sin(a + Math.PI / 2) * 0.04 * s);
      ctx.closePath();
      ctx.fill();
    }

    // 灰紫毛線團
    var g = ctx.createRadialGradient(-0.1 * s, -0.1 * s, 0.02 * s, 0, 0, r);
    g.addColorStop(0, '#A59BAA');
    g.addColorStop(1, '#6E6577');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();

    // 打結的線（固定軌跡，避免每幀閃動）
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.clip();
    ctx.lineCap = 'round';
    var strands = [
      ['#4F4757', -0.3, -0.1, 0.1, -0.35, 0.3, 0.1, 0.05, 0.3],
      ['#8A7F91', -0.3, 0.2, -0.1, -0.3, 0.2, 0.3, 0.3, -0.2],
      ['#C2B8C6', -0.2, -0.3, 0.3, -0.15, -0.3, 0.1, 0.2, 0.3],
      ['#4F4757', 0.3, 0.3, -0.2, 0.2, 0.2, -0.3, -0.3, -0.2]
    ];
    ctx.lineWidth = Math.max(1, s * 0.03);
    for (var j = 0; j < strands.length; j++) {
      var p = strands[j];
      ctx.strokeStyle = p[0];
      ctx.beginPath();
      ctx.moveTo(p[1] * s, p[2] * s);
      ctx.bezierCurveTo(p[3] * s, p[4] * s, p[5] * s, p[6] * s, p[7] * s, p[8] * s);
      ctx.stroke();
    }
    ctx.restore();

    // 暗色輪廓
    ctx.strokeStyle = 'rgba(60,52,68,0.6)';
    ctx.lineWidth = Math.max(1, s * 0.02);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  window.CatArt = {
    drawCat: drawCat,
    drawPaw: drawPaw,
    drawFlower: drawFlower,
    drawChest: drawChest,
    drawGate: drawGate,
    drawObstacle: drawObstacle
  };
})();
