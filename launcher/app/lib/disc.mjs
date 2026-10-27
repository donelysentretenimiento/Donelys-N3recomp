// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Donelys Entretenimiento
// Lector de imágenes de disco Xbox 360 (sistema de archivos XDVDFS), escrito desde la especificación pública del formato:
//  - el descriptor de volumen está en el sector 32 de la partición de juego ("MICROSOFT*XBOX*MEDIA" al principio y al final);
//  - la partición empieza en uno de los desplazamientos conocidos de cada generación de disco (XGD1, XGD2, XGD3…);
//  - cada directorio es un árbol binario de entradas (subárbol izquierdo/derecho en unidades de 4 bytes, sector, tamaño, atributos, nombre).
// Solo lectura. Rechaza nombres peligrosos, ciclos y extensiones fuera de la imagen.
import fs from 'node:fs';

const SECTOR = 2048;
const MAGIC = 'MICROSOFT*XBOX*MEDIA';
const PARTITION_OFFSETS = [0, 0xfb20, 0x20600, 0x2080000, 0xfd90000];
const ATTR_DIRECTORY = 0x10;
const RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i;

export class Disc {
  constructor(file) {
    this.fd = fs.openSync(file, 'r');
    this.size = fs.fstatSync(this.fd).size;
    try {
      this.offset = PARTITION_OFFSETS.find((o) => o + 33 * SECTOR <= this.size && this.#readRaw(o + 32 * SECTOR, MAGIC.length).toString('latin1') === MAGIC);
      if (this.offset === undefined) throw new Error('No se encontró una partición XDVDFS de Xbox 360');
      const volume = this.read(this.offset + 32 * SECTOR, SECTOR);
      if (volume.toString('latin1', SECTOR - MAGIC.length) !== MAGIC) throw new Error('Descriptor de volumen dañado');
      this.rootSector = volume.readUInt32LE(20);
      this.rootSize = volume.readUInt32LE(24);
    } catch (e) { this.close(); throw e; }
  }

  close() { if (this.fd !== null) { fs.closeSync(this.fd); this.fd = null; } }

  #readRaw(offset, length) {
    const buf = Buffer.alloc(length);
    return fs.readSync(this.fd, buf, 0, length, offset) === length ? buf : Buffer.alloc(0);
  }

  read(offset, length) {
    if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length) || offset < 0 || length < 0 || offset + length > this.size) throw new Error('Lectura fuera de la imagen');
    const buf = this.#readRaw(offset, length);
    if (buf.length !== length) throw new Error('Lectura incompleta de la imagen');
    return buf;
  }

  // Lista todos los archivos: [{ path: 'data/Text/ENG/x.txt', offset, size }], ordenados por ruta.
  entries() {
    const files = [], seenDirs = new Set(), seenNames = new Set();
    const pending = [{ sector: this.rootSector, size: this.rootSize, parent: '' }];
    while (pending.length) {
      const { sector, size, parent } = pending.pop();
      if (!size) continue;
      if (size < 14 || size > 32 << 20) throw new Error('Tamaño de directorio inválido');
      if (seenDirs.has(sector)) throw new Error('Ciclo o alias de directorios');
      seenDirs.add(sector);
      const table = this.read(this.offset + sector * SECTOR, size);
      const stack = [0], visited = new Set();
      while (stack.length) {
        const pos = stack.pop();
        if (visited.has(pos)) throw new Error('Ciclo en el árbol del directorio');
        visited.add(pos);
        if (pos + 14 > table.length) throw new Error('Entrada de directorio fuera de la tabla');
        const left = table.readUInt16LE(pos) * 4, right = table.readUInt16LE(pos + 2) * 4;
        const start = table.readUInt32LE(pos + 4), length = table.readUInt32LE(pos + 8);
        const attr = table[pos + 12], nameLen = table[pos + 13];
        if (!nameLen || pos + 14 + nameLen > table.length) throw new Error('Nombre de entrada inválido');
        const name = table.toString('latin1', pos + 14, pos + 14 + nameLen);
        if (name === '.' || name === '..' || /[<>:"/\\|?*\x00-\x1f]/.test(name) || /[. ]$/.test(name) || RESERVED.test(name)) throw new Error(`Nombre de entrada no seguro: ${JSON.stringify(name)}`);
        const rel = parent ? `${parent}/${name}` : name;
        if (seenNames.has(rel.toLowerCase())) throw new Error(`Entrada duplicada: ${rel}`);
        seenNames.add(rel.toLowerCase());
        const abs = this.offset + start * SECTOR;
        if (abs + length > this.size) throw new Error(`La entrada excede la imagen: ${rel}`);
        if (attr & ATTR_DIRECTORY) pending.push({ sector: start, size: length, parent: rel });
        else files.push({ path: rel, offset: abs, size: length });
        if (left) stack.push(left);
        if (right) stack.push(right);
      }
    }
    return files.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  }
}
