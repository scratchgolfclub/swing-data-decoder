-- Allow public read access to swings for demo mode (swings without authenticated user_id)
CREATE POLICY "Allow public read for demo swings" 
ON public.swings 
FOR SELECT 
USING (
  -- Allow if user is authenticated and owns the swing
  (auth.uid() = user_id) 
  OR 
  -- Allow if no user is authenticated and swing has demo user_id pattern
  (auth.uid() IS NULL AND user_id LIKE 'demo-%')
  OR
  -- Allow if user is authenticated but reading demo swings
  (auth.uid() IS NOT NULL AND user_id LIKE 'demo-%')
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
  -- Allow if insights belong to demo swings
  (EXISTS (
    SELECT 1 FROM swings 
    WHERE swings.id = insights.swing_id 
    AND swings.user_id LIKE 'demo-%'
  ))
);