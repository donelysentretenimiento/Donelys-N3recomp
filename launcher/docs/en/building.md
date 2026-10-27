# Building and packaging the launcher

The launcher is an Electron application with no build step (ESM JavaScript). To produce it as a stand-alone program:

## Requirements

- Windows 10/11 x64, PowerShell 7 (`pwsh`) and Node.js 20 or newer (includes `npm`).
- For the no-manual-download path: access to npm (`electron@33.4.11` is installed, the version it is tested with).

## Tests

```powershell
node launcher/test/selftest.mjs [N3-Recompiled-folder]
```

Tests use temporary folders and do not touch your `n3.toml`, the game base or the ISOs. They cover settings writes and rejection, the profile composer, the XACT/XEX readers and,
if you pass the N3 Recompiled folder, the per-language runtime copy (it must differ in exactly one byte).

## Packaging

```powershell
pwsh -NoProfile -File launcher/scripts/package.ps1 -Zip
```

Produces `launcher/dist/DONELYS-N3/DONELYS N3.exe` and, with `-Zip`, `launcher/dist/DONELYS-N3-Launcher-v<version>-win-x64.zip` and its `.sha256`.
If you already have a local `electron\dist`: `-ElectronDist <path>`. The script changes nothing outside `launcher/dist`.

## Notes

- The `.exe` is Electron's renamed; the own icon and window title are applied by the application itself. Changing the executable's metadata needs a resource editor that this repository does not include.
- No cover or background is distributed: each user picks theirs. For your own build you can place `portada.jpg` and `fondo.jpg` in `DonelysN3-datos\caratulas\`.
