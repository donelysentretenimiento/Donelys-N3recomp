#include "donelys_defaults.h"
#include "frame_rate_policy.h"
#include "graphics_filtering.h"
#include <algorithm>
#include <iostream>
#include <map>
#include <set>
#include <stdexcept>
#include <string>

using namespace n3::donelys;

namespace {
void Require(bool ok, const std::string& what) {
  if (!ok) throw std::runtime_error(what);
}
std::string ValueOf(std::string_view name) {
  for (const auto& e : kDefaults)
    if (e.name == name) return std::string(e.value);
  throw std::runtime_error("missing default " + std::string(name));
}
}  // namespace

int main() {
  try {
    // Every default the game actually accepts.
    Require(n3::frames::SupportsClock(static_cast<uint32_t>(std::stoul(ValueOf("n3_frame_rate")))), "n3_frame_rate must be a supported clock");
    const int aniso = std::stoi(ValueOf("anisotropic_override"));
    Require(std::find(n3::graphics::kAnisotropicOverrides.begin(), n3::graphics::kAnisotropicOverrides.end(), aniso) !=
                n3::graphics::kAnisotropicOverrides.end(),
            "anisotropic_override must be an allowed value");
    const std::set<std::string> resolutions{"720", "1080", "1440", "2160"};
    Require(resolutions.count(ValueOf("n3_display_resolution")) == 1, "n3_display_resolution must be a preset");
    Require(ValueOf("resolution_scale") == ValueOf("draw_resolution_scale_x") && ValueOf("resolution_scale") == ValueOf("draw_resolution_scale_y"),
            "render scale axes must match");

    std::set<std::string_view> names;
    for (const auto& e : kDefaults) Require(names.insert(e.name).second, "duplicate default " + std::string(e.name));

    // The user's own values are never overwritten.
    std::map<std::string, std::string> store;
    const std::set<std::string> user_set{"n3_frame_rate", "fullscreen"};
    auto is_default = [&](std::string_view n) { return user_set.count(std::string(n)) == 0; };
    auto set = [&](std::string_view n, std::string_view v) { store[std::string(n)] = std::string(v); return true; };
    const auto written = ApplyDefaults(is_default, set);
    Require(written == std::size(kDefaults) - user_set.size(), "only unset values are written");
    Require(!store.count("n3_frame_rate") && !store.count("fullscreen"), "user values must stay untouched");
    Require(store.at("n3_vsync") == "true", "unset values receive the profile");

    // A refused write is not counted.
    Require(ApplyDefaults([](std::string_view) { return true; }, [](std::string_view, std::string_view) { return false; }) == 0, "failed writes are not counted");
    Require(kSettingsKey == "F5" && kSettingsKeyName == "bind_settings", "settings overlay moves to F5");
    std::cout << "Donelys defaults policy passed\n";
  } catch (const std::exception& e) {
    std::cerr << e.what() << '\n';
    return 1;
  }
}
