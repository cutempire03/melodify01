-- Create songs table to store song metadata
CREATE TABLE public.songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL DEFAULT 'Artista Desconhecido',
  album TEXT NOT NULL DEFAULT 'Álbum Desconhecido',
  duration INTEGER NOT NULL DEFAULT 0,
  file_path TEXT NOT NULL,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read songs (public playlist)
CREATE POLICY "Anyone can view songs"
  ON public.songs
  FOR SELECT
  USING (true);

-- Allow anyone to insert songs (for demo purposes)
CREATE POLICY "Anyone can add songs"
  ON public.songs
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to delete songs (for demo purposes)
CREATE POLICY "Anyone can delete songs"
  ON public.songs
  FOR DELETE
  USING (true);

-- Create storage bucket for music files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'music',
  'music',
  true,
  52428800,
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'image/jpeg', 'image/png', 'image/webp']
);

-- Allow public access to music files
CREATE POLICY "Public access to music files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'music');

-- Allow anyone to upload music files
CREATE POLICY "Anyone can upload music files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'music');

-- Allow anyone to delete music files
CREATE POLICY "Anyone can delete music files"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'music');