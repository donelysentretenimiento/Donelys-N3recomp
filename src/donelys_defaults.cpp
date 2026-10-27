#include "donelys_defaults.h"

#include <rex/cvar.h>
#include <rex/logging.h>

REXCVAR_DEFINE_BOOL(n3_donelys_defaults, true, "N3/Window", "Start with the Donelys graphics profile and F5 settings key");

namespace n3::donelys {

void ApplyDonelysDefaults() {
  if (!REXCVAR_GET(n3_donelys_defaults)) return;
  const auto written = ApplyDefaults(
      [](std::string_view name) { return rex::cvar::GetFlagSource(name) == rex::cvar::Source::kDefault; },
      [](std::string_view name, std::string_view value) {
        const bool ok = rex::cvar::SetFlagByName(name, value);
        // Expected on the first pass for cvars that register later; the second pass retries them.
        if (!ok) REXLOG_DEBUG("Donelys default {}={} was not accepted", name, value);
        return ok;
      });
  REXLOG_INFO("Donelys defaults applied: {} values", written);
}

void ApplyDonelysKeybind() {
  if (!REXCVAR_GET(n3_donelys_defaults)) return;
  if (rex::cvar::GetFlagSource(kSettingsKeyName) == rex::cvar::Source::kDefault)
    rex::cvar::SetFlagByName(kSettingsKeyName, kSettingsKey);
}

}  // namespace n3::donelys
