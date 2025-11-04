# Nodemailer + Gmail SMTP Setup Guide

## Step 1: Install Nodemailer

```bash
npm install nodemailer
```

## Step 2: Get Gmail App Password

### Option A: Use Gmail App Password (Recommended)

1. **Go to Google Account Settings:**
   - Visit: https://myaccount.google.com/
   - Click **"Security"** (left sidebar)

2. **Enable 2-Step Verification:**
   - If not enabled, click **"2-Step Verification"**
   - Follow the steps to enable it

3. **Create App Password:**
   - Go back to **"Security"**
   - Scroll down to **"App passwords"**
   - Click **"App passwords"**
   - Select app: **"Mail"**
   - Select device: **"Other (Custom name)"**
   - Enter name: `Delas Alas Dental Clinic`
   - Click **"Generate"**
   - **Copy the 16-character password** (you'll see it only once!)

### Option B: Use Gmail Password (Less Secure - Not Recommended)

⚠️ **Warning:** This is less secure and may not work if "Less secure app access" is disabled.

1. Go to: https://myaccount.google.com/lesssecureapps
2. Enable "Allow less secure apps"
3. Use your regular Gmail password

**Note:** Google recommends using App Passwords instead.

## Step 3: Set Environment Variables in Vercel

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your project: `delas-alas-deployment`

2. **Go to Settings:**
   - Click **"Settings"** tab
   - Click **"Environment Variables"** in left sidebar

3. **Add Environment Variables:**
   - **Key:** `GMAIL_USER`
   - **Value:** Your Gmail address (e.g., `your-email@gmail.com`)
   - **Environment:** Production, Preview, Development (select all)
   - Click **"Save"**

   - **Key:** `GMAIL_APP_PASSWORD`
   - **Value:** Your 16-character App Password (from Step 2)
   - **Environment:** Production, Preview, Development (select all)
   - Click **"Save"**

## Step 4: Deploy to Vercel

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Commit and push to GitHub:**
   ```bash
   git add .
   git commit -m "Add Nodemailer for OTP emails"
   git push origin main
   ```

3. **Vercel will automatically deploy:**
   - Vercel detects changes and deploys automatically
   - Wait for deployment to complete

## Step 5: Test the Email Function

1. **Try changing password in your app:**
   - Go to Settings → Security Settings
   - Click "Change Password"
   - Check your email inbox for OTP code

2. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Your Project → **"Functions"** tab
   - Click on `api/send-otp-email`
   - Check **"Logs"** for any errors

## Troubleshooting

### Email not sending?
- ✅ Check Gmail App Password is correct (16 characters)
- ✅ Check `GMAIL_USER` is set correctly (your Gmail address)
- ✅ Check `GMAIL_APP_PASSWORD` is set correctly
- ✅ Check Vercel logs for errors
- ✅ Make sure 2-Step Verification is enabled on Gmail

### "Invalid login" error?
- ✅ Make sure you're using App Password, not regular password
- ✅ Check App Password is correct (no spaces)
- ✅ Regenerate App Password if needed

### "Less secure app access" error?
- ✅ Enable 2-Step Verification
- ✅ Use App Password instead of regular password

### API endpoint not found (404)?
- ✅ Make sure `api/send-otp-email.js` is in the `api` folder
- ✅ Make sure Vercel is deployed
- ✅ Check Vercel deployment logs

### CORS errors?
- ✅ The API already handles CORS
- ✅ Check if API URL is correct

## Example Environment Variables

```env
GMAIL_USER=delasalasclinic@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

**Note:** Remove spaces from App Password when setting in Vercel (should be 16 characters without spaces).

## Security Notes

- ✅ Never commit `.env` file to GitHub
- ✅ Use Vercel Environment Variables for production
- ✅ App Passwords are more secure than regular passwords
- ✅ You can revoke App Passwords anytime in Google Account settings

## Alternative: Use Different Email Service

If Gmail doesn't work, you can use other services:

### Outlook/Hotmail:
```javascript
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: 'your-email@outlook.com',
    pass: 'your-password'
  }
});
```

### Custom SMTP:
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-domain.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@your-domain.com',
    pass: 'your-password'
  }
});
```

