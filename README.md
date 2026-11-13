# ⌨️ BlindTrainer – das 10-Finger-Abenteuer

Ein Lernspiel für Kinder, mit dem sie **Blindschreiben (10-Finger-System)** auf der **deutschen Tastatur (QWERTZ)** lernen – Schritt für Schritt, mit Erklärungen, Runden, Sternen, Levels, Abzeichen und Mini-Spielen.

Die App läuft komplett **lokal und offline**. Es muss nichts installiert werden, und es werden keine Daten ins Internet geschickt.

## Starten

| Weg | So geht's |
|---|---|
| **Empfohlen** | Doppelklick auf **`BlindTrainer starten.bat`**. Die App öffnet sich in einem eigenen Fenster (Microsoft Edge bzw. Chrome im App-Modus, ohne Adressleiste). |
| Desktop-Symbol | Einmal **`Desktop-Verknuepfung erstellen.bat`** doppelklicken. Danach liegt „BlindTrainer“ mit eigenem Symbol auf dem Desktop. |
| Direkt | `index.html` im Browser öffnen (Edge, Chrome oder Firefox). |

> Der Fortschritt wird im Browser gespeichert. Am besten immer auf dieselbe Weise starten, z. B. immer über die `.bat`-Datei bzw. das Desktop-Symbol, damit derselbe Browser benutzt wird.

## Was drin ist

**Lernpfad mit 20 Lektionen in 4 Welten**

| Welt | Lektionen |
|---|---|
| 🏝️ Grundreihen-Insel | F J · D K · S L · A Ö · G H |
| 🌳 Zauberwald | E I · R U · T Z · N M · W O |
| 💎 Kristallhöhle | C , · V B · Q P · X . · Y - |
| 🏰 Drachenburg | Ü Ä ß · Großbuchstaben · Satzzeichen ! ? : · Zahlen · ganze Sätze |

- Jede Lektion beginnt mit einer **Erklärung**: Welche Tasten sind neu, welcher Finger drückt sie, Tastatur und Hände zeigen es farbig. Man kann die neuen Tasten direkt ausprobieren.
- Danach kommen **3 Runden**: neue Tasten üben → Buchstaben-Mix → echte Wörter bzw. Sätze.
- **Sterne:** ⭐ ab 80 % richtig, ⭐⭐ ab 90 %, ⭐⭐⭐ ab 96 % und einem Mindesttempo. Mit einem Stern ist die nächste Lektion frei.
- Es kommen immer **nur Tasten vor, die schon gelernt wurden**.
- Bei einem Tippfehler wird der Buchstabe rot. Man tippt einfach die richtige Taste, Löschen ist nicht nötig.

**Motivation und Belohnungen**
- XP und Level mit Titeln (vom „Tasten-Küken“ bis zur „Tipp-Legende“)
- 18 Tiere als Avatar, die mit höheren Levels freigeschaltet werden
- 27 Abzeichen (z. B. „Fehlerfrei!“, „Ohne Gucken“, „Gepard geschlagen“)
- Tagesziel (einstellbar) und Serie: Wie viele Tage hintereinander wurde geübt?
- **Profi-Modus:** Wer die Bildschirm-Tastatur ausblendet, bekommt +25 % XP.

**Spiele** (werden nach und nach freigeschaltet)
- ⚡ **Tasten-Blitz**: 60 Sekunden lang so viele Tasten wie möglich treffen
- 🌧️ **Wort-Regen**: fallende Wörter abtippen, bevor sie den Boden erreichen
- 🏁 **Tier-Rennen**: Wettrennen gegen Schnecke, Schildkröte, Ente, Hase, Pferd und Gepard

**Außerdem**
- 📖 **So geht's**: Anleitung zu Sitzhaltung, Grundstellung, Fühltasten und Finger-Farben, mit einer Übung zum Ausprobieren
- 🏋️ **Training**: schwache Tasten gezielt üben, Wörter-Mix, Grundreihe, Sätze
- 📊 **Statistik**: Tempo-Verlauf und eine Tastatur-Karte, die zeigt, wo die meisten Fehler passieren
- 👥 **Mehrere Profile**, z. B. eines für jedes Kind

## Für Eltern

In **Einstellungen → Für Eltern** (geschützt mit einer kleinen Rechenaufgabe):
- alle Lektionen und Spiele freischalten, z. B. bei Vorkenntnissen
- **Sicherung** aller Profile als Datei exportieren bzw. wieder importieren, z. B. für einen anderen Computer
- Fortschritt zurücksetzen oder ein Profil löschen

Gut zu wissen:
- Die App ist für eine **deutsche Tastatur (QWERTZ)** gemacht.
- Die **Feststelltaste** (⇪) sollte aus sein. Die App warnt, wenn sie an ist.
- Empfehlung: lieber täglich 10–15 Minuten üben als selten lange.

## Technik

Reines HTML, CSS und JavaScript, ohne externe Bibliotheken und ohne Internet. Die Töne werden im Browser erzeugt.

```
index.html                      Einstieg
css/style.css                   Design (hell und dunkel)
js/data.js                      Tastatur, Finger, Lektionen, Wörter, Sätze
js/gen.js                       erzeugt die Übungstexte
js/typing.js                    Tipp-Engine und Tipp-Ansicht
js/keyboard.js                  Bildschirm-Tastatur und Hände
js/progress.js                  Sterne, XP, Level, Abzeichen
js/app.js, js/screens.js        Seiten und Navigation
js/games.js                     Spiele
js/store.js, js/sound.js        Speicherung und Töne
```
