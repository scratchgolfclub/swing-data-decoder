-- Phase 1: Drop existing swing-related tables and functions
DROP TABLE IF EXISTS progress_tracker CASCADE;
DROP TABLE IF EXISTS swing_data CASCADE;

-- Drop functions that reference old tables
DROP FUNCTION IF EXISTS calculate_longest_drive(uuid);
DROP FUNCTION IF EXISTS calculate_accuracy_average(uuid);
DROP FUNCTION IF EXISTS update_user_stats(uuid);
DROP FUNCTION IF EXISTS trigger_update_user_stats();

-- Create new swings table with individual columns for each metric
CREATE TABLE swings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  
  -- Basic swing info
  club_type TEXT NOT NULL,
  session_name TEXT DEFAULT 'Practice Session',
  trackman_image_url TEXT,
  
  -- Club Metrics (all nullable as some photos may not have all data)
  club_speed FLOAT, -- Club Speed (mph)
  attack_angle FLOAT, -- Attack Angle (deg)
  dynamic_loft FLOAT, -- Dynamic Loft (deg) - maps to "Dyn. Loft"
  club_path FLOAT, -- Club Path (deg)
  face_angle FLOAT, -- Face Angle (deg) - maps to "Face Ang."
  face_to_path FLOAT, -- Face To Path (deg) - maps to "Face to Path"
  spin_loft FLOAT, -- Spin Loft (deg)
  swing_plane FLOAT, -- Swing Plane (deg)
  swing_direction FLOAT, -- Swing Direction (deg)
  low_point FLOAT, -- Low Point (distance)
  impact_height FLOAT, -- Impact Height (mm) - maps to "Imp. Height"
  impact_offset FLOAT, -- Impact Offset (mm) - maps to "Imp. Offset"
  dynamic_lie FLOAT, -- Dynamic Lie (deg)
  
  -- Ball Metrics
  ball_speed FLOAT, -- Ball Speed (mph)
  smash_factor FLOAT, -- Smash Factor (ratio) - maps to "Smash Fac."
  launch_angle FLOAT, -- Launch Angle (deg) - maps to "Launch Ang."
  spin_rate INTEGER, -- Spin Rate (rpm)
  launch_direction FLOAT, -- Launch Direction (deg) - maps to "Launch Dir."
  spin_axis FLOAT, -- Spin Axis (deg)
  
  -- Flight Metrics
  height FLOAT, -- Height (yds/ft)
  curve FLOAT, -- Curve (ft)
  landing_angle FLOAT, -- Landing Angle (deg) - maps to "Land. Ang."
  carry FLOAT, -- Carry (yds)
  side TEXT, -- Side (yds/ft) - kept as TEXT to handle varied units
  total FLOAT, -- Total (yds)
  side_total TEXT, -- Side Total - maps to "Side Tot."
  swing_radius FLOAT, -- Swing Radius
  max_height_distance FLOAT, -- Max Height - Distance
  low_point_height FLOAT, -- Low Point Height
  low_point_side FLOAT, -- Low Point Side
  d_plane_tilt FLOAT, -- D Plane Tilt (deg)
  hang_time FLOAT, -- Hang Time (s) - maps to "Hang Time"
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create insights table for backend-generated recommendations
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swing_id UUID REFERENCES swings(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  video_url TEXT,
  insight_type TEXT DEFAULT 'recommendation', -- 'strength', 'weakness', 'drill'
  confidence_score FLOAT DEFAULT 0.8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for swings
ALTER TABLE swings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own swings" ON swings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own swings" ON swings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own swings" ON swings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own swings" ON swings
  FOR DELETE USING (auth.uid() = user_id);

-- Add RLS policies for insights
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view insights for their swings" ON insights
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM swings 
      WHERE swings.id = insights.swing_id 
      AND swings.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage insights" ON insights
  FOR ALL USING (auth.role() = 'service_role');

-- Recreate database functions for new table structure
CREATE OR REPLACE FUNCTION public.calculate_longest_drive(user_uuid uuid)
RETURNS numeric
LANGUAGE plpgsql
AS $function$
DECLARE
  max_drive DECIMAL := 0;
BEGIN
  -- Get max from swings.total for driver swings
  SELECT COALESCE(MAX(total), 0)
  INTO max_drive
  FROM public.swings 
  WHERE user_id = user_uuid 
    AND club_type = 'driver'
    AND total IS NOT NULL;
  
  RETURN max_drive;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_accuracy_average(user_uuid uuid)
RETURNS numeric
LANGUAGE plpgsql
AS $function$
DECLARE
  avg_side DECIMAL := 0;
  side_count INTEGER := 0;
  total_abs_side DECIMAL := 0;
BEGIN
  -- Calculate from swings.side column
  WITH side_values AS (
    SELECT 
      CASE 
        -- Extract numeric value from side text (e.g., "5.2 R" -> 5.2)
        WHEN side ~ '^[0-9]+\.?[0-9]*' THEN
          ABS((regexp_match(side, '^([0-9]+\.?[0-9]*)'))[1]::DECIMAL)
        ELSE NULL
      END as side_value
    FROM public.swings 
    WHERE user_id = user_uuid 
      AND side IS NOT NULL
  )
  SELECT COUNT(*), COALESCE(SUM(side_value), 0)
  INTO side_count, total_abs_side
  FROM side_values
  WHERE side_value IS NOT NULL;

  -- Calculate average
  IF side_count > 0 THEN
    avg_side := total_abs_side / side_count;
  END IF;
  
  RETURN avg_side;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_stats(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
  swing_count INTEGER;
  longest_drive_val DECIMAL;
  accuracy_avg DECIMAL;
BEGIN
  -- Count total swings
  SELECT COUNT(*)
  INTO swing_count
  FROM public.swings
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
$function$;

CREATE OR REPLACE FUNCTION public.trigger_update_user_stats()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Update stats for the affected user
  PERFORM public.update_user_stats(COALESCE(NEW.user_id, OLD.user_id));
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create trigger for automatic user stats updates on swings table
CREATE TRIGGER update_user_stats_on_swing_change
  AFTER INSERT OR UPDATE OR DELETE ON public.swings
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_user_stats();