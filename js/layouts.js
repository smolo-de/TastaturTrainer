'use strict';
/* TastaturTrainer – Tastatur-Layouts (deutsch QWERTZ, US-QWERTY) und Finger */
(function (BT) {
  /* Fingernamen werden von der Sprachdatei ergänzt (name, dat) */
  BT.FINGERS = {
    LP: { type: 'pinky', hand: 'L' }, LR: { type: 'ring', hand: 'L' }, LM: { type: 'middle', hand: 'L' },
    LI: { type: 'index', hand: 'L' }, LT: { type: 'thumb', hand: 'L' }, RT: { type: 'thumb', hand: 'R' },
    RI: { type: 'index', hand: 'R' }, RM: { type: 'middle', hand: 'R' }, RR: { type: 'ring', hand: 'R' },
    RP: { type: 'pinky', hand: 'R' }, TH: { type: 'thumb', hand: 'B' },
  };

  const k = (base, shift, finger, w) => ({ base, shift, finger, w });
  const s = (code, label, w, finger) => ({ code, label, w, finger: finger || null, special: true });

  BT.LAYOUTS = {
    qwertz: {
      home: { LP: 'a', LR: 's', LM: 'd', LI: 'f', RI: 'j', RM: 'k', RR: 'l', RP: 'ö' },
      rows: [
        [k('^', '°', 'LP'), k('1', '!', 'LP'), k('2', '"', 'LR'), k('3', '§', 'LM'), k('4', '$', 'LI'), k('5', '%', 'LI'), k('6', '&', 'RI'), k('7', '/', 'RI'), k('8', '(', 'RM'), k('9', ')', 'RR'), k('0', '=', 'RP'), k('ß', '?', 'RP'), k('´', '`', 'RP'), s('Backspace', '⌫', 2, 'RP')],
        [s('Tab', 'Tab', 1.5, 'LP'), k('q', 'Q', 'LP'), k('w', 'W', 'LR'), k('e', 'E', 'LM'), k('r', 'R', 'LI'), k('t', 'T', 'LI'), k('z', 'Z', 'RI'), k('u', 'U', 'RI'), k('i', 'I', 'RM'), k('o', 'O', 'RR'), k('p', 'P', 'RP'), k('ü', 'Ü', 'RP'), k('+', '*', 'RP'), Object.assign(s('Enter', '↵', 1.5, 'RP'), { seg1: true })],
        [s('CapsLock', '⇪', 1.75, 'LP'), k('a', 'A', 'LP'), k('s', 'S', 'LR'), k('d', 'D', 'LM'), k('f', 'F', 'LI'), k('g', 'G', 'LI'), k('h', 'H', 'RI'), k('j', 'J', 'RI'), k('k', 'K', 'RM'), k('l', 'L', 'RR'), k('ö', 'Ö', 'RP'), k('ä', 'Ä', 'RP'), k('#', "'", 'RP'), Object.assign(s('Enter', '', 1.25, 'RP'), { seg2: true })],
        [s('ShiftLeft', '⇧', 1.25, 'LP'), k('<', '>', 'LP'), k('y', 'Y', 'LP'), k('x', 'X', 'LR'), k('c', 'C', 'LM'), k('v', 'V', 'LI'), k('b', 'B', 'LI'), k('n', 'N', 'RI'), k('m', 'M', 'RI'), k(',', ';', 'RM'), k('.', ':', 'RR'), k('-', '_', 'RP'), s('ShiftRight', '⇧', 2.75, 'RP')],
        [s('CtrlLeft', 'Strg', 1.5), s('MetaLeft', '⊞', 1.25), s('AltLeft', 'Alt', 1.25), s('Space', '', 6.5, 'TH'), s('AltRight', 'Alt Gr', 1.25), s('Menu', '☰', 1.25), s('CtrlRight', 'Strg', 2)],
      ],
    },
    us: {
      home: { LP: 'a', LR: 's', LM: 'd', LI: 'f', RI: 'j', RM: 'k', RR: 'l', RP: ';' },
      rows: [
        [k('`', '~', 'LP'), k('1', '!', 'LP'), k('2', '@', 'LR'), k('3', '#', 'LM'), k('4', '$', 'LI'), k('5', '%', 'LI'), k('6', '^', 'RI'), k('7', '&', 'RI'), k('8', '*', 'RM'), k('9', '(', 'RR'), k('0', ')', 'RP'), k('-', '_', 'RP'), k('=', '+', 'RP'), s('Backspace', '⌫', 2, 'RP')],
        [s('Tab', 'Tab', 1.5, 'LP'), k('q', 'Q', 'LP'), k('w', 'W', 'LR'), k('e', 'E', 'LM'), k('r', 'R', 'LI'), k('t', 'T', 'LI'), k('y', 'Y', 'RI'), k('u', 'U', 'RI'), k('i', 'I', 'RM'), k('o', 'O', 'RR'), k('p', 'P', 'RP'), k('[', '{', 'RP'), k(']', '}', 'RP'), k('\\', '|', 'RP', 1.5)],
        [s('CapsLock', '⇪', 1.75, 'LP'), k('a', 'A', 'LP'), k('s', 'S', 'LR'), k('d', 'D', 'LM'), k('f', 'F', 'LI'), k('g', 'G', 'LI'), k('h', 'H', 'RI'), k('j', 'J', 'RI'), k('k', 'K', 'RM'), k('l', 'L', 'RR'), k(';', ':', 'RP'), k("'", '"', 'RP'), s('Enter', '↵', 2.25, 'RP')],
        [s('ShiftLeft', '⇧', 2.25, 'LP'), k('z', 'Z', 'LP'), k('x', 'X', 'LR'), k('c', 'C', 'LM'), k('v', 'V', 'LI'), k('b', 'B', 'LI'), k('n', 'N', 'RI'), k('m', 'M', 'RI'), k(',', '<', 'RM'), k('.', '>', 'RR'), k('/', '?', 'RP'), s('ShiftRight', '⇧', 2.75, 'RP')],
        [s('CtrlLeft', 'Ctrl', 1.5), s('MetaLeft', '⊞', 1.25), s('AltLeft', 'Alt', 1.25), s('Space', '', 6.5, 'TH'), s('AltRight', 'Alt', 1.25), s('Menu', '☰', 1.25), s('CtrlRight', 'Ctrl', 2)],
      ],
    },
  };

  /* Aktives Layout setzen: KEYBOARD, CHAR_MAP und HOME werden neu aufgebaut */
  BT.useLayout = (id) => {
    const L = BT.LAYOUTS[id] || BT.LAYOUTS.qwertz;
    BT.LAYOUT_ID = BT.LAYOUTS[id] ? id : 'qwertz';
    BT.KEYBOARD = L.rows;
    BT.HOME = L.home;
    BT.CHAR_MAP = {};
    let space = null;
    L.rows.forEach((row, r) => row.forEach((key, c) => {
      key.id = key.code || ('K' + r + '_' + c);
      if (key.id === 'Space') space = key;
      if (key.special) return;
      BT.CHAR_MAP[key.base] = { key, shift: false };
      BT.CHAR_MAP[key.shift] = { key, shift: true };
    }));
    BT.CHAR_MAP[' '] = { key: space, shift: false };
  };

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

  BT.useLayout('qwertz');
})(window.BT);
