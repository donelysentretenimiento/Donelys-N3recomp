// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Donelys Entretenimiento
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const h = (tag, attrs, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'text') el.textContent = v;
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  for (const k of kids.flat()) if (k != null && k !== false) el.append(k.nodeType ? k : document.createTextNode(k));
  return el;
};

// título al estilo de la portada: capitales con la inicial de cada palabra más grande
const T = (txt) => h('span', {}, txt.split(' ').flatMap((w, i, arr) => [h('i', { text: w[0].toUpperCase() }), w.slice(1).toUpperCase() + (i < arr.length - 1 ? ' ' : '')]));
const fmtBytes = (n) => n > 1e9 ? (n / 1e9).toFixed(2).replace('.', ',') + ' GB' : (n / 1e6).toFixed(1).replace('.', ',') + ' MB';
const chip = (cls, t) => h('span', { class: 'chip ' + cls, text: t });

let S = null, view = 'inicio', busy = null, running = false;
const logLines = [];
const log = (level, msg) => { logLines.push({ level, msg, t: new Date() }); if (logLines.length > 500) logLines.shift(); if (view === 'registro') render(); };

function toast(msg, kind = '') {
  const t = h('div', { class: 'toast ' + kind, text: msg });
  $('#toasts').append(t);
  setTimeout(() => t.remove(), kind === 'error' ? 9000 : 4500);
}
async function call(name, ...a) {
  const r = await window.n3.call(name, ...a);
  if (!r.ok) { toast(r.error, 'error'); log('error', `${name}: ${r.error}`); throw new Error(r.error); }
  return r.data;
}
const act = (fn) => async (...a) => { try { await fn(...a); } catch (e) { /* ya notificado por call() */ } };
const apply = (snap) => { if (snap) { S = snap; running = S.running; render(); } };

const NAV = [['inicio', 'Juego'], ['ajustes', 'Ajustes'], ['fuentes', 'Fuentes']];

function renderNav() {
  const list = $('#navlist'); list.replaceChildren();
  for (const [id, label] of NAV) list.append(h('button', { class: 'pill', 'aria-current': view === id ? 'page' : null, onclick: () => go(id) }, label));
  $('#navfoot').textContent = running ? '● Juego en ejecución' : '';
}
function go(id) { view = id; if (id === 'fuentes') loadGameLog(); render(); }

const baseSrc = () => S.sources.find((s) => s.id === S.selection.baseId);
const voiceSel = () => S.voices.find((v) => v.id === S.selection.voice);
const langName = () => (S.textLangs.find((t) => t.lang === S.selection.text)?.name ?? S.selection.text);
const RES = { 720: '720p (1280×720)', 1080: '1080p (1920×1080)', 1440: '1440p (2560×1440)', 2160: '4K (3840×2160)' };
const ANISO = { 0: '1×', 2: '2×', 3: '4×', 4: '8×', 5: '16×' };

/* ---------- Inicio: una portada ---------- */
function vInicio() {
  const base = baseSrc(), v = voiceSel(), g = S.settings.values;
  const ext = v && v.kind === 'external';
  const img = S.covers?.portada;
  const cover = h('button', { class: 'cover' + (img ? ' has-img' : ''), 'data-ed': 'pal', 'data-key': 'portada', 'aria-label': 'Jugar', title: 'Arrastra una imagen aquí, o pégala con Ctrl+V para cambiar la portada', onclick: act(async () => { if (base) await call('play'); }) },
    img ? h('img', { src: img, alt: 'N3: Ninety-Nine Nights' }) : null,
    h('div', { class: 'band', text: 'XBOX 360' }), h('div', { class: 'state' }, base ? chip('ok', 'Jugable') : chip('warn', 'Falta la base PAL')),
    h('div', { class: 'art' }, h('b', { text: 'N3' }), h('span', { text: 'NINETY-NINE NIGHTS' })));
  const ic = (d) => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true'); const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', d); s.append(p); return s; };
  const lo = (icon, k, val) => h('button', { class: 'lo', onclick: () => go('ajustes') }, ic(icon), h('span', {}, h('small', { text: k }), val));
  const notes = [];
  if (!base) notes.push(['bad', 'No hay ninguna edición base compatible. Importa la ISO PAL o añade la carpeta ya extraída en Fuentes.']);
  return h('section', {},
    h('div', { class: 'shelf one' }, h('div', { class: 'slot' }, cover,
      h('div', { class: 'loadout glass' },
        lo('M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18', 'Textos', langName()),
        lo('M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3', 'Voces', v ? (v.kind === 'base' ? 'Originales' : 'Japonesas') : '—'),
        lo('M3 5h18v11H3zM8 21h8M12 16v5', 'Pantalla', `${g.n3_frame_rate} FPS · ${g.n3_display_resolution}p · ${g.resolution_scale}×`)),
      h('div', { class: 'actions' },
        base ? null : h('button', { class: 'pill sm gold', disabled: !!S.busy, onclick: act(async () => { const r = await call('importPal'); if (r) apply(r); }) }, 'Importar ISO PAL…'),
        h('button', { class: 'pill sm', onclick: () => go('ajustes') }, 'Ajustes')))),
    notes.length ? h('div', { class: 'glass notes' }, notes.map(([k, t]) => h('div', { class: 'note ' + k }, t))) : null);
}
function describePlan() {
  const v = voiceSel(), t = S.selection.text;
  const parts = [];
  if (t !== 'ENG') parts.push(`un runtime local que declara el idioma ${langName()} al juego (el n3.exe y el DLL originales no se tocan), de modo que usa sus tablas, imágenes y fuente nativas`);
  if (v && v.kind !== 'base') parts.push('un perfil de enlaces duros a la base donde solo cambian las voces (Sound\\ENG\\SoundRes); no se copian 5,8 GB ni se modifica ningún original');
  if (!parts.length) return 'La carpeta base PAL tal cual y el runtime original, sin ninguna modificación. Es exactamente lo que ya funcionaba.';
  return 'Se usará ' + parts.join(' y ') + '. Volver al estado original es elegir Inglés y voces originales.';
}

