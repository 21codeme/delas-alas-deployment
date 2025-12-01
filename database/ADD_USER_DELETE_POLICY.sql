-- ========================================
-- ADD DELETE POLICY FOR USERS TABLE
-- ========================================
-- This allows users to delete their own profile when they delete their account

-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "Users can delete own profile" ON users;

-- Create DELETE policy that allows users to delete their own profile
CREATE POLICY "Users can delete own profile" ON users
    FOR DELETE USING (auth.uid() = id);

-- Verify the policy was created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'users' AND policyname = 'Users can delete own profile';

