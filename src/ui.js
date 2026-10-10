/* ============================================================
   SUNDERFALL - interface: screens, battle view, saves
   ============================================================ */

var SAVE_KEY = 'sunderfall.save.v1';
var App = { save: null, screen: 'home', params: {}, edit: null, filt: { coll: 'all', own: 'all', add: 'all' }, pickBanner: null, codexTab: 'world', armed: {} };
var B = null; // live battle

/* ---------- small helpers ---------- */
function $(id) { return document.getElementById(id); }
function esc(t) {
  return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
function toast(msg) {
  var r = $('toast-root');
  r.innerHTML = '<div class="toast">' + esc(msg) + '</div>';
}
function sortCards(ids) {
  var order = { auric: 0, eld: 1, hollow: 2, forge: 3, unbound: 4 };
  return ids.slice().sort(function (a, b) {
    var A = CARD[a], Bc = CARD[b];
    return (order[A.banner] - order[Bc.banner]) || (A.cost - Bc.cost) || (A.name < Bc.name ? -1 : 1);
  });
}
function countIds(ids) {
  var o = {};
  for (var i = 0; i < ids.length; i++) o[ids[i]] = (o[ids[i]] || 0) + 1;
  return o;
}
function primaryBanner(ids) {
  var c = {}, best = 'unbound', n = 0;
  for (var i = 0; i < ids.length; i++) {
    var b = CARD[ids[i]] ? CARD[ids[i]].banner : null;
    if (!b || b === 'unbound') continue;
    c[b] = (c[b] || 0) + 1;
    if (c[b] > n) { n = c[b]; best = b; }
  }
  return best;
}
function bannerChip(b) { return '<span class="chip"><i style="background:' + BANNER_INK[b] + '"></i>' + esc(BANNERS[b].short) + '</span>'; }
function roman(n) { return ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][n] || String(n); }

/* ---------- saves ---------- */
function freshSave() {
  return { v: 1, starter: null, aurum: 0, ash: 0, coll: {}, decks: [], active: null, camp: { cleared: 0 },
    stats: { w: 0, l: 0 }, settings: { sound: true, tips: true }, seen: {}, newCards: {}, freePacks: 0, tutorialDone: false, savedAt: 0 };
}
function normalizeSave(o) {
  var f = freshSave();
  for (var k in f) { if (f.hasOwnProperty(k) && (o[k] === undefined || o[k] === null) && k !== 'starter' && k !== 'active') o[k] = f[k]; }
  if (!o.settings) o.settings = f.settings;
  if (!o.camp) o.camp = f.camp;
  if (!Array.isArray(o.decks)) o.decks = [];
  return o;
}
function loadSave() {
  try {
    var t = localStorage.getItem(SAVE_KEY);
    if (t) { var o = JSON.parse(t); if (o && o.v === 1) return normalizeSave(o); }
  } catch (e) { /* storage unavailable */ }
  return freshSave();
}
function persist() {
  App.save.savedAt = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(App.save)); } catch (e) { /* storage unavailable */ }
  Cloud.push(App.save);
}

/* Optional cloud copy when running inside a claude.ai artifact viewer.
   Outside the viewer (Capacitor, GitHub Pages) window.claude is absent and
   the game uses localStorage only. */
var Cloud = (function () {
  var ref = null, timer = null, disabled = false, pending = null;
  function flush() {
    if (!ref || !pending || disabled) return;
    var body = { save: JSON.parse(JSON.stringify(pending)) };
    pending = null;
    ref.set(body).catch(function (e) { if (e && e.code === 'invalid_argument') disabled = true; });
  }
  function init(onRemote) {
    var cl = window.claude;
    if (!cl || typeof cl.use !== 'function') return;
    Promise.all([cl.use('db'), cl.use('user')]).then(function (r) {
      var db = r[0], user = r[1];
      if (!db || !user) return null;
      return user.id().then(function (id) {
        if (!id) return null;
        ref = db.doc('data/users/' + id + '/save');
        return ref.get().then(function (snap) {
          var d = snap.exists ? snap.data() : null;
          if (d && d.save && typeof d.save === 'object') onRemote(d.save);
          if (pending) flush();
        });
      });
    }).catch(function () { disabled = true; });
  }
  function push(save) {
    if (disabled) return;
    pending = save;
    if (!ref) return;
    clearTimeout(timer);
    timer = setTimeout(flush, 1500);
  }
  return { init: init, push: push };
})();

function onRemoteSave(remote) {
  if (remote && remote.v === 1 && (remote.savedAt || 0) > (App.save.savedAt || 0)) {
    App.save = normalizeSave(remote);
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(App.save)); } catch (e) { /* ignore */ }
    Sfx.setOn(App.save.settings.sound);
    if (App.screen !== 'battle') render();
  } else if (App.save.starter) {
    Cloud.push(App.save);
  }
}

function activeDeck() {
  var s = App.save;
  for (var i = 0; i < s.decks.length; i++) if (s.decks[i].id === s.active) return s.decks[i];
  return s.decks[0] || null;
}
function deckById(id) {
  for (var i = 0; i < App.save.decks.length; i++) if (App.save.decks[i].id === id) return App.save.decks[i];
  return null;
}
function newDeckId() { return 'd' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36); }
function ownedUnique() { var n = 0; for (var k in App.save.coll) if (App.save.coll.hasOwnProperty(k) && App.save.coll[k] > 0) n++; return n; }

/* ---------- card rendering ---------- */
function kwLine(c) { return c.kw.map(function (k) { return KEYWORDS[k].name; }).join(', '); }
function rulesHTML(c) {
  return esc(cardText(c)).replace(/(^|\n)(Deploy|Last Breath|Dawn|Dusk|Assault|Harvest|Empower):/g, '$1<b>$2:</b>');
}
function cardHTML(id, o) {
  o = o || {};
  var c = CARD[id], Bn = BANNERS[c.banner], R = RARITY[c.rarity];
  var cls = 'card ' + (c.type === 'spell' ? 'spell' : 'unit-card') + (o.mini ? ' mini' : '') + (c.rarity === 'M' && !c.token ? ' myth' : '') + (o.cls ? ' ' + o.cls : '');
  var style = '--bc:' + BANNER_INK[c.banner] + ';' + (o.w ? '--w:' + o.w + 'px;' : '');
  var atk = o.atk !== undefined ? o.atk : c.atk, hp = o.hp !== undefined ? o.hp : c.hp;
  var stats = c.type === 'unit' ? '<div class="c-stat a">' + atk + '</div><div class="c-stat h">' + hp + '</div>' : '';
  var cost = '<div class="c-cost"><span>' + c.cost + '</span></div>';
  var attrs = o.attrs || '';
  if (o.mini) {
    return '<div class="' + cls + '" style="' + style + '" ' + attrs + '><div class="c-head">' + cost + '</div><div class="c-art">' + Art.card(c) +
      '</div><div class="m-name">' + esc(c.name) + '</div>' + stats + '</div>';
  }
  var kw = kwLine(c), text = cardText(c);
  var typeLine = '<i class="bmark"></i>' + (c.legendary ? 'Legendary ' : '') + (c.token ? 'Token ' : '') + (c.type === 'unit' ? 'Unit' : 'Spell') + ' &middot; ' + esc(Bn.short);
  var showLore = o.lore !== false && (kw.length + text.length) < 72;
  return '<div class="' + cls + '" style="' + style + '" ' + attrs + '><div class="c-head">' + cost + '<div class="c-name">' + esc(c.name) + '</div></div>' +
    '<div class="c-art">' + Art.card(c) + '</div>' +
    '<div class="c-type"><span>' + typeLine + '</span><span class="rmark ' + c.rarity + '">' + R.name.charAt(0) + '</span></div>' +
    '<div class="c-text">' + (kw ? '<div class="kwl">' + esc(kw) + '</div>' : '') + (text ? '<div class="rules">' + rulesHTML(c) + '</div>' : '') +
    (showLore ? '<div class="lore">' + esc(c.lore) + '</div>' : '') + '</div>' + stats + '</div>';
}

function explainList(c, extraKw) {
  var rows = [], seen = {}, i;
  var kws = c.kw.slice();
  if (c.aura && c.aura.kw) kws.push(c.aura.kw);
  for (i = 0; i < c.fx.length; i++) {
    if (c.fx[i]['do'] === 'grant') kws.push(c.fx[i].kw);
    if (c.fx[i]['do'] === 'shield') kws.push('shielded');
    if (c.fx[i].token && CARD[c.fx[i].token]) kws = kws.concat(CARD[c.fx[i].token].kw);
  }
  if (extraKw) kws = kws.concat(extraKw);
  for (i = 0; i < kws.length; i++) {
    var k = kws[i];
    if (seen[k] || !KEYWORDS[k]) continue;
    seen[k] = 1;
    rows.push('<div>' + kwGlyph(k) + '<span><b>' + KEYWORDS[k].name + '.</b> ' + esc(KEYWORDS[k].desc) + '</span></div>');
  }
  for (i = 0; i < c.fx.length; i++) {
    var on = c.fx[i].on;
    if (on === 'cast' || seen['t_' + on] || !TRIGGERS[on]) continue;
    seen['t_' + on] = 1;
    rows.push('<div><span class="kwg" style="background:none"></span><span><b>' + TRIGGERS[on].name + '.</b> ' + esc(TRIGGERS[on].desc) + '</span></div>');
  }
  return rows.length ? '<div class="kwlist">' + rows.join('') + '</div>' : '';
}

/* ---------- modal plumbing ---------- */
function openModal(inner, dismiss, kind) {
  App.modalKind = kind || '';
  $('modal-root').innerHTML = '<div class="modal" data-act="modalBg" data-arg="' + (dismiss === false ? '0' : '1') + '">' + inner + '</div>';
  if (B && B.tut) Tut.refresh();
}
function closeModal() {
  $('modal-root').innerHTML = '';
  App.modalKind = '';
  if (B && B.tut) Tut.refresh();
}
function modalOpen() { return !!$('modal-root').firstChild; }

/* ============================================================
   SCREENS
   ============================================================ */
function go(screen, params) {
  if (screen !== 'battle' && B) stopBattle();
  App.screen = screen;
  App.params = params || {};
  App.armed = {};
  closeModal();
  render();
}

function render() {
  var v = $('view');
  if (!App.save.starter && App.screen !== 'pick') App.screen = 'pick';
  var html = '';
  switch (App.screen) {
    case 'pick': html = viewPick(); break;
    case 'home': html = viewHome(); break;
    case 'campaign': html = viewCampaign(); break;
    case 'skirmish': html = viewSkirmish(); break;
    case 'collection': html = viewCollection(); break;
    case 'decks': html = viewDecks(); break;
    case 'deckedit': html = viewDeckEdit(); break;
    case 'shop': html = viewShop(); break;
    case 'codex': html = viewCodex(); break;
    case 'battle': return;
    default: html = viewHome();
  }
  v.id = 'view';
  v.className = 'screen';
  v.innerHTML = html;
}