/* ---------- Ajustes (idioma, voces, gráficos) ---------- */
let ajustesTab = 'idioma';
function vAjustes() {
  const i = vIdioma(), g = vGraficos();
  i.querySelector('h1')?.remove(); g.querySelector('h1')?.remove();
  const look = h('div', { class: 'glass card' }, h('h2', { text: 'Apariencia' }),
    h('div', { class: 'row' },
      h('button', { class: 'pill sm', onclick: act(async () => { const r = await call('setCover', 'portada'); if (r) apply(r); }) }, 'Cambiar portada…'),
      h('button', { class: 'pill sm', onclick: act(async () => { const r = await call('setCover', 'fondo'); if (r) apply(r); }) }, 'Cambiar fondo…'),
      S.covers?.fondo ? h('button', { class: 'pill sm ghost', onclick: act(async () => apply(await call('removeCover', 'fondo'))) }, 'Quitar fondo') : null),
    h('p', { class: 'lead', text: 'Fondo recomendado: 2560×1440 px (16:9) en JPG, PNG o WebP de hasta 12 MB, sin texto ni logotipos, con los personajes hacia los lados y el centro oscuro y poco detallado (ahí van la portada y los botones). Portada: cuadrada, mínimo 1200×1200 px. Sin fondo propio se usa la portada desenfocada.' }));
  const ingame = h('div', { class: 'glass card' }, h('h2', { text: 'Dentro del juego' }),
    h('p', { class: 'lead', text: 'El recompilador trae su propio menú de ajustes en pantalla: pulsa F4 durante la partida (F3 muestra el contador de rendimiento). Marca cada opción como «live» si se aplica al momento o «restart» si necesita reiniciar, y guarda en el mismo n3.toml que usa este launcher. Además, el menú principal del juego tiene su página «Graphics».' }));
  const tabs = [['idioma', 'Idioma y voces'], ['graficos', 'Gráficos'], ['apariencia', 'Apariencia']];
  const bar = h('div', { class: 'opts tabs', role: 'tablist' }, tabs.map(([id, label]) => h('button', { class: 'opt', role: 'tab', 'aria-pressed': String(ajustesTab === id), onclick: () => { ajustesTab = id; render(); } }, label)));
  const body = ajustesTab === 'graficos' ? [...g.children, ingame] : ajustesTab === 'apariencia' ? [look] : [...i.children];
  return h('section', {}, h('h1', {}, T('Ajustes')), bar, body);
}

