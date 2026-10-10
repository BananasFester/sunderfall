// Home-screen icons, drawn in code so the repo holds no hand-made image files.
// The emblem is the card-back star: bone rays around a shattered bone disc on soot.
// Shapes live in a 100x100 space; everything sits inside the maskable safe
// zone (radius 40) so Android can crop the icon to any shape.
var zlib = require('zlib');

var SOOT = [21, 18, 15], PAPER = [211, 197, 165], BLOOD = [142, 28, 19];

// the disc breaks along jagged cracks that meet off center; one piece,
// inked blood red, has split away from the rest
var R = 18.5, F = [-2.5, 2], CRACKS = [[195, -2.2], [300, 2], [28, -1.8], [102, 1.6]], LOOSE = 2, DRIFT = 3.4;

function shapes() {
  var L = [], i, a, r0, r1, w, cx, cy, loose;
  L.push({ t: 'all', c: SOOT });
  for (i = 0; i < 16; i++) {
    a = i / 16 * Math.PI * 2 - Math.PI / 2;
    r0 = 23; r1 = i % 2 ? 31.5 + (i % 4 === 1 ? 1.5 : 0) : 40 - (i % 4 === 2 ? 2.5 : 0);
    w = i % 2 ? 2.2 : 3.6;
    cx = Math.cos(a); cy = Math.sin(a);
    L.push({ t: 'poly', c: PAPER, p: [[50 + cx * r0 - cy * w, 50 + cy * r0 + cx * w], [50 + cx * r1, 50 + cy * r1], [50 + cx * r0 + cy * w, 50 + cy * r0 - cx * w]] });
  }
  var paths = CRACKS.map(function (k) {
    var t = k[0] * Math.PI / 180, ex = Math.cos(t) * R * 1.02, ey = Math.sin(t) * R * 1.02;
    var mx = F[0] + (ex - F[0]) * 0.5 - Math.sin(t) * k[1], my = F[1] + (ey - F[1]) * 0.5 + Math.cos(t) * k[1];
    return [F, [mx, my], [ex, ey]];
  });
  for (i = 0; i < CRACKS.length; i++) {
    var j = (i + 1) % CRACKS.length, t0 = CRACKS[i][0], t1 = CRACKS[j][0];
    if (t1 < t0) t1 += 360;
    var p = paths[i].slice();
    for (a = t0; a < t1; a += 6) p.push([Math.cos(a * Math.PI / 180) * R, Math.sin(a * Math.PI / 180) * R]);
    p = p.concat(paths[j].slice().reverse());
    var mid = (t0 + t1) / 2 * Math.PI / 180, d = i === LOOSE ? DRIFT : 0;
    var piece = { t: 'poly', c: i === LOOSE ? BLOOD : PAPER, p: p.map(function (q) { return [50 + q[0] + Math.cos(mid) * d, 50 + q[1] + Math.sin(mid) * d]; }) };
    if (i === LOOSE) loose = piece; else L.push(piece);
  }
  paths.forEach(function (q) { L.push({ t: 'line', c: SOOT, w: 1.7, p: q.map(function (v) { return [50 + v[0], 50 + v[1]]; }) }); });
  L.push(loose);
  L.forEach(function (s) {
    if (s.t === 'all') return;
    var pts = s.t === 'circ' ? [[s.x - s.r, s.y - s.r], [s.x + s.r, s.y + s.r]] : s.p, pad = s.t === 'line' ? s.w / 2 : 0;
    s.x0 = Math.min.apply(null, pts.map(function (q) { return q[0]; })) - pad;
    s.x1 = Math.max.apply(null, pts.map(function (q) { return q[0]; })) + pad;
    s.y0 = Math.min.apply(null, pts.map(function (q) { return q[1]; })) - pad;
    s.y1 = Math.max.apply(null, pts.map(function (q) { return q[1]; })) + pad;
  });
  return L;
}

function segDist2(x, y, a, b) {
  var dx = b[0] - a[0], dy = b[1] - a[1], t = ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy);
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  var ex = a[0] + dx * t - x, ey = a[1] + dy * t - y;
  return ex * ex + ey * ey;
}

function hit(s, x, y) {
  if (s.t === 'all') return true;
  if (x < s.x0 || x > s.x1 || y < s.y0 || y > s.y1) return false;
  if (s.t === 'circ') return (x - s.x) * (x - s.x) + (y - s.y) * (y - s.y) <= s.r * s.r;
  var i, p = s.p;
  if (s.t === 'line') {
    for (i = 1; i < p.length; i++) if (segDist2(x, y, p[i - 1], p[i]) <= s.w * s.w / 4) return true;
    return false;
  }
  var inside = false;
  for (i = 0; i < p.length; i++) {
    var a = p[i], b = p[(i + 1) % p.length];
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

function render(size) {
  var L = shapes(), S = 4, k = 100 / size, px = Buffer.alloc(size * size * 3), x, y, i, j, n;
  for (y = 0; y < size; y++) for (x = 0; x < size; x++) {
    var acc = [0, 0, 0];
    for (j = 0; j < S; j++) for (i = 0; i < S; i++) {
      var ux = (x + (i + 0.5) / S) * k, uy = (y + (j + 0.5) / S) * k;
      for (n = L.length - 1; !hit(L[n], ux, uy); n--);
      acc[0] += L[n].c[0]; acc[1] += L[n].c[1]; acc[2] += L[n].c[2];
    }
    var o = (y * size + x) * 3;
    px[o] = Math.round(acc[0] / (S * S)); px[o + 1] = Math.round(acc[1] / (S * S)); px[o + 2] = Math.round(acc[2] / (S * S));
  }
  return png(size, size, px);
}

var CRC = [];
for (var c = 0; c < 256; c++) { var v = c; for (var b = 0; b < 8; b++) v = v & 1 ? 0xedb88320 ^ (v >>> 1) : v >>> 1; CRC[c] = v >>> 0; }
function crc32(buf) { var v = 0xffffffff; for (var i = 0; i < buf.length; i++) v = CRC[(v ^ buf[i]) & 255] ^ (v >>> 8); return (v ^ 0xffffffff) >>> 0; }
function chunk(type, data) {
  var len = Buffer.alloc(4), crc = Buffer.alloc(4), td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  len.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(w, h, rgb) {
  var head = Buffer.alloc(13), raw = Buffer.alloc((w * 3 + 1) * h), y;
  head.writeUInt32BE(w, 0); head.writeUInt32BE(h, 4); head[8] = 8; head[9] = 2;
  for (y = 0; y < h; y++) rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', head),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

module.exports = { render: render };
