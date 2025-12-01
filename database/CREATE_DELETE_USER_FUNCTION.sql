-- ========================================
-- CREATE DELETE USER ACCOUNT FUNCTION
-- ========================================
-- This function allows users to delete their own account
-- It bypasses RLS by using SECURITY DEFINER

-- Step 1: Create function to delete user account
-- ========================================
CREATE OR REPLACE FUNCTION delete_user_account(user_id_to_delete UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
    result JSON;
BEGIN
    -- Delete related data first (to avoid foreign key constraints)
    
    -- Delete appointments
    DELETE FROM public.appointments 
    WHERE patient_id = user_id_to_delete OR dentist_id = user_id_to_delete;
    
    -- Delete messages
    DELETE FROM public.messages 
    WHERE sender_id = user_id_to_delete OR receiver_id = user_id_to_delete;
    
    -- Delete notifications
    DELETE FROM public.notifications 
    WHERE user_id = user_id_to_delete;
    
    -- Delete treatments
    DELETE FROM public.treatments 
    WHERE patient_id = user_id_to_delete;
    
    -- Delete user profile from users table
    DELETE FROM public.users 
    WHERE id = user_id_to_delete;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Return success
    result := json_build_object(
        'success', true,
        'deleted_rows', deleted_count,
        'message', 'User account and all related data deleted successfully'
    );
    
    RETURN result;
    
EXCEPTION
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

-- Step 2: Grant execute permissions
-- ========================================
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO anon;
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;

-- Step 3: Add RLS policy for DELETE (as backup)
-- ========================================
DROP POLICY IF EXISTS "Users can delete own profile" ON users;
CREATE POLICY "Users can delete own profile" ON users
    FOR DELETE USING (auth.uid() = id);

-- Step 4: Verify the function was created
-- ========================================
SELECT 
    routine_name, 
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'delete_user_account';

-- Step 5: Test the function (optional - uncomment to test)
-- ========================================
-- SELECT delete_user_account('USER_ID_HERE'::UUID);

