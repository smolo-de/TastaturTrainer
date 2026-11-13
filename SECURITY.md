# Sicherheit

## Bedrohungsmodell

BlindTrainer ist eine reine Offline-App: HTML, CSS und JavaScript werden direkt von der Festplatte (`file://`) geöffnet.

- Es gibt keinen Server, kein Konto, keine Netzwerkzugriffe und keine Fremdbibliotheken.
- Gespeichert werden Vornamen der Kinder, Lernfortschritt und Tipp-Statistiken, und zwar im `localStorage` des Browsers.

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
| CI mit minimalen Rechten (`contents: read`, Schreibrecht nur im Release-Job), Actions auf Commit-SHA gepinnt, `persist-credentials: false`, keine `${{ }}`-Ausdrücke in Shell-Befehlen, Tag-Format wird geprüft, Dependabot für Action-Updates | `.github/` |
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

**Prüfung:** Automatisiert und in der CI bei jedem Push.

- `tools/check.js` testet XSS-Nutzlasten, Riesenzahlen, unbekannte Felder und Prototype-Pollution gegen die Datenprüfung.
- `tools/e2e.js` startet die App mit einem manipulierten Speicherstand und prüft, dass kein Skript läuft und kein HTML eingeschleust wird.
- Jeder CSP-Verstoß, jeder JS-Fehler und jede Konsolen-Warnung lässt den Browser-Test fehlschlagen.

## Hinweise für Eltern

- Sicherungsdateien enthalten die Vornamen der Kinder. Bewahre sie entsprechend auf.
- Lade nur Sicherungen, die du selbst erstellt hast.

## Sicherheitsproblem melden

Bitte melde Sicherheitsprobleme nicht öffentlich als Issue, sondern über die private Funktion „Report a vulnerability“ im GitHub-Repository (Security → Advisories).
