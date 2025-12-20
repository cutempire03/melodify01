import { Music2, Plus } from "lucide-react";
import SongItem from "./SongItem";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  file_path: string;
  cover_url: string | null;
}

interface PlaylistProps {
  songs: Song[];
  currentSongIndex: number;
  isPlaying: boolean;
  onSongSelect: (index: number) => void;
  onSongDelete: (songId: string) => void;
  onAddSong: () => void;
}

const Playlist = ({ 
  songs, 
  currentSongIndex, 
  isPlaying, 
  onSongSelect, 
  onSongDelete,
  onAddSong 
}: PlaylistProps) => {
  return (
    <div className="glass rounded-2xl p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg gradient-primary">
            <Music2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Playlist</h2>
            <p className="text-sm text-muted-foreground">{songs.length} músicas</p>
          </div>
        </div>
        <button
          onClick={onAddSong}
          className="p-2 rounded-full gradient-primary text-primary-foreground hover:scale-110 transition-transform shadow-glow"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {songs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="p-4 rounded-full bg-secondary mb-4">
            <Music2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-2">Nenhuma música ainda</p>
          <button
            onClick={onAddSong}
            className="text-primary hover:underline font-medium"
          >
            Adicionar primeira música
          </button>
        </div>
      ) : (
        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="space-y-1">
            {songs.map((song, index) => (
              <SongItem
                key={song.id}
                song={song}
                index={index}
                isCurrentSong={index === currentSongIndex}
                isPlaying={isPlaying}
                onSelect={() => onSongSelect(index)}
                onDelete={() => onSongDelete(song.id)}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default Playlist;
