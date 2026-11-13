'use strict';
/* TastaturTrainer – Start (eigene Datei statt Inline-Script, damit die Content-Security-Policy kein 'unsafe-inline' braucht) */
window.BT.App.init();

/* Installierbar & offline nutzbar – nur beim Aufruf über https/localhost (GitHub Pages, Schulserver),
 * nicht bei der lokalen HTML-Datei (file://) und nicht in der Desktop-App. */
(function () {
  const web = /^https?:$/.test(location.protocol) && window.isSecureContext && !window.__TT_DESKTOP;
  if (!web || !('serviceWorker' in navigator)) return;
  const link = document.createElement('link');
  link.rel = 'manifest';
  link.href = 'manifest.webmanifest';
  document.head.appendChild(link);
  navigator.serviceWorker.register('sw.js').catch(() => { /* ohne Offline-Modus weiter */ });
})();
