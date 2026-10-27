# Installation and use

## What you need

| Item | Detail |
|---|---|
| System | Windows 10/11 x64 with a Direct3D 12 capable GPU |
| Recompilation | [N3 Recompiled](https://github.com/WK2D/N3-Ninety-Nine-Nights-Recomp/releases), verified with `v0.1.0-alpha.12` |
| Game (required) | Your copy of the **PAL / USA-Europe** edition (`default.xex` SHA-256 `0fe8973b…a804`), as an ISO or an extracted folder |
| Japanese voices (optional) | Your Japanese ISO **or** the UNDUB folder. Only their voices are used |

The PAL executable is the only one N3 Recompiled accepts, so the PAL edition is always the base, even if you want Japanese voices.

## Installing

1. Unzip N3 Recompiled into a folder of your choice (for example `D:\Games\N3`).
2. Download `DONELYS-N3-Launcher-v…-win-x64.zip` from *Releases* and check its `.sha256`.
3. Extract the `DONELYS-N3` folder **inside the N3 Recompiled folder**, next to `n3.exe`. The launcher looks for `n3.exe` upwards from its own folder
   and tells you on start-up if it cannot find it.
4. Open `DONELYS-N3\DONELYS N3.exe`.

Everything the launcher generates is stored in `DonelysN3-datos`, inside the N3 Recompiled folder. You can delete it to reset the launcher without
affecting the game, your saves or your configuration.

## First run

1. **Fuentes (Sources) → Añadir ISO o carpeta…** (Add ISO or folder) and choose your PAL ISO, or the already extracted folder (with `default.xex` and
   `data`). If you only have the ISO, use **Importar ISO PAL…** (about 5.8 GB free space needed; the ISO is not modified).
2. **Ajustes (Settings) → Idioma y voces** (Language and voices): pick the text language. For Japanese voices press **Aportar ISO o carpeta japonesa…**
   (provide Japanese ISO or folder), choose your Japanese ISO or the UNDUB and select those voices; they are extracted and checked on first play (≈ 205 MB).
3. **Ajustes → Gráficos** (Graphics): pick your options. *Aplicar este perfil* (apply profile) sets 60 FPS, 1440p output, 4K render, 16× anisotropic, VSync and fullscreen.
4. Press **JUGAR** (Play).

## Going back

- Text: choose *Inglés* (English) and the launcher starts the original runtime.
- Voices: choose the *original PAL voices*. Nothing to reinstall or uninstall.
- Graphics: your previous configuration is in `n3.toml.bak-donelys-*` (folder `%LOCALAPPDATA%\N3Recompiled`).

## Your own artwork

*Ajustes → Apariencia* (Appearance) lets you pick the cover and background (you can also drag an image onto the cover, or paste it with Ctrl+V). Recommended
background: 2560×1440 px (16:9), JPG/PNG/WebP up to 12 MB, no text, dark and uncluttered centre. Cover: square, at least 1200×1200 px. Images are downscaled and
stored locally; they are never published.
