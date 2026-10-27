// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Donelys Entretenimiento
// Lanzamiento de n3.exe y lectura de sus registros.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PROFILE_DIR } from './settings.mjs';

const LOG_DIR = path.join(PROFILE_DIR, 'logs');
let child = null;
export const running = () => !!child && child.exitCode === null;

export function latestLog() {
  try {
    const f = fs.readdirSync(LOG_DIR).filter((n) => /^n3_\d+\.log$/.test(n)).map((n) => ({ n, t: fs.statSync(path.join(LOG_DIR, n)).mtimeMs })).sort((a, b) => b.t - a.t)[0];
    return f ? path.join(LOG_DIR, f.n) : null;
  } catch { return null; }
}

export function readLog(max = 400) {
  const f = latestLog();
  if (!f) return { file: null, lines: [] };
  const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/).filter(Boolean);
  return { file: f, lines: lines.slice(-max) };
}

export function relevantLines(lines) {
  return lines.filter((l) => /\[(warn|error|critical)\]/i.test(l) || /fail|cannot|unsupported|exception/i.test(l));
}

// Lanza el juego contra una carpeta de datos concreta (ya verificada por quien llama).
export function launch({ releaseDir, exeDir = releaseDir, gameDir, onExit, borderless = true, iconPath = '' }) {
  if (running()) throw new Error('El juego ya está en ejecución');
  const exe = path.join(exeDir, 'n3.exe');
  if (!fs.existsSync(exe)) throw new Error(`No se encuentra n3.exe en ${releaseDir}`);
  const before = latestLog();
  child = spawn(exe, ['--game_data_root', gameDir], { cwd: releaseDir, detached: false, stdio: 'ignore' });
  // Ayudante de ventana: sin barra de título (si se pide), icono y título del launcher. Termina solo cuando se cierra el juego.
  const helper = path.join(path.dirname(fileURLToPath(import.meta.url)), 'borderless.ps1');
  if (fs.existsSync(helper)) {
    const args = ['-NoProfile', '-File', helper, String(child.pid), '-NoBorder', borderless ? '1' : '0', '-Title', 'DONELYS N3'];
    if (iconPath && fs.existsSync(iconPath)) args.push('-IconPath', iconPath);
    spawn('powershell.exe', args, { stdio: 'ignore', windowsHide: true }).on('error', () => {});
  }
  const started = Date.now();
  child.on('exit', (code, signal) => { const r = { code, signal, ms: Date.now() - started, log: readLog(80), logChanged: latestLog() !== before }; child = null; onExit?.(r); });
  child.on('error', (e) => { child = null; onExit?.({ code: -1, error: e.message, ms: 0, log: readLog(40) }); });
  return { pid: child.pid };
}

export function stop() {
  if (child && child.exitCode === null) child.kill();
}
