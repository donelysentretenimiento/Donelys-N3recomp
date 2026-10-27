#pragma once

#include <imgui.h>
#include <rex/ui/style.h>

// Paints the SDK overlays (F4 settings, console, toasts, debug) with the Donelys palette.
void ApplyDonelysTheme(ImGuiStyle& imgui_style, rex::ui::Style& ui_style);
