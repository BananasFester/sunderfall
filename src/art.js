/* ============================================================
   SUNDERFALL - woodcut card art, rendered on canvas at runtime.
   Every card is a two-ink print: soot-black ink carved into bone
   paper, with a second banner ink overprinted slightly off register.
   No image assets ship with the game.
   ============================================================ */

var ICONS = {
  sword: ['M44 4 L56 4 L58 62 L42 62 Z M48.5 10 L51.5 10 L52 56 L48 56 Z M26 60 L74 60 L71 68 L29 68 Z M45 68 L55 68 L55 86 L45 86 Z M42 89 A8 8 0 1 0 58 89 A8 8 0 1 0 42 89 Z'],
  shield: ['M50 8 L84 19 C84 52 73 76 50 92 C27 76 16 52 16 19 Z M50 20 L72 27 C72 50 64 67 50 79 C36 67 28 50 28 27 Z', 'M44 32 L56 32 L56 44 L66 44 L66 54 L56 54 L56 70 L44 70 L44 54 L34 54 L34 44 L44 44 Z'],
  bow: ['M30 8 C76 26 76 74 30 92 L35 86 C66 70 66 30 35 14 Z M31 11 L33 11 L33 89 L31 89 Z', 'M22 48 L80 48 L80 52 L22 52 Z M78 42 L92 50 L78 58 Z M22 44 L30 50 L22 56 L16 56 L22 50 L16 44 Z'],
  skull: ['M50 10 C27 10 16 27 16 46 C16 58 22 65 30 68 L30 82 L70 82 L70 68 C78 65 84 58 84 46 C84 27 73 10 50 10 Z M31 44 A9 9 0 1 0 49 44 A9 9 0 1 0 31 44 Z M51 44 A9 9 0 1 0 69 44 A9 9 0 1 0 51 44 Z M46 56 L50 64 L54 56 Z M40 72 L43 72 L43 82 L40 82 Z M48.5 72 L51.5 72 L51.5 82 L48.5 82 Z M57 72 L60 72 L60 82 L57 82 Z'],
  hammer: ['M20 12 L80 12 L80 38 L20 38 Z M45 38 L55 38 L55 90 L45 90 Z M28 19 L72 19 L72 31 L28 31 Z', 'M42 86 L58 86 L58 94 L42 94 Z'],
  axe: ['M45 8 L54 8 L54 94 L45 94 Z', 'M54 16 C80 12 92 30 90 54 C80 46 66 46 54 52 Z M45 24 L26 32 L45 42 Z'],
  wing: ['M10 74 C26 30 58 12 92 10 C82 21 78 28 75 35 C84 33 89 35 91 38 C80 44 74 49 70 55 C77 55 81 57 83 60 C66 69 44 74 10 74 Z'],
  tree: ['M50 6 L76 38 L63 38 L82 63 L18 63 L37 38 L24 38 Z M45 63 L55 63 L55 92 L45 92 Z'],
  flame: ['M50 6 C57 25 76 34 76 59 C76 78 63 92 50 92 C37 92 24 78 24 59 C24 44 35 37 37 24 C43 34 46 41 48 48 C53 35 53 21 50 6 Z M50 54 C57 62 61 68 61 75 C61 83 56 87 50 87 C44 87 39 83 39 75 C39 68 44 62 50 54 Z'],
  crown: ['M12 70 L18 26 L35 48 L50 16 L65 48 L82 26 L88 70 Z M12 75 L88 75 L88 87 L12 87 Z', 'M46 52 A4 4 0 1 0 54 52 A4 4 0 1 0 46 52 Z'],
  eye: ['M6 50 C24 24 76 24 94 50 C76 76 24 76 6 50 Z M32 50 A18 18 0 1 0 68 50 A18 18 0 1 0 32 50 Z M43 50 A7 7 0 1 0 57 50 A7 7 0 1 0 43 50 Z'],
  star: ['M50 4 L57 38 L90 26 L64 50 L90 74 L57 62 L50 96 L43 62 L10 74 L36 50 L10 26 L43 38 Z'],
  tower: ['M28 92 L33 34 L26 34 L26 18 L35 18 L35 25 L44 25 L44 18 L56 18 L56 25 L65 25 L65 18 L74 18 L74 34 L67 34 L72 92 Z M45 44 L55 44 L55 60 L45 60 Z M43 92 L43 76 C43 70 57 70 57 76 L57 92 Z'],
  claw: ['M18 16 C40 38 47 60 44 90 L37 90 C38 63 32 44 18 16 Z M40 8 C62 32 67 58 62 90 L55 90 C58 60 54 37 40 8 Z M63 12 C83 36 87 60 81 90 L74 90 C79 62 75 40 63 12 Z'],
  fang: ['M30 88 C10 88 10 64 30 64 L64 64 C78 64 78 50 64 50 L40 50 C22 50 22 26 40 26 L58 26 C62 18 70 12 80 14 C88 16 90 24 84 30 C80 34 72 34 68 32 L40 32 C30 32 30 44 40 44 L64 44 C86 44 86 70 64 70 L30 70 C20 70 20 82 30 82 L74 82 L74 88 Z M76 20 A2.5 2.5 0 1 0 76.01 20 Z', 'M83 29 L86 38 L80 31 Z'],
  rune: ['M50 8 A42 42 0 1 0 50.01 8 Z M50 16 A34 34 0 1 1 49.99 16 Z', 'M46 24 L54 24 L54 76 L46 76 Z M54 28 L72 40 L68 46 L54 37 Z M46 52 L28 64 L32 70 L46 61 Z'],
  beast: ['M50 88 L35 66 L26 40 L20 10 L38 30 L50 26 L62 30 L80 10 L74 40 L65 66 Z M36 44 L46 49 L39 52 Z M64 44 L54 49 L61 52 Z M46 70 L54 70 L50 76 Z'],
  helm: ['M22 88 L22 46 C22 22 35 10 50 10 C65 10 78 22 78 46 L78 88 L61 88 L61 62 L39 62 L39 88 Z M30 42 L70 42 L70 49 L30 49 Z M46 49 L54 49 L54 62 L46 62 Z'],
  spear: ['M47 34 L53 34 L53 94 L47 94 Z M50 4 L62 30 L50 40 L38 30 Z M53 44 L76 50 L53 58 Z'],
  ghost: ['M50 6 C66 6 76 20 76 38 L80 58 L88 92 L74 84 L66 94 L58 84 L50 94 L42 84 L34 94 L26 84 L12 92 L20 58 L24 38 C24 20 34 6 50 6 Z M37 33 L47 38 L38 42 Z M63 33 L53 38 L62 42 Z'],
  golem: ['M38 6 L62 6 L66 26 L34 26 Z M42 14 L47 14 L46 19 L42 19 Z M53 14 L58 14 L58 19 L54 19 Z', 'M22 28 L78 28 L84 46 L76 64 L24 64 L16 46 Z M48 33 L52 33 L50 47 L55 57 L50 57 L47 47 Z M10 32 L20 30 L18 70 L6 72 Z M80 30 L90 32 L94 72 L82 70 Z M26 66 L46 66 L44 94 L24 94 Z M54 66 L74 66 L76 94 L56 94 Z'],
  drake: ['M4 60 L20 48 L30 30 L34 12 L44 28 L58 24 L78 30 L96 44 L84 50 L94 58 L72 62 L56 74 L44 90 L42 70 L28 70 Z M60 36 L70 36 L64 42 Z', 'M34 12 L26 2 L30 20 Z M44 28 L52 8 L56 26 Z'],
  orb: ['M44 7 A6 6 0 1 1 56 7 L54 11 L46 11 Z M32 14 L68 14 L61 23 L39 23 Z M37 23 L63 23 L67 74 L33 74 Z M42 31 L58 31 L60 66 L40 66 Z M28 74 L72 74 L72 82 L28 82 Z M35 82 L65 82 L60 91 L40 91 Z', 'M47 40 L53 40 L55 58 L50 63 L45 58 Z'],
  book: ['M16 22 C30 16 43 18 50 25 C57 18 70 16 84 22 L84 82 C70 76 57 78 50 85 C43 78 30 76 16 82 Z M48 28 L52 28 L52 80 L48 80 Z'],
  scroll: ['M24 14 L76 14 C82 14 84 20 84 24 L72 24 L72 80 C72 86 68 90 62 90 L20 90 C14 90 12 84 12 80 L28 80 L28 24 C28 18 26 14 24 14 Z M36 34 L64 34 L64 39 L36 39 Z M36 46 L64 46 L64 51 L36 51 Z M36 58 L58 58 L58 63 L36 63 Z']
};

