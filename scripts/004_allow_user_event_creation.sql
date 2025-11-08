-- Allow authenticated users to create events
CREATE POLICY "Users can create events" ON public.events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
