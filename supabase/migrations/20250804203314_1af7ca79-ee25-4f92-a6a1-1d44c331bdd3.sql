-- Add drills and feels columns to insights table
ALTER TABLE public.insights 
ADD COLUMN drills JSONB DEFAULT '[]'::jsonb,
ADD COLUMN feels JSONB DEFAULT '[]'::jsonb;