function topBar(title, backTo, right) {
  return '<div class="bar">' + (backTo ? '<button class="iconbtn" data-act="go" data-arg="' + backTo + '" aria-label="Back">' + GLYPH.back + '</button>' : '') +
    '<h1>' + esc(title) + '</h1>' + (right || wallet()) + '</div>';
}
function wallet() {
  return '<div class="wallet"><span class="aur">' + GLYPH.coin + App.save.aurum + '</span><span class="ash">' + GLYPH.ash + App.save.ash + '</span></div>';
}

/* ---------- banner pick (first run) ---------- */
function viewPick() {
  var tiles = BANNER_ORDER.map(function (b) {
    var Bn = BANNERS[b];
    return '<button class="btile' + (App.pickBanner === b ? ' on' : '') + '" data-act="pickBanner" data-arg="' + b + '">' +
      Art.sigil(b) + '<span><b>' + esc(Bn.name) + '</b><p>' + esc(Bn.blurb) + '</p><span class="chip">' + esc(Bn.tag) + '</span></span></button>';
  }).join('');
  var sel = App.pickBanner;
  return '<div class="bar"><h1>Sunderfall</h1></div><div class="scroll">' +
    '<div class="home-hero">' + (Art.hero() || '<span class="heroart ph"></span>') + '</div>' +
    '<p class="pick-intro">The god-star Aurelion has been murdered and its shards rain across the world. Every banner wants them. You are a Warden, and your first oath decides who marches with you.</p>' +
    '<div class="bpick">' + tiles + '</div>' +
    '<div style="margin-top:16px"><button class="btn primary block' + (sel ? '' : ' off') + '" data-act="confirmBanner">' +
    (sel ? 'Swear to the ' + esc(BANNERS[sel].name) : 'Choose a banner') + '</button></div>' +
    '<p class="muted" style="font-size:13px;text-align:center;margin-top:10px">You can collect and play every banner later. This picks your starter deck.</p></div>';
}

/* ---------- home ---------- */
function viewHome() {
  var s = App.save, d = activeDeck();
  var stage = Math.min(s.camp.cleared + 1, CAMPAIGN.length);
  var campSub = s.camp.cleared >= CAMPAIGN.length ? 'All eight claims taken. Replay any stage.' : 'Stage ' + stage + ' of ' + CAMPAIGN.length + ': ' + CAMPAIGN[stage - 1].name;
  var drill = ['tutorial', 'helm', 'Drill-Yard', s.tutorialDone ? 'Replay the guided first battle' : 'Learn to play in a guided battle', false, true];
  var items = [
    ['campaign', 'crown', 'Campaign', campSub, true],
    ['skirmish', 'sword', 'Skirmish', 'A quick battle against the AI', false],
    ['decks', 'book', 'Decks', d ? 'Active: ' + d.name : 'Build a deck', false],
    ['collection', 'orb', 'Collection', ownedUnique() + ' of ' + CARDS.length + ' cards found', false],
    ['shop', 'star', 'Packs', s.freePacks ? plural(s.freePacks, 'free pack') + ' waiting' : 'Five cards a pack, one rare or better', false],
    ['codex', 'scroll', 'Codex', 'The world, the banners, how to play', false]
  ];
  if (s.tutorialDone) items.push(drill); else items.unshift(drill);
  return '<div class="bar"><h1 style="font-size:22px">Warden of the ' + esc(BANNERS[s.starter].short) + '</h1>' + wallet() +
    '<button class="iconbtn" data-act="toggleSound" aria-label="Sound">' + (s.settings.sound ? GLYPH.sound : GLYPH.mute) + '</button></div>' +
    '<div class="scroll"><div class="home-hero">' + (Art.hero() || '<span class="heroart ph"></span>') + '<h2 class="logo">Sunderfall</h2>' +
    '<p class="tagline">The god-star is shattered. Its shards are yours to claim.</p></div>' +
    '<div class="menu">' + items.map(function (it) {
      return '<button class="mi' + (it[4] ? ' feature' : '') + (it[5] ? ' learn' : '') + '" data-act="' + (it[0] === 'tutorial' ? 'startTut' : 'go') + '" data-arg="' + it[0] + '"><span class="mi-ico">' + Art.icon(it[1]) + '</span>' +
        '<span><b>' + it[2] + '</b><small>' + esc(it[3]) + '</small></span><span class="chev">' + GLYPH.back.replace('M15 4 L7 12 L15 20', 'M9 4 L17 12 L9 20') + '</span></button>';
    }).join('') + '</div>' +
    '<div class="home-foot"><span>Victories ' + s.stats.w + '</span><span>Defeats ' + s.stats.l + '</span></div></div>';
}

/* ---------- campaign ---------- */
function viewCampaign() {
  var s = App.save;
  var rows = CAMPAIGN.map(function (st, i) {
    var done = st.id <= s.camp.cleared, next = st.id === s.camp.cleared + 1, locked = st.id > s.camp.cleared + 1;
    var stateHTML = done ? GLYPH.check + '<small>Taken</small>' : next ? Art.icon('sword', 'g') + '<small>Fight</small>' : GLYPH.lock + '<small>Locked</small>';
    var diff = '<span class="diff">' + [1, 2, 3].map(function (n) { return '<i class="' + (n <= st.level ? 'on' : '') + '"></i>'; }).join('') + '</span>';
    return '<button class="stage' + (done ? ' done' : '') + (next ? ' next' : '') + (locked ? ' locked' : '') + '" data-act="stage" data-arg="' + i + '">' +
      '<span class="num">' + roman(i + 1) + '</span>' + Art.portrait(st.name, st.banners[0], st.icon) + '<span><b>' + esc(st.name) + '</b><span class="sub">' + esc(st.title) + '</span>' +
      '<span class="chips">' + st.banners.map(bannerChip).join('') + '<span class="chip">' + diff + '</span></span></span>' +
      '<span class="state">' + stateHTML + '</span></button>';
  }).join('');
  return topBar('The Road', 'home') + '<div class="scroll"><p class="prose" style="margin:0 0 14px">Eight shard-holders stand between you and the crater where the star fell. Take each claim in turn.</p><div class="road">' + rows + '</div></div>';
}

function deckPicker(selId) {
  var decks = App.save.decks;
  if (!decks.length) return '<p class="muted">You have no decks yet.</p>';
  return '<div class="deckpick">' + decks.map(function (d) {
    var bad = deckProblems(d.cards, App.save.coll).length > 0;
    return '<button class="' + (d.id === selId ? 'on' : '') + (bad ? ' bad' : '') + '" data-act="pickDeck" data-arg="' + d.id + '"><span>' + esc(d.name) + '</span>' +
      (bad ? '<span class="badc">Needs fixing</span>' : '<span class="chips">' + deckBanners(d.cards).map(bannerChip).join('') + '</span>') + '</button>';
  }).join('') + '</div>';
}

function openStage(i) {
  var st = CAMPAIGN[i], s = App.save;
  if (st.id > s.camp.cleared + 1) { toast('Take the earlier claims first.'); Sfx.play('error'); return; }
  App.params.stage = i;
  var d = activeDeck();
  var first = st.id > s.camp.cleared;
  var reward = first ? st.reward + ' Aurum' + (st.pack ? ' and a free pack' : '') + (st.mythic ? ' and a Mythic card' : '') : '40 Aurum (replay)';
  var ok = d && !deckProblems(d.cards, s.coll).length;
  openModal('<div class="panel"><div style="display:flex;gap:12px;align-items:center">' + Art.portrait(st.name, st.banners[0], st.icon) +
    '<div><div class="eyebrow">Claim ' + roman(i + 1) + ' of VIII</div><h3>' + esc(st.name) + '</h3><div class="muted" style="font:17px var(--f-old)">' + esc(st.title) + '</div></div></div>' +
    '<p class="prose" style="font-size:17px;margin-top:12px">' + esc(st.text) + '</p>' +
    '<div class="chips" style="margin:8px 0">' + st.banners.map(bannerChip).join('') + '<span class="chip">' + st.life + ' health</span><span class="chip">' +
    ['', 'Squire', 'Knight', 'Warlord'][st.level] + ' AI</span></div>' +
    '<p style="font-size:14px"><b class="muted">Reward:</b> ' + esc(reward) + '</p>' +
    '<div class="eyebrow" style="margin-top:12px">Your deck</div>' + deckPicker(d ? d.id : null) +
    '<div class="row"><button class="btn ghost" data-act="closeModal">Not yet</button><button class="btn primary' + (ok ? '' : ' off') + '" data-act="fightStage">Fight</button></div></div>');
}

/* ---------- skirmish ---------- */
function viewSkirmish() {
  var lvl = App.params.lvl || 2;
  var d = activeDeck();
  var ok = d && !deckProblems(d.cards, App.save.coll).length;
  return topBar('Skirmish', 'home') + '<div class="scroll"><p class="prose" style="margin:0 0 12px">A random rival with a random banner. Good for testing decks and earning Aurum.</p>' +
    '<div class="skl">' + SKIRMISH_LEVELS.map(function (L) {
      return '<button class="' + (L.level === lvl ? 'on' : '') + '" data-act="skLevel" data-arg="' + L.level + '"><b>' + L.name + '<span class="price">' + GLYPH.coin + L.reward + '</span></b><p>' + esc(L.desc) + '</p></button>';
    }).join('') + '</div><h2 class="sec">Your deck</h2>' + deckPicker(d ? d.id : null) +
    '<div style="margin-top:16px"><button class="btn primary block' + (ok ? '' : ' off') + '" data-act="fightSkirmish">Find a rival</button></div>' +
    (ok ? '' : '<p class="probs" style="margin-top:8px">Your active deck needs fixing before it can fight. Open Decks to see what is missing.</p>') + '</div>';
}

/* ---------- collection ---------- */
function viewCollection() {
  var s = App.save, f = App.filt.coll, own = App.filt.own;
  var ids = sortCards(CARDS.map(function (c) { return c.id; })).filter(function (id) {
    if (f !== 'all' && CARD[id].banner !== f) return false;
    if (own === 'owned' && !(s.coll[id] > 0)) return false;
    if (own === 'missing' && s.coll[id] > 0) return false;
    return true;
  });
  var have = ownedUnique();
  var filters = '<div class="filters">' + ['all'].concat(BANNER_ORDER, ['unbound']).map(function (b) {
    return '<button class="chip' + (f === b ? ' on' : '') + '" data-act="collFilter" data-arg="' + b + '">' + (b === 'all' ? 'All' : '<i style="background:' + BANNER_INK[b] + '"></i>' + esc(BANNERS[b].short)) + '</button>';
  }).join('') + '</div>';
  var seg = '<div class="seg" style="margin:10px 0 14px">' + [['all', 'All cards'], ['owned', 'Owned'], ['missing', 'Missing']].map(function (o) {
    return '<button class="' + (own === o[0] ? 'on' : '') + '" data-act="collOwn" data-arg="' + o[0] + '">' + o[1] + '</button>';
  }).join('') + '</div>';
  var grid = ids.map(function (id) {
    var n = s.coll[id] || 0;
    return '<button class="ctile" data-act="collCard" data-arg="' + id + '">' + cardHTML(id, { mini: true, cls: n ? '' : 'unowned' }) +
      (s.newCards[id] ? '<span class="newtag">NEW</span>' : '') + '<span class="own' + (n ? ' in' : '') + '">' + n + ' / ' + maxCopies(id) + '</span></button>';
  }).join('');
  return topBar('Collection', 'home') + '<div class="scroll"><div class="eyebrow">' + have + ' of ' + CARDS.length + ' found</div>' +
    '<div class="progress"><i style="width:' + Math.round(100 * have / CARDS.length) + '%"></i></div>' + filters + seg +
    (ids.length ? '<div class="cgrid">' + grid + '</div>' : '<p class="muted">Nothing here yet. Open packs in the Shop.</p>') + '</div>';
}

