-- ========================================
-- DELETE LIMA ACCOUNT MANUALLY
-- ========================================
-- This will delete the "Lima" account and allow the email to be reused

-- Step 1: Delete from public.users table
-- ========================================
DELETE FROM public.users 
WHERE email = 'christian21.bsit@gmail.com';

-- Verify deletion
SELECT * FROM public.users WHERE email = 'christian21.bsit@gmail.com';
-- Should return 0 rows

-- Step 2: Delete related data
-- ========================================
-- Delete appointments
DELETE FROM public.appointments 
WHERE patient_id IN (SELECT id FROM public.users WHERE email = 'christian21.bsit@gmail.com')
   OR dentist_id IN (SELECT id FROM public.users WHERE email = 'christian21.bsit@gmail.com');

-- Delete messages
DELETE FROM public.messages 
WHERE sender_id IN (SELECT id FROM public.users WHERE email = 'christian21.bsit@gmail.com')
   OR receiver_id IN (SELECT id FROM public.users WHERE email = 'christian21.bsit@gmail.com');

-- Delete notifications
DELETE FROM public.notifications 
WHERE user_id IN (SELECT id FROM public.users WHERE email = 'christian21.bsit@gmail.com');

-- Delete treatments
DELETE FROM public.treatments 
WHERE patient_id IN (SELECT id FROM public.users WHERE email = 'christian21.bsit@gmail.com');

-- Step 3: Delete from auth.users (if you have admin access)
-- ========================================
-- Note: This requires service_role key or admin access
-- You can do this via Supabase Dashboard → Authentication → Users
-- Or use the Supabase Admin API

-- If you have admin access, uncomment this:
-- DELETE FROM auth.users WHERE email = 'christian21.bsit@gmail.com';

-- Step 4: Verify all deletions
-- ========================================
SELECT 'Users table' as table_name, COUNT(*) as count 
FROM public.users WHERE email = 'christian21.bsit@gmail.com'
UNION ALL
SELECT 'Appointments', COUNT(*) 
FROM public.appointments 
WHERE patient_id IN (SELECT id FROM public.users WHERE email = 'christian21.bsit@gmail.com')
   OR dentist_id IN (SELECT id FROM public.users WHERE email = 'christian21.bsit@gmail.com')
UNION ALL
SELECT 'Messages', COUNT(*) 
FROM public.messages 
WHERE sender_id IN (SELECT id FROM public.users WHERE email = 'christian21.bsit@gmail.com')
   OR receiver_id IN (SELECT id FROM public.users WHERE email = 'christian21.bsit@gmail.com')
UNION ALL
SELECT 'Notifications', COUNT(*) 
FROM public.notifications 
WHERE user_id IN (SELECT id FROM public.users WHERE email = 'christian21.bsit@gmail.com')
UNION ALL
SELECT 'Treatments', COUNT(*) 
FROM public.treatments 
WHERE patient_id IN (SELECT id FROM public.users WHERE email = 'christian21.bsit@gmail.com');

-- All counts should be 0 if deletion was successful


