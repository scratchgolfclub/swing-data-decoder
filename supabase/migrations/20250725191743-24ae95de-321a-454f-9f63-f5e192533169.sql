-- Create user_video_views table to track which videos users have watched
CREATE TABLE public.user_video_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_url TEXT NOT NULL,
  video_title TEXT NOT NULL,
  watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_video_views ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own video views" 
ON public.user_video_views 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own video views" 
ON public.user_video_views 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video views" 
ON public.user_video_views 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video views" 
ON public.user_video_views 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_video_views_updated_at
BEFORE UPDATE ON public.user_video_views
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();