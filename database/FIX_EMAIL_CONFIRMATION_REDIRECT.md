# Fix Email Confirmation Redirect URL

## Problem
Kapag nag-click ang user ng email confirmation link, nag-redirect sa `localhost:3000` pero hindi accessible, kaya may error na "This site can't be reached".

## Solution

### Option 1: I-configure ang Redirect URL sa Supabase (RECOMMENDED)

1. **Open Supabase Dashboard:**
   - Go to https://app.supabase.com
   - Select your project: `xlubjwiumytdkxrzojdg`

2. **Go to Authentication Settings:**
   - Click **Authentication** sa left sidebar
   - Click **URL Configuration** tab

3. **Update Site URL:**
   - **Site URL**: I-set sa production URL mo (e.g., `https://your-app.vercel.app`)
   - O kung local development, i-set sa `http://localhost:5500` o kung ano ang port ng local server mo

4. **Update Redirect URLs:**
   - Sa **Redirect URLs** section, i-add ang mga allowed URLs:
     - `https://your-app.vercel.app/**`
     - `http://localhost:5500/**` (for local development)
     - `http://127.0.0.1:5500/**` (for local development)

5. **Save Changes:**
   - Click **Save** button

### Option 2: I-handle ang Redirect sa Code (ALREADY IMPLEMENTED)

✅ Na-implement na ang `handleEmailConfirmation()` function sa `script.js`
- Automatically na-detect ang `access_token` sa URL hash
- Ma-process ang email confirmation
- Ma-clear ang hash mula sa URL
- Ma-show ang success message

### Option 3: I-update ang Email Template (Optional)

Kung gusto mong i-customize ang email confirmation link, pwedeng:

1. **Go to Authentication → Email Templates:**
   - Click **Confirm signup** template
   - I-update ang redirect URL sa template

## Testing

1. **Register a new account**
2. **Check email** para sa confirmation link
3. **Click the confirmation link**
4. **Dapat ma-redirect** sa main page (index.html)
5. **Dapat ma-show** ang success message: "Email verified successfully! You can now login."

## Current Status

✅ Code na-handle ang email confirmation redirect
⚠️ Kailangan i-configure ang Supabase redirect URLs para sa production
⚠️ Kailangan i-set ang correct Site URL sa Supabase

## Notes

- Ang `handleEmailConfirmation()` function ay automatically na-tumatawag sa page load
- Ma-process ang `access_token` mula sa URL hash
- Ma-clear ang hash mula sa URL para hindi ma-show sa browser
- Ma-show ang appropriate success/error messages

