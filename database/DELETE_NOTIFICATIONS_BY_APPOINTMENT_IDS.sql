-- Delete notifications that reference the given appointment IDs (e.g. when Delete All Appointments is used).
-- Run this in Supabase SQL Editor once.

CREATE OR REPLACE FUNCTION public.delete_notifications_by_appointment_ids(p_appointment_ids uuid[])
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  WITH deleted AS (
    DELETE FROM public.notifications
    WHERE (data->>'appointment_id')::uuid = ANY(p_appointment_ids)
    RETURNING id
  )
  SELECT count(*)::integer INTO deleted_count FROM deleted;
  RETURN deleted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_notifications_by_appointment_ids(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_notifications_by_appointment_ids(uuid[]) TO anon;

SELECT 'delete_notifications_by_appointment_ids RPC created.' AS status;
