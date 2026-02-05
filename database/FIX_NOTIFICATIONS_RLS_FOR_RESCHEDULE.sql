-- Fix Notifications RLS Policy to Allow Dentists to Create Notifications for Patients
-- Run this in your Supabase SQL Editor
-- This allows authenticated users (dentists) to create notifications for other users (patients)

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow anonymous read notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow anonymous insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow anonymous update notifications" ON public.notifications;

-- Policy 1: Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Allow authenticated users to INSERT notifications for any user
-- This allows dentists to create notifications for patients
CREATE POLICY "Authenticated users can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true); -- Allow any authenticated user to create notifications

-- Policy 3: Users can update their own notifications
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Also allow anonymous role to read (for backward compatibility)
CREATE POLICY "Allow anon read notifications"
ON public.notifications
FOR SELECT
TO anon
USING (true);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT ON public.notifications TO anon;

-- Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'notifications'
ORDER BY policyname;

SELECT '✅ Notifications RLS policies updated successfully! Dentists can now create notifications for patients.' as status;
