// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Donelys Entretenimiento
// Hilo aparte para extraer una ISO completa sin bloquear la ventana.
import { parentPort, workerData } from 'node:worker_threads';
import { extractFiltered } from './extract.mjs';

let last = 0;
try {
  extractFiltered(workerData.iso, workerData.dest, () => true, {
    onProgress: (done, total, file) => { const n = Date.now(); if (n - last > 250 || done === total) { last = n; parentPort.postMessage({ type: 'progress', done, total, file }); } },
  });
  parentPort.postMessage({ type: 'done' });
} catch (e) { parentPort.postMessage({ type: 'error', message: e.message }); }
