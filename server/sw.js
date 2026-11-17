'use strict';
/* TastaturTrainer auf dem Heimserver: kein Offline-Cache.
 * Ohne Server kann ohnehin nicht gespeichert werden, und ein alter Stand aus dem Cache soll nie
 * Profile überschreiben. Ein früher installierter Service Worker räumt sich hiermit selbst ab. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('tastaturtrainer-')).map((k) => caches.delete(k))))
    .then(() => self.registration.unregister()));
});
