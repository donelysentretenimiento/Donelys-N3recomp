#pragma once

#include <cstdint>

namespace rex::ui {
class Window;
}

namespace n3::donelys {

// Win32 style bits, spelled out so the pure helpers below build and test without Windows.h.
inline constexpr uint32_t kStyleCaption = 0x00C00000;   // WS_CAPTION (title bar + border)
inline constexpr uint32_t kStyleThickFrame = 0x00040000;  // WS_THICKFRAME (resize border)
inline constexpr uint32_t kStyleSysMenu = 0x00080000;   // WS_SYSMENU

constexpr uint32_t BorderlessStyle(uint32_t style) {
  return style & ~(kStyleCaption | kStyleThickFrame | kStyleSysMenu);
}
constexpr bool HasCaption(uint32_t style) { return (style & kStyleCaption) == kStyleCaption; }

// COLORREF layout is 0x00BBGGRR.
constexpr uint32_t ToColorRef(float r, float g, float b) {
  auto byte = [](float v) { return static_cast<uint32_t>(v * 255.0f + 0.5f); };
  return byte(r) | (byte(g) << 8) | (byte(b) << 16);
}

// Window title, DWM caption colours and optional borderless mode (cvar n3_borderless).
void ApplyDonelysWindow(rex::ui::Window& window);

}  // namespace n3::donelys
