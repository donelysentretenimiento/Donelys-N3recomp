# Gráficos y menú del juego (F4)

## Opciones que ofrece el launcher

Son las del menú *Graphics* del propio juego, y se guardan en el mismo archivo (`n3.toml`), así que el launcher y el juego siempre ven lo mismo.

| Opción | Valores | Clave en `n3.toml` | Nota |
|---|---|---|---|
| Fotogramas por segundo | 30 · 40 · 60 | `n3_frame_rate` | 30 es el original. 40 y 60 son **experimentales** (animaciones aceleradas posibles: es temporización interna, no falta de potencia) |
| Resolución de salida | 720p · 1080p · 1440p · 4K | `n3_display_resolution` | Tamaño de la ventana. En pantalla completa se usa la resolución de la pantalla donde se abre |
| Resolución de renderizado | 1× · 2× · 3× sobre 720p | `resolution_scale` (+ `draw_resolution_scale_x/y`) | 3× = 4K interno |
| Filtrado anisotrópico | 1× · 2× · 4× · 8× · 16× | `anisotropic_override` = 0, 2, 3, 4, 5 | |
| Sincronización vertical | sí · no | `n3_vsync` | Solo afecta a la presentación en Windows, no al ritmo del juego |
| Pantalla completa | sí · no | `fullscreen` | |

Perfil de ejemplo («Aplicar este perfil»): 60 FPS · salida 1440p · render 4K · anisotrópico 16× · VSync · pantalla completa.
No cambia la frecuencia de actualización de Windows.

### Ventana

En modo ventana, *Barra de la marca* (título «DONELYS N3», icono propio y colores del launcher) o *Sin barra*. En pantalla completa no hay barra.

### Qué está comprobado y qué no

- Comprobado: las claves se escriben y se leen correctamente (pruebas automáticas); con `fullscreen = true` el juego abre sin barra, a pantalla completa en la
  pantalla principal y registra `N3 frame-rate target: 60`.
- Sin confirmación por registro: el efecto de VSync, anisotrópico y escala de render. El proyecto original los verifica con una auditoría de depuración.

## Menú de ajustes dentro del juego

El SDK de ReXGlue incluye un menú de ajustes en pantalla (`settings_overlay`): **F4** durante la partida. Muestra todas las variables registradas y marca cada
una como *live* (se aplica al momento) o *restart* (necesita reiniciar), y guarda en el mismo `n3.toml`. Otros atajos del SDK: **F3** contador de
rendimiento, **`** (tecla de acento grave) consola, **F7** logros.

Los atajos son variables de texto (`bind_settings = "F4"`, `bind_debug_overlay`, `bind_console`, `bind_achievements`), por lo que se pueden reasignar
en `n3.toml` sin recompilar. Este launcher todavía no ofrece esa reasignación.

El aspecto de ese menú (colores de ImGui) es el del SDK. Cambiarlo requiere modificar el recompilador (punto de extensión `OnConfigureStyle`); está
previsto en la hoja de ruta de [`DONELYS.md`](../../../DONELYS.md).
