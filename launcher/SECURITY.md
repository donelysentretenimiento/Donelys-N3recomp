# Seguridad · Security

## Español

**Qué hace y qué no hace el launcher**

- Es local: no envía datos, no tiene telemetría y no abre conexiones de red.
- Abre las ISO **solo en lectura**. Nunca escribe en ellas, en `n3.exe`, en `rexruntime.dll` ni en la carpeta de datos del juego. Sus datos
  (voces extraídas, perfiles de enlaces, copias de runtime por idioma, portada y fondo) van a la carpeta `DonelysN3-datos`.
- Escribe un único archivo del juego: el `n3.toml` del perfil de N3 Recompiled, de forma atómica y con copia `n3.toml.bak-donelys-*`.
- La copia de `rexruntime.dll` para cambiar el idioma **solo se crea si el hash SHA-256 coincide exactamente** con el de la versión verificada y los
  bytes esperados están en su sitio; en cualquier otro caso se rechaza.
- Rechaza nombres de archivo peligrosos y ciclos al leer ISO, y valida los valores de configuración contra los que el motor admite.
- La interfaz corre con `contextIsolation`, `sandbox`, sin `nodeIntegration`, con una política CSP estricta y sin herramientas de desarrollo en el
  paquete publicado.
- Un pequeño script de PowerShell (`app/lib/borderless.ps1`) ajusta la ventana del juego (título, icono, barra). No requiere cambiar la política de
  ejecución de PowerShell.

**Cómo informar de una vulnerabilidad.** Usa *Security → Report a vulnerability* de este repositorio (aviso privado). No publiques detalles en una
incidencia abierta hasta que haya una corrección.

## English

**What the launcher does and does not do**

- It is local: no data is sent, no telemetry, no network connections.
- ISOs are opened **read-only**. It never writes to them, to `n3.exe`, to `rexruntime.dll` or to the game data folder. Its own data (extracted voices,
  link profiles, per-language runtime copies, cover and background) goes to the `DonelysN3-datos` folder.
- It writes a single game file: the N3 Recompiled profile's `n3.toml`, atomically and with an `n3.toml.bak-donelys-*` backup.
- The `rexruntime.dll` copy used to change the language **is only created when the SHA-256 matches the verified version exactly** and the expected
  bytes are in place; otherwise it is refused.
- It rejects unsafe file names and cycles when reading ISOs, and validates configuration values against what the engine accepts.
- The UI runs with `contextIsolation`, `sandbox`, no `nodeIntegration`, a strict CSP and no developer tools in the published package.
- A small PowerShell script (`app/lib/borderless.ps1`) adjusts the game window (title, icon, caption). It does not require changing the PowerShell
  execution policy.

**Reporting a vulnerability.** Use *Security → Report a vulnerability* on this repository (private advisory). Do not post details in a public issue
until a fix is available.
