/* ============================================================
   SUNDERFALL - Drill-Yard tutorial
   A scripted first battle. Fixed hands and draws, a scripted enemy
   for three turns, spotlighted steps and gated input, then free play.
   ============================================================ */

var TUT_DATA = {
  pHand: ['t_recruit', 'u02', 'f04', 'f03'],
  pDraws: ['u01', 'f07', 'f06', 'f05', 'f15', 'f02', 'u02', 'f04', 'f03', 'u03', 'u04', 'f07', 'f05', 'f11', 'f10', 'f08', 'f09', 'f14', 'u06', 'f06'],
  eHand: ['h01', 'h03', 'h02', 'h06', 'h01'],
  eDraws: ['h02', 'h01', 'h03', 'h01', 'h02', 'h06', 'h03', 'h01', 'h02', 'h06', 'h03', 'h01', 'h02', 'h08', 'h06', 'h01', 'h02', 'h03', 'h01', 'h02'],
  script: { 2: [['play', 'h01']], 4: [['play', 'h03'], ['attack', 'h01']], 6: [['play', 'h02']] },
  coach: 'Sergeant Harrow',
  enemy: 'The Grave-Drill'
};

var Tut = (function () {
  var T = { on: false, i: 0, free: false, queue: [], queueTurn: -1 };

  function q(sel) { return document.querySelector(sel); }
  function unitById(owner, id) {
    var b = B.s.players[owner].board;
    for (var i = 0; i < b.length; i++) if (b[i].id === id) return b[i];
    return null;
  }
  function elUnit(owner, id) { var u = unitById(owner, id); return u ? elFor(u.uid) : null; }
  function handCard(id) {
    var h = B.s.players[B.human].hand;
    for (var i = 0; i < h.length; i++) if (h[i].id === id) return h[i];
    return null;
  }
  function elHand(id) { var h = handCard(id); return h ? document.querySelector('[data-huid="' + h.uid + '"]') : null; }
  function handIdOf(arg) { var h = B.s.players[B.human].hand.filter(function (x) { return x.uid === +arg; })[0]; return h ? h.id : null; }
  function humanMain(turn) { var s = B.s; return s.phase === 'main' && s.active === B.human && B.mode === 'idle' && (turn === undefined || s.turn === turn); }

  function playFlow(id) {
    return {
      allow: function (act, arg) {
        if (act === 'hand' || act === 'playHand') return handIdOf(arg) === id;
        return act === 'closeModal' || act === 'modalBg';
      },
      focus: function () { return modalOpen() ? q('#modal-root [data-act="playHand"]') : elHand(id); },
      wait: function (ev, d) { return ev === 'played' && d === id; }
    };
  }
  function inspectFlow(owner, id) {
    return {
      allow: function (act, arg) { var u = act === 'unit' ? findUnit(B.s, +arg) : null; return !!u && u.id === id; },
      focus: function () { return elUnit(owner, id); },
      wait: function (ev, d) { return ev === 'inspect' && d === id; }
    };
  }
  function attackFlow(ids) {
    return {
      allow: function (act, arg) {
        if (act === 'atkStart' || act === 'atkGo' || act === 'atkCancel') return true;
        if (act === 'unit') { var u = findUnit(B.s, +arg); return !!u && u.owner === B.human; }
        return false;
      },
      focus: function () {
        if (B.mode === 'idle') return q('[data-act="atkStart"]');
        if (B.mode !== 'attack') return null;
        var list = ids ? ids.map(function (id) { return unitById(B.human, id); }) : attackersAvailable(B.s, B.human);
        for (var i = 0; i < list.length; i++) {
          var u = list[i];
          if (u && !B.sel[u.uid] && canAttack(B.s, B.human, u)) return elFor(u.uid);
        }
        return q('[data-act="atkGo"]');
      },
      wait: function (ev) { return ev === 'attacked'; }
    };
  }
  function ext(base, more) { for (var k in more) if (more.hasOwnProperty(k)) base[k] = more[k]; return base; }
  function info(text, focus, ready, extra) { return ext({ text: text, next: true, focus: focus || null, ready: ready || null }, extra || {}); }

  var STEPS = [
    info('Wardens die in the field because they skipped the drill. This is the drill. It takes five minutes.', null, function () { return humanMain(1); }),
    info('That is the enemy Warden, and those red numbers are its health: <b>12</b>. Bring it to zero and you win.', function () { return q('#hero1 .life'); }, function () { return humanMain(1); }),
    info('This is you. <b>20</b> health. Lose it all and the battle is lost.', function () { return q('#hero0 .life'); }, function () { return humanMain(1); }),
    info('Cards cost <b>Shards</b>. You have one now. Every turn you get one more, up to ten, and they refill.', function () { return q('#hero0 .shards'); }, function () { return humanMain(1); }),
    ext({ text: 'Tap the <b>Drill Recruit</b> in your hand to read it, then press <b>Play</b>. Cost is in the diamond. Attack is black, health is red.', ready: function () { return humanMain(1); } }, playFlow('t_recruit')),
    info('Fresh units cannot attack on the turn they arrive. That is the Z mark. They can still block.', function () { return elUnit(0, 't_recruit'); }, function () { return humanMain(1); }),
    { text: 'Nothing else you can afford. Press <b>End Turn</b>.', ready: function () { return humanMain(1); },
      allow: function (act) { return act === 'endTurn'; }, focus: function () { return q('[data-act="endTurn"]'); }, wait: function (ev) { return ev === 'endTurn'; } },
    ext({ text: 'The enemy raised a <b>Gravecrawler</b>. Tap any unit to read it. Tap that one.', ready: function () { return humanMain(3); } }, inspectFlow(1, 'h01')),
    info('<b>Last Breath</b> means something happens when it dies. Remember that.', null, null, { closeOnNext: true }),
    ext({ text: 'You have two Shards now. Play the <b>Roadwarden Sellsword</b>.', ready: function () { return humanMain(3); } }, playFlow('u02')),
    ext({ text: 'Your Recruit is ready. Press <b>Attack</b>, tap the Recruit, then press <b>Attack</b> again to send it.', ready: function () { return humanMain(3) || (B.mode === 'attack' && B.s.turn === 3); } }, attackFlow(['t_recruit'])),
    info('No one blocked, so the enemy Warden took the full 2 damage.', function () { return q('#hero1 .life'); }, function () { return humanMain(3) && B.s.attacked; }),
    info('Attacking left your Recruit <b>SPENT</b>. It cannot block during the enemy turn. The Sellsword stayed home on guard.', function () { return elUnit(0, 't_recruit'); }, function () { return humanMain(3) && B.s.attacked; }),
    { text: 'Press <b>End Turn</b> and watch what they do.', ready: function () { return humanMain(3); },
      allow: function (act) { return act === 'endTurn'; }, focus: function () { return q('[data-act="endTurn"]'); }, wait: function (ev) { return ev === 'endTurn'; } },
    { text: 'They attack with the Gravecrawler. Tap your <b>Sellsword</b>, tap the <b>Gravecrawler</b> to block it, then press <b>Confirm</b>.',
      ready: function () { return B.mode === 'block'; },
      allow: function (act, arg) {
        if (act === 'blkGo') return Object.keys(B.blocks).length > 0;
        if (act !== 'unit') return false;
        var u = findUnit(B.s, +arg);
        return !!u && (u.id === 'u02' || (!!B.s.combat && B.s.combat.attackers.indexOf(u.uid) >= 0));
      },
      focus: function () {
        if (Object.keys(B.blocks).length) return q('[data-act="blkGo"]');
        return B.blockSel ? elUnit(1, 'h01') : elUnit(0, 'u02');
      },
      wait: function (ev) { return ev === 'blocked'; } },
    info('Blocker and attacker strike each other at once. Your Sellsword lived. The Gravecrawler died, and its <b>Last Breath</b> left a Husk behind.', function () { return elUnit(1, 't_husk'); }, function () { return !!unitById(1, 't_husk'); }),
    info('Damage on units heals at the end of every turn. To kill a unit, deal its full health in a single turn.', null, function () { return !!unitById(1, 't_husk'); }),
    ext({ text: 'They played a <b>Rot Adder</b>. Tap it to read it.', ready: function () { return humanMain(5); } }, inspectFlow(1, 'h03')),
    info('<b>Venom</b>: anything it damages in combat dies, however big. Kill it before it bites.', null, null, { closeOnNext: true }),
    { text: 'Play <b>Cinderbolt</b>, then tap the <b>Rot Adder</b> as its target.', ready: function () { return humanMain(5) || (B.mode === 'target' && B.s.turn === 5); },
      allow: function (act, arg) {
        if (act === 'hand' || act === 'playHand') return handIdOf(arg) === 'f03';
        if (act === 'unit') { var u = findUnit(B.s, +arg); return B.mode === 'target' && !!u && u.id === 'h03'; }
        return act === 'closeModal' || act === 'modalBg' || act === 'tgtCancel';
      },
      focus: function () { if (B.mode === 'target') return elUnit(1, 'h03'); return modalOpen() ? q('#modal-root [data-act="playHand"]') : elHand('f03'); },
      wait: function (ev, d) { return ev === 'played' && d === 'f03'; } },
    ext({ text: 'Two Shards left. <b>Shard Prospector</b> draws you a card when it arrives. Play it.', ready: function () { return humanMain(5); } }, playFlow('u01')),
    ext({ text: 'Attack with the <b>Recruit</b> and the <b>Sellsword</b>. The Prospector just arrived, so it waits.', ready: function () { return humanMain(5) || (B.mode === 'attack' && B.s.turn === 5); } }, attackFlow(['t_recruit', 'u02'])),
    info('Every unblocked hit lands on the Warden. Keep the pressure on.', function () { return q('#hero1 .life'); }, function () { return humanMain(5) && B.s.attacked; }),
    { text: 'End your turn.', ready: function () { return humanMain(5); },
      allow: function (act) { return act === 'endTurn'; }, focus: function () { return q('[data-act="endTurn"]'); }, wait: function (ev) { return ev === 'endTurn'; } },
    ext({ text: '<b>Warg Rider</b> has <b>Charge</b>: it can attack the turn it arrives. Play it.', ready: function () { return humanMain(7); } }, playFlow('f04')),
    ext({ text: 'Send everything that is ready. This time the enemy chooses blockers, so watch who they put in the way.', ready: function () { return humanMain(7) || (B.mode === 'attack' && B.s.turn === 7); } }, attackFlow(null)),
    info('That is the drill. Read every card, count your Shards, and keep a blocker home when your health is low. Now finish them.', null, function () { return humanMain(7) && B.s.attacked; })
  ];

  function step() { return T.on && !T.free ? STEPS[T.i] : null; }
  function isReady(st) { return !!st && B && B.s.phase !== 'over' && (!st.ready || st.ready()); }

  function start() { T.on = true; T.i = 0; T.free = false; T.queue = []; T.queueTurn = -1; refresh(); }
  function stop() { T.on = false; T.free = false; clear(); }
  function finish() { T.free = true; clear(); if (B) { B.lvl = 1; renderBattle(); } }
  function advance() {
    T.i++;
    if (T.i >= STEPS.length) { finish(); return; }
    refresh();
  }

  function clear() { var r = $('tut-root'); if (r) r.innerHTML = ''; }

  function refresh() {
    var root = $('tut-root');
    if (!root) return;
    var st = step();
    if (!st || !B || !$('battle') || !isReady(st)) { root.innerHTML = ''; return; }
    var app = $('app').getBoundingClientRect();
    var el = st.focus ? st.focus() : null;
    var html = '', place = 'bottom';
    if (el) {
      var hand = el.closest ? el.closest('.b-hand') : null;
      if (hand) { hand.scrollLeft = Math.max(0, el.offsetLeft - hand.clientWidth / 2 + el.clientWidth / 2); }
      var r = el.getBoundingClientRect();
      var pad = 6;
      var x = r.left - app.left - pad, y = r.top - app.top - pad, w = r.width + pad * 2, h = r.height + pad * 2;
      var W = app.width, H = app.height;
      html += '<div class="tut-dim" style="left:0;top:0;width:' + W + 'px;height:' + Math.max(0, y) + 'px"></div>' +
        '<div class="tut-dim" style="left:0;top:' + (y + h) + 'px;width:' + W + 'px;height:' + Math.max(0, H - y - h) + 'px"></div>' +
        '<div class="tut-dim" style="left:0;top:' + y + 'px;width:' + Math.max(0, x) + 'px;height:' + h + 'px"></div>' +
        '<div class="tut-dim" style="left:' + (x + w) + 'px;top:' + y + 'px;width:' + Math.max(0, W - x - w) + 'px;height:' + h + 'px"></div>' +
        '<div class="tut-ring" style="left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px"></div>';
      place = (y + h / 2) > H * 0.5 ? 'top' : 'bottom';
    } else if (st.next) {
      html += '<div class="tut-dim" style="inset:0"></div>';
    }
    html += '<div class="coach ' + place + '">' + Art.portrait('harrow', 'forge', 'helm') + '<div><div class="who">' + TUT_DATA.coach + '</div><p>' + st.text + '</p>' +
      '<div class="crow"><span class="step">' + (T.i + 1) + ' / ' + STEPS.length + '</span><span style="display:flex;gap:6px">' +
      '<button class="btn ghost" data-act="tutSkip">Skip</button>' + (st.next ? '<button class="btn" data-act="tutNext">Next</button>' : '') + '</span></div></div></div>';
    root.innerHTML = html;
  }

  var ALWAYS = { bmenu: 1, showLog: 1, toggleSound: 1, toggleMusic: 1, concede: 1, tutNext: 1, tutSkip: 1, rematch: 1, leaveBattle: 1 };

  function allows(act, arg) {
    if (!T.on || T.free) return true;
    if (ALWAYS[act]) return true;
    if ((act === 'closeModal' || act === 'modalBg') && App.modalKind === 'menu') return true;
    var st = step();
    if (!st || !isReady(st)) return false;
    if (st.next) return false;
    return st.allow ? st.allow(act, arg) : false;
  }

  function nudge() {
    var st = step();
    Sfx.play('error');
    if (st && isReady(st)) toast(st.text.replace(/<[^>]+>/g, ''));
    else toast('Watch the enemy turn.');
  }

  function event(name, data) {
    var st = step();
    if (st && !st.next && st.wait && st.wait(name, data)) advance();
  }

  function next() {
    var st = step();
    if (!st || !st.next) return;
    if (st.closeOnNext) closeModal();
    advance();
  }

  function holdAI() { var st = step(); return !!st && isReady(st) && B.s.active === B.ai; }

  function script() {
    if (!T.on || T.free) return null;
    var s = B.s;
    if (T.queueTurn !== s.turn) {
      T.queueTurn = s.turn;
      T.queue = (TUT_DATA.script[s.turn] || []).map(function (x) { return x.slice(); });
    }
    while (T.queue.length) {
      var nx = T.queue.shift();
      if (nx[0] === 'play') {
        var h = s.players[B.ai].hand.filter(function (x) { return x.id === nx[1]; })[0];
        if (h && !playBlocker(s, B.ai, h.uid)) return { type: 'play', uid: h.uid, target: null };
      } else {
        var u = unitById(B.ai, nx[1]);
        if (u && canAttack(s, B.ai, u)) return { type: 'attack', uids: [u.uid] };
      }
    }
    return { type: 'end' };
  }

  function scriptedNoBlocks() { return T.on && !T.free && B.s.turn < 7; }

  return { start: start, stop: stop, finish: finish, refresh: refresh, allows: allows, nudge: nudge, event: event, next: next,
    holdAI: holdAI, script: script, scriptedNoBlocks: scriptedNoBlocks, active: function () { return T.on && !T.free; },
    index: function () { return T.i; }, total: function () { return STEPS.length; },
    focusEl: function () { var st = step(); return st && isReady(st) && st.focus ? st.focus() : null; },
    isInfo: function () { var st = step(); return !!st && isReady(st) && !!st.next; } };
})();

