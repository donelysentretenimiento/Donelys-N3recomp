# DONELYS N3 · ajustes dentro del juego / in-game changes

Rama `donelys-ingame-ui`. Cambios pequeños sobre el código de N3 Recompiled para que el juego compilado
comparta la imagen del launcher DONELYS. Todo lo nuevo está en ficheros `donelys_*` y en cuatro llamadas
de `src/n3_app.h`; nada del resto del proyecto se ha reescrito.

*Branch `donelys-ingame-ui`. Small changes on top of N3 Recompiled so the compiled game shares the DONELYS
launcher look. Everything new lives in `donelys_*` files plus four calls in `src/n3_app.h`.*

## Español

### Qué cambia
| Cambio | Dónde | Cómo se controla |
|---|---|---|
| Menú de ajustes del SDK (antes F4) con la paleta del launcher: negro, carmesí, dorado y perla; avisos y consola con los mismos colores | `src/donelys_theme.cpp`, `src/donelys_palette.h` | Siempre activo |
| Tecla del menú de ajustes: **F5** (el SDK trae F4) | `src/donelys_defaults.cpp` | `bind_settings` en `n3.toml`; si ya está definida, se respeta |
| Título de ventana «DONELYS N3», colores de la barra (modo oscuro, borde carmesí, texto dorado) | `src/donelys_window.cpp` | `n3_window_title` |
| Modo sin borde en ventana, conservando el tamaño de cliente exacto | `src/donelys_window.cpp` | `n3_borderless = true` (por defecto desactivado) |
| Icono propio en el ejecutable y la barra de tareas | `resources/donelys.ico`, `resources/n3.rc.in` | — |
| Valores por defecto: pantalla completa, 60 FPS, anisotrópico 5, escala de render 3, salida 1440, VSync | `src/donelys_defaults.h` | `n3_donelys_defaults = false` los desactiva |

Los valores por defecto **solo se escriben si el usuario no los ha definido** (ni en `n3.toml`, ni por línea de
comandos, ni por entorno). Las cvars de GPU no existen al empezar, por eso se aplican en dos pasadas.

### Pruebas
- Nativas (`ctest`, 47/47 con las 44 anteriores): `donelys_palette` (contraste WCAG: texto y dorado ≥ 7:1,
  avisos ≥ 4,5:1), `donelys_window` (bits de estilo y orden de bytes de COLORREF), `donelys_defaults`
  (cada valor es aceptado por el juego y nunca pisa los del usuario).
- En el juego compilado, con la carpeta PAL real y un perfil temporal: el menú F5 se abre con el tema
  (captura comprobada), ventana de 2560×1440 sin barra y título «DONELYS N3» con `n3_borderless = true`, y
  con perfil vacío los 8 valores quedan aplicados y arranca a pantalla completa.

### Sin verificar
- El efecto visual de anisotrópico y escala de render (se aceptan, pero el juego no deja traza).
- Activar o desactivar el modo sin borde con la ventana ya abierta (solo se aplica al arrancar, y no en pantalla completa).
- Equipos distintos del de pruebas: AMD Ryzen 7 9800X3D · NVIDIA GeForce RTX 5090 · 64 GB · Windows 11.

### Licencia y compilados
Los ficheros `donelys_*` y esta guía son GPL-3.0-or-later (© Donelys Entretenimiento). El código base de
N3 Recompiled no declara licencia: **no se publican binarios compilados** de esta rama. El icono es arte de
Donelys Entretenimiento, todos los derechos reservados.

## English

### What changes
| Change | Where | Control |
|---|---|---|
| SDK settings overlay (formerly F4) themed with the launcher palette: black, crimson, gold, pearl; toasts and console recoloured to match | `src/donelys_theme.cpp`, `src/donelys_palette.h` | Always on |
| Settings overlay key: **F5** (the SDK ships F4) | `src/donelys_defaults.cpp` | `bind_settings` in `n3.toml`; an existing value is kept |
| Window title "DONELYS N3", caption colours (dark mode, crimson border, gold text) | `src/donelys_window.cpp` | `n3_window_title` |
| Borderless windowed mode, keeping the exact client size | `src/donelys_window.cpp` | `n3_borderless = true` (off by default) |
| Own icon on the executable and taskbar | `resources/donelys.ico`, `resources/n3.rc.in` | — |
| Defaults: fullscreen, 60 FPS, anisotropic 5, render scale 3, 1440 output, VSync | `src/donelys_defaults.h` | `n3_donelys_defaults = false` turns them off |

Defaults are written **only when the user has not set the value** (config file, command line or environment).
GPU cvars do not exist at start-up, hence the two passes.

### Tests
- Native (`ctest`, 47/47 including the previous 44): `donelys_palette` (WCAG contrast: text and gold ≥ 7:1, status
  colours ≥ 4.5:1), `donelys_window` (style bits, COLORREF byte order), `donelys_defaults` (every value is
  accepted by the game; user values are never overwritten).
- On the compiled game with the real PAL folder and a temporary profile: the F5 overlay opens themed (screenshot
  checked); a 2560×1440 borderless window titled "DONELYS N3" with `n3_borderless = true`; with an empty profile
  all 8 defaults are applied and it starts fullscreen.

### Not verified
- The visible effect of anisotropic filtering and render scale (accepted, but the game leaves no trace).
- Toggling borderless on an open window (start-up only, and not while fullscreen).
- Systems other than the test machine: AMD Ryzen 7 9800X3D · NVIDIA GeForce RTX 5090 · 64 GB · Windows 11.

### Licence and builds
`donelys_*` files and this guide are GPL-3.0-or-later (© Donelys Entretenimiento). The N3 Recompiled base code
declares no licence, so **no compiled binaries of this branch are published**. The icon is Donelys
Entretenimiento artwork, all rights reserved.
