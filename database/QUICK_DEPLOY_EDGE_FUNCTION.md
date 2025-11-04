# Quick Guide: Deploy Edge Function via Supabase Dashboard

## Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Login to your account
3. Select your project (xlubjwiumytdkxrzojdg)

## Step 2: Create Edge Function
1. Click **"Edge Functions"** sa left sidebar
2. Click **"Create a new function"** button
3. **Function name:** `send-otp-email`
4. Click **"Create function"**

## Step 3: Copy Function Code
1. Open `supabase/functions/send-otp-email/index.ts` sa file explorer mo
2. Copy LAHAT ng code (Ctrl+A, Ctrl+C)
3. Paste sa Edge Function editor sa Supabase Dashboard
4. Click **"Deploy"** button

## Step 4: Set Up Resend (Email Service)
1. Go to https://resend.com/
2. Sign up for free account
3. Verify your email
4. Go to **API Keys** → **Create API Key**
5. Name it: `Supabase Edge Function`
6. Copy the API key (starts with `re_`)

## Step 5: Set Environment Variables
1. Sa Supabase Dashboard → Edge Functions → **Settings**
2. Click **"Secrets"** or **"Environment Variables"**
3. Add these secrets:
   - **Key:** `RESEND_API_KEY`
   - **Value:** (paste your Resend API key)
   - Click **"Add"**
   - **Key:** `FROM_EMAIL`
   - **Value:** `noreply@delasalas.com` (or your verified email)
   - Click **"Add"**

## Step 6: Test the Function
1. Go back to Edge Functions → `send-otp-email`
2. Click **"Invoke"** tab
3. Test with this JSON:
```json
{
  "email": "your-email@example.com",
  "otp": "123456",
  "name": "Test User"
}
```
4. Click **"Invoke function"**
5. Check your email inbox!

## Done! ✅

Now your app will send OTP emails via Supabase Edge Function!

