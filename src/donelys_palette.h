// Donelys palette: the colours of the DONELYS N3 launcher, shared by the in-game overlays.
// Header-only and free of ImGui so the contrast rules can be unit-tested.
#pragma once

#include <algorithm>
#include <cmath>
#include <cstdint>

namespace n3::donelys {

struct Rgb {
  float r, g, b;
};

constexpr Rgb FromHex(uint32_t hex) {
  return {((hex >> 16) & 0xFF) / 255.0f, ((hex >> 8) & 0xFF) / 255.0f, (hex & 0xFF) / 255.0f};
}

namespace palette {
inline constexpr Rgb kBackground = FromHex(0x0B0407);
inline constexpr Rgb kPanel = FromHex(0x160A10);
inline constexpr Rgb kPanelRaised = FromHex(0x24121B);
inline constexpr Rgb kText = FromHex(0xFBF6EE);
inline constexpr Rgb kTextMuted = FromHex(0xC9B8A6);
inline constexpr Rgb kGold = FromHex(0xF0CF86);
inline constexpr Rgb kCrimson = FromHex(0xC4283A);
inline constexpr Rgb kCrimsonDark = FromHex(0x7A1424);
inline constexpr Rgb kOk = FromHex(0x6AF0B6);
inline constexpr Rgb kWarn = FromHex(0xFFD56E);
inline constexpr Rgb kBad = FromHex(0xFF8D8D);
}  // namespace palette

// WCAG 2.x relative luminance and contrast ratio.
inline float Luminance(const Rgb& c) {
  auto linear = [](float v) { return v <= 0.03928f ? v / 12.92f : std::pow((v + 0.055f) / 1.055f, 2.4f); };
  return 0.2126f * linear(c.r) + 0.7152f * linear(c.g) + 0.0722f * linear(c.b);
}

inline float ContrastRatio(const Rgb& a, const Rgb& b) {
  const float la = Luminance(a), lb = Luminance(b);
  return (std::max(la, lb) + 0.05f) / (std::min(la, lb) + 0.05f);
}

}  // namespace n3::donelys
