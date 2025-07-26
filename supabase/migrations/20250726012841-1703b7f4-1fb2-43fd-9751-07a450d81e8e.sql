-- Add new JSONB fields to swing_data table for structured metrics
ALTER TABLE public.swing_data 
ADD COLUMN structured_metrics JSONB DEFAULT '[]'::jsonb,
ADD COLUMN structured_baseline_metrics JSONB DEFAULT '[]'::jsonb;