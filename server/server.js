#!/usr/bin/env node
'use strict';
/* TastaturTrainer – Heimserver (z. B. Unraid)
 *
 * Liefert die unveränderte Web-App aus und speichert die Profile zentral in
 * $TT_DATA_DIR/profiles.json, damit jedes Gerät im Heimnetz dieselben Profile sieht.
 * Keine Abhängigkeiten, nur Node ≥ 22.
 *
 *   node server/server.js            aus dem Repo: http://127.0.0.1:8080, Daten in ./data
 *   PORT  HOST  TT_DATA_DIR  TT_DATA_LABEL  TT_WEB_DIR   Umgebungsvariablen (siehe unten)
 *   Docker/Unraid: siehe Dockerfile und unraid/README.md
 *
 * Die App selbst wird nicht verändert: index.html bekommt beim Ausliefern ein zusätzliches Skript
 * (tt-server.js) vor store.js, das den localStorage-Schlüssel der App auf diesen Server umleitet.
 *
 * API (nur JSON, nur gleiche Herkunft – PUT/DELETE mit application/json brauchen fremd einen Preflight, den es hier nicht gibt):
 *   GET    /api/health
 *   GET    /api/profiles           → { profiles: { <id>: {...} } }
 *   PUT    /api/profiles/<id>      Profil anlegen/ersetzen
 *   DELETE /api/profiles/<id>      Profil löschen
 *   DELETE /api/profiles           alle Profile löschen
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT ?? 8080);                 // 0 = freien Port wählen (Tests)
const HOST = process.env.HOST || '127.0.0.1';                    // im Container 0.0.0.0
const DATA_DIR = path.resolve(process.env.TT_DATA_DIR || path.join(__dirname, '..', 'data'));
const DATA_LABEL = process.env.TT_DATA_LABEL || 'Server: ' + path.join(DATA_DIR, 'profiles.json');
const WEB = path.resolve(process.env.TT_WEB_DIR || path.join(__dirname, '..'));
/* Nur die Dateien der Web-App werden ausgeliefert (wie dist/site) – nie server/, tools/, .git oder data/ */
const WEB_FILES = /^\/(manifest\.webmanifest|icon\.ico|icons\/[\w-]+\.png|css\/[\w-]+\.css|js\/(locales\/)?[\w-]+\.js)$/;
const FILE = path.join(DATA_DIR, 'profiles.json');
const MAX_PROFILES = 50;
const MAX_BODY = 1024 * 1024;
const ID = /^p[a-z0-9]{4,24}$/;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8',
};

/* ---------- Daten ---------- */
let profiles = {};
function loadData() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) return;
  try {
    const d = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    if (d && typeof d.profiles === 'object' && !Array.isArray(d.profiles)) profiles = d.profiles;
    console.log(`Profile geladen: ${Object.keys(profiles).length} (${FILE})`);
  } catch (e) {
    const bad = FILE + '.defekt-' + new Date().toISOString().replace(/[:.]/g, '-');
    fs.renameSync(FILE, bad);
    console.error(`!!! ${FILE} war unlesbar und liegt jetzt als ${bad} daneben. Es geht ohne Profile weiter.`, e.message);
  }
}

/* Schreiben: nacheinander, atomar (tmp + rename), vorherige Fassung als .bak */
let writing = Promise.resolve();
function saveData() {
  const json = JSON.stringify({ version: 1, saved: new Date().toISOString(), profiles }, null, 1);
  writing = writing.then(async () => {
    const tmp = FILE + '.tmp';
    await fs.promises.writeFile(tmp, json, 'utf8');
    const fh = await fs.promises.open(tmp, 'r');
    try { await fh.sync(); } finally { await fh.close(); }
    if (fs.existsSync(FILE)) await fs.promises.copyFile(FILE, FILE + '.bak');
    await fs.promises.rename(tmp, FILE);
  });
  return writing;
}

/* ---------- HTTP-Helfer ---------- */
const BASE_HEADERS = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY' };
function send(res, status, body, type = 'application/json', extra = {}) {
  const buf = Buffer.isBuffer(body) ? body : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
  res.writeHead(status, { ...BASE_HEADERS, 'Content-Type': type, 'Content-Length': buf.length, ...extra });
  res.end(res.req.method === 'HEAD' ? undefined : buf);
}
const noStore = { 'Cache-Control': 'no-store' };

