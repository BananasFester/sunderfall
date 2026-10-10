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

/* ---------- unit figures ----------
   Units are drawn as people and creatures, not bare objects. A figure is
   built from smooth outlines and tapered limbs in a 100x100 box with its
   feet on y = 96, and is split into layers (far, back, body, head, arms,
   over). The renderer gives each layer a paper outline, engraves light
   along the edges that face the star, then cuts the carved detail (folds,
   visors, ribs, beards) in paper. FIG maps a card id to a figure spec;
   a unit without an entry falls back to its ICONS glyph. */
var FIG = {
  /* Auric Dominion */
  a01: { dress: 'robe', head: 'hood', r: 'candle' },
  a02: { head: 'helm', r: 'spear', l: 'shield' },
  a03: { dress: 'robe', head: 'mitre', r: 'staff', l: 'scroll' },
  a04: { dress: 'robe', head: 'hood', r: 'spear', l: 'tower' },
  a05: { head: 'crest', r: 'spear', l: 'round', cape: 1 },
  a07: { dress: 'robe', head: 'hood', r: 'greatsword' },
  a09: { head: 'crest', r: 'sword', cape: 1 },
  a10: { dress: 'robe', head: 'hat', r: 'torch', l: 'book' },
  a12: { head: 'helm', r: 'sword', l: 'tower' },
  a13: { head: 'helm', r: 'sword', l: 'shield', cape: 1, emblem: 1 },
  a14: { head: 'halo', r: 'spear', wings: 'feather' },
  a16: { dress: 'robe', head: 'crown', hair: 1, r: 'sword', wings: 'feather' },
  t_trooper: { head: 'helm', r: 'spear', l: 'round' },
  /* Verdant Eld */
  e01: { kind: 'moth' },
  e02: { dress: 'robe', head: 'hood', l: 'bow' },
  e05: { build: 'tree', head: 'knot', r: 'bough' },
  e06: { kind: 'hawk', rider: { head: 'helm', r: 'spear', mounted: 1 } },
  e07: { kind: 'stag' },
  e08: { build: 'tree', head: 'knot', s: 0.72 },
  e09: { dress: 'robe', head: 'hood', r: 'orb', l: 'staff', staff: 'wood' },
  e11: { build: 'tree', head: 'knot', r: 'crook' },
  e12: { kind: 'roc' },
  e14: { build: 'tree', head: 'knot', r: 'bough', l: 'bough' },
  e16: { dress: 'robe', head: 'antler', hair: 1, r: 'staff', staff: 'wood', cape: 1 },
  t_thornling: { build: 'tree', head: 'knot', s: 0.68 },
  /* Hollow Host */
  h01: { build: 'bones', head: 'skull', r: 'claws', l: 'claws', rag: 1, s: 0.86 },
  h02: { build: 'bones', head: 'skull', r: 'hatchet', rag: 1 },
  h07: { head: 'horns', r: 'sword', l: 'round', cape: 1 },
  h08: { build: 'heavy', head: 'skull', r: 'claws', l: 'claws' },
  h10: { dress: 'robe', head: 'hood', r: 'staff', staff: 'skull', l: 'book' },
  h11: { kind: 'choir' },
  h12: { build: 'bones', head: 'skull', horns: 1, r: 'hammer', rag: 1 },
  h13: { build: 'bones', head: 'skull', r: 'claws', l: 'claws', wings: 'bat' },
  h15: { head: 'skull', r: 'sword', l: 'round', cape: 1 },
  h16: { head: 'skull', crown: 1, r: 'greatsword', cape: 1 },
  h03: { kind: 'serpent' },
  h06: { kind: 'wraith' },
  t_husk: { build: 'bones', head: 'skull', rag: 1, s: 0.8 },
  /* Forgeborn Clans */
  f01: { build: 'heavy', head: 'orc', r: 'hatchet', s: 0.8 },
  f02: { build: 'heavy', head: 'dwarf', r: 'bomb' },
  f04: { kind: 'wolf', rider: { build: 'heavy', head: 'orc', r: 'axe', mounted: 1 } },
  f05: { build: 'heavy', head: 'dwarf', r: 'hammer', l: 'round' },
  f07: { build: 'heavy', head: 'orc', r: 'axe', l: 'axe' },
  f08: { build: 'heavy', head: 'orc', r: 'drum' },
  f10: { build: 'heavy', head: 'dwarf', r: 'cannon' },
  f11: { kind: 'golem', golem: 'rig' },
  f12: { build: 'heavy', head: 'dwarf', r: 'bomb', rotor: 1 },
  f14: { kind: 'golem', golem: 'iron' },
  f16: { build: 'heavy', head: 'orc', crown: 1, r: 'axe', cape: 1 },
  /* Unbound */
  u01: { dress: 'robe', head: 'hat', r: 'pick', l: 'shard' },
  u02: { dress: 'tunic', head: 'hat', r: 'sword', cape: 1 },
  u03: { kind: 'wolf', spiky: 1 },
  u04: { kind: 'golem', golem: 'stone' },
  u05: { dress: 'robe', head: 'hood', r: 'dagger', l: 'dagger' },
  u06: { head: 'hood', l: 'bow', cape: 1 },
  u07: { kind: 'golem', golem: 'crystal' },
  u08: { kind: 'drake' },
  t_recruit: { dress: 'tunic', head: 'kettle', r: 'spear', flag: 1 }
};

