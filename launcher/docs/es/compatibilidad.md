# Compatibilidad de ediciones

Todas las cifras proceden de leer los discos y ejecutables reales con las herramientas del launcher.

## Ejecutables

| Edición | Versión | Regiones | Punto de entrada | SHA-256 de `default.xex` | Papel |
|---|---|---|---|---|---|
| PAL / USA-Europa | 0.0.0.3 | `0xFFFFFFFF` | `0x8252FD00` | `0fe8973b6ff45d3f8bd03a51a8c0d8cdf278b3d43e793497777e075f4e94a804` | **Base jugable** |
| Japón (ISO) | 0.0.0.1 | `0xFD00` | `0x8252D800` | `43a4d2d1650bbef7ed751fdd8dbb982662a55aac73f5c31795a6c207e391b9be` | Fuente de voces |
| UNDUB | 0.0.0.4 | `0xFD00` | `0x8252F2C0` | `e0daff3eeea0232cbe7ee01b88af35b1c673c2cf83fb0e7a5341e78a18c04496` | Fuente de voces |

Los tres comparten *title ID* `4D5307DB`. El código de N3 Recompiled está traducido de la imagen PAL, y su importador solo acepta ese hash.

## Contenido

- **PAL**: textos `ENG FRA GER ITA SPA`; voces solo en inglés (`Sound\ENG`, 149 bancos).
- **Japón**: textos `JPN`; voces en `Sound\SoundRes` (149 archivos, sin carpeta de idioma).
- **UNDUB**: textos `ENG JPN TCH`; voces `Sound\ENG` y `Sound\JPN`. Su `Sound\JPN` es **idéntico byte a byte** (SHA-256) al `Sound\SoundRes` de la ISO
  japonesa: sirve cualquiera de las dos fuentes.

## Compatibilidad de las voces japonesas con la base PAL

| Comprobación | Resultado |
|---|---|
| Mismo conjunto de 149 archivos | Sí |
| Bancos de ondas (`.xwb`) con igual nombre, códecs, indicadores y nº de voces | 112 de 113 |
| Bancos de sonido (`.xsb`) | 35 de 35 idénticos salvo la cabecera (CRC y marca de tiempo) |
| Lista de bancos de `xwbpreload.pak` | Idéntica |
| Excepción | `mission_4_voice_vigkvagk.xwb`: 45 voces en la ISO japonesa frente a 46 en la PAL |

Por eso el launcher no copia solo los bancos de voz: instala el conjunto japonés completo (xsb, xwb y preload) para que sea coherente consigo mismo.

## Por qué el UNDUB no arranca con N3 Recompiled

Su ejecutable es el japonés v0.0.0.4, no el PAL: otro SHA-256, otras regiones, otro punto de entrada y otro tamaño de imagen. N3 Recompiled solo acepta
el hash PAL, y las direcciones de las funciones traducidas pertenecen a esa imagen. Con un `--game_data_root` del UNDUB el proceso termina con
`0xC0000409` sin mostrar ningún mensaje. **No se evita la comprobación**: se reutilizan sus recursos con el ejecutable PAL.
