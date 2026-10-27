#include "text_language.h"
#include <fstream>
#include <iostream>
#include <set>
#include <sstream>
#include <stdexcept>
#include <string>

using namespace n3::language;

namespace {
void Require(bool ok, const std::string& what) {
  if (!ok) throw std::runtime_error(what);
}
}  // namespace

int main() {
  try {
    // Values the game compares against: XLanguage 1 English, 3 German, 4 French, 5 Spanish, 6 Italian.
    Require(Code("english") == 1 && Code("german") == 3 && Code("french") == 4 && Code("spanish") == 5 && Code("italian") == 6,
            "language codes must match the XLanguage values");
    // Anything unknown, including Japanese (no text on the PAL disc), keeps the SDK's own answer.
    for (const char* bad : {"", "japanese", "Spanish", "es", "spanish "}) Require(Code(bad) == 1, std::string("unknown name must fall back to English: ") + bad);
    Require(Code(kDefaultName) == 1, "the default must be English so stock behaviour is unchanged");

    std::set<std::string_view> names;
    std::set<uint32_t> codes;
    for (const auto& entry : kLanguages) {
      Require(names.insert(entry.name).second && codes.insert(entry.code).second, "duplicate language entry");
      Require(entry.code != 2, "Japanese must not be offered");
    }

    // The manifest must hook exactly the game's two XGetLanguage calls and name the function defined in language_hook.cpp.
    std::ifstream file(N3_MANIFEST_PATH);
    Require(file.good(), "cannot open n3_manifest.toml");
    std::stringstream text;
    text << file.rdbuf();
    const std::string manifest = text.str();
    // A top-level [[midasm_hook]] is silently ignored by the code generator; it must hang off [entrypoint].
    Require(manifest.find("\n[[midasm_hook]]") == std::string::npos, "hooks must be [[entrypoint.midasm_hook]]");
    auto hook = [&](const char* address, const char* jump) {
      const auto at = manifest.find(std::string("address = ") + address);
      Require(at != std::string::npos, std::string("missing hook at ") + address);
      const auto block = manifest.substr(at, manifest.find("[[", at) - at);
      Require(block.find("name = \"N3GetTextLanguage\"") != std::string::npos, "hook must call N3GetTextLanguage");
      Require(block.find("registers = [\"r3\"]") != std::string::npos, "hook must expose r3");
      Require(block.find(std::string("jump_address = ") + jump) != std::string::npos, "hook must skip the original call");
    };
    hook("0x8211019C", "0x821101A0");
    hook("0x8252FBDC", "0x8252FBE0");
    std::cout << "Text language policy and manifest hooks passed\n";
  } catch (const std::exception& e) {
    std::cerr << e.what() << '\n';
    return 1;
  }
}
