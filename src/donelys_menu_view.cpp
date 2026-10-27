#include "donelys_menu_view.h"

#include "donelys_palette.h"
#include "profile_config.h"

#include <rex/cvar.h>
#include <rex/logging.h>

#include <algorithm>

namespace n3::menu {
namespace {
namespace pal = n3::donelys::palette;

ImVec4 Color(const donelys::Rgb& c, float alpha = 1.0f) { return {c.r, c.g, c.b, alpha}; }
}  // namespace

void MenuView::Draw(ImGuiIO& io) {
  buttons_.clear();
  if (ImGui::IsKeyPressed(ImGuiKey_Escape, false) && hooks_.request_close) hooks_.request_close();

  ImGui::SetNextWindowPos({io.DisplaySize.x * 0.5f, io.DisplaySize.y * 0.5f}, ImGuiCond_Always, {0.5f, 0.5f});
  ImGui::SetNextWindowSize({std::min(760.0f, io.DisplaySize.x * 0.9f), std::min(520.0f, io.DisplaySize.y * 0.9f)},
                           ImGuiCond_Always);
  constexpr auto flags = ImGuiWindowFlags_NoCollapse | ImGuiWindowFlags_NoResize | ImGuiWindowFlags_NoMove |
                         ImGuiWindowFlags_NoSavedSettings;
  io.ConfigFlags |= ImGuiConfigFlags_NavEnableKeyboard;  // arrows + Enter work too (the SDK feeds no gamepad to ImGui)
  if (ImGui::Begin("DONELYS · N3: NINETY-NINE NIGHTS", nullptr, flags)) {
    ImGui::SetWindowFontScale(1.15f);
    ImGui::TextColored(Color(pal::kGold), "DONELYS ENTRETENIMIENTO");
    ImGui::TextColored(Color(pal::kTextMuted), "Ajustes del juego");
    ImGui::Separator();
    if (ImGui::BeginTabBar("##tabs")) {
      auto tab = [this](const char* title, std::span<const Setting> settings, const char* note, bool presets = false) {
        const bool open = ImGui::BeginTabItem(title);
        buttons_.push_back({title, ImGui::GetItemRectMin(), ImGui::GetItemRectMax()});
        if (!open) return;
        ImGui::Spacing();
        if (presets) {
          ImGui::TextColored(Color(pal::kGold), "Perfiles");
          for (const auto& preset : kPresets) {
            const std::string id = std::string(preset.label) + "##preset";
            if (ImGui::Button(id.c_str(), {132.0f, 0.0f})) ApplyPreset(preset);
            buttons_.push_back({id, ImGui::GetItemRectMin(), ImGui::GetItemRectMax()});
            ImGui::SameLine();
          }
          if (ImGui::Button("Deshacer##preset", {132.0f, 0.0f})) Undo();
          buttons_.push_back({"Deshacer##preset", ImGui::GetItemRectMin(), ImGui::GetItemRectMax()});
          ImGui::Separator();
          ImGui::Spacing();
        }
        for (const auto& setting : settings) DrawSetting(setting);
        if (note) {
          ImGui::Spacing();
          ImGui::PushTextWrapPos(0.0f);
          ImGui::TextColored(Color(pal::kTextMuted), "%s", note);
          ImGui::PopTextWrapPos();
        }
        ImGui::EndTabItem();
      };
      tab("Idioma", kLanguageSettings,
          "Los textos y las fuentes se cargan al arrancar: reinicia el juego tras cambiar el idioma. "
          "Las voces se eligen en el launcher.");
      tab("Gráficos", kGraphicsSettings, nullptr, true);
      tab("Ventana", kWindowSettings, "El modo sin borde se aplica al arrancar y solo con la ventana en modo ventana.");
      ImGui::EndTabBar();
    }
    ImGui::SetCursorPosY(ImGui::GetWindowHeight() - 62.0f);
    ImGui::Separator();
    if (ImGui::Button("Guardar en n3.toml")) Save();
    buttons_.push_back({"Guardar", ImGui::GetItemRectMin(), ImGui::GetItemRectMax()});
    ImGui::SameLine();
    ImGui::TextColored(Color(status_ok_ ? pal::kOk : pal::kBad), "%s", status_.c_str());
    ImGui::TextColored(Color(pal::kTextMuted), "F5 o Esc: cerrar    F4: ajustes técnicos del SDK");
  }
  ImGui::End();
}

void MenuView::DrawSetting(const Setting& setting) {
  const std::string current = rex::cvar::GetFlagByName(std::string(setting.cvar));
  const auto selected = IndexOf(setting, current);
  ImGui::TextColored(Color(pal::kGold), "%s", std::string(setting.label).c_str());
  if (setting.needs_restart) {
    ImGui::SameLine();
    ImGui::TextColored(Color(pal::kWarn), "(requiere reinicio)");
  }
  for (std::size_t i = 0; i < setting.choices.size(); ++i) {
    if (i) ImGui::SameLine();
    const bool on = i == selected;
    ImGui::PushStyleColor(ImGuiCol_Button, Color(on ? pal::kCrimson : pal::kPanelRaised));
    ImGui::PushStyleColor(ImGuiCol_Text, Color(pal::kText));
    const std::string id = std::string(setting.choices[i].label) + "##" + std::string(setting.cvar);
    const bool clicked = ImGui::Button(id.c_str(), {96.0f, 0.0f});
    buttons_.push_back({id, ImGui::GetItemRectMin(), ImGui::GetItemRectMax()});
    ImGui::PopStyleColor(2);
    if (clicked && !on) Apply(setting, i);
  }
  ImGui::Spacing();
}

void MenuView::Apply(const Setting& setting, std::size_t index) {
  bool ok = false;
  if (setting.graphics_row != 0) {
    ok = hooks_.apply_graphics && hooks_.apply_graphics(setting.graphics_row, static_cast<unsigned>(index));
  } else if (setting.cvar == "fullscreen") {
    const bool on = setting.choices[index].value == "true";
    ok = rex::cvar::SetFlagByName("fullscreen", on ? "true" : "false");
    if (ok && hooks_.set_fullscreen) hooks_.set_fullscreen(on);
  } else {
    ok = rex::cvar::SetFlagByName(std::string(setting.cvar), std::string(setting.choices[index].value));
  }
  status_ok_ = ok;
  status_ = ok ? "Aplicado. Pulsa «Guardar» para conservarlo." : "No se pudo aplicar ese valor.";
  if (!ok) REXLOG_WARN("Donelys menu: {}={} was refused", setting.cvar, setting.choices[index].value);
}

void MenuView::ApplyPreset(const Preset& preset) {
  if (!undo_) {
    undo_.emplace();
    for (unsigned row = 1; row <= 5; ++row) {
      const auto* setting = ByGraphicsRow(row);
      (*undo_)[row] = setting ? IndexOf(*setting, rex::cvar::GetFlagByName(std::string(setting->cvar))) : kNoChoice;
    }
  }
  bool ok = true;
  for (const auto& entry : preset.entries) ok = hooks_.apply_graphics && hooks_.apply_graphics(entry.row, entry.index) && ok;
  status_ok_ = ok;
  status_ = ok ? "Perfil aplicado. «Deshacer» recupera tus valores; «Guardar» lo conserva." : "No se pudo aplicar todo el perfil.";
}

void MenuView::Undo() {
  if (!undo_) {
    status_ok_ = true;
    status_ = "No hay nada que deshacer.";
    return;
  }
  bool ok = true;
  for (unsigned row = 1; row <= 5; ++row)
    if ((*undo_)[row] != kNoChoice) ok = hooks_.apply_graphics && hooks_.apply_graphics(row, static_cast<unsigned>((*undo_)[row])) && ok;
  undo_.reset();
  status_ok_ = ok;
  status_ = ok ? "Valores anteriores recuperados." : "No se pudieron recuperar todos los valores.";
}

void MenuView::Save() {
  try {
    SaveProfileConfig(hooks_.config_path);
    status_ok_ = true;
    status_ = "Guardado en n3.toml.";
  } catch (...) {
    status_ok_ = false;
    status_ = "No se pudo guardar n3.toml.";
  }
  if (hooks_.notify_saved) hooks_.notify_saved(status_ok_);
}

}  // namespace n3::menu
