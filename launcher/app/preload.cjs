// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Donelys Entretenimiento
const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('n3', {
  pathFor: (file) => webUtils.getPathForFile(file),
  call: (name, ...args) => ipcRenderer.invoke('api', name, ...args),
  on: (fn) => { const h = (_e, ch, p) => fn(ch, p); ipcRenderer.on('evt', h); return () => ipcRenderer.removeListener('evt', h); },
});
