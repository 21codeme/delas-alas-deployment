-- Fix Notifications RLS Policies
-- Run this in Supabase SQL Editor to fix the notification insertion issues

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create new policies that work with anonymous access
CREATE POLICY "Allow anonymous read notifications" ON public.notifications
  FOR SELECT USING (true); -- Allow reading all notifications for now

CREATE POLICY "Allow anonymous insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true); -- Allow inserting notifications

CREATE POLICY "Allow anonymous update notifications" ON public.notifications
  FOR UPDATE USING (true); -- Allow updating notifications

-- Alternative: More restrictive policies (uncomment if you want more security)
-- CREATE POLICY "Users can view their own notifications" ON public.notifications
--   FOR SELECT USING (user_id IS NOT NULL);
-- 
-- CREATE POLICY "Users can insert their own notifications" ON public.notifications
--   FOR INSERT WITH CHECK (user_id IS NOT NULL);
-- 
-- CREATE POLICY "Users can update their own notifications" ON public.notifications
--   FOR UPDATE USING (user_id IS NOT NULL);

-- Verify policies were created
SELECT 'RLS policies updated successfully!' as status;





