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
- **Comprobado en el juego real (ventana de 1080p, perfil aislado):** F5 abre el menú; elegir «Español» lo aplica; «Guardar» escribe `n3_text_language = 'spanish'` en `n3.toml`; Esc lo cierra; al reiniciar con ese perfil los textos salen en español con acentos («Cámara», «Vibración», «Sí»). / **Checked in the real game:** F5 opens, Spanish applies, Save writes `n3_text_language`, Esc closes, and after a restart the game text is Spanish with accents.
- **El teclado también llega al juego con el menú abierto** (con flechas se movió la selección del menú del juego). El SDK no marca las teclas como consumidas, ni en F4 ni en este menú. Abre el menú donde un toque de tecla no importe. / **Keyboard also reaches the game while the menu is open** (arrow keys moved the game's own menu selection); the SDK never marks keys as handled, in F4 or here.
- **No comprobado:** la pantalla completa desde el menú en el juego real, y los clics de ratón en una sesión automática (en una sesión funcionaron y en otra no; con mando no hay soporte). La selección por clics y teclas simuladas sí está cubierta por la prueba sin cabeza. / **Not checked:** fullscreen from the menu in the real game, and automated mouse clicks (worked in one session, not in another); no gamepad support. Clicks and keys are covered by the headless test.
### Perfiles y diagnóstico de rendimiento / Profiles and performance diagnostics
- El menú F5 (pestaña Gráficos) trae **Rendimiento** (60 FPS, 2×, 1080p, escala 1×, VSync) y **Calidad** (60 FPS, 16×, 1440p, escala 3×, VSync). **Deshacer** devuelve los valores que tenías antes del primer perfil. No se afirma ninguna mejora medida. / The F5 menu (Graphics tab) offers **Rendimiento** and **Calidad** presets; **Deshacer** restores your values from before the first preset. No measured gain is claimed.
- `n3_pacing_probe` (no abre el juego) mide con la misma espera que el limitador de FPS (`PacePresent`). En el equipo de pruebas, con el temporizador del sistema a 0,5 ms: 29,98 / 39,94 / 59,87 FPS para objetivos de 30 / 40 / 60. El limitador **no** explica por sí solo una lentitud en esa máquina; con un temporizador de 15,6 ms podría. / `n3_pacing_probe` (does not start the game) measures with the same wait as the frame limiter; on the test machine, with the system timer at 0.5 ms, it holds 29.98 / 39.94 / 59.87 FPS for 30 / 40 / 60 targets, so the limiter alone does not explain slowness there.
- Para medir de verdad (requiere abrir el juego, con permiso del usuario): `frame_pacing_trace = true` registra presentaciones cada 2 s; comparar la misma escena con «Rendimiento» y «Calidad». Con 40/60 FPS el reloj del juego avanza un paso fijo por fotograma, así que una caída de FPS se nota como cámara lenta. / To measure for real (needs the game open, with the user's permission): `frame_pacing_trace = true` logs presentations every 2 s; compare the same scene under both presets. At 40/60 FPS the game clock advances a fixed step per frame, so an FPS drop looks like slow motion.

### Medición real (menú principal) / Measured (main menu)
Equipo de pruebas: Ryzen 7 9800X3D · RTX 5090 · pantalla completa, 60 FPS, 16×, salida 1440p, VSync, 65 s por arranque, orden 3×, 1×, 2×, 3×. / Test machine as above; 65 s per start, order 3×, 1×, 2×, 3×.

| Arranque / Start | Escala / Scale | FPS medio tras 30 s / mean FPS after 30 s | Peor ventana / worst 2 s window | Fotograma máx. / max frame |
|---|---|---|---|---|
| 1.º | 3× | 57,1 | 30,0 | 151 ms |
| 2.º | 1× | 59,9 | 58,3 | 50 ms |
| 3.º | 2× | 59,9 | 59,1 | 47 ms |
| 4.º | 3× | 60,0 | 60,0 | 18 ms |

- **La escala de render no explica los tirones en el menú:** el mismo 3× fue malo en el primer arranque y perfecto en el cuarto. Lo que cambia es el orden: el primer arranque va con caché de disco/shaders en frío. / **Render scale does not explain the hitches in the menu**: the same 3× was poor on the first start and perfect on the fourth; the first start runs with a cold disk/shader cache.
- Los primeros ~25 s a unos 30 FPS son las películas de introducción, en todos los arranques. / The first ~25 s at ~30 FPS are the intro movies in every start.
- Un tirón de ~580 ms coincidió con la detección del mando (SDL JoystickAdded). / One ~580 ms hitch coincided with the controller being detected.
- No se midió combate ni misiones: la lentitud percibida en juego sigue sin explicar. Se registra con `frame_pacing_trace = true`. / Combat and missions were not measured; the perceived in-game slowness remains unexplained.
