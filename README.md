# ⌨️ TastaturTrainer – das 10-Finger-Abenteuer

Ein Lernspiel für Kinder: Es bringt ihnen das **Blindschreiben (10-Finger-System)** bei. Das geht Schritt für Schritt, mit Erklärungen, Runden, Sternen, Levels, Abzeichen und Mini-Spielen.

Die App läuft komplett **lokal und offline**. Es muss nichts installiert werden, und es werden keine Daten ins Internet geschickt.

> 🇬🇧 **English:** TastaturTrainer is an offline touch typing trainer for children. It is available in **English (US QWERTY keyboard)** and **German (QWERTZ keyboard)**. To start it, double-click `TastaturTrainer starten.bat` or open `index.html`. Switch the language on the start screen or in *Settings → Language & keyboard*.

## Starten

| Weg | So geht's |
|---|---|
| **Empfohlen** | Doppelklick auf **`TastaturTrainer starten.bat`**. Die App öffnet sich in einem eigenen Fenster: Microsoft Edge bzw. Chrome im App-Modus, ohne Adressleiste. |
| Desktop-Symbol | Einmal **`Desktop-Verknuepfung erstellen.bat`** doppelklicken. Danach liegt „TastaturTrainer“ mit eigenem Symbol auf dem Desktop. |
| Direkt | `index.html` im Browser öffnen (Edge, Chrome oder Firefox) |

> Der Fortschritt wird im Browser gespeichert. Am besten immer auf dieselbe Weise starten, damit derselbe Browser benutzt wird.

## Sprachen und Tastaturen

| Sprache | Tastatur | Kurs |
|---|---|---|
| Deutsch | deutsche Tastatur (QWERTZ) | F J · D K · S L · A Ö · G H · E I · R U · T Z · N M · W O · C , · V B · Q P · X . · Y - · Ü Ä ß · Großbuchstaben · ! ? : · Zahlen · Sätze |
| English | US keyboard (QWERTY) | F J · D K · S L · A ; · G H · E I · R U · T Y · N M · W O · C , · V B · Q P · X . · Z ' · all letters · capitals · ! ? : · numbers · sentences |

Die Sprache bestimmt Texte, Übungswörter, Sätze und das Layout der Bildschirm-Tastatur. Sie wird pro Profil gespeichert. Den Lernfortschritt gibt es pro Kurs getrennt; XP, Level, Abzeichen und Spiel-Rekorde gelten für beide Kurse.

## Was drin ist

- **Lernpfad:** 20 Lektionen in 4 Welten (Insel, Zauberwald, Kristallhöhle, Drachenburg).
  - Vor jeder Lektion kommt eine Erklärung: welche Tasten neu sind und welcher Finger sie drückt. Tastatur und Hände zeigen es farbig, und die neuen Tasten lassen sich gleich ausprobieren.
  - Danach kommen **3 Runden**: neue Tasten → Buchstaben-Mix → echte Wörter bzw. Sätze.
  - Es kommen immer nur Tasten vor, die schon gelernt wurden.
- **Sterne:** ⭐ ab 80 % richtig, ⭐⭐ ab 90 %, ⭐⭐⭐ ab 96 % und einem Mindesttempo. Ein Stern schaltet die nächste Lektion frei.
- **Motivation:** XP und Level mit Titeln, 18 Tiere als Avatar, 27 Abzeichen, Tagesziel und Serie. Im **Profi-Modus** (Tastatur ausgeblendet) gibt es +25 % XP.
- **Spiele:** Tasten-Blitz, Wort-Regen und Tier-Rennen (gegen Schnecke bis Gepard)
- **So geht's:** Sitzhaltung, Grundstellung, Fühltasten, Finger-Farben und eine Übung zum Ausprobieren
- **Training und Statistik:** schwache Tasten gezielt üben, Tempo-Verlauf ansehen und eine Fehler-Karte der Tastatur
- **Mehrere Profile**, z. B. eines für jedes Kind

## Für Eltern

In **Einstellungen → Für Eltern** (geschützt mit einer kleinen Rechenaufgabe):
- alle Lektionen freischalten
- Sicherung aller Profile exportieren und importieren
- Fortschritt zurücksetzen oder ein Profil löschen

Die Feststelltaste (⇪) sollte aus sein; die App warnt, wenn sie an ist. Empfehlung: lieber täglich 10–15 Minuten üben als selten lange.

Hinweise zu Datenschutz und Sicherheit: siehe [SECURITY.md](SECURITY.md).

## Entwicklung

Reines HTML, CSS und JavaScript, ohne Abhängigkeiten. Für die Werkzeuge reicht Node.js 22 oder neuer.

```bash
npm run check   # Syntax, Übersetzungen, Kursinhalte, Sicherheitstests der Datenprüfung
npm run e2e     # Browser-Test mit headless Chrome/Edge (beide Sprachen, CSP, XSS)
npm run build   # dist/TastaturTrainer-<version>.zip + SHA-256
```

| Datei | Inhalt |
|---|---|
| `index.html` | Einstieg und Content-Security-Policy |
| `js/i18n.js`, `js/locales/de.js`, `js/locales/en.js` | Übersetzungen und Kurse je Sprache |
| `js/layouts.js` | Tastatur-Layouts QWERTZ und US-QWERTY |
| `js/gen.js` | Übungstexte erzeugen |
| `js/typing.js`, `js/keyboard.js` | Tipp-Engine, Bildschirm-Tastatur und Hände |
| `js/progress.js`, `js/store.js` | Sterne, XP, Abzeichen; Speicherung mit Schema-Prüfung |
| `js/app.js`, `js/screens.js`, `js/games.js` | Seiten und Spiele |
| `tools/` | Prüf-, Test- und Build-Skripte |
| `.github/workflows/ci.yml` | Build-Pipeline |

**Neue Sprache hinzufügen:**
1. `js/locales/en.js` kopieren und übersetzen.
2. Bei Bedarf ein Layout in `js/layouts.js` ergänzen.
3. Die Datei in `index.html` einbinden.

`npm run check` meldet fehlende Texte, abweichende Platzhalter und Wörter, die auf dem Layout nicht tippbar sind.

**Build-Pipeline** (GitHub Actions): Bei jedem Push und Pull Request laufen `check` und `e2e`, danach wird das ZIP als Artefakt gebaut. Ein Tag `v*` (z. B. `git tag v1.1.0 && git push --tags`) erstellt zusätzlich ein GitHub-Release mit ZIP und Prüfsumme.
