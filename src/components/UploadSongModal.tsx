import { useState, useRef } from "react";
import { Upload, Music, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface UploadSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSongAdded: () => void;
}

const UploadSongModal = ({ isOpen, onClose, onSongAdded }: UploadSongModalProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      // Extract title from filename if not set
      if (!title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.addEventListener("loadedmetadata", () => {
        resolve(Math.floor(audio.duration));
      });
      audio.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async () => {
    if (!audioFile || !title.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um arquivo de áudio e adicione um título.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Get audio duration
      const duration = await getAudioDuration(audioFile);

      // Generate unique filename
      const timestamp = Date.now();
      const audioFileName = `${timestamp}-${audioFile.name}`;
      
      // Upload audio file
      const { error: audioError } = await supabase.storage
        .from("music")
        .upload(`audio/${audioFileName}`, audioFile);

      if (audioError) throw audioError;

      // Get audio URL
      const { data: audioUrlData } = supabase.storage
        .from("music")
        .getPublicUrl(`audio/${audioFileName}`);

      let coverUrl = null;

      // Upload cover if provided
      if (coverFile) {
        const coverFileName = `${timestamp}-cover-${coverFile.name}`;
        const { error: coverError } = await supabase.storage
          .from("music")
          .upload(`covers/${coverFileName}`, coverFile);

        if (!coverError) {
          const { data: coverUrlData } = supabase.storage
            .from("music")
            .getPublicUrl(`covers/${coverFileName}`);
          coverUrl = coverUrlData.publicUrl;
        }
      }

      // Save song metadata to database
      const { error: dbError } = await supabase.from("songs").insert({
        title: title.trim(),
        artist: artist.trim() || "Artista Desconhecido",
        album: album.trim() || "Álbum Desconhecido",
        duration,
        file_path: audioUrlData.publicUrl,
        cover_url: coverUrl,
      });

      if (dbError) throw dbError;

      toast({
        title: "Música adicionada!",
        description: `"${title}" foi adicionada à playlist.`,
      });

      // Reset form
      setTitle("");
      setArtist("");
      setAlbum("");
      setAudioFile(null);
      setCoverFile(null);
      setCoverPreview(null);
      
      onSongAdded();
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer o upload da música.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setArtist("");
    setAlbum("");
    setAudioFile(null);
    setCoverFile(null);
    setCoverPreview(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => {
          resetForm();
          onClose();
        }}
      />

      {/* Modal */}
      <div className="relative glass rounded-2xl w-full max-w-md p-6 shadow-elevated animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Adicionar Música</h2>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Audio File */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Arquivo de Áudio *
            </label>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
              onChange={handleAudioSelect}
              className="hidden"
            />
            <button
              onClick={() => audioInputRef.current?.click()}
              className={cn(
                "w-full p-4 rounded-xl border-2 border-dashed transition-all",
                audioFile
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50 hover:bg-secondary/50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-3 rounded-lg",
                  audioFile ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                )}>
                  <Music className="w-5 h-5" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  {audioFile ? (
                    <>
                      <p className="font-medium text-foreground truncate">{audioFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-foreground">Selecionar arquivo</p>
                      <p className="text-sm text-muted-foreground">MP3, WAV, OGG</p>
                    </>
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Capa (opcional)
            </label>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleCoverSelect}
              className="hidden"
            />
            <button
              onClick={() => coverInputRef.current?.click()}
              className={cn(
                "w-full p-4 rounded-xl border-2 border-dashed transition-all",
                coverFile
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50 hover:bg-secondary/50"
              )}
            >
              <div className="flex items-center gap-3">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="p-3 rounded-lg bg-secondary text-muted-foreground">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}
                <div className="text-left flex-1 min-w-0">
                  {coverFile ? (
                    <p className="font-medium text-foreground truncate">{coverFile.name}</p>
                  ) : (
                    <>
                      <p className="font-medium text-foreground">Adicionar capa</p>
                      <p className="text-sm text-muted-foreground">JPG, PNG, WebP</p>
                    </>
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Título *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome da música"
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Artist */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Artista
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Nome do artista"
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Album */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Álbum
            </label>
            <input
              type="text"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              placeholder="Nome do álbum"
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleUpload}
            disabled={isUploading || !audioFile || !title.trim()}
            className={cn(
              "w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2",
              isUploading || !audioFile || !title.trim()
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "gradient-primary text-primary-foreground shadow-glow hover:scale-[1.02] active:scale-[0.98]"
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Adicionar Música
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadSongModal;
