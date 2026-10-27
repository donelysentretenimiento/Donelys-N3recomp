# DONELYS N3 Launcher

### DONELYS ENTRETENIMIENTO PRESENTA · *N3: Ninety-Nine Nights*

[Español](#español) · [English](#english) · [Documentación / Documentation](docs/README.md) · [Changelog](CHANGELOG.md)

[![Licencia](https://img.shields.io/badge/licencia-GPL--3.0--or--later-blue)](LICENSE)
[![Plataforma](https://img.shields.io/badge/plataforma-Windows%2010%2F11%20x64-0078d4)](docs/es/instalacion.md)
[![Estado](https://img.shields.io/badge/estado-alpha-orange)](docs/es/limitaciones.md)

> Este repositorio no contiene *N3: Ninety-Nine Nights*, ni archivos extraídos del juego, ni claves, ni código generado a partir del juego.
> Necesitas tu propia copia legítima del disco y [N3 Recompiled](https://github.com/WK2D/N3-Ninety-Nine-Nights-Recomp).
> This repository ships no game files, extracted data, keys or code generated from the game. You need your own legitimate disc copy and
> [N3 Recompiled](https://github.com/WK2D/N3-Ninety-Nine-Nights-Recomp).

---

## Español

Un launcher de escritorio para **N3 Recompiled** que se encarga de lo que el recompilador no hace por sí solo:

- **Idioma real de los textos** (inglés, francés, alemán, italiano y español) con los archivos oficiales del propio disco PAL, **sin sobrescribir nada**.
  Corrige además la «X roja» que aparece sobre las vocales acentuadas cuando se copia una tabla de otro idioma encima de la inglesa.
- **Voces japonesas originales** aportando tu ISO japonesa o la carpeta del UNDUB: las reconoce, las extrae una sola vez, comprueba que son
  compatibles con la edición PAL y monta un perfil de enlaces duros (sin copiar 5,8 GB).
- **Ajustes gráficos reales** del recompilador (FPS, resolución de salida y de render, anisotrópico, VSync, pantalla completa), guardados en el
  mismo `n3.toml` que usa el juego, con copia de seguridad.
- **Gestión de fuentes**: reconoce por firma ISO y carpetas de las ediciones PAL, japonesa y UNDUB; importa la ISO PAL; exporta las voces.
- **Ventana del juego con la imagen del launcher**: título, icono y colores de la barra (o sin barra).
- Interfaz en español de España con diseño propio de «cristal líquido», con portada y fondo de DONELYS ENTRETENIMIENTO incluidos (sustituibles).

### Requisitos

Windows 10/11 x64 · una GPU Direct3D 12 · [N3 Recompiled `v0.1.0-alpha.12`](https://github.com/WK2D/N3-Ninety-Nine-Nights-Recomp/releases) ·
tu copia de *N3* edición **PAL/Europa** (ISO o carpeta extraída). Opcional: ISO japonesa o UNDUB para las voces.

### Instalación rápida

1. Descarga N3 Recompiled y descomprímelo en una carpeta.
2. Descarga el `.zip` del launcher desde [Releases](../../releases) y extrae la carpeta `DONELYS-N3` **dentro de la carpeta de N3 Recompiled**
   (junto a `n3.exe`).
3. Ejecuta `DONELYS-N3\DONELYS N3.exe`. En *Fuentes*, añade tu ISO o carpeta PAL. En *Ajustes*, elige idioma, voces y gráficos. Pulsa **JUGAR**.

Más detalle en [docs/es/instalacion.md](docs/es/instalacion.md).

### Estado

| Hecho | Estado |
|---|---|
| Textos ES/FR/DE/IT con la carpeta PAL intacta | Comprobado en el juego |
| Voces japonesas cargadas desde el perfil | Comprobado (datos en memoria y audio por el autor) |
| Ajustes gráficos escritos y leídos del `n3.toml` | Pruebas automáticas + arranque real con el perfil |
| Texto japonés sobre la edición PAL | **No viable** (probado) — ver [limitaciones](docs/es/limitaciones.md) |
| UNDUB como edición independiente | **No viable** con el recompilador actual |

### Probado en

AMD Ryzen 7 9800X3D · NVIDIA GeForce RTX 5090 · 64 GB de RAM · Windows 11 · monitor GIGABYTE GS27Q (2560×1440).
Otros equipos no se han validado.

---

## English

A desktop launcher for **N3 Recompiled** that handles what the recompilation does not do on its own:

- **Real text-language selection** (English, French, German, Italian, Spanish) using the official files already on the PAL disc, **without overwriting
  anything**. It also fixes the "red X" that shows up over accented vowels when another language's table is copied over the English one.
- **Original Japanese voices**: provide your Japanese ISO or the UNDUB folder; it recognises them, extracts them once, checks they are compatible with
  the PAL edition and builds a hard-link profile (no 5.8 GB copy).
- **Real graphics settings** of the recompilation (FPS, output and render resolution, anisotropic filtering, VSync, fullscreen), stored in the same
  `n3.toml` the game reads, with a backup.
- **Source management**: identifies the PAL, Japanese and UNDUB editions by signature (ISO or folder); imports the PAL ISO; exports the voices.
- **Game window branding**: title, icon and caption colours (or no caption).
- A Spanish (Spain) interface with a custom "liquid glass" design, shipping DONELYS ENTRETENIMIENTO's cover and background (replaceable).

### Requirements

Windows 10/11 x64 · a Direct3D 12 GPU · [N3 Recompiled `v0.1.0-alpha.12`](https://github.com/WK2D/N3-Ninety-Nine-Nights-Recomp/releases) · your own
**PAL/Europe** copy of *N3* (ISO or extracted folder). Optional: Japanese ISO or UNDUB for the voices.

### Quick start

1. Download N3 Recompiled and unzip it into a folder.
2. Download the launcher `.zip` from [Releases](../../releases) and extract the `DONELYS-N3` folder **inside the N3 Recompiled folder** (next to `n3.exe`).
3. Run `DONELYS-N3\DONELYS N3.exe`. In *Fuentes* (Sources) add your PAL ISO or folder. In *Ajustes* (Settings) choose language, voices and graphics. Press **JUGAR** (Play).

See [docs/en/installation.md](docs/en/installation.md).

### Status

| Item | Status |
|---|---|
| ES/FR/DE/IT text with the PAL folder untouched | Verified in game |
| Japanese voices loaded from the profile | Verified (data in memory; audio by the author) |
| Graphics settings written to / read from `n3.toml` | Automated tests + real launch with the profile |
| Japanese text on the PAL edition | **Not feasible** (tested) — see [limitations](docs/en/limitations.md) |
| UNDUB as a standalone edition | **Not feasible** with the current recompilation |

### Tested on

AMD Ryzen 7 9800X3D · NVIDIA GeForce RTX 5090 · 64 GB RAM · Windows 11 · GIGABYTE GS27Q monitor (2560×1440). Other systems have not been validated.

---

## Créditos y licencia · Credits and license

© 2026 Donelys Entretenimiento — [GPL-3.0-or-later](LICENSE). Créditos y avisos de terceros: [CREDITS.md](CREDITS.md), [NOTICE.md](NOTICE.md),
[TRADEMARKS.md](TRADEMARKS.md). Contribuir: [CONTRIBUTING.md](CONTRIBUTING.md). Seguridad: [SECURITY.md](SECURITY.md).
