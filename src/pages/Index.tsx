import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import NowPlaying from "@/components/NowPlaying";
import Playlist from "@/components/Playlist";
import UploadSongModal from "@/components/UploadSongModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOut, Loader2 } from "lucide-react";

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  file_path: string;
  cover_url: string | null;
}

const Index = () => {
  const { toast } = useToast();
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());
  const [showQueue, setShowQueue] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleNextRef = useRef<() => void>(() => {});
  const currentSongIndexRef = useRef(0);
  const currentSong = songs[currentSongIndex] || null;

  useEffect(() => {
    if (songs.length === 0) return;

    if(currentSongIndex < 0 || currentSongIndex >= songs.length) {
      setCurrentSongIndex(0);
    }
  }, [songs, currentSongIndex])

  // redirect para o login se não está logado
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // procura sons na database
  const fetchSongs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSongs(data || []);
    } catch (error) {
      console.error("Error fetching songs:", error);
      toast({
        title: "Erro ao carregar músicas",
        description: "Não foi possível carregar a playlist.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  useEffect(() => {
    currentSongIndexRef.current = currentSongIndex;
  }, [currentSongIndex]);

  // elementos do audio
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setCurrentSongIndex((prev) => {
        if(prev === songs.length - 1) {
          if(repeatMode === "all") return 0;
          setIsPlaying(false);
          return prev
        }
        return prev + 1;
      });
      setCurrentTime(0);
    }

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Load song when current song changes
  useEffect(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.src = currentSong.file_path;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [currentSong?.id]);

  // Play/pause audio
  useEffect(() => {
    if (audioRef.current && currentSong) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const handlePlayPause = () => {
    if (!currentSong && songs.length > 0) {
      setCurrentSongIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handlePrevious = useCallback(() => {
    if (currentTime > 3) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      setCurrentTime(0);
    } else {
      setCurrentSongIndex((prev) => (prev === 0 ? songs.length - 1 : prev - 1));
      setCurrentTime(0);
    }
  }, [currentTime, songs.length]);

  const handleNext = useCallback(() => {
  if (songs.length === 0) return;

  if (repeatMode === "one") {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }
    setCurrentTime(0);
    return;
  }

  let nextIndex = currentSongIndex;

  if (isShuffled) {
    do {
      nextIndex = Math.floor(Math.random() * songs.length);
    } while (nextIndex === currentSongIndex && songs.length > 1);
  } else {
    nextIndex =
      currentSongIndex === songs.length - 1
        ? 0
        : currentSongIndex + 1;
  }

  setCurrentSongIndex(nextIndex);
  setCurrentTime(0);
  setIsPlaying(true);
}, [isShuffled, repeatMode, currentSongIndex, songs.length]);

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0) setIsMuted(false);
  };

  const handleMuteToggle = () => setIsMuted(!isMuted);
  const handleShuffleToggle = () => setIsShuffled(!isShuffled);
  
  const handleRepeatToggle = () => {
    const modes: ("off" | "all" | "one")[] = ["off", "all", "one"];
    const currentIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIndex + 1) % modes.length]);
  };

  const handleLikeToggle = () => {
    if (!currentSong) return;
    setLikedSongs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentSong.id)) {
        newSet.delete(currentSong.id);
      } else {
        newSet.add(currentSong.id);
      }
      return newSet;
    });
  };

  const handleSongSelect = (index: number) => {
    setCurrentSongIndex(index);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleSongDelete = async (songId: string) => {
    try {
      const { error } = await supabase
        .from("songs")
        .delete()
        .eq("id", songId);

      if (error) throw error;

      const deletedIndex = songs.findIndex((s) => s.id === songId);
      const isCurrentSongDeleted = deletedIndex === currentSongIndex;

      // If deleting the currently playing song, stop playback
      if (isCurrentSongDeleted) {
        setIsPlaying(false);
        setCurrentTime(0);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = "";
        }
      }

      // Update local state
      setSongs((prev) => prev.filter((s) => s.id !== songId));
      
      if (deletedIndex < currentSongIndex) {
        setCurrentSongIndex((prev) => prev - 1);
      } else if (isCurrentSongDeleted && songs.length > 1) {
        // quando deleta a música o valor diminui, se chegar a 0 é quer dizer que é o fim
        if (deletedIndex >= songs.length - 1) {
          setCurrentSongIndex(0);
        }
      }

      toast({
        title: "Música removida",
        description: "A música foi removida da playlist.",
      });
    } catch (error) {
      console.error("Error deleting song:", error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover a música.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Logout Button */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="text-muted-foreground hover:text-foreground"
          title="Sair"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto p-4 md:p-6 lg:p-8 min-h-screen">
        <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[calc(100vh-4rem)]">
          {/* Now Playing Section */}
          <div className="flex-1 glass rounded-3xl overflow-hidden">
            <NowPlaying
              song={currentSong}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onPrevious={handlePrevious}
              onNext={handleNext}
              currentTime={currentTime}
              duration={duration || currentSong?.duration || 0}
              onSeek={handleSeek}
              volume={volume}
              onVolumeChange={handleVolumeChange}
              onMuteToggle={handleMuteToggle}
              isMuted={isMuted}
              isShuffled={isShuffled}
              onShuffleToggle={handleShuffleToggle}
              repeatMode={repeatMode}
              onRepeatToggle={handleRepeatToggle}
              isLiked={currentSong ? likedSongs.has(currentSong.id) : false}
              onLikeToggle={handleLikeToggle}
              onQueueToggle={() => setShowQueue(!showQueue)}
              showQueue={showQueue}
              onDeleteSong={handleSongDelete}
            />
          </div>

          {/* Playlist Section */}
          <div
            className={cn(
              "lg:w-96 transition-all duration-500",
              "fixed lg:relative inset-x-4 bottom-4 top-auto lg:inset-auto",
              "max-h-[60vh] lg:max-h-none",
              showQueue ? "translate-y-0 opacity-100" : "translate-y-full lg:translate-y-0 opacity-0 lg:opacity-100 pointer-events-none lg:pointer-events-auto"
            )}
          >
            <Playlist
              songs={songs}
              currentSongIndex={currentSongIndex}
              isPlaying={isPlaying}
              onSongSelect={handleSongSelect}
              onSongDelete={handleSongDelete}
              onAddSong={() => setShowUploadModal(true)}
            />
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadSongModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSongAdded={fetchSongs}
      />
    </div>
  );
};

export default Index;
