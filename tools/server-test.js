#!/usr/bin/env node
/* TastaturTrainer – Test des Heimservers (server/) ohne Browser und ohne npm-Abhängigkeiten
 *
 *   node tools/server-test.js
 *
 * 1. Auslieferung: index.html mit tt-server.js vor store.js und connect-src 'self', nur Dateien der Web-App
 * 2. API: Profile anlegen/ändern/löschen, Prüfungen (Content-Type, ID, Größe, Anzahl)
 * 3. Daten: bleiben über einen Neustart erhalten, eine kaputte Datei wird beiseitegelegt
 * 4. tt-server.js: leitet den Speicher-Schlüssel der App auf die API um (im VM-Kontext)
 */
'use strict';
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
let failures = 0;
let checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) { failures++; console.error('  ✗ ' + msg); } return cond; };
const section = (name) => console.log('\n▶ ' + name);

function start(dataDir, env = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, [path.join(ROOT, 'server', 'server.js')], {
      env: { ...process.env, PORT: '0', HOST: '127.0.0.1', TT_DATA_DIR: dataDir, ...env }, stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '';
    const onData = (d) => {
      out += d;
      const m = /http:\/\/127\.0\.0\.1:(\d+)/.exec(out);
      if (m) resolve({ proc, base: `http://127.0.0.1:${m[1]}`, log: () => out });
    };
    proc.stdout.on('data', onData);
    proc.stderr.on('data', onData);
    proc.on('exit', (code) => reject(new Error('Server beendet (' + code + '):\n' + out)));
    setTimeout(() => reject(new Error('Server startet nicht:\n' + out)), 10000);
  });
}
const stop = (s) => new Promise((r) => { s.proc.removeAllListeners('exit'); s.proc.on('exit', r); s.proc.kill('SIGTERM'); });
const json = { 'Content-Type': 'application/json' };

(async () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tt-server-'));
  let s = await start(dataDir);
  const get = (p) => fetch(s.base + p);

  section('Auslieferung');
  const html = await (await get('/')).text();
  ok(html.includes("connect-src 'self'") && !html.includes("connect-src 'none'"), 'index.html: connect-src auf self umgestellt');
  ok(html.indexOf('src="tt-server.js"') > 0 && html.indexOf('src="tt-server.js"') < html.indexOf('src="js/store.js"'), 'index.html: tt-server.js vor store.js');
  ok((await get('/index.html')).headers.get('cache-control') === 'no-store', 'index.html wird nicht zwischengespeichert');
  const shim = await get('/tt-server.js');
  ok(shim.status === 200 && (await shim.text()).includes('Storage.prototype'), 'tt-server.js wird ausgeliefert');
  ok((await (await get('/sw.js')).text()).includes('unregister'), 'sw.js ist der Server-Service-Worker (ohne Offline-Cache)');
  for (const p of ['/css/style.css', '/js/store.js', '/js/locales/de.js', '/icons/icon-192.png', '/manifest.webmanifest', '/icon.ico']) {
    ok((await get(p)).status === 200, 'erreichbar: ' + p);
  }
  for (const p of ['/server/server.js', '/tools/check.js', '/package.json', '/.git/config', '/data/profiles.json', '/js/', '/js/../package.json',
    '/%2e%2e/package.json', '/js/%2e%2e/package.json', '/README.md', '/Dockerfile']) {
    ok((await get(p)).status === 404, 'nicht erreichbar: ' + p);
  }
  ok((await get('/%E0%A4%A')).status === 400, 'kaputte URL → 400');
  ok((await get('/css/style.css')).headers.get('x-content-type-options') === 'nosniff', 'nosniff gesetzt');

  section('API');
  const put = (id, body, headers = json) => fetch(`${s.base}/api/profiles/${id}`, { method: 'PUT', headers, body: typeof body === 'string' ? body : JSON.stringify(body) });
  ok((await (await get('/api/health')).json()).ok === true, 'health');
  ok((await put('pmia01', { id: 'pmia01', name: 'Mia', xp: 5 })).status === 200, 'Profil anlegen');
  ok((await put('pmia01', { id: 'pmia01', name: 'Mia', xp: 9 })).status === 200, 'Profil ändern');
  ok((await put('pmia01', { id: 'pmia01' }, { 'Content-Type': 'text/plain' })).status === 415, 'ohne JSON-Content-Type → 415');
  ok((await put('pmia01', { id: 'panders' })).status === 400, 'ID im Profil ≠ ID in der Adresse → 400');
  ok((await put('pmia01', '[1,2]')).status === 400, 'Array statt Profil → 400');
  ok((await put('pmia01', '{kaputt')).status === 400, 'kaputtes JSON → 400');
  ok((await put('X..', { id: 'X..' })).status === 404, 'ungültige ID → 404');
  ok((await put('pbig01', { id: 'pbig01', pad: 'x'.repeat(1100000) })).status === 413, 'zu groß → 413');
  let profiles = (await (await get('/api/profiles')).json()).profiles;
  ok(Object.keys(profiles).join() === 'pmia01' && profiles.pmia01.xp === 9, 'GET liefert den neuesten Stand');
  for (let i = 0; i < 49; i++) await put('pfill' + i, { id: 'pfill' + i });
  ok((await put('pzuviel', { id: 'pzuviel' })).status === 409, 'mehr als 50 Profile → 409');
  ok((await put('pmia01', { id: 'pmia01', name: 'Mia', xp: 10 })).status === 200, 'bei 50 Profilen bestehendes ändern geht');
  ok((await fetch(`${s.base}/api/profiles/pfill0`, { method: 'DELETE', headers: json })).status === 200, 'Profil löschen');
  ok(!('pfill0' in (await (await get('/api/profiles')).json()).profiles), 'gelöschtes Profil ist weg');
  ok((await fetch(`${s.base}/api/profiles`, { method: 'POST', headers: json })).status === 405, 'POST → 405');

  section('Daten');
  ok(fs.existsSync(path.join(dataDir, 'profiles.json')) && fs.existsSync(path.join(dataDir, 'profiles.json.bak')), 'profiles.json und .bak liegen im Datenordner');
  await stop(s);
  s = await start(dataDir);
  profiles = (await (await get('/api/profiles')).json()).profiles;
  ok(profiles.pmia01 && profiles.pmia01.xp === 10 && Object.keys(profiles).length === 49, 'Daten überstehen einen Neustart');
  ok((await fetch(`${s.base}/api/profiles`, { method: 'DELETE', headers: json })).status === 200, 'alle löschen');
  ok(Object.keys((await (await get('/api/profiles')).json()).profiles).length === 0, 'danach keine Profile');
  await stop(s);
  fs.writeFileSync(path.join(dataDir, 'profiles.json'), '{kaputt');
  s = await start(dataDir);
  ok((await get('/api/health')).status === 200, 'startet trotz kaputter profiles.json');
  ok(fs.readdirSync(dataDir).some((f) => f.startsWith('profiles.json.defekt-')), 'kaputte Datei wird als .defekt-… aufbewahrt');
  await stop(s);
  fs.rmSync(dataDir, { recursive: true, force: true });

  section('tt-server.js (Umleitung im Browser)');
  await shimTests();

  console.log(`\n${failures ? '✗' : '✓'} ${checks - failures}/${checks} Prüfungen bestanden`);
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });

