-- ========================================
-- ADD PROFILE PICTURE COLUMN TO USERS TABLE
-- ========================================

-- Add profile_picture column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_profile_picture ON users(profile_picture) WHERE profile_picture IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.profile_picture IS 'Base64 encoded profile picture or URL to profile picture';

-- Grant necessary permissions (if not already granted)
GRANT SELECT ON users TO anon;
GRANT SELECT ON users TO authenticated;

-- Note: The profile_picture field will store base64-encoded images
-- or URLs to images stored in Supabase Storage
-- Max length is 2MB for base64 images (TEXT can handle much more)



