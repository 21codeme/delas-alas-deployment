-- Fix 401 Unauthorized Error for Notifications
-- This allows authenticated users to access their notifications

-- Enable RLS on notifications table (if not already enabled)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow anonymous read notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow anonymous insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow anonymous update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can update own notifications" ON public.notifications;

-- Create new policies for authenticated users
-- Policy 1: Users can view their own notifications
CREATE POLICY "Authenticated users can view own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own notifications
CREATE POLICY "Authenticated users can insert own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own notifications
CREATE POLICY "Authenticated users can update own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own notifications
CREATE POLICY "Authenticated users can delete own notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Also allow anon role to read (for public access if needed)
-- This is optional - remove if you want stricter security
CREATE POLICY "Allow anon read notifications"
ON public.notifications
FOR SELECT
TO anon
USING (true);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT ON public.notifications TO anon;

-- Verify policies
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

SELECT 'Notifications RLS policies updated successfully!' as status;

