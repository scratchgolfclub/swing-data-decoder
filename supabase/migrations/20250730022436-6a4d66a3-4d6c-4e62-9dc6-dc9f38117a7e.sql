-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read for demo swings" ON public.swings;
DROP POLICY IF EXISTS "Allow public read for demo insights" ON public.insights;

-- Allow public read access to swings for demo mode with proper type casting
CREATE POLICY "Allow public read for demo swings" 
ON public.swings 
FOR SELECT 
USING (
  -- Allow if user is authenticated and owns the swing
  (auth.uid() = user_id) 
  OR 
  -- Allow if swing has demo user_id pattern (cast to text for comparison)
  (user_id::text LIKE 'demo-%')
);

-- Allow public read access to insights for demo mode
CREATE POLICY "Allow public read for demo insights" 
ON public.insights 
FOR SELECT 
USING (
  -- Allow if user owns the swing that these insights belong to
  (EXISTS (
    SELECT 1 FROM swings 
    WHERE swings.id = insights.swing_id 
    AND swings.user_id = auth.uid()
  ))
  OR
  -- Allow if insights belong to demo swings (cast to text for comparison)
  (EXISTS (
    SELECT 1 FROM swings 
    WHERE swings.id = insights.swing_id 
    AND swings.user_id::text LIKE 'demo-%'
  ))
);