var INK = '#16120e', PAPER = '#d3c5a5';
var BANNER_INK = { auric: '#b08a3e', eld: '#4f7f69', hollow: '#6e5687', forge: '#a6461c', unbound: '#6f6c64' };

var Art = (function () {
  var cache = {}, ok = null, paths = {};

  function canvasOK() {
    if (ok !== null) return ok;
    try {
      var c = document.createElement('canvas');
      ok = !!(c.getContext && c.getContext('2d')) && typeof Path2D !== 'undefined';
    } catch (e) { ok = false; }
    return ok;
  }
  function mk(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function toURL(c, type, q) {
    var d = c.toDataURL(type || 'image/jpeg', q || 0.86);
    try {
      var bin = atob(d.split(',')[1]), arr = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      return URL.createObjectURL(new Blob([arr], { type: type || 'image/jpeg' }));
    } catch (e) { return d; }
  }
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) { var st = { seed: seed }; return function () { return rngNext(st); }; }
  function iconPath(name) {
    if (!paths[name]) {
      var list = ICONS[name] || ICONS.star;
      paths[name] = list.map(function (d) { return new Path2D(d); });
    }
    return paths[name];
  }

  /* ---- print primitives ---- */
  function wash(ctx, W, H, R, col, alpha, y0, y1) {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = col;
    for (var i = 0; i < 26; i++) {
      ctx.globalAlpha = alpha * (0.5 + R() * 0.6);
      var x = R() * W, y = y0 + R() * (y1 - y0), r = W * (0.12 + R() * 0.25);
      ctx.beginPath(); ctx.ellipse(x + 2, y + 1.5, r, r * 0.6, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function hatch(ctx, W, y0, y1, R, step, densityAt, skip) {
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineCap = 'round';
    for (var y = y0; y < y1; y += step * (0.85 + R() * 0.3)) {
      var dens = densityAt(y);
      var x = -4;
      while (x < W + 4) {
        var len = 6 + R() * 26;
        if (R() < dens) {
          ctx.lineWidth = 0.7 + R() * 1.5 * dens;
          ctx.beginPath();
          var yy = y + (R() - 0.5) * 1.2;
          ctx.moveTo(x, yy);
          var segs = 3, ok2 = true;
          for (var k = 1; k <= segs; k++) {
            var xx = x + (len * k) / segs, y2 = yy + (R() - 0.5) * 1.1;
            if (skip && skip(xx, y2)) { ok2 = false; break; }
            ctx.lineTo(xx, y2);
          }
          if (ok2) ctx.stroke();
        }
        x += len + 1 + R() * 4 * (1.2 - dens);
      }
    }
    ctx.restore();
  }

  function rough(ctx, pts, R, j, close) {
    ctx.beginPath();
    for (var i = 0; i < pts.length; i++) {
      var a = pts[i], b = pts[(i + 1) % pts.length];
      if (i === 0) ctx.moveTo(a[0], a[1]);
      if (!close && i === pts.length - 1) break;
      var dx = b[0] - a[0], dy = b[1] - a[1], d = Math.sqrt(dx * dx + dy * dy), n = Math.max(1, Math.floor(d / 5));
      for (var k = 1; k <= n; k++) {
        var t = k / n;
        ctx.lineTo(a[0] + dx * t + (R() - 0.5) * j, a[1] + dy * t + (R() - 0.5) * j);
      }
    }
    ctx.closePath();
  }

  function gouges(ctx, x0, y0, x1, y1, R, n, col) {
    ctx.save();
    ctx.strokeStyle = col || PAPER;
    ctx.lineCap = 'round';
    for (var i = 0; i < n; i++) {
      var x = x0 + R() * (x1 - x0), y = y0 + R() * (y1 - y0), l = 4 + R() * 12, a = -0.3 + R() * 0.6;
      ctx.lineWidth = 0.6 + R() * 1.4;
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + Math.cos(a) * l * 0.5, y + Math.sin(a) * l * 0.5 - 1.5, x + Math.cos(a) * l, y + Math.sin(a) * l);
      ctx.stroke();
    }
    ctx.restore();
  }

  function wear(ctx, W, H, R, amt) {
    var i;
    ctx.save();
    for (i = 0; i < 260 * amt; i++) {
      ctx.fillStyle = R() < 0.6 ? PAPER : INK;
      ctx.globalAlpha = 0.25 + R() * 0.55;
      var s = R() < 0.92 ? 0.6 + R() * 1.2 : 1.5 + R() * 2.5;
      ctx.fillRect(R() * W, R() * H, s, s * (0.5 + R()));
    }
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = PAPER;
    for (i = 0; i < 3 * amt; i++) {
      ctx.lineWidth = 0.5 + R();
      var x = R() * W, y = R() * H;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (R() - 0.5) * W * 0.5, y + (R() - 0.5) * H * 0.3); ctx.stroke();
    }
    ctx.restore();
  }

  function vignette(ctx, W, H, strength) {
    var g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
    g.addColorStop(0, 'rgba(23,19,15,0)');
    g.addColorStop(1, 'rgba(23,19,15,' + strength + ')');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function star(ctx, x, y, r, R, banner, big) {
    var i;
    ctx.save();
    ctx.strokeStyle = INK;
    for (i = 0; i < (big ? 48 : 22); i++) {
      var a = (i / (big ? 48 : 22)) * Math.PI * 2 + R() * 0.05;
      var r0 = r * 1.5, r1 = r * (i % 2 ? 2.4 : 3.4) * (0.8 + R() * 0.4);
      ctx.lineWidth = i % 2 ? 0.8 : 1.6;
      ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); ctx.stroke();
    }
    ctx.fillStyle = PAPER;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = big ? 3 : 2;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = BANNER_INK[banner] || INK;
    ctx.globalAlpha = 0.35;
    ctx.beginPath(); ctx.arc(x + 1.5, y + 1, r * 0.82, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.lineWidth = big ? 4 : 2.4;
    ctx.lineJoin = 'bevel';
    ctx.beginPath();
    ctx.moveTo(x - r * 0.95, y - r * 0.3);
    ctx.lineTo(x - r * 0.25, y - r * 0.05);
    ctx.lineTo(x - r * 0.05, y + r * 0.45);
    ctx.lineTo(x + r * 0.5, y + r * 0.25);
    ctx.lineTo(x + r * 0.9, y + r * 0.55);
    ctx.stroke();
    ctx.fillStyle = INK;
    for (i = 0; i < (big ? 7 : 3); i++) {
      var fx = x + (R() - 0.3) * r * 5, fy = y + r * (1.4 + R() * 2.5), fs = r * (0.15 + R() * 0.2);
      ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx + fs, fy + fs * 1.6); ctx.lineTo(fx - fs * 0.8, fy + fs * 0.6); ctx.closePath(); ctx.fill();
      ctx.lineWidth = 0.8;
      for (var t = 1; t < 4; t++) { ctx.beginPath(); ctx.moveTo(fx - t * fs * 0.9, fy - t * fs * 1.5); ctx.lineTo(fx - t * fs * 0.9 - fs * 0.6, fy - t * fs * 1.5 - fs); ctx.stroke(); }
    }
    ctx.restore();
  }

  function land(ctx, W, H, base, banner, R, layer) {
    var pts = [], x, h, w, i, k;
    var far = layer === 0, col = far ? (BANNER_INK[banner] || INK) : INK;
    var b0 = base;
    ctx.save();
    ctx.fillStyle = col;
    if (far) ctx.globalAlpha = 0.85;
    if (banner === 'auric') {
      pts.push([-5, H + 2]);
      x = -5;
      while (x < W + 5) {
        w = W * (0.03 + R() * 0.05); h = H * (far ? 0.10 : 0.06) + R() * H * (far ? 0.18 : 0.14);
        pts.push([x, b0]); pts.push([x, b0 - h]); pts.push([x + w / 2, b0 - h - w * 2.2]); pts.push([x + w, b0 - h]); pts.push([x + w, b0]);
        x += w + R() * W * 0.05;
      }
      pts.push([W + 5, H + 2]);
    } else if (banner === 'eld') {
      pts.push([-5, H + 2]);
      x = -8;
      while (x < W + 8) {
        w = W * (0.06 + R() * 0.07); h = H * (far ? 0.18 : 0.12) + R() * H * (far ? 0.2 : 0.2);
        pts.push([x, b0]);
        for (k = 0; k < 4; k++) { pts.push([x + w * (0.5 - (4 - k) * 0.09), b0 - h * (k + 1) / 4.3]); pts.push([x + w * (0.5 - (4 - k) * 0.03), b0 - h * (k + 1) / 4.6]); }
        pts.push([x + w / 2, b0 - h]);
        for (k = 3; k >= 0; k--) { pts.push([x + w * (0.5 + (4 - k) * 0.03), b0 - h * (k + 1) / 4.6]); pts.push([x + w * (0.5 + (4 - k) * 0.09), b0 - h * (k + 1) / 4.3]); }
        pts.push([x + w, b0]);
        x += w * (0.55 + R() * 0.35);
      }
      pts.push([W + 5, H + 2]);
    } else if (banner === 'hollow') {
      pts.push([-5, H + 2]); pts.push([-5, b0 - 4]);
      x = -2;
      while (x < W + 5) {
        if (R() < 0.45) {
          w = W * (0.025 + R() * 0.025); h = H * (0.05 + R() * 0.07);
          pts.push([x, b0 - 3]); pts.push([x, b0 - h]); pts.push([x + w * 0.2, b0 - h - w * 0.4]); pts.push([x + w * 0.5, b0 - h - w * 0.55]);
          pts.push([x + w * 0.8, b0 - h - w * 0.4]); pts.push([x + w, b0 - h]); pts.push([x + w, b0 - 3]);
          x += w;
        } else if (R() < 0.12 && !far) {
          pts.push([x, b0 - 3]); pts.push([x + 2, b0 - H * 0.3]); pts.push([x - W * 0.05, b0 - H * 0.4]); pts.push([x + 2.5, b0 - H * 0.34]);
          pts.push([x + 3, b0 - H * 0.46]); pts.push([x + 4, b0 - H * 0.33]); pts.push([x + W * 0.06, b0 - H * 0.42]); pts.push([x + 5, b0 - H * 0.27]); pts.push([x + 6, b0 - 3]);
          x += 6;
        }
        pts.push([x + W * 0.03, b0 - 2 - R() * 4]);
        x += W * (0.03 + R() * 0.06);
      }
      pts.push([W + 5, b0 - 4]); pts.push([W + 5, H + 2]);
    } else if (banner === 'forge') {
      pts.push([-5, H + 2]);
      x = -5;
      while (x < W + 5) {
        h = H * (far ? 0.2 : 0.1) + R() * H * (far ? 0.25 : 0.18);
        pts.push([x, b0 - h]);
        x += W * (0.04 + R() * 0.07);
        pts.push([x, b0 - h * (0.25 + R() * 0.4)]);
        x += W * (0.02 + R() * 0.05);
        if (!far && R() < 0.2) { pts.push([x, b0 - h * 0.3]); pts.push([x, b0 - H * 0.42]); pts.push([x + W * 0.03, b0 - H * 0.42]); pts.push([x + W * 0.03, b0 - h * 0.3]); x += W * 0.03; }
      }
      pts.push([W + 5, H + 2]);
    } else {
      pts.push([-5, H + 2]); pts.push([-5, b0 - 6]);
      x = 0;
      for (i = 0; i < 4; i++) {
        x += W * (0.08 + R() * 0.2);
        h = H * (far ? 0.18 : 0.12) + R() * H * 0.16; w = W * (0.03 + R() * 0.03);
        pts.push([x, b0 - 6]); pts.push([x + w * 0.2, b0 - h]); pts.push([x + w, b0 - h + 4]); pts.push([x + w * 1.1, b0 - 6]);
      }
      pts.push([W + 5, b0 - 8]); pts.push([W + 5, H + 2]);
    }
    if (far) {
      ctx.globalAlpha = 1;
      rough(ctx, pts, R, 2.2, true);
      ctx.clip();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.1;
      for (var hx = -H; hx < W; hx += 3.2) { ctx.beginPath(); ctx.moveTo(hx, H); ctx.lineTo(hx + H * 0.8, 0); ctx.stroke(); }
      ctx.restore();
    } else {
      rough(ctx, pts, R, 2.2, true);
      ctx.fill();
      ctx.restore();
    }
    if (!far) {
      ctx.save();
      rough(ctx, pts, R, 2.2, true);
      ctx.clip();
      gouges(ctx, 0, base - H * 0.05, W, H, R, 26, PAPER);
      if (banner === 'forge') {
        ctx.strokeStyle = BANNER_INK.forge; ctx.lineWidth = 3; ctx.globalAlpha = 0.9;
        ctx.beginPath(); ctx.moveTo(0, H - 8);
        for (x = 0; x <= W; x += 12) ctx.lineTo(x, H - 8 - R() * 6);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function subject(ctx, c, W, H, R) {
    var ps = iconPath(c.icon);
    var spell = c.type === 'spell';
    var k = W / 420;
    var size = H * (spell ? 0.56 : 0.74), sc = size / 100;
    var cx = W / 2, cy = spell ? H * 0.46 : H * 0.47;
    var rot = (R() - 0.5) * 0.12, i;
    function place() { ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc); ctx.translate(-50, -50); }
    var all = new Path2D();
    for (i = 0; i < ps.length; i++) all.addPath(ps[i]);
    // paper halo so the figure reads against dark ground
    ctx.save(); place();
    ctx.lineJoin = 'round'; ctx.strokeStyle = PAPER; ctx.lineWidth = 3.4 * k / sc;
    for (i = 0; i < ps.length; i++) ctx.stroke(ps[i]);
    ctx.fillStyle = INK;
    for (i = 0; i < ps.length; i++) ctx.fill(ps[i], 'evenodd');
    ctx.restore();
    // carved bevel on the lit edges + a few gouges
    ctx.save(); place();
    ctx.clip(all, 'evenodd');
    ctx.strokeStyle = PAPER; ctx.lineJoin = 'round';
    ctx.translate(4.2 * k / sc, 4.2 * k / sc);
    ctx.lineWidth = 1.6 * k / sc;
    ctx.setLineDash([14 / sc, 5 / sc, 4 / sc, 8 / sc]);
    for (i = 0; i < ps.length; i++) ctx.stroke(ps[i]);
    ctx.setLineDash([]);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    gouges(ctx, cx - size * 0.45, cy - size * 0.45, cx - size * 0.05, cy + size * 0.1, R, 9, PAPER);
    ctx.restore();
    // nibbled, inky edge
    ctx.save(); place();
    ctx.strokeStyle = PAPER;
    ctx.setLineDash([2 / sc, 6 / sc, 1 / sc, 9 / sc]);
    ctx.lineWidth = 1.7 * k / sc;
    for (i = 0; i < ps.length; i++) ctx.stroke(ps[i]);
    ctx.restore();
  }

  function spellRing(ctx, W, H, R, banner) {
    var cx = W / 2, cy = H * 0.46, r = H * 0.36, i;
    ctx.save();
    ctx.strokeStyle = INK;
    for (i = 0; i < 64; i++) {
      var a = (i / 64) * Math.PI * 2;
      ctx.lineWidth = i % 2 ? 0.8 : 2;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r * 1.05, cy + Math.sin(a) * r * 1.05); ctx.lineTo(cx + Math.cos(a) * W, cy + Math.sin(a) * W); ctx.stroke();
    }
    ctx.fillStyle = PAPER;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = BANNER_INK[banner];
    ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.arc(cx + 3, cy + 2, r * 0.93, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.88, 0, Math.PI * 2); ctx.stroke();
    for (i = 0; i < 24; i++) {
      var b = (i / 24) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(b) * r * 0.88, cy + Math.sin(b) * r * 0.88); ctx.lineTo(cx + Math.cos(b) * r, cy + Math.sin(b) * r); ctx.stroke();
    }
    ctx.restore();
  }

  function blot(ctx, x, y, r, R, col, alpha) {
    var pts = [];
    for (var i = 0; i < 22; i++) { var a = (i / 22) * Math.PI * 2, rr = r * (0.86 + R() * 0.22); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = alpha;
    ctx.fillStyle = col;
    rough(ctx, pts, R, 3, true);
    ctx.fill();
    ctx.restore();
  }

  function scene(c, W, H) {
    var R = rng(hash(c.id + c.name));
    var cv = mk(W, H), ctx = cv.getContext('2d');
    var k = W / 420, accent = BANNER_INK[c.banner] || INK;
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);
    wash(ctx, W, H, R, '#7d6a4c', 0.16, 0, H);
    var horizon = H * (0.64 + R() * 0.06);
    var sx = R() < 0.5 ? W * (0.12 + R() * 0.16) : W * (0.72 + R() * 0.16), sy = H * (0.13 + R() * 0.08), sr = H * (0.055 + R() * 0.02);
    if (c.type === 'spell') {
      hatch(ctx, W, 0, H, R, 3.8 * k, function (y) { return 0.35 + 0.45 * Math.abs(y / H - 0.5); });
      spellRing(ctx, W, H, R, c.banner);
    } else {
      hatch(ctx, W, 0, horizon, R, 4.2 * k, function (y) { return Math.max(0.08, 0.8 - (y / horizon) * 0.9); }, function (x, y) {
        var dx = x - sx, dy = y - sy;
        return dx * dx + dy * dy < (sr * 2.1) * (sr * 2.1);
      });
      blot(ctx, W / 2 + 4 * k, H * 0.46 + 3 * k, H * 0.36, R, accent, 0.82);
      star(ctx, sx, sy, sr, R, c.banner, false);
      land(ctx, W, H, horizon + H * 0.05, c.banner, R, 0);
      land(ctx, W, H, H * 0.985, c.banner, R, 1);
    }
    subject(ctx, c, W, H, R);
    // ink spatter
    ctx.fillStyle = INK;
    for (var i = 0; i < 7; i++) {
      var bx = R() * W, by = R() * H, br = (0.8 + R() * 2.6) * k;
      ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
    }
    wear(ctx, W, H, R, 1.3);
    vignette(ctx, W, H, 0.42);
    ctx.strokeStyle = INK; ctx.lineWidth = 4 * k;
    rough(ctx, [[3, 3], [W - 3, 3], [W - 3, H - 3], [3, H - 3]], R, 2.2 * k, true);
    ctx.stroke();
    return cv;
  }

  function img(url, cls) {
    return '<img class="' + (cls || 'art') + '" src="' + url + '" alt="" draggable="false">';
  }
  function placeholder(b, cls) {
    return '<span class="' + (cls || 'art') + ' ph" style="--bc:' + (BANNER_INK[b] || INK) + '"></span>';
  }

  function card(c) {
    if (!canvasOK()) return placeholder(c.banner);
    if (!cache[c.id]) cache[c.id] = toURL(scene(c, 420, 302));
    return img(cache[c.id]);
  }

  function sigil(b, cls) {
    var key = 'sig_' + b;
    if (!canvasOK()) return placeholder(b, cls || 'sigil');
    if (!cache[key]) {
      var Bn = BANNERS[b] || BANNERS.unbound;
      var cv = scene({ id: key, name: Bn.name, banner: b, type: 'unit', icon: Bn.icon }, 240, 240);
      cache[key] = toURL(cv);
    }
    return img(cache[key], cls || 'sigil');
  }

  function portrait(key, b, icon, cls) {
    var k = 'por_' + key;
    if (!canvasOK()) return placeholder(b, cls || 'sigil');
    if (!cache[k]) cache[k] = toURL(scene({ id: k, name: key, banner: b, type: 'unit', icon: icon }, 240, 240));
    return img(cache[k], cls || 'sigil');
  }

  function hero(cls) {
    if (!canvasOK()) return '';
    if (!cache.hero) {
      var W = 840, H = 420, R = rng(hash('sunderfall-title'));
      var cv = mk(W, H), ctx = cv.getContext('2d');
      ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
      wash(ctx, W, H, R, '#8c7a5c', 0.14, 0, H);
      wash(ctx, W, H, R, BANNER_INK.forge, 0.22, 0, H * 0.7);
      var sx = W * 0.62, sy = H * 0.26, sr = H * 0.1;
      hatch(ctx, W, 0, H * 0.74, R, 4, function (y) { return 0.96 - (y / H) * 0.75; }, function (x, y) {
        var dx = x - sx, dy = y - sy; return dx * dx + dy * dy < (sr * 2.4) * (sr * 2.4);
      });
      // falling shards with long trails
      ctx.save();
      for (var i = 0; i < 5; i++) {
        var fx = W * (0.12 + i * 0.17 + R() * 0.05), fy = H * (0.3 + R() * 0.25), len = H * (0.25 + R() * 0.2);
        ctx.strokeStyle = PAPER; ctx.lineWidth = 7;
        ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx - len * 0.45, fy - len); ctx.stroke();
        ctx.strokeStyle = INK; ctx.lineWidth = 1.2;
        for (var t = 0; t < 4; t++) { ctx.beginPath(); ctx.moveTo(fx - 3 + t * 2, fy); ctx.lineTo(fx - len * 0.45 - 3 + t * 2, fy - len); ctx.stroke(); }
        ctx.fillStyle = INK;
        ctx.beginPath(); ctx.moveTo(fx - 7, fy - 4); ctx.lineTo(fx + 6, fy); ctx.lineTo(fx - 2, fy + 12); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      star(ctx, sx, sy, sr, R, 'forge', true);
      land(ctx, W, H, H * 0.78, 'forge', R, 0);
      // crater rim and two armies of spears
      var rim = [[-5, H + 2], [-5, H * 0.82]];
      for (var x = 0; x <= W; x += 18) rim.push([x, H * 0.84 - Math.sin(x / W * Math.PI) * H * 0.07 + (R() - 0.5) * 6]);
      rim.push([W + 5, H * 0.82]); rim.push([W + 5, H + 2]);
      ctx.fillStyle = INK; rough(ctx, rim, R, 3, true); ctx.fill();
      ctx.save(); rough(ctx, rim, R, 3, true); ctx.clip(); gouges(ctx, 0, H * 0.8, W, H, R, 70, PAPER); ctx.restore();
      ctx.strokeStyle = INK; ctx.fillStyle = INK;
      for (var a = 0; a < 2; a++) {
        for (var k = 0; k < 18; k++) {
          var px = a ? W * 0.6 + k * W * 0.022 : W * 0.04 + k * W * 0.022, base = H * 0.84 - Math.sin(px / W * Math.PI) * H * 0.07;
          var ph = H * (0.12 + R() * 0.05);
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(px, base); ctx.lineTo(px + (a ? -1 : 1) * 4, base - ph); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(px + (a ? -1 : 1) * 4, base - ph - 7); ctx.lineTo(px + (a ? -1 : 1) * 4 + 2.5, base - ph); ctx.lineTo(px + (a ? -1 : 1) * 4 - 2.5, base - ph); ctx.closePath(); ctx.fill();
          if (k % 5 === 2) { ctx.beginPath(); ctx.moveTo(px + (a ? -1 : 1) * 4, base - ph + 2); ctx.lineTo(px + (a ? -1 : 1) * 22, base - ph + 6); ctx.lineTo(px + (a ? -1 : 1) * 4, base - ph + 12); ctx.closePath(); ctx.fill(); }
        }
      }
      wear(ctx, W, H, R, 2.2);
      vignette(ctx, W, H, 0.55);
      cache.hero = toURL(cv);
    }
    return img(cache.hero, cls || 'heroart');
  }

  function back(cls) {
    if (!canvasOK()) return '<span class="' + (cls || 'cardback') + ' ph"></span>';
    if (!cache.back) {
      var W = 210, H = 294, R = rng(77);
      var cv = mk(W, H), ctx = cv.getContext('2d');
      ctx.fillStyle = '#211b15'; ctx.fillRect(0, 0, W, H);
      for (var i = 0; i < 1400; i++) { ctx.fillStyle = R() < 0.5 ? 'rgba(0,0,0,.35)' : 'rgba(217,204,177,.06)'; ctx.fillRect(R() * W, R() * H, 1 + R() * 2, 1 + R() * 2); }
      ctx.strokeStyle = PAPER; ctx.globalAlpha = 0.7; ctx.lineWidth = 2; ctx.strokeRect(10, 10, W - 20, H - 20);
      ctx.lineWidth = 0.8; ctx.strokeRect(15, 15, W - 30, H - 30); ctx.globalAlpha = 1;
      star(ctx, W / 2, H / 2, 26, R, 'unbound', true);
      wear(ctx, W, H, R, 1);
      cache.back = toURL(cv);
    }
    return img(cache.back, cls || 'cardback');
  }

  function pack(p) {
    var key = 'pack_' + p.id, b = p.banner || 'unbound';
    if (!canvasOK()) return placeholder(b, 'packart');
    if (!cache[key]) {
      var W = 150, H = 200, R = rng(hash(key));
      var cv = mk(W, H), ctx = cv.getContext('2d');
      ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
      wash(ctx, W, H, R, '#8c7a5c', 0.2, 0, H);
      hatch(ctx, W, 0, H, R, 3, function () { return 0.35; });
      ctx.fillStyle = BANNER_INK[b]; ctx.globalAlpha = 0.85; ctx.fillRect(0, H * 0.36, W, H * 0.3); ctx.globalAlpha = 1;
      ctx.fillStyle = INK;
      for (var x = 0; x < W; x += 10) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 5, 8); ctx.lineTo(x + 10, 0); ctx.fill(); ctx.beginPath(); ctx.moveTo(x, H); ctx.lineTo(x + 5, H - 8); ctx.lineTo(x + 10, H); ctx.fill(); }
      ctx.fillStyle = '#5e140e';
      ctx.beginPath();
      for (var k = 0; k < 18; k++) { var a = k / 18 * Math.PI * 2, rr = 30 + (k % 2) * 3 + R() * 2; ctx.lineTo(W / 2 + Math.cos(a) * rr, H / 2 + Math.sin(a) * rr); }
      ctx.closePath(); ctx.fill();
      var ps = iconPath(p.banner ? BANNERS[p.banner].icon : 'star');
      ctx.save(); ctx.translate(W / 2 - 22, H / 2 - 22); ctx.scale(0.44, 0.44); ctx.fillStyle = '#c99a8f';
      ps.forEach(function (pp) { ctx.fill(pp, 'evenodd'); }); ctx.restore();
      wear(ctx, W, H, R, 0.8);
      ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(1.5, 1.5, W - 3, H - 3);
      cache[key] = toURL(cv);
    }
    return img(cache[key], 'packart');
  }

  function textures() {
    if (!canvasOK()) return;
    var R = rng(4040), i;
    var p = mk(256, 256), c = p.getContext('2d');
    c.fillStyle = PAPER; c.fillRect(0, 0, 256, 256);
    for (i = 0; i < 40; i++) { c.fillStyle = 'rgba(120,98,66,' + (0.03 + R() * 0.06) + ')'; c.beginPath(); c.ellipse(R() * 256, R() * 256, 10 + R() * 60, 8 + R() * 40, R() * 3, 0, Math.PI * 2); c.fill(); }
    for (i = 0; i < 900; i++) { c.strokeStyle = R() < 0.5 ? 'rgba(90,72,48,.18)' : 'rgba(255,248,230,.25)'; c.lineWidth = 0.6; var x = R() * 256, y = R() * 256, a = R() * Math.PI; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * (2 + R() * 6), y + Math.sin(a) * (2 + R() * 6)); c.stroke(); }
    for (i = 0; i < 2500; i++) { c.fillStyle = 'rgba(60,46,30,' + R() * 0.14 + ')'; c.fillRect(R() * 256, R() * 256, 1, 1); }
    var g = mk(160, 160), gc = g.getContext('2d');
    for (i = 0; i < 2600; i++) { gc.fillStyle = R() < 0.5 ? 'rgba(0,0,0,' + (0.1 + R() * 0.25) + ')' : 'rgba(217,204,177,' + (0.02 + R() * 0.05) + ')'; gc.fillRect(R() * 160, R() * 160, 1 + (R() < 0.1 ? 1 : 0), 1); }
    var root = document.documentElement.style;
    root.setProperty('--paper-tex', 'url(' + toURL(p, 'image/png') + ')');
    root.setProperty('--grain-tex', 'url(' + toURL(g, 'image/png') + ')');
  }

  function icon(name, cls, fill) {
    var list = ICONS[name] || ICONS.star, out = '';
    for (var i = 0; i < list.length; i++) out += '<path fill-rule="evenodd" d="' + list[i] + '" fill="' + (fill || 'currentColor') + '"/>';
    return '<svg class="' + (cls || 'ico') + '" viewBox="0 0 100 100" aria-hidden="true">' + out + '</svg>';
  }

  return { card: card, sigil: sigil, portrait: portrait, hero: hero, back: back, pack: pack, textures: textures, icon: icon, ok: canvasOK };
})();

