// Build: concatenates src/ into one IIFE and emits
//   dist/core.test.js            - cards + engine + ai for node tests
//   dist/sunderfall.html         - artifact page (no doctype; host adds skeleton)
//   dist/index.html              - standalone document for Capacitor (webDir: dist) / GitHub Pages
//   dist/sunderfall-app.html     - same document, named copy
var fs = require('fs');
var path = require('path');
var src = function (f) { return fs.readFileSync(path.join(__dirname, 'src', f), 'utf8'); };
var out = path.join(__dirname, 'dist');
if (!fs.existsSync(out)) fs.mkdirSync(out);

var core = ['cards.js', 'engine.js', 'ai.js'].map(src).join('\n');
fs.writeFileSync(path.join(out, 'core.test.js'),
  '(function(){\n"use strict";\n' + core +
  '\nmodule.exports = { CARDS: CARDS, CARD: CARD, BANNERS: BANNERS, KEYWORDS: KEYWORDS, CAMPAIGN: CAMPAIGN, RULES: RULES,\n' +
  '  newGame: newGame, mulligan: mulligan, playCard: playCard, playBlocker: playBlocker, playOptions: playOptions,\n' +
  '  declareAttack: declareAttack, declareBlocks: declareBlocks, endTurn: endTurn, attackersAvailable: attackersAvailable,\n' +
  '  blockersAvailable: blockersAvailable, canBlock: canBlock, findUnit: findUnit, atkOf: atkOf, healthOf: healthOf, hasKw: hasKw,\n' +
  '  cloneState: cloneState, cardText: cardText, starterDeck: starterDeck, deckProblems: deckProblems, AI: AI, maxCopies: maxCopies };\n})();\n');

if (fs.existsSync(path.join(__dirname, 'src', 'ui.js'))) {
  var js = ['cards.js', 'engine.js', 'ai.js', 'art.js', 'audio.js', 'tutorial.js', 'ui.js'].map(src).join('\n');
  var css = src('fonts.css') + '\n' + src('style.css');
  var body = src('body.html');
  var script = '<script>\n(function(){\n"use strict";\n' + js + '\n})();\n</script>';
  var page = '<title>Sunderfall</title>\n<style>\n' + css + '\n</style>\n' + body + '\n' + script + '\n';
  fs.writeFileSync(path.join(out, 'sunderfall.html'), page);
  var app = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">\n' +
    '<meta name="theme-color" content="#15120f">\n<meta name="apple-mobile-web-app-capable" content="yes">\n' +
    '<title>Sunderfall</title>\n<style>\n' + css + '\n</style>\n</head>\n<body>\n' + body + '\n' + script + '\n</body>\n</html>\n';
  fs.writeFileSync(path.join(out, 'sunderfall-app.html'), app);
  fs.writeFileSync(path.join(out, 'index.html'), app);
  console.log('built page', (page.length / 1024).toFixed(1) + ' KB');
  fs.writeFileSync(path.join(out, 'bundle.js'), '(function(){\n"use strict";\n' + js + '\n})();\n');
}
console.log('built core');
