#!/bin/bash
# TastaturTrainer – auf Unraid ausführen, aus dem Ordner, in dem dieses Skript und my-tastaturtrainer.xml liegen:
#   bash /mnt/user/<freigabe>/tastaturtrainer/install.sh
# Kopiert das Template zu den Benutzer-Templates von Unraid, legt den Datenordner an und legt das Symbol ab.
# Anderer Datenordner: TT_DATA=/mnt/user/appdata/xyz bash install.sh (dann auch im Template ändern).
set -euo pipefail

SRC="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
TEMPLATES=/boot/config/plugins/dockerMan/templates-user
DATA="${TT_DATA:-/mnt/user/appdata/tastaturtrainer}"

if [ ! -f "$SRC/my-tastaturtrainer.xml" ]; then
  echo "Fehlt: $SRC/my-tastaturtrainer.xml" >&2
  exit 1
fi

mkdir -p "$TEMPLATES"
if [ -f "$TEMPLATES/my-tastaturtrainer.xml" ] && ! cmp -s "$SRC/my-tastaturtrainer.xml" "$TEMPLATES/my-tastaturtrainer.xml"; then
  cp "$TEMPLATES/my-tastaturtrainer.xml" "$TEMPLATES/my-tastaturtrainer.xml.bak"
  echo "Altes Template gesichert: $TEMPLATES/my-tastaturtrainer.xml.bak"
fi
cp "$SRC/my-tastaturtrainer.xml" "$TEMPLATES/my-tastaturtrainer.xml"
echo "Template kopiert: $TEMPLATES/my-tastaturtrainer.xml"

if [ ! -d "$DATA" ]; then
  mkdir -p "$DATA" && chown 99:100 "$DATA"
  echo "Datenordner angelegt: $DATA (99:100)"
fi
# Das Symbol: Unraid lädt es sonst von der laufenden Anwendung. Beim ersten Anlegen läuft sie noch nicht,
# und ein fehlgeschlagener Abruf bleibt hängen. Darum wird es hier direkt an die Stellen gelegt,
# an denen Unraid die Symbole der Container aufbewahrt (Name des Containers: tastaturtrainer).
ICON="$SRC/icon.png"
[ -f "$ICON" ] || ICON="$SRC/../icons/icon-192.png"   # im Repo-Ordner
if [ -f "$ICON" ]; then
  for DIR in /var/lib/docker/unraid/images /usr/local/emhttp/state/plugins/dynamix.docker.manager/images; do
    mkdir -p "$DIR" && cp "$ICON" "$DIR/tastaturtrainer-icon.png"
  done
  echo "Symbol abgelegt (die Docker-Seite in Unraid neu laden)."
else
  echo "Hinweis: icon.png fehlt, das Symbol kommt dann von der laufenden Anwendung." >&2
fi

echo "Fertig. Docker -> Add Container -> Template 'tastaturtrainer' -> Apply."