/* small UI glyphs drawn as SVG (no emoji anywhere) */
var GLYPH = {
  atk: '<svg class="g" viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 2 L22 2 L22 9.5 L11 20.5 L8.5 18 L6 20.5 L3.5 18 L6 15.5 L3.5 13 Z" fill="currentColor"/></svg>',
  hp: '<svg class="g" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21 C5 16 2 12 2 8 C2 5 4.5 3 7 3 C9 3 11 4.5 12 6 C13 4.5 15 3 17 3 C19.5 3 22 5 22 8 C22 12 19 16 12 21 Z" fill="currentColor"/></svg>',
  shard: '<svg class="g" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1 L19 8 L12 23 L5 8 Z" fill="currentColor"/><path d="M12 1 L12 23 M5 8 L19 8" stroke="rgba(0,0,0,.35)" stroke-width="1" fill="none"/></svg>',
  coin: '<svg class="g" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor"/><circle cx="12" cy="12" r="6.5" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/><path d="M12 7.5 L14 12 L12 16.5 L10 12 Z" fill="rgba(0,0,0,.35)"/></svg>',
  ash: '<svg class="g" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 C14 7 19 9 19 15 C19 19 16 22 12 22 C8 22 5 19 5 15 C5 11 8 9 9 6 C10 9 11 10 12 11 C13 8 13 5 12 2 Z" fill="currentColor"/></svg>',
  deck: '<svg class="g" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="3" width="13" height="18" rx="2" fill="currentColor"/><rect x="3" y="5" width="13" height="16" rx="2" fill="currentColor" opacity=".55"/></svg>',
  hand: '<svg class="g" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="9" height="13" rx="1.5" transform="rotate(-12 7 12)" fill="currentColor" opacity=".6"/><rect x="11" y="5" width="9" height="13" rx="1.5" transform="rotate(10 15 12)" fill="currentColor"/></svg>',
  check: '<svg class="g" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5 L9.5 18 L20 6.5" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  lock: '<svg class="g" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2" fill="currentColor"/><path d="M8 10 V7 A4 4 0 0 1 16 7 V10" stroke="currentColor" stroke-width="2.4" fill="none"/></svg>',
  back: '<svg class="g" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4 L7 12 L15 20" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  menu: '<svg class="g" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6 H20 M4 12 H20 M4 18 H20" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  sound: '<svg class="g" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9 H8 L13 4 V20 L8 15 H4 Z" fill="currentColor"/><path d="M16 8 C18 10 18 14 16 16 M18.5 5.5 C22 9 22 15 18.5 18.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  mute: '<svg class="g" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9 H8 L13 4 V20 L8 15 H4 Z" fill="currentColor"/><path d="M16 9 L22 15 M22 9 L16 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  info: '<svg class="g" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 10.5 V17" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="7" r="1.5" fill="currentColor"/></svg>',
  plus: '<svg class="g" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5 V19 M5 12 H19" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
  minus: '<svg class="g" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12 H19" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
  sleep: '<svg class="g" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5 H18 L6 19 H18" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg>',
  log: '<svg class="g" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4 H19 V20 H5 Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 9 H16 M8 13 H16 M8 17 H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
};

