# Avisos de terceros · Third-party notices

El código propio de este directorio (`launcher/`) se distribuye bajo **GPL-3.0-or-later** (ver [LICENSE](LICENSE)),
© 2026 Donelys Entretenimiento. Los componentes de terceros conservan sus propias licencias.

The original code in this directory (`launcher/`) is distributed under **GPL-3.0-or-later** (see [LICENSE](LICENSE)),
© 2026 Donelys Entretenimiento. Third-party components keep their own licenses.

| Componente · Component | Uso · Use | Licencia · License |
|---|---|---|
| [Electron](https://www.electronjs.org/) 33.x | Runtime de la aplicación de escritorio, incluido en la release · desktop runtime, bundled in the release | MIT (`LICENSE` y `LICENSES.chromium.html` van dentro del paquete · shipped inside the package) |
| [Chromium](https://www.chromium.org/) y sus dependencias · and its dependencies | Motor de renderizado de Electron · Electron's rendering engine | Licencias diversas en `LICENSES.chromium.html` · various, see `LICENSES.chromium.html` |
| [Cinzel](https://github.com/NDISCOVER/Cinzel) | Tipografía de títulos · display typeface | SIL OFL 1.1 — [`app/ui/fonts/OFL-Cinzel.txt`](app/ui/fonts/OFL-Cinzel.txt) |
| [Cormorant Garamond](https://github.com/CatharsisFonts/Cormorant) | Tipografía de texto · text typeface | SIL OFL 1.1 — [`app/ui/fonts/OFL-CormorantGaramond.txt`](app/ui/fonts/OFL-CormorantGaramond.txt) |

## Proyectos con los que interactúa (no incluidos) · Projects it interacts with (not included)

El launcher **no contiene ni redistribuye** código ni binarios de estos proyectos; los usa tal como los instala el usuario.
The launcher **does not contain or redistribute** code or binaries of these projects; it uses them as installed by the user.

- **N3 Recompiled**, por / by WK2D — <https://github.com/WK2D/N3-Ninety-Nine-Nights-Recomp>. Es el recompilador al que este launcher da servicio. Las versiones verificadas son la `v0.1.0-alpha.12`. · The recompilation this launcher serves; verified against `v0.1.0-alpha.12`.
- **ReXGlue SDK**, © 2026 Tom Clay, BSD 3-Clause, derivado en parte de Xenia (© Ben Vanik y colaboradores, BSD) — <https://github.com/rexglue/rexglue-sdk>. Para la comprobación de versión se lee el `rexruntime.dll` del propio usuario. · Used only through the user's own `rexruntime.dll`.

## Marcas · Trademarks

Véase [TRADEMARKS.md](TRADEMARKS.md). · See [TRADEMARKS.md](TRADEMARKS.md).
