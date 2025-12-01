# How to Enable Email Confirmation in Supabase

## Problem
Kapag nag-register ang user, hindi sila nakakatanggap ng confirmation email.

## Solution: Enable Email Confirmation sa Supabase Dashboard

### Step 1: Go to Supabase Dashboard
1. Open https://app.supabase.com
2. Login sa account mo
3. Select project: **xlubjwiumytdkxrzojdg**

### Step 2: Enable Email Confirmation
1. Click **Authentication** sa left sidebar
2. Click **Settings** tab
3. Scroll down sa **"Email Auth"** section
4. **I-ON ang "Enable email confirmations"** toggle
   - Dapat naka-ON ito para mag-send ng confirmation emails
5. Click **Save** button

### Step 3: Configure URL Settings
1. Sa same **Authentication → Settings** page
2. Scroll down sa **"URL Configuration"** section
3. **Site URL**: I-set sa:
   - Production: `https://delas-alas-deployment.vercel.app`
   - O kung local: `http://localhost:5500`
4. **Redirect URLs**: I-add ang:
   - `https://delas-alas-deployment.vercel.app/**`
   - `http://localhost:5500/**` (para sa local development)
   - `http://127.0.0.1:5500/**` (para sa local development)
5. Click **Save** button

### Step 4: Customize Email Template (Optional pero Recommended)
1. Click **Authentication** → **Email Templates** sa left sidebar
2. Click **"Confirm signup"** template
3. I-customize ang email template para mag-match sa branding mo
4. I-check na may **{{ .ConfirmationURL }}** sa template para sa confirmation link
5. Click **Save** button

### Step 5: Test Email Sending
1. **Register a new account** sa website
2. **Check email inbox** (kasama ang spam folder)
3. **Dapat may confirmation email** na darating
4. **Click the confirmation link** sa email
5. **Dapat ma-redirect** sa website at ma-verify ang email

## Important Notes

⚠️ **Kung hindi pa rin nagse-send ng email:**
- I-check ang **Spam/Junk folder** - minsan napupunta doon ang emails
- I-verify na naka-ON ang "Enable email confirmations" sa Supabase
- I-check ang Supabase logs: **Logs** → **Auth Logs** para makita kung may errors
- I-verify na tama ang email address na ginagamit sa registration

⚠️ **Supabase Free Tier:**
- May limit ang email sending sa free tier
- I-check kung na-reach na ang limit: **Settings** → **Billing**

⚠️ **Email Provider:**
- By default, Supabase uses their own email service
- Para sa production, recommended na mag-setup ng custom SMTP (Gmail, SendGrid, etc.)
- Go to **Authentication** → **Settings** → **SMTP Settings** para mag-configure

## Current Code Status

✅ **Code is ready:**
- `emailRedirectTo` is already set sa signup
- `handleEmailConfirmation()` function is implemented
- Email verification modal is ready

⚠️ **Kailangan i-configure sa Supabase Dashboard:**
- Enable email confirmations
- Set correct Site URL and Redirect URLs
- Customize email template (optional)

## Testing Checklist

- [ ] Email confirmations enabled sa Supabase
- [ ] Site URL configured correctly
- [ ] Redirect URLs added
- [ ] Test registration - dapat may email
- [ ] Test email link - dapat ma-redirect at ma-verify
- [ ] Check spam folder kung wala sa inbox

