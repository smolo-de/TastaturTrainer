#!/usr/bin/env node
/* TastaturTrainer – Browser-Smoke-Test über das Chrome DevTools Protocol (ohne npm-Abhängigkeiten)
 *
 *   node tools/e2e.js                 Chrome/Edge automatisch suchen
 *   BROWSER_BIN=/pfad/zu/chrome node tools/e2e.js
 *   E2E_SHOTS=e2e-shots node tools/e2e.js   zusätzlich Screenshots speichern
 *
 * Spielt für jede Sprache durch: Profil anlegen, Anleitung, Lektion 1 (3 Runden mit Tippfehlern),
 * Spiele, Rennen, Statistik, Erfolge, Einstellungen. Bricht ab bei JS-Fehlern, Konsolen-Fehlern/
 * -Warnungen (auch fehlende Übersetzungen) und CSP-Verstößen. Prüft außerdem, dass ein
 * manipulierter Speicherstand kein HTML/JS einschleusen kann.
 * Benötigt Node 22+ (eingebautes fetch und WebSocket).
 */
'use strict';
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..');
const APP_URL = pathToFileURL(path.join(ROOT, 'index.html')).href;
const SHOTS = process.env.E2E_SHOTS ? path.resolve(process.env.E2E_SHOTS) : null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Mini-Webserver nur für die Dateien der Web-App (wie GitHub Pages), nur auf 127.0.0.1 */
const WEB_FILES = /^\/(index\.html|manifest\.webmanifest|sw\.js|icon\.ico|icons\/[\w-]+\.png|css\/[\w-]+\.css|js\/(locales\/)?[\w-]+\.js)$/;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.ico': 'image/x-icon' };
function startServer() {
  const http = require('http');
  const srv = http.createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const rel = p === '/' ? '/index.html' : p;
    if (!WEB_FILES.test(rel)) { res.writeHead(404); res.end(); return; }
    fs.readFile(path.join(ROOT, rel), (err, data) => {
      if (err) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(rel)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(data);
    });
  });
  return new Promise((r) => srv.listen(0, '127.0.0.1', () => r(srv)));
}

