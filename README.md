# 🎬 Real-Time Video Watch-Time Tracker

A sophisticated video progress tracking system designed for online learning platforms that accurately measures unique video consumption, prevents gaming through skipping, and provides persistent progress tracking.

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react)
![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?style=flat&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Core Concepts](#core-concepts)
- [How It Works](#how-it-works)
- [Component Breakdown](#component-breakdown)
- [Industry Applications](#industry-applications)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)

---

## Overview

Traditional video players track progress linearly, allowing users to skip to the end and mark content as "complete." This tracker solves that problem by monitoring **actual unique segments watched**, ensuring learners genuinely engage with content before receiving completion credit.

### The Problem with Traditional Tracking

```
Traditional: User skips to 95% → Shows 95% complete ❌
This System: User skips to 95% → Shows only actually watched segments ✅
```

---

## Key Features

| Feature | Description |
|---------|-------------|
| 🎯 **Interval-Based Tracking** | Tracks exact start/end times of watched segments |
| 🔄 **Intelligent Merging** | Combines overlapping intervals to prevent double-counting |
| ⏭️ **Skip Detection** | Automatically detects when users skip ahead or back |
| 💾 **Persistent Storage** | Saves progress to localStorage (upgradeable to cloud) |
| 📊 **Visual Progress** | Shows watched vs unwatched segments on progress bar |
| 🔄 **Resume Capability** | Users can continue from where they left off |
| 🎨 **Beautiful UI** | Modern, responsive design with smooth animations |

---

## System Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[User Interface]
        VP[VideoPlayer Component]
        PD[ProgressDisplay Component]
    end
    
    subgraph "State Management"
        Hook[useVideoProgress Hook]
        State[React State]
    end
    
    subgraph "Core Logic"
        IT[Interval Tracking]
        IM[Interval Merging]
        PC[Progress Calculation]
    end
    
    subgraph "Persistence"
        LS[localStorage]
        DB[(Database - Optional)]
    end
    
    UI --> VP
    UI --> PD
    VP --> Hook
    PD --> Hook
    Hook --> State
    Hook --> IT
    IT --> IM
    IM --> PC
    Hook --> LS
    LS -.-> DB
```

### Data Flow Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant V as VideoPlayer
    participant H as useVideoProgress
    participant I as IntervalUtils
    participant S as Storage

    U->>V: Clicks Play
    V->>H: startTracking(currentTime)
    H->>H: Store interval start
    
    loop Every timeupdate event
        V->>H: updateTime(currentTime)
        H->>H: Check for skips
    end
    
    U->>V: Clicks Pause
    V->>H: stopTracking(currentTime)
    H->>I: addInterval(start, end)
    I->>I: mergeIntervals()
    I-->>H: Return merged intervals
    H->>S: saveProgress()
    H->>V: Update UI with new progress
```

---

## Core Concepts

### 1. Interval-Based Tracking

Instead of tracking a single "current position," we track **intervals** (segments) of watched content.

```mermaid
graph LR
    subgraph "Video Timeline (0-100s)"
        A[0s] --> B[20s]
        B --> C[40s]
        C --> D[60s]
        D --> E[80s]
        E --> F[100s]
    end
    
    subgraph "Watched Intervals"
        I1["Interval 1: 0-20s"]
        I2["Interval 2: 35-55s"]
        I3["Interval 3: 70-85s"]
    end
```

**Data Structure:**
```javascript
// Each interval represents a watched segment
const interval = {
  start: 0,    // Start time in seconds
  end: 20     // End time in seconds
};

// Collection of all intervals
const intervals = [
  { start: 0, end: 20 },
  { start: 35, end: 55 },
  { start: 70, end: 85 }
];
```

### 2. Interval Merging Algorithm

When intervals overlap or are adjacent, they're merged to prevent double-counting.

```mermaid
graph TD
    subgraph "Before Merging"
        B1["[0-20]"]
        B2["[15-30]"]
        B3["[50-70]"]
        B4["[65-80]"]
    end
    
    subgraph "After Merging"
        A1["[0-30]"]
        A2["[50-80]"]
    end
    
    B1 --> A1
    B2 --> A1
    B3 --> A2
    B4 --> A2
```

**Algorithm Logic:**
```javascript
function mergeIntervals(intervals) {
  // 1. Sort by start time
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  
  // 2. Iterate and merge overlapping
  const merged = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];
    
    if (current.start <= last.end) {
      // Overlap - extend the interval
      last.end = Math.max(last.end, current.end);
    } else {
      // No overlap - add new interval
      merged.push(current);
    }
  }
  return merged;
}
```

### 3. Skip Detection

The system detects when users skip by monitoring time jumps between updates.

```mermaid
flowchart TD
    A[timeupdate event] --> B{Time difference > 2s?}
    B -->|Yes| C[User Skipped]
    B -->|No| D[Normal Playback]
    
    C --> E[Save current interval]
    E --> F[Start new interval from skip position]
    
    D --> G[Continue tracking current interval]
```

### 4. Progress Calculation

Progress is calculated from **unique seconds watched**, not current position.

```mermaid
pie title Progress Breakdown (100s video)
    "Watched (unique)" : 45
    "Unwatched" : 55
```

**Formula:**
```
Progress % = (Total Unique Seconds Watched / Video Duration) × 100
```

---

## How It Works

### Complete User Journey

```mermaid
stateDiagram-v2
    [*] --> PageLoad
    
    PageLoad --> CheckStorage: Load page
    CheckStorage --> RestoreProgress: Has saved data
    CheckStorage --> FreshStart: No saved data
    
    RestoreProgress --> Ready: Show resume toast
    FreshStart --> Ready
    
    Ready --> Playing: User clicks play
    Playing --> Tracking: Start interval tracking
    
    Tracking --> Paused: User pauses
    Tracking --> Skipped: User seeks/skips
    Tracking --> Ended: Video ends
    
    Paused --> SaveInterval: Save watched segment
    Skipped --> SaveInterval
    Ended --> SaveInterval
    
    SaveInterval --> MergeIntervals: Add to collection
    MergeIntervals --> UpdateProgress: Calculate new %
    UpdateProgress --> SaveToStorage: Persist data
    
    SaveToStorage --> Ready: Ready for more
    
    Paused --> Playing: Resume
    Skipped --> Tracking: Continue from new position
```

### Event Handling Flow

```mermaid
flowchart LR
    subgraph "Video Events"
        E1[play]
        E2[pause]
        E3[timeupdate]
        E4[seeked]
        E5[loadedmetadata]
    end
    
    subgraph "Hook Actions"
        A1[startTracking]
        A2[stopTracking]
        A3[updateTime]
        A4[handleSeek]
        A5[setDuration]
    end
    
    subgraph "Results"
        R1[New interval started]
        R2[Interval saved]
        R3[Skip detected]
        R4[Progress updated]
    end
    
    E1 --> A1 --> R1
    E2 --> A2 --> R2
    E3 --> A3 --> R3
    E4 --> A4 --> R2
    E5 --> A5 --> R4
```

---

## Component Breakdown

### 1. VideoPlayer Component

Handles video playback and user interactions.

```mermaid
graph TB
    subgraph "VideoPlayer"
        V[Video Element]
        C[Custom Controls]
        P[Progress Bar]
        I[Interval Markers]
    end
    
    V --> |events| C
    C --> |seek| V
    P --> |click| V
    I --> |visual| P
```

**Responsibilities:**
- Render HTML5 video element
- Custom play/pause/volume/fullscreen controls
- Progress bar with click-to-seek
- Visual indicators for watched segments
- Auto-hide controls during playback

### 2. useVideoProgress Hook

Central state management for progress tracking.

```mermaid
graph TB
    subgraph "Hook State"
        S1[intervals]
        S2[lastPosition]
        S3[totalDuration]
        S4[isTracking]
    end
    
    subgraph "Computed Values"
        C1[progressPercentage]
        C2[totalWatchedSeconds]
        C3[mergedIntervals]
    end
    
    subgraph "Actions"
        A1[startTracking]
        A2[stopTracking]
        A3[handleSeek]
        A4[updateTime]
        A5[resetProgress]
    end
    
    S1 --> C1
    S1 --> C2
    S1 --> C3
    S3 --> C1
```

### 3. ProgressDisplay Component

Visual representation of learning progress.

```mermaid
graph LR
    subgraph "ProgressDisplay"
        PP[Percentage Circle]
        ST[Stats Cards]
        TB[Timeline Bar]
        SL[Segment List]
    end
    
    PP --> |"45%"| Visual
    ST --> |"4:30 / 10:00"| Visual
    TB --> |segments| Visual
    SL --> |details| Visual
```

### 4. IntervalUtils Library

Pure utility functions for interval operations.

```mermaid
graph TB
    subgraph "Utility Functions"
        F1[mergeIntervals]
        F2[calculateTotalWatched]
        F3[calculateProgressPercentage]
        F4[addInterval]
        F5[isSecondWatched]
        F6[formatTime]
        F7[getUnwatchedSegments]
    end
    
    F1 --> F2
    F2 --> F3
    F1 --> F4
    F1 --> F5
    F1 --> F7
```

---

## Industry Applications

### How Leading Platforms Can Use This

```mermaid
mindmap
  root((Video Tracker))
    Udemy
      Course Completion Certificates
      Accurate Watch Analytics
      Anti-Gaming Protection
      Instructor Revenue Split
    Coursera
      Verified Certificates
      Academic Integrity
      Learning Path Progress
      Peer Assessment Unlock
    Unstop
      Competition Video Tutorials
      Skill Verification
      Engagement Metrics
      Leaderboard Qualification
    Udacity
      Nanodegree Progress
      Project Prerequisites
      Mentor Session Unlock
      Career Services Access
    LinkedIn Learning
      Skill Badges
      Profile Achievements
      Manager Dashboards
      Learning Hours Tracking
```

### Platform-Specific Use Cases

#### 🎓 Udemy
| Use Case | Implementation |
|----------|----------------|
| **Completion Certificates** | Issue certificates only when 100% unique content watched |
| **Refund Protection** | Track actual engagement vs. quick skimmers |
| **Instructor Analytics** | Show which sections students skip most |
| **Revenue Attribution** | Fair pay based on actual content consumption |

#### 🏆 Unstop (formerly Dare2Compete)
| Use Case | Implementation |
|----------|----------------|
| **Competition Prerequisites** | Require tutorial completion before contest entry |
| **Skill Verification** | Verify candidates watched training content |
| **Engagement Scoring** | Factor watch behavior into rankings |
| **Sponsor Metrics** | Accurate view counts for sponsor content |

#### 🎯 Udacity
| Use Case | Implementation |
|----------|----------------|
| **Nanodegree Gates** | Unlock projects only after watching prerequisites |
| **Mentor Sessions** | Require content completion before booking mentors |
| **Career Services** | Grant access after completing career modules |
| **Progress Reports** | Accurate weekly progress emails to students |

#### 📚 Coursera
| Use Case | Implementation |
|----------|----------------|
| **Verified Certificates** | Academic integrity through verified watching |
| **Peer Review Unlock** | Complete lectures before reviewing others |
| **Specialization Progress** | Accurate course completion tracking |
| **Enterprise Reporting** | Detailed employee learning analytics |

#### 💼 Corporate L&D (Learning & Development)
| Use Case | Implementation |
|----------|----------------|
| **Compliance Training** | Ensure employees watch required content |
| **Onboarding Verification** | Track new hire training completion |
| **Audit Trails** | Detailed logs for regulatory compliance |
| **ROI Measurement** | Actual engagement vs. content investment |

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or bun

### Installation

```bash
# Clone the repository
git clone <your-repo-url>

# Navigate to project
cd video-watch-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

### Project Structure

```
src/
├── components/
│   ├── VideoPlayer.jsx      # Video player with custom controls
│   ├── ProgressDisplay.jsx  # Progress visualization
│   ├── LectureHeader.jsx    # Lecture info display
│   └── ResetProgressButton.jsx
├── hooks/
│   └── useVideoProgress.js  # Core tracking hook
├── lib/
│   └── intervalUtils.js     # Interval algorithms
├── pages/
│   └── Index.jsx            # Main page
└── index.css                # Design system
```

---

## API Reference

### useVideoProgress Hook

```javascript
const {
  intervals,           // Merged watched intervals
  progressPercentage,  // 0-100 completion percentage
  totalWatchedSeconds, // Total unique seconds watched
  totalDuration,       // Video duration in seconds
  lastPosition,        // Last playback position
  isTracking,          // Currently tracking playback
  startTracking,       // Start interval (on play)
  stopTracking,        // End interval (on pause)
  handleSeek,          // Handle seek events
  updateTime,          // Update current time
  setDuration,         // Set video duration
  resetProgress,       // Clear all progress
} = useVideoProgress('video-id');
```

### Interval Utilities

```javascript
import {
  mergeIntervals,           // Merge overlapping intervals
  calculateTotalWatched,    // Get total unique seconds
  calculateProgressPercentage, // Get completion %
  addInterval,              // Add new interval
  isSecondWatched,          // Check if second was watched
  formatTime,               // Format seconds to MM:SS
  getUnwatchedSegments,     // Get unwatched parts
} from '@/lib/intervalUtils';
```

---

## Extending the System

### Adding Cloud Persistence

Replace localStorage with Supabase/Firebase:

```javascript
// In useVideoProgress.js
const saveProgress = async (intervals, position, duration) => {
  await supabase
    .from('video_progress')
    .upsert({
      user_id: userId,
      video_id: videoId,
      intervals: intervals,
      last_position: position,
      total_duration: duration,
      updated_at: new Date()
    });
};
```

### Adding Analytics Events

```javascript
// Track engagement metrics
const trackEngagement = (event, data) => {
  analytics.track(event, {
    video_id: videoId,
    progress: progressPercentage,
    watched_seconds: totalWatchedSeconds,
    ...data
  });
};
```

---

## License

MIT License - Feel free to use in your projects!

---

<p align="center">
  Built with ❤️ using React + Vite + Tailwind CSS by Shrestha Kundu
</p>

