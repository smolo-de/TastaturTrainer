#!/usr/bin/env node
/* TastaturTrainer – App-Icons erzeugen (icon.ico für Windows/EXE, PNGs für die installierbare Web-App)
 *   node tools/make-icons.js
 * Ohne Abhängigkeiten: einfache Formen werden mit 4×4-Supersampling gerastert und als PNG/ICO geschrieben. */
'use strict';
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
function rr(x0, y0, x1, y1, r) { return (x, y) => { if (x < x0 || x > x1 || y < y0 || y > y1) return false; const cx = Math.max(x0 + r, Math.min(x1 - r, x)), cy = Math.max(y0 + r, Math.min(y1 - r, y)); return (x - cx) ** 2 + (y - cy) ** 2 <= r * r; }; }
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16), 255];
// shapes in 256-space, later ones paint over earlier ones
const shapes = [];
shapes.push({ hit: rr(8, 8, 248, 248, 56), col: (x, y) => { const t = y / 256; return [Math.round(130 - 40 * t), Math.round(96 - 40 * t), 255, 255]; } });
shapes.push({ hit: rr(26, 66, 230, 196, 22), col: () => hex('#ffffff') });
const keyCol = hex('#d8cfff'), home = hex('#7fdc95'), hot = hex('#ff8a3d');
const kw = 26, gap = 6, x0 = 40;
for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) {
  const x = x0 + i * (kw + gap), y = 80 + r * 34;
  const c = r === 1 && (i === 1 || i === 4) ? home : (r === 0 && i === 2 ? hot : keyCol);
  shapes.push({ hit: rr(x, y, x + kw, y + 26, 6), col: () => c });
}
shapes.push({ hit: rr(76, 150, 180, 176, 7), col: () => keyCol });
function render(size) {
  const ss = 4, px = Buffer.alloc(size * size * 4), sc = 256 / size;
  for (let py = 0; py < size; py++) for (let pxx = 0; pxx < size; pxx++) {
    let acc = [0, 0, 0, 0];
    for (let sy = 0; sy < ss; sy++) for (let sx = 0; sx < ss; sx++) {
      const x = (pxx + (sx + 0.5) / ss) * sc, y = (py + (sy + 0.5) / ss) * sc;
      let c = [0, 0, 0, 0];
      for (const s of shapes) if (s.hit(x, y)) c = s.col(x, y);
      acc = acc.map((v, k) => v + (k < 3 ? c[k] * c[3] : c[3]));
    }
    const n = ss * ss, a = acc[3];
    const o = (py * size + pxx) * 4;
    px[o] = a ? Math.round(acc[0] / a) : 0; px[o + 1] = a ? Math.round(acc[1] / a) : 0; px[o + 2] = a ? Math.round(acc[2] / a) : 0; px[o + 3] = Math.round(a / n);
  }
  return px;
}
const crcT = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc = (b) => { let c = -1; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function chunk(type, data) { const l = Buffer.alloc(4); l.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); }
function png(size) {
  const px = render(size), raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) { raw[y * (size * 4 + 1)] = 0; px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4); }
  const ih = Buffer.alloc(13); ih.writeUInt32BE(size, 0); ih.writeUInt32BE(size, 4); ih[8] = 8; ih[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
const sizes = [256, 64, 48, 32, 16], imgs = sizes.map(png);
const head = Buffer.alloc(6 + 16 * sizes.length); head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4);
let off = head.length;
sizes.forEach((s, i) => { const e = 6 + i * 16; head[e] = s === 256 ? 0 : s; head[e + 1] = s === 256 ? 0 : s; head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6); head.writeUInt32LE(imgs[i].length, e + 8); head.writeUInt32LE(off, e + 12); off += imgs[i].length; });
fs.writeFileSync(path.join(ROOT, 'icon.ico'), Buffer.concat([head, ...imgs]));
fs.mkdirSync(path.join(ROOT, 'icons'), { recursive: true });
for (const s of [192, 512]) fs.writeFileSync(path.join(ROOT, 'icons', 'icon-' + s + '.png'), png(s));
console.log('✓ icon.ico, icons/icon-192.png, icons/icon-512.png');
