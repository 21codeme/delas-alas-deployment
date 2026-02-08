-- RPC: Mark one notification as read by id and user_id (so it persists after refresh)
-- Callable with anon key so dentist dashboard doesn't need JWT for mark-as-read to persist.
-- Run this in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION public.mark_notification_read(
  p_notification_id uuid,
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = true, updated_at = now()
  WHERE id = p_notification_id AND user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_notification_read(uuid, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.mark_notification_read(uuid, uuid) TO authenticated;

SELECT 'mark_notification_read RPC created. Notifications marked as read will persist after refresh.' AS status;
