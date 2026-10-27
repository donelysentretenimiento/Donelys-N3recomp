#include "donelys_menu.h"

#include "donelys_menu_view.h"
#include "graphics_notification.h"
#include "graphics_settings.h"

namespace n3::menu {
namespace {

// Thin ImGuiDialog around MenuView; the game-side services are plugged in here.
class DonelysMenu final : public rex::ui::ImGuiDialog {
 public:
  DonelysMenu(rex::ui::ImGuiDrawer* drawer, MenuHooks hooks)
      : ImGuiDialog(drawer),
        view_({std::move(hooks.config_path), ApplyGraphicsChoice, std::move(hooks.set_fullscreen),
               NotifyGraphicsSaved, std::move(hooks.request_close)}) {}

 private:
  void OnDraw(ImGuiIO& io) override { view_.Draw(io); }

  MenuView view_;
};
}  // namespace

std::unique_ptr<rex::ui::ImGuiDialog> CreateDonelysMenu(rex::ui::ImGuiDrawer* drawer, MenuHooks hooks) {
  return std::make_unique<DonelysMenu>(drawer, std::move(hooks));
}

}  // namespace n3::menu
