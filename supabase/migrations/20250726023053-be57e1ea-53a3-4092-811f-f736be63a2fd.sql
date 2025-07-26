-- Mark old metrics fields as deprecated by adding comments
COMMENT ON COLUMN public.swing_data.initial_metrics IS 'DEPRECATED: Use structured_metrics instead. Legacy field for backward compatibility only.';
COMMENT ON COLUMN public.swing_data.swing_data_non_baseline IS 'DEPRECATED: Use structured_metrics instead. Legacy field for backward compatibility only.';

-- Add helpful comment to the new field
COMMENT ON COLUMN public.swing_data.structured_metrics IS 'Primary field for storing golf swing metrics in structured JSON array format: [{"title": "Club Speed", "value": 84.5, "descriptor": "mph"}]';