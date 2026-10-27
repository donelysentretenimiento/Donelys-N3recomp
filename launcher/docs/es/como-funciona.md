# Cómo funciona

Este documento explica **por qué** el launcher hace lo que hace. Todo lo descrito se comprobó contra los archivos reales y el código público del SDK;
lo que sigue siendo una hipótesis se marca como tal.

## 1. Por qué `user_language` no cambiaba nada

El juego construye sus rutas de recursos a partir de un código de idioma de tres letras: `text\<IDIOMA>\`, `Briefing\<IDIOMA>\`,
`interface\Local\<IDIOMA>\`, `sox\<IDIOMA>\` y la tabla de fuente. Ese código sale de `XGetLanguage`.

En el SDK fijado por N3 Recompiled (ReXGlue `bd833a2`, `xam_info.cpp`) `XGetLanguage_entry` devuelve siempre `XLanguage::kEnglish`: la región se
trata como NTSC-U y el ajuste `user_language` solo lo leen `ExGetXConfigSetting` y el perfil de usuario, que este juego no consulta para elegir carpeta.
Resultado: el juego siempre pide `ENG`, aunque el disco PAL traiga `FRA`, `GER`, `ITA` y `SPA`.

## 2. Por qué aparece la «X roja»

El truco habitual es copiar `Text\SPA\defaulttexttable0000_spa.txt` sobre la tabla inglesa. Los textos cambian, pero el juego **sigue creyéndose en
inglés** y carga la tabla de fuente `font_0_eng.txt`, que solo define glifos ASCII. La tabla europea (`font_0_euro.txt`) sí incluye los
caracteres acentuados. Las vocales acentuadas quedan sin glifo y el motor dibuja su marcador de «carácter no encontrado» (una X roja): «C▢mara»,
«Vibraci▢n», «S▢», «Atr▢s».

Con el idioma real declarado como español, el juego usa `Font_0_EURO` y las carpetas `SPA`, y la X desaparece.

## 3. Cómo se declara otro idioma sin tocar nada

`rexruntime.dll` exporta `__imp__XGetLanguage` mediante una función envoltorio muy pequeña:

```
48 C7 01 <imm32> 00 00 00 C3        mov qword ptr [rcx], imm32 ; ret
```

En el `rexruntime.dll` de `v0.1.0-alpha.12` (SHA-256 `6f3a790d…1530`) está en el desplazamiento de archivo `0x2B5A00` y el byte inmediato en
`0x2B5A03` vale `1` (inglés). El launcher crea, en `DonelysN3-datos\runtime\<IDIOMA>\`, una carpeta con **enlaces duros** al resto de archivos del
recompilador y una **copia** del DLL con ese único byte cambiado (3 = alemán, 4 = francés, 5 = español, 6 = italiano), y arranca `n3.exe` desde ahí.

Salvaguardas: solo se parchea si el SHA-256 del DLL coincide y los 8 bytes esperados están en su sitio; el DLL original y `n3.exe` no se tocan.
Se verificó leyendo la memoria del proceso: con cada idioma el juego pide la carpeta correspondiente (`text\FRA`, `text\GER`, `text\ITA`, `text\SPA`).

> El enlace con la versión exacta es una limitación consciente. La solución definitiva es un cambio en el propio recompilador (leer `user_language`
> o una opción propia en lugar de un valor fijo); véase la hoja de ruta en [`DONELYS.md`](../../../DONELYS.md).

## 4. Voces: texto y voz son independientes

Con el idioma en español, el juego pide los textos a `text\SPA` pero las voces siguen saliendo de **`sound\ENG\`** (comprobado en memoria). La edición
PAL solo trae voces en inglés. Las voces japonesas se instalan en `Sound\ENG\SoundRes` de un **perfil compuesto**:

- El launcher extrae `Sound\SoundRes` de la ISO japonesa (o `Sound\JPN\SoundRes` del UNDUB) una sola vez a la caché.
- Valida los 149 archivos contra la base PAL (véase [compatibilidad](compatibilidad.md)).
- Crea `DonelysN3-datos\perfiles\<id>\` con **enlaces duros** a todos los archivos de la base y las voces japonesas en el hueco de `Sound\ENG\SoundRes`.
  No se copian los 5,8 GB, y la ISO y la carpeta PAL permanecen intactas.
- Arranca `n3.exe --game_data_root <perfil>`.

Evidencia de que el juego carga esas voces: una firma de bytes exclusiva de `xwbpreload.pak` japonés aparece en la memoria del proceso con el perfil y no
aparece con la base PAL.

## 5. Ajustes gráficos

El launcher escribe en el mismo `n3.toml` que usa el juego (`%LOCALAPPDATA%\N3Recompiled\n3.toml`). Solo ofrece opciones que el código fuente del
recompilador define de verdad: `n3_frame_rate` (30/40/60), `anisotropic_override` (0, 2, 3, 4, 5 = 1×…16×), `n3_display_resolution` (720/1080/1440/2160),
`resolution_scale` (1–3, junto con `draw_resolution_scale_x/y`), `n3_vsync` y `fullscreen`. La escritura es atómica, conserva las claves ajenas y deja una copia
`n3.toml.bak-donelys-<fecha UTC>`. Cualquier valor fuera de esos conjuntos se rechaza.

## 6. Ventana del juego

Un script de PowerShell (`app/lib/borderless.ps1`) espera a que aparezca la ventana de `n3.exe` y, con la API de Windows, le cambia el título y el
icono, aplica los colores de barra de Windows 11 (DWM) y, si se pide, quita la barra conservando el tamaño del área de juego. No modifica ningún archivo.
