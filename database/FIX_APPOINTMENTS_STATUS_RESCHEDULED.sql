-- Fix: Allow 'rescheduled' in appointments.status (fixes 23514 appointments_status_check)
-- Run this in Supabase SQL Editor once.

-- Drop the existing check constraint (name may be appointments_status_check)
ALTER TABLE public.appointments
  DROP CONSTRAINT IF EXISTS appointments_status_check;

-- Add new constraint including 'rescheduled'
ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_status_check
  CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'));

-- Verify (optional): list constraints on appointments
-- SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'public.appointments'::regclass AND contype = 'c';

SELECT '✅ appointments_status_check updated: rescheduled is now allowed.' AS status;