function findBrowser() {
  if (process.env.BROWSER_BIN) return process.env.BROWSER_BIN;
  const cands = process.platform === 'win32'
    ? ['C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', path.join(os.homedir(), 'AppData\\Local\\Google\\Chrome\\Application\\chrome.exe')]
    : process.platform === 'darwin'
      ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge']
      : ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge'];
  for (const c of cands) {
    if (path.isAbsolute(c)) { if (fs.existsSync(c)) return c; continue; }
    try { return execSync(`command -v ${c}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch (e) { /* weiter */ }
  }
  throw new Error('Kein Chrome/Edge gefunden – BROWSER_BIN setzen.');
}

const problems = [];
const steps = [];
const check = (cond, msg) => { if (!cond) problems.push('ASSERT ' + msg); };

(async () => {
  const bin = findBrowser();
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bt-e2e-'));
  /* Port 0: der Browser wählt selbst einen freien Port und schreibt ihn in „DevToolsActivePort“ */
  const args = ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profileDir}`, '--no-first-run',
    '--no-default-browser-check', '--disable-gpu', '--disable-dev-shm-usage', '--window-size=1366,900', 'about:blank'];
  if (process.env.CI) args.unshift('--no-sandbox');
  const proc = spawn(bin, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  let stderr = '';
  let exited = null;
  proc.stderr.on('data', (d) => { stderr = (stderr + d).slice(-4000); });
  proc.on('exit', (code) => { exited = code; });
  proc.on('error', (e) => { exited = e.message; });
  const portFile = path.join(profileDir, 'DevToolsActivePort');
  let targets = [];
  let port = null;
  for (let i = 0; i < 240 && exited === null && !targets.find((x) => x.type === 'page'); i++) {
    if (!port && fs.existsSync(portFile)) port = Number(fs.readFileSync(portFile, 'utf8').split('\n')[0]) || null;
    if (port) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); } catch (e) { /* startet noch */ } }
    await sleep(250);
  }
  const page = targets.find((x) => x.type === 'page');
  if (!page) {
    throw new Error(`Browser nicht erreichbar (${bin}, Port ${port}, beendet: ${exited})\n--- Browser-Ausgabe ---\n${stderr.trim() || '(leer)'}`);
  }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0;
  const pending = new Map();
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); return; }
    if (d.method === 'Runtime.exceptionThrown') problems.push('EXCEPTION ' + ((d.params.exceptionDetails.exception || {}).description || d.params.exceptionDetails.text));
    if (d.method === 'Runtime.consoleAPICalled' && ['error', 'warning', 'assert'].includes(d.params.type)) problems.push('CONSOLE ' + d.params.args.map((a) => a.value || a.description).join(' '));
    if (d.method === 'Log.entryAdded' && ['error', 'warning'].includes(d.params.entry.level)) problems.push('LOG ' + d.params.entry.text);
  };
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.result.exceptionDetails) { problems.push('EVAL ' + expr.slice(0, 60) + ' → ' + ((r.result.exceptionDetails.exception || {}).description || '')); return null; }
    return r.result.result.value;
  };
  let shotNo = 0;
  const shot = async (name) => {
    steps.push(name);
    if (!SHOTS) return;
    fs.mkdirSync(SHOTS, { recursive: true });
    const r = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS, `${String(++shotNo).padStart(2, '0')}-${name}.png`), Buffer.from(r.result.data, 'base64'));
  };
  const key = async (ch) => {
    const p = { type: 'keyDown', key: ch, text: ch, unmodifiedText: ch };
    if (ch === ' ') Object.assign(p, { code: 'Space', windowsVirtualKeyCode: 32 });
    await send('Input.dispatchKeyEvent', p);
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: ch });
  };
  const enter = async () => {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  };
  const type = async (text, delay = 70, wrongEvery = 0) => {
    let n = 0;
    for (const ch of text) {
      if (wrongEvery && ++n % wrongEvery === 0) { await key(ch === 'x' ? 'q' : 'x'); await sleep(delay); }
      await key(ch);
      await sleep(delay);
    }
  };
  const text = () => ev("(document.querySelector('#main .text')||{}).textContent || ''");
  const go = async (screen, ...a) => { await ev(`BT.App.go(${[screen, ...a].map((x) => JSON.stringify(x)).join(',')})`); await sleep(350); };
  const reset = async () => { await ev("localStorage.clear()"); await send('Page.navigate', { url: APP_URL }); await sleep(1200); };

  await send('Runtime.enable');
  await send('Log.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: APP_URL });
  await sleep(1200);

  for (const lang of ['de', 'en']) {
    await reset();
    await ev(`document.querySelector('#modal-root [data-close]') ; BT.App.closeModal(); document.querySelector('[data-lang="${lang}"]').click()`);
    await sleep(300);
    check(await ev('document.documentElement.lang') === lang, `${lang}: html lang`);
    await shot(`${lang}-profiles`);
    await ev("BT.App.newProfileModal(); document.querySelector('#np-name').value='Test'; document.querySelector('#np-ok').click()");
    await sleep(700);
    await shot(`${lang}-welcome`);
    await ev('BT.App.closeModal()');
    check(await ev('BT.App.current') === 'home', `${lang}: Startseite nach Profil`);
    check(await ev('BT.Store.profile.settings.lang') === lang, `${lang}: Profil-Sprache`);
    await shot(`${lang}-home`);

    await go('guide', 7);
    await type(await ev("BT.locale && ['LP','LR','LM','LI'].map(f=>BT.HOME[f]).join('') + ' ' + ['RI','RM','RR','RP'].map(f=>BT.HOME[f]).join('')"), 60);
    await sleep(500);
    check(await ev('BT.Store.profile.flags.guideDone') === true, `${lang}: Anleitungs-Übung abgeschlossen`);
    await shot(`${lang}-guide`);

    await go('lessonIntro', 0);
    await key('f');
    await shot(`${lang}-lesson1-intro`);
    await enter();
    await sleep(500);
    for (let r = 0; r < 3; r++) {
      await type(await text(), 60, r === 0 ? 9 : 0);
      if (r === 0) await shot(`${lang}-lesson1-round1-done`);
      await sleep(1000);
      if (r < 2) { await enter(); await sleep(500); }
    }
    await sleep(1500);
    await shot(`${lang}-lesson1-result`);
    check(await ev('BT.App.current') === 'lessonResult', `${lang}: Ergebnisseite`);
    check(await ev(`BT.Progress.stars(BT.Store.profile, 0)`) >= 1, `${lang}: Lektion 1 mit Stern gespeichert`);
    check(await ev(`Object.keys(BT.Store.profile.lessons).includes(BT.COURSE_ID + ':fj')`), `${lang}: Lektions-Schlüssel pro Kurs`);

    await ev('BT.Store.profile.settings.unlockAll = true; BT.Store.save()');
    for (const i of [3, 15, 16, 17, 18, 19]) {
      await go('lessonIntro', i);
      await enter();
      await sleep(400);
      await type((await text()).slice(0, 6), 50);
      if (i === 16) await shot(`${lang}-lesson17-typing`);
    }
    await go('games');
    await shot(`${lang}-games`);
    await go('blitz');
    await key(' ');
    await sleep(2300);
    for (let i = 0; i < 6; i++) { await key(await ev("document.querySelector('#bl-letter').textContent")); await sleep(80); }
    await shot(`${lang}-blitz`);
    await go('rain');
    await key(' ');
    await sleep(3500);
    const w = await ev("(document.querySelector('.drop .rest')||{}).textContent || ''");
    if (w) await type(w, 60);
    await shot(`${lang}-rain`);
    await go('race', 0);
    await key(' ');
    await sleep(2800);
    await type(await text(), 45);
    await sleep(1200);
    await shot(`${lang}-race-result`);
    check((await ev("BT.Store.profile.games.race.snail || 0")) > 0, `${lang}: Rennen gegen die Schnecke gewonnen`);
    for (const s of ['map', 'training', 'stats', 'trophies', 'settings']) { await go(s); await shot(`${lang}-${s}`); }
    await go('trainRun', 'words');
    await shot(`${lang}-training-run`);
  }

  /* Zurücksetzen-Button oben: Elternaufgabe lösen, dann „Alles löschen“ */
  const solveGate = async () => {
    const q = await ev("(document.querySelector('.gate-q')||{}).textContent || ''");
    const m = q.match(/(\d+)\s*×\s*(\d+)/);
    check(m, 'Elternaufgabe erscheint');
    if (m) await ev(`document.querySelector('#gate').value='${Number(m[1]) * Number(m[2])}'; document.querySelector('#gate-ok').click()`);
    await sleep(300);
  };
  await go('home');
  check(await ev("!!document.querySelector('#tb-reset')"), 'Zurücksetzen-Button in der Kopfzeile');
  await ev("document.querySelector('#tb-reset').click()");
  await sleep(300);
  await solveGate();
  await shot('reset-dialog');
  await ev("document.querySelector('#rs-all').click()");
  await sleep(500);
  check(await ev('BT.App.current') === 'profiles', 'Nach „Alles löschen“ Profilauswahl');
  check(await ev('Object.keys(BT.Store.data.profiles).length') === 0, 'Alle Profile gelöscht');
  check(await ev("localStorage.getItem('tastaturtrainer.v1')") === null, 'Speicher im Browser geleert');

  /* Aufruf über http(s) wie bei GitHub Pages: Manifest, Service Worker, Offline-Start */
  const server = await startServer();
  const webUrl = `http://127.0.0.1:${server.address().port}/index.html`;
  await send('Page.navigate', { url: webUrl });
  await sleep(1500);
  check(await ev("!!document.querySelector('link[rel=manifest]')"), 'Web: Manifest eingebunden');
  check(await ev("navigator.serviceWorker.ready.then(r => !!r.active)"), 'Web: Service Worker aktiv');
  await sleep(800);
  await send('Network.enable');
  await send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await send('Page.reload', { ignoreCache: false });
  await sleep(1500);
  check(await ev("typeof BT === 'object' && BT.App.current === 'profiles'"), 'Web: App startet offline aus dem Cache');
  await shot('web-offline');
  await send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await ev('navigator.serviceWorker.getRegistrations().then(rs => Promise.all(rs.map(r => r.unregister())))');
  server.close();
  await send('Page.navigate', { url: APP_URL });
  await sleep(1000);

  /* Sicherheit: manipulierter Speicherstand darf kein HTML/JS einschleusen */
  const evil = { activeId: 'pevil12345', profiles: { a: { id: 'pevil12345', name: '<img src=x onerror="window.__xss=1">', avatar: '<img src=x onerror="window.__xss=2">',
    history: [{ t: 1, kind: 'lesson', label: '<img src=x onerror="window.__xss=3">', zpm: 10, acc: 1 }], settings: { lang: 'de' } } } };
  await ev(`localStorage.setItem('tastaturtrainer.v1', ${JSON.stringify(JSON.stringify(evil))})`);
  await send('Page.navigate', { url: APP_URL });
  await sleep(1200);
  for (const s of ['home', 'stats', 'settings', 'profiles']) await go(s);
  check(!(await ev('window.__xss')), 'Kein Skript aus manipuliertem Speicherstand ausgeführt');
  check((await ev("document.querySelectorAll('img').length")) === 0, 'Kein eingeschleustes <img>-Element');
  check((await ev("BT.Store.profile ? BT.Store.profile.avatar : '🐱'")) === '🐱', 'Ungültiger Avatar wurde ersetzt');
  await shot('security-tampered-storage');

  ws.close();
  proc.kill();
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) { /* egal */ }
  console.log(`${steps.length} Schritte durchgespielt (${bin})`);
  if (problems.length) {
    console.error(`✗ ${problems.length} Problem(e):\n  ` + problems.join('\n  '));
    process.exit(1);
  }
  console.log('✓ Keine Fehler, Warnungen oder CSP-Verstöße');
  process.exit(0);
})().catch((e) => { console.error('✗ E2E abgebrochen:', e); console.error(problems.join('\n')); process.exit(1); });
