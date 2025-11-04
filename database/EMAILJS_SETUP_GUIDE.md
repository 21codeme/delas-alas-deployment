# EmailJS Setup Guide for OTP Email Sending

## Overview
This guide will help you set up EmailJS to send OTP codes via email for password change functionality.

## Step 1: Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account (200 emails/month free)
3. Verify your email address

## Step 2: Create Email Service

1. In EmailJS Dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider:
   - **Gmail** (recommended for easy setup)
   - **Outlook**
   - **Yahoo**
   - Or any SMTP service
4. Follow the setup instructions for your chosen provider
5. Note your **Service ID** (e.g., `service_xxxxx`)

## Step 3: Create Email Template

1. In EmailJS Dashboard, go to **Email Templates**
2. Click **Create New Template**
3. Use this template:

**Template Name:** Password Change OTP

**Subject:** Password Change Confirmation Code

**Content:**
```
Hello {{to_name}},

You have requested to change your password. Please use the following confirmation code:

{{otp_code}}

This code will expire in 10 minutes.

If you did not request this password change, please ignore this email.

Thank you,
Delas Alas Dental Clinic
```

4. Note your **Template ID** (e.g., `template_xxxxx`)

## Step 4: Get Your Public Key

1. In EmailJS Dashboard, go to **Account** → **General**
2. Find your **Public Key** (e.g., `xxxxxxxxxxxxxxxx`)

## Step 5: Update Code with Your Credentials

Update the following files with your EmailJS credentials:

### Patient Settings:
**File:** `components/patient/sections/settings/settings-standalone.html`

**Line ~1502-1504:**
```javascript
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID'; // Replace with your service ID
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // Replace with your template ID
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Replace with your public key
```

### Dentist Settings:
**File:** `components/dentist/sections/settings/settings-standalone.html`

**Line ~1502-1504:**
```javascript
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID'; // Replace with your service ID
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // Replace with your template ID
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Replace with your public key
```

## Step 6: Test Email Sending

1. Try changing your password
2. Check your email inbox for the OTP code
3. If email doesn't arrive, check spam folder
4. Check EmailJS dashboard for email logs

## Alternative: Using Supabase Edge Functions

If you prefer not to use EmailJS, you can create a Supabase Edge Function to send emails:

1. Create a Supabase Edge Function
2. Use a service like SendGrid, Resend, or Nodemailer
3. Call the Edge Function from your frontend code

## Troubleshooting

- **Email not sending:** Check EmailJS dashboard for error logs
- **Invalid credentials:** Verify your Service ID, Template ID, and Public Key
- **Rate limit:** Free tier is limited to 200 emails/month
- **Email in spam:** Configure SPF/DKIM records for your email domain

## Security Notes

- Never expose your EmailJS Private Key in frontend code
- Only use Public Key in frontend
- Consider using environment variables for production
- Monitor email usage to prevent abuse

