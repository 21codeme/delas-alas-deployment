-- Fix: Allow 'rescheduled' in appointments.status (fixes 23514 appointments_status_check)
-- Run in Supabase SQL Editor.

-- STEP 1: Find where appointments table lives (run this first if you get "relation does not exist")
-- SELECT table_schema, table_name
-- FROM information_schema.tables
-- WHERE table_name = 'appointments';

-- STEP 2: Use the schema from Step 1 in the commands below. If schema is "public", leave as-is.
-- If Step 1 returned a different schema (e.g. "app"), replace "public" with that schema name below.

DO $$
DECLARE
  tbl_schema text := 'public';
  tbl_name text := 'appointments';
  full_name text;
BEGIN
  -- Check if table exists in public; if not, try to find it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = tbl_schema AND table_name = tbl_name
  ) THEN
    SELECT table_schema INTO tbl_schema
    FROM information_schema.tables
    WHERE table_name = tbl_name
    LIMIT 1;
    IF tbl_schema IS NULL THEN
      RAISE EXCEPTION 'Table "appointments" not found in any schema. Create the table first or check you are in the correct Supabase project.';
    END IF;
  END IF;
  full_name := quote_ident(tbl_schema) || '.' || quote_ident(tbl_name);

  EXECUTE format('ALTER TABLE %s DROP CONSTRAINT IF EXISTS appointments_status_check', full_name);
  EXECUTE format('ALTER TABLE %s ADD CONSTRAINT appointments_status_check CHECK (status IN (''pending'', ''confirmed'', ''completed'', ''cancelled'', ''rescheduled''))', full_name);
  RAISE NOTICE 'appointments_status_check updated: rescheduled is now allowed. Table: %', full_name;
END $$;
