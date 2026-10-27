// n3 - ReXGlue Recompiled Project
//
// Customize your app by overriding virtual hooks from rex::ReXApp.

#pragma once

#include <rex/rex_app.h>
#include "crash_diagnostics.h"
#include "app_icon.h"
#include "runtime_fixes.h"
#include "game_setup.h"
#include "frame_rate.h"
#include "graphics_menu.h"
#include "display_settings.h"
#include "profile_config.h"
#include "graphics_notification.h"
#include "graphics_audit.h"
#include "donelys_defaults.h"
#include "donelys_theme.h"
#include "donelys_menu.h"
#include "donelys_window.h"
#include <rex/ui/keybinds.h>
#include <rex/ui/flags.h>
class N3App : public rex::ReXApp {
 public:
  using rex::ReXApp::ReXApp;

  static std::unique_ptr<rex::ui::WindowedApp> Create(
      rex::ui::WindowedAppContext& ctx) {
    return std::unique_ptr<N3App>(new N3App(ctx, "n3",
        PPCImageConfig));
  }

  void OnPreSetup(rex::RuntimeConfig& config) override {
    if (config.gpu_plugin.empty()) config.gpu_plugin = "xenos";
    if (rex::cvar::GetFlagSource("fullscreen") == rex::cvar::Source::kDefault)
      REXCVAR_SET(fullscreen, false);
    if (rex::cvar::GetFlagSource("window_width") == rex::cvar::Source::kDefault)
      REXCVAR_SET(window_width, 1280);
    if (rex::cvar::GetFlagSource("window_height") == rex::cvar::Source::kDefault)
      REXCVAR_SET(window_height, 720);
    // After the defaults above, so the Donelys profile wins over them but never over the user's own values.
    n3::donelys::ApplyDonelysDefaults();
  }

  void OnConfigureStyle(ImGuiStyle& imgui_style, rex::ui::Style& ui_style) override {
    ApplyDonelysTheme(imgui_style, ui_style);
  }

  void OnPostSetup() override {
    ApplyAppIcon(*window());
    // The GPU cvars (render scale, anisotropy) only exist now; values already written are skipped.
    n3::donelys::ApplyDonelysDefaults();
    // Before the display size is applied so the client area is computed for the final window style.
    n3::donelys::ApplyDonelysWindow(*window());
    InstallDisplaySettings(app_context(), *window());
    InstallGraphicsAudit(app_context());
  }
  void OnCreateDialogs(rex::ui::ImGuiDrawer* drawer) override {
    graphics_notification_ = CreateGraphicsNotification(drawer);
    // F5 by default; the SDK's technical settings panel keeps its own key (bind_settings, F4).
    rex::ui::RegisterBind("bind_donelys_menu", "F5", "Toggle Donelys menu", [this, drawer] {
      if (donelys_menu_) { donelys_menu_.reset(); return; }
      n3::menu::MenuHooks hooks;
      hooks.config_path = game_profile_ / "n3.toml";
      hooks.set_fullscreen = [this](bool on) { window()->SetFullscreen(on); };
      // The menu cannot destroy itself while it is drawing, so the app does it on the next UI tick.
      hooks.request_close = [this] { app_context().CallInUIThreadDeferred([this] { donelys_menu_.reset(); }); };
      donelys_menu_ = n3::menu::CreateDonelysMenu(drawer, std::move(hooks));
    });
  }
  void OnShutdown() override {
    donelys_menu_.reset();
    ShutdownGraphicsAudit(); graphics_notification_.reset(); ShutdownDisplaySettings();
  }
  void OnWindowPixelSizeChanged(uint32_t width, uint32_t height) override {
    RecordDisplayOutputSize(width, height);
  }

  void OnPostInitLogging() override { InstallCrashDiagnostics(game_profile_ / "logs"); }

  void OnPostLoadXexImage() override {
    InstallRuntimeFixes(*runtime());
    InitializeFrameRate();
    InstallGraphicsMenu(*runtime(), game_data_root(), user_data_root());
  }


  std::optional<rex::PathConfig> OnFinalizePaths(const rex::PathConfig& defaults,
      std::function<void(rex::PathConfig)>) override {
    auto paths = ResolveGameData(defaults);
    if (!paths && window()) window()->RequestClose();
    return paths;
  }

  void OnConfigurePaths(rex::PathConfig& paths) override {
    ConfigureGamePaths(paths);
    paths.config_path = paths.user_data_root / "n3.toml";
    RepairLegacyProfileConfig(paths.config_path);
  }

  void OnConfigureLogging(rex::LogConfig& config) override {
    config.log_dir = game_profile_ / "logs";
  }

 private:
  std::unique_ptr<rex::ui::ImGuiDialog> graphics_notification_;
  std::unique_ptr<rex::ui::ImGuiDialog> donelys_menu_;
  std::filesystem::path game_profile_;

  void ConfigureGamePaths(rex::PathConfig& paths) {
    ConfigureGameDataPaths(paths);
    game_profile_ = paths.user_data_root;
  }

  // Override virtual hooks for customization:
  // void OnLoadXexImage(std::string& xex_image) override {}
  // void OnPostSetup() override {}
  // void OnCreateDialogs(rex::ui::ImGuiDrawer* drawer) override {}
  // std::unique_ptr<rex::ui::ImGuiDialog> CreateAchievementsOverlay() override;
  // std::unique_ptr<rex::ui::AchievementNotificationDialog>
  // CreateAchievementNotificationDialog() override;
  // void OnShutdown() override {}
};
