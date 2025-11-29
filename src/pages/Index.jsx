import { VideoPlayer } from '@/components/VideoPlayer';
import { ProgressDisplay } from '@/components/ProgressDisplay';
import { LectureHeader } from '@/components/LectureHeader';
import { ResetProgressButton } from '@/components/ResetProgressButton';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { toast } from '@/hooks/use-toast';
import { useEffect, useRef } from 'react';

// Sample video - Big Buck Bunny (public domain)
const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const Index = () => {
  const {
    intervals,
    progressPercentage,
    totalWatchedSeconds,
    totalDuration,
    lastPosition,
    startTracking,
    stopTracking,
    handleSeek,
    updateTime,
    setDuration,
    resetProgress,
  } = useVideoProgress('lecture-1');

  const hasShownResumeToast = useRef(false);

  // Show toast when resuming from saved position
  useEffect(() => {
    if (lastPosition > 0 && !hasShownResumeToast.current && totalDuration > 0) {
      hasShownResumeToast.current = true;
      toast({
        title: "Welcome back!",
        description: `Resuming from where you left off (${Math.round(progressPercentage)}% complete)`,
      });
    }
  }, [lastPosition, progressPercentage, totalDuration]);

  // Show toast when completing the video
  useEffect(() => {
    if (progressPercentage >= 100) {
      toast({
        title: "Congratulations! 🎉",
        description: "You've watched the entire lecture!",
      });
    }
  }, [progressPercentage >= 100]);

  const handleReset = () => {
    resetProgress();
    hasShownResumeToast.current = false;
    toast({
      title: "Progress Reset",
      description: "Your progress has been cleared.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-6xl">
        <LectureHeader 
          title="Introduction to Computer Science"
          description="Learn the fundamentals of programming and computational thinking in this comprehensive lecture."
          instructor="Dr. Sarah Johnson"
        />
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Player - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2">
            <VideoPlayer
              src={SAMPLE_VIDEO}
              onPlay={startTracking}
              onPause={stopTracking}
              onTimeUpdate={updateTime}
              onSeeked={handleSeek}
              onDurationChange={setDuration}
              initialTime={lastPosition}
              intervals={intervals}
            />
            
            {/* Info card below video */}
            <div className="mt-4 bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-card-foreground">Track Your Learning</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Progress is tracked based on unique segments watched. Skipping or rewatching won't inflate your progress.
                  </p>
                </div>
                <ResetProgressButton onReset={handleReset} />
              </div>
            </div>
          </div>

          {/* Progress Sidebar */}
          <aside className="lg:col-span-1">
            <ProgressDisplay
              progressPercentage={progressPercentage}
              totalWatchedSeconds={totalWatchedSeconds}
              totalDuration={totalDuration}
              intervals={intervals}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Index;
