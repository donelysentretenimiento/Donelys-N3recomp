# How it works

This document explains **why** the launcher does what it does. Everything described was checked against the real files and the SDK's public source; anything
that is still a hypothesis is labelled as such.

## 1. Why `user_language` changed nothing

The game builds its resource paths from a three-letter language code: `text\<LANG>\`, `Briefing\<LANG>\`, `interface\Local\<LANG>\`, `sox\<LANG>\` and the font
table. That code comes from `XGetLanguage`.

In the SDK pinned by N3 Recompiled (ReXGlue `bd833a2`, `xam_info.cpp`) `XGetLanguage_entry` always returns `XLanguage::kEnglish`: the region is treated as NTSC-U,
and `user_language` is only read by `ExGetXConfigSetting` and the user profile, neither of which this game consults to pick a folder. The game therefore always
asks for `ENG`, even though the PAL disc ships `FRA`, `GER`, `ITA` and `SPA`.

## 2. Why the "red X" appears

The usual trick is copying `Text\SPA\defaulttexttable0000_spa.txt` over the English table. The text changes, but the game **still believes it is running in
English** and loads the font table `font_0_eng.txt`, which only defines ASCII glyphs. The European table (`font_0_euro.txt`) does include accented characters. Accented
vowels end up with no glyph and the engine draws its "character not found" marker (a red X): "C▢mara", "Vibraci▢n", "S▢", "Atr▢s".

With the real language declared as Spanish the game uses `Font_0_EURO` and the `SPA` folders, and the X is gone.

## 3. Declaring another language without touching anything

`rexruntime.dll` exports `__imp__XGetLanguage` through a tiny wrapper function:

```
48 C7 01 <imm32> 00 00 00 C3        mov qword ptr [rcx], imm32 ; ret
```

In the `v0.1.0-alpha.12` `rexruntime.dll` (SHA-256 `6f3a790d…1530`) it sits at file offset `0x2B5A00`, and the immediate byte at `0x2B5A03` is `1` (English). The launcher
creates, under `DonelysN3-datos\runtime\<LANG>\`, a folder with **hard links** to the rest of the recompilation's files and a **copy** of the DLL with that single byte
changed (3 = German, 4 = French, 5 = Spanish, 6 = Italian), and starts `n3.exe` from there.

Safeguards: it only patches if the DLL's SHA-256 matches and the 8 expected bytes are in place; the original DLL and `n3.exe` are never touched. Verified by reading
the process memory: with each language the game asks for the matching folder (`text\FRA`, `text\GER`, `text\ITA`, `text\SPA`).

> Tying this to the exact version is a conscious limitation. The permanent fix is a change in the recompilation itself (read `user_language` or an option of its own instead of a
> fixed value); see the roadmap in [`DONELYS.md`](../../../DONELYS.md).

## 4. Voices: text and voice are independent

With the language set to Spanish the game takes text from `text\SPA` but voices still come from **`sound\ENG\`** (verified in memory). The PAL edition only ships English voices.
Japanese voices are installed into `Sound\ENG\SoundRes` of a **composed profile**:

- The launcher extracts `Sound\SoundRes` from the Japanese ISO (or `Sound\JPN\SoundRes` from the UNDUB) once into its cache.
- It validates the 149 files against the PAL base (see [compatibility](compatibility.md)).
- It builds `DonelysN3-datos\profiles\<id>\` with **hard links** to every base file and the Japanese voices in the `Sound\ENG\SoundRes` slot. The 5.8 GB are not copied, and the ISO and the
  PAL folder stay intact.
- It starts `n3.exe --game_data_root <profile>`.

Evidence that the game loads those voices: a byte signature unique to the Japanese `xwbpreload.pak` shows up in the process memory with the profile and does not with the PAL base.

## 5. Graphics settings

The launcher writes to the same `n3.toml` the game uses (`%LOCALAPPDATA%\N3Recompiled\n3.toml`). It only offers options the recompilation's source really defines:
`n3_frame_rate` (30/40/60), `anisotropic_override` (0, 2, 3, 4, 5 = 1×…16×), `n3_display_resolution` (720/1080/1440/2160), `resolution_scale` (1–3, together with
`draw_resolution_scale_x/y`), `n3_vsync` and `fullscreen`. Writes are atomic, keep unrelated keys and leave a `n3.toml.bak-donelys-<UTC date>` copy. Any value outside those sets is rejected.

## 6. Game window

A PowerShell script (`app/lib/borderless.ps1`) waits for the `n3.exe` window and, through the Windows API, changes its title and icon, applies the Windows 11 caption colours
(DWM) and, when requested, removes the caption while keeping the game area's size. It modifies no file.