/* ---------- Idioma y voces ---------- */
function vIdioma() {
  const sel = S.selection;
  return h('section', {},
    h('h1', {}, T('Idioma y voces')),
    h('p', { class: 'lead', text: 'Los textos y las voces se eligen por separado. Nada se sobrescribe: el idioma se aplica con una copia local del runtime y las voces con un perfil de enlaces; tus archivos originales no se tocan.' }),
    h('div', { class: 'glass card' },
      h('h2', { text: 'Idioma de los textos' }),
      h('div', { class: 'opts' }, S.textLangs.length ? S.textLangs.map((t) => h('button', { class: 'opt', disabled: t.lang !== 'ENG' && S.runtime && !S.runtime.patchable, 'aria-pressed': String(sel.text === t.lang), onclick: act(async () => apply(await call('select', { text: t.lang }))) }, t.name, h('small', { text: `${t.files} tablas` }))) : h('span', { class: 'mono', text: 'Selecciona primero una edición base.' })),
      h('p', { class: 'lead', text: 'El SDK del recompilador le dice siempre «inglés» al juego, y de ese valor salen text\\, Briefing\\, interface\\Local\\, sox\\ y la fuente (la de inglés no tiene acentos: de ahí la X roja). Para otro idioma se arranca una copia del runtime que responde con ese idioma; las carpetas de datos no se tocan.' }),
      S.runtime && !S.runtime.patchable ? h('div', { class: 'notice bad', text: 'No se puede cambiar el idioma: ' + S.runtime.reason }) : null),
    h('div', { class: 'glass card' },
      h('h2', { text: 'Idioma de las voces' }),
      h('div', { class: 'row' },
        h('button', { class: 'pill sm gold', disabled: !!S.busy, onclick: act(async () => apply(await call('addSource'))) }, 'Aportar ISO o carpeta japonesa…'),
        S.voices.some((v) => v.kind === 'external') ? chip('ok', 'Voces japonesas detectadas') : chip('mute', 'Sin voces japonesas todavía')),
      S.voices.some((v) => v.kind === 'external') ? null : h('p', { class: 'lead', text: 'Aporta tu ISO japonesa (o la carpeta del UNDUB con su default.xex): la app localiza las voces, las extrae una sola vez a su carpeta de datos y las comprueba antes de usarlas. Tu ISO no se modifica.' }),
      S.voices.map((v) => voiceRow(v, sel))));
}
function voiceRow(v, sel) {
  const pk = v.prepared;
  const levelChip = !pk ? (v.kind === 'base' ? chip('ok', 'Original de la edición') : chip('mute', 'Sin preparar')) :
    pk.level === 'compatible' ? chip('ok', 'Estructura compatible') : pk.level === 'avisos' ? chip('warn', 'Compatible con avisos') : chip('bad', 'Incompatible');
  return h('div', { class: 'field' },
    h('label', {}, v.label, h('span', { class: 'hint', text: `${v.files} archivos · ${fmtBytes(v.bytes)}${v.needsExtraction ? ' · se extrae de la ISO' : ''}` })),
    h('div', {},
      h('div', { class: 'row' },
        h('button', { class: 'opt', 'aria-pressed': String(sel.voice === v.id), disabled: !!S.busy, onclick: act(async () => { if (v.kind !== 'base' && !v.prepared) await call('prepareVoices', v.id).then((r) => apply(r.snapshot)); apply(await call('select', { voice: v.id })); }) }, sel.voice === v.id ? 'Seleccionadas' : 'Usar estas voces'),
        levelChip,
        v.kind !== 'base' ? h('button', { class: 'pill sm', disabled: !!S.busy, onclick: act(async () => { const r = await call('prepareVoices', v.id); apply(r.snapshot); showReport(r.report); }) }, 'Analizar') : null,
        v.kind !== 'base' ? h('button', { class: 'pill sm', disabled: !!S.busy, onclick: act(async () => { const r = await call('exportVoices', v.id); if (r) { toast(`Exportadas ${r.files} archivos a ${r.dest}`, 'ok'); call('reveal', r.dest); } }) }, 'Exportar…') : null)));
}
function showReport(r) {
  const msgs = [`Archivos: ${r.fileCount} · bancos XWB con estructura idéntica: ${r.banksIdentical}/${r.banksChecked} · bancos de sonido XSB revisados: ${r.xsbChecked}`, ...r.problems, ...r.warnings];
  toast(msgs.join('\n'), r.level === 'incompatible' ? 'error' : 'ok');
  for (const m of msgs) log(r.level === 'compatible' ? 'ok' : 'warn', m);
}

