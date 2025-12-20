import { cn } from "@/lib/utils";

interface MusicVisualizerProps {
  isPlaying: boolean;
  className?: string;
}

const MusicVisualizer = ({ isPlaying, className }: MusicVisualizerProps) => {
  const bars = [1, 2, 3, 4, 5];

  return (
    <div className={cn("flex items-end gap-0.5 h-4", className)}>
      {bars.map((bar, index) => (
        <div
          key={bar}
          className={cn(
            "w-0.5 bg-primary rounded-full transition-all duration-300",
            isPlaying ? "animate-wave" : "h-1"
          )}
          style={{
            height: isPlaying ? `${Math.random() * 12 + 4}px` : "4px",
            animationDelay: `${index * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};

export default MusicVisualizer;
