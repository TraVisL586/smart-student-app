export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const API_KEY = process.env.OPENAI_API_KEY || '';
  const MODEL = process.env.OPENAI_MODEL || 'gpt-5';
  return res.status(200).json({
    ok: true,
    aiConfigured: Boolean(API_KEY),
    model: MODEL
  });
}
