// Headless AI-vs-AI harness: plays many full games across banner pairings
// and asserts engine invariants after every action.
var G = require('../dist/core.test.js');
var assert = require('assert');

var seedRand = 12345;
G.AI.rand = function () { seedRand = (seedRand * 1103515245 + 12345) & 0x7fffffff; return seedRand / 0x7fffffff; };

function check(s) {
  for (var p = 0; p < 2; p++) {
    var P = s.players[p];
    assert(P.board.length <= G.RULES.boardMax, 'board overflow');
    assert(P.hand.length <= G.RULES.handMax, 'hand overflow');
    assert(P.shards >= 0 && P.shards <= 10, 'shards out of range ' + P.shards);
    assert(P.maxShards >= 0 && P.maxShards <= 10, 'max shards out of range');
    assert(!isNaN(P.life), 'life NaN');
    P.board.forEach(function (u) {
      assert(G.CARD[u.id], 'unknown unit');
      assert(!isNaN(u.atk) && !isNaN(u.hp) && !isNaN(u.dmg), 'unit NaN');
      if (s.phase !== 'over') assert(G.healthOf(s, u) > 0 && !u.doomed, 'dead unit left on board: ' + u.id);
      assert(u.owner === p, 'owner mismatch');
    });
  }
  var uids = {};
  s.players.forEach(function (P) { P.board.concat(P.hand).forEach(function (x) { assert(!uids[x.uid], 'duplicate uid'); uids[x.uid] = 1; }); });
}

function playGame(deckA, deckB, lvlA, lvlB, seed) {
  var s = G.newGame({ seed: seed, decks: [deckA, deckB], names: ['A', 'B'] });
  G.mulligan(s, 0, G.AI.mulligan(s, 0, lvlA));
  G.mulligan(s, 1, G.AI.mulligan(s, 1, lvlB));
  var lv = [lvlA, lvlB], actions = 0;
  while (s.phase !== 'over' && actions < 3000) {
    var p = s.active;
    var act = G.AI.choose(s, p, lv[p]);
    assert(act, 'AI returned null in main phase');
    if (act.type === 'play') assert(G.playCard(s, p, act.uid, act.target), 'AI chose illegal play');
    else if (act.type === 'attack') {
      assert(G.declareAttack(s, p, act.uids), 'AI chose illegal attack');
      if (s.phase === 'block') assert(G.declareBlocks(s, 1 - p, G.AI.blocks(s, 1 - p, lv[1 - p])), 'blocks failed');
    } else assert(G.endTurn(s, p), 'end turn failed');
    check(s);
    actions++;
    if (s.turn > 120) break;
  }
  return { winner: s.winner, turns: s.turn, actions: actions, over: s.phase === 'over' };
}

var banners = ['auric', 'eld', 'hollow', 'forge'];
var t0 = Date.now();
var stats = {}, games = 0, unfinished = 0, totalTurns = 0;
banners.forEach(function (b) { stats[b] = { w: 0, g: 0 }; });

// 1) starter vs starter, Knight vs Knight, every pairing both seats
for (var i = 0; i < banners.length; i++) {
  for (var j = 0; j < banners.length; j++) {
    if (i === j) continue;
    for (var k = 0; k < 6; k++) {
      var r = playGame(G.starterDeck(banners[i]), G.starterDeck(banners[j]), 2, 2, 1000 + i * 100 + j * 10 + k);
      games++; totalTurns += r.turns;
      if (!r.over) { unfinished++; continue; }
      stats[banners[i]].g++; stats[banners[j]].g++;
      if (r.winner === 0) stats[banners[i]].w++;
      else if (r.winner === 1) stats[banners[j]].w++;
    }
  }
}
console.log('Starter pairings (Knight vs Knight):');
banners.forEach(function (b) { console.log('  ' + b.padEnd(7) + ' win rate ' + (100 * stats[b].w / stats[b].g).toFixed(0) + '%  (' + stats[b].g + ' games)'); });

// 2) difficulty ladder: Warlord vs Squire should win most games
var lad = { w: 0, g: 0 };
for (var n = 0; n < 24; n++) {
  var b1 = banners[n % 4], b2 = banners[(n + 1) % 4];
  var rr = playGame(G.starterDeck(b1), G.starterDeck(b2), n % 2 ? 3 : 1, n % 2 ? 1 : 3, 5000 + n);
  games++; totalTurns += rr.turns;
  if (!rr.over) { unfinished++; continue; }
  lad.g++;
  var warlordSeat = n % 2 ? 0 : 1;
  if (rr.winner === warlordSeat) lad.w++;
}
console.log('Warlord vs Squire: Warlord wins ' + lad.w + '/' + lad.g);

// 3) campaign AI decks (every card pool gets exercised)
var cardSeen = {};
G.CAMPAIGN.forEach(function (st, idx) {
  var d = G.AI.buildDeck(st.banners, st.quality, 77 + idx, st.include);
  assert.strictEqual(d.length, 30, 'campaign deck ' + st.name + ' has ' + d.length);
  var probs = G.deckProblems(d, null);
  assert(probs.length === 0, 'campaign deck invalid: ' + probs.join('; '));
  d.forEach(function (id) { cardSeen[id] = 1; });
  for (var z = 0; z < 4; z++) {
    var opp = G.AI.buildDeck(['auric', 'eld', 'hollow', 'forge'][z], 2, 300 + idx * 7 + z);
    var res = playGame(d, opp, st.level, 3, 9000 + idx * 10 + z);
    games++; totalTurns += res.turns;
    if (!res.over) unfinished++;
  }
});
// random mixed decks so every card shows up
for (var m = 0; m < 40; m++) {
  var bA = [banners[m % 4], banners[(m + 2) % 4]];
  var bB = [banners[(m + 1) % 4], 'unbound'];
  var dA = G.AI.buildDeck(bA, 2, 400 + m), dB = G.AI.buildDeck(bB, 2, 800 + m);
  dA.concat(dB).forEach(function (id) { cardSeen[id] = 1; });
  var rm = playGame(dA, dB, 3, 2, 12000 + m);
  games++; totalTurns += rm.turns;
  if (!rm.over) unfinished++;
}
var missing = G.CARDS.filter(function (c) { return !cardSeen[c.id]; }).map(function (c) { return c.id; });
console.log('Cards never drawn into a test deck: ' + (missing.join(', ') || 'none'));
console.log(games + ' games, avg ' + (totalTurns / games).toFixed(1) + ' turns, unfinished ' + unfinished + ', ' + (Date.now() - t0) + 'ms');
assert(unfinished === 0, 'some games never finished');
console.log('SIM OK');
