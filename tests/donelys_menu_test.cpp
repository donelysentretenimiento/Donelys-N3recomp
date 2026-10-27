#include "donelys_menu_model.h"
#include "frame_rate_policy.h"
#include "graphics_filtering.h"
#include "text_language.h"
#include <iostream>
#include <set>
#include <stdexcept>
#include <string>

using namespace n3::menu;

namespace {
void Require(bool ok, const std::string& what) {
  if (!ok) throw std::runtime_error(what);
}
const Setting& Find(std::span<const Setting> settings, std::string_view cvar) {
  for (const auto& s : settings)
    if (s.cvar == cvar) return s;
  throw std::runtime_error("missing setting " + std::string(cvar));
}
}  // namespace

int main() {
  try {
    // Every entry the menu shows must be a value the game accepts; the menu must not invent options.
    const auto& language = Find(kLanguageSettings, "n3_text_language");
    Require(language.choices.size() == n3::language::kLanguages.size(), "one menu entry per supported language");
    for (const auto& c : language.choices) {
      bool known = false;
      for (const auto& l : n3::language::kLanguages) known |= l.name == c.value;
      Require(known, "unsupported language offered: " + std::string(c.value));
    }
    Require(language.needs_restart, "the language is read at start-up, so the menu must say it needs a restart");

    const auto& fps = Find(kGraphicsSettings, "n3_frame_rate");
    for (const auto& c : fps.choices) Require(n3::frames::SupportsClock(static_cast<uint32_t>(std::stoul(std::string(c.value)))), "unsupported frame rate");
    Require(fps.choices.size() == 3 && fps.graphics_row == 1, "frame rate maps to graphics row 1 with 30/40/60");

    const auto& aniso = Find(kGraphicsSettings, "anisotropic_override");
    Require(aniso.choices.size() == n3::graphics::kAnisotropicOverrides.size() && aniso.graphics_row == 2, "anisotropy maps to graphics row 2");
    for (std::size_t i = 0; i < aniso.choices.size(); ++i)
      Require(std::stoi(std::string(aniso.choices[i].value)) == n3::graphics::kAnisotropicOverrides[i], "anisotropy order must match ApplyGraphicsChoice");

    const auto& output = Find(kGraphicsSettings, "n3_display_resolution");
    const std::set<std::string> heights{"720", "1080", "1440", "2160"};
    Require(output.choices.size() == 4 && output.graphics_row == 3, "output maps to graphics row 3");
    for (std::size_t i = 0; i < 4; ++i) Require(heights.count(std::string(output.choices[i].value)), "output must be a preset");

    const auto& scale = Find(kGraphicsSettings, "resolution_scale");
    Require(scale.choices.size() == 3 && scale.graphics_row == 4, "render scale maps to graphics row 4");
    for (std::size_t i = 0; i < 3; ++i) Require(std::stoi(std::string(scale.choices[i].value)) == static_cast<int>(i + 1), "scale index i means (i+1)x");

    const auto& vsync = Find(kGraphicsSettings, "n3_vsync");
    Require(vsync.graphics_row == 5 && vsync.choices[0].value == "false" && vsync.choices[1].value == "true", "VSync index 0 is off, 1 is on");
    Require(Find(kGraphicsSettings, "fullscreen").graphics_row == 0, "fullscreen is applied through the window");
    Require(Find(kWindowSettings, "n3_borderless").needs_restart, "borderless is applied at start-up");

    // The current value is found by text; unknown text selects nothing.
    Require(IndexOf(language, "spanish") == 0 && IndexOf(language, "klingon") == kNoChoice, "IndexOf matches by value");
    Require(IndexOf(aniso, "5") == 4 && IndexOf(aniso, "16") == kNoChoice, "anisotropy 16x is stored as 5");

    for (const auto group : {std::span<const Setting>(kLanguageSettings), std::span<const Setting>(kGraphicsSettings), std::span<const Setting>(kWindowSettings)})
      for (const auto& s : group) {
        Require(!s.label.empty() && !s.choices.empty(), "labels and choices must not be empty");
        std::set<std::string_view> values;
        for (const auto& c : s.choices) Require(values.insert(c.value).second, "duplicate value in " + std::string(s.cvar));
      }
    // Presets only name rows and indexes the menu really has.
    for (const auto& preset : kPresets) {
      Require(!preset.label.empty() && preset.entries.size() == 5, "a preset sets the five live rows");
      std::set<unsigned> rows;
      for (const auto& entry : preset.entries) {
        const auto* setting = ByGraphicsRow(entry.row);
        Require(setting && entry.index < setting->choices.size(), "preset entry out of range");
        Require(rows.insert(entry.row).second, "a preset must not set a row twice");
      }
    }
    std::cout << "Donelys menu model passed\n";
  } catch (const std::exception& e) {
    std::cerr << e.what() << '\n';
    return 1;
  }
}
