'use strict';
/* BlindTrainer – Anleitung, Training, Erfolge, Statistik, Einstellungen */
(function (BT) {
  const { $, $$, esc, pct, int, rstat, P } = BT.ui;
  const S = BT.Screens;
  const App = BT.App;
  const Pr = BT.Progress;
  const main = () => $('#main');
  const swallow = (e) => { if (BT.keyChar(e) !== null) e.preventDefault(); return true; };

  /* =================== Anleitung „So geht's“ =================== */
  function kbVisual(el, markFn, fingers) {
    el.innerHTML = '<div class="gv-kb"></div><div class="gv-hands"></div>';
    const kb = BT.KB.create(el.querySelector('.gv-kb'), { colored: true });
    kb.mark(markFn);
    BT.Hands.create(el.querySelector('.gv-hands')).highlight(fingers);
  }
  const HOME_ROW = ['a', 's', 'd', 'f', 'j', 'k', 'l', 'ö'];
  const fingerLegend = () => ['pinky', 'ring', 'middle', 'index', 'thumb']
    .map((t) => `<span class="lg"><i class="fc-${t}"></i>${BT.FINGER_TYPES[t]}</span>`).join('');

  const GUIDE = [
    { icon: '👋', title: 'Was ist Blindschreiben?', body: () => `
      <p>Beim <b>Blindschreiben</b> – auch <b>10-Finger-System</b> genannt – tippst du mit allen zehn Fingern, <b>ohne auf die Tastatur zu schauen</b>.</p>
      <p>Jeder Finger kümmert sich um ein paar bestimmte Tasten. Am Anfang ist das ungewohnt. Aber mit etwas Übung tippst du viel schneller als mit zwei Fingern – und deine Augen bleiben die ganze Zeit auf dem Bildschirm.</p>
      <div class="compare">
        <div class="cmp bad"><span class="cmp-ic">🐢</span><b>Zwei-Finger-Suchsystem</b><span>Die Augen springen ständig zwischen Tastatur und Bildschirm hin und her.</span></div>
        <div class="cmp good"><span class="cmp-ic">🚀</span><b>10-Finger-System</b><span>Die Finger finden die Tasten von allein. Die Augen bleiben beim Text.</span></div>
      </div>` },
    { icon: '🪑', title: 'Richtig sitzen', body: () => `
      <ul class="checklist">
        <li><span>🧍</span><div>Sitz aufrecht, der Rücken lehnt an.</div></li>
        <li><span>🦶</span><div>Beide Füße stehen flach auf dem Boden.</div></li>
        <li><span>💪</span><div>Die Schultern sind locker, die Ellbogen ungefähr im rechten Winkel.</div></li>
        <li><span>🖐️</span><div>Die Handgelenke schweben leicht über der Tischkante. Die Finger sind leicht gekrümmt – wie die Pfoten einer kleinen Katze.</div></li>
        <li><span>🖥️</span><div>Der Bildschirm ist etwa eine Armlänge entfernt.</div></li>
      </ul>` },
    { icon: '🏠', title: 'Die Grundstellung', body: () => `
      <p>Deine Finger haben ein Zuhause: die <b>Grundreihe</b> in der Mitte der Tastatur.</p>
      <p>Links liegen die Finger auf <b>A S D F</b>, rechts auf <b>J K L Ö</b>. Die Daumen ruhen auf der <b>Leertaste</b>.</p>
      <p>Nach jedem Tastendruck kehrt der Finger sofort wieder nach Hause zurück.</p>`,
      visual: (el) => kbVisual(el, (k) => (HOME_ROW.includes(k.base) || k.id === 'Space' ? 'new' : 'dim'),
        ['LP', 'LR', 'LM', 'LI', 'RI', 'RM', 'RR', 'RP', 'LT', 'RT']) },
    { icon: '🔍', title: 'Die Fühltasten F und J', body: () => `
      <p>Auf den Tasten <b>F</b> und <b>J</b> sind kleine <b>Huckel</b>. Taste mal mit deinen Zeigefingern danach!</p>
      <p>So findest du die Grundstellung immer wieder – ganz ohne hinzuschauen. Wenn du dich „verlaufen“ hast: einfach die Huckel suchen.</p>`,
      visual: (el) => kbVisual(el, (k) => (k.base === 'f' || k.base === 'j' ? 'new' : 'dim'), ['LI', 'RI']) },
    { icon: '🎨', title: 'Jeder Finger hat seine Farbe', body: () => `
      <p>Auf der Bildschirm-Tastatur siehst du, welcher Finger welche Tasten drückt. <b>Gleiche Farbe = gleicher Finger</b> – links und rechts.</p>
      <div class="legend">${fingerLegend()}</div>
      <p>Die Zeigefinger haben am meisten zu tun: Jeder kümmert sich um zwei Spalten!</p>`,
      visual: (el) => kbVisual(el, () => '', []) },
    { icon: '💡', title: 'Profi-Tipps', body: () => `
      <ul class="checklist">
        <li><span>🎯</span><div><b>Genau vor schnell:</b> Tippe lieber langsam und richtig. Das Tempo kommt von allein.</div></li>
        <li><span>🙈</span><div><b>Nicht hinschauen:</b> Auch wenn es schwerfällt – schau auf den Bildschirm. Wenn du dich sicher fühlst, blende die Tastatur aus.</div></li>
        <li><span>🏠</span><div><b>Zurück nach Hause:</b> Nach jedem Tastendruck geht der Finger zurück in die Grundstellung.</div></li>
        <li><span>👍</span><div><b>Leertaste:</b> Die drückst du mit dem Daumen.</div></li>
        <li><span>⇧</span><div><b>Großbuchstaben:</b> Die Umschalttaste drückt immer die andere Hand.</div></li>
        <li><span>📅</span><div><b>Jeden Tag ein bisschen:</b> 10 Minuten am Tag bringen mehr als eine Stunde am Wochenende.</div></li>
        <li><span>🤲</span><div><b>Pausen:</b> Wenn die Hände müde werden, kurz ausschütteln.</div></li>
      </ul>` },
    { icon: '🎮', title: 'So funktioniert BlindTrainer', body: () => `
      <ul class="checklist">
        <li><span>🗺️</span><div><b>Lernpfad:</b> ${BT.LESSONS.length} Lektionen in ${BT.WORLDS.length} Welten. Jede Lektion bringt dir neue Tasten bei.</div></li>
        <li><span>🔁</span><div><b>3 Runden pro Lektion:</b> Erst die neuen Tasten, dann ein Buchstaben-Mix, dann echte Wörter.</div></li>
        <li><span>⭐</span><div><b>Sterne:</b> Ab 80 % richtig gibt es einen Stern, ab 90 % zwei, ab 96 % und genug Tempo drei. Mit einem Stern ist die nächste Lektion frei.</div></li>
        <li><span>✨</span><div><b>XP & Level:</b> Jedes richtige Zeichen bringt Punkte. Mit neuen Levels schaltest du neue Tiere frei.</div></li>
        <li><span>🎮</span><div><b>Spiele:</b> Tasten-Blitz, Wort-Regen und Tier-Rennen – sie benutzen nur Tasten, die du schon kannst.</div></li>
        <li><span>🔴</span><div><b>Vertippt?</b> Dann wird der Buchstabe rot. Tippe einfach die richtige Taste – Löschen ist nicht nötig.</div></li>
      </ul>` },
    { icon: '✋', title: 'Probier es aus!', interactive: true, body: () => `
      <p>Leg deine Finger auf die Grundstellung und tippe die Buchstaben nacheinander ab. Die Leertaste drückst du mit dem Daumen.</p>
      <p class="guide-done" hidden>🎉 <b>Super!</b> Du kennst die Grundstellung. Jetzt bist du bereit für Lektion 1!</p>` },
  ];

  S.guide = (page) => {
    const p = P();
    page = Math.max(0, Math.min(GUIDE.length - 1, Number(page) || 0));
    const g = GUIDE[page];
    const last = page === GUIDE.length - 1;
    const next = Pr.nextLesson(p);
    main().innerHTML = `
      <section class="guide">
        <div class="page-head"><h1>📖 So geht's</h1></div>
        <div class="card guide-card">
          <div class="guide-step">Schritt ${page + 1} von ${GUIDE.length}</div>
          <div class="guide-head"><span class="guide-icon">${g.icon}</span><h2>${g.title}</h2></div>
          <div class="guide-body">${g.body()}</div>
          ${g.visual || g.interactive ? '<div class="guide-visual"></div>' : ''}
          <div class="guide-nav">
            <button class="btn ghost" id="g-prev"${page === 0 ? ' disabled' : ''}>← Zurück</button>
            <div class="dots">${GUIDE.map((_, i) => `<button class="dot${i === page ? ' on' : ''}" data-p="${i}" title="Schritt ${i + 1}" aria-label="Schritt ${i + 1}"></button>`).join('')}</div>
            ${last
              ? `<button class="btn primary" data-primary data-go="${next === null ? 'map' : 'lessonIntro'}" data-arg="${next === null ? 0 : next}">${next === null ? 'Zum Lernpfad' : `Zu Lektion ${next + 1}`} ▶</button>`
              : '<button class="btn primary" data-primary id="g-next">Weiter →</button>'}
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
      view = BT.TypingView.create(vis, 'asdf jklö', {
        compact: true,
        onDone: () => {
          $('.guide-done').hidden = false;
          const first = !p.flags.guideDone;
          p.flags.guideDone = true;
          const ach = Pr.checkAchievements(p);
          BT.Store.save();
          BT.Sound.success();
          if (first) App.confetti();
          ach.forEach((a) => App.toast(`${a.icon} Neues Abzeichen: <b>${esc(a.title)}</b>`, 3500));
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
  const TRAIN_NAMES = { weak: 'Schwache Tasten', words: 'Wörter-Mix', home: 'Grundreihe', sentences: 'Sätze' };

  S.training = () => {
    const p = P();
    const weak = Pr.weakKeys(p, 5);
    const li = Pr.learnedIdx(p);
    const al = BT.Gen.allowed(li);
    const card = (id, icon, title, text, enabled, extra = '') => `
      <div class="card train-card${enabled ? '' : ' locked'}">
        <div class="tc-ic">${icon}</div><h2>${title}</h2><p>${text}</p>${extra}
        <button class="btn primary" data-train="${id}"${enabled ? '' : ' disabled'}>${enabled ? 'Üben' : '🔒 Noch gesperrt'}</button>
      </div>`;
    main().innerHTML = `
      <section class="training">
        <div class="page-head"><h1>🏋️ Training</h1><p>Freies Üben – ohne Sterne, aber mit XP. Es kommen nur Tasten vor, die du schon gelernt hast.</p></div>
        <div class="train-grid">
          ${card('weak', '🎯', 'Schwache Tasten',
            weak.length ? 'Diese Tasten machen dir noch Mühe:' : 'Noch nicht genug Daten. Mach erst ein paar Lektionen – dann zeige ich dir, welche Tasten du üben solltest.',
            weak.length > 0,
            weak.length ? `<div class="weak-keys">${weak.map((w) => `<span class="kcap big">${esc(BT.keyLabel(w.ch))}<small>${Math.round(w.rate * 100)} % Fehler</small></span>`).join('')}</div>` : '')}
          ${card('words', '📚', 'Wörter-Mix', 'Zufällige Wörter mit allen Buchstaben, die du schon kannst.', true)}
          ${card('home', '🏠', 'Grundreihe', 'Zurück zu den Wurzeln: A S D F – J K L Ö, dazu G und H.', li >= 4)}
          ${card('sentences', '📝', 'Sätze', 'Ganze Sätze mit Großschreibung und Satzzeichen.', al.shift)}
        </div>
      </section>`;
    $$('[data-train]').forEach((b) => { b.onclick = () => App.go('trainRun', b.dataset.train); });
  };

  S.trainRun = (kind) => {
    const p = P();
    if (!TRAIN_NAMES[kind]) kind = 'words';
    const text = BT.Gen.trainingText(p, kind);
    BT.TypingScreen({
      title: 'Training: ' + TRAIN_NAMES[kind],
      sub: 'Freies Üben',
      text,
      onExit: () => App.go('training'),
      onRestart: () => App.go('trainRun', kind),
      onDone: (res) => {
        Pr.recordRound(p, res, { kind: 'training', label: 'Training: ' + TRAIN_NAMES[kind] });
        const out = Pr.trainingDone(p, res);
        App.keyHandler = swallow;
        BT.Sound.success();
        if (out.levelUp) setTimeout(() => BT.Sound.levelUp(), 500);
        setTimeout(() => {
          const c = App.modal(`
            <div class="big-emoji">💪</div>
            <h2>Training geschafft!</h2>
            <div class="rstats">${rstat(pct(res.acc), 'richtig')}${rstat(Math.round(res.zpm), 'Zeichen/Min')}${rstat(res.wrong, 'Fehler')}</div>
            <p class="praise">${Pr.praise(res.acc)}</p>
            <div class="xp-gain">+${int(out.xp)} XP</div>
            ${App.rewardsHtml(out)}
            <div class="modal-actions">
              <button class="btn ghost" data-go="training">Zurück</button>
              <button class="btn primary big" data-primary id="tr-again">↻ Nochmal <kbd>Enter</kbd></button>
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
        <div class="page-head"><h1>🏆 Erfolge</h1><p>${got} von ${BT.ACHIEVEMENTS.length} Abzeichen gesammelt</p></div>
        <div class="card">
          <h2 class="card-title">Dein Tier</h2>
          <p class="muted">Klick auf ein freigeschaltetes Tier, um es auszuwählen. Neue Tiere gibt es mit höheren Levels.</p>
          <div class="avatar-grid">${BT.AVATARS.map((a) => {
            const unl = lv >= a.lvl;
            const sel = p.avatar === a.e;
            return `<button class="av-tile${unl ? '' : ' locked'}${sel ? ' sel' : ''}" data-av="${a.e}"${unl ? '' : ' disabled'}>
                <span class="av">${a.e}</span><small>${sel ? '✓ Gewählt' : (unl ? 'Frei' : '🔒 Level ' + a.lvl)}</small>
              </button>`;
          }).join('')}</div>
        </div>
        <div class="ach-grid">${BT.ACHIEVEMENTS.map((a) => {
          const t = p.achievements[a.id];
          return `<div class="card ach ${t ? 'got' : 'locked'}">
              <div class="ach-ic">${a.icon}</div>
              <div class="ach-body"><b>${esc(a.title)}</b><p>${esc(a.desc)}</p>${t ? `<small>✓ ${new Date(t).toLocaleDateString('de-DE')}</small>` : ''}</div>
            </div>`;
        }).join('')}</div>
      </section>`;
    $$('.av-tile[data-av]').forEach((b) => {
      b.onclick = () => {
        if (b.disabled) return;
        p.avatar = b.dataset.av;
        BT.Store.save();
        BT.Sound.ok();
        App.go('trophies');
      };
    });
  };

  /* =================== Statistik =================== */
  const fmtTime = (sec) => {
    const m = Math.round(sec / 60);
    if (m < 60) return m + ' Min';
    return Math.floor(m / 60) + ' Std ' + (m % 60) + ' Min';
  };

  function speedChart(hist) {
    if (!hist.length) return '<div class="empty">Noch keine Runden – leg los, dann siehst du hier, wie du schneller wirst!</div>';
    const max = Math.max(20, ...hist.map((h) => h.zpm));
    const step = max <= 60 ? 20 : (max <= 150 ? 50 : 100);
    const top = Math.ceil(max / step) * step;
    const bars = hist.map((h) => {
      const d = new Date(h.t);
      const tip = `${d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} · ${esc(h.label || '')}<br><b>${h.zpm} Zeichen/Min</b> · ${Math.round(h.acc * 100)} % richtig`;
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
      <div class="chart-x"><span>← älter</span><span>neuer →</span></div>`;
  }

  const HEAT = [
    { max: 0.02, v: 'var(--heat-0)', ink: '#1c2240', label: 'unter 2 %' },
    { max: 0.05, v: 'var(--heat-1)', ink: '#1c2240', label: '2–5 %' },
    { max: 0.10, v: 'var(--heat-2)', ink: '#1c2240', label: '5–10 %' },
    { max: 0.20, v: 'var(--heat-3)', ink: '#ffffff', label: '10–20 %' },
    { max: 9, v: 'var(--heat-4)', ink: '#ffffff', label: 'über 20 %' },
  ];

  S.stats = () => {
    const p = P();
    const t = p.totals;
    const hist = p.history.slice(-20);
    const recent = p.history.slice(-10);
    const avgAcc = recent.length ? recent.reduce((s, h) => s + h.acc, 0) / recent.length : null;
    const weak = Pr.weakKeys(p, 5);
    const tileS = (icon, val, label) => `<div class="card stat-tile"><span class="st-ic">${icon}</span><b>${val}</b><span>${label}</span></div>`;
    main().innerHTML = `
      <section class="stats">
        <div class="page-head"><h1>📊 Statistik</h1><p>So entwickelst du dich, ${esc(p.name)}.</p></div>
        <div class="stat-tiles">
          ${tileS('⏱️', fmtTime(t.time + t.gameTime), 'Übungszeit')}
          ${tileS('⌨️', int(t.keys), 'richtige Anschläge')}
          ${tileS('⚡', t.bestZpm || '–', 'Rekord: Zeichen pro Minute')}
          ${tileS('🎯', avgAcc == null ? '–' : pct(avgAcc), 'Genauigkeit (letzte 10 Runden)')}
          ${tileS('⭐', `${Pr.totalStars(p)} / ${BT.LESSONS.length * 3}`, 'Sterne')}
          ${tileS('🔥', Pr.streak(p), `Tage in Folge (Rekord: ${t.bestStreak || 0})`)}
        </div>
        <div class="card chart-card">
          <h2 class="card-title">Dein Tempo – die letzten ${hist.length || 20} Runden</h2>
          <p class="muted">Zeichen pro Minute. Fahr mit der Maus über einen Balken, um Details zu sehen.</p>
          ${speedChart(hist)}
          ${hist.length ? `<details class="table-view"><summary>Werte als Tabelle anzeigen</summary>
            <table><thead><tr><th>Datum</th><th>Übung</th><th class="num">Zeichen/Min</th><th class="num">Richtig</th></tr></thead>
            <tbody>${hist.slice().reverse().map((h) => `<tr><td>${new Date(h.t).toLocaleDateString('de-DE')}</td><td>${esc(h.label || '')}</td><td class="num">${h.zpm}</td><td class="num">${Math.round(h.acc * 100)} %</td></tr>`).join('')}</tbody></table>
          </details>` : ''}
          <div class="chart-tip" hidden></div>
        </div>
        <div class="card heat-card">
          <h2 class="card-title">Wo passieren Fehler?</h2>
          <p class="muted">Je dunkler eine Taste, desto öfter hast du dich dort vertippt. Graue Tasten hast du noch nicht oft genug benutzt.</p>
          <div class="heat-kb"></div>
          <div class="heat-legend"><span class="hl-title">Fehlerquote:</span>${HEAT.map((h) => `<span class="lg"><i style="background:${h.v}"></i>${h.label}</span>`).join('')}<span class="lg"><i class="nodata"></i>noch keine Daten</span></div>
          ${weak.length
            ? `<div class="weak-line">Deine Problem-Tasten: ${weak.map((w) => `<span class="kcap">${esc(BT.keyLabel(w.ch))}</span>`).join(' ')} <button class="btn primary small" data-go-train="weak">🎯 Jetzt üben</button></div>`
            : '<p class="muted">Sobald du mehr geübt hast, zeige ich dir hier deine Problem-Tasten.</p>'}
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
      const name = k.id === 'Space' ? 'Leertaste' : BT.keyLabel(k.base);
      return { bg: st.v, ink: st.ink, title: `${name}: ${Math.round(rate * 100)} % Fehler bei ${s.h + s.e} Anschlägen` };
    });
    const gw = $('[data-go-train]');
    if (gw) gw.onclick = () => App.go('trainRun', 'weak');
  };

  /* =================== Einstellungen =================== */
  function parentGate(onOk, onCancel) {
    const a = 6 + Math.floor(Math.random() * 4);
    const b = 6 + Math.floor(Math.random() * 4);
    const card = App.modal(`
      <div class="big-emoji">👪</div>
      <h2>Elternbereich</h2>
      <p>Bitte löse diese Aufgabe:</p>
      <label class="field center"><span class="gate-q">${a} × ${b} = ?</span><input id="gate" inputmode="numeric" maxlength="3" autocomplete="off"></label>
      <div class="modal-actions"><button class="btn ghost" id="gate-no">Abbrechen</button><button class="btn primary" data-primary id="gate-ok">OK</button></div>`, { closable: false });
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
      <div class="modal-actions"><button class="btn ghost" data-close>Abbrechen</button><button class="btn danger" id="cf-ok">${okLabel}</button></div>`);
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
    main().innerHTML = `
      <section class="settings">
        <div class="page-head"><h1>⚙️ Einstellungen</h1></div>
        <div class="set-grid">
          <div class="card">
            <h2 class="card-title">👤 Profil</h2>
            <div class="set-row"><span class="set-l"><b>Name</b></span><span class="inline-form"><input id="set-name" maxlength="16" value="${esc(p.name)}"><button class="btn small primary" id="set-name-save">Speichern</button></span></div>
            <div class="set-row"><span class="set-l"><b>Tier</b><small>Mehr Tiere gibt es mit höheren Levels.</small></span><button class="btn small secondary" data-go="trophies">${p.avatar} Ändern</button></div>
            <div class="set-row"><span class="set-l"><b>Profil wechseln</b></span><button class="btn small secondary" data-go="profiles">👥 Profile</button></div>
          </div>
          <div class="card">
            <h2 class="card-title">🔊 Ton</h2>
            ${sw('sound', 'Geräusche', 'Töne für Erfolge, Fehler und Spiele')}
            ${sw('keySound', 'Tipp-Geräusch', 'Leises Klicken bei jedem richtigen Anschlag')}
          </div>
          <div class="card">
            <h2 class="card-title">🖥️ Anzeige</h2>
            ${sw('showKeyboard', 'Bildschirm-Tastatur zeigen', 'Ausgeblendet = Profi-Modus mit +25 % XP')}
            ${sw('showHands', 'Hände zeigen', 'Zeigt, welcher Finger dran ist')}
            ${sw('showHint', 'Finger-Hinweis zeigen', 'Kurzer Text, welcher Finger die nächste Taste drückt')}
            <div class="set-row"><span class="set-l"><b>Textgröße</b></span>${seg('textSize', [['s', 'Klein'], ['m', 'Normal'], ['l', 'Groß']])}</div>
            <div class="set-row"><span class="set-l"><b>Design</b></span>${seg('theme', [['light', '☀️ Hell'], ['dark', '🌙 Dunkel']])}</div>
          </div>
          <div class="card">
            <h2 class="card-title">🎯 Tagesziel</h2>
            <div class="set-row"><span class="set-l"><b>Minuten pro Tag</b><small>Gezählt wird die reine Tipp-Zeit in Lektionen, Training und Spielen.</small></span>${seg('dailyGoal', [[5, '5'], [10, '10'], [15, '15'], [20, '20'], [30, '30']])}</div>
          </div>
          <div class="card parents">
            <h2 class="card-title">👪 Für Eltern</h2>
            <div class="set-row"><span class="set-l"><b>Alle Lektionen freischalten</b><small>Zum Beispiel, wenn schon Vorkenntnisse da sind.</small></span><span class="switch"><input type="checkbox" id="set-unlock"${s.unlockAll ? ' checked' : ''}><i></i></span></div>
            <div class="set-row"><span class="set-l"><b>Sicherung</b><small>Alle Profile als Datei speichern oder wiederherstellen.</small></span>
              <span class="btn-row"><button class="btn small secondary" id="set-export">⬇️ Exportieren</button><button class="btn small secondary" id="set-import">⬆️ Importieren</button></span>
              <input type="file" id="set-file" accept=".json,application/json" hidden></div>
            <div class="set-row"><span class="set-l"><b>Fortschritt zurücksetzen</b><small>Sterne, XP und Statistik dieses Profils löschen.</small></span><button class="btn small danger" id="set-reset">Zurücksetzen</button></div>
            <div class="set-row"><span class="set-l"><b>Profil löschen</b><small>Entfernt „${esc(p.name)}“ komplett.</small></span><button class="btn small danger" id="set-delete">Löschen</button></div>
            <p class="footnote">Alle Daten werden nur lokal in diesem Browser gespeichert – nichts geht ins Internet. Die App ist für eine <b>deutsche Tastatur (QWERTZ)</b> gemacht.</p>
          </div>
        </div>
      </section>`;

    const refresh = () => { BT.Store.save(); App.applySettings(); App.renderTop(); };
    $$('input[data-set]').forEach((inp) => {
      inp.onchange = () => { s[inp.dataset.set] = inp.checked; refresh(); if (inp.dataset.set === 'sound' && inp.checked) { BT.Sound.unlock(); BT.Sound.ok(); } };
    });
    $$('.seg').forEach((sg) => {
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
      const v = nameInp.value.trim();
      if (!v) { nameInp.value = p.name; return; }
      p.name = v;
      refresh();
      App.toast('✓ Name gespeichert');
    };
    $('#set-name-save').onclick = saveName;
    nameInp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); saveName(); nameInp.blur(); } });

    const unlock = $('#set-unlock');
    unlock.onchange = () => {
      if (unlock.checked) {
        unlock.checked = false;
        parentGate(() => { s.unlockAll = true; unlock.checked = true; refresh(); App.toast('🔓 Alle Lektionen und Spiele sind frei.'); });
      } else { s.unlockAll = false; refresh(); }
    };

    $('#set-export').onclick = () => {
      const blob = new Blob([JSON.stringify(BT.Store.data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `blindtrainer-sicherung-${Pr.dayKey(new Date())}.json`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    };
    const file = $('#set-file');
    $('#set-import').onclick = () => file.click();
    file.onchange = () => {
      const f = file.files && file.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        let d;
        try { d = JSON.parse(r.result); } catch (e) { App.toast('⚠️ Die Datei ist keine gültige Sicherung.'); return; }
        if (!d || typeof d.profiles !== 'object') { App.toast('⚠️ Die Datei ist keine gültige Sicherung.'); return; }
        const n = Object.keys(d.profiles).length;
        parentGate(() => confirmModal('Sicherung laden?', `Die Sicherung enthält ${n} Profil(e). Alle aktuellen Profile auf diesem Computer werden dadurch ersetzt.`, 'Ja, laden', () => {
          try { BT.Store.importData(d); App.applySettings(); App.go('profiles'); App.toast('✓ Sicherung geladen'); }
          catch (e) { App.toast('⚠️ ' + esc(e.message)); }
        }));
      };
      r.readAsText(f);
      file.value = '';
    };
    $('#set-reset').onclick = () => parentGate(() => confirmModal('Fortschritt zurücksetzen?', `Alle Sterne, XP, Abzeichen und Statistiken von „${esc(p.name)}“ werden gelöscht.`, 'Zurücksetzen', () => {
      BT.Store.resetProgress(p.id); App.applySettings(); App.go('home'); App.toast('Fortschritt zurückgesetzt');
    }));
    $('#set-delete').onclick = () => parentGate(() => confirmModal('Profil löschen?', `Das Profil „${esc(p.name)}“ wird mit allen Daten gelöscht.`, 'Löschen', () => {
      BT.Store.remove(p.id); App.applySettings(); App.go('profiles');
    }));
  };
})(window.BT);
