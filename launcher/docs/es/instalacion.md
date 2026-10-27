# Instalación y uso

## Qué necesitas

| Elemento | Detalle |
|---|---|
| Sistema | Windows 10/11 x64 con una GPU compatible con Direct3D 12 |
| Recompilador | [N3 Recompiled](https://github.com/WK2D/N3-Ninety-Nine-Nights-Recomp/releases), verificado con `v0.1.0-alpha.12` |
| Juego (obligatorio) | Tu copia de la edición **PAL / USA-Europa** (`default.xex` con SHA-256 `0fe8973b…a804`), como ISO o carpeta extraída |
| Voces japonesas (opcional) | Tu ISO japonesa **o** la carpeta del UNDUB. Solo se usan sus voces |

El ejecutable PAL es el único que acepta N3 Recompiled; por eso la edición PAL es siempre la base, aunque quieras jugar con voces japonesas.

## Instalación

1. Descomprime N3 Recompiled en una carpeta de tu elección (por ejemplo `D:\Juegos\N3`).
2. Descarga `DONELYS-N3-Launcher-v…-win-x64.zip` desde *Releases* y comprueba su `.sha256`.
3. Extrae la carpeta `DONELYS-N3` **dentro de la carpeta de N3 Recompiled**, junto a `n3.exe`. El launcher busca `n3.exe` hacia arriba desde su
   propia carpeta; si no lo encuentra, te lo dirá al abrirlo.
4. Abre `DONELYS-N3\DONELYS N3.exe`.

Todo lo que genera el launcher se guarda en `DonelysN3-datos`, dentro de la carpeta de N3 Recompiled. Puedes borrarla para reiniciar el launcher sin
afectar al juego, a tus partidas ni a tu configuración.

## Primer arranque

1. **Fuentes → Añadir ISO o carpeta…** y elige tu ISO PAL, o la carpeta ya extraída (con `default.xex` y `data`). Si solo tienes la ISO, usa
   **Importar ISO PAL…** (necesita unos 5,8 GB libres; la ISO no se modifica).
2. **Ajustes → Idioma y voces**: elige el idioma de los textos. Para voces japonesas pulsa **Aportar ISO o carpeta japonesa…**, elige tu ISO japonesa o
   el UNDUB y selecciona esas voces; al jugar por primera vez se extraen y comprueban (≈ 205 MB).
3. **Ajustes → Gráficos**: elige las opciones. *Aplicar este perfil* deja 60 FPS, salida 1440p, render 4K, anisotrópico 16×, VSync y pantalla
   completa.
4. Pulsa **JUGAR**.

## Volver atrás

- Textos: elige *Inglés* y el launcher arranca el runtime original.
- Voces: elige las *originales de la edición PAL*. No hay nada que reinstalar ni desinstalar.
- Gráficos: tu configuración anterior está en `n3.toml.bak-donelys-*` (carpeta `%LOCALAPPDATA%\N3Recompiled`).

## Imagen propia

*Ajustes → Apariencia* permite elegir la portada y el fondo (también arrastrando una imagen sobre la portada, o pegándola con Ctrl+V). Fondo
recomendado: 2560×1440 px (16:9), JPG/PNG/WebP de hasta 12 MB, sin texto, con el centro oscuro y poco detallado. Portada cuadrada de al menos
1200×1200 px. Las imágenes se reducen y se guardan localmente; no se publican.
