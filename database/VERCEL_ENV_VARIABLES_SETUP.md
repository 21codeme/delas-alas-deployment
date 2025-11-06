# Vercel Environment Variables Setup Guide

## Required Environment Variables

Go to **Vercel Dashboard** → **Project Settings** → **Environment Variables** → Add these variables:

### 1. GMAIL_USER
- **Value:** Your actual Gmail address (e.g., `yourname@gmail.com`)
- **Example:** `jchristian.bsit@gmail.com`
- **Purpose:** Used to send OTP emails via Gmail SMTP

### 2. GMAIL_APP_PASSWORD
- **Value:** Your Gmail App Password (16-character password)
- **How to get:**
  1. Go to Google Account → Security
  2. Enable 2-Step Verification
  3. Go to App Passwords
  4. Generate new app password for "Mail"
  5. Copy the 16-character password
- **Example:** `abcd efgh ijkl mnop` (remove spaces, use as: `abcdefghijklmnop`)
- **Purpose:** Authentication for Gmail SMTP

### 3. SUPABASE_URL
- **Value:** `https://xlubjwiumytdkxrzojdg.supabase.co`
- **Purpose:** Supabase project URL

### 4. SUPABASE_KEY
- **Value:** Your Supabase anon/public key
- **How to get:**
  1. Go to Supabase Dashboard → Project Settings → API
  2. Copy the "anon" or "public" key
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsdWJqd2l1bXl0ZGt4cnpvamRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MTQ2MDAsImV4cCI6MjA3NjI5MDYwMH0.RYal1H6Ibre86bHyMIAmc65WCLt1x0j9p_hbEWdBXnQ`
- **Purpose:** Used for client-side Supabase operations

### 5. SUPABASE_SERVICE_ROLE_KEY (IMPORTANT!)
- **Value:** Your Supabase service_role key
- **How to get:**
  1. Go to Supabase Dashboard → Project Settings → API
  2. Copy the "service_role" key (⚠️ Keep this secret!)
- **Purpose:** Used for admin operations (password reset, OTP management)
- **⚠️ WARNING:** Never expose this key to frontend code! It's only used in serverless functions.

## Current Values (Replace These):

❌ **Wrong (Placeholder values):**
- `GMAIL_USER` = `your_gmail@gmail.com`
- `GMAIL_APP_PASSWORD` = `your_gmail_app_password`
- `SUPABASE_KEY` = `your_anon_key`
- `SUPABASE_SERVICE_ROLE_KEY` = `your_service_role_key_(important)`

✅ **Correct (Actual values):**
- `GMAIL_USER` = `jchristian.bsit@gmail.com` (your actual Gmail)
- `GMAIL_APP_PASSWORD` = `abcdefghijklmnop` (your actual Gmail app password)
- `SUPABASE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your actual anon key)
- `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your actual service_role key)

## Environment Selection

Make sure to set these for:
- ✅ **Production** (for deployed site)
- ✅ **Preview** (for preview deployments)
- ✅ **Development** (optional, for local testing)

## After Adding Variables

1. Click **"Save"** button
2. Wait for Vercel to redeploy (automatic)
3. Test the OTP system:
   - Go to Settings → Security Settings
   - Try to change password
   - Check if OTP is sent to email

## Verification

After adding the variables, test by:
1. Requesting password reset from settings
2. Checking email for OTP
3. Verifying OTP works
4. Resetting password successfully


