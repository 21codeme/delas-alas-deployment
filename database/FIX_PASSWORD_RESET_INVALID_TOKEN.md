# Fix Password Reset Invalid Token Issue

## Problem
Ang password reset link ay laging nagpapakita ng "Invalid or expired reset link" kahit na valid ang token.

## Possible Causes

### 1. Supabase Redirect URL Not Configured
Ang pinakakaraniwang dahilan ay hindi nakaconfigure nang tama ang **Redirect URLs** sa Supabase dashboard.

**Solution:**
1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Sa **Redirect URLs** section, i-add ang:
   - `https://delas-alas-deployment.vercel.app/password-reset.html`
   - `https://delas-alas-deployment.vercel.app/**` (wildcard)
   - `http://localhost:5500/password-reset.html` (for local development)
   - `http://localhost:5500/**` (for local development)

3. Click **Save**

### 2. Site URL Not Configured
Ang **Site URL** ay dapat naka-set sa production URL.

**Solution:**
1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Sa **Site URL** field, i-set sa:
   - `https://delas-alas-deployment.vercel.app` (production)
   - O `http://localhost:5500` (local development)

3. Click **Save**

### 3. Token Expiration
Ang recovery token ay may expiration time (default: 1 hour). Kung matagal bago i-click ang link, maaaring mag-expire na ito.

**Solution:**
- I-click agad ang password reset link pagkatapos matanggap sa email
- O mag-request ng bagong password reset link

### 4. Token Already Used
Ang recovery token ay one-time use lang. Kung na-click na ito dati, hindi na ito magagamit ulit.

**Solution:**
- Mag-request ng bagong password reset link

## Debugging Steps

1. **Check Console Logs:**
   - Open browser console (F12)
   - Tingnan ang mga logs kapag nag-load ang `password-reset.html`
   - Look for:
     - `🔍 Full URL hash:` - dapat may `access_token`
     - `🔍 Extracted tokens:` - dapat may `hasAccessToken: true`
     - `❌ Session error details:` - makikita ang exact error

2. **Check URL Hash:**
   - Kapag nag-click ng password reset link, dapat ang URL ay:
     - `https://delas-alas-deployment.vercel.app/password-reset.html#access_token=...&type=recovery`
   - Kung walang `access_token` sa hash, problema sa redirect URL configuration

3. **Check Supabase Logs:**
   - Go to **Supabase Dashboard** → **Logs** → **Auth Logs**
   - Tingnan kung may error messages related sa password reset

## Current Implementation

Ang password reset flow ay:
1. User requests password reset → Supabase sends email
2. User clicks link → Redirects to `password-reset.html` with recovery token
3. Page validates token → Shows form if valid
4. User enters new password → Sets session with recovery token
5. Updates password → Signs out recovery session
6. Redirects to login

## Testing

1. Request password reset from settings page
2. Check email for reset link
3. Click link immediately
4. Check browser console for logs
5. Enter new password
6. Submit form
7. Check console for any errors

## Common Errors

- **"Invalid or expired reset link"** → Redirect URL not configured or token expired
- **"Token validation error"** → Token format incorrect or Supabase configuration issue
- **"Failed to validate reset link"** → Token already used or expired

