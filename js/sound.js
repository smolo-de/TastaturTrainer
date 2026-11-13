'use strict';
/* TastaturTrainer – Soundeffekte, komplett synthetisch (WebAudio, keine Dateien nötig) */
(function (BT) {
  BT.Sound = {
    ctx: null,

    unlock() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        try { this.ctx = new AC(); } catch (e) { return; }
      }
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    },

    on() {
      const p = BT.Store.profile;
      return p ? p.settings.sound !== false : true;
    },

    tone(freq, dur, opt = {}) {
      if (!this.on() || !this.ctx) return;
      const { type = 'sine', vol = 0.12, at = 0, slide = 0 } = opt;
      const c = this.ctx;
      const t0 = c.currentTime + at;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t0);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(c.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.05);
    },

    key() {
      const p = BT.Store.profile;
      if (p && p.settings.keySound) this.tone(1300, 0.03, { type: 'triangle', vol: 0.035 });
    },
    error() { this.tone(170, 0.16, { type: 'square', vol: 0.045, slide: -50 }); },
    ok() { this.tone(700, 0.07, { type: 'sine', vol: 0.07 }); },
    pop() { this.tone(480, 0.12, { type: 'sine', vol: 0.12, slide: 700 }); },
    tick() { this.tone(880, 0.08, { type: 'sine', vol: 0.08 }); },
    go() { this.tone(1320, 0.28, { type: 'triangle', vol: 0.1 }); },
    miss() { this.tone(240, 0.3, { type: 'sawtooth', vol: 0.045, slide: -120 }); },
    success() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.2, { type: 'triangle', vol: 0.1, at: i * 0.09 })); },
    small() { [659, 880].forEach((f, i) => this.tone(f, 0.14, { type: 'triangle', vol: 0.09, at: i * 0.08 })); },
    star(i) {
      const f = 784 * Math.pow(1.26, i);
      this.tone(f, 0.32, { type: 'triangle', vol: 0.12 });
      this.tone(f * 2, 0.22, { type: 'sine', vol: 0.04, at: 0.03 });
    },
    levelUp() { [523, 659, 784, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.17, { type: 'square', vol: 0.045, at: i * 0.1 })); },
    lose() { [392, 330, 262].forEach((f, i) => this.tone(f, 0.26, { type: 'triangle', vol: 0.1, at: i * 0.18 })); },
  };
})(window.BT);
