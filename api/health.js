export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const groqKey = process.env.GROQ_API_KEY || '';
  const openaiKey = process.env.OPENAI_API_KEY || '';
  const provider = groqKey ? 'groq' : (openaiKey ? 'openai' : 'none');
  const model = groqKey
    ? (process.env.GROQ_MODEL || 'llama-3.3-70b-versatile')
    : (process.env.OPENAI_MODEL || 'gpt-4o-mini');

  return res.status(200).json({
    ok: true,
    aiConfigured: Boolean(groqKey || openaiKey),
    provider,
    model
  });
}
