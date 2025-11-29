import { formatTime } from '@/lib/intervalUtils';
import { CheckCircle2, Clock, Eye, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProgressDisplay({
  progressPercentage,
  totalWatchedSeconds,
  totalDuration,
  intervals,
}) {
  const isComplete = progressPercentage >= 100;
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Progress Card */}
      <div className="bg-card rounded-xl p-6 shadow-md border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Your Progress
          </h3>
          {isComplete && (
            <span className="flex items-center gap-1 text-accent text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Complete!
            </span>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="progress-bar-track mb-3">
          <div 
            className={cn(
              "progress-bar-fill relative overflow-hidden",
              isComplete && "shadow-progress"
            )}
            style={{ width: `${Math.min(100, progressPercentage)}%` }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-foreground/20 to-transparent animate-progress-shine" />
          </div>
        </div>
        
        {/* Percentage */}
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-foreground">
            {progressPercentage.toFixed(1)}%
          </span>
          <span className="text-muted-foreground text-sm">
            of video watched
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Eye className="w-4 h-4" />
            <span className="text-sm">Unique Time</span>
          </div>
          <p className="text-xl font-semibold text-card-foreground">
            {formatTime(totalWatchedSeconds)}
          </p>
        </div>
        
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Total Duration</span>
          </div>
          <p className="text-xl font-semibold text-card-foreground">
            {formatTime(totalDuration)}
          </p>
        </div>
      </div>

      {/* Watched Segments */}
      {intervals.length > 0 && (
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Watched Segments ({intervals.length})
          </h4>
          <div className="relative h-6 bg-progress-track rounded-full overflow-hidden">
            {/* Total duration bar */}
            {intervals.map((interval, index) => {
              const left = (interval.start / totalDuration) * 100;
              const width = ((interval.end - interval.start) / totalDuration) * 100;
              
              return (
                <div
                  key={index}
                  className="absolute top-0 h-full gradient-progress rounded-sm transition-all duration-300"
                  style={{ left: `${left}%`, width: `${width}%` }}
                  title={`${formatTime(interval.start)} - ${formatTime(interval.end)}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>0:00</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
