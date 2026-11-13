'use strict';
/* BlindTrainer – Fortschritt, Sterne, XP, Level, Abzeichen */
(function (BT) {
  const pad = (n) => String(n).padStart(2, '0');
  const dayKey = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());

  const Pr = BT.Progress = {
    dayKey,
    onGoal: null,

    /* ---------- Level ---------- */
    xpFor(n) { return 50 * n * (n - 1); },
    levelFromXp(xp) {
      const x = Math.max(0, Number(xp) || 0);
      let lv = 1;
      while (lv < 1000 && x >= Pr.xpFor(lv + 1)) lv++;
      return lv;
    },
    levelTitle(lv) { return BT.LEVEL_TITLES[Math.min(lv - 1, BT.LEVEL_TITLES.length - 1)]; },
    levelInfo(xp) {
      const level = Pr.levelFromXp(xp);
      const cur = Pr.xpFor(level), nxt = Pr.xpFor(level + 1);
      return { level, title: Pr.levelTitle(level), into: xp - cur, need: nxt - cur, pct: Math.round(((xp - cur) / (nxt - cur)) * 100) };
    },
    addXp(p, n) {
      const before = Pr.levelFromXp(p.xp);
      p.xp = Math.min(10000000, p.xp + Math.max(0, Math.round(n)));
      const after = Pr.levelFromXp(p.xp);
      return { levelUp: after > before, level: after, newAvatars: BT.AVATARS.filter((a) => a.lvl > before && a.lvl <= after) };
    },

    /* ---------- Lektionen (Fortschritt pro Kurs/Layout) ---------- */
    lkey(i) { return BT.COURSE_ID + ':' + BT.LESSONS[i].id; },
    rec(p, i) { return p.lessons[Pr.lkey(i)] || null; },
    stars(p, i) { const r = Pr.rec(p, i); return (r && r.stars) || 0; },
    totalStars(p) { return BT.LESSONS.reduce((s, _, i) => s + Pr.stars(p, i), 0); },
    isUnlocked(p, i) { return i === 0 || p.settings.unlockAll || Pr.stars(p, i - 1) >= 1; },
    nextLesson(p) {
      for (let i = 0; i < BT.LESSONS.length; i++) if (Pr.stars(p, i) === 0) return Pr.isUnlocked(p, i) ? i : null;
      return null;
    },
    learnedIdx(p) {
      if (p.settings.unlockAll) return BT.LESSONS.length - 1;
      let m = 0;
      BT.LESSONS.forEach((_, i) => { if (Pr.stars(p, i) >= 1) m = i; });
      return m;
    },
    gameUnlocked(p, g) { return !g.unlockAfter || p.settings.unlockAll || Pr.stars(p, g.unlockAfter - 1) >= 1; },
    speedTarget(idx) { return Math.round((25 + idx * 3.5) / 5) * 5; },
    starsFor(idx, acc, zpm) {
      if (acc >= 0.96 && zpm >= Pr.speedTarget(idx)) return 3;
      if (acc >= 0.9) return 2;
      if (acc >= 0.8) return 1;
      return 0;
    },
    praise(acc) {
      const tier = BT.PRAISE.find((t) => acc >= t.min) || BT.PRAISE[BT.PRAISE.length - 1];
      return BT.Gen.pick(tier.texts);
    },

    /* ---------- Texte ---------- */
    achTitle(a) { return (BT.locale.achievements[a.id] || [a.id])[0]; },
    achDesc(a) { return (BT.locale.achievements[a.id] || ['', ''])[1]; },
    racerName(id) { return BT.locale.racers[id] || id; },
    histLabel(h) {
      if (h.kind === 'lesson' && h.l) return BT.t('hist.lesson', { l: h.l, r: h.r || 1 });
      if (h.kind === 'training' && h.k) return BT.t('hist.training', { name: BT.t('training.' + h.k) });
      if (h.kind === 'race' && h.id) return BT.t('hist.race', { name: Pr.racerName(h.id) });
      return h.label || '';
    },

    /* ---------- Tage, Serie, Tagesziel ---------- */
    todayRec(p) { return p.days[dayKey(new Date())] || { sec: 0, keys: 0 }; },
    streak(p) {
      const has = (dt) => ((p.days[dayKey(dt)] || {}).sec || 0) >= 20;
      const d = new Date();
      if (!has(d)) d.setDate(d.getDate() - 1);
      let n = 0;
      while (has(d) && n < 3650) { n++; d.setDate(d.getDate() - 1); }
      return n;
    },
    addTime(p, sec, keys) {
      const k = dayKey(new Date());
      const d = p.days[k] || (p.days[k] = { sec: 0, keys: 0 });
      const goal = p.settings.dailyGoal * 60;
      const before = d.sec;
      d.sec += sec;
      d.keys += keys || 0;
      if (before < goal && d.sec >= goal) {
        p.totals.goalDays = (p.totals.goalDays || 0) + 1;
        if (Pr.onGoal) setTimeout(Pr.onGoal, 900);
      }
      p.totals.bestStreak = Math.max(p.totals.bestStreak || 0, Pr.streak(p));
    },

    /* ---------- Runden & Ergebnisse ---------- */
    recordRound(p, res, meta) {
      const t = p.totals;
      t.keys += res.correct;
      t.errors += res.wrong;
      t.time += res.activeMs / 1000;
      t.rounds++;
      if (res.wrong === 0 && res.correct >= 15) t.perfectRounds++;
      if (res.correct >= 30 && res.acc >= 0.85) t.bestZpm = Math.max(t.bestZpm, Math.round(res.zpm));
      Object.entries(res.keyLog).forEach(([ch, s]) => {
        const ks = p.keyStats[ch] || (p.keyStats[ch] = { h: 0, e: 0 });
        ks.h += s.h; ks.e += s.e;
      });
      Pr.addTime(p, res.activeMs / 1000, res.correct);
      p.history.push(Object.assign({ t: Date.now(), zpm: Math.round(res.zpm), acc: Math.round(res.acc * 1000) / 1000 }, meta));
      if (p.history.length > 100) p.history.splice(0, p.history.length - 100);
      BT.Store.save();
    },

    finishLesson(p, idx, rounds, blind) {
      const correct = rounds.reduce((s, r) => s + r.correct, 0);
      const wrong = rounds.reduce((s, r) => s + r.wrong, 0);
      const active = rounds.reduce((s, r) => s + r.activeMs, 0);
      const acc = correct + wrong ? correct / (correct + wrong) : 1;
      const zpm = active > 1000 ? Math.max(0, correct - rounds.length) / (active / 60000) : 0;
      const stars = Pr.starsFor(idx, acc, zpm);
      const key = Pr.lkey(idx);
      const rec = p.lessons[key] || { stars: 0, bestZpm: 0, bestAcc: 0, plays: 0 };
      const prevStars = rec.stars;
      const firstPass = prevStars === 0 && stars > 0;
      rec.plays++;
      rec.stars = Math.max(rec.stars, stars);
      rec.bestZpm = Math.max(rec.bestZpm, Math.round(zpm));
      rec.bestAcc = Math.max(rec.bestAcc, Math.round(acc * 1000) / 1000);
      p.lessons[key] = rec;

      let xp = correct;
      if (stars > 0) xp += stars * 15;
      if (firstPass) xp += 50;
      if (stars > prevStars) xp += (stars - prevStars) * 10;
      const blindBonus = blind && stars > 0;
      if (blindBonus) { xp = Math.round(xp * 1.25); p.totals.blindLessons++; }
      const lvl = Pr.addXp(p, xp);
      const ach = Pr.checkAchievements(p);
      BT.Store.save();
      return Object.assign({ idx, acc, zpm, stars, prevStars, firstPass, xp, ach, passed: stars > 0, blind: blindBonus, correct, wrong }, lvl);
    },

    trainingDone(p, res) {
      const lvl = Pr.addXp(p, res.correct);
      const ach = Pr.checkAchievements(p);
      BT.Store.save();
      return Object.assign({ xp: res.correct, ach }, lvl);
    },

    gameResult(p, game, d) {
      let record = false, xp = 0;
      const g = p.games;
      if (game === 'blitz') {
        if (d.score > g.blitz) { g.blitz = d.score; record = true; }
        g.blitzHits = Math.max(g.blitzHits, d.hits);
        xp = d.hits;
      } else if (game === 'rain') {
        if (d.score > g.rain) { g.rain = d.score; record = true; }
        g.rainWords = Math.max(g.rainWords || 0, d.words);
        xp = Math.round(d.score / 15);
      } else if (game === 'race') {
        if (d.win) {
          const prev = g.race[d.id] || 0;
          if (!prev || d.zpm > prev) { g.race[d.id] = Math.max(1, Math.round(d.zpm)); record = true; }
          xp = 25 + d.rank * 15;
        } else xp = 5;
      }
      p.totals.gameTime += d.sec || 0;
      Pr.addTime(p, d.sec || 0, d.keys || 0);
      const lvl = Pr.addXp(p, xp);
      const ach = Pr.checkAchievements(p);
      BT.Store.save();
      return Object.assign({ record, xp, ach }, lvl);
    },

    /* ---------- Auswertung ---------- */
    weakKeys(p, n = 5) {
      const al = BT.Gen.allowed(Pr.learnedIdx(p));
      const agg = {};
      Object.entries(p.keyStats).forEach(([ch, s]) => {
        if (ch === ' ') return;
        const lc = ch.toLowerCase();
        const a = agg[lc] || (agg[lc] = { h: 0, e: 0 });
        a.h += s.h; a.e += s.e;
      });
      return Object.entries(agg)
        .map(([ch, s]) => ({ ch, rate: s.e / (s.h + s.e), n: s.h + s.e }))
        .filter((x) => x.n >= 12 && x.rate >= 0.04 && al.set.has(x.ch))
        .sort((a, b) => b.rate - a.rate)
        .slice(0, n);
    },

    keyHeat(p) {
      const byKey = {};
      Object.entries(p.keyStats).forEach(([ch, s]) => {
        const m = BT.CHAR_MAP[ch];
        if (!m) return;
        const a = byKey[m.key.id] || (byKey[m.key.id] = { h: 0, e: 0 });
        a.h += s.h; a.e += s.e;
      });
      return byKey;
    },

    checkAchievements(p) {
      const out = [];
      BT.ACHIEVEMENTS.forEach((a) => {
        if (p.achievements[a.id]) return;
        let ok = false;
        try { ok = a.check(p); } catch (e) { ok = false; }
        if (ok) { p.achievements[a.id] = Date.now(); out.push(a); }
      });
      return out;
    },
  };

  /* ---------- Abzeichen (Texte stehen in der Sprachdatei) ---------- */
  const done = (p) => BT.LESSONS.filter((_, i) => Pr.stars(p, i) >= 1).length;
  const worldDone = (p, w) => BT.LESSONS.every((L, i) => L.world !== w || Pr.stars(p, i) >= 1);
  const A = (id, icon, check) => ({ id, icon, check });

  BT.ACHIEVEMENTS = [
    A('first', '🎉', (p) => done(p) >= 1),
    A('guide', '📖', (p) => !!p.flags.guideDone),
    A('world0', '🏝️', (p) => worldDone(p, 0)),
    A('world1', '🌳', (p) => worldDone(p, 1)),
    A('world2', '💎', (p) => worldDone(p, 2)),
    A('world3', '🐉', (p) => worldDone(p, 3)),
    A('perfect', '💯', (p) => p.totals.perfectRounds >= 1),
    A('perfect10', '🎯', (p) => p.totals.perfectRounds >= 10),
    A('stars10', '⭐', (p) => Pr.totalStars(p) >= 10),
    A('stars30', '🌟', (p) => Pr.totalStars(p) >= 30),
    A('starsAll', '✨', (p) => Pr.totalStars(p) >= BT.LESSONS.length * 3),
    A('keys1k', '⌨️', (p) => p.totals.keys >= 1000),
    A('keys10k', '🚀', (p) => p.totals.keys >= 10000),
    A('keys50k', '🌌', (p) => p.totals.keys >= 50000),
    A('speed60', '🐇', (p) => p.totals.bestZpm >= 60),
    A('speed100', '⚡', (p) => p.totals.bestZpm >= 100),
    A('speed150', '🔥', (p) => p.totals.bestZpm >= 150),
    A('goal', '🥇', (p) => (p.totals.goalDays || 0) >= 1),
    A('streak3', '📅', (p) => p.totals.bestStreak >= 3),
    A('streak7', '🏅', (p) => p.totals.bestStreak >= 7),
    A('blind', '🙈', (p) => p.totals.blindLessons >= 1),
    A('blitz', '💥', (p) => p.games.blitzHits >= 50),
    A('rain', '🌧️', (p) => p.games.rain >= 500),
    A('race1', '🏁', (p) => Object.values(p.games.race).some((v) => v > 0)),
    A('raceAll', '🏆', (p) => (p.games.race.cheetah || 0) > 0),
    A('level5', '🎖️', (p) => Pr.levelFromXp(p.xp) >= 5),
    A('level10', '👑', (p) => Pr.levelFromXp(p.xp) >= 10),
  ];
})(window.BT);
