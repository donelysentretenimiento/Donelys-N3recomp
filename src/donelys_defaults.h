#pragma once

#include <cstddef>
#include <string_view>

namespace n3::donelys {

struct DefaultValue {
  std::string_view name;
  std::string_view value;
};

// Same profile the DONELYS launcher writes. Only cvars the user never set are touched.
inline constexpr DefaultValue kDefaults[] = {
    {"fullscreen", "true"},
    {"n3_frame_rate", "60"},
    {"anisotropic_override", "5"},
    {"resolution_scale", "3"},
    {"draw_resolution_scale_x", "3"},
    {"draw_resolution_scale_y", "3"},
    {"n3_display_resolution", "1440"},
    {"n3_vsync", "true"},
};

inline constexpr std::string_view kSettingsKeyName = "bind_settings";
inline constexpr std::string_view kSettingsKey = "F5";

// is_default(name) -> bool and set(name, value) -> bool are injected so the policy is testable
// without the SDK. Returns how many values were written.
template <class IsDefault, class Set>
std::size_t ApplyDefaults(IsDefault&& is_default, Set&& set) {
  std::size_t written = 0;
  for (const auto& entry : kDefaults)
    if (is_default(entry.name) && set(entry.name, entry.value)) ++written;
  return written;
}

// Applies kDefaults through the SDK cvar store (master switch: n3_donelys_defaults).
void ApplyDonelysDefaults();
// Moves the settings overlay to F5 unless the user bound another key.
void ApplyDonelysKeybind();

}  // namespace n3::donelys
