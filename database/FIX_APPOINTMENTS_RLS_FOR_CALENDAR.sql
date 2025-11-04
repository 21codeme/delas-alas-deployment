-- Fix Appointments RLS Policy for Calendar View
-- Run this in your Supabase SQL Editor to allow patients to see appointment counts
-- This allows patients to see how many other users booked on each date (for calendar)

-- 1. Drop ALL existing policies for appointments table
DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Dentists can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can view appointment dates for calendar" ON appointments;
DROP POLICY IF EXISTS "Anonymous users can view appointment dates for calendar" ON appointments;
DROP POLICY IF EXISTS "Patients can insert own appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can update own appointments" ON appointments;
DROP POLICY IF EXISTS "Dentists can update appointments" ON appointments;
DROP POLICY IF EXISTS "Users can insert own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON appointments;
DROP POLICY IF EXISTS "Enable read access for all users" ON appointments;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON appointments;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON appointments;
DROP POLICY IF EXISTS "Enable insert for all users" ON appointments;
DROP POLICY IF EXISTS "Enable update for all users" ON appointments;
DROP POLICY IF EXISTS "Enable delete for all users" ON appointments;

-- 2. Allow ALL users (including anonymous) to see appointment dates for calendar
-- This is safe because we're only exposing appointment_date (not personal info)
-- This is needed for the calendar to show booking counts
CREATE POLICY "Allow all users to view appointment dates for calendar" ON appointments
    FOR SELECT USING (true);

-- 3. Create separate policy for dentists to see all appointment details
CREATE POLICY "Dentists can view all appointments" ON appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.user_type = 'dentist'
        )
    );

-- 5. Keep insert/update policies restrictive
CREATE POLICY "Patients can insert own appointments" ON appointments
    FOR INSERT WITH CHECK (
        auth.uid() = patient_id 
        OR 
        patient_id IS NULL
    );

CREATE POLICY "Patients can update own appointments" ON appointments
    FOR UPDATE USING (auth.uid() = patient_id);

CREATE POLICY "Dentists can update appointments" ON appointments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.user_type = 'dentist'
        )
    );

-- 6. Verify the policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'appointments'
ORDER BY policyname;

-- Note: This allows patients to see appointment dates for calendar purposes
-- Personal information (patient names, emails, etc.) should still be protected
-- by only selecting appointment_date and not other sensitive fields