function startTutorial() {
  closeModal();
  if (B) stopBattle();
  var D = TUT_DATA;
  var s = newGame({ seed: 4242, decks: [D.pDraws.slice(), D.eDraws.slice()], names: ['You', D.enemy], lives: [RULES.life, 12], first: 0 });
  var P = s.players[0], E = s.players[1];
  P.hand = D.pHand.map(function (id) { return { uid: s.uid++, id: id }; });
  P.deck = D.pDraws.slice().reverse();
  E.hand = D.eHand.map(function (id) { return { uid: s.uid++, id: id }; });
  E.deck = D.eDraws.slice().reverse();
  s.fx = [];
  B = { s: s, human: 0, ai: 1, lvl: 1, mode: 'wait', sel: {}, pending: null, blocks: {}, blockSel: null, preview: null,
    timers: [], token: Math.random(), ctx: { kind: 'tutorial' }, banners: ['forge', 'hollow'],
    faces: [null, { key: 'grave-drill', banner: 'hollow', icon: 'skull' }], mull: {}, tip: null, lastDraw: null, tut: true };
  mulligan(s, B.ai, []);
  App.screen = 'battle';
  buildBattleDOM();
  renderBattle();
  exec(function (st) { return mulligan(st, B.human, []); });
  B.mode = 'idle';
  Tut.start();
  renderBattle();
}
