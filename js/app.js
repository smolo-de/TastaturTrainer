'use strict';
/* BlindTrainer – App-Kern, Navigation, Profile, Startseite, Lernpfad, Lektionen */
(function (BT) {
  const esc = BT.esc;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const P = () => BT.Store.profile;
  const Pr = BT.Progress;
  const pct = (a) => Math.round(a * 100) + ' %';
  const int = (n) => Math.round(n).toLocaleString('de-DE');
  const isEditable = (el) => !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
  const starsHtml = (n, total = 3) => `<span class="stars">${Array.from({ length: total }, (_, i) => `<i class="${i < n ? 'on' : ''}">★</i>`).join('')}</span>`;
  const rstat = (v, l) => `<div class="rstat"><b>${v}</b><span>${l}</span></div>`;
  const main = () => $('#main');

  BT.ui = { $, $$, esc, pick, pct, int, starsHtml, rstat, P };

  const S = BT.Screens = {};
  const NO_PROFILE_OK = new Set(['profiles']);

  const App = BT.App = {
    keyHandler: null,
    cleanup: null,
    current: null,
    readyAt: 0,
    modalOpen: false,
    modalOnKey: null,
    modalClosable: true,

    init() {
      BT.Store.load();
      document.addEventListener('keydown', (e) => this.onKeyDown(e));
      document.addEventListener('click', (e) => this.onClick(e));
      document.addEventListener('pointerdown', () => BT.Sound.unlock());
      Pr.onGoal = () => { this.toast('🥇 <b>Tagesziel erreicht!</b> Super, weiter so!'); BT.Sound.success(); };
      this.applySettings();
      this.go(P() ? 'home' : 'profiles');
      if (!BT.Store.persistOk) this.toast('⚠️ Dein Browser erlaubt kein Speichern. Der Fortschritt geht beim Schließen verloren.', 7000);
    },

    applySettings() {
      const p = P();
      const st = p ? p.settings : { theme: 'light', textSize: 'm' };
      document.documentElement.dataset.theme = st.theme === 'dark' ? 'dark' : 'light';
      document.body.dataset.ts = st.textSize || 'm';
    },

    go(name, ...args) {
      if (!S[name]) { console.error('Unbekannte Seite:', name); return; }
      if (!P() && !NO_PROFILE_OK.has(name)) name = 'profiles';
      if (this.cleanup) { try { this.cleanup(); } catch (err) { console.error(err); } }
      this.cleanup = null;
      this.keyHandler = null;
      this.closeModal();
      this.current = name;
      this.readyAt = performance.now() + 300;
      const m = main();
      m.className = 'screen-' + name;
      m.innerHTML = '';
      window.scrollTo(0, 0);
      S[name](...args);
      this.renderTop();
      const ae = document.activeElement;
      if (ae && ae !== document.body && !isEditable(ae)) ae.blur();
    },

    renderTop() {
      const tb = $('#topbar');
      const p = P();
      if (!p || this.current === 'profiles') {
        tb.innerHTML = '<div class="brand"><span class="brand-ic">⌨️</span><span>BlindTrainer</span></div>';
        return;
      }
      const lv = Pr.levelInfo(p.xp);
      tb.innerHTML = `
        <button class="brand" data-go="home" title="Startseite"><span class="brand-ic">⌨️</span><span>BlindTrainer</span></button>
        <div class="tb-stats">
          <span class="chip" title="Gesammelte Sterne">⭐ <b>${Pr.totalStars(p)}</b></span>
          <span class="chip" title="Tage hintereinander geübt">🔥 <b>${Pr.streak(p)}</b></span>
          <span class="tb-level" title="${esc(lv.title)} – ${lv.into} von ${lv.need} XP">
            <span class="lv-pill">Lv ${lv.level}</span><span class="xpbar"><i style="width:${lv.pct}%"></i></span>
          </span>
          <button class="icon-btn" id="tb-sound" title="Ton an/aus">${p.settings.sound ? '🔊' : '🔇'}</button>
          <button class="profile-btn" data-go="profiles" title="Profil wechseln"><span class="av">${p.avatar}</span><span class="pn">${esc(p.name)}</span></button>
        </div>`;
      $('#tb-sound').onclick = (e) => {
        p.settings.sound = !p.settings.sound;
        BT.Store.save();
        e.currentTarget.textContent = p.settings.sound ? '🔊' : '🔇';
        e.currentTarget.blur();
        if (p.settings.sound) { BT.Sound.unlock(); BT.Sound.ok(); }
      };
    },

    /* ---------- Overlays ---------- */
    modal(html, opts = {}) {
      const root = $('#modal-root');
      root.innerHTML = `<div class="modal-backdrop"><div class="modal-card ${opts.cls || ''}" role="dialog" aria-modal="true">${html}</div></div>`;
      this.modalOpen = true;
      this.modalOnKey = opts.onKey || null;
      this.modalClosable = opts.closable !== false;
      this.readyAt = performance.now() + (opts.delay != null ? opts.delay : 450);
      const bd = root.firstElementChild;
      bd.addEventListener('mousedown', (e) => { if (e.target === bd && this.modalClosable) this.closeModal(); });
      const ae = document.activeElement;
      if (ae && ae !== document.body) ae.blur();
      return bd.firstElementChild;
    },

    closeModal() {
      const root = $('#modal-root');
      if (root) root.innerHTML = '';
      this.modalOpen = false;
      this.modalOnKey = null;
    },

    toast(html, ms = 2800) {
      const el = document.createElement('div');
      el.className = 'toast';
      el.innerHTML = html;
      $('#toast-root').appendChild(el);
      requestAnimationFrame(() => el.classList.add('show'));
      setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, ms);
    },

    confetti() {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const root = document.createElement('div');
      root.className = 'confetti';
      const colors = ['#ff5d8f', '#ffb443', '#ffe14d', '#4cd97b', '#4cb7ff', '#9b6bff'];
      for (let i = 0; i < 90; i++) {
        const s = document.createElement('i');
        s.style.left = Math.random() * 100 + '%';
        s.style.background = pick(colors);
        s.style.animationDelay = Math.random() * 0.6 + 's';
        s.style.animationDuration = 2 + Math.random() * 1.6 + 's';
        s.style.setProperty('--dx', Math.random() * 240 - 120 + 'px');
        s.style.setProperty('--r', Math.random() * 900 + 'deg');
        root.appendChild(s);
      }
      document.body.appendChild(root);
      setTimeout(() => root.remove(), 4400);
    },

    /* ---------- Eingaben ---------- */
    onKeyDown(e) {
      BT.Sound.unlock();
      if (this.modalOpen) {
        if (this.modalOnKey && this.modalOnKey(e) === true) return;
        if (isEditable(e.target)) return;
        if (e.key === 'Enter') {
          e.preventDefault();
          if (performance.now() >= this.readyAt && !e.repeat) {
            const b = $('#modal-root [data-primary]');
            if (b) b.click();
          }
        } else if (e.key === 'Escape') {
          if (this.modalClosable) this.closeModal();
        } else if (e.key === ' ' || e.key.length === 1) {
          e.preventDefault();
        }
        return;
      }
      if (this.keyHandler && this.keyHandler(e) === true) return;
      if (isEditable(e.target)) return;
      if (e.key === 'Enter') {
        const b = $('#main [data-primary]');
        if (b && !b.disabled) {
          e.preventDefault();
          if (performance.now() >= this.readyAt && !e.repeat) b.click();
        }
      }
    },

    onClick(e) {
      const close = e.target.closest('[data-close]');
      if (close) this.closeModal();
      const g = e.target.closest('[data-go]');
      if (g && !g.disabled) {
        e.preventDefault();
        const a = g.dataset.arg;
        this.go(g.dataset.go, a !== undefined ? Number(a) : undefined);
      }
    },

    /* ---------- Belohnungen ---------- */
    rewardsHtml(s) {
      let h = '';
      if (s.levelUp) h += `<div class="reward levelup">🎉 <b>Level ${s.level}</b> erreicht: ${esc(Pr.levelTitle(s.level))}!</div>`;
      if (s.newAvatars && s.newAvatars.length) {
        h += `<div class="reward">Neue Tiere freigeschaltet: <span class="reward-av">${s.newAvatars.map((a) => a.e).join(' ')}</span> <button class="link" data-go="trophies">Jetzt auswählen</button></div>`;
      }
      if (s.ach && s.ach.length) {
        h += `<div class="reward-ach"><h3>Neue Abzeichen!</h3>${s.ach.map((a) => `
          <div class="ach-mini"><span class="ach-ic">${a.icon}</span><div><b>${esc(a.title)}</b><small>${esc(a.desc)}</small></div></div>`).join('')}</div>`;
      }
      return h;
    },

    /* ---------- Profile ---------- */
    newProfileModal() {
      const starters = BT.AVATARS.filter((a) => a.lvl <= 1);
      let chosen = starters[0].e;
      const card = this.modal(`
        <h2>Neues Profil</h2>
        <label class="field"><span>Wie heißt du?</span><input id="np-name" maxlength="16" autocomplete="off" placeholder="Dein Name"></label>
        <div class="field"><span>Wähle dein Tier:</span>
          <div class="avatar-pick">${starters.map((a, i) => `<button class="av-opt${i === 0 ? ' sel' : ''}" data-av="${a.e}">${a.e}</button>`).join('')}</div>
          <p class="hint">Weitere Tiere schaltest du mit höheren Levels frei!</p>
        </div>
        <div class="modal-actions">
          ${Object.keys(BT.Store.data.profiles).length ? '<button class="btn ghost" data-close>Abbrechen</button>' : ''}
          <button class="btn primary" data-primary id="np-ok">Los geht's!</button>
        </div>`, { closable: Object.keys(BT.Store.data.profiles).length > 0 });
      const input = $('#np-name', card);
      setTimeout(() => input.focus(), 60);
      $$('.av-opt', card).forEach((b) => {
        b.onclick = () => {
          $$('.av-opt', card).forEach((x) => x.classList.remove('sel'));
          b.classList.add('sel');
          chosen = b.dataset.av;
        };
      });
      const ok = () => {
        const name = input.value.trim();
        if (!name) {
          input.classList.remove('shake'); void input.offsetWidth; input.classList.add('shake');
          input.focus();
          return;
        }
        BT.Store.create(name, chosen);
        this.closeModal();
        this.applySettings();
        this.go('home');
        setTimeout(() => this.welcomeModal(), 300);
      };
      $('#np-ok', card).onclick = ok;
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); ok(); } });
    },

    welcomeModal() {
      const p = P();
      this.modal(`
        <div class="big-emoji">🦉</div>
        <h2>Hallo ${esc(p.name)}!</h2>
        <p>Ich bin <b>Professor Uhu</b> und begleite dich auf deinem Tipp-Abenteuer.</p>
        <p>Bevor es losgeht: Schau dir kurz an, wie das 10-Finger-System funktioniert. Das dauert nur zwei Minuten!</p>
        <div class="modal-actions">
          <button class="btn ghost" data-go="lessonIntro" data-arg="0">Gleich loslegen</button>
          <button class="btn primary big" data-primary data-go="guide">📖 So geht's</button>
        </div>`);
    },

    /* ---------- Lektionen ---------- */
    startLesson(idx) {
      const state = { idx, texts: BT.Gen.lessonTexts(idx), rounds: [], blind: true };
      this.go('lessonRound', idx, 0, state);
    },
  };

  /* =================== Seiten =================== */

  S.profiles = () => {
    const ps = Object.values(BT.Store.data.profiles).sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));
    main().innerHTML = `
      <section class="center-wrap">
        <div class="welcome">
          <div class="mascot bounce">🦉</div>
          <h1>Willkommen beim BlindTrainer!</h1>
          <p class="lead">Lerne das 10-Finger-System – Schritt für Schritt, mit Spielen, Sternen und Abzeichen.</p>
        </div>
        <h2 class="section-title">Wer übt heute?</h2>
        <div class="profile-grid">
          ${ps.map((p) => {
            const lv = Pr.levelInfo(p.xp);
            return `<button class="profile-card" data-pid="${p.id}">
                <span class="av">${p.avatar}</span>
                <span class="pname">${esc(p.name)}</span>
                <span class="psub">Level ${lv.level} · ⭐ ${Pr.totalStars(p)}</span>
              </button>`;
          }).join('')}
          <button class="profile-card new" id="new-profile"><span class="av">＋</span><span class="pname">Neues Profil</span><span class="psub">Für jedes Kind eins</span></button>
        </div>
        <p class="footnote">Alle Daten bleiben auf diesem Computer. Es wird nichts ins Internet geschickt.</p>
      </section>`;
    $$('.profile-card[data-pid]').forEach((b) => {
      b.onclick = () => { BT.Store.activate(b.dataset.pid); App.applySettings(); App.go('home'); };
    });
    $('#new-profile').onclick = () => App.newProfileModal();
    if (!ps.length) setTimeout(() => App.newProfileModal(), 200);
  };

  function ring(frac) {
    const r = 42, c = 2 * Math.PI * r;
    const f = Math.max(0, Math.min(1, frac));
    return `<svg class="ring" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="${r}" class="ring-bg"/>
      <circle cx="50" cy="50" r="${r}" class="ring-fg${f >= 1 ? ' full' : ''}" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - f)).toFixed(1)}" transform="rotate(-90 50 50)"/>
      <text x="50" y="58" text-anchor="middle">${f >= 1 ? '✓' : Math.round(f * 100) + '%'}</text>
    </svg>`;
  }

  const tile = (go, icon, title, sub) => `<button class="tile" data-go="${go}"><span class="tile-ic">${icon}</span><span class="tile-t">${title}</span><span class="tile-s">${sub}</span></button>`;

  S.home = () => {
    const p = P();
    const next = Pr.nextLesson(p);
    const lv = Pr.levelInfo(p.xp);
    const today = Pr.todayRec(p);
    const goalMin = p.settings.dailyGoal;
    const min = today.sec / 60;
    const streak = Pr.streak(p);
    const isNew = !Object.keys(p.lessons).length;
    const achCount = Object.keys(p.achievements).length;
    const L = next !== null ? BT.LESSONS[next] : null;
    let msg;
    if (isNew && !p.flags.guideDone) msg = `Hallo <b>${esc(p.name)}</b>! Schön, dass du da bist. Schau dir zuerst <b>„So geht's“</b> an – dann starten wir mit Lektion 1!`;
    else if (next === null) msg = `Wow, <b>${esc(p.name)}</b>! Du hast alle Lektionen geschafft. Sammle jetzt alle Sterne oder fordere die Tiere im Rennen heraus!`;
    else msg = `${pick(['Hallo', 'Hi', 'Hey', 'Schön, dich zu sehen'])}, <b>${esc(p.name)}</b>! <span class="tip">💡 ${pick(BT.TIPS)}</span>`;

    main().innerHTML = `
      <section class="home">
        <div class="home-top">
          <div class="card hero">
            <div class="hero-mascot"><span class="mascot bounce">🦉</span></div>
            <div class="hero-body">
              <div class="bubble">${msg}</div>
              <div class="hero-actions">
                ${L ? `<button class="btn primary big" data-go="lessonIntro" data-arg="${next}" data-primary>▶ Lektion ${next + 1}: ${esc(L.title)}</button>`
                    : '<button class="btn primary big" data-go="map" data-primary>🗺️ Zum Lernpfad</button>'}
                ${isNew && !p.flags.guideDone ? '<button class="btn secondary big" data-go="guide">📖 So geht\'s</button>' : ''}
              </div>
            </div>
          </div>
          <div class="card goal-card">
            ${ring(min / goalMin)}
            <div class="goal-text"><b>Tagesziel</b><span>${Math.floor(min)} von ${goalMin} Minuten</span></div>
            <div class="goal-streak">🔥 <b>${streak}</b> ${streak === 1 ? 'Tag' : 'Tage'} in Folge</div>
          </div>
        </div>
        <div class="card level-card">
          <div class="lv-badge">${lv.level}</div>
          <div class="lv-body">
            <div class="lv-title">${esc(lv.title)}</div>
            <div class="xpbar big"><i style="width:${lv.pct}%"></i></div>
            <div class="lv-sub">${int(lv.into)} / ${int(lv.need)} XP bis Level ${lv.level + 1}</div>
          </div>
          <div class="lv-side"><span>⭐ ${Pr.totalStars(p)} / ${BT.LESSONS.length * 3}</span><span>🏆 ${achCount} / ${BT.ACHIEVEMENTS.length}</span></div>
        </div>
        <div class="tiles">
          ${tile('map', '🗺️', 'Lernpfad', 'Alle Lektionen und Welten')}
          ${tile('games', '🎮', 'Spiele', 'Tasten-Blitz, Wort-Regen, Tier-Rennen')}
          ${tile('training', '🏋️', 'Training', 'Schwache Tasten gezielt üben')}
          ${tile('guide', '📖', 'So geht\'s', 'Grundstellung & Profi-Tipps')}
          ${tile('trophies', '🏆', 'Erfolge', `${achCount} von ${BT.ACHIEVEMENTS.length} Abzeichen`)}
          ${tile('stats', '📊', 'Statistik', 'Wie schnell bist du?')}
          ${tile('settings', '⚙️', 'Einstellungen', 'Ton, Anzeige, Eltern')}
        </div>
      </section>`;
  };

  /* ---------- Lernpfad ---------- */
  S.map = () => {
    const p = P();
    const next = Pr.nextLesson(p);
    const node = (L, i) => {
      const st = Pr.stars(p, i);
      const unl = Pr.isUnlocked(p, i);
      const cls = !unl ? 'locked' : (i === next ? 'current' : (st > 0 ? 'done' : 'open'));
      return `<button class="node ${cls}" data-i="${i}">
          <span class="node-circle">${unl ? i + 1 : '🔒'}</span>
          ${starsHtml(st)}
          <span class="node-title">${esc(L.title)}</span>
        </button>`;
    };
    main().innerHTML = `
      <section class="map">
        <div class="page-head"><h1>🗺️ Lernpfad</h1><p>Schaffe jede Lektion mit mindestens einem Stern, um die nächste freizuschalten.</p></div>
        ${BT.WORLDS.map((w) => {
          const ls = BT.LESSONS.map((L, i) => ({ L, i })).filter((x) => x.L.world === w.id);
          const got = ls.reduce((s, x) => s + Pr.stars(p, x.i), 0);
          const locked = !Pr.isUnlocked(p, ls[0].i);
          return `<div class="card world${locked ? ' locked' : ''}" style="--wc:${w.color}">
              <div class="world-head">
                <span class="world-icon">${w.icon}</span>
                <div class="world-name"><h2>${w.name}</h2><p>${w.desc}</p></div>
                <span class="world-stars">⭐ ${got} / ${ls.length * 3}</span>
              </div>
              <div class="path">${ls.map(({ L, i }) => node(L, i)).join('')}</div>
            </div>`;
        }).join('')}
      </section>`;
    $$('.node').forEach((n) => {
      n.onclick = () => {
        const i = Number(n.dataset.i);
        if (!Pr.isUnlocked(p, i)) {
          App.toast('🔒 Schaffe zuerst die Lektion davor!');
          n.classList.remove('shake'); void n.offsetWidth; n.classList.add('shake');
          BT.Sound.error();
          return;
        }
        App.go('lessonIntro', i);
      };
    });
    const cur = $('.node.current');
    if (cur) setTimeout(() => cur.scrollIntoView({ block: 'center', behavior: 'smooth' }), 150);
  };

  /* ---------- Lektion: Einführung ---------- */
  function lessonFingers(L) {
    if (L.type === 'shift') return ['LP', 'RP'];
    if (L.type === 'numbers' || L.type === 'sentences') return ['LP', 'LR', 'LM', 'LI', 'RI', 'RM', 'RR', 'RP'];
    const set = new Set();
    L.keys.forEach((k) => BT.fingersFor(k).forEach((f) => set.add(f)));
    return [...set];
  }

  function keyInfo(L) {
    if (L.type === 'shift') {
      return [
        '<li><span class="kcap fc-pinky">⇧</span><span>links: <b>linker kleiner Finger</b> – für Buchstaben der rechten Hand (H, J, K, L …)</span></li>',
        '<li><span class="kcap fc-pinky">⇧</span><span>rechts: <b>rechter kleiner Finger</b> – für Buchstaben der linken Hand (A, S, D, F …)</span></li>',
      ];
    }
    if (L.type === 'sentences') return ['<li>🏆 Alle Buchstaben, Satzzeichen und Großschreibung</li>'];
    return L.keys.map((k) => {
      const m = BT.CHAR_MAP[k];
      const f = BT.FINGERS[m.key.finger];
      const name = BT.KEY_NAMES[k] ? ` <small>(${BT.KEY_NAMES[k]})</small>` : '';
      if (m.shift) {
        const sf = BT.FINGERS[BT.shiftFor(m.key).finger];
        return `<li><span class="kcap fc-${f.type}">${esc(k)}</span><span>${name} = ⇧ + ${esc(BT.keyLabel(m.key.base))} – <b>${f.name}</b>, ⇧ mit dem ${sf.dat}</span></li>`;
      }
      return `<li><span class="kcap fc-${f.type}">${esc(BT.keyLabel(k))}</span><span><b>${f.name}</b>${name}</span></li>`;
    });
  }

  S.lessonIntro = (idx) => {
    const p = P();
    idx = Number(idx) || 0;
    const L = BT.LESSONS[idx];
    if (!L) return App.go('map');
    if (!Pr.isUnlocked(p, idx)) { App.toast('🔒 Diese Lektion ist noch gesperrt.'); return App.go('map'); }
    const w = BT.WORLDS[L.world];
    const rec = p.lessons[idx];
    const target = Pr.speedTarget(idx);
    const big = L.type === 'shift' ? ['⇧'] : (L.type === 'sentences' ? ['Aa', '!?'] : L.keys.map(BT.keyLabel));
    main().innerHTML = `
      <section class="lesson-intro">
        <div class="sub-head">
          <button class="btn ghost" data-go="map">← Lernpfad</button>
          <span class="world-tag" style="--wc:${w.color}">${w.icon} ${w.name} · Lektion ${idx + 1} von ${BT.LESSONS.length}</span>
          ${rec ? `<span class="best">Bisher: ${starsHtml(rec.stars)}</span>` : ''}
        </div>
        <div class="card intro-card">
          <div class="intro-top">
            <div class="bigkeys${big.length > 3 ? ' many' : ''}">${big.map((b) => `<span class="bigkey">${esc(b)}</span>`).join('')}</div>
            <div class="intro-text">
              <h1>${esc(L.title)}</h1>
              <p>${L.intro}</p>
              <ul class="finger-list${L.keys.length > 4 ? ' cols' : ''}">${keyInfo(L).join('')}</ul>
            </div>
          </div>
          <div class="intro-visual"><div class="intro-kb"></div><div class="intro-hands"></div></div>
          <div class="try-line">⌨️ Probier es aus: Drück die neuen Tasten auf deiner Tastatur!</div>
          <div class="intro-bottom">
            <div class="mascot-tip"><span class="mascot">🦉</span><div class="bubble small">${L.tip}</div></div>
            <div class="intro-go">
              <div class="star-req">
                <span>${starsHtml(1)} ab 80 % richtig</span>
                <span>${starsHtml(2)} ab 90 %</span>
                <span>${starsHtml(3)} ab 96 % und ${target} Zeichen/Min.</span>
              </div>
              <button class="btn primary big" id="start-lesson" data-primary>Los geht's! <kbd>Enter</kbd></button>
            </div>
          </div>
        </div>
      </section>`;
    const kb = BT.KB.create($('.intro-kb'), { colored: true });
    kb.markLesson(idx);
    const hands = BT.Hands.create($('.intro-hands'));
    const base = lessonFingers(L);
    hands.highlight(base);
    $('#start-lesson').onclick = () => App.startLesson(idx);
    const tryLine = $('.try-line');
    const newChars = new Set(L.keys);
    let t = null;
    App.keyHandler = (e) => {
      const ch = BT.keyChar(e);
      if (ch === null) return false;
      e.preventDefault();
      const m = BT.CHAR_MAP[ch];
      if (!m) return true;
      kb.flash(ch, true);
      hands.highlight(BT.fingersFor(ch));
      const label = ch === ' ' ? 'die Leertaste' : `<span class="kcap">${esc(ch)}</span>`;
      tryLine.innerHTML = (newChars.has(ch) ? '👍 Super! Das war ' : 'Das war ') + label + ' – ' + BT.fingerText(ch);
      clearTimeout(t);
      t = setTimeout(() => hands.highlight(base), 1400);
      return true;
    };
    App.cleanup = () => clearTimeout(t);
  };

  /* ---------- Lektion: Runde ---------- */
  S.lessonRound = (idx, r, state) => {
    if (!state) return App.startLesson(idx);
    const L = BT.LESSONS[idx];
    const t = state.texts[r];
    if (P().settings.showKeyboard) state.blind = false;
    BT.TypingScreen({
      title: `Lektion ${idx + 1}: ${esc(L.title)}`,
      sub: `Runde ${r + 1} von 3 · ${esc(t.label)}`,
      dots: { total: 3, current: r },
      text: t.text,
      onKbToggle: (shown) => { if (shown) state.blind = false; },
      onExit: () => App.go('lessonIntro', idx),
      onRestart: () => App.go('lessonRound', idx, r, state),
      onDone: (res) => {
        state.rounds.push(res);
        Pr.recordRound(P(), res, { kind: 'lesson', label: `Lektion ${idx + 1} · Runde ${r + 1}` });
        App.keyHandler = (e) => { if (BT.keyChar(e) !== null) e.preventDefault(); return true; };
        if (r === 2) {
          setTimeout(() => {
            const summary = Pr.finishLesson(P(), idx, state.rounds, state.blind);
            App.go('lessonResult', summary);
          }, 350);
          return;
        }
        BT.Sound.small();
        setTimeout(() => {
          App.modal(`
            <div class="round-done">
              <div class="big-emoji">${res.wrong === 0 ? '💯' : '🎯'}</div>
              <h2>Runde ${r + 1} geschafft!</h2>
              <div class="rstats">${rstat(pct(res.acc), 'richtig')}${rstat(Math.round(res.zpm), 'Zeichen/Min')}${rstat(res.wrong, 'Fehler')}</div>
              <p class="praise">${Pr.praise(res.acc)}</p>
              <div class="modal-actions"><button class="btn primary big" data-primary id="next-round">Weiter zu Runde ${r + 2} <kbd>Enter</kbd></button></div>
            </div>`, { closable: false, delay: 500 });
          $('#next-round').onclick = () => App.go('lessonRound', idx, r + 1, state);
        }, 300);
      },
    });
  };

  /* ---------- Lektion: Ergebnis ---------- */
  S.lessonResult = (s) => {
    if (!s) return App.go('map');
    const L = BT.LESSONS[s.idx];
    const hasNext = s.idx + 1 < BT.LESSONS.length;
    const lv = Pr.levelInfo(P().xp);
    const head = s.passed ? (s.stars === 3 ? 'Perfekt!' : 'Lektion geschafft!') : 'Fast geschafft!';
    let msg;
    if (!s.passed) msg = 'Für einen Stern brauchst du mindestens 80 % richtige Anschläge. Tipp: Tippe etwas langsamer und schau auf den Bildschirm – du schaffst das!';
    else if (s.stars < 3 && s.acc >= 0.96) msg = `Super genau! Für den dritten Stern brauchst du noch etwas mehr Tempo: ${Pr.speedTarget(s.idx)} Zeichen pro Minute.`;
    else if (s.stars < 3) msg = `${Pr.praise(s.acc)} Für mehr Sterne: noch genauer tippen!`;
    else msg = Pr.praise(s.acc);
    let actions;
    if (s.passed && hasNext) {
      actions = `<button class="btn secondary" id="again">↻ Nochmal</button>
        <button class="btn primary big" data-primary data-go="lessonIntro" data-arg="${s.idx + 1}">Nächste Lektion ▶</button>
        <button class="btn ghost" data-go="map">🗺️ Lernpfad</button>`;
    } else if (s.passed) {
      actions = `<button class="btn secondary" id="again">↻ Nochmal</button>
        <button class="btn primary big" data-primary data-go="map">🗺️ Lernpfad</button>`;
    } else {
      actions = `<button class="btn primary big" data-primary id="again">↻ Nochmal versuchen</button>
        <button class="btn ghost" data-go="map">🗺️ Lernpfad</button>`;
    }
    main().innerHTML = `
      <section class="result">
        <div class="card result-card ${s.passed ? 'win' : 'fail'}">
          <div class="result-mascot ${s.passed ? 'bounce' : ''}">${s.passed ? '🦉' : '💪'}</div>
          <h1>${head}</h1>
          <p class="result-sub">Lektion ${s.idx + 1}: ${esc(L.title)}</p>
          <div class="stars-big">${[0, 1, 2].map((i) => `<span class="sb" data-i="${i}">★</span>`).join('')}</div>
          <div class="rstats">${rstat(pct(s.acc), 'richtig')}${rstat(Math.round(s.zpm), 'Zeichen/Min')}${rstat(s.wrong, 'Fehler')}</div>
          <p class="praise">${msg}</p>
          <div class="xp-gain">+${int(s.xp)} XP ${s.blind ? '<span class="tag">🙈 Blind-Bonus +25 %</span>' : ''}${s.firstPass ? '<span class="tag">🆕 Erstes Mal geschafft</span>' : ''}</div>
          <div class="xpbar big"><i style="width:${lv.pct}%"></i></div>
          <div class="lv-sub">Level ${lv.level} · ${esc(lv.title)} · ${int(lv.into)} / ${int(lv.need)} XP</div>
          <div class="result-actions">${actions}</div>
          ${App.rewardsHtml(s)}
        </div>
      </section>`;
    $('#again').onclick = () => App.startLesson(s.idx);
    const timers = [];
    for (let i = 0; i < s.stars; i++) {
      timers.push(setTimeout(() => { const el = $(`.sb[data-i="${i}"]`); if (el) el.classList.add('on'); BT.Sound.star(i); }, 450 + i * 450));
    }
    if (s.passed) { App.confetti(); BT.Sound.success(); } else BT.Sound.lose();
    if (s.levelUp) timers.push(setTimeout(() => BT.Sound.levelUp(), 700 + s.stars * 450));
    App.readyAt = performance.now() + 900;
    App.cleanup = () => timers.forEach(clearTimeout);
  };
})(window.BT);
