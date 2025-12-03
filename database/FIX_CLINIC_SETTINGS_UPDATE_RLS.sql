-- ========================================
-- FIX CLINIC_SETTINGS UPDATE RLS POLICY
-- Allow updates using anon key (for public clinic settings)
-- Run this in Supabase SQL Editor
-- ========================================

-- Drop existing UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can update clinic settings" ON public.clinic_settings;

-- Create new UPDATE policy that allows both authenticated and anon users
-- Since clinic settings are public information, we allow updates from anon key
CREATE POLICY "Anyone can update clinic settings" ON public.clinic_settings
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

-- Verify the policy was created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command
FROM pg_policies
WHERE tablename = 'clinic_settings'
AND cmd = 'UPDATE'
ORDER BY policyname;

-- Success message
SELECT '✅ Clinic settings UPDATE policy has been fixed!' as status;
SELECT 'Updates should now work with both authenticated and anon keys.' as note;

