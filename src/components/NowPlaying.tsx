import { Heart, MoreHorizontal, ListMusic } from "lucide-react";
import AlbumArt from "./AlbumArt";
import PlaybackControls from "./PlaybackControls";
import ProgressBar from "./ProgressBar";
import VolumeControl from "./VolumeControl";
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Trash2 } from "lucide-react"; 

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  file_path: string;
  cover_url: string | null;
}

interface NowPlayingProps {
  song: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  currentTime: number;
  duration: number;
  onSeek: (value: number[]) => void;
  volume: number;
  onVolumeChange: (value: number[]) => void;
  onMuteToggle: () => void;
  isMuted: boolean;
  isShuffled: boolean;
  onShuffleToggle: () => void;
  repeatMode: "off" | "all" | "one";
  onRepeatToggle: () => void;
  isLiked: boolean;
  onLikeToggle: () => void;
  onQueueToggle: () => void;
  showQueue: boolean;
  onDeleteSong: (id: string) => void;
}

const NowPlaying = ({
  song,
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
  currentTime,
  duration,
  onSeek,
  volume,
  onVolumeChange,
  onMuteToggle,
  isMuted,
  isShuffled,
  onShuffleToggle,
  repeatMode,
  onRepeatToggle,
  isLiked,
  onLikeToggle,
  onQueueToggle,
  showQueue,
  onDeleteSong,

}: NowPlayingProps) => {
  const defaultCover = "https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=400&h=400&fit=crop";

  if (!song) {
    return (
      <div className="flex flex-col items-center justify-center p-6 md:p-8 h-full">
        <div className="p-8 rounded-full bg-secondary mb-6">
          <ListMusic className="w-16 h-16 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Nenhuma música selecionada</h2>
        <p className="text-muted-foreground text-center">
          Adicione músicas à playlist para começar a ouvir
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-8 h-full">
      {/* Album Art */}
      <div className="mb-8 animate-float" style={{ animationPlayState: isPlaying ? "running" : "paused" }}>
        <AlbumArt
          src={song.cover_url || defaultCover}
          alt={song.album}
          isPlaying={isPlaying}
          size="lg"
        />
      </div>

      {/* Song Info */}
      <div className="text-center mb-6 w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
            {song.title}
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">{song.artist}</p>
        <p className="text-sm text-muted-foreground/70">{song.album}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onLikeToggle}
          className={cn(
            "p-2 rounded-full transition-all duration-300 hover:scale-110",
            isLiked ? "text-accent" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
        </button>
        <button
          onClick={onQueueToggle}
          className={cn(
            "p-2 rounded-full transition-all duration-300 hover:scale-110 md:hidden",
            showQueue ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ListMusic className="w-6 h-6" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110">
              <MoreHorizontal className="w-6 h-6" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="center">
            <DropdownMenuItem
              className="text-destructive cursor-pointer"
              onClick={() => onDeleteSong(song.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Apagar música
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md mb-6">
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          onSeek={onSeek}
        />
      </div>

      {/* Playback Controls */}
      <div className="mb-6">
        <PlaybackControls
          isPlaying={isPlaying}
          onPlayPause={onPlayPause}
          onPrevious={onPrevious}
          onNext={onNext}
          isShuffled={isShuffled}
          onShuffleToggle={onShuffleToggle}
          repeatMode={repeatMode}
          onRepeatToggle={onRepeatToggle}
        />
      </div>

      {/* Volume Control */}
      <div className="hidden sm:block">
        <VolumeControl
          volume={volume}
          onVolumeChange={onVolumeChange}
          onMuteToggle={onMuteToggle}
          isMuted={isMuted}
        />
      </div>
    </div>
  );
};

export default NowPlaying;
