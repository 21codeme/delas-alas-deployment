# Fix: Signup 429 / "email rate limit exceeded"

When signup fails with **429** or **"email rate limit exceeded"** (`over_email_send_rate_limit`), Supabase is limiting how many confirmation emails can be sent. New signups trigger an email, so the limit is hit quickly on free tier.

## Option 1: Disable "Confirm email" (signups work immediately, no email sent)

1. Open **Supabase Dashboard**: https://supabase.com/dashboard  
2. Select your project (**delas-alas** / xlubjwiumytdkxrzojdg).  
3. Go to **Authentication** → **Providers** → **Email**.  
4. Turn **OFF** the option **"Confirm email"** (or "Enable email confirmations").  
5. Save.

After this, new users can sign up and log in right away without verifying email. You can turn "Confirm email" back on later if you want verification again.

## Option 2: Use custom SMTP (keep email confirmation, higher limits)

Nasa **Authentication → Notifications → Email** ka na. Punuin lahat ng required fields:

### 1. Sender details (required)
- **Sender email address:** Email na lalabas sa "From" (dapat verified sa provider). Kung Resend: `onboarding@resend.dev` para testing, o `noreply@yourdomain.com` kung may domain.
- **Sender name:** Hal. `Delas Alas Clinic`.

### 2. SMTP (Resend)
- **Host:** `smtp.resend.com` (huwag `https://resend.com` — SMTP host lang, hindi website URL).
- **Port:** `465` (tama na).
- **Username:** Karaniwan `resend` (tingnan sa Resend SMTP docs).
- **Password:** Resend API key (Resend.com → API Keys → Create → copy).
- **Minimum interval per user:** `60` = 1 email per user bawat 60 seconds. Pwede ibaba (e.g. `30`) kung gusto mas maluwag.

### 3. Saan kukunin ang Resend credentials
1. Pumasok sa https://resend.com (sign up kung wala).
2. **API Keys** → Create API Key → copy. Yan ang gagamitin bilang SMTP Password.
3. Sa Resend docs/SMTP section: Host = `smtp.resend.com`, Port = 465, Username = `resend`.

Pag lahat naka-fill at wala nang red error, i-**Save** sa Supabase. Ang confirmation emails ay dadaan na sa Resend at mas malaki na ang limit.

## Option 3: Wait and retry

Supabase's limit resets after some time (often 1–24 hours). The user can try again later or use a different email.
