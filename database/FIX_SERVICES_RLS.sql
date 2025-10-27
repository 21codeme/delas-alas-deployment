-- ========================================
-- FIX SUPABASE RLS FOR SERVICES TABLE
-- ========================================

-- Allow anyone to read services (for public display on index.html)
CREATE POLICY "Allow public read access to services"
ON services
FOR SELECT
USING (true);

-- Allow anyone to insert services (for dentist dashboard - using anon key)
CREATE POLICY "Allow anyone to insert services"
ON services
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update services
CREATE POLICY "Allow anyone to update services"
ON services
FOR UPDATE
USING (true);

-- Allow anyone to delete services
CREATE POLICY "Allow anyone to delete services"
ON services
FOR DELETE
USING (true);

-- STEP 1: Drop existing policies first (uncomment to run)
DROP POLICY IF EXISTS "Allow public read access to services" ON services;
DROP POLICY IF EXISTS "Allow anyone to insert services" ON services;
DROP POLICY IF EXISTS "Allow anyone to update services" ON services;
DROP POLICY IF EXISTS "Allow anyone to delete services" ON services;
DROP POLICY IF EXISTS "Allow authenticated users to insert services" ON services;
DROP POLICY IF EXISTS "Allow authenticated users to update services" ON services;
DROP POLICY IF EXISTS "Allow authenticated users to delete services" ON services;
