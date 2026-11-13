# ⌨️ TastaturTrainer – das 10-Finger-Abenteuer

## ▶ [Jetzt im Browser starten: smolo-de.github.io/TastaturTrainer](https://smolo-de.github.io/TastaturTrainer/)

| Weg | So startest du | Wo liegen die Ergebnisse? |
|---|---|---|
| 🌐 **Im Browser**<br>am einfachsten, z. B. für Schulen | **[smolo-de.github.io/TastaturTrainer](https://smolo-de.github.io/TastaturTrainer/)** öffnen – fertig. Optional in Edge/Chrome über ⋯ → *Apps* → *Als App installieren*: dann gibt es ein eigenes Fenster, die App läuft auch offline, Admin-Rechte sind nicht nötig. | im Browser des Windows-Benutzers |
| 🖥️ **Desktop-App** | **[⬇ TastaturTrainer.exe herunterladen](https://github.com/smolo-de/TastaturTrainer/releases/latest/download/TastaturTrainer.exe)** und doppelklicken. Eine einzige Datei, keine Installation, keine Admin-Rechte. | in `TastaturTrainer-Daten.json` direkt neben der EXE (wenn der Ordner schreibgeschützt ist: `%APPDATA%\TastaturTrainer\`) |
| 📄 **HTML-Version** | **[⬇ ZIP aus dem neuesten Release](https://github.com/smolo-de/TastaturTrainer/releases/latest)** entpacken und `index.html` öffnen. Geht ohne Internet, auch vom Netzlaufwerk. | im Browser des Windows-Benutzers |

**↺ Zurücksetzen:** Oben in der App gibt es einen Button, abgesichert mit einer kleinen Rechenaufgabe für Eltern und Lehrkräfte. Er löscht den Fortschritt eines Profils oder alles. Bei der EXE reicht es auch, `TastaturTrainer-Daten.json` zu löschen, während die App geschlossen ist.

> 🇬🇧 **English:** **[Start in the browser](https://smolo-de.github.io/TastaturTrainer/)** · **[Download TastaturTrainer.exe](https://github.com/smolo-de/TastaturTrainer/releases/latest/download/TastaturTrainer.exe)** · **[ZIP (HTML version)](https://github.com/smolo-de/TastaturTrainer/releases/latest)**
> A touch typing trainer for children in **English (US QWERTY keyboard)** and **German (QWERTZ keyboard)**. No installation and no admin rights needed; no data leaves the computer. Switch the language on the start screen or in *Settings → Language & keyboard*.

---

Ein Lernspiel für Kinder: Es bringt ihnen das **Blindschreiben (10-Finger-System)** bei. Das geht Schritt für Schritt, mit Erklärungen, Runden, Sternen, Levels, Abzeichen und Mini-Spielen. Die App läuft komplett **lokal**. Es muss nichts installiert werden, es braucht keine Admin-Rechte, und es werden keine Daten ins Internet geschickt.

> [!WARNING]
> **Haftungsausschluss:** Der TastaturTrainer ist eine **„Vibe-Coding“-App**. Er ist mit Unterstützung von **Claude** (KI-Assistent von Anthropic) entstanden. Die App wird **ohne jede Gewähr oder Garantie** bereitgestellt – weder für Richtigkeit noch für Funktion, Eignung oder Sicherheit. Die Nutzung erfolgt auf eigene Verantwortung. Es gilt die [MIT-Lizenz](LICENSE).
>
> **Disclaimer:** TastaturTrainer is a **“vibe coding” app** that was built with the help of **Claude** (AI assistant by Anthropic). It is provided **as is, without any warranty or guarantee** of correctness, functionality, fitness for a particular purpose or security. Use it at your own risk. Licensed under the [MIT License](LICENSE).

## Für Schulen: Was ist der beste Weg?

- **Am einfachsten:** den Link verteilen, z. B. im Schulportal, in Moodle/IServ oder als Lesezeichen. Es braucht keine Installation, keine Rechte und keine IT-Freigabe. Das funktioniert auf jedem PC, Chromebook oder Tablet mit Tastatur.
- **Datenschutz:** Die App sendet nichts. Es gibt keine Cookies, kein Tracking und keine externen Schriften oder Dienste. Beim Laden der Seite sieht GitHub (USA) technisch bedingt die IP-Adresse, wie bei jeder Website. Wer das vermeiden will, legt den Inhalt von `dist/site` (oder des ZIP) auf den **eigenen Schulserver**. Das sind nur statische Dateien, eine Serverlogik ist nicht nötig.
- **EXE auf Schul-PCs:** Manche Schulen blockieren Programme aus Benutzerordnern (AppLocker, SmartScreen). Dann muss die IT die EXE freigeben, am einfachsten über die Prüfsumme (`TastaturTrainer.exe.sha256`) oder, sobald die EXE signiert ist, über den Herausgeber. Siehe [SIGNING.md](SIGNING.md).
- **Geteilte Rechner:** Jedes Kind legt in der App ein eigenes Profil an. Wenn Benutzerprofile beim Abmelden gelöscht werden, gehen Browser-Ergebnisse verloren. Dann hilft die EXE auf einem Netzlaufwerk oder USB-Stick (die Ergebnisse liegen in der Datei daneben) oder *Einstellungen → Für Eltern → Sicherung*.

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
npm run build      # dist/TastaturTrainer-<version>.zip + SHA-256 und dist/site (GitHub Pages)
npm run build:exe  # dist/TastaturTrainer.exe (Windows, .NET SDK 8 oder neuer)
npm run test:exe   # EXE bauen und allein in einem leeren Ordner selbst testen
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
| `desktop/` | Desktop-App: WinForms + WebView2, bettet die Web-App ein, speichert in eine JSON-Datei |
| `manifest.webmanifest`, `sw.js` | installierbare Web-App, offline nutzbar |
| `tools/` | Prüf-, Test- und Build-Skripte, Icon-Generator |
| `.github/workflows/ci.yml` | Build-Pipeline |

**Neue Sprache hinzufügen:**
1. `js/locales/en.js` kopieren und übersetzen.
2. Bei Bedarf ein Layout in `js/layouts.js` ergänzen.
3. Die Datei in `index.html` einbinden.

`npm run check` meldet fehlende Texte, abweichende Platzhalter und Wörter, die auf dem Layout nicht tippbar sind.

**Build-Pipeline** (GitHub Actions): Bei jedem Push und Pull Request laufen `check` und `e2e` unter Linux. Danach werden ZIP und Web-App gebaut, und unter Windows wird die EXE gebaut und selbst getestet. Bei einem Push auf `main` wird die Web-App auf GitHub Pages veröffentlicht. Ein Tag `v*` (z. B. `git tag v1.1.0 && git push --tags`) erstellt ein GitHub-Release mit ZIP, EXE und Prüfsummen.
