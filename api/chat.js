export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

  if (!GROQ_API_KEY && !OPENAI_API_KEY) {
    return res.status(503).json({ error: 'Chưa cấu hình GROQ_API_KEY hoặc OPENAI_API_KEY.' });
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

  // 1. Ưu tiên sử dụng Groq API nếu có GROQ_API_KEY (tự động thử các model khả dụng trên Groq)
  if (GROQ_API_KEY) {
    const candidateModels = [
      process.env.GROQ_MODEL,
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'qwen/qwen3.8-27b'
    ].filter(Boolean);

    let lastError = '';
    for (const model of candidateModels) {
      try {
        const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: instructions },
              { role: 'user', content: message }
            ],
            max_tokens: 1024,
            temperature: 0.6
          })
        });

        const data = await r.json();
        if (r.ok && data?.choices?.[0]?.message?.content) {
          return res.status(200).json({ answer: data.choices[0].message.content });
        }
        lastError = data?.error?.message || `Lỗi model ${model}`;
      } catch (err) {
        lastError = err.message;
      }
    }
    return res.status(502).json({ error: `Groq AI error: ${lastError}` });
  }

  // 2. Sử dụng OpenAI API nếu có OPENAI_API_KEY
  const openaiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  try {
    const r = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: openaiModel,
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
    return res.status(502).json({ error: `Không kết nối được OpenAI: ${err.message}` });
  }
}
