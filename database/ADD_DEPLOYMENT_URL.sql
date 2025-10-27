-- Add deployment_url column to clinic_settings table
ALTER TABLE clinic_settings
ADD COLUMN IF NOT EXISTS deployment_url TEXT;

-- Set initial deployment URL (replace with your actual deployed URL)
-- Example: UPDATE clinic_settings SET deployment_url = 'https://your-app.netlify.app/appointment-schedule.html' WHERE id = 'clinic';
-- Or set it via the dentist settings UI

