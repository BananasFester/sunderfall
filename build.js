// Build: concatenates src/ into one IIFE and emits
//   dist/core.test.js            - cards + engine + ai for node tests
//   dist/sunderfall.html         - artifact page (no doctype; host adds skeleton)
//   dist/index.html              - standalone document for Capacitor (webDir: dist)
//   dist/sunderfall-app.html     - same document, named copy
//   index.html                   - same document at the repo root, served by GitHub Pages
//   manifest.webmanifest, icons/ - home-screen install data, written next to both index.html files
var fs = require('fs');
var path = require('path');
var icons = require('./build-icons.js');
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
    '<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n' +
    '<meta name="apple-mobile-web-app-title" content="Sunderfall">\n<link rel="manifest" href="manifest.webmanifest">\n' +
    '<link rel="icon" href="icons/icon-192.png">\n<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">\n' +
    '<title>Sunderfall</title>\n<style>\n' + css + '\n</style>\n</head>\n<body>\n' + body + '\n' + script + '\n</body>\n</html>\n';
  fs.writeFileSync(path.join(out, 'sunderfall-app.html'), app);
  var manifest = JSON.stringify({
    name: 'Sunderfall', short_name: 'Sunderfall', start_url: './', scope: './', display: 'standalone', orientation: 'portrait',
    background_color: '#15120f', theme_color: '#15120f',
    icons: [
      { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  }, null, 2) + '\n';
  var png = { 'icon-192.png': icons.render(192), 'icon-512.png': icons.render(512), 'apple-touch-icon.png': icons.render(180) };
  [out, __dirname].forEach(function (dir) {
    if (!fs.existsSync(path.join(dir, 'icons'))) fs.mkdirSync(path.join(dir, 'icons'));
    Object.keys(png).forEach(function (k) { fs.writeFileSync(path.join(dir, 'icons', k), png[k]); });
    fs.writeFileSync(path.join(dir, 'manifest.webmanifest'), manifest);
    fs.writeFileSync(path.join(dir, 'index.html'), app);
  });
  console.log('built page', (page.length / 1024).toFixed(1) + ' KB');
  fs.writeFileSync(path.join(out, 'bundle.js'), '(function(){\n"use strict";\n' + js + '\n})();\n');
}
console.log('built core');
