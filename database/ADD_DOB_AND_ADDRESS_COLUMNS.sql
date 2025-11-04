-- Add Date of Birth and Address columns to users table
-- Run this in your Supabase SQL Editor

-- Add date_of_birth column (can be null - optional field)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add address column (can be null - optional field)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add comments for documentation
COMMENT ON COLUMN users.date_of_birth IS 'Patient date of birth (optional field)';
COMMENT ON COLUMN users.address IS 'Patient address (optional field)';

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('date_of_birth', 'address')
ORDER BY column_name;

