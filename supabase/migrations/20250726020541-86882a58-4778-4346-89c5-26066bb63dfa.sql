-- Update calculate_longest_drive function to use structured metrics first
CREATE OR REPLACE FUNCTION public.calculate_longest_drive(user_uuid uuid)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
DECLARE
  max_drive DECIMAL := 0;
  baseline_drive DECIMAL := 0;
  non_baseline_drive DECIMAL := 0;
  structured_drive DECIMAL := 0;
BEGIN
  -- First try to get max from structured_metrics
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
  INTO structured_drive
  FROM structured_distances;

  -- Get max from baseline swings (initial_metrics) as fallback
  SELECT COALESCE(MAX((initial_metrics->>'total')::DECIMAL), 0)
  INTO baseline_drive
  FROM public.swing_data 
  WHERE user_id = user_uuid 
    AND club_type = 'driver'
    AND initial_metrics->>'total' IS NOT NULL
    AND (initial_metrics->>'total')::TEXT ~ '^[0-9]+\.?[0-9]*$';

  -- Get max from non-baseline swings as fallback
  SELECT COALESCE(MAX((swing_data_non_baseline->>'total')::DECIMAL), 0)
  INTO non_baseline_drive
  FROM public.swing_data 
  WHERE user_id = user_uuid 
    AND club_type = 'driver'
    AND swing_data_non_baseline->>'total' IS NOT NULL
    AND (swing_data_non_baseline->>'total')::TEXT ~ '^[0-9]+\.?[0-9]*$';

  -- Return the maximum of all sources
  max_drive := GREATEST(structured_drive, baseline_drive, non_baseline_drive);
  
  RETURN max_drive;
END;
$function$;

-- Update calculate_accuracy_average function to use structured metrics first
CREATE OR REPLACE FUNCTION public.calculate_accuracy_average(user_uuid uuid)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
DECLARE
  avg_side DECIMAL := 0;
  side_count INTEGER := 0;
  total_abs_side DECIMAL := 0;
BEGIN
  -- Calculate from structured_metrics first
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

  -- Add baseline swings as fallback
  SELECT side_count + COUNT(*), total_abs_side + COALESCE(SUM(ABS((initial_metrics->>'side')::DECIMAL)), 0)
  INTO side_count, total_abs_side
  FROM public.swing_data 
  WHERE user_id = user_uuid 
    AND initial_metrics->>'side' IS NOT NULL
    AND (initial_metrics->>'side')::TEXT ~ '^-?[0-9]+\.?[0-9]*$'
    AND (structured_metrics IS NULL OR jsonb_typeof(structured_metrics) != 'array');

  -- Add non-baseline swings as fallback
  SELECT side_count + COUNT(*), total_abs_side + COALESCE(SUM(ABS((swing_data_non_baseline->>'side')::DECIMAL)), 0)
  INTO side_count, total_abs_side
  FROM public.swing_data 
  WHERE user_id = user_uuid 
    AND swing_data_non_baseline->>'side' IS NOT NULL
    AND (swing_data_non_baseline->>'side')::TEXT ~ '^-?[0-9]+\.?[0-9]*$'
    AND (structured_metrics IS NULL OR jsonb_typeof(structured_metrics) != 'array');

  -- Calculate average
  IF side_count > 0 THEN
    avg_side := total_abs_side / side_count;
  END IF;
  
  RETURN avg_side;
END;
$function$;