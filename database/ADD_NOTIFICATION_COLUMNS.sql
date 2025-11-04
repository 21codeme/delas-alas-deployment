-- Add Notification Settings columns to users table
-- Run this in your Supabase SQL Editor

-- Add notification preference columns (can be null - optional fields)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT false;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS appointment_reminders BOOLEAN DEFAULT true;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS treatment_updates BOOLEAN DEFAULT true;

-- Add comments for documentation
COMMENT ON COLUMN users.email_notifications IS 'Patient email notifications preference (default: true)';
COMMENT ON COLUMN users.sms_notifications IS 'Patient SMS notifications preference (default: false)';
COMMENT ON COLUMN users.appointment_reminders IS 'Patient appointment reminders preference (default: true)';
COMMENT ON COLUMN users.treatment_updates IS 'Patient treatment updates preference (default: true)';

-- Verify columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('email_notifications', 'sms_notifications', 'appointment_reminders', 'treatment_updates')
ORDER BY column_name;