function readJson(req) {
  return new Promise((resolve, reject) => {
    if (!/^application\/json\b/i.test(req.headers['content-type'] || '')) return reject(Object.assign(new Error('json'), { status: 415 }));
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(Object.assign(new Error('zu groß'), { status: 413 })); req.removeAllListeners('data'); req.resume(); return; }
      chunks.push(c);
    });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch (e) { reject(Object.assign(e, { status: 400 })); } });
    req.on('error', reject);
  });
}

/* ---------- Seiten-Anpassung ---------- */
const SHIM = fs.readFileSync(path.join(__dirname, 'tt-server.js'), 'utf8').replace('__TT_DATA_LABEL__', JSON.stringify(DATA_LABEL).slice(1, -1));
const SW = fs.readFileSync(path.join(__dirname, 'sw.js'));
function indexHtml() {
  let html = fs.readFileSync(path.join(WEB, 'index.html'), 'utf8');
  // Die App erlaubt standardmäßig keine Netzwerkzugriffe – hier nur zur eigenen Adresse.
  html = html.replace("connect-src 'none'", "connect-src 'self'");
  const tag = '<script src="js/store.js"';
  if (!html.includes(tag)) throw new Error('index.html: store.js nicht gefunden – Aufbau der App hat sich geändert');
  html = html.replace(tag, '<script src="tt-server.js" charset="utf-8"></script>\n  ' + tag);
  return html;
}
indexHtml(); // beim Start prüfen, nicht erst beim ersten Aufruf

/* ---------- Server ---------- */
async function handle(req, res) {
  const url = new URL(req.url, 'http://x');
  let p;
  try { p = decodeURIComponent(url.pathname); } catch { return send(res, 400, 'Bad Request', 'text/plain'); }
  if (p.includes('\0')) return send(res, 400, 'Bad Request', 'text/plain');

  if (p.startsWith('/api/')) {
    if (p === '/api/health') return send(res, 200, { ok: true, profiles: Object.keys(profiles).length }, undefined, noStore);
    if (p === '/api/profiles') {
      if (req.method === 'GET') return send(res, 200, { profiles }, undefined, noStore);
      if (req.method === 'DELETE') { profiles = {}; await saveData(); console.log('Alle Profile gelöscht'); return send(res, 200, { ok: true }); }
      return send(res, 405, { error: 'method' });
    }
    const m = /^\/api\/profiles\/([^/]+)$/.exec(p);
    if (m && ID.test(m[1])) {
      const id = m[1];
      if (req.method === 'PUT') {
        const body = await readJson(req);
        if (!body || typeof body !== 'object' || Array.isArray(body) || body.id !== id) return send(res, 400, { error: 'profil' });
        if (!profiles[id] && Object.keys(profiles).length >= MAX_PROFILES) return send(res, 409, { error: 'zu viele Profile' });
        const isNew = !profiles[id];
        profiles[id] = body;
        await saveData();
        if (isNew) console.log(`Profil angelegt: ${id}`);
        return send(res, 200, { ok: true });
      }
      if (req.method === 'DELETE') {
        if (profiles[id]) { delete profiles[id]; await saveData(); console.log(`Profil gelöscht: ${id}`); }
        return send(res, 200, { ok: true });
      }
      return send(res, 405, { error: 'method' });
    }
    return send(res, 404, { error: 'nicht gefunden' });
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method Not Allowed', 'text/plain');
  if (p === '/' || p === '/index.html') return send(res, 200, indexHtml(), MIME['.html'], noStore);
  if (p === '/tt-server.js') return send(res, 200, SHIM, MIME['.js'], noStore);
  if (p === '/sw.js') return send(res, 200, SW, MIME['.js'], noStore);

  if (!WEB_FILES.test(p)) return send(res, 404, 'Not Found', 'text/plain');
  const file = path.join(WEB, p);
  let st;
  try { st = await fs.promises.stat(file); } catch { return send(res, 404, 'Not Found', 'text/plain'); }
  if (!st.isFile()) return send(res, 404, 'Not Found', 'text/plain');
  send(res, 200, await fs.promises.readFile(file), MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', { 'Cache-Control': 'no-cache' });
}

loadData();
const server = http.createServer((req, res) => {
  handle(req, res).catch((e) => {
    if (!e.status) console.error(e);
    if (!res.headersSent) send(res, e.status || 500, { error: e.status ? e.message : 'intern' });
  });
});
server.listen(PORT, HOST, () => console.log(`TastaturTrainer läuft auf http://${HOST}:${server.address().port}, Daten in ${DATA_DIR}`));

function stop() { console.log('Beenden …'); server.close(); writing.finally(() => process.exit(0)); }
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
