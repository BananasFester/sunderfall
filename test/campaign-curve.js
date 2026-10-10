// How hard is each campaign stage for a starter deck piloted by AI L1 / L2?
var G = require('../dist/core.test.js');
var r = 4242; G.AI.rand = function () { r = (r * 1103515245 + 12345) & 0x7fffffff; return r / 0x7fffffff; };
function play(dA, dB, lA, lB, lifeB, seed) {
  var s = G.newGame({ seed: seed, decks: [dA, dB], names: ['P', 'AI'], lives: [20, lifeB] });
  G.mulligan(s, 0, G.AI.mulligan(s, 0, lA)); G.mulligan(s, 1, G.AI.mulligan(s, 1, lB));
  var lv = [lA, lB], n = 0;
  while (s.phase !== 'over' && n++ < 3000) {
    var p = s.active, a = G.AI.choose(s, p, lv[p]);
    if (a.type === 'play') G.playCard(s, p, a.uid, a.target);
    else if (a.type === 'attack') { G.declareAttack(s, p, a.uids); if (s.phase === 'block') G.declareBlocks(s, 1 - p, G.AI.blocks(s, 1 - p, lv[1 - p])); }
    else G.endTurn(s, p);
  }
  return s.winner === 0;
}
var B = ['auric', 'eld', 'hollow', 'forge'];
G.CAMPAIGN.forEach(function (st) {
  var opp = G.AI.buildDeck(st.banners, st.quality, st.id * 7919 + 13, st.include);
  var row = 'Stage ' + st.id + ' ' + st.name.padEnd(24);
  [1, 2].forEach(function (pl) {
    var w = 0, g = 0;
    B.forEach(function (b, bi) { for (var k = 0; k < 8; k++) { g++; if (play(G.starterDeck(b), opp, pl, st.level, st.life, 100 + st.id * 50 + bi * 10 + k)) w++; } });
    row += '  player L' + pl + ': ' + String(Math.round(100 * w / g)).padStart(3) + '%';
  });
  console.log(row);
});
