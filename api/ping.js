export default async function handler(req, res) {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY

  if (!url || !key) {
    return res.status(500).json({ ok: false, error: 'Missing env vars' })
  }

  try {
    const response = await fetch(`${url}/rest/v1/players?select=id&limit=1`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    })
    return res.status(200).json({ ok: true, supabaseStatus: response.status })
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message })
  }
}
