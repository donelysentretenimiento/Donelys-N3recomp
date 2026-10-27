// Frame-time statistics for the optional frame_pacing_trace log. Pure so it can be tested.
#pragma once

#include <algorithm>
#include <cstddef>
#include <cstdint>
#include <vector>

namespace n3::frames {

struct FrameSummary {
  std::size_t frames = 0;
  double fps = 0;
  double mean_ms = 0, p95_ms = 0, p99_ms = 0, max_ms = 0;
  std::size_t spikes = 0;  // frames longer than twice the mean
};

class FrameStats {
 public:
  void Add(int64_t interval_us) {
    if (interval_us > 0) intervals_.push_back(interval_us);
  }
  void Reset() { intervals_.clear(); }

  FrameSummary Summarize() const {
    FrameSummary s;
    s.frames = intervals_.size();
    if (intervals_.empty()) return s;
    std::vector<int64_t> sorted(intervals_);
    std::sort(sorted.begin(), sorted.end());
    int64_t total = 0;
    for (auto v : sorted) total += v;
    const double mean_us = static_cast<double>(total) / sorted.size();
    s.mean_ms = mean_us / 1000.0;
    s.fps = 1e6 / mean_us;
    s.p95_ms = Percentile(sorted, 95) / 1000.0;
    s.p99_ms = Percentile(sorted, 99) / 1000.0;
    s.max_ms = sorted.back() / 1000.0;
    for (auto v : sorted) s.spikes += v > 2 * mean_us;
    return s;
  }

 private:
  // Nearest-rank percentile over a sorted, non-empty list.
  static double Percentile(const std::vector<int64_t>& sorted, unsigned p) {
    const std::size_t rank = (sorted.size() * p + 99) / 100;  // ceil(n * p / 100)
    return static_cast<double>(sorted[std::max<std::size_t>(rank, 1) - 1]);
  }
  std::vector<int64_t> intervals_;
};

}  // namespace n3::frames
