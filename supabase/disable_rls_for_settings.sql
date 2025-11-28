-- TEMPORARY FIX: Disable RLS for settings table
-- Use this ONLY for testing or if you trust all users
-- WARNING: This makes settings table accessible to everyone for write operations

-- Disable RLS (not recommended for production)
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- OR keep RLS enabled but allow anonymous users (better option)
-- Comment out the line above and uncomment below:

/*
-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to settings" ON public.settings;
DROP POLICY IF EXISTS "Allow all operations on settings" ON public.settings;

-- Allow everyone to read
CREATE POLICY "Allow public read access to settings"
ON public.settings FOR SELECT
TO public
USING (true);

-- Allow everyone to write (use with caution!)
CREATE POLICY "Allow public write access to settings"
ON public.settings FOR ALL
TO public
USING (true)
WITH CHECK (true);
*/
