-- Create user goals table
CREATE TABLE public.user_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('data_point', 'handicap')),
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('ai_assigned', 'self_assigned')),
  metric_name TEXT, -- for data_point goals (e.g., 'Total Distance', 'Side')
  current_value DECIMAL,
  target_value DECIMAL NOT NULL,
  current_handicap DECIMAL, -- for handicap goals
  target_handicap DECIMAL, -- for handicap goals
  target_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create handicap history table
CREATE TABLE public.handicap_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  handicap_value DECIMAL NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add current_handicap to profiles table
ALTER TABLE public.profiles 
ADD COLUMN current_handicap DECIMAL;

-- Enable Row Level Security
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handicap_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_goals
CREATE POLICY "Users can view their own goals" 
ON public.user_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" 
ON public.user_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
ON public.user_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
ON public.user_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for handicap_history
CREATE POLICY "Users can view their own handicap history" 
ON public.handicap_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own handicap history" 
ON public.handicap_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own handicap history" 
ON public.handicap_history 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own handicap history" 
ON public.handicap_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on user_goals
CREATE TRIGGER update_user_goals_updated_at
BEFORE UPDATE ON public.user_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();