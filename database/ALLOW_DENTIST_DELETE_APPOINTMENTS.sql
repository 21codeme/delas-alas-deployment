-- Allow dentists to DELETE appointments (e.g. for "Delete All Appointments" in Appointments Management)
-- Run this in Supabase SQL Editor if the Delete All button returns 403.

DROP POLICY IF EXISTS "Dentists can delete appointments" ON appointments;

CREATE POLICY "Dentists can delete appointments" ON appointments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.user_type = 'dentist'
        )
    );

-- Verify
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'appointments' AND cmd = 'DELETE';
