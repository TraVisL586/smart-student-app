export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = process.env.OPENAI_API_KEY || '';
  const MODEL = process.env.OPENAI_MODEL || 'gpt-5';

  if (!API_KEY) {
    return res.status(503).json({ error: 'OPENAI_API_KEY chưa được cấu hình trên server.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'JSON không hợp lệ.' });
    }
  }

  const message = String(body?.message || '').trim();
  const course = String(body?.course || 'Chung').trim();

  if (!message) {
    return res.status(400).json({ error: 'Thiếu câu hỏi.' });
  }
  if (message.length > 6000) {
    return res.status(400).json({ error: 'Câu hỏi quá dài.' });
  }

  const instructions = `Bạn là Smart AI, trợ lý học tập của Smart Student dành cho sinh viên đại học Việt Nam.\nMôn học hiện tại: ${course}.\nTrả lời bằng tiếng Việt, rõ ràng, thân thiện, ưu tiên giải thích từng bước và ví dụ. Nếu là bài tập, hãy giải thích cách làm thay vì chỉ nêu đáp án. Không bịa nguồn hoặc dữ kiện. Nếu không đủ thông tin, nói rõ cần thêm dữ kiện.`;

  try {
    const r = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        instructions,
        input: message,
        max_output_tokens: 900,
        store: false
      })
    });

    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: data?.error?.message || 'OpenAI API request failed' });
    }
    return res.status(200).json({ answer: data.output_text || 'AI không trả về nội dung.' });
  } catch (err) {
    return res.status(502).json({ error: `Không kết nối được AI: ${err.message}` });
  }
}