function openCollCard(id) {
  var s = App.save, c = CARD[id], n = s.coll[id] || 0, R = RARITY[c.rarity];
  if (s.newCards[id]) { delete s.newCards[id]; persist(); }
  var canCraft = n < maxCopies(id) && s.ash >= R.craft;
  var armed = App.armed.salvage === id;
  openModal('<div class="zoom">' + cardHTML(id, { lore: false }) +
    '<div class="extra"><p class="lore-line">' + esc(c.lore) + '</p>' +
    explainList(c) +
    '<div class="state"><span class="chip">' + R.name + '</span><span class="chip">Owned ' + n + ' / ' + maxCopies(id) + '</span>' + bannerChip(c.banner) + '</div>' +
    '<div class="row" style="margin:0;display:flex;gap:8px">' +
    '<button class="btn' + (canCraft ? ' primary' : ' off') + '" style="flex:1" data-act="craft" data-arg="' + id + '">Craft ' + GLYPH.ash + R.craft + '</button>' +
    '<button class="btn' + (n ? (armed ? ' red' : '') : ' off') + '" style="flex:1" data-act="salvage" data-arg="' + id + '">' + (armed ? 'Tap again' : 'Salvage +' + R.salvage) + '</button></div>' +
    '<button class="btn ghost block" data-act="closeModal">Close</button></div></div>');
}

/* ---------- decks ---------- */
function viewDecks() {
  var s = App.save;
  var list = s.decks.map(function (d) {
    var probs = deckProblems(d.cards, s.coll), on = d.id === s.active;
    var armed = App.armed.del === d.id;
    return '<div class="dcard' + (on ? ' on' : '') + '"><div class="top"><b>' + esc(d.name) + '</b>' + (on ? '<span class="chip" style="background:var(--blood);color:var(--bone-hi);border-color:#000">Active</span>' : '') + '</div>' +
      '<div class="chips">' + deckBanners(d.cards).map(bannerChip).join('') + '<span class="chip">' + d.cards.length + ' / 30</span></div>' +
      (probs.length ? '<div class="probs">' + esc(probs.slice(0, 2).join(' · ')) + '</div>' : '<div class="okc">Ready to fight</div>') +
      '<div class="acts">' + (on ? '' : '<button class="btn small" data-act="useDeck" data-arg="' + d.id + '">Make active</button>') +
      '<button class="btn small" data-act="editDeck" data-arg="' + d.id + '">Edit</button>' +
      '<button class="btn small" data-act="copyDeck" data-arg="' + d.id + '">Copy</button>' +
      (s.decks.length > 1 ? '<button class="btn small' + (armed ? ' red' : ' ghost') + '" data-act="delDeck" data-arg="' + d.id + '">' + (armed ? 'Tap to delete' : 'Delete') + '</button>' : '') +
      '</div></div>';
  }).join('');
  return topBar('Decks', 'home') + '<div class="scroll"><div style="display:flex;gap:8px;margin-bottom:12px"><button class="btn primary" style="flex:1" data-act="newDeck">' + GLYPH.plus + ' New deck</button></div>' +
    '<div class="decklist">' + list + '</div>' +
    '<p class="muted" style="font-size:13px;margin-top:14px">Decks hold exactly 30 cards from up to two banners, plus any Unbound cards. Two copies of a card at most, one of a Legendary.</p></div>';
}

function curveHTML(cards) {
  var buckets = [0, 0, 0, 0, 0, 0, 0, 0], mx = 1;
  cards.forEach(function (id) { var k = Math.min(7, CARD[id].cost); buckets[k]++; });
  buckets.forEach(function (n) { if (n > mx) mx = n; });
  return '<div class="curve" aria-label="Shard curve">' + buckets.map(function (n, i) {
    return '<div><i style="height:' + Math.round(26 * n / mx) + 'px"></i><span>' + (i === 7 ? '7+' : i) + '</span></div>';
  }).join('') + '</div>';
}

function viewDeckEdit() {
  var e = App.edit, s = App.save;
  if (!e) return viewDecks();
  var tab = App.params.tab || 'deck';
  var probs = deckProblems(e.cards, s.coll);
  var counts = countIds(e.cards);
  var head = '<div class="de-head"><input id="deckname" type="text" maxlength="28" value="' + esc(e.name) + '" aria-label="Deck name">' +
    '<div class="de-stats"><div class="de-count">' + e.cards.length + '<small> / 30</small></div>' + curveHTML(e.cards) +
    '<div class="chips" style="flex:1;justify-content:flex-end">' + deckBanners(e.cards).map(bannerChip).join('') + '</div></div>' +
    (probs.length ? '<div class="probs">' + esc(probs.slice(0, 3).join(' · ')) + '</div>' : '<div class="okc">Ready to fight</div>') +
    '<div class="seg"><button class="' + (tab === 'deck' ? 'on' : '') + '" data-act="deTab" data-arg="deck">In deck</button><button class="' + (tab === 'add' ? 'on' : '') + '" data-act="deTab" data-arg="add">Add cards</button></div></div>';
  var body;
  if (tab === 'deck') {
    var uniq = sortCards(Object.keys(counts));
    uniq.sort(function (a, b) { return CARD[a].cost - CARD[b].cost || (CARD[a].name < CARD[b].name ? -1 : 1); });
    body = uniq.length ? '<div class="drows">' + uniq.map(function (id) {
      var c = CARD[id];
      return '<div class="drow" style="--bc:' + BANNER_INK[c.banner] + '" data-act="zoomCard" data-arg="' + id + '"><span class="cc"><span>' + c.cost + '</span></span><span class="nm">' + esc(c.name) + '</span>' +
        '<span class="ct">&times;' + counts[id] + '</span><button class="iconbtn rm" style="width:32px;height:32px" data-act="deRemove" data-arg="' + id + '" aria-label="Remove one">' + GLYPH.minus + '</button></div>';
    }).join('') + '</div>' : '<p class="muted">This deck is empty. Switch to Add cards and tap cards to put them in.</p>';
  } else {
    var f = App.filt.add;
    var filters = '<div class="filters" style="margin-bottom:12px">' + ['all'].concat(BANNER_ORDER, ['unbound']).map(function (b) {
      return '<button class="chip' + (f === b ? ' on' : '') + '" data-act="addFilter" data-arg="' + b + '">' + (b === 'all' ? 'All' : '<i style="background:' + BANNER_INK[b] + '"></i>' + esc(BANNERS[b].short)) + '</button>';
    }).join('') + '</div>';
    var ids = sortCards(Object.keys(s.coll).filter(function (id) { return s.coll[id] > 0 && CARD[id] && (f === 'all' || CARD[id].banner === f); }));
    body = filters + (ids.length ? '<div class="cgrid">' + ids.map(function (id) {
      var inD = counts[id] || 0, n = Math.min(s.coll[id], maxCopies(id));
      return '<div class="ctile" data-act="deAdd" data-arg="' + id + '">' + cardHTML(id, { mini: true, cls: inD >= n ? 'unowned' : '' }) +
        '<button class="iconbtn" style="position:absolute;top:-6px;right:-6px;width:28px;height:28px;font-size:14px;z-index:4;border-radius:50%" data-act="zoomCard" data-arg="' + id + '" aria-label="Details">' + GLYPH.info + '</button>' +
        '<span class="own' + (inD ? ' in' : '') + '">' + inD + ' / ' + n + '</span></div>';
    }).join('') + '</div>' : '<p class="muted">No owned cards match this filter.</p>');
  }
  return topBar('Edit deck', null, '<button class="btn small primary" data-act="deDone">Done</button>') + head + '<div class="scroll">' + body + '</div>';
}

function addReason(id) {
  var e = App.edit, counts = countIds(e.cards), s = App.save;
  if (e.cards.length >= RULES.deckSize) return 'The deck is full at 30 cards';
  var n = counts[id] || 0;
  if (n >= maxCopies(id)) return CARD[id].legendary ? 'Only one copy of a Legendary' : 'Two copies at most';
  if (n >= (s.coll[id] || 0)) return 'You only own ' + (s.coll[id] || 0);
  var b = CARD[id].banner;
  var bs = deckBanners(e.cards);
  if (b !== 'unbound' && bs.indexOf(b) < 0 && bs.length >= RULES.maxBanners) return 'Two banners at most, plus Unbound';
  return '';
}

/* ---------- shop ---------- */
var PACKS = [
  { id: 'any', name: 'Sunderfall Pack', price: 100, banner: null, desc: 'Cards from every banner.' }
].concat(BANNER_ORDER.map(function (b) { return { id: b, name: BANNERS[b].short + ' Pack', price: 120, banner: b, desc: BANNERS[b].name + ' and Unbound cards only.' }; }));

function viewShop() {
  var s = App.save;
  var free = s.freePacks ? '<button class="pack" data-act="openFree"><span class="pk">' + Art.pack(PACKS[0]) + '</span>' +
    '<span><b>Free pack</b><p>Earned on the Road to the Crown. You have ' + s.freePacks + '.</p></span><span class="price">Open</span></button>' : '';
  return topBar('Packs', 'home') + '<div class="scroll"><p class="prose" style="margin:0 0 12px">Each pack holds five cards: three Common, one Uncommon and one Rare, with a chance of a Mythic. Copies beyond what a deck can use turn into Ash for crafting.</p>' +
    '<div class="packs">' + free + PACKS.map(function (p) {
      var can = s.aurum >= p.price;
      return '<button class="pack" style="' + (can ? '' : 'opacity:.5') + '" data-act="buyPack" data-arg="' + p.id + '"><span class="pk">' + Art.pack(p) + '</span>' +
        '<span><b>' + esc(p.name) + '</b><p>' + esc(p.desc) + '</p></span><span class="price">' + GLYPH.coin + p.price + '</span></button>';
    }).join('') + '</div><p class="muted" style="font-size:13px;margin-top:14px">Earn Aurum by winning battles. Campaign stages pay the most the first time you take them.</p></div>';
}

