-- Update profiles table to have separate first_name and last_name fields
ALTER TABLE public.profiles 
DROP COLUMN name,
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT;

-- Update existing profiles to split names (for any existing data)
UPDATE public.profiles 
SET first_name = SPLIT_PART(COALESCE(name, 'Golf Player'), ' ', 1),
    last_name = CASE 
        WHEN ARRAY_LENGTH(STRING_TO_ARRAY(COALESCE(name, 'Golf Player'), ' '), 1) > 1 
        THEN ARRAY_TO_STRING(ARRAY_REMOVE(STRING_TO_ARRAY(COALESCE(name, 'Golf Player'), ' ')[2:], ''), ' ')
        ELSE 'Player'
    END
WHERE first_name IS NULL OR last_name IS NULL;

-- Create user_stats table for leaderboard calculations
CREATE TABLE public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  total_swings INTEGER DEFAULT 0,
  longest_drive DECIMAL DEFAULT 0,
  accuracy_average DECIMAL DEFAULT 0,
  improvement_score DECIMAL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on user_stats
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for user_stats
CREATE POLICY "Users can view all user stats for leaderboard" 
ON public.user_stats 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own stats" 
ON public.user_stats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" 
ON public.user_stats 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Update the handle_new_user function to use separate name fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Golf'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Player')
  );
  
  -- Also create initial user_stats entry
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create function to calculate longest drive for a user
CREATE OR REPLACE FUNCTION public.calculate_longest_drive(user_uuid UUID)
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
DECLARE
  max_drive DECIMAL := 0;
  baseline_drive DECIMAL := 0;
  non_baseline_drive DECIMAL := 0;
BEGIN
  -- Get max from baseline swings (initial_metrics)
  SELECT COALESCE(MAX((initial_metrics->>'total')::DECIMAL), 0)
  INTO baseline_drive
  FROM public.swing_data 
  WHERE user_id = user_uuid 
    AND club_type = 'driver'
    AND initial_metrics->>'total' IS NOT NULL
    AND (initial_metrics->>'total')::TEXT ~ '^[0-9]+\.?[0-9]*$';

  -- Get max from non-baseline swings
  SELECT COALESCE(MAX((swing_data_non_baseline->>'total')::DECIMAL), 0)
  INTO non_baseline_drive
  FROM public.swing_data 
  WHERE user_id = user_uuid 
    AND club_type = 'driver'
    AND swing_data_non_baseline->>'total' IS NOT NULL
    AND (swing_data_non_baseline->>'total')::TEXT ~ '^[0-9]+\.?[0-9]*$';

  -- Return the maximum of both
  max_drive := GREATEST(baseline_drive, non_baseline_drive);
  
  RETURN max_drive;
END;
$$;

-- Create function to calculate accuracy average for a user
CREATE OR REPLACE FUNCTION public.calculate_accuracy_average(user_uuid UUID)
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
DECLARE
  avg_side DECIMAL := 0;
  side_values DECIMAL[];
  baseline_sides DECIMAL[];
  non_baseline_sides DECIMAL[];
BEGIN
  -- Get side values from baseline swings
  SELECT ARRAY_AGG((initial_metrics->>'side')::DECIMAL)
  INTO baseline_sides
  FROM public.swing_data 
  WHERE user_id = user_uuid 
    AND initial_metrics->>'side' IS NOT NULL
    AND (initial_metrics->>'side')::TEXT ~ '^-?[0-9]+\.?[0-9]*$';

  -- Get side values from non-baseline swings
  SELECT ARRAY_AGG((swing_data_non_baseline->>'side')::DECIMAL)
  INTO non_baseline_sides
  FROM public.swing_data 
  WHERE user_id = user_uuid 
    AND swing_data_non_baseline->>'side' IS NOT NULL
    AND (swing_data_non_baseline->>'side')::TEXT ~ '^-?[0-9]+\.?[0-9]*$';

  -- Combine arrays and calculate average of absolute values
  side_values := COALESCE(baseline_sides, ARRAY[]::DECIMAL[]) || COALESCE(non_baseline_sides, ARRAY[]::DECIMAL[]);
  
  IF ARRAY_LENGTH(side_values, 1) > 0 THEN
    SELECT AVG(ABS(value))
    INTO avg_side
    FROM UNNEST(side_values) AS value;
  END IF;
  
  RETURN COALESCE(avg_side, 0);
END;
$$;

-- Create function to update user stats
CREATE OR REPLACE FUNCTION public.update_user_stats(user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  swing_count INTEGER;
  longest_drive_val DECIMAL;
  accuracy_avg DECIMAL;
BEGIN
  -- Count total swings
  SELECT COUNT(*)
  INTO swing_count
  FROM public.swing_data
  WHERE user_id = user_uuid;

  -- Calculate longest drive
  SELECT public.calculate_longest_drive(user_uuid)
  INTO longest_drive_val;

  -- Calculate accuracy average
  SELECT public.calculate_accuracy_average(user_uuid)
  INTO accuracy_avg;

  -- Update or insert user stats
  INSERT INTO public.user_stats (user_id, total_swings, longest_drive, accuracy_average, last_updated)
  VALUES (user_uuid, swing_count, longest_drive_val, accuracy_avg, now())
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_swings = swing_count,
    longest_drive = longest_drive_val,
    accuracy_average = accuracy_avg,
    last_updated = now();
END;
$$;

-- Create trigger to update stats when swing data changes
CREATE OR REPLACE FUNCTION public.trigger_update_user_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update stats for the affected user
  PERFORM public.update_user_stats(COALESCE(NEW.user_id, OLD.user_id));
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger on swing_data table
DROP TRIGGER IF EXISTS update_user_stats_trigger ON public.swing_data;
CREATE TRIGGER update_user_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.swing_data
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_user_stats();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_stats_longest_drive ON public.user_stats(longest_drive DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_accuracy ON public.user_stats(accuracy_average ASC);
CREATE INDEX IF NOT EXISTS idx_swing_data_club_type ON public.swing_data(club_type);
CREATE INDEX IF NOT EXISTS idx_swing_data_user_club ON public.swing_data(user_id, club_type);