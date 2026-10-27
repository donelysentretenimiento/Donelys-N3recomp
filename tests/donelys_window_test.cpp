#include "donelys_window.h"
#include <iostream>
#include <stdexcept>

using namespace n3::donelys;

int main() {
  try {
    // WS_OVERLAPPEDWINDOW | WS_VISIBLE | WS_CLIPSIBLINGS, as a normal top-level window.
    constexpr uint32_t normal = 0x00CF0000 | 0x10000000 | 0x04000000;
    constexpr uint32_t bare = BorderlessStyle(normal);
    static_assert(!HasCaption(bare));
    if (!HasCaption(normal)) throw std::runtime_error("a normal window has a caption");
    if (bare & (kStyleThickFrame | kStyleSysMenu)) throw std::runtime_error("resize border and system menu must go too");
    if ((bare & 0x10000000) == 0 || (bare & 0x04000000) == 0) throw std::runtime_error("visibility and clipping bits must survive");
    if (BorderlessStyle(bare) != bare) throw std::runtime_error("borderless must be idempotent");
    // 0x00BBGGRR: red is the low byte.
    if (ToColorRef(1.0f, 0.0f, 0.0f) != 0x0000FF || ToColorRef(0.0f, 0.0f, 1.0f) != 0xFF0000) throw std::runtime_error("COLORREF byte order");
    if (ToColorRef(0.0f, 1.0f, 0.0f) != 0x00FF00) throw std::runtime_error("COLORREF green");
    std::cout << "Donelys window style policy passed\n";
  } catch (const std::exception& e) {
    std::cerr << e.what() << '\n';
    return 1;
  }
}
