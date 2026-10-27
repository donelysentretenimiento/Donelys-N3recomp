// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Donelys Entretenimiento
// Pruebas automáticas: node test/selftest.mjs [carpeta-n3-recomp]
// Usan carpetas temporales; no tocan n3.toml real, la base del juego ni las ISO.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const lib = (f) => pathToFileURL(path.join(here, '..', 'app', 'lib', f)).href;
const release = process.argv[2] ?? path.resolve(here, '..', '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'donelys-n3-'));
process.env.LOCALAPPDATA = path.join(tmp, 'local'); // settings.mjs lee esta variable al importarse
let ok = 0;
const test = async (name, fn) => { await fn(); ok++; console.log('  ok  ' + name); };

const settings = await import(lib('settings.mjs'));
const { composeProfile } = await import(lib('compose.mjs'));
const { ensureRuntime, runtimeStatus, LANG_CODES } = await import(lib('runtime.mjs'));
const { parseXwb, parsePak } = await import(lib('voices.mjs'));
const { parseXex } = await import(lib('xex.mjs'));
const { Disc } = await import(lib('disc.mjs'));

// Imagen XDVDFS sintética: sector 32 = volumen, 33 = raíz, 34 = default.xex, 35 = carpeta «data», 36 = data/b.bin
function buildImage(rootName = 'default.xex') {
  const S = 2048, img = Buffer.alloc(40 * S);
  const vol = 32 * S;
  img.write('MICROSOFT*XBOX*MEDIA', vol, 'latin1'); img.writeUInt32LE(33, vol + 20); img.writeUInt32LE(S, vol + 24);
  img.write('MICROSOFT*XBOX*MEDIA', vol + S - 20, 'latin1');
  const entry = (at, left, right, sector, size, attr, name) => {
    img.writeUInt16LE(left, at); img.writeUInt16LE(right, at + 2); img.writeUInt32LE(sector, at + 4); img.writeUInt32LE(size, at + 8);
    img[at + 12] = attr; img[at + 13] = name.length; img.write(name, at + 14, 'latin1');
  };
  entry(33 * S, 0, 7, 34, 5, 0x20, rootName);          // el siguiente nodo está en 28 / 4 = 7
  entry(33 * S + 28, 0, 0, 35, S, 0x10, 'data');
  entry(35 * S, 0, 0, 36, 3, 0x20, 'b.bin');
  img.write('HELLO', 34 * S, 'latin1'); img.write('abc', 36 * S, 'latin1');
  return img;
}
await test('ISO XDVDFS: lista, lee y rechaza nombres peligrosos (imagen sintética)', () => {
  const f = path.join(tmp, 'sintetica.iso');
  fs.writeFileSync(f, buildImage());
  const d = new Disc(f);
  try {
    const e = d.entries();
    assert.deepEqual(e.map((x) => x.path), ['data/b.bin', 'default.xex']);
    assert.equal(d.read(e[1].offset, e[1].size).toString(), 'HELLO');
    assert.equal(d.read(e[0].offset, e[0].size).toString(), 'abc');
  } finally { d.close(); }
  fs.writeFileSync(f, buildImage('..'));
  const bad = new Disc(f);
  try { assert.throws(() => bad.entries(), /no seguro/); } finally { bad.close(); }
  fs.writeFileSync(f, Buffer.alloc(4096));
  assert.throws(() => new Disc(f), /XDVDFS/);
});

await test('ajustes: valores por defecto y escritura conservando claves ajenas', () => {
  fs.mkdirSync(settings.PROFILE_DIR, { recursive: true });
  fs.writeFileSync(settings.TOML_PATH, '# Auto-generated cvar configuration\nuser_language = 5\nwindow_width = 1463\n');
  assert.equal(settings.readSettings().values.n3_frame_rate, 30);
  const r = settings.writeSettings({ n3_frame_rate: 60, resolution_scale: 3, anisotropic_override: 5, fullscreen: true });
  assert.ok(r.changed && r.backup && fs.existsSync(r.backup));
  const t = fs.readFileSync(settings.TOML_PATH, 'utf8');
  for (const l of ['user_language = 5', 'window_width = 1463', 'n3_frame_rate = 60', 'resolution_scale = 3', 'draw_resolution_scale_x = 3', 'draw_resolution_scale_y = 3', 'anisotropic_override = 5', 'fullscreen = true'])
    assert.ok(t.includes(l), 'falta ' + l);
  assert.equal(settings.writeSettings({ n3_frame_rate: 60 }).changed, false); // idempotente
});
await test('ajustes: rechaza valores que el motor no soporta', () => {
  for (const bad of [{ n3_frame_rate: 144 }, { anisotropic_override: 1 }, { n3_display_resolution: 900 }, { n3_vsync: 'si' }, { inventada: 1 }])
    assert.throws(() => settings.validate(bad));
});
await test('compositor: solo cambia SoundRes, con enlaces duros, y no toca la base', () => {
  const base = path.join(tmp, 'base'), voz = path.join(tmp, 'voz');
  fs.mkdirSync(path.join(base, 'data', 'Sound', 'ENG', 'SoundRes'), { recursive: true });
  fs.mkdirSync(path.join(base, 'data', 'Text', 'ENG'), { recursive: true });
  fs.mkdirSync(voz);
  fs.writeFileSync(path.join(base, 'default.xex'), 'xex');
  fs.writeFileSync(path.join(base, 'data', 'Text', 'ENG', 't.txt'), 'texto');
  fs.writeFileSync(path.join(base, 'data', 'Sound', 'ENG', 'SoundRes', 'a.xwb'), 'ingles');
  fs.writeFileSync(path.join(voz, 'a.xwb'), 'japones');
  const c = composeProfile({ baseDir: base, spec: { baseId: 'b', voiceId: 'v1', voiceDir: voz }, profilesDir: path.join(tmp, 'perfiles') });
  assert.equal(fs.readFileSync(path.join(c.dir, 'data', 'Sound', 'ENG', 'SoundRes', 'a.xwb'), 'utf8'), 'japones');
  assert.equal(fs.readFileSync(path.join(c.dir, 'data', 'Text', 'ENG', 't.txt'), 'utf8'), 'texto');
  assert.equal(fs.readFileSync(path.join(base, 'data', 'Sound', 'ENG', 'SoundRes', 'a.xwb'), 'utf8'), 'ingles');
  assert.ok(c.hardLinks >= 2);
  assert.equal(composeProfile({ baseDir: base, spec: { baseId: 'b', voiceId: 'v1', voiceDir: voz }, profilesDir: path.join(tmp, 'perfiles') }).reused, true);
});
await test('XACT: rechaza archivos que no son XWB/PAK', () => {
  assert.throws(() => parseXwb(Buffer.from('XXXX' + '0'.repeat(200))));
  assert.throws(() => parsePak(Buffer.from([0xff, 0xff, 0xff, 0xff])));
});
await test('XEX: rechaza cabeceras inválidas', () => assert.throws(() => parseXex(Buffer.alloc(1024))));

const rtDll = path.join(release, 'rexruntime.dll');
if (fs.existsSync(rtDll)) {
  await test('runtime: idioma ENG usa el original; SPA genera copia con solo 1 byte distinto', () => {
    const st = runtimeStatus(release);
    if (!st.patchable) { console.log('  --  runtime no verificado: ' + st.reason); return; }
    assert.equal(ensureRuntime({ releaseDir: release, dataDir: path.join(tmp, 'datos'), lang: 'ENG' }).dir, release);
    const r = ensureRuntime({ releaseDir: release, dataDir: path.join(tmp, 'datos'), lang: 'SPA' });
    const a = fs.readFileSync(rtDll), b = fs.readFileSync(path.join(r.dir, 'rexruntime.dll'));
    let diff = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
    assert.equal(diff, 1);
    assert.equal(b[0x2b5a03], LANG_CODES.SPA);
    assert.ok(fs.existsSync(path.join(r.dir, 'n3.exe')));
    assert.throws(() => ensureRuntime({ releaseDir: release, dataDir: path.join(tmp, 'datos'), lang: 'KLI' }));
  });
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n${ok} pruebas correctas`);
