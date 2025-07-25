-- Create storage bucket for video thumbnails
INSERT INTO storage.buckets (id, name, public) VALUES ('video-thumbnails', 'video-thumbnails', true);

-- Create table for video thumbnail mappings
CREATE TABLE public.video_thumbnails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_url TEXT NOT NULL UNIQUE,
  thumbnail_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.video_thumbnails ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since thumbnails should be viewable by everyone)
CREATE POLICY "Anyone can view video thumbnails" 
ON public.video_thumbnails 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert video thumbnails" 
ON public.video_thumbnails 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update video thumbnails" 
ON public.video_thumbnails 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete video thumbnails" 
ON public.video_thumbnails 
FOR DELETE 
USING (true);

-- Create storage policies for the video-thumbnails bucket
CREATE POLICY "Video thumbnails are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'video-thumbnails');

CREATE POLICY "Anyone can upload video thumbnails" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'video-thumbnails');

CREATE POLICY "Anyone can update video thumbnails" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'video-thumbnails');

CREATE POLICY "Anyone can delete video thumbnails" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'video-thumbnails');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_video_thumbnails_updated_at
BEFORE UPDATE ON public.video_thumbnails
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();