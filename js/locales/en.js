'use strict';
/* TastaturTrainer – English (US keyboard, QWERTY) */
(function (BT) {
  const plural = (n, one, many) => (n === 1 ? one : many);

  BT.I18N.en = {
    meta: { code: 'en', name: 'English', flag: 'EN', locale: 'en-US', layout: 'us', keyboard: 'US keyboard (QWERTY)', keepCase: true },

    ui: {
      app: { title: 'TastaturTrainer – Touch Typing Adventure', mascot: 'Professor Hoot' },
      common: { cancel: 'Cancel', ok: 'OK', back: 'Back', again: '↻ Again', save: 'Save' },
      top: {
        home: 'Home', stars: 'Stars collected', streak: 'Days practiced in a row',
        level: '{title} – {into} of {need} XP', sound: 'Sound on/off', switchProfile: 'Switch profile',
      },
      toast: {
        goal: '🥇 <b>Daily goal reached!</b> Great job, keep it up!',
        noStorage: '⚠️ Your browser does not allow saving. Your progress will be lost when you close it.',
        prevLesson: '🔒 Finish the lesson before this one first!',
        lessonLocked: '🔒 This lesson is still locked.',
        newBadge: '{icon} New badge: <b>{title}</b>',
        nameSaved: '✓ Name saved',
        unlocked: '🔓 All lessons and games are unlocked.',
        backupLoaded: '✓ Backup loaded',
        invalidBackup: '⚠️ This file is not a valid backup.',
        fileTooBig: '⚠️ This file is too large to be a backup.',
        progressReset: 'Progress reset',
      },
      reward: {
        levelUp: '🎉 <b>Level {level}</b> reached: {title}!',
        newAnimals: 'New animals unlocked:',
        choose: 'Choose now',
        newBadges: 'New badges!',
        record: '🏅 New record!',
      },
      welcome: {
        title: 'Welcome to TastaturTrainer!',
        lead: 'Learn to touch type with all ten fingers – step by step, with games, stars and badges.',
        who: "Who's practicing today?",
        profileSub: 'Level {level} · ⭐ {stars}',
        newProfile: 'New profile',
        newProfileSub: 'One for each child',
        privacy: 'All data stays on this computer. Nothing is sent to the internet.',
        language: 'Language',
      },
      profile: {
        title: 'New profile', name: "What's your name?", namePh: 'Your name', animal: 'Choose your animal:',
        more: 'You unlock more animals at higher levels!', go: "Let's go!",
      },
      hello: {
        title: 'Hello {name}!',
        intro: "I'm <b>{mascot}</b> and I'll be your guide on this typing adventure.",
        guide: 'Before we start: take a quick look at how touch typing works. It only takes two minutes!',
        skip: 'Start right away', toGuide: '📖 How it works',
      },
      home: {
        greetings: ['Hello', 'Hi', 'Hey', 'Nice to see you'],
        hiNew: "Hi <b>{name}</b>! Great to have you here. Take a look at <b>“How it works”</b> first – then we'll start with lesson 1!",
        hiDone: 'Wow, <b>{name}</b>! You have finished all the lessons. Now collect all the stars or challenge the animals to a race!',
        hi: '{greeting}, <b>{name}</b>!',
        continue: '▶ Lesson {n}: {title}',
        toMap: '🗺️ To the learning path',
        guide: '📖 How it works',
        goal: 'Daily goal',
        goalOf: '{min} of {goal} minutes',
        streak: (p) => `🔥 <b>${p.n}</b> ${plural(p.n, 'day', 'days')} in a row`,
        xpTo: '{into} / {need} XP to level {next}',
      },
      tile: {
        map: ['Learning path', 'All lessons and worlds'],
        games: ['Games', 'Key Flash, Word Rain, Animal Race'],
        training: ['Practice', 'Practice your tricky keys'],
        guide: ['How it works', 'Home position & pro tips'],
        trophies: ['Badges', '{n} of {total} badges'],
        stats: ['Statistics', 'How fast are you?'],
        settings: ['Settings', 'Sound, display, language, parents'],
      },
      map: { title: '🗺️ Learning path', lead: 'Earn at least one star in each lesson to unlock the next one.' },
      intro: {
        back: '← Learning path',
        tag: '{world} · Lesson {n} of {total}',
        best: 'Best so far:',
        try: '⌨️ Try it: press the new keys on your keyboard!',
        tryNew: '👍 Great! That was {key} – {finger}',
        tryOther: 'That was {key} – {finger}',
        spaceKey: 'the space bar',
        star1: 'from 80 % correct',
        star2: 'from 90 %',
        star3: 'from 96 % and {zpm} chars/min',
        start: "Let's go!",
        shiftLeft: 'left: <b>{finger}</b> – for letters of the right hand (H, J, K, L …)',
        shiftRight: 'right: <b>{finger}</b> – for letters of the left hand (A, S, D, F …)',
        allKeys: '🏆 All letters, punctuation and capitals',
        shiftCombo: '= ⇧ + {base} – <b>{finger}</b>, ⇧ {withShift}',
      },
      finger: {
        with: 'with your {f}',
        shiftHint: 'hold ⇧ {ws}, press {key} {wf}',
      },
      key: { space: 'Space' },
      hands: { left: 'left', right: 'right' },
      tv: {
        acc: 'Accuracy', zpm: 'Characters per minute', zpmUnit: 'chars/min', combo: 'Correct keys in a row',
        caps: '⚠️ Caps Lock <b>⇪</b> is on! Press it once to turn it off.',
        blind: '🙈 <b>Pro mode:</b> the on-screen keyboard is hidden – you get +25 % XP in lessons.',
        kbOff: '🙈 Keyboard off', kbOn: '👀 Keyboard on',
        kbOffTitle: 'Hide the on-screen keyboard (pro mode, +25 % XP in lessons)',
        kbOnTitle: 'Show the on-screen keyboard again',
        comboPop: '🔥 {n} in a row!',
        done: '✅ Done!',
      },
      ts: { quit: 'Quit', pause: 'Pause', foot: 'Eyes on the screen, not on your fingers!', escPause: '= pause' },
      pause: { title: 'Pause', text: 'Take a deep breath and shake out your hands!', resume: '▶ Continue', restart: '↻ Restart round', quit: '✕ Quit' },
      round: {
        title: 'Lesson {n}: {title}',
        sub: 'Round {r} of 3 · {label}',
        done: 'Round {r} complete!',
        next: 'On to round {r}',
        newKeys: 'New keys', mix: 'Letter mix', words: 'Words', syllables: 'Syllables', capitals: 'Capital starts',
        nouns: 'Names & places', sentences: 'Sentences', punct: 'Punctuation', exclaim: 'Shouts & questions', digitDrill: 'Number drill',
        numbers: 'Numbers', numberSentences: 'Sentences with numbers',
      },
      stat: { correct: 'correct', zpm: 'chars/min', errors: 'mistakes', points: 'points', hits: 'hits', words: 'words', level: 'level' },
      hist: { lesson: 'Lesson {l} · Round {r}', training: 'Practice: {name}', race: 'Race: {name}' },
      result: {
        perfect: 'Perfect!', passed: 'Lesson complete!', failed: 'Almost there!',
        fail: 'For one star you need at least 80 % correct keystrokes. Tip: type a little slower and keep your eyes on the screen – you can do it!',
        needSpeed: 'Very accurate! For the third star you need a little more speed: {zpm} characters per minute.',
        moreAcc: '{praise} For more stars: type even more accurately!',
        blind: '🙈 Blind bonus +25 %', first: '🆕 Completed for the first time',
        again: '↻ Again', next: 'Next lesson ▶', map: '🗺️ Learning path', retry: '↻ Try again',
        level: 'Level {level} · {title} · {into} / {need} XP',
      },
      guide: {
        title: '📖 How it works', step: 'Step {n} of {total}', prev: '← Back', next: 'Next →',
        toLesson: 'Go to lesson {n} ▶', toMap: 'To the learning path ▶',
        done: '🎉 <b>Great!</b> You know the home position. Now you are ready for lesson 1!',
      },
      training: {
        title: '🏋️ Practice', lead: 'Free practice – no stars, but you still earn XP. Only keys you have already learned will appear.',
        weak: 'Tricky keys', words: 'Word mix', home: 'Home row', sentences: 'Sentences',
        weakHas: 'These keys are still tricky for you:',
        weakNone: 'Not enough data yet. Do a few lessons first – then I will show you which keys to practice.',
        wordsDesc: 'Random words with all the letters you already know.',
        homeDesc: 'Back to the roots: {home}, plus G and H.',
        sentencesDesc: 'Whole sentences with capitals and punctuation.',
        errPct: '{n} % mistakes', go: 'Practice', locked: '🔒 Still locked',
        screen: 'Practice: {name}', sub: 'Free practice', done: 'Practice complete!',
      },
      trophies: {
        title: '🏆 Badges', count: '{n} of {total} badges collected', animal: 'Your animal',
        animalHelp: 'Click an unlocked animal to choose it. You get new animals at higher levels.',
        chosen: '✓ Chosen', free: 'Unlocked', locked: '🔒 Level {n}',
      },
      stats: {
        title: '📊 Statistics', lead: "Here's how you are doing, {name}.",
        time: 'Practice time', keys: 'correct keystrokes', best: 'Record: characters per minute', acc: 'Accuracy (last 10 rounds)',
        stars: 'Stars', streak: 'Days in a row (record: {n})', min: '{m} min', hm: '{h} h {m} min',
        chartTitle: 'Your speed – the last {n} rounds',
        chartLead: 'Characters per minute. Move the mouse over a bar to see details.',
        empty: 'No rounds yet – get started and you will see here how you get faster!',
        older: '← older', newer: 'newer →', table: 'Show values as a table',
        colDate: 'Date', colEx: 'Exercise', colZpm: 'Chars/min', colAcc: 'Correct',
        tip: '{date} · {label}<br><b>{zpm} chars/min</b> · {acc} % correct',
        heatTitle: 'Where do mistakes happen?',
        heatLead: 'The darker a key, the more often you made a mistake there. Gray keys have not been used often enough yet.',
        rate: 'Mistake rate:', heat: ['under 2 %', '2–5 %', '5–10 %', '10–20 %', 'over 20 %'], noData: 'no data yet',
        keyTip: '{key}: {rate} % mistakes in {n} keystrokes',
        weak: 'Your tricky keys:', practice: '🎯 Practice now',
        weakNone: 'Once you have practiced a bit more, I will show you your tricky keys here.',
      },
      settings: {
        title: '⚙️ Settings',
        profile: '👤 Profile', name: 'Name', animal: 'Animal', animalDesc: 'You get more animals at higher levels.', change: 'Change',
        switch: 'Switch profile', profiles: '👥 Profiles',
        language: '🌍 Language & keyboard',
        languageDesc: 'Sets the texts, the practice words and the keyboard layout. Learning progress is saved separately for each language.',
        sound: '🔊 Sound', sounds: 'Sound effects', soundsDesc: 'Sounds for successes, mistakes and games',
        keySound: 'Typing click', keySoundDesc: 'A soft click for every correct keystroke',
        display: '🖥️ Display', showKeyboard: 'Show on-screen keyboard', showKeyboardDesc: 'Hidden = pro mode with +25 % XP',
        showHands: 'Show hands', showHandsDesc: 'Shows which finger to use',
        showHint: 'Show finger hint', showHintDesc: 'A short text saying which finger presses the next key',
        textSize: 'Text size', small: 'Small', normal: 'Normal', large: 'Large',
        theme: 'Theme', light: '☀️ Light', dark: '🌙 Dark',
        goal: '🎯 Daily goal', goalMin: 'Minutes per day', goalDesc: 'Counts the actual typing time in lessons, practice and games.',
        parents: '👪 For parents', unlock: 'Unlock all lessons', unlockDesc: 'For example, if your child already has some experience.',
        backup: 'Backup', backupDesc: 'Save all profiles to a file or restore them.',
        export: '⬇️ Export', import: '⬆️ Import', file: 'tastaturtrainer-backup-{date}.json',
        reset: 'Reset progress', resetDesc: 'Delete the stars, XP and statistics of this profile.', resetBtn: 'Reset',
        del: 'Delete profile', delDesc: 'Removes “{name}” completely.', delBtn: 'Delete',
        footnote: 'All data is stored only locally in this browser – nothing is sent to the internet.',
        gateTitle: 'Parents area', gateText: 'Please solve this:',
        importTitle: 'Load backup?', importText: 'The backup contains {n} profile(s). All current profiles on this computer will be replaced.', importOk: 'Yes, load it',
        resetTitle: 'Reset progress?', resetText: 'All stars, XP, badges and statistics of “{name}” will be deleted.',
        delTitle: 'Delete profile?', delText: 'The profile “{name}” and all its data will be deleted.',
      },
      games: {
        title: '🎮 Games', lead: 'Practice while you play! The games only use keys you have already learned.',
        record: '🏅 Record: {n} points', noRecord: 'No record yet', raceBeaten: '🏅 {n} of {total} animals beaten',
        play: '▶ Play', lock: '🔒 Complete lesson {n} to unlock this game', back: '← Games',
        blitz: ['Key Flash', 'A key appears – press it as fast as you can! How many can you get in 60 seconds?'],
        rain: ['Word Rain', 'Words are falling from the sky. Type them before they hit the ground!'],
        race: ['Animal Race', 'Race against speedy animals. Who types to the finish line first?'],
      },
      blitz: {
        intro: 'Press the key that appears here as fast as you can.<br>If you hesitate, it lights up on the keyboard to help you.<br><br><b>Ready? Press the <kbd>space bar</kbd>!</b>',
        go: 'Go!', streak: '🔥 {n} in a row! +{p} per hit', keepGoing: 'Keep going!', wrong: 'Oops – that was the wrong key.',
        over: "Time's up!",
      },
      rain: {
        text1: 'Words are falling from the sky! Type them before they hit the ground.<br>Just start with the first letter – the word will be highlighted.',
        text2: 'You have 3 hearts. Every 8 words the level goes up.',
        keys: '<kbd>Space</kbd> start · <kbd>Esc</kbd> pause', resume: '<kbd>Space</kbd> keep playing',
        level: 'Level {n}! 🚀', over: 'Game over!',
        sub: (p) => `You typed ${p.n} ${plural(p.n, 'word', 'words')}.`,
      },
      race: {
        back: '← Opponents', lead: 'Choose your opponent! Each animal types at a steady speed. Beat an animal to challenge the next one.',
        speed: '{n} chars/min', beaten: '🏅 Beaten – your speed: {n}', challenge: '⚔️ Challenge', locked: '🔒 Beat the animal before first',
        start: 'Press <kbd>space</kbd> to start!', go: 'GO!',
        win: 'You won!', lose: 'So close!', winSub: 'You were faster than {name}!',
        loseSub: '{name} was faster this time. Keep practicing and try again!',
        you: 'your speed', them: '{icon} speed', next: 'Next opponent: {icon} ▶',
      },
    },

    fingers: {
      LP: { name: 'left little finger' }, LR: { name: 'left ring finger' }, LM: { name: 'left middle finger' },
      LI: { name: 'left index finger' }, LT: { name: 'left thumb' }, RT: { name: 'right thumb' },
      RI: { name: 'right index finger' }, RM: { name: 'right middle finger' }, RR: { name: 'right ring finger' },
      RP: { name: 'right little finger' }, TH: { name: 'thumb' },
    },
    fingerTypes: { pinky: 'Little finger', ring: 'Ring finger', middle: 'Middle finger', index: 'Index finger', thumb: 'Thumb' },
    keyNames: { ' ': 'space', ',': 'comma', '.': 'period', '-': 'hyphen', '!': 'exclamation mark', '?': 'question mark', ':': 'colon', ';': 'semicolon', "'": 'apostrophe', '/': 'slash' },

    racers: { snail: 'Sally the Snail', turtle: 'Toby the Turtle', duck: 'Daisy the Duck', rabbit: 'Hoppy the Hare', horse: 'Harry the Horse', cheetah: 'Flash the Cheetah' },

    levelTitles: ['Key Chick', 'Typing Talent', 'Quick Fingers', 'Key Ace', 'Letter Pro', 'Typing Ninja',
      'Word Rocket', 'Flash Fingers', 'Typing Genius', 'Key Star', 'Keyboard Legend', 'Typing Superstar', 'Finger Wonder',
      'Key Champion', 'Typing Legend'],

    tips: [
      'Look at the screen while you type, not at the keys.',
      'Your index fingers find the bumps on F and J – without looking.',
      'Slow and correct beats fast and wrong.',
      'Press the space bar with your thumb.',
      'Practicing 10 minutes every day helps more than one hour once a week.',
      'After every keystroke your fingers go back to the home row.',
      'Sit up straight and keep your shoulders relaxed.',
      'Take a break now and then and shake out your hands.',
      'For capital letters, press the Shift key with your other hand.',
      'Hide the keyboard when you feel confident – you get bonus XP!',
    ],

    praise: [
      { min: 0.99, texts: ['Wow, almost perfect! 🤩', 'Outstanding!', 'Amazingly accurate!'] },
      { min: 0.95, texts: ['Great job!', 'Awesome!', 'Excellent, keep it up!'] },
      { min: 0.9, texts: ['Well done!', 'Nice! You keep getting better.'] },
      { min: 0.8, texts: ['You did it! Typing a bit slower helps you avoid mistakes.', 'Good! Pay a little more attention to accuracy.'] },
      { min: 0, texts: ["Don't give up! Type a little slower – accuracy matters more than speed."] },
    ],

    achievements: {
      first: ['First step', 'Complete your first lesson.'],
      guide: ['Well prepared', 'Read “How it works” to the end and try the home position.'],
      world0: ['Island explored', 'Complete all lessons of the first world.'],
      world1: ['Through the forest', 'Complete all lessons of the second world.'],
      world2: ['Crystals found', 'Complete all lessons of the third world.'],
      world3: ['Dragon tamed', 'Complete all lessons of the fourth world.'],
      perfect: ['Flawless!', 'Complete a round without a single mistake.'],
      perfect10: ['Bullseye', 'Complete 10 rounds without mistakes.'],
      stars10: ['10 stars', 'Collect 10 stars.'],
      stars30: ['Star shower', 'Collect 30 stars.'],
      starsAll: ['Superstar', 'Collect all the stars of a course.'],
      keys1k: ['A thousand keys', 'Type 1,000 characters correctly.'],
      keys10k: ['Key rocket', 'Type 10,000 characters correctly.'],
      keys50k: ['Typing universe', 'Type 50,000 characters correctly.'],
      speed60: ['Quick fingers', 'Reach 60 characters per minute in a round.'],
      speed100: ['Lightning fast', 'Reach 100 characters per minute in a round.'],
      speed150: ['Turbo fingers', 'Reach 150 characters per minute in a round.'],
      goal: ['Daily goal done', 'Reach your daily goal.'],
      streak3: ['Sticking with it', 'Practice on 3 days in a row.'],
      streak7: ['A whole week', 'Practice on 7 days in a row.'],
      blind: ['No peeking', 'Complete a lesson with the keyboard hidden.'],
      blitz: ['Flash pro', 'Hit 50 keys in Key Flash.'],
      rain: ['Rain maker', 'Score 500 points in Word Rain.'],
      race1: ['First win', 'Win an animal race.'],
      raceAll: ['Cheetah beaten', 'Win the animal race against the cheetah.'],
      level5: ['Climbing up', 'Reach level 5.'],
      level10: ['Crowned', 'Reach level 10.'],
    },

    guide: [
      { title: 'What is touch typing?', body: `
        <p>With <b>touch typing</b> you type with all ten fingers – <b>without looking at the keyboard</b>.</p>
        <p>Each finger takes care of a few specific keys. It feels strange at first. But with a little practice you will type much faster than with two fingers – and your eyes stay on the screen the whole time.</p>
        <div class="compare">
          <div class="cmp bad"><span class="cmp-ic">🐢</span><b>Hunt and peck</b><span>Your eyes keep jumping back and forth between the keyboard and the screen.</span></div>
          <div class="cmp good"><span class="cmp-ic">🚀</span><b>Touch typing</b><span>Your fingers find the keys on their own. Your eyes stay on the text.</span></div>
        </div>` },
      { title: 'Sit the right way', body: `
        <ul class="checklist">
          <li><span>🧍</span><div>Sit up straight with your back against the chair.</div></li>
          <li><span>🦶</span><div>Keep both feet flat on the floor.</div></li>
          <li><span>💪</span><div>Relax your shoulders and keep your elbows at about a right angle.</div></li>
          <li><span>🖐️</span><div>Your wrists float just above the edge of the desk. Your fingers are slightly curved – like the paws of a little cat.</div></li>
          <li><span>🖥️</span><div>The screen is about an arm's length away.</div></li>
        </ul>` },
      { title: 'The home position', body: `
        <p>Your fingers have a home: the <b>home row</b> in the middle of the keyboard.</p>
        <p>On the left your fingers rest on <b>{homeLeft}</b>, on the right on <b>{homeRight}</b>. Your thumbs rest on the <b>space bar</b>.</p>
        <p>After every keystroke, the finger goes straight back home.</p>` },
      { title: 'The bumps on F and J', body: `
        <p>The <b>F</b> and <b>J</b> keys have little <b>bumps</b>. Feel for them with your index fingers!</p>
        <p>That way you can always find the home position again – without looking. If you get “lost”, just feel for the bumps.</p>` },
      { title: 'Every finger has its color', body: `
        <p>The on-screen keyboard shows which finger presses which keys. <b>Same color = same finger</b> – on the left and on the right.</p>
        <div class="legend">{legend}</div>
        <p>The index fingers have the most work to do: each one takes care of two columns!</p>` },
      { title: 'Pro tips', body: `
        <ul class="checklist">
          <li><span>🎯</span><div><b>Accuracy first:</b> Type slowly and correctly. Speed comes by itself.</div></li>
          <li><span>🙈</span><div><b>Don't peek:</b> Even if it's hard – look at the screen. When you feel confident, hide the keyboard.</div></li>
          <li><span>🏠</span><div><b>Back home:</b> After every keystroke your finger goes back to the home position.</div></li>
          <li><span>👍</span><div><b>Space bar:</b> Press it with your thumb.</div></li>
          <li><span>⇧</span><div><b>Capital letters:</b> The other hand always presses the Shift key.</div></li>
          <li><span>📅</span><div><b>A little every day:</b> 10 minutes a day helps more than one hour on the weekend.</div></li>
          <li><span>🤲</span><div><b>Breaks:</b> When your hands get tired, shake them out.</div></li>
        </ul>` },
      { title: 'How TastaturTrainer works', body: `
        <ul class="checklist">
          <li><span>🗺️</span><div><b>Learning path:</b> {lessons} lessons in {worlds} worlds. Each lesson teaches you new keys.</div></li>
          <li><span>🔁</span><div><b>3 rounds per lesson:</b> First the new keys, then a letter mix, then real words.</div></li>
          <li><span>⭐</span><div><b>Stars:</b> 80 % correct gives you one star, 90 % two, 96 % plus enough speed three. One star unlocks the next lesson.</div></li>
          <li><span>✨</span><div><b>XP & levels:</b> Every correct character earns points. New levels unlock new animals.</div></li>
          <li><span>🎮</span><div><b>Games:</b> Key Flash, Word Rain and Animal Race – they only use keys you already know.</div></li>
          <li><span>🔴</span><div><b>Made a mistake?</b> The letter turns red. Just type the right key – no need to delete anything.</div></li>
        </ul>` },
      { title: 'Try it!', body: `
        <p>Put your fingers in the home position and type the letters one after the other. Press the space bar with your thumb.</p>` },
    ],

    course: {
      worlds: [
        { id: 0, name: 'Home Row Island', icon: '🏝️', color: '#18b6a0', desc: 'This is where your fingers live: the home row.' },
        { id: 1, name: 'Enchanted Forest', icon: '🌳', color: '#3fa34d', desc: 'Your fingers climb up.' },
        { id: 2, name: 'Crystal Cave', icon: '💎', color: '#5b7cfa', desc: 'Down to the bottom row!' },
        { id: 3, name: 'Dragon Castle', icon: '🏰', color: '#f0643c', desc: 'Capitals, punctuation, numbers and whole sentences.' },
      ],
      lessons: [
        { id: 'fj', world: 0, title: 'F and J', keys: ['f', 'j'],
          intro: 'On the <b>F</b> and <b>J</b> keys you will find little bumps. You can feel them with your index fingers – that way you can always find your way back without looking! Your left index finger rests on F, your right one on J. Your thumbs rest on the space bar.',
          tip: 'Feel for them: can you find the little bumps on F and J?' },
        { id: 'dk', world: 0, title: 'D and K', keys: ['d', 'k'],
          intro: 'Your middle fingers rest right next to your index fingers: left on <b>D</b>, right on <b>K</b>.',
          tip: 'Keep your index fingers on F and J while your middle fingers type.' },
        { id: 'sl', world: 0, title: 'S and L', keys: ['s', 'l'],
          intro: 'Now your ring fingers join in: left on <b>S</b>, right on <b>L</b>.',
          tip: 'Ring fingers are a bit clumsy at first. That is completely normal – with practice they get strong!' },
        { id: 'a-semi', world: 0, title: 'A and ;', keys: ['a', ';'],
          intro: 'Your little fingers rest on the outside: left on <b>A</b>, right on the <b>semicolon</b> (;). Now all eight fingers are in the home position: <b>A S D F</b> – <b>J K L ;</b>.',
          tip: 'This is the home position. Your fingers always come back here.' },
        { id: 'gh', world: 0, title: 'G and H', keys: ['g', 'h'],
          intro: 'Your index fingers may slide toward the middle: your left index finger types <b>G</b>, your right one types <b>H</b>. Then go straight back to F and J!',
          tip: 'After G and H, always go back to the bumps on F and J.' },
        { id: 'ei', world: 1, title: 'E and I', keys: ['e', 'i'],
          intro: 'Your middle fingers climb up: left to <b>E</b>, right to <b>I</b>. With E and I you can already type lots of real words!',
          tip: 'Only the middle finger moves – the other fingers stay where they are.' },
        { id: 'ru', world: 1, title: 'R and U', keys: ['r', 'u'],
          intro: 'Your index fingers reach up: left to <b>R</b>, right to <b>U</b>.',
          tip: 'R is diagonally above F, U is diagonally above J.' },
        { id: 'ty', world: 1, title: 'T and Y', keys: ['t', 'y'],
          intro: 'Your index fingers reach up toward the middle: left to <b>T</b>, right to <b>Y</b>.',
          tip: 'T and Y sit right next to each other. T is on the left, Y on the right.' },
        { id: 'nm', world: 1, title: 'N and M', keys: ['n', 'm'],
          intro: 'Your right index finger goes down: <b>N</b> is diagonally below and to the left of J, <b>M</b> is right below it.',
          tip: 'N is one of the most common letters in English. Great that you know it now!' },
        { id: 'wo', world: 1, title: 'W and O', keys: ['w', 'o'],
          intro: 'Your ring fingers climb up: left to <b>W</b>, right to <b>O</b>.',
          tip: 'When your ring finger types, your little finger stays on its key.' },
        { id: 'c-comma', world: 2, title: 'C and comma', keys: ['c', ','],
          intro: 'Your middle fingers go down: left to <b>C</b>, right to the <b>comma</b> (,).',
          tip: 'C appears in lots of words, like “cat”, “car” and “nice”.' },
        { id: 'vb', world: 2, title: 'V and B', keys: ['v', 'b'],
          intro: 'Your left index finger goes down: <b>V</b> is diagonally below F, <b>B</b> is right next to it.',
          tip: 'B is right in the middle – your left index finger stretches a little.' },
        { id: 'qp', world: 2, title: 'Q and P', keys: ['q', 'p'],
          intro: 'Your little fingers climb up: left to <b>Q</b>, right to <b>P</b>.',
          tip: 'In English, Q almost always comes with U: qu as in “queen”.' },
        { id: 'x-dot', world: 2, title: 'X and period', keys: ['x', '.'],
          intro: 'Your ring fingers go down: left to <b>X</b>, right to the <b>period</b> (.).',
          tip: 'A sentence ends with a period.' },
        { id: 'z-apos', world: 2, title: 'Z and apostrophe', keys: ['z', "'"],
          intro: "Your left little finger goes down to <b>Z</b>. Your right little finger moves one key to the right of the semicolon for the <b>apostrophe</b> (').",
          tip: 'With the apostrophe you can type words like “don\'t” and “it\'s”.' },
        { id: 'review', world: 3, title: 'All letters', type: 'review', keys: [],
          intro: 'You know every letter now! In this review lesson you type real words with the whole alphabet.',
          tip: 'Remember: eyes on the screen, fingers back to the home row.' },
        { id: 'shift', world: 3, title: 'Capital letters', type: 'shift', keys: [],
          intro: 'For capital letters, hold the <b>Shift key ⇧</b> – always with the little finger of the <b>other</b> hand! For a capital F (left hand) your right little finger holds the right ⇧ key. For a capital J (right hand) your left little finger holds the left ⇧ key.',
          tip: 'In English, sentences, names, days and months start with a capital letter – and so does the word “I”.' },
        { id: 'punct', world: 3, title: 'Punctuation', type: 'punct', keys: ['!', '?', ':'],
          intro: 'Exclamation marks, question marks and colons need the Shift key: <b>!</b> is ⇧ + 1, <b>?</b> is ⇧ + / and <b>:</b> is ⇧ + ;.',
          tip: 'Questions end with a question mark. Hooray! ends with an exclamation mark.' },
        { id: 'numbers', world: 3, title: 'Numbers', type: 'numbers', keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
          intro: 'The numbers are at the very top. Each finger stretches far up. Left: <b>1</b> little finger, <b>2</b> ring finger, <b>3</b> middle finger, <b>4</b> and <b>5</b> index finger. Right: <b>6</b> and <b>7</b> index finger, <b>8</b> middle finger, <b>9</b> ring finger, <b>0</b> little finger.',
          tip: 'Stretch only that one finger up. The others stay in the home position.' },
        { id: 'sentences', world: 3, title: 'Sentence pro', type: 'sentences', keys: [],
          intro: 'You know all the important keys now! In the last lesson you type whole sentences – like a real typing pro.',
          tip: 'Steady and accurate beats rushed and fast.' },
      ],

      /* Lowercase except names, days, months, places and the word "I" */
      words: `
a an the and or but if so as at by in on of off to up out for from with into over under after before about again all
also any are am is was were be been can could do does did done has have had he she it its his her him they them their we
us our you your my me not no yes this that these those there here then than when where what who why how which while very
just only some many much more most such each every other another both own same few still too well even never always often
soon now today tonight tomorrow yesterday
ask asks add adds fall falls see sees feel feels like likes hide ride run runs sit sits fit get gets got give gave go goes
went come came make made take took look looks find found think know knew say said tell told play plays jump jumps swim
sing sang dance read write wrote draw drew eat ate drink sleep wake walk talk help helps call keep kept let put stand stop
start show try turn use want need love live move open close climb catch throw kick laugh smile cook bake build learn teach
type wish wait watch hold bring buy fly flew grow hear hug paint pick pull push rest shout skip slide splash share spin
lad lads alas alfalfa flask salad dash flash sash ash glad flag hall half has had gas lag hash shall fad sad dad dads all
cat dog fish bird frog duck horse cow pig sheep goat hen chick bee ant owl fox wolf bear lion tiger zebra giraffe monkey
panda koala rabbit mouse snake snail turtle whale shark dolphin seal penguin parrot spider beetle butterfly dragon unicorn
robot pirate knight queen king prince princess wizard witch fairy giant monster
house home room door window wall roof floor stairs garden yard tree flower grass leaf leaves rock stone sand beach sea lake
river hill mountain forest field farm barn road street city town park school class teacher desk chair table bed lamp book
pen pencil paper picture photo map clock phone computer keyboard key screen game toy ball doll kite bike car bus train plane
boat ship rocket truck
sun moon star sky cloud rain snow wind storm rainbow day night week month year time morning evening summer winter spring fall
apple banana cherry grape lemon orange pear peach melon berry bread butter cheese milk juice water tea cake cookie pizza
pasta soup egg honey sugar salt jam rice corn carrot potato
hat cap coat jacket shirt dress skirt sock shoe boot glove scarf bag box cup glass plate bowl fork knife spoon pot pan
hand arm leg foot feet head face nose ear eye mouth tooth teeth hair finger heart
friend family brother sister baby boy girl man men woman people child children kid kids
idea word letter name number line circle color music song party gift fun joy luck
big small tall short long old new young good bad happy glad funny silly kind nice cool hot warm cold wet dry fast slow loud
quiet soft hard clean dirty full empty light dark red blue green yellow pink purple brown black white gray gold silver round
sweet sour fresh brave smart lazy busy easy tiny huge great best first last next real right wrong ready sure free safe
don't can't won't isn't it's let's that's I'm you're we're they're didn't doesn't I
Monday Tuesday Wednesday Thursday Friday Saturday Sunday January February March April May June July August September
October November December London Paris Berlin Rome Africa America Europe Emma Tom Lily Max Mia Ben Anna Leo Sam Zoe Jack
Lucy`.trim().split(/\s+/),

      sentences: [
        'The dog plays in the garden.', 'The cat sleeps on the sofa.', 'The sun is shining today.', 'We are going to the zoo.',
        'In summer we swim in the lake.', 'The elephant has a long trunk.', 'I like to read exciting books.',
        'On Sunday we visit Grandma and Grandpa.', 'The dragon flies over the castle.', 'In the fall the leaves turn red and gold.',
        'The penguin waddles across the ice.', 'My sister is painting a picture.', 'The squirrel collects nuts.',
        'The astronaut flies to the moon.', 'In winter we build a snowman.', 'The fire truck has flashing lights.',
        'My bike is red and very fast.', 'The hedgehog hides in the leaves.', 'We bake a yummy cake.',
        'The owl hoots at night.', 'Ten fingers type on the keyboard.', 'The parrot can talk.',
        'The pony eats a carrot.', 'A rainbow has many colors.', 'The bee makes honey.', 'I like hot chocolate.',
        'The whale is the biggest animal in the sea.', 'The children play soccer in the park.', 'The wizard has a long beard.',
        'Tomorrow we take the train to the beach.', 'The knights meet at the castle.', 'Our teacher reads us a story.',
        'The frog jumps into the pond.', 'A fox and a rabbit live in the forest.', 'The princess rides a white horse.',
        'After school I do my homework.', 'The baby laughs and claps.', 'The baker makes fresh bread.',
        'We take the bus to school.', 'The koala climbs a tree.', 'A butterfly flies from flower to flower.',
        'The pirates are looking for treasure.', 'The robot can dance.', 'The snail carries its house on its back.',
        "It's a beautiful day.", "Let's go to the park.", "I can't find my other shoe.",
        "What is your best friend's name?", 'Can you type without looking?', 'What are you doing this summer?',
        'Where is my other shoe?', 'Have you practiced today?', 'Do you like ice cream or cake?', 'Who ate the cake?',
        'Hooray, school is out!', 'Practice makes perfect!', "Don't look at the keys!", 'Watch out, here comes the ball!',
        'You did a great job!', 'Note: names start with a capital letter.', 'Hello, how are you?', 'Yay, it is snowing!',
      ],

      numberSentences: [
        'I am 9 years old.', 'We have 2 cats and 1 dog.', 'The book has 120 pages.', 'A year has 12 months.',
        'A week has 7 days.', 'A day has 24 hours.', 'An hour has 60 minutes.', 'A soccer team has 11 players.',
        'I can count to 100.', "Let's meet at 3 o'clock.", 'A spider has 8 legs.', 'There are 25 children in my class.',
        'A beetle has 6 legs.', 'Grandma will soon be 70 years old.', 'I have 10 fingers and 10 toes.', 'The bus comes at 8 every morning.',
        'There are 5 birds in the tree.', 'A die has 6 sides.', 'The game ended 3 to 2.', 'In 2030 I will be all grown up.',
      ],

      interjections: {
        excl: ['Hello', 'Hooray', 'Yay', 'Super', 'Great', 'Wow', 'Stop', 'Help', 'Look', 'Thanks', 'Please', 'Cool', 'Awesome', 'Yes', 'No'],
        quest: ['Who', 'How', 'What', 'Where', 'Why', 'When', 'Really', 'Ready', 'Yes', 'No', 'Okay'],
        colon: ['Note', 'Tip', 'Question', 'Answer', 'Name', 'Place', 'Date'],
      },
    },
  };
})(window.BT);
