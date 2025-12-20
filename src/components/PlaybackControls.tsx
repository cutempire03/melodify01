import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  isShuffled: boolean;
  onShuffleToggle: () => void;
  repeatMode: "off" | "all" | "one";
  onRepeatToggle: () => void;
}

const PlaybackControls = ({
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
  isShuffled,
  onShuffleToggle,
  repeatMode,
  onRepeatToggle,
}: PlaybackControlsProps) => {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6">
      <button
        onClick={onShuffleToggle}
        className={cn(
          "p-2 rounded-full transition-all duration-300 hover:bg-secondary",
          isShuffled ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Shuffle className="w-5 h-5" />
      </button>

      <button
        onClick={onPrevious}
        className="p-3 rounded-full text-foreground hover:bg-secondary transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <SkipBack className="w-6 h-6" fill="currentColor" />
      </button>

      <button
        onClick={onPlayPause}
        className="p-4 rounded-full gradient-primary text-primary-foreground shadow-glow transition-all duration-300 hover:scale-110 active:scale-95"
      >
        {isPlaying ? (
          <Pause className="w-8 h-8" fill="currentColor" />
        ) : (
          <Play className="w-8 h-8 ml-1" fill="currentColor" />
        )}
      </button>

      <button
        onClick={onNext}
        className="p-3 rounded-full text-foreground hover:bg-secondary transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <SkipForward className="w-6 h-6" fill="currentColor" />
      </button>

      <button
        onClick={onRepeatToggle}
        className={cn(
          "p-2 rounded-full transition-all duration-300 hover:bg-secondary relative",
          repeatMode !== "off" ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Repeat className="w-5 h-5" />
        {repeatMode === "one" && (
          <span className="absolute -top-1 -right-1 text-[10px] font-bold text-primary">1</span>
        )}
      </button>
    </div>
  );
};

export default PlaybackControls;
