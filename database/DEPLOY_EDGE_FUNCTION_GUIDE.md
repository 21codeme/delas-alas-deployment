# Deploy Supabase Edge Function - Step by Step Guide

## Option A: Using Supabase CLI (Recommended for Power Users)

### Step 1: Install Supabase CLI on Windows

**Option 1: Using Scoop (Recommended)**
```powershell
# Install Scoop if you don't have it
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Install Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Option 2: Using Chocolatey**
```powershell
choco install supabase
```

**Option 3: Direct Download**
- Download from: https://github.com/supabase/cli/releases
- Extract and add to PATH

### Step 2: Login to Supabase
```bash
supabase login
```
This will open your browser to authenticate.

### Step 3: Link Your Project
```bash
supabase link --project-ref xlubjwiumytdkxrzojdg
```

### Step 4: Create Edge Function
```bash
supabase functions new send-otp-email
```

### Step 5: Copy Function Code
Copy the contents of `supabase/functions/send-otp-email/index.ts` to the created function file.

### Step 6: Deploy Function
```bash
supabase functions deploy send-otp-email
```

### Step 7: Set Environment Variables
```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
supabase secrets set FROM_EMAIL=noreply@delasalas.com
```

---

## Option B: Using Supabase Dashboard (Easier, No CLI Needed)

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project: `xlubjwiumytdkxrzojdg`

### Step 2: Navigate to Edge Functions
1. Click **"Edge Functions"** in the left sidebar
2. Click **"Create a new function"** or **"New Function"**

### Step 3: Create Function
1. **Function name:** `send-otp-email`
2. **Template:** Choose "Blank" or "Hello World"
3. Click **"Create function"**

### Step 4: Copy Function Code
1. Open `supabase/functions/send-otp-email/index.ts` in your editor
2. Copy ALL the code
3. Paste it into the Edge Function editor in Supabase Dashboard
4. Click **"Deploy"** or **"Save"**

### Step 5: Set Environment Variables
1. In Edge Functions page, click **"Settings"** or **"Function Settings"**
2. Go to **"Environment Variables"** or **"Secrets"**
3. Add the following:
   - **Key:** `RESEND_API_KEY`
   - **Value:** Your Resend API key (get from https://resend.com/)
   - **Key:** `FROM_EMAIL`
   - **Value:** `noreply@delasalas.com` (or your verified email domain)

### Step 6: Test the Function
1. Click on `send-otp-email` function
2. Go to **"Invoke"** tab
3. Test with:
```json
{
  "email": "your-email@example.com",
  "otp": "123456",
  "name": "Test User"
}
```

---

## Step 3: Set Up Resend (Email Service)

### Step 1: Sign Up for Resend
1. Go to https://resend.com/
2. Sign up for a free account (100 emails/day free)
3. Verify your email

### Step 2: Get API Key
1. Go to **API Keys** in Resend dashboard
2. Click **"Create API Key"**
3. Name it: `Supabase Edge Function`
4. Copy the API key (starts with `re_`)

### Step 3: Verify Domain (Optional but Recommended)
1. Go to **Domains** in Resend dashboard
2. Add your domain (e.g., `delasalas.com`)
3. Add the DNS records provided
4. Wait for verification

**Note:** For testing, you can use Resend's default domain or your personal email.

---

## Verification Steps

### 1. Check Function is Deployed
- Go to Supabase Dashboard → Edge Functions
- You should see `send-otp-email` in the list

### 2. Test from Frontend
1. Try changing password in your app
2. Check browser console for logs
3. Check email inbox for OTP code

### 3. Check Function Logs
- Go to Supabase Dashboard → Edge Functions → `send-otp-email` → **Logs**
- Look for any errors or successful invocations

---

## Troubleshooting

### Function not found (404)
- Make sure function name is exactly `send-otp-email`
- Check function is deployed (green status)

### Email not sending
- Check Resend API key is correct
- Check `FROM_EMAIL` is set correctly
- Check Resend dashboard for email logs

### Environment variables not working
- Make sure secrets are set correctly
- Restart function after setting secrets
- Check variable names match exactly (case-sensitive)

### CORS errors
- Edge Function already handles CORS
- Check function code has CORS headers

---

## Quick Test Command (if using CLI)

```bash
# Test function locally (if using CLI)
supabase functions serve send-otp-email

# In another terminal, test with curl:
curl -X POST http://localhost:54321/functions/v1/send-otp-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"email":"test@example.com","otp":"123456","name":"Test"}'
```

---

## Next Steps After Deployment

1. ✅ Edge Function deployed
2. ✅ Environment variables set
3. ✅ Resend API key configured
4. ✅ Test password change in app
5. ✅ Check email inbox for OTP

**Note:** If Edge Function is not deployed, the app will still work but OTP will only be shown in console (for testing).

