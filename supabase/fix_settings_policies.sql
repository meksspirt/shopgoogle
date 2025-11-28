-- Fix RLS policies for settings table
-- Execute this if you get "violates row-level security policy" error

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow public read access to settings" ON public.settings;
DROP POLICY IF EXISTS "Allow authenticated users to update settings" ON public.settings;
DROP POLICY IF EXISTS "Allow authenticated users to insert settings" ON public.settings;
DROP POLICY IF EXISTS "Allow all operations on settings" ON public.settings;

-- Create new policies

-- 1. Allow everyone to read settings
CREATE POLICY "Allow public read access to settings"
ON public.settings FOR SELECT
TO public
USING (true);

-- 2. Allow authenticated users to do everything (INSERT, UPDATE, DELETE)
CREATE POLICY "Allow all operations on settings"
ON public.settings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'settings';