/* ---------- Gráficos ---------- */
function vGraficos() {
  const g = S.settings.values, sc = S.schema, lock = running;
  const set = (k, v) => act(async () => { const r = await call('writeSettings', { [k]: v }); apply(r.snapshot); toast('Guardado en n3.toml', 'ok'); });
  const seg = (key, labels, extra) => h('div', { class: 'opts' }, sc[key].allowed.map((v) => h('button', { class: 'opt', disabled: lock, 'aria-pressed': String(g[key] === v), onclick: set(key, v) }, labels[v], extra?.[v] ? h('small', { text: extra[v] }) : null)));
  const tog = (key, on, off) => h('div', { class: 'opts' }, [[true, on], [false, off]].map(([v, l]) => h('button', { class: 'opt', disabled: lock, 'aria-pressed': String(g[key] === v), onclick: set(key, v) }, l)));
  return h('section', {},
    h('h1', {}, T('Gráficos')),
    h('p', { class: 'lead', text: 'Estas son las mismas opciones del menú Graphics del juego y se guardan en el mismo archivo (n3.toml), así que ambos lados siempre ven lo mismo.' }),
    lock ? h('div', { class: 'notice warn', text: 'El juego está abierto: cierra la partida antes de cambiar ajustes (el juego reescribe n3.toml al guardar los suyos).' }) : null,
    h('div', { class: 'glass card' },
      field('Fotogramas por segundo', 'El motor original va a 30. 40 y 60 son experimentales.', seg('n3_frame_rate', { 30: '30 FPS', 40: '40 FPS', 60: '60 FPS' }, { 30: 'Original', 40: 'Experimental', 60: 'Experimental' })),
      field('Resolución de salida', 'Tamaño de la ventana / pantalla.', seg('n3_display_resolution', RES)),
      field('Resolución de renderizado', 'Escala interna entera sobre 720p.', seg('resolution_scale', { 1: '720p (1×)', 2: '1440p (2×)', 3: '4K (3×)' })),
      field('Filtrado anisotrópico', '1× lo desactiva.', seg('anisotropic_override', ANISO)),
      field('Sincronización vertical', 'Solo afecta a la presentación en Windows, no al ritmo del juego.', tog('n3_vsync', 'Activada', 'Desactivada')),
      field('Pantalla completa', 'Se aplica al abrir el juego.', tog('fullscreen', 'Pantalla completa', 'Ventana')),
      field('Barra de la ventana', 'Solo en modo ventana (en pantalla completa no hay barra). La barra de la marca lleva el icono y el título DONELYS N3, con los colores del launcher.', h('div', { class: 'opts' }, [[false, 'Barra de la marca'], [true, 'Sin barra']].map(([v, l]) => h('button', { class: 'opt', disabled: lock, 'aria-pressed': String((S.selection.borderless === true) === v), onclick: act(async () => apply(await call('select', { borderless: v }))) }, l))))),
    h('div', { class: 'glass card row' },
      h('div', {}, h('b', { text: 'Mi equipo (RTX 5090 · 1440p)' }), h('div', { class: 'mono', text: '60 FPS · salida 1440p · render 4K · anisotrópico 16× · VSync · pantalla completa' })),
      h('span', { class: 'sp' }),
      h('button', { class: 'pill sm gold', disabled: lock, onclick: act(async () => { const r = await call('writeSettings', S.preferred); apply(r.snapshot); toast('Perfil aplicado y guardado', 'ok'); }) }, 'Aplicar este perfil')),
    h('p', { class: 'mono', text: `Archivo: ${S.tomlPath}` }));
}
const field = (label, hint, ctl) => h('div', { class: 'field' }, h('label', {}, label, h('span', { class: 'hint', text: hint })), ctl);

