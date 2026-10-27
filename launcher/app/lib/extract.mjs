// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Donelys Entretenimiento
// Extracción segura desde una ISO XDVDFS. Nunca escribe en la ISO; escribe a .part y renombra.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { Disc } from './disc.mjs';

export function openDisc(iso) { return new Disc(iso); }

// Copia una entrada a `target` (crea carpetas). Devuelve el SHA-256. No sobrescribe sin `overwrite`.
export function copyEntry(disc, entry, target, { overwrite = false, onBytes } = {}) {
  if (fs.existsSync(target) && !overwrite) throw new Error(`Ya existe: ${target}`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const part = target + '.part';
  const fd = fs.openSync(part, 'w');
  const hash = crypto.createHash('sha256');
  try {
    for (let done = 0; done < entry.size;) {
      const chunk = disc.read(entry.offset + done, Math.min(4 << 20, entry.size - done));
      let w = 0;
      while (w < chunk.length) w += fs.writeSync(fd, chunk, w, chunk.length - w);
      hash.update(chunk);
      done += chunk.length;
      onBytes?.(chunk.length);
    }
    fs.closeSync(fd);
    fs.renameSync(part, target);
  } catch (e) { try { fs.closeSync(fd); } catch {} fs.rmSync(part, { force: true }); throw e; }
  return hash.digest('hex');
}

// Extrae las entradas que cumplen `filter` a `destRoot` (rutas relativas a la raíz de la ISO).
export function extractFiltered(isoPath, destRoot, filter, { onProgress, cancelled } = {}) {
  const disc = new Disc(isoPath);
  try {
    const list = disc.entries().filter((e) => filter(e.path));
    const total = list.reduce((s, e) => s + e.size, 0);
    let done = 0;
    const files = {};
    for (const e of list) {
      if (cancelled?.()) throw new Error('Extracción cancelada');
      const target = path.join(destRoot, ...e.path.split('/'));
      files[e.path] = { size: e.size, sha256: copyEntry(disc, e, target, { overwrite: true, onBytes: (n) => { done += n; onProgress?.(done, total, e.path); } }) };
    }
    return { files, total };
  } finally { disc.close(); }
}

export function sha256File(file) {
  const h = crypto.createHash('sha256');
  const fd = fs.openSync(file, 'r');
  const buf = Buffer.alloc(4 << 20);
  try { for (let n; (n = fs.readSync(fd, buf, 0, buf.length, null)) > 0;) h.update(buf.subarray(0, n)); } finally { fs.closeSync(fd); }
  return h.digest('hex');
}
