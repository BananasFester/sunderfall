// Banner strength with generated decks (each banner + Unbound), Warlord vs Warlord,
// plus starter-deck matchups (Knight vs Knight).
var G = require('../dist/core.test.js');
var r = 31337; G.AI.rand = function () { r = (r * 1103515245 + 12345) & 0x7fffffff; return r / 0x7fffffff; };
function play(dA, dB, lA, lB, seed) {
  var s = G.newGame({ seed: seed, decks: [dA, dB], names: ['A', 'B'] });
  G.mulligan(s, 0, G.AI.mulligan(s, 0, lA)); G.mulligan(s, 1, G.AI.mulligan(s, 1, lB));
  var lv = [lA, lB], n = 0;
  while (s.phase !== 'over' && n++ < 3000) { var p = s.active, a = G.AI.choose(s, p, lv[p]);
    if (a.type === 'play') G.playCard(s, p, a.uid, a.target); else if (a.type === 'attack') { G.declareAttack(s, p, a.uids); if (s.phase === 'block') G.declareBlocks(s, 1 - p, G.AI.blocks(s, 1 - p, lv[1 - p])); } else G.endTurn(s, p); }
  return s.winner;
}
var B = ['auric', 'eld', 'hollow', 'forge'], per = +(process.argv[2] || 24);
['generated', 'starter'].forEach(function (mode) {
  var w = {}, g = {};
  B.forEach(function (b) { w[b] = 0; g[b] = 0; });
  for (var i = 0; i < 4; i++) for (var j = i + 1; j < 4; j++) for (var k = 0; k < per; k++) {
    var dI = mode === 'starter' ? G.starterDeck(B[i]) : G.AI.buildDeck([B[i], 'unbound'], 2, 100 + i * 31 + k * 7);
    var dJ = mode === 'starter' ? G.starterDeck(B[j]) : G.AI.buildDeck([B[j], 'unbound'], 2, 900 + j * 17 + k * 11);
    var swap = k % 2, lvl = mode === 'starter' ? 2 : 3;
    var win = play(swap ? dJ : dI, swap ? dI : dJ, lvl, lvl, 4000 + i * 100 + j * 10 + k);
    if (win > 1) continue;
    var winner = (win === 0) !== !!swap ? B[i] : B[j];
    w[winner]++; g[B[i]]++; g[B[j]]++;
  }
  console.log(mode + ': ' + B.map(function (b) { return b + ' ' + Math.round(100 * w[b] / g[b]) + '%'; }).join('  '));
});
