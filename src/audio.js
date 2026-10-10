/* ============================================================
   SUNDERFALL - sound effects and music (Web Audio, unlocked on first tap)
   ============================================================ */

/* One AudioContext feeds two buses: effects (Sfx) and music (Music). Both are
   synthesized here, so the game ships with no audio files. Music.play(name) is
   the only music call the UI makes, so a track can later be swapped for a
   recorded file without touching ui.js. */
var Sfx, Music;
(function () {
  var ctx = null, sfxBus = null, musicBus = null, noiseBuf = null, sfxOn = true, musicOn = true;

  function anyOn() { return sfxOn || musicOn; }

  // iOS 17+: 'playback' keeps the game audible with the ring switch on silent.
  // With both buses off it drops to 'ambient' and leaves other apps' audio alone.
  function session() {
    try { if (navigator.audioSession) navigator.audioSession.type = anyOn() ? 'playback' : 'ambient'; } catch (e) { /* not supported */ }
  }

  function quiet(p) { if (p && p.catch) p.catch(function () { /* not allowed yet; the next tap retries */ }); }

  // iOS leaves the context 'interrupted' after a lock, call or app switch, so
  // anything but 'running' gets resumed on the next tap
  function wake() { if (ctx && ctx.state !== 'running' && ctx.resume) quiet(ctx.resume()); }
  function sleep() { if (ctx && ctx.state === 'running' && ctx.suspend) quiet(ctx.suspend()); }

  function unlock() {
    if (!anyOn()) return;
    if (ctx) { wake(); syncMusic(); return; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      session();
      ctx = new AC();
      wake();
      sfxBus = ctx.createGain();
      sfxBus.connect(ctx.destination);
      musicBus = ctx.createGain();
      musicBus.gain.value = MUSIC_LEVEL;
      musicBus.connect(ctx.destination);
      var blank = ctx.createBufferSource();
      blank.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
      blank.connect(ctx.destination);
      blank.start(0);
      var len = Math.floor(ctx.sampleRate * 0.6);
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { ctx = null; return; }
    syncMusic();
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) sleep(); else if (anyOn()) wake();
  });

  /* ---------- effects ---------- */
  function tone(freq, dur, type, vol, slideTo, delay) {
    if (!ctx || !sfxOn) return;
    var t = ctx.currentTime + (delay || 0);
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(sfxBus);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function noise(dur, vol, freq, q, delay, sweepTo) {
    if (!ctx || !sfxOn || !noiseBuf) return;
    var t = ctx.currentTime + (delay || 0);
    var src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuf;
    f.type = 'bandpass'; f.frequency.setValueAtTime(freq || 1200, t); f.Q.value = q || 1;
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    g.gain.setValueAtTime(vol || 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(sfxBus);
    src.start(t); src.stop(t + dur + 0.05);
  }

  // phone speakers drop most sound below ~400 Hz, so every low thump carries a
  // triangle or noise layer up where a speaker can play it
  var sounds = {
    tap: function () { tone(660, 0.05, 'triangle', 0.25); },
    play: function () { noise(0.25, 0.7, 500, 0.8, 0, 2400); tone(330, 0.22, 'triangle', 0.3, 495); },
    spell: function () { tone(523, 0.35, 'triangle', 0.26); tone(784, 0.4, 'sine', 0.24, null, 0.05); noise(0.35, 0.35, 3000, 2, 0, 6000); },
    hit: function () { tone(140, 0.18, 'sine', 0.5, 50); tone(330, 0.12, 'triangle', 0.4, 120); noise(0.12, 0.9, 1100, 0.7); },
    face: function () { tone(90, 0.3, 'sine', 0.4, 40); tone(240, 0.26, 'triangle', 0.45, 90); noise(0.2, 0.8, 700, 0.6); },
    death: function () { noise(0.45, 0.9, 2600, 1.2, 0, 300); tone(220, 0.35, 'triangle', 0.32, 80); },
    heal: function () { tone(880, 0.3, 'sine', 0.26); tone(1320, 0.35, 'sine', 0.18, null, 0.06); },
    shield: function () { tone(1200, 0.12, 'square', 0.12, 600); noise(0.15, 0.5, 4000, 3); },
    buff: function () { tone(587, 0.18, 'triangle', 0.3, 880); },
    turn: function () { tone(392, 0.5, 'triangle', 0.3); tone(587, 0.6, 'triangle', 0.24, null, 0.08); },
    flip: function () { noise(0.08, 0.6, 2200, 1.5); },
    rare: function () { [784, 988, 1175, 1568].forEach(function (f, i) { tone(f, 0.5, 'sine', 0.2, null, i * 0.06); }); },
    coin: function () { tone(1568, 0.08, 'square', 0.2); tone(2093, 0.12, 'square', 0.17, null, 0.06); },
    win: function () { [392, 494, 587, 784].forEach(function (f, i) { tone(f, 0.9, 'triangle', 0.28, null, i * 0.12); }); },
    lose: function () { [330, 294, 247, 196].forEach(function (f, i) { tone(f, 0.8, 'triangle', 0.3, null, i * 0.16); }); },
    error: function () { tone(180, 0.12, 'square', 0.12); tone(360, 0.1, 'triangle', 0.15); }
  };

  /* ---------- music ----------
     Notes are scheduled AHEAD seconds in advance on the audio clock, so a busy
     main thread (the Warlord AI thinking) does not stall the beat. Each track is
     a loop of four-bar sections on an eighth-note grid; tunes are generated per
     section from a seed, so a fixed seed gives a theme that comes back and seed
     0 gives a fresh variation. */
  var MUSIC_LEVEL = 0.5, AHEAD = 1.2, want = null, cur = null, timer = null, verb = null;

  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function seeded(a) {
    a = a >>> 0;
    return function () { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; };
  }

  function env(p, t, a, peak, hold, rel) {
    p.setValueAtTime(0.0001, t);
    p.exponentialRampToValueAtTime(peak, t + a);
    if (hold > 0) p.setValueAtTime(peak, t + a + hold);
    p.exponentialRampToValueAtTime(0.0001, t + a + hold + rel);
  }
  function osc(type, f, t, end, dest, cents) {
    var o = ctx.createOscillator();
    o.type = type; o.frequency.value = f;
    if (cents) o.detune.value = cents;
    o.connect(dest); o.start(t); o.stop(end);
    return o;
  }
  function filt(type, f, q, dest) { var b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; b.connect(dest); return b; }
  function amp(dest, v) { var g = ctx.createGain(); if (v !== undefined) g.gain.value = v; g.connect(dest); return g; }

  // bowed strings: detuned saws through a soft lowpass, swelling in and out
  function strings(out, notes, t, dur, vol, cut) {
    var g = amp(out), lp = filt('lowpass', cut, 0.5, g), a = Math.min(1, dur * 0.35);
    env(g.gain, t, a, vol, dur - a, 1.2);
    notes.forEach(function (m) { osc('sawtooth', hz(m), t, t + dur + 1.3, lp, -7); osc('sawtooth', hz(m), t, t + dur + 1.3, lp, 7); });
  }
  // lute or harp: a bright pluck that darkens as it rings
  function pluck(out, m, t, vol, dec, bright) {
    var f = hz(m), g = amp(out), lp = filt('lowpass', f, 0.8, g);
    lp.frequency.setValueAtTime(Math.min(f * (bright || 6), 8000), t);
    lp.frequency.exponentialRampToValueAtTime(Math.max(f * 1.2, 300), t + dec * 0.6);
    env(g.gain, t, 0.004, vol, 0, dec);
    osc('sawtooth', f, t, t + dec + 0.05, lp);
    osc('sine', f * 2, t, t + dec + 0.05, amp(lp, 0.3));
  }
  // a burst of noise through a bandpass: breath, skin slap, rim tick
  function hiss(out, f, t, vol, dec) {
    var s = ctx.createBufferSource(), g = amp(out), bp = filt('bandpass', f, 1.5, g);
    s.buffer = noiseBuf; s.connect(bp);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
    s.start(t, Math.random() * 0.4); s.stop(t + dec + 0.02);
  }
  // wooden flute: sine and triangle, a breath at the start, a late vibrato
  function flute(out, m, t, dur, vol) {
    var f = hz(m), end = t + dur + 0.4, g = amp(out), lfo = ctx.createOscillator(), depth = ctx.createGain();
    env(g.gain, t, 0.08, vol, Math.max(0, dur - 0.08), 0.3);
    var o1 = osc('sine', f, t, end, g), o2 = osc('triangle', f, t, end, amp(g, 0.25));
    lfo.frequency.value = 5;
    depth.gain.setValueAtTime(0, t);
    depth.gain.linearRampToValueAtTime(f * 0.007, t + Math.min(0.6, dur));
    lfo.connect(depth); depth.connect(o1.frequency); depth.connect(o2.frequency);
    lfo.start(t); lfo.stop(end);
    hiss(out, f * 2, t, vol * 0.35, 0.12);
  }
  // brass horn: the filter opens on each note for a soft blat
  function horn(out, m, t, dur, vol) {
    var f = hz(m), end = t + dur + 0.5, g = amp(out), lp = filt('lowpass', 300, 1.2, g);
    lp.frequency.setValueAtTime(300, t);
    lp.frequency.exponentialRampToValueAtTime(1900, t + 0.09);
    lp.frequency.exponentialRampToValueAtTime(1100, t + 0.5);
    env(g.gain, t, 0.05, vol, Math.max(0, dur - 0.05), 0.35);
    osc('sawtooth', f, t, end, lp, -5); osc('sawtooth', f, t, end, lp, 5);
  }
  // war drum: a falling thump, a body tone a phone speaker can play, the skin slap
  function drum(out, t, vol) {
    var g1 = amp(out), g2 = amp(out), o1 = osc('sine', 100, t, t + 0.7, g1), o2 = osc('triangle', 200, t, t + 0.3, g2);
    o1.frequency.setValueAtTime(100, t); o1.frequency.exponentialRampToValueAtTime(46, t + 0.4);
    o2.frequency.setValueAtTime(200, t); o2.frequency.exponentialRampToValueAtTime(90, t + 0.2);
    env(g1.gain, t, 0.004, vol, 0, 0.6);
    env(g2.gain, t, 0.003, vol * 0.5, 0, 0.22);
    hiss(out, 700, t, vol * 0.6, 0.06);
  }
  // frame-drum rim: a dry tick between the big hits
  function rim(out, t, vol) {
    var g = amp(out);
    hiss(out, 2200, t, vol, 0.07);
    osc('triangle', 520, t, t + 0.1, g);
    env(g.gain, t, 0.002, vol * 0.3, 0, 0.05);
  }
  // struck bell with inharmonic partials, to mark a new section
  function bell(out, m, t, vol) {
    var f = hz(m);
    [[1, 1, 2.4], [2.76, 0.35, 1.1], [5.4, 0.12, 0.5]].forEach(function (p) {
      var g = amp(out);
      osc('sine', f * p[0], t, t + p[2] + 0.05, g);
      env(g.gain, t, 0.003, vol * p[1], 0, p[2]);
    });
  }

  // D minor. Each chord lists its bass, then root, third and fifth; the A chord
  // borrows C sharp so the cadence pulls back home to D.
  var CHORD = { Dm: [50, 62, 65, 69], C: [48, 60, 64, 67], Bb: [46, 58, 62, 65], A: [45, 57, 61, 64], F: [53, 65, 69, 72], Gm: [43, 55, 58, 62] };

  function inKey(m, ch) {
    var pc = ((m % 12) + 12) % 12;
    if (pc === 0) return ch !== 'A';
    if (pc === 1) return ch === 'A';
    return [2, 4, 5, 7, 9, 10].indexOf(pc) >= 0;
  }
  function stepFrom(m, dir, ch) { do { m += dir; } while (!inKey(m, ch)); return m; }
  function tonesOf(ch) { return CHORD[ch].slice(1).map(function (m) { return m % 12; }); }
  // nearest chord tone, nudged so the line keeps moving
  function landOn(m, pcs, R, lo, hi) {
    var best = m, score = 1e9;
    for (var x = lo; x <= hi; x++) {
      if (pcs.indexOf(x % 12) < 0) continue;
      var sc = Math.abs(x - m) + (x === m ? 2.5 : 0) + R() * 3;
      if (sc < score) { score = sc; best = x; }
    }
    return best;
  }
  // a four-bar phrase: chord tones on the strong beats, scale steps between,
  // bar three repeats bar one's rhythm, and the last note is the chord root
  function phrase(chords, R, T) {
    var notes = {}, m = Math.round((T.lo + T.hi) / 2), first = null;
    chords.forEach(function (ch, bar) {
      var rh = bar === 3 ? T.ends[Math.floor(R() * T.ends.length)] : bar === 2 ? first : T.mids[Math.floor(R() * T.mids.length)];
      if (bar === 0) first = rh;
      rh.forEach(function (n, k) {
        if (bar === 3 && k === rh.length - 1) m = landOn(m, [CHORD[ch][1] % 12], R, T.lo, T.hi);
        else if (n[0] % 4 === 0) m = landOn(m, tonesOf(ch), R, T.lo, T.hi);
        else {
          var dir = R() < 0.5 ? -1 : 1, next = stepFrom(m, dir, ch);
          m = next < T.lo || next > T.hi ? stepFrom(m, -dir, ch) : next;
        }
        notes[bar * 8 + n[0]] = { m: m, d: n[1] };
      });
    });
    return notes;
  }

  // rhythms are [step, length] pairs inside one bar of eight eighth notes;
  // level evens out how loud each track sounds on a phone speaker
  var TRACKS = {
    // menus: harp and strings at a walking pace; a wooden flute carries the tune
    camp: {
      bpm: 66, level: 1, wet: 0.4, loop: 1, lo: 69, hi: 84,
      chords: { A: ['Dm', 'Bb', 'C', 'Dm'], B: ['F', 'C', 'Bb', 'A'] },
      form: [{ c: 'A' }, { c: 'A', tune: 7 }, { c: 'B', tune: 19 }, { c: 'A', tune: 0 }, { c: 'B', tune: 19 }],
      mids: [[[0, 4], [4, 4]], [[0, 3], [3, 1], [4, 4]], [[0, 2], [2, 2], [4, 4]], [[0, 6], [6, 2]]],
      ends: [[[0, 8]], [[0, 2], [2, 6]]],
      step: function (P, out, ch, bar, s, t) {
        var c = CHORD[ch], R = P.R, arp = [c[0], c[1], c[2], c[3], c[1] + 12, c[3], c[2], c[1]];
        if (s === 0) strings(out, c, t, P.dt * 8 + 0.2, 0.03, 950);
        if (!(s === 7 && R() < 0.4)) pluck(out, arp[s], t + (R() - 0.5) * 0.01, (s % 4 === 0 ? 0.075 : 0.055) * (0.85 + R() * 0.3), 1.6);
        if (bar === 0 && s === 0 && P.sec.c === 'B') bell(out, 86, t, 0.05);
        var n = P.tune[bar * 8 + s];
        if (n) flute(out, n.m, t, n.d * P.dt * 0.95, 0.09);
      }
    },
    // battle: war drums in 3+3+2 under a driving low-string ostinato; horns take the tune
    war: {
      bpm: 104, level: 1.3, wet: 0.22, loop: 1, lo: 57, hi: 74,
      chords: { A: ['Dm', 'Dm', 'Bb', 'C'], B: ['Gm', 'Dm', 'Bb', 'A'] },
      form: [{ c: 'A', lite: 1 }, { c: 'A' }, { c: 'B', tune: 5 }, { c: 'A', tune: 0 }, { c: 'B', tune: 5 }],
      mids: [[[0, 6], [6, 2]], [[0, 4], [4, 4]], [[0, 3], [3, 3], [6, 2]]],
      ends: [[[0, 8]], [[0, 4], [4, 4]]],
      step: function (P, out, ch, bar, s, t) {
        var c = CHORD[ch], R = P.R, accent = s === 0 || s === 3 || s === 6, b = c[0] + 12;
        if (accent) drum(out, t, s === 0 ? 0.42 : 0.3);
        else if (bar === 3 && s >= 4) drum(out, t, 0.2 + (s - 4) * 0.06);
        else rim(out, t, 0.1 + R() * 0.04);
        pluck(out, [b, b, b + 12, b, b + 7, b, b + 12, b + 7][s], t, accent ? 0.1 : 0.065, 0.24, 14);
        if (accent) pluck(out, b + 12 + (s === 3 ? 7 : 0), t, 0.045, 0.2, 8);
        if (!P.sec.lite && s === 0) strings(out, c.slice(1), t, P.dt * 8 + 0.1, 0.04, 1300);
        var n = P.tune[bar * 8 + s];
        if (n) horn(out, n.m, t, n.d * P.dt * 0.92, 0.075);
      }
    }
  };

  function reverb() {
    var rate = ctx.sampleRate, len = Math.floor(rate * 2.6), b = ctx.createBuffer(2, len, rate);
    for (var ch = 0; ch < 2; ch++) {
      var d = b.getChannelData(ch), lp = 0;
      for (var i = 0; i < len; i++) { lp += (Math.random() * 2 - 1 - lp) * 0.3; d[i] = lp * Math.pow(1 - i / len, 3); }
    }
    var cv = ctx.createConvolver();
    cv.buffer = b;
    return cv;
  }

  function startTrack(name) {
    var T = TRACKS[name], now = ctx.currentTime, out = ctx.createGain(), wet = ctx.createGain();
    if (!verb) { verb = reverb(); verb.connect(musicBus); }
    out.gain.setValueAtTime(0.0001, now);
    out.gain.exponentialRampToValueAtTime(T.level, now + 1.5);
    out.connect(musicBus);
    wet.gain.value = T.wet;
    out.connect(wet); wet.connect(verb);
    return { name: name, T: T, out: out, wet: wet, dt: 60 / T.bpm / 2, next: now + 0.1, pos: 0, fi: 0, R: seeded(Math.random() * 4294967296) };
  }

  function fadeOut(P) {
    var now = ctx.currentTime, g = P.out.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(Math.max(g.value, 0.0001), now);
    g.exponentialRampToValueAtTime(0.0001, now + 1.2);
    setTimeout(function () { P.out.disconnect(); P.wet.disconnect(); }, (AHEAD + 2) * 1000);
  }

  function scheduleStep(P, t) {
    var T = P.T, k = P.pos % 32, bar = k >> 3, s = k & 7;
    if (k === 0) {
      P.sec = T.form[P.fi];
      P.chords = T.chords[P.sec.c];
      P.tune = P.sec.tune === undefined ? {} : phrase(P.chords, seeded(P.sec.tune || P.R() * 4294967296), T);
    }
    T.step(P, P.out, P.chords[bar], bar, s, t);
    P.pos++;
    if (P.pos % 32 === 0) P.fi = P.fi + 1 < T.form.length ? P.fi + 1 : T.loop;
  }

  function tick() {
    timer = null;
    if (!cur) return;
    if (ctx.state === 'running') {
      var now = ctx.currentTime;
      // far behind after a pause: skip ahead rather than fire a pile of late notes
      if (cur.next < now - 0.25) cur.next = now + 0.05;
      try { while (cur.next < now + AHEAD) { scheduleStep(cur, cur.next); cur.next += cur.dt; } } catch (e) { cur = null; return; }
    }
    timer = setTimeout(tick, 250);
  }

  function syncMusic() {
    if (!ctx) return;
    var name = musicOn && TRACKS[want] ? want : null;
    if (cur && cur.name === name) return;
    if (cur) { fadeOut(cur); cur = null; }
    if (name) { cur = startTrack(name); if (!timer) tick(); }
  }

  Sfx = {
    unlock: unlock,
    play: function (name) { try { if (sounds[name]) sounds[name](); } catch (e) { /* audio is optional */ } },
    setOn: function (v) { sfxOn = !!v; session(); if (!anyOn()) sleep(); },
    isOn: function () { return sfxOn; }
  };
  Music = {
    // 'camp' in menus, 'war' in battle, null for silence
    play: function (name) { want = name || null; try { syncMusic(); } catch (e) { /* audio is optional */ } },
    setOn: function (v) { musicOn = !!v; session(); try { syncMusic(); } catch (e) { /* audio is optional */ } if (!anyOn()) sleep(); },
    isOn: function () { return musicOn; }
  };
})();
