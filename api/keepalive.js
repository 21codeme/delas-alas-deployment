/**
 * Keep-alive para sa Supabase: tumawag dito nang periodic (e.g. Vercel Cron)
 * para hindi ma-pause ang project dahil sa inactivity (7 days).
 *
 * Gamitin ang SUPABASE_URL at SUPABASE_ANON_KEY sa Vercel Environment Variables.
 */
module.exports = async (req, res) => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    res.status(500).json({
      ok: false,
      error: 'Set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel env.',
    });
    return;
  }

  try {
    const r = await fetch(
      `${url}/rest/v1/clinic_settings?id=eq.clinic&select=id&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const status = r.status;
    if (status === 200 || status === 206) {
      res.status(200).json({ ok: true, message: 'Supabase keep-alive OK' });
    } else {
      res.status(200).json({ ok: false, status, message: 'Unexpected response' });
    }
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message) });
  }
};
