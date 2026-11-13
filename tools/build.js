#!/usr/bin/env node
/* BlindTrainer – Release-Paket bauen (ohne npm-Abhängigkeiten)
 *
 *   node tools/build.js
 *
 * Ergebnis: dist/BlindTrainer-<version>.zip und dist/BlindTrainer-<version>.zip.sha256
 * Das ZIP enthält nur die App (keine Tools/CI-Dateien) in einem Ordner „BlindTrainer/“.
 * Mit SOURCE_DATE_EPOCH wird das Archiv reproduzierbar (gleiche Eingabe → gleiche Prüfsumme).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const version = process.env.BT_VERSION || pkg.version;
const INCLUDE = ['index.html', 'css', 'js', 'icon.ico', 'BlindTrainer starten.bat', 'Desktop-Verknuepfung erstellen.bat', 'README.md', 'SECURITY.md'];

function collect(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) throw new Error('Fehlt: ' + rel);
  if (fs.statSync(abs).isDirectory()) return fs.readdirSync(abs).sort().flatMap((f) => collect(path.posix.join(rel, f)));
  return [rel];
}
const files = INCLUDE.flatMap(collect);

/* ---------- minimaler ZIP-Writer (Deflate, UTF-8-Dateinamen) ---------- */
const CRC = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc32 = (buf) => { let c = -1; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
const epoch = process.env.SOURCE_DATE_EPOCH ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000) : new Date();
const dosTime = (epoch.getHours() << 11) | (epoch.getMinutes() << 5) | Math.floor(epoch.getSeconds() / 2);
const dosDate = ((Math.max(1980, epoch.getFullYear()) - 1980) << 9) | ((epoch.getMonth() + 1) << 5) | epoch.getDate();

const locals = [];
const centrals = [];
let offset = 0;
for (const rel of files) {
  const data = fs.readFileSync(path.join(ROOT, rel));
  const name = Buffer.from('BlindTrainer/' + rel, 'utf8');
  const deflated = zlib.deflateRawSync(data, { level: 9 });
  const useDeflate = deflated.length < data.length;
  const body = useDeflate ? deflated : data;
  const crc = crc32(data);
  const lh = Buffer.alloc(30);
  lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6); lh.writeUInt16LE(useDeflate ? 8 : 0, 8);
  lh.writeUInt16LE(dosTime, 10); lh.writeUInt16LE(dosDate, 12); lh.writeUInt32LE(crc, 14);
  lh.writeUInt32LE(body.length, 18); lh.writeUInt32LE(data.length, 22); lh.writeUInt16LE(name.length, 26); lh.writeUInt16LE(0, 28);
  const ch = Buffer.alloc(46);
  ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x0800, 8); ch.writeUInt16LE(useDeflate ? 8 : 0, 10);
  ch.writeUInt16LE(dosTime, 12); ch.writeUInt16LE(dosDate, 14); ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(body.length, 20); ch.writeUInt32LE(data.length, 24);
  ch.writeUInt16LE(name.length, 28); ch.writeUInt32LE(offset, 42);
  locals.push(lh, name, body);
  centrals.push(ch, name);
  offset += lh.length + name.length + body.length;
}
const cd = Buffer.concat(centrals);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
const zip = Buffer.concat([...locals, cd, end]);

const dist = path.join(ROOT, 'dist');
fs.mkdirSync(dist, { recursive: true });
const out = path.join(dist, `BlindTrainer-${version}.zip`);
fs.writeFileSync(out, zip);
const sha = crypto.createHash('sha256').update(zip).digest('hex');
fs.writeFileSync(out + '.sha256', `${sha}  ${path.basename(out)}\n`);
console.log(`✓ ${path.relative(ROOT, out)} – ${files.length} Dateien, ${(zip.length / 1024).toFixed(0)} KB\n  SHA-256 ${sha}`);
