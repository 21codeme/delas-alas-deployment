-- FIX PATIENT ACCESS FOR DENTIST DASHBOARD
-- Run this in Supabase SQL Editor

-- 1. Drop the current restrictive policy
DROP POLICY IF EXISTS "Allow all authenticated users" ON users;

-- 2. Create a policy that allows anonymous users to read user data
-- This is needed because the dentist dashboard uses direct API calls with anon key
CREATE POLICY "Allow anonymous read access to users" ON users
    FOR SELECT USING (true);

-- 3. Keep insert/update policies more restrictive
CREATE POLICY "Allow authenticated users to insert own profile" ON users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update own profile" ON users
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 4. Test the policy - this should now work
SELECT id, name, email, user_type FROM users WHERE user_type = 'patient';

-- 5. Verify we can see all patients
SELECT COUNT(*) as total_patients FROM users WHERE user_type = 'patient';



-- Run this in Supabase SQL Editor

-- 1. Drop the current restrictive policy
DROP POLICY IF EXISTS "Allow all authenticated users" ON users;

-- 2. Create a policy that allows anonymous users to read user data
-- This is needed because the dentist dashboard uses direct API calls with anon key
CREATE POLICY "Allow anonymous read access to users" ON users
    FOR SELECT USING (true);

-- 3. Keep insert/update policies more restrictive
CREATE POLICY "Allow authenticated users to insert own profile" ON users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update own profile" ON users
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 4. Test the policy - this should now work
SELECT id, name, email, user_type FROM users WHERE user_type = 'patient';

-- 5. Verify we can see all patients
SELECT COUNT(*) as total_patients FROM users WHERE user_type = 'patient';
































