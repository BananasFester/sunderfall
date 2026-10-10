// jsdom end-to-end: drives the real UI by tapping data-act elements,
// with a fake clock so full battles run in seconds.
var fs = require('fs');
var path = require('path');
var jsdom = require('jsdom'), JSDOM = jsdom.JSDOM;
var assert = require('assert');

var html = fs.readFileSync(path.join(__dirname, '../dist/sunderfall-app.html'), 'utf8');
var errors = [];
var timers = [], now = 0, tid = 1;

var vc = new jsdom.VirtualConsole();
vc.on('jsdomError', function (e) { if (!/Not implemented/.test(String(e && e.message))) errors.push('jsdom: ' + e.message); });
var dom = new JSDOM(html, { virtualConsole: vc,
  url: 'https://example.test/',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  beforeParse: function (w) {
    w.setTimeout = function (fn, ms) { var id = tid++; timers.push({ id: id, fn: fn, at: now + (ms || 0) }); return id; };
    w.clearTimeout = function (id) { timers = timers.filter(function (t) { return t.id !== id; }); };
    w.addEventListener('error', function (e) { errors.push(e.message || String(e)); });
    w.console.error = function () { errors.push(Array.prototype.join.call(arguments, ' ')); };
  }
});
var w = dom.window, d = w.document;

function flush(maxMs) {
  var limit = now + (maxMs || 60000), guard = 0;
  while (timers.length && guard++ < 5000) {
    timers.sort(function (a, b) { return a.at - b.at; });
    if (timers[0].at > limit) break;
    var t = timers.shift();
    now = Math.max(now, t.at);
    try { t.fn(); } catch (e) { errors.push('timer: ' + (e.stack || e)); }
  }
}
function q(sel) { return d.querySelector(sel); }
function qa(sel) { return Array.prototype.slice.call(d.querySelectorAll(sel)); }
function tap(el) {
  assert(el, 'tap target missing');
  el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));
}
function act(name, arg) {
  var sel = '[data-act="' + name + '"]' + (arg !== undefined ? '[data-arg="' + arg + '"]' : '');
  var el = q(sel);
  assert(el, 'missing ' + sel + ' on screen');
  tap(el);
}
function save() { return JSON.parse(w.localStorage.getItem('sunderfall.save.v1')); }

flush(100);
assert(q('.btile'), 'banner pick screen should show on first run');
act('pickBanner', 'hollow');
act('confirmBanner');
var sv = save();
assert.strictEqual(sv.starter, 'hollow');
assert.strictEqual(sv.decks.length, 1);
assert.strictEqual(sv.decks[0].cards.length, 30);
assert.strictEqual(sv.aurum, 300);
act('go', 'shop');
act('buyPack', 'any');
assert(qa('.flip').length === 5, 'pack shows 5 cards');
act('flip', '0');
act('flipAll');
flush(2000);
act('closeModal');
assert.strictEqual(save().aurum, 200);
act('buyPack', 'forge');
act('flipAll'); flush(2000); act('closeModal');

// collection, crafting
act('go', 'home'); act('go', 'collection');
assert(qa('.ctile').length === 72, 'collection lists every card, got ' + qa('.ctile').length);
act('collOwn', 'missing');
var firstMissing = q('.ctile');
tap(firstMissing);
act('closeModal');
act('go', 'home'); act('go', 'codex'); act('codexTab', 'settings'); act('grantAurum');
assert(save().aurum >= 1000);
act('go', 'home'); act('go', 'shop');
for (var p = 0; p < 6; p++) { act('buyPack', 'any'); act('flipAll'); flush(2000); act('closeModal'); }
act('go', 'home'); act('go', 'collection'); act('collOwn', 'owned');
var starterIds = save().decks[0].cards;
var anyOwned = qa('.ctile').filter(function (t) { return starterIds.indexOf(t.getAttribute('data-arg')) < 0; })[0];
var cid = anyOwned.getAttribute('data-arg');
tap(anyOwned);
var beforeAsh = save().ash, beforeN = save().coll[cid];
act('salvage', cid); act('salvage', cid);
assert.strictEqual(save().coll[cid], beforeN - 1, 'salvage removes a copy');
assert(save().ash > beforeAsh, 'salvage gives ash');
act('closeModal');

