import { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { formatTime } from '@/lib/intervalUtils';
import { cn } from '@/lib/utils';

export function VideoPlayer({
  src,
  onPlay,
  onPause,
  onTimeUpdate,
  onSeeked,
  onDurationChange,
  initialTime = 0,
  intervals = [],
}) {
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      onDurationChange(video.duration);
      // Resume from last position
      if (initialTime > 0 && initialTime < video.duration) {
        video.currentTime = initialTime;
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate(video.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlay(video.currentTime);
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPause(video.currentTime);
    };

    const handleSeeked = () => {
      onSeeked(video.currentTime);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('seeked', handleSeeked);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, [onPlay, onPause, onTimeUpdate, onSeeked, onDurationChange, initialTime]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };

  const handleProgressClick = (e) => {
    const video = videoRef.current;
    const progress = progressRef.current;
    if (!video || !progress) return;

    const rect = progress.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Render watched intervals on the progress bar
  const renderIntervalMarkers = () => {
    if (duration === 0) return null;
    
    return intervals.map((interval, index) => {
      const left = (interval.start / duration) * 100;
      const width = ((interval.end - interval.start) / duration) * 100;
      
      return (
        <div
          key={index}
          className="absolute top-0 h-full bg-accent/60 pointer-events-none"
          style={{ left: `${left}%`, width: `${width}%` }}
        />
      );
    });
  };

  return (
    <div 
      className="video-container group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full aspect-video"
        onClick={togglePlay}
      />
      
      {/* Play/Pause overlay */}
      <div 
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
          isPlaying && !showControls ? "opacity-0" : "opacity-100"
        )}
      >
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="w-20 h-20 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-glow transition-transform hover:scale-110"
          >
            <Play className="w-10 h-10 ml-1" />
          </button>
        )}
      </div>

      {/* Controls bar */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-video-bg/90 to-transparent p-4 transition-opacity duration-300",
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Progress bar */}
        <div 
          ref={progressRef}
          className="relative h-2 bg-secondary/30 rounded-full cursor-pointer mb-3 overflow-hidden"
          onClick={handleProgressClick}
        >
          {/* Watched intervals background */}
          {renderIntervalMarkers()}
          
          {/* Current position */}
          <div 
            className="absolute top-0 left-0 h-full bg-primary rounded-full"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          
          {/* Scrubber */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-md transition-transform hover:scale-125"
            style={{ left: `calc(${(currentTime / duration) * 100}% - 8px)` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between text-video-controls">
          <div className="flex items-center gap-3">
            <button 
              onClick={togglePlay}
              className="p-2 hover:bg-secondary/20 rounded-full transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            
            <button 
              onClick={toggleMute}
              className="p-2 hover:bg-secondary/20 rounded-full transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <span className="text-sm font-medium">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <button 
            onClick={handleFullscreen}
            className="p-2 hover:bg-secondary/20 rounded-full transition-colors"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