function rollPack(banner) {
  var pool = CARDS.filter(function (c) { return !banner || c.banner === banner || c.banner === 'unbound'; });
  function pick(r) {
    var list = pool.filter(function (c) { return c.rarity === r; });
    var w = list.map(function (c) { return banner && c.banner === 'unbound' ? 0.45 : 1; });
    var tot = w.reduce(function (a, b) { return a + b; }, 0), x = Math.random() * tot;
    for (var i = 0; i < list.length; i++) { x -= w[i]; if (x <= 0) return list[i].id; }
    return list[list.length - 1].id;
  }
  var out = [pick('C'), pick('C'), pick('C'), pick('U'), pick(Math.random() < 0.14 ? 'M' : 'R')];
  return out;
}

function grantCards(ids) {
  var s = App.save;
  return ids.map(function (id) {
    var have = s.coll[id] || 0;
    if (have < maxCopies(id)) {
      s.coll[id] = have + 1;
      if (!have) s.newCards[id] = 1;
      return { id: id, isNew: !have, ash: 0 };
    }
    var a = RARITY[CARD[id].rarity].salvage;
    s.ash += a;
    return { id: id, isNew: false, ash: a };
  });
}

function showOpening(results, title) {
  App.opening = { results: results, open: {} };
  renderOpening(title);
}
function renderOpening(title) {
  var o = App.opening;
  var all = o.results.every(function (r, i) { return o.open[i]; });
  openModal('<div class="opening"><h3>' + esc(title || 'Pack opened') + '</h3><div class="hint">' + (all ? 'Added to your collection.' : 'Tap each card to reveal it.') + '</div><div class="ocards">' +
    o.results.map(function (r, i) {
      var c = CARD[r.id];
      return '<button class="flip r-' + c.rarity + (o.open[i] ? ' open' : '') + '" style="--rc:' + RARITY[c.rarity].col + '" data-act="flip" data-arg="' + i + '"><span class="fi">' +
        '<span class="face back">' + Art.back() + '</span><span class="face front">' + cardHTML(r.id, { mini: true }) + '</span></span>' +
        (r.isNew ? '<span class="ntag">NEW</span>' : '') + (r.ash ? '<span class="gain">+' + r.ash + ' Ash</span>' : '') + '</button>';
    }).join('') + '</div><div class="row" style="justify-content:center">' +
    (all ? '<button class="btn primary" data-act="closeModal">Done</button>' : '<button class="btn" data-act="flipAll">Reveal all</button>') + '</div></div>', false);
}

/* ---------- codex ---------- */
function viewCodex() {
  var tab = App.codexTab;
  var tabs = [['world', 'World'], ['banners', 'Banners'], ['rules', 'How to play'], ['kw', 'Keywords'], ['settings', 'Settings']];
  var body = '';
  if (tab === 'world') {
    body = '<div class="prose"><p>For ten thousand years the god-star <em>Aurelion</em> hung over the world of Kaedra, a living engine of light that the Eld called the Watcher and the dwarves called the Anvil-Lamp.</p>' +
      '<p>Then something in the void murdered it. The star cracked in a single night, and its body fell across the world as a rain of burning <em>shards</em>. That night is the <em>Sunderfall</em>.</p>' +
      '<p>Each shard still holds a sliver of the god\'s power. A shard can wake the dead, fuel a forge, grow a forest in a season, or call a cathedral-ship down from the dark. Every power on Kaedra now hunts them.</p>' +
      '<p>The <em>Auric Dominion</em> descended from the void to reclaim their god\'s remains as relics. The <em>Verdant Eld</em> rose from the starwood to drive the strangers out. The <em>Hollow Host</em> crawled up from the crater where the shards burned deepest. The <em>Forgeborn Clans</em> set aside old blood-feuds to feed shards into the Shardforge.</p>' +
      '<p>You are a <em>Warden</em>: one of the few who can bind a shard and call warriors through it. The cards you collect are the souls, beasts and rites your shards can summon. At the end of the Road waits the crater, the Hollow King, and the heart of the dead star.</p></div>';
  } else if (tab === 'banners') {
    body = '<div class="bcodex">' + BANNER_ORDER.concat(['unbound']).map(function (b) {
      var Bn = BANNERS[b];
      return '<div class="bc">' + Art.sigil(b) + '<div><b>' + esc(Bn.name) + '</b><p>' + esc(Bn.blurb) + '</p><span class="chip">' + esc(Bn.tag) + '</span></div></div>';
    }).join('') + '</div>';
  } else if (tab === 'rules') {
    body = '<button class="btn primary block" data-act="startTut" style="margin-bottom:10px">Play the guided Drill-Yard battle</button><div class="rules" style="font-family:var(--f-ui)"><h2 class="sec" style="margin-top:6px">Winning</h2><p>Each Warden starts with 20 health. Bring the enemy Warden to 0 to win.</p>' +
      '<h2 class="sec">Shards</h2><p>Cards cost Shards. You start with 1 and gain one more each turn, up to 10. Spent Shards refill at the start of your turn. The player who goes second starts with an extra card and a Shard Spark worth one Shard.</p>' +
      '<h2 class="sec">Your turn</h2><ol><li>Your units ready up, you gain a Shard and draw a card. Dawn effects happen.</li><li>Play cards in any order. Units arrive on the battlefield; spells take effect and are gone.</li><li>Attack once per turn: choose any number of ready units. The enemy then chooses blockers.</li><li>You can keep playing cards after combat. Press End Turn when done.</li></ol>' +
      '<h2 class="sec">Combat</h2><ul><li>Units cannot attack the turn they arrive unless they have Charge.</li><li>Attacking exhausts a unit. Exhausted units cannot block during the enemy\'s next turn, unless they have Vigil.</li><li>Each blocker stops one attacker. The two deal damage to each other at the same time.</li><li>Unblocked attackers hit the enemy Warden.</li><li>Damage on units heals at the end of every turn. To destroy a unit, deal its full health in one turn.</li></ul>' +
      '<h2 class="sec">Decks</h2><p>30 cards, up to two banners plus any Unbound, two copies of a card at most and one of a Legendary. Hand limit 9, battlefield limit 6. With an empty deck you take growing fatigue damage instead of drawing.</p></div>';
  } else if (tab === 'kw') {
    body = '<div class="kwtab">' + KW_ORDER.map(function (k) {
      return '<div>' + kwGlyph(k) + '<b>' + KEYWORDS[k].name + '</b><span>' + esc(KEYWORDS[k].desc) + '</span></div>';
    }).join('') + '</div><h2 class="sec">Triggers</h2><div class="kwtab">' + Object.keys(TRIGGERS).map(function (t) {
      return '<div><span></span><b>' + TRIGGERS[t].name + '</b><span>' + esc(TRIGGERS[t].desc) + '</span></div>';
    }).join('') + '</div>';
  } else {
    var s = App.save;
    body = '<div class="setting"><div><b>Sound</b><p>Card, combat and pack sounds.</p></div><button class="btn small" data-act="toggleSound">' + (s.settings.sound ? 'On' : 'Off') + '</button></div>' +
      '<div class="setting"><div><b>Battle tips</b><p>Short hints during your first battles.</p></div><button class="btn small" data-act="toggleTips">' + (s.settings.tips ? 'On' : 'Off') + '</button></div>' +
      '<div class="setting"><div><b>Playtest Aurum</b><p>Adds 1000 Aurum for testing packs and crafting.</p></div><button class="btn small" data-act="grantAurum">+1000</button></div>' +
      '<div class="setting"><div><b>Reset progress</b><p>Erases your collection, decks and campaign on this device.</p></div><button class="btn small' + (App.armed.reset ? ' red' : '') + '" data-act="resetAll">' + (App.armed.reset ? 'Tap to erase' : 'Reset') + '</button></div>';
  }
  return topBar('Codex', 'home') + '<div class="scroll"><div class="filters" style="margin-bottom:14px">' + tabs.map(function (t) {
    return '<button class="chip' + (tab === t[0] ? ' on' : '') + '" data-act="codexTab" data-arg="' + t[0] + '">' + t[1] + '</button>';
  }).join('') + '</div>' + body + '</div>';
}

/* ============================================================
   BATTLE
   ============================================================ */
var TIPS = {
  play: 'Tap a card in your hand to read it, then press <b>Play</b>. You gain one more Shard every turn, up to 10.',
  attack: 'Units can attack the turn after they arrive. Press <b>Attack</b>, tap the units you want to send, then confirm.',
  block: 'You are under attack. Tap one of <b>your</b> units, then tap the attacker it should block. Unblocked damage hits you.',
  end: 'Out of moves? Press <b>End Turn</b>. Damage on units heals at the end of every turn.'
};

function startBattle(ctx) {
  var d = deckById(ctx.deckId) || activeDeck();
  var seed = (Math.random() * 4294967296) >>> 0;
  var oppDeck, oppName, oppLife, lvl, oppBanner, face = null;
  if (ctx.kind === 'campaign') {
    var st = CAMPAIGN[ctx.stage];
    oppDeck = AI.buildDeck(st.banners, st.quality, st.id * 7919 + 13, st.include);
    oppName = st.name; oppLife = st.life; lvl = st.level; oppBanner = st.banners[0];
    face = { key: st.name, banner: st.banners[0], icon: st.icon };
  } else {
    var L = SKIRMISH_LEVELS[(ctx.level || 2) - 1];
    var pool = BANNER_ORDER.slice();
    var b1 = pool[Math.floor(Math.random() * 4)];
    var bs = [b1];
    var r = Math.random();
    if (r < 0.45) { var rest = pool.filter(function (x) { return x !== b1; }); bs.push(rest[Math.floor(Math.random() * 3)]); }
    else if (r < 0.7) bs.push('unbound');
    oppDeck = AI.buildDeck(bs, L.quality, seed ^ 0x5bd1e995);
    var names = SKIRMISH_NAMES[b1];
    oppName = names[Math.floor(Math.random() * names.length)];
    oppLife = L.life; lvl = L.level; oppBanner = b1;
    face = { key: oppName, banner: b1, icon: BANNERS[b1].icon };
  }
  var s = newGame({ seed: seed, decks: [d.cards, oppDeck], names: ['You', oppName], lives: [RULES.life, oppLife] });
  s.fx = [];
  B = { s: s, human: 0, ai: 1, lvl: lvl, mode: 'mull', sel: {}, pending: null, blocks: {}, blockSel: null, preview: null,
    timers: [], token: Math.random(), ctx: ctx, banners: [primaryBanner(d.cards), oppBanner], faces: [null, face], mull: {}, tip: null, lastDraw: null };
  mulligan(s, B.ai, AI.mulligan(s, B.ai, lvl));
  App.screen = 'battle';
  closeModal();
  buildBattleDOM();
  renderBattle();
  showMulligan();
}

function stopBattle() {
  if (!B) return;
  if (B.tut) Tut.stop();
  B.token = -1;
  B.timers.forEach(function (t) { clearTimeout(t); });
  B = null;
}

