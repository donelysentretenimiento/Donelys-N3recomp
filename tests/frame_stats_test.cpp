#include "frame_stats.h"
#include <cmath>
#include <iostream>
#include <stdexcept>
#include <string>

using n3::frames::FrameStats;

namespace {
void Require(bool ok, const std::string& what) {
  if (!ok) throw std::runtime_error(what);
}
bool Near(double a, double b) { return std::fabs(a - b) < 1e-6; }
}  // namespace

int main() {
  try {
    FrameStats empty;
    Require(empty.Summarize().frames == 0 && empty.Summarize().fps == 0, "no frames, no statistics");

    // A steady 60 FPS: every statistic equals the period and nothing is a spike.
    FrameStats steady;
    for (int i = 0; i < 120; ++i) steady.Add(16667);
    const auto a = steady.Summarize();
    Require(a.frames == 120 && std::fabs(a.fps - 60.0) < 0.01 && Near(a.p95_ms, 16.667) && Near(a.p99_ms, 16.667) && Near(a.max_ms, 16.667) && a.spikes == 0,
            "steady 60 fps must report 60 fps with no spikes");

    // 98 good frames and 2 hitches of 100 ms: the mean hides them, P99 and max show them.
    FrameStats hitch;
    for (int i = 0; i < 98; ++i) hitch.Add(16667);
    hitch.Add(100000);
    hitch.Add(100000);
    const auto b = hitch.Summarize();
    Require(b.spikes == 2, "two hitches must count as two spikes");
    Require(Near(b.max_ms, 100.0) && Near(b.p99_ms, 100.0), "P99 and max must expose the hitches");
    Require(Near(b.p95_ms, 16.667), "P95 ignores two outliers in 100 frames");
    Require(b.mean_ms > 16.667 && b.fps < 60.0, "the mean must include the hitches");

    // Nearest-rank on a tiny sample, unsorted input, and bad intervals ignored.
    FrameStats small;
    for (int v : {30000, 10000, 20000, 0, -5}) small.Add(v);
    const auto c = small.Summarize();
    Require(c.frames == 3 && Near(c.p95_ms, 30.0) && Near(c.mean_ms, 20.0), "sorted nearest-rank, zero and negative intervals dropped");

    small.Reset();
    Require(small.Summarize().frames == 0, "reset empties the window");
    std::cout << "Frame statistics passed\n";
  } catch (const std::exception& e) {
    std::cerr << e.what() << '\n';
    return 1;
  }
}
