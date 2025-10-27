-- ========================================
-- FIX PROFILE PICTURE INDEX ISSUE
-- ========================================

-- Drop the problematic index that's causing size issues
DROP INDEX IF EXISTS idx_users_profile_picture;

-- The profile_picture column will work without the index
-- For profile pictures, we can use the data without indexing
-- or implement a URL-based approach in the future

-- This allows the profile_picture TEXT column to store
-- any size base64 data without index constraints

