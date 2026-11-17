'use strict';
/* TastaturTrainer – Speicher auf dem Heimserver (wird vom Server vor js/store.js eingefügt)
 *
 * Die App speichert alles als ein JSON unter dem localStorage-Schlüssel „tastaturtrainer.v1“.
 * Dieses Skript leitet genau diesen Schlüssel um:
 *   - Profile liegen auf dem Server (jedes Profil einzeln, damit zwei Kinder an zwei Geräten
 *     sich nicht gegenseitig überschreiben),
 *   - „welches Profil ist gerade offen“ und die Sprache bleiben pro Gerät im echten localStorage.
 * Ist der Server beim Laden nicht erreichbar, wirft der Zugriff einen Fehler: die App zeigt dann ihren
 * Hinweis „kein Speichern möglich“ und schreibt nichts – so kann kein leerer Stand die Server-Daten überschreiben.
 */
(function () {
  const KEY = 'tastaturtrainer.v1';
  const LEGACY = 'blindtrainer.v1';
  const DEVICE = 'tastaturtrainer.server.device';
  const LABEL = '__TT_DATA_LABEL__';
  const proto = Storage.prototype;
  const orig = { get: proto.getItem, set: proto.setItem, remove: proto.removeItem };
  const ls = (() => { try { return window.localStorage; } catch (e) { return null; } })();

  /* Stand des Servers: id → JSON-Text des Profils (null = Server nicht erreichbar) */
  let known = null;
  try {
    const x = new XMLHttpRequest();
    x.open('GET', 'api/profiles', false); // synchron: store.js liest beim Start auch synchron
    x.setRequestHeader('Accept', 'application/json');
    x.send();
    if (x.status !== 200) throw new Error('HTTP ' + x.status);
    const d = JSON.parse(x.responseText);
    known = {};
    Object.entries(d.profiles || {}).forEach(([id, p]) => { known[id] = JSON.stringify(p); });
  } catch (e) {
    console.warn('TastaturTrainer: Server nicht erreichbar', e);
    document.addEventListener('DOMContentLoaded', () => banner('⚠️ Der TastaturTrainer-Server ist nicht erreichbar. Bitte die Seite neu laden – bis dahin wird nichts gespeichert.'));
  }

  function device() {
    try { return JSON.parse(orig.get.call(ls, DEVICE)) || {}; } catch (e) { return {}; }
  }

  /* ---------- Hinweis-Leiste bei Problemen ---------- */
  let bar = null;
  function banner(text) {
    if (!document.body) return;
    if (!bar) {
      bar = document.createElement('div');
      bar.setAttribute('role', 'alert');
      bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:99999;padding:.7rem 1rem;background:#b3261e;color:#fff;font:600 1rem system-ui,sans-serif;text-align:center';
      document.body.appendChild(bar);
    }
    bar.textContent = text;
    bar.hidden = !text;
  }

  /* ---------- Senden: pro Profil nur der neueste Stand, nacheinander, mit Wiederholung ---------- */
  const pending = new Map(); // id → JSON-Text (anlegen/ändern) oder null (löschen); '*' → alle löschen
  let busy = false;
  let retry = null;

  async function flush() {
    if (busy) return;
    busy = true;
    try {
      while (pending.size) {
        const [id, body] = pending.entries().next().value;
        const url = id === '*' ? 'api/profiles' : 'api/profiles/' + encodeURIComponent(id);
        const opts = body == null
          ? { method: 'DELETE', headers: { 'Content-Type': 'application/json' } }
          : { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body };
        if (!body || body.length < 60000) opts.keepalive = true; // läuft auch beim Schließen des Tabs zu Ende
        const res = await fetch(url, opts);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        if (pending.get(id) === body) pending.delete(id); // inzwischen neuer Stand? Dann gleich nochmal
      }
      banner('');
    } catch (e) {
      console.warn('TastaturTrainer: Speichern auf dem Server fehlgeschlagen', e);
      banner('⚠️ Speichern auf dem Server klappt gerade nicht – es wird weiter versucht. Bitte das Fenster noch nicht schließen.');
      clearTimeout(retry);
      retry = setTimeout(flush, 5000);
    } finally {
      busy = false;
    }
  }

  window.addEventListener('beforeunload', (e) => {
    if (pending.size) { flush(); e.preventDefault(); e.returnValue = ''; }
  });

  /* ---------- Umleitung des einen Schlüssels ---------- */
  proto.getItem = function (k) {
    if (this !== ls || (k !== KEY && k !== LEGACY)) return orig.get.apply(this, arguments);
    if (k === LEGACY) return null;
    if (!known) throw new Error('Server nicht erreichbar');
    const profiles = {};
    Object.entries(known).forEach(([id, s]) => { profiles[id] = JSON.parse(s); });
    const dev = device();
    return JSON.stringify({ version: 2, activeId: dev.activeId || null, lang: dev.lang || null, profiles });
  };

  proto.setItem = function (k, v) {
    if (this !== ls || (k !== KEY && k !== LEGACY)) return orig.set.apply(this, arguments);
    if (!known) throw new Error('Server nicht erreichbar');
    const d = JSON.parse(String(v));
    try { orig.set.call(ls, DEVICE, JSON.stringify({ activeId: d.activeId || null, lang: d.lang || null })); } catch (e) { /* nur Komfort */ }
    const next = {};
    Object.entries(d.profiles || {}).forEach(([id, p]) => { next[id] = JSON.stringify(p); });
    Object.keys(known).forEach((id) => { if (!(id in next)) pending.set(id, null); });
    Object.entries(next).forEach(([id, s]) => { if (known[id] !== s) pending.set(id, s); });
    known = next;
    flush();
  };

  proto.removeItem = function (k) {
    if (this !== ls || (k !== KEY && k !== LEGACY)) return orig.remove.apply(this, arguments);
    if (k === LEGACY) return;
    if (!known) throw new Error('Server nicht erreichbar');
    pending.clear();
    pending.set('*', null);
    known = {};
    flush();
  };

  /* Anzeige „Speicherort“ in Einstellungen und Zurücksetzen-Dialog */
  document.addEventListener('DOMContentLoaded', () => {
    const S = window.BT && window.BT.Store;
    if (S && known) S.storageInfo = () => ({ kind: 'file', location: LABEL });
  });
})();
