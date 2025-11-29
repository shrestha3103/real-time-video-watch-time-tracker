import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  addInterval, 
  calculateProgressPercentage, 
  calculateTotalWatched,
  mergeIntervals 
} from '@/lib/intervalUtils';

const STORAGE_KEY = 'video_progress';

export function useVideoProgress(videoId = 'default') {
  const [intervals, setIntervals] = useState([]);
  const [lastPosition, setLastPosition] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  
  const currentIntervalStart = useRef(null);
  const lastRecordedTime = useRef(0);

  // Load saved progress from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(`${STORAGE_KEY}_${videoId}`);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setIntervals(data.intervals || []);
        setLastPosition(data.lastPosition || 0);
        setTotalDuration(data.totalDuration || 0);
      } catch (e) {
        console.error('Error loading progress:', e);
      }
    }
  }, [videoId]);

  // Save progress to localStorage
  const saveProgress = useCallback((
    newIntervals, 
    position, 
    duration
  ) => {
    const data = {
      intervals: newIntervals,
      lastPosition: position,
      totalDuration: duration,
    };
    localStorage.setItem(`${STORAGE_KEY}_${videoId}`, JSON.stringify(data));
  }, [videoId]);

  // Start tracking when video plays
  const startTracking = useCallback((currentTime) => {
    if (!isTracking) {
      setIsTracking(true);
      currentIntervalStart.current = currentTime;
      lastRecordedTime.current = currentTime;
    }
  }, [isTracking]);

  // Stop tracking and save interval
  const stopTracking = useCallback((currentTime) => {
    if (isTracking && currentIntervalStart.current !== null) {
      setIsTracking(false);
      
      const start = currentIntervalStart.current;
      const end = currentTime;
      
      // Only add interval if we actually watched something (at least 0.5 second)
      if (end - start >= 0.5) {
        setIntervals(prev => {
          const newIntervals = addInterval(prev, { start, end });
          saveProgress(newIntervals, currentTime, totalDuration);
          return newIntervals;
        });
      }
      
      currentIntervalStart.current = null;
    }
    setLastPosition(currentTime);
  }, [isTracking, totalDuration, saveProgress]);

  // Handle seeking - creates a gap in tracking
  const handleSeek = useCallback((newTime) => {
    // If we were tracking, save the current interval first
    if (isTracking && currentIntervalStart.current !== null) {
      const start = currentIntervalStart.current;
      const end = lastRecordedTime.current;
      
      if (end - start >= 0.5) {
        setIntervals(prev => {
          const newIntervals = addInterval(prev, { start, end });
          saveProgress(newIntervals, newTime, totalDuration);
          return newIntervals;
        });
      }
    }
    
    // Start a new tracking interval from the seek position
    currentIntervalStart.current = newTime;
    lastRecordedTime.current = newTime;
    setLastPosition(newTime);
  }, [isTracking, totalDuration, saveProgress]);

  // Update current time during playback
  const updateTime = useCallback((currentTime) => {
    // Detect if user skipped (jumped more than 2 seconds forward)
    const timeDiff = currentTime - lastRecordedTime.current;
    
    if (timeDiff > 2 || timeDiff < -0.5) {
      // User skipped - save current interval and start new one
      handleSeek(currentTime);
    } else {
      lastRecordedTime.current = currentTime;
    }
  }, [handleSeek]);

  // Set duration when video loads
  const setDuration = useCallback((duration) => {
    setTotalDuration(duration);
  }, []);

  // Reset progress
  const resetProgress = useCallback(() => {
    setIntervals([]);
    setLastPosition(0);
    currentIntervalStart.current = null;
    lastRecordedTime.current = 0;
    localStorage.removeItem(`${STORAGE_KEY}_${videoId}`);
  }, [videoId]);

  // Calculate derived values
  const mergedIntervals = mergeIntervals(intervals);
  const progressPercentage = calculateProgressPercentage(intervals, totalDuration);
  const totalWatchedSeconds = calculateTotalWatched(intervals);

  return {
    intervals: mergedIntervals,
    progressPercentage,
    totalWatchedSeconds,
    totalDuration,
    lastPosition,
    isTracking,
    startTracking,
    stopTracking,
    handleSeek,
    updateTime,
    setDuration,
    resetProgress,
  };
}
