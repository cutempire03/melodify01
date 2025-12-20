-- Drop existing permissive policies for INSERT and DELETE
DROP POLICY IF EXISTS "Anyone can add songs" ON public.songs;
DROP POLICY IF EXISTS "Anyone can delete songs" ON public.songs;

-- Create new policies that require authentication
CREATE POLICY "Authenticated users can add songs" 
ON public.songs 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete songs" 
ON public.songs 
FOR DELETE 
TO authenticated
USING (true);