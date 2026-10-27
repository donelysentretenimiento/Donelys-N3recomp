#pragma once

#include <array>
#include <cstdint>
#include <string_view>

namespace n3::language {

struct Entry {
  std::string_view name;
  uint32_t code;  // XLanguage value the game compares against
};

// Languages the PAL disc ships text and fonts for. Japanese is not among them.
inline constexpr std::array<Entry, 5> kLanguages{{
    {"english", 1},
    {"german", 3},
    {"french", 4},
    {"spanish", 5},
    {"italian", 6},
}};

inline constexpr std::string_view kDefaultName = "english";

// Unknown names fall back to English, the language the SDK reports on its own.
constexpr uint32_t Code(std::string_view name) {
  for (const auto& entry : kLanguages)
    if (entry.name == name) return entry.code;
  return kLanguages[0].code;
}

}  // namespace n3::language
