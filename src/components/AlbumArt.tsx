import { cn } from "@/lib/utils";

interface AlbumArtProps {
  src: string;
  alt: string;
  isPlaying: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const AlbumArt = ({ src, alt, isPlaying, size = "lg", className }: AlbumArtProps) => {
  const sizeClasses = {
    sm: "w-12 h-12 rounded-md",
    md: "w-16 h-16 rounded-lg",
    lg: "w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-2xl",
  };

  return (
    <div
      className={cn(
        "relative group",
        size === "lg" && "shadow-elevated",
        className
      )}
    >
    <div
      className={cn(
        sizeClasses[size],
        "overflow-hidden transition-all duration-500",
        size === "lg" && "shadow-glow"
      )}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
      {size === "lg" && (
        <>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div
            className={cn(
              "absolute inset-0 rounded-2xl border-4 border-primary/20 transition-all duration-500",
              isPlaying && "animate-pulse-glow"
            )}
          />
        </>
      )}
    </div>
  );
};

export default AlbumArt;
