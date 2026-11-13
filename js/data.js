'use strict';
/* TastaturTrainer – sprachunabhängige Stammdaten */
window.BT = window.BT || {};

(function (BT) {
  BT.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* Spiele – Namen und Beschreibungen kommen aus der Sprachdatei */
  BT.GAMES = [
    { id: 'blitz', screen: 'blitz', icon: '⚡', unlockAfter: 0 },
    { id: 'rain', screen: 'rain', icon: '🌧️', unlockAfter: 4 },
    { id: 'race', screen: 'raceSelect', icon: '🏁', unlockAfter: 6 },
  ];

  BT.RACERS = [
    { id: 'snail', icon: '🐌', zpm: 25 },
    { id: 'turtle', icon: '🐢', zpm: 40 },
    { id: 'duck', icon: '🦆', zpm: 60 },
    { id: 'rabbit', icon: '🐇', zpm: 85 },
    { id: 'horse', icon: '🐎', zpm: 115 },
    { id: 'cheetah', icon: '🐆', zpm: 150 },
  ];

  BT.AVATARS = [
    { e: '🐱', lvl: 1 }, { e: '🐶', lvl: 1 }, { e: '🐰', lvl: 1 }, { e: '🐸', lvl: 1 }, { e: '🐻', lvl: 1 }, { e: '🐭', lvl: 1 },
    { e: '🦊', lvl: 2 }, { e: '🐼', lvl: 3 }, { e: '🐨', lvl: 4 }, { e: '🐯', lvl: 5 }, { e: '🦁', lvl: 6 }, { e: '🐵', lvl: 7 },
    { e: '🐧', lvl: 8 }, { e: '🐙', lvl: 9 }, { e: '🦄', lvl: 10 }, { e: '🐲', lvl: 12 }, { e: '🤖', lvl: 14 }, { e: '🚀', lvl: 16 },
  ];
})(window.BT);