/* ---------- Fuentes ---------- */
function vFuentes() {
  return h('section', {},
    h('h1', {}, T('Fuentes del juego')),
    h('p', { class: 'lead', text: 'Cada ISO o carpeta se reconoce por la firma real de su ejecutable. Los recursos extraídos se guardan una sola vez y se reutilizan.' }),
    h('div', { class: 'row' },
      h('button', { class: 'pill sm gold', disabled: !!S.busy, onclick: act(async () => apply(await call('addSource'))) }, 'Añadir ISO o carpeta…'),
      h('button', { class: 'pill sm', disabled: !!S.busy, onclick: act(async () => { const r = await call('importPal'); if (r) apply(r); }) }, 'Importar ISO PAL (5,8 GB)…'),
      h('button', { class: 'pill sm ghost', disabled: !!S.busy, onclick: act(async () => apply(await call('rescan'))) }, 'Volver a analizar')),
    S.sources.map((s) => h('div', { class: 'glass src' },
      h('div', { class: 'row' }, h('h3', { text: s.name }), chip(s.edition.supported ? 'ok' : 'warn', s.edition.label), chip('mute', s.kind === 'iso' ? 'ISO' : 'Carpeta'), s.id === S.selection.baseId ? chip('ok', 'Base en uso') : null, h('span', { class: 'sp' }),
        s.edition.supported && s.kind === 'folder' && s.hasData && s.id !== S.selection.baseId ? h('button', { class: 'pill sm', onclick: act(async () => apply(await call('select', { baseId: s.id }))) }, 'Usar como base') : null,
        h('button', { class: 'pill sm ghost', onclick: act(async () => apply(await call('removeSource', s.id))) }, 'Quitar')),
      h('div', { class: 'path', text: s.path }),
      h('div', { class: 'mono', text: `default.xex ${fmtBytes(s.xex.size)} · versión 0.0.0.${s.xex.version} · regiones ${s.xex.regions} · punto de entrada ${s.xex.entryPoint} · SHA-256 ${s.xex.sha256.slice(0, 16)}…` }),
      h('div', { class: 'mono', text: `Textos: ${s.content.textLangs.map((t) => t.lang).join(', ') || '—'} · Voces: ${s.content.voicePacks.map((p) => (p.lang ?? 'sin carpeta de idioma') + ' (' + p.files + ')').join(', ') || '—'} · ${s.fileCount} archivos · ${fmtBytes(s.totalBytes)}` }),
      h('p', { class: 'lead', text: s.edition.note }))),
    h('div', { class: 'glass card' }, h('h2', { text: 'Perfiles compuestos' }),
      S.profiles.length ? h('table', {}, h('tr', {}, h('th', { text: 'Perfil' }), h('th', { text: 'Archivos' }), h('th', { text: 'Enlaces duros' }), h('th', {})), S.profiles.map((p) => h('tr', {}, h('td', { class: 'mono', text: p.id }), h('td', { text: p.files }), h('td', { text: p.hardLinks }), h('td', {}, h('button', { class: 'pill sm ghost', onclick: act(async () => apply(await call('removeProfile', p.id))) }, 'Eliminar'))))) : h('p', { class: 'lead', text: 'Aún no hay perfiles. Se crean al jugar con un idioma o unas voces distintos de los originales; eliminarlos nunca toca tus datos.' })));
}

