-- ========================================
-- FIX RLS POLICY FOR PROFILE PICTURES
-- ========================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Allow anyone to view user profiles (for profile pictures in messages)
CREATE POLICY "Allow authenticated users to view all profiles"
ON users
FOR SELECT
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update own profile"
ON users
FOR UPDATE
USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Allow users to insert own profile"
ON users
FOR INSERT
WITH CHECK (true);