function later(fn, ms) {
  if (!B) return;
  var tok = B.token;
  B.timers.push(setTimeout(function () { if (B && tok === B.token) fn(); }, ms));
}

function buildBattleDOM() {
  var v = $('view');
  v.className = 'screen';
  v.innerHTML = '<div id="battle" class="screen">' +
    '<div class="b-hero" id="hero1" data-act="warden" data-arg="1"></div>' +
    '<div class="b-board" id="board1"></div>' +
    '<div class="b-mid"><div class="status" id="bstatus"></div><div class="acts" id="bacts"></div></div>' +
    '<div class="b-board" id="board0"></div>' +
    '<div class="b-hero" id="hero0" data-act="warden" data-arg="0"></div>' +
    '<div class="b-hand" id="hand"></div>' +
    '<div id="tipslot"></div><div class="fxlayer" id="fxl"></div></div>';
}

function heroHTML(p) {
  var s = B.s, P = s.players[p], isEnemy = p === B.ai;
  var pips = '';
  for (var i = 0; i < P.maxShards; i++) pips += '<i class="pip' + (i < P.shards ? '' : ' spent') + '"></i>';
  var handInfo = isEnemy ? '<span class="enemy-hand">' + GLYPH.hand + ' ' + P.hand.length + '</span>' : '<span>' + GLYPH.hand + ' ' + P.hand.length + '</span>';
  return (isEnemy ? '<button class="iconbtn" data-act="bmenu" aria-label="Battle menu">' + GLYPH.menu + '</button>' : '') +
    (B.faces && B.faces[p] ? Art.portrait(B.faces[p].key, B.faces[p].banner, B.faces[p].icon) : Art.sigil(B.banners[p])) +
    '<div class="who"><b>' + esc(P.name) + '</b><div class="meta">' + handInfo + '<span>' + GLYPH.deck + ' ' + P.deck.length + '</span></div></div>' +
    '<div class="shards"><span class="pips">' + pips + '</span>' + P.shards + '/' + P.maxShards + '</div>' +
    '<div class="life' + (P.life <= 5 ? ' low' : '') + '">' + GLYPH.hp + Math.max(0, P.life) + '</div>';
}

function attackNumber(uid) {
  var list = B.s.combat ? B.s.combat.attackers : [];
  return list.indexOf(uid) + 1;
}

function unitHTML(u) {
  var s = B.s, c = CARD[u.id], Bn = BANNERS[c.banner];
  var a = atkOf(s, u), h = healthOf(s, u), mh = maxHpOf(s, u);
  var kws = KW_ORDER.filter(function (k) { return hasKw(s, u, k); });
  var inCombat = s.combat && s.phase === 'block' && s.combat.attackers.indexOf(u.uid) >= 0;
  var cls = 'unit' + (u.kw.shielded ? ' shielded' : '') + (u.exhausted && !inCombat ? ' exh' : '');
  var badge = '';
  var mine = u.owner === B.human, humanTurn = s.active === B.human;
  if (B.mode === 'idle' && humanTurn && mine && s.phase === 'main' && canAttack(s, B.human, u)) cls += ' can-act';
  if (B.mode === 'attack' && mine) {
    if (B.sel[u.uid]) cls += ' sel';
    else if (canAttack(s, B.human, u)) cls += ' can-act';
  }
  if (B.mode === 'target' && B.pending) {
    for (var i = 0; i < B.pending.opts.length; i++) {
      var o = B.pending.opts[i];
      if (o.k === 'u' && o.uid === u.uid) cls += ' target' + (mine ? ' friendly-t' : '');
    }
  }
  if (s.combat && (s.phase === 'block')) {
    var n = attackNumber(u.uid);
    if (n) { cls += ' attacking'; badge = '<span class="badge att">' + n + '</span>'; }
    var blocks = B.mode === 'block' ? B.blocks : (B.preview || {});
    for (var aUid in blocks) {
      if (blocks.hasOwnProperty(aUid) && blocks[aUid] === u.uid) badge = '<span class="badge blk">' + attackNumber(+aUid) + '</span>';
    }
    if (B.mode === 'block' && mine) {
      if (B.blockSel === u.uid) cls += ' bsel';
      else if (!badge && canBlockAny(u)) cls += ' can-block';
    }
  }
  var sick = mine && humanTurn && u.sick && !hasKw(s, u, 'charge') && !hasKw(s, u, 'bulwark');
  return '<div class="' + cls + '" style="--bc:' + BANNER_INK[c.banner] + '" data-uid="' + u.uid + '" data-act="unit" data-arg="' + u.uid + '">' +
    (u.exhausted && !inCombat ? '<span class="spent">SPENT</span>' : '') +
    '<div class="u-art">' + Art.card(c) + '</div><div class="u-kw">' + kws.slice(0, 4).map(function (k) { return kwGlyph(k); }).join('') + '</div>' +
    (sick ? '<div class="u-zz">' + GLYPH.sleep + '</div>' : '') + badge +
    '<div class="u-stat a' + (a > c.atk ? ' up' : '') + '">' + a + '</div><div class="u-stat h' + (u.dmg > 0 ? ' hurt' : (mh > c.hp ? ' up' : '')) + '">' + h + '</div></div>';
}

function canBlockAny(u) {
  var s = B.s;
  if (!s.combat) return false;
  for (var i = 0; i < s.combat.attackers.length; i++) {
    var a = findUnit(s, s.combat.attackers[i]);
    if (a && canBlock(s, u, a)) return true;
  }
  return false;
}

function incomingDamage() {
  var s = B.s, t = 0;
  if (!s.combat) return 0;
  for (var i = 0; i < s.combat.attackers.length; i++) {
    var a = findUnit(s, s.combat.attackers[i]);
    if (!a) continue;
    var bUid = B.blocks[a.uid];
    if (bUid) { var b = findUnit(s, bUid); t += b ? AI.duel(s, a, b).through : 0; }
    else t += atkOf(s, a);
  }
  return t;
}

function renderBattle() {
  if (!B || !$('battle')) return;
  var s = B.s;
  [0, 1].forEach(function (p) {
    var h = $('hero' + p);
    h.innerHTML = heroHTML(p);
    var tgt = B.mode === 'target' && B.pending && B.pending.opts.some(function (o) { return o.k === 'w' && o.p === p; });
    h.className = 'b-hero' + (tgt ? ' target' : '');
    var board = $('board' + p);
    var units = s.players[p].board;
    board.innerHTML = units.length ? units.map(unitHTML).join('') : '<span class="empty">' + (p === B.human ? 'Your battle line' : 'Enemy battle line') + '</span>';
  });
  // hand
  var hand = s.players[B.human].hand;
  var humanMain = s.phase === 'main' && s.active === B.human && B.mode === 'idle';
  $('hand').innerHTML = hand.length ? hand.map(function (h) {
    var playable = humanMain && !playBlocker(s, B.human, h.uid);
    return cardHTML(h.id, { mini: true, cls: (playable ? 'playable' : '') + (B.lastDraw === h.uid ? ' newdraw' : ''), attrs: 'data-act="hand" data-arg="' + h.uid + '" data-huid="' + h.uid + '"' });
  }).join('') : '<span class="hand-empty">Your hand is empty</span>';
  B.lastDraw = null;
  renderMid();
  renderTip();
  if (B.tut) Tut.refresh();
}

function renderMid() {
  var s = B.s, st = $('bstatus'), ac = $('bacts');
  var msg = '', btns = '';
  if (s.phase === 'over') {
    msg = s.winner === B.human ? '<b>Victory.</b> The shard is yours.' : '<b>Defeat.</b>';
  } else if (B.mode === 'mull') {
    msg = 'Choose your opening hand.';
  } else if (B.mode === 'attack') {
    var k = Object.keys(B.sel).length;
    msg = 'Tap units to send them. <b>' + k + '</b> selected.';
    btns = '<button class="btn ghost" data-act="atkCancel">Cancel</button><button class="btn red' + (k ? '' : ' off') + '" data-act="atkGo">Attack</button>';
  } else if (B.mode === 'target') {
    msg = 'Choose a target for <b>' + esc(CARD[B.pending.id].name) + '</b>.';
    btns = '<button class="btn ghost" data-act="tgtCancel">Cancel</button>';
  } else if (B.mode === 'block') {
    var inc = incomingDamage();
    msg = 'Blocking. Your unit first, then the attacker. Incoming: <b>' + inc + '</b>' + (inc >= s.players[B.human].life ? ' <b style="color:#ff8a7f">lethal</b>' : '');
    btns = '<button class="btn primary" data-act="blkGo">Confirm</button>';
  } else if (s.active === B.human && s.phase === 'main' && B.mode === 'idle') {
    var canAtk = !s.attacked && attackersAvailable(s, B.human).length > 0;
    var canPlay = s.players[B.human].hand.some(function (h) { return !playBlocker(s, B.human, h.uid); });
    msg = 'Your turn. ' + (canPlay ? 'Play cards' : 'No cards you can afford') + (canAtk ? ', then attack.' : (s.attacked ? '. You have attacked.' : '.'));
    btns = (canAtk ? '<button class="btn red" data-act="atkStart">Attack</button>' : '') +
      '<button class="btn' + (!canAtk && !canPlay ? ' primary' : '') + '" data-act="endTurn">End Turn</button>';
  } else {
    msg = s.active === B.ai ? '<b>' + esc(s.players[B.ai].name) + '</b> is acting...' : 'Resolving...';
  }
  st.innerHTML = msg;
  ac.innerHTML = btns;
}

function renderTip() {
  var slot = $('tipslot');
  if (!slot) return;
  var t = B.tip;
  slot.innerHTML = t ? '<div class="tipbar"><p>' + TIPS[t] + '</p><button class="btn small" data-act="tipOk">Got it</button></div>' : '';
}

function maybeTip() {
  if (!B || B.tut || !App.save.settings.tips || B.tip) return;
  var s = B.s, seen = App.save.seen;
  var want = null;
  if (B.mode === 'block' && !seen.block) want = 'block';
  else if (s.active === B.human && B.mode === 'idle' && s.phase === 'main') {
    if (!seen.play && s.players[B.human].hand.some(function (h) { return !playBlocker(s, B.human, h.uid); })) want = 'play';
    else if (!seen.attack && !s.attacked && attackersAvailable(s, B.human).length) want = 'attack';
    else if (!seen.end && seen.play && s.turn >= 3) want = 'end';
  }
  if (want) { B.tip = want; renderTip(); }
}

/* ---------- fx playback ---------- */
function snapRects() {
  var map = {}, root = $('battle');
  if (!root) return map;
  var base = root.getBoundingClientRect();
  var els = root.querySelectorAll('[data-uid]');
  for (var i = 0; i < els.length; i++) {
    var r = els[i].getBoundingClientRect();
    map['u' + els[i].getAttribute('data-uid')] = { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height };
  }
  [0, 1].forEach(function (p) {
    var h = $('hero' + p);
    if (!h) return;
    var life = h.querySelector('.life') || h;
    var r = life.getBoundingClientRect();
    map['w' + p] = { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height };
  });
  return map;
}

