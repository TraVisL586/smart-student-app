import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Auto load .env if present
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  try {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[k]) process.env[k] = v;
      }
    }
  } catch {}
}

const PORT = Number(process.env.PORT || 3000);

const mime = {
  '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8',
  '.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.ico':'image/x-icon','.webmanifest':'application/manifest+json'
};

function send(res,status,body,type='application/json; charset=utf-8'){res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store'});res.end(body)}
function json(res,status,obj){send(res,status,JSON.stringify(obj))}
async function readJson(req){let data='';for await(const chunk of req)data+=chunk;if(data.length>100_000)throw new Error('Request too large');return JSON.parse(data||'{}')}

async function chat(req,res){
  const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

  if (!GROQ_API_KEY && !OPENAI_API_KEY) {
    return json(res, 503, { error: 'Chưa cấu hình GROQ_API_KEY hoặc OPENAI_API_KEY trên server.' });
  }

  let body;
  try { body = await readJson(req); } catch { return json(res, 400, { error: 'JSON không hợp lệ.' }); }
  const message = String(body.message || '').trim();
  const course = String(body.course || 'Chung').trim();
  if (!message) return json(res, 400, { error: 'Thiếu câu hỏi.' });
  if (message.length > 6000) return json(res, 400, { error: 'Câu hỏi quá dài.' });

  const instructions = `Bạn là Smart AI, trợ lý học tập của Smart Student dành cho sinh viên đại học Việt Nam.\nMôn học hiện tại: ${course}.\nTrả lời bằng tiếng Việt, rõ ràng, thân thiện, ưu tiên giải thích từng bước và ví dụ. Nếu là bài tập, hãy giải thích cách làm thay vì chỉ nêu đáp án. Không bịa nguồn hoặc dữ kiện. Nếu không đủ thông tin, nói rõ cần thêm dữ kiện.`;

  // 1. Ưu tiên Groq (tự động thử các model đang hoạt động trên Groq)
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
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
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
          return json(res, 200, { answer: data.choices[0].message.content });
        }
        lastError = data?.error?.message || `Lỗi model ${model}`;
      } catch (err) {
        lastError = err.message;
      }
    }
    return json(res, 502, { error: `Groq AI error: ${lastError}` });
  }

  // 2. OpenAI fallback
  const openaiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  try {
    const r = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: openaiModel,
        instructions,
        input: message,
        max_output_tokens: 900,
        store: false
      })
    });
    const data = await r.json();
    if (!r.ok) return json(res, r.status, { error: data?.error?.message || 'OpenAI API request failed' });
    return json(res, 200, { answer: data.output_text || 'AI không trả về nội dung.' });
  } catch (err) {
    return json(res, 502, { error: `Không kết nối được OpenAI: ${err.message}` });
  }
}

function serveStatic(req,res){
  let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname==='/'||pathname==='')pathname='/index.html';
  if(pathname==='/favicon.ico')pathname='/assets/smart-student-icon.png';
  const target=path.resolve(__dirname,'.'+pathname);
  if(!target.startsWith(path.resolve(__dirname)))return send(res,403,'Forbidden','text/plain; charset=utf-8');
  fs.stat(target,(err,st)=>{
    if(err||!st.isFile())return send(res,404,`Not found: ${err ? err.message : 'not file'} | target: ${target} | __dirname: ${__dirname}`,'text/plain; charset=utf-8');
    const ext=path.extname(target).toLowerCase();
    res.writeHead(200,{'Content-Type':mime[ext]||'application/octet-stream','Cache-Control':'no-cache'});
    fs.createReadStream(target).pipe(res);
  });
}

const server=http.createServer(async(req,res)=>{
  if(req.method==='GET'&&req.url.startsWith('/api/models')){
    const groqKey = process.env.GROQ_API_KEY || '';
    if(!groqKey) return json(res, 503, {error: 'No GROQ_API_KEY'});
    try {
      const r = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${groqKey}` }
      });
      const d = await r.json();
      return json(res, r.status, d);
    } catch (err) {
      return json(res, 500, {error: err.message});
    }
  }
  if(req.method==='GET'&&req.url.startsWith('/api/health')){
    const groqKey = process.env.GROQ_API_KEY || '';
    const openaiKey = process.env.OPENAI_API_KEY || '';
    const provider = groqKey ? 'groq' : (openaiKey ? 'openai' : 'none');
    const model = groqKey ? (process.env.GROQ_MODEL || 'openai/gpt-oss-120b') : (process.env.OPENAI_MODEL || 'gpt-4o-mini');
    return json(res,200,{ok:true,aiConfigured:Boolean(groqKey||openaiKey),provider,model});
  }
  if(req.method==='POST'&&req.url==='/api/chat')return chat(req,res);
  if(req.method==='GET'||req.method==='HEAD')return serveStatic(req,res);
  return json(res,405,{error:'Method not allowed'});
});

server.listen(PORT,()=>console.log(`Smart Student running at http://localhost:${PORT}`));
