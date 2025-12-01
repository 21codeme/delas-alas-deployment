-- ========================================
-- FIX PROFILE CREATION DURING REGISTRATION
-- ========================================
-- This fixes the "Profile creation failed, but user is registered in auth" error

-- Step 1: Drop existing functions with conflicting names
-- ========================================
-- Drop the trigger function (no parameters)
DROP FUNCTION IF EXISTS create_user_profile() CASCADE;

-- Drop the RPC function (with parameters) - specify full signature
DROP FUNCTION IF EXISTS create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT) CASCADE;

-- Step 2: Create/Update RPC functions for profile creation
-- ========================================

-- Function 1: create_user_profile_rpc (returns JSON) - renamed to avoid conflicts
CREATE OR REPLACE FUNCTION create_user_profile_rpc(
    user_id UUID,
    user_name TEXT,
    user_email TEXT,
    user_phone TEXT,
    user_type TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    -- Insert user profile
    INSERT INTO users (id, name, email, phone, user_type)
    VALUES (user_id, user_name, user_email, user_phone, user_type);
    
    -- Return success
    result := json_build_object(
        'success', true, 
        'user_id', user_id,
        'message', 'User profile created successfully'
    );
    
    RETURN result;
    
EXCEPTION
    WHEN unique_violation THEN
        -- User already exists, return success
        result := json_build_object(
            'success', true, 
            'user_id', user_id,
            'message', 'User profile already exists'
        );
        RETURN result;
    WHEN OTHERS THEN
        -- Return error
        result := json_build_object(
            'success', false, 
            'error', SQLERRM,
            'code', SQLSTATE
        );
        RETURN result;
END;
$$;

-- Function 2: insert_user_profile (returns BOOLEAN)
DROP FUNCTION IF EXISTS insert_user_profile(UUID, TEXT, TEXT, TEXT, TEXT) CASCADE;

CREATE OR REPLACE FUNCTION insert_user_profile(
    user_id UUID,
    user_name TEXT,
    user_email TEXT,
    user_phone TEXT,
    user_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO users (id, name, email, phone, user_type)
    VALUES (user_id, user_name, user_email, user_phone, user_type)
    ON CONFLICT (id) DO NOTHING;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

-- Step 3: Grant permissions on RPC functions (specify full signatures)
-- ========================================
GRANT EXECUTE ON FUNCTION create_user_profile_rpc(UUID, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION create_user_profile_rpc(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION insert_user_profile(UUID, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION insert_user_profile(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Step 4: Fix RLS policies to allow profile creation during signup
-- ========================================

-- Drop existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create a more permissive INSERT policy that allows signup
-- This allows users to insert their own profile during registration
CREATE POLICY "Allow user profile creation during signup" ON users
    FOR INSERT 
    WITH CHECK (
        -- Allow if the user is inserting their own profile (auth.uid() = id)
        auth.uid() = id
        OR
        -- Allow if no auth context (for RPC functions with SECURITY DEFINER)
        auth.uid() IS NULL
    );

-- Step 5: Create/Update trigger function for auto-profile creation
-- ========================================

-- Drop existing trigger function if it exists
DROP FUNCTION IF EXISTS create_user_profile_trigger() CASCADE;

-- Update the trigger function to handle errors gracefully
CREATE OR REPLACE FUNCTION create_user_profile_trigger()
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

-- Step 6: Create/Update trigger
-- ========================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile_trigger();

-- Step 7: Verify the setup
-- ========================================
-- Check if functions exist
SELECT 
    routine_name, 
    routine_type,
    security_type,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('create_user_profile_rpc', 'insert_user_profile', 'create_user_profile_trigger')
ORDER BY routine_name;

-- Check if policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- Check if trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