var Fig = (function () {
  var PI = Math.PI;

  /* ---- geometry: every shape is built in local units, then mapped through T ---- */
  function r1(v) { return Math.round(v * 10) / 10; }
  function ID(x, y) { return [x, y]; }
  function mirror(T) { return function (x, y) { return T(100 - x, y); }; }
  // scale about the feet (50, 96), then shift
  function place(T, s, dx, dy) { return function (x, y) { return T(50 + (x - 50) * s + dx, 96 + (y - 96) * s + dy); }; }
  // item space: u runs along the item from the hand, v across it
  function orient(x, y, a) {
    var c = Math.cos(a), s = Math.sin(a);
    return function (p) { return [x + p[0] * c - p[1] * s, y + p[0] * s + p[1] * c, p[2]]; };
  }
  function at(O, pts) { return pts.map(O); }
  function flipX(cx, pts) { return pts.map(function (p) { return [2 * cx - p[0], p[1], p[2]]; }); }

  function poly(T, pts) {
    var s = '';
    for (var i = 0; i < pts.length; i++) { var p = T(pts[i][0], pts[i][1]); s += (i ? ' L ' : 'M ') + r1(p[0]) + ' ' + r1(p[1]); }
    return s + ' Z';
  }
  // closed smooth outline; a point whose third value is 1 is a hard corner
  function spl(T, pts) {
    var n = pts.length, q = pts.map(function (p) { var t = T(p[0], p[1]); return [t[0], t[1], p[2]]; });
    var s = 'M ' + r1(q[0][0]) + ' ' + r1(q[0][1]);
    for (var i = 0; i < n; i++) {
      var p0 = q[(i + n - 1) % n], p1 = q[i], p2 = q[(i + 1) % n], p3 = q[(i + 2) % n];
      var a = p1[2] === 1 ? p1 : [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      var b = p2[2] === 1 ? p2 : [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      s += ' C ' + r1(a[0]) + ' ' + r1(a[1]) + ' ' + r1(b[0]) + ' ' + r1(b[1]) + ' ' + r1(p2[0]) + ' ' + r1(p2[1]);
    }
    return s + ' Z';
  }
  // samples of an open Catmull-Rom curve; a third value (a width) is interpolated
  function curve(pts, n) {
    var out = [], m = pts.length, i, j, d;
    for (i = 0; i < m - 1; i++) {
      var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(m - 1, i + 2)];
      for (j = 0; j < n; j++) {
        var t = j / n, t2 = t * t, t3 = t2 * t, xy = [0, 0];
        for (d = 0; d < 2; d++) xy[d] = 0.5 * (2 * p1[d] + (p2[d] - p0[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (3 * p1[d] - p0[d] - 3 * p2[d] + p3[d]) * t3);
        out.push([xy[0], xy[1], (p1[2] || 0) + ((p2[2] || 0) - (p1[2] || 0)) * t]);
      }
    }
    out.push([pts[m - 1][0], pts[m - 1][1], pts[m - 1][2] || 0]);
    return out;
  }
  function sides(c, half) {
    var L = [], R = [], n = c.length;
    for (var i = 0; i < n; i++) {
      var a = c[Math.max(0, i - 1)], b = c[Math.min(n - 1, i + 1)];
      var dx = b[0] - a[0], dy = b[1] - a[1], d = Math.sqrt(dx * dx + dy * dy) || 1, h = half(i, c[i]);
      L.push([c[i][0] - dy / d * h, c[i][1] + dx / d * h]);
      R.push([c[i][0] + dy / d * h, c[i][1] - dx / d * h]);
    }
    return [L, R];
  }
  // tapered limb with round ends through [x, y, width] points
  function tube(T, pts) {
    var c = curve(pts, 6), n = c.length, sd = sides(c, function (i, p) { return p[2] / 2; });
    var out = sd[0].slice(), j, e = c[n - 1], a = c[n - 2], s = c[0], b = c[1];
    var dx = e[0] - a[0], dy = e[1] - a[1], d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d, h = e[2] / 2;
    for (j = 1; j < 6; j++) { var t = PI * j / 6; out.push([e[0] - uy * h * Math.cos(t) + ux * h * Math.sin(t), e[1] + ux * h * Math.cos(t) + uy * h * Math.sin(t)]); }
    out = out.concat(sd[1].reverse());
    dx = b[0] - s[0]; dy = b[1] - s[1]; d = Math.sqrt(dx * dx + dy * dy) || 1; ux = dx / d; uy = dy / d; h = s[2] / 2;
    for (j = 1; j < 6; j++) { var t2 = PI * j / 6; out.push([s[0] + uy * h * Math.cos(t2) - ux * h * Math.sin(t2), s[1] - ux * h * Math.cos(t2) - uy * h * Math.sin(t2)]); }
    return poly(T, out);
  }
  // a gouge: a stroke that swells in the middle and tapers to points
  function lens(T, pts, w) {
    var c = curve(pts, 8), n = c.length;
    var sd = sides(c, function (i) { return w / 2 * Math.pow(Math.sin(PI * i / (n - 1)), 0.6); });
    return poly(T, sd[0].concat(sd[1].reverse()));
  }
  function ell(T, x, y, rx, ry, rot) {
    var pts = [], c = Math.cos(rot || 0), s = Math.sin(rot || 0);
    for (var i = 0; i < 24; i++) { var a = i / 24 * PI * 2, u = Math.cos(a) * rx, v = Math.sin(a) * ry; pts.push([x + u * c - v * s, y + u * s + v * c]); }
    return poly(T, pts);
  }
  function arc(cx, cy, r, a0, a1, n) {
    var o = [];
    for (var i = 0; i <= n; i++) { var a = a0 + (a1 - a0) * i / n; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    return o;
  }
  function star(T, x, y, r0, r1v, n) {
    var pts = [];
    for (var i = 0; i < n * 2; i++) { var a = -PI / 2 + i * PI / n, rr = i % 2 ? r1v : r0; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr, 1]); }
    return spl(T, pts);
  }
  function rays(T, L, x, y, r0, r1v, a0, a1, n) {
    for (var i = 0; i < n; i++) {
      var a = a0 + (a1 - a0) * (i + 0.5) / n, rr = i % 2 ? r1v * 0.8 : r1v;
      L.ink.push(lens(T, [[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * rr, y + Math.sin(a) * rr]], 1.1));
    }
  }
  function leaves(T, L, x, y, r) {
    var pts = [];
    for (var i = 0; i < 14; i++) { var a = i / 14 * PI * 2, rr = i % 2 ? r * 0.7 : r; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.85, i % 2 ? 0 : 1]); }
    L.ink.push(spl(T, pts));
    L.carve.push(lens(T, [[x - r * 0.6, y + r * 0.3], [x + r * 0.55, y - r * 0.3]], r * 0.2));
  }
  function both(T, fn) { fn(T); fn(mirror(T)); }

  function layer() { return { ink: [], carve: [], ink2: [] }; }
  function rig() { return { far: layer(), back: layer(), body: layer(), head: layer(), arms: layer(), over: layer() }; }
  function flat(g) { return [g.far, g.back, g.body, g.head, g.arms, g.over]; }

  /* ---- builds and poses (right arm; the left arm mirrors) ---- */
  var BUILD = {
    man:   { head: [50, 11.5, 6], sh: [61.5, 24], arm: [7, 5.6, 4.4], fist: 2.7 },
    heavy: { head: [50, 19.5, 7], sh: [67, 30], arm: [11, 9, 7.5], fist: 4 },
    bones: { head: [50, 11, 6], sh: [60, 23], arm: [3.2, 2.7, 2.4], fist: 1.9 },
    tree:  { head: [50, 14, 7], sh: [61, 27], arm: [8.5, 6, 4], fist: 0 }
  };
  var POSE = {
    man: { down: [[65.5, 37], [66.5, 49]], hold: [[67, 36], [70, 45]], ready: [[68, 35], [73, 41]], up: [[70.5, 33], [72, 23]],
      out: [[72, 26], [83, 27]], draw: [[71, 26], [54, 27]], guard: [[66, 37], [60, 41]], chest: [[66, 38], [57, 38]],
      grip: [[64, 37], [53, 44]], claw: [[72, 19], [80, 11]] },
    heavy: { down: [[73, 44], [74, 57]], hold: [[75, 43], [77, 53]], ready: [[75, 42], [81, 47]], up: [[77, 38], [78, 27]],
      out: [[79, 32], [89, 33]], draw: [[78, 32], [57, 33]], guard: [[73, 44], [66, 49]], chest: [[73, 45], [62, 46]],
      grip: [[71, 44], [55, 52]], claw: [[79, 25], [87, 15]] }
  };
  POSE.bones = POSE.man;
  POSE.tree = {};
  (function () { for (var k in POSE.man) if (POSE.man.hasOwnProperty(k)) POSE.tree[k] = [[POSE.man[k][0][0], POSE.man[k][0][1] + 3], [POSE.man[k][1][0], POSE.man[k][1][1] + 3]]; })();

  /* ---- heads ---- */
  function faceShape(T, x, y, r) {
    return spl(T, [[x - r * 0.82, y - r * 0.2], [x - r * 0.7, y - r * 0.95], [x, y - r * 1.12], [x + r * 0.7, y - r * 0.95], [x + r * 0.82, y - r * 0.2],
      [x + r * 0.68, y + r * 0.6], [x + r * 0.28, y + r * 1.05], [x - r * 0.28, y + r * 1.05], [x - r * 0.68, y + r * 0.6]]);
  }
  function features(T, L, x, y, r) {
    both(T, function (U) { L.carve.push(lens(U, [[x - r * 0.6, y + r * 0.04], [x - r * 0.37, y - r * 0.06], [x - r * 0.13, y + r * 0.04]], r * 0.18)); });
    L.carve.push(lens(T, [[x + r * 0.04, y + r * 0.14], [x + r * 0.13, y + r * 0.52]], r * 0.13));
    L.carve.push(lens(T, [[x - r * 0.27, y + r * 0.76], [x + r * 0.27, y + r * 0.76]], r * 0.12));
  }
  function glints(T, L, x, y, r) {
    both(T, function (U) { L.carve.push(ell(U, x - r * 0.34, y, r * 0.16, r * 0.09, -0.15)); });
  }
  function crownAt(T, L, x, y, r) {
    L.ink.push(spl(T, [[x - r * 0.95, y, 1], [x - r * 1.1, y - r * 1.15, 1], [x - r * 0.62, y - r * 0.55, 1], [x - r * 0.32, y - r * 1.45, 1], [x, y - r * 0.7, 1],
      [x + r * 0.32, y - r * 1.45, 1], [x + r * 0.62, y - r * 0.55, 1], [x + r * 1.1, y - r * 1.15, 1], [x + r * 0.95, y, 1]]));
    L.carve.push(lens(T, [[x - r * 0.88, y - r * 0.22], [x, y - r * 0.3], [x + r * 0.88, y - r * 0.22]], r * 0.17));
    L.carve.push(ell(T, x - r * 0.32, y - r * 0.95, r * 0.11, r * 0.13));
    L.carve.push(ell(T, x + r * 0.32, y - r * 0.95, r * 0.11, r * 0.13));
  }
  function hornsAt(T, L, x, y, r) {
    both(T, function (U) {
      L.ink.push(tube(U, [[x - r * 0.75, y - r * 0.45, r * 0.72], [x - r * 1.55, y - r * 0.85, r * 0.56], [x - r * 2.15, y - r * 1.65, r * 0.4], [x - r * 2.1, y - r * 2.5, r * 0.22], [x - r * 1.7, y - r * 3.0, r * 0.04]]));
      L.carve.push(lens(U, [[x - r * 1.3, y - r * 1.12], [x - r * 1.55, y - r * 0.55]], r * 0.12));
      L.carve.push(lens(U, [[x - r * 1.85, y - r * 1.8], [x - r * 2.3, y - r * 1.5]], r * 0.1));
    });
  }
  function skullAt(T, L, x, y, r) {
    L.ink.push(spl(T, [[x - r * 0.95, y - r * 0.05], [x - r * 0.85, y - r * 0.85], [x, y - r * 1.15], [x + r * 0.85, y - r * 0.85], [x + r * 0.95, y - r * 0.05],
      [x + r * 0.75, y + r * 0.55], [x + r * 0.5, y + r * 1.18, 1], [x - r * 0.5, y + r * 1.18, 1], [x - r * 0.75, y + r * 0.55]]));
    // a pale bone face cut out of the black, then sockets and teeth in ink
    L.carve.push(spl(T, [[x - r * 0.78, y - r * 0.05], [x - r * 0.68, y - r * 0.72], [x, y - r * 0.98], [x + r * 0.68, y - r * 0.72], [x + r * 0.78, y - r * 0.05],
      [x + r * 0.6, y + r * 0.5], [x + r * 0.4, y + r * 1.02, 1], [x - r * 0.4, y + r * 1.02, 1], [x - r * 0.6, y + r * 0.5]]));
    both(T, function (U) { L.ink2.push(spl(U, [[x - r * 0.64, y + r * 0.02], [x - r * 0.52, y - r * 0.34], [x - r * 0.14, y - r * 0.3], [x - r * 0.1, y + r * 0.1], [x - r * 0.36, y + r * 0.32]])); });
    L.ink2.push(poly(T, [[x, y + r * 0.24], [x + r * 0.14, y + r * 0.56], [x - r * 0.14, y + r * 0.56]]));
    L.ink2.push(poly(T, [[x - r * 0.42, y + r * 0.71], [x + r * 0.42, y + r * 0.71], [x + r * 0.4, y + r * 0.79], [x - r * 0.4, y + r * 0.79]]));
    for (var i = -2; i <= 2; i++) L.ink2.push(poly(T, [[x + i * r * 0.17 - r * 0.025, y + r * 0.64], [x + i * r * 0.17 + r * 0.025, y + r * 0.64], [x + i * r * 0.17 + r * 0.025, y + r * 0.98], [x + i * r * 0.17 - r * 0.025, y + r * 0.98]]));
    L.ink2.push(lens(T, [[x + r * 0.2, y - r * 0.95], [x + r * 0.36, y - r * 0.62], [x + r * 0.26, y - r * 0.4]], r * 0.09));
  }

  function head(T, sp, g, x, y, r) {
    var H = g.head, k = sp.head, i;
    if (sp.hair) {
      g.back.ink.push(spl(T, [[x - r * 0.95, y - r * 0.5], [x - r * 0.6, y - r * 1.05], [x, y - r * 1.2], [x + r * 0.6, y - r * 1.05], [x + r * 0.95, y - r * 0.5], [x + r * 1.25, y + r * 1.0],
        [x + r * 1.7, y + r * 2.6], [x + r * 2.3, y + r * 4.0, 1], [x + r * 1.0, y + r * 3.4], [x, y + r * 2.4], [x - r * 1.0, y + r * 3.4], [x - r * 2.3, y + r * 4.0, 1], [x - r * 1.7, y + r * 2.6], [x - r * 1.25, y + r * 1.0]]));
      both(T, function (U) {
        g.back.carve.push(lens(U, [[x - r * 1.1, y + r * 0.6], [x - r * 1.5, y + r * 2.2], [x - r * 2.0, y + r * 3.6]], r * 0.14));
        g.back.carve.push(lens(U, [[x - r * 0.95, y + r * 1.6], [x - r * 1.05, y + r * 2.8]], r * 0.11));
      });
    }
    if (k === 'halo') {
      g.back.ink.push(ell(T, x, y - r * 0.2, r * 2.05, r * 2.05) + ' ' + ell(T, x, y - r * 0.2, r * 1.65, r * 1.65));
      rays(T, g.back, x, y - r * 0.2, r * 2.25, r * 3.1, -PI * 0.95, -PI * 0.05, 11);
    }
    if (k === 'helm' || k === 'crest' || k === 'horns' || k === 'halo') {
      H.ink.push(spl(T, [[x - r, y + r * 0.95, 1], [x - r * 1.08, y - r * 0.1], [x - r * 0.82, y - r * 0.85], [x, y - r * 1.15], [x + r * 0.82, y - r * 0.85], [x + r * 1.08, y - r * 0.1],
        [x + r, y + r * 0.95, 1], [x + r * 0.45, y + r * 1.25], [x - r * 0.45, y + r * 1.25]]));
      both(T, function (U) { H.carve.push(lens(U, [[x - r * 0.86, y + r * 0.02], [x - r * 0.5, y + r * 0.08], [x - r * 0.13, y + r * 0.1]], r * 0.32)); });
      H.carve.push(lens(T, [[x - r * 0.9, y - r * 0.36], [x, y - r * 0.5], [x + r * 0.9, y - r * 0.36]], r * 0.13));
      H.carve.push(lens(T, [[x, y - r * 1.05], [x, y - r * 0.6]], r * 0.12));
      for (i = 0; i < 3; i++) H.carve.push(ell(T, x + r * (0.32 + 0.22 * (i % 2)), y + r * (0.48 + 0.2 * i), r * 0.075, r * 0.075));
      if (k === 'crest') {
        H.ink.push(tube(T, [[x - r * 0.15, y - r * 0.95, r * 0.5], [x + r * 0.35, y - r * 1.8, r * 0.9], [x + r * 1.6, y - r * 2.35, r * 0.95], [x + r * 2.9, y - r * 1.8, r * 0.6], [x + r * 3.6, y - r * 0.7, r * 0.12]]));
        H.carve.push(lens(T, [[x + r * 0.3, y - r * 1.75], [x + r * 1.6, y - r * 2.3], [x + r * 2.9, y - r * 1.75], [x + r * 3.4, y - r * 0.9]], r * 0.14));
      }
      if (k === 'horns') hornsAt(T, H, x, y, r);
    } else if (k === 'kettle' || k === 'hat') {
      H.ink.push(faceShape(T, x, y, r));
      glints(T, H, x, y + r * 0.22, r);
      H.carve.push(lens(T, [[x + r * 0.05, y + r * 0.35], [x + r * 0.12, y + r * 0.62]], r * 0.12));
      if (k === 'kettle') {
        H.ink.push(spl(T, [[x - r * 0.92, y - r * 0.3, 1], [x - r * 0.82, y - r * 0.98], [x, y - r * 1.38], [x + r * 0.82, y - r * 0.98], [x + r * 0.92, y - r * 0.3, 1]]));
        H.ink.push(spl(T, [[x - r * 2.0, y - r * 0.02, 1], [x - r * 1.3, y - r * 0.48], [x, y - r * 0.6], [x + r * 1.3, y - r * 0.48], [x + r * 2.0, y - r * 0.02, 1], [x, y - r * 0.2]]));
        H.carve.push(lens(T, [[x - r * 1.75, y - r * 0.15], [x, y - r * 0.42], [x + r * 1.75, y - r * 0.15]], r * 0.15));
        H.carve.push(lens(T, [[x, y - r * 1.26], [x, y - r * 0.62]], r * 0.13));
        for (i = -2; i <= 2; i++) H.carve.push(ell(T, x + i * r * 0.36, y - r * 0.68 - Math.abs(i) * r * 0.04, r * 0.07, r * 0.07));
      } else {
        H.ink.push(spl(T, [[x - r * 0.88, y - r * 0.32, 1], [x - r * 0.82, y - r * 1.05], [x - r * 0.3, y - r * 1.55], [x + r * 0.15, y - r * 1.25], [x + r * 0.7, y - r * 1.5], [x + r * 0.9, y - r * 0.32, 1]]));
        H.ink.push(spl(T, [[x - r * 2.2, y + r * 0.2, 1], [x - r * 1.4, y - r * 0.35], [x, y - r * 0.52], [x + r * 1.4, y - r * 0.42], [x + r * 2.25, y - r * 0.2, 1], [x + r * 1.2, y - r * 0.06], [x, y - r * 0.12], [x - r * 1.2, y + r * 0.05]]));
        H.carve.push(lens(T, [[x - r * 0.85, y - r * 0.55], [x, y - r * 0.68], [x + r * 0.85, y - r * 0.58]], r * 0.2));
        H.carve.push(lens(T, [[x - r * 1.9, y + r * 0.05], [x - r * 1.0, y - r * 0.28]], r * 0.12));
      }
    } else if (k === 'hood') {
      H.ink.push(spl(T, [[x, y - r * 1.75, 1], [x + r * 0.8, y - r * 1.15], [x + r * 1.2, y - r * 0.1], [x + r * 1.3, y + r * 1.0], [x + r * 2.1, y + r * 1.8], [x + r * 2.0, y + r * 2.5],
        [x, y + r * 2.75], [x - r * 2.0, y + r * 2.5], [x - r * 2.1, y + r * 1.8], [x - r * 1.3, y + r * 1.0], [x - r * 1.2, y - r * 0.1], [x - r * 0.8, y - r * 1.15]]));
      both(T, function (U) { H.carve.push(lens(U, [[x - r * 0.7, y + r * 1.05], [x - r * 0.8, y + r * 0.1], [x - r * 0.45, y - r * 0.62], [x + r * 0.05, y - r * 0.82]], r * 0.22)); });
      glints(T, H, x, y + r * 0.22, r);
      H.carve.push(lens(T, [[x + r * 0.25, y - r * 1.5], [x + r * 0.95, y - r * 0.4], [x + r * 1.08, y + r * 0.9]], r * 0.15));
      H.carve.push(lens(T, [[x - r * 1.8, y + r * 2.15], [x, y + r * 2.42], [x + r * 1.8, y + r * 2.15]], r * 0.16));
    } else if (k === 'skull') {
      skullAt(T, H, x, y, r);
    } else if (k === 'orc') {
      both(T, function (U) {
        H.ink.push(spl(U, [[x - r * 0.8, y - r * 0.15], [x - r * 1.5, y - r * 0.5], [x - r * 2.15, y - r * 0.95, 1], [x - r * 1.45, y + r * 0.12], [x - r * 0.85, y + r * 0.42]]));
        H.carve.push(lens(U, [[x - r * 1.0, y - r * 0.1], [x - r * 1.7, y - r * 0.6]], r * 0.12));
      });
      H.ink.push(spl(T, [[x - r * 0.8, y - r * 0.45], [x - r * 0.6, y - r * 1.0], [x, y - r * 1.12], [x + r * 0.6, y - r * 1.0], [x + r * 0.8, y - r * 0.45], [x + r * 1.02, y + r * 0.4],
        [x + r * 0.86, y + r * 1.0], [x + r * 0.35, y + r * 1.22], [x - r * 0.35, y + r * 1.22], [x - r * 0.86, y + r * 1.0], [x - r * 1.02, y + r * 0.4]]));
      if (!sp.crown) H.ink.push(spl(T, [[x - r * 0.25, y - r * 0.95], [x - r * 0.12, y - r * 1.75], [x + r * 0.45, y - r * 2.35], [x + r * 1.35, y - r * 2.55, 1], [x + r * 0.75, y - r * 1.9], [x + r * 0.38, y - r * 1.0]]));
      both(T, function (U) {
        H.carve.push(lens(U, [[x - r * 0.72, y - r * 0.28], [x - r * 0.38, y - r * 0.08], [x - r * 0.06, y + r * 0.02]], r * 0.14));
        H.carve.push(lens(U, [[x - r * 0.58, y + r * 0.12], [x - r * 0.22, y + r * 0.22]], r * 0.17));
        H.carve.push(poly(U, [[x - r * 0.58, y + r * 1.08], [x - r * 0.46, y + r * 0.45], [x - r * 0.3, y + r * 1.02]]));
      });
      H.carve.push(lens(T, [[x - r * 0.24, y + r * 0.56], [x + r * 0.24, y + r * 0.56]], r * 0.1));
      H.carve.push(lens(T, [[x - r * 0.25, y + r * 0.95], [x + r * 0.25, y + r * 0.95]], r * 0.1));
    } else if (k === 'dwarf') {
      H.ink.push(faceShape(T, x, y, r));
      H.ink.push(spl(T, [[x - r * 1.02, y - r * 0.05, 1], [x - r * 0.95, y - r * 0.75], [x - r * 0.5, y - r * 1.2], [x, y - r * 1.36], [x + r * 0.5, y - r * 1.2], [x + r * 0.95, y - r * 0.75], [x + r * 1.02, y - r * 0.05, 1], [x, y - r * 0.22]]));
      H.ink.push(tube(T, [[x, y - r * 0.3, r * 0.34], [x, y + r * 0.45, r * 0.26]]));
      H.carve.push(lens(T, [[x - r * 0.96, y - r * 0.28], [x, y - r * 0.42], [x + r * 0.96, y - r * 0.28]], r * 0.14));
      H.carve.push(lens(T, [[x, y - r * 1.25], [x, y - r * 0.55]], r * 0.12));
      for (i = -2; i <= 2; i++) if (i) H.carve.push(ell(T, x + i * r * 0.4, y - r * 0.32 - Math.abs(i) * r * 0.03, r * 0.07, r * 0.07));
      both(T, function (U) { H.carve.push(ell(U, x - r * 0.44, y + r * 0.14, r * 0.16, r * 0.09, -0.12)); });
      H.ink.push(spl(T, [[x - r * 0.95, y + r * 0.05], [x - r * 1.15, y + r * 1.0], [x - r * 1.0, y + r * 2.2], [x - r * 0.55, y + r * 3.2], [x, y + r * 3.8, 1], [x + r * 0.55, y + r * 3.2],
        [x + r * 1.0, y + r * 2.2], [x + r * 1.15, y + r * 1.0], [x + r * 0.95, y + r * 0.05], [x + r * 0.5, y + r * 0.55], [x, y + r * 0.48], [x - r * 0.5, y + r * 0.55]]));
      both(T, function (U) {
        H.carve.push(lens(U, [[x - r * 0.08, y + r * 0.66], [x - r * 0.5, y + r * 0.78], [x - r * 0.88, y + r * 1.2]], r * 0.17));
        H.carve.push(lens(U, [[x - r * 0.78, y + r * 1.3], [x - r * 0.72, y + r * 2.2], [x - r * 0.42, y + r * 3.0]], r * 0.12));
        H.carve.push(lens(U, [[x - r * 0.34, y + r * 1.3], [x - r * 0.3, y + r * 2.5], [x - r * 0.12, y + r * 3.3]], r * 0.11));
      });
      H.carve.push(lens(T, [[x, y + r * 1.25], [x, y + r * 3.3]], r * 0.1));
    } else if (k === 'knot') {
      H.ink.push(spl(T, [[x - r * 0.9, y + r * 0.9], [x - r * 1.0, y - r * 0.2], [x - r * 0.7, y - r * 1.0], [x, y - r * 1.2], [x + r * 0.7, y - r * 1.0], [x + r * 1.0, y - r * 0.2], [x + r * 0.9, y + r * 0.9], [x, y + r * 1.25]]));
      both(T, function (U) {
        H.ink.push(tube(U, [[x - r * 0.4, y - r * 0.85, r * 0.55], [x - r * 0.9, y - r * 1.9, r * 0.36], [x - r * 1.9, y - r * 2.5, r * 0.2], [x - r * 2.6, y - r * 2.45, r * 0.06]]));
        H.ink.push(tube(U, [[x - r * 0.85, y - r * 1.75, r * 0.26], [x - r * 0.7, y - r * 2.7, r * 0.15], [x - r * 0.3, y - r * 3.2, r * 0.05]]));
        // a crown of leaves behind the branches
        leaves(U, g.back, x - r * 2.5, y - r * 1.15, r * 0.8);
        leaves(U, g.back, x - r * 1.75, y - r * 2.0, r * 0.9);
        leaves(U, g.back, x - r * 0.6, y - r * 2.35, r * 0.85);
        leaves(U, g.back, x - r * 2.9, y - r * 0.1, r * 0.55);
        H.carve.push(lens(U, [[x - r * 0.62, y - r * 0.08], [x - r * 0.18, y + r * 0.14]], r * 0.24));
        H.carve.push(lens(U, [[x - r * 0.65, y - r * 0.85], [x - r * 0.45, y - r * 0.35]], r * 0.1));
      });
      H.carve.push(lens(T, [[x - r * 0.42, y + r * 0.66], [x, y + r * 0.56], [x + r * 0.42, y + r * 0.72]], r * 0.16));
    } else {
      // bare head: crown, mitre or antlers on top
      H.ink.push(faceShape(T, x, y, r));
      features(T, H, x, y, r);
      if (k === 'mitre') {
        H.ink.push(spl(T, [[x - r * 0.86, y - r * 0.55, 1], [x - r * 0.96, y - r * 1.6], [x - r * 0.5, y - r * 2.5], [x, y - r * 3.0, 1], [x + r * 0.5, y - r * 2.5], [x + r * 0.96, y - r * 1.6], [x + r * 0.86, y - r * 0.55, 1]]));
        H.carve.push(lens(T, [[x - r * 0.82, y - r * 0.82], [x + r * 0.82, y - r * 0.82]], r * 0.18));
        H.carve.push(lens(T, [[x, y - r * 2.55], [x, y - r * 1.15]], r * 0.22));
        H.carve.push(lens(T, [[x - r * 0.48, y - r * 1.95], [x + r * 0.48, y - r * 1.95]], r * 0.2));
      }
      if (k === 'antler') {
        both(T, function (U) {
          H.ink.push(tube(U, [[x - r * 0.45, y - r * 0.8, r * 0.42], [x - r * 1.4, y - r * 1.9, r * 0.36], [x - r * 1.9, y - r * 3.4, r * 0.3], [x - r * 2.9, y - r * 4.6, r * 0.06]]));
          H.ink.push(tube(U, [[x - r * 1.4, y - r * 1.95, r * 0.3], [x - r * 2.7, y - r * 2.2, r * 0.2], [x - r * 3.7, y - r * 3.0, r * 0.05]]));
          H.ink.push(tube(U, [[x - r * 1.85, y - r * 3.1, r * 0.24], [x - r * 1.2, y - r * 4.3, r * 0.05]]));
          H.ink.push(tube(U, [[x - r * 2.4, y - r * 4.0, r * 0.18], [x - r * 3.4, y - r * 4.2, r * 0.04]]));
        });
      }
    }
    if (k === 'crown' || sp.crown) crownAt(T, H, x, y - r * (k === 'skull' ? 0.55 : k === 'orc' ? 0.7 : 0.62), r);
    if (sp.horns) hornsAt(T, H, x, y, r);
  }

  /* ---- bodies ---- */
  function boots(T, L, x, y, out) {
    // a boot planted at ankle (x, y); out = +1 points the toe right
    L.ink.push(spl(T, [[x - 2.6 * out, y - 3], [x + 2.6 * out, y - 3], [x + 3.4 * out, y + 1], [x + 8 * out, y + 4], [x + 8.4 * out, y + 6.5, 1], [x - 3.2 * out, y + 6.5, 1], [x - 3.3 * out, y + 2]]));
    L.carve.push(lens(T, [[x - 2.6 * out, y - 1.6], [x + 2.8 * out, y - 1.4]], 0.9));
  }
  function manBody(T, sp, g) {
    var L = g.body, d = sp.dress || 'armor';
    L.ink.push(tube(T, [[50, 15, 5.2], [50, 22, 6.2]]));
    if (d === 'robe') {
      L.ink.push(spl(T, [[38, 21], [50, 19.5], [62, 21], [65, 25], [63.5, 33], [61.5, 43], [63, 56], [66, 72], [70, 88], [72.5, 95.5, 1], [64, 94], [57, 96], [50, 94.5], [43, 96], [36, 94],
        [27.5, 95.5, 1], [30, 88], [34, 72], [37, 56], [38.5, 43], [36.5, 33], [35, 25]]));
      L.carve.push(lens(T, [[45, 52], [44, 66], [41.5, 82], [39.5, 93]], 1.7));
      L.carve.push(lens(T, [[55, 52], [56.5, 68], [59, 84], [61, 93]], 1.7));
      L.carve.push(lens(T, [[50, 56], [50, 74], [50.5, 91]], 1.2));
      L.carve.push(lens(T, [[47.2, 62], [46.6, 80], [45.5, 92]], 0.9));
      L.carve.push(lens(T, [[38.5, 43.5], [50, 45.6], [61.5, 43.5]], 2.4));
      L.carve.push(lens(T, [[57, 45.5], [58.5, 52], [57.2, 58]], 1.3));
      both(T, function (U) { L.carve.push(lens(U, [[44, 21.8], [47, 25.5], [50, 28.5]], 1.3)); });
      return;
    }
    L.ink.push(spl(T, [[38, 21], [50, 19.5], [62, 21], [65, 25], [64, 32], [60.5, 41], [61.5, 49], [58, 53], [42, 53], [38.5, 49], [39.5, 41], [36, 32], [35, 25]]));
    if (sp.mounted) {
      L.ink.push(tube(T, [[55, 50, 10.5], [64, 57, 8.5], [63, 72, 6]]));
      boots(T, L, 63.5, 74, 1);
    } else {
      L.ink.push(tube(T, [[55, 50, 10.5], [57, 62, 9], [58, 73, 6.8], [59, 84, 5.6], [59.5, 90, 5]]));
      L.ink.push(tube(T, [[45, 50, 10.5], [43.5, 62, 9], [42.5, 73, 6.8], [41, 84, 5.6], [40.5, 90, 5]]));
      boots(T, L, 59.6, 90, 1);
      boots(T, L, 40.4, 90, -1);
      L.carve.push(lens(T, [[55.5, 72], [58, 70.4], [60.5, 72]], 1.4));
      L.carve.push(lens(T, [[40, 72], [42.5, 70.4], [45, 72]], 1.4));
      L.carve.push(lens(T, [[58.8, 76], [59.3, 86]], 0.9));
      L.carve.push(lens(T, [[41.8, 76], [41, 86]], 0.9));
    }
    if (d === 'tunic') {
      L.ink.push(spl(T, [[38.5, 44], [61.5, 44], [63.5, 56], [65, 67, 1], [57, 65], [50, 66.5], [43, 65], [35, 67, 1], [36.5, 56]]));
      L.carve.push(lens(T, [[62.5, 23.5], [52, 34.5], [40.5, 45.5]], 1));
      L.carve.push(lens(T, [[59.5, 21.6], [49.5, 32.4], [38.4, 43]], 1));
      both(T, function (U) { L.carve.push(lens(U, [[44.5, 21.6], [47.5, 25], [50, 27.5]], 1.2)); });
      both(T, function (U) { L.carve.push(lens(U, [[40, 32], [41.5, 38], [41, 42]], 0.9)); });
      L.carve.push(lens(T, [[44, 50], [42, 64]], 1)); L.carve.push(lens(T, [[56, 50], [58, 64]], 1));
    } else {
      L.ink.push(spl(T, [[38.5, 46], [61.5, 46], [63, 52], [64, 60, 1], [58, 58], [50, 60], [42, 58], [36, 60, 1], [37, 52]]));
      L.carve.push(lens(T, [[50, 22], [50, 37]], 1));
      both(T, function (U) { L.carve.push(lens(U, [[40, 30], [45, 32.6], [49, 31.6]], 1.4)); });
      L.carve.push(lens(T, [[37.5, 56.5], [50, 57.6], [62.5, 56.5]], 1.3));
      L.carve.push(lens(T, [[44, 50], [43.4, 57]], 1)); L.carve.push(lens(T, [[56, 50], [56.6, 57]], 1)); L.carve.push(lens(T, [[50, 49], [50, 58]], 1));
      if (sp.emblem) { L.carve.push(star(T, 50, 31, 4.2, 1.4, 4)); L.ink2.push(ell(T, 50, 31, 0.9, 0.9)); }
    }
    L.carve.push(lens(T, [[39, 44.6], [50, 46.3], [61, 44.6]], 2.2));
    L.ink2.push(poly(T, [[48.4, 44.6], [51.6, 44.6], [51.6, 47.2], [48.4, 47.2]]));
  }
  function heavyBody(T, sp, g) {
    var L = g.body, i, j, hd = sp.head;
    L.ink.push(spl(T, [[35, 27], [50, 25], [65, 27], [70, 32], [70.5, 42], [67, 53], [66, 60], [59, 64], [41, 64], [34, 60], [33, 53], [29.5, 42], [30, 32]]));
    if (sp.mounted) {
      L.ink.push(tube(T, [[57, 58, 13], [66, 68, 10.5], [63, 82, 8.5]]));
      boots(T, L, 63.5, 84, 1);
    } else {
      L.ink.push(tube(T, [[57, 60, 13], [59, 70, 11], [60, 80, 9], [60.5, 88, 8.5]]));
      L.ink.push(tube(T, [[43, 60, 13], [41, 70, 11], [40, 80, 9], [39.5, 88, 8.5]]));
      L.ink.push(spl(T, [[56, 85], [65, 85], [66.5, 89.5], [71.5, 92.5], [71.5, 96.5, 1], [55, 96.5, 1], [55.5, 90]]));
      L.ink.push(spl(T, [[44, 85], [35, 85], [33.5, 89.5], [28.5, 92.5], [28.5, 96.5, 1], [45, 96.5, 1], [44.5, 90]]));
      L.carve.push(lens(T, [[55.5, 86.5], [65, 86.5]], 1.2)); L.carve.push(lens(T, [[35, 86.5], [44.5, 86.5]], 1.2));
      L.carve.push(lens(T, [[56, 73], [60, 71.5], [64, 73.5]], 1.5)); L.carve.push(lens(T, [[36, 73.5], [40, 71.5], [44, 73]], 1.5));
    }
    L.ink.push(spl(T, [[34, 57], [66, 57], [68, 66, 1], [63.5, 63.5], [60, 69, 1], [56, 64.5], [52, 70, 1], [48, 64.5], [44, 69, 1], [40, 63.5], [32, 66, 1]]));
    L.carve.push(lens(T, [[33.5, 51.5], [50, 54.2], [66.5, 51.5]], 1.3));
    L.carve.push(lens(T, [[34, 57.2], [50, 59.8], [66, 57.2]], 1.3));
    L.carve.push(spl(T, [[46.5, 52.6, 1], [53.5, 52.6, 1], [53.5, 59.4, 1], [46.5, 59.4, 1]]));
    L.ink2.push(spl(T, [[48, 54.2, 1], [52, 54.2, 1], [52, 57.8, 1], [48, 57.8, 1]]));
    if (hd === 'dwarf') {
      // scale mail below the beard
      for (j = 0; j < 4; j++) for (i = 0; i < 7; i++) {
        var sx = 35.5 + i * 4.8 + (j % 2) * 2.4, sy = 33 + j * 4.3;
        if (sx > 33 && sx < 67) L.carve.push(lens(T, [[sx - 2, sy], [sx, sy + 1.7], [sx + 2, sy]], 0.9));
      }
    } else if (hd === 'orc') {
      L.carve.push(lens(T, [[34, 32], [50, 44], [65, 56]], 3.4));
      L.carve.push(lens(T, [[35.5, 34.5], [50, 46.5], [63.5, 57.5]], 0.8));
      both(T, function (U) { L.carve.push(lens(U, [[37, 39], [43, 42.5], [49, 41]], 1.4)); });
    } else {
      both(T, function (U) { L.carve.push(lens(U, [[36, 44], [42, 49], [48, 49.5]], 1.4)); });
      for (i = 0; i < 4; i++) L.carve.push(lens(T, [[47.5 + (i % 2), 30 + i * 4.5], [52.5 - (i % 2), 31.5 + i * 4.5]], 1));
      L.carve.push(lens(T, [[50, 28], [50, 48]], 0.8));
    }
  }
  function bonesBody(T, sp, g) {
    var L = g.body, i;
    L.ink.push(tube(T, [[50, 15, 2.8], [50, 47, 3.1]]));
    L.ink.push(spl(T, [[38, 22], [50, 20.5], [62, 22], [63, 28], [61, 35], [56.5, 40], [50, 41], [43.5, 40], [39, 35], [37, 28]]));
    for (i = 0; i < 4; i++) {
      var y = 24.6 + i * 4.1;
      both(T, function (U) { L.carve.push(lens(U, [[39.6 + i * 1.1, y], [44, y + 1.4], [48.6, y + 0.7]], 1.7)); });
    }
    L.ink.push(spl(T, [[41, 46], [50, 44.5], [59, 46], [61, 50], [57, 54.5], [50, 52.5], [43, 54.5], [39, 50]]));
    both(T, function (U) { L.carve.push(ell(U, 45.4, 49.4, 1.6, 1.3)); });
    if (!sp.mounted) {
      both(T, function (U) {

        L.ink.push(tube(U, [[54, 51, 3.6], [56, 70.5, 2.9]]));
        L.ink.push(ell(U, 56.2, 72, 2.4, 2.4));
        L.ink.push(tube(U, [[56.3, 73.5, 2.9], [57.5, 90.5, 2.4]]));
        L.ink.push(spl(U, [[55.4, 89.5], [59, 89.5], [63.5, 93.6], [63.5, 96, 1], [55, 96, 1]]));
      });
    }
    if (sp.rag) {
      L.ink.push(spl(T, [[41, 48.5], [59, 48.5], [60, 58, 1], [57, 55], [55, 64, 1], [52, 57], [49, 66, 1], [46, 57.5], [43.5, 62, 1], [40, 56]]));
      L.carve.push(lens(T, [[47, 51], [47.6, 59]], 0.9)); L.carve.push(lens(T, [[54, 51], [53.6, 58]], 0.9));
    }
  }
  function treeBody(T, sp, g) {
    var L = g.body;
    L.ink.push(spl(T, [[35, 25], [43, 19], [57, 19], [65, 25], [67.5, 35], [64, 48], [65, 60], [68, 72], [73, 82], [86, 93.5, 1], [73, 92], [67, 96.5, 1], [60, 91], [53, 95.5, 1], [47, 91], [40, 96.5, 1],
      [34, 92], [14, 93.5, 1], [27, 82], [32, 72], [35, 60], [36, 48], [32.5, 35]]));
    L.carve.push(lens(T, [[41, 26], [39.5, 44], [41, 62], [37, 80], [27, 90]], 1.7));
    L.carve.push(lens(T, [[46.5, 30], [46, 46], [47, 60], [45.5, 76], [43, 90]], 1.1));
    L.carve.push(lens(T, [[52.5, 28], [53.5, 48], [52, 66], [53, 86]], 1.2));
    L.carve.push(lens(T, [[59, 26], [60.5, 44], [59, 62], [63, 80], [72, 90]], 1.7));
    L.carve.push(lens(T, [[38, 52], [44, 55], [48, 54]], 0.9));
    L.carve.push(lens(T, [[56, 70], [61, 73], [64, 72]], 0.9));
    L.carve.push(ell(T, 54, 55, 2.1, 3.1));
    L.ink2.push(ell(T, 54, 55, 1.1, 1.9));
  }

  function arm(T, sp, B, pz, L, bd) {
    var s = B.sh, e = pz[0], w = pz[1], a = B.arm, f = B.fist;
    var dx = w[0] - e[0], dy = w[1] - e[1], d = Math.sqrt(dx * dx + dy * dy) || 1;
    if (sp.dress === 'robe') a = [8, 7.6, 9.2];
    L.ink.push(tube(T, [[s[0], s[1], a[0]], [e[0], e[1], a[1]], [w[0], w[1], a[2]]]));
    if (bd === 'bones') { L.ink.push(ell(T, e[0], e[1], 2.1, 2.1)); L.ink.push(ell(T, s[0], s[1], 2.8, 2.8)); }
    if (bd === 'tree') {
      L.ink.push(tube(T, [[w[0], w[1], 3], [w[0] + dx / d * 4 - dy / d * 2, w[1] + dy / d * 4 + dx / d * 2, 0.6]]));
      L.ink.push(tube(T, [[w[0], w[1], 3], [w[0] + dx / d * 4.5 + dy / d * 1.5, w[1] + dy / d * 4.5 - dx / d * 1.5, 0.6]]));
      L.carve.push(lens(T, [[s[0] - 1, s[1] + 1], [e[0] - 0.5, e[1]], [w[0], w[1]]], 1));
    } else if (f) {
      var off = sp.dress === 'robe' ? 2.6 : f * 0.6;
      L.ink.push(ell(T, w[0] + dx / d * off, w[1] + dy / d * off, f, f * 0.9));
    }
    if (bd === 'man' && sp.dress !== 'robe' && sp.dress !== 'tunic') {
      L.ink.push(spl(T, [[56, 21], [62, 18.8], [67.5, 21.5], [69, 27.5], [64, 28.5], [57.5, 26]]));
      L.carve.push(lens(T, [[58.5, 23.4], [63, 22], [67.5, 24.4]], 1.1));
      L.carve.push(lens(T, [[60, 26.2], [64, 25.3], [68, 27]], 1));
      L.carve.push(lens(T, [[e[0] - 2.4, e[1] - 1], [e[0], e[1] - 2.6], [e[0] + 2.4, e[1] - 1]], 1));
    }
    if (bd === 'heavy') {
      L.ink.push(spl(T, [[59, 25], [67, 21.5], [76, 24.5], [79, 32], [71, 34.5], [62, 31]]));
      L.carve.push(lens(T, [[61.5, 27], [68, 24.6], [76, 27.5]], 1.2));
      L.carve.push(lens(T, [[63.5, 30.4], [70, 28.6], [77, 31]], 1.1));
      if (sp.head === 'orc') {
        L.ink.push(poly(T, [[66, 23], [68, 15], [70.5, 22.8]]));
        L.ink.push(poly(T, [[72, 24.3], [76, 17.5], [76.5, 26]]));
      } else L.carve.push(ell(T, 68, 26.4, 0.7, 0.7));
      L.carve.push(lens(T, [[w[0] - dx / d * 4 - dy / d * 3.5, w[1] - dy / d * 4 + dx / d * 3.5], [w[0] - dx / d * 4 + dy / d * 3.5, w[1] - dy / d * 4 - dx / d * 3.5]], 1.4));
    }
  }

  /* ---- held things, drawn for the right hand at its wrist (x, y) ---- */
  function blade(T, L, x, y, ang, len, w, gw) {
    var O = orient(x, y, ang), p = O([-6, 0]);
    // steel is cut pale inside a black rim, with a dark fuller down the middle
    L.ink.push(spl(T, at(O, [[3, -w - 0.5, 1], [len * 0.55, -w * 1.05 - 0.5], [len - w * 2.5, -w * 0.9 - 0.5], [len + 0.8, 0, 1], [len - w * 2.5, w * 0.9 + 0.5], [len * 0.55, w * 1.05 + 0.5], [3, w + 0.5, 1]])));
    L.carve.push(spl(T, at(O, [[4.2, -w, 1], [len * 0.55, -w * 1.05], [len - w * 2.5, -w * 0.9], [len - 0.6, 0, 1], [len - w * 2.5, w * 0.9], [len * 0.55, w * 1.05], [4.2, w, 1]])));
    L.ink2.push(lens(T, at(O, [[5.5, 0], [len - w * 3, 0]]), Math.max(0.55, w * 0.34)));
    L.ink.push(tube(T, at(O, [[2.4, -gw, 1.5], [2.9, 0, 2.3], [2.4, gw, 1.5]])));
    L.ink.push(tube(T, at(O, [[-4.5, 0, 2.2], [2.5, 0, 2.2]])));
    L.ink.push(ell(T, p[0], p[1], 2, 2));
  }
  function axeHead(T, L, x, y, ang, k) {
    var O = orient(x, y, ang), p = O([-12 * k - 1.5, 0]);
    L.ink.push(tube(T, at(O, [[-12 * k, 0, 2.7], [35 * k, 0, 2.5]])));
    L.ink.push(ell(T, p[0], p[1], 2.2, 2.2));
    L.ink.push(spl(T, at(O, [[35 * k, 1.5, 1], [38 * k, 7 * k], [39.5 * k, 13.5 * k, 1], [33 * k, 15.5 * k], [25 * k, 14 * k, 1], [26.5 * k, 8 * k], [22 * k, 1.5, 1]])));
    L.ink.push(spl(T, at(O, [[33 * k, -1.5, 1], [30.5 * k, -6.5 * k, 1], [28 * k, -1.5, 1]])));
    L.carve.push(spl(T, at(O, [[36.6 * k, 5.5 * k], [38.1 * k, 12.6 * k, 1], [33 * k, 14.2 * k], [26 * k, 13.1 * k, 1], [29 * k, 11 * k], [33.4 * k, 10.2 * k]])));
    L.carve.push(lens(T, at(O, [[24 * k, 3 * k], [31 * k, 4 * k]]), 1));
  }
  var ITEM = {
    spear: { pose: 'hold', draw: function (T, g, x, y, sp) {
      var A = g.arms;
      A.ink.push(tube(T, [[x, 95, 2.2], [x, 13, 2]]));
      A.ink.push(spl(T, [[x, 0.2, 1], [x + 3.1, 6], [x + 2.6, 10.6], [x, 13.4, 1], [x - 2.6, 10.6], [x - 3.1, 6]]));
      A.carve.push(spl(T, [[x, 1.8, 1], [x + 2.1, 6.2], [x + 1.6, 10], [x, 11.8, 1], [x - 1.6, 10], [x - 2.1, 6.2]]));
      A.ink2.push(lens(T, [[x, 3.2], [x, 11.2]], 0.6));
      A.ink.push(ell(T, x, 13.8, 1.9, 1.1));
      if (sp.flag) {
        A.ink.push(spl(T, [[x + 0.8, 15, 1], [x + 7, 14], [x + 13, 15.5], [x + 18, 14.2, 1], [x + 14, 18.5], [x + 18.5, 23, 1], [x + 12, 21.8], [x + 6, 23.3], [x + 0.8, 22.5, 1]]));
        A.carve.push(lens(T, [[x + 3, 18.6], [x + 8, 18], [x + 13, 18.8]], 1.3));
      }
    } },
    sword: { pose: 'ready', draw: function (T, g, x, y) { blade(T, g.arms, x, y, -1.22, 29, 1.7, 6); } },
    greatsword: { pose: 'grip', both: 1, draw: function (T, g, x, y) { blade(T, g.arms, 50, y + 1, PI / 2, 44, 2.3, 8.5); } },
    dagger: { pose: 'ready', draw: function (T, g, x, y) { blade(T, g.arms, x, y, -0.95, 12, 1.3, 3.6); } },
    staff: { pose: 'hold', draw: function (T, g, x, y, sp) {
      var A = g.arms, kind = sp.staff;
      A.ink.push(tube(T, [[x + 0.6, 95, 2.4], [x - 0.5, 72, 2.3], [x + 0.5, 48, 2.3], [x - 0.4, 24, 2.5], [x, 13, 2.8]]));
      if (kind === 'skull') { skullAt(T, A, x, 8.5, 3.8); return; }
      if (kind === 'wood') {
        A.ink.push(tube(T, [[x, 14, 2.6], [x - 3, 8, 1.6], [x - 5.5, 4, 0.5]]));
        A.ink.push(tube(T, [[x, 14, 2.6], [x + 2.5, 7, 1.6], [x + 6, 3.5, 0.5]]));
        leaves(T, A, x - 6, 4.5, 3.2); leaves(T, A, x + 6.2, 4, 2.8);
        A.ink.push(ell(T, x, 9, 2.2, 2.2));
        A.carve.push(ell(T, x - 0.6, 8.4, 0.8, 0.8));
        return;
      }
      A.ink.push(ell(T, x, 8, 4.8, 4.8) + ' ' + ell(T, x, 8, 3.3, 3.3));
      A.ink.push(ell(T, x, 8, 2.3, 2.3));
      A.carve.push(ell(T, x - 0.8, 7.2, 0.8, 0.8));
      rays(T, A, x, 8, 6.2, 9, -PI, 0, 7);
    } },
    crook: { pose: 'hold', draw: function (T, g, x) {
      g.arms.ink.push(tube(T, [[x, 95, 2.4], [x, 20, 2.4], [x - 0.6, 12, 2.4], [x - 3.8, 7, 2.3], [x - 8.5, 7.5, 2.1], [x - 10.5, 11.5, 1.9], [x - 9.2, 15, 1.4]]));
      leaves(T, g.arms, x + 1.8, 24, 2.6);
    } },
    torch: { pose: 'up', draw: function (T, g, x, y) {
      var A = g.arms;
      A.ink.push(tube(T, [[x, y + 8, 2.4], [x, y - 4, 3.2]]));
      A.ink.push(ell(T, x, y - 4.5, 2.7, 1.8));
      A.ink.push(spl(T, [[x, y - 6], [x + 4.4, y - 8.5], [x + 5, y - 13], [x + 2.6, y - 16.5], [x + 3, y - 20.5, 1], [x - 0.3, y - 17.5], [x - 1.4, y - 23, 1], [x - 3.4, y - 17.5], [x - 5.2, y - 13], [x - 4.4, y - 8.5]]));
      A.carve.push(lens(T, [[x - 0.4, y - 8], [x + 0.8, y - 12], [x - 0.6, y - 17]], 2.2));
      A.carve.push(lens(T, [[x + 2.4, y - 9.5], [x + 2.9, y - 13.5]], 1));
    } },
    candle: { pose: 'up', draw: function (T, g, x, y) {
      var A = g.arms;
      A.ink.push(spl(T, [[x - 4, y - 2.5, 1], [x + 4, y - 2.5, 1], [x + 2.4, y + 1.5], [x - 2.4, y + 1.5]]));
      A.ink.push(tube(T, [[x, y - 2.5, 3], [x, y - 9, 2.8]]));
      A.carve.push(lens(T, [[x - 0.5, y - 8.5], [x - 0.6, y - 4]], 0.8));
      A.ink.push(spl(T, [[x, y - 10.3], [x + 1.9, y - 12.6], [x + 0.6, y - 16.8, 1], [x - 0.2, y - 14], [x - 1.9, y - 12.6]]));
      rays(T, A, x, y - 13, 5, 9, -PI * 1.1, PI * 0.1, 9);
    } },
    orb: { pose: 'up', draw: function (T, g, x, y) {
      var A = g.arms;
      A.ink.push(ell(T, x, y - 6, 4.8, 4.8));
      A.carve.push(lens(T, arc(x, y - 6, 3.3, PI * 0.7, PI * 1.6, 6), 1.7));
      rays(T, A, x, y - 6, 6.6, 10, -PI * 1.15, PI * 0.15, 10);
    } },
    shard: { pose: 'up', draw: function (T, g, x, y) {
      var A = g.arms;
      A.ink.push(spl(T, [[x, y - 15, 1], [x + 3.4, y - 8, 1], [x + 2, y - 1.5, 1], [x - 2.2, y - 1.5, 1], [x - 3.2, y - 8.5, 1]]));
      A.carve.push(lens(T, [[x - 0.2, y - 13.5], [x + 0.3, y - 3]], 0.9));
      A.carve.push(lens(T, [[x - 2.4, y - 8.4], [x + 2.7, y - 8]], 0.7));
      rays(T, A, x, y - 8, 6, 9.5, -PI * 1.1, PI * 0.1, 9);
    } },
    bow: { pose: 'out', draw: function (T, g, x, y) {
      var A = g.arms;
      A.ink.push(tube(T, [[x - 2.5, y - 25, 1], [x + 0.5, y - 19, 2], [x + 3, y - 8, 2.6], [x + 3.4, y, 3], [x + 3, y + 8, 2.6], [x + 0.5, y + 19, 2], [x - 2.5, y + 25, 1]]));
      A.ink.push(tube(T, [[x - 2.5, y - 25, 1], [x - 0.6, y - 28.5, 0.6]]));
      A.ink.push(tube(T, [[x - 2.5, y + 25, 1], [x - 0.6, y + 28.5, 0.6]]));
      A.ink.push(tube(T, [[x - 2.4, y - 24.5, 0.6], [x - 33, y - 1, 0.6]]));
      A.ink.push(tube(T, [[x - 33, y - 1, 0.6], [x - 2.4, y + 24.5, 0.6]]));
      A.ink.push(tube(T, [[x - 36, y - 1, 1], [x + 6, y - 0.6, 1]]));
      A.ink.push(spl(T, [[x + 12, y - 0.6, 1], [x + 5, y - 3.2, 1], [x + 6.5, y - 0.6], [x + 5, y + 2, 1]]));
      A.ink.push(spl(T, [[x - 36.5, y - 1, 1], [x - 31.5, y - 4.2, 1], [x - 29.5, y - 1, 1], [x - 31.5, y + 2.2, 1]]));
      A.carve.push(lens(T, [[x + 2.6, y - 6], [x + 3.4, y], [x + 2.6, y + 6]], 1));
    } },
    hammer: { pose: 'hold', draw: function (T, g, x, y) {
      var A = g.arms, O = orient(x, y, -PI / 2 + 0.12), p = O([-15.5, 0]);
      A.ink.push(tube(T, at(O, [[-14, 0, 2.7], [30, 0, 2.8]])));
      A.ink.push(ell(T, p[0], p[1], 2.4, 2.4));
      A.ink.push(spl(T, at(O, [[27, -9, 1], [38.5, -8, 1], [38.5, 6.5, 1], [27, 7.5, 1]])));
      A.ink.push(spl(T, at(O, [[29.5, -8.5, 1], [32.5, -15, 1], [35.5, -8.5, 1]])));
      A.carve.push(lens(T, at(O, [[29.2, -7], [29.2, 6]]), 1.3));
      A.carve.push(lens(T, at(O, [[36.4, -6.5], [36.4, 5]]), 1.3));
      A.carve.push(lens(T, at(O, [[-6, 0], [8, 0]]), 0.9));
    } },
    axe: { pose: 'hold', draw: function (T, g, x, y) { axeHead(T, g.arms, x, y, -PI / 2 + 0.15, 1); } },
    hatchet: { pose: 'ready', draw: function (T, g, x, y) { axeHead(T, g.arms, x, y, -PI / 2 + 0.5, 0.62); } },
    pick: { pose: 'hold', draw: function (T, g, x, y) {
      var A = g.arms, O = orient(x, y, -PI / 2 + 0.1);
      A.ink.push(tube(T, at(O, [[-12, 0, 2.4], [33, 0, 2.4]])));
      A.ink.push(spl(T, at(O, [[30, -15, 1], [33.2, -6], [35, 0], [33.2, 6], [30, 15, 1], [35, 6.5], [37.4, 0], [35, -6.5]])));
      A.carve.push(lens(T, at(O, [[34, -10], [36.2, 0], [34, 10]]), 0.9));
    } },
    claws: { pose: 'claw', draw: function (T, g, x, y) {
      for (var i = -1; i <= 1; i++) g.arms.ink.push(tube(T, [[x + i * 1.8, y, 1.7], [x + i * 3.2 + 1.5, y - 5, 1.2], [x + i * 4.2 + 3.6, y - 8.6, 0.2]]));
    } },
    bough: { pose: 'claw', draw: function (T, g, x, y) {
      var A = g.arms;
      A.ink.push(tube(T, [[x, y, 3], [x + 3, y - 7, 2.2], [x + 8, y - 11, 1.1]]));
      A.ink.push(tube(T, [[x + 1.5, y - 4, 1.8], [x - 3, y - 10, 0.7]]));
      leaves(T, A, x + 9, y - 12, 3.6); leaves(T, A, x - 3.5, y - 11.5, 3); leaves(T, A, x + 3, y - 14.5, 3);
    } },
    shield: { pose: 'guard', draw: function (T, g, x, y) {
      var O = g.over, c = x - 1, m = y + 2;
      var rim = [[c - 0.4, m - 12.7], [c - 9, m - 10.6], [c - 9.2, m - 2], [c - 6.3, m + 9], [c - 0.4, m + 16.6]];
      O.ink.push(spl(T, [[c - 10.5, m - 12], [c, m - 14.5], [c + 10.5, m - 12], [c + 10.8, m - 2], [c + 7.5, m + 10], [c, m + 19.5, 1], [c - 7.5, m + 10], [c - 10.8, m - 2]]));
      O.carve.push(lens(T, rim, 1.2)); O.carve.push(lens(T, flipX(c, rim), 1.2));
      O.carve.push(lens(T, [[c, m - 9.5], [c, m + 11.5]], 2.8));
      O.carve.push(lens(T, [[c - 6.8, m - 3.4], [c + 6.8, m - 3.4]], 2.8));
    } },
    round: { pose: 'guard', draw: function (T, g, x, y) {
      var O = g.over, c = x - 1, m = y + 2, q;
      O.ink.push(ell(T, c, m, 11.5, 11.5));
      for (q = 0; q < 4; q++) O.carve.push(lens(T, arc(c, m, 9.4, q * PI / 2 + 0.12, (q + 1) * PI / 2 - 0.12, 6), 1.3));
      for (q = 0; q < 2; q++) O.carve.push(lens(T, arc(c, m, 3.9, q * PI + 0.2, (q + 1) * PI - 0.2, 6), 1.1));
      for (q = 0; q < 8; q++) O.carve.push(ell(T, c + Math.cos(q * PI / 4 + 0.39) * 7, m + Math.sin(q * PI / 4 + 0.39) * 7, 0.55, 0.55));
      O.carve.push(ell(T, c - 1, m - 1, 0.9, 0.9));
    } },
    tower: { pose: 'guard', draw: function (T, g, x, y) {
      var O = g.over;
      O.ink.push(spl(T, [[x - 11, y - 22], [x, y - 25.5], [x + 11, y - 22], [x + 11, y + 33, 1], [x - 11, y + 33, 1]]));
      O.carve.push(lens(T, [[x - 9, y - 20], [x - 9, y + 31]], 1.2)); O.carve.push(lens(T, [[x + 9, y - 20], [x + 9, y + 31]], 1.2));
      O.carve.push(lens(T, [[x - 9, y - 21], [x, y - 23.6], [x + 9, y - 21]], 1.2));
      O.carve.push(star(T, x, y + 4, 7, 2, 4));
      O.ink2.push(ell(T, x, y + 4, 1.4, 1.4));
    } },
    book: { pose: 'chest', draw: function (T, g, x, y) {
      var O = g.over;
      O.ink.push(spl(T, [[x - 6.5, y - 6.5, 1], [x + 5.5, y - 7.5, 1], [x + 6.5, y + 5.5, 1], [x - 5.5, y + 6.5, 1]]));
      O.carve.push(lens(T, [[x + 5, y - 6], [x + 5.9, y + 4.6]], 1.4));
      O.carve.push(lens(T, [[x - 0.6, y - 4.5], [x - 0.2, y + 4]], 1.1));
      O.carve.push(lens(T, [[x - 3.4, y - 0.5], [x + 2.6, y - 0.8]], 1.1));
    } },
    scroll: { pose: 'chest', draw: function (T, g, x, y) {
      var O = g.over;
      O.ink.push(spl(T, [[x - 4.5, y + 1, 1], [x + 4.5, y + 1, 1], [x + 5, y + 14], [x + 4.2, y + 26, 1], [x - 4.8, y + 25, 1], [x - 4, y + 13]]));
      O.ink.push(tube(T, [[x - 6, y + 0.5, 2.6], [x + 6, y + 0.5, 2.6]]));
      O.ink.push(tube(T, [[x - 6.5, y + 25.5, 2.6], [x + 5.5, y + 26.5, 2.6]]));
      O.carve.push(spl(T, [[x - 3.4, y + 2.4, 1], [x + 3.4, y + 2.4, 1], [x + 3.9, y + 14], [x + 3.2, y + 24.4, 1], [x - 3.8, y + 23.6, 1], [x - 3, y + 13]]));
      for (var i = 0; i < 5; i++) O.ink2.push(lens(T, [[x - 2.6, y + 5.5 + i * 3.8], [x + 2.6 - (i % 2) * 1.4, y + 5.7 + i * 3.8]], 0.8));
    } },
    bomb: { pose: 'up', draw: function (T, g, x, y) {
      var A = g.arms;
      A.ink.push(ell(T, x + 1, y - 5.5, 6, 6));
      A.carve.push(lens(T, arc(x + 1, y - 5.5, 4.2, PI * 0.95, PI * 1.45, 5), 1.6));
      A.ink.push(tube(T, [[x + 4, y - 10.5, 1.6], [x + 6, y - 14, 1.3], [x + 9, y - 15.5, 1.1]]));
      A.ink.push(star(T, x + 10.5, y - 17, 3.6, 1.3, 6));
      A.carve.push(ell(T, x + 10.5, y - 17, 0.7, 0.7));
    } },
    drum: { pose: 'up', draw: function (T, g, x, y) {
      var O = g.over, i;
      O.ink.push(spl(T, [[37, 52], [50, 50.5], [63, 52], [64, 57], [62.5, 70, 1], [37.5, 70, 1], [36, 57]]));
      O.carve.push(lens(T, [[37.5, 53.6], [50, 56.6], [62.5, 53.6]], 1.6));
      O.carve.push(lens(T, [[38, 67.4], [50, 68.8], [62, 67.4]], 1.3));
      for (i = 0; i < 5; i++) O.carve.push(lens(T, [[40.5 + i * 4.2, i % 2 ? 66 : 58.5], [44.7 + i * 4.2, i % 2 ? 58.5 : 66]], 1.1));
      g.arms.ink.push(tube(T, [[x - 0.5, y + 3, 2.1], [x - 6.5, y - 11, 1.8]]));
      g.arms.ink.push(ell(T, x - 7, y - 12.5, 2.6, 2.6));
    } },
    cannon: { pose: 'ready', draw: function (T, g, x, y) {
      var A = g.arms, O = orient(x, y - 5.5, -0.46);
      A.ink.push(tube(T, at(O, [[-27, 0, 8.4], [17, 0, 7]])));
      A.ink.push(tube(T, at(O, [[16.5, -5.2, 2.6], [16.5, 5.2, 2.6]])));
      A.ink.push(tube(T, at(O, [[-27.5, -4.6, 2.4], [-27.5, 4.6, 2.4]])));
      A.carve.push(lens(T, at(O, [[-8, -3.6], [-8, 3.6]]), 1.2));
      A.carve.push(lens(T, at(O, [[4, -3.3], [4, 3.3]]), 1.2));
      A.carve.push(lens(T, at(O, [[-22, -2.3], [12, -2.1]]), 1));
      var p = O([22.5, 0]);
      A.ink.push(star(T, p[0], p[1], 5.2, 2.2, 7));
      A.carve.push(ell(T, p[0], p[1], 1.4, 1.4));
    } }
  };

  /* ---- capes, wings, rotors ---- */
  function cape(T, L, top, cw) {
    function q(x, y) { return [50 + (x - 50) * cw, y + top]; }
    L.ink.push(spl(T, [q(37, 0), q(63, 0), q(67, 14), q(72, 34), q(78, 54), [q(84, 71)[0], q(84, 71)[1], 1], q(74, 69), [q(66, 73)[0], q(66, 73)[1], 1], q(58, 68), [q(50, 72)[0], q(50, 72)[1], 1],
      q(42, 68), [q(33, 73)[0], q(33, 73)[1], 1], q(25, 69), [q(22, 70)[0], q(22, 70)[1], 1], q(26, 54), q(30, 34), q(33, 14)]));
    L.carve.push(lens(T, [q(66, 18), q(72, 40), q(78, 64)], 1.7));
    L.carve.push(lens(T, [q(34, 18), q(29, 40), q(26, 62)], 1.7));
    L.carve.push(lens(T, [q(70, 44), q(75, 66)], 1.2));
  }
  function feathers(T, L, s, w, a0, a1, l0, l1, n, fw) {
    // a row of feathers rooted along the wing arm s -> w, fanning from angle a0 to a1
    for (var i = 0; i < n; i++) {
      var t = i / (n - 1), rx = s[0] + (w[0] - s[0]) * t, ry = s[1] + (w[1] - s[1]) * t, a = a0 + (a1 - a0) * t, l = l0 + (l1 - l0) * t;
      var tx = rx + Math.cos(a) * l, ty = ry + Math.sin(a) * l, mx = rx + Math.cos(a + 0.08) * l * 0.55, my = ry + Math.sin(a + 0.08) * l * 0.55;
      L.ink.push(tube(T, [[rx, ry, fw], [mx, my, fw * 0.92], [tx, ty, 0.6]]));
      L.carve.push(lens(T, [[rx + Math.cos(a) * 2, ry + Math.sin(a) * 2], [mx, my], [rx + Math.cos(a) * l * 0.85, ry + Math.sin(a) * l * 0.85]], 0.6));
    }
  }
  function wing(T, L, kind) {
    if (kind === 'bat') {
      L.ink.push(spl(T, [[58, 31], [73, 15], [84, 6, 1], [99, 19, 1], [92.5, 25], [96, 35, 1], [89, 37], [86, 46, 1], [79.5, 42.5], [72, 47, 1], [66, 41], [60, 40]]));
      L.ink.push(tube(T, [[58, 27, 4], [73, 15, 3], [84, 6, 2.4]]));
      L.carve.push(lens(T, [[84.5, 8], [97, 18.6]], 1)); L.carve.push(lens(T, [[83.5, 9], [94.6, 33.6]], 1));
      L.carve.push(lens(T, [[82.5, 10], [86, 43.6]], 1)); L.carve.push(lens(T, [[80, 12], [72.4, 44.6]], 1));
      return;
    }
    L.ink.push(tube(T, [[57, 27, 7], [72, 15, 6], [86, 5, 4.4], [94, 2, 1.5]]));
    feathers(T, L, [60, 26], [86, 6], PI * 0.47, PI * 0.18, 20, 21, 7, 5.6);
    feathers(T, L, [86, 6], [93, 3], PI * 0.16, PI * 0.06, 19, 13, 3, 4.6);
    for (var i = 0; i < 4; i++) L.carve.push(lens(T, [[61 + i * 6.6, 23 - i * 5], [64.5 + i * 6.6, 26 - i * 5], [68 + i * 6.6, 23.6 - i * 5]], 1.1));
  }

  /* ---- people ---- */
  function figure(T, sp, g) {
    var bd = sp.build || 'man', B = BUILD[bd], P = POSE[bd];
    if (sp.s) T = place(T, sp.s, 0, 0);
    var M = mirror(T), rI = ITEM[sp.r], lI = ITEM[sp.l];
    var rp = rI ? rI.pose : 'down', lp = lI ? lI.pose : 'down';
    if (rI && rI.both) lp = rp;
    if (lI && lI.pose === 'out' && !rI) rp = 'draw';
    if (sp.wings) { wing(T, g.back, sp.wings); wing(M, g.back, sp.wings); }
    if (sp.cape) cape(T, g.back, bd === 'heavy' ? 27 : 21, bd === 'heavy' ? 1.3 : 1);
    if (sp.rotor) {
      g.far.ink.push(tube(T, [[57, 36, 2.6], [57, 6, 2.2]]));
      g.far.ink.push(lens(T, [[24, 7.5], [57, 5.5], [90, 3.5]], 3.6));
      g.far.ink.push(ell(T, 57, 5.6, 2.6, 2.2));
      g.far.carve.push(lens(T, [[30, 6.8], [44, 6]], 0.8)); g.far.carve.push(lens(T, [[70, 4.8], [84, 4]], 0.8));
    }
    if (bd === 'heavy') heavyBody(T, sp, g);
    else if (bd === 'bones') bonesBody(T, sp, g);
    else if (bd === 'tree') treeBody(T, sp, g);
    else manBody(T, sp, g);
    head(T, sp, g, B.head[0], B.head[1], B.head[2]);
    arm(T, sp, B, P[rp], g.arms, bd);
    arm(M, sp, B, P[lp], g.arms, bd);
    if (rI) rI.draw(T, g, P[rp][1][0], P[rp][1][1], sp);
    if (lI) lI.draw(M, g, P[lp][1][0], P[lp][1][1], sp);
  }

  /* ---- creatures ---- */
  function wolf(T, sp, g) {
    var F = g.far, L = g.body, i;
    F.ink.push(tube(T, [[68, 58, 7], [71, 72, 5], [72.5, 84, 4], [74, 92, 3.6]]));
    F.ink.push(tube(T, [[37, 58, 10], [42, 70, 6], [38, 82, 4.2], [40, 92, 3.6]]));
    F.ink.push(ell(T, 76, 93.6, 3.2, 1.9)); F.ink.push(ell(T, 41.5, 93.6, 3.2, 1.9));
    if (sp.spiky) {
      F.ink.push(tube(T, [[30, 53, 6], [19, 46, 4.4], [11, 37, 3], [9, 27, 1.4]]));
      F.ink.push(star(T, 9, 24, 4, 1.4, 3));
      for (i = 0; i < 3; i++) F.carve.push(lens(T, [[24 - i * 6, 47 - i * 6], [26 - i * 6, 52 - i * 6]], 0.9));
    } else {
      F.ink.push(spl(T, [[31, 50], [21, 44], [12, 37], [4, 33, 1], [8, 41], [15, 48], [24, 56], [31, 58]]));
      F.carve.push(lens(T, [[26, 50], [16, 43], [9, 37.5]], 1.2));
    }
    L.ink.push(spl(T, [[28, 54], [32, 47], [40, 44], [46, 41, 1], [49, 44], [53, 39, 1], [56, 43], [60, 38, 1], [63, 42], [70, 41], [74, 46], [75, 54], [70, 60], [60, 63], [46, 63], [36, 62], [29, 59]]));
    L.ink.push(tube(T, [[70, 50, 14], [76, 40, 11]]));
    L.ink.push(spl(T, [[71, 37], [76, 31], [83, 30.5], [89, 33.5], [97, 37.5, 1], [96.5, 40], [91, 40.5], [97, 42.6, 1], [92, 46], [84, 46], [77, 45]]));
    L.ink.push(spl(T, [[74.5, 33], [76, 23.5, 1], [81, 31]]));
    L.ink.push(spl(T, [[78.5, 32], [81, 24.5, 1], [84, 31.5]]));
    L.ink.push(tube(T, [[64, 56, 9], [65, 70, 6], [66, 83, 4.4], [67, 92, 4]]));
    L.ink.push(tube(T, [[34, 55, 13], [40, 68, 8], [33, 81, 4.6], [35, 92, 4]]));
    L.ink.push(ell(T, 69.4, 93.6, 3.7, 2.1)); L.ink.push(ell(T, 37.6, 93.6, 3.7, 2.1));
    L.carve.push(lens(T, [[80.5, 35.2], [84.8, 34.6]], 1.5));
    L.carve.push(poly(T, [[92.6, 40.4], [93.6, 43.3], [94.6, 40.6]]));
    L.carve.push(lens(T, [[76.4, 31], [77.2, 26]], 0.9));
    L.carve.push(lens(T, [[73, 38], [71, 46], [73, 52]], 1.4));
    L.carve.push(lens(T, [[60, 46], [64, 52], [63, 58]], 1.2));
    L.carve.push(lens(T, [[33, 54], [38, 62], [40, 68]], 1.3));
    L.carve.push(lens(T, [[46, 58.6], [58, 59.8]], 1));
    L.carve.push(lens(T, [[42, 47.5], [48, 50.5]], 1)); L.carve.push(lens(T, [[52, 46.5], [57, 49]], 1));
    if (sp.spiky) {
      var sp2 = [[44, 42, 41, 27], [52, 40, 51, 23], [60, 39, 62, 24], [67, 41, 71, 29]];
      for (i = 0; i < sp2.length; i++) L.ink.push(tube(T, [[sp2[i][0], sp2[i][1], 4], [sp2[i][2], sp2[i][3], 0.3]]));
      L.carve.push(ell(T, 87.5, 33.4, 0.7, 0.7)); L.carve.push(ell(T, 86, 36.6, 0.6, 0.6));
      for (i = 0; i < 3; i++) { L.ink.push(tube(T, [[66 + i * 1.6, 94.5, 1.2], [70 + i * 1.6, 97, 0.2]])); L.ink.push(tube(T, [[34 + i * 1.6, 94.5, 1.2], [38 + i * 1.6, 97, 0.2]])); }
    }
  }
  function stag(T, g) {
    var F = g.far, L = g.body;
    F.ink.push(tube(T, [[69, 58, 5.5], [71, 72, 3.5], [70.5, 85, 2.6], [71.5, 93, 2.5]]));
    F.ink.push(tube(T, [[39, 58, 8], [37, 71, 4.4], [41, 84, 2.8], [40, 93, 2.5]]));
    F.ink.push(poly(T, [[69.8, 92], [73.4, 92], [74, 95.6], [69.6, 95.6]])); F.ink.push(poly(T, [[38.4, 92], [42, 92], [42.6, 95.6], [38.2, 95.6]]));
    L.ink.push(spl(T, [[28, 54], [33, 48], [42, 45.5], [56, 45], [66, 45.5], [72, 49], [73.5, 57], [69, 63.5], [57, 66], [43, 66], [33, 64.5], [27.5, 60]]));
    L.ink.push(poly(T, [[28.5, 51], [23, 48.5], [27, 55.5]]));
    L.ink.push(tube(T, [[68, 52, 13], [74, 40, 9], [78, 31, 7.5]]));
    L.ink.push(spl(T, [[74, 27], [80, 24.5], [88, 28.5], [96, 33.5, 1], [96.3, 36.5], [92, 38.5], [84, 37.5], [77, 34.5]]));
    L.ink.push(spl(T, [[77, 26.5], [69.5, 21.5, 1], [76.5, 29.5]]));
    L.ink.push(tube(T, [[79.5, 25.5, 2.5], [76.5, 15, 2], [72, 8, 1.5], [71, 1.5, 0.6]]));
    L.ink.push(tube(T, [[76.8, 15.5, 1.6], [69.5, 12.5, 0.5]]));
    L.ink.push(tube(T, [[73.5, 10, 1.4], [77.5, 3.5, 0.5]]));
    L.ink.push(tube(T, [[82.5, 25.5, 2.4], [86, 15, 2], [91.5, 9, 1.5], [95, 3, 0.6]]));
    L.ink.push(tube(T, [[86, 16, 1.6], [92.5, 15.5, 0.5]]));
    L.ink.push(tube(T, [[89, 11.5, 1.3], [87.5, 4.5, 0.5]]));
    L.ink.push(tube(T, [[66, 58, 7], [67.5, 72, 4], [66.5, 85, 2.9], [67.5, 93, 2.7]]));
    L.ink.push(tube(T, [[35, 57, 10], [33, 71, 5], [37, 84, 3], [36, 93, 2.7]]));
    L.ink.push(poly(T, [[65.8, 92], [69.6, 92], [70.2, 95.8], [65.6, 95.8]])); L.ink.push(poly(T, [[34.2, 92], [38, 92], [38.6, 95.8], [34, 95.8]]));
    L.carve.push(ell(T, 83.4, 30.6, 1.1, 0.9));
    L.ink2.push(ell(T, 83.6, 30.7, 0.5, 0.5));
    L.carve.push(lens(T, [[71.5, 36], [69.5, 44], [70, 50]], 1.3));
    L.carve.push(lens(T, [[64, 49], [68.5, 55], [67, 61]], 1.3));
    L.carve.push(lens(T, [[33, 52], [37, 60], [36.5, 66]], 1.3));
    L.carve.push(lens(T, [[44, 61.5], [52, 63], [60, 62]], 1));
    L.carve.push(lens(T, [[44, 49], [52, 48]], 0.9));
    L.carve.push(lens(T, [[78.5, 21], [76, 13]], 0.7));
  }
  function hawk(T, g) {
    // a war-hawk seen from the side, wings raised, talons forward
    var F = g.far, B = g.back, L = g.body, i;
    F.ink.push(tube(T, [[60, 42, 6], [56, 26, 5], [52, 12, 3.4]]));
    feathers(T, F, [61, 41], [52, 13], PI * 1.0, PI * 1.22, 15, 25, 7, 5);
    B.ink.push(tube(T, [[52, 44, 7.5], [42, 26, 6.5], [32, 12, 4.4], [26, 6, 2]]));
    feathers(T, B, [53, 43], [33, 13], PI * 0.95, PI * 1.13, 17, 27, 8, 5.6);
    feathers(T, B, [32, 12], [27, 7], PI * 1.12, PI * 1.24, 24, 18, 3, 4.6);
    feathers(T, B, [29, 53], [27, 58], PI * 0.93, PI * 1.07, 22, 21, 5, 4.8);
    L.ink.push(spl(T, [[24, 54], [32, 47], [44, 43], [57, 40], [67, 37], [76, 38], [80, 45], [77, 54], [67, 60.5], [52, 62.5], [38, 61], [28, 59]]));
    L.ink.push(tube(T, [[70, 42, 9], [76, 36, 7]]));
    L.ink.push(spl(T, [[73, 35.5], [76, 31.5], [81, 29.6], [86, 30.2], [89, 32]]  .concat([[90.5, 34.6], [87, 37.4], [82, 39], [76.5, 39.6]])));
    L.ink.push(spl(T, [[86.5, 30.6], [91, 31.6], [94.4, 34.6], [95.4, 38.4, 1], [93, 36.2], [90, 35.4], [87.5, 36]]));
    L.carve.push(lens(T, [[79.6, 32.2], [83.2, 31], [86.8, 32]], 1.2));
    L.carve.push(ell(T, 84.2, 33.6, 1.3, 1.05));
    L.ink2.push(ell(T, 84.5, 33.7, 0.55, 0.55));
    L.carve.push(lens(T, [[87.6, 35.6], [91.4, 35.2]], 0.7));
    L.ink.push(tube(T, [[60, 58, 6], [64, 65, 3.4], [69, 69, 2.6]]));
    L.ink.push(tube(T, [[52, 59, 6], [55, 67, 3.4], [59, 71.5, 2.6]]));
    for (i = -1; i <= 1; i++) {
      L.ink.push(tube(T, [[69, 69, 1.6], [72 + i * 0.6, 71.5 + i * 2.2, 1], [73.5 + i * 0.4, 74 + i * 2.6, 0.2]]));
      L.ink.push(tube(T, [[59, 71.5, 1.6], [62 + i * 0.6, 74 + i * 2.2, 1], [63.5 + i * 0.4, 76.5 + i * 2.6, 0.2]]));
    }
    for (i = 0; i < 3; i++) {
      L.carve.push(lens(T, [[73 - i * 1.5, 44 + i * 4.4], [75.5 - i * 1.5, 46.4 + i * 4.4], [78 - i * 1.6, 44.2 + i * 4.4]], 1));
      L.carve.push(lens(T, [[66 - i * 1.5, 46 + i * 4.4], [68.5 - i * 1.5, 48.4 + i * 4.4], [71 - i * 1.6, 46.2 + i * 4.4]], 1));
    }
    L.carve.push(lens(T, [[30, 52], [46, 47], [60, 45]], 1.2));
    L.carve.push(lens(T, [[32, 57], [48, 58.6], [62, 56.5]], 1));
  }

  function roc(T, g) {
    var B = g.back, L = g.body, i;
    both(T, function (U) {
      B.ink.push(tube(U, [[58, 40, 8], [70, 30, 7], [82, 22, 5], [93, 19, 2]]));
      feathers(U, B, [60, 41], [83, 23], PI * 0.52, PI * 0.2, 22, 22, 8, 5.4);
      feathers(U, B, [83, 22], [92, 19], PI * 0.18, PI * 0.02, 20, 12, 3, 4.6);
    });
    feathers(T, B, [47, 66], [53, 66], PI * 0.62, PI * 0.38, 22, 22, 5, 5);
    L.ink.push(spl(T, [[50, 31], [57, 36], [60.5, 48], [58, 62], [54, 70], [46, 70], [42, 62], [39.5, 48], [43, 36]]));
    L.ink.push(spl(T, [[44, 31], [44.5, 24], [49.5, 20.5], [55, 21], [58.5, 25], [63, 29.5, 1], [58.5, 29.6], [56.5, 33], [50, 34.5]]));
    L.carve.push(ell(T, 53.8, 24.6, 1.3, 1.1));
    L.ink2.push(ell(T, 54.1, 24.6, 0.55, 0.55));
    L.carve.push(lens(T, [[57, 28.4], [61.8, 29.2]], 0.8));
    for (i = 0; i < 4; i++) {
      var y = 40 + i * 6;
      L.carve.push(lens(T, [[44 + i * 0.6, y], [47 + i * 0.6, y + 2.2], [50, y]], 1)); L.carve.push(lens(T, [[50, y], [53 - i * 0.6, y + 2.2], [56 - i * 0.6, y]], 1));
    }
    both(T, function (U) {
      L.ink.push(tube(U, [[46, 68, 4.2], [44.5, 78, 2.8]]));
      for (var j = -1; j <= 1; j++) L.ink.push(tube(U, [[44.5, 78, 1.5], [42.5 + j * 2.6, 82.5, 0.3]]));
    });
  }
  function moth(T, g) {
    var B = g.back, L = g.body;
    both(T, function (U) {
      B.ink.push(spl(U, [[48, 40], [40, 30], [28, 20], [14, 15], [5, 19], [3, 30], [8, 40], [20, 46], [36, 48], [47, 47]]));
      B.ink.push(spl(U, [[48, 50], [38, 52], [24, 58], [16, 68], [20, 80], [30, 84], [40, 76], [47, 62]]));
      B.carve.push(lens(U, [[46, 42], [30, 27], [14, 18.5]], 1.1));
      B.carve.push(lens(U, [[46, 43.5], [26, 34], [8, 30]], 1.1));
      B.carve.push(lens(U, [[46, 45.5], [26, 44], [11, 40]], 1.1));
      B.carve.push(lens(U, [[46, 54], [30, 62], [22, 74]], 1.1));
      B.carve.push(lens(U, [[46, 57], [37, 70], [31, 80]], 1.1));
      B.carve.push(ell(U, 24, 33, 5, 4.4));
      B.ink2.push(ell(U, 24, 33, 2.8, 2.5));
      B.carve.push(lens(U, [[7, 25], [9, 35], [15, 43]], 1.2));
      L.ink.push(tube(U, [[48.5, 33, 1.2], [44, 24, 1], [38, 15, 0.7]]));
      for (var i = 0; i < 4; i++) L.ink.push(lens(U, [[45 - i * 1.8, 22 - i * 2.4], [43 - i * 1.8, 20.5 - i * 2.4]], 0.8));
    });
    L.ink.push(ell(T, 50, 44, 4.6, 7));
    L.ink.push(spl(T, [[46, 50], [54, 50], [53.2, 66], [50, 77, 1], [46.8, 66]]));
    L.ink.push(ell(T, 50, 35, 3.6, 3.4));
    for (var j = 0; j < 4; j++) L.carve.push(lens(T, [[47 + j * 0.3, 55 + j * 5], [53 - j * 0.3, 55 + j * 5]], 0.9));
    L.carve.push(lens(T, [[48, 40], [49, 47]], 0.9));
    both(T, function (U) { L.carve.push(ell(U, 48.4, 34.4, 0.8, 0.8)); });
  }

  function golem(T, sp, g) {
    // a walking slab: small head sunk between boulder shoulders, a shard for a heart
    var F = g.far, B = g.body, A = g.arms, H = g.head, v = sp.golem, i;
    if (v === 'iron' || v === 'rig') {
      both(T, function (U) {
        F.ink.push(tube(U, [[37, 28, 5], [35, 10, 5.4]]));
        F.ink.push(tube(U, [[32.5, 9, 2.4], [37.5, 9, 2.4]]));
        F.carve.push(lens(U, [[34, 24], [33.6, 13]], 0.9));
      });
      F.ink.push(spl(T, [[28, 6], [31, 1], [36, 0.5], [40, 3], [44, 1.5], [47, 5], [43, 8], [36, 8.5], [31, 9]]));
    }
    if (v === 'crystal') {
      both(T, function (U) {
        F.ink.push(spl(U, [[19, 24, 1], [15, 2, 1], [27, 17, 1]]));
        F.ink.push(spl(U, [[27, 21, 1], [29, 4, 1], [34, 20, 1]]));
        F.carve.push(lens(U, [[17.5, 7], [21, 20]], 1));
        F.carve.push(lens(U, [[29.4, 8], [30.6, 19]], 0.9));
      });
      F.ink.push(spl(T, [[44, 22, 1], [50, 1, 1], [56, 22, 1]]));
      F.carve.push(lens(T, [[49.6, 6], [50.4, 20]], 1));
    }
    both(T, function (U) {
      B.ink.push(spl(U, [[35.5, 60], [48.5, 60], [48, 82], [50, 89], [49.5, 96.5, 1], [29.5, 96.5, 1], [30.5, 89], [33.5, 82]]));
      B.carve.push(lens(U, [[33.6, 77], [40.5, 78.6], [47.6, 77.4]], 1.3));
      B.carve.push(lens(U, [[31.5, 90.5], [40, 91.5], [48.5, 90.5]], 1));
    });
    B.ink.push(spl(T, [[30, 30], [40, 23], [60, 23], [70, 30], [73, 44], [67, 57], [62, 66], [38, 66], [33, 57], [27, 44]]));
    B.ink.push(spl(T, [[35, 58, 1], [65, 58, 1], [63.5, 69.5, 1], [36.5, 69.5, 1]]));
    B.carve.push(lens(T, [[36, 61.5], [50, 62.5], [64, 61.5]], 1.1));
    H.ink.push(spl(T, [[42, 12.5, 1], [58, 12.5, 1], [60.5, 20.5], [57, 27.5, 1], [43, 27.5, 1], [39.5, 20.5]]));
    both(T, function (U) { H.carve.push(lens(U, [[43, 19.4], [46.6, 20.6], [48.8, 20.1]], 1.8)); });
    H.carve.push(lens(T, [[42.6, 16], [50, 15.2], [57.4, 16]], 1));
    if (v === 'rig') {
      H.ink.push(spl(T, [[40, 22, 1], [60, 22, 1], [61, 30], [57, 33.5, 1], [43, 33.5, 1], [39, 30]]));
      for (i = 0; i < 5; i++) H.carve.push(poly(T, [[42.6 + i * 3.4, 24.5], [45.6 + i * 3.4, 24.5], [44.1 + i * 3.4, 28.5]]));
      H.carve.push(lens(T, [[42, 31], [50, 31.6], [58, 31]], 0.9));
    }
    both(T, function (U) {
      A.ink.push(spl(U, [[13.5, 28], [21.5, 19.5], [33, 20.5], [38.5, 30], [35, 38.5], [24, 40.5], [14.5, 36.5]]));
      A.ink.push(tube(U, [[25, 34, 13], [20, 50, 11.5], [21, 62, 12]]));
      A.carve.push(lens(U, [[16.5, 24.5], [25, 22.6], [33.5, 25.4]], 1.3));
      A.carve.push(lens(U, [[18.6, 46], [24, 47.5], [28, 46.6]], 1.1));
    });
    // fists; the siege-rig swaps its right fist for a ram
    A.ink.push(spl(T, [[13, 60], [21, 57], [29, 60], [30.5, 70], [26, 76], [16, 76], [12, 70]]));
    A.carve.push(lens(T, [[14.5, 66], [21, 64.5], [28.5, 66]], 1));
    A.carve.push(lens(T, [[18, 70.5], [24, 70]], 0.9));
    if (v === 'rig') {
      A.ink.push(tube(T, [[79, 58, 12], [83, 78, 11]]));
      A.ink.push(spl(T, [[74, 77, 1], [92, 77, 1], [94, 83], [92, 89, 1], [74, 89, 1], [72, 83]]));
      for (i = 0; i < 3; i++) A.carve.push(lens(T, [[75.5 + i * 0.2, 64 + i * 5], [86.5 + i * 0.4, 63 + i * 5]], 1.1));
      A.carve.push(lens(T, [[75, 83], [91.5, 83]], 1.2));
    } else {
      A.ink.push(spl(T, [[71, 60], [79, 57], [87, 60], [88, 70], [84, 76], [74, 76], [69.5, 70]]));
      A.carve.push(lens(T, [[71.5, 66], [79, 64.5], [85.5, 66]], 1));
      A.carve.push(lens(T, [[76, 70], [82, 70.5]], 0.9));
    }
    if (v === 'iron' || v === 'rig') {
      // a furnace grate where the heart should be
      B.carve.push(spl(T, [[42, 33, 1], [58, 33, 1], [58, 47, 1], [42, 47, 1]]));
      for (i = 0; i < 4; i++) B.ink2.push(lens(T, [[44.4 + i * 3.7, 33.6], [44.4 + i * 3.7, 46.4]], 1.5));
      B.carve.push(lens(T, [[31, 49], [50, 51.5], [69, 49]], 1.3));
      for (i = 0; i < 6; i++) { B.carve.push(ell(T, 34 + i * 6.4, 53.3, 0.65, 0.65)); B.carve.push(ell(T, 37 + i * 5.2, 27, 0.6, 0.6)); }
      B.carve.push(lens(T, [[37, 29.5], [36, 45]], 1));
      B.carve.push(lens(T, [[63, 29.5], [64, 45]], 1));
    } else {
      B.carve.push(star(T, 50, 40, 8, 2.6, 4));
      B.ink2.push(star(T, 50, 40, 3.4, 1.2, 4));
      B.carve.push(lens(T, [[35, 28], [39.6, 34], [37.5, 41], [40, 47]], 1.1));
      B.carve.push(lens(T, [[62, 47], [66, 52], [63.5, 58]], 1.1));
      B.carve.push(lens(T, [[30, 46.5], [36, 49.5]], 0.9));
      B.carve.push(lens(T, [[64, 32], [69.5, 36]], 0.9));
      B.carve.push(lens(T, [[45, 55], [47, 59.4]], 0.9));
    }
  }
  function wraith(T, g) {
    var B = g.back, L = g.body, A = g.arms, H = g.head;
    // a shade with no feet: the robe frays into smoke above the ground
    L.ink.push(tube(T, [[50, 18, 5], [50, 27, 6]]));
    L.ink.push(spl(T, [[39, 27], [50, 24], [61, 27], [65, 40], [68, 54], [74, 66], [80, 74, 1], [71, 71.5], [73, 84, 1], [64, 76.5], [61, 90, 1], [55, 78.5], [50, 92, 1], [45, 78.5], [39, 90, 1],
      [36, 76.5], [27, 84, 1], [29, 71.5], [20, 74, 1], [26, 66], [32, 54], [35, 40]]));
    L.carve.push(lens(T, [[45, 40], [43, 60], [40, 78]], 1.5));
    L.carve.push(lens(T, [[55, 40], [57, 60], [60, 76]], 1.5));
    L.carve.push(lens(T, [[50, 46], [50, 68], [50, 86]], 1.1));
    L.carve.push(lens(T, [[34, 58], [30, 68], [24, 74]], 1));
    L.carve.push(lens(T, [[66, 58], [70, 68], [76, 74]], 1));
    B.ink.push(lens(T, [[30, 82], [22, 88], [12, 89]], 2.6));
    B.ink.push(lens(T, [[70, 82], [78, 88], [88, 89]], 2.6));
    B.ink.push(lens(T, [[44, 86], [40, 93], [34, 95]], 2));
    B.ink.push(lens(T, [[56, 86], [60, 93], [66, 95]], 2));
    head(T, { head: 'hood' }, g, 50, 16, 8);
    H.carve.push(ell(T, 50, 21.6, 1.5, 2.5));
    both(T, function (U) {
      A.ink.push(tube(U, [[40, 30, 7.5], [30, 35, 6.5], [19, 29, 7.5]]));
      A.ink.push(spl(U, [[24, 26], [15.5, 26.5], [11, 36, 1], [15.5, 33.5], [16, 42, 1], [20.5, 35], [24, 40, 1], [25.5, 32.5]]));
      for (var i = 0; i < 3; i++) A.ink.push(tube(U, [[15, 27.5 + i * 1.2, 1.5], [9 - i * 0.6, 23 + i * 3.4, 1], [4 - i * 1.4, 21 + i * 5, 0.2]]));
      A.carve.push(lens(U, [[36, 32], [30, 34.5], [22, 31]], 1));
    });
  }
  function scalesAlong(T, L, pts, step, w) {
    var c = curve(pts, 6);
    for (var i = step; i < c.length - 2; i += step) {
      var a = c[i - 1], b = c[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.sqrt(dx * dx + dy * dy) || 1, tx = dx / d, ty = dy / d, p = c[i];
      L.carve.push(lens(T, [[p[0] - tx * 1.3 - ty * w, p[1] - ty * 1.3 + tx * w], [p[0] + tx * 0.5, p[1] + ty * 0.5], [p[0] - tx * 1.3 + ty * w, p[1] - ty * 1.3 - tx * w]], 0.9));
    }
  }
  function serpent(T, g) {
    var F = g.far, L = g.body, H = g.head;
    var coil = [[58, 84, 9], [74, 86, 9], [80, 91, 8], [70, 95.5, 7.5], [48, 96, 8], [28, 94.5, 8], [17, 89, 7], [22, 83, 5.6], [34, 82.5, 4.4], [42, 86, 2.6], [44, 90, 0.4]];
    var neck = [[22, 90, 8], [34, 86, 9.2], [50, 84, 9.6], [62, 80, 9.6], [66, 72, 9.2], [58, 66, 8.6], [46, 62, 8.2], [40, 54, 7.6], [44, 44, 7.2], [54, 38, 6.6], [60, 30, 6.2], [62, 23, 6]];
    F.ink.push(tube(T, coil));
    scalesAlong(T, F, coil, 3, 2.4);
    L.ink.push(tube(T, neck));
    scalesAlong(T, L, neck, 3, 2.6);
    L.carve.push(lens(T, [[65, 70], [59, 64.5], [47, 60]], 1.1));
    H.ink.push(spl(T, [[56, 22], [58, 15], [64, 11], [72, 10], [80, 12], [87.5, 16, 1], [82, 18.4], [87.5, 22, 1], [79, 25.5], [70, 27], [61, 27]]));
    H.carve.push(ell(T, 72, 14.8, 1.7, 1.35));
    H.ink2.push(lens(T, [[72.1, 13.6], [72.1, 16]], 0.6));
    H.carve.push(lens(T, [[65.5, 12.6], [71, 11.9], [75.5, 12.7]], 1));
    H.carve.push(poly(T, [[82.4, 18.1], [83.2, 21], [84, 17.7]]));
    H.carve.push(lens(T, [[62, 24.5], [70, 25.2], [78, 23.6]], 0.9));
    H.ink.push(tube(T, [[83, 19.8, 1], [92, 20, 0.8]]));
    H.ink.push(tube(T, [[92, 20, 0.8], [96, 17.8, 0.2]]));
    H.ink.push(tube(T, [[92, 20, 0.8], [96, 22.4, 0.2]]));
  }
  function membrane(T, L, root, sh, el, wr, tips) {
    // a bat-like wing: a bone arm, then skin scalloped between the finger tips
    var pts = [[root[0], root[1]], [sh[0], sh[1]], [el[0], el[1]], [wr[0], wr[1], 1]], i;
    L.ink.push(tube(T, [[sh[0], sh[1], 6], [el[0], el[1], 4.4], [wr[0], wr[1], 3]]));
    for (i = 0; i < tips.length; i++) {
      var nx = i + 1 < tips.length ? tips[i + 1] : root, mx = (tips[i][0] + nx[0]) / 2, my = (tips[i][1] + nx[1]) / 2;
      pts.push([tips[i][0], tips[i][1], 1]);
      pts.push([mx + (wr[0] - mx) * 0.22, my + (wr[1] - my) * 0.22]);
      L.ink.push(tube(T, [[wr[0], wr[1], 2.4], [tips[i][0], tips[i][1], 0.6]]));
      L.carve.push(lens(T, [[wr[0] + (tips[i][0] - wr[0]) * 0.12, wr[1] + (tips[i][1] - wr[1]) * 0.12], [tips[i][0] + (wr[0] - tips[i][0]) * 0.08, tips[i][1] + (wr[1] - tips[i][1]) * 0.08]], 0.9));
    }
    L.ink.push(spl(T, pts));
    L.carve.push(lens(T, [[sh[0], sh[1]], [el[0], el[1]], [wr[0], wr[1]]], 1));
  }
  function drake(T, g) {
    var F = g.far, B = g.back, L = g.body, H = g.head, i;
    membrane(T, F, [62, 50], [60, 42], [68, 22], [74, 8], [[90, 1], [99, 10], [97, 24], [88, 31]]);
    membrane(T, B, [44, 52], [50, 44], [36, 26], [28, 10], [[5, 4], [1, 20], [7, 34], [20, 43]]);
    F.ink.push(tube(T, [[50, 66, 11], [58, 78, 7], [54, 90, 5]]));
    F.ink.push(tube(T, [[64, 56, 6], [74, 61, 4.5], [81, 55, 3.4]]));
    for (i = -1; i <= 1; i++) F.ink.push(tube(T, [[81, 55, 1.6], [84 + i * 0.6, 52.5 + i * 2.6, 0.2]]));
    L.ink.push(tube(T, [[36, 66, 13], [24, 76, 9.5], [16, 86, 7], [22, 93, 5], [36, 95, 3.4], [46, 94.5, 1.6]]));
    L.ink.push(spl(T, [[44, 93.5], [51, 89, 1], [49.5, 93.8], [53.5, 96.4, 1], [46, 96.6]]));
    L.ink.push(spl(T, [[30, 62], [36, 52], [46, 46], [58, 44], [66, 50], [66, 62], [58, 71], [44, 73], [34, 70]]));
    L.ink.push(tube(T, [[58, 50, 15], [65, 38, 11.5], [68, 28, 9.5], [72, 20, 8.5]]));
    var spines = [[61, 41], [63.5, 33], [66.5, 26], [53, 44.5], [45, 46.5], [37.5, 51.5], [30, 58]];
    for (i = 0; i < spines.length; i++) L.ink.push(poly(T, [[spines[i][0] + 2, spines[i][1] + 0.5], [spines[i][0] - 3.5, spines[i][1] - 4], [spines[i][0] - 1.5, spines[i][1] + 1.2]]));
    L.ink.push(tube(T, [[42, 64, 15], [52, 74, 10], [46, 86, 6.5], [48, 91.5, 5]]));
    L.ink.push(spl(T, [[42.5, 89.5], [51.5, 89.5], [56.5, 93], [58, 96.5, 1], [41, 96.5, 1]]));
    for (i = 0; i < 3; i++) L.ink.push(tube(T, [[52 + i * 2.6, 95, 1.4], [55 + i * 2.6, 97.4, 0.2]]));
    L.ink.push(tube(T, [[60, 58, 7.5], [70, 64, 5.5], [78, 58, 4]]));
    for (i = -1; i <= 1; i++) L.ink.push(tube(T, [[78, 58, 1.8], [81.5 + i * 0.8, 55 + i * 2.8, 0.2]]));
    for (i = 0; i < 6; i++) {
      var t = i / 5, cx = 63 + (74 - 63) * t, cy = 56 + (27 - 56) * t;
      L.carve.push(lens(T, [[cx - 2.6, cy - 1], [cx + 0.2, cy + 0.6], [cx + 2.8, cy - 0.4]], 1));
    }
    L.carve.push(lens(T, [[42, 67], [44, 71.5]], 1));
    L.carve.push(lens(T, [[48, 67.5], [50, 72]], 1));
    L.carve.push(lens(T, [[54, 66], [56, 70]], 1));
    L.carve.push(lens(T, [[38, 64], [46, 70], [50, 77]], 1.2));
    L.carve.push(lens(T, [[28, 74], [20, 84], [20, 90]], 1));
    H.ink.push(spl(T, [[66, 18], [70, 12], [78, 9.5], [86, 11], [94, 14.5], [99, 17.5, 1], [94, 19.5], [89, 19.8], [96, 24, 1], [88, 26.5], [78, 26], [70, 24]]));
    H.ink.push(tube(T, [[72, 12, 3.6], [66, 6, 2.3], [57.5, 4, 0.3]]));
    H.ink.push(tube(T, [[77, 10.5, 3.2], [74, 3.5, 1.9], [67.5, 0, 0.3]]));
    H.ink.push(poly(T, [[72, 24.5], [69, 30.5], [76.5, 26]]));
    H.ink.push(poly(T, [[78, 26], [77, 31], [82, 26.5]]));
    H.carve.push(lens(T, [[79.6, 14.8], [82.4, 13.6], [85, 14.2]], 1.7));
    H.ink2.push(ell(T, 82.6, 14.2, 0.55, 0.7));
    H.carve.push(ell(T, 95.5, 15.8, 0.7, 0.5));
    H.carve.push(poly(T, [[89.6, 19.8], [90.6, 22], [91.6, 19.7]]));
    H.carve.push(poly(T, [[92.8, 19.6], [93.8, 21.6], [94.8, 19.4]]));
    H.carve.push(lens(T, [[72, 22], [80, 23.6], [88, 22.4]], 0.9));
  }

  function build(sp) {
    var out = [], g;
    if (sp.kind === 'choir') {
      var monk = { dress: 'robe', head: 'hood', l: 'book' };
      g = rig(); figure(place(ID, 0.62, -25, -3), monk, g); out = out.concat(flat(g));
      g = rig(); figure(place(ID, 0.62, 25, -3), monk, g); out = out.concat(flat(g));
      g = rig(); figure(place(ID, 0.74, 0, 0), { dress: 'robe', head: 'hood', r: 'candle', l: 'book' }, g); out = out.concat(flat(g));
      return out;
    }
    g = rig();
    if (sp.kind === 'wolf') wolf(ID, sp, g);
    else if (sp.kind === 'stag') stag(ID, g);
    else if (sp.kind === 'hawk') hawk(ID, g);
    else if (sp.kind === 'roc') roc(ID, g);
    else if (sp.kind === 'moth') moth(ID, g);
    else if (sp.kind === 'wraith') wraith(ID, g);
    else if (sp.kind === 'serpent') serpent(ID, g);
    else if (sp.kind === 'drake') drake(ID, g);
    else if (sp.kind === 'golem') golem(ID, sp, g);
    else figure(ID, sp, g);
    out = flat(g);
    if (sp.rider) {
      g = rig();
      figure(sp.kind === 'hawk' ? place(ID, 0.5, 0, -34) : place(ID, 0.5, 2, -35), sp.rider, g);
      out = out.concat(flat(g));
    }
    return out;
  }

  return { build: build };
})();

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

  function toPaths(list) { return list.map(function (d) { return new Path2D(d); }); }
  function figLayers(id) {
    var key = 'fig_' + id;
    if (!paths[key]) {
      paths[key] = Fig.build(FIG[id]).filter(function (L) { return L.ink.length; }).map(function (L) {
        return { ink: toPaths(L.ink), carve: toPaths(L.carve), ink2: toPaths(L.ink2) };
      });
    }
    return paths[key];
  }

  // paper lines cut across a whole canvas; used through a mask
  function engraveLines(c, W, H, R, gap, lw, dir) {
    c.strokeStyle = PAPER; c.lineWidth = lw; c.lineCap = 'round';
    c.beginPath();
    for (var t = -H; t < W + H; t += gap * (0.8 + R() * 0.4)) {
      var y = -4;
      while (y < H + 4) {
        var l = 5 + R() * 18;
        c.moveTo(t + y * 0.42 * dir, y); c.lineTo(t + (y + l) * 0.42 * dir, y + l);
        y += l + 1 + R() * 2.5;
      }
    }
    c.stroke();
  }
  // the engraving texture is drawn once per size and reused through masks
  var hatchCache = {};
  function hatchCanvas(W, H, j, dir) {
    var key = W + 'x' + H + ':' + j + ':' + dir;
    if (!hatchCache[key]) {
      var k = W / 420, cv = mk(W + 48, H);
      engraveLines(cv.getContext('2d'), W + 48, H, rng(911 + j * 31 + (dir > 0 ? 0 : 7)), [2.1, 3.2, 4.8][j] * k, [1.1, 0.95, 0.8][j] * k, dir);
      hatchCache[key] = cv;
    }
    return hatchCache[key];
  }

  // A figure stands on the foreground. Each layer gets a paper outline, then
  // engraved light along the edges that face the star (denser near the edge),
  // then its carved detail.
  function figureArt(ctx, c, W, H, R, sx) {
    var layers = figLayers(c.id), k = W / 420, sc = H * 0.95 / 100;
    var ox = W / 2 - 50 * sc, oy = H * 0.985 - 96 * sc, dir = sx < W / 2 ? 1 : -1, i, j, q;
    var mask = mk(W, H), mc = mask.getContext('2d'), band = mk(W, H), bc = band.getContext('2d');
    for (i = 0; i < layers.length; i++) {
      var L = layers[i];
      ctx.save();
      ctx.setTransform(sc, 0, 0, sc, ox, oy);
      ctx.lineJoin = 'round'; ctx.strokeStyle = PAPER; ctx.lineWidth = 3.4 * k / sc;
      for (q = 0; q < L.ink.length; q++) ctx.stroke(L.ink[q]);
      ctx.fillStyle = INK;
      for (q = 0; q < L.ink.length; q++) ctx.fill(L.ink[q], 'evenodd');
      ctx.restore();
      mc.setTransform(1, 0, 0, 1, 0, 0); mc.clearRect(0, 0, W, H);
      mc.setTransform(sc, 0, 0, sc, ox, oy); mc.fillStyle = INK;
      for (q = 0; q < L.ink.length; q++) mc.fill(L.ink[q], 'evenodd');
      mc.setTransform(1, 0, 0, 1, 0, 0);
      for (j = 0; j < 3; j++) {
        var d = [2.2, 5.5, 10][j] * k;
        bc.globalCompositeOperation = 'source-over';
        bc.clearRect(0, 0, W, H);
        bc.drawImage(mask, 0, 0);
        bc.globalCompositeOperation = 'destination-out';
        bc.drawImage(mask, dir * d, d * 0.75);
        bc.globalCompositeOperation = 'source-in';
        bc.drawImage(hatchCanvas(W, H, j, dir), -Math.floor(R() * 48), 0);
        ctx.drawImage(band, 0, 0);
      }
      ctx.save();
      ctx.setTransform(sc, 0, 0, sc, ox, oy);
      ctx.fillStyle = PAPER;
      for (q = 0; q < L.carve.length; q++) ctx.fill(L.carve[q], 'evenodd');
      ctx.fillStyle = INK;
      for (q = 0; q < L.ink2.length; q++) ctx.fill(L.ink2[q], 'evenodd');
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
    if (c.type === 'unit' && FIG.hasOwnProperty(c.id)) figureArt(ctx, c, W, H, R, sx);
    else subject(ctx, c, W, H, R);
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
