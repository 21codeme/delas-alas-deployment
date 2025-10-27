-- Check and Fix RLS Policies for Appointments Table
-- Run this in Supabase SQL Editor

-- 1. Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'appointments';

-- 2. Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'appointments';

-- 3. Drop existing restrictive policies (if any)
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.appointments;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.appointments;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.appointments;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.appointments;

-- 4. Create permissive policies for appointments table
CREATE POLICY "Enable insert for all users" ON public.appointments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON public.appointments
    FOR SELECT USING (true);

CREATE POLICY "Enable update for all users" ON public.appointments
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON public.appointments
    FOR DELETE USING (true);

-- 5. Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'appointments';