var KW_GLYPH = {
  charge: 'M13 2 L4 14 H11 L9 22 L20 9 H13 Z',
  skyborne: 'M2 17 C6 9 13 5 22 4 C19 7 18 9 17 11 C19 11 20 12 21 13 C15 16 9 17 2 17 Z',
  reach: 'M12 2 L16 9 H13 V22 H11 V9 H8 Z',
  vigil: 'M2 12 C6 6 18 6 22 12 C18 18 6 18 2 12 Z M9 12 A3 3 0 1 0 15 12 A3 3 0 1 0 9 12 Z',
  swift: 'M3 6 L11 12 L3 18 Z M12 6 L20 12 L12 18 Z',
  venom: 'M12 2 C15 8 19 11 19 15 C19 19 16 22 12 22 C8 22 5 19 5 15 C5 11 9 8 12 2 Z',
  siphon: 'M12 21 C5 16 2 12 2 8 C2 5 4.5 3 7 3 C9 3 11 4.5 12 6 C13 4.5 15 3 17 3 C19.5 3 22 5 22 8 C22 12 19 16 12 21 Z',
  overrun: 'M2 8 L12 8 L12 4 L22 12 L12 20 L12 16 L2 16 Z',
  shielded: 'M12 2 L21 5 C21 13 18 18 12 22 C6 18 3 13 3 5 Z',
  warded: 'M12 2 L22 12 L12 22 L2 12 Z M12 7 L17 12 L12 17 L7 12 Z',
  bulwark: 'M3 4 H21 V9 H17 V6 H14 V9 H10 V6 H7 V9 H3 Z M3 9 H21 V21 H3 Z'
};
function kwGlyph(k, cls) {
  return '<svg class="' + (cls || 'kwg') + '" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="' + KW_GLYPH[k] + '" fill="currentColor"/></svg>';
}