function spawnFloat(rect, text, cls, delay) {
  var layer = $('fxl');
  if (!layer || !rect) return;
  setTimeout(function () {
    if (!$('fxl')) return;
    var el = document.createElement('div');
    el.className = 'float' + (cls ? ' ' + cls : '');
    el.textContent = text;
    el.style.left = (rect.x + rect.w / 2) + 'px';
    el.style.top = (rect.y + rect.h / 2) + 'px';
    layer.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1100);
  }, delay || 0);
}

function shatter(rect, color) {
  var layer = $('fxl');
  if (!layer || !rect) return;
  for (var i = 0; i < 12; i++) {
    var el = document.createElement('div');
    el.className = 'shardp';
    var ang = (i / 12) * Math.PI * 2 + Math.random() * 0.4;
    var dist = 30 + Math.random() * 40;
    el.style.left = (rect.x + rect.w / 2 - 4) + 'px';
    el.style.top = (rect.y + rect.h / 2 - 4) + 'px';
    el.style.setProperty('--dx', Math.round(Math.cos(ang) * dist) + 'px');
    el.style.setProperty('--dy', Math.round(Math.sin(ang) * dist) + 'px');
    el.style.setProperty('--c', i % 3 ? color : '#fff3c8');
    layer.appendChild(el);
    (function (e) { setTimeout(function () { if (e.parentNode) e.parentNode.removeChild(e); }, 800); })(el);
  }
}

function elFor(uid) { var r = $('battle'); return r ? r.querySelector('[data-uid="' + uid + '"]') : null; }
function addAnim(el, cls) { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

function playFx(events, before) {
  var after = snapRects();
  var snd = {}, d = 0;
  events.forEach(function (e) {
    var key, rect;
    switch (e.k) {
      case 'dmg':
        key = e.ref.k === 'w' ? 'w' + e.ref.p : 'u' + e.ref.uid;
        rect = after[key] || before[key];
        spawnFloat(rect, '-' + e.n, '', d); d += 70;
        if (e.ref.k === 'u') addAnim(elFor(e.ref.uid), 'flash');
        snd[e.ref.k === 'w' ? 'face' : 'hit'] = 1;
        break;
      case 'heal':
        key = e.ref.k === 'w' ? 'w' + e.ref.p : 'u' + e.ref.uid;
        spawnFloat(after[key] || before[key], '+' + e.n, 'heal', d); d += 70;
        snd.heal = 1;
        break;
      case 'death':
        shatter(before['u' + e.uid], BANNERS[CARD[e.id].banner].col);
        snd.death = 1;
        break;
      case 'spawn':
        addAnim(elFor(e.uid), 'spawn');
        break;
      case 'shieldpop':
        spawnFloat(after['u' + e.uid] || before['u' + e.uid], 'Shield', 'small', d);
        snd.shield = 1;
        break;
      case 'buff':
        addAnim(elFor(e.uid), 'flash');
        snd.buff = 1;
        break;
      case 'strike':
        addAnim(elFor(e.uid), e.p === B.human ? 'lunge-up' : 'lunge-down');
        break;
      case 'play':
        snd[CARD[e.id].type === 'spell' ? 'spell' : 'play'] = 1;
        if (e.p === B.ai) revealCard(e.id);
        break;
      case 'draw':
        if (e.p === B.human) { var he = document.querySelector('[data-huid="' + e.uid + '"]'); addAnim(he, 'newdraw'); }
        break;
      case 'burn':
        if (e.p === B.human) toast(CARD[e.id].name + ' burned. Your hand was full.');
        break;
      case 'turn':
        bannerFlash(e.p === B.human ? 'Your turn' : 'Enemy turn', e.p !== B.human);
        snd.turn = 1;
        break;
    }
  });
  ['death', 'face', 'hit', 'shield', 'heal', 'spell', 'play', 'buff', 'turn'].some(function (k) {
    if (snd[k]) { Sfx.play(k); return k !== 'turn' && k !== 'play' && k !== 'spell' ? true : false; }
    return false;
  });
}

function revealCard(id) {
  var layer = $('fxl');
  if (!layer) return;
  var el = document.createElement('div');
  el.className = 'reveal';
  el.innerHTML = '<div class="cap">Enemy plays</div>' + cardHTML(id, { w: 180, lore: false });
  layer.appendChild(el);
  setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1350);
}

function bannerFlash(text, enemy) {
  var layer = $('fxl');
  if (!layer) return;
  var el = document.createElement('div');
  el.className = 'banner-flash' + (enemy ? ' enemy' : '');
  el.textContent = text;
  layer.appendChild(el);
  setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1300);
}

function exec(fn) {
  if (!B) return false;
  var before = snapRects();
  B.s.fx = [];
  var ok = fn(B.s);
  var events = B.s.fx || [];
  B.s.fx = [];
  for (var i = 0; i < events.length; i++) if (events[i].k === 'draw' && events[i].p === B.human) B.lastDraw = events[i].uid;
  renderBattle();
  playFx(events, before);
  if (B.s.phase === 'over' && !B.ending) { B.ending = true; B.mode = 'wait'; renderMid(); later(showResult, 1300); }
  return ok;
}

/* ---------- mulligan ---------- */
function showMulligan() {
  var s = B.s, P = s.players[B.human];
  var goesFirst = s.first === B.human;
  openModal('<div class="panel mull"><div class="eyebrow">' + (goesFirst ? 'You go first' : 'You go second and get a Shard Spark') + '</div><h3>Opening hand</h3>' +
    '<p class="muted" style="font-size:13px">Tap any cards you want to send back and redraw.</p><div class="cards">' +
    P.hand.map(function (h) { return cardHTML(h.id, { mini: true, cls: B.mull[h.uid] ? 'swap' : '', attrs: 'data-act="mullToggle" data-arg="' + h.uid + '"' }); }).join('') +
    '</div><div class="row"><button class="btn primary" data-act="mullGo">' + (Object.keys(B.mull).length ? 'Redraw ' + Object.keys(B.mull).length : 'Keep hand') + '</button></div>' +
    '<p class="muted" style="font-size:12px;margin-top:10px">Facing ' + esc(s.players[B.ai].name) + ' &middot; ' + esc(BANNERS[B.banners[B.ai]].name) + '</p></div>', false);
}

function finishMulligan() {
  var uids = Object.keys(B.mull).map(Number);
  closeModal();
  B.mode = 'wait';
  exec(function (s) { return mulligan(s, B.human, uids); });
  if (B.s.active === B.ai) later(aiStep, 1500);
  else { B.mode = 'idle'; renderBattle(); later(maybeTip, 1300); }
}

/* ---------- AI turn ---------- */
function aiStep() {
  if (!B) return;
  var s = B.s;
  if (s.phase === 'over' || s.active !== B.ai || s.phase !== 'main') return;
  if (B.tut && Tut.holdAI()) { later(aiStep, 400); return; }
  B.mode = 'wait';
  var act = (B.tut && Tut.script()) || AI.choose(s, B.ai, B.lvl);
  if (!act || act.type === 'end') {
    exec(function (st) { return endTurn(st, B.ai); });
    if (B.s.phase === 'over') return;
    B.mode = 'idle';
    renderBattle();
    later(maybeTip, 1400);
    return;
  }
  if (act.type === 'play') {
    exec(function (st) { return playCard(st, B.ai, act.uid, act.target); });
    later(aiStep, 1250);
    return;
  }
  exec(function (st) { return declareAttack(st, B.ai, act.uids); });
  if (B.s.phase === 'over') return;
  if (B.s.phase !== 'block') { later(aiStep, 900); return; }
  if (!blockersAvailable(B.s, B.human).length) {
    renderBattle();
    later(function () {
      exec(function (st) { return declareBlocks(st, B.human, {}); });
      later(aiStep, 1000);
    }, 1000);
    return;
  }
  B.mode = 'block'; B.blocks = {}; B.blockSel = null;
  renderBattle();
  maybeTip();
}

/* ---------- results ---------- */
function showResult() {
  if (!B) return;
  var s = B.s, won = s.winner === B.human, sv = App.save, ctx = B.ctx;
  var gold = 0, extra = [], mythic = null, freePack = false;
  if (ctx.kind !== 'tutorial') { if (won) sv.stats.w++; else sv.stats.l++; }
  if (ctx.kind === 'tutorial') {
    if (won && !sv.tutorialDone) { sv.tutorialDone = true; gold = 100; }
  } else if (ctx.kind === 'campaign') {
    var st = CAMPAIGN[ctx.stage];
    if (won) {
      if (st.id > sv.camp.cleared) {
        sv.camp.cleared = st.id;
        gold = st.reward;
        if (st.pack) { sv.freePacks++; freePack = true; }
        if (st.mythic) {
          var missing = CARDS.filter(function (c) { return c.rarity === 'M' && !(sv.coll[c.id] > 0); });
          if (missing.length) { mythic = missing[Math.floor(Math.random() * missing.length)].id; grantCards([mythic]); }
          else { sv.ash += 300; extra.push('+300 Ash'); }
        }
      } else gold = 40;
    } else gold = 15;
  } else {
    gold = won ? SKIRMISH_LEVELS[(ctx.level || 2) - 1].reward : 15;
  }
  sv.aurum += gold;
  persist();
  Sfx.play(won ? 'win' : 'lose');
  var title = won ? (ctx.kind === 'tutorial' ? 'Drill done' : 'Victory') : (s.winner === 2 ? 'Both fall' : 'Defeat');
  var line = won ? (ctx.kind === 'campaign' ? 'You take ' + CAMPAIGN[ctx.stage].name + '\'s shard.' : ctx.kind === 'tutorial' ? 'Harrow grunts. That will do. The Road is open to you.' : 'Your rival yields.') : (ctx.kind === 'tutorial' ? 'The Grave-Drill wins this round. Run it again.' : 'Your warband scatters. Regroup and try again.');
  openModal('<div class="panel result"><div class="big ' + (won ? 'win' : 'lose') + '">' + title + '</div><p class="muted">' + esc(line) + '</p>' +
    (gold || extra.length || freePack ? '<div class="rewards">' + (gold ? '<span>' + GLYPH.coin + '+' + gold + '</span>' : '') + extra.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') +
    (freePack ? '<span>+1 free pack</span>' : '') + '</div>' : '') +
    (mythic ? '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;margin:8px 0"><div class="eyebrow">Mythic reward</div>' + cardHTML(mythic, { w: 200, lore: false }) + '</div>' : '') +
    '<div class="row"><button class="btn" data-act="rematch">' + (ctx.kind === 'tutorial' ? 'Run it again' : 'Rematch') + '</button><button class="btn primary" data-act="leaveBattle">Continue</button></div></div>', false);
}

