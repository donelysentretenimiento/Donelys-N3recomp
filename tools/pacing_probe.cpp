// Measures how well this machine can hold a frame period with the same wait the game's limiter uses
// (std::this_thread::sleep_until, see PacePresent in src/frame_rate.cpp). It never starts the game.
//   n3_pacing_probe [frames=300]
// Output: effective FPS for targets 30/40/60 with the default timer, with a 1 ms timer, and with a
// high-resolution waitable timer. Informational: results depend on the machine, so nothing is asserted.
#include <windows.h>

#include <chrono>
#include <cstdio>
#include <cstdlib>
#include <thread>

using Clock = std::chrono::steady_clock;

namespace {
template <class Wait>
double Measure(unsigned target, int frames, Wait wait) {
  const auto period = std::chrono::nanoseconds(1000000000 / target);
  auto deadline = Clock::now() + period;
  const auto start = Clock::now();
  for (int i = 0; i < frames; ++i) {
    wait(deadline);
    auto now = Clock::now();
    deadline += period;
    if (now > deadline) deadline = now + period;  // same rule as the game: never catch up in a burst
  }
  const auto seconds = std::chrono::duration<double>(Clock::now() - start).count();
  return frames / seconds;
}

void Report(const char* label, int frames, auto wait) {
  std::printf("%-34s", label);
  for (unsigned target : {30u, 40u, 60u}) std::printf("  %2u -> %6.2f fps", target, Measure(target, frames, wait));
  std::printf("\n");
}
}  // namespace

int main(int argc, char** argv) {
  const int frames = argc > 1 ? std::atoi(argv[1]) : 300;
  TIMECAPS caps{};
  timeGetDevCaps(&caps, sizeof(caps));
  std::printf("timer resolution range: %u-%u ms\n", caps.wPeriodMin, caps.wPeriodMax);
  ULONG current = 0, minimum = 0, maximum = 0;
  using Query = LONG(NTAPI*)(PULONG, PULONG, PULONG);
  if (auto query = reinterpret_cast<Query>(GetProcAddress(GetModuleHandleW(L"ntdll.dll"), "NtQueryTimerResolution"))) {
    query(&minimum, &maximum, &current);
    std::printf("current timer resolution: %.3f ms (coarsest %.3f, finest %.3f)\n", current / 10000.0, minimum / 10000.0, maximum / 10000.0);
  }
  auto sleep_until = [](Clock::time_point deadline) { std::this_thread::sleep_until(deadline); };
  Report("sleep_until, default timer", frames, sleep_until);

  timeBeginPeriod(1);
  Report("sleep_until, timeBeginPeriod(1)", frames, sleep_until);
  timeEndPeriod(1);

  HANDLE timer = CreateWaitableTimerExW(nullptr, nullptr, CREATE_WAITABLE_TIMER_HIGH_RESOLUTION, TIMER_ALL_ACCESS);
  if (timer) {
    Report("high-resolution waitable timer", frames, [timer](Clock::time_point deadline) {
      const auto left = deadline - Clock::now();
      if (left.count() <= 0) return;
      LARGE_INTEGER due;
      due.QuadPart = -std::chrono::duration_cast<std::chrono::nanoseconds>(left).count() / 100;
      SetWaitableTimer(timer, &due, 0, nullptr, nullptr, FALSE);
      WaitForSingleObject(timer, INFINITE);
    });
    CloseHandle(timer);
  } else {
    std::printf("high-resolution waitable timer: unavailable\n");
  }
  return 0;
}
