-- Function to delete user account from auth.users
-- This function allows users to delete themselves from auth.users
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION delete_user_account(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Delete from auth.users
    -- Note: This requires SECURITY DEFINER to access auth schema
    DELETE FROM auth.users WHERE id = user_id;
    
    -- Return success
    RETURN;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail
        RAISE WARNING 'Error deleting user from auth.users: %', SQLERRM;
        RETURN;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION delete_user_account(UUID) IS 'Allows users to delete themselves from auth.users table';

