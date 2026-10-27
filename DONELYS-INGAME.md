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
| Panel técnico del SDK (**F4**, sin cambios de tecla) con la paleta del launcher: negro, carmesí, dorado y perla; avisos y consola con los mismos colores | `src/donelys_theme.cpp`, `src/donelys_palette.h` | Siempre activo |
| **Menú DONELYS (F5)**: pestañas Idioma, Gráficos y Ventana; los gráficos se aplican al momento y «Guardar» escribe `n3.toml`. Idioma y sin borde piden reiniciar. Teclado y ratón; **sin mando** | `src/donelys_menu*.{h,cpp}` | `bind_donelys_menu` en `n3.toml` |
| Idioma de los textos sin DLL parcheada (gancho en el manifiesto) | `src/language_hook.cpp`, `n3_manifest.toml` | `n3_text_language` (`english`, `german`, `french`, `spanish`, `italian`) |
| Título de ventana «DONELYS N3», colores de la barra (modo oscuro, borde carmesí, texto dorado) | `src/donelys_window.cpp` | `n3_window_title` |
| Modo sin borde en ventana, conservando el tamaño de cliente exacto | `src/donelys_window.cpp` | `n3_borderless = true` (por defecto desactivado) |
| Icono propio en el ejecutable y la barra de tareas | `resources/donelys.ico`, `resources/n3.rc.in` | — |
| Valores por defecto: pantalla completa, 60 FPS, anisotrópico 5, escala de render 3, salida 1440, VSync | `src/donelys_defaults.h` | `n3_donelys_defaults = false` los desactiva |

Los valores por defecto **solo se escriben si el usuario no los ha definido** (ni en `n3.toml`, ni por línea de
comandos, ni por entorno). Las cvars de GPU no existen al empezar, por eso se aplican en dos pasadas.

### Pruebas
- Nativas (`ctest`, 50/50): `donelys_menu_view` maneja el menú con ImGui sin cabeza y entradas simuladas (idioma, 5 ajustes gráficos, valor rechazado, pantalla completa, sin borde, Guardar real y fallido, Esc), `donelys_menu` (el menú solo ofrece valores que el juego acepta), `text_language`, `donelys_palette` (contraste WCAG: texto y dorado ≥ 7:1,
  avisos ≥ 4,5:1), `donelys_window` (bits de estilo y orden de bytes de COLORREF), `donelys_defaults`
  (cada valor es aceptado por el juego y nunca pisa los del usuario).
- En el juego compilado, con la carpeta PAL real y un perfil temporal: el menú F5 se abre, con acentos correctos, cambia de pestaña con el ratón y aplica un cambio de resolución en vivo (según el registro); antes se comprobó el tema
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
| SDK technical panel (**F4**, key unchanged) themed with the launcher palette: black, crimson, gold, pearl; toasts and console recoloured to match | `src/donelys_theme.cpp`, `src/donelys_palette.h` | Always on |
| **DONELYS menu (F5)**: Language, Graphics and Window tabs; graphics apply instantly and "Guardar" writes `n3.toml`. Language and borderless need a restart. Keyboard and mouse; **no gamepad** | `src/donelys_menu*.{h,cpp}` | `bind_donelys_menu` in `n3.toml` |
| Text language without a patched DLL (manifest hook) | `src/language_hook.cpp`, `n3_manifest.toml` | `n3_text_language` (`english`, `german`, `french`, `spanish`, `italian`) |
| Window title "DONELYS N3", caption colours (dark mode, crimson border, gold text) | `src/donelys_window.cpp` | `n3_window_title` |
| Borderless windowed mode, keeping the exact client size | `src/donelys_window.cpp` | `n3_borderless = true` (off by default) |
| Own icon on the executable and taskbar | `resources/donelys.ico`, `resources/n3.rc.in` | — |
| Defaults: fullscreen, 60 FPS, anisotropic 5, render scale 3, 1440 output, VSync | `src/donelys_defaults.h` | `n3_donelys_defaults = false` turns them off |

Defaults are written **only when the user has not set the value** (config file, command line or environment).
GPU cvars do not exist at start-up, hence the two passes.

