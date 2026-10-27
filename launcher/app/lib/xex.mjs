// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Donelys Entretenimiento
// Lectura de la cabecera XEX2 (solo campos en claro; no descifra ni descomprime el ejecutable).
import crypto from 'node:crypto';

const u32 = (b, o) => b.readUInt32BE(o);
const hex = (n) => '0x' + n.toString(16).toUpperCase().padStart(8, '0');

export function parseXex(buf) {
  if (buf.length < 0x200 || buf.toString('latin1', 0, 4) !== 'XEX2') throw new Error('No es un ejecutable XEX2 válido');
  const secoff = u32(buf, 16);
  const count = u32(buf, 20);
  if (count > 256 || secoff + 0x180 > buf.length) throw new Error('Cabecera XEX2 dañada');
  const opts = new Map();
  for (let i = 0; i < count; i++) opts.set(u32(buf, 24 + 8 * i), u32(buf, 28 + 8 * i));
  const ex = opts.get(0x40006);
  const ff = opts.get(0x3ff);
  return {
    size: buf.length,
    sha256: crypto.createHash('sha256').update(buf).digest('hex'),
    titleId: ex ? hex(u32(buf, ex + 12)) : null,
    mediaId: ex ? hex(u32(buf, ex)) : null,
    version: ex ? u32(buf, ex + 4) : null,
    baseVersion: ex ? u32(buf, ex + 8) : null,
    regions: hex(u32(buf, secoff + 0x178)),
    imageSize: u32(buf, secoff + 4),
    entryPoint: hex(opts.get(0x10100) ?? 0),
    compression: ff ? buf.readUInt16BE(ff + 6) : null,
  };
}
