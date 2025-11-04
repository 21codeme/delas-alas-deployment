# Supabase OTP Email Setup - Simple Guide

## Overview
This guide shows you how to use Supabase to send OTP emails for password change.

## Step 1: Run SQL Script to Create OTP Functions

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the contents of `database/CREATE_OTP_EMAIL_FUNCTION.sql`
3. Click **"Run"** button
4. This will create:
   - `otp_codes` table (to store OTPs)
   - `store_otp_code()` function (to store OTP)
   - `verify_otp_code()` function (to verify OTP)

## Step 2: Deploy Supabase Edge Function (Optional but Recommended)

### Option A: Use Supabase CLI (Recommended)

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

5. Copy the code from `supabase/functions/send-otp-email/index.ts` to the function file

6. Deploy the function:
   ```bash
   supabase functions deploy send-otp-email
   ```

### Option B: Use Supabase Dashboard

1. Go to **Supabase Dashboard** → **Edge Functions**
2. Click **"Create Function"**
3. Name it: `send-otp-email`
4. Copy the code from `supabase/functions/send-otp-email/index.ts`
5. Click **"Deploy"**

## Step 3: Configure Email Service (For Edge Function)

The Edge Function uses Resend to send emails. You need to:

1. Sign up at **https://resend.com/** (free tier available)
2. Get your Resend API Key
3. In Supabase Dashboard → Edge Functions → Settings
4. Add environment variable:
   - Key: `RESEND_API_KEY`
   - Value: Your Resend API key
   - Key: `FROM_EMAIL`
   - Value: Your sender email (e.g., `noreply@delasalas.com`)

## Step 4: Test It!

1. Try changing your password
2. Check your email inbox for the OTP code
3. The OTP is also stored in the `otp_codes` table in Supabase

## Alternative: Simple Solution (No Edge Functions Needed)

If you don't want to set up Edge Functions, the code will:
1. Store OTP in Supabase database ✅
2. Show OTP in console for testing ✅
3. Use Supabase password reset email as notification ✅

**Note:** For production, you should deploy the Edge Function to actually send OTP emails.

## Troubleshooting

### Edge Function not working?
- Check Edge Functions logs in Supabase Dashboard
- Verify environment variables are set
- Check Resend API key is correct

### OTP not in database?
- Run the SQL script again
- Check RLS policies allow inserts

### Email not sending?
- Check Edge Function logs
- Verify Resend API key
- Check spam folder

## Current Status

✅ OTP stored in Supabase database
✅ Code ready for Edge Function
✅ Fallback to console logging for testing
⚠️ Edge Function needs to be deployed for actual email sending