/* ---------- Registro ---------- */
let gameLog = { file: null, lines: [], relevant: [] };
async function loadGameLog() { try { gameLog = await call('readLog'); render(); } catch {} }
function vRegistro() {
  const cls = (l) => (/\[(error|critical)\]/i.test(l) ? 'e' : /\[warn/i.test(l) ? 'w' : '');
  return h('section', {},
    h('h1', {}, T('Registro')),
    h('div', { class: 'row' }, h('button', { class: 'pill sm', onclick: act(loadGameLog) }, 'Releer registro del juego'), gameLog.file ? h('span', { class: 'mono', text: gameLog.file }) : null),
    h('div', { class: 'glass card' }, h('h2', { text: 'Avisos y errores relevantes del juego' }),
      h('div', { class: 'logbox' }, gameLog.relevant.length ? gameLog.relevant.map((l) => h('div', { class: cls(l), text: l })) : 'Sin avisos ni errores en el último registro.')),
    h('div', { class: 'glass card' }, h('h2', { text: 'Actividad de la aplicación' }),
      h('div', { class: 'logbox' }, logLines.length ? logLines.slice().reverse().map((l) => h('div', { class: l.level === 'error' ? 'e' : l.level === 'warn' ? 'w' : l.level === 'ok' ? 'o' : '', text: `${l.t.toLocaleTimeString('es-ES')}  ${l.msg}` })) : 'Sin actividad todavía.')));
}

function vFuentesCompleto() {
  const f = vFuentes(), r = vRegistro();
  r.querySelector('h1')?.remove();
  f.append(h('h1', {}, T('Registro del juego')), ...r.children);
  return f;
}
let lastArt = null;
function paintBackground() {
  const f = S.covers?.fondo, pt = S.covers?.portada, url = f || pt || null;
  if (url === lastArt) return;
  lastArt = url;
  $('#bgart').style.backgroundImage = url ? `url("${url}")` : 'none';
  $('#bg').classList.toggle('on', !!url);
  $('#bg').classList.toggle('blur', !f);
}
function render() {
  if (!S) return;
  paintBackground();
  renderNav();
  $('#app').classList.toggle('sub', view !== 'inicio');
  const base = baseSrc();
  $('#installed').textContent = base ? 'Instalado en: ' + base.path : 'Sin edición base compatible';
  const pb = $('#playBtn'); pb.disabled = !base || running || !!S.busy; pb.textContent = running ? 'EN EJECUCIÓN' : 'JUGAR';
  const m = $('#view'); const top = m.scrollTop;
  m.replaceChildren({ inicio: vInicio, ajustes: vAjustes, fuentes: vFuentesCompleto }[view]());
  m.scrollTop = top;
}
$('#playBtn').addEventListener('click', act(() => call('play')));

window.n3.on((ch, p) => {
  if (ch === 'progress') {
    const box = $('#busy');
    if (!p) { return; }
    box.hidden = false; $('#busyTitle').textContent = p.what; $('#busyFile').textContent = p.file ?? '';
    $('.bar').classList.toggle('indet', !p.total); $('#busyBar').style.width = p.total ? (100 * p.done / p.total).toFixed(1) + '%' : '35%';
  } else if (ch === 'busy') {
    busy = p; $('#busy').hidden = !p; if (p) { $('#busyTitle').textContent = p; $('.bar').classList.add('indet'); $('#busyFile').textContent = ''; }
    if (S) S.busy = p; render();
  } else if (ch === 'log') log(p.level, p.msg);
  else if (ch === 'game-start') { running = true; log('info', 'Juego iniciado (PID ' + p.pid + ')'); toast('Juego iniciado', 'ok'); call('snapshot').then(apply).catch(() => {}); }
  else if (ch === 'game-exit') {
    running = false;
    const bad = p.code !== 0 && p.code !== null;
    log(bad ? 'error' : 'info', `El juego terminó (código ${p.code}) tras ${(p.ms / 1000).toFixed(1)} s`);
    if (bad) { toast(`El juego se cerró con el código ${p.code}. Revisa el Registro.`, 'error'); for (const l of p.relevant.slice(-6)) log('warn', l); }
    gameLog = { file: p.log.file, lines: p.log.lines, relevant: p.relevant };
    call('snapshot').then(apply).catch(() => {});
  }
});
$('#busyCancel').addEventListener('click', () => call('cancel').catch(() => {}));

call('snapshot').then((s) => { apply(s); log('info', 'Aplicación lista'); }).catch(() => {});


/* carátulas: arrastrar un archivo sobre la tarjeta, o pegar una imagen con Ctrl+V sobre ella */
let coverHover = null;
const coverOf = (e) => e.target.closest?.('.cover[data-key]');
document.addEventListener('mouseover', (e) => { const c = coverOf(e); if (c) coverHover = c.dataset.key; });
document.addEventListener('dragover', (e) => { if (coverOf(e)) e.preventDefault(); });
document.addEventListener('drop', async (e) => {
  const c = coverOf(e); if (!c) return;
  e.preventDefault();
  const f = e.dataTransfer.files[0]; if (!f) return;
  try { apply(await call('setCoverFile', c.dataset.key, window.n3.pathFor(f))); toast('Carátula actualizada', 'ok'); } catch {}
});
document.addEventListener('paste', async (e) => {
  const item = [...(e.clipboardData?.items ?? [])].find((i) => i.type.startsWith('image/'));
  if (!item || !coverHover) { if (item) toast('Pon el ratón sobre una carátula y vuelve a pegar', ''); return; }
  const file = item.getAsFile();
  const b64 = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.readAsDataURL(file); });
  try { apply(await call('setCoverData', coverHover, file.type, b64)); toast('Carátula actualizada', 'ok'); } catch {}
});


/* cristal líquido: el brillo especular sigue al puntero y la portada se inclina un poco */
document.addEventListener('pointermove', (e) => {
  const el = e.target.closest?.('.glass, .pill, .cover'); if (!el) return;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  if (el.classList.contains('cover') && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * 9).toFixed(2) + 'deg');
    el.style.setProperty('--rx', ((.5 - (e.clientY - r.top) / r.height) * 9).toFixed(2) + 'deg');
  }
});
document.addEventListener('pointerout', (e) => { const el = e.target.closest?.('.cover'); if (el && !el.contains(e.relatedTarget)) { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); } });

/* luz global que sigue al puntero y paralaje suave del arte de fondo */
document.addEventListener('pointermove', (e) => {
  document.documentElement.style.setProperty('--lx', e.clientX + 'px'); document.documentElement.style.setProperty('--ly', e.clientY + 'px');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const dx = -(e.clientX / innerWidth - .5) * 26, dy = -(e.clientY / innerHeight - .5) * 18;
  $('#bgart').style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(1.03)`;
});
