-- ========================================
-- CREATE FUNCTION TO DELETE FROM AUTH.USERS
-- ========================================
-- This function allows deletion from auth.users table
-- NOTE: This requires service_role permissions or admin access
-- For security, this should only be called from trusted contexts

-- Step 1: Create function to delete from auth.users
-- ========================================
-- Note: This function requires elevated permissions
-- It uses SECURITY DEFINER to run with the function owner's privileges
CREATE OR REPLACE FUNCTION delete_auth_user(user_id_to_delete UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    result JSON;
    deleted_count INTEGER;
BEGIN
    -- Delete from auth.users
    -- Note: This requires the function to be owned by a superuser or have proper grants
    DELETE FROM auth.users 
    WHERE id = user_id_to_delete;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Return success
    result := json_build_object(
        'success', true,
        'deleted_rows', deleted_count,
        'message', 'User deleted from auth.users successfully'
    );
    
    RETURN result;
    
EXCEPTION
    WHEN insufficient_privilege THEN
        result := json_build_object(
            'success', false,
            'error', 'Insufficient privileges to delete from auth.users',
            'hint', 'This function requires service_role permissions. Use Supabase Dashboard → Authentication → Users to delete manually.'
        );
        RETURN result;
    WHEN OTHERS THEN
        result := json_build_object(
            'success', false,
            'error', SQLERRM,
            'code', SQLSTATE
        );
        RETURN result;
END;
$$;

-- Step 2: Grant execute permissions (restricted)
-- ========================================
-- Only grant to authenticated users (they can only delete their own account)
GRANT EXECUTE ON FUNCTION delete_auth_user(UUID) TO authenticated;

-- Step 3: Add security check in the function
-- ========================================
-- The function should verify that auth.uid() = user_id_to_delete
-- This ensures users can only delete their own account

-- Update the function to include security check
CREATE OR REPLACE FUNCTION delete_auth_user(user_id_to_delete UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    result JSON;
    deleted_count INTEGER;
    current_user_id UUID;
BEGIN
    -- Get current authenticated user ID
    current_user_id := auth.uid();
    
    -- Security check: Only allow users to delete their own account
    IF current_user_id IS NULL OR current_user_id != user_id_to_delete THEN
        result := json_build_object(
            'success', false,
            'error', 'Unauthorized: You can only delete your own account',
            'code', 'UNAUTHORIZED'
        );
        RETURN result;
    END IF;
    
    -- Delete from auth.users
    DELETE FROM auth.users 
    WHERE id = user_id_to_delete;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Return success
    result := json_build_object(
        'success', true,
        'deleted_rows', deleted_count,
        'message', 'User deleted from auth.users successfully'
    );
    
    RETURN result;
    
EXCEPTION
    WHEN insufficient_privilege THEN
        result := json_build_object(
            'success', false,
            'error', 'Insufficient privileges to delete from auth.users',
            'hint', 'This function requires service_role permissions. Use Supabase Dashboard → Authentication → Users to delete manually.'
        );
        RETURN result;
    WHEN OTHERS THEN
        result := json_build_object(
            'success', false,
            'error', SQLERRM,
            'code', SQLSTATE
        );
        RETURN result;
END;
$$;

-- Step 4: Verify the function was created
-- ========================================
SELECT 
    routine_name, 
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'delete_auth_user';


