'use strict';
/* BlindTrainer – Stammdaten: Tastatur, Finger, Lektionen, Wörter, Sätze */
window.BT = window.BT || {};

(function (BT) {
  BT.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Finger ---------- */
  BT.FINGERS = {
    LP: { name: 'linker kleiner Finger', dat: 'linken kleinen Finger', type: 'pinky', hand: 'L' },
    LR: { name: 'linker Ringfinger', dat: 'linken Ringfinger', type: 'ring', hand: 'L' },
    LM: { name: 'linker Mittelfinger', dat: 'linken Mittelfinger', type: 'middle', hand: 'L' },
    LI: { name: 'linker Zeigefinger', dat: 'linken Zeigefinger', type: 'index', hand: 'L' },
    LT: { name: 'linker Daumen', dat: 'linken Daumen', type: 'thumb', hand: 'L' },
    RT: { name: 'rechter Daumen', dat: 'rechten Daumen', type: 'thumb', hand: 'R' },
    RI: { name: 'rechter Zeigefinger', dat: 'rechten Zeigefinger', type: 'index', hand: 'R' },
    RM: { name: 'rechter Mittelfinger', dat: 'rechten Mittelfinger', type: 'middle', hand: 'R' },
    RR: { name: 'rechter Ringfinger', dat: 'rechten Ringfinger', type: 'ring', hand: 'R' },
    RP: { name: 'rechter kleiner Finger', dat: 'rechten kleinen Finger', type: 'pinky', hand: 'R' },
    TH: { name: 'Daumen', dat: 'Daumen', type: 'thumb', hand: 'B' },
  };
  BT.FINGER_TYPES = { pinky: 'Kleiner Finger', ring: 'Ringfinger', middle: 'Mittelfinger', index: 'Zeigefinger', thumb: 'Daumen' };
  BT.HOME = { LP: 'a', LR: 's', LM: 'd', LI: 'f', RI: 'j', RM: 'k', RR: 'l', RP: 'ö' };

  /* ---------- Deutsche QWERTZ-Tastatur ---------- */
  const k = (base, shift, finger) => ({ base, shift, finger });
  const s = (code, label, w, finger) => ({ code, label, w, finger: finger || null, special: true });
  BT.KEYBOARD = [
    [k('^', '°', 'LP'), k('1', '!', 'LP'), k('2', '"', 'LR'), k('3', '§', 'LM'), k('4', '$', 'LI'), k('5', '%', 'LI'), k('6', '&', 'RI'), k('7', '/', 'RI'), k('8', '(', 'RM'), k('9', ')', 'RR'), k('0', '=', 'RP'), k('ß', '?', 'RP'), k('´', '`', 'RP'), s('Backspace', '⌫', 2, 'RP')],
    [s('Tab', 'Tab', 1.5, 'LP'), k('q', 'Q', 'LP'), k('w', 'W', 'LR'), k('e', 'E', 'LM'), k('r', 'R', 'LI'), k('t', 'T', 'LI'), k('z', 'Z', 'RI'), k('u', 'U', 'RI'), k('i', 'I', 'RM'), k('o', 'O', 'RR'), k('p', 'P', 'RP'), k('ü', 'Ü', 'RP'), k('+', '*', 'RP'), s('Enter', '↵', 1.5, 'RP')],
    [s('CapsLock', '⇪', 1.75, 'LP'), k('a', 'A', 'LP'), k('s', 'S', 'LR'), k('d', 'D', 'LM'), k('f', 'F', 'LI'), k('g', 'G', 'LI'), k('h', 'H', 'RI'), k('j', 'J', 'RI'), k('k', 'K', 'RM'), k('l', 'L', 'RR'), k('ö', 'Ö', 'RP'), k('ä', 'Ä', 'RP'), k('#', "'", 'RP'), s('Enter', '', 1.25, 'RP')],
    [s('ShiftLeft', '⇧', 1.25, 'LP'), k('<', '>', 'LP'), k('y', 'Y', 'LP'), k('x', 'X', 'LR'), k('c', 'C', 'LM'), k('v', 'V', 'LI'), k('b', 'B', 'LI'), k('n', 'N', 'RI'), k('m', 'M', 'RI'), k(',', ';', 'RM'), k('.', ':', 'RR'), k('-', '_', 'RP'), s('ShiftRight', '⇧', 2.75, 'RP')],
    [s('CtrlLeft', 'Strg', 1.5), s('MetaLeft', '⊞', 1.25), s('AltLeft', 'Alt', 1.25), s('Space', '', 6.5, 'TH'), s('AltRight', 'Alt Gr', 1.25), s('Menu', '☰', 1.25), s('CtrlRight', 'Strg', 2)],
  ];
  BT.KEYBOARD[2][13].seg2 = true; // unterer Teil der Enter-Taste

  BT.CHAR_MAP = {};
  BT.KEYBOARD.forEach((row, r) => row.forEach((key, c) => {
    key.id = key.code || ('K' + r + '_' + c);
    if (key.special) return;
    BT.CHAR_MAP[key.base] = { key, shift: false };
    BT.CHAR_MAP[key.shift] = { key, shift: true };
  }));
  BT.CHAR_MAP[' '] = { key: BT.KEYBOARD[4][3], shift: false };

  /* Umschalttaste immer mit der anderen Hand */
  BT.shiftFor = (key) => (BT.FINGERS[key.finger].hand === 'L'
    ? { id: 'ShiftRight', finger: 'RP' }
    : { id: 'ShiftLeft', finger: 'LP' });

  BT.fingersFor = (ch) => {
    const m = BT.CHAR_MAP[ch];
    if (!m) return [];
    const f = m.key.finger;
    const list = f === 'TH' ? ['LT', 'RT'] : [f];
    if (m.shift) list.push(BT.shiftFor(m.key).finger);
    return list;
  };

  BT.KEY_NAMES = { ' ': 'Leertaste', ',': 'Komma', '.': 'Punkt', '-': 'Bindestrich', '!': 'Ausrufezeichen', '?': 'Fragezeichen', ':': 'Doppelpunkt', 'ß': 'scharfes S' };

  /* ---------- Welten & Lektionen ---------- */
  BT.WORLDS = [
    { id: 0, name: 'Grundreihen-Insel', icon: '🏝️', color: '#18b6a0', desc: 'Hier wohnen deine Finger: die Grundreihe.' },
    { id: 1, name: 'Zauberwald', icon: '🌳', color: '#3fa34d', desc: 'Die Finger klettern nach oben.' },
    { id: 2, name: 'Kristallhöhle', icon: '💎', color: '#5b7cfa', desc: 'Ab in die untere Reihe!' },
    { id: 3, name: 'Drachenburg', icon: '🏰', color: '#f0643c', desc: 'Großbuchstaben, Satzzeichen, Zahlen und ganze Sätze.' },
  ];

  BT.LESSONS = [
    { world: 0, title: 'F und J', keys: ['f', 'j'],
      intro: 'Auf den Tasten <b>F</b> und <b>J</b> findest du kleine Huckel. Die kannst du mit den Zeigefingern fühlen – so findest du immer zurück, ohne hinzuschauen! Der linke Zeigefinger liegt auf F, der rechte auf J. Die Daumen ruhen auf der Leertaste.',
      tip: 'Fühl mal nach: Spürst du die kleinen Huckel auf F und J?' },
    { world: 0, title: 'D und K', keys: ['d', 'k'],
      intro: 'Die Mittelfinger liegen direkt neben den Zeigefingern: links auf <b>D</b>, rechts auf <b>K</b>.',
      tip: 'Lass die Zeigefinger auf F und J liegen, während die Mittelfinger tippen.' },
    { world: 0, title: 'S und L', keys: ['s', 'l'],
      intro: 'Jetzt kommen die Ringfinger dazu: links auf <b>S</b>, rechts auf <b>L</b>.',
      tip: 'Die Ringfinger sind am Anfang etwas ungeschickt. Das ist ganz normal – mit Übung werden sie stark!' },
    { world: 0, title: 'A und Ö', keys: ['a', 'ö'],
      intro: 'Die kleinen Finger liegen ganz außen: links auf <b>A</b>, rechts auf <b>Ö</b>. Jetzt liegen alle acht Finger in der Grundstellung: <b>A S D F</b> – <b>J K L Ö</b>.',
      tip: 'Das ist die Grundstellung. Hierher kehren deine Finger immer wieder zurück.' },
    { world: 0, title: 'G und H', keys: ['g', 'h'],
      intro: 'Die Zeigefinger dürfen zur Mitte rutschen: Der linke Zeigefinger tippt <b>G</b>, der rechte tippt <b>H</b>. Danach geht es sofort zurück auf F und J!',
      tip: 'Nach G und H immer zurück zu den Huckeln auf F und J.' },

    { world: 1, title: 'E und I', keys: ['e', 'i'],
      intro: 'Die Mittelfinger klettern nach oben: links zum <b>E</b>, rechts zum <b>I</b>. Mit E und I kannst du schon viele echte Wörter schreiben!',
      tip: 'Nur der Mittelfinger bewegt sich – die anderen Finger bleiben liegen.' },
    { world: 1, title: 'R und U', keys: ['r', 'u'],
      intro: 'Die Zeigefinger strecken sich nach oben: links zum <b>R</b>, rechts zum <b>U</b>.',
      tip: 'R liegt schräg über F, U liegt schräg über J.' },
    { world: 1, title: 'T und Z', keys: ['t', 'z'],
      intro: 'Die Zeigefinger gehen nach oben zur Mitte: links zum <b>T</b>, rechts zum <b>Z</b>. Auf deutschen Tastaturen liegt das Z oben in der Mitte!',
      tip: 'T und Z liegen direkt nebeneinander. Links ist T, rechts ist Z.' },
    { world: 1, title: 'N und M', keys: ['n', 'm'],
      intro: 'Der rechte Zeigefinger geht nach unten: <b>N</b> liegt schräg links unter J, <b>M</b> liegt direkt darunter.',
      tip: 'N ist einer der häufigsten Buchstaben im Deutschen. Gut, dass du ihn jetzt kannst!' },
    { world: 1, title: 'W und O', keys: ['w', 'o'],
      intro: 'Die Ringfinger klettern nach oben: links zum <b>W</b>, rechts zum <b>O</b>.',
      tip: 'Wenn der Ringfinger tippt, bleibt der kleine Finger auf seiner Taste liegen.' },

    { world: 2, title: 'C und Komma', keys: ['c', ','],
      intro: 'Die Mittelfinger gehen nach unten: links zum <b>C</b>, rechts zum <b>Komma</b> (,).',
      tip: 'Mit C kannst du jetzt auch „ch“ und „sch“ schreiben – wie in „ich“ und „Schule“.' },
    { world: 2, title: 'V und B', keys: ['v', 'b'],
      intro: 'Der linke Zeigefinger geht nach unten: <b>V</b> liegt schräg unter F, <b>B</b> liegt rechts daneben.',
      tip: 'B liegt ganz in der Mitte – der linke Zeigefinger streckt sich ein bisschen.' },
    { world: 2, title: 'Q und P', keys: ['q', 'p'],
      intro: 'Die kleinen Finger klettern nach oben: links zum <b>Q</b>, rechts zum <b>P</b>.',
      tip: 'Q kommt im Deutschen fast immer zusammen mit U: Qu wie in Qualle.' },
    { world: 2, title: 'X und Punkt', keys: ['x', '.'],
      intro: 'Die Ringfinger gehen nach unten: links zum <b>X</b>, rechts zum <b>Punkt</b> (.).',
      tip: 'Am Ende eines Satzes steht ein Punkt.' },
    { world: 2, title: 'Y und Bindestrich', keys: ['y', '-'],
      intro: 'Die kleinen Finger gehen nach unten: links zum <b>Y</b>, rechts zum <b>Bindestrich</b> (-).',
      tip: 'Y und Z verwechselt man leicht. Das Y ist unten links, das Z oben in der Mitte.' },

    { world: 3, title: 'Ü, Ä und ß', keys: ['ü', 'ä', 'ß'],
      intro: 'Der rechte kleine Finger hat viel zu tun: <b>Ü</b> liegt rechts neben P, <b>Ä</b> liegt rechts neben Ö, und das <b>ß</b> wohnt ganz oben in der Zahlenreihe.',
      tip: 'Nach jedem Ausflug kehrt der kleine Finger zurück aufs Ö.' },
    { world: 3, title: 'Großbuchstaben', type: 'shift', keys: [],
      intro: 'Für große Buchstaben hältst du die <b>Umschalttaste ⇧</b> gedrückt – und zwar immer mit dem kleinen Finger der <b>anderen</b> Hand! Für ein großes F (linke Hand) hält der rechte kleine Finger die rechte ⇧-Taste. Für ein großes J (rechte Hand) hält der linke kleine Finger die linke ⇧-Taste.',
      tip: 'Im Deutschen schreibt man Nomen (Namenwörter) und den Satzanfang groß.' },
    { world: 3, title: 'Satzzeichen', type: 'punct', keys: ['!', '?', ':'],
      intro: 'Ausrufezeichen, Fragezeichen und Doppelpunkt brauchen die Umschalttaste: <b>!</b> ist ⇧ + 1, <b>?</b> ist ⇧ + ß und <b>:</b> ist ⇧ + Punkt.',
      tip: 'Fragen enden mit einem Fragezeichen. Hurra! endet mit einem Ausrufezeichen.' },
    { world: 3, title: 'Zahlen', type: 'numbers', keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      intro: 'Die Zahlen stehen ganz oben. Jeder Finger streckt sich weit nach oben. Links: <b>1</b> kleiner Finger, <b>2</b> Ringfinger, <b>3</b> Mittelfinger, <b>4</b> und <b>5</b> Zeigefinger. Rechts: <b>6</b> und <b>7</b> Zeigefinger, <b>8</b> Mittelfinger, <b>9</b> Ringfinger, <b>0</b> kleiner Finger.',
      tip: 'Strecke nur den einen Finger nach oben. Die anderen bleiben in der Grundstellung.' },
    { world: 3, title: 'Satz-Profi', type: 'sentences', keys: [],
      intro: 'Du kennst jetzt alle wichtigen Tasten! In der letzten Lektion schreibst du ganze Sätze – wie ein echter Tipp-Profi.',
      tip: 'Lieber gleichmäßig und richtig als hektisch und schnell.' },
  ];

  /* ---------- Wortschatz (Nomen großgeschrieben; vor der Großbuchstaben-Lektion wird alles kleingeschrieben) ---------- */
  BT.WORDS = `
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
Schloss Krone Gold Schwert`.trim().split(/\s+/);

  BT.SENTENCES = [
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
  ];

  BT.NUMBER_SENTENCES = [
    'Ich bin 9 Jahre alt.', 'Wir haben 2 Katzen und 1 Hund.', 'Das Buch hat 120 Seiten.', 'Ein Jahr hat 12 Monate.',
    'Eine Woche hat 7 Tage.', 'Ein Tag hat 24 Stunden.', 'Eine Stunde hat 60 Minuten.', 'Eine Fußballmannschaft hat 11 Spieler.',
    'Ich kann bis 100 zählen.', 'Wir treffen uns um 3 Uhr.', 'Die Spinne hat 8 Beine.', 'In meiner Klasse sind 25 Kinder.',
    'Der Käfer hat 6 Beine.', 'Oma wird bald 70 Jahre alt.', 'Ich habe 10 Finger und 10 Zehen.', 'Der Bus fährt um 7 Uhr 45.',
    'Auf dem Baum sitzen 5 Vögel.', 'Ein Würfel hat 6 Seiten.', 'Das Spiel endet 3 zu 2.', 'Im Jahr 2030 bin ich schon groß.',
  ];

  BT.INTERJECTIONS = {
    excl: ['Hallo', 'Hurra', 'Juhu', 'Super', 'Toll', 'Prima', 'Klasse', 'Stopp', 'Hilfe', 'Achtung', 'Vorsicht', 'Komm', 'Los', 'Danke', 'Bitte', 'Halt'],
    quest: ['Wer', 'Wie', 'Was', 'Wo', 'Warum', 'Wann', 'Wieso', 'Woher', 'Wohin', 'Echt', 'Ja', 'Nein'],
    colon: ['Achtung', 'Tipp', 'Hinweis', 'Merke', 'Frage', 'Antwort', 'Name', 'Ort'],
  };

  /* ---------- Spiele ---------- */
  BT.GAMES = [
    { id: 'blitz', screen: 'blitz', icon: '⚡', name: 'Tasten-Blitz', unlockAfter: 0,
      desc: 'Eine Taste erscheint – drück sie so schnell du kannst! Wie viele schaffst du in 60 Sekunden?' },
    { id: 'rain', screen: 'rain', icon: '🌧️', name: 'Wort-Regen', unlockAfter: 4,
      desc: 'Wörter fallen vom Himmel. Tippe sie ab, bevor sie den Boden berühren!' },
    { id: 'race', screen: 'raceSelect', icon: '🏁', name: 'Tier-Rennen', unlockAfter: 6,
      desc: 'Tritt gegen flinke Tiere an. Wer tippt schneller ins Ziel?' },
  ];

  BT.RACERS = [
    { id: 'snail', icon: '🐌', name: 'Schnecke Susi', zpm: 25 },
    { id: 'turtle', icon: '🐢', name: 'Schildkröte Theo', zpm: 40 },
    { id: 'duck', icon: '🦆', name: 'Ente Emma', zpm: 60 },
    { id: 'rabbit', icon: '🐇', name: 'Hase Hoppel', zpm: 85 },
    { id: 'horse', icon: '🐎', name: 'Pferd Paula', zpm: 115 },
    { id: 'cheetah', icon: '🐆', name: 'Gepard Blitz', zpm: 150 },
  ];

  /* ---------- Belohnungen ---------- */
  BT.AVATARS = [
    { e: '🐱', lvl: 1 }, { e: '🐶', lvl: 1 }, { e: '🐰', lvl: 1 }, { e: '🐸', lvl: 1 }, { e: '🐻', lvl: 1 }, { e: '🐭', lvl: 1 },
    { e: '🦊', lvl: 2 }, { e: '🐼', lvl: 3 }, { e: '🐨', lvl: 4 }, { e: '🐯', lvl: 5 }, { e: '🦁', lvl: 6 }, { e: '🐵', lvl: 7 },
    { e: '🐧', lvl: 8 }, { e: '🐙', lvl: 9 }, { e: '🦄', lvl: 10 }, { e: '🐲', lvl: 12 }, { e: '🤖', lvl: 14 }, { e: '🚀', lvl: 16 },
  ];

  BT.LEVEL_TITLES = ['Tasten-Küken', 'Tipp-Talent', 'Flinke Finger', 'Tasten-Ass', 'Buchstaben-Profi', 'Tipp-Ninja',
    'Wort-Rakete', 'Blitzfinger', 'Tipp-Genie', 'Tasten-Star', 'Tastatur-Legende', 'Tipp-Superstar', 'Finger-Wunder',
    'Tasten-Champion', 'Tipp-Legende'];

  BT.TIPS = [
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
  ];

  BT.PRAISE = [
    { min: 0.99, texts: ['Wow, fast fehlerfrei! 🤩', 'Spitzenklasse!', 'Unglaublich genau!'] },
    { min: 0.95, texts: ['Super gemacht!', 'Klasse!', 'Prima, weiter so!'] },
    { min: 0.9, texts: ['Gut gemacht!', 'Schön! Du wirst immer besser.'] },
    { min: 0.8, texts: ['Geschafft! Etwas langsamer tippen hilft gegen Fehler.', 'Gut! Achte noch ein bisschen auf Genauigkeit.'] },
    { min: 0, texts: ['Nicht aufgeben! Tippe etwas langsamer – Genauigkeit ist wichtiger als Tempo.'] },
  ];
})(window.BT);
