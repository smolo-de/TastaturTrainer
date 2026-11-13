'use strict';
/* BlindTrainer – Übungstexte erzeugen (nur mit Tasten, die schon gelernt wurden) */
(function (BT) {
  const VOW = new Set(['a', 'e', 'i', 'o', 'u', 'ä', 'ö', 'ü']);
  const LETTER = /^[a-zäöüß]$/;
  const PUNCT = new Set([',', '.', '-', ';', "'", '/']);
  const WORDCHARS = /^[a-zäöüß]+$/;
  const rnd = (n) => Math.floor(Math.random() * n);
  const pick = (a) => a[rnd(a.length)];
  const randInt = (a, b) => a + rnd(b - a + 1);
  const isUpper = (w) => w[0] !== w[0].toLowerCase();
  const BLOCK = /geil|sex|fick|arsch|kack|scheis|scheiß|hure|fotz|piss|nazi|nutt|wix|titt|penis|furz|doof|blöd|dumm|idiot|kotz|shit|fuck|damn|crap|dick|cock|cunt|bitch|slut|whore|nigg|fag|butt|kill|stupid|hate/;

  /* Gruppen aneinanderreihen, bis die Ziellänge erreicht ist (ohne direkte Wiederholung) */
  function fill(target, producer) {
    const parts = [];
    let len = 0, last = null, guard = 0;
    while (len < target && guard++ < 400) {
      let s = producer(), tries = 0;
      while (s === last && tries++ < 6) s = producer();
      parts.push(s);
      len += s.length + (parts.length > 1 ? 1 : 0);
      last = s;
    }
    return parts.join(' ');
  }

  function pickSentences(pool, target, pri) {
    const used = new Set();
    const out = [];
    let len = 0, guard = 0;
    while (len < target && guard++ < 80) {
      const src = (pri && pri.length && Math.random() < 0.6) ? pri : pool;
      const s = pick(src);
      if (used.has(s) && used.size < pool.length) continue;
      used.add(s);
      out.push(s);
      len += s.length + 1;
    }
    return out.join(' ');
  }

  const G = BT.Gen = {
    pick, randInt, fill,

    roundLen(idx, r) { return Math.round([36, 48, 60][r] * (1 + idx * 0.03)); },

    /* Erlaubte Zeichen bis einschließlich Lektion idx */
    allowed(idx) {
      const set = new Set([' ']);
      let shift = false;
      for (let i = 0; i <= idx && i < BT.LESSONS.length; i++) {
        const L = BT.LESSONS[i];
        if (L.type === 'shift') shift = true;
        L.keys.forEach((c) => set.add(c));
      }
      return { set, shift };
    },

    letters(set) { return [...set].filter((c) => LETTER.test(c)); },

    canType(str, al) {
      for (const c of str) {
        if (al.set.has(c)) continue;
        const lc = c.toLowerCase();
        if (lc !== c && al.shift && al.set.has(lc)) continue;
        return false;
      }
      return true;
    },

    wordsFor(al) {
      const out = [];
      const seen = new Set();
      /* Deutsch: Nomen vor der Großbuchstaben-Lektion klein üben. Englisch (keepCase): Eigennamen erst danach. */
      const keepCase = BT.locale && BT.locale.meta.keepCase;
      for (const w of BT.WORDS) {
        if (keepCase && !al.shift && isUpper(w)) continue;
        const cand = al.shift ? w : w.toLowerCase();
        if (seen.has(cand)) continue;
        if (G.canType(cand, al)) { seen.add(cand); out.push(cand); }
      }
      return out;
    },

    /* Aussprechbare Fantasie-Silbe – ohne zufällig entstehende unpassende Wörter */
    syllable(letters, focus, L) {
      let s = G.rawSyllable(letters, focus, L);
      for (let i = 0; i < 8 && BLOCK.test(s); i++) s = G.rawSyllable(letters, focus, L);
      return s;
    },

    rawSyllable(letters, focus, L) {
      const vow = letters.filter((c) => VOW.has(c));
      const con = letters.filter((c) => !VOW.has(c));
      let s = '';
      for (let i = 0; i < L; i++) {
        let pool = letters;
        if (vow.length && con.length) {
          const lastV = s && VOW.has(s[s.length - 1]);
          if (lastV) pool = Math.random() < 0.75 ? con : vow;
          else if (s) pool = Math.random() < 0.7 ? vow : con;
          else pool = Math.random() < 0.6 ? con : vow;
        }
        const fpool = focus.filter((c) => pool.includes(c));
        s += (fpool.length && Math.random() < 0.4) ? pick(fpool) : pick(pool);
      }
      if (focus.length && focus !== letters && !focus.some((c) => s.includes(c))) {
        const i = rnd(L);
        s = s.slice(0, i) + pick(focus) + s.slice(i + 1);
      }
      return s;
    },

    /* Runde 1: neue Tasten im Wechsel mit der Grundstellung */
    drill(newKeys, target) {
      const T = [];
      const anchor = (k) => {
        const f = BT.CHAR_MAP[k] && BT.CHAR_MAP[k].key.finger;
        const home = BT.HOME[f];
        if (home && home !== k) return home;
        const left = BT.FINGERS[f] && BT.FINGERS[f].hand === 'L';
        const idx = left ? 'f' : 'j';
        return idx !== k ? idx : (left ? 'j' : 'f');
      };
      newKeys.forEach((k) => {
        const h = anchor(k);
        if (PUNCT.has(k)) {
          if (k === '-') T.push(h + k + h, h + h + k + h);
          else T.push(h + k, h + h + k, h + h + h + k);
        } else {
          T.push(k + k + k, k + k, h + k + h, k + h + k, h + k, k + h, h + h + k);
        }
      });
      const ls = newKeys.filter((c) => LETTER.test(c));
      for (let i = 0; i < ls.length; i++) {
        for (let j = i + 1; j < ls.length; j++) {
          const a = ls[i], b = ls[j];
          T.push(a + b, b + a, a + b + a, b + a + b, a + a + b, b + b + a);
        }
      }
      return fill(target, () => pick(T));
    },

    /* Runde 2: Buchstaben-Mix aus allen bekannten Tasten */
    mix(al, newKeys, target) {
      const letters = G.letters(al.set);
      const nl = newKeys.filter((k) => LETTER.test(k));
      const punct = newKeys.filter((k) => PUNCT.has(k));
      const focus = nl.length ? nl : letters;
      return fill(target, () => {
        let s = G.syllable(letters, focus, randInt(3, 5));
        if (punct.length && Math.random() < 0.45) {
          const pc = pick(punct);
          s = pc === '-' ? s + '-' + G.syllable(letters, focus, randInt(2, 4)) : s + pc;
        }
        return s;
      });
    },

    /* Runde 3: echte Wörter (oder Silben, wenn es noch zu wenige gibt) */
    words(al, newKeys, target) {
      const all = G.wordsFor(al);
      const punct = newKeys.filter((k) => PUNCT.has(k) && k !== "'");
      if (all.length < 6) return { label: BT.t('round.syllables'), text: G.mix(al, newKeys, target) };
      const focus = newKeys.filter((k) => LETTER.test(k) || k === "'");
      const pri = focus.length ? all.filter((w) => focus.some((k) => w.toLowerCase().includes(k))) : all;
      const text = fill(target, () => {
        let w = (pri.length >= 3 && Math.random() < 0.75) ? pick(pri) : pick(all);
        if (punct.length && Math.random() < 0.35) {
          const pc = pick(punct);
          w = pc === '-' ? w + '-' + pick(all) : w + pc;
        }
        return w;
      });
      return { label: BT.t('round.words'), text };
    },

    sentences(al, target, prefer) {
      const pool = BT.SENTENCES.filter((s) => G.canType(s, al));
      if (!pool.length) return G.words(al, [], target).text;
      return pickSentences(pool, target, prefer ? pool.filter(prefer) : null);
    },

    capsShort(al, target) {
      const nouns = G.wordsFor(al).filter(isUpper);
      const short = nouns.filter((w) => w.length <= 5);
      return fill(target, () => pick(short.length >= 6 ? short : nouns));
    },

    nouns(al, target) {
      const ws = G.wordsFor(al);
      const nouns = ws.filter(isUpper);
      const lower = ws.filter((w) => !isUpper(w));
      return fill(target, () => (Math.random() < 0.7 ? pick(nouns) : pick(lower)));
    },

    punctDrill(al, keys, target) {
      const short = G.wordsFor(al).filter((w) => !isUpper(w) && w.length <= 4);
      return fill(target, () => pick(short) + pick(keys));
    },

    punctWords(target) {
      const I = BT.INTERJECTIONS;
      return fill(target, () => {
        const r = Math.random();
        if (r < 0.4) return pick(I.excl) + '!';
        if (r < 0.8) return pick(I.quest) + '?';
        return pick(I.colon) + ':';
      });
    },

    digitDrill(target) {
      const T = ['11', '22', '33', '44', '55', '66', '77', '88', '99', '00', '12', '21', '34', '43', '56', '65', '78', '87',
        '90', '09', '123', '456', '789', '147', '258', '369', '1234', '5678', '0987', '1010', '2020'];
      return fill(target, () => pick(T));
    },

    numbers(target) {
      return fill(target, () => String(randInt(1, pick([10, 100, 1000, 10000]) - 1)));
    },

    numberSentences(target) { return pickSentences(BT.NUMBER_SENTENCES, target); },

    /* Alle drei Runden einer Lektion */
    lessonTexts(idx) {
      const L = BT.LESSONS[idx];
      const al = G.allowed(idx);
      const len = (r) => G.roundLen(idx, r);
      const t = (k) => BT.t('round.' + k);
      switch (L.type) {
        case 'shift':
          return [
            { label: t('capitals'), text: G.capsShort(al, len(0)) },
            { label: t('nouns'), text: G.nouns(al, len(1)) },
            { label: t('sentences'), text: G.sentences(al, len(2)) },
          ];
        case 'punct':
          return [
            { label: t('punct'), text: G.punctDrill(al, L.keys, len(0)) },
            { label: t('exclaim'), text: G.punctWords(len(1)) },
            { label: t('sentences'), text: G.sentences(al, len(2), (s) => /[!?:]/.test(s)) },
          ];
        case 'numbers':
          return [
            { label: t('digitDrill'), text: G.digitDrill(len(0)) },
            { label: t('numbers'), text: G.numbers(len(1)) },
            { label: t('numberSentences'), text: G.numberSentences(len(2)) },
          ];
        case 'sentences':
          return [0, 1, 2].map((r) => ({ label: t('sentences'), text: G.sentences(al, len(r) + 10) }));
        case 'review':
          return [0, 1, 2].map((r) => G.words(al, [], len(r) + 10));
        default: {
          return [
            { label: t('newKeys'), text: G.drill(L.keys, len(0)) },
            { label: t('mix'), text: G.mix(al, L.keys, len(1)) },
            G.words(al, L.keys, len(2)),
          ];
        }
      }
    },

    /* Training */
    trainingText(p, kind) {
      const idx = BT.Progress.learnedIdx(p);
      const al = G.allowed(idx);
      const len = 90;
      if (kind === 'weak') {
        const weak = BT.Progress.weakKeys(p, 5).map((w) => w.ch);
        if (!weak.length) return G.words(al, [], len).text;
        const letters = G.letters(al.set);
        const wl = weak.filter((c) => LETTER.test(c));
        const words = G.wordsFor({ set: al.set, shift: false }).filter((w) => weak.some((c) => w.includes(c)));
        return fill(len, () => {
          if (words.length >= 3 && Math.random() < 0.6) return pick(words);
          if (wl.length) return G.syllable(letters, wl, randInt(3, 5));
          return pick(letters) + pick(letters) + pick(weak);
        });
      }
      if (kind === 'home') return G.words(G.allowed(4), [], len).text;
      if (kind === 'sentences') return G.sentences(al, len + 30);
      return G.words(al, [], len).text;
    },

    /* Spiele */
    blitzPool(al) {
      const pool = G.letters(al.set).concat([...al.set].filter((c) => /[0-9]/.test(c)));
      return pool.length >= 2 ? pool : ['f', 'j'];
    },

    rainPool(al) {
      const words = G.wordsFor({ set: al.set, shift: false }).filter((w) => w.length >= 2 && WORDCHARS.test(w));
      if (words.length >= 10) return words;
      const letters = G.letters(al.set);
      const L = letters.length ? letters : ['f', 'j'];
      const out = new Set(words);
      let guard = 0;
      while (out.size < 40 && guard++ < 400) out.add(G.syllable(L, L, randInt(2, 4)));
      return [...out];
    },

    raceText(al, len) {
      if (al.shift) return G.sentences(al, len);
      return G.words(al, [], len).text;
    },
  };
})(window.BT);
