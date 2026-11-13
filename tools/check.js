#!/usr/bin/env node
/* TastaturTrainer – statische Prüfungen ohne Browser (läuft lokal und in der CI)
 *
 *   node tools/check.js
 *
 * 1. Syntax aller JS-Dateien
 * 2. Übersetzungen: gleiche Schlüssel, Platzhalter und Strukturen in allen Sprachen
 * 3. Alle im Code verwendeten t('…')-Schlüssel existieren
 * 4. Kurse: jedes Wort/jeder Satz ist auf dem Layout tippbar, jede Runde nutzt nur gelernte Tasten
 * 5. Sicherheit: Speicherstände/Importe werden bereinigt (XSS-Versuche, Riesenzahlen, unbekannte Felder)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const JS = path.join(ROOT, 'js');
let failures = 0;
let checks = 0;
const fail = (msg) => { failures++; console.error('  ✗ ' + msg); };
const ok = (cond, msg) => { checks++; if (!cond) fail(msg); return cond; };
const section = (name) => console.log('\n▶ ' + name);

/* Ladereihenfolge aus index.html lesen (so testen wir genau das, was der Browser lädt) */
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script\s+src="([^"]+)"/g)].map((m) => m[1]);

section('Syntax');
const allJs = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.js')) allJs.push(p);
  }
})(JS);
for (const f of allJs) {
  try { new vm.Script(fs.readFileSync(f, 'utf8'), { filename: f }); checks++; }
  catch (e) { fail(`${path.relative(ROOT, f)}: ${e.message}`); }
}
ok(!/<script>(?!\s*<\/script>)/.test(html) && !/\son[a-z]+\s*=/.test(html), 'index.html enthält keine Inline-Skripte/Handler (CSP)');
ok(/Content-Security-Policy/.test(html), 'index.html setzt eine Content-Security-Policy');
console.log(`  ${allJs.length} Dateien geprüft`);

section('Web-App: Manifest und Service Worker');
const swSrc = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
try { new vm.Script(swSrc, { filename: 'sw.js' }); checks++; } catch (e) { fail('sw.js: ' + e.message); }
const swList = vm.runInNewContext((swSrc.match(/const FILES = (\[[\s\S]*?\]);/) || [])[1] || '[]');
const needed = ['index.html', 'manifest.webmanifest', 'icon.ico', 'icons/icon-192.png', 'icons/icon-512.png', 'css/style.css', ...scripts];
needed.forEach((f) => ok(swList.includes(f), 'sw.js speichert ' + f + ' nicht für offline'));
swList.filter((f) => f !== './').forEach((f) => ok(fs.existsSync(path.join(ROOT, f)), 'sw.js nennt fehlende Datei ' + f));
let manifest = null;
try { manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8')); } catch (e) { fail('manifest.webmanifest: ' + e.message); }
if (manifest) {
  ok(manifest.name && manifest.start_url && manifest.display === 'standalone', 'Manifest: Name/Start/Display');
  (manifest.icons || []).forEach((i) => ok(fs.existsSync(path.join(ROOT, i.src)), 'Manifest-Icon fehlt: ' + i.src));
  ok((manifest.icons || []).some((i) => i.sizes === '512x512') && (manifest.icons || []).some((i) => i.sizes === '192x192'), 'Manifest braucht Icons 192 und 512');
}
ok(/worker-src 'self'/.test(html) && /manifest-src 'self'/.test(html), 'CSP erlaubt nur eigene Worker/Manifeste');

/* ---------- App im VM-Kontext laden (ohne main.js) ---------- */
const store = {};
const ctx = {
  console: { log() {}, warn: (...a) => warnings.push(a.join(' ')), error: (...a) => warnings.push(a.join(' ')) },
  performance: { now: () => Date.now() },
  localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } },
  navigator: { language: 'de-DE' },
  setTimeout: () => 0, clearTimeout() {},
};
const warnings = [];
ctx.window = ctx;
vm.createContext(ctx);
for (const s of scripts) {
  if (s.endsWith('main.js')) continue;
  vm.runInContext(fs.readFileSync(path.join(ROOT, s), 'utf8'), ctx, { filename: s });
}
const BT = ctx.BT;
const langs = Object.keys(BT.I18N);

