-- ========================================
-- DELETE LIMA ACCOUNT FROM AUTH.USERS
-- ========================================
-- This will delete the account from auth.users so the email can be reused
-- IMPORTANT: This requires admin/service_role access

-- Step 1: Delete from public.users first
-- ========================================
DELETE FROM public.users 
WHERE email = 'christian21.bsit@gmail.com';

-- Step 2: Delete from auth.users (requires admin access)
-- ========================================
-- Note: You need to do this via Supabase Dashboard or use service_role key
-- Go to: Authentication → Users → Find the user → Delete

-- If you have service_role key, you can use this SQL function:
-- This function needs to be created with SECURITY DEFINER and service_role permissions

-- Alternative: Use Supabase Dashboard
-- 1. Go to Supabase Dashboard
-- 2. Click "Authentication" → "Users"
-- 3. Search for "christian21.bsit@gmail.com"
-- 4. Click the user → Click "Delete" button
-- 5. Confirm deletion

-- Step 3: Verify deletion
-- ========================================
-- Check public.users
SELECT 'public.users' as table_name, COUNT(*) as count 
FROM public.users WHERE email = 'christian21.bsit@gmail.com';

-- Check auth.users (if you have access)
-- SELECT 'auth.users' as table_name, COUNT(*) as count 
-- FROM auth.users WHERE email = 'christian21.bsit@gmail.com';

-- Both should return 0 if deletion was successful


