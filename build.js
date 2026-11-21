'use strict';
/*
 * src/ → dist/ 로 복사하면서 index.html의 {{KEY}} 자리에 환경변수 값을 넣어요.
 *   node build.js           → dist/ 만들기 (GitHub Actions가 사용)
 *   node build.js --serve   → dist/ 만든 뒤 http://localhost:3000 에서 미리보기
 * 로컬에서는 .env 파일 값을 읽어요. (.env는 저장소에 올라가지 않아요)
 */
const fs = require('fs');
const path = require('path');
const http = require('http');

const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}
const KEYS = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'KAKAO_JS_KEY'];
const val = k => (process.env[k] || '').trim();
const missing = KEYS.filter(k => !val(k));
if (missing.includes('SUPABASE_URL') || missing.includes('SUPABASE_ANON_KEY')) {
  console.error(`[바꿀래] ${missing.filter(k => k !== 'KAKAO_JS_KEY').join(', ')} 값이 없어요. GitHub Secrets(또는 로컬 .env)를 확인해 주세요.`);
  process.exit(1);
}
if (!val('KAKAO_JS_KEY')) console.warn('[바꿀래] KAKAO_JS_KEY가 없어요. 지도는 간이 지도로 표시돼요.');
if (!/^[A-Za-z0-9]+$/.test(val('KAKAO_JS_KEY') || 'x')) { console.error('[바꿀래] KAKAO_JS_KEY 형식이 이상해요. 카카오 JavaScript 키를 그대로 넣어 주세요.'); process.exit(1); }
if (!/^https:\/\/[^"'<>\s]+$/.test(val('SUPABASE_URL')) || /["'<>\s]/.test(val('SUPABASE_ANON_KEY'))) { console.error('[바꿀래] SUPABASE_URL 또는 SUPABASE_ANON_KEY 형식이 이상해요.'); process.exit(1); }

const src = path.join(__dirname, 'src'), dist = path.join(__dirname, 'dist');
fs.rmSync(dist, {recursive:true, force:true});
fs.mkdirSync(dist, {recursive:true});
for (const f of fs.readdirSync(src)) {
  const full = path.join(src, f);
  if (fs.statSync(full).isDirectory()) continue;
  let txt = fs.readFileSync(full, 'utf8');
  if (f === 'index.html') {
    if (!val('KAKAO_JS_KEY')) txt = txt.replace(/<script[^>]*\{\{KAKAO_JS_KEY\}\}[^>]*><\/script>\s*/, '');
    for (const k of KEYS) txt = txt.split(`{{${k}}}`).join(val(k));
  }
  fs.writeFileSync(path.join(dist, f), txt);
}
fs.writeFileSync(path.join(dist, '.nojekyll'), '');
console.log('[바꿀래] dist/ 를 만들었어요.');

if (process.argv.includes('--serve')) {
  const types = {'.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8'};
  const port = Number(process.env.PORT) || 3000;
  http.createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = path.join(dist, p === '/' ? 'index.html' : path.normalize(p).replace(/^(\.\.[/\\])+/, ''));
    if (!file.startsWith(dist) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream'});
    fs.createReadStream(file).pipe(res);
  }).listen(port, () => console.log(`[바꿀래] http://localhost:${port} 에서 미리보기 중 (카카오 JavaScript SDK 도메인에 이 주소를 등록해야 지도가 떠요)`));
}
