'use strict';
/* BlindTrainer – Speicherung (lokal im Browser, localStorage)
 *
 * Sicherheit: Alles, was aus localStorage oder einer importierten Datei kommt, gilt als
 * nicht vertrauenswürdig (andere lokale Seiten können file://-Speicher verändern, eine
 * Sicherungsdatei kann manipuliert sein). Deshalb wird jedes Profil beim Laden und Importieren
 * gegen ein festes Schema geprüft: nur bekannte Felder, Zahlen begrenzt, Texte gekürzt,
 * Avatare nur aus der festen Liste.
 */
(function (BT) {
  const KEY = 'blindtrainer.v1';
  const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
  const MAX_PROFILES = 50;

  /* Lektions-Reihenfolge der ersten Version (Speicherstand mit Index statt ID) */
  const LEGACY_QWERTZ = ['fj', 'dk', 'sl', 'aoe', 'gh', 'ei', 'ru', 'tz', 'nm', 'wo', 'c-comma', 'vb', 'qp', 'x-dot', 'y-dash',
    'umlauts', 'shift', 'punct', 'numbers', 'sentences'];

  const DEFAULT_SETTINGS = {
    sound: true, keySound: false, showKeyboard: true, showHands: true, showHint: true,
    textSize: 'm', dailyGoal: 10, theme: 'light', unlockAll: false, lang: 'de',
  };

  const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
  const num = (v, min, max, def = 0) => { const n = Number(v); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def; };
  const int = (v, min, max, def = 0) => Math.round(num(v, min, max, def));
  const str = (v, max, def = '') => (typeof v === 'string' ? v.slice(0, max) : def);
  const bool = (v, def) => (typeof v === 'boolean' ? v : def);
  const oneOf = (v, list, def) => (list.includes(v) ? v : def);
  const entries = (o, max) => (isObj(o) ? Object.entries(o).slice(0, max) : []);
  const newId = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const knownLang = (v) => (typeof v === 'string' && BT.I18N && BT.I18N[v] ? v : null);

  function blankProfile(name, avatar, lang) {
    return {
      id: newId(),
      name, avatar, created: Date.now(), lastUsed: Date.now(),
      xp: 0,
      lessons: {},
      keyStats: {},
      totals: { keys: 0, errors: 0, time: 0, rounds: 0, perfectRounds: 0, bestZpm: 0, blindLessons: 0, bestStreak: 0, gameTime: 0, goalDays: 0 },
      days: {},
      games: { blitz: 0, blitzHits: 0, rain: 0, rainWords: 0, race: {} },
      achievements: {},
      history: [],
      flags: { guideDone: false },
      settings: Object.assign({}, DEFAULT_SETTINGS, { lang: lang || DEFAULT_SETTINGS.lang }),
    };
  }

  /* Profil gegen das Schema prüfen – gibt ein neues, sauberes Objekt zurück (oder null) */
  function sanitizeProfile(raw) {
    if (!isObj(raw)) return null;
    const avatars = new Set(BT.AVATARS.map((a) => a.e));
    const p = blankProfile('', '🐱');
    p.id = typeof raw.id === 'string' && /^p[a-z0-9]{4,24}$/.test(raw.id) ? raw.id : newId();
    p.name = str(raw.name, 16).replace(/[\u0000-\u001f\u007f]/g, '').trim() || '?';
    p.avatar = avatars.has(raw.avatar) ? raw.avatar : '🐱';
    p.created = int(raw.created, 0, 4102444800000, Date.now());
    p.lastUsed = int(raw.lastUsed, 0, 4102444800000, p.created);
    p.xp = int(raw.xp, 0, 10000000);

    entries(raw.lessons, 400).forEach(([k, v]) => {
      const key = /^\d{1,2}$/.test(k) ? (LEGACY_QWERTZ[Number(k)] ? 'qwertz:' + LEGACY_QWERTZ[Number(k)] : null) : k;
      if (!key || !/^[a-z]{2,8}:[a-z0-9-]{1,20}$/.test(key) || !isObj(v)) return;
      const rec = { stars: int(v.stars, 0, 3), bestZpm: int(v.bestZpm, 0, 3000), bestAcc: num(v.bestAcc, 0, 1), plays: int(v.plays, 0, 1e6) };
      const prev = p.lessons[key];
      p.lessons[key] = prev ? { stars: Math.max(prev.stars, rec.stars), bestZpm: Math.max(prev.bestZpm, rec.bestZpm),
        bestAcc: Math.max(prev.bestAcc, rec.bestAcc), plays: prev.plays + rec.plays } : rec;
    });
    entries(raw.keyStats, 400).forEach(([ch, v]) => {
      if ([...ch].length !== 1 || !isObj(v)) return;
      p.keyStats[ch] = { h: int(v.h, 0, 1e8), e: int(v.e, 0, 1e8) };
    });
    const rt = isObj(raw.totals) ? raw.totals : {};
    Object.keys(p.totals).forEach((k) => { p.totals[k] = num(rt[k], 0, 1e9); });
    p.totals.bestZpm = int(p.totals.bestZpm, 0, 3000);
    p.totals.bestStreak = int(p.totals.bestStreak, 0, 100000);

    entries(raw.days, 5000).filter(([k, v]) => /^\d{4}-\d{2}-\d{2}$/.test(k) && isObj(v)).sort(([a], [b]) => (a < b ? -1 : 1)).slice(-800)
      .forEach(([k, v]) => { p.days[k] = { sec: num(v.sec, 0, 86400), keys: int(v.keys, 0, 1e7) }; });

    const g = isObj(raw.games) ? raw.games : {};
    p.games.blitz = int(g.blitz, 0, 1e6);
    p.games.blitzHits = int(g.blitzHits, 0, 1e5);
    p.games.rain = int(g.rain, 0, 1e8);
    p.games.rainWords = int(g.rainWords, 0, 1e6);
    BT.RACERS.forEach((r) => { const v = int(g.race && g.race[r.id], 0, 3000); if (v) p.games.race[r.id] = v; });

    const ach = isObj(raw.achievements) ? raw.achievements : {};
    (BT.ACHIEVEMENTS || []).forEach((a) => { const v = int(ach[a.id], 0, 4102444800000); if (v) p.achievements[a.id] = v; });

    if (Array.isArray(raw.history)) {
      p.history = raw.history.slice(-100).filter(isObj).map((h) => {
        const e = { t: int(h.t, 0, 4102444800000), kind: oneOf(h.kind, ['lesson', 'training', 'race'], 'lesson'), zpm: int(h.zpm, 0, 3000), acc: num(h.acc, 0, 1) };
        if (h.l != null) e.l = int(h.l, 1, 99);
        if (h.r != null) e.r = int(h.r, 1, 9);
        if (typeof h.k === 'string') e.k = oneOf(h.k, ['weak', 'words', 'home', 'sentences'], 'words');
        if (typeof h.id === 'string') e.id = oneOf(h.id, BT.RACERS.map((r) => r.id), 'snail');
        if (typeof h.label === 'string') e.label = str(h.label, 80);
        return e;
      });
    }
    p.flags.guideDone = bool(isObj(raw.flags) ? raw.flags.guideDone : false, false);

    const s = isObj(raw.settings) ? raw.settings : {};
    const d = DEFAULT_SETTINGS;
    p.settings = {
      sound: bool(s.sound, d.sound), keySound: bool(s.keySound, d.keySound),
      showKeyboard: bool(s.showKeyboard, d.showKeyboard), showHands: bool(s.showHands, d.showHands), showHint: bool(s.showHint, d.showHint),
      textSize: oneOf(s.textSize, ['s', 'm', 'l'], d.textSize), dailyGoal: oneOf(Number(s.dailyGoal), [5, 10, 15, 20, 30], d.dailyGoal),
      theme: oneOf(s.theme, ['light', 'dark'], d.theme), unlockAll: bool(s.unlockAll, d.unlockAll),
      lang: knownLang(s.lang) || d.lang,
    };
    return p;
  }

  function sanitizeData(d) {
    const out = { version: 2, activeId: null, lang: null, profiles: {} };
    if (!isObj(d)) return out;
    entries(d.profiles, MAX_PROFILES).forEach(([, raw]) => {
      const p = sanitizeProfile(raw);
      if (p && !out.profiles[p.id]) out.profiles[p.id] = p;
    });
    out.activeId = typeof d.activeId === 'string' && out.profiles[d.activeId] ? d.activeId : null;
    out.lang = knownLang(d.lang);
    return out;
  }

  BT.Store = {
    data: { version: 2, activeId: null, lang: null, profiles: {} },
    persistOk: true,
    MAX_IMPORT_BYTES,
    sanitizeData,

    load() {
      let raw = null;
      try { raw = localStorage.getItem(KEY); } catch (e) { this.persistOk = false; }
      let parsed = null;
      if (raw) {
        try { parsed = JSON.parse(raw); } catch (e) { console.warn('BlindTrainer: Speicherstand unlesbar', e); }
      }
      this.data = sanitizeData(parsed);
    },

    save() {
      try { localStorage.setItem(KEY, JSON.stringify(this.data)); this.persistOk = true; }
      catch (e) { this.persistOk = false; console.warn('BlindTrainer: Speichern fehlgeschlagen', e); }
    },

    get profile() { return this.data.profiles[this.data.activeId] || null; },

    /* Sprache: Profil-Einstellung, sonst zuletzt gewählte, sonst Browsersprache */
    currentLang() {
      const p = this.profile;
      return (p && p.settings.lang) || this.data.lang || BT.guessLang();
    },
    setLang(code) {
      this.data.lang = knownLang(code) || BT.DEFAULT_LANG;
      if (this.profile) this.profile.settings.lang = this.data.lang;
      this.save();
    },

    create(name, avatar) {
      const p = blankProfile(str(name, 16).trim() || '?', avatar, this.data.lang || BT.lang);
      this.data.profiles[p.id] = p;
      this.data.activeId = p.id;
      this.save();
      return p;
    },

    activate(id) {
      if (!this.data.profiles[id]) return;
      this.data.activeId = id;
      this.data.profiles[id].lastUsed = Date.now();
      this.data.lang = this.data.profiles[id].settings.lang;
      this.save();
    },

    remove(id) {
      delete this.data.profiles[id];
      if (this.data.activeId === id) this.data.activeId = null;
      this.save();
    },

    resetProgress(id) {
      const old = this.data.profiles[id];
      if (!old) return;
      const p = blankProfile(old.name, old.avatar, old.settings.lang);
      p.id = old.id;
      p.created = old.created;
      p.settings = Object.assign({}, old.settings, { unlockAll: false });
      this.data.profiles[id] = p;
      this.save();
    },

    /* Import: nur nach Schema-Prüfung; wirft einen Fehler, wenn nichts Brauchbares drin ist */
    importData(d) {
      const clean = sanitizeData(d);
      if (!Object.keys(clean.profiles).length) throw new Error('invalid');
      clean.lang = clean.lang || this.data.lang;
      this.data = clean;
      this.save();
    },
  };
})(window.BT);
