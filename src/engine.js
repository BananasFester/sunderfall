/* ============================================================
   SUNDERFALL - rules engine
   Pure state + actions. Deterministic given the seed, so the same
   module can later run server-side as the authority for PvP.
   ============================================================ */

var RULES = { life: 20, maxShards: 10, boardMax: 6, handMax: 9, deckSize: 30, firstHand: 4, secondHand: 5, maxBanners: 2 };
var CHOOSE_T = { any: 1, enemyAny: 1, unit: 1, enemyUnit: 1, friendlyUnit: 1, otherFriendly: 1 };

/* ---------- seeded random ---------- */
function rngNext(s) {
  var t = (s.seed = (s.seed + 0x6D2B79F5) | 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function rngInt(s, n) { return Math.floor(rngNext(s) * n); }
function shuffleIn(s, arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = rngInt(s, i + 1);
    var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}

function logMsg(s, msg) {
  s.log.push(msg);
  if (s.log.length > 80) s.log.shift();
}
function fx(s, ev) { if (s.fx) s.fx.push(ev); }

/* ---------- setup ---------- */
function newGame(o) {
  var s = {
    seed: (o.seed >>> 0) || 1, turn: 0, active: 0, phase: 'mulligan', uid: 1,
    log: [], fx: [], winner: -1, attacked: false, combat: null, players: [], first: 0
  };
  for (var p = 0; p < 2; p++) {
    var life = (o.lives && o.lives[p]) || RULES.life;
    s.players.push({
      name: o.names ? o.names[p] : ('Player ' + (p + 1)),
      life: life, maxLife: life, maxShards: 0, shards: 0,
      deck: shuffleIn(s, o.decks[p].slice()), hand: [], board: [], grave: [],
      deadUnits: [], fatigue: 0, mulled: false
    });
  }
  s.first = (o.first === 0 || o.first === 1) ? o.first : rngInt(s, 2);
  s.active = s.first;
  drawCards(s, s.first, RULES.firstHand, true);
  drawCards(s, 1 - s.first, RULES.secondHand, true);
  return s;
}

function mulligan(s, p, uids) {
  if (s.phase !== 'mulligan') return false;
  var P = s.players[p];
  if (P.mulled) return false;
  var n = 0;
  uids = uids || [];
  for (var i = 0; i < uids.length; i++) {
    var idx = handIndex(P, uids[i]);
    if (idx < 0) continue;
    P.deck.push(P.hand[idx].id);
    P.hand.splice(idx, 1);
    n++;
  }
  if (n > 0) { shuffleIn(s, P.deck); drawCards(s, p, n, true); }
  P.mulled = true;
  if (s.players[0].mulled && s.players[1].mulled) beginGame(s);
  return true;
}

function beginGame(s) {
  var second = s.players[1 - s.first];
  second.hand.push({ uid: s.uid++, id: 't_spark' });
  logMsg(s, s.players[s.first].name + ' goes first.');
  startTurn(s, s.first);
}

function handIndex(P, uid) {
  for (var i = 0; i < P.hand.length; i++) if (P.hand[i].uid === uid) return i;
  return -1;
}

/* ---------- lookups ---------- */
function findUnit(s, uid) {
  for (var p = 0; p < 2; p++) {
    var b = s.players[p].board;
    for (var i = 0; i < b.length; i++) if (b[i].uid === uid) return b[i];
  }
  return null;
}

function auraOf(s, u) {
  var a = 0, h = 0, kw = null;
  var b = s.players[u.owner].board;
  for (var i = 0; i < b.length; i++) {
    var v = b[i];
    if (v === u) continue;
    var au = CARD[v.id].aura;
    if (!au || au.who !== 'otherFriendly') continue;
    a += au.atk || 0; h += au.hp || 0;
    if (au.kw) { if (!kw) kw = {}; kw[au.kw] = 1; }
  }
  return { a: a, h: h, kw: kw };
}
function atkOf(s, u) { return Math.max(0, u.atk + u.tmp + auraOf(s, u).a); }
function maxHpOf(s, u) { return u.hp + auraOf(s, u).h; }
function healthOf(s, u) { return maxHpOf(s, u) - u.dmg; }
function hasKw(s, u, k) {
  if (u.kw[k]) return true;
  var au = auraOf(s, u);
  return !!(au.kw && au.kw[k]);
}

function makeUnit(s, p, id) {
  var c = CARD[id], kw = {};
  for (var i = 0; i < c.kw.length; i++) kw[c.kw[i]] = 1;
  return { uid: s.uid++, id: id, owner: p, atk: c.atk, hp: c.hp, dmg: 0, tmp: 0, kw: kw, sick: true, exhausted: false, doomed: false };
}

/* ---------- drawing ---------- */
function drawCards(s, p, n, quiet) {
  var P = s.players[p];
  for (var i = 0; i < n; i++) {
    if (!P.deck.length) {
      P.fatigue++;
      P.life -= P.fatigue;
      logMsg(s, P.name + ' has no cards left and takes ' + P.fatigue + ' fatigue damage.');
      fx(s, { k: 'dmg', ref: { k: 'w', p: p }, n: P.fatigue });
      continue;
    }
    var id = P.deck.pop();
    if (P.hand.length >= RULES.handMax) {
      P.grave.push(id);
      logMsg(s, P.name + '\'s hand is full. ' + CARD[id].name + ' burns away.');
      fx(s, { k: 'burn', p: p, id: id });
      continue;
    }
    var card = { uid: s.uid++, id: id };
    P.hand.push(card);
    if (!quiet) fx(s, { k: 'draw', p: p, uid: card.uid });
  }
}

/* ---------- turn flow ---------- */
function startTurn(s, p) {
  s.active = p; s.turn++; s.attacked = false; s.combat = null; s.phase = 'main';
  var P = s.players[p];
  P.maxShards = Math.min(RULES.maxShards, P.maxShards + 1);
  P.shards = P.maxShards;
  for (var i = 0; i < P.board.length; i++) { P.board[i].exhausted = false; P.board[i].sick = false; }
  fx(s, { k: 'turn', p: p });
  drawCards(s, p, 1);
  fireBoard(s, p, 'dawn');
  checkState(s);
}

function endTurn(s, p) {
  if (s.phase !== 'main' || s.active !== p) return false;
  fireBoard(s, p, 'dusk');
  checkState(s);
  if (s.phase === 'over') return true;
  for (var q = 0; q < 2; q++) {
    var b = s.players[q].board;
    for (var i = 0; i < b.length; i++) { b[i].dmg = 0; b[i].tmp = 0; }
    if (s.players[q].shards > s.players[q].maxShards) s.players[q].shards = s.players[q].maxShards;
  }
  startTurn(s, 1 - p);
  return true;
}

function fireBoard(s, p, on) {
  var list = s.players[p].board.slice();
  for (var i = 0; i < list.length; i++) {
    var u = list[i];
    if (!findUnit(s, u.uid)) continue;
    runFx(s, p, CARD[u.id], on, { src: u.uid });
  }
}

/* ---------- targeting ---------- */
function passFilter(s, u, f) {
  if (!f) return true;
  if (f.maxAtk !== undefined && atkOf(s, u) > f.maxAtk) return false;
  if (f.maxHp !== undefined && healthOf(s, u) > f.maxHp) return false;
  return true;
}

function chooseSpec(c) {
  for (var i = 0; i < c.fx.length; i++) {
    var e = c.fx[i];
    if ((e.on === 'deploy' || e.on === 'cast') && CHOOSE_T[e.t]) return e;
  }
  return null;
}

function targetOptions(s, p, spec, srcUid) {
  var out = [], e = 1 - p;
  function units(pl, excludeSrc) {
    var b = s.players[pl].board;
    for (var i = 0; i < b.length; i++) {
      var u = b[i];
      if (excludeSrc && u.uid === srcUid) continue;
      if (pl !== p && hasKw(s, u, 'warded')) continue;
      if (!passFilter(s, u, spec.f)) continue;
      out.push({ k: 'u', uid: u.uid });
    }
  }
  switch (spec.t) {
    case 'any': units(e); units(p); out.push({ k: 'w', p: e }); out.push({ k: 'w', p: p }); break;
    case 'enemyAny': units(e); out.push({ k: 'w', p: e }); break;
    case 'unit': units(e); units(p); break;
    case 'enemyUnit': units(e); break;
    case 'friendlyUnit': units(p); break;
    case 'otherFriendly': units(p, true); break;
  }
  return out;
}

function sameRef(a, b) {
  if (!a || !b || a.k !== b.k) return false;
  return a.k === 'u' ? a.uid === b.uid : a.p === b.p;
}

function playOptions(s, p, handUid) {
  var P = s.players[p];
  var idx = handIndex(P, handUid);
  if (idx < 0) return null;
  var c = CARD[P.hand[idx].id];
  var spec = chooseSpec(c);
  if (!spec) return null;
  return targetOptions(s, p, spec, -1);
}

/* reason string when a card cannot be played now, or '' when it can */
function playBlocker(s, p, handUid) {
  if (s.phase !== 'main') return s.phase === 'over' ? 'The battle is over' : 'Not now';
  if (s.active !== p) return 'Not your turn';
  var P = s.players[p];
  var idx = handIndex(P, handUid);
  if (idx < 0) return 'Card not in hand';
  var c = CARD[P.hand[idx].id];
  if (c.cost > P.shards) return 'Needs ' + c.cost + ' Shard' + (c.cost === 1 ? '' : 's');
  if (c.type === 'unit' && P.board.length >= RULES.boardMax) return 'Your battlefield is full';
  if (c.type === 'spell') {
    var spec = chooseSpec(c);
    if (spec && !targetOptions(s, p, spec, -1).length) return 'No valid targets';
  }
  return '';
}

function playCard(s, p, handUid, target) {
  if (playBlocker(s, p, handUid)) return false;
  var P = s.players[p];
  var idx = handIndex(P, handUid);
  var inst = P.hand[idx];
  var c = CARD[inst.id];
  var spec = chooseSpec(c);
  if (spec) {
    var opts = targetOptions(s, p, spec, -1);
    if (opts.length) {
      var ok = false;
      for (var i = 0; i < opts.length; i++) if (sameRef(opts[i], target)) ok = true;
      if (!ok) return false;
    } else {
      target = null;
    }
  } else {
    target = null;
  }
  P.shards -= c.cost;
  P.hand.splice(idx, 1);
  logMsg(s, P.name + ' plays ' + c.name + '.');
  if (c.type === 'unit') {
    var u = makeUnit(s, p, c.id);
    P.board.push(u);
    fx(s, { k: 'play', p: p, id: c.id, uid: u.uid });
    fx(s, { k: 'spawn', uid: u.uid });
    runFx(s, p, c, 'deploy', { src: u.uid, target: target });
  } else {
    if (!c.token) P.grave.push(c.id);
    fx(s, { k: 'play', p: p, id: c.id });
    runFx(s, p, c, 'cast', { target: target });
    checkDeaths(s);
    fireBoard(s, p, 'spell');
  }
  checkState(s);
  return true;
}

/* ---------- effects ---------- */
function runFx(s, p, c, on, ctx) {
  for (var i = 0; i < c.fx.length; i++) {
    var e = c.fx[i];
    if (e.on !== on) continue;
    if (s.phase === 'over') return;
    applyEffect(s, p, e, ctx);
  }
}

function pick(s, list) { return list.length ? [list[rngInt(s, list.length)]] : []; }

function resolveTargets(s, p, e, ctx) {
  var out = [], en = 1 - p;
  function unitsOf(pl, exclude) {
    var r = [], bb = s.players[pl].board;
    for (var j = 0; j < bb.length; j++) {
      if (exclude && bb[j].uid === exclude) continue;
      if (!passFilter(s, bb[j], e.f)) continue;
      r.push({ k: 'u', uid: bb[j].uid });
    }
    return r;
  }
  if (CHOOSE_T[e.t] || e.t === 'it') return ctx.target ? [ctx.target] : [];
  switch (e.t) {
    case 'self': return ctx.src && findUnit(s, ctx.src) ? [{ k: 'u', uid: ctx.src }] : [];
    case 'myWarden': return [{ k: 'w', p: p }];
    case 'enemyWarden': return [{ k: 'w', p: en }];
    case 'allEnemyUnits': return unitsOf(en);
    case 'allUnits': return unitsOf(en).concat(unitsOf(p));
    case 'allOtherUnits': return unitsOf(en, ctx.src).concat(unitsOf(p, ctx.src));
    case 'allFriendlyUnits': return unitsOf(p);
    case 'otherFriendlyUnits': return unitsOf(p, ctx.src);
    case 'randomEnemy': out = unitsOf(en); out.push({ k: 'w', p: en }); return pick(s, out);
    case 'randomEnemyUnit': return pick(s, unitsOf(en));
    case 'randomOtherFriendly': return pick(s, unitsOf(p, ctx.src));
    case 'randomFriendly': return pick(s, unitsOf(p));
  }
  return out;
}

function dealDamage(s, ref, n, srcUnit) {
  if (n <= 0) return 0;
  if (ref.k === 'w') {
    s.players[ref.p].life -= n;
    fx(s, { k: 'dmg', ref: ref, n: n });
    return n;
  }
  var u = findUnit(s, ref.uid);
  if (!u) return 0;
  if (u.kw.shielded) {
    delete u.kw.shielded;
    fx(s, { k: 'shieldpop', uid: u.uid });
    return 0;
  }
  u.dmg += n;
  fx(s, { k: 'dmg', ref: ref, n: n });
  if (srcUnit && hasKw(s, srcUnit, 'venom')) u.doomed = true;
  return n;
}

function healRef(s, ref, n) {
  if (n <= 0) return;
  if (ref.k === 'w') {
    var P = s.players[ref.p];
    var before = P.life;
    P.life = Math.min(P.maxLife, P.life + n);
    if (P.life > before) fx(s, { k: 'heal', ref: ref, n: P.life - before });
    return;
  }
  var u = findUnit(s, ref.uid);
  if (u && u.dmg > 0) { var h = Math.min(u.dmg, n); u.dmg -= h; fx(s, { k: 'heal', ref: ref, n: h }); }
}

function bounceUnit(s, u) {
  var O = s.players[u.owner];
  var i = O.board.indexOf(u);
  if (i < 0) return;
  O.board.splice(i, 1);
  fx(s, { k: 'bounce', uid: u.uid, id: u.id, p: u.owner });
  logMsg(s, CARD[u.id].name + ' is driven back to its owner\'s hand.');
  if (CARD[u.id].token) return;
  if (O.hand.length >= RULES.handMax) { O.grave.push(u.id); return; }
  O.hand.push({ uid: s.uid++, id: u.id });
}

function summon(s, p, token, n) {
  var P = s.players[p];
  for (var i = 0; i < n; i++) {
    if (P.board.length >= RULES.boardMax) return;
    var u = makeUnit(s, p, token);
    P.board.push(u);
    fx(s, { k: 'spawn', uid: u.uid });
  }
}

function applyEffect(s, p, e, ctx) {
  var P = s.players[p];
  var refs, i, u;
  var d = e['do'];
  if (d === 'draw') { drawCards(s, p, e.n); return; }
  if (d === 'ramp') { P.maxShards = Math.min(RULES.maxShards, P.maxShards + e.n); fx(s, { k: 'ramp', p: p }); return; }
  if (d === 'mana') { P.shards = Math.min(RULES.maxShards, P.shards + e.n); fx(s, { k: 'ramp', p: p }); return; }
  if (d === 'summon') { summon(s, p, e.token, e.n); return; }
  if (d === 'resurrect') {
    if (P.deadUnits.length) {
      var last = P.deadUnits[P.deadUnits.length - 1];
      logMsg(s, CARD[last].name + ' returns from the grave.');
      summon(s, p, last, 1);
    }
    return;
  }
  refs = resolveTargets(s, p, e, ctx);
  for (i = 0; i < refs.length; i++) {
    var r = refs[i];
    if (d === 'damage') { dealDamage(s, r, e.n, null); continue; }
    if (d === 'heal') { healRef(s, r, e.n); continue; }
    if (r.k !== 'u') continue;
    u = findUnit(s, r.uid);
    if (!u) continue;
    switch (d) {
      case 'buff': u.atk += e.a; u.hp += e.h; fx(s, { k: e.a < 0 || e.h < 0 ? 'debuff' : 'buff', uid: u.uid }); break;
      case 'tempAtk': u.tmp += e.a; fx(s, { k: 'buff', uid: u.uid }); break;
      case 'destroy': u.doomed = true; break;
      case 'shield': u.kw.shielded = 1; fx(s, { k: 'buff', uid: u.uid }); break;
      case 'grant': u.kw[e.kw] = 1; fx(s, { k: 'buff', uid: u.uid }); break;
      case 'exhaust': u.exhausted = true; fx(s, { k: 'debuff', uid: u.uid }); break;
      case 'bounce': bounceUnit(s, u); break;
    }
  }
}

/* ---------- deaths & win ---------- */
function checkDeaths(s) {
  var guard = 0;
  while (guard++ < 50) {
    var died = [];
    for (var p = 0; p < 2; p++) {
      var b = s.players[p].board;
      for (var i = 0; i < b.length; i++) {
        if (b[i].doomed || b[i].hp <= 0 || healthOf(s, b[i]) <= 0) died.push(b[i]);
      }
    }
    if (!died.length) return;
    var k, u, P;
    for (k = 0; k < died.length; k++) {
      u = died[k]; P = s.players[u.owner];
      P.board.splice(P.board.indexOf(u), 1);
      if (!CARD[u.id].token) { P.deadUnits.push(u.id); P.grave.push(u.id); }
      fx(s, { k: 'death', uid: u.uid, id: u.id, p: u.owner });
      logMsg(s, CARD[u.id].name + ' is destroyed.');
    }
    for (k = 0; k < died.length; k++) {
      u = died[k];
      runFx(s, u.owner, CARD[u.id], 'death', { src: null });
    }
    for (k = 0; k < died.length; k++) {
      u = died[k];
      fireBoard(s, u.owner, 'allyDies');
    }
  }
}

function checkWin(s) {
  if (s.phase === 'over') return;
  var d0 = s.players[0].life <= 0, d1 = s.players[1].life <= 0;
  if (!d0 && !d1) return;
  s.phase = 'over';
  s.combat = null;
  s.winner = d0 && d1 ? 2 : (d0 ? 1 : 0);
  logMsg(s, s.winner === 2 ? 'Both Wardens fall.' : s.players[s.winner].name + ' wins.');
}

function checkState(s) { checkDeaths(s); checkWin(s); }

/* ---------- combat ---------- */
function attackBlocker(s, p, u) {
  if (s.phase !== 'main') return 'Not now';
  if (s.active !== p || u.owner !== p) return 'Not your unit';
  if (s.attacked) return 'You have already attacked this turn';
  if (hasKw(s, u, 'bulwark')) return 'Bulwark units cannot attack';
  if (u.exhausted) return 'Exhausted';
  if (u.sick && !hasKw(s, u, 'charge')) return 'Just deployed. It can attack next turn';
  if (atkOf(s, u) <= 0) return 'No attack power';
  return '';
}
function canAttack(s, p, u) { return attackBlocker(s, p, u) === ''; }
function attackersAvailable(s, p) {
  return s.players[p].board.filter(function (u) { return canAttack(s, p, u); });
}

function declareAttack(s, p, uids) {
  if (!uids || !uids.length) return false;
  var list = [], i, u, seen = {};
  for (i = 0; i < uids.length; i++) {
    u = findUnit(s, uids[i]);
    if (!u || seen[u.uid] || !canAttack(s, p, u)) return false;
    seen[u.uid] = 1;
    list.push(u);
  }
  s.attacked = true;
  for (i = 0; i < list.length; i++) {
    if (!hasKw(s, list[i], 'vigil')) list[i].exhausted = true;
  }
  s.combat = { attackers: list.map(function (x) { return x.uid; }), blocks: {} };
  s.phase = 'block';
  logMsg(s, s.players[p].name + ' attacks with ' + list.map(function (x) { return CARD[x.id].name; }).join(', ') + '.');
  for (i = 0; i < list.length; i++) {
    if (findUnit(s, list[i].uid)) runFx(s, p, CARD[list[i].id], 'assault', { src: list[i].uid });
  }
  checkState(s);
  if (s.phase === 'over') return true;
  s.combat.attackers = s.combat.attackers.filter(function (id) { return !!findUnit(s, id); });
  return true;
}

function canBlock(s, blocker, attacker) {
  if (!blocker || !attacker) return false;
  if (blocker.owner === attacker.owner) return false;
  if (blocker.exhausted) return false;
  if (hasKw(s, attacker, 'skyborne') && !hasKw(s, blocker, 'skyborne') && !hasKw(s, blocker, 'reach')) return false;
  return true;
}

function blockersAvailable(s, d) {
  if (!s.combat) return [];
  var att = s.combat.attackers.map(function (id) { return findUnit(s, id); }).filter(Boolean);
  return s.players[d].board.filter(function (b) {
    for (var i = 0; i < att.length; i++) if (canBlock(s, b, att[i])) return true;
    return false;
  });
}

function declareBlocks(s, d, blocks) {
  if (s.phase !== 'block' || !s.combat || d === s.active) return false;
  blocks = blocks || {};
  var used = {}, clean = {};
  for (var aUid in blocks) {
    if (!blocks.hasOwnProperty(aUid)) continue;
    var a = findUnit(s, +aUid), b = findUnit(s, blocks[aUid]);
    if (!a || !b || s.combat.attackers.indexOf(a.uid) < 0) continue;
    if (used[b.uid] || !canBlock(s, b, a)) continue;
    used[b.uid] = 1;
    clean[a.uid] = b.uid;
  }
  s.combat.blocks = clean;
  resolveCombat(s);
  return true;
}

function alive(s, u) { return !!findUnit(s, u.uid) && !u.doomed && healthOf(s, u) > 0; }

function strike(s, src, tgt, n, attackerSide, defender) {
  if (n <= 0) return;
  var excess = 0;
  if (attackerSide && hasKw(s, src, 'overrun') && !tgt.kw.shielded) {
    var need = hasKw(s, src, 'venom') ? Math.min(1, Math.max(0, healthOf(s, tgt))) : Math.max(0, healthOf(s, tgt));
    excess = Math.max(0, n - need);
  }
  var dealt = dealDamage(s, { k: 'u', uid: tgt.uid }, n - excess, src);
  if (excess > 0) dealt += dealDamage(s, { k: 'w', p: defender }, excess, src);
  if (dealt > 0 && hasKw(s, src, 'siphon')) healRef(s, { k: 'w', p: src.owner }, dealt);
}

function resolveCombat(s) {
  var att = s.active, def = 1 - att, c = s.combat;
  for (var i = 0; i < c.attackers.length; i++) {
    if (s.phase === 'over') break;
    var a = findUnit(s, c.attackers[i]);
    if (!a || a.doomed) continue;
    var b = c.blocks[a.uid] ? findUnit(s, c.blocks[a.uid]) : null;
    if (b && b.doomed) b = null;
    fx(s, { k: 'strike', uid: a.uid, tgt: b ? b.uid : -1, p: att });
    if (!b) {
      var n = atkOf(s, a);
      var dealt = dealDamage(s, { k: 'w', p: def }, n, a);
      if (dealt > 0 && hasKw(s, a, 'siphon')) healRef(s, { k: 'w', p: att }, dealt);
      continue;
    }
    var aSw = hasKw(s, a, 'swift'), bSw = hasKw(s, b, 'swift');
    var na = atkOf(s, a), nb = atkOf(s, b);
    if (aSw && !bSw) {
      strike(s, a, b, na, true, def);
      if (alive(s, b)) strike(s, b, a, atkOf(s, b), false, att);
    } else if (bSw && !aSw) {
      strike(s, b, a, nb, false, att);
      if (alive(s, a)) strike(s, a, b, atkOf(s, a), true, def);
    } else {
      strike(s, a, b, na, true, def);
      strike(s, b, a, nb, false, att);
    }
    checkWin(s);
  }
  s.combat = null;
  if (s.phase !== 'over') s.phase = 'main';
  checkState(s);
}

/* ---------- utilities ---------- */
function cloneState(s) {
  var log = s.log, f = s.fx;
  s.log = []; s.fx = null;
  var c = JSON.parse(JSON.stringify(s));
  s.log = log; s.fx = f;
  c.fx = null;
  return c;
}

/* ---------- deck validation ---------- */
function deckBanners(cards) {
  var seen = {}, out = [];
  for (var i = 0; i < cards.length; i++) {
    var b = CARD[cards[i]] && CARD[cards[i]].banner;
    if (b && b !== 'unbound' && !seen[b]) { seen[b] = 1; out.push(b); }
  }
  return out;
}

function deckProblems(cards, coll) {
  var probs = [], counts = {}, i;
  for (i = 0; i < cards.length; i++) counts[cards[i]] = (counts[cards[i]] || 0) + 1;
  if (cards.length !== RULES.deckSize) probs.push('Needs exactly ' + RULES.deckSize + ' cards (has ' + cards.length + ')');
  var b = deckBanners(cards);
  if (b.length > RULES.maxBanners) probs.push('Uses ' + b.length + ' banners (max ' + RULES.maxBanners + ' plus Unbound)');
  for (var id in counts) {
    if (!counts.hasOwnProperty(id)) continue;
    if (!CARD[id] || CARD[id].token) { probs.push('Unknown card'); continue; }
    if (counts[id] > maxCopies(id)) probs.push(CARD[id].name + ': max ' + maxCopies(id));
    if (coll && (coll[id] || 0) < counts[id]) probs.push(CARD[id].name + ': you own ' + (coll[id] || 0));
  }
  return probs;
}
