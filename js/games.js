'use strict';
/* BlindTrainer – Spiele: Tasten-Blitz, Wort-Regen, Tier-Rennen */
(function (BT) {
  const { $, $$, esc, pick, int, rstat, P, t } = BT.ui;
  const S = BT.Screens;
  const App = BT.App;
  const Pr = BT.Progress;
  const main = () => $('#main');
  const allowedNow = (p) => BT.Gen.allowed(Pr.learnedIdx(p));
  const gameName = (id) => t('games.' + id)[0];

  function gameOver(o) {
    const c = App.modal(`
      <div class="big-emoji">${o.icon}</div>
      <h2>${o.title}</h2>
      ${o.sub ? `<p>${o.sub}</p>` : ''}
      <div class="rstats">${o.stats.map(([v, l]) => rstat(v, l)).join('')}</div>
      ${o.res.record ? `<div class="reward record">${t('reward.record')}</div>` : ''}
      <div class="xp-gain">+${int(o.res.xp)} XP</div>
      ${App.rewardsHtml(o.res)}
      <div class="modal-actions">
        <button class="btn ghost" data-go="${o.back || 'games'}">${o.backLabel || t('games.back')}</button>
        ${o.next
          ? `<button class="btn secondary" id="go-again">${t('common.again')}</button><button class="btn primary big" data-primary id="go-next">${o.next.label}</button>`
          : `<button class="btn primary big" data-primary id="go-again">${t('common.again')} <kbd>Enter</kbd></button>`}
      </div>`, { closable: false, delay: 800 });
    $('#go-again', c).onclick = o.onAgain;
    if (o.next) $('#go-next', c).onclick = o.next.fn;
    if (o.res.levelUp) setTimeout(() => BT.Sound.levelUp(), 600);
  }

  /* =================== Spiele-Übersicht =================== */
  S.games = () => {
    const p = P();
    const best = (g) => {
      if (g.id === 'blitz') return p.games.blitz ? t('games.record', { n: int(p.games.blitz) }) : t('games.noRecord');
      if (g.id === 'rain') return p.games.rain ? t('games.record', { n: int(p.games.rain) }) : t('games.noRecord');
      return t('games.raceBeaten', { n: BT.RACERS.filter((r) => p.games.race[r.id] > 0).length, total: BT.RACERS.length });
    };
    main().innerHTML = `
      <section class="games">
        <div class="page-head"><h1>${t('games.title')}</h1><p>${t('games.lead')}</p></div>
        <div class="game-grid">${BT.GAMES.map((g) => {
          const unl = Pr.gameUnlocked(p, g);
          const [name, desc] = t('games.' + g.id);
          return `<div class="card game-card${unl ? '' : ' locked'}">
              <div class="game-icon">${g.icon}</div>
              <h2>${name}</h2>
              <p>${desc}</p>
              <div class="game-best">${best(g)}</div>
              ${unl ? `<button class="btn primary big" data-go="${g.screen}">${t('games.play')}</button>`
                    : `<div class="lock-note">${t('games.lock', { n: g.unlockAfter })}</div>`}
            </div>`;
        }).join('')}</div>
      </section>`;
  };

  /* =================== Tasten-Blitz =================== */
  S.blitz = () => {
    const p = P();
    const pool = BT.Gen.blitzPool(allowedNow(p));
    const D = 60;
    main().innerHTML = `
      <section class="game blitz">
        <div class="sub-head">
          <button class="btn ghost" data-go="games">${t('games.back')}</button><h1>⚡ ${gameName('blitz')}</h1>
          <div class="game-stats"><span class="chip">⏱ <b id="bl-time">${D}</b> s</span><span class="chip">⭐ <b id="bl-score">0</b></span><span class="chip combo">🔥 <b id="bl-combo">0</b></span></div>
        </div>
        <div class="card blitz-stage">
          <div class="timebar"><i id="bl-bar"></i></div>
          <div class="blitz-letter" id="bl-letter">⚡</div>
          <div class="blitz-msg" id="bl-msg">${t('blitz.intro')}</div>
        </div>
        <div class="game-kb" id="bl-kb"></div>
      </section>`;
    const kb = BT.KB.create($('#bl-kb'), { colored: true });
    const letterEl = $('#bl-letter');
    const msg = $('#bl-msg');
    const comboChip = $('.blitz .chip.combo');
    let phase = 'ready', score = 0, hits = 0, misses = 0, combo = 0, cur = null, endAt = 0;
    let hintT = null, iv = null;
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const hud = () => {
      $('#bl-score').textContent = score;
      $('#bl-combo').textContent = combo;
      comboChip.classList.toggle('hot', combo >= 10);
    };
    const anim = (cls) => { letterEl.classList.remove('pop', 'shake'); void letterEl.offsetWidth; letterEl.classList.add(cls); };

    function nextChar() {
      let c, tries = 0;
      do { c = pick(pool); } while (c === cur && tries++ < 10);
      cur = c;
      letterEl.textContent = c;
      anim('pop');
      kb.highlight(null);
      clearTimeout(hintT);
      hintT = setTimeout(() => kb.highlight(cur), 1500);
    }
    function start() {
      phase = 'count';
      msg.innerHTML = '&nbsp;';
      let n = 3;
      letterEl.textContent = n;
      BT.Sound.tick();
      const step = () => {
        n--;
        if (n > 0) { letterEl.textContent = n; BT.Sound.tick(); later(step, 700); } else { BT.Sound.go(); play(); }
      };
      later(step, 700);
    }
    function play() {
      phase = 'play';
      endAt = performance.now() + D * 1000;
      msg.textContent = t('blitz.go');
      nextChar();
      iv = setInterval(() => {
        const left = Math.max(0, endAt - performance.now());
        $('#bl-time').textContent = Math.ceil(left / 1000);
        $('#bl-bar').style.width = (left / (D * 1000)) * 100 + '%';
        if (left <= 0) end();
      }, 100);
    }
    function end() {
      if (phase === 'over') return;
      phase = 'over';
      clearInterval(iv);
      clearTimeout(hintT);
      kb.highlight(null);
      letterEl.textContent = '🏁';
      msg.innerHTML = '&nbsp;';
      const res = Pr.gameResult(p, 'blitz', { score, hits, sec: D, keys: hits });
      BT.Sound.success();
      const acc = hits + misses ? hits / (hits + misses) : 1;
      gameOver({ icon: '⚡', title: t('blitz.over'), stats: [[score, t('stat.points')], [hits, t('stat.hits')], [Math.round(acc * 100) + ' %', t('stat.correct')]], res, onAgain: () => App.go('blitz') });
    }

    App.keyHandler = (e) => {
      const ch = BT.keyChar(e);
      if (ch === null) return false;
      e.preventDefault();
      if (e.repeat) return true;
      if (phase === 'ready') { if (ch === ' ') start(); return true; }
      if (phase !== 'play') return true;
      if (ch === cur) {
        hits++;
        combo++;
        const pts = 1 + Math.min(4, Math.floor(combo / 5));
        score += pts;
        kb.flash(ch, true);
        BT.Sound.ok();
        msg.textContent = combo >= 5 ? t('blitz.streak', { n: combo, p: pts }) : t('blitz.keepGoing');
        nextChar();
      } else {
        misses++;
        combo = 0;
        kb.flash(ch, false);
        BT.Sound.error();
        anim('shake');
        msg.textContent = t('blitz.wrong');
      }
      hud();
      return true;
    };
    App.cleanup = () => { phase = 'over'; clearInterval(iv); clearTimeout(hintT); timers.forEach(clearTimeout); };
  };

  /* =================== Wort-Regen =================== */
  S.rain = () => {
    const p = P();
    if (!Pr.gameUnlocked(p, BT.GAMES[1])) return App.go('games');
    const pool = BT.Gen.rainPool(allowedNow(p));
    main().innerHTML = `
      <section class="game rain">
        <div class="sub-head">
          <button class="btn ghost" data-go="games">${t('games.back')}</button><h1>🌧️ ${gameName('rain')}</h1>
          <div class="game-stats"><span class="chip" id="rn-hearts"></span><span class="chip">⭐ <b id="rn-score">0</b></span><span class="chip">Level <b id="rn-level">1</b></span></div>
        </div>
        <div class="rain-field" id="rn-field">
          <div class="rain-ground"></div>
          <div class="rain-banner" id="rn-banner"></div>
          <div class="rain-overlay" id="rn-overlay">
            <div class="big-emoji">🌧️</div>
            <h2>${gameName('rain')}</h2>
            <p>${t('rain.text1')}</p>
            <p>${t('rain.text2')}</p>
            <p class="ov-keys">${t('rain.keys')}</p>
          </div>
        </div>
      </section>`;
    const field = $('#rn-field');
    const overlay = $('#rn-overlay');
    const banner = $('#rn-banner');
    const GROUND = 46;
    let W = field.clientWidth, H = field.clientHeight;
    let words = [], target = null, phase = 'ready', score = 0, level = 1, cleared = 0, hearts = 3;
    let spawnT = 0, last = 0, raf = 0, playMs = 0, keys = 0;
    const cfg = () => ({
      speed: 24 + (level - 1) * 7,
      every: Math.max(1.0, 2.8 - (level - 1) * 0.22),
      max: Math.min(2 + level, 8),
      maxLen: 2 + level,
    });
    const hud = () => {
      $('#rn-hearts').textContent = '❤️'.repeat(Math.max(0, hearts)) + '🤍'.repeat(Math.max(0, 3 - hearts));
      $('#rn-score').textContent = int(score);
      $('#rn-level').textContent = level;
    };
    hud();
    const showBanner = (txt) => { banner.textContent = txt; banner.classList.remove('show'); void banner.offsetWidth; banner.classList.add('show'); };
    const render = (w) => { w.el.firstElementChild.textContent = w.text.slice(0, w.typed); w.el.lastElementChild.textContent = w.text.slice(w.typed); };

    function spawn() {
      const c = cfg();
      if (words.length >= c.max) return;
      const firsts = new Set(words.map((w) => w.text[0]));
      let cand = pool.filter((w) => w.length <= c.maxLen);
      if (cand.length < 6) cand = pool;
      let text = null;
      for (let i = 0; i < 15; i++) { const x = pick(cand); if (!firsts.has(x[0])) { text = x; break; } }
      if (!text) return;
      const el = document.createElement('div');
      el.className = 'drop';
      el.innerHTML = '<span class="typed"></span><span class="rest"></span>';
      field.appendChild(el);
      const w = { text, el, x: 0, y: -56, typed: 0, mul: 0.85 + Math.random() * 0.3 };
      render(w);
      w.h = el.offsetHeight;
      w.x = 12 + Math.random() * Math.max(0, W - el.offsetWidth - 24);
      el.style.transform = `translate(${w.x}px, ${w.y}px)`;
      words.push(w);
    }
    function removeWord(w, cls) {
      words = words.filter((x) => x !== w);
      if (target === w) target = null;
      w.el.classList.add(cls);
      setTimeout(() => w.el.remove(), 450);
    }
    function miss(w) {
      removeWord(w, 'splash');
      hearts--;
      BT.Sound.miss();
      field.classList.remove('hurt'); void field.offsetWidth; field.classList.add('hurt');
      hud();
      if (hearts <= 0) over();
    }
    function popWord(w) {
      removeWord(w, 'pop');
      score += w.text.length * 10 * level;
      cleared++;
      BT.Sound.pop();
      if (cleared % 8 === 0) { level++; showBanner(t('rain.level', { n: level })); BT.Sound.small(); }
      hud();
    }
    function frame(ts) {
      if (phase !== 'play') return;
      const dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      playMs += dt * 1000;
      spawnT -= dt;
      if (spawnT <= 0) { spawn(); spawnT = cfg().every; }
      const sp = cfg().speed;
      for (const w of words.slice()) {
        w.y += sp * w.mul * dt;
        w.el.style.transform = `translate(${w.x}px, ${w.y}px)`;
        if (w.y + w.h >= H - GROUND) { miss(w); if (phase !== 'play') return; }
      }
      raf = requestAnimationFrame(frame);
    }
    function resume() {
      phase = 'play';
      overlay.hidden = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function pause() {
      if (phase !== 'play') return;
      phase = 'pause';
      cancelAnimationFrame(raf);
      overlay.innerHTML = `<div class="big-emoji">⏸️</div><h2>${t('pause.title')}</h2><p class="ov-keys">${t('rain.resume')}</p>`;
      overlay.hidden = false;
    }
    function over() {
      phase = 'over';
      cancelAnimationFrame(raf);
      const res = Pr.gameResult(p, 'rain', { score, words: cleared, sec: playMs / 1000, keys });
      BT.Sound.lose();
      gameOver({ icon: '🌧️', title: t('rain.over'), sub: t('rain.sub', { n: cleared }),
        stats: [[int(score), t('stat.points')], [cleared, t('stat.words')], [level, t('stat.level')]], res, onAgain: () => App.go('rain') });
    }

    App.keyHandler = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); pause(); return true; }
      const ch = BT.keyChar(e);
      if (ch === null) return false;
      e.preventDefault();
      if (e.repeat) return true;
      if (phase === 'ready' || phase === 'pause') {
        if (ch === ' ') { if (phase === 'ready') spawnT = 0; resume(); }
        return true;
      }
      if (phase !== 'play' || ch === ' ') return true;
      keys++;
      if (!target) {
        const cands = words.filter((w) => w.text[0] === ch);
        if (!cands.length) { BT.Sound.error(); return true; }
        target = cands.reduce((a, b) => (a.y > b.y ? a : b));
        target.el.classList.add('target');
      }
      if (target.text[target.typed] === ch) {
        target.typed++;
        render(target);
        BT.Sound.key();
        if (target.typed >= target.text.length) popWord(target);
      } else {
        BT.Sound.error();
        const el = target.el;
        el.classList.remove('wrong'); void el.offsetWidth; el.classList.add('wrong');
      }
      return true;
    };
    const onResize = () => { W = field.clientWidth; H = field.clientHeight; };
    const onVis = () => { if (document.hidden) pause(); };
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVis);
    App.cleanup = () => {
      phase = 'over';
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
    };
  };

  /* =================== Tier-Rennen =================== */
  const racerUnlocked = (p, i) => i === 0 || p.settings.unlockAll || (p.games.race[BT.RACERS[i - 1].id] || 0) > 0;

  S.raceSelect = () => {
    const p = P();
    if (!Pr.gameUnlocked(p, BT.GAMES[2])) return App.go('games');
    main().innerHTML = `
      <section class="race-select">
        <div class="sub-head"><button class="btn ghost" data-go="games">${t('games.back')}</button><h1>🏁 ${gameName('race')}</h1></div>
        <p class="lead-sm">${t('race.lead')}</p>
        <div class="racer-grid">${BT.RACERS.map((r, i) => {
          const won = (p.games.race[r.id] || 0) > 0;
          const unl = racerUnlocked(p, i);
          return `<button class="card racer${won ? ' won' : ''}${unl ? '' : ' locked'}" data-i="${i}"${unl ? '' : ' disabled'}>
              <span class="racer-ic"><span class="flip">${r.icon}</span></span>
              <b>${esc(Pr.racerName(r.id))}</b>
              <span class="racer-speed">${t('race.speed', { n: r.zpm })}</span>
              <span class="racer-state">${won ? t('race.beaten', { n: p.games.race[r.id] }) : (unl ? t('race.challenge') : t('race.locked'))}</span>
            </button>`;
        }).join('')}</div>
      </section>`;
    $$('.racer[data-i]').forEach((b) => { b.onclick = () => { if (!b.disabled) App.go('race', Number(b.dataset.i)); }; });
  };

  S.race = (i) => {
    const p = P();
    if (!Pr.gameUnlocked(p, BT.GAMES[2])) return App.go('games');
    i = Math.max(0, Math.min(BT.RACERS.length - 1, Number(i) || 0));
    if (!racerUnlocked(p, i)) return App.go('raceSelect');
    const r = BT.RACERS[i];
    const rName = esc(Pr.racerName(r.id));
    const text = BT.Gen.raceText(allowedNow(p), 70 + i * 12);
    main().innerHTML = `
      <section class="game race">
        <div class="sub-head"><button class="btn ghost" data-go="raceSelect">${t('race.back')}</button><h1>🏁 ${gameName('race')}</h1><span class="chip">${r.icon} ${rName} · ${t('race.speed', { n: r.zpm })}</span></div>
        <div class="card track">
          <div class="lane"><span class="lane-label">${rName}</span><span class="runner" id="rc-opp"><span class="flip">${r.icon}</span></span><span class="finish">🏁</span></div>
          <div class="lane me"><span class="lane-label">${esc(p.name)}</span><span class="runner" id="rc-me">${esc(p.avatar)}</span><span class="finish">🏁</span></div>
          <div class="countdown" id="rc-count"><span class="cd-text">${t('race.start')}</span></div>
        </div>
        <div id="rc-view"></div>
      </section>`;
    let phase = 'ready', startAt = 0, raf = 0, oppProg = 0;
    const timers = [];
    const view = BT.TypingView.create($('#rc-view'), text, { compact: true, onDone: () => finish(true) });
    const oppEl = $('#rc-opp');
    const meEl = $('#rc-me');
    const count = $('#rc-count');
    const lane = oppEl.parentElement;
    const place = (el, prog) => {
      const maxX = Math.max(0, lane.clientWidth - el.offsetWidth - 52);
      el.style.transform = `translateX(${Math.max(0, Math.min(1, prog)) * maxX}px)`;
    };
    const oppAt = (ms) => Math.min(1, (ms / 60000) * r.zpm / text.length);

    function frame(ts) {
      if (phase !== 'play') return;
      oppProg = oppAt(ts - startAt);
      place(oppEl, oppProg);
      place(meEl, view.typer.pos / text.length);
      if (oppProg >= 1) { finish(false); return; }
      raf = requestAnimationFrame(frame);
    }
    function startCount() {
      phase = 'count';
      let n = 3;
      count.innerHTML = `<span class="cd-num">${n}</span>`;
      BT.Sound.tick();
      const step = () => {
        n--;
        if (n > 0) {
          count.innerHTML = `<span class="cd-num">${n}</span>`;
          BT.Sound.tick();
          timers.push(setTimeout(step, 800));
        } else {
          count.innerHTML = `<span class="cd-num go">${t('race.go')}</span>`;
          BT.Sound.go();
          phase = 'play';
          startAt = performance.now();
          raf = requestAnimationFrame(frame);
          timers.push(setTimeout(() => { count.hidden = true; }, 700));
        }
      };
      timers.push(setTimeout(step, 800));
    }
    function finish(playerDone) {
      if (phase === 'over') return;
      phase = 'over';
      cancelAnimationFrame(raf);
      const ms = performance.now() - startAt;
      oppProg = oppAt(ms);
      place(meEl, view.typer.pos / text.length);
      place(oppEl, oppProg);
      const win = playerDone && oppProg < 1;
      const zpm = ms > 0 ? view.typer.pos / (ms / 60000) : 0;
      const tr = view.typer.result();
      App.keyHandler = (e) => { if (BT.keyChar(e) !== null) e.preventDefault(); return true; };
      if (tr.correct > 0) Pr.recordRound(p, tr, { kind: 'race', id: r.id });
      const res = Pr.gameResult(p, 'race', { win, id: r.id, zpm, rank: i, sec: 0, keys: 0 });
      const nextR = BT.RACERS[i + 1];
      if (win) { BT.Sound.success(); App.confetti(); } else BT.Sound.lose();
      timers.push(setTimeout(() => gameOver({
        icon: win ? '🏆' : r.icon,
        title: win ? t('race.win') : t('race.lose'),
        sub: win ? t('race.winSub', { name: rName }) : t('race.loseSub', { name: rName }),
        stats: [[Math.round(zpm), t('race.you')], [r.zpm, t('race.them', { icon: r.icon })], [Math.round(tr.acc * 100) + ' %', t('stat.correct')]],
        res,
        back: 'raceSelect',
        backLabel: t('race.back'),
        onAgain: () => App.go('race', i),
        next: win && nextR ? { label: t('race.next', { icon: nextR.icon }), fn: () => App.go('race', i + 1) } : null,
      }), 500));
    }

    place(oppEl, 0);
    place(meEl, 0);
    App.keyHandler = (e) => {
      if (phase === 'play') return view.handleKey(e);
      const ch = BT.keyChar(e);
      if (ch === null) return false;
      e.preventDefault();
      if (phase === 'ready' && ch === ' ' && !e.repeat) startCount();
      return true;
    };
    App.cleanup = () => { phase = 'over'; cancelAnimationFrame(raf); timers.forEach(clearTimeout); };
  };
})(window.BT);
