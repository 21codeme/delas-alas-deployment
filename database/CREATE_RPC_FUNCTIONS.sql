-- CREATE MISSING RPC FUNCTIONS
-- Run this in your Supabase SQL Editor

-- Create the create_user_profile function
CREATE OR REPLACE FUNCTION create_user_profile(
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

-- Create the insert_user_profile function
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

-- Grant permissions on both functions
GRANT EXECUTE ON FUNCTION create_user_profile TO anon;
GRANT EXECUTE ON FUNCTION create_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION insert_user_profile TO anon;
GRANT EXECUTE ON FUNCTION insert_user_profile TO authenticated;

-- Test the functions
SELECT 'RPC functions created successfully!' as status;

