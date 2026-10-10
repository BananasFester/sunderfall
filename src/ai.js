/* ============================================================
   SUNDERFALL - AI opponent
   Level 1 Squire, 2 Knight, 3 Warlord. Plays by simulating each
   option on a cloned state and scoring the board.
   ============================================================ */

var AI = (function () {
  var api = { rand: Math.random };

  function noise(lvl) {
    if (lvl >= 3) return 0;
    return (api.rand() - 0.5) * (lvl === 1 ? 4 : 1.2);
  }

  function unitValue(s, u) {
    var c = CARD[u.id];
    var a = Math.max(0, u.atk + auraOf(s, u).a + (canAttack(s, u.owner, u) ? u.tmp : 0));
    var h = maxHpOf(s, u);
    var v = 0.6 + a * 1.0 + h * 0.8;
    if (hasKw(s, u, 'bulwark')) v -= a * 0.6;
    if (hasKw(s, u, 'skyborne')) v += 1 + a * 0.25;
    if (hasKw(s, u, 'venom')) v += 1.6;
    if (hasKw(s, u, 'siphon')) v += a * 0.4;
    if (hasKw(s, u, 'overrun')) v += 0.4;
    if (hasKw(s, u, 'swift')) v += 0.8;
    if (hasKw(s, u, 'vigil')) v += 0.5;
    if (u.kw.shielded) v += Math.min(2, a * 0.5 + 0.5);
    if (hasKw(s, u, 'warded')) v += 0.4;
    if (hasKw(s, u, 'reach')) v += 0.3;
    for (var i = 0; i < c.fx.length; i++) {
      var on = c.fx[i].on;
      if (on === 'dawn' || on === 'dusk') v += 1.8;
      else if (on === 'allyDies') v += 1.2;
      else if (on === 'death') v += 1;
      else if (on === 'assault') v += 0.8;
      else if (on === 'spell') v += 1.0;
    }
    if (c.aura) v += (s.players[u.owner].board.length - 1) * 1.0 + 0.5;
    return v;
  }

  function lifeVal(l) {
    if (l <= 0) return -400;
    var v = l;
    if (l < 10) v -= (10 - l) * 0.7;
    if (l < 5) v -= (5 - l) * 1.5;
    return v;
  }

  function evaluate(s, p) {
    if (s.phase === 'over') return s.winner === p ? 100000 : -100000;
    var me = s.players[p], op = s.players[1 - p], sc = 0, i;
    sc += lifeVal(me.life) - lifeVal(op.life);
    for (i = 0; i < me.board.length; i++) sc += unitValue(s, me.board[i]);
    for (i = 0; i < op.board.length; i++) {
      sc -= unitValue(s, op.board[i]) * 1.08;
      if (s.active === p && !s.attacked && op.board[i].exhausted) sc += 1.2;
    }
    sc += me.hand.length * 0.9 - op.hand.length * 0.4;
    sc += (me.maxShards - op.maxShards) * (me.maxShards <= 7 ? 1.8 : 0.6);
    return sc;
  }

  /* ---------- playing cards ---------- */
  function candidates(s, p) {
    var P = s.players[p], out = [];
    for (var i = 0; i < P.hand.length; i++) {
      var h = P.hand[i];
      if (h.id === 't_spark') continue;
      if (playBlocker(s, p, h.uid)) continue;
      var opts = playOptions(s, p, h.uid);
      if (!opts || !opts.length) out.push({ uid: h.uid, target: null, id: h.id });
      else for (var j = 0; j < opts.length; j++) out.push({ uid: h.uid, target: opts[j], id: h.id });
    }
    return out;
  }

  function sparkPlay(s, p) {
    var P = s.players[p], spark = null, i;
    for (i = 0; i < P.hand.length; i++) if (P.hand[i].id === 't_spark') spark = P.hand[i];
    if (!spark) return null;
    var sh = P.shards, needs = false, exact = false;
    for (i = 0; i < P.hand.length; i++) {
      var h = P.hand[i], c = CARD[h.id];
      if (h.id === 't_spark') continue;
      if (c.cost === sh + 1 && (c.type !== 'unit' || P.board.length < RULES.boardMax)) needs = true;
      if (c.cost === sh && !playBlocker(s, p, h.uid)) exact = true;
    }
    if (needs && !exact) return { type: 'play', uid: spark.uid, target: null };
    return null;
  }

  function spellMargin(card) {
    if (card.type !== 'spell') return 0.2;
    for (var i = 0; i < card.fx.length; i++) {
      var d = card.fx[i]['do'];
      if (d === 'damage' || d === 'destroy') return 1.2;
    }
    return 0.3;
  }

  function bestPlay(s, p, lvl) {
    var sp = sparkPlay(s, p);
    if (sp) return sp;
    var cands = candidates(s, p);
    if (!cands.length) return null;
    var base = evaluate(s, p);
    var scored = [];
    for (var i = 0; i < cands.length; i++) {
      var cd = cands[i];
      var c2 = cloneState(s);
      if (!playCard(c2, p, cd.uid, cd.target)) continue;
      var card = CARD[cd.id];
      var sc = evaluate(c2, p) - spellMargin(card) + card.cost * 0.15 + noise(lvl);
      scored.push({ cd: cd, sc: sc });
    }
    var ok = scored.filter(function (x) { return x.sc > base; });
    if (!ok.length) return null;
    var pickOne;
    if (lvl === 1 && api.rand() < 0.35) pickOne = ok[Math.floor(api.rand() * ok.length)];
    else { ok.sort(function (a, b) { return b.sc - a.sc; }); pickOne = ok[0]; }
    return { type: 'play', uid: pickOne.cd.uid, target: pickOne.cd.target };
  }

  /* ---------- combat prediction ---------- */
  function duel(s, a, b) {
    var na = atkOf(s, a), nb = atkOf(s, b);
    var ha = healthOf(s, a), hb = healthOf(s, b);
    var aSh = !!a.kw.shielded, bSh = !!b.kw.shielded;
    var aV = hasKw(s, a, 'venom'), bV = hasKw(s, b, 'venom');
    var aS = hasKw(s, a, 'swift'), bS = hasKw(s, b, 'swift');
    function kills(n, venom, h, sh) { return n > 0 && !sh && (venom || n >= h); }
    var aDies = false, bDies = false, aHits = true;
    if (aS && !bS) { bDies = kills(na, aV, hb, bSh); if (!bDies) aDies = kills(nb, bV, ha, aSh); }
    else if (bS && !aS) { aDies = kills(nb, bV, ha, aSh); aHits = !aDies; if (aHits) bDies = kills(na, aV, hb, bSh); }
    else { bDies = kills(na, aV, hb, bSh); aDies = kills(nb, bV, ha, aSh); }
    var through = 0;
    if (aHits && !bSh && hasKw(s, a, 'overrun')) through = Math.max(0, na - (aV ? 1 : Math.max(0, hb)));
    return { aDies: aDies, bDies: bDies, through: through };
  }

  function predictBlocks(s, d, lvl) {
    if (!s.combat) return {};
    var att = s.combat.attackers.map(function (id) { return findUnit(s, id); }).filter(Boolean);
    var blockers = s.players[d].board.filter(function (u) { return !u.exhausted; });
    var life = s.players[d].life;
    var blocks = {}, used = {};
    var sorted = att.slice().sort(function (x, y) { return atkOf(s, y) - atkOf(s, x); });
    var i, j;

    for (i = 0; i < sorted.length; i++) {
      var a = sorted[i], best = null, bestSc = 0.5;
      for (j = 0; j < blockers.length; j++) {
        var b = blockers[j];
        if (used[b.uid] || !canBlock(s, b, a)) continue;
        var r = duel(s, a, b), sc;
        if (r.aDies && !r.bDies) sc = 10 + unitValue(s, a);
        else if (r.aDies && r.bDies) sc = unitValue(s, a) - unitValue(s, b) + 1;
        else if (!r.aDies && !r.bDies) sc = 1.5 + atkOf(s, a) * 0.4 - r.through * 0.4;
        else sc = -10;
        if (sc > bestSc) { best = b; bestSc = sc; }
      }
      if (best) { blocks[a.uid] = best.uid; used[best.uid] = 1; }
    }

    function incoming() {
      var t = 0;
      for (var k = 0; k < att.length; k++) {
        var aa = att[k];
        if (blocks[aa.uid]) t += duel(s, aa, findUnit(s, blocks[aa.uid])).through;
        else t += atkOf(s, aa);
      }
      return t;
    }
    var buffer = lvl >= 3 ? 2 : 0;
    var guard = 0;
    while (incoming() >= life - buffer && guard++ < 8) {
      var target = null, chump = null;
      for (i = 0; i < sorted.length; i++) {
        if (blocks[sorted[i].uid]) continue;
        var cheapest = null, cv = 1e9;
        for (j = 0; j < blockers.length; j++) {
          if (used[blockers[j].uid] || !canBlock(s, blockers[j], sorted[i])) continue;
          var v = unitValue(s, blockers[j]);
          if (v < cv) { cv = v; cheapest = blockers[j]; }
        }
        if (cheapest) { target = sorted[i]; chump = cheapest; break; }
      }
      if (!target) break;
      blocks[target.uid] = chump.uid; used[chump.uid] = 1;
      if (incoming() < life - buffer) break;
    }

    if (lvl === 1) {
      for (var key in blocks) {
        if (blocks.hasOwnProperty(key) && api.rand() < 0.3 && incoming() + 6 < life) delete blocks[key];
      }
    }
    return blocks;
  }

  function crackBackRisk(s, p, lvl) {
    if (lvl <= 1) return 0;
    var me = s.players[p], op = s.players[1 - p];
    var attackers = op.board.filter(function (u) { return !hasKw(s, u, 'bulwark'); })
      .map(function (u) { return { a: Math.max(0, atkOf(s, u) - u.tmp), sky: hasKw(s, u, 'skyborne') }; })
      .sort(function (x, y) { return y.a - x.a; });
    var blockers = me.board.filter(function (u) { return !u.exhausted; })
      .map(function (u) { return { sky: hasKw(s, u, 'skyborne') || hasKw(s, u, 'reach'), used: false }; });
    var through = 0;
    for (var i = 0; i < attackers.length; i++) {
      var blocked = false;
      for (var j = 0; j < blockers.length; j++) {
        if (blockers[j].used) continue;
        if (attackers[i].sky && !blockers[j].sky) continue;
        blockers[j].used = true; blocked = true; break;
      }
      if (!blocked) through += attackers[i].a;
    }
    var dmg = through + 2 + (op.maxShards >= 4 ? 1 : 0);
    if (dmg >= me.life) return 60 + (dmg - me.life) * 2;
    return (dmg / Math.max(1, me.life)) * (lvl >= 3 ? 8 : 5);
  }

  function bestAttack(s, p, lvl) {
    var el = attackersAvailable(s, p);
    if (!el.length) return [];
    var n = Math.min(el.length, RULES.boardMax);
    if (lvl === 1 && api.rand() < 0.3) {
      var rnd = [];
      for (var r = 0; r < n; r++) if (api.rand() < 0.6) rnd.push(el[r].uid);
      return rnd;
    }
    var bestSet = [], bestSc = evaluate(s, p) - crackBackRisk(s, p, lvl) + noise(lvl);
    for (var mask = 1; mask < (1 << n); mask++) {
      var set = [];
      for (var i = 0; i < n; i++) if (mask & (1 << i)) set.push(el[i].uid);
      var c2 = cloneState(s);
      if (!declareAttack(c2, p, set)) continue;
      if (c2.phase === 'block') declareBlocks(c2, 1 - p, predictBlocks(c2, 1 - p, 3));
      var sc = evaluate(c2, p);
      if (c2.phase !== 'over') sc -= crackBackRisk(c2, p, lvl);
      sc += noise(lvl);
      if (sc > bestSc) { bestSc = sc; bestSet = set; }
    }
    return bestSet;
  }

  /* ---------- public ---------- */
  api.choose = function (s, p, lvl) {
    if (s.phase !== 'main' || s.active !== p) return null;
    var play = bestPlay(s, p, lvl);
    if (play) return play;
    if (!s.attacked) {
      var set = bestAttack(s, p, lvl);
      if (set.length) return { type: 'attack', uids: set };
    }
    return { type: 'end' };
  };

  api.blocks = function (s, d, lvl) { return predictBlocks(s, d, lvl); };

  api.mulligan = function (s, p, lvl) {
    if (lvl <= 1) return [];
    return s.players[p].hand.filter(function (h) { return CARD[h.id].cost >= 5; }).map(function (h) { return h.uid; });
  };

  api.evaluate = evaluate;
  api.duel = duel;

  /* ---------- opponent decks ---------- */
  api.buildDeck = function (banners, quality, seed, include) {
    var st = { seed: (seed >>> 0) || 7 };
    var weights = [
      { C: 6, U: 3, R: 1, M: 0 },
      { C: 4, U: 4, R: 2, M: 0.4 },
      { C: 3, U: 4, R: 3, M: 1 }
    ][quality] || { C: 4, U: 4, R: 2, M: 0.4 };
    var allowUnbound = banners.indexOf('unbound') >= 0;
    var pool = CARDS.filter(function (c) {
      return banners.indexOf(c.banner) >= 0 || (c.banner === 'unbound' && c.rarity !== 'M');
    });
    var deck = [], counts = {};
    var caps = [{ C: 30, U: 6, R: 1, M: 0 }, { C: 30, U: 10, R: 4, M: 1 }, { C: 30, U: 14, R: 7, M: 2 }][quality] || { C: 30, U: 10, R: 4, M: 1 };
    var rc = { C: 0, U: 0, R: 0, M: 0 };
    (include || []).forEach(function (id) { deck.push(id); counts[id] = 1; rc[CARD[id].rarity]++; });
    var curve = { 1: 3, 2: 6, 3: 6, 4: 5, 5: 4, 6: 3, 7: 3 };
    deck.forEach(function (id) { var k = Math.min(7, Math.max(1, CARD[id].cost)); curve[k] = Math.max(0, curve[k] - 1); });
    function weightOf(c) {
      var w = weights[c.rarity];
      if (c.banner === 'unbound') w *= allowUnbound ? 0.8 : 0.35;
      return w;
    }
    function pickFrom(list) {
      var tot = 0, i;
      for (i = 0; i < list.length; i++) tot += weightOf(list[i]);
      if (tot <= 0) return null;
      var r = rngNext(st) * tot;
      for (i = 0; i < list.length; i++) { r -= weightOf(list[i]); if (r <= 0) return list[i]; }
      return list[list.length - 1];
    }
    var guard = 0;
    while (deck.length < RULES.deckSize && guard++ < 500) {
      var bucket = null;
      for (var k = 1; k <= 7; k++) if (curve[k] > 0) { bucket = k; break; }
      var avail = pool.filter(function (c) {
        if ((counts[c.id] || 0) >= maxCopies(c.id)) return false;
        if (rc[c.rarity] >= caps[c.rarity]) return false;
        if (bucket === null) return true;
        var cc = Math.min(7, Math.max(1, c.cost));
        return cc === bucket;
      });
      if (!avail.length) {
        if (bucket !== null) { curve[bucket] = 0; continue; }
        break;
      }
      var c = pickFrom(avail);
      if (!c) { if (bucket !== null) curve[bucket] = 0; continue; }
      deck.push(c.id);
      counts[c.id] = (counts[c.id] || 0) + 1;
      rc[c.rarity]++;
      if (bucket !== null) curve[bucket]--;
    }
    return deck;
  };

  return api;
})();
