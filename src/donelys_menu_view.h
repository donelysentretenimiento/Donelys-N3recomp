// The drawing and behaviour of the Donelys menu, free of ImGuiDialog and of the game so it can be driven headlessly in tests.
#pragma once

#include "donelys_menu_model.h"

#include <imgui.h>

#include <array>
#include <filesystem>
#include <functional>
#include <optional>
#include <string>
#include <vector>

namespace n3::menu {

struct ViewHooks {
  std::filesystem::path config_path;                    // n3.toml of the active profile
  std::function<bool(unsigned, unsigned)> apply_graphics;  // ApplyGraphicsChoice(row, index)
  std::function<void(bool)> set_fullscreen;               // changes the real window, not just the cvar
  std::function<void(bool)> notify_saved;                 // toast after saving
  std::function<void()> request_close;                    // asks the app to destroy the menu
};

struct ButtonRect {
  std::string id;  // "Idioma", "Español##n3_text_language", "Guardar" ...
  ImVec2 min, max;
};

class MenuView {
 public:
  explicit MenuView(ViewHooks hooks) : hooks_(std::move(hooks)) {}
  void Draw(ImGuiIO& io);

  const std::vector<ButtonRect>& buttons() const { return buttons_; }
  const std::string& status() const { return status_; }
  bool status_ok() const { return status_ok_; }

 private:
  void DrawSetting(const Setting& setting);
  void Apply(const Setting& setting, std::size_t index);
  void Save();
  void ApplyPreset(const Preset& preset);
  void Undo();

  ViewHooks hooks_;
  std::vector<ButtonRect> buttons_;
  std::string status_ = "Los cambios gráficos se aplican al momento.";
  bool status_ok_ = true;
  // Row 1..5 choice indexes before the first preset, so "Deshacer" returns to the user's own values.
  std::optional<std::array<std::size_t, 6>> undo_;
};

}  // namespace n3::menu
