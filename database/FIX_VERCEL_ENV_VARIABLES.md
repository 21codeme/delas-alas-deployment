# Fix: Supabase Credentials Not Configured

## Error Message
```
Error: Supabase credentials not configured
```

## Root Cause
The `SUPABASE_SERVICE_ROLE_KEY` environment variable is missing or not set correctly in Vercel.

## Solution

### Step 1: Get Your Supabase Service Role Key

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project: **xlubjwiumytdkxrzojdg**
3. Go to **Settings** → **API**
4. Scroll down to **Project API keys**
5. Find the **`service_role`** key (⚠️ **NOT** the `anon` key!)
6. Click the **eye icon** to reveal it
7. **Copy the entire key** (it's a long JWT token)

### Step 2: Set Environment Variable in Vercel

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your project: **delas-alas-deployment**
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"** or find existing `SUPABASE_SERVICE_ROLE_KEY`
5. Set:
   - **Key**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: Paste your service_role key from Step 1
   - **Environment**: Select **Production**, **Preview**, and **Development** (or at least **Production**)
6. Click **"Save"**

### Step 3: Verify Other Environment Variables

Make sure you also have these set:

- ✅ `SUPABASE_URL` = `https://xlubjwiumytdkxrzojdg.supabase.co`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` = `your_service_role_key_here` (the long JWT token)
- ✅ `GMAIL_USER` = `your_actual_gmail@gmail.com`
- ✅ `GMAIL_APP_PASSWORD` = `your_16_char_app_password`

### Step 4: Redeploy

After setting the environment variable:

1. Go to **Vercel Dashboard** → **Deployments**
2. Click **"..."** (three dots) on the latest deployment
3. Click **"Redeploy"**
4. Or simply push a new commit to trigger redeploy

### Step 5: Test

1. Wait for redeploy to finish (usually 1-2 minutes)
2. Go to Settings → Change Password
3. Try changing password again
4. Should work now! ✅

## Important Notes

- ⚠️ **Service Role Key is SECRET** - Never expose it in frontend code
- ⚠️ **Service Role Key is DIFFERENT from Anon Key** - Make sure you're using the service_role key
- ✅ The service_role key allows admin operations (like password reset)
- ✅ The anon key is for client-side operations only

## Troubleshooting

If it still doesn't work after redeploy:

1. **Check Vercel Logs**:
   - Go to Vercel Dashboard → Your Project → Logs
   - Look for errors when you try to reset password
   
2. **Verify Key Format**:
   - Service role key should start with `eyJ...` (it's a JWT token)
   - Should be very long (200+ characters)

3. **Check Environment Selection**:
   - Make sure the variable is set for **Production** environment
   - If you're testing on a preview deployment, set it for **Preview** too

4. **Wait for Redeploy**:
   - Environment variables take effect after redeploy
   - Wait 1-2 minutes after setting variables


