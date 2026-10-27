// What the Donelys in-game menu offers. Pure data, no ImGui or SDK, so tests can hold it to what the game accepts.
#pragma once

#include <cstddef>
#include <span>
#include <string_view>

namespace n3::menu {

struct Choice {
  std::string_view label;
  std::string_view value;  // text of the cvar value this choice stands for
};

// graphics_row follows ApplyGraphicsChoice(): 1 FPS, 2 anisotropy, 3 output, 4 render scale, 5 VSync.
// 0 means the setting is a plain cvar written with SetFlagByName.
struct Setting {
  std::string_view label;
  std::string_view cvar;
  unsigned graphics_row;
  std::span<const Choice> choices;
  bool needs_restart;
};

inline constexpr Choice kLanguageChoices[] = {
    {"Español", "spanish"}, {"English", "english"}, {"Français", "french"},
    {"Deutsch", "german"}, {"Italiano", "italian"}};
inline constexpr Choice kFrameRateChoices[] = {{"30", "30"}, {"40", "40"}, {"60", "60"}};
inline constexpr Choice kAnisotropyChoices[] = {{"1×", "0"}, {"2×", "2"}, {"4×", "3"}, {"8×", "4"}, {"16×", "5"}};
inline constexpr Choice kOutputChoices[] = {{"720p", "720"}, {"1080p", "1080"}, {"1440p", "1440"}, {"2160p", "2160"}};
inline constexpr Choice kScaleChoices[] = {{"1×", "1"}, {"2×", "2"}, {"3×", "3"}};
inline constexpr Choice kSwitchChoices[] = {{"No", "false"}, {"Sí", "true"}};

inline constexpr Setting kLanguageSettings[] = {
    {"Idioma de textos", "n3_text_language", 0, kLanguageChoices, true},
};
inline constexpr Setting kGraphicsSettings[] = {
    {"Fotogramas por segundo", "n3_frame_rate", 1, kFrameRateChoices, false},
    {"Filtrado anisotrópico", "anisotropic_override", 2, kAnisotropyChoices, false},
    {"Resolución de salida", "n3_display_resolution", 3, kOutputChoices, false},
    {"Escala de render", "resolution_scale", 4, kScaleChoices, false},
    {"Sincronía vertical", "n3_vsync", 5, kSwitchChoices, false},
    {"Pantalla completa", "fullscreen", 0, kSwitchChoices, false},
};
inline constexpr Setting kWindowSettings[] = {
    {"Ventana sin borde", "n3_borderless", 0, kSwitchChoices, true},
};

// Presets set the live graphics rows only (never the language or window). They promise nothing about speed:
// "Rendimiento" asks the GPU for less work, "Calidad" for more; the user's own values are kept for undoing.
struct PresetEntry {
  unsigned row;    // ApplyGraphicsChoice row
  unsigned index;  // index into that row's choices
};
struct Preset {
  std::string_view label;
  std::span<const PresetEntry> entries;
};
inline constexpr PresetEntry kPerformanceEntries[] = {{1, 2}, {2, 1}, {3, 1}, {4, 0}, {5, 1}};  // 60, 2x, 1080p, 1x, VSync
inline constexpr PresetEntry kQualityEntries[] = {{1, 2}, {2, 4}, {3, 2}, {4, 2}, {5, 1}};      // 60, 16x, 1440p, 3x, VSync
inline constexpr Preset kPresets[] = {{"Rendimiento", kPerformanceEntries}, {"Calidad", kQualityEntries}};

// The graphics setting that ApplyGraphicsChoice calls row, or nullptr.
constexpr const Setting* ByGraphicsRow(unsigned row) {
  for (const auto& setting : kGraphicsSettings)
    if (setting.graphics_row == row) return &setting;
  return nullptr;
}

inline constexpr std::size_t kNoChoice = static_cast<std::size_t>(-1);

// Index of the choice whose value equals the cvar's current text, or kNoChoice.
constexpr std::size_t IndexOf(const Setting& setting, std::string_view current) {
  for (std::size_t i = 0; i < setting.choices.size(); ++i)
    if (setting.choices[i].value == current) return i;
  return kNoChoice;
}

}  // namespace n3::menu
