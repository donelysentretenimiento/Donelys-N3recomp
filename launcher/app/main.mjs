// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Donelys Entretenimiento
import { app, BrowserWindow, ipcMain, dialog, shell, Menu, nativeImage } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createService } from './lib/service.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

function findRelease() {
  if (process.env.N3_RELEASE_DIR) return process.env.N3_RELEASE_DIR;
  for (const start of [path.dirname(process.execPath), here, process.cwd()]) {
    let d = start;
    for (let i = 0; i < 7; i++, d = path.dirname(d)) if (fs.existsSync(path.join(d, 'n3.exe'))) return d;
  }
  return null;
}

let win, service, releaseDir;
const DEBUG = !!process.env.N3_DEBUG;

// Reduce portada y fondo a un JPG razonable (la portada 1400 px, el fondo 2560 px de ancho); si no se puede decodificar, se deja tal cual.
function optimizeImages() {
  const dir = service.coversDir;
  for (const [key, max] of [['portada', 1400], ['fondo', 2560]]) {
    for (const ext of ['png', 'jpg', 'jpeg']) {
      const f = path.join(dir, `${key}.${ext}`);
      if (!fs.existsSync(f)) continue;
      const img = nativeImage.createFromPath(f);
      if (img.isEmpty()) break;
      const { width, height } = img.getSize();
      if (ext === 'jpg' && fs.statSync(f).size < 1.5e6 && width <= max) break;
      const out = width > max ? img.resize({ width: max, height: Math.round(height * max / width), quality: 'best' }) : img;
      fs.writeFileSync(path.join(dir, `${key}.tmp.jpg`), out.toJPEG(88));
      fs.rmSync(f, { force: true });
      fs.renameSync(path.join(dir, `${key}.tmp.jpg`), path.join(dir, `${key}.jpg`));
      break;
    }
  }
}
const send = (ch, payload) => { if (win && !win.isDestroyed()) win.webContents.send('evt', ch, payload); };

async function pick(kind) {
  const filters = { iso: [{ name: 'Imagen de disco Xbox 360', extensions: ['iso'] }], source: [{ name: 'ISO o ejecutable (default.xex)', extensions: ['iso', 'xex'] }] };
  if (kind === 'folder') {
    const r = await dialog.showOpenDialog(win, { title: 'Elige una carpeta', properties: ['openDirectory', 'createDirectory'] });
    return r.canceled ? null : r.filePaths[0];
  }
  const r = await dialog.showOpenDialog(win, { title: 'Elige un archivo', properties: ['openFile'], filters: filters[kind] ?? filters.source });
  if (r.canceled) return null;
  const f = r.filePaths[0];
  return /\.xex$/i.test(f) ? path.dirname(f) : f; // un default.xex se trata como su carpeta
}

const API = {
  snapshot: () => service.snapshot(),
  rescan: () => { service.rescan(); return service.snapshot(); },
  addSource: async () => { const p = await pick('source'); if (!p) return null; service.addSource(p); return service.snapshot(); },
  removeSource: (id) => { service.removeSource(id); return service.snapshot(); },
  select: (sel) => { service.select(sel); return service.snapshot(); },
  prepareVoices: async (id) => { const r = await service.prepareVoices(id); return { report: r.report, snapshot: service.snapshot() }; },
  exportVoices: async (id) => { const d = await pick('folder'); if (!d) return null; return service.exportVoices(id, d); },
  importPal: async () => { const p = await pick('iso'); if (!p) return null; await service.importPal(p); return service.snapshot(); },
  setCover: async (key) => {
    const r = await dialog.showOpenDialog(win, { title: 'Elige la carátula', properties: ['openFile'], filters: [{ name: 'Imagen', extensions: ['jpg', 'jpeg', 'png', 'webp'] }] });
    if (r.canceled) return null;
    service.setCover(key, r.filePaths[0]); optimizeImages(); return service.snapshot();
  },
  setCoverData: (key, mime, b64) => { service.setCoverData(key, mime, b64); optimizeImages(); return service.snapshot(); },
  removeCover: (key) => { service.removeCover(key); return service.snapshot(); },
  setCoverFile: (key, file) => { service.setCover(key, file); optimizeImages(); return service.snapshot(); },
  writeSettings: (c) => { const r = service.writeSettings(c); return { ...r, snapshot: service.snapshot() }; },
  removeProfile: (id) => { service.removeProfile(id); return service.snapshot(); },
  readLog: () => service.readLog(),
  play: () => service.play(),
  stopGame: () => service.stopGame(),
  cancel: () => service.cancel(),
  reveal: (p) => { shell.showItemInFolder(p); return true; },
};

app.setName('DONELYS N3');
app.setAppUserModelId('com.donelys.n3');
Menu.setApplicationMenu(null);
if (!app.requestSingleInstanceLock()) app.quit();
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(() => {
  releaseDir = findRelease();
  if (!releaseDir) { dialog.showErrorBox('DONELYS N3', 'No se encuentra n3.exe junto a la aplicación. Colócala dentro de la carpeta de N3 Recompiled.'); app.quit(); return; }
  app.setPath('userData', path.join(releaseDir, 'DonelysN3-datos', 'electron'));
  service = createService({ releaseDir, emit: send });
  service.init();
  try { optimizeImages(); } catch {}
  ipcMain.handle('api', async (_e, name, ...args) => {
    try { if (!(name in API)) throw new Error('Operación desconocida'); return { ok: true, data: await API[name](...args) }; }
    catch (e) { return { ok: false, error: e.message }; }
  });
  win = new BrowserWindow({
    width: 1320, height: 900, minWidth: 980, minHeight: 640, backgroundColor: '#04281f', autoHideMenuBar: true, show: false,
    titleBarStyle: 'hidden', titleBarOverlay: { color: '#00000000', symbolColor: '#f0cf86', height: 40 },
    icon: path.join(here, 'ui', 'icon.png'),
    title: 'DONELYS ENTRETENIMIENTO PRESENTA · N3: Ninety-Nine Nights',
    webPreferences: { preload: path.join(here, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true, devTools: DEBUG, spellcheck: false },
  });
  win.setMenuBarVisibility(false);
  if (!DEBUG) win.webContents.on('before-input-event', (e, i) => {
    const k = i.key.toLowerCase();
    if (k === 'f12' || k === 'f5' || ((i.control || i.meta) && ['r', 'w', 'p', 'u'].includes(k)) || (i.control && i.shift && ['i', 'j', 'c', 'r'].includes(k))) e.preventDefault();
  });
  win.webContents.on('context-menu', (e) => e.preventDefault());
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (e) => e.preventDefault());
  win.once('ready-to-show', () => win.show());
  win.loadFile(path.join(here, 'ui', 'index.html'));
});
app.on('window-all-closed', () => app.quit());
