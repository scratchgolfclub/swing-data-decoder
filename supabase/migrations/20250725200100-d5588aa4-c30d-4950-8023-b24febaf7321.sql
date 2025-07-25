-- Create badges table to define available badges
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('upload', 'score_improvement', 'metric_improvement', 'multi_metric')),
  criteria JSONB NOT NULL, -- stores the criteria for earning this badge
  icon_emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_badges table to track earned badges
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress_data JSONB DEFAULT '{}',
  is_new BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS policies for badges (public read)
CREATE POLICY "Anyone can view badges" 
ON public.badges 
FOR SELECT 
USING (true);

-- RLS policies for user_badges
CREATE POLICY "Users can view their own badges" 
ON public.user_badges 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own badges" 
ON public.user_badges 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own badges" 
ON public.user_badges 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Insert default badges
INSERT INTO public.badges (name, description, badge_type, criteria, icon_emoji) VALUES
('First Swing', 'Uploaded your first swing!', 'upload', '{"swing_count": 1}', '🎯'),
('Getting Started', 'Uploaded 3 swings', 'upload', '{"swing_count": 3}', '📊'),
('Consistent Player', 'Uploaded 5 swings', 'upload', '{"swing_count": 5}', '🏃'),
('Dedicated', 'Uploaded 10 swings', 'upload', '{"swing_count": 10}', '🔥'),
('Committed', 'Uploaded 25 swings', 'upload', '{"swing_count": 25}', '💪'),
('Expert', 'Uploaded 50 swings', 'upload', '{"swing_count": 50}', '⭐'),
('Master', 'Uploaded 100 swings', 'upload', '{"swing_count": 100}', '🏆'),
('Rising Star', 'Improved your score by 5 points', 'score_improvement', '{"score_improvement": 5}', '🎯'),
('Progressing', 'Improved your score by 10 points', 'score_improvement', '{"score_improvement": 10}', '📈'),
('Accelerating', 'Improved your score by 20 points', 'score_improvement', '{"score_improvement": 20}', '🚀'),
('Soaring', 'Improved your score by 50 points', 'score_improvement', '{"score_improvement": 50}', '💫'),
('Fine Tuning', 'Improved any metric by 10%', 'metric_improvement', '{"improvement_percentage": 10}', '📊'),
('Dialed In', 'Improved any metric by 25%', 'metric_improvement', '{"improvement_percentage": 25}', '🎯'),
('On Fire', 'Improved any metric by 50%', 'metric_improvement', '{"improvement_percentage": 50}', '🔥'),
('Perfection', 'Improved any metric by 75%', 'metric_improvement', '{"improvement_percentage": 75}', '💎'),
('Multi-Tasker', 'Improved 3 different metrics', 'multi_metric', '{"metrics_improved": 3}', '🎪'),
('Well-Rounded', 'Improved 5 different metrics', 'multi_metric', '{"metrics_improved": 5}', '🎨'),
('Complete Player', 'Improved 10 different metrics', 'multi_metric', '{"metrics_improved": 10}', '🎯');