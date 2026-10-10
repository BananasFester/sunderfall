/* ============================================================
   SUNDERFALL - sound effects (Web Audio, unlocked on first tap)
   ============================================================ */

var Sfx = (function () {
  var ctx = null, master = null, on = true, noiseBuf = null;

  function unlock() {
    if (ctx) { if (ctx.state === 'suspended' && ctx.resume) ctx.resume(); return; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
      var len = Math.floor(ctx.sampleRate * 0.6);
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { ctx = null; }
  }

  function tone(freq, dur, type, vol, slideTo, delay) {
    if (!ctx || !on) return;
    var t = ctx.currentTime + (delay || 0);
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function noise(dur, vol, freq, q, delay, sweepTo) {
    if (!ctx || !on || !noiseBuf) return;
    var t = ctx.currentTime + (delay || 0);
    var src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuf;
    f.type = 'bandpass'; f.frequency.setValueAtTime(freq || 1200, t); f.Q.value = q || 1;
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    g.gain.setValueAtTime(vol || 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t); src.stop(t + dur + 0.05);
  }

  var sounds = {
    tap: function () { tone(660, 0.05, 'triangle', 0.06); },
    play: function () { noise(0.25, 0.16, 500, 0.8, 0, 2400); tone(330, 0.22, 'triangle', 0.08, 495); },
    spell: function () { tone(523, 0.35, 'sine', 0.09); tone(784, 0.4, 'sine', 0.07, null, 0.05); noise(0.35, 0.08, 3000, 2, 0, 6000); },
    hit: function () { tone(140, 0.18, 'sine', 0.3, 50); noise(0.12, 0.2, 900, 0.7); },
    face: function () { tone(90, 0.3, 'sine', 0.35, 40); noise(0.2, 0.18, 400, 0.6); },
    death: function () { noise(0.45, 0.22, 2600, 1.2, 0, 300); tone(220, 0.35, 'triangle', 0.08, 80); },
    heal: function () { tone(880, 0.3, 'sine', 0.07); tone(1320, 0.35, 'sine', 0.05, null, 0.06); },
    shield: function () { tone(1200, 0.12, 'square', 0.05, 600); noise(0.15, 0.12, 4000, 3); },
    buff: function () { tone(587, 0.18, 'triangle', 0.07, 880); },
    turn: function () { tone(392, 0.5, 'sine', 0.08); tone(587, 0.6, 'sine', 0.06, null, 0.08); },
    flip: function () { noise(0.08, 0.12, 2200, 1.5); },
    rare: function () { [784, 988, 1175, 1568].forEach(function (f, i) { tone(f, 0.5, 'sine', 0.06, null, i * 0.06); }); },
    coin: function () { tone(1568, 0.08, 'square', 0.04); tone(2093, 0.12, 'square', 0.035, null, 0.06); },
    win: function () { [392, 494, 587, 784].forEach(function (f, i) { tone(f, 0.9, 'triangle', 0.08, null, i * 0.12); }); },
    lose: function () { [330, 294, 247, 196].forEach(function (f, i) { tone(f, 0.8, 'sine', 0.08, null, i * 0.16); }); },
    error: function () { tone(180, 0.12, 'square', 0.04); }
  };

  return {
    unlock: unlock,
    play: function (name) { try { if (sounds[name]) sounds[name](); } catch (e) { /* audio is optional */ } },
    setOn: function (v) { on = !!v; },
    isOn: function () { return on; }
  };
})();
