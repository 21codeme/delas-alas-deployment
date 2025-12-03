-- ========================================
-- ENABLE RLS FOR UNRESTRICTED TABLES
-- Fix clinic_settings and user_notification_settings
-- Run this in Supabase SQL Editor
-- ========================================

-- ========================================
-- PART 1: Enable RLS on clinic_settings
-- ========================================

-- Enable RLS on clinic_settings table
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view clinic settings" ON public.clinic_settings;
DROP POLICY IF EXISTS "Authenticated users can update clinic settings" ON public.clinic_settings;
DROP POLICY IF EXISTS "Authenticated users can insert clinic settings" ON public.clinic_settings;
DROP POLICY IF EXISTS "Authenticated users can delete clinic settings" ON public.clinic_settings;

-- Policy 1: Allow anyone to read clinic settings (public information)
CREATE POLICY "Anyone can view clinic settings" ON public.clinic_settings
    FOR SELECT 
    USING (true);

-- Policy 2: Allow authenticated users to update clinic settings
CREATE POLICY "Authenticated users can update clinic settings" ON public.clinic_settings
    FOR UPDATE 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Policy 3: Allow authenticated users to insert clinic settings
CREATE POLICY "Authenticated users can insert clinic settings" ON public.clinic_settings
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Policy 4: Allow authenticated users to delete clinic settings (optional)
CREATE POLICY "Authenticated users can delete clinic settings" ON public.clinic_settings
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- ========================================
-- PART 2: Enable RLS on user_notification_settings
-- ========================================

-- Enable RLS on user_notification_settings table
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own notification settings" ON public.user_notification_settings;
DROP POLICY IF EXISTS "Users can update own notification settings" ON public.user_notification_settings;
DROP POLICY IF EXISTS "Users can insert own notification settings" ON public.user_notification_settings;
DROP POLICY IF EXISTS "Users can delete own notification settings" ON public.user_notification_settings;

-- Policy 1: Users can view their own notification settings
CREATE POLICY "Users can view own notification settings" ON public.user_notification_settings
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy 2: Users can update their own notification settings
CREATE POLICY "Users can update own notification settings" ON public.user_notification_settings
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can insert their own notification settings
CREATE POLICY "Users can insert own notification settings" ON public.user_notification_settings
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own notification settings
CREATE POLICY "Users can delete own notification settings" ON public.user_notification_settings
    FOR DELETE 
    USING (auth.uid() = user_id);

-- ========================================
-- PART 3: Verify RLS is enabled
-- ========================================

-- Check RLS status on both tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS ENABLED'
        ELSE '❌ RLS DISABLED'
    END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('clinic_settings', 'user_notification_settings')
ORDER BY tablename;

-- Check policies on both tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command
FROM pg_policies
WHERE tablename IN ('clinic_settings', 'user_notification_settings')
ORDER BY tablename, policyname;

-- Success message
SELECT '✅ RLS has been enabled for clinic_settings and user_notification_settings!' as status;
SELECT 'The "UNRESTRICTED" tags should disappear in the Supabase Dashboard.' as next_step;


