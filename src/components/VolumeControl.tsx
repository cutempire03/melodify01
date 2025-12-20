import { Volume2, VolumeX, Volume1 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (value: number[]) => void;
  onMuteToggle: () => void;
  isMuted: boolean;
}

const VolumeControl = ({ volume, onVolumeChange, onMuteToggle, isMuted }: VolumeControlProps) => {
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="w-5 h-5" />;
    if (volume < 50) return <Volume1 className="w-5 h-5" />;
    return <Volume2 className="w-5 h-5" />;
  };

  return (
    <div className="flex items-center gap-2 w-32">
      <button
        onClick={onMuteToggle}
        className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-300"
      >
        {getVolumeIcon()}
      </button>
      <Slider
        value={[isMuted ? 0 : volume]}
        max={100}
        step={1}
        onValueChange={onVolumeChange}
        className="flex-1"
      />
    </div>
  );
};

export default VolumeControl;