section('Übersetzungen (' + langs.join(', ') + ')');
const placeholders = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
function compare(a, b, where) {
  const ta = Array.isArray(a) ? 'array' : typeof a;
  const tb = Array.isArray(b) ? 'array' : typeof b;
  if (!ok(ta === tb, `${where}: Typ ${ta} ≠ ${tb}`)) return;
  if (ta === 'object' && a) {
    const ka = Object.keys(a).sort(), kb = Object.keys(b).sort();
    ka.filter((k) => !kb.includes(k)).forEach((k) => fail(`${where}.${k} fehlt in der zweiten Sprache`));
    kb.filter((k) => !ka.includes(k)).forEach((k) => fail(`${where}.${k} fehlt in der ersten Sprache`));
    ka.filter((k) => kb.includes(k)).forEach((k) => compare(a[k], b[k], `${where}.${k}`));
  } else if (ta === 'array' && where.includes('ui.')) {
    if (ok(a.length === b.length, `${where}: Länge ${a.length} ≠ ${b.length}`)) a.forEach((x, i) => compare(x, b[i], `${where}[${i}]`));
  } else if (ta === 'string') {
    ok(placeholders(a) === placeholders(b), `${where}: Platzhalter {${placeholders(a)}} ≠ {${placeholders(b)}}`);
    ok(a.trim().length > 0 && b.trim().length > 0, `${where}: leerer Text`);
  }
}
const [base, ...others] = langs;
for (const other of others) {
  const A = BT.I18N[base], B = BT.I18N[other];
  compare(A.ui, B.ui, 'ui');
  /* Fingernamen: 'dat' (Dativ) ist optional und fällt auf 'name' zurück */
  Object.keys(A.fingers).forEach((f) => ok(B.fingers[f] && typeof B.fingers[f].name === 'string', `fingers.${f}.name fehlt in ${other}`));
  compare(A.fingerTypes, B.fingerTypes, 'fingerTypes');
  compare(A.racers, B.racers, 'racers');
  compare(A.achievements, B.achievements, 'achievements');
  ok(A.guide.length === B.guide.length, `guide: ${A.guide.length} ≠ ${B.guide.length} Seiten`);
  A.guide.forEach((g, i) => ok(placeholders(g.body) === placeholders(B.guide[i].body), `guide[${i}]: Platzhalter unterschiedlich`));
  ok(A.course.lessons.length === B.course.lessons.length, 'Kurse haben unterschiedlich viele Lektionen');
  ok(A.course.worlds.length === B.course.worlds.length, 'Kurse haben unterschiedlich viele Welten');
}
for (const l of langs) {
  const P = BT.I18N[l];
  ok(BT.LAYOUTS[P.meta.layout], `${l}: unbekanntes Layout ${P.meta.layout}`);
  BT.ACHIEVEMENTS.forEach((a) => ok(P.achievements[a.id], `${l}: Abzeichen-Text für ${a.id} fehlt`));
  BT.RACERS.forEach((r) => ok(P.racers[r.id], `${l}: Name für ${r.id} fehlt`));
  BT.GAMES.forEach((g) => ok(Array.isArray(P.ui.games[g.id]), `${l}: Spieltext für ${g.id} fehlt`));
  Object.keys(BT.FINGERS).forEach((f) => ok(P.fingers[f], `${l}: Fingername ${f} fehlt`));
  ok(P.levelTitles.length >= 10 && P.tips.length >= 5 && P.praise.length >= 3, `${l}: Titel/Tipps/Lob unvollständig`);
  ok(P.guide.length === 8, `${l}: Anleitung muss 8 Seiten haben (passend zu screens.js)`);
}

section('Verwendete Text-Schlüssel');
const used = new Set();
for (const f of allJs.filter((f) => !f.includes(path.sep + 'locales' + path.sep))) {
  const src = fs.readFileSync(f, 'utf8');
  /* nur vollständige Schlüssel mit Namensraum; 't('round.' + k)' u. Ä. werden unten als „dynamisch“ geprüft */
  for (const m of src.matchAll(/\bt\(\s*'([a-zA-Z0-9_]+\.[a-zA-Z0-9_.]*[a-zA-Z0-9_])'\s*[,)]/g)) used.add(m[1]);
}
const get = (o, key) => key.split('.').reduce((x, k) => (x != null ? x[k] : undefined), o);
for (const key of used) for (const l of langs) ok(get(BT.I18N[l].ui, key) !== undefined, `${l}: Schlüssel '${key}' fehlt`);
/* dynamisch zusammengesetzte Schlüssel */
const dyn = ['training.weak', 'training.words', 'training.home', 'training.sentences',
  ...['newKeys', 'mix', 'words', 'syllables', 'capitals', 'nouns', 'sentences', 'punct', 'exclaim', 'digitDrill', 'numbers', 'numberSentences'].map((k) => 'round.' + k),
  ...['map', 'games', 'training', 'guide', 'trophies', 'stats', 'settings'].map((k) => 'tile.' + k)];
for (const key of dyn) for (const l of langs) ok(get(BT.I18N[l].ui, key) !== undefined, `${l}: Schlüssel '${key}' fehlt`);
console.log(`  ${used.size + dyn.length} Schlüssel geprüft`);

