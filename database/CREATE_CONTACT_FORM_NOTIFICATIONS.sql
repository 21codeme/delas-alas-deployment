-- Create RPC: when someone submits the Contact Us form on the index page,
-- create a notification for every dentist so it appears in dentist Notifications.
-- Run this in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION public.create_contact_form_notifications(
  p_name text,
  p_email text,
  p_phone text,
  p_message text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  inserted_count integer := 0;
  msg_preview text;
BEGIN
  msg_preview := left(p_message, 120);
  IF length(p_message) > 120 THEN
    msg_preview := msg_preview || '...';
  END IF;

  FOR r IN
    SELECT id FROM public.users WHERE user_type = 'dentist'
  LOOP
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      data,
      priority,
      is_read
    ) VALUES (
      r.id,
      'message',
      'Contact form: ' || coalesce(p_name, 'Unknown'),
      msg_preview,
      jsonb_build_object(
        'source', 'contact_form',
        'contact_name', p_name,
        'contact_email', p_email,
        'contact_phone', coalesce(p_phone, ''),
        'contact_message', p_message
      ),
      'high',
      false
    );
    inserted_count := inserted_count + 1;
  END LOOP;

  RETURN inserted_count;
END;
$$;

-- Allow anonymous callers (index page) to execute this function
GRANT EXECUTE ON FUNCTION public.create_contact_form_notifications(text, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.create_contact_form_notifications(text, text, text, text) TO authenticated;

SELECT 'Contact form notifications function created. Dentists will see messages in Notifications.' AS status;
