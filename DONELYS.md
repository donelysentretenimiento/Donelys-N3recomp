# DONELYS ENTRETENIMIENTO · N3 Recomp

[Español](#español) · [English](#english)

## Español

Este repositorio es un *fork* de [N3 Recompiled](https://github.com/WK2D/N3-Ninety-Nine-Nights-Recomp) (WK2D). La rama **`donelys-launcher`** añade trabajo
propio **sin modificar ningún archivo del proyecto original**:

| Ruta | Qué es | Licencia |
|---|---|---|
| [`launcher/`](launcher/README.md) | DONELYS N3 Launcher: idioma real de los textos, voces japonesas, ajustes gráficos, gestión de ediciones, imagen propia | GPL-3.0-or-later (© 2026 Donelys Entretenimiento) |
| `DONELYS.md` y `launcher/docs/` | Esta documentación | GPL-3.0-or-later |
| Todo lo demás | Código y documentación de N3 Recompiled, de WK2D | **Sin licencia declarada por su autor**: todos los derechos son suyos; aquí solo está por el *fork* de GitHub |

### Política de publicación

- `main` refleja el proyecto original. El trabajo propio vive en ramas aparte.
- Como el proyecto original no declara licencia, **este repositorio no publica binarios compilados de su código** ni los redistribuye. Las *releases* contienen
  únicamente el launcher, que funciona junto a la release que el usuario descarga de su autor.
- No se publica ningún archivo del juego, ni imágenes de disco, ni claves, ni código generado a partir del juego.

### Hoja de ruta (aún no implementado)

Pensado para una segunda fase, cuando haya una toolchain local y se pueda compilar y probar cada cambio:

1. Vestir el menú F4 del SDK con la paleta del launcher (`OnConfigureStyle`).
2. Modo sin borde y título/icono propios dentro del juego, sin ayudante externo.
3. Selector de idioma de los textos dentro del recompilador (leer `user_language` u opción propia), para eliminar la copia parcheada de `rexruntime.dll`.
4. Valores por defecto propios (pantalla completa, VSync, 60 FPS, 16×) y reasignación de atajos (F5).

Cualquier cambio sobre el código original se propondría primero a su autor.

## English

This repository is a *fork* of [N3 Recompiled](https://github.com/WK2D/N3-Ninety-Nine-Nights-Recomp) (by WK2D). The **`donelys-launcher`** branch adds original work **without
modifying any file of the upstream project**:

| Path | What it is | License |
|---|---|---|
| [`launcher/`](launcher/README.md) | DONELYS N3 Launcher: real text language, Japanese voices, graphics settings, edition management, custom artwork | GPL-3.0-or-later (© 2026 Donelys Entretenimiento) |
| `DONELYS.md` and `launcher/docs/` | This documentation | GPL-3.0-or-later |
| Everything else | N3 Recompiled's code and documentation, by WK2D | **No license declared by its author**: all rights are theirs; it is only here because of the GitHub fork |

### Publishing policy

- `main` mirrors the upstream project. Original work lives on separate branches.
- Because upstream declares no license, **this repository does not publish compiled binaries of its code** nor redistribute them. Releases contain only the launcher, which
  runs alongside the release the user downloads from its author.
- No game files, disc images, keys or code generated from the game are published.

### Roadmap (not implemented yet)

Meant for a second phase, once a local toolchain exists and every change can be built and tested:

1. Theme the SDK's F4 menu with the launcher palette (`OnConfigureStyle`).
2. Borderless mode and own title/icon inside the game, without an external helper.
3. A text-language selector inside the recompilation (read `user_language` or an option of its own), removing the patched `rexruntime.dll` copy.
4. Own defaults (fullscreen, VSync, 60 FPS, 16×) and hotkey reassignment (F5).

Any change to upstream code would be proposed to its author first.
