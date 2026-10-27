// Drives the Donelys menu headlessly: a real ImGui context, simulated mouse and keys, fake game services.
#include "donelys_menu_view.h"

#include <imgui.h>
#include <rex/cvar.h>
#include <toml++/toml.hpp>

#include <filesystem>
#include <iostream>
#include <stdexcept>
#include <string>

REXCVAR_DEFINE_STRING(n3_text_language, "english", "N3/Language", "test copy of the language cvar");
REXCVAR_DEFINE_BOOL(n3_borderless, false, "N3/Window", "test copy of the borderless cvar");
REXCVAR_DEFINE_UINT32(n3_frame_rate, 30, "N3/Graphics", "test copy");
REXCVAR_DEFINE_INT32(anisotropic_override, 0, "N3/Graphics", "test copy");
REXCVAR_DEFINE_UINT32(n3_display_resolution, 720, "N3/Graphics", "test copy");
REXCVAR_DEFINE_INT32(resolution_scale, 1, "N3/Graphics", "test copy");
REXCVAR_DEFINE_BOOL(n3_vsync, true, "N3/Graphics", "test copy");
REXCVAR_DEFINE_BOOL(n3_donelys_defaults, true, "N3/Window", "test copy of the defaults switch");
REXCVAR_DEFINE_BOOL(fullscreen, false, "Display", "test copy: the game registers it in the SDK window code");

using namespace n3::menu;

namespace {
void Require(bool ok, const std::string& what) {
  if (!ok) throw std::runtime_error(what);
}

struct Harness {
  struct Call { unsigned row, index; };
  std::vector<Call> graphics;
  std::vector<bool> fullscreen, saved;
  int closes = 0;
  bool graphics_result = true;
  std::filesystem::path config;
  std::unique_ptr<MenuView> view;

  explicit Harness(std::filesystem::path path) : config(std::move(path)) {
    view = std::make_unique<MenuView>(ViewHooks{
        config,
        [this](unsigned row, unsigned index) {
          graphics.push_back({row, index});
          if (!graphics_result) return false;
          const auto* setting = ByGraphicsRow(row);
          return setting && rex::cvar::SetFlagByName(std::string(setting->cvar), std::string(setting->choices[index].value));
        },
        [this](bool on) { fullscreen.push_back(on); },
        [this](bool ok) { saved.push_back(ok); },
        [this] { ++closes; }});
  }

  void Frame() {
    ImGuiIO& io = ImGui::GetIO();
    io.DisplaySize = {1920, 1080};
    io.DeltaTime = 1.0f / 60.0f;
    ImGui::NewFrame();
    view->Draw(io);
    ImGui::Render();
  }
  const ButtonRect& Find(const std::string& id) {
    for (const auto& b : view->buttons())
      if (b.id == id) return b;
    throw std::runtime_error("button not on screen: " + id);
  }
  // Press and release over the centre of a control, one frame per step, like a real mouse.
  void Click(const std::string& id) {
    const auto& r = Find(id);
    const ImVec2 centre{(r.min.x + r.max.x) * 0.5f, (r.min.y + r.max.y) * 0.5f};
    ImGuiIO& io = ImGui::GetIO();
    io.AddMousePosEvent(centre.x, centre.y);
    Frame();
    io.AddMouseButtonEvent(0, true);
    Frame();
    io.AddMouseButtonEvent(0, false);
    Frame();
    Frame();
  }
  void Key(ImGuiKey key) {
    ImGuiIO& io = ImGui::GetIO();
    io.AddKeyEvent(key, true);
    Frame();
    io.AddKeyEvent(key, false);
    Frame();
  }
};
}  // namespace

