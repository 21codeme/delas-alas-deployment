-- Fix Clinic Settings Table RLS Policies
-- This ensures the clinic_settings table can be accessed and updated properly

-- First, check if clinic_settings table exists, if not create it
CREATE TABLE IF NOT EXISTS public.clinic_settings (
    id TEXT PRIMARY KEY DEFAULT 'clinic',
    clinic_name TEXT,
    clinic_address TEXT,
    operating_hours TEXT,
    clinic_phone TEXT,
    clinic_email TEXT,
    deployment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for clinic_settings (since it's public information)
-- OR enable RLS with permissive policies
ALTER TABLE public.clinic_settings DISABLE ROW LEVEL SECURITY;

-- If you want to enable RLS instead, use these policies:
-- ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read clinic settings (public information)
-- CREATE POLICY "Anyone can view clinic settings" ON public.clinic_settings
--     FOR SELECT USING (true);

-- Policy: Allow authenticated users to update clinic settings
-- CREATE POLICY "Authenticated users can update clinic settings" ON public.clinic_settings
--     FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to insert clinic settings
-- CREATE POLICY "Authenticated users can insert clinic settings" ON public.clinic_settings
--     FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Insert default clinic settings if table is empty
INSERT INTO public.clinic_settings (id, clinic_name, clinic_address, operating_hours, clinic_phone, clinic_email)
VALUES (
    'clinic',
    'Delas Alas Dental Clinic',
    '123 Main Street, Barangay Health Center, City, Philippines',
    'Monday-Friday: 8:00 AM - 6:00 PM',
    '+63 2 1234 5678',
    'info@delasalasdental.com'
)
ON CONFLICT (id) DO NOTHING;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.clinic_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.clinic_settings TO authenticated;