### Tests
- Native (`ctest`, 50/50): `donelys_menu_view` drives the menu with headless ImGui and simulated input (language, 5 graphics settings, refused value, fullscreen, borderless, real and failed saves, Esc), `donelys_menu` (the menu only offers values the game accepts), `text_language`, `donelys_palette` (WCAG contrast: text and gold ≥ 7:1, status
  colours ≥ 4.5:1), `donelys_window` (style bits, COLORREF byte order), `donelys_defaults` (every value is
  accepted by the game; user values are never overwritten).
- On the compiled game with the real PAL folder and a temporary profile: the F5 menu opens with correct accents, switches tabs with the mouse and applies a live resolution change (per the log); earlier the theme was checked (screenshot
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

### Límites conocidos / Known limits
- `fullscreen` se guarda siempre que el usuario lo haya fijado, aunque coincida con el valor por defecto del SDK (cambio localizado en `src/profile_config.cpp`, con prueba). / `fullscreen` is always saved when the user set it, even if it equals the SDK default (localized change in `src/profile_config.cpp`, tested).
- No comprobado dentro del juego: el botón Guardar, el cambio de idioma tras reiniciar, cerrar con Esc/F5 y la pantalla completa; el menú no se ha probado con mando ni se ha demostrado que no deje pasar entradas al juego. / Not checked in the game: Save, language after restart, closing with Esc/F5 and fullscreen; the menu was not tested with a gamepad and passing no input through to the game is unproven.

### Perfiles y diagnóstico de rendimiento / Profiles and performance diagnostics
- El menú F5 (pestaña Gráficos) trae **Rendimiento** (60 FPS, 2×, 1080p, escala 1×, VSync) y **Calidad** (60 FPS, 16×, 1440p, escala 3×, VSync). **Deshacer** devuelve los valores que tenías antes del primer perfil. No se afirma ninguna mejora medida. / The F5 menu (Graphics tab) offers **Rendimiento** and **Calidad** presets; **Deshacer** restores your values from before the first preset. No measured gain is claimed.
- `n3_pacing_probe` (no abre el juego) mide con la misma espera que el limitador de FPS (`PacePresent`). En el equipo de pruebas, con el temporizador del sistema a 0,5 ms: 29,98 / 39,94 / 59,87 FPS para objetivos de 30 / 40 / 60. El limitador **no** explica por sí solo una lentitud en esa máquina; con un temporizador de 15,6 ms podría. / `n3_pacing_probe` (does not start the game) measures with the same wait as the frame limiter; on the test machine, with the system timer at 0.5 ms, it holds 29.98 / 39.94 / 59.87 FPS for 30 / 40 / 60 targets, so the limiter alone does not explain slowness there.
- Para medir de verdad (requiere abrir el juego, con permiso del usuario): `frame_pacing_trace = true` registra presentaciones cada 2 s; comparar la misma escena con «Rendimiento» y «Calidad». Con 40/60 FPS el reloj del juego avanza un paso fijo por fotograma, así que una caída de FPS se nota como cámara lenta. / To measure for real (needs the game open, with the user's permission): `frame_pacing_trace = true` logs presentations every 2 s; compare the same scene under both presets. At 40/60 FPS the game clock advances a fixed step per frame, so an FPS drop looks like slow motion.

### Medición real (menú principal, 50 s por prueba) / Measured (main menu, 50 s each)
Equipo de pruebas: Ryzen 7 9800X3D · RTX 5090 · pantalla completa, 60 FPS, 16×, salida 1440p, VSync. / Test machine as above.

| Escala de render / Render scale | FPS por ventana de 2 s / FPS per 2 s window | Fotograma máx. / Max frame |
|---|---|---|
| 3× (4K interno) | 54,8 – 60,0 | 108 – 190 ms |
| 1× | 58,3 – 60,0 | 23 – 49 ms |

- Casi siempre se sostienen 60 FPS en ambos casos; el fallo son **tirones puntuales**, mayores con 3×. Con 40/60 FPS el reloj del juego avanza un paso fijo por fotograma, así que un tirón o una caída se ven como cámara lenta. / Both hold 60 FPS most of the time; the problem is occasional **hitches**, larger at 3×.
- Solo se midió el menú principal, no el combate: no se puede extrapolar. La causa de los tirones (compilación de shaders/pipelines, carga de recursos o cambio de escena) **no está demostrada**. / Only the main menu was measured, not combat. The cause of the hitches is not proven.
- Se registran con `frame_pacing_trace = true` (media, P95, P99, máximo, tirones y escala efectiva). / Logged with `frame_pacing_trace = true`.
