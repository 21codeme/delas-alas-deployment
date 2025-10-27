-- SIMPLE RLS DISABLE FOR LOGIN FIX
-- Run this in Supabase SQL Editor

-- 1. Disable RLS on users table temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Test that users are now visible
SELECT id, name, email, user_type FROM users;

-- 3. Re-enable RLS with a simple policy
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to view profiles" ON users;
DROP POLICY IF EXISTS "Allow users to insert own profile" ON users;
DROP POLICY IF EXISTS "Allow users to update own profile" ON users;
DROP POLICY IF EXISTS "Allow all authenticated users to view all profiles" ON users;

-- 5. Create a simple policy that allows all authenticated users
CREATE POLICY "Allow all authenticated users" ON users
    FOR ALL USING (auth.role() = 'authenticated');

-- 6. Test the policy
SELECT id, name, email, user_type FROM users WHERE email = 'jchristian.bsit@gmail.com';
