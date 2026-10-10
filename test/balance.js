// Larger-sample balance and AI-skill probe (not part of the release gate).
var G = require('../dist/core.test.js');
var seedRand = 999;
G.AI.rand = function () { seedRand = (seedRand * 1103515245 + 12345) & 0x7fffffff; return seedRand / 0x7fffffff; };

function playGame(dA, dB, lA, lB, seed) {
  var s = G.newGame({ seed: seed, decks: [dA, dB], names: ['A', 'B'] });
  G.mulligan(s, 0, G.AI.mulligan(s, 0, lA)); G.mulligan(s, 1, G.AI.mulligan(s, 1, lB));
  var lv = [lA, lB], n = 0;
  while (s.phase !== 'over' && n++ < 3000) {
    var p = s.active, a = G.AI.choose(s, p, lv[p]);
    if (a.type === 'play') G.playCard(s, p, a.uid, a.target);
    else if (a.type === 'attack') { G.declareAttack(s, p, a.uids); if (s.phase === 'block') G.declareBlocks(s, 1 - p, G.AI.blocks(s, 1 - p, lv[1 - p])); }
    else G.endTurn(s, p);
  }
  return s;
}
var mode = process.argv[2] || 'skill';
var B = ['auric', 'eld', 'hollow', 'forge'];
if (mode === 'skill') {
  [[3, 1], [3, 2], [2, 1]].forEach(function (pair) {
    var w = 0, g = 0;
    for (var i = 0; i < 80; i++) {
      var b = B[i % 4], d = G.starterDeck(b);
      var hiSeat = i % 2;
      var s = playGame(d, d, hiSeat === 0 ? pair[0] : pair[1], hiSeat === 0 ? pair[1] : pair[0], 777 + i);
      if (s.winner === 0 || s.winner === 1) { g++; if (s.winner === hiSeat) w++; }
    }
    console.log('L' + pair[0] + ' vs L' + pair[1] + ' (mirror starters): ' + w + '/' + g);
  });
}
if (mode === 'matchups') {
  var tab = {};
  B.forEach(function (a) { tab[a] = {}; B.forEach(function (b) { tab[a][b] = 0; }); });
  var games = +(process.argv[3] || 30);
  B.forEach(function (a, i) {
    B.forEach(function (b, j) {
      if (i >= j) return;
      var wa = 0;
      for (var k = 0; k < games; k++) {
        var seatA = k % 2;
        var s = playGame(seatA === 0 ? G.starterDeck(a) : G.starterDeck(b), seatA === 0 ? G.starterDeck(b) : G.starterDeck(a), 2, 2, 3000 + i * 1000 + j * 100 + k);
        if (s.winner === seatA) wa++;
      }
      tab[a][b] = wa / games; tab[b][a] = 1 - wa / games;
    });
  });
  B.forEach(function (a) {
    var row = a.padEnd(7) + ' ', tot = 0;
    B.forEach(function (b) { row += (a === b ? '  -  ' : (100 * tab[a][b]).toFixed(0).padStart(4) + '%'); if (a !== b) tot += tab[a][b]; });
    console.log(row + '   avg ' + (100 * tot / 3).toFixed(0) + '%');
  });
}
if (mode === 'first') {
  var fw = 0, n2 = 0;
  for (var q = 0; q < 120; q++) {
    var d2 = G.starterDeck(B[q % 4]);
    var s2 = playGame(d2, d2, 2, 2, 50000 + q);
    if (s2.winner < 2) { n2++; if (s2.winner === s2.first) fw++; }
  }
  console.log('First player wins ' + fw + '/' + n2);
}
