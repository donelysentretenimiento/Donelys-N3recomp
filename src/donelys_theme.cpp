#include "donelys_theme.h"

#include "donelys_palette.h"

namespace {
using n3::donelys::Rgb;
namespace pal = n3::donelys::palette;

ImVec4 Color(const Rgb& c, float alpha = 1.0f) { return {c.r, c.g, c.b, alpha}; }
}  // namespace

void ApplyDonelysTheme(ImGuiStyle& style, rex::ui::Style& ui) {
  style.WindowRounding = 12.0f;
  style.ChildRounding = 10.0f;
  style.PopupRounding = 10.0f;
  style.FrameRounding = 8.0f;
  style.GrabRounding = 8.0f;
  style.TabRounding = 8.0f;
  style.ScrollbarRounding = 8.0f;
  style.WindowBorderSize = 1.0f;
  style.FrameBorderSize = 0.0f;
  style.WindowPadding = {14.0f, 12.0f};
  style.ItemSpacing = {10.0f, 9.0f};
  style.FramePadding = {12.0f, 7.0f};
  style.TabBorderSize = 0.0f;
  style.SeparatorTextBorderSize = 1.0f;

  auto* c = style.Colors;
  c[ImGuiCol_Text] = Color(pal::kText);
  c[ImGuiCol_TextDisabled] = Color(pal::kTextMuted);
  c[ImGuiCol_WindowBg] = Color(pal::kBackground, 0.94f);
  c[ImGuiCol_ChildBg] = Color(pal::kPanel, 0.80f);
  c[ImGuiCol_PopupBg] = Color(pal::kPanel, 0.97f);
  c[ImGuiCol_Border] = Color(pal::kGold, 0.28f);
  c[ImGuiCol_FrameBg] = Color(pal::kPanelRaised, 0.90f);
  c[ImGuiCol_FrameBgHovered] = Color(pal::kCrimsonDark, 0.70f);
  c[ImGuiCol_FrameBgActive] = Color(pal::kCrimson, 0.80f);
  c[ImGuiCol_TitleBg] = Color(pal::kBackground);
  c[ImGuiCol_TitleBgActive] = Color(pal::kCrimsonDark);
  c[ImGuiCol_TitleBgCollapsed] = Color(pal::kBackground, 0.80f);
  c[ImGuiCol_MenuBarBg] = Color(pal::kPanel);
  c[ImGuiCol_ScrollbarBg] = Color(pal::kBackground, 0.50f);
  c[ImGuiCol_ScrollbarGrab] = Color(pal::kCrimsonDark);
  c[ImGuiCol_ScrollbarGrabHovered] = Color(pal::kCrimson);
  c[ImGuiCol_ScrollbarGrabActive] = Color(pal::kGold);
  c[ImGuiCol_CheckMark] = Color(pal::kGold);
  c[ImGuiCol_SliderGrab] = Color(pal::kGold);
  c[ImGuiCol_SliderGrabActive] = Color(pal::kText);
  c[ImGuiCol_Button] = Color(pal::kCrimsonDark);
  c[ImGuiCol_ButtonHovered] = Color(pal::kCrimson);
  c[ImGuiCol_ButtonActive] = Color(pal::kGold);
  c[ImGuiCol_Header] = Color(pal::kCrimsonDark, 0.65f);
  c[ImGuiCol_HeaderHovered] = Color(pal::kCrimson, 0.80f);
  c[ImGuiCol_HeaderActive] = Color(pal::kCrimson);
  c[ImGuiCol_Separator] = Color(pal::kGold, 0.22f);
  c[ImGuiCol_SeparatorHovered] = Color(pal::kGold, 0.60f);
  c[ImGuiCol_SeparatorActive] = Color(pal::kGold);
  c[ImGuiCol_ResizeGrip] = Color(pal::kCrimsonDark, 0.60f);
  c[ImGuiCol_ResizeGripHovered] = Color(pal::kCrimson);
  c[ImGuiCol_ResizeGripActive] = Color(pal::kGold);
  c[ImGuiCol_Tab] = Color(pal::kPanel);
  c[ImGuiCol_TabHovered] = Color(pal::kCrimson);
  c[ImGuiCol_TabSelected] = Color(pal::kCrimsonDark);
  c[ImGuiCol_TabDimmed] = Color(pal::kBackground);
  c[ImGuiCol_TabDimmedSelected] = Color(pal::kPanelRaised);
  c[ImGuiCol_TextSelectedBg] = Color(pal::kCrimson, 0.45f);
  c[ImGuiCol_NavCursor] = Color(pal::kGold);

  ui.settings.warning = Color(pal::kWarn);
  ui.settings.lifecycle_live = Color(pal::kOk);
  ui.settings.lifecycle_restart = Color(pal::kWarn);
  ui.settings.lifecycle_init_only = Color(pal::kBad);
  ui.settings.lifecycle_unknown = Color(pal::kTextMuted);

  ui.debug.muted_text = Color(pal::kTextMuted);
  ui.console.completion_bg = Color(pal::kPanel, 0.96f);
  ui.console.completion_highlight = Color(pal::kCrimson, 0.75f);
  ui.console.level[2] = Color(pal::kText);
  ui.console.level[3] = Color(pal::kWarn);
  ui.console.level[4] = Color(pal::kBad);

  ui.toast.title = Color(pal::kGold);
  ui.toast.text = Color(pal::kText);
  ui.toast.rounding = 10.0f;

  ui.achievements.unlocked_title = Color(pal::kOk);
  ui.achievements.header_text = Color(pal::kGold);
  ui.achievements.badge_gamerscore = Color(pal::kGold);
  ui.achievements.progress_bar = Color(pal::kCrimson);
  ui.achievements.row_unlocked_bg = Color(pal::kCrimsonDark, 0.55f);
  ui.achievements.row_rounding = 8.0f;
}
