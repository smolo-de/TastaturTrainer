# Code-Signatur für `TastaturTrainer.exe`

## Wozu eine Signatur?

Eine unsignierte EXE aus dem Internet löst beim ersten Start die SmartScreen-Warnung „Der Computer wurde durch Windows geschützt“ aus. Auf Schul-PCs wird sie von AppLocker oder Virenscannern oft ganz blockiert. Eine Signatur bringt zwei Vorteile:

- **Herkunft und Unverändertheit sind belegbar.** Windows zeigt „Herausgeber: …“ statt „Unbekannter Herausgeber“.
- **Die Schul-IT kann per Herausgeber-Regel freigeben.** Eine einzige Regel gilt dann für alle künftigen Versionen. Ohne Signatur braucht jede neue Version eine eigene Hash-Regel.

> Auch eine signierte EXE kann SmartScreen anfangs noch warnen lassen, bis sich genügend „Reputation“ aufgebaut hat. Das gilt seit 2024 auch für teure EV-Zertifikate.

## Möglichkeiten

| Weg | Kosten (ungefähr, bitte aktuell prüfen) | Passt für | Hinweise |
|---|---|---|---|
| **SignPath Foundation** | kostenlos für Open Source | dieses Projekt ✅ | Antrag auf signpath.org. Signiert wird direkt in GitHub Actions. Als Herausgeber steht „SignPath Foundation“. Die Voraussetzungen (OSI-Lizenz wie MIT, öffentliches Repo, Build in der CI) sind erfüllt. |
| **Microsoft Trusted Signing** (Azure) | ca. 10 US-$ pro Monat | Einzelpersonen oder Organisationen mit Identitätsprüfung | Cloud-Signatur, offizielle GitHub Action von Microsoft. Ob es für dein Land und als Einzelperson verfügbar ist, vorher prüfen. |
| **Eigenes Code-Signing-Zertifikat** (OV), z. B. Certum, Sectigo, GlobalSign, DigiCert | ca. 100–500 € pro Jahr; Certum hat günstige Open-Source-Angebote für Einzelpersonen | wenn der eigene Name als Herausgeber erscheinen soll | Seit 2023 liegt der Schlüssel nur noch auf einem Hardware-Token (USB) oder in einem Cloud-HSM. Signiert wird lokal mit `signtool` oder über den Cloud-Dienst des Anbieters. |
| **Interne Lösung der Schule** | kostenlos | nur innerhalb der Schule | Die Schul-IT signiert mit einem eigenen Zertifikat aus ihrer Domäne oder gibt die EXE per Hash frei. |

**Empfehlung:** Für dieses öffentliche MIT-Projekt die **SignPath Foundation** beantragen. Bis das klappt, kann die Schul-IT die EXE über den Hash freigeben (siehe unten).

## So geht es mit SignPath (Ablauf)

1. Auf signpath.org den Antrag für Open-Source-Code-Signing stellen und `smolo-de/TastaturTrainer` angeben.
2. Nach der Freigabe in SignPath ein Projekt und eine Signing-Policy anlegen und die Verbindung zu GitHub einrichten.
3. In `.github/workflows/ci.yml` im Job `desktop` an der markierten Stelle („Hier kann später die Code-Signatur eingehängt werden“) den Signierschritt einfügen. SignPath stellt dafür eine eigene GitHub Action bereit. Wie alle anderen Actions auf einen Commit-SHA festlegen.
4. Das nötige Token als GitHub-Secret hinterlegen und nur im Job `desktop` verwenden.
5. Nach dem Signieren die Prüfsumme `TastaturTrainer.exe.sha256` neu erzeugen, weil die Signatur die Datei verändert.

## So geht es mit eigenem Zertifikat (lokal)

```powershell
# signtool gehört zum Windows SDK. /sha1 = Fingerabdruck des Zertifikats auf dem USB-Token
signtool sign /fd SHA256 /tr http://timestamp.digicert.com /td SHA256 /sha1 <Fingerabdruck> dist\TastaturTrainer.exe
signtool verify /pa /v dist\TastaturTrainer.exe
```

Immer **mit Zeitstempel** signieren (`/tr`). Dann bleibt die Signatur auch nach Ablauf des Zertifikats gültig.

## Für die Schul-IT: Freigabe ohne Signatur

- **AppLocker, Hash-Regel:** Die Prüfsumme steht in `TastaturTrainer.exe.sha256` im Release. Alternativ: `Get-AppLockerFileInformation -Path .\TastaturTrainer.exe | New-AppLockerPolicy -RuleType Hash`.
- **Pfad-Regel:** Die EXE in einen bereits freigegebenen Ordner legen, z. B. ein Netzlaufwerk für Lernsoftware.
- **Was die EXE tut:**
  - Sie braucht weder eine Installation noch Admin-Rechte noch einen Netzwerkport.
  - Sie schreibt nur zwei Dinge:
    - die Ergebnisse in `TastaturTrainer-Daten.json` (neben der EXE oder unter `%APPDATA%\TastaturTrainer\`)
    - den WebView2-Cache sowie `WebView2Loader.dll` unter `%LOCALAPPDATA%\TastaturTrainer\`
  - Sie setzt die *Microsoft Edge WebView2 Runtime* voraus, die bei Windows 10/11 bereits vorhanden ist.
- **Wenn die EXE nicht erlaubt wird:** Die Web-Version unter https://smolo-de.github.io/TastaturTrainer/ funktioniert ohne jede Freigabe.
