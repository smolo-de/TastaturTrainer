# Sicherheit

## Bedrohungsmodell

Der TastaturTrainer ist eine rein clientseitige App. Es gibt drei Varianten mit demselben Code:

- **Web-App** über GitHub Pages oder einen Schulserver (statische Dateien)
- **HTML-Datei** von der Festplatte (`file://`)
- **Desktop-App** `TastaturTrainer.exe`

Für alle drei gilt:
- Es gibt keinen Server mit Logik, kein Konto, keine Netzwerkzugriffe aus der App und keine Fremdbibliotheken.
- Gespeichert werden Vornamen der Kinder, Lernfortschritt und Tipp-Statistiken. In Web- und HTML-Variante liegen sie im `localStorage` des Browsers, in der Desktop-App in der Datei `TastaturTrainer-Daten.json`.

Realistische Angriffswege sind daher:

1. **Manipulierte Sicherungsdatei** (Import im Elternbereich)
2. **Manipulierter Speicherstand**: Chromium-Browser teilen sich den `localStorage` aller `file://`-Seiten. Eine andere lokale HTML-Datei, die im selben Browser geöffnet wird, kann die Daten lesen und ändern.
3. **Lieferkette**: Änderungen an der Build-Pipeline oder an verwendeten GitHub Actions

## Schutzmaßnahmen

| Maßnahme | Wo |
|---|---|
| Jeder Speicherstand und jeder Import wird gegen ein festes Schema geprüft. Es bleiben nur bekannte Felder übrig, Zahlen werden begrenzt, Texte gekürzt und von Steuerzeichen befreit. Avatare sind nur aus der festen Liste erlaubt, Schlüssel nur in gültigem Format. | `js/store.js` (`sanitizeProfile`, `sanitizeData`) |
| Grenzen gegen Überlastung: Import max. 2 MB, max. 50 Profile, Verlauf max. 100 Einträge, max. 800 Tage, XP-Obergrenze, Schleifenlimit bei der Level-Berechnung | `js/store.js`, `js/progress.js` |
| Alle Nutzerdaten (Namen, Avatare, Verlaufstexte, getippte Zeichen) werden vor dem Einfügen in HTML escaped. Übersetzungen sind statisch und vertrauenswürdig. | `BT.esc` in allen Seiten |
| Content-Security-Policy: keine Inline-Skripte und Inline-Event-Handler, keine Netzwerkverbindungen (`connect-src 'none'`), keine Frames/Objekte/Formulare. Der Start erfolgt über `js/main.js` statt eines Inline-Skripts. | `index.html` |
| Keine Abhängigkeiten: weder npm-Pakete zur Laufzeit noch beim Build | `package.json` |
| **Desktop-App:** kein Webserver und kein offener Port. Die eingebetteten Dateien werden nur unter einer festen internen Adresse ausgeliefert. Navigation zu anderen Adressen, neue Fenster und Berechtigungsanfragen werden blockiert. Entwicklerwerkzeuge, Kontextmenü und Browser-Tastenkürzel sind aus. | `desktop/Program.cs` |
| **Desktop-App, Brücke zur Datei:** Die Web-App kann über das Host-Objekt nur eine einzige, feste Datei laden, speichern (max. 4 MB, atomar über eine Temp-Datei) oder löschen. Eine unlesbare Datei wird beiseitegelegt statt überschrieben. Es gibt keinen weiteren Dateisystem-Zugriff. | `HostBridge` in `desktop/Program.cs` |
| **Desktop-App, Lieferkette:** Die WebView2-Pakete sind per NuGet-Lock-Datei mit Prüfsummen fixiert. `WebView2Loader.dll` wird vor jeder Nutzung per SHA-256 geprüft. Die EXE läuft als normaler Benutzer (`asInvoker`) und nur einmal pro Datendatei. | `desktop/` |
| **Web-App:** Der Service Worker speichert nur die eigenen App-Dateien (gleiche Herkunft) für die Offline-Nutzung. Die CSP erlaubt Worker und Manifest nur von der eigenen Herkunft. | `sw.js`, `index.html` |
| CI mit minimalen Rechten (`contents: read`, Schreibrecht nur in den Jobs für Release und Pages), Actions auf Commit-SHA gepinnt, `persist-credentials: false`, keine `${{ }}`-Ausdrücke in Shell-Befehlen, Tag-Format wird geprüft, Dependabot für Action-Updates | `.github/` |
| Release-ZIP mit SHA-256-Prüfsumme, reproduzierbar über `SOURCE_DATE_EPOCH` | `tools/build.js` |

