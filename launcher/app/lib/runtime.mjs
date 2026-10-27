// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Donelys Entretenimiento
// Idioma de los textos: copia local de la carpeta de ejecución cuyo rexruntime.dll devuelve otro idioma en XGetLanguage.
// El SDK fija XGetLanguage = inglés (xam_info.cpp); el juego deriva de ahí text\, Briefing\, interface\Local\, sox\ y la fuente
// (font_0_eng = solo ASCII; font_0_euro = con acentos, de ahí la «X roja»). El DLL original y n3.exe no se modifican.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const LANG_CODES = { ENG: 1, GER: 3, FRA: 4, SPA: 5, ITA: 6 }; // XLanguage del SDK
export const TEXT_LANGS = { ENG: 'Inglés', FRA: 'Francés', GER: 'Alemán', ITA: 'Italiano', SPA: 'Español' };

// Compilación verificada: release v0.1.0-alpha.12 (rexruntime.dll). El wrapper de XGetLanguage es `mov qword [rcx], 1 ; ret`.
const KNOWN_DLL_SHA256 = '6f3a790da0145e3dd0d3002153dd5b68151d8a52bef89b0af81f8a15ccc41530';
const WRAPPER_OFFSET = 0x2b5a00;
const WRAPPER_ORIGINAL = Buffer.from('48c70101000000c3', 'hex');

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const stamp = (f) => { const s = fs.statSync(f); return `${s.size}:${Math.trunc(s.mtimeMs)}`; };

export function runtimeStatus(releaseDir) {
  try {
    const dll = fs.readFileSync(path.join(releaseDir, 'rexruntime.dll'));
    if (sha256(dll) !== KNOWN_DLL_SHA256) return { patchable: false, reason: 'rexruntime.dll no es el de la versión alpha 12 verificada; no se parchea una compilación desconocida.' };
    if (!dll.subarray(WRAPPER_OFFSET, WRAPPER_OFFSET + 8).equals(WRAPPER_ORIGINAL)) return { patchable: false, reason: 'No se reconoce la función XGetLanguage en el DLL.' };
    return { patchable: true };
  } catch (e) { return { patchable: false, reason: e.message }; }
}

// Devuelve la carpeta desde la que hay que arrancar n3.exe para el idioma pedido.
export function ensureRuntime({ releaseDir, dataDir, lang }) {
  if (lang === 'ENG') return { dir: releaseDir, patched: false };
  const code = LANG_CODES[lang];
  if (!code) throw new Error(`Idioma de textos no admitido: ${lang}`);
  const st = runtimeStatus(releaseDir);
  if (!st.patchable) throw new Error(st.reason);
  const out = path.join(dataDir, 'runtime', lang);
  const files = fs.readdirSync(releaseDir, { withFileTypes: true }).filter((e) => e.isFile() && /\.(dll|exe)$/i.test(e.name)).map((e) => e.name);
  const key = JSON.stringify({ code, files: files.map((f) => [f, stamp(path.join(releaseDir, f))]) });
  const marker = path.join(out, 'runtime.json');
  try { if (JSON.parse(fs.readFileSync(marker, 'utf8')).key === key) return { dir: out, patched: true, reused: true }; } catch {}
  const tmp = out + '.tmp';
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  for (const f of files) {
    const src = path.join(releaseDir, f), dst = path.join(tmp, f);
    if (f.toLowerCase() === 'rexruntime.dll') {
      const dll = Buffer.from(fs.readFileSync(src));
      dll[WRAPPER_OFFSET + 3] = code; // imm32 de `mov qword [rcx], imm32` (little endian, valores < 256)
      fs.writeFileSync(dst, dll);
    } else { try { fs.linkSync(src, dst); } catch { fs.copyFileSync(src, dst); } }
  }
  fs.writeFileSync(path.join(tmp, 'runtime.json'), JSON.stringify({ key, lang, code, created: new Date().toISOString() }));
  fs.rmSync(out, { recursive: true, force: true });
  fs.renameSync(tmp, out);
  return { dir: out, patched: true, reused: false };
}
