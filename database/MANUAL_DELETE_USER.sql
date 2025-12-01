-- ========================================
-- MANUAL DELETE USER ACCOUNT
-- ========================================
-- Use this to manually delete a user account from Supabase
-- Replace the email/ID with the user you want to delete

-- Step 1: Delete user from users table
-- ========================================
-- Option A: Delete by email
DELETE FROM public.users 
WHERE email = 'christian21.bsit@gmail.com';

-- Option B: Delete by ID (if you know the user ID)
-- DELETE FROM public.users 
-- WHERE id = '113f213d-8ff2-46da-9289-394f0ef853d0';

-- Step 2: Delete related data
-- ========================================
-- Delete appointments
DELETE FROM public.appointments 
WHERE patient_id = (SELECT id FROM public.users WHERE email = 'christian21.bsit@gmail.com')
   OR dentist_id = (SELECT id FROM public.users WHERE email = 'christian21.bsit@gmail.com');

-- Delete messages (as sender)
DELETE FROM public.messages 
WHERE sender_id = (SELECT id FROM public.users WHERE email = 'christian21.bsit@gmail.com');

-- Delete messages (as receiver)
DELETE FROM public.messages 
WHERE receiver_id = (SELECT id FROM public.users WHERE email = 'christian21.bsit@gmail.com');

-- Delete notifications
DELETE FROM public.notifications 
WHERE user_id = (SELECT id FROM public.users WHERE email = 'christian21.bsit@gmail.com');

-- Delete treatments
DELETE FROM public.treatments 
WHERE patient_id = (SELECT id FROM public.users WHERE email = 'christian21.bsit@gmail.com');

-- Step 3: Delete from auth.users (requires admin access)
-- ========================================
-- Note: This requires service_role key or admin access
-- You can do this via Supabase Dashboard → Authentication → Users
-- Or use the Supabase Admin API

-- Verify deletion
SELECT * FROM public.users WHERE email = 'christian21.bsit@gmail.com';
-- Should return 0 rows if deletion was successful

