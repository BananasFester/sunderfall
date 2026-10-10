// Card audit: thousands of AI-vs-AI games with random two-banner decks.
// Per card: how often it gets played once drawn, and the win rate of the
// side that played it. Flags dead cards (rarely cast) and outliers.
var G = require('../dist/core.test.js');
var r = 2024; G.AI.rand = function () { r = (r * 1103515245 + 12345) & 0x7fffffff; return r / 0x7fffffff; };
var N = +(process.argv[2] || 1500);
var B = ['auric', 'eld', 'hollow', 'forge'];
var st = {};
G.CARDS.forEach(function (c) { st[c.id] = { drawn: 0, played: 0, wonPlayed: 0, games: 0, gp: 0 }; });

for (var g = 0; g < N; g++) {
  var bA = [B[g % 4], [B[(g + 1) % 4], B[(g + 2) % 4], 'unbound'][g % 3]];
  var bB = [B[(g + 3) % 4], [B[g % 4], 'unbound', B[(g + 1) % 4]][(g >> 2) % 3]];
  var decks = [G.AI.buildDeck(bA, 2, 1000 + g * 3), G.AI.buildDeck(bB, 2, 5000 + g * 7)];
  var s = G.newGame({ seed: 77 + g, decks: decks, names: ['A', 'B'] });
  G.mulligan(s, 0, G.AI.mulligan(s, 0, 3)); G.mulligan(s, 1, G.AI.mulligan(s, 1, 3));
  var seen = [{}, {}], played = [{}, {}], n = 0;
  function look() { for (var p = 0; p < 2; p++) s.players[p].hand.forEach(function (h) { if (G.CARD[h.id].token) return; seen[p][h.uid] = h.id; }); }
  look();
  while (s.phase !== 'over' && n++ < 3000) {
    var p = s.active, a = G.AI.choose(s, p, 3);
    if (a.type === 'play') {
      var h = s.players[p].hand.filter(function (x) { return x.uid === a.uid; })[0];
      if (G.playCard(s, p, a.uid, a.target) && h && !G.CARD[h.id].token) played[p][h.uid] = h.id;
    } else if (a.type === 'attack') { G.declareAttack(s, p, a.uids); if (s.phase === 'block') G.declareBlocks(s, 1 - p, G.AI.blocks(s, 1 - p, 3)); }
    else G.endTurn(s, p);
    look();
  }
  if (s.winner !== 0 && s.winner !== 1) continue;
  for (var q = 0; q < 2; q++) {
    var inDeck = {};
    decks[q].forEach(function (id) { inDeck[id] = 1; });
    Object.keys(inDeck).forEach(function (id) { st[id].games++; });
    Object.keys(seen[q]).forEach(function (u) { st[seen[q][u]].drawn++; });
    var pc = {};
    Object.keys(played[q]).forEach(function (u) { pc[played[q][u]] = 1; st[played[q][u]].played++; });
    Object.keys(pc).forEach(function (id) { st[id].gp++; if (s.winner === q) st[id].wonPlayed++; });
  }
  // wonPlayed counts games, so normalise below with games-played count
}
// games-played count per card (distinct games where it was played at least once)
var rows = G.CARDS.map(function (c) {
  var x = st[c.id];
  return { id: c.id, name: c.name, b: c.banner, r: c.rarity, cost: c.cost, games: x.games,
    playRate: x.drawn ? x.played / x.drawn : 0, wr: 0, x: x };
});
// recompute WR with distinct games
console.log('Played ' + N + ' games');
var out = rows.map(function (row) {
  return row;
});
module.exports = out;
if (require.main === module) {
  // second pass for distinct-game WR
  rows.forEach(function (row) {
    var x = row.x;
    row.wr = x.gp ? x.wonPlayed / x.gp : 0;
  });
  rows.sort(function (a, b) { return a.wr - b.wr; });
  console.log('id   name                         ban     r  cost  inDecks  playRate  winRateWhenPlayed');
  rows.forEach(function (row) {
    var flag = (row.playRate < 0.45 ? ' LOW-PLAY' : '') + (row.wr < 0.42 ? ' WEAK' : '') + (row.wr > 0.62 ? ' STRONG' : '');
    console.log(row.id.padEnd(5) + row.name.slice(0, 28).padEnd(29) + row.b.padEnd(8) + row.r.padEnd(3) + String(row.cost).padStart(4) + String(row.games).padStart(9) +
      (Math.round(100 * row.playRate) + '%').padStart(10) + (Math.round(100 * row.wr) + '%').padStart(12) + flag);
  });
}
