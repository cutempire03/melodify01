import { Play, Pause, Trash2 } from "lucide-react";
import AlbumArt from "./AlbumArt";
import MusicVisualizer from "./MusicVisualizer";
import { cn } from "@/lib/utils";

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  file_path: string;
  cover_url: string | null;
}

interface SongItemProps {
  song: Song;
  index: number;
  isCurrentSong: boolean;
  isPlaying: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const SongItem = ({ song, index, isCurrentSong, isPlaying, onSelect, onDelete }: SongItemProps) => {
  const defaultCover = "https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=400&h=400&fit=crop";

  return (
    <div
      className={cn(
        "w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group",
        isCurrentSong
          ? "bg-secondary/80 shadow-card"
          : "hover:bg-secondary/50"
      )}
    >
      <button
        onClick={onSelect}
        className="w-8 flex items-center justify-center"
      >
        {isCurrentSong && isPlaying ? (
          <MusicVisualizer isPlaying={true} />
        ) : (
          <span className="text-sm text-muted-foreground group-hover:hidden">
            {index + 1}
          </span>
        )}
        {!isCurrentSong && (
          <Play className="w-4 h-4 text-foreground hidden group-hover:block" fill="currentColor" />
        )}
        {isCurrentSong && !isPlaying && (
          <Pause className="w-4 h-4 text-primary" fill="currentColor" />
        )}
      </button>

      <button onClick={onSelect} className="flex-1 flex items-center gap-4 min-w-0">
        <AlbumArt
          src={song.cover_url || defaultCover}
          alt={song.album}
          isPlaying={isCurrentSong && isPlaying}
          size="sm"
        />

        <div className="flex-1 min-w-0 text-left">
          <p
            className={cn(
              "font-medium truncate transition-colors",
              isCurrentSong ? "text-primary" : "text-foreground"
            )}
          >
            {song.title}
          </p>
          <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
        </div>
      </button>

      <span className="text-sm text-muted-foreground">{formatDuration(song.duration)}</span>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default SongItem;