int main() {
  try {
    IMGUI_CHECKVERSION();
    ImGui::CreateContext();
    ImGuiIO& io = ImGui::GetIO();
    io.IniFilename = nullptr;
    io.Fonts->AddFontDefault();
    unsigned char* pixels = nullptr;  // no renderer here: build the atlas the legacy way so NewFrame has glyphs
    int atlas_w = 0, atlas_h = 0;
    io.Fonts->GetTexDataAsRGBA32(&pixels, &atlas_w, &atlas_h);

    const auto dir = std::filesystem::temp_directory_path() / "n3_donelys_menu_view_test";
    std::filesystem::remove_all(dir);
    std::filesystem::create_directories(dir);
    Harness h(dir / "n3.toml");
    h.Frame();
    h.Frame();

    // The first tab lists every language; nothing is drawn from the other tabs.
    Require(h.Find("Idioma").max.x > h.Find("Idioma").min.x, "tab Idioma must be on screen");
    for (const char* label : {"Español", "English", "Français", "Deutsch", "Italiano"})
      (void)h.Find(std::string(label) + "##n3_text_language");
    bool no_graphics_yet = true;
    for (const auto& b : h.view->buttons()) no_graphics_yet &= b.id.find("##n3_vsync") == std::string::npos;
    Require(no_graphics_yet, "graphics controls belong to their own tab");

    // Clicking a language writes the cvar and is not offered as a game-side graphics call.
    h.Click("Español##n3_text_language");
    Require(rex::cvar::GetFlagByName("n3_text_language") == "spanish", "language click must set n3_text_language");
    Require(h.graphics.empty(), "language is not a graphics row");
    Require(h.view->status_ok(), "applying a language is a success");

    // Tab switch, then graphics clicks reach ApplyGraphicsChoice with the row/index the model declares.
    h.Click("Gráficos");
    h.Click("60##n3_frame_rate");
    h.Click("16×##anisotropic_override");
    h.Click("2160p##n3_display_resolution");
    h.Click("3×##resolution_scale");
    h.Click("No##n3_vsync");
    Require(h.graphics.size() == 5, "five graphics clicks, five calls");
    const Harness::Call expected[] = {{1, 2}, {2, 4}, {3, 3}, {4, 2}, {5, 0}};
    for (std::size_t i = 0; i < 5; ++i)
      Require(h.graphics[i].row == expected[i].row && h.graphics[i].index == expected[i].index, "graphics call " + std::to_string(i) + " has the wrong row/index");

    // A refused value is reported, not hidden.
    h.graphics_result = false;
    h.Click("30##n3_frame_rate");
    Require(!h.view->status_ok() && h.view->status().find("No se pudo") != std::string::npos, "a refused value must be reported");
    h.graphics_result = true;

    // Fullscreen goes through the window hook and the cvar, in both directions (the SDK's own default may already be on).
    rex::cvar::SetFlagByName("fullscreen", "false");
    h.Click("Sí##fullscreen");
    Require(h.fullscreen.size() == 1 && h.fullscreen[0], "turning fullscreen on must call the window hook");
    Require(rex::cvar::GetFlagByName("fullscreen") == "true", "fullscreen cvar must follow");
    h.Click("No##fullscreen");
    Require(h.fullscreen.size() == 2 && !h.fullscreen[1], "turning fullscreen off must call the window hook");
    // A saved "fullscreen = true" must survive even though it equals the SDK default, with the Donelys defaults on and off.
    for (const char* defaults : {"true", "false"}) {
      rex::cvar::SetFlagByName("n3_donelys_defaults", defaults);
      h.Click("Sí##fullscreen");
      h.Click("Guardar");
      const auto on = toml::parse_file((dir / "n3.toml").string());
      Require(on["fullscreen"].value_or(false) == true, std::string("fullscreen = true must be saved (defaults ") + defaults + ")");
      h.Click("No##fullscreen");
      h.Click("Guardar");
      const auto off = toml::parse_file((dir / "n3.toml").string());
      Require(off.contains("fullscreen") && off["fullscreen"].value_or(true) == false, std::string("fullscreen = false must be saved (defaults ") + defaults + ")");
    }
    // ImGui claims the mouse while it is over the menu (the SDK decides what the game then receives: not tested here).
    Require(ImGui::GetIO().WantCaptureMouse, "ImGui must want the mouse over the menu");

    // Window tab: borderless is just a cvar (needs a restart).
    h.Click("Ventana");
    h.Click("Sí##n3_borderless");
    Require(rex::cvar::GetFlagByName("n3_borderless") == "true", "borderless click must set n3_borderless");

    // Save writes the real file, keeps what was there and contains what the menu changed.
    rex::cvar::SetFlagByName("n3_text_language", "spanish");
    h.Click("Guardar");
    Require(!h.saved.empty() && h.saved.back() && h.view->status_ok(), "save must succeed and notify");
    const auto saved = toml::parse_file((dir / "n3.toml").string());
    Require(saved["n3_text_language"].value_or<std::string>("") == "spanish", "n3.toml must hold the language");
    Require(saved["n3_borderless"].value_or(false) == true, "n3.toml must hold borderless");
    Require(saved.contains("fullscreen") && saved["fullscreen"].value_or(true) == false, "n3.toml must hold fullscreen = false (a non-default value)");
    Require(!std::filesystem::exists(dir / "n3.toml.tmp"), "no temporary file may remain");

    // Saving to an impossible path fails loudly and never throws into the game.
    Harness bad(dir / "no-such-folder" / "n3.toml");
    bad.Frame();
    bad.Frame();
    bad.Click("Guardar");
    Require(bad.saved.size() == 1 && !bad.saved[0] && !bad.view->status_ok(), "a failed save must be reported");

    // Presets: they set the five live rows, and "Deshacer" brings back the user's own values (not the SDK defaults).
    auto state = [] {
      return rex::cvar::GetFlagByName("n3_frame_rate") + "/" + rex::cvar::GetFlagByName("anisotropic_override") + "/" +
             rex::cvar::GetFlagByName("n3_display_resolution") + "/" + rex::cvar::GetFlagByName("resolution_scale") + "/" +
             rex::cvar::GetFlagByName("n3_vsync");
    };
    for (const auto& [name, value] : {std::pair{"n3_frame_rate", "40"}, {"anisotropic_override", "3"}, {"n3_display_resolution", "1440"}, {"resolution_scale", "2"}, {"n3_vsync", "false"}})
      rex::cvar::SetFlagByName(name, value);
    const std::string mine = state();
    h.Click("Gráficos");
    h.Click("Deshacer##preset");
    Require(h.view->status().find("nada que deshacer") != std::string::npos && state() == mine, "undo without a preset changes nothing");
    h.Click("Rendimiento##preset");
    Require(state() == "60/2/1080/1/true", "Rendimiento must set 60 / 2x / 1080p / 1x / VSync, got " + state());
    h.Click("Calidad##preset");
    Require(state() == "60/5/1440/3/true", "Calidad must set 60 / 16x / 1440p / 3x / VSync, got " + state());
    h.Click("Deshacer##preset");
    Require(state() == mine, "undo must restore the values from before the first preset, got " + state());
    h.Click("Deshacer##preset");
    Require(state() == mine, "a second undo changes nothing");

    // Esc asks the app to close once per press; other keys do not.
    h.Key(ImGuiKey_A);
    Require(h.closes == 0, "ordinary keys must not close the menu");
    h.Key(ImGuiKey_Escape);
    Require(h.closes == 1, "Esc must request closing exactly once");

    ImGui::DestroyContext();
    std::filesystem::remove_all(dir);
    std::cout << "Donelys menu behaviour passed (headless ImGui, simulated input)\n";
  } catch (const std::exception& e) {
    std::cerr << e.what() << '\n';
    return 1;
  }
}
