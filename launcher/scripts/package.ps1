# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2026 Donelys Entretenimiento
<#
.SYNOPSIS
  Crea la aplicación autónoma «DONELYS N3.exe» (runtime de Electron + esta carpeta app\) en launcher\dist\DONELYS-N3\.
  Builds the stand-alone "DONELYS N3.exe" (Electron runtime + the app\ folder) into launcher\dist\DONELYS-N3\.
.PARAMETER ElectronDist
  Carpeta dist de Electron 33.x (node_modules\electron\dist). Si se omite, se instala electron@33.4.11 desde npm en un directorio temporal.
  Electron 33.x dist folder. When omitted, electron@33.4.11 is installed from npm into a temporary directory.
.PARAMETER Zip
  Genera además el .zip de la release y su SHA-256. / Also produce the release .zip and its SHA-256.
#>
[CmdletBinding()]
param([string]$ElectronDist = '', [switch]$Zip)
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$launcher = Split-Path -Parent $here
$dist = Join-Path $launcher 'dist'
$target = Join-Path $dist 'DONELYS-N3'
$version = (Get-Content (Join-Path $launcher 'package.json') -Raw | ConvertFrom-Json).version

if (-not $ElectronDist) {
  $tmp = Join-Path $dist '_electron'
  New-Item -ItemType Directory -Force $tmp | Out-Null
  npm install --prefix $tmp --no-save --no-audit --no-fund electron@33.4.11 | Out-Null
  $ElectronDist = Join-Path $tmp 'node_modules\electron\dist'
}
if (-not (Test-Path -LiteralPath (Join-Path $ElectronDist 'electron.exe'))) { throw "No hay electron.exe en $ElectronDist" }
if (Test-Path -LiteralPath $target) { throw "Ya existe $target; bórralo para regenerarlo. / $target already exists; delete it to rebuild." }

New-Item -ItemType Directory -Force $target | Out-Null
robocopy $ElectronDist $target /E /NFL /NDL /NJH /NJS /NP /XD (Join-Path $ElectronDist 'resources') | Out-Null
New-Item -ItemType Directory -Force (Join-Path $target 'resources') | Out-Null
Get-ChildItem (Join-Path $ElectronDist 'resources') | Where-Object Name -ne 'default_app.asar' | Copy-Item -Destination (Join-Path $target 'resources') -Recurse
robocopy (Join-Path $launcher 'app') (Join-Path $target 'resources\app') /E /NFL /NDL /NJH /NJS /NP | Out-Null
Copy-Item (Join-Path $launcher 'LICENSE') (Join-Path $target 'LICENSE-DONELYS-N3.txt')
Copy-Item (Join-Path $launcher 'NOTICE.md') (Join-Path $target 'NOTICE.md')
Rename-Item (Join-Path $target 'electron.exe') 'DONELYS N3.exe'
Write-Host "Listo / Done: $target\DONELYS N3.exe"

if ($Zip) {
  $zipPath = Join-Path $dist "DONELYS-N3-Launcher-v$version-win-x64.zip"
  if (Test-Path -LiteralPath $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
  Compress-Archive -Path $target -DestinationPath $zipPath -CompressionLevel Optimal
  $hash = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash.ToLowerInvariant()
  "$hash  $(Split-Path -Leaf $zipPath)" | Set-Content -Path "$zipPath.sha256" -Encoding ascii
  Write-Host "ZIP: $zipPath`nSHA-256: $hash"
}
