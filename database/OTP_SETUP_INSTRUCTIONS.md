# OTP System Setup Instructions

## Overview
This OTP (One-Time Password) system is used for password reset functionality. It's a more user-friendly alternative to password reset links.

## Flow
1. User requests password reset → receives OTP via email
2. User enters OTP → verifies OTP
3. User enters new password → password is reset

## Setup Steps

### 1. Create OTP Table in Supabase

Go to **Supabase Dashboard** → **SQL Editor** → Run this SQL:

```sql
-- See database/CREATE_OTP_TABLE.sql for the complete SQL script
```

Or run the SQL file:
- Open `database/CREATE_OTP_TABLE.sql`
- Copy the entire content
- Paste in Supabase SQL Editor
- Click **Run**

### 2. Configure Vercel Environment Variables

Go to **Vercel Dashboard** → **Project Settings** → **Environment Variables** → Add:

#### Required Variables:
- `GMAIL_USER` = your_gmail@gmail.com
- `GMAIL_APP_PASSWORD` = your_gmail_app_password (see Gmail setup below)
- `SUPABASE_URL` = https://xlubjwiumytdkxrzojdg.supabase.co
- `SUPABASE_KEY` = your_anon_key (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)
- `SUPABASE_SERVICE_ROLE_KEY` = your_service_role_key (for admin operations)

#### Gmail App Password Setup:
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate new app password for "Mail"
5. Copy the 16-character password
6. Use it as `GMAIL_APP_PASSWORD`

### 3. API Endpoints

The following Vercel serverless functions are created:

1. **`/api/send-otp-email.js`**
   - Generates 6-digit OTP
   - Stores OTP in Supabase `otps` table
   - Sends OTP via email using Gmail SMTP

2. **`/api/verify-otp.js`**
   - Verifies OTP code
   - Checks if OTP is valid and not expired
   - Marks OTP as verified

3. **`/api/reset-password.js`**
   - Resets password after OTP verification
   - Uses Supabase Admin API
   - Requires `SUPABASE_SERVICE_ROLE_KEY`

### 4. Frontend Pages

- **`password-reset-otp.html`** - OTP-based password reset page
  - Step 1: Enter email → Send OTP
  - Step 2: Enter OTP → Verify
  - Step 3: Enter new password → Reset

### 5. Settings Integration

Both patient and dentist settings have been updated to:
- Send OTP instead of password reset link
- Redirect to `password-reset-otp.html` after sending OTP

## Usage

### For Users:
1. Go to Settings → Security Settings
2. Click "Change Password"
3. Enter current password and new password
4. Click "Change Password"
5. Check email for OTP code
6. Enter OTP on password reset page
7. Enter new password
8. Password is reset!

### For Developers:
- OTP expires in 10 minutes
- OTP can be resent after 60 seconds
- OTP is stored in Supabase `otps` table
- OTP is marked as verified after successful verification
- Verified OTPs are deleted after password reset

## Testing

1. Test OTP sending:
   ```bash
   curl -X POST https://your-app.vercel.app/api/send-otp-email \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com"}'
   ```

2. Test OTP verification:
   ```bash
   curl -X POST https://your-app.vercel.app/api/verify-otp \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "otp": "123456"}'
   ```

3. Test password reset:
   ```bash
   curl -X POST https://your-app.vercel.app/api/reset-password \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "otp": "123456", "newPassword": "newpass123"}'
   ```

## Troubleshooting

### OTP not sending:
- Check Gmail credentials in Vercel environment variables
- Check Supabase `otps` table exists
- Check Vercel function logs

### OTP verification failing:
- Check OTP hasn't expired (10 minutes)
- Check OTP matches exactly (6 digits)
- Check `otps` table has the OTP

### Password reset failing:
- Check `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Check user exists in Supabase auth
- Check Vercel function logs for errors

## Security Notes

- OTP expires in 10 minutes
- OTP is one-time use (marked as verified after use)
- Password reset requires verified OTP
- Service role key should NEVER be exposed to frontend
- All API endpoints are server-side only

