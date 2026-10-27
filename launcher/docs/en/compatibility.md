# Edition compatibility

Every figure comes from reading the real discs and executables with the launcher's own tools.

## Executables

| Edition | Version | Regions | Entry point | `default.xex` SHA-256 | Role |
|---|---|---|---|---|---|
| PAL / USA-Europe | 0.0.0.3 | `0xFFFFFFFF` | `0x8252FD00` | `0fe8973b6ff45d3f8bd03a51a8c0d8cdf278b3d43e793497777e075f4e94a804` | **Playable base** |
| Japan (ISO) | 0.0.0.1 | `0xFD00` | `0x8252D800` | `43a4d2d1650bbef7ed751fdd8dbb982662a55aac73f5c31795a6c207e391b9be` | Voice source |
| UNDUB | 0.0.0.4 | `0xFD00` | `0x8252F2C0` | `e0daff3eeea0232cbe7ee01b88af35b1c673c2cf83fb0e7a5341e78a18c04496` | Voice source |

All three share title ID `4D5307DB`. N3 Recompiled's code is translated from the PAL image and its importer only accepts that hash.

## Contents

- **PAL**: text `ENG FRA GER ITA SPA`; voices in English only (`Sound\ENG`, 149 banks).
- **Japan**: text `JPN`; voices in `Sound\SoundRes` (149 files, no language folder).
- **UNDUB**: text `ENG JPN TCH`; voices `Sound\ENG` and `Sound\JPN`. Its `Sound\JPN` is **byte-for-byte identical** (SHA-256) to the Japanese ISO's `Sound\SoundRes`: either source works.

## Japanese voices vs. the PAL base

| Check | Result |
|---|---|
| Same set of 149 files | Yes |
| Wave banks (`.xwb`) with the same name, codecs, flags and entry count | 112 of 113 |
| Sound banks (`.xsb`) | 35 of 35 identical except the header (CRC and timestamp) |
| `xwbpreload.pak` bank list | Identical |
| Exception | `mission_4_voice_vigkvagk.xwb`: 45 entries in the Japanese ISO vs 46 in PAL |

That is why the launcher does not copy only the voice banks: it installs the complete Japanese set (xsb, xwb and preload) so it is self-consistent.

## Why the UNDUB does not start with N3 Recompiled

Its executable is the Japanese v0.0.0.4, not the PAL one: different SHA-256, regions, entry point and image size. N3 Recompiled only accepts the PAL hash, and its translated
functions' addresses belong to that image. With an UNDUB `--game_data_root` the process exits with `0xC0000409` and shows no message. **The check is not bypassed**: its resources are reused with
the PAL executable instead.
