'use strict';
/* BlindTrainer – Tipp-Engine und Tipp-Ansicht */
(function (BT) {
  const esc = BT.esc;

  /* Tastatur-Ereignis -> getipptes Zeichen (oder null) */
  BT.keyChar = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return null; // Strg-Kürzel und AltGr ignorieren
    if (!e.key || e.key === 'Dead' || e.key.length !== 1) return null;
    return e.key;
  };

  /* ---------- Zustand einer Runde ---------- */
  BT.Typer = class {
    constructor(text) {
      this.text = text;
      this.pos = 0;
      this.wrong = 0;
      this.errPos = new Set();
      this.active = 0;
      this.last = 0;
      this.keyLog = {};
      this.combo = 0;
      this.maxCombo = 0;
      this.done = false;
    }
    get expected() { return this.text[this.pos]; }
    input(ch) {
      if (this.done) return null;
      const now = performance.now();
      if (this.last) this.active += Math.min(now - this.last, 3000); // lange Pausen zählen nicht
      this.last = now;
      const exp = this.expected;
      const log = this.keyLog[exp] || (this.keyLog[exp] = { h: 0, e: 0 });
      if (ch === exp) {
        log.h++;
        this.pos++;
        this.combo++;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;
        if (this.pos >= this.text.length) { this.done = true; return 'done'; }
        return 'ok';
      }
      log.e++;
      this.wrong++;
      this.errPos.add(this.pos);
      this.combo = 0;
      return 'bad';
    }
    get accuracy() { const t = this.pos + this.wrong; return t ? this.pos / t : 1; }
    get zpm() {
      if (this.active < 1000 || this.pos < 2) return 0;
      return (this.pos - 1) / (this.active / 60000);
    }
    result() {
      return { correct: this.pos, wrong: this.wrong, acc: this.accuracy, zpm: this.zpm, activeMs: this.active,
        keyLog: this.keyLog, maxCombo: this.maxCombo, length: this.text.length };
    }
  };

  /* Welcher Finger? Als kurzer Satzteil, z. B. „mit dem linken Zeigefinger“ */
  BT.fingerText = (ch) => {
    const m = BT.CHAR_MAP[ch];
    if (!m) return '';
    if (ch === ' ') return 'mit dem Daumen';
    const f = BT.FINGERS[m.key.finger];
    if (m.shift) {
      const sf = BT.FINGERS[BT.shiftFor(m.key).finger];
      return `⇧ mit dem ${sf.dat} halten, ${esc(BT.keyLabel(m.key.base))} mit dem ${f.dat}`;
    }
    return `mit dem ${f.dat}`;
  };

  /* Hinweis, welcher Finger die nächste Taste drückt */
  BT.hintHtml = (ch) => {
    const m = BT.CHAR_MAP[ch];
    if (!m) return '';
    if (ch === ' ') return '<span class="kcap wide fc-thumb">Leertaste</span> mit dem Daumen';
    const f = BT.FINGERS[m.key.finger];
    const label = esc(BT.keyLabel(m.key.base));
    const cap = `<span class="kcap fc-${f.type}">${label}</span>`;
    if (m.shift) {
      const sf = BT.FINGERS[BT.shiftFor(m.key).finger];
      return `<span class="kcap fc-pinky">⇧</span> + ${cap} <span class="hint-sep">·</span> ⇧ mit dem ${sf.dat} halten, ${label} mit dem ${f.dat}`;
    }
    return `${cap} mit dem ${f.dat}`;
  };

  /* ---------- Ansicht: Text, Statistik, Tastatur, Hände ---------- */
  BT.TypingView = {
    create(container, text, opts = {}) {
      const st = BT.Store.profile.settings;
      const typer = new BT.Typer(text);
      const chars = [...text];
      container.innerHTML = `
        <div class="tv${opts.compact ? ' compact' : ''}">
          <div class="tv-bar">
            <div class="progress"><i></i></div>
            <div class="tv-chips">
              <span class="chip" title="Genauigkeit">🎯 <b data-s="acc">100 %</b></span>
              <span class="chip" title="Zeichen pro Minute">⚡ <b data-s="zpm">0</b> <small>Zeichen/Min</small></span>
              <span class="chip combo" title="Richtige Tasten am Stück">🔥 <b data-s="combo">0</b></span>
              <button class="chip chip-btn" data-act="kb"></button>
            </div>
          </div>
          <div class="caps-warn" hidden>⚠️ Die Feststelltaste <b>⇪</b> ist an! Drück sie einmal, um sie auszuschalten.</div>
          <div class="textbox"><div class="text">${chars.map((c) => `<span class="ch${c === ' ' ? ' sp' : ''}">${c === ' ' ? ' ' : esc(c)}</span>`).join('')}</div><div class="combo-pop"></div></div>
          <div class="tv-hint"${st.showHint ? '' : ' hidden'}></div>
          <div class="tv-kbwrap"${st.showKeyboard ? '' : ' hidden'}>
            <div class="tv-kb"></div>
            <div class="tv-hands"${st.showHands ? '' : ' hidden'}></div>
          </div>
          <div class="tv-blindnote"${st.showKeyboard ? ' hidden' : ''}>🙈 <b>Profi-Modus:</b> Die Bildschirm-Tastatur ist ausgeblendet – in Lektionen gibt es dafür +25 % XP.</div>
        </div>`;
      const root = container.firstElementChild;
      const q = (s) => root.querySelector(s);
      const spans = Array.from(root.querySelectorAll('.ch'));
      const box = q('.textbox');
      const textEl = q('.text');
      const progEl = q('.progress i');
      const accEl = q('[data-s=acc]');
      const zpmEl = q('[data-s=zpm]');
      const comboEl = q('[data-s=combo]');
      const comboChip = q('.chip.combo');
      const comboPop = q('.combo-pop');
      const hintEl = q('.tv-hint');
      const capsEl = q('.caps-warn');
      const wrap = q('.tv-kbwrap');
      const kbBtn = q('[data-act=kb]');
      const blindNote = q('.tv-blindnote');
      const kb = BT.KB.create(q('.tv-kb'), { colored: true });
      const hands = BT.Hands.create(q('.tv-hands'));
      let lastTop = -1;

      function syncKbButton() {
        kbBtn.textContent = st.showKeyboard ? '🙈 Tastatur aus' : '👀 Tastatur an';
        kbBtn.title = st.showKeyboard ? 'Bildschirm-Tastatur ausblenden (Profi-Modus, +25 % XP in Lektionen)' : 'Bildschirm-Tastatur wieder einblenden';
        blindNote.hidden = st.showKeyboard;
      }
      kbBtn.addEventListener('click', () => {
        st.showKeyboard = !st.showKeyboard;
        BT.Store.save();
        wrap.hidden = !st.showKeyboard;
        syncKbButton();
        kbBtn.blur();
        if (opts.onKbToggle) opts.onKbToggle(st.showKeyboard);
      });
      syncKbButton();

      function scrollToCur() {
        const cur = spans[typer.pos] || spans[spans.length - 1];
        if (!cur) return;
        const top = cur.offsetTop;
        if (top === lastTop) return;
        lastTop = top;
        const lh = parseFloat(getComputedStyle(textEl).lineHeight) || cur.offsetHeight || 40;
        const pt = parseFloat(getComputedStyle(box).paddingTop) || 0;
        const lineTop = top - (lh - cur.offsetHeight) / 2;
        const visible = Math.floor((box.clientHeight - 2 * pt) / lh + 0.1);
        box.scrollTo({ top: Math.max(0, Math.round(lineTop - pt - (visible >= 3 ? lh : 0))), behavior: 'smooth' });
      }

      function update() {
        const pos = typer.pos;
        if (spans[pos]) spans[pos].classList.add('cur');
        progEl.style.width = (pos / chars.length) * 100 + '%';
        accEl.textContent = Math.round(typer.accuracy * 100) + ' %';
        zpmEl.textContent = Math.round(typer.zpm);
        comboEl.textContent = typer.combo;
        comboChip.classList.toggle('hot', typer.combo >= 20);
        const next = typer.done ? null : chars[pos];
        kb.highlight(next);
        hands.highlight(next != null ? BT.fingersFor(next) : []);
        hintEl.innerHTML = next != null ? BT.hintHtml(next) : '✅ Geschafft!';
        scrollToCur();
      }

      function showCombo(n) {
        comboPop.textContent = `🔥 ${n} am Stück!`;
        comboPop.classList.remove('show');
        void comboPop.offsetWidth;
        comboPop.classList.add('show');
      }

      function handleKey(e) {
        if (e.getModifierState) capsEl.hidden = !e.getModifierState('CapsLock');
        const ch = BT.keyChar(e);
        if (ch === null) return false;
        e.preventDefault();
        if (e.repeat || typer.done) return true;
        const before = typer.pos;
        const r = typer.input(ch);
        if (r === 'bad') {
          const sp = spans[typer.pos];
          sp.classList.remove('err');
          void sp.offsetWidth;
          sp.classList.add('err');
          kb.flash(ch, false);
          BT.Sound.error();
        } else {
          const sp = spans[before];
          sp.classList.remove('cur', 'err');
          sp.classList.add('done');
          if (typer.errPos.has(before)) sp.classList.add('fixed');
          kb.flash(ch, true);
          BT.Sound.key();
          if (typer.combo > 0 && typer.combo % 25 === 0) { showCombo(typer.combo); BT.Sound.small(); }
        }
        update();
        if (r === 'done' && opts.onDone) opts.onDone(typer.result());
        return true;
      }

      update();
      return { typer, handleKey, kb, hands, root };
    },
  };

  /* ---------- Vollbild-Tippseite (Lektionen, Training) ---------- */
  BT.TypingScreen = function (o) {
    const main = document.getElementById('main');
    const dots = o.dots
      ? `<div class="round-dots">${Array.from({ length: o.dots.total }, (_, i) => `<i class="${i < o.dots.current ? 'done' : (i === o.dots.current ? 'cur' : '')}"></i>`).join('')}</div>`
      : '';
    main.innerHTML = `
      <section class="typing-screen">
        <div class="ts-head">
          <button class="btn ghost" data-act="exit">✕ <span>Beenden</span></button>
          <div class="ts-title"><h1>${o.title}</h1><div class="ts-sub">${o.sub || ''}</div></div>
          <div class="ts-right">${dots}<button class="btn ghost" data-act="pause">⏸ <span>Pause</span></button></div>
        </div>
        <div class="ts-view"></div>
        <div class="ts-foot">Augen auf den Bildschirm, nicht auf die Finger! · <kbd>Esc</kbd> = Pause</div>
      </section>`;
    const view = BT.TypingView.create(main.querySelector('.ts-view'), o.text, { onDone: o.onDone, onKbToggle: o.onKbToggle });

    const pause = () => {
      const card = BT.App.modal(`
        <div class="big-emoji">⏸️</div>
        <h2>Pause</h2>
        <p>Kurz durchatmen und die Hände ausschütteln!</p>
        <div class="modal-actions col">
          <button class="btn primary big" data-primary data-close>▶ Weiter <kbd>Enter</kbd></button>
          ${o.onRestart ? '<button class="btn secondary" data-act="restart">↻ Runde neu starten</button>' : ''}
          <button class="btn ghost" data-act="quit">✕ Beenden</button>
        </div>`);
      const rs = card.querySelector('[data-act=restart]');
      if (rs) rs.onclick = () => { BT.App.closeModal(); o.onRestart(); };
      card.querySelector('[data-act=quit]').onclick = () => { BT.App.closeModal(); o.onExit(); };
    };
    main.querySelector('[data-act=exit]').onclick = () => o.onExit();
    main.querySelector('[data-act=pause]').onclick = (e) => { e.currentTarget.blur(); pause(); };
    BT.App.keyHandler = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); pause(); return true; }
      return view.handleKey(e);
    };
    return view;
  };
})(window.BT);
