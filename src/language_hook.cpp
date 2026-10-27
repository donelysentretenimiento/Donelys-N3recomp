// Mid-asm hook for the two guest call sites of XGetLanguage (see n3_manifest.toml).
// The SDK always answers English; the game picks its text tables and fonts from this value.
#include "text_language.h"

#include <rex/cvar.h>
#include <rex/ppc.h>

REXCVAR_DEFINE_STRING(n3_text_language, "english", "N3/Language",
                      "Language of the game text and fonts (restart required)")
    .allowed({"english", "german", "french", "spanish", "italian"});

void N3GetTextLanguage(PPCRegister& r3) { r3.u64 = n3::language::Code(REXCVAR_GET(n3_text_language)); }
