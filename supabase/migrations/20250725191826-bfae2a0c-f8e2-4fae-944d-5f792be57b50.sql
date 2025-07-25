-- Enable RLS on tables that don't have it enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swing_data ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for progress_tracker table
CREATE POLICY "Users can view their own progress" 
ON public.progress_tracker 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress" 
ON public.progress_tracker 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.progress_tracker 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress" 
ON public.progress_tracker 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for swing_data table
CREATE POLICY "Users can view their own swing data" 
ON public.swing_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own swing data" 
ON public.swing_data 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own swing data" 
ON public.swing_data 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own swing data" 
ON public.swing_data 
FOR DELETE 
USING (auth.uid() = user_id);