# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versionado: `MAJOR.MINOR.PATCH` con sufijo de canal.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: `MAJOR.MINOR.PATCH` with a channel suffix.

## [0.2.0] — preview 1

### Añadido · Added
- Reconoce la compilación DONELYS del juego (`DONELYS-BUILD.json` junto a `n3.exe`): el idioma de los textos se escribe en `n3.toml` (`n3_text_language`) y no se parchea ninguna DLL. · Recognises the DONELYS game build: the text language is written to `n3.toml` and no DLL is patched.
- Prueba automática de ese modo. · Automated test for that mode.

## [0.1.1] — preview 1

### Añadido · Added
- Portada, fondo e icono de DONELYS ENTRETENIMIENTO incluidos por defecto en la aplicación; la imagen del usuario sigue teniendo prioridad. · Default cover, background and icon bundled; the user's image still takes priority.
- Prueba automática de ese comportamiento. · Automated test for that behaviour.

## [0.1.0] — preview 1

### Añadido · Added
- Reconocimiento de ediciones por SHA-256 y cabecera XEX (PAL v0.0.0.3, Japón v0.0.0.1, UNDUB v0.0.0.4), desde ISO o carpeta. · Edition recognition by SHA-256 and XEX header, from ISO or folder.
- Lector propio de ISO Xbox 360 (XDVDFS), de solo lectura, con pruebas contra los listados de referencia. · Own read-only Xbox 360 (XDVDFS) disc reader.
- Selección real del idioma de los textos (ENG/FRA/GER/ITA/SPA) mediante una copia local de `rexruntime.dll`; no modifica el original ni los datos. · Real text-language selection via a local copy of `rexruntime.dll`; the original and the data stay untouched.
- Voces japonesas: extracción única a caché, validación XACT frente a la base PAL y perfil de enlaces duros. · Japanese voices: one-time cache extraction, XACT validation against the PAL base and a hard-link profile.
- Ajustes gráficos reales con escritura atómica y copia de seguridad de `n3.toml`. · Real graphics settings with atomic writes and a backup of `n3.toml`.
- Importación de la ISO PAL en un hilo aparte, exportación de voces y registro del juego. · PAL ISO import on a worker thread, voice export and the game log.
- Imagen de la ventana del juego (título, icono, colores de barra o sin barra). · Game-window branding.
- Interfaz de escritorio sin marco de Electron, con portada y fondo propios del usuario. · Frameless desktop UI with user-supplied cover and background.
- Pruebas automáticas (`node test/selftest.mjs`). · Automated tests.

### Conocido · Known
- Texto japonés sobre la edición PAL y UNDUB independiente: no viables (ver `docs/`). · Japanese text on PAL and standalone UNDUB: not feasible.
- El parche de idioma solo se aplica al `rexruntime.dll` de `v0.1.0-alpha.12`; con otra versión se rechaza. · The language patch only applies to the `v0.1.0-alpha.12` `rexruntime.dll`.
