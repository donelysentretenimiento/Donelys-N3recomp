// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Donelys Entretenimiento
// Compone una carpeta de juego "virtual" con enlaces duros a la base PAL. La base y las ISO nunca se modifican.
// Solo sustituye las voces: el juego pide siempre Sound\ENG\SoundRes (comprobado en memoria, también con textos en español).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function walk(root) {
  const out = [], stack = [''];
  while (stack.length) {
    const rel = stack.pop();
    for (const e of fs.readdirSync(path.join(root, rel), { withFileTypes: true })) {
      const r = rel ? rel + '/' + e.name : e.name;
      if (e.isDirectory()) stack.push(r); else if (e.isFile()) out.push(r);
    }
  }
  return out;
}
const ci = (s) => s.toLowerCase();

export const profileId = (spec) => `${spec.baseId}_${spec.voiceId}`.replace(/[^A-Za-z0-9_-]/g, '');

// spec: { baseId, voiceId, voiceDir: ruta absoluta con los archivos de SoundRes }
export function composeProfile({ baseDir, spec, profilesDir, onProgress }) {
  const id = profileId(spec);
  const out = path.join(profilesDir, id);
  const marker = path.join(out, 'perfil.json');
  const specKey = crypto.createHash('sha1').update(JSON.stringify({ v: spec.voiceId, vd: spec.voiceDir, b: baseDir.toLowerCase() })).digest('hex');
  try { if (JSON.parse(fs.readFileSync(marker, 'utf8')).specKey === specKey) return { dir: out, reused: true, id }; } catch {}

  const baseFiles = walk(path.join(baseDir, 'data'));
  const map = new Map(); // destino relativo (en data/) -> origen absoluto
  for (const f of baseFiles) map.set(f, path.join(baseDir, 'data', ...f.split('/')));
  const notes = [];

  if (spec.voiceDir) {
    const slot = 'Sound/ENG/SoundRes/';
    const have = [...map.keys()].filter((k) => ci(k).startsWith(ci(slot)));
    for (const k of have) map.delete(k);
    for (const f of fs.readdirSync(spec.voiceDir)) map.set(slot + f, path.join(spec.voiceDir, f));
  }

  const tmp = out + '.tmp';
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(path.join(tmp, 'data'), { recursive: true });
  const link = (src, dst) => {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    try { fs.linkSync(src, dst); return 'hard'; } catch { fs.copyFileSync(src, dst); return 'copy'; }
  };
  let hard = 0, copied = 0, i = 0;
  const total = map.size + 1;
  if (link(path.join(baseDir, 'default.xex'), path.join(tmp, 'default.xex')) === 'hard') hard++; else copied++;
  for (const [rel, src] of map) {
    if (link(src, path.join(tmp, 'data', ...rel.split('/'))) === 'hard') hard++; else copied++;
    if (++i % 300 === 0) onProgress?.(i, total);
  }
  fs.writeFileSync(path.join(tmp, 'perfil.json'), JSON.stringify({ specKey, spec, created: new Date().toISOString(), files: total, hardLinks: hard, copies: copied, notes }, null, 1));
  fs.rmSync(out, { recursive: true, force: true });
  fs.renameSync(tmp, out);
  return { dir: out, reused: false, id, files: total, hardLinks: hard, copies: copied, notes };
}

export function removeProfile(profilesDir, id) {
  const target = path.join(profilesDir, id);
  if (path.dirname(path.resolve(target)) !== path.resolve(profilesDir) || !fs.existsSync(path.join(target, 'perfil.json'))) throw new Error('No es un perfil compuesto por esta aplicación');
  fs.rmSync(target, { recursive: true, force: true });
}

export function listProfiles(profilesDir) {
  try {
    return fs.readdirSync(profilesDir).flatMap((d) => { try { return [{ id: d, ...JSON.parse(fs.readFileSync(path.join(profilesDir, d, 'perfil.json'), 'utf8')) }]; } catch { return []; } });
  } catch { return []; }
}
