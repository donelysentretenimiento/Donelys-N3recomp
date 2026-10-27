#include "donelys_palette.h"
#include <iostream>
#include <stdexcept>
#include <string>

using namespace n3::donelys;

namespace {
void Require(bool ok, const std::string& what) {
  if (!ok) throw std::runtime_error(what);
}
void RequireContrast(const char* name, const Rgb& fg, const Rgb& bg, float minimum) {
  const float ratio = ContrastRatio(fg, bg);
  Require(ratio >= minimum, std::string(name) + " contrast " + std::to_string(ratio) + " < " + std::to_string(minimum));
}
void RequireUnit(const char* name, const Rgb& c) {
  for (float v : {c.r, c.g, c.b}) Require(v >= 0.0f && v <= 1.0f, std::string(name) + " component out of range");
}
}  // namespace

int main() {
  try {
    // Known WCAG anchors guard the helper itself.
    Require(ContrastRatio({0, 0, 0}, {1, 1, 1}) > 20.9f && ContrastRatio({0, 0, 0}, {1, 1, 1}) < 21.1f, "black/white must be 21:1");
    Require(ContrastRatio(palette::kText, palette::kText) == 1.0f, "identical colours must be 1:1");
    const Rgb gold = FromHex(0xF0CF86);
    Require(gold.r == palette::kGold.r && gold.g == palette::kGold.g && gold.b == palette::kGold.b, "FromHex must decode RRGGBB");

    for (const auto& [name, c] : {std::pair{"background", palette::kBackground}, std::pair{"panel", palette::kPanel},
                                  std::pair{"text", palette::kText}, std::pair{"gold", palette::kGold},
                                  std::pair{"crimson", palette::kCrimson}, std::pair{"ok", palette::kOk},
                                  std::pair{"warn", palette::kWarn}, std::pair{"bad", palette::kBad}})
      RequireUnit(name, c);

    // Body text and the gold accent must be AAA over every surface they sit on.
    for (const Rgb* surface : {&palette::kBackground, &palette::kPanel, &palette::kPanelRaised}) {
      RequireContrast("text", palette::kText, *surface, 7.0f);
      RequireContrast("gold", palette::kGold, *surface, 7.0f);
      RequireContrast("muted text", palette::kTextMuted, *surface, 4.5f);
      RequireContrast("ok badge", palette::kOk, *surface, 4.5f);
      RequireContrast("warn badge", palette::kWarn, *surface, 4.5f);
      RequireContrast("bad badge", palette::kBad, *surface, 4.5f);
    }
    // Button labels sit on the crimson fills.
    RequireContrast("text on dark crimson", palette::kText, palette::kCrimsonDark, 7.0f);
    RequireContrast("text on crimson", palette::kText, palette::kCrimson, 4.5f);
    std::cout << "Donelys palette contrast rules passed\n";
  } catch (const std::exception& e) {
    std::cerr << e.what() << '\n';
    return 1;
  }
}
