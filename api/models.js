export default async function handler(req, res) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
  if (!GROQ_API_KEY) {
    return res.status(503).json({ error: 'No GROQ_API_KEY' });
  }
  try {
    const r = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${GROQ_API_KEY}` }
    });
    const d = await r.json();
    return res.status(r.status).json(d);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