section('Kurse und Übungstexte');
const LETTER = /^[a-zäöüß]$/;
for (const l of langs) {
  BT.setLang(l);
  const label = `${l}/${BT.COURSE_ID}`;
  const lessons = BT.LESSONS;
  const ids = new Set();
  lessons.forEach((L, i) => {
    ok(/^[a-z0-9-]{1,20}$/.test(L.id) && !ids.has(L.id), `${label}: Lektion ${i + 1} hat ungültige/doppelte ID '${L.id}'`);
    ids.add(L.id);
    ok(BT.WORLDS[L.world], `${label}: Lektion ${i + 1} gehört zu keiner Welt`);
    L.keys.forEach((k) => ok(BT.CHAR_MAP[k], `${label}: Taste '${k}' aus Lektion ${i + 1} gibt es auf dem Layout nicht`));
  });
  const all = BT.Gen.allowed(lessons.length - 1);
  for (const ch of 'abcdefghijklmnopqrstuvwxyz') ok(all.set.has(ch), `${label}: Buchstabe '${ch}' wird nie gelernt`);
  [...BT.WORDS, ...BT.SENTENCES, ...BT.NUMBER_SENTENCES].forEach((s) => {
    for (const c of s) if (!BT.CHAR_MAP[c]) { fail(`${label}: '${s}' enthält '${c}', das es auf dem Layout nicht gibt`); break; }
  });
  BT.SENTENCES.forEach((s) => ok(BT.Gen.canType(s, all), `${label}: Satz nach allen Lektionen nicht tippbar: ${s}`));
  let rounds = 0;
  for (let i = 0; i < lessons.length; i++) {
    const al = BT.Gen.allowed(i);
    for (let rep = 0; rep < 25; rep++) {
      BT.Gen.lessonTexts(i).forEach((tx, r) => {
        rounds++;
        if (!BT.Gen.canType(tx.text, al)) fail(`${label} L${i + 1} R${r + 1}: ungelernte Taste in "${tx.text}"`);
        if (tx.text.length < 20) fail(`${label} L${i + 1} R${r + 1}: Text zu kurz "${tx.text}"`);
        if (/^ | $| {2}/.test(tx.text)) fail(`${label} L${i + 1} R${r + 1}: Leerzeichenfehler "${tx.text}"`);
        if (!tx.label || tx.label.includes('.')) fail(`${label} L${i + 1} R${r + 1}: Rundenname fehlt`);
      });
    }
  }
  const words4 = BT.Gen.wordsFor(BT.Gen.allowed(4)).length;
  ok(words4 >= 10, `${label}: nach der Grundreihe gibt es nur ${words4} echte Wörter`);
  ok(BT.Gen.rainPool(BT.Gen.allowed(4)).every((w) => /^[a-zäöüß]+$/.test(w)), `${label}: Wort-Regen enthält Sonderzeichen`);
  ok(BT.Gen.blitzPool(BT.Gen.allowed(0)).every((c) => LETTER.test(c) || /\d/.test(c)), `${label}: Tasten-Blitz-Pool ungültig`);
  console.log(`  ${label}: ${lessons.length} Lektionen, ${BT.WORDS.length} Wörter, ${BT.SENTENCES.length} Sätze, ${rounds} Runden erzeugt`);
}

