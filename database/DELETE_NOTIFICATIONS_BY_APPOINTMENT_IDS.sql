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
  IF p_appointment_ids IS NULL OR array_length(p_appointment_ids, 1) IS NULL THEN
    RETURN 0;
  END IF;
  WITH deleted AS (
    DELETE FROM public.notifications
    WHERE data ? 'appointment_id'
      AND trim(data->>'appointment_id') <> ''
      AND (data->>'appointment_id') IN (SELECT unnest(p_appointment_ids)::text)
    RETURNING id
  )
  SELECT count(*)::integer INTO deleted_count FROM deleted;
  RETURN deleted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_notifications_by_appointment_ids(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_notifications_by_appointment_ids(uuid[]) TO anon;

SELECT 'delete_notifications_by_appointment_ids RPC created.' AS status;
