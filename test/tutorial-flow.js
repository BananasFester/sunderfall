// Drives the Drill-Yard tutorial end to end in jsdom by tapping exactly what
// each step spotlights, and checks that off-script taps are refused.
var fs = require('fs'), path = require('path'), jsdom = require('jsdom'), JSDOM = jsdom.JSDOM, assert = require('assert');
var html = fs.readFileSync(path.join(__dirname, '../dist/sunderfall-app.html'), 'utf8');
var errors = [], timers = [], now = 0, tid = 1;
var vc = new jsdom.VirtualConsole();
vc.on('jsdomError', function (e) { if (!/Not implemented/.test(String(e && e.message))) errors.push('jsdom: ' + e.message); });
var dom = new JSDOM(html, { virtualConsole: vc, url: 'https://example.test/', runScripts: 'dangerously', pretendToBeVisual: true, beforeParse: function (w) {
  w.__SF_TEST__ = {};
  w.setTimeout = function (fn, ms) { var id = tid++; timers.push({ id: id, fn: fn, at: now + (ms || 0) }); return id; };
  w.clearTimeout = function (id) { timers = timers.filter(function (t) { return t.id !== id; }); };
  w.addEventListener('error', function (e) { errors.push(e.message || String(e)); });
  w.console.error = function () { errors.push(Array.prototype.join.call(arguments, ' ')); };
}});
var w = dom.window, d = w.document;
function flush(ms) { var lim = now + ms, g = 0; while (timers.length && g++ < 5000) { timers.sort(function (a, b) { return a.at - b.at; }); if (timers[0].at > lim) break; var t = timers.shift(); now = Math.max(now, t.at); try { t.fn(); } catch (e) { errors.push('timer: ' + (e.stack || e)); } } }
function q(s) { return d.querySelector(s); }
function tap(el) { assert(el, 'tap target missing'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true })); }
function act(n, a) { tap(q('[data-act="' + n + '"]' + (a !== undefined ? '[data-arg="' + a + '"]' : ''))); }
var peek = function () { return w.__SF_TEST__.peek(); };

flush(50);
act('pickBanner', 'eld'); act('confirmBanner');
assert(q('[data-act="startTut"]'), 'welcome offers the drill');
act('startTut');
flush(100);
var T = peek().Tut;
assert(T.active(), 'tutorial running');
// gating: End Turn on step 1 must be refused
var turnBefore = peek().B.s.turn;
if (q('[data-act="endTurn"]')) tap(q('[data-act="endTurn"]'));
assert.strictEqual(peek().B.s.turn, turnBefore, 'off-script End Turn refused');
assert(q('.toast'), 'nudge toast shown');

var guard = 0, lastIdx = -1, stuck = 0, log = [];
while (guard++ < 600) {
  flush(3000);
  var p = peek();
  if (!p.B) break;
  if (q('[data-act="leaveBattle"]')) break;
  if (!T.active()) {
    // free play after the drill: finish the battle with simple play
    if (q('[data-act="blkGo"]')) { act('blkGo'); continue; }
    var pl = q('#hand .card.playable');
    if (pl) { tap(pl); var pb = q('[data-act="playHand"]'); if (pb && !pb.classList.contains('off')) tap(pb); else act('closeModal');
      if (/Choose a target/.test(q('#bstatus').textContent)) { var tg = q('#battle .target'); if (tg) tap(tg); else act('tgtCancel'); } continue; }
    if (q('[data-act="atkStart"]')) { act('atkStart'); var gg = 0; while (q('#board0 .unit.can-act') && gg++ < 8) tap(q('#board0 .unit.can-act')); if (q('[data-act="atkGo"]:not(.off)')) act('atkGo'); else act('atkCancel'); continue; }
    if (q('[data-act="endTurn"]')) { act('endTurn'); continue; }
    continue;
  }
  var idx = T.index();
  if (idx !== lastIdx) { log.push(idx); lastIdx = idx; stuck = 0; } else stuck++;
  assert(stuck < 40, 'tutorial stuck on step ' + (idx + 1) + ': ' + (q('.coach p') ? q('.coach p').textContent : '(no coach)') + ' mode=' + p.B.mode + ' turn=' + p.B.s.turn);
  if (!q('.coach')) continue; // waiting for the enemy turn
  if (T.isInfo()) { act('tutNext'); continue; }
  var f = T.focusEl();
  if (f) tap(f);
}
assert(q('[data-act="leaveBattle"]'), 'tutorial battle reached a result');
var won = /Drill done/.test(q('.result .big').textContent);
console.log('Steps visited: ' + log.map(function (x) { return x + 1; }).join(','));
console.log('Tutorial result: ' + q('.result .big').textContent + ', tutorialDone=' + JSON.parse(w.localStorage.getItem('sunderfall.save.v1')).tutorialDone);
assert(log.length >= 20, 'visited most steps');
act('leaveBattle');
assert(q('.logo'), 'back on home');
if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exit(1); }
console.log('TUTORIAL OK');
