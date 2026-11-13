'use strict';
/* BlindTrainer – Speicherung (lokal im Browser, localStorage) */
(function (BT) {
  const KEY = 'blindtrainer.v1';

  const DEFAULT_SETTINGS = {
    sound: true, keySound: false, showKeyboard: true, showHands: true, showHint: true,
    textSize: 'm', dailyGoal: 10, theme: 'light', unlockAll: false,
  };

  function blankProfile(name, avatar) {
    return {
      id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name, avatar, created: Date.now(), lastUsed: Date.now(),
      xp: 0,
      lessons: {},
      keyStats: {},
      totals: { keys: 0, errors: 0, time: 0, rounds: 0, perfectRounds: 0, bestZpm: 0, blindLessons: 0, bestStreak: 0, gameTime: 0, goalDays: 0 },
      days: {},
      games: { blitz: 0, blitzHits: 0, rain: 0, rainWords: 0, race: {} },
      achievements: {},
      history: [],
      flags: {},
      settings: Object.assign({}, DEFAULT_SETTINGS),
    };
  }

  const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

  function normalize(p) {
    const b = blankProfile(p.name || 'Kind', p.avatar || '🐱');
    Object.keys(b).forEach((k) => {
      if (p[k] == null) p[k] = b[k];
      else if (isObj(b[k]) && isObj(p[k]) && ['totals', 'games', 'settings', 'flags'].includes(k)) p[k] = Object.assign({}, b[k], p[k]);
    });
    if (!isObj(p.games.race)) p.games.race = {};
    if (!Array.isArray(p.history)) p.history = [];
    return p;
  }

  BT.Store = {
    data: { version: 1, activeId: null, profiles: {} },
    persistOk: true,

    load() {
      let raw = null;
      try { raw = localStorage.getItem(KEY); } catch (e) { this.persistOk = false; }
      if (raw) {
        try {
          const d = JSON.parse(raw);
          if (d && isObj(d.profiles)) this.data = d;
        } catch (e) { console.warn('BlindTrainer: Speicherstand unlesbar', e); }
      }
      Object.values(this.data.profiles).forEach(normalize);
      if (this.data.activeId && !this.data.profiles[this.data.activeId]) this.data.activeId = null;
    },

    save() {
      try { localStorage.setItem(KEY, JSON.stringify(this.data)); this.persistOk = true; }
      catch (e) { this.persistOk = false; console.warn('BlindTrainer: Speichern fehlgeschlagen', e); }
    },

    get profile() { return this.data.profiles[this.data.activeId] || null; },

    create(name, avatar) {
      const p = blankProfile(name, avatar);
      this.data.profiles[p.id] = p;
      this.data.activeId = p.id;
      this.save();
      return p;
    },

    activate(id) {
      if (!this.data.profiles[id]) return;
      this.data.activeId = id;
      this.data.profiles[id].lastUsed = Date.now();
      this.save();
    },

    logout() { this.data.activeId = null; this.save(); },

    remove(id) {
      delete this.data.profiles[id];
      if (this.data.activeId === id) this.data.activeId = null;
      this.save();
    },

    resetProgress(id) {
      const old = this.data.profiles[id];
      if (!old) return;
      const p = blankProfile(old.name, old.avatar);
      p.id = old.id; p.created = old.created; p.settings = old.settings;
      p.settings.unlockAll = false;
      this.data.profiles[id] = p;
      this.save();
    },

    importData(d) {
      if (!d || !isObj(d.profiles)) throw new Error('Keine gültige BlindTrainer-Sicherung.');
      Object.values(d.profiles).forEach(normalize);
      this.data = { version: 1, activeId: null, profiles: d.profiles };
      this.save();
    },
  };
})(window.BT);
