# TastaturTrainer als Heimserver (Docker, Unraid)

In dieser Variante liegen die Profile **zentral auf dem Server** und nicht im Browser. Jedes Gerät im Heimnetz,
also PC, Laptop oder Tablet mit Tastatur, sieht dieselben Kinder und denselben Fortschritt.
Die App ist dieselbe wie auf GitHub Pages, dazu kommt ein kleiner Node-Server (`server/`) ohne Abhängigkeiten.

## Docker

```bash
docker build -t tastaturtrainer .
docker run -d --name tastaturtrainer --restart unless-stopped \
  -p 8080:8080 -v tastaturtrainer-data:/data tastaturtrainer
```

Danach `http://<server>:8080` öffnen. Ohne Docker geht es auch direkt aus dem Repo:
`npm run serve` (nur auf diesem Rechner, Daten in `./data`) oder `HOST=0.0.0.0 npm run serve` (im ganzen Netz).

| Variable | Standard | Bedeutung |
|---|---|---|
| `PORT` | `8080` | Port im Container |
| `HOST` | `0.0.0.0` (Docker), `127.0.0.1` (ohne Docker) | Netzwerkadresse, auf der der Server lauscht |
| `TT_DATA_DIR` | `/data` | Ordner für `profiles.json` |
| `TT_DATA_LABEL` | `Server: <Pfad>` | Text, den die App unter „Speicherort der Ergebnisse“ zeigt |

## Unraid

1. Das Image bauen oder in die eigene Registry legen und in `my-tastaturtrainer.xml` unter `<Repository>` eintragen.
   Der Standard `tastaturtrainer:latest` passt, wenn das Image direkt auf dem Unraid-Server gebaut wurde.
2. Diesen Ordner auf den Server kopieren (z. B. in eine Freigabe) und dort ausführen:
   `bash /mnt/user/<freigabe>/tastaturtrainer/install.sh`.
   Das Skript kopiert das Template zu den Benutzer-Templates, legt `/mnt/user/appdata/tastaturtrainer` an (Besitzer 99:100) und legt das Symbol ab.
3. *Docker → Add Container → Template „tastaturtrainer“ → Apply*. Standard-Port ist 8091.

## Daten

- `profiles.json` enthält alle Profile, `profiles.json.bak` den Stand vor der letzten Änderung.
- Sichern: den Datenordner kopieren. Zurückspielen: Container stoppen, `profiles.json` ersetzen, Container starten.
- Ist `profiles.json` unlesbar, wird sie als `profiles.json.defekt-<Zeit>` aufbewahrt, und der Server startet ohne Profile.
- Welches Profil gerade offen ist und die Sprache merkt sich jedes Gerät selbst.

## Gut zu wissen

- **Keine Anmeldung:** Jeder, der den Server im Netz erreicht, kann die Profile sehen und ändern. Nur im eigenen
  Heimnetz betreiben oder einen Reverse Proxy mit Anmeldung davorsetzen. Nicht offen ins Internet stellen.
- Zwei Kinder an zwei Geräten stören sich nicht, denn jedes Profil wird einzeln gespeichert. Ist **dasselbe** Profil
  an zwei Geräten gleichzeitig offen, gilt die zuletzt gespeicherte Änderung.
- Ist der Server beim Laden der Seite nicht erreichbar, speichert die App nichts und zeigt einen Hinweis.
  Ein leerer Stand kann so nie die Daten auf dem Server überschreiben. Einen Offline-Modus gibt es in dieser Variante nicht.