// deck builder: new deck from owned cards
act('go', 'home'); act('go', 'decks'); act('newDeck');
var guard = 0;
while (guard++ < 200) {
  var tiles = qa('.ctile[data-act="deAdd"]').filter(function (t) { return !t.querySelector('.card.unowned'); });
  var cnt = +q('.de-count').firstChild.textContent;
  if (cnt >= 30 || !tiles.length) break;
  tap(tiles[0]);
}
var cntNow = +q('.de-count').firstChild.textContent;
assert(cntNow > 0, 'deck builder added cards');
act('deTab', 'deck');
assert(qa('.drow').length > 0, 'deck rows render');
act('deRemove', qa('.drow')[0].querySelector('[data-act="deRemove"]').getAttribute('data-arg'));
assert.strictEqual(+q('.de-count').firstChild.textContent, cntNow - 1);
q('#deckname').value = 'Test Build';
act('deDone');
assert(save().decks.some(function (x) { return x.name === 'Test Build'; }), 'new deck saved');
// keep starter active for fights
if (q('[data-act="useDeck"][data-arg="' + save().decks[0].id + '"]')) act('useDeck', save().decks[0].id);
assert.strictEqual(save().active, save().decks[0].id, 'starter stays active');

// play full battles through the UI
function playBattle(label) {
  flush(200);
  assert(q('.mull'), label + ': mulligan shown');
  var mc = q('.mull [data-act="mullToggle"]'); tap(mc); tap(q('.mull [data-act="mullToggle"]'));
  act('mullGo');
  var steps = 0;
  while (steps++ < 1500) {
    flush(4000);
    if (q('[data-act="leaveBattle"]')) break;
    if (q('[data-act="blkGo"]')) {
      var bl = q('#board0 .unit.can-block'), at = q('#board1 .unit.attacking');
      if (bl && at) { tap(bl); tap(at); }
      act('blkGo'); continue;
    }
    var status = q('#bstatus') ? q('#bstatus').textContent : '';
    if (/Choose a target/.test(status)) {
      var t = q('#battle .target');
      if (t) { tap(t); continue; }
      act('tgtCancel'); continue;
    }
    var playable = q('#hand .card.playable');
    if (playable) {
      tap(playable);
      var pb = q('[data-act="playHand"]');
      if (pb && !pb.classList.contains('off')) tap(pb); else act('closeModal');
      continue;
    }
    if (q('[data-act="tipOk"]')) { act('tipOk'); continue; }
    if (q('[data-act="atkStart"]')) {
      act('atkStart');
      var gg = 0; while (q('#board0 .unit.can-act') && gg++ < 8) tap(q('#board0 .unit.can-act'));
      if (q('[data-act="atkGo"]:not(.off)')) act('atkGo'); else act('atkCancel');
      continue;
    }
    if (q('[data-act="endTurn"]')) { act('endTurn'); continue; }
    flush(10000);
  }
  assert(q('[data-act="leaveBattle"]'), label + ': battle reached a result in ' + steps + ' steps');
  var won = /Victory/.test(q('.result .big').textContent);
  act('leaveBattle');
  return won;
}

act('go', 'home'); act('go', 'campaign');
act('stage', '0');
act('fightStage');
var r1 = playBattle('campaign 1');
console.log('Campaign stage 1: ' + (r1 ? 'won' : 'lost') + '  cleared=' + save().camp.cleared + ' aurum=' + save().aurum);

act('go', 'home'); act('go', 'skirmish');
var results = [];
for (var lv = 1; lv <= 3; lv++) {
  act('skLevel', String(lv));
  act('fightSkirmish');
  results.push(playBattle('skirmish L' + lv));
  if (!q('[data-act="fightSkirmish"]')) { act('go', 'home'); act('go', 'skirmish'); }
}
console.log('Skirmish results (L1..L3): ' + results.map(function (x) { return x ? 'W' : 'L'; }).join(' '));

// concede path + rematch
act('skLevel', '2'); act('fightSkirmish'); flush(200); act('mullGo'); flush(3000);
act('bmenu'); act('concede'); act('concede'); flush(2000);
assert(q('[data-act="rematch"]'), 'result after concede');
act('rematch'); flush(200);
assert(q('.mull'), 'rematch starts a new battle');
act('mullGo'); flush(3000);
act('bmenu'); act('showLog'); assert(qa('.logbox div').length > 0, 'battle log has entries'); act('closeModal');
act('bmenu'); act('concede'); act('concede'); flush(2000); act('leaveBattle');

// reload keeps progress
var stats = save().stats;
assert.strictEqual(stats.w + stats.l, 6, 'six battles recorded, got ' + (stats.w + stats.l));
console.log('Record: ' + stats.w + 'W ' + stats.l + 'L, unique cards ' + Object.keys(save().coll).length);

// duplicate id check across every screen we can reach
['home', 'campaign', 'skirmish', 'collection', 'decks', 'shop', 'codex'].forEach(function (scr) {
  if (!q('.logo')) act('go', 'home');
  if (scr !== 'home') act('go', scr);
  var ids = qa('[id]').map(function (e) { return e.id; });
  var dup = ids.filter(function (x, i) { return ids.indexOf(x) !== i; });
  assert(!dup.length, 'duplicate ids on ' + scr + ': ' + dup.join(','));
});
['world', 'banners', 'rules', 'kw', 'settings'].forEach(function (t) { act('codexTab', t); });

if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exit(1); }
console.log('UI FLOW OK');
