# Limitaciones conocidas

Lo que **no** funciona o **no se ha verificado**, dicho sin adornos.

## No viable (probado)

- **Texto japonés sobre la edición PAL.** Se probó con el idioma declarado como japonés y las carpetas `JPN` de la ISO japonesa añadidas al perfil: el
  ejecutable PAL sigue cargando `text\ENG`, `interface\Local\ENG` y `Font_0_ENG` (trata el japonés como inglés) y muestra el menú en inglés. Además la ISO
  japonesa no trae tablas de fuente propias para japonés. Jugar en japonés exige **recompilar el ejecutable japonés**, algo que corresponde a N3 Recompiled.
- **UNDUB como edición independiente.** Su ejecutable no es el PAL (véase [compatibilidad](compatibilidad.md)).
- **Voces dentro de las películas (`.bik`).** Las de la ISO japonesa difieren de las PAL; no se sabe si llevan subtítulos incrustados ni su sincronía, así que
  no se ofrecen.

## Dependencias de versión

- El selector de idioma solo se aplica al `rexruntime.dll` de `N3 Recompiled v0.1.0-alpha.12`. Con otra versión el launcher lo rechaza en lugar de parchear
  a ciegas (la excepción segura es que el idioma inglés sigue funcionando siempre).
- Las comprobaciones de edición usan los SHA-256 de la tabla de [compatibilidad](compatibilidad.md).

## Sin verificar

- Todas las misiones con voces japonesas. Se ha oído el audio en el juego, pero el banco `mission_4_voice_vigkvagk` (45 voces en japonés, 46 en PAL) merece
  atención especial.
- VSync, anisotrópico y escala de render: se escriben y leen bien, pero el juego no deja una línea de registro que lo confirme.
- 40 y 60 FPS: el proyecto original avisa de animaciones aceleradas; no se ha medido.
- Equipos distintos al de pruebas (véase el [README](../../README.md)).

## Del lado del launcher

- La imagen del ejecutable (propiedades de `DONELYS N3.exe`) sigue siendo la de Electron; el icono y el título que ves en ventanas y barra de tareas sí
  son los propios.
- La interfaz está en español de España; no hay selector de idioma de la propia aplicación.
