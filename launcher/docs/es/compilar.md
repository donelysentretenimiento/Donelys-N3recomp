# Compilar y empaquetar el launcher

El launcher es una aplicación Electron sin paso de compilación (JavaScript ESM). Para generarla como programa autónomo:

## Requisitos

- Windows 10/11 x64, PowerShell 7 (`pwsh`) y Node.js 20 o superior (incluye `npm`).
- Para el modo sin descarga manual: acceso a npm (se instala `electron@33.4.11`, que es la versión con la que se prueba).

## Pruebas

```powershell
node launcher/test/selftest.mjs [carpeta-de-N3-Recompiled]
```

Las pruebas usan carpetas temporales y no tocan tu `n3.toml`, la base del juego ni las ISO. Comprueban escritura y rechazo de ajustes, el compositor de
perfiles, los lectores XACT/XEX y, si indicas la carpeta de N3 Recompiled, la copia de runtime por idioma (que difiera en exactamente un byte).

## Empaquetar

```powershell
pwsh -NoProfile -File launcher/scripts/package.ps1 -Zip
```

Genera `launcher/dist/DONELYS-N3/DONELYS N3.exe` y, con `-Zip`, `launcher/dist/DONELYS-N3-Launcher-v<versión>-win-x64.zip` y su `.sha256`.
Si ya tienes un `electron\dist` local: `-ElectronDist <ruta>`. El script no modifica nada fuera de `launcher/dist`.

## Notas

- El `.exe` es el de Electron renombrado; el icono y el título de la ventana propios los aplica la propia aplicación. Cambiar los metadatos del
  ejecutable requiere una herramienta de edición de recursos que este repositorio no incluye.
- La portada y el fondo por defecto están en `app/ui/art/`. La imagen que elija el usuario (en `DonelysN3-datos\caratulas\`) tiene prioridad, y *Quitar fondo* vuelve a la incluida.
