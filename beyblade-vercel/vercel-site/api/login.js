const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  // Credentials stored safely as Vercel Environment Variables
  // Set ADMIN_USERNAME and ADMIN_PASSWORD in your Vercel project settings
  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

  // Also support a second admin account via ADMIN2_USERNAME / ADMIN2_PASSWORD
  const valid2Username = process.env.ADMIN2_USERNAME;
  const valid2Password = process.env.ADMIN2_PASSWORD;

  const isValid =
    (username === validUsername && password === validPassword) ||
    (valid2Username && username === valid2Username && password === valid2Password);

  if (isValid) {
    return res.status(200).json({ success: true, user: username });
  } else {
    return res.status(401).json({ error: 'Incorrect username or password.' });
  }
}