/* ---------- battle input ---------- */
function onHandTap(uid) {
  var s = B.s, P = s.players[B.human];
  var h = null;
  for (var i = 0; i < P.hand.length; i++) if (P.hand[i].uid === uid) h = P.hand[i];
  if (!h) return;
  if (B.mode === 'target' || B.mode === 'attack') { toast('Finish or cancel the current action first.'); return; }
  var why = B.mode === 'idle' ? playBlocker(s, B.human, uid) : (s.active === B.human ? 'Not now' : 'Not your turn');
  var c = CARD[h.id];
  openModal('<div class="zoom">' + cardHTML(h.id, { lore: false }) + '<div class="extra">' + explainList(c) +
    '<div class="why">' + esc(why || (c.type === 'unit' ? 'Deploys to your battle line.' : 'Takes effect once, then it is spent.')) + '</div>' +
    '<div class="row" style="margin:0;display:flex;gap:8px"><button class="btn ghost" style="flex:1" data-act="closeModal">Close</button>' +
    '<button class="btn primary' + (why ? ' off' : '') + '" style="flex:1" data-act="playHand" data-arg="' + uid + '">Play</button></div></div></div>');
}

function playFromHand(uid) {
  var s = B.s, P = s.players[B.human];
  var idx = -1;
  for (var i = 0; i < P.hand.length; i++) if (P.hand[i].uid === uid) idx = i;
  if (idx < 0 || playBlocker(s, B.human, uid)) return;
  closeModal();
  var opts = playOptions(s, B.human, uid);
  if (opts && opts.length) {
    B.mode = 'target';
    B.pending = { uid: uid, id: P.hand[idx].id, opts: opts };
    renderBattle();
    return;
  }
  var pid = P.hand[idx].id;
  exec(function (st) { return playCard(st, B.human, uid, null); });
  if (B && B.tut) Tut.event('played', pid);
  if (B && B.s.phase !== 'over') later(maybeTip, 700);
}

function chooseTarget(ref) {
  var p = B.pending;
  if (!p) return;
  var ok = p.opts.some(function (o) { return sameRef(o, ref); });
  if (!ok) { toast('That is not a valid target.'); Sfx.play('error'); return; }
  B.mode = 'idle';
  B.pending = null;
  exec(function (st) { return playCard(st, B.human, p.uid, ref); });
  if (B && B.tut) Tut.event('played', p.id);
  if (B && B.s.phase !== 'over') later(maybeTip, 700);
}

function onUnitTap(uid) {
  var s = B.s, u = findUnit(s, uid);
  if (!u) return;
  if (B.mode === 'attack') {
    if (u.owner !== B.human) return;
    var why = attackBlocker(s, B.human, u);
    if (why) { toast(why + '.'); Sfx.play('error'); return; }
    if (B.sel[uid]) delete B.sel[uid]; else B.sel[uid] = 1;
    Sfx.play('tap');
    renderBattle();
    return;
  }
  if (B.mode === 'target') { chooseTarget({ k: 'u', uid: uid }); return; }
  if (B.mode === 'block') {
    if (u.owner === B.human) {
      for (var a in B.blocks) {
        if (B.blocks.hasOwnProperty(a) && B.blocks[a] === uid) { delete B.blocks[a]; B.blockSel = null; renderBattle(); return; }
      }
      if (!canBlockAny(u)) { toast(u.exhausted ? 'Exhausted units cannot block.' : 'It cannot block any of these attackers.'); Sfx.play('error'); return; }
      B.blockSel = B.blockSel === uid ? null : uid;
      Sfx.play('tap');
      renderBattle();
      return;
    }
    if (s.combat && s.combat.attackers.indexOf(uid) >= 0) {
      if (!B.blockSel) { toast('Tap one of your units first, then this attacker.'); return; }
      var bl = findUnit(s, B.blockSel);
      if (!canBlock(s, bl, u)) { toast(hasKw(s, u, 'skyborne') ? 'Only Skyborne or Reach units can block Skyborne.' : 'That unit cannot block this attacker.'); Sfx.play('error'); return; }
      B.blocks[uid] = B.blockSel;
      B.blockSel = null;
      Sfx.play('tap');
      renderBattle();
      return;
    }
    openUnitZoom(u);
    return;
  }
  openUnitZoom(u);
}

function openUnitZoom(u) {
  var s = B.s, c = CARD[u.id];
  var a = atkOf(s, u), h = healthOf(s, u);
  var chips = [];
  if (u.exhausted) chips.push('Exhausted');
  if (u.sick && !hasKw(s, u, 'charge') && u.owner === s.active) chips.push('Just deployed');
  if (u.dmg) chips.push(u.dmg + ' damage this turn');
  if (u.tmp) chips.push('+' + u.tmp + ' attack this turn');
  var au = auraOf(s, u);
  if (au.a) chips.push('+' + au.a + ' attack from allies');
  if (au.kw) Object.keys(au.kw).forEach(function (k) { chips.push(KEYWORDS[k].name + ' from allies'); });
  var gained = Object.keys(u.kw).filter(function (k) { return c.kw.indexOf(k) < 0; });
  gained.forEach(function (k) { if (KEYWORDS[k]) chips.push('Gained ' + KEYWORDS[k].name); });
  if (c.kw.indexOf('shielded') >= 0 && !u.kw.shielded) chips.push('Shield used');
  openModal('<div class="zoom">' + cardHTML(u.id, { atk: a, hp: h, lore: false }) + '<div class="extra">' +
    (chips.length ? '<div class="state">' + chips.map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join('') + '</div>' : '') +
    explainList(c, gained) + '<button class="btn ghost block" data-act="closeModal">Close</button></div></div>');
  if (B && B.tut) Tut.event('inspect', u.id);
}

function openBattleMenu() {
  var armed = App.armed.concede;
  openModal('<div class="panel"><h3>Battle</h3><p class="muted" style="font-size:13px">Turn ' + Math.ceil(B.s.turn / 2) + ' against ' + esc(B.s.players[B.ai].name) + '.</p>' +
    '<div style="display:grid;gap:8px;margin-top:12px"><button class="btn" data-act="showLog">' + GLYPH.log + ' Battle log</button>' +
    '<button class="btn" data-act="toggleSound">' + (App.save.settings.sound ? GLYPH.sound + ' Sound on' : GLYPH.mute + ' Sound off') + '</button>' +
    '<button class="btn' + (armed ? ' red' : '') + '" data-act="concede">' + (armed ? 'Tap again to concede' : 'Concede') + '</button>' +
    '<button class="btn primary" data-act="closeModal">Back to battle</button></div></div>', true, 'menu');
}

/* ============================================================
   ACTIONS (event delegation)
   ============================================================ */
