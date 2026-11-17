# TastaturTrainer als Heimserver (z. B. Unraid, Synology, Raspberry Pi): die unveränderte Web-App
# plus ein kleiner Node-Server ohne Abhängigkeiten, der die Profile zentral in /data speichert.
#   docker build -t tastaturtrainer .
#   docker run -d -p 8080:8080 -v tastaturtrainer-data:/data tastaturtrainer
# Mehr dazu: unraid/README.md
FROM node:22-alpine
WORKDIR /app
COPY index.html manifest.webmanifest icon.ico ./
COPY icons/ ./icons/
COPY css/ ./css/
COPY js/ ./js/
COPY server/ ./server/
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8080 TT_DATA_DIR=/data
RUN mkdir /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 8080
HEALTHCHECK --interval=60s --timeout=5s CMD wget -qO- http://127.0.0.1:8080/api/health >/dev/null || exit 1
CMD ["node", "server/server.js"]
