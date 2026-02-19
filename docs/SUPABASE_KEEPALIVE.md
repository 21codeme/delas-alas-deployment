# Supabase Keep-Alive (Para Hindi Ma-Pause)

Ang Supabase free tier ay **nagpa-pause ng project pagkatapos ng 7 araw na walang activity**. Para hindi mangyari iyon kahit hindi nao-open ang site, may dalawang naka-setup:

---

## 1. GitHub Actions (recommended)

- **File:** `.github/workflows/supabase-keepalive.yml`
- **Schedule:** Tuwing 5 araw (bago mag-7 days inactivity)
- **Kailangan:** I-set ang **Repository Secrets** sa GitHub (Settings → Secrets and variables → Actions → New repository secret):

| Secret name           | Value (ilagay exactly) |
|-----------------------|------------------------|
| `SUPABASE_URL`        | `https://xlubjwiumytdkxrzojdg.supabase.co` |
| `SUPABASE_ANON_KEY`   | Yung **anon public** key mula sa [Supabase Dashboard](https://supabase.com/dashboard) → i-select ang project → **Settings** → **API** → **Project API keys** → **anon public** (copy) |

**Paano maglagay:** Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret** → Name = `SUPABASE_URL` o `SUPABASE_ANON_KEY`, Value = yung value sa table above.

Pwede mo ring i-run manually: **Actions** tab → **Supabase Keep-Alive** → **Run workflow**.

---

## 2. Vercel Cron (kapag naka-deploy sa Vercel)

- **API:** `GET /api/keepalive` (tinawag ng Vercel Cron araw-araw)
- **Kailangan:** I-set ang **Environment Variables** sa Vercel project:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`

**Paano:** Vercel project → **Settings** → **Environment Variables**.

Ang cron ay naka-configure sa `vercel.json` (`schedule: "0 0 * * *"` = isang beses bawat araw, 00:00 UTC).

---

Kung naka-setup ang **pareho**, mas sigurado na may activity palagi. Kung isa lang, sapat na para hindi ma-pause ang Supabase.
