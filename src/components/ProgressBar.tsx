import { Slider } from "@/components/ui/slider";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (value: number[]) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const ProgressBar = ({ currentTime, duration, onSeek }: ProgressBarProps) => {
  return (
    <div className="w-full flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-10 text-right font-medium">
        {formatTime(currentTime)}
      </span>
      <Slider
        value={[currentTime]}
        max={duration}
        step={1}
        onValueChange={onSeek}
        className="flex-1"
      />
      <span className="text-xs text-muted-foreground w-10 font-medium">
        {formatTime(duration)}
      </span>
    </div>
  );
};

export default ProgressBar;
