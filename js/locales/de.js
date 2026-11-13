'use strict';
/* BlindTrainer – Deutsch (deutsche Tastatur, QWERTZ) */
(function (BT) {
  const plural = (n, one, many) => (n === 1 ? one : many);

  BT.I18N.de = {
    meta: { code: 'de', name: 'Deutsch', flag: 'DE', locale: 'de-DE', layout: 'qwertz', keyboard: 'Deutsche Tastatur (QWERTZ)' },

    ui: {
      app: { title: 'BlindTrainer – 10-Finger-Abenteuer', mascot: 'Professor Uhu' },
      common: { cancel: 'Abbrechen', ok: 'OK', back: 'Zurück', again: '↻ Nochmal', save: 'Speichern' },
      top: {
        home: 'Startseite', stars: 'Gesammelte Sterne', streak: 'Tage hintereinander geübt',
        level: '{title} – {into} von {need} XP', sound: 'Ton an/aus', switchProfile: 'Profil wechseln',
      },
      toast: {
        goal: '🥇 <b>Tagesziel erreicht!</b> Super, weiter so!',
        noStorage: '⚠️ Dein Browser erlaubt kein Speichern. Der Fortschritt geht beim Schließen verloren.',
        prevLesson: '🔒 Schaffe zuerst die Lektion davor!',
        lessonLocked: '🔒 Diese Lektion ist noch gesperrt.',
        newBadge: '{icon} Neues Abzeichen: <b>{title}</b>',
        nameSaved: '✓ Name gespeichert',
        unlocked: '🔓 Alle Lektionen und Spiele sind frei.',
        backupLoaded: '✓ Sicherung geladen',
        invalidBackup: '⚠️ Die Datei ist keine gültige Sicherung.',
        fileTooBig: '⚠️ Die Datei ist zu groß für eine Sicherung.',
        progressReset: 'Fortschritt zurückgesetzt',
      },
      reward: {
        levelUp: '🎉 <b>Level {level}</b> erreicht: {title}!',
        newAnimals: 'Neue Tiere freigeschaltet:',
        choose: 'Jetzt auswählen',
        newBadges: 'Neue Abzeichen!',
        record: '🏅 Neuer Rekord!',
      },
      welcome: {
        title: 'Willkommen beim BlindTrainer!',
        lead: 'Lerne das 10-Finger-System – Schritt für Schritt, mit Spielen, Sternen und Abzeichen.',
        who: 'Wer übt heute?',
        profileSub: 'Level {level} · ⭐ {stars}',
        newProfile: 'Neues Profil',
        newProfileSub: 'Für jedes Kind eins',
        privacy: 'Alle Daten bleiben auf diesem Computer. Es wird nichts ins Internet geschickt.',
        language: 'Sprache',
      },
      profile: {
        title: 'Neues Profil', name: 'Wie heißt du?', namePh: 'Dein Name', animal: 'Wähle dein Tier:',
        more: 'Weitere Tiere schaltest du mit höheren Levels frei!', go: "Los geht's!",
      },
      hello: {
        title: 'Hallo {name}!',
        intro: 'Ich bin <b>{mascot}</b> und begleite dich auf deinem Tipp-Abenteuer.',
        guide: 'Bevor es losgeht: Schau dir kurz an, wie das 10-Finger-System funktioniert. Das dauert nur zwei Minuten!',
        skip: 'Gleich loslegen', toGuide: "📖 So geht's",
      },
      home: {
        greetings: ['Hallo', 'Hi', 'Hey', 'Schön, dich zu sehen'],
        hiNew: 'Hallo <b>{name}</b>! Schön, dass du da bist. Schau dir zuerst <b>„So geht\'s“</b> an – dann starten wir mit Lektion 1!',
        hiDone: 'Wow, <b>{name}</b>! Du hast alle Lektionen geschafft. Sammle jetzt alle Sterne oder fordere die Tiere im Rennen heraus!',
        hi: '{greeting}, <b>{name}</b>!',
        continue: '▶ Lektion {n}: {title}',
        toMap: '🗺️ Zum Lernpfad',
        guide: "📖 So geht's",
        goal: 'Tagesziel',
        goalOf: '{min} von {goal} Minuten',
        streak: (p) => `🔥 <b>${p.n}</b> ${plural(p.n, 'Tag', 'Tage')} in Folge`,
        xpTo: '{into} / {need} XP bis Level {next}',
      },
      tile: {
        map: ['Lernpfad', 'Alle Lektionen und Welten'],
        games: ['Spiele', 'Tasten-Blitz, Wort-Regen, Tier-Rennen'],
        training: ['Training', 'Schwache Tasten gezielt üben'],
        guide: ["So geht's", 'Grundstellung & Profi-Tipps'],
        trophies: ['Erfolge', '{n} von {total} Abzeichen'],
        stats: ['Statistik', 'Wie schnell bist du?'],
        settings: ['Einstellungen', 'Ton, Anzeige, Sprache, Eltern'],
      },
      map: { title: '🗺️ Lernpfad', lead: 'Schaffe jede Lektion mit mindestens einem Stern, um die nächste freizuschalten.' },
      intro: {
        back: '← Lernpfad',
        tag: '{world} · Lektion {n} von {total}',
        best: 'Bisher:',
        try: '⌨️ Probier es aus: Drück die neuen Tasten auf deiner Tastatur!',
        tryNew: '👍 Super! Das war {key} – {finger}',
        tryOther: 'Das war {key} – {finger}',
        spaceKey: 'die Leertaste',
        star1: 'ab 80 % richtig',
        star2: 'ab 90 %',
        star3: 'ab 96 % und {zpm} Zeichen/Min.',
        start: "Los geht's!",
        shiftLeft: 'links: <b>{finger}</b> – für Buchstaben der rechten Hand (H, J, K, L …)',
        shiftRight: 'rechts: <b>{finger}</b> – für Buchstaben der linken Hand (A, S, D, F …)',
        allKeys: '🏆 Alle Buchstaben, Satzzeichen und Großschreibung',
        shiftCombo: '= ⇧ + {base} – <b>{finger}</b>, ⇧ {withShift}',
      },
      finger: {
        with: 'mit dem {f}',
        shiftHint: '⇧ {ws} halten, {key} {wf}',
      },
      key: { space: 'Leertaste' },
      hands: { left: 'links', right: 'rechts' },
      tv: {
        acc: 'Genauigkeit', zpm: 'Zeichen pro Minute', zpmUnit: 'Zeichen/Min', combo: 'Richtige Tasten am Stück',
        caps: '⚠️ Die Feststelltaste <b>⇪</b> ist an! Drück sie einmal, um sie auszuschalten.',
        blind: '🙈 <b>Profi-Modus:</b> Die Bildschirm-Tastatur ist ausgeblendet – in Lektionen gibt es dafür +25 % XP.',
        kbOff: '🙈 Tastatur aus', kbOn: '👀 Tastatur an',
        kbOffTitle: 'Bildschirm-Tastatur ausblenden (Profi-Modus, +25 % XP in Lektionen)',
        kbOnTitle: 'Bildschirm-Tastatur wieder einblenden',
        comboPop: '🔥 {n} am Stück!',
        done: '✅ Geschafft!',
      },
      ts: { quit: 'Beenden', pause: 'Pause', foot: 'Augen auf den Bildschirm, nicht auf die Finger!', escPause: '= Pause' },
      pause: { title: 'Pause', text: 'Kurz durchatmen und die Hände ausschütteln!', resume: '▶ Weiter', restart: '↻ Runde neu starten', quit: '✕ Beenden' },
      round: {
        title: 'Lektion {n}: {title}',
        sub: 'Runde {r} von 3 · {label}',
        done: 'Runde {r} geschafft!',
        next: 'Weiter zu Runde {r}',
        newKeys: 'Neue Tasten', mix: 'Buchstaben-Mix', words: 'Wörter', syllables: 'Silben', capitals: 'Große Anfänge',
        nouns: 'Nomen', sentences: 'Sätze', punct: 'Satzzeichen', exclaim: 'Ausrufe & Fragen', digitDrill: 'Zahlen-Drill',
        numbers: 'Zahlen', numberSentences: 'Sätze mit Zahlen',
      },
      stat: { correct: 'richtig', zpm: 'Zeichen/Min', errors: 'Fehler', points: 'Punkte', hits: 'Treffer', words: 'Wörter', level: 'Level' },
      hist: { lesson: 'Lektion {l} · Runde {r}', training: 'Training: {name}', race: 'Rennen: {name}' },
      result: {
        perfect: 'Perfekt!', passed: 'Lektion geschafft!', failed: 'Fast geschafft!',
        fail: 'Für einen Stern brauchst du mindestens 80 % richtige Anschläge. Tipp: Tippe etwas langsamer und schau auf den Bildschirm – du schaffst das!',
        needSpeed: 'Super genau! Für den dritten Stern brauchst du noch etwas mehr Tempo: {zpm} Zeichen pro Minute.',
        moreAcc: '{praise} Für mehr Sterne: noch genauer tippen!',
        blind: '🙈 Blind-Bonus +25 %', first: '🆕 Erstes Mal geschafft',
        again: '↻ Nochmal', next: 'Nächste Lektion ▶', map: '🗺️ Lernpfad', retry: '↻ Nochmal versuchen',
        level: 'Level {level} · {title} · {into} / {need} XP',
      },
      guide: {
        title: "📖 So geht's", step: 'Schritt {n} von {total}', prev: '← Zurück', next: 'Weiter →',
        toLesson: 'Zu Lektion {n} ▶', toMap: 'Zum Lernpfad ▶',
        done: '🎉 <b>Super!</b> Du kennst die Grundstellung. Jetzt bist du bereit für Lektion 1!',
      },
      training: {
        title: '🏋️ Training', lead: 'Freies Üben – ohne Sterne, aber mit XP. Es kommen nur Tasten vor, die du schon gelernt hast.',
        weak: 'Schwache Tasten', words: 'Wörter-Mix', home: 'Grundreihe', sentences: 'Sätze',
        weakHas: 'Diese Tasten machen dir noch Mühe:',
        weakNone: 'Noch nicht genug Daten. Mach erst ein paar Lektionen – dann zeige ich dir, welche Tasten du üben solltest.',
        wordsDesc: 'Zufällige Wörter mit allen Buchstaben, die du schon kannst.',
        homeDesc: 'Zurück zu den Wurzeln: {home}, dazu G und H.',
        sentencesDesc: 'Ganze Sätze mit Großschreibung und Satzzeichen.',
        errPct: '{n} % Fehler', go: 'Üben', locked: '🔒 Noch gesperrt',
        screen: 'Training: {name}', sub: 'Freies Üben', done: 'Training geschafft!',
      },
      trophies: {
        title: '🏆 Erfolge', count: '{n} von {total} Abzeichen gesammelt', animal: 'Dein Tier',
        animalHelp: 'Klick auf ein freigeschaltetes Tier, um es auszuwählen. Neue Tiere gibt es mit höheren Levels.',
        chosen: '✓ Gewählt', free: 'Frei', locked: '🔒 Level {n}',
      },
      stats: {
        title: '📊 Statistik', lead: 'So entwickelst du dich, {name}.',
        time: 'Übungszeit', keys: 'richtige Anschläge', best: 'Rekord: Zeichen pro Minute', acc: 'Genauigkeit (letzte 10 Runden)',
        stars: 'Sterne', streak: 'Tage in Folge (Rekord: {n})', min: '{m} Min', hm: '{h} Std {m} Min',
        chartTitle: 'Dein Tempo – die letzten {n} Runden',
        chartLead: 'Zeichen pro Minute. Fahr mit der Maus über einen Balken, um Details zu sehen.',
        empty: 'Noch keine Runden – leg los, dann siehst du hier, wie du schneller wirst!',
        older: '← älter', newer: 'neuer →', table: 'Werte als Tabelle anzeigen',
        colDate: 'Datum', colEx: 'Übung', colZpm: 'Zeichen/Min', colAcc: 'Richtig',
        tip: '{date} · {label}<br><b>{zpm} Zeichen/Min</b> · {acc} % richtig',
        heatTitle: 'Wo passieren Fehler?',
        heatLead: 'Je dunkler eine Taste, desto öfter hast du dich dort vertippt. Graue Tasten hast du noch nicht oft genug benutzt.',
        rate: 'Fehlerquote:', heat: ['unter 2 %', '2–5 %', '5–10 %', '10–20 %', 'über 20 %'], noData: 'noch keine Daten',
        keyTip: '{key}: {rate} % Fehler bei {n} Anschlägen',
        weak: 'Deine Problem-Tasten:', practice: '🎯 Jetzt üben',
        weakNone: 'Sobald du mehr geübt hast, zeige ich dir hier deine Problem-Tasten.',
      },
      settings: {
        title: '⚙️ Einstellungen',
        profile: '👤 Profil', name: 'Name', animal: 'Tier', animalDesc: 'Mehr Tiere gibt es mit höheren Levels.', change: 'Ändern',
        switch: 'Profil wechseln', profiles: '👥 Profile',
        language: '🌍 Sprache & Tastatur',
        languageDesc: 'Bestimmt die Texte, die Übungswörter und das Tastatur-Layout. Der Lernfortschritt wird pro Sprache gespeichert.',
        sound: '🔊 Ton', sounds: 'Geräusche', soundsDesc: 'Töne für Erfolge, Fehler und Spiele',
        keySound: 'Tipp-Geräusch', keySoundDesc: 'Leises Klicken bei jedem richtigen Anschlag',
        display: '🖥️ Anzeige', showKeyboard: 'Bildschirm-Tastatur zeigen', showKeyboardDesc: 'Ausgeblendet = Profi-Modus mit +25 % XP',
        showHands: 'Hände zeigen', showHandsDesc: 'Zeigt, welcher Finger dran ist',
        showHint: 'Finger-Hinweis zeigen', showHintDesc: 'Kurzer Text, welcher Finger die nächste Taste drückt',
        textSize: 'Textgröße', small: 'Klein', normal: 'Normal', large: 'Groß',
        theme: 'Design', light: '☀️ Hell', dark: '🌙 Dunkel',
        goal: '🎯 Tagesziel', goalMin: 'Minuten pro Tag', goalDesc: 'Gezählt wird die reine Tipp-Zeit in Lektionen, Training und Spielen.',
        parents: '👪 Für Eltern', unlock: 'Alle Lektionen freischalten', unlockDesc: 'Zum Beispiel, wenn schon Vorkenntnisse da sind.',
        backup: 'Sicherung', backupDesc: 'Alle Profile als Datei speichern oder wiederherstellen.',
        export: '⬇️ Exportieren', import: '⬆️ Importieren', file: 'blindtrainer-sicherung-{date}.json',
        reset: 'Fortschritt zurücksetzen', resetDesc: 'Sterne, XP und Statistik dieses Profils löschen.', resetBtn: 'Zurücksetzen',
        del: 'Profil löschen', delDesc: 'Entfernt „{name}“ komplett.', delBtn: 'Löschen',
        footnote: 'Alle Daten werden nur lokal in diesem Browser gespeichert – nichts geht ins Internet.',
        gateTitle: 'Elternbereich', gateText: 'Bitte löse diese Aufgabe:',
        importTitle: 'Sicherung laden?', importText: 'Die Sicherung enthält {n} Profil(e). Alle aktuellen Profile auf diesem Computer werden dadurch ersetzt.', importOk: 'Ja, laden',
        resetTitle: 'Fortschritt zurücksetzen?', resetText: 'Alle Sterne, XP, Abzeichen und Statistiken von „{name}“ werden gelöscht.',
        delTitle: 'Profil löschen?', delText: 'Das Profil „{name}“ wird mit allen Daten gelöscht.',
      },
      games: {
        title: '🎮 Spiele', lead: 'Spielend üben! Die Spiele benutzen nur Tasten, die du schon gelernt hast.',
        record: '🏅 Rekord: {n} Punkte', noRecord: 'Noch kein Rekord', raceBeaten: '🏅 {n} von {total} Tieren besiegt',
        play: '▶ Spielen', lock: '🔒 Schaffe Lektion {n}, um das Spiel freizuschalten', back: '← Spiele',
        blitz: ['Tasten-Blitz', 'Eine Taste erscheint – drück sie so schnell du kannst! Wie viele schaffst du in 60 Sekunden?'],
        rain: ['Wort-Regen', 'Wörter fallen vom Himmel. Tippe sie ab, bevor sie den Boden berühren!'],
        race: ['Tier-Rennen', 'Tritt gegen flinke Tiere an. Wer tippt schneller ins Ziel?'],
      },
      blitz: {
        intro: 'Drück so schnell wie möglich die Taste, die hier erscheint.<br>Wenn du zögerst, leuchtet sie zur Hilfe auf der Tastatur auf.<br><br><b>Bereit? Drück die <kbd>Leertaste</kbd>!</b>',
        go: 'Los!', streak: '🔥 {n} am Stück! +{p} pro Treffer', keepGoing: 'Weiter so!', wrong: 'Ups – das war die falsche Taste.',
        over: 'Zeit ist um!',
      },
      rain: {
        text1: 'Wörter fallen vom Himmel! Tippe sie ab, bevor sie den Boden berühren.<br>Fang einfach mit dem ersten Buchstaben an – das Wort wird dann markiert.',
        text2: 'Du hast 3 Herzen. Nach jeweils 8 Wörtern steigt das Level.',
        keys: '<kbd>Leertaste</kbd> Start · <kbd>Esc</kbd> Pause', resume: '<kbd>Leertaste</kbd> weiterspielen',
        level: 'Level {n}! 🚀', over: 'Game over!',
        sub: (p) => `Du hast ${p.n} ${plural(p.n, 'Wort', 'Wörter')} geschafft.`,
      },
      race: {
        back: '← Gegner', lead: 'Wähle deinen Gegner! Jedes Tier tippt gleichmäßig schnell. Besiege ein Tier, um das nächste herauszufordern.',
        speed: '{n} Zeichen/Min', beaten: '🏅 Besiegt – dein Tempo: {n}', challenge: '⚔️ Herausfordern', locked: '🔒 Erst das Tier davor besiegen',
        start: 'Drück die <kbd>Leertaste</kbd> zum Starten!', go: 'LOS!',
        win: 'Gewonnen!', lose: 'Knapp verloren!', winSub: 'Du warst schneller als {name}!',
        loseSub: '{name} war diesmal schneller. Übe weiter und versuch es nochmal!',
        you: 'dein Tempo', them: 'Tempo {icon}', next: 'Nächster Gegner: {icon} ▶',
      },
    },

    fingers: {
      LP: { name: 'linker kleiner Finger', dat: 'linken kleinen Finger' },
      LR: { name: 'linker Ringfinger', dat: 'linken Ringfinger' },
      LM: { name: 'linker Mittelfinger', dat: 'linken Mittelfinger' },
      LI: { name: 'linker Zeigefinger', dat: 'linken Zeigefinger' },
      LT: { name: 'linker Daumen', dat: 'linken Daumen' },
      RT: { name: 'rechter Daumen', dat: 'rechten Daumen' },
      RI: { name: 'rechter Zeigefinger', dat: 'rechten Zeigefinger' },
      RM: { name: 'rechter Mittelfinger', dat: 'rechten Mittelfinger' },
      RR: { name: 'rechter Ringfinger', dat: 'rechten Ringfinger' },
      RP: { name: 'rechter kleiner Finger', dat: 'rechten kleinen Finger' },
      TH: { name: 'Daumen', dat: 'Daumen' },
    },
    fingerTypes: { pinky: 'Kleiner Finger', ring: 'Ringfinger', middle: 'Mittelfinger', index: 'Zeigefinger', thumb: 'Daumen' },
    keyNames: { ' ': 'Leertaste', ',': 'Komma', '.': 'Punkt', '-': 'Bindestrich', '!': 'Ausrufezeichen', '?': 'Fragezeichen', ':': 'Doppelpunkt', 'ß': 'scharfes S' },

    racers: { snail: 'Schnecke Susi', turtle: 'Schildkröte Theo', duck: 'Ente Emma', rabbit: 'Hase Hoppel', horse: 'Pferd Paula', cheetah: 'Gepard Blitz' },

    levelTitles: ['Tasten-Küken', 'Tipp-Talent', 'Flinke Finger', 'Tasten-Ass', 'Buchstaben-Profi', 'Tipp-Ninja',
      'Wort-Rakete', 'Blitzfinger', 'Tipp-Genie', 'Tasten-Star', 'Tastatur-Legende', 'Tipp-Superstar', 'Finger-Wunder',
      'Tasten-Champion', 'Tipp-Legende'],

    tips: [
      'Schau beim Tippen auf den Bildschirm, nicht auf die Tasten.',
      'Deine Zeigefinger finden die Huckel auf F und J – ganz ohne Hinschauen.',
      'Lieber langsam und richtig als schnell und falsch.',
      'Die Leertaste drückst du mit dem Daumen.',
      'Jeden Tag 10 Minuten üben bringt mehr als einmal in der Woche eine Stunde.',
      'Nach jedem Tastendruck kehren die Finger in die Grundstellung zurück.',
      'Sitz gerade und lass die Schultern locker.',
      'Mach zwischendurch eine Pause und schüttle die Hände aus.',
      'Für Großbuchstaben drückst du die Umschalttaste mit der anderen Hand.',
      'Blende die Tastatur aus, wenn du dich sicher fühlst – das gibt Bonus-XP!',
    ],

    praise: [
      { min: 0.99, texts: ['Wow, fast fehlerfrei! 🤩', 'Spitzenklasse!', 'Unglaublich genau!'] },
      { min: 0.95, texts: ['Super gemacht!', 'Klasse!', 'Prima, weiter so!'] },
      { min: 0.9, texts: ['Gut gemacht!', 'Schön! Du wirst immer besser.'] },
      { min: 0.8, texts: ['Geschafft! Etwas langsamer tippen hilft gegen Fehler.', 'Gut! Achte noch ein bisschen auf Genauigkeit.'] },
      { min: 0, texts: ['Nicht aufgeben! Tippe etwas langsamer – Genauigkeit ist wichtiger als Tempo.'] },
    ],

    achievements: {
      first: ['Erster Schritt', 'Schaffe deine erste Lektion.'],
      guide: ['Gut vorbereitet', 'Lies „So geht\'s“ bis zum Ende und probiere die Grundstellung aus.'],
      world0: ['Insel erkundet', 'Schaffe alle Lektionen der ersten Welt.'],
      world1: ['Wald durchquert', 'Schaffe alle Lektionen der zweiten Welt.'],
      world2: ['Kristalle gefunden', 'Schaffe alle Lektionen der dritten Welt.'],
      world3: ['Drachen gezähmt', 'Schaffe alle Lektionen der vierten Welt.'],
      perfect: ['Fehlerfrei!', 'Schaffe eine Runde ganz ohne Fehler.'],
      perfect10: ['Volltreffer', 'Schaffe 10 fehlerfreie Runden.'],
      stars10: ['10 Sterne', 'Sammle 10 Sterne.'],
      stars30: ['Sternenregen', 'Sammle 30 Sterne.'],
      starsAll: ['Superstar', 'Sammle alle Sterne eines Kurses.'],
      keys1k: ['Tausend Tasten', 'Tippe 1.000 Zeichen richtig.'],
      keys10k: ['Tasten-Rakete', 'Tippe 10.000 Zeichen richtig.'],
      keys50k: ['Tipp-Universum', 'Tippe 50.000 Zeichen richtig.'],
      speed60: ['Flinke Finger', 'Schaffe 60 Zeichen pro Minute in einer Runde.'],
      speed100: ['Blitzschnell', 'Schaffe 100 Zeichen pro Minute in einer Runde.'],
      speed150: ['Turbo-Finger', 'Schaffe 150 Zeichen pro Minute in einer Runde.'],
      goal: ['Tagesziel geschafft', 'Erreiche dein Tagesziel.'],
      streak3: ['Drangeblieben', 'Übe an 3 Tagen hintereinander.'],
      streak7: ['Eine ganze Woche', 'Übe an 7 Tagen hintereinander.'],
      blind: ['Ohne Gucken', 'Schaffe eine Lektion mit ausgeblendeter Tastatur.'],
      blitz: ['Blitz-Profi', 'Triff 50 Tasten im Tasten-Blitz.'],
      rain: ['Regenzauber', 'Erreiche 500 Punkte im Wort-Regen.'],
      race1: ['Erster Sieg', 'Gewinne ein Tier-Rennen.'],
      raceAll: ['Gepard geschlagen', 'Gewinne das Tier-Rennen gegen den Geparden.'],
      level5: ['Aufsteiger', 'Erreiche Level 5.'],
      level10: ['Gekrönt', 'Erreiche Level 10.'],
    },

    guide: [
      { title: 'Was ist Blindschreiben?', body: `
        <p>Beim <b>Blindschreiben</b> – auch <b>10-Finger-System</b> genannt – tippst du mit allen zehn Fingern, <b>ohne auf die Tastatur zu schauen</b>.</p>
        <p>Jeder Finger kümmert sich um ein paar bestimmte Tasten. Am Anfang ist das ungewohnt. Aber mit etwas Übung tippst du viel schneller als mit zwei Fingern – und deine Augen bleiben die ganze Zeit auf dem Bildschirm.</p>
        <div class="compare">
          <div class="cmp bad"><span class="cmp-ic">🐢</span><b>Zwei-Finger-Suchsystem</b><span>Die Augen springen ständig zwischen Tastatur und Bildschirm hin und her.</span></div>
          <div class="cmp good"><span class="cmp-ic">🚀</span><b>10-Finger-System</b><span>Die Finger finden die Tasten von allein. Die Augen bleiben beim Text.</span></div>
        </div>` },
      { title: 'Richtig sitzen', body: `
        <ul class="checklist">
          <li><span>🧍</span><div>Sitz aufrecht, der Rücken lehnt an.</div></li>
          <li><span>🦶</span><div>Beide Füße stehen flach auf dem Boden.</div></li>
          <li><span>💪</span><div>Die Schultern sind locker, die Ellbogen ungefähr im rechten Winkel.</div></li>
          <li><span>🖐️</span><div>Die Handgelenke schweben leicht über der Tischkante. Die Finger sind leicht gekrümmt – wie die Pfoten einer kleinen Katze.</div></li>
          <li><span>🖥️</span><div>Der Bildschirm ist etwa eine Armlänge entfernt.</div></li>
        </ul>` },
      { title: 'Die Grundstellung', body: `
        <p>Deine Finger haben ein Zuhause: die <b>Grundreihe</b> in der Mitte der Tastatur.</p>
        <p>Links liegen die Finger auf <b>{homeLeft}</b>, rechts auf <b>{homeRight}</b>. Die Daumen ruhen auf der <b>Leertaste</b>.</p>
        <p>Nach jedem Tastendruck kehrt der Finger sofort wieder nach Hause zurück.</p>` },
      { title: 'Die Fühltasten F und J', body: `
        <p>Auf den Tasten <b>F</b> und <b>J</b> sind kleine <b>Huckel</b>. Taste mal mit deinen Zeigefingern danach!</p>
        <p>So findest du die Grundstellung immer wieder – ganz ohne hinzuschauen. Wenn du dich „verlaufen“ hast: einfach die Huckel suchen.</p>` },
      { title: 'Jeder Finger hat seine Farbe', body: `
        <p>Auf der Bildschirm-Tastatur siehst du, welcher Finger welche Tasten drückt. <b>Gleiche Farbe = gleicher Finger</b> – links und rechts.</p>
        <div class="legend">{legend}</div>
        <p>Die Zeigefinger haben am meisten zu tun: Jeder kümmert sich um zwei Spalten!</p>` },
      { title: 'Profi-Tipps', body: `
        <ul class="checklist">
          <li><span>🎯</span><div><b>Genau vor schnell:</b> Tippe lieber langsam und richtig. Das Tempo kommt von allein.</div></li>
          <li><span>🙈</span><div><b>Nicht hinschauen:</b> Auch wenn es schwerfällt – schau auf den Bildschirm. Wenn du dich sicher fühlst, blende die Tastatur aus.</div></li>
          <li><span>🏠</span><div><b>Zurück nach Hause:</b> Nach jedem Tastendruck geht der Finger zurück in die Grundstellung.</div></li>
          <li><span>👍</span><div><b>Leertaste:</b> Die drückst du mit dem Daumen.</div></li>
          <li><span>⇧</span><div><b>Großbuchstaben:</b> Die Umschalttaste drückt immer die andere Hand.</div></li>
          <li><span>📅</span><div><b>Jeden Tag ein bisschen:</b> 10 Minuten am Tag bringen mehr als eine Stunde am Wochenende.</div></li>
          <li><span>🤲</span><div><b>Pausen:</b> Wenn die Hände müde werden, kurz ausschütteln.</div></li>
        </ul>` },
      { title: 'So funktioniert BlindTrainer', body: `
        <ul class="checklist">
          <li><span>🗺️</span><div><b>Lernpfad:</b> {lessons} Lektionen in {worlds} Welten. Jede Lektion bringt dir neue Tasten bei.</div></li>
          <li><span>🔁</span><div><b>3 Runden pro Lektion:</b> Erst die neuen Tasten, dann ein Buchstaben-Mix, dann echte Wörter.</div></li>
          <li><span>⭐</span><div><b>Sterne:</b> Ab 80 % richtig gibt es einen Stern, ab 90 % zwei, ab 96 % und genug Tempo drei. Mit einem Stern ist die nächste Lektion frei.</div></li>
          <li><span>✨</span><div><b>XP & Level:</b> Jedes richtige Zeichen bringt Punkte. Mit neuen Levels schaltest du neue Tiere frei.</div></li>
          <li><span>🎮</span><div><b>Spiele:</b> Tasten-Blitz, Wort-Regen und Tier-Rennen – sie benutzen nur Tasten, die du schon kannst.</div></li>
          <li><span>🔴</span><div><b>Vertippt?</b> Dann wird der Buchstabe rot. Tippe einfach die richtige Taste – Löschen ist nicht nötig.</div></li>
        </ul>` },
      { title: 'Probier es aus!', body: `
        <p>Leg deine Finger auf die Grundstellung und tippe die Buchstaben nacheinander ab. Die Leertaste drückst du mit dem Daumen.</p>` },
    ],

    course: {
      worlds: [
        { id: 0, name: 'Grundreihen-Insel', icon: '🏝️', color: '#18b6a0', desc: 'Hier wohnen deine Finger: die Grundreihe.' },
        { id: 1, name: 'Zauberwald', icon: '🌳', color: '#3fa34d', desc: 'Die Finger klettern nach oben.' },
        { id: 2, name: 'Kristallhöhle', icon: '💎', color: '#5b7cfa', desc: 'Ab in die untere Reihe!' },
        { id: 3, name: 'Drachenburg', icon: '🏰', color: '#f0643c', desc: 'Großbuchstaben, Satzzeichen, Zahlen und ganze Sätze.' },
      ],
      lessons: [
        { id: 'fj', world: 0, title: 'F und J', keys: ['f', 'j'],
          intro: 'Auf den Tasten <b>F</b> und <b>J</b> findest du kleine Huckel. Die kannst du mit den Zeigefingern fühlen – so findest du immer zurück, ohne hinzuschauen! Der linke Zeigefinger liegt auf F, der rechte auf J. Die Daumen ruhen auf der Leertaste.',
          tip: 'Fühl mal nach: Spürst du die kleinen Huckel auf F und J?' },
        { id: 'dk', world: 0, title: 'D und K', keys: ['d', 'k'],
          intro: 'Die Mittelfinger liegen direkt neben den Zeigefingern: links auf <b>D</b>, rechts auf <b>K</b>.',
          tip: 'Lass die Zeigefinger auf F und J liegen, während die Mittelfinger tippen.' },
        { id: 'sl', world: 0, title: 'S und L', keys: ['s', 'l'],
          intro: 'Jetzt kommen die Ringfinger dazu: links auf <b>S</b>, rechts auf <b>L</b>.',
          tip: 'Die Ringfinger sind am Anfang etwas ungeschickt. Das ist ganz normal – mit Übung werden sie stark!' },
        { id: 'aoe', world: 0, title: 'A und Ö', keys: ['a', 'ö'],
          intro: 'Die kleinen Finger liegen ganz außen: links auf <b>A</b>, rechts auf <b>Ö</b>. Jetzt liegen alle acht Finger in der Grundstellung: <b>A S D F</b> – <b>J K L Ö</b>.',
          tip: 'Das ist die Grundstellung. Hierher kehren deine Finger immer wieder zurück.' },
        { id: 'gh', world: 0, title: 'G und H', keys: ['g', 'h'],
          intro: 'Die Zeigefinger dürfen zur Mitte rutschen: Der linke Zeigefinger tippt <b>G</b>, der rechte tippt <b>H</b>. Danach geht es sofort zurück auf F und J!',
          tip: 'Nach G und H immer zurück zu den Huckeln auf F und J.' },
        { id: 'ei', world: 1, title: 'E und I', keys: ['e', 'i'],
          intro: 'Die Mittelfinger klettern nach oben: links zum <b>E</b>, rechts zum <b>I</b>. Mit E und I kannst du schon viele echte Wörter schreiben!',
          tip: 'Nur der Mittelfinger bewegt sich – die anderen Finger bleiben liegen.' },
        { id: 'ru', world: 1, title: 'R und U', keys: ['r', 'u'],
          intro: 'Die Zeigefinger strecken sich nach oben: links zum <b>R</b>, rechts zum <b>U</b>.',
          tip: 'R liegt schräg über F, U liegt schräg über J.' },
        { id: 'tz', world: 1, title: 'T und Z', keys: ['t', 'z'],
          intro: 'Die Zeigefinger gehen nach oben zur Mitte: links zum <b>T</b>, rechts zum <b>Z</b>. Auf deutschen Tastaturen liegt das Z oben in der Mitte!',
          tip: 'T und Z liegen direkt nebeneinander. Links ist T, rechts ist Z.' },
        { id: 'nm', world: 1, title: 'N und M', keys: ['n', 'm'],
          intro: 'Der rechte Zeigefinger geht nach unten: <b>N</b> liegt schräg links unter J, <b>M</b> liegt direkt darunter.',
          tip: 'N ist einer der häufigsten Buchstaben im Deutschen. Gut, dass du ihn jetzt kannst!' },
        { id: 'wo', world: 1, title: 'W und O', keys: ['w', 'o'],
          intro: 'Die Ringfinger klettern nach oben: links zum <b>W</b>, rechts zum <b>O</b>.',
          tip: 'Wenn der Ringfinger tippt, bleibt der kleine Finger auf seiner Taste liegen.' },
        { id: 'c-comma', world: 2, title: 'C und Komma', keys: ['c', ','],
          intro: 'Die Mittelfinger gehen nach unten: links zum <b>C</b>, rechts zum <b>Komma</b> (,).',
          tip: 'Mit C kannst du jetzt auch „ch“ und „sch“ schreiben – wie in „ich“ und „Schule“.' },
        { id: 'vb', world: 2, title: 'V und B', keys: ['v', 'b'],
          intro: 'Der linke Zeigefinger geht nach unten: <b>V</b> liegt schräg unter F, <b>B</b> liegt rechts daneben.',
          tip: 'B liegt ganz in der Mitte – der linke Zeigefinger streckt sich ein bisschen.' },
        { id: 'qp', world: 2, title: 'Q und P', keys: ['q', 'p'],
          intro: 'Die kleinen Finger klettern nach oben: links zum <b>Q</b>, rechts zum <b>P</b>.',
          tip: 'Q kommt im Deutschen fast immer zusammen mit U: Qu wie in Qualle.' },
        { id: 'x-dot', world: 2, title: 'X und Punkt', keys: ['x', '.'],
          intro: 'Die Ringfinger gehen nach unten: links zum <b>X</b>, rechts zum <b>Punkt</b> (.).',
          tip: 'Am Ende eines Satzes steht ein Punkt.' },
        { id: 'y-dash', world: 2, title: 'Y und Bindestrich', keys: ['y', '-'],
          intro: 'Die kleinen Finger gehen nach unten: links zum <b>Y</b>, rechts zum <b>Bindestrich</b> (-).',
          tip: 'Y und Z verwechselt man leicht. Das Y ist unten links, das Z oben in der Mitte.' },
        { id: 'umlauts', world: 3, title: 'Ü, Ä und ß', keys: ['ü', 'ä', 'ß'],
          intro: 'Der rechte kleine Finger hat viel zu tun: <b>Ü</b> liegt rechts neben P, <b>Ä</b> liegt rechts neben Ö, und das <b>ß</b> wohnt ganz oben in der Zahlenreihe.',
          tip: 'Nach jedem Ausflug kehrt der kleine Finger zurück aufs Ö.' },
        { id: 'shift', world: 3, title: 'Großbuchstaben', type: 'shift', keys: [],
          intro: 'Für große Buchstaben hältst du die <b>Umschalttaste ⇧</b> gedrückt – und zwar immer mit dem kleinen Finger der <b>anderen</b> Hand! Für ein großes F (linke Hand) hält der rechte kleine Finger die rechte ⇧-Taste. Für ein großes J (rechte Hand) hält der linke kleine Finger die linke ⇧-Taste.',
          tip: 'Im Deutschen schreibt man Nomen (Namenwörter) und den Satzanfang groß.' },
        { id: 'punct', world: 3, title: 'Satzzeichen', type: 'punct', keys: ['!', '?', ':'],
          intro: 'Ausrufezeichen, Fragezeichen und Doppelpunkt brauchen die Umschalttaste: <b>!</b> ist ⇧ + 1, <b>?</b> ist ⇧ + ß und <b>:</b> ist ⇧ + Punkt.',
          tip: 'Fragen enden mit einem Fragezeichen. Hurra! endet mit einem Ausrufezeichen.' },
        { id: 'numbers', world: 3, title: 'Zahlen', type: 'numbers', keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
          intro: 'Die Zahlen stehen ganz oben. Jeder Finger streckt sich weit nach oben. Links: <b>1</b> kleiner Finger, <b>2</b> Ringfinger, <b>3</b> Mittelfinger, <b>4</b> und <b>5</b> Zeigefinger. Rechts: <b>6</b> und <b>7</b> Zeigefinger, <b>8</b> Mittelfinger, <b>9</b> Ringfinger, <b>0</b> kleiner Finger.',
          tip: 'Strecke nur den einen Finger nach oben. Die anderen bleiben in der Grundstellung.' },
        { id: 'sentences', world: 3, title: 'Satz-Profi', type: 'sentences', keys: [],
          intro: 'Du kennst jetzt alle wichtigen Tasten! In der letzten Lektion schreibst du ganze Sätze – wie ein echter Tipp-Profi.',
          tip: 'Lieber gleichmäßig und richtig als hektisch und schnell.' },
      ],

      /* Nomen großgeschrieben; vor der Großbuchstaben-Lektion wird alles kleingeschrieben */
      words: `
da das dass als all ja nein die der dem den des sie er es ein eine einen einem einer und oder aber auch auf aus bei bis für
in im an am um mit nach neben ohne über unter vor zu zum zur wie wo was wer wann warum weil wenn dann denn doch noch nur
schon sehr viel mehr nicht kein keine ich du wir ihr mich dich sich mir dir uns euch mein dein sein unser hier dort heute
morgen gestern immer nie oft jetzt bald gern ganz gut groß klein alt neu jung lang kurz hoch tief warm kalt heiß schnell
langsam laut leise hell dunkel rot blau grün gelb weiß schwarz bunt lila rosa braun grau lieb nett froh müde wach stark
dick dünn rund weich hart nass süß sauer leer voll leicht schwer früh spät nah frisch klug mutig wild lustig toll super
prima fein fit faul fies kahl fahl lahm fad satt still sanft zahm frei treu wahr richtig falsch fertig gleich
las lag sag lass fass hilf lies rief fiel gab nahm kam ging sah lief rannte lesen schreiben rechnen malen spielen lachen
laufen rennen springen schwimmen tanzen singen essen trinken schlafen träumen bauen backen kochen suchen finden sehen
hören fühlen fragen sagen rufen helfen holen kaufen machen gehen kommen fahren fliegen sitzen stehen liegen tippen lernen
üben denken wissen haben werden können wollen müssen geben nehmen halten fallen werfen fangen klettern rutschen hüpfen
kuscheln basteln turnen reisen raten sehe gehe stehe rede rufe helfe hole frage lerne tippe teile zeige zeigen teilen
sagt ruft geht steht hat ist sind war waren will kann darf muss
Aal Saal Fass Kalk Skala Salsa Hals Glas Gas Jagd Fall All Ass Öl Fee See Idee Esel Igel Hefe Geige Fliege Segel Feld
Geld Held Hagel Flagge Lied Eis Ei Rad Ruf Frage Gras Frau Haus Laus Maus Uhr Ruder Erde Rede Reise Riese Gurke Kugel
Freude Feuer Heu Eule Keule Ufer Reis Kreis Gleis Fluss Lauf Ruhe Zeit Tier Satz Salz Katze Kater Hut Tal Stadt Lust
Zug Tag Rest Test Zelt Ziel Zahl Tante Ente Zahn Zirkus Tasse Turm Tür Taste Tastatur Hund Mann Name Mama Kind Kinder
Minute Monat Mund Nase Nest Nuss Nudel Tomate Ende Insel Sand Stein Stern Sonne Mond Wolke Wind Wald Wasser Welt Woche
Wort Wolf Wurm Wiese Wurst Wetter Ohr Oma Onkel Ort Rose Boot Brot Ofen Tor Ton Dorf Hof Ritter Morgen Abend Fisch
Frosch Tisch Schule Milch Nacht Koch Kuchen Schaf Schiff Schatz Schal Schuh Buch Bach Dach Licht Loch Sache Fuchs
Bild Ball Baum Bett Blume Blatt Blitz Bus Bauch Biene Birne Brief Brille Brücke Burg Butter Bagger Vogel Vater Vase
Video Papa Opa Pilz Pferd Platz Post Puppe Pizza Park Pirat Pinguin Pony Papagei Paket Qualle Quatsch Quark Quelle
Hexe Taxi Axt Text Boxer Baby Handy Yacht Party Bär Käse Mädchen Apfel Äpfel Hände Bäcker Käfer Kälte Bälle Küche
Hütte Mütze Mühle Füße Brüder Bücher Würfel Glück Rücken Schlüssel Spaß Fuß Straße Soße Gruß Floß Löwe Möhre Höhle
Vögel Brötchen Flöte König Schnee Regen Sturm Himmel Garten Elefant Giraffe Zebra Tiger Affe Delfin Wal Hai Drache
Dino Krake Robbe Möwe Kamel Panda Koala Känguru Reh Hirsch Eichhörnchen Maulwurf Schnecke Spinne Ameise Raupe Libelle
Schmetterling Frühling Sommer Herbst Winter Ferien Urlaub Freund Freundin Bruder Schwester Familie Lehrer Lehrerin
Klasse Tafel Heft Stift Papier Stuhl Lampe Fenster Wand Boden Zimmer Keller Treppe Spiel Auto Rakete Ampel Land Kopf
Arm Bein Auge Haar Finger Herz Banane Kirsche Erdbeere Melone Saft Tee Kakao Keks Suppe Salat Honig Zucker Kartoffel
Hose Jacke Rock Socke Kleid Hemd Tasche Geschenk Fest Musik Farbe Punkt Linie Computer Bildschirm Film Monster Roboter
Kerze Luft Teller Gabel Messer Löffel Topf Pfanne Seife Kissen Decke Sofa Regal Kiste Korb Seil Leiter Hammer Nagel
Säge Traktor Stall Zaun Weg Tunnel Teich Strand Welle Muschel Wüste Palme Urwald Faultier Zauberer Prinzessin Prinz
Schloss Krone Gold Schwert`.trim().split(/\s+/),

      sentences: [
        'Der Hund spielt im Garten.', 'Die Katze schläft auf dem Sofa.', 'Heute scheint die Sonne.', 'Wir gehen in den Zoo.',
        'Im Sommer baden wir im See.', 'Der Elefant hat einen langen Rüssel.', 'Ich lese gerne spannende Bücher.',
        'Am Wochenende besuchen wir Oma und Opa.', 'Der Drache fliegt über die Burg.', 'Im Herbst fallen bunte Blätter.',
        'Der Pinguin watschelt über das Eis.', 'Meine Schwester malt ein Bild.', 'Das Eichhörnchen sammelt Nüsse.',
        'Der Astronaut fliegt zum Mond.', 'Im Winter bauen wir einen Schneemann.', 'Die Feuerwehr kommt mit Blaulicht.',
        'Mein Fahrrad ist rot und schnell.', 'Der Igel versteckt sich im Laub.', 'Wir backen einen leckeren Kuchen.',
        'Die Eule ruft in der Nacht.', 'Zehn Finger tippen auf der Tastatur.', 'Der Papagei kann sprechen.',
        'Das Pony frisst eine Möhre.', 'Ein Regenbogen hat viele Farben.', 'Die Biene sammelt Honig.', 'Ich trinke gerne Kakao.',
        'Der Wal ist das größte Tier im Meer.', 'Die Kinder spielen Fußball auf der Wiese.', 'Der Zauberer hat einen langen Bart.',
        'Morgen fahren wir mit dem Zug ans Meer.', 'Die Ritter treffen sich auf der Burg.', 'Unser Lehrer liest eine Geschichte vor.',
        'Der Frosch hüpft in den Teich.', 'Im Wald wohnen Fuchs und Hase.', 'Die Prinzessin reitet auf einem Pferd.',
        'Nach der Schule mache ich Hausaufgaben.', 'Das Baby lacht und klatscht in die Hände.', 'Der Bäcker backt frische Brötchen.',
        'Wir fahren mit dem Bus zur Schule.', 'Der Koala klettert auf einen Baum.', 'Ein Schmetterling fliegt von Blume zu Blume.',
        'Meine Oma strickt einen warmen Schal.', 'Die Piraten suchen einen Schatz.', 'Der Roboter kann tanzen.',
        'Im Zirkus gibt es Clowns und Akrobaten.', 'Die Schnecke trägt ihr Haus auf dem Rücken.', 'Im Herbst lassen wir Drachen steigen.',
        'Wie heißt dein bester Freund?', 'Kannst du schon blind schreiben?', 'Was machst du in den Ferien?', 'Wo ist mein zweiter Schuh?',
        'Hast du heute schon geübt?', 'Magst du lieber Eis oder Kuchen?', 'Wer hat den Kuchen gegessen?', 'Hurra, wir haben Ferien!',
        'Übung macht den Meister!', 'Schau nicht auf die Tasten!', 'Pass auf, der Ball kommt!', 'Das hast du toll gemacht!',
        'Achtung: Der Hund ist frei!', 'Hallo, wie geht es dir?', 'Juhu, es schneit!', 'Merke: Nomen schreibt man groß.',
      ],

      numberSentences: [
        'Ich bin 9 Jahre alt.', 'Wir haben 2 Katzen und 1 Hund.', 'Das Buch hat 120 Seiten.', 'Ein Jahr hat 12 Monate.',
        'Eine Woche hat 7 Tage.', 'Ein Tag hat 24 Stunden.', 'Eine Stunde hat 60 Minuten.', 'Eine Fußballmannschaft hat 11 Spieler.',
        'Ich kann bis 100 zählen.', 'Wir treffen uns um 3 Uhr.', 'Die Spinne hat 8 Beine.', 'In meiner Klasse sind 25 Kinder.',
        'Der Käfer hat 6 Beine.', 'Oma wird bald 70 Jahre alt.', 'Ich habe 10 Finger und 10 Zehen.', 'Der Bus fährt um 7 Uhr 45.',
        'Auf dem Baum sitzen 5 Vögel.', 'Ein Würfel hat 6 Seiten.', 'Das Spiel endet 3 zu 2.', 'Im Jahr 2030 bin ich schon groß.',
      ],

      interjections: {
        excl: ['Hallo', 'Hurra', 'Juhu', 'Super', 'Toll', 'Prima', 'Klasse', 'Stopp', 'Hilfe', 'Achtung', 'Vorsicht', 'Komm', 'Los', 'Danke', 'Bitte', 'Halt'],
        quest: ['Wer', 'Wie', 'Was', 'Wo', 'Warum', 'Wann', 'Wieso', 'Woher', 'Wohin', 'Echt', 'Ja', 'Nein'],
        colon: ['Achtung', 'Tipp', 'Hinweis', 'Merke', 'Frage', 'Antwort', 'Name', 'Ort'],
      },
    },
  };
})(window.BT);
