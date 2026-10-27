# Avisos de terceros y licencias por componente · Third-party notices and per-component licenses

**Este paquete NO es GPL en su conjunto.** Solo los módulos propios de Donelys Entretenimiento lo son; el resto conserva su licencia, o su ausencia de licencia, como se indica.
**This package is NOT GPL as a whole.** Only Donelys Entretenimiento's own modules are; everything else keeps its own license, or lack of one, as stated.

> Las rutas de la columna «Dónde» son las del ZIP portátil (carpeta `LICENSES`); en este repositorio, véanse `LICENSES/` y `launcher/`. · The paths in the "Where" column are those of the portable ZIP (`LICENSES` folder); in this repository see `LICENSES/` and `launcher/`.

| Componente · Component | Autor · Author | Licencia · License | Dónde · Where |
|---|---|---|---|
| Menú DONELYS, idioma integrado, perfiles, diagnóstico, launcher (código propio) · DONELYS menu, built-in language, presets, diagnostics, launcher (own code) | Donelys Entretenimiento | GPL-3.0-or-later | `LICENSES/GPL-3.0-DONELYS.txt`; fuentes en las ramas `donelys-menu` y `donelys-launcher` |
| **N3 Recompiled** (`n3.exe`, `n3_import.exe`): base del recompilador · base recompiler | WK2D | **Sin licencia declarada** · **No license declared** | <https://github.com/WK2D/N3-Ninety-Nine-Nights-Recomp>. Se redistribuye bajo responsabilidad de Donelys Entretenimiento y se retirará si su autor lo solicita · Redistributed on Donelys Entretenimiento's responsibility; will be withdrawn if the author asks |
| Código del juego traducido a C++ dentro de `n3.exe` · Game code translated to C++ inside `n3.exe` | *N3: Ninety-Nine Nights* © Q Entertainment / Microsoft Game Studios y titulares · and rights holders | Todos los derechos reservados · All rights reserved | Igual que la release oficial de WK2D. No afiliado · Same as WK2D's official release. Not affiliated |
| ReXGlue SDK (`rexruntimerd.dll`, `rexgpu-xenosrd.dll`) | Tom Clay y colaboradores · and contributors; parte derivado de Xenia (Ben Vanik y colaboradores) | BSD 3-Clause | `LICENSES/ReXGlue-SDK-BSD-3-Clause.txt`, `LICENSES/rexglue-sdk-thirdparty`, `LICENSES/rexglue-sdk-tools` |
| Tracy (`TracyClientrd.dll`) | Bartosz Taudul | BSD 3-Clause | `LICENSES/rexglue-sdk-thirdparty` |
| Dear ImGui, toml++, SDL3 (enlazados en el SDK) · linked through the SDK | Omar Cornut; Mark Gillard; Sam Lantinga | MIT / zlib | `LICENSES/rexglue-sdk-thirdparty` |
| Runtime de Visual C++ (`vcruntime140*.dll`, `msvcp140*.dll`, `concrt140.dll`, `vccorlib140.dll`) | Microsoft | Redistribuible de Microsoft · Microsoft redistributable | `LICENSES/Microsoft-VC-runtime.txt` |
| Electron y Chromium (`DONELYS-N3/DONELYS N3.exe` y bibliotecas) | OpenJS Foundation / Google y colaboradores | MIT y las de Chromium · MIT and Chromium's | `LICENSES/Electron-MIT.txt`, `LICENSES/Chromium-licenses.html` |
| Cinzel | Natanael Gama / Ndiscover | SIL OFL 1.1 | `LICENSES/OFL-Cinzel.txt` |
| Cormorant Garamond | Christian Thalmann / Catharsis Fonts | SIL OFL 1.1 | `LICENSES/OFL-CormorantGaramond.txt` |
| Icono, portada y fondo del launcher · Launcher icon, cover and background | Donelys Entretenimiento | Todos los derechos reservados (no GPL) · All rights reserved (not GPL) | `DONELYS-N3/resources/app/ui` |

## No incluido · Not included
ISO, `default.xex` originales, bancos de audio, traducciones o textos extraídos del juego, claves de terceros, y datos personales.
ISOs, original `default.xex`, audio banks, text or translations extracted from the game, third-party keys, and personal data.

## Comprobación · Check
`MANIFEST-SHA256.txt` lista cada archivo con su SHA-256. La auditoría automática previa a la publicación comprobó que no hay archivos de recursos del juego (`.iso`, `.xex`, `.xwb`, `.xsb`, `.bik`) ni cadenas de datos personales o rutas locales.
`MANIFEST-SHA256.txt` lists every file with its SHA-256. The automated pre-release audit checked there are no game resource files (`.iso`, `.xex`, `.xwb`, `.xsb`, `.bik`) and no personal-data strings or local paths.
