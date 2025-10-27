# Profile Picture Setup - Instructions

## Step 1: Run SQL Script in Supabase

1. Open your Supabase Dashboard: https://app.supabase.com
2. Select your project: `xlubjwiumytdkxrzojdg`
3. Go to SQL Editor (left sidebar)
4. Click "New Query"
5. Copy and paste this SQL:

```sql
-- Add profile_picture column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_profile_picture ON users(profile_picture) WHERE profile_picture IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.profile_picture IS 'Base64 encoded profile picture or URL to profile picture';
```

6. Click "Run" button
7. You should see "Success. No rows returned"

## Step 2: Upload Profile Pictures

### For Dentists:
1. Go to Dentist Dashboard
2. Click "Settings" in sidebar
3. Scroll to "Profile Picture" section
4. Click "Upload Picture"
5. Select an image (JPG, PNG, GIF - max 5MB)
6. Check console: Should see "💾 Saving profile picture to Supabase..."
7. Wait for "✅ Profile picture saved to Supabase"

### For Patients:
1. Go to Patient Dashboard
2. Click "Settings" in sidebar
3. Scroll to "Profile Picture" section
4. Click "Upload Picture"
5. Select an image (JPG, PNG, GIF - max 5MB)
6. Check console: Should see "💾 Saving profile picture to Supabase..."
7. Wait for "✅ Profile picture saved to Supabase"

## Step 3: Test in Messages

### Dentist View:
1. Go to Dentist Dashboard → Messages
2. Click on a conversation with a patient
3. Patient's profile picture should appear in:
   - Conversation list (left side)
   - Chat header (top right)
   - Message avatars (in chat bubbles)

### Patient View:
1. Go to Patient Dashboard → Messages
2. Click on a conversation with a dentist
3. Dentist's profile picture should appear in:
   - Conversation list (left side)
   - Chat header (top right)
   - Message avatars (in chat bubbles)

## Troubleshooting

### Profile Pictures Not Showing:
1. **Check Console**: Open browser DevTools (F12)
2. Look for errors when loading conversations
3. Check if "🖼️ Loading profile pictures for users:" appears
4. Verify "✅ Profile pictures loaded:" shows how many loaded

### Still Not Working:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh the page (F5)
3. Re-upload profile pictures
4. Check Supabase Database → users table
5. Verify `profile_picture` column exists and has data

## Notes:
- Profile pictures are stored as base64-encoded strings in Supabase
- Maximum size: 5MB per image
- Supported formats: JPG, PNG, GIF
- Profile pictures sync across all devices
- If Supabase fails, falls back to localStorage



