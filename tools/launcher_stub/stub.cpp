// DONELYS N3.exe: arranque del paquete portátil. Abre DONELYS-N3\DONELYS N3.exe (el launcher) desde su carpeta,
// para que el usuario tenga un ejecutable con el icono propio en la raíz en lugar de un .cmd.
// Starts DONELYS-N3\DONELYS N3.exe (the launcher) so the package root has an executable with our own icon.
#include <windows.h>

#include <string>

int WINAPI wWinMain(HINSTANCE, HINSTANCE, PWSTR args, int) {
  wchar_t self[MAX_PATH];
  const DWORD length = GetModuleFileNameW(nullptr, self, MAX_PATH);
  std::wstring dir(self, length);
  dir.resize(dir.find_last_of(L"\\/") + 1);
  const std::wstring app_dir = dir + L"DONELYS-N3\\";
  const std::wstring exe = app_dir + L"DONELYS N3.exe";

  const auto fail = [&](const std::wstring& text) {
    MessageBoxW(nullptr, (text + L"\n\n" + exe).c_str(), L"DONELYS N3", MB_ICONERROR | MB_OK);
    return 1;
  };
  if (GetFileAttributesW(exe.c_str()) == INVALID_FILE_ATTRIBUTES)
    return fail(L"No se encuentra la carpeta DONELYS-N3 junto a este programa. Descomprime el ZIP entero y no muevas este archivo.\n\n"
                L"The DONELYS-N3 folder is missing next to this program. Extract the whole ZIP and do not move this file.");

  std::wstring command = L"\"" + exe + L"\" " + (args ? args : L"");
  STARTUPINFOW startup{sizeof(startup)};
  PROCESS_INFORMATION process{};
  if (!CreateProcessW(exe.c_str(), command.data(), nullptr, nullptr, FALSE, 0, nullptr, app_dir.c_str(), &startup, &process))
    return fail(L"No se pudo abrir el launcher.\n\nCould not start the launcher.");
  CloseHandle(process.hThread);
  CloseHandle(process.hProcess);
  return 0;
}
