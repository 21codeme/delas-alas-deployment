# EmailJS Quick Setup Guide (Step-by-Step)

## Step 1: Create EmailJS Account

1. Go to **https://www.emailjs.com/**
2. Click **"Sign Up"** or **"Get Started"**
3. Sign up with your email (free account - 200 emails/month)
4. Verify your email address

## Step 2: Create Email Service

1. After logging in, go to **Email Services** (left sidebar)
2. Click **"Add New Service"**
3. Choose your email provider:
   - **Gmail** (recommended - easiest)
   - **Outlook**
   - **Yahoo**
   - Or any SMTP service

### If using Gmail:
1. Click **"Gmail"**
2. Click **"Connect Account"**
3. Sign in with your Gmail account
4. Allow EmailJS to access your email
5. Click **"Create Service"**
6. You'll see your **Service ID** (e.g., `service_xxxxx` or `service_gmail`)

**IMPORTANT:** Copy this Service ID - you'll need it!

## Step 3: Create Email Template

1. Go to **Email Templates** (left sidebar)
2. Click **"Create New Template"**
3. Fill in the details:

**Template Name:** `Password Change OTP`

**Subject:** `Password Change Confirmation Code`

**Content (HTML):**
```html
Hello {{to_name}},

You have requested to change your password. Please use the following confirmation code:

<h2 style="color: #667eea; font-size: 24px; text-align: center; padding: 20px; background: #f0f0f0; border-radius: 8px; margin: 20px 0;">{{otp_code}}</h2>

This code will expire in 10 minutes.

If you did not request this password change, please ignore this email.

Thank you,
Delas Alas Dental Clinic
```

4. Click **"Save"**
5. You'll see your **Template ID** (e.g., `template_xxxxx`)

**IMPORTANT:** Copy this Template ID - you'll need it!

## Step 4: Get Public Key

1. Go to **Account** → **General** (top right, click your profile)
2. Find **"Public Key"** section
3. Copy your **Public Key** (e.g., `xxxxxxxxxxxxxxxx`)

**IMPORTANT:** Copy this Public Key - you'll need it!

## Step 5: Update Code with Your Credentials

### For Patient Settings:
**File:** `components/patient/sections/settings/settings-standalone.html`

**Find line ~1502-1504** and replace:
```javascript
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID'; // Replace with your Service ID from Step 2
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // Replace with your Template ID from Step 3
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Replace with your Public Key from Step 4
```

**Example:**
```javascript
const EMAILJS_SERVICE_ID = 'service_gmail'; // Your actual Service ID
const EMAILJS_TEMPLATE_ID = 'template_abc123'; // Your actual Template ID
const EMAILJS_PUBLIC_KEY = 'abcdefghijklmnop'; // Your actual Public Key
```

### For Dentist Settings:
**File:** `components/dentist/sections/settings/settings-standalone.html`

**Find line ~1671-1673** and replace with the SAME credentials.

### For Resend OTP:
**Patient Settings:** Line ~1643-1645
**Dentist Settings:** Line ~1880-1882

Replace with the SAME credentials.

## Step 6: Test It!

1. Save all files
2. Try changing your password
3. Check your email inbox for the OTP code
4. If email doesn't arrive, check spam folder

## Troubleshooting

### "YOUR_SERVICE_ID" not replaced?
- Make sure you copied the Service ID from EmailJS dashboard
- It should look like: `service_xxxxx` or `service_gmail`

### "YOUR_TEMPLATE_ID" not replaced?
- Make sure you copied the Template ID from EmailJS dashboard
- It should look like: `template_xxxxx`

### "YOUR_PUBLIC_KEY" not replaced?
- Make sure you copied the Public Key from EmailJS Account → General
- It should look like: `abcdefghijklmnop` (long string)

### Email not sending?
- Check EmailJS dashboard → Logs for error messages
- Verify your email service is connected
- Check if you've exceeded the free tier limit (200 emails/month)

### Still not working?
- Make sure EmailJS library is loaded (check browser console)
- Verify all three credentials are correct
- Check EmailJS dashboard for email logs

## Example Values Format

Your actual values will look like:
- **Service ID:** `service_gmail` or `service_abc123`
- **Template ID:** `template_xyz789` or `template_password_otp`
- **Public Key:** `abcdefghijklmnopqrstuvwxyz123456` (long string)

**Note:** Your actual values will be different - get them from YOUR EmailJS dashboard!

