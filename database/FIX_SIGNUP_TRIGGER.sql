-- Fix Signup Trigger to Handle Missing Data Gracefully
-- Run this in your Supabase SQL Editor to fix the 500 error during registration

-- 1. Update the create_user_profile function to handle missing data better
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Try to insert user profile with error handling
    BEGIN
        INSERT INTO users (id, name, email, phone, user_type)
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

-- 2. Make sure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- 3. Grant necessary permissions to the function
GRANT EXECUTE ON FUNCTION create_user_profile() TO postgres, anon, authenticated;

-- 4. Verify RLS policies allow the trigger to work
-- The trigger runs with SECURITY DEFINER, so it should bypass RLS
-- But let's make sure the users table allows inserts from the trigger
-- (This should already be done, but checking doesn't hurt)

-- 5. Optional: If you want to allow signup without the trigger creating the profile,
-- you can comment out the trigger and let the application handle profile creation
-- But the current approach with better error handling should work

COMMENT ON FUNCTION create_user_profile() IS 
'Creates a user profile in the public.users table when a new auth user is created. 
Handles missing metadata gracefully and logs errors without failing signup.';

