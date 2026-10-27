// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Donelys Entretenimiento
// Reconocimiento de fuentes del juego (ISO o carpeta extraída). Todo lo que se informa sale de leer los archivos.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { Disc } from './disc.mjs';
import { parseXex } from './xex.mjs';

// Ediciones verificadas por SHA-256 del default.xex (medidas en esta máquina).
export const KNOWN_EDITIONS = {
  '0fe8973b6ff45d3f8bd03a51a8c0d8cdf278b3d43e793497777e075f4e94a804': {
    key: 'pal', label: 'PAL / USA-Europa (v0.0.0.3)', supported: true,
    note: 'Ejecutable que N3 Recompiled traduce y verifica. Es la única base jugable.',
  },
  '43a4d2d1650bbef7ed751fdd8dbb982662a55aac73f5c31795a6c207e391b9be': {
    key: 'jp', label: 'Japón original (v0.0.0.1)', supported: false,
    note: 'Ejecutable distinto del PAL (otro punto de entrada y otro tamaño de imagen). Sirve como fuente de voces, no como base.',
  },
  'e0daff3eeea0232cbe7ee01b88af35b1c673c2cf83fb0e7a5341e78a18c04496': {
    key: 'undub', label: 'UNDUB (ejecutable japonés v0.0.0.4)', supported: false,
    note: 'Ejecutable japonés actualizado; el runtime solo acepta el PAL. Sus recursos de voz japonesa sí son reutilizables.',
  },
};

const PAL_HASH = '0fe8973b6ff45d3f8bd03a51a8c0d8cdf278b3d43e793497777e075f4e94a804';
export const isSupportedHash = (h) => h === PAL_HASH;

export const idFor = (p) => 'src-' + crypto.createHash('sha1').update(path.resolve(p).toLowerCase()).digest('hex').slice(0, 8);

function walk(root) {
  const out = [];
  const stack = [''];
  while (stack.length) {
    const rel = stack.pop();
    for (const e of fs.readdirSync(path.join(root, rel), { withFileTypes: true })) {
      const r = rel ? rel + '/' + e.name : e.name;
      if (e.isDirectory()) stack.push(r);
      else if (e.isFile()) out.push({ path: r, size: fs.statSync(path.join(root, r)).size });
    }
  }
  return out;
}

// Deduce idiomas y recursos a partir de la lista de rutas relativas (mismo código para ISO y carpeta).
export function summarize(files) {
  const text = new Map(), packs = new Map(), movies = [];
  for (const f of files) {
    const p = f.path.split('/');
    if (p[0].toLowerCase() !== 'data') continue;
    if (p[1]?.toLowerCase() === 'text' && p.length === 4) text.set(p[2], (text.get(p[2]) ?? 0) + 1);
    if (p[1]?.toLowerCase() === 'sound') {
      let lang = null, rest = null;
      if (p[2]?.toLowerCase() === 'soundres' && p.length === 4) { lang = ''; rest = p[3]; }
      else if (p[3]?.toLowerCase() === 'soundres' && p.length === 5) { lang = p[2]; rest = p[4]; }
      if (rest) { const k = lang; const v = packs.get(k) ?? { lang: k || null, dir: lang ? `data/Sound/${lang}/SoundRes` : 'data/Sound/SoundRes', files: 0, bytes: 0 }; v.files++; v.bytes += f.size; packs.set(k, v); }
    }
    if (p[1]?.toLowerCase() === 'movies') movies.push({ name: p[2], size: f.size });
  }
  return {
    textLangs: [...text].map(([lang, files]) => ({ lang, files })).sort((a, b) => a.lang.localeCompare(b.lang)),
    voicePacks: [...packs.values()],
    movies,
  };
}

export function inspectSource(p) {
  const abs = path.resolve(p);
  const st = fs.statSync(abs);
  const r = { id: idFor(abs), path: abs, name: path.basename(abs), mtimeMs: st.mtimeMs, size: st.size };
  let xexBuf, files;
  if (st.isDirectory()) {
    r.kind = 'folder';
    const xexPath = path.join(abs, 'default.xex');
    if (!fs.existsSync(xexPath)) throw new Error('La carpeta no contiene default.xex');
    xexBuf = fs.readFileSync(xexPath);
    files = fs.existsSync(path.join(abs, 'data')) ? walk(path.join(abs, 'data')).map((f) => ({ ...f, path: 'data/' + f.path })) : [];
    r.hasData = files.length > 0;
  } else if (abs.toLowerCase().endsWith('.iso')) {
    r.kind = 'iso';
    const d = new Disc(abs);
    try {
      const list = d.entries();
      const x = list.find((e) => e.path.toLowerCase() === 'default.xex');
      if (!x) throw new Error('La imagen no contiene default.xex');
      xexBuf = d.read(x.offset, x.size);
      files = list.filter((e) => e.path.toLowerCase() !== 'default.xex').map((e) => ({ path: e.path, size: e.size }));
    } finally { d.close(); }
  } else throw new Error('Tipo de fuente no reconocido (se esperaba una ISO o una carpeta con default.xex)');
  r.xex = parseXex(xexBuf);
  const known = KNOWN_EDITIONS[r.xex.sha256];
  r.edition = known ?? { key: 'desconocida', label: 'Edición desconocida', supported: false, note: 'Ejecutable no catalogado; no se acepta como base.' };
  r.content = summarize(files);
  r.fileCount = files.length + 1;
  r.totalBytes = files.reduce((s, f) => s + f.size, 0) + xexBuf.length;
  return r;
}
