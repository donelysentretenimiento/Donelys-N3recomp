# Known limitations

What does **not** work or has **not been verified**, plainly stated.

## Not feasible (tested)

- **Japanese text on the PAL edition.** Tested with the language declared as Japanese and the Japanese ISO's `JPN` folders added to the profile: the PAL executable still loads
  `text\ENG`, `interface\Local\ENG` and `Font_0_ENG` (it treats Japanese as English) and shows the menu in English. The Japanese ISO also ships no font tables of its own for Japanese.
  Playing in Japanese requires **recompiling the Japanese executable**, which is a matter for N3 Recompiled.
- **UNDUB as a standalone edition.** Its executable is not the PAL one (see [compatibility](compatibility.md)).
- **Voices inside the movies (`.bik`).** The Japanese ISO's differ from the PAL ones; it is unknown whether they carry burned-in subtitles or how they sync, so they are not offered.

## Version dependencies

- The language selector only applies to the `rexruntime.dll` of `N3 Recompiled v0.1.0-alpha.12`. With any other version the launcher refuses instead of patching blindly
  (English keeps working in every case).
- Edition checks use the SHA-256 values in the [compatibility](compatibility.md) table.

## Unverified

- Every mission with Japanese voices. Audio has been heard in game, but the `mission_4_voice_vigkvagk` bank (45 entries in Japanese, 46 in PAL) deserves particular attention.
- VSync, anisotropic filtering and render scale: they are written and read correctly, but the game leaves no log line confirming them.
- 40 and 60 FPS: the upstream project warns of accelerated animations; it has not been measured here.
- Systems other than the test machine (see the [README](../../README.md)).

## Launcher side

- The executable's image (the Properties of `DONELYS N3.exe`) is still Electron's; the icon and title you see in windows and the taskbar are the launcher's own.
- The interface is in Spanish (Spain); there is no language selector for the application itself.
