#pragma once

#include <filesystem>
#include <functional>
#include <memory>
#include <rex/ui/imgui_dialog.h>

namespace n3::menu {

struct MenuHooks {
  std::filesystem::path config_path;        // n3.toml of the active profile
  std::function<void(bool)> set_fullscreen;  // changes the real window, not just the cvar
  std::function<void()> request_close;       // asks the app to destroy the menu (never from inside OnDraw)
};

// Interactive menu: tabs Idioma / Gráficos / Ventana. Opened by the app on bind_donelys_menu (F5 by default).
std::unique_ptr<rex::ui::ImGuiDialog> CreateDonelysMenu(rex::ui::ImGuiDrawer* drawer, MenuHooks hooks);

}  // namespace n3::menu
