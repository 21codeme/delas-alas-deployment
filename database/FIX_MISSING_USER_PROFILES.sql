-- Fix Missing User Profiles
-- Run this in your Supabase SQL Editor to:
-- 1. Fix the trigger to auto-create profiles
-- 2. Create missing profiles for existing auth users

-- Step 1: Fix the trigger function with better error handling
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Try to insert user profile with error handling
    BEGIN
        INSERT INTO public.users (id, name, email, phone, user_type)
        VALUES (
            NEW.id,
            COALESCE(
                NEW.raw_user_meta_data->>'name', 
                split_part(NEW.email, '@', 1)
            ),
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'phone', ''),
            COALESCE(
                NEW.raw_user_meta_data->>'user_type', 
                'patient'
            )
        );
    EXCEPTION
        WHEN unique_violation THEN
            -- User profile already exists, that's okay
            RAISE NOTICE 'User profile already exists for user %', NEW.id;
        WHEN OTHERS THEN
            -- Log the error but don't fail the signup
            RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Step 3: Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_user_profile() TO postgres, anon, authenticated;

-- Step 4: Create missing profiles for existing auth users
-- This will create profiles for users who registered but don't have profiles yet
INSERT INTO public.users (id, name, email, phone, user_type)
SELECT 
    au.id,
    COALESCE(
        au.raw_user_meta_data->>'name',
        split_part(au.email, '@', 1)
    ) AS name,
    au.email,
    COALESCE(au.raw_user_meta_data->>'phone', '') AS phone,
    COALESCE(au.raw_user_meta_data->>'user_type', 'patient') AS user_type
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL  -- Only users without profiles
ON CONFLICT (id) DO NOTHING;  -- Don't create duplicates

-- Step 5: Verify the results
SELECT 
    'Total auth users' AS description,
    COUNT(*) AS count
FROM auth.users
UNION ALL
SELECT 
    'Total user profiles' AS description,
    COUNT(*) AS count
FROM public.users
UNION ALL
SELECT 
    'Missing profiles' AS description,
    COUNT(*) AS count
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Step 6: Show newly created profiles (if any)
SELECT 
    id,
    name,
    email,
    phone,
    user_type,
    created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;

COMMENT ON FUNCTION create_user_profile() IS 
'Creates a user profile in the public.users table when a new auth user is created. 
Handles missing metadata gracefully and logs errors without failing signup.';

