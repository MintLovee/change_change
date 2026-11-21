'use strict';
/*
 * src/ → dist/ 로 복사하면서 index.html의 {{KEY}} 자리에 환경변수 값을 넣어요.
 *   node build.js           → dist/ 만들기 (GitHub Actions가 사용)
 *   node build.js --serve   → dist/ 만든 뒤 http://localhost:3000 에서 미리보기
 * 로컬에서는 .env 파일 값을 읽어요. (.env는 저장소에 올라가지 않아요)
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}
const KEYS = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'KAKAO_JS_KEY'];
const rawVal = k => (process.env[k] || '').trim();
const normalizeSbUrl = u => {
  if (!u || !/^https:\/\/[^"'<>\s]+$/.test(u)) return '';
  try {
    const parsed = new URL(u);
    if (parsed.pathname && parsed.pathname !== '/') {
      console.warn(`[바꿀래] SUPABASE_URL에 경로("${parsed.pathname}")가 포함되어 있어 기본 주소("${parsed.origin}")만 사용해요.`);
    }
    return parsed.origin;
  } catch (e) { return ''; }
};
const val = k => (k === 'SUPABASE_URL' ? normalizeSbUrl(rawVal(k)) : rawVal(k));
const missing = KEYS.filter(k => !val(k));
if (missing.includes('SUPABASE_URL') || missing.includes('SUPABASE_ANON_KEY')) {
  console.error(`[바꿀래] ${missing.filter(k => k !== 'KAKAO_JS_KEY').join(', ')} 값이 없어요. GitHub Secrets(또는 로컬 .env)를 확인해 주세요.`);
  process.exit(1);
}
if (!val('KAKAO_JS_KEY')) console.warn('[바꿀래] KAKAO_JS_KEY가 없어요. 지도는 간이 지도로 표시돼요.');
if (!/^[A-Za-z0-9]+$/.test(val('KAKAO_JS_KEY') || 'x')) { console.error('[바꿀래] KAKAO_JS_KEY 형식이 이상해요. 카카오 JavaScript 키를 그대로 넣어 주세요.'); process.exit(1); }
if (!/^https:\/\/[^"'<>\s]+$/.test(val('SUPABASE_URL')) || /["'<>\s]/.test(val('SUPABASE_ANON_KEY'))) { console.error('[바꿀래] SUPABASE_URL 또는 SUPABASE_ANON_KEY 형식이 이상해요.'); process.exit(1); }

const src = path.join(__dirname, 'src'), dist = path.join(__dirname, 'dist');
const SKIP_FILES = new Set(['App.tsx', 'main.tsx', 'index.css']);
const hashOf = file => {
  const p = path.join(src, file);
  return fs.existsSync(p) ? crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').slice(0, 8) : '';
};
const ASSET_VER = {
  'style.css': hashOf('style.css'),
  'geo.js': hashOf('geo.js'),
  'location.js': hashOf('location.js'),
  'app.js': hashOf('app.js')
};
fs.rmSync(dist, {recursive:true, force:true});
fs.mkdirSync(dist, {recursive:true});
for (const f of fs.readdirSync(src)) {
  if (SKIP_FILES.has(f)) continue;
  const full = path.join(src, f);
  if (fs.statSync(full).isDirectory()) continue;
  let txt = fs.readFileSync(full, 'utf8');
  if (f === 'index.html') {
    if (!val('KAKAO_JS_KEY')) txt = txt.replace(/<script[^>]*\{\{KAKAO_JS_KEY\}\}[^>]*><\/script>\s*/, '');
    for (const k of KEYS) txt = txt.split(`{{${k}}}`).join(val(k));
    for (const [asset, v] of Object.entries(ASSET_VER)) {
      if (v) txt = txt.split(`./${asset}`).join(`./${asset}?v=${v}`);
    }
  }
  fs.writeFileSync(path.join(dist, f), txt);
}
const assetsSrc = path.join(src, 'assets');
if (fs.existsSync(assetsSrc)) {
  fs.cpSync(assetsSrc, path.join(dist, 'assets'), {recursive:true, force:true});
}
fs.writeFileSync(path.join(dist, '.nojekyll'), '');
console.log('[바꿀래] dist/ 를 만들었어요.');

if (process.argv.includes('--serve')) {
  const types = {'.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.webp':'image/webp', '.svg':'image/svg+xml'};
  const port = Number(process.env.PORT) || 3000;
  http.createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = path.join(dist, p === '/' ? 'index.html' : path.normalize(p).replace(/^(\.\.[/\\])+/, ''));
    if (!file.startsWith(dist) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream'});
    fs.createReadStream(file).pipe(res);
  }).listen(port, () => console.log(`[바꿀래] http://localhost:${port} 에서 미리보기 중 (카카오 JavaScript SDK 도메인에 이 주소를 등록해야 지도가 떠요)`));
}
