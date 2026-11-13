'use strict';
/* BlindTrainer – Internationalisierung (Deutsch / English)
 * Jede Sprachdatei (js/locales/*.js) bringt mit:
 *   meta    – Name, Flagge, Locale, Tastatur-Layout
 *   ui      – alle Oberflächen-Texte (Strings mit {platzhaltern} oder Funktionen)
 *   course  – Welten, Lektionen, Wörter und Sätze für das passende Layout
 *   sowie Finger-Namen, Tipps, Lob, Level-Titel, Tiernamen, Abzeichen und Anleitung.
 */
(function (BT) {
  BT.I18N = BT.I18N || {};
  BT.DEFAULT_LANG = 'de';
  const warned = new Set();

  const lookup = (pack, key) => key.split('.').reduce((o, k) => (o != null && o[k] !== undefined ? o[k] : undefined), pack && pack.ui);

  BT.t = (key, params) => {
    let v = lookup(BT.locale, key);
    if (v === undefined) {
      if (!warned.has(BT.lang + ':' + key)) { warned.add(BT.lang + ':' + key); console.warn('i18n: fehlender Text', BT.lang, key); }
      v = lookup(BT.I18N[BT.DEFAULT_LANG], key);
    }
    if (v === undefined) return key;
    if (typeof v === 'function') return v(params || {});
    if (typeof v !== 'string' || !params) return v;
    return BT.tpl(v, params);
  };

  /* {platzhalter} ersetzen – Werte werden NICHT escaped (Aufrufer escapen Nutzerdaten selbst) */
  BT.tpl = (s, params) => String(s).replace(/\{(\w+)\}/g, (_, k) => (params && params[k] !== undefined ? params[k] : ''));

  BT.langs = () => Object.keys(BT.I18N);

  BT.guessLang = () => {
    const nav = (typeof navigator !== 'undefined' && (navigator.language || '')) || '';
    const code = nav.slice(0, 2).toLowerCase();
    return BT.I18N[code] ? code : BT.DEFAULT_LANG;
  };

  BT.setLang = (code) => {
    if (!BT.I18N[code]) code = BT.DEFAULT_LANG;
    const pack = BT.I18N[code];
    BT.lang = code;
    BT.locale = pack;
    BT.useLayout(pack.meta.layout);
    BT.COURSE_ID = pack.meta.layout;
    const c = pack.course;
    BT.WORLDS = c.worlds;
    BT.LESSONS = c.lessons;
    BT.WORDS = c.words;
    BT.SENTENCES = c.sentences;
    BT.NUMBER_SENTENCES = c.numberSentences;
    BT.INTERJECTIONS = c.interjections;
    BT.TIPS = pack.tips;
    BT.PRAISE = pack.praise;
    BT.LEVEL_TITLES = pack.levelTitles;
    BT.KEY_NAMES = pack.keyNames;
    BT.FINGER_TYPES = pack.fingerTypes;
    Object.entries(pack.fingers).forEach(([id, f]) => {
      BT.FINGERS[id].name = f.name;
      BT.FINGERS[id].dat = f.dat || f.name;
    });
    if (typeof document !== 'undefined') {
      document.documentElement.lang = code;
      document.title = BT.t('app.title');
    }
  };

  BT.fmt = {
    int: (n) => Math.round(Number(n) || 0).toLocaleString(BT.locale.meta.locale),
    date: (ts, opts) => new Date(ts).toLocaleDateString(BT.locale.meta.locale, opts),
  };
})(window.BT);
