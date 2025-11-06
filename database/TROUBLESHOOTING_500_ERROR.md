# Troubleshooting 500 Error in OTP API

## Common Causes of 500 Error

### 1. Missing Environment Variables in Vercel

**Check if these are set:**
- `GMAIL_USER` - Your Gmail address
- `GMAIL_APP_PASSWORD` - Your Gmail App Password (16 characters)
- `SUPABASE_URL` - Your Supabase URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service_role key (IMPORTANT!)

**How to check:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Make sure all variables are set for **Production** environment
3. Make sure values are NOT placeholders (e.g., NOT `your_gmail@gmail.com`)

### 2. Missing `otps` Table in Supabase

**Check if table exists:**
1. Go to Supabase Dashboard → SQL Editor
2. Run this query:
   ```sql
   SELECT * FROM otps LIMIT 1;
   ```
3. If you get an error "relation does not exist", create the table:
   ```sql
   -- Run the CREATE_OTP_TABLE.sql file
   ```

**How to create the table:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `database/CREATE_OTP_TABLE.sql`
3. Click "Run" to execute

### 3. Missing Dependencies

**Check package.json:**
Make sure these are in `package.json`:
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.75.1",
    "nodemailer": "^6.9.7"
  }
}
```

**If missing, add them:**
```bash
npm install @supabase/supabase-js nodemailer
```

## Steps to Fix

### Step 1: Check Vercel Logs
1. Go to Vercel Dashboard → Your Project → Logs
2. Look for the error message when you try to reset password
3. The error will tell you exactly what's wrong

### Step 2: Verify Environment Variables
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Check each variable:
   - **GMAIL_USER**: Should be your actual Gmail (e.g., `jchristian.bsit@gmail.com`)
   - **GMAIL_APP_PASSWORD**: Should be your 16-character app password (no spaces)
   - **SUPABASE_URL**: Should be `https://xlubjwiumytdkxrzojdg.supabase.co`
   - **SUPABASE_SERVICE_ROLE_KEY**: Should be your actual service_role key from Supabase

### Step 3: Create OTP Table in Supabase
1. Go to Supabase Dashboard → SQL Editor
2. Open `database/CREATE_OTP_TABLE.sql`
3. Copy the entire SQL script
4. Paste into SQL Editor
5. Click "Run" to execute

### Step 4: Redeploy on Vercel
1. After fixing environment variables or dependencies
2. Go to Vercel Dashboard → Deployments
3. Click "Redeploy" on the latest deployment
4. Or push a new commit to trigger redeploy

## Quick Test

After fixing, test by:
1. Going to Settings → Change Password
2. Enter current password
3. Enter new password
4. Click "Change Password"
5. Should receive OTP email

## Common Error Messages

### "Supabase credentials not configured"
- **Fix**: Set `SUPABASE_SERVICE_ROLE_KEY` in Vercel environment variables

### "Email service not configured"
- **Fix**: Set `GMAIL_USER` and `GMAIL_APP_PASSWORD` in Vercel environment variables

### "Failed to store OTP" or "relation does not exist"
- **Fix**: Run `CREATE_OTP_TABLE.sql` in Supabase SQL Editor

### "Cannot find module 'nodemailer'"
- **Fix**: Add `nodemailer` to `package.json` and redeploy


