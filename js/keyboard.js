'use strict';
/* TastaturTrainer – Bildschirmtastatur und Hände */
(function (BT) {
  const LETTER = /^[a-zäöü]$/;
  const esc = BT.esc;

  BT.keyLabel = (ch) => (ch === ' ' ? BT.t('key.space') : (LETTER.test(ch) ? ch.toUpperCase() : ch));

  function keyHtml(k) {
    const f = k.finger ? BT.FINGERS[k.finger] : null;
    const cls = ['key'];
    if (f) cls.push('fc-' + f.type);
    if (k.special) cls.push('mod');
    if (k.seg2) cls.push('seg2');
    if (k.seg1) cls.push('seg1');
    if (k.id === 'Space') cls.push('space');
    if (k.base === 'f' || k.base === 'j') cls.push('bump');
    let inner;
    if (k.special) inner = `<span class="k-main k-mod">${k.label}</span>`;
    else if (LETTER.test(k.base)) inner = `<span class="k-main">${k.base.toUpperCase()}</span>`;
    else inner = `<span class="k-top">${esc(k.shift)}</span><span class="k-main">${esc(k.base)}</span>`;
    return `<div class="${cls.join(' ')}" data-id="${k.id}" style="--w:${k.w || 1}">${inner}</div>`;
  }

  BT.KB = {
    create(container, opts = {}) {
      const colored = opts.colored !== false;
      container.innerHTML = `<div class="kb${colored ? ' colored' : ''}"><div class="kb-inner">${
        BT.KEYBOARD.map((row) => `<div class="kb-row">${row.map(keyHtml).join('')}</div>`).join('')
      }</div></div>`;
      const root = container.firstElementChild;
      const byId = {};
      root.querySelectorAll('.key').forEach((el) => { (byId[el.dataset.id] = byId[el.dataset.id] || []).push(el); });
      let targets = [];

      const api = {
        root,
        els: (id) => byId[id] || [],

        /* Nächste Taste (und ggf. Umschalttaste) hervorheben */
        highlight(ch) {
          targets.forEach((el) => el.classList.remove('target'));
          targets = [];
          if (ch == null) return;
          const m = BT.CHAR_MAP[ch];
          if (!m) return;
          const ids = [m.key.id];
          if (m.shift) ids.push(BT.shiftFor(m.key).id);
          ids.forEach((id) => api.els(id).forEach((el) => { el.classList.add('target'); targets.push(el); }));
        },

        /* Kurzes Aufleuchten der gedrückten Taste */
        flash(ch, ok) {
          const m = BT.CHAR_MAP[ch];
          if (!m) return;
          const cls = ok ? 'hit' : 'miss';
          api.els(m.key.id).forEach((el) => {
            el.classList.remove('hit', 'miss');
            void el.offsetWidth;
            el.classList.add(cls);
            clearTimeout(el._t);
            el._t = setTimeout(() => el.classList.remove(cls), 260);
          });
        },

        /* fn(key) -> 'new' | 'dim' | '' */
        mark(fn) {
          BT.KEYBOARD.forEach((row) => row.forEach((k) => {
            const c = fn(k);
            api.els(k.id).forEach((el) => { el.classList.remove('new', 'dim'); if (c) el.classList.add(c); });
          }));
        },

        /* Tastatur für den Lektions-Einstieg einfärben: neu = leuchtet, unbekannt = blass */
        markLesson(idx) {
          const L = BT.LESSONS[idx];
          const prev = idx > 0 ? BT.Gen.allowed(idx - 1) : { set: new Set([' ']), shift: false };
          const now = BT.Gen.allowed(idx);
          api.mark((k) => {
            if (k.special) {
              if (k.id === 'Space') return '';
              if (k.id === 'ShiftLeft' || k.id === 'ShiftRight') {
                if (L.type === 'shift' || L.type === 'punct') return 'new';
                return prev.shift ? '' : 'dim';
              }
              return 'dim';
            }
            const chars = [k.base, k.shift];
            if (chars.some((c) => L.keys.includes(c))) return 'new';
            if (chars.some((c) => now.set.has(c))) return '';
            return 'dim';
          });
        },

        /* fn(key) -> {bg, ink, title} | null  (z. B. für die Fehler-Heatmap) */
        paint(fn) {
          BT.KEYBOARD.forEach((row) => row.forEach((k) => {
            const r = fn(k);
            api.els(k.id).forEach((el) => {
              if (r) {
                el.style.background = r.bg;
                el.style.color = r.ink || '';
                if (r.title) el.title = r.title;
                el.classList.add('painted');
              }
            });
          }));
        },
      };
      return api;
    },
  };

  /* ---------- Hände (SVG) ---------- */
  BT.Hands = {
    create(container) {
      const shapes = (ids) => `
        <rect class="finger fc-thumb" data-f="${ids[4]}" x="146" y="110" width="62" height="28" rx="14" transform="rotate(28 146 124)"/>
        <rect class="finger fc-pinky" data-f="${ids[0]}" x="40" y="46" width="26" height="64" rx="13"/>
        <rect class="finger fc-ring" data-f="${ids[1]}" x="71" y="24" width="26" height="80" rx="13"/>
        <rect class="finger fc-middle" data-f="${ids[2]}" x="102" y="14" width="26" height="90" rx="13"/>
        <rect class="finger fc-index" data-f="${ids[3]}" x="133" y="26" width="26" height="80" rx="13"/>
        <rect class="palm" x="38" y="84" width="126" height="76" rx="34"/>`;
      container.innerHTML = `<svg class="hands" viewBox="0 0 440 182" aria-hidden="true">
          <g>${shapes(['LP', 'LR', 'LM', 'LI', 'LT'])}</g>
          <g transform="translate(440 0) scale(-1 1)">${shapes(['RP', 'RR', 'RM', 'RI', 'RT'])}</g>
          <text x="101" y="178" class="hand-label" text-anchor="middle">${BT.t('hands.left')}</text>
          <text x="339" y="178" class="hand-label" text-anchor="middle">${BT.t('hands.right')}</text>
        </svg>`;
      const svg = container.firstElementChild;
      const els = {};
      svg.querySelectorAll('.finger').forEach((el) => { els[el.dataset.f] = el; });
      let act = [];
      return {
        highlight(list) {
          act.forEach((el) => el.classList.remove('active'));
          act = [];
          (list || []).forEach((f) => { const el = els[f]; if (el) { el.classList.add('active'); act.push(el); } });
          svg.classList.toggle('has-active', act.length > 0);
        },
      };
    },
  };
})(window.BT);
