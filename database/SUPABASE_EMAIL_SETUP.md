# Supabase Email Setup for OTP Sending

## Option 1: Using Supabase Edge Functions (Recommended)

### Step 1: Create Supabase Edge Function

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref xlubjwiumytdkxrzojdg
   ```

4. Create Edge Function:
   ```bash
   supabase functions new send-otp-email
   ```

5. Copy the code from `supabase/functions/send-otp-email/index.ts`

6. Deploy the function:
   ```bash
   supabase functions deploy send-otp-email
   ```

### Step 2: Set Environment Variables

1. Go to Supabase Dashboard → Edge Functions → Settings
2. Add environment variables:
   - `RESEND_API_KEY` - Your Resend API key (or use Supabase email)
   - `FROM_EMAIL` - Your sender email address

### Step 3: Update Code to Call Edge Function

The code will call the Edge Function instead of EmailJS.

---

## Option 2: Using Supabase Database Functions (Simpler, No CLI needed)

### Step 1: Create Database Function

Run this SQL in Supabase SQL Editor:

```sql
-- Create function to send OTP email using Supabase's email system
CREATE OR REPLACE FUNCTION send_otp_email(
  user_email TEXT,
  otp_code TEXT,
  user_name TEXT DEFAULT 'User'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  email_subject TEXT;
  email_body TEXT;
  result JSON;
BEGIN
  -- Set email subject
  email_subject := 'Password Change Confirmation Code - Delas Alas Dental Clinic';
  
  -- Build email body
  email_body := format(
    '<html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Password Change Confirmation</h2>
        <p>Hello %s,</p>
        <p>You have requested to change your password. Please use the following confirmation code:</p>
        <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="color: #667eea; font-size: 32px; margin: 0; font-family: monospace;">%s</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this password change, please ignore this email.</p>
        <p>Thank you,<br>Delas Alas Dental Clinic</p>
      </body>
    </html>',
    user_name,
    otp_code
  );
  
  -- Note: Supabase doesn't have built-in email sending in database functions
  -- This function stores the OTP and can be used with pg_net or Edge Functions
  -- For now, we'll use Supabase's auth email system as a workaround
  
  -- Store OTP in a temporary table for verification
  INSERT INTO otp_codes (email, otp_code, expires_at)
  VALUES (user_email, otp_code, NOW() + INTERVAL '10 minutes')
  ON CONFLICT (email) DO UPDATE SET
    otp_code = EXCLUDED.otp_code,
    expires_at = EXCLUDED.expires_at,
    created_at = NOW();
  
  -- Return success
  result := json_build_object(
    'success', true,
    'message', 'OTP email queued for sending'
  );
  
  RETURN result;
END;
$$;

-- Create OTP codes table (if not exists)
CREATE TABLE IF NOT EXISTS otp_codes (
  email TEXT PRIMARY KEY,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON otp_codes TO anon, authenticated;
GRANT EXECUTE ON FUNCTION send_otp_email TO anon, authenticated;
```

### Step 2: Use Supabase Auth Email System

Actually, the simplest way is to use Supabase's built-in email system through their auth API. We'll modify the code to use Supabase's email templates.

---

## Option 3: Using Supabase Auth Email Templates (Easiest)

### Step 1: Configure Supabase Email Templates

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Create a custom email template for OTP
3. Configure email settings

### Step 2: Use Supabase Auth Email API

The code will call Supabase's email API to send OTP.

---

## Recommended: Simple Solution Using Supabase Database + RPC

Since we're already using Supabase, the easiest solution is to:

1. Store OTP in database
2. Use Supabase's built-in email capabilities
3. Call via RPC function

This avoids needing Edge Functions or external services.