## Ergebnis des Security-Checks (November 2026)

| # | Befund | Schwere | Status |
|---|---|---|---|
| 1 | **Gespeichertes XSS über Sicherung oder Speicherstand:** Avatar, Rennrekorde und Bestwerte wurden ungeprüft per `innerHTML` angezeigt. Eine präparierte Datei hätte beim Öffnen der App Skripte ausführen können. | mittel | behoben: Schema-Prüfung, Escaping, CSP (dreifach abgesichert) |
| 2 | **App hängt bei riesigem XP-Wert:** Bei XP = 1e308 lief die Level-Berechnung praktisch endlos. | mittel | behoben: Obergrenze und Schleifenlimit |
| 3 | Keine Content-Security-Policy, Inline-Startskript | niedrig | behoben |
| 4 | Import ohne Größen- und Mengenbegrenzung | niedrig | behoben |
| 5 | Unbekannte Felder und `__proto__`-Schlüssel aus Importen wurden übernommen | niedrig | behoben: nur bekannte Felder, Prototype-Pollution-Test |
| 6 | `Desktop-Verknuepfung erstellen.bat` nutzte unnötig `-ExecutionPolicy Bypass` (wird von Virenscannern oft als verdächtig gemeldet) | niedrig | entfernt |
| 7 | Der Starter las den Browser-Pfad zuerst aus dem benutzerbeschreibbaren `HKCU` | niedrig | jetzt zuerst `HKLM` |
| 8 | Andere lokale HTML-Dateien im selben Browser können den Speicherstand lesen (Vornamen, Statistik). Das ist eine Eigenschaft von `file://` in Chromium. | info | akzeptiert. Die Integrität ist durch die Schema-Prüfung geschützt. Die Daten sind wenig sensibel. |
| 9 | Die Rechenaufgabe im Elternbereich ist eine Kindersicherung, keine Zugriffskontrolle. | info | dokumentiert |
| 10 | Sicherungsdateien enthalten die Vornamen im Klartext. | info | dokumentiert |
| 11 | **Desktop-App (v1.1):** `WebView2Loader.dll` wird nach `%LOCALAPPDATA%` geschrieben und vor dem Laden per Prüfsumme kontrolliert. Ein Prozess desselben Benutzers könnte die Datei zwischen Prüfung und Laden tauschen. Das setzt aber voraus, dass bereits fremder Code als dieser Benutzer läuft. | info | akzeptiert |
| 12 | **Desktop-App (v1.1):** Die EXE ist noch nicht signiert (SmartScreen-Warnung, Freigabe in Schulen nur per Hash). | niedrig | offen, siehe [SIGNING.md](SIGNING.md) |
| 13 | **Web-App (v1.1):** Beim Abruf über GitHub Pages sieht GitHub (USA) die IP-Adresse. Die App selbst sendet nichts. | info | dokumentiert; Alternative: eigener Schulserver |

**Prüfung:** Automatisiert und in der CI bei jedem Push. Seit v1.1 startet außerdem `tools/build-exe.js --selftest` die EXE allein in einem leeren Ordner. Dabei werden Speichern und Laden der Datei, das Löschen und die Abwesenheit von JS-Fehlern und CSP-Verstößen geprüft. Der Browser-Test lädt die Web-App zusätzlich über http und testet den Offline-Start aus dem Service Worker.

- `tools/check.js` testet XSS-Nutzlasten, Riesenzahlen, unbekannte Felder und Prototype-Pollution gegen die Datenprüfung.
- `tools/e2e.js` startet die App mit einem manipulierten Speicherstand und prüft, dass kein Skript läuft und kein HTML eingeschleust wird.
- Jeder CSP-Verstoß, jeder JS-Fehler und jede Konsolen-Warnung lässt den Browser-Test fehlschlagen.

## Hinweise für Eltern

- Sicherungsdateien enthalten die Vornamen der Kinder. Bewahre sie entsprechend auf.
- Lade nur Sicherungen, die du selbst erstellt hast.

## Sicherheitsproblem melden

Bitte melde Sicherheitsprobleme nicht öffentlich als Issue, sondern über die private Funktion „Report a vulnerability“ im GitHub-Repository (Security → Advisories).
