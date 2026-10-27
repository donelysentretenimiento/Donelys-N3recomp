#include "donelys_window.h"

#include "donelys_palette.h"

#include <rex/cvar.h>
#include <rex/logging.h>
#include <rex/ui/window.h>

#include <Windows.h>
#include <dwmapi.h>

REXCVAR_DEFINE_STRING(n3_window_title, "DONELYS N3", "N3/Window", "Title shown on the game window and taskbar");
REXCVAR_DEFINE_BOOL(n3_borderless, false, "N3/Window", "Remove the Windows title bar and border while windowed");

namespace n3::donelys {

void ApplyDonelysWindow(rex::ui::Window& window) {
  window.SetTitle(REXCVAR_GET(n3_window_title));
  const auto hwnd = static_cast<HWND>(window.GetNativeWindowHandle());
  if (!hwnd) return;

  // DWM attributes 20/34/35/36: immersive dark mode, border, caption and caption text colours.
  // Windows 10 and older ignore the colour ones; the call just fails and the default bar stays.
  const BOOL dark = TRUE;
  DwmSetWindowAttribute(hwnd, 20, &dark, sizeof(dark));
  const COLORREF border = ToColorRef(palette::kCrimsonDark.r, palette::kCrimsonDark.g, palette::kCrimsonDark.b);
  const COLORREF caption = ToColorRef(palette::kBackground.r, palette::kBackground.g, palette::kBackground.b);
  const COLORREF text = ToColorRef(palette::kGold.r, palette::kGold.g, palette::kGold.b);
  DwmSetWindowAttribute(hwnd, 34, &border, sizeof(border));
  DwmSetWindowAttribute(hwnd, 35, &caption, sizeof(caption));
  DwmSetWindowAttribute(hwnd, 36, &text, sizeof(text));

  // shortcut: borderless is applied once at start-up and only while windowed; toggling it live is not supported.
  if (!REXCVAR_GET(n3_borderless) || window.IsFullscreen()) return;
  const auto style = static_cast<uint32_t>(GetWindowLongPtrW(hwnd, GWL_STYLE));
  if (!HasCaption(style)) return;
  RECT client{};
  GetClientRect(hwnd, &client);
  SetWindowLongPtrW(hwnd, GWL_STYLE, static_cast<LONG_PTR>(BorderlessStyle(style)));
  // Keep the client area the size it had so the resolution presets stay exact.
  SetWindowPos(hwnd, nullptr, 0, 0, client.right - client.left, client.bottom - client.top,
               SWP_NOMOVE | SWP_NOZORDER | SWP_NOACTIVATE | SWP_FRAMECHANGED);
  REXLOG_INFO("Borderless window enabled");
}

}  // namespace n3::donelys