function shimTests() {
  const src = fs.readFileSync(path.join(ROOT, 'server', 'tt-server.js'), 'utf8');
  function env(serverProfiles) {
    class Storage {
      constructor() { this.m = {}; }
      getItem(k) { return k in this.m ? this.m[k] : null; }
      setItem(k, v) { this.m[k] = String(v); }
      removeItem(k) { delete this.m[k]; }
    }
    const calls = [];
    const ctx = {
      Storage, console: { warn() {}, log() {} }, JSON, Object, Map, Error, Promise, String,
      setTimeout: () => 0, clearTimeout() {},
      document: { addEventListener() {}, body: null },
      XMLHttpRequest: class {
        open(m, u) { this.u = u; }
        setRequestHeader() {}
        send() {
          if (serverProfiles === null) throw new Error('offline');
          this.status = 200; this.responseText = JSON.stringify({ profiles: serverProfiles });
        }
      },
      fetch: (url, o) => { calls.push(o.method + ' ' + url + (o.body ? ' ' + JSON.parse(o.body).xp : '')); return Promise.resolve({ ok: true }); },
    };
    ctx.window = ctx;
    ctx.window.addEventListener = () => {};
    ctx.localStorage = new Storage();
    ctx.sessionStorage = new Storage();
    vm.createContext(ctx);
    vm.runInContext(src, ctx);
    return { ctx, calls, ls: ctx.localStorage };
  }
  const tick = () => new Promise((r) => setImmediate(r));
  const KEY = 'tastaturtrainer.v1';

  return (async () => {
    const { ls, calls, ctx } = env({ pa1234: { id: 'pa1234', xp: 1 }, pb1234: { id: 'pb1234', xp: 2 } });
    const d = JSON.parse(ls.getItem(KEY));
    ok(Object.keys(d.profiles).join() === 'pa1234,pb1234' && d.activeId === null, 'getItem liefert die Profile vom Server');
    ok(ls.getItem('blindtrainer.v1') === null, 'alter Schlüssel liefert nichts');
    ls.setItem('anderes', 'x');
    ok(ls.getItem('anderes') === 'x' && calls.length === 0, 'andere Schlüssel bleiben im echten localStorage');
    ctx.sessionStorage.setItem(KEY, 'y');
    ok(ctx.sessionStorage.getItem(KEY) === 'y', 'sessionStorage wird nicht umgeleitet');

    d.profiles.pa1234.xp = 5; delete d.profiles.pb1234; d.profiles.pc1234 = { id: 'pc1234', xp: 3 }; d.activeId = 'pa1234';
    ls.setItem(KEY, JSON.stringify(d));
    for (let i = 0; i < 10; i++) await tick();
    ok(calls.includes('PUT api/profiles/pa1234 5') && calls.includes('DELETE api/profiles/pb1234') && calls.includes('PUT api/profiles/pc1234 3') && calls.length === 3,
      'setItem schickt nur geänderte, neue und gelöschte Profile: ' + calls.join(' | '));
    calls.length = 0;
    ls.setItem(KEY, JSON.stringify(d));
    for (let i = 0; i < 10; i++) await tick();
    ok(calls.length === 0, 'unveränderter Stand schickt nichts');
    ok(JSON.parse(ls.getItem(KEY)).activeId === 'pa1234', 'aktives Profil wird pro Gerät gemerkt');
    ls.removeItem(KEY);
    for (let i = 0; i < 10; i++) await tick();
    ok(calls.join() === 'DELETE api/profiles', 'removeItem löscht alle Profile auf dem Server');

    const off = env(null);
    let threw = 0;
    try { off.ls.getItem(KEY); } catch (e) { threw++; }
    try { off.ls.setItem(KEY, '{"profiles":{}}'); } catch (e) { threw++; }
    try { off.ls.removeItem(KEY); } catch (e) { threw++; }
    ok(threw === 3 && off.calls.length === 0, 'Server beim Laden nicht erreichbar → kein Lesen, kein Schreiben (nichts wird überschrieben)');
  })();
}
