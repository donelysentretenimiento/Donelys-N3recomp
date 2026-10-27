// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Donelys Entretenimiento
// Lógica de la aplicación: biblioteca de fuentes, selección, preparación de voces, composición y lanzamiento.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import { inspectSource, idFor } from './sources.mjs';
import { ensureVoicePack, validatePack } from './voices.mjs';
import { composeProfile, listProfiles, removeProfile } from './compose.mjs';
import { ensureRuntime, runtimeStatus, TEXT_LANGS } from './runtime.mjs';
import { extractFiltered } from './extract.mjs';
import * as settings from './settings.mjs';
import * as game from './game.mjs';

export function createService({ releaseDir, emit }) {
  const dataDir = path.join(releaseDir, 'DonelysN3-datos');
  const profilesDir = path.join(dataDir, 'perfiles');
  const libFile = path.join(dataDir, 'biblioteca.json');
  fs.mkdirSync(dataDir, { recursive: true });
  let lib = { sources: [], selection: { baseId: null, text: 'ENG', voice: null } };
  try { lib = { ...lib, ...JSON.parse(fs.readFileSync(libFile, 'utf8')) }; } catch {}
  const save = () => { fs.writeFileSync(libFile + '.tmp', JSON.stringify(lib, null, 1)); fs.renameSync(libFile + '.tmp', libFile); };

  const coversDir = path.join(dataDir, 'caratulas');
  const COVER_EXT = ['jpg', 'jpeg', 'png', 'webp'];
  const coverCache = new Map(); // clave -> { stamp, url }
  const bundledDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'ui', 'art'); // imagen incrustada por defecto
  const readCover = (key) => {
    for (const dir of [coversDir, bundledDir]) for (const ext of COVER_EXT) {
      const f = path.join(dir, `${key}.${ext}`);
      if (!fs.existsSync(f)) continue;
      const st = fs.statSync(f), stamp = `${st.size}:${st.mtimeMs}`;
      if (coverCache.get(key)?.stamp !== stamp) coverCache.set(key, { stamp, url: `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,` + fs.readFileSync(f).toString('base64') });
      return coverCache.get(key).url;
    }
    return null;
  };
  const cache = new Map(); // id -> inspección
  const prepared = new Map(); // voiceOptionId -> { dir, contentId, report }
  let busy = null, cancel = false, cancelHook = null;

  const note = (level, msg) => emit('log', { level, msg, t: Date.now() });
  const inspect = (p) => { const r = inspectSource(p); cache.set(r.id, r); return r; };

  function discover() {
    const found = new Set(lib.sources);
    for (const e of fs.readdirSync(releaseDir, { withFileTypes: true })) {
      const p = path.join(releaseDir, e.name);
      if (e.isFile() && /\.iso$/i.test(e.name)) found.add(p);
      else if (e.isDirectory() && fs.existsSync(path.join(p, 'default.xex'))) found.add(p);
    }
    try { const gp = fs.readFileSync(path.join(settings.PROFILE_DIR, 'game-path.txt'), 'utf8').trim(); if (gp && fs.existsSync(path.join(gp, 'default.xex'))) found.add(path.normalize(gp)); } catch {}
    lib.sources = [...found].filter((p) => fs.existsSync(p));
  }

  function refresh() {
    cache.clear();
    const errors = [];
    for (const p of lib.sources) { try { inspect(p); } catch (e) { errors.push({ path: p, error: e.message }); } }
    const all = [...cache.values()];
    const usable = all.filter((s) => s.edition.supported && s.kind === 'folder' && s.hasData);
    if (!all.some((s) => s.id === lib.selection.baseId)) lib.selection.baseId = usable[0]?.id ?? null;
    save();
    return errors;
  }

  // Opciones de voz derivadas de las fuentes (nada inventado: solo carpetas SoundRes realmente presentes).
  function voiceOptions() {
    const base = cache.get(lib.selection.baseId);
    const out = [];
    for (const s of cache.values()) for (const pk of s.content.voicePacks) {
      const isBase = base && s.id === base.id;
      if (!isBase && pk.lang && pk.lang !== 'JPN') continue; // otros idiomas de voz no se ofrecen sin validarlos
      const id = `${s.id}:${pk.dir}`;
      const lang = isBase ? 'Original de la edición PAL (inglés)' : 'Japonés original';
      out.push({
        id, srcId: s.id, kind: isBase ? 'base' : 'external', label: `${lang} · ${s.edition.key === 'undub' ? 'del UNDUB' : s.edition.key === 'jp' ? 'de la ISO japonesa' : s.name}`,
        files: pk.files, bytes: pk.bytes, needsExtraction: s.kind === 'iso', prepared: prepared.has(id) ? { contentId: prepared.get(id).contentId, level: prepared.get(id).report.level } : null,
      });
    }
    return out;
  }

  function snapshot() {
    const sources = [...cache.values()];
    const base = cache.get(lib.selection.baseId);
    const voices = voiceOptions();
    if (!voices.some((v) => v.id === lib.selection.voice)) lib.selection.voice = voices.find((v) => v.kind === 'base')?.id ?? null;
    return {
      releaseDir, dataDir, busy, running: game.running(),
      sources, selection: lib.selection, voices,
      textLangs: base ? base.content.textLangs.filter((t) => TEXT_LANGS[t.lang]).map((t) => ({ lang: t.lang, name: TEXT_LANGS[t.lang], files: t.files })) : [],
      settings: settings.readSettings(), schema: settings.SCHEMA, preferred: settings.PREFERRED,
      profiles: listProfiles(profilesDir), tomlPath: settings.TOML_PATH, covers: { portada: readCover('portada'), fondo: readCover('fondo') }, runtime: runtimeStatus(releaseDir),
    };
  }

  const progress = (what) => (done, total, file) => emit('progress', { what, done, total, file });
  async function exclusive(name, fn) {
    if (busy) throw new Error(`Hay otra operación en curso: ${busy}`);
    busy = name; cancel = false; emit('busy', name);
    try { return await fn(); } finally { busy = null; emit('busy', null); emit('progress', null); }
  }
  const tick = () => new Promise((r) => setImmediate(r)); // cede el hilo para que lleguen los eventos de progreso

  function packFor(optionId) {
    const [srcId, dir] = [optionId.slice(0, optionId.indexOf(':')), optionId.slice(optionId.indexOf(':') + 1)];
    const src = cache.get(srcId);
    const pack = src?.content.voicePacks.find((p) => p.dir === dir);
    if (!src || !pack) throw new Error('Fuente de voces no encontrada');
    return { src, pack };
  }

  async function prepareVoices(optionId) {
    const { src, pack } = packFor(optionId);
    const base = cache.get(lib.selection.baseId);
    if (!base) throw new Error('Selecciona primero una edición base compatible');
    note('info', `Preparando voces de ${src.name}…`);
    await tick();
    const v = ensureVoicePack({ dataDir, src, pack, onProgress: progress('Extrayendo voces'), cancelled: () => cancel });
    const basePack = base.content.voicePacks.find((p) => p.lang === 'ENG') ?? base.content.voicePacks[0];
    const baseDir = path.join(base.path, ...basePack.dir.split('/'));
    const report = optionId.startsWith(base.id + ':') ? { level: 'compatible', problems: [], warnings: [], fileCount: pack.files, banksChecked: 0, banksIdentical: 0, xsbChecked: 0, missing: [], extra: [] } : validatePack(baseDir, v.dir);
    prepared.set(optionId, { ...v, report });
    note(report.level === 'incompatible' ? 'error' : report.level === 'avisos' ? 'warn' : 'ok', `Voces ${report.level}: ${report.fileCount} archivos, ${report.banksIdentical}/${report.banksChecked} bancos con estructura idéntica`);
    return { ...v, report };
  }

  return {
    dataDir, coversDir, snapshot,
    init() { discover(); const e = refresh(); return { errors: e }; },
    rescan() { discover(); return refresh(); },
    addSource(p) { const r = inspect(p); if (!lib.sources.includes(r.path)) lib.sources.push(r.path); refresh(); return r.id; },
    removeSource(id) { const s = cache.get(id); if (!s) return; lib.sources = lib.sources.filter((p) => p !== s.path); refresh(); },
    select(sel) {
      if ('baseId' in sel) { const b = cache.get(sel.baseId); if (!b?.edition.supported) throw new Error('Esa fuente no es una base compatible con el recompilador'); lib.selection.baseId = sel.baseId; }
      if ('text' in sel) { if (!TEXT_LANGS[sel.text]) throw new Error('Idioma de textos no válido'); lib.selection.text = sel.text; }
      if ('voice' in sel) lib.selection.voice = sel.voice;
      if ('borderless' in sel) lib.selection.borderless = !!sel.borderless;
      save();
    },
    prepareVoices: (id) => exclusive('Preparando voces', () => prepareVoices(id)),
    cancel() { cancel = true; cancelHook?.(); },

    // Exporta los recursos de voz identificados a una carpeta elegida (copia, no mueve).
    exportVoices: (optionId, dest) => exclusive('Exportando voces', async () => {
      const p = prepared.get(optionId) ?? await prepareVoices(optionId);
      const out = path.join(dest, 'Sound', 'SoundRes');
      fs.mkdirSync(out, { recursive: true });
      const files = fs.readdirSync(p.dir); let i = 0;
      for (const f of files) { fs.copyFileSync(path.join(p.dir, f), path.join(out, f)); emit('progress', { what: 'Exportando voces', done: ++i, total: files.length, file: f }); if (i % 10 === 0) await tick(); }
      fs.writeFileSync(path.join(dest, 'Sound', 'LEEME.txt'), `Voces exportadas desde ${optionId}\nIdentificador de contenido: ${p.contentId}\nEstado de compatibilidad con la base PAL: ${p.report.level}\n`);
      return { dest: out, files: files.length };
    }),

    importPal: (iso) => exclusive('Importando ISO PAL', async () => {
      const probe = inspectSource(iso);
      if (!probe.edition.supported) throw new Error('Esa ISO no es la edición PAL/USA-Europa compatible (el ejecutable no coincide)');
      const dest = path.join(dataDir, 'juego-pal');
      if (fs.existsSync(dest)) throw new Error('Ya existe una importación PAL en la carpeta de datos');
      try {
        await new Promise((resolve, reject) => {
          const w = new Worker(new URL('./worker-import.mjs', import.meta.url), { workerData: { iso, dest } });
          cancelHook = () => w.terminate();
          w.on('message', (m) => { if (m.type === 'progress') emit('progress', { what: 'Importando ISO PAL', done: m.done, total: m.total, file: m.file }); else if (m.type === 'done') resolve(); else reject(new Error(m.message)); });
          w.on('error', reject);
          w.on('exit', (c) => { if (c !== 0) reject(new Error('Importación interrumpida')); });
        });
      } catch (e) { fs.rmSync(dest, { recursive: true, force: true }); throw e; } finally { cancelHook = null; }
      const r = inspect(dest); lib.sources.push(r.path); lib.selection.baseId = r.id; refresh(); return r.id;
    }),

    // Copia la imagen elegida a la carpeta de datos (la original no se toca). Solo imágenes de hasta 12 MB.
    setCover(key, file) {
      if (!['portada', 'fondo'].includes(key)) throw new Error('Carátula no válida');
      const ext = path.extname(file).slice(1).toLowerCase();
      if (!COVER_EXT.includes(ext)) throw new Error('Formato de imagen no admitido (usa JPG, PNG o WebP)');
      if (fs.statSync(file).size > 12 * 1024 * 1024) throw new Error('La imagen supera los 12 MB');
      fs.mkdirSync(coversDir, { recursive: true });
      for (const e of COVER_EXT) fs.rmSync(path.join(coversDir, `${key}.${e}`), { force: true });
      fs.copyFileSync(file, path.join(coversDir, `${key}.${ext}`));
    },
    removeCover(key) {
      if (!['portada', 'fondo'].includes(key)) throw new Error('Imagen no válida');
      for (const e of COVER_EXT) fs.rmSync(path.join(coversDir, `${key}.${e}`), { force: true });
    },
    setCoverData(key, mime, b64) {
      const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[mime];
      if (!['portada', 'fondo'].includes(key) || !ext) throw new Error('Imagen no admitida (usa JPG, PNG o WebP)');
      const buf = Buffer.from(String(b64), 'base64');
      if (!buf.length || buf.length > 12 * 1024 * 1024) throw new Error('La imagen está vacía o supera los 12 MB');
      fs.mkdirSync(coversDir, { recursive: true });
      for (const e of COVER_EXT) fs.rmSync(path.join(coversDir, `${key}.${e}`), { force: true });
      fs.writeFileSync(path.join(coversDir, `${key}.${ext}`), buf);
    },
    writeSettings: (c) => settings.writeSettings(c),
    removeProfile: (id) => removeProfile(profilesDir, id),
    readLog: () => { const l = game.readLog(300); return { file: l.file, lines: l.lines, relevant: game.relevantLines(l.lines) }; },

    async play() {
      if (game.running()) throw new Error('El juego ya está en ejecución');
      const base = cache.get(lib.selection.baseId);
      if (!base) throw new Error('No hay edición base seleccionada');
      if (!base.edition.supported || base.kind !== 'folder' || !base.hasData) throw new Error('La base debe ser la edición PAL compatible ya extraída (carpeta con default.xex y data)');
      const sel = lib.selection;
      const vopt = voiceOptions().find((v) => v.id === sel.voice);
      let gameDir = base.path, desc = 'datos de la base sin modificar';
      if (vopt && vopt.kind !== 'base') {
        const p = prepared.get(vopt.id) ?? await exclusive('Preparando voces', () => prepareVoices(vopt.id));
        if (p.report.level === 'incompatible') throw new Error('Las voces seleccionadas son incompatibles con la base: ' + p.report.problems[0]);
        const c = await exclusive('Componiendo perfil de voces', async () => { await tick(); return composeProfile({ baseDir: base.path, spec: { baseId: base.id, voiceId: 'v' + p.contentId, voiceDir: p.dir }, profilesDir }); });
        gameDir = c.dir; desc = `perfil de voces ${c.id} (${c.reused ? 'reutilizado' : 'creado'})`;
      }
      const rt = ensureRuntime({ releaseDir, dataDir, lang: sel.text });
      desc += sel.text === 'ENG' ? ' · runtime original' : ` · runtime con idioma ${sel.text} (${rt.reused ? 'reutilizado' : 'creado'})`;
      note('info', `Lanzando con ${desc}`);
      const r = game.launch({ releaseDir, exeDir: rt.dir, gameDir, borderless: lib.selection.borderless === true, iconPath: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'ui', 'icon.ico'), onExit: (x) => emit('game-exit', { ...x, relevant: game.relevantLines(x.log.lines) }) });
      emit('game-start', { pid: r.pid, gameDir });
      return { pid: r.pid, gameDir };
    },
    stopGame: () => game.stop(),
  };
}
