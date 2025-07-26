-- Update calculate_accuracy_average function to only use structured_metrics
CREATE OR REPLACE FUNCTION public.calculate_accuracy_average(user_uuid uuid)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
DECLARE
  avg_side DECIMAL := 0;
  side_count INTEGER := 0;
  total_abs_side DECIMAL := 0;
BEGIN
  -- Calculate from structured_metrics only
  WITH structured_sides AS (
    SELECT 
      CASE 
        WHEN jsonb_typeof(structured_metrics) = 'array' THEN
          (SELECT ABS((metric->>'value')::DECIMAL)
           FROM jsonb_array_elements(structured_metrics) AS metric
           WHERE metric->>'title' IN ('Side', 'Side Total', 'side')
             AND (metric->>'value')::TEXT ~ '^-?[0-9]+\.?[0-9]*$'
           LIMIT 1)
        ELSE NULL
      END as side_value
    FROM public.swing_data 
    WHERE user_id = user_uuid 
      AND structured_metrics IS NOT NULL
  )
  SELECT COUNT(*), COALESCE(SUM(side_value), 0)
  INTO side_count, total_abs_side
  FROM structured_sides
  WHERE side_value IS NOT NULL;

  -- Calculate average
  IF side_count > 0 THEN
    avg_side := total_abs_side / side_count;
  END IF;
  
  RETURN avg_side;
END;
$function$;

-- Update calculate_longest_drive function to only use structured_metrics
CREATE OR REPLACE FUNCTION public.calculate_longest_drive(user_uuid uuid)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
DECLARE
  max_drive DECIMAL := 0;
BEGIN
  -- Get max from structured_metrics only
  WITH structured_distances AS (
    SELECT 
      CASE 
        WHEN jsonb_typeof(structured_metrics) = 'array' THEN
          (SELECT MAX((metric->>'value')::DECIMAL)
           FROM jsonb_array_elements(structured_metrics) AS metric
           WHERE metric->>'title' IN ('Total Distance', 'Carry Distance', 'total', 'carry')
             AND (metric->>'value')::TEXT ~ '^[0-9]+\.?[0-9]*$')
        ELSE 0
      END as structured_max
    FROM public.swing_data 
    WHERE user_id = user_uuid 
      AND club_type = 'driver'
      AND structured_metrics IS NOT NULL
  )
  SELECT COALESCE(MAX(structured_max), 0)
  INTO max_drive
  FROM structured_distances;
  
  RETURN max_drive;
END;
$function$;

-- Drop deprecated columns from swing_data table
ALTER TABLE public.swing_data DROP COLUMN IF EXISTS initial_metrics;
ALTER TABLE public.swing_data DROP COLUMN IF EXISTS swing_data_non_baseline;