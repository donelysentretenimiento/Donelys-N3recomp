# Graphics and the in-game menu (F4)

## Options the launcher offers

They are the ones in the game's own *Graphics* menu and are stored in the same file (`n3.toml`), so the launcher and the game always see the same thing.

| Option | Values | `n3.toml` key | Note |
|---|---|---|---|
| Frames per second | 30 · 40 · 60 | `n3_frame_rate` | 30 is the original. 40 and 60 are **experimental** (accelerated animations are possible: internal timing, not lack of power) |
| Output resolution | 720p · 1080p · 1440p · 4K | `n3_display_resolution` | Window size. In fullscreen the resolution of the screen it opens on is used |
| Render resolution | 1× · 2× · 3× over 720p | `resolution_scale` (+ `draw_resolution_scale_x/y`) | 3× = internal 4K |
| Anisotropic filtering | 1× · 2× · 4× · 8× · 16× | `anisotropic_override` = 0, 2, 3, 4, 5 | |
| Vertical sync | on · off | `n3_vsync` | Only affects presentation in Windows, not game pacing |
| Fullscreen | on · off | `fullscreen` | |

Example profile ("Aplicar este perfil"): 60 FPS · 1440p output · 4K render · 16× anisotropic · VSync · fullscreen. It does not change Windows' refresh rate.

### Window

In windowed mode, *Barra de la marca* (branded caption: "DONELYS N3" title, own icon and launcher colours) or *Sin barra* (no caption). Fullscreen has no caption.

### What is verified and what is not

- Verified: keys are written and read correctly (automated tests); with `fullscreen = true` the game opens captionless, fullscreen on the primary display and logs `N3 frame-rate target: 60`.
- Not confirmed by log: the effect of VSync, anisotropic filtering and render scale. The upstream project verifies them with a debug audit.

## In-game settings menu

The ReXGlue SDK includes an on-screen settings menu (`settings_overlay`): **F4** during play. It lists every registered variable and labels each one *live* (applied immediately) or *restart*
(needs a restart), and saves to the same `n3.toml`. Other SDK hotkeys: **F3** performance counter, **`** (backtick) console, **F7** achievements.

Hotkeys are text variables (`bind_settings = "F4"`, `bind_debug_overlay`, `bind_console`, `bind_achievements`), so they can be reassigned in `n3.toml` without recompiling. This launcher does not
offer that reassignment yet.

The look of that menu (ImGui colours) is the SDK's. Changing it requires modifying the recompilation (the `OnConfigureStyle` extension point); it is on the roadmap in [`DONELYS.md`](../../../DONELYS.md).