section('Sicherheit: Bereinigung von Speicherstand und Import');
BT.setLang('de');
const evil = {
  activeId: 'pevil1234',
  lang: '<script>',
  profiles: {
    x: {
      id: 'pevil1234', name: '<img src=x onerror=alert(1)>Mia\u0000', avatar: '<img src=x onerror=alert(1)>',
      xp: 1e308, created: 'gestern',
      lessons: { 0: { stars: 99, bestZpm: '<b>' }, '__proto__': { stars: 3 }, 'qwertz:fj': { stars: 2 }, 'bad key!': { stars: 3 } },
      keyStats: { a: { h: 5, e: 1 }, abc: { h: 1, e: 1 } },
      totals: { keys: '<script>', bestZpm: 1e9, polluted: 1 },
      days: { '2026-01-01': { sec: 99999999, keys: -5 }, 'x': { sec: 1 } },
      games: { blitz: '9<img>', race: { cheetah: '<svg onload=alert(1)>', hacker: 5 } },
      achievements: { first: 123, fake: 1 },
      history: [{ t: 1, kind: '<x>', zpm: '1e9', acc: 7, label: '<img src=x onerror=alert(1)>' }],
      settings: { theme: 'red;}</style>', textSize: 'xxl', dailyGoal: '<', lang: 'xx', sound: 'yes' },
      flags: { guideDone: 'true' },
      extra: { evil: true },
    },
  },
};
const clean = BT.Store.sanitizeData(JSON.parse(JSON.stringify(evil)));
const cp = clean.profiles.pevil1234;
ok(cp, 'Profil mit gültiger ID bleibt erhalten');
if (cp) {
  ok(cp.avatar === '🐱', 'Avatar mit HTML wird ersetzt');
  ok(!/[\u0000-\u001f]/.test(cp.name) && cp.name.length <= 16, 'Name wird gekürzt und von Steuerzeichen befreit');
  ok(cp.xp === 10000000, 'XP werden begrenzt (keine Endlosschleife bei der Level-Berechnung)');
  ok(Object.keys(cp.lessons).every((k) => /^[a-z]{2,8}:[a-z0-9-]{1,20}$/.test(k)), 'Nur gültige Lektions-Schlüssel');
  ok(cp.lessons['qwertz:fj'] && cp.lessons['qwertz:fj'].stars === 3, 'Alter Index-Schlüssel 0 wird zu qwertz:fj migriert, Sterne begrenzt');
  ok(!('abc' in cp.keyStats), 'keyStats nur für einzelne Zeichen');
  ok(typeof cp.totals.keys === 'number' && !('polluted' in cp.totals), 'totals nur bekannte Zahlenfelder');
  ok(cp.days['2026-01-01'].sec === 86400 && cp.days['2026-01-01'].keys === 0 && !cp.days.x, 'Tageswerte begrenzt');
  ok(cp.games.blitz === 0 && !('hacker' in cp.games.race) && !cp.games.race.cheetah, 'Spielwerte nur als Zahlen');
  ok(cp.achievements.first === 123 && !('fake' in cp.achievements), 'Nur bekannte Abzeichen');
  ok(cp.history[0].kind === 'lesson' && cp.history[0].zpm <= 3000 && cp.history[0].acc === 1, 'Verlauf wird bereinigt');
  ok(['light', 'dark'].includes(cp.settings.theme) && ['s', 'm', 'l'].includes(cp.settings.textSize) && cp.settings.dailyGoal === 10, 'Einstellungen nur erlaubte Werte');
  ok(cp.settings.lang === 'de' && cp.settings.sound === true && cp.flags.guideDone === false, 'Sprache/Schalter nur gültige Werte');
  ok(!('extra' in cp), 'Unbekannte Felder werden verworfen');
}
ok(clean.lang === null, 'Ungültige globale Sprache wird verworfen');
const realmProto = vm.runInContext('Object.prototype', ctx);
ok(cp && Object.getPrototypeOf(cp.lessons) === realmProto && !Object.prototype.hasOwnProperty.call(cp.lessons, '__proto__')
  && vm.runInContext('({}).stars === undefined && ({}).polluted === undefined', ctx), 'Kein Prototype-Pollution');
const many = { profiles: {} };
for (let i = 0; i < 500; i++) many.profiles['k' + i] = { name: 'n' + i };
ok(Object.keys(BT.Store.sanitizeData(many).profiles).length <= 50, 'Anzahl der Profile wird begrenzt');
ok(Object.keys(BT.Store.sanitizeData(null).profiles).length === 0 && Object.keys(BT.Store.sanitizeData('x').profiles).length === 0, 'Ungültige Daten ergeben leeren Stand');
ok(BT.Progress.levelFromXp(1e308) <= 1000, 'Level-Berechnung terminiert bei Riesenwerten');
ok(BT.esc('<a href="x">\'&') === '&lt;a href=&quot;x&quot;&gt;&#39;&amp;', 'HTML-Escaping');

section('Umbenennung: alter Speicherstand (BlindTrainer) wird übernommen');
store['blindtrainer.v1'] = JSON.stringify({ activeId: 'pold12345', profiles: { a: { id: 'pold12345', name: 'Alt', avatar: '🐶', xp: 120, lessons: { 0: { stars: 2 } } } } });
BT.Store.load();
ok(BT.Store.profile && BT.Store.profile.name === 'Alt' && BT.Store.profile.lessons['qwertz:fj'].stars === 2, 'Profil aus altem Schlüssel geladen');
BT.Store.save();
ok('tastaturtrainer.v1' in store, 'Speichern unter neuem Schlüssel');
store['tastaturtrainer.v1'] = JSON.stringify({ profiles: {} });
BT.Store.load();
ok(!BT.Store.profile, 'Neuer Schlüssel hat Vorrang vor dem alten');

const i18nWarnings = warnings.filter((w) => w.includes('i18n'));
ok(!i18nWarnings.length, 'Keine fehlenden Übersetzungen zur Laufzeit: ' + i18nWarnings.slice(0, 5).join(' | '));

console.log(`\n${failures ? '✗' : '✓'} ${checks} Prüfungen, ${failures} Fehler`);
process.exit(failures ? 1 : 0);
