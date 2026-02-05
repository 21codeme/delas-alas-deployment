-- Create a database function to create notifications that bypasses RLS
-- This allows dentists to create notifications for patients
-- Run this in your Supabase SQL Editor

-- Step 1: Create the function with SECURITY DEFINER (bypasses RLS)
CREATE OR REPLACE FUNCTION public.create_notification_for_user(
    p_user_id uuid,
    p_type text,
    p_title text,
    p_message text,
    p_data jsonb DEFAULT NULL,
    p_priority text DEFAULT 'normal',
    p_expires_at timestamp with time zone DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
AS $$
DECLARE
    v_notification_id uuid;
BEGIN
    -- Insert the notification
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        data,
        priority,
        expires_at,
        created_at,
        updated_at
    ) VALUES (
        p_user_id,
        p_type,
        p_title,
        p_message,
        p_data,
        p_priority,
        p_expires_at,
        now(),
        now()
    )
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$;

-- Step 2: Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_notification_for_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification_for_user TO anon;

-- Step 3: Also update RLS policies as backup
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true); -- Allow any authenticated user to create notifications

-- Verify the function was created
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'create_notification_for_user';

SELECT '✅ Notification function created successfully! Use RPC call: create_notification_for_user' as status;
