#!/usr/bin/env node
/* TastaturTrainer – Desktop-EXE bauen (Windows, .NET SDK nötig)
 *
 *   node tools/build-exe.js              baut dist/TastaturTrainer.exe (+ .sha256)
 *   node tools/build-exe.js --selftest   zusätzlich: EXE allein in einem leeren Ordner starten und selbst testen
 *
 * Die Version kommt aus package.json (oder BT_VERSION). In der CI wird mit gesperrten Paketversionen
 * (packages.lock.json) wiederhergestellt, damit nur geprüfte WebView2-Pakete verwendet werden.
 */
'use strict';
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const version = process.env.BT_VERSION || pkg.version;
const numeric = version.replace(/-.*$/, '');
const proj = path.join(ROOT, 'desktop', 'TastaturTrainer.Desktop.csproj');

if (process.platform !== 'win32') { console.error('Die EXE kann nur unter Windows gebaut werden.'); process.exit(1); }

const args = ['build', proj, '-c', 'Release', '--nologo', '-v', 'q', `-p:Version=${numeric}`, `-p:InformationalVersion=${version}`];
if (process.env.CI) args.push('-p:RestoreLockedMode=true');
const b = spawnSync('dotnet', args, { stdio: 'inherit' });
if (b.status !== 0) { console.error('✗ dotnet build fehlgeschlagen'); process.exit(1); }

const built = path.join(ROOT, 'desktop', 'bin', 'Release', 'net48', 'TastaturTrainer.exe');
const dist = path.join(ROOT, 'dist');
fs.mkdirSync(dist, { recursive: true });
const out = path.join(dist, 'TastaturTrainer.exe');
fs.copyFileSync(built, out);
const sha = crypto.createHash('sha256').update(fs.readFileSync(out)).digest('hex');
fs.writeFileSync(out + '.sha256', `${sha}  TastaturTrainer.exe\n`);
console.log(`✓ ${path.relative(ROOT, out)} – ${(fs.statSync(out).size / 1024).toFixed(0)} KB, Version ${version}\n  SHA-256 ${sha}`);

if (process.argv.includes('--selftest')) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tt-exe-'));
  const exe = path.join(dir, 'TastaturTrainer.exe');
  fs.copyFileSync(out, exe); // nur die EXE – beweist, dass keine weiteren Dateien nötig sind
  const resultDir = process.env.EXE_SELFTEST_DIR ? path.resolve(process.env.EXE_SELFTEST_DIR) : path.join(dir, 'selftest');
  const r = spawnSync(exe, ['--selftest', resultDir], { timeout: 120000 });
  const log = fs.existsSync(path.join(resultDir, 'selftest.log')) ? fs.readFileSync(path.join(resultDir, 'selftest.log'), 'utf8') : '(kein Log)';
  console.log('\nSelbsttest der EXE:\n' + log.trim().split('\n').map((l) => '  ' + l).join('\n'));
  if (r.status === 3) { console.warn('⚠ WebView2 Runtime auf diesem Rechner nicht vorhanden – Selbsttest übersprungen.'); process.exit(0); }
  if (r.status !== 0) { console.error(`✗ Selbsttest fehlgeschlagen (Exit-Code ${r.status}${r.error ? ', ' + r.error.message : ''})`); process.exit(1); }
  console.log('✓ Selbsttest bestanden');
}
