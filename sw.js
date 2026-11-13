'use strict';
/* TastaturTrainer – Service Worker
 * Macht die Web-App offline nutzbar, wenn sie über https geöffnet wird (z. B. GitHub Pages oder Schulserver).
 * Strategie „Netz zuerst“: online immer die aktuelle Version, ohne Netz die zuletzt geladene aus dem Cache.
 * Es werden nur Dateien dieser App zwischengespeichert – keine fremden Seiten, keine Nutzerdaten.
 */
const CACHE = 'tastaturtrainer-v1';
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'icon.ico', 'icons/icon-192.png', 'icons/icon-512.png', 'css/style.css',
  'js/data.js', 'js/layouts.js', 'js/i18n.js', 'js/locales/de.js', 'js/locales/en.js', 'js/store.js', 'js/sound.js',
  'js/keyboard.js', 'js/gen.js', 'js/progress.js', 'js/typing.js', 'js/app.js', 'js/screens.js', 'js/games.js', 'js/main.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('tastaturtrainer-') && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match('index.html'))),
  );
});
