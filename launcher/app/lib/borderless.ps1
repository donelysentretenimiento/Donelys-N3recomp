# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2026 Donelys Entretenimiento
# Ajusta la ventana de n3.exe: quita la barra de título (modo ventana, conservando el tamaño del área de juego)
# y le pone el icono del launcher en la barra de tareas.
# Uso: borderless.ps1 <pid> [-NoBorder 1] [-IconPath <ico>] [-Title <texto>] [-Wait <segundos>]
param([int]$ProcId, [int]$NoBorder = 1, [string]$IconPath = '', [string]$Title = '', [int]$Wait = 90)
Add-Type @'
using System; using System.Runtime.InteropServices;
public static class BW {
  public delegate bool EnumProc(IntPtr h, IntPtr l);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc p, IntPtr l);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] public static extern IntPtr GetWindowLongPtrW(IntPtr h, int i);
  [DllImport("user32.dll")] public static extern IntPtr SetWindowLongPtrW(IntPtr h, int i, IntPtr v);
  [DllImport("user32.dll")] public static extern bool GetClientRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr a, int x, int y, int cx, int cy, uint f);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern IntPtr LoadImageW(IntPtr inst, string name, uint type, int cx, int cy, uint flags);
  [DllImport("user32.dll")] public static extern IntPtr SendMessageW(IntPtr h, uint msg, IntPtr w, IntPtr l);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern bool SetWindowTextW(IntPtr h, string t);
  [DllImport("dwmapi.dll")] public static extern int DwmSetWindowAttribute(IntPtr h, int attr, ref int v, int size);
  public static int Dwm(IntPtr h, int attr, int v) { return DwmSetWindowAttribute(h, attr, ref v, 4); }
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
  public static IntPtr Find(uint pid) {
    IntPtr found = IntPtr.Zero;
    EnumWindows((h, l) => { uint p; GetWindowThreadProcessId(h, out p); if (p == pid && IsWindowVisible(h)) { RECT r; GetClientRect(h, out r); if (r.R > 300 && r.B > 200) { found = h; return false; } } return true; }, IntPtr.Zero);
    return found;
  }
}
'@
[void][BW]::SetProcessDPIAware()
$WS_CAPTION = 0x00C00000; $WS_THICKFRAME = 0x00040000; $WS_SYSMENU = 0x00080000
$big = [IntPtr]::Zero; $small = [IntPtr]::Zero
if ($IconPath -and (Test-Path -LiteralPath $IconPath)) {
  $big = [BW]::LoadImageW([IntPtr]::Zero, $IconPath, 1, 48, 48, 0x10)    # IMAGE_ICON, LR_LOADFROMFILE
  $small = [BW]::LoadImageW([IntPtr]::Zero, $IconPath, 1, 16, 16, 0x10)
}
$iconDone = $false; $barDone = $false
$fin = (Get-Date).AddSeconds($Wait)
while ((Get-Date) -lt $fin) {
  if (-not (Get-Process -Id $ProcId -ErrorAction SilentlyContinue)) { return }
  $h = [BW]::Find([uint32]$ProcId)
  if ($h -ne [IntPtr]::Zero) {
    if (-not $iconDone -and $big -ne [IntPtr]::Zero) {
      [void][BW]::SendMessageW($h, 0x80, [IntPtr]1, $big)      # WM_SETICON, ICON_BIG
      [void][BW]::SendMessageW($h, 0x80, [IntPtr]0, $small)    # ICON_SMALL
      $iconDone = $true
    }
    if ($Title) { [void][BW]::SetWindowTextW($h, $Title) }
    if ($NoBorder -ne 1 -and -not $barDone) {
      # barra de la marca (Windows 11): fondo oscuro, texto dorado y borde carmesí, como el launcher (COLORREF = 0x00BBGGRR)
      [void][BW]::Dwm($h, 20, 1)            # modo oscuro
      [void][BW]::Dwm($h, 35, 0x0e0a1a)     # color de la barra  #1a0a0e
      [void][BW]::Dwm($h, 36, 0x86cff0)     # color del texto    #f0cf86
      [void][BW]::Dwm($h, 34, 0x24147a)     # color del borde    #7a1424
      $barDone = $true
    }
    if ($NoBorder -eq 1) {
      $style = [int64][BW]::GetWindowLongPtrW($h, -16)
      if (($style -band $WS_CAPTION) -eq $WS_CAPTION) {
        $c = New-Object BW+RECT; [void][BW]::GetClientRect($h, [ref]$c)
        $w = $c.R - $c.L; $hh = $c.B - $c.T
        $new = ($style -band (-bnot ($WS_CAPTION -bor $WS_THICKFRAME -bor $WS_SYSMENU)))
        [void][BW]::SetWindowLongPtrW($h, -16, [IntPtr]$new)
        $r = New-Object BW+RECT; [void][BW]::GetWindowRect($h, [ref]$r)
        # SWP_NOZORDER 0x4 | SWP_NOACTIVATE 0x10 | SWP_FRAMECHANGED 0x20: sin marco, el área de juego conserva su tamaño
        [void][BW]::SetWindowPos($h, [IntPtr]::Zero, $r.L, $r.T, $w, $hh, 0x34)
      }
    }
  }
  Start-Sleep -Milliseconds 700
}
