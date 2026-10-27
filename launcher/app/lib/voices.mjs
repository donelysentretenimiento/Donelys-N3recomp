// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Donelys Entretenimiento
// Paquetes de voz: extracción a caché, identidad por contenido y validación XACT frente a la base PAL.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { extractFiltered, sha256File } from './extract.mjs';

// ---- formatos XACT (Xbox 360, big endian) ----
export function parseXwb(buf) {
  if (buf.toString('latin1', 0, 4) !== 'DNBW') throw new Error('No es un banco XWB de Xbox 360');
  const seg = (i) => [buf.readUInt32BE(8 + 8 * i), buf.readUInt32BE(12 + 8 * i)];
  const [bd] = seg(0), [md] = seg(1);
  const flags = buf.readUInt32BE(bd), count = buf.readUInt32BE(bd + 4);
  const name = buf.toString('latin1', bd + 8, bd + 72).split('\0')[0];
  const metaSize = buf.readUInt32BE(bd + 72);
  if (!metaSize || md + count * metaSize > buf.length) throw new Error('Tabla de entradas del banco dañada');
  const formats = new Set();
  for (let i = 0; i < count; i++) formats.add(buf.readUInt32BE(md + i * metaSize + 4));
  return { version: buf.readUInt32BE(4), flags, count, name, metaSize, formats: [...formats].sort().join(',') };
}

export function parsePak(buf) {
  const n = buf.readUInt32BE(0);
  if (n > 1000 || 4 + n * 268 > buf.length) throw new Error('xwbpreload.pak dañado');
  const e = [];
  for (let i = 0; i < n; i++) {
    const o = 4 + i * 268;
    e.push({ name: buf.toString('latin1', o, o + 256).split('\0')[0], start: buf.readUInt32BE(o + 260), size: buf.readUInt32BE(o + 264) });
  }
  return e;
}

const list = (d) => fs.readdirSync(d).filter((f) => fs.statSync(path.join(d, f)).isFile());

// Compara un conjunto de voces candidato con el SoundRes de la base. No modifica nada.
export function validatePack(baseDir, packDir) {
  const base = new Set(list(baseDir).map((f) => f.toLowerCase())), cand = list(packDir);
  const candLower = new Map(cand.map((f) => [f.toLowerCase(), f]));
  const missing = [...base].filter((f) => !candLower.has(f));
  const extra = [...candLower.keys()].filter((f) => !base.has(f));
  const problems = [], warnings = [];
  if (missing.length) problems.push(`Faltan ${missing.length} archivos respecto a la base (${missing.slice(0, 4).join(', ')}…)`);
  const baseFile = (f) => path.join(baseDir, list(baseDir).find((x) => x.toLowerCase() === f));
  let banks = 0, xsbs = 0, same = 0;
  const entryDiff = [];
  for (const [low, real] of candLower) {
    if (!base.has(low)) continue;
    const a = fs.readFileSync(path.join(packDir, real)), b = fs.readFileSync(baseFile(low));
    if (low.endsWith('.xwb')) {
      banks++;
      try {
        const x = parseXwb(a), y = parseXwb(b);
        if (x.name !== y.name || x.metaSize !== y.metaSize || x.flags !== y.flags || x.formats !== y.formats || x.version !== y.version)
          problems.push(`${real}: formato o nombre del banco distinto (${x.name}/${y.name}, códecs ${x.formats}/${y.formats})`);
        else if (x.count !== y.count) entryDiff.push({ file: real, pack: x.count, base: y.count });
        else same++;
      } catch (e) { problems.push(`${real}: ${e.message}`); }
    } else if (low.endsWith('.xsb')) {
      xsbs++;
      if (a.length !== b.length) { problems.push(`${real}: el banco de sonidos (xsb) cambia de tamaño`); continue; }
      let bad = 0;
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i] && i > 0x98) bad++; // la cabecera lleva CRC y marca de tiempo
      if (bad) problems.push(`${real}: ${bad} bytes distintos fuera de la cabecera (los cues no coinciden con la base)`);
    } else if (low === 'xwbpreload.pak') {
      try {
        const x = parsePak(a), y = parsePak(b);
        if (x.length !== y.length || x.some((e, i) => e.name !== y[i].name)) problems.push('xwbpreload.pak: la lista de bancos precargados no coincide con la base');
      } catch (e) { problems.push(`xwbpreload.pak: ${e.message}`); }
    }
  }
  for (const d of entryDiff) warnings.push(`${d.file}: ${d.pack} voces frente a ${d.base} en la base. Los cues (xsb) son idénticos, pero no se ha probado en partida.`);
  const level = problems.length ? 'incompatible' : warnings.length ? 'avisos' : 'compatible';
  return { level, fileCount: cand.length, missing, extra, banksChecked: banks, banksIdentical: same, xsbChecked: xsbs, problems, warnings };
}

// ---- caché ----
const cacheDir = (dataDir, srcId) => path.join(dataDir, 'fuentes', srcId);

function manifestOk(root, mf) {
  return Object.entries(mf.files).every(([rel, f]) => { try { return fs.statSync(path.join(root, ...rel.split('/'))).size === f.size; } catch { return false; } });
}

// Devuelve la carpeta con los archivos de voz de `pack` de la fuente `src`, extrayendo de la ISO solo si hace falta.
export function ensureVoicePack({ dataDir, src, pack, onProgress, cancelled }) {
  let root, files;
  if (src.kind === 'folder') {
    root = src.path;
    files = null;
  } else {
    root = cacheDir(dataDir, src.id);
    const mfPath = path.join(root, 'manifest.json');
    let mf = null;
    try { mf = JSON.parse(fs.readFileSync(mfPath, 'utf8')); } catch {}
    if (mf && mf.srcMtimeMs === src.mtimeMs && mf.srcSize === src.size && mf.pack === pack.dir && manifestOk(root, mf)) {
      files = mf.files; // reutiliza la extracción anterior
    } else {
      fs.rmSync(root, { recursive: true, force: true });
      const r = extractFiltered(src.path, root, (p) => p.toLowerCase().startsWith(pack.dir.toLowerCase() + '/'), { onProgress, cancelled });
      files = r.files;
      fs.writeFileSync(mfPath, JSON.stringify({ srcMtimeMs: src.mtimeMs, srcSize: src.size, pack: pack.dir, files }, null, 1));
    }
  }
  const dir = src.kind === 'folder' ? path.join(src.path, ...pack.dir.split('/')) : path.join(root, ...pack.dir.split('/'));
  if (!fs.existsSync(dir)) throw new Error('No se encontró la carpeta de voces tras la extracción');
  // identidad por contenido: dos fuentes con las mismas voces comparten identificador
  const parts = list(dir).sort().map((f) => `${f.toLowerCase()}:${(files?.[pack.dir + '/' + f]?.sha256) ?? sha256File(path.join(dir, f))}`);
  const contentId = crypto.createHash('sha256').update(parts.join('\n')).digest('hex').slice(0, 16);
  return { dir, contentId };
}