var ACT = {
  go: function (a) { Sfx.play('tap'); go(a); },
  closeModal: function () { closeModal(); App.armed = {}; },
  modalBg: function (a, el, ev) { if (ev.target === el && a === '1') { closeModal(); App.armed = {}; } },
  toggleSound: function () {
    App.save.settings.sound = !App.save.settings.sound; Sfx.setOn(App.save.settings.sound); persist();
    if (App.screen === 'battle') openBattleMenu(); else render();
    Sfx.play('tap');
  },
  toggleTips: function () { App.save.settings.tips = !App.save.settings.tips; if (App.save.settings.tips) App.save.seen = {}; persist(); render(); },
  grantAurum: function () { App.save.aurum += 1000; persist(); Sfx.play('coin'); toast('Added 1000 Aurum.'); render(); },
  resetAll: function () {
    if (!App.armed.reset) { App.armed.reset = 1; render(); return; }
    App.save = freshSave(); App.pickBanner = null; persist(); go('pick');
  },
  codexTab: function (a) { App.codexTab = a; render(); },
  pickBanner: function (a) { App.pickBanner = a; Sfx.play('tap'); render(); },
  confirmBanner: function () {
    var b = App.pickBanner;
    if (!b) return;
    var s = App.save;
    var deck = starterDeck(b);
    deck.forEach(function (id) { s.coll[id] = Math.min(maxCopies(id), (s.coll[id] || 0) + 1); });
    var id = newDeckId();
    s.decks.push({ id: id, name: BANNERS[b].short + ' Starter', cards: deck });
    s.active = id; s.starter = b; s.aurum = 300;
    persist();
    Sfx.play('rare');
    go('home');
    openModal('<div class="panel"><h3>Your oath is sworn</h3><p>Your <b>' + esc(BANNERS[b].short) + ' Starter</b> deck is ready, and you have <b>300 Aurum</b> for packs.</p>' +
      '<p class="muted">New to Sunderfall? Sergeant Harrow runs a short guided battle that teaches everything you need.</p>' +
      '<div class="row"><button class="btn" data-act="closeModal">Later</button><button class="btn primary" data-act="startTut">Start the drill</button></div></div>');
  },
  stage: function (a) { openStage(+a); },
  pickDeck: function (a) {
    App.save.active = a; persist();
    if (App.screen === 'campaign' && App.params.stage !== undefined) { openStage(App.params.stage); return; }
    render();
  },
  fightStage: function () {
    var d = activeDeck();
    if (!d || deckProblems(d.cards, App.save.coll).length) { toast('Pick a deck that is ready to fight.'); return; }
    startBattle({ kind: 'campaign', stage: App.params.stage, deckId: d.id });
  },
  skLevel: function (a) { App.params.lvl = +a; Sfx.play('tap'); render(); },
  fightSkirmish: function () {
    var d = activeDeck();
    if (!d || deckProblems(d.cards, App.save.coll).length) { toast('Your active deck needs fixing first.'); return; }
    startBattle({ kind: 'skirmish', level: App.params.lvl || 2, deckId: d.id });
  },
  collFilter: function (a) { App.filt.coll = a; render(); },
  collOwn: function (a) { App.filt.own = a; render(); },
  collCard: function (a) { App.armed = {}; openCollCard(a); },
  zoomCard: function (a) {
    var c = CARD[a];
    openModal('<div class="zoom">' + cardHTML(a, { lore: false }) + '<div class="extra"><p class="lore-line">' + esc(c.lore) + '</p>' +
      explainList(c) + '<button class="btn ghost block" data-act="closeModal">Close</button></div></div>');
  },
  craft: function (a) {
    var s = App.save, R = RARITY[CARD[a].rarity];
    if ((s.coll[a] || 0) >= maxCopies(a) || s.ash < R.craft) return;
    s.ash -= R.craft; s.coll[a] = (s.coll[a] || 0) + 1; persist();
    Sfx.play('rare'); toast('Crafted ' + CARD[a].name + '.');
    render(); openCollCard(a);
  },
  salvage: function (a) {
    var s = App.save;
    if (!(s.coll[a] > 0)) return;
    if (App.armed.salvage !== a) { App.armed.salvage = a; openCollCard(a); return; }
    App.armed = {};
    s.coll[a]--; s.ash += RARITY[CARD[a].rarity].salvage; persist();
    Sfx.play('coin'); toast('Salvaged for ' + RARITY[CARD[a].rarity].salvage + ' Ash.');
    render(); openCollCard(a);
  },
  newDeck: function () {
    App.edit = { id: null, name: 'New Deck', cards: [] };
    App.params = { tab: 'add' };
    App.screen = 'deckedit'; render();
  },
  editDeck: function (a) {
    var d = deckById(a);
    if (!d) return;
    App.edit = { id: d.id, name: d.name, cards: d.cards.slice() };
    App.params = { tab: 'deck' };
    App.screen = 'deckedit'; render();
  },
  copyDeck: function (a) {
    var d = deckById(a);
    if (!d) return;
    App.save.decks.push({ id: newDeckId(), name: (d.name + ' copy').slice(0, 28), cards: d.cards.slice() });
    persist(); render();
  },
  useDeck: function (a) { App.save.active = a; persist(); Sfx.play('tap'); render(); },
  delDeck: function (a) {
    if (App.armed.del !== a) { App.armed.del = a; render(); return; }
    App.armed = {};
    App.save.decks = App.save.decks.filter(function (d) { return d.id !== a; });
    if (App.save.active === a) App.save.active = App.save.decks[0] ? App.save.decks[0].id : null;
    persist(); render();
  },
  deTab: function (a) { syncDeckName(); App.params.tab = a; render(); },
  addFilter: function (a) { syncDeckName(); App.filt.add = a; render(); },
  deAdd: function (a) {
    syncDeckName();
    var why = addReason(a);
    if (why) { toast(why + '.'); Sfx.play('error'); return; }
    App.edit.cards.push(a); Sfx.play('tap'); keepScroll(render);
  },
  deRemove: function (a) {
    syncDeckName();
    var i = App.edit.cards.indexOf(a);
    if (i >= 0) App.edit.cards.splice(i, 1);
    Sfx.play('tap'); keepScroll(render);
  },
  deDone: function () {
    syncDeckName();
    var e = App.edit, s = App.save;
    var name = (e.name || '').trim() || 'Untitled Deck';
    if (e.id) { var d = deckById(e.id); if (d) { d.name = name; d.cards = e.cards.slice(); } }
    else if (e.cards.length) { var id = newDeckId(); s.decks.push({ id: id, name: name, cards: e.cards.slice() }); if (!s.active) s.active = id; }
    App.edit = null; persist(); go('decks');
  },
  buyPack: function (a) {
    var p = PACKS.filter(function (x) { return x.id === a; })[0], s = App.save;
    if (!p) return;
    if (s.aurum < p.price) { toast('Not enough Aurum. Win battles to earn more.'); Sfx.play('error'); return; }
    s.aurum -= p.price;
    var res = grantCards(rollPack(p.banner));
    persist(); Sfx.play('coin'); render();
    showOpening(res, p.name);
  },
  openFree: function () {
    var s = App.save;
    if (!s.freePacks) return;
    s.freePacks--;
    var res = grantCards(rollPack(null));
    persist(); render(); showOpening(res, 'Free pack');
  },
  flip: function (a) {
    var o = App.opening;
    if (!o || o.open[a]) return;
    o.open[a] = 1;
    var r = CARD[o.results[a].id].rarity;
    Sfx.play(r === 'R' || r === 'M' ? 'rare' : 'flip');
    var el = document.querySelector('.flip[data-arg="' + a + '"]');
    if (el) el.classList.add('open');
    if (o.results.every(function (x, i) { return o.open[i]; })) setTimeout(function () { if (App.opening === o) renderOpening(); }, 650);
  },
  flipAll: function () {
    var o = App.opening;
    if (!o) return;
    var best = 'C';
    o.results.forEach(function (r, i) { o.open[i] = 1; if (CARD[r.id].rarity === 'R' && best !== 'M') best = 'R'; if (CARD[r.id].rarity === 'M') best = 'M'; });
    Sfx.play(best === 'C' ? 'flip' : 'rare');
    var els = document.querySelectorAll('.flip');
    for (var i = 0; i < els.length; i++) els[i].classList.add('open');
    setTimeout(function () { if (App.opening === o) renderOpening(); }, 650);
  },

  /* battle */
  hand: function (a) { onHandTap(+a); },
  playHand: function (a) { playFromHand(+a); },
  unit: function (a) { if (B) onUnitTap(+a); },
  warden: function (a) {
    if (!B) return;
    if (B.mode === 'target') { chooseTarget({ k: 'w', p: +a }); return; }
    var P = B.s.players[+a];
    toast(P.name + ': ' + P.life + ' health, ' + P.hand.length + ' cards in hand, ' + P.deck.length + ' in deck.');
  },
  bmenu: function () { App.armed = {}; openBattleMenu(); },
  showLog: function () {
    openModal('<div class="panel"><h3>Battle log</h3><div class="logbox">' + B.s.log.slice(-40).map(function (l) { return '<div>' + esc(l) + '</div>'; }).join('') + '</div>' +
      '<div class="row"><button class="btn primary" data-act="closeModal">Close</button></div></div>', true, 'menu');
    var lb = document.querySelector('.logbox'); if (lb) lb.scrollTop = lb.scrollHeight;
  },
  concede: function () {
    if (!App.armed.concede) { App.armed.concede = 1; openBattleMenu(); return; }
    App.armed = {};
    closeModal();
    B.s.phase = 'over'; B.s.winner = B.ai; B.s.combat = null;
    B.timers.forEach(function (t) { clearTimeout(t); });
    B.ending = true; B.mode = 'wait';
    renderBattle();
    later(showResult, 300);
  },
  atkStart: function () {
    if (!B || B.mode !== 'idle') return;
    B.mode = 'attack'; B.sel = {};
    var av = attackersAvailable(B.s, B.human);
    if (av.length === 1) B.sel[av[0].uid] = 1;
    if (B.tip === 'attack') { App.save.seen.attack = 1; B.tip = null; persist(); }
    renderBattle();
  },
  atkCancel: function () { B.mode = 'idle'; B.sel = {}; renderBattle(); },
  atkGo: function () {
    var uids = Object.keys(B.sel).map(Number);
    if (!uids.length) return;
    B.mode = 'wait'; B.sel = {};
    exec(function (st) { return declareAttack(st, B.human, uids); });
    if (!B || B.s.phase === 'over') return;
    if (B.s.phase !== 'block') { B.mode = 'idle'; renderBattle(); if (B.tut) Tut.event('attacked'); return; }
    var bl = B.tut && Tut.scriptedNoBlocks() ? {} : AI.blocks(B.s, B.ai, B.lvl);
    B.preview = bl;
    renderBattle();
    later(function () {
      B.preview = null;
      exec(function (st) { return declareBlocks(st, B.ai, bl); });
      if (B && B.s.phase !== 'over') { B.mode = 'idle'; renderBattle(); if (B.tut) Tut.event('attacked'); later(maybeTip, 600); }
    }, Object.keys(bl).length ? 1200 : 500);
  },
  tgtCancel: function () { B.mode = 'idle'; B.pending = null; renderBattle(); },
  blkGo: function () {
    if (!B || B.mode !== 'block') return;
    var blocks = B.blocks;
    B.mode = 'wait'; B.blocks = {}; B.blockSel = null;
    if (B.tip === 'block') { App.save.seen.block = 1; B.tip = null; persist(); }
    exec(function (st) { return declareBlocks(st, B.human, blocks); });
    if (B && B.tut) Tut.event('blocked');
    later(aiStep, 1100);
  },
  endTurn: function () {
    if (!B || B.mode !== 'idle' || B.s.active !== B.human) return;
    if (B.tip === 'end' || B.tip === 'play' || B.tip === 'attack') { App.save.seen[B.tip] = 1; B.tip = null; persist(); }
    B.mode = 'wait';
    exec(function (st) { return endTurn(st, B.human); });
    if (B && B.tut) Tut.event('endTurn');
    if (B && B.s.phase !== 'over') later(aiStep, 1500);
  },
  tipOk: function () { if (B && B.tip) { App.save.seen[B.tip] = 1; B.tip = null; persist(); renderTip(); } },
  mullToggle: function (a) { if (B.mull[a]) delete B.mull[a]; else B.mull[a] = 1; Sfx.play('tap'); showMulligan(); },
  mullGo: function () { finishMulligan(); },
  rematch: function () { var ctx = B.ctx; closeModal(); stopBattle(); if (ctx.kind === 'tutorial') startTutorial(); else startBattle(ctx); },
  startTut: function () { Sfx.play('tap'); startTutorial(); },
  tutNext: function () { Sfx.play('tap'); Tut.next(); },
  tutSkip: function () { Tut.finish(); toast('Drill skipped. Finish the battle your way.'); },
  leaveBattle: function () {
    var ctx = B ? B.ctx : null;
    stopBattle();
    go(ctx && ctx.kind === 'campaign' ? 'campaign' : (ctx && ctx.kind === 'skirmish' ? 'skirmish' : 'home'));
  }
};

function syncDeckName() { var el = $('deckname'); if (el && App.edit) App.edit.name = el.value.slice(0, 28); }
function keepScroll(fn) {
  var sc = document.querySelector('#view .scroll');
  var y = sc ? sc.scrollTop : 0;
  fn();
  var sc2 = document.querySelector('#view .scroll');
  if (sc2) sc2.scrollTop = y;
}

function onClick(ev) {
  Sfx.unlock();
  var el = ev.target.closest ? ev.target.closest('[data-act]') : null;
  if (!el || !$('app').contains(el)) return;
  var act = el.getAttribute('data-act'), arg = el.getAttribute('data-arg');
  if (el.classList.contains('off') || el.disabled) return;
  if (B && App.screen === 'battle' && modalOpen() && act !== 'modalBg' && el.closest('#battle')) return;
  if (B && B.tut && App.screen === 'battle' && !Tut.allows(act, arg)) { Tut.nudge(); return; }
  var fn = ACT[act];
  if (fn) fn(arg, el, ev);
}

/* ============================================================
   BOOT
   ============================================================ */
function boot(data) {
  App.save = loadSave();
  Sfx.setOn(App.save.settings.sound);
  Art.textures();
  $('app').addEventListener('click', onClick);
  document.addEventListener('pointerdown', function () { Sfx.unlock(); }, { passive: true });
  window.addEventListener('resize', function () { if (B && B.tut) Tut.refresh(); });
  var target = data && data.screen && data.screen !== 'battle' ? data.screen : 'home';
  if (target === 'deckedit') target = 'decks';
  App.screen = App.save.starter ? target : 'pick';
  render();
  Cloud.init(onRemoteSave);
  if (window.__SF_TEST__) window.__SF_TEST__.peek = function () { return { B: B, App: App, Tut: Tut }; };
}

(function () {
  var hot = (window.claude && window.claude.hot) || null;
  if (hot && typeof hot.snapshot === 'function') {
    try { hot.snapshot(function () { return { screen: App.screen }; }); } catch (e) { /* optional */ }
  }
  function start(d) {
    if (document.getElementById('app')) boot(d);
    else document.addEventListener('DOMContentLoaded', function () { boot(d); });
  }
  if (hot && typeof hot.ready === 'function') {
    try { hot.ready(start); } catch (e) { start({}); }
  } else start((hot && hot.data) || {});
})();
