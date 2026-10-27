// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Donelys Entretenimiento
// Lectura/escritura de n3.toml (el mismo archivo que usa el juego). Conserva claves y orden desconocidos.
import fs from 'node:fs';
import path from 'node:path';

export const PROFILE_DIR = path.join(process.env.LOCALAPPDATA ?? '', 'N3Recompiled');
export const TOML_PATH = path.join(PROFILE_DIR, 'n3.toml');

// Opciones reales del runtime (graphics_settings.cpp, display_settings.cpp, frame_rate_policy.h, graphics_filtering.h).
export const SCHEMA = {
  n3_frame_rate: { type: 'int', allowed: [30, 40, 60], default: 30 },
  anisotropic_override: { type: 'int', allowed: [0, 2, 3, 4, 5], default: 0 }, // 0=1x 2=2x 3=4x 4=8x 5=16x
  n3_display_resolution: { type: 'int', allowed: [720, 1080, 1440, 2160], default: 720 },
  resolution_scale: { type: 'int', allowed: [1, 2, 3], default: 1 },
  n3_vsync: { type: 'bool', default: true },
  fullscreen: { type: 'bool', default: false },
};
const SCALE_KEYS = ['draw_resolution_scale_x', 'draw_resolution_scale_y']; // el runtime los mantiene iguales a resolution_scale

const fmt = (v) => (typeof v === 'boolean' ? String(v) : String(v));
const parseVal = (s) => (s === 'true' ? true : s === 'false' ? false : /^-?\d+$/.test(s) ? Number(s) : s.replace(/^"|"$/g, ''));

export function readRaw() {
  try { return fs.readFileSync(TOML_PATH, 'utf8'); } catch { return ''; }
}
export function parseToml(text) {
  const m = new Map();
  for (const line of text.split(/\r?\n/)) {
    const x = /^\s*([A-Za-z0-9_]+)\s*=\s*(.+?)\s*$/.exec(line);
    if (x && !line.trim().startsWith('#')) m.set(x[1], parseVal(x[2]));
  }
  return m;
}

export function readSettings() {
  const m = parseToml(readRaw());
  const out = {};
  for (const [k, s] of Object.entries(SCHEMA)) out[k] = m.has(k) ? m.get(k) : s.default;
  return { values: out, present: Object.keys(SCHEMA).filter((k) => m.has(k)), other: Object.fromEntries([...m].filter(([k]) => !(k in SCHEMA) && !SCALE_KEYS.includes(k))) };
}

export function validate(changes) {
  const clean = {};
  for (const [k, v] of Object.entries(changes)) {
    const s = SCHEMA[k];
    if (!s) throw new Error(`Opción desconocida: ${k}`);
    if (s.type === 'bool') { if (typeof v !== 'boolean') throw new Error(`${k} debe ser verdadero o falso`); }
    else if (!s.allowed.includes(v)) throw new Error(`Valor no admitido para ${k}: ${v}`);
    clean[k] = v;
  }
  return clean;
}

// Escritura atómica con copia de seguridad previa (una por sesión de cambios distintos).
export function writeSettings(changes) {
  const clean = validate(changes);
  if ('resolution_scale' in clean) for (const k of SCALE_KEYS) clean[k] = clean.resolution_scale;
  const before = readRaw();
  const lines = before ? before.split(/\r?\n/) : ['# Auto-generated cvar configuration'];
  const seen = new Set();
  const next = lines.map((line) => {
    const x = /^\s*([A-Za-z0-9_]+)\s*=/.exec(line);
    if (x && x[1] in clean && !line.trim().startsWith('#')) { seen.add(x[1]); return `${x[1]} = ${fmt(clean[x[1]])}`; }
    return line;
  });
  while (next.length && next[next.length - 1] === '') next.pop();
  for (const [k, v] of Object.entries(clean)) if (!seen.has(k)) next.push(`${k} = ${fmt(v)}`);
  const text = next.join('\n') + '\n';
  if (text === before) return { changed: false };
  fs.mkdirSync(PROFILE_DIR, { recursive: true });
  let backup = null;
  if (before) {
    backup = `${TOML_PATH}.bak-donelys-${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}`;
    fs.writeFileSync(backup, before);
  }
  const tmp = TOML_PATH + '.tmp';
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, TOML_PATH);
  return { changed: true, backup };
}

// Perfil que prefiere el usuario (RTX 5090 + monitor 1440p); se aplica solo cuando él lo pide.
export const PREFERRED = { n3_frame_rate: 60, anisotropic_override: 5, n3_display_resolution: 1440, resolution_scale: 3, n3_vsync: true, fullscreen: true };
