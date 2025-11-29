// Interval tracking and merging utilities

/**
 * Merge overlapping intervals to get unique watched segments
 * This is the core algorithm that prevents double-counting
 */
export function mergeIntervals(intervals) {
  if (intervals.length === 0) return [];

  // Sort intervals by start time
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  
  const merged = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    // If current interval overlaps with or is adjacent to the last merged interval
    if (current.start <= last.end) {
      // Extend the last interval if needed
      last.end = Math.max(last.end, current.end);
    } else {
      // No overlap, add as new interval
      merged.push(current);
    }
  }

  return merged;
}

/**
 * Calculate total unique seconds watched from merged intervals
 */
export function calculateTotalWatched(intervals) {
  const merged = mergeIntervals(intervals);
  return merged.reduce((total, interval) => total + (interval.end - interval.start), 0);
}

/**
 * Calculate progress percentage
 */
export function calculateProgressPercentage(intervals, totalDuration) {
  if (totalDuration === 0) return 0;
  const totalWatched = calculateTotalWatched(intervals);
  return Math.min(100, (totalWatched / totalDuration) * 100);
}

/**
 * Add a new interval and return merged result
 */
export function addInterval(existingIntervals, newInterval) {
  return mergeIntervals([...existingIntervals, newInterval]);
}

/**
 * Check if a specific second has been watched
 */
export function isSecondWatched(intervals, second) {
  const merged = mergeIntervals(intervals);
  return merged.some(interval => second >= interval.start && second < interval.end);
}

/**
 * Format seconds to MM:SS display
 */
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get unwatched segments for visualization
 */
export function getUnwatchedSegments(intervals, totalDuration) {
  const merged = mergeIntervals(intervals);
  const unwatched = [];
  
  let currentStart = 0;
  
  for (const interval of merged) {
    if (interval.start > currentStart) {
      unwatched.push({ start: currentStart, end: interval.start });
    }
    currentStart = interval.end;
  }
  
  if (currentStart < totalDuration) {
    unwatched.push({ start: currentStart, end: totalDuration });
  }
  
  return unwatched;
}
