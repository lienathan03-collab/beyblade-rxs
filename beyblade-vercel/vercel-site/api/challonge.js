const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function callChallonge(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'BeybladeRXS/1.0' } });
  const text = await res.text();
  if (!res.ok) {
    let detail = text;
    try {
      const parsed = JSON.parse(text);
      if (parsed.errors) detail = parsed.errors.join('; ');
      else if (parsed.error) detail = parsed.error;
    } catch (_) {}
    throw new Error(`Challonge ${res.status}: ${detail}`);
  }
  try {
    return JSON.parse(text);
  } catch (_) {
    throw new Error(`Challonge returned non-JSON: ${text.slice(0, 120)}`);
  }
}

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  res.setHeader('Content-Type', 'application/json');

  const API_KEY = process.env.CHALLONGE_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'CHALLONGE_API_KEY is not set in Vercel Environment Variables.' });
  }

  const { action, tournament_id } = req.query;
  const key = encodeURIComponent(API_KEY);

  try {
    if (action === 'list') {
      const data = await callChallonge(
        `https://api.challonge.com/v1/tournaments.json?api_key=${key}&state=all&per_page=50`
      );
      return res.status(200).json(data);
    }

    if (action === 'participants' && tournament_id) {
      const tid = encodeURIComponent(tournament_id);
      const data = await callChallonge(
        `https://api.challonge.com/v1/tournaments/${tid}/participants.json?api_key=${key}`
      );
      return res.status(200).json(data);
    }

    if (action === 'matches' && tournament_id) {
      const tid = encodeURIComponent(tournament_id);
      const data = await callChallonge(
        `https://api.challonge.com/v1/tournaments/${tid}/matches.json?api_key=${key}`
      );
      return res.status(200).json(data);
    }

    return res.status(400).json({ error: 'Invalid action. Use: list, participants, matches' });
  } catch (err) {
    return res.status(502).json({ error: err.message || String(err) });
  }
}
