import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const API_KEY = process.env.OPENAI_API_KEY || '';
const MODEL = process.env.OPENAI_MODEL || 'gpt-5';
const mime = {
  '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8',
  '.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.ico':'image/x-icon','.webmanifest':'application/manifest+json','.js':'text/javascript; charset=utf-8'
};
function send(res,status,body,type='application/json; charset=utf-8'){res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store'});res.end(body)}
function json(res,status,obj){send(res,status,JSON.stringify(obj))}
async function readJson(req){let data='';for await(const chunk of req)data+=chunk;if(data.length>100_000)throw new Error('Request too large');return JSON.parse(data||'{}')}
async function chat(req,res){
  if(!API_KEY)return json(res,503,{error:'OPENAI_API_KEY chưa được cấu hình trên server.'});
  let body;try{body=await readJson(req)}catch{return json(res,400,{error:'JSON không hợp lệ.'})}
  const message=String(body.message||'').trim(),course=String(body.course||'Chung').trim();
  if(!message)return json(res,400,{error:'Thiếu câu hỏi.'});
  if(message.length>6000)return json(res,400,{error:'Câu hỏi quá dài.'});
  const instructions=`Bạn là Smart AI, trợ lý học tập của Smart Student dành cho sinh viên đại học Việt Nam.\nMôn học hiện tại: ${course}.\nTrả lời bằng tiếng Việt, rõ ràng, thân thiện, ưu tiên giải thích từng bước và ví dụ. Nếu là bài tập, hãy giải thích cách làm thay vì chỉ nêu đáp án. Không bịa nguồn hoặc dữ kiện. Nếu không đủ thông tin, nói rõ cần thêm dữ kiện.`;
  try{
    const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${API_KEY}`},body:JSON.stringify({model:MODEL,instructions,input:message,max_output_tokens:900,store:false})});
    const data=await r.json();if(!r.ok)return json(res,r.status,{error:data?.error?.message||'OpenAI API request failed'});
    return json(res,200,{answer:data.output_text||'AI không trả về nội dung.'});
  }catch(err){return json(res,502,{error:`Không kết nối được AI: ${err.message}`})}
}
function serveStatic(req,res){
  let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname==='/'||pathname==='')pathname='/index.html';
  const target=path.resolve(__dirname,'.'+pathname);if(!target.startsWith(path.resolve(__dirname)))return send(res,403,'Forbidden','text/plain; charset=utf-8');
  fs.stat(target,(err,st)=>{if(err||!st.isFile())return send(res,404,'Not found','text/plain; charset=utf-8');const ext=path.extname(target).toLowerCase();res.writeHead(200,{'Content-Type':mime[ext]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(target).pipe(res)})
}
const server=http.createServer(async(req,res)=>{
  if(req.method==='GET'&&req.url.startsWith('/api/health'))return json(res,200,{ok:true,aiConfigured:Boolean(API_KEY),model:MODEL});
  if(req.method==='POST'&&req.url==='/api/chat')return chat(req,res);
  if(req.method==='GET'||req.method==='HEAD')return serveStatic(req,res);
  return json(res,405,{error:'Method not allowed'});
});
server.listen(PORT,()=>console.log(`Smart Student running at http://localhost:${PORT}`));
