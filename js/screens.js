'use strict';
/* BlindTrainer – Anleitung, Training, Erfolge, Statistik, Einstellungen */
(function (BT) {
  const { $, $$, esc, pct, int, rstat, P, t } = BT.ui;
  const S = BT.Screens;
  const App = BT.App;
  const Pr = BT.Progress;
  const main = () => $('#main');
  const swallow = (e) => { if (BT.keyChar(e) !== null) e.preventDefault(); return true; };

  /* =================== Anleitung =================== */
  function kbVisual(el, markFn, fingers) {
    el.innerHTML = '<div class="gv-kb"></div><div class="gv-hands"></div>';
    const kb = BT.KB.create(el.querySelector('.gv-kb'), { colored: true });
    kb.mark(markFn);
    BT.Hands.create(el.querySelector('.gv-hands')).highlight(fingers);
  }
  const homeKeys = () => ['LP', 'LR', 'LM', 'LI', 'RI', 'RM', 'RR', 'RP'].map((f) => BT.HOME[f]);
  const homeText = () => {
    const h = homeKeys().map(BT.keyLabel);
    return { homeLeft: h.slice(0, 4).join(' '), homeRight: h.slice(4).join(' ') };
  };
  const fingerLegend = () => ['pinky', 'ring', 'middle', 'index', 'thumb']
    .map((ty) => `<span class="lg"><i class="fc-${ty}"></i>${esc(BT.FINGER_TYPES[ty])}</span>`).join('');

  /* Aufbau der Anleitung; Titel und Texte kommen aus BT.locale.guide (gleiche Reihenfolge) */
  const GUIDE = [
    { icon: '👋' },
    { icon: '🪑' },
    { icon: '🏠', visual: (el) => kbVisual(el, (k) => (homeKeys().includes(k.base) || k.id === 'Space' ? 'new' : 'dim'), ['LP', 'LR', 'LM', 'LI', 'RI', 'RM', 'RR', 'RP', 'LT', 'RT']) },
    { icon: '🔍', visual: (el) => kbVisual(el, (k) => (k.base === 'f' || k.base === 'j' ? 'new' : 'dim'), ['LI', 'RI']) },
    { icon: '🎨', visual: (el) => kbVisual(el, () => '', []) },
    { icon: '💡' },
    { icon: '🎮' },
    { icon: '✋', interactive: true },
  ];

  S.guide = (page) => {
    const p = P();
    page = Math.max(0, Math.min(GUIDE.length - 1, Number(page) || 0));
    const g = GUIDE[page];
    const text = BT.locale.guide[page];
    const last = page === GUIDE.length - 1;
    const next = Pr.nextLesson(p);
    const body = BT.tpl(text.body, Object.assign({ legend: fingerLegend(), lessons: BT.LESSONS.length, worlds: BT.WORLDS.length }, homeText()));
    main().innerHTML = `
      <section class="guide">
        <div class="page-head"><h1>${t('guide.title')}</h1></div>
        <div class="card guide-card">
          <div class="guide-step">${t('guide.step', { n: page + 1, total: GUIDE.length })}</div>
          <div class="guide-head"><span class="guide-icon">${g.icon}</span><h2>${text.title}</h2></div>
          <div class="guide-body">${body}${g.interactive ? `<p class="guide-done" hidden>${t('guide.done')}</p>` : ''}</div>
          ${g.visual || g.interactive ? '<div class="guide-visual"></div>' : ''}
          <div class="guide-nav">
            <button class="btn ghost" id="g-prev"${page === 0 ? ' disabled' : ''}>${t('guide.prev')}</button>
            <div class="dots">${GUIDE.map((_, i) => `<button class="dot${i === page ? ' on' : ''}" data-p="${i}" aria-label="${esc(t('guide.step', { n: i + 1, total: GUIDE.length }))}"></button>`).join('')}</div>
            ${last
              ? `<button class="btn primary" data-primary data-go="${next === null ? 'map' : 'lessonIntro'}" data-arg="${next === null ? 0 : next}">${next === null ? t('guide.toMap') : t('guide.toLesson', { n: next + 1 })}</button>`
              : `<button class="btn primary" data-primary id="g-next">${t('guide.next')}</button>`}
          </div>
        </div>
      </section>`;
    const go = (i) => App.go('guide', i);
    $('#g-prev').onclick = () => go(page - 1);
    if (!last) $('#g-next').onclick = () => go(page + 1);
    $$('.dot[data-p]').forEach((d) => { d.onclick = () => go(Number(d.dataset.p)); });

    let view = null;
    const vis = $('.guide-visual');
    if (g.visual) g.visual(vis);
    if (g.interactive) {
      const h = homeKeys();
      view = BT.TypingView.create(vis, h.slice(0, 4).join('') + ' ' + h.slice(4).join(''), {
        compact: true,
        onDone: () => {
          $('.guide-done').hidden = false;
          const first = !p.flags.guideDone;
          p.flags.guideDone = true;
          const ach = Pr.checkAchievements(p);
          BT.Store.save();
          BT.Sound.success();
          if (first) App.confetti();
          ach.forEach((a) => App.toast(t('toast.newBadge', { icon: a.icon, title: esc(Pr.achTitle(a)) }), 3500));
        },
      });
    }
    App.keyHandler = (e) => {
      if (view && view.handleKey(e)) return true;
      if (e.key === 'ArrowRight' && !last) { go(page + 1); return true; }
      if (e.key === 'ArrowLeft' && page > 0) { go(page - 1); return true; }
      return false;
    };
  };

  /* =================== Training =================== */
  const TRAIN_KINDS = ['weak', 'words', 'home', 'sentences'];

  S.training = () => {
    const p = P();
    const weak = Pr.weakKeys(p, 5);
    const li = Pr.learnedIdx(p);
    const al = BT.Gen.allowed(li);
    const h = homeText();
    const card = (id, icon, text, enabled, extra = '') => `
      <div class="card train-card${enabled ? '' : ' locked'}">
        <div class="tc-ic">${icon}</div><h2>${t('training.' + id)}</h2><p>${text}</p>${extra}
        <button class="btn primary" data-train="${id}"${enabled ? '' : ' disabled'}>${enabled ? t('training.go') : t('training.locked')}</button>
      </div>`;
    main().innerHTML = `
      <section class="training">
        <div class="page-head"><h1>${t('training.title')}</h1><p>${t('training.lead')}</p></div>
        <div class="train-grid">
          ${card('weak', '🎯', weak.length ? t('training.weakHas') : t('training.weakNone'), weak.length > 0,
            weak.length ? `<div class="weak-keys">${weak.map((w) => `<span class="kcap big">${esc(BT.keyLabel(w.ch))}<small>${t('training.errPct', { n: Math.round(w.rate * 100) })}</small></span>`).join('')}</div>` : '')}
          ${card('words', '📚', t('training.wordsDesc'), true)}
          ${card('home', '🏠', t('training.homeDesc', { home: `${h.homeLeft} – ${h.homeRight}` }), li >= 4)}
          ${card('sentences', '📝', t('training.sentencesDesc'), al.shift)}
        </div>
      </section>`;
    $$('[data-train]').forEach((b) => { b.onclick = () => App.go('trainRun', b.dataset.train); });
  };

  S.trainRun = (kind) => {
    const p = P();
    if (!TRAIN_KINDS.includes(kind)) kind = 'words';
    const name = t('training.' + kind);
    const text = BT.Gen.trainingText(p, kind);
    BT.TypingScreen({
      title: t('training.screen', { name }),
      sub: t('training.sub'),
      text,
      onExit: () => App.go('training'),
      onRestart: () => App.go('trainRun', kind),
      onDone: (res) => {
        Pr.recordRound(p, res, { kind: 'training', k: kind });
        const out = Pr.trainingDone(p, res);
        App.keyHandler = swallow;
        BT.Sound.success();
        if (out.levelUp) setTimeout(() => BT.Sound.levelUp(), 500);
        setTimeout(() => {
          const c = App.modal(`
            <div class="big-emoji">💪</div>
            <h2>${t('training.done')}</h2>
            <div class="rstats">${rstat(pct(res.acc), t('stat.correct'))}${rstat(Math.round(res.zpm), t('stat.zpm'))}${rstat(res.wrong, t('stat.errors'))}</div>
            <p class="praise">${Pr.praise(res.acc)}</p>
            <div class="xp-gain">+${int(out.xp)} XP</div>
            ${App.rewardsHtml(out)}
            <div class="modal-actions">
              <button class="btn ghost" data-go="training">${t('common.back')}</button>
              <button class="btn primary big" data-primary id="tr-again">${t('common.again')} <kbd>Enter</kbd></button>
            </div>`, { closable: false, delay: 500 });
          $('#tr-again', c).onclick = () => App.go('trainRun', kind);
        }, 300);
      },
    });
  };

  /* =================== Erfolge =================== */
  S.trophies = () => {
    const p = P();
    const lv = Pr.levelFromXp(p.xp);
    const got = BT.ACHIEVEMENTS.filter((a) => p.achievements[a.id]).length;
    main().innerHTML = `
      <section class="trophies">
        <div class="page-head"><h1>${t('trophies.title')}</h1><p>${t('trophies.count', { n: got, total: BT.ACHIEVEMENTS.length })}</p></div>
        <div class="card">
          <h2 class="card-title">${t('trophies.animal')}</h2>
          <p class="muted">${t('trophies.animalHelp')}</p>
          <div class="avatar-grid">${BT.AVATARS.map((a) => {
            const unl = lv >= a.lvl;
            const sel = p.avatar === a.e;
            return `<button class="av-tile${unl ? '' : ' locked'}${sel ? ' sel' : ''}" data-av="${a.e}"${unl ? '' : ' disabled'}>
                <span class="av">${a.e}</span><small>${sel ? t('trophies.chosen') : (unl ? t('trophies.free') : t('trophies.locked', { n: a.lvl }))}</small>
              </button>`;
          }).join('')}</div>
        </div>
        <div class="ach-grid">${BT.ACHIEVEMENTS.map((a) => {
          const ts = p.achievements[a.id];
          return `<div class="card ach ${ts ? 'got' : 'locked'}">
              <div class="ach-ic">${a.icon}</div>
              <div class="ach-body"><b>${esc(Pr.achTitle(a))}</b><p>${esc(Pr.achDesc(a))}</p>${ts ? `<small>✓ ${BT.fmt.date(ts)}</small>` : ''}</div>
            </div>`;
        }).join('')}</div>
      </section>`;
    $$('.av-tile[data-av]').forEach((b) => {
      b.onclick = () => {
        if (b.disabled) return;
        const a = BT.AVATARS.find((x) => x.e === b.dataset.av);
        if (!a || lv < a.lvl) return;
        p.avatar = a.e;
        BT.Store.save();
        BT.Sound.ok();
        App.go('trophies');
      };
    });
  };

  /* =================== Statistik =================== */
  const fmtTime = (sec) => {
    const m = Math.round(sec / 60);
    if (m < 60) return t('stats.min', { m });
    return t('stats.hm', { h: Math.floor(m / 60), m: m % 60 });
  };

  function speedChart(hist) {
    if (!hist.length) return `<div class="empty">${t('stats.empty')}</div>`;
    const max = Math.max(20, ...hist.map((h) => h.zpm));
    const step = max <= 60 ? 20 : (max <= 150 ? 50 : 100);
    const top = Math.ceil(max / step) * step;
    const bars = hist.map((h) => {
      const tip = t('stats.tip', { date: BT.fmt.date(h.t, { day: '2-digit', month: '2-digit' }), label: esc(Pr.histLabel(h)), zpm: h.zpm, acc: Math.round(h.acc * 100) });
      return `<div class="bar-col" data-tip="${esc(tip)}"><div class="bar" style="height:${Math.max(1, (h.zpm / top) * 100)}%"></div></div>`;
    }).join('');
    return `
      <div class="chart">
        <div class="chart-y"><span style="bottom:100%">${top}</span><span style="bottom:50%">${top / 2}</span><span style="bottom:0">0</span></div>
        <div class="chart-plot">
          <div class="gridline" style="bottom:100%"></div><div class="gridline" style="bottom:50%"></div><div class="baseline"></div>
          <div class="bars">${bars}</div>
        </div>
      </div>
      <div class="chart-x"><span>${t('stats.older')}</span><span>${t('stats.newer')}</span></div>`;
  }

  const HEAT = [
    { max: 0.02, v: 'var(--heat-0)', ink: '#1c2240' },
    { max: 0.05, v: 'var(--heat-1)', ink: '#1c2240' },
    { max: 0.10, v: 'var(--heat-2)', ink: '#1c2240' },
    { max: 0.20, v: 'var(--heat-3)', ink: '#ffffff' },
    { max: 9, v: 'var(--heat-4)', ink: '#ffffff' },
  ];

  S.stats = () => {
    const p = P();
    const to = p.totals;
    const hist = p.history.slice(-20);
    const recent = p.history.slice(-10);
    const avgAcc = recent.length ? recent.reduce((s, h) => s + h.acc, 0) / recent.length : null;
    const weak = Pr.weakKeys(p, 5);
    const heatLabels = t('stats.heat');
    const tileS = (icon, val, label) => `<div class="card stat-tile"><span class="st-ic">${icon}</span><b>${val}</b><span>${label}</span></div>`;
    main().innerHTML = `
      <section class="stats">
        <div class="page-head"><h1>${t('stats.title')}</h1><p>${t('stats.lead', { name: esc(p.name) })}</p></div>
        <div class="stat-tiles">
          ${tileS('⏱️', fmtTime(to.time + to.gameTime), t('stats.time'))}
          ${tileS('⌨️', int(to.keys), t('stats.keys'))}
          ${tileS('⚡', to.bestZpm ? int(to.bestZpm) : '–', t('stats.best'))}
          ${tileS('🎯', avgAcc == null ? '–' : pct(avgAcc), t('stats.acc'))}
          ${tileS('⭐', `${Pr.totalStars(p)} / ${BT.LESSONS.length * 3}`, t('stats.stars'))}
          ${tileS('🔥', Pr.streak(p), t('stats.streak', { n: int(to.bestStreak) }))}
        </div>
        <div class="card chart-card">
          <h2 class="card-title">${t('stats.chartTitle', { n: hist.length || 20 })}</h2>
          <p class="muted">${t('stats.chartLead')}</p>
          ${speedChart(hist)}
          ${hist.length ? `<details class="table-view"><summary>${t('stats.table')}</summary>
            <table><thead><tr><th>${t('stats.colDate')}</th><th>${t('stats.colEx')}</th><th class="num">${t('stats.colZpm')}</th><th class="num">${t('stats.colAcc')}</th></tr></thead>
            <tbody>${hist.slice().reverse().map((h) => `<tr><td>${BT.fmt.date(h.t)}</td><td>${esc(Pr.histLabel(h))}</td><td class="num">${h.zpm}</td><td class="num">${Math.round(h.acc * 100)} %</td></tr>`).join('')}</tbody></table>
          </details>` : ''}
          <div class="chart-tip" hidden></div>
        </div>
        <div class="card heat-card">
          <h2 class="card-title">${t('stats.heatTitle')}</h2>
          <p class="muted">${t('stats.heatLead')}</p>
          <div class="heat-kb"></div>
          <div class="heat-legend"><span class="hl-title">${t('stats.rate')}</span>${HEAT.map((h, i) => `<span class="lg"><i style="background:${h.v}"></i>${heatLabels[i]}</span>`).join('')}<span class="lg"><i class="nodata"></i>${t('stats.noData')}</span></div>
          ${weak.length
            ? `<div class="weak-line">${t('stats.weak')} ${weak.map((w) => `<span class="kcap">${esc(BT.keyLabel(w.ch))}</span>`).join(' ')} <button class="btn primary small" id="go-weak">${t('stats.practice')}</button></div>`
            : `<p class="muted">${t('stats.weakNone')}</p>`}
        </div>
      </section>`;

    const card = $('.chart-card');
    const tip = $('.chart-tip', card);
    $$('.bar-col', card).forEach((col) => {
      col.addEventListener('mouseenter', () => {
        tip.innerHTML = col.dataset.tip;
        tip.hidden = false;
        const cr = card.getBoundingClientRect();
        const br = col.getBoundingClientRect();
        const bar = col.firstElementChild.getBoundingClientRect();
        const half = tip.offsetWidth / 2;
        const x = br.left + br.width / 2 - cr.left;
        tip.style.left = Math.max(half + 8, Math.min(cr.width - half - 8, x)) + 'px';
        tip.style.top = bar.top - cr.top - 10 + 'px';
        col.classList.add('hover');
      });
      col.addEventListener('mouseleave', () => { tip.hidden = true; col.classList.remove('hover'); });
    });

    const heat = Pr.keyHeat(p);
    const kb = BT.KB.create($('.heat-kb'), { colored: false });
    const has = (k) => { const s = heat[k.id]; return s && s.h + s.e >= 5; };
    kb.mark((k) => (has(k) ? '' : 'dim'));
    kb.paint((k) => {
      if (!has(k)) return null;
      const s = heat[k.id];
      const rate = s.e / (s.h + s.e);
      const st = HEAT.find((h) => rate < h.max) || HEAT[HEAT.length - 1];
      const key = k.id === 'Space' ? t('key.space') : BT.keyLabel(k.base);
      return { bg: st.v, ink: st.ink, title: t('stats.keyTip', { key, rate: Math.round(rate * 100), n: int(s.h + s.e) }) };
    });
    const gw = $('#go-weak');
    if (gw) gw.onclick = () => App.go('trainRun', 'weak');
  };

  /* =================== Einstellungen =================== */
  function parentGate(onOk, onCancel) {
    const a = 6 + Math.floor(Math.random() * 4);
    const b = 6 + Math.floor(Math.random() * 4);
    const card = App.modal(`
      <div class="big-emoji">👪</div>
      <h2>${t('settings.gateTitle')}</h2>
      <p>${t('settings.gateText')}</p>
      <label class="field center"><span class="gate-q">${a} × ${b} = ?</span><input id="gate" inputmode="numeric" maxlength="3" autocomplete="off"></label>
      <div class="modal-actions"><button class="btn ghost" id="gate-no">${t('common.cancel')}</button><button class="btn primary" data-primary id="gate-ok">${t('common.ok')}</button></div>`, { closable: false });
    const inp = $('#gate', card);
    setTimeout(() => inp.focus(), 60);
    const ok = () => {
      if (Number(inp.value) === a * b) { App.closeModal(); onOk(); return; }
      inp.value = '';
      inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake');
      inp.focus();
    };
    $('#gate-ok', card).onclick = ok;
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); ok(); }
      if (e.key === 'Escape') { App.closeModal(); if (onCancel) onCancel(); }
    });
    $('#gate-no', card).onclick = () => { App.closeModal(); if (onCancel) onCancel(); };
  }

  function confirmModal(title, text, okLabel, onOk) {
    const card = App.modal(`
      <div class="big-emoji">⚠️</div>
      <h2>${title}</h2>
      <p>${text}</p>
      <div class="modal-actions"><button class="btn ghost" data-close>${t('common.cancel')}</button><button class="btn danger" id="cf-ok">${okLabel}</button></div>`);
    $('#cf-ok', card).onclick = () => { App.closeModal(); onOk(); };
  }

  S.settings = () => {
    const p = P();
    const s = p.settings;
    const sw = (key, label, sub) => `
      <label class="set-row">
        <span class="set-l"><b>${label}</b>${sub ? `<small>${sub}</small>` : ''}</span>
        <span class="switch"><input type="checkbox" data-set="${key}"${s[key] ? ' checked' : ''}><i></i></span>
      </label>`;
    const seg = (key, opts) => `<div class="seg" data-seg="${key}">${opts.map(([v, l]) => `<button class="${String(s[key]) === String(v) ? 'on' : ''}" data-v="${v}">${l}</button>`).join('')}</div>`;
    const name = esc(p.name);
    main().innerHTML = `
      <section class="settings">
        <div class="page-head"><h1>${t('settings.title')}</h1></div>
        <div class="set-grid">
          <div class="card">
            <h2 class="card-title">${t('settings.profile')}</h2>
            <div class="set-row"><span class="set-l"><b>${t('settings.name')}</b></span><span class="inline-form"><input id="set-name" maxlength="16" value="${name}"><button class="btn small primary" id="set-name-save">${t('common.save')}</button></span></div>
            <div class="set-row"><span class="set-l"><b>${t('settings.animal')}</b><small>${t('settings.animalDesc')}</small></span><button class="btn small secondary" data-go="trophies">${esc(p.avatar)} ${t('settings.change')}</button></div>
            <div class="set-row"><span class="set-l"><b>${t('settings.switch')}</b></span><button class="btn small secondary" data-go="profiles">${t('settings.profiles')}</button></div>
          </div>
          <div class="card">
            <h2 class="card-title">${t('settings.language')}</h2>
            <p class="muted">${t('settings.languageDesc')}</p>
            <div class="lang-choices">${BT.langs().map((c) => {
              const m = BT.I18N[c].meta;
              return `<button class="lang-choice${c === BT.lang ? ' on' : ''}" data-lang="${c}"><span class="lc-flag lang-code">${m.flag}</span><span><b>${esc(m.name)}</b><small>${esc(m.keyboard)}</small></span></button>`;
            }).join('')}</div>
          </div>
          <div class="card">
            <h2 class="card-title">${t('settings.sound')}</h2>
            ${sw('sound', t('settings.sounds'), t('settings.soundsDesc'))}
            ${sw('keySound', t('settings.keySound'), t('settings.keySoundDesc'))}
          </div>
          <div class="card">
            <h2 class="card-title">${t('settings.display')}</h2>
            ${sw('showKeyboard', t('settings.showKeyboard'), t('settings.showKeyboardDesc'))}
            ${sw('showHands', t('settings.showHands'), t('settings.showHandsDesc'))}
            ${sw('showHint', t('settings.showHint'), t('settings.showHintDesc'))}
            <div class="set-row"><span class="set-l"><b>${t('settings.textSize')}</b></span>${seg('textSize', [['s', t('settings.small')], ['m', t('settings.normal')], ['l', t('settings.large')]])}</div>
            <div class="set-row"><span class="set-l"><b>${t('settings.theme')}</b></span>${seg('theme', [['light', t('settings.light')], ['dark', t('settings.dark')]])}</div>
          </div>
          <div class="card">
            <h2 class="card-title">${t('settings.goal')}</h2>
            <div class="set-row"><span class="set-l"><b>${t('settings.goalMin')}</b><small>${t('settings.goalDesc')}</small></span>${seg('dailyGoal', [[5, '5'], [10, '10'], [15, '15'], [20, '20'], [30, '30']])}</div>
          </div>
          <div class="card parents">
            <h2 class="card-title">${t('settings.parents')}</h2>
            <div class="set-row"><span class="set-l"><b>${t('settings.unlock')}</b><small>${t('settings.unlockDesc')}</small></span><span class="switch"><input type="checkbox" id="set-unlock"${s.unlockAll ? ' checked' : ''}><i></i></span></div>
            <div class="set-row"><span class="set-l"><b>${t('settings.backup')}</b><small>${t('settings.backupDesc')}</small></span>
              <span class="btn-row"><button class="btn small secondary" id="set-export">${t('settings.export')}</button><button class="btn small secondary" id="set-import">${t('settings.import')}</button></span>
              <input type="file" id="set-file" accept=".json,application/json" hidden></div>
            <div class="set-row"><span class="set-l"><b>${t('settings.reset')}</b><small>${t('settings.resetDesc')}</small></span><button class="btn small danger" id="set-reset">${t('settings.resetBtn')}</button></div>
            <div class="set-row"><span class="set-l"><b>${t('settings.del')}</b><small>${t('settings.delDesc', { name })}</small></span><button class="btn small danger" id="set-delete">${t('settings.delBtn')}</button></div>
            <p class="footnote">${t('settings.footnote')}</p>
          </div>
        </div>
      </section>`;

    const refresh = () => { BT.Store.save(); App.applySettings(); App.renderTop(); };
    App.bindLangSwitch(main());
    $$('input[data-set]').forEach((inp) => {
      inp.onchange = () => {
        s[inp.dataset.set] = inp.checked;
        refresh();
        if (inp.dataset.set === 'sound' && inp.checked) { BT.Sound.unlock(); BT.Sound.ok(); }
      };
    });
    $$('.seg[data-seg]').forEach((sg) => {
      $$('button', sg).forEach((b) => {
        b.onclick = () => {
          const key = sg.dataset.seg;
          s[key] = key === 'dailyGoal' ? Number(b.dataset.v) : b.dataset.v;
          $$('button', sg).forEach((x) => x.classList.toggle('on', x === b));
          b.blur();
          refresh();
        };
      });
    });
    const nameInp = $('#set-name');
    const saveName = () => {
      const v = nameInp.value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 16);
      if (!v) { nameInp.value = p.name; return; }
      p.name = v;
      refresh();
      App.toast(t('toast.nameSaved'));
    };
    $('#set-name-save').onclick = saveName;
    nameInp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); saveName(); nameInp.blur(); } });

    const unlock = $('#set-unlock');
    unlock.onchange = () => {
      if (unlock.checked) {
        unlock.checked = false;
        parentGate(() => { s.unlockAll = true; unlock.checked = true; refresh(); App.toast(t('toast.unlocked')); });
      } else { s.unlockAll = false; refresh(); }
    };

    $('#set-export').onclick = () => {
      const blob = new Blob([JSON.stringify(BT.Store.data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = t('settings.file', { date: Pr.dayKey(new Date()) });
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    };
    const file = $('#set-file');
    $('#set-import').onclick = () => file.click();
    file.onchange = () => {
      const f = file.files && file.files[0];
      file.value = '';
      if (!f) return;
      if (f.size > BT.Store.MAX_IMPORT_BYTES) { App.toast(t('toast.fileTooBig')); return; }
      const r = new FileReader();
      r.onload = () => {
        let clean;
        try { clean = BT.Store.sanitizeData(JSON.parse(r.result)); } catch (e) { clean = null; }
        const n = clean ? Object.keys(clean.profiles).length : 0;
        if (!n) { App.toast(t('toast.invalidBackup')); return; }
        parentGate(() => confirmModal(t('settings.importTitle'), t('settings.importText', { n }), t('settings.importOk'), () => {
          try {
            BT.Store.importData(clean);
            BT.setLang(BT.Store.currentLang());
            App.applySettings();
            App.go('profiles');
            App.toast(t('toast.backupLoaded'));
          } catch (e) { App.toast(t('toast.invalidBackup')); }
        }));
      };
      r.readAsText(f);
    };
    $('#set-reset').onclick = () => parentGate(() => confirmModal(t('settings.resetTitle'), t('settings.resetText', { name }), t('settings.resetBtn'), () => {
      BT.Store.resetProgress(p.id); App.applySettings(); App.go('home'); App.toast(t('toast.progressReset'));
    }));
    $('#set-delete').onclick = () => parentGate(() => confirmModal(t('settings.delTitle'), t('settings.delText', { name }), t('settings.delBtn'), () => {
      BT.Store.remove(p.id); App.applySettings(); App.go('profiles');
    }));
  };
})(window.BT);
