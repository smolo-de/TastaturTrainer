'use strict';
/* TastaturTrainer – App-Kern, Navigation, Profile, Startseite, Lernpfad, Lektionen */
(function (BT) {
  const esc = BT.esc;
  const t = (k, p) => BT.t(k, p);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const P = () => BT.Store.profile;
  const Pr = BT.Progress;
  const pct = (a) => Math.round(a * 100) + ' %';
  const int = (n) => BT.fmt.int(n);
  const isEditable = (el) => !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
  const starsHtml = (n, total = 3) => `<span class="stars">${Array.from({ length: total }, (_, i) => `<i class="${i < n ? 'on' : ''}">★</i>`).join('')}</span>`;
  const rstat = (v, l) => `<div class="rstat"><b>${v}</b><span>${l}</span></div>`;
  const main = () => $('#main');

  BT.ui = { $, $$, esc, pick, pct, int, starsHtml, rstat, P, t };

  const S = BT.Screens = {};
  const NO_PROFILE_OK = new Set(['profiles']);

  const App = BT.App = {
    keyHandler: null,
    cleanup: null,
    current: null,
    currentArgs: [],
    readyAt: 0,
    modalOpen: false,
    modalOnKey: null,
    modalClosable: true,

    init() {
      BT.Store.load();
      BT.setLang(BT.Store.currentLang());
      document.addEventListener('keydown', (e) => this.onKeyDown(e));
      document.addEventListener('click', (e) => this.onClick(e));
      document.addEventListener('pointerdown', () => BT.Sound.unlock());
      Pr.onGoal = () => { this.toast(t('toast.goal')); BT.Sound.success(); };
      this.applySettings();
      this.go(P() ? 'home' : 'profiles');
      if (!BT.Store.persistOk) this.toast(t('toast.noStorage'), 7000);
    },

    applySettings() {
      const p = P();
      const st = p ? p.settings : { theme: 'light', textSize: 'm' };
      document.documentElement.dataset.theme = st.theme === 'dark' ? 'dark' : 'light';
      document.body.dataset.ts = st.textSize || 'm';
    },

    /* Sprache wechseln: Texte, Kurs und Tastatur-Layout; aktuelle Seite neu aufbauen */
    switchLang(code) {
      BT.Store.setLang(code);
      BT.setLang(code);
      const name = ['profiles', 'settings'].includes(this.current) ? this.current : 'home';
      this.go(name);
    },
    langSwitchHtml() {
      return `<div class="seg lang-switch" role="group" aria-label="${esc(t('welcome.language'))}">${BT.langs().map((c) => {
        const m = BT.I18N[c].meta;
        return `<button class="${c === BT.lang ? 'on' : ''}" data-lang="${c}" title="${esc(m.keyboard)}"><span class="lang-code">${m.flag}</span> ${esc(m.name)}</button>`;
      }).join('')}</div>`;
    },
    bindLangSwitch(root) {
      $$('[data-lang]', root).forEach((b) => { b.onclick = () => { if (b.dataset.lang !== BT.lang) this.switchLang(b.dataset.lang); }; });
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
        tb.innerHTML = '<div class="brand"><span class="brand-ic">⌨️</span><span>TastaturTrainer</span></div>';
        return;
      }
      const lv = Pr.levelInfo(p.xp);
      tb.innerHTML = `
        <button class="brand" data-go="home" title="${esc(t('top.home'))}"><span class="brand-ic">⌨️</span><span>TastaturTrainer</span></button>
        <div class="tb-stats">
          <span class="chip" title="${esc(t('top.stars'))}">⭐ <b>${Pr.totalStars(p)}</b></span>
          <span class="chip" title="${esc(t('top.streak'))}">🔥 <b>${Pr.streak(p)}</b></span>
          <span class="tb-level" title="${esc(t('top.level', { title: lv.title, into: int(lv.into), need: int(lv.need) }))}">
            <span class="lv-pill">Lv ${lv.level}</span><span class="xpbar"><i style="width:${lv.pct}%"></i></span>
          </span>
          <button class="icon-btn" id="tb-sound" title="${esc(t('top.sound'))}">${p.settings.sound ? '🔊' : '🔇'}</button>
          <button class="profile-btn" data-go="profiles" title="${esc(t('top.switchProfile'))}"><span class="av">${esc(p.avatar)}</span><span class="pn">${esc(p.name)}</span></button>
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
      if (s.levelUp) h += `<div class="reward levelup">${t('reward.levelUp', { level: s.level, title: esc(Pr.levelTitle(s.level)) })}</div>`;
      if (s.newAvatars && s.newAvatars.length) {
        h += `<div class="reward">${t('reward.newAnimals')} <span class="reward-av">${s.newAvatars.map((a) => a.e).join(' ')}</span> <button class="link" data-go="trophies">${t('reward.choose')}</button></div>`;
      }
      if (s.ach && s.ach.length) {
        h += `<div class="reward-ach"><h3>${t('reward.newBadges')}</h3>${s.ach.map((a) => `
          <div class="ach-mini"><span class="ach-ic">${a.icon}</span><div><b>${esc(Pr.achTitle(a))}</b><small>${esc(Pr.achDesc(a))}</small></div></div>`).join('')}</div>`;
      }
      return h;
    },

    /* ---------- Profile ---------- */
    newProfileModal() {
      const starters = BT.AVATARS.filter((a) => a.lvl <= 1);
      let chosen = starters[0].e;
      const hasProfiles = Object.keys(BT.Store.data.profiles).length > 0;
      const card = this.modal(`
        <h2>${t('profile.title')}</h2>
        <label class="field"><span>${t('profile.name')}</span><input id="np-name" maxlength="16" autocomplete="off" placeholder="${esc(t('profile.namePh'))}"></label>
        <div class="field"><span>${t('profile.animal')}</span>
          <div class="avatar-pick">${starters.map((a, i) => `<button class="av-opt${i === 0 ? ' sel' : ''}" data-av="${a.e}">${a.e}</button>`).join('')}</div>
          <p class="hint">${t('profile.more')}</p>
        </div>
        <div class="modal-actions">
          ${hasProfiles ? `<button class="btn ghost" data-close>${t('common.cancel')}</button>` : ''}
          <button class="btn primary" data-primary id="np-ok">${t('profile.go')}</button>
        </div>`, { closable: hasProfiles });
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
        <h2>${t('hello.title', { name: esc(p.name) })}</h2>
        <p>${t('hello.intro', { mascot: t('app.mascot') })}</p>
        <p>${t('hello.guide')}</p>
        <div class="modal-actions">
          <button class="btn ghost" data-go="lessonIntro" data-arg="0">${t('hello.skip')}</button>
          <button class="btn primary big" data-primary data-go="guide">${t('hello.toGuide')}</button>
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
        <div class="lang-row">${App.langSwitchHtml()}</div>
        <div class="welcome">
          <div class="mascot bounce">🦉</div>
          <h1>${t('welcome.title')}</h1>
          <p class="lead">${t('welcome.lead')}</p>
        </div>
        <h2 class="section-title">${t('welcome.who')}</h2>
        <div class="profile-grid">
          ${ps.map((p) => `<button class="profile-card" data-pid="${esc(p.id)}">
                <span class="av">${esc(p.avatar)}</span>
                <span class="pname">${esc(p.name)}</span>
                <span class="psub">${t('welcome.profileSub', { level: Pr.levelFromXp(p.xp), stars: Object.values(p.lessons).reduce((s, r) => s + r.stars, 0) })}</span>
              </button>`).join('')}
          <button class="profile-card new" id="new-profile"><span class="av">＋</span><span class="pname">${t('welcome.newProfile')}</span><span class="psub">${t('welcome.newProfileSub')}</span></button>
        </div>
        <p class="footnote">${t('welcome.privacy')}</p>
      </section>`;
    App.bindLangSwitch(main());
    $$('.profile-card[data-pid]').forEach((b) => {
      b.onclick = () => {
        BT.Store.activate(b.dataset.pid);
        BT.setLang(BT.Store.currentLang());
        App.applySettings();
        App.go('home');
      };
    });
    $('#new-profile').onclick = () => App.newProfileModal();
    if (!ps.length) setTimeout(() => { if (App.current === 'profiles' && !App.modalOpen) App.newProfileModal(); }, 200);
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

  const tile = (go, icon, params) => {
    const [title, sub] = t('tile.' + go);
    return `<button class="tile" data-go="${go}"><span class="tile-ic">${icon}</span><span class="tile-t">${title}</span><span class="tile-s">${BT.tpl(sub, params)}</span></button>`;
  };

  S.home = () => {
    const p = P();
    const next = Pr.nextLesson(p);
    const lv = Pr.levelInfo(p.xp);
    const today = Pr.todayRec(p);
    const goalMin = p.settings.dailyGoal;
    const min = today.sec / 60;
    const streak = Pr.streak(p);
    const isNew = !BT.LESSONS.some((_, i) => Pr.rec(p, i));
    const achCount = Object.keys(p.achievements).length;
    const L = next !== null ? BT.LESSONS[next] : null;
    const name = esc(p.name);
    let msg;
    if (isNew && !p.flags.guideDone) msg = t('home.hiNew', { name });
    else if (next === null) msg = t('home.hiDone', { name });
    else msg = `${t('home.hi', { greeting: pick(t('home.greetings')), name })} <span class="tip">💡 ${pick(BT.TIPS)}</span>`;

    main().innerHTML = `
      <section class="home">
        <div class="home-top">
          <div class="card hero">
            <div class="hero-mascot"><span class="mascot bounce">🦉</span></div>
            <div class="hero-body">
              <div class="bubble">${msg}</div>
              <div class="hero-actions">
                ${L ? `<button class="btn primary big" data-go="lessonIntro" data-arg="${next}" data-primary>${t('home.continue', { n: next + 1, title: esc(L.title) })}</button>`
                    : `<button class="btn primary big" data-go="map" data-primary>${t('home.toMap')}</button>`}
                ${isNew && !p.flags.guideDone ? `<button class="btn secondary big" data-go="guide">${t('home.guide')}</button>` : ''}
              </div>
            </div>
          </div>
          <div class="card goal-card">
            ${ring(min / goalMin)}
            <div class="goal-text"><b>${t('home.goal')}</b><span>${t('home.goalOf', { min: Math.floor(min), goal: goalMin })}</span></div>
            <div class="goal-streak">${t('home.streak', { n: streak })}</div>
          </div>
        </div>
        <div class="card level-card">
          <div class="lv-badge">${lv.level}</div>
          <div class="lv-body">
            <div class="lv-title">${esc(lv.title)}</div>
            <div class="xpbar big"><i style="width:${lv.pct}%"></i></div>
            <div class="lv-sub">${t('home.xpTo', { into: int(lv.into), need: int(lv.need), next: lv.level + 1 })}</div>
          </div>
          <div class="lv-side"><span>⭐ ${Pr.totalStars(p)} / ${BT.LESSONS.length * 3}</span><span>🏆 ${achCount} / ${BT.ACHIEVEMENTS.length}</span></div>
        </div>
        <div class="tiles">
          ${tile('map', '🗺️')}
          ${tile('games', '🎮')}
          ${tile('training', '🏋️')}
          ${tile('guide', '📖')}
          ${tile('trophies', '🏆', { n: achCount, total: BT.ACHIEVEMENTS.length })}
          ${tile('stats', '📊')}
          ${tile('settings', '⚙️')}
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
        <div class="page-head"><h1>${t('map.title')}</h1><p>${t('map.lead')}</p></div>
        ${BT.WORLDS.map((w) => {
          const ls = BT.LESSONS.map((L, i) => ({ L, i })).filter((x) => x.L.world === w.id);
          const got = ls.reduce((s, x) => s + Pr.stars(p, x.i), 0);
          const locked = !Pr.isUnlocked(p, ls[0].i);
          return `<div class="card world${locked ? ' locked' : ''}" style="--wc:${w.color}">
              <div class="world-head">
                <span class="world-icon">${w.icon}</span>
                <div class="world-name"><h2>${esc(w.name)}</h2><p>${esc(w.desc)}</p></div>
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
          App.toast(t('toast.prevLesson'));
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
  const ALL_FINGERS = ['LP', 'LR', 'LM', 'LI', 'RI', 'RM', 'RR', 'RP'];
  function lessonFingers(L) {
    if (L.type === 'shift') return ['LP', 'RP'];
    if (L.type === 'numbers' || L.type === 'sentences' || L.type === 'review') return ALL_FINGERS;
    const set = new Set();
    L.keys.forEach((k) => BT.fingersFor(k).forEach((f) => set.add(f)));
    return [...set];
  }

  function keyInfo(L) {
    if (L.type === 'shift') {
      return [
        `<li><span class="kcap fc-pinky">⇧</span><span>${t('intro.shiftLeft', { finger: BT.FINGERS.LP.name })}</span></li>`,
        `<li><span class="kcap fc-pinky">⇧</span><span>${t('intro.shiftRight', { finger: BT.FINGERS.RP.name })}</span></li>`,
      ];
    }
    if (L.type === 'sentences' || L.type === 'review') return [`<li>${t('intro.allKeys')}</li>`];
    return L.keys.map((k) => {
      const m = BT.CHAR_MAP[k];
      const f = BT.FINGERS[m.key.finger];
      const name = BT.KEY_NAMES[k] ? ` <small>(${esc(BT.KEY_NAMES[k])})</small>` : '';
      if (m.shift) {
        const sf = BT.FINGERS[BT.shiftFor(m.key).finger];
        const combo = t('intro.shiftCombo', { base: esc(BT.keyLabel(m.key.base)), finger: f.name, withShift: t('finger.with', { f: sf.dat }) });
        return `<li><span class="kcap fc-${f.type}">${esc(k)}</span><span>${name} ${combo}</span></li>`;
      }
      return `<li><span class="kcap fc-${f.type}">${esc(BT.keyLabel(k))}</span><span><b>${f.name}</b>${name}</span></li>`;
    });
  }

  S.lessonIntro = (idx) => {
    const p = P();
    idx = Number(idx) || 0;
    const L = BT.LESSONS[idx];
    if (!L) return App.go('map');
    if (!Pr.isUnlocked(p, idx)) { App.toast(t('toast.lessonLocked')); return App.go('map'); }
    const w = BT.WORLDS[L.world];
    const rec = Pr.rec(p, idx);
    const target = Pr.speedTarget(idx);
    const big = L.type === 'shift' ? ['⇧'] : (L.type === 'sentences' ? ['Aa', '!?'] : (L.type === 'review' ? ['A–Z'] : L.keys.map(BT.keyLabel)));
    main().innerHTML = `
      <section class="lesson-intro">
        <div class="sub-head">
          <button class="btn ghost" data-go="map">${t('intro.back')}</button>
          <span class="world-tag" style="--wc:${w.color}">${w.icon} ${t('intro.tag', { world: esc(w.name), n: idx + 1, total: BT.LESSONS.length })}</span>
          ${rec ? `<span class="best">${t('intro.best')} ${starsHtml(rec.stars)}</span>` : ''}
        </div>
        <div class="card intro-card">
          <div class="intro-top">
            <div class="bigkeys${big.length > 3 ? ' many' : ''}">${big.map((b) => `<span class="bigkey${b.length > 2 ? ' wide' : ''}">${esc(b)}</span>`).join('')}</div>
            <div class="intro-text">
              <h1>${esc(L.title)}</h1>
              <p>${L.intro}</p>
              <ul class="finger-list${L.keys.length > 4 ? ' cols' : ''}">${keyInfo(L).join('')}</ul>
            </div>
          </div>
          <div class="intro-visual"><div class="intro-kb"></div><div class="intro-hands"></div></div>
          <div class="try-line">${t('intro.try')}</div>
          <div class="intro-bottom">
            <div class="mascot-tip"><span class="mascot">🦉</span><div class="bubble small">${L.tip}</div></div>
            <div class="intro-go">
              <div class="star-req">
                <span>${starsHtml(1)} ${t('intro.star1')}</span>
                <span>${starsHtml(2)} ${t('intro.star2')}</span>
                <span>${starsHtml(3)} ${t('intro.star3', { zpm: target })}</span>
              </div>
              <button class="btn primary big" id="start-lesson" data-primary>${t('intro.start')} <kbd>Enter</kbd></button>
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
    let timer = null;
    App.keyHandler = (e) => {
      const ch = BT.keyChar(e);
      if (ch === null) return false;
      e.preventDefault();
      const m = BT.CHAR_MAP[ch];
      if (!m) return true;
      kb.flash(ch, true);
      hands.highlight(BT.fingersFor(ch));
      const key = ch === ' ' ? t('intro.spaceKey') : `<span class="kcap">${esc(ch)}</span>`;
      tryLine.innerHTML = t(newChars.has(ch) ? 'intro.tryNew' : 'intro.tryOther', { key, finger: BT.fingerText(ch) });
      clearTimeout(timer);
      timer = setTimeout(() => hands.highlight(base), 1400);
      return true;
    };
    App.cleanup = () => clearTimeout(timer);
  };

  /* ---------- Lektion: Runde ---------- */
  S.lessonRound = (idx, r, state) => {
    if (!state) return App.startLesson(idx);
    const L = BT.LESSONS[idx];
    const tx = state.texts[r];
    if (P().settings.showKeyboard) state.blind = false;
    BT.TypingScreen({
      title: t('round.title', { n: idx + 1, title: esc(L.title) }),
      sub: t('round.sub', { r: r + 1, label: esc(tx.label) }),
      dots: { total: 3, current: r },
      text: tx.text,
      onKbToggle: (shown) => { if (shown) state.blind = false; },
      onExit: () => App.go('lessonIntro', idx),
      onRestart: () => App.go('lessonRound', idx, r, state),
      onDone: (res) => {
        state.rounds.push(res);
        Pr.recordRound(P(), res, { kind: 'lesson', l: idx + 1, r: r + 1 });
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
              <h2>${t('round.done', { r: r + 1 })}</h2>
              <div class="rstats">${rstat(pct(res.acc), t('stat.correct'))}${rstat(Math.round(res.zpm), t('stat.zpm'))}${rstat(res.wrong, t('stat.errors'))}</div>
              <p class="praise">${Pr.praise(res.acc)}</p>
              <div class="modal-actions"><button class="btn primary big" data-primary id="next-round">${t('round.next', { r: r + 2 })} <kbd>Enter</kbd></button></div>
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
    const head = s.passed ? (s.stars === 3 ? t('result.perfect') : t('result.passed')) : t('result.failed');
    let msg;
    if (!s.passed) msg = t('result.fail');
    else if (s.stars < 3 && s.acc >= 0.96) msg = t('result.needSpeed', { zpm: Pr.speedTarget(s.idx) });
    else if (s.stars < 3) msg = t('result.moreAcc', { praise: Pr.praise(s.acc) });
    else msg = Pr.praise(s.acc);
    let actions;
    if (s.passed && hasNext) {
      actions = `<button class="btn secondary" id="again">${t('result.again')}</button>
        <button class="btn primary big" data-primary data-go="lessonIntro" data-arg="${s.idx + 1}">${t('result.next')}</button>
        <button class="btn ghost" data-go="map">${t('result.map')}</button>`;
    } else if (s.passed) {
      actions = `<button class="btn secondary" id="again">${t('result.again')}</button>
        <button class="btn primary big" data-primary data-go="map">${t('result.map')}</button>`;
    } else {
      actions = `<button class="btn primary big" data-primary id="again">${t('result.retry')}</button>
        <button class="btn ghost" data-go="map">${t('result.map')}</button>`;
    }
    main().innerHTML = `
      <section class="result">
        <div class="card result-card ${s.passed ? 'win' : 'fail'}">
          <div class="result-mascot ${s.passed ? 'bounce' : ''}">${s.passed ? '🦉' : '💪'}</div>
          <h1>${head}</h1>
          <p class="result-sub">${t('round.title', { n: s.idx + 1, title: esc(L.title) })}</p>
          <div class="stars-big">${[0, 1, 2].map((i) => `<span class="sb" data-i="${i}">★</span>`).join('')}</div>
          <div class="rstats">${rstat(pct(s.acc), t('stat.correct'))}${rstat(Math.round(s.zpm), t('stat.zpm'))}${rstat(s.wrong, t('stat.errors'))}</div>
          <p class="praise">${msg}</p>
          <div class="xp-gain">+${int(s.xp)} XP ${s.blind ? `<span class="tag">${t('result.blind')}</span>` : ''}${s.firstPass ? `<span class="tag">${t('result.first')}</span>` : ''}</div>
          <div class="xpbar big"><i style="width:${lv.pct}%"></i></div>
          <div class="lv-sub">${t('result.level', { level: lv.level, title: esc(lv.title), into: int(lv.into), need: int(lv.need) })}</div>
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
