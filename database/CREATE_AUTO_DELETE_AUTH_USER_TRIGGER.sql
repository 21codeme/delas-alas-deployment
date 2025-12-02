-- ========================================
-- CREATE TRIGGER TO AUTO-DELETE FROM AUTH.USERS
-- ========================================
-- This trigger automatically deletes the user from auth.users
-- when they are deleted from public.users
-- NOTE: This requires proper permissions to access auth.users

-- Step 1: Create function to delete from auth.users when public.users is deleted
-- ========================================
CREATE OR REPLACE FUNCTION delete_auth_user_on_public_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Delete from auth.users when user is deleted from public.users
    -- This allows email to be reused immediately
    DELETE FROM auth.users 
    WHERE id = OLD.id;
    
    -- Log the deletion (optional)
    RAISE NOTICE 'Deleted user % from auth.users', OLD.id;
    
    RETURN OLD;
EXCEPTION
    WHEN insufficient_privilege THEN
        -- If we don't have permission, just log a warning
        RAISE WARNING 'Could not delete user % from auth.users: insufficient privileges. User must be deleted manually from Authentication → Users.', OLD.id;
        RETURN OLD;
    WHEN OTHERS THEN
        -- Log error but don't fail the deletion from public.users
        RAISE WARNING 'Error deleting user % from auth.users: %', OLD.id, SQLERRM;
        RETURN OLD;
END;
$$;

-- Step 2: Create trigger
-- ========================================
DROP TRIGGER IF EXISTS auto_delete_auth_user ON public.users;
CREATE TRIGGER auto_delete_auth_user
    AFTER DELETE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION delete_auth_user_on_public_delete();

-- Step 3: Grant necessary permissions
-- ========================================
-- The function needs to be owned by a user with access to auth schema
-- This is typically handled by Supabase automatically, but we can try to grant

-- Step 4: Verify the trigger was created
-- ========================================
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'auto_delete_auth_user';

-- Note: If this trigger doesn't work due to permissions,
-- users will need to manually delete from Authentication → Users
-- Or use the RPC function delete_auth_user() which requires proper setup

