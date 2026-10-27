# Contribuir · Contributing

**Español.** Gracias por el interés. Antes de abrir una incidencia o una *pull request*:

1. **No subas material del juego**: ni ISO, ni archivos extraídos, ni capturas con datos personales, ni `n3.toml` con rutas privadas. Revisa los
   registros antes de compartirlos: pueden contener rutas locales.
2. Para informar de un fallo indica: versión del launcher, versión de N3 Recompiled, edición del disco (PAL/JP/UNDUB), pasos para reproducirlo y
   el registro relevante (pestaña *Fuentes → Registro del juego*).
3. Los cambios de código deben pasar `node test/selftest.mjs`. Si añades una función que lee o escribe archivos del usuario, añade una prueba con
   carpetas temporales y respeta la regla del proyecto: **nunca modificar ISO, `n3.exe`, `rexruntime.dll` ni la carpeta del juego**.
4. Estilo: ESM (`.mjs`), sin dependencias nuevas salvo que sean imprescindibles, comentarios solo para explicar el *porqué*.
5. Lo afirmado como «comprobado» debe poder reproducirse; lo no verificado se marca como tal.

Al contribuir aceptas que tu aportación se publique bajo [GPL-3.0-or-later](LICENSE).

**English.** Thanks for your interest. Before opening an issue or pull request:

1. **Do not upload game material**: no ISOs, extracted files, screenshots with personal data, or `n3.toml` with private paths. Review logs before
   sharing them: they may contain local paths.
2. For bug reports include: launcher version, N3 Recompiled version, disc edition (PAL/JP/UNDUB), reproduction steps and the relevant log
   (*Fuentes → Registro del juego*).
3. Code changes must pass `node test/selftest.mjs`. If you add something that reads or writes user files, add a test using temporary folders and
   keep the project rule: **never modify the ISO, `n3.exe`, `rexruntime.dll` or the game folder**.
4. Style: ESM (`.mjs`), no new dependencies unless essential, comments only to explain *why*.
5. Anything claimed as "verified" must be reproducible; anything unverified is labelled as such.

By contributing you agree your work is published under [GPL-3.0-or-later](LICENSE).
