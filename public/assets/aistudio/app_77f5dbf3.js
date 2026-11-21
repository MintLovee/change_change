'use strict';
/* ============ 상수 ============ */
const CATS = [
  {id:1, n:'굿즈', subs:[[11,'포토카드'],[12,'앨범'],[13,'응원봉'],[14,'키링·인형'],[15,'기타 굿즈']]},
  {id:2, n:'화장품·뷰티', subs:[[21,'스킨케어'],[22,'메이크업'],[23,'향수'],[24,'바디·헤어'],[25,'샘플·미니어처']]},
  {id:3, n:'생활용품', subs:[[31,'주방'],[32,'문구'],[33,'인테리어 소품'],[34,'전자기기 소품'],[35,'기타 생활용품']]}
];
const CAT_NAME = {}; const CAT_PARENT = {};
CATS.forEach(c => { CAT_NAME[c.id] = c.n; c.subs.forEach(([id, n]) => { CAT_NAME[id] = n; CAT_PARENT[id] = c.id; }); });
const parentOf = id => CAT_PARENT[id] || id;
const COND = {sealed:'미개봉', new:'새상품', used:'중고'};
const PREF = {equal:'비슷한 가치만', any:'가치 상관없음', give:'나눔도 OK'};
const METHODS = {meet:'대면', door:'문고리', parcel:'택배'};
const METHOD_DESC = {meet:'만나서 직접', door:'문 앞에 두고 가기', parcel:'편의점·우체국'};
const SEOUL_GU = Object.keys(CENT).sort((a, b) => a.localeCompare(b, 'ko'));
const REGIONS = [...SEOUL_GU, '경기도', '인천', '그 외 지역'];
const STATIONS = [
  ['강남역',37.4979,127.0276],['역삼역',37.5006,127.0364],['선릉역',37.5045,127.0490],['삼성역',37.5088,127.0631],['교대역',37.4934,127.0140],
  ['고속터미널역',37.5049,127.0049],['사당역',37.4766,126.9816],['신림역',37.4842,126.9297],['서울대입구역',37.4812,126.9527],['잠실역',37.5133,127.1001],
  ['송파역',37.4996,127.1121],['문정역',37.4858,127.1225],['천호역',37.5386,127.1236],['건대입구역',37.5404,127.0692],['성수역',37.5446,127.0559],
  ['왕십리역',37.5612,127.0371],['군자역',37.5571,127.0794],['청량리역',37.5801,127.0470],['회기역',37.5898,127.0579],['혜화역',37.5822,127.0019],
  ['종각역',37.5702,126.9831],['광화문역',37.5710,126.9768],['을지로입구역',37.5660,126.9822],['명동역',37.5609,126.9863],['서울역',37.5547,126.9707],
  ['용산역',37.5298,126.9648],['이태원역',37.5345,126.9946],['신촌역',37.5552,126.9369],['홍대입구역',37.5572,126.9245],['합정역',37.5495,126.9139],
  ['망원역',37.5560,126.9101],['마포구청역',37.5635,126.9035],['디지털미디어시티역',37.5768,126.9006],['연신내역',37.6190,126.9210],['불광역',37.6104,126.9298],
  ['여의도역',37.5216,126.9243],['영등포역',37.5157,126.9077],['신도림역',37.5088,126.8913],['구로디지털단지역',37.4852,126.9015],['가산디지털단지역',37.4816,126.8827],
  ['목동역',37.5260,126.8649],['발산역',37.5585,126.8376],['마곡나루역',37.5670,126.8272],['미아사거리역',37.6133,127.0300],['수유역',37.6380,127.0257],
  ['노원역',37.6551,127.0613],['창동역',37.6531,127.0477],['상봉역',37.5965,127.0857]
];
const SEOUL_CENTER = [37.5600, 126.9900];

/* ============ 아이콘 ============ */
const I = {
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 10.5 12 3.8l8.5 6.7V19a1.6 1.6 0 0 1-1.6 1.6h-3.6v-6h-6.6v6H5.1A1.6 1.6 0 0 1 3.5 19z"/></svg>',
  clip:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.5 7.5 8.3 14.7a2 2 0 0 0 2.8 2.8l7.6-7.6a4 4 0 0 0-5.6-5.6L5.4 12a6 6 0 0 0 8.5 8.5l6.4-6.4"/></svg>',
  inbox:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h11l-3-3M17 17H6l3 3"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20.5c1.4-3.6 4.4-5.5 8-5.5s6.6 1.9 8 5.5"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg>',
  close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  chev:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>',
  down:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/></svg>',
  heartF:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/></svg>',
  pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/></svg>',
  chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 12a8 7 0 1 1 3.4 5.7L4 19l1-3.3A6.6 6.6 0 0 1 4 12z"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  more:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5.5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="18.5" cy="12" r="1.8"/></svg>',
  swap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h12l-3.5-3.5M17 17H5l3.5 3.5"/></svg>',
  camera:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.5-2.2h6L16.5 7h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="12.8" r="3.3"/></svg>',
  meet:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="7" r="2.6"/><circle cx="16" cy="7" r="2.6"/><path d="M3.5 19c.6-3.3 2.3-5 4.5-5s3.9 1.7 4.5 5M11.5 19c.6-3.3 2.3-5 4.5-5s3.9 1.7 4.5 5"/></svg>',
  door:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 20.5V4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5v16M3.5 20.5h17"/><circle cx="14.6" cy="12" r="1"/></svg>',
  parcel:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 8 4.3v9.4L12 21l-8-4.3V7.3z"/><path d="m4 7.3 8 4.3 8-4.3M12 11.6V21M8 5.2l8 4.3"/></svg>',
  flag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
  edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/></svg>',
  logout:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10"/></svg>',
  target:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>',
  shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3 5 6v5.5c0 4.4 3 8 7 9.5 4-1.5 7-5.1 7-9.5V6z"/><path d="m9 12 2 2 4-4"/></svg>',
  info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.01"/></svg>',
  sparkle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18.5l-1.8-5.9-5.7-1.8L10.2 9z"/></svg>',
  trophy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4"/></svg>',
  share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M8 8l4-4 4 4M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13"/></svg>',
  good:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="16" cy="16" r="13"/><path d="M10.5 18.5c1.4 2.4 3.3 3.5 5.5 3.5s4.1-1.1 5.5-3.5"/><path d="M11.5 12.5v1.5M20.5 12.5v1.5"/></svg>',
  soso:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="16" cy="16" r="13"/><path d="M11 20h10M11.5 12.5v1.5M20.5 12.5v1.5"/></svg>',
  bad:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="16" cy="16" r="13"/><path d="M10.5 22c1.4-2.4 3.3-3.5 5.5-3.5s4.1 1.1 5.5 3.5M11.5 12.5v1.5M20.5 12.5v1.5"/></svg>',
  cat1:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="m12 8.2 1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4z"/></svg>',
  cat2:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M9.5 3h5v4h-5z"/><path d="M8 7h8l1 3v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9z"/><path d="M7 13h10"/></svg>',
  cat3:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M5 9h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17M9 3.5c0 1.5 1.5 1.5 1.5 3M13 3.5c0 1.5 1.5 1.5 1.5 3"/></svg>'
};
const PIN_SVG = '<svg viewBox="0 0 40 48"><path d="M20 46s15-14 15-26A15 15 0 0 0 5 20c0 12 15 26 15 26z" fill="var(--accent)" stroke="#fff" stroke-width="2.5"/><circle cx="20" cy="20" r="5.5" fill="#fff"/></svg>';

/* ============ 유틸 ============ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const now = () => Date.now();
const won = n => Number(n).toLocaleString('ko-KR') + '원';
function ago(ts) {
  if (!ts) return '';
  const s = Math.max(1, Math.floor((now() - ts) / 1000));
  if (s < 60) return '방금 전';
  const m = Math.floor(s / 60); if (m < 60) return m + '분 전';
  const h = Math.floor(m / 60); if (h < 24) return h + '시간 전';
  const d = Math.floor(h / 24); if (d < 7) return d + '일 전';
  const dt = new Date(ts); return (dt.getMonth() + 1) + '월 ' + dt.getDate() + '일';
}
const dateStr = ts => { const d = new Date(ts); return d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0'); };
const AV_COLORS = ['#E8762E','#23406D','#2C9564','#B0567A','#7A5BC4','#C28A1E','#3A8AA8','#8C6A4F'];
function avatarColor(id) { let h = 0; for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return AV_COLORS[h % AV_COLORS.length]; }
function avatar(id, size = '') { const p = profileOf(id); const ch = (p.nickname || '?').trim().charAt(0); return `<span class="avatar ${size}" style="background:${avatarColor(id)}">${esc(ch)}</span>`; }
function phBox(cat) { const p = parentOf(cat); const bg = p === 1 ? 'var(--contrast-soft)' : p === 2 ? 'var(--accent-soft)' : 'var(--surface-2)'; const fg = p === 1 ? 'var(--contrast-text)' : p === 2 ? 'var(--accent-text)' : 'var(--muted)'; return `<div class="ph" style="background:${bg};color:${fg}">${I['cat' + (p || 3)]}</div>`; }
function itemImg(item) { return item && item.photos && item.photos[0] ? `<img src="${item.photos[0]}" alt="" loading="lazy">` : phBox(item ? item.cat : 3); }
function haversine(a, b, c, d) { const R = 6371000, r = Math.PI / 180; const x = Math.sin((c - a) * r / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin((d - b) * r / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); }
function pointInRing(lng, lat, ring) { let ins = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if (((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) ins = !ins; } return ins; }
function guAt(lat, lng) {
  for (const f of GEO.features) {
    const g = f.geometry; const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    for (const p of polys) if (pointInRing(lng, lat, p[0])) return f.properties.n;
  }
  return null;
}
function placeName(lat, lng) {
  let best = null, bd = 1e9;
  for (const [n, a, b] of STATIONS) { const d = haversine(lat, lng, a, b); if (d < bd) { bd = d; best = n; } }
  if (bd < 450) return best + ' 근처';
  const gu = guAt(lat, lng);
  if (gu) return bd < 1100 ? `${gu} · ${best} 부근` : gu + ' 부근';
  return '선택한 위치';
}
const kakaoMapUrl = m => `https://map.kakao.com/link/map/${encodeURIComponent(m.name)},${m.lat.toFixed(6)},${m.lng.toFixed(6)}`;
const kakaoRouteUrl = m => `https://map.kakao.com/link/to/${encodeURIComponent(m.name)},${m.lat.toFixed(6)},${m.lng.toFixed(6)}`;
function tempColor(t) { return t < 30 ? '#3A8AA8' : t < 36.5 ? '#5C9C7A' : t < 40 ? '#E8A02E' : t < 50 ? '#E8762E' : '#D3473E'; }

/* ============ 미니맵 (SVG) ============ */
const K = 4000; const LAT0 = 37.56, LNG0 = 126.99, COSL = Math.cos(LAT0 * Math.PI / 180);
const proj = (lng, lat) => [((lng - LNG0) * COSL * K), (-(lat - LAT0) * K)];
let GEO_PATHS = '';
function buildGeoPaths() {
  const parts = [];
  for (const f of GEO.features) {
    const g = f.geometry; const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    let d = '';
    for (const p of polys) for (const ring of p) { d += ring.map((c, i) => { const [x, y] = proj(c[0], c[1]); return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); }).join('') + 'Z'; }
    parts.push(`<path d="${d}"/>`);
  }
  GEO_PATHS = parts.join('');
}
function miniMap(m) {
  const [x, y] = proj(m.lng, m.lat); const w = 150, h = 75;
  const labels = SEOUL_GU.map(n => { const [cy, cx] = CENT[n]; const [lx, ly] = proj(cx, cy); return Math.abs(lx - x) < w && Math.abs(ly - y) < h ? `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" font-size="6.5" font-weight="700" fill="var(--muted)">${n}</text>` : ''; }).join('');
  const st = STATIONS.map(([n, a, b]) => { const [sx, sy] = proj(b, a); return Math.abs(sx - x) < w && Math.abs(sy - y) < h ? `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="2" fill="var(--surface)" stroke="var(--contrast)" stroke-width="1.2"/><text x="${(sx + 3.5).toFixed(1)}" y="${(sy + 2).toFixed(1)}" font-size="5" font-weight="700" fill="var(--contrast-text)">${n}</text>` : ''; }).join('');
  return `<div class="kmini" data-lat="${m.lat}" data-lng="${m.lng}"><svg viewBox="${(x - w / 2).toFixed(1)} ${(y - h / 2).toFixed(1)} ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-label="${esc(m.name)} 지도"><g fill="var(--map-land)" stroke="var(--map-line)" stroke-width=".8">${GEO_PATHS}</g>${labels}${st}<g transform="translate(${x.toFixed(1)} ${(y - 12).toFixed(1)}) scale(.3) translate(-20 -6)"><path d="M20 46s15-14 15-26A15 15 0 0 0 5 20c0 12 15 26 15 26z" fill="var(--accent)" stroke="#fff" stroke-width="3"/><circle cx="20" cy="20" r="5.5" fill="#fff"/></g></svg></div>`;
}

/* ============ 카카오맵 SDK ============ */
// SDK는 index.html의 <script>로 불러와요(키는 서버가 템플릿에 넣어 줌). 못 불러오면 위의 SVG 간이 지도를 그대로 써요.
let KAKAO_READY = false;
function initKakao() {
  if (!(window.kakao && window.kakao.maps && typeof window.kakao.maps.load === 'function')) return;
  try {
    kakao.maps.load(() => { KAKAO_READY = true; hydrateMiniMaps(document.getElementById('app')); });
    new MutationObserver(muts => { if (!KAKAO_READY) return; for (const m of muts) m.addedNodes.forEach(n => { if (n.nodeType === 1) hydrateMiniMaps(n); }); }).observe(document.getElementById('app'), {childList:true, subtree:true});
  } catch (e) { KAKAO_READY = false; }
}
function hydrateMiniMaps(root) {
  if (!KAKAO_READY || !root) return;
  const els = root.classList && root.classList.contains('kmini') ? [root] : [...root.querySelectorAll('.kmini')];
  els.forEach(el => {
    if (el.dataset.k) return; el.dataset.k = '1';
    const pos = new kakao.maps.LatLng(+el.dataset.lat, +el.dataset.lng);
    el.innerHTML = '';
    try { new kakao.maps.StaticMap(el, {center:pos, level:3, marker:{position:pos}}); } catch (e) {}
  });
}
function cssVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
function kakaoPinImage() {
  const svg = PIN_SVG.replace('var(--accent)', cssVar('--accent') || '#E8762E').replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" ');
  return new kakao.maps.MarkerImage('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), new kakao.maps.Size(40, 48), {offset:new kakao.maps.Point(20, 46)});
}

/* ============ 데이터 저장소 (Supabase) ============ */
// 설정값(SUPABASE_URL, SUPABASE_ANON_KEY)은 배포할 때 index.html에 채워져요.
const CONFIG = window.APP_CONFIG || {};
const CONFIG_OK = /^https:\/\//.test(CONFIG.supabaseUrl || '') && !!CONFIG.supabaseAnonKey && !/\{\{/.test(CONFIG.supabaseAnonKey);
const sb = CONFIG_OK && window.supabase ? window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey) : null;
const S = {profiles:{}, items:{}, offers:{}, challenges:{}, reviews:{}};
const App = {me:null, email:'', session:false, loading:true, readOnly:false, ch:null};

function krError(e) {
  const m = (e && (e.message || e.error_description)) || '';
  if (/Invalid login credentials/i.test(m)) return '이메일 또는 비밀번호가 맞지 않아요.';
  if (/Email not confirmed/i.test(m)) return '메일 인증을 먼저 완료해 주세요. 받은편지함을 확인해 주세요.';
  if (/already registered/i.test(m)) return '이미 가입한 이메일이에요. 로그인해 주세요.';
  if (/Password should be/i.test(m)) return '비밀번호는 8자 이상이어야 해요.';
  if (/rate limit|too many/i.test(m)) return '요청이 너무 많아요. 잠시 후 다시 시도해 주세요.';
  if (e && e.code === '23505') return '이미 쓰고 있는 닉네임이에요.';
  if (e && (e.code === '42501' || e.code === 'NO_ROWS')) return '권한이 없어서 저장하지 못했어요.';
  if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return '서버에 연결하지 못했어요. 인터넷 연결을 확인해 주세요.';
  if (/[가-힣]/.test(m)) return m; // DB 함수가 보낸 한국어 안내
  return '저장하지 못했어요. 잠시 후 다시 시도해 주세요.';
}
function putLocal(col, id, data) { if (!S[col]) return; const n = {...S[col]}; if (data == null) delete n[id]; else n[id] = data; S[col] = n; scheduleRender(); }
async function q(promise) { const {data, error} = await promise; if (error) throw error; return data; }
const Store = {
  async set(col, id, data) {
    try {
      if (col === 'reports') { await q(sb.from(col).insert({id, data})); return data; }
      const exists = S[col] && S[col][id];
      const rows = await q((exists ? sb.from(col).update({data}).eq('id', id) : sb.from(col).insert({id, data})).select('id,data'));
      if (!rows || !rows.length) { const err = new Error('no rows'); err.code = 'NO_ROWS'; throw err; }
      putLocal(col, id, rows[0].data); return rows[0].data;
    } catch (e) { handleWriteError(e); throw e; }
  },
  async patch(col, id, data) { return this.set(col, id, {...(S[col] && S[col][id] || {}), ...data}); },
  async del(col, id) {
    try {
      const rows = await q(sb.from(col).delete().eq('id', id).select('id'));
      if (!rows || !rows.length) { const err = new Error('no rows'); err.code = 'NO_ROWS'; throw err; }
      putLocal(col, id, null);
    } catch (e) { handleWriteError(e); throw e; }
  },
  async rpc(fn, args) { try { return await q(sb.rpc(fn, args)); } catch (e) { handleWriteError(e); throw e; } }
};
function handleWriteError(e) {
  if (e && (e.status === 401 || /JWT expired/i.test(e.message || ''))) { toast('로그인이 만료됐어요. 다시 로그인해 주세요.'); signOutLocal(); return; }
  toast(krError(e));
}
async function loadState(cols = Object.keys(S)) {
  await Promise.all(cols.map(async col => {
    const rows = await q(sb.from(col).select('id,data').limit(5000));
    const m = {}; rows.forEach(r => { m[r.id] = r.data; }); S[col] = m;
  }));
  scheduleRender();
}
function connectLive() {
  if (App.ch) sb.removeChannel(App.ch);
  let first = true;
  App.ch = sb.channel('baggullae-live')
    .on('postgres_changes', {event:'*', schema:'public'}, p => {
      if (!S[p.table]) return;
      if (p.eventType === 'DELETE') putLocal(p.table, p.old && p.old.id, null);
      else if (p.new && p.new.id) putLocal(p.table, p.new.id, p.new.data);
    })
    .subscribe(status => { if (status === 'SUBSCRIBED') { if (!first) loadState().catch(() => {}); first = false; } });
}
async function enterSession(user) { App.me = user.id; App.email = user.email || ''; await loadState(); connectLive(); App.session = true; }
async function signOut() { try { await sb.auth.signOut(); } catch (e) {} signOutLocal(); }
function signOutLocal() {
  if (App.ch) { sb.removeChannel(App.ch); App.ch = null; }
  App.session = false; App.me = null; Object.keys(S).forEach(c => { S[c] = {}; });
  while (UI.stack.length) popPage();
  $$('.sheet').forEach(sh => closeSheet(sh));
  const a = $('#auth'); if (a) a.remove();
  OB.step = 0; OB.nickname = ''; OB.region = ''; OB.wants = []; OB.agree = [false, false, false];
  render();
}

/* ============ 파생 데이터 ============ */
const profileOf = id => S.profiles[id] || {nickname:'알 수 없음', region:''};
const isExample = id => String(id).startsWith('ex-');
function reviewsFor(id) { return Object.values(S.reviews).filter(r => r.to === id).sort((a, b) => b.at - a.at); }
function tempOf(id) { let t = 36.5; for (const r of reviewsFor(id)) t += r.score === 'good' ? 0.5 : r.score === 'bad' ? -1 : 0; return Math.max(0, Math.min(99, Math.round(t * 10) / 10)); }
function tradeCount(id) { return (S.profiles[id] && S.profiles[id].tradeCount) || 0; }
const itemsOf = id => Object.entries(S.items).filter(([, it]) => it.owner === id).map(([k, v]) => ({...v, id:k})).sort((a, b) => b.createdAt - a.createdAt);
const allItems = () => Object.entries(S.items).map(([k, v]) => ({...v, id:k}));
const itemById = id => S.items[id] ? {...S.items[id], id} : null;
const wantsOf = id => (S.profiles[id] && S.profiles[id].wants) || [];
function wantMatches(item, w) { if (w.t === 'cat') return w.c === item.cat || w.c === parentOf(item.cat); return (item.title || '').toLowerCase().includes(String(w.k).toLowerCase()); }
const matchesWants = (item, wants) => wants.some(w => wantMatches(item, w));
function wantLabel(w) { return w.t === 'cat' ? (CAT_PARENT[w.c] ? CAT_NAME[CAT_PARENT[w.c]] + ' › ' + CAT_NAME[w.c] : CAT_NAME[w.c] + ' 전체') : '“' + w.k + '”'; }
function matchFeed() {
  const myW = wantsOf(App.me); const mine = itemsOf(App.me).filter(i => i.status === 'available');
  const perfect = [], oneway = [];
  for (const it of allItems()) {
    if (it.owner === App.me || it.status !== 'available') continue;
    if (!matchesWants(it, myW)) continue;
    const theirW = wantsOf(it.owner);
    (mine.some(mi => matchesWants(mi, theirW)) ? perfect : oneway).push(it);
  }
  const by = (a, b) => b.createdAt - a.createdAt;
  return {perfect:perfect.sort(by), oneway:oneway.sort(by)};
}
function challengeOf(item) { return item && item.challengeId ? S.challenges[item.challengeId] : null; }
function offersFor(itemId) { return Object.entries(S.offers).map(([k, v]) => ({...v, id:k})).filter(o => o.target === itemId || o.offered === itemId); }
const myOffers = () => Object.entries(S.offers).map(([k, v]) => ({...v, id:k})).filter(o => o.from === App.me || o.to === App.me).sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
const pendingReceived = () => myOffers().filter(o => o.to === App.me && o.status === 'pending').length;
const challenges = () => Object.entries(S.challenges).map(([k, v]) => ({...v, id:k}));
const myActiveChallenge = () => challenges().find(c => c.owner === App.me && c.status === 'active');

/* ============ 렌더링 ============ */
const UI = {tab:'home', homeSeg:'match', filterCat:0, filterMethod:'', offerSeg:'recv', chalSeg:'active', meSeg:'items', stack:[], enterTab:true, scroll:{}};
let renderQueued = false;
function scheduleRender() { if (renderQueued) return; renderQueued = true; requestAnimationFrame(() => { renderQueued = false; render(); }); }

function render() {
  const app = $('#app');
  if (App.loading) return;
  if (!App.session) { renderAuth(); return; }
  if (!S.profiles[App.me]) { const a = $('#auth'); if (!a || a.dataset.mode !== 'onboard') { renderAuth(); OB.step = 0; renderOnboard(); } return; }
  const au = $('#auth'); if (au && !au.dataset.leaving) au.remove();
  const main = $('#main');
  const prev = $('#tabview');
  if (prev) UI.scroll[UI.renderedTab] = prev.scrollTop;
  const html = ({home:viewHome, challenge:viewChallenges, offers:viewOffers, me:viewMe})[UI.tab]();
  main.innerHTML = `<div class="view" id="tabview">${html}</div>`;
  const tv = $('#tabview');
  if (UI.enterTab) { tv.querySelectorAll('.stagger').forEach(el => el.classList.add('enter')); UI.enterTab = false; tv.scrollTop = 0; }
  else tv.scrollTop = UI.scroll[UI.tab] || 0;
  UI.renderedTab = UI.tab;
  bindScroll(tv);
  initSegs(tv);
  // tab bar
  $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === UI.tab));
  const n = pendingReceived(); const b = $('#offerBadge');
  if (n) { if (!b || b.textContent !== String(n)) { b && b.remove(); $('.tab[data-tab="offers"]').insertAdjacentHTML('beforeend', `<span class="badge" id="offerBadge">${n}</span>`); } } else if (b) b.remove();
  $('#fab').classList.toggle('hidden', UI.tab !== 'home' || UI.stack.length > 0);
  $('#tabbar').classList.toggle('hidden', UI.stack.length > 0);
  // pages
  UI.stack.forEach(p => renderPage(p));
}
function bindScroll(v) {
  const on = () => v.classList.toggle('scrolled', v.scrollTop > 36);
  v.addEventListener('scroll', on, {passive:true}); on();
}
function initSegs(root) {
  $$('.seg', root).forEach(seg => {
    const btns = $$('button', seg); const on = btns.findIndex(b => b.classList.contains('on'));
    let ind = $('.seg-ind', seg); if (!ind) { ind = document.createElement('i'); ind.className = 'seg-ind'; seg.prepend(ind); }
    const w = 100 / btns.length; ind.style.width = `calc(${w}% - ${6 / btns.length}px)`; ind.style.transform = `translateX(calc(${Math.max(0, on) * 100}% + ${on > 0 ? 0 : 0}px))`;
  });
}
function navBar(title, {back = false, right = '', glassy = false, showTitle = false} = {}) {
  return `<div class="nav ${glassy ? 'glassy' : ''}">${back ? `<button class="nav-btn" data-act="back" aria-label="뒤로">${I.back}</button>` : '<span class="nav-spacer"></span>'}<div class="nav-title ${showTitle ? 'show' : ''}">${esc(title)}</div>${right || '<span class="nav-spacer"></span>'}</div>`;
}
function emptyBox(icon, title, text, btn = '') { return `<div class="empty"><div class="ei">${I[icon]}</div><b>${title}</b>${text}${btn}</div>`; }
function methodTags(methods) { if (!methods || !methods.length) return '<span class="tag">협의 가능</span>'; return methods.map(m => `<span class="tag">${I[m]}${METHODS[m]}</span>`).join(''); }
function valueText(it) { return it.value ? won(it.value) + ' 상당' : ''; }

function itemRow(it) {
  const ch = challengeOf(it);
  const veil = it.status === 'reserved' ? '<div class="veil">예약중</div>' : it.status === 'traded' ? '<div class="veil">교환완료</div>' : '';
  const p = profileOf(it.owner);
  return `<button class="row" data-act="openItem" data-id="${it.id}">
    <div class="thumb">${itemImg(it)}${veil}</div>
    <div class="row-body">
      <div class="row-title">${esc(it.title)}</div>
      <div class="row-meta">${esc(p.region || it.region || '')} · ${ago(it.createdAt)}</div>
      ${it.value ? `<div class="row-value num">${won(it.value)}</div>` : '<div class="row-value muted">가치 비공개</div>'}
      <div class="row-tags">${ch ? `<span class="tag accent">${I.clip}챌린지 ${ch.steps.length}단계</span>` : ''}<span class="tag">${COND[it.cond]}</span>${methodTags(it.methods)}</div>
    </div></button>`;
}
function matchCard(it, perfect) {
  const p = profileOf(it.owner);
  return `<button class="mcard" data-act="openItem" data-id="${it.id}"><div class="mimg">${itemImg(it)}${perfect ? '<span class="mbadge tag solid-contrast">서로 찾던 물건</span>' : ''}</div><div class="mbody"><div class="mt">${esc(it.title)}</div><div class="mm">${esc(p.nickname)} · ${esc(p.region || '')}</div></div></button>`;
}

/* ---- 홈 ---- */
function viewHome() {
  const me = profileOf(App.me);
  const right = `<button class="nav-btn" data-act="openWants" aria-label="찾는 것 관리">${I.target}</button>`;
  let h = `<div class="nav"><button class="region-btn" data-act="editProfile">${esc(me.region)}${I.down}</button><div class="nav-title"></div>${right}</div>`;
  h += `<div class="seg" role="tablist"><button class="${UI.homeSeg === 'match' ? 'on' : ''}" data-act="homeSeg" data-v="match">추천 매칭</button><button class="${UI.homeSeg === 'all' ? 'on' : ''}" data-act="homeSeg" data-v="all">전체 물건</button></div>`;
  if (App.readOnly) h += `<div class="note">${I.info}<span>보기 전용으로 열렸어요. 물건을 등록하거나 제안하려면 공유 설정에서 참여자 권한이 필요해요.</span></div>`;
  if (UI.homeSeg === 'match') {
    const wants = wantsOf(App.me);
    const {perfect, oneway} = matchFeed();
    const hot = challenges().filter(c => c.status === 'active').sort((a, b) => (b.cheers || []).length - (a.cheers || []).length).slice(0, 8);
    h += '<div class="stagger">';
    if (hot.length) h += `<div class="section"><div class="section-head"><h2>요즘 뜨는 챌린지</h2><button class="more" data-act="tab" data-tab="challenge">전체보기</button></div><div class="hscroll">${hot.map(c => { const cur = itemById(c.currentItemId); return `<button class="mcard" data-act="openChallenge" data-id="${c.id}"><div class="mimg">${cur ? itemImg(cur) : stepImg(c.steps[c.steps.length - 1])}<span class="mbadge tag solid-contrast">${c.steps.length}단계</span></div><div class="mbody"><div class="mt">${esc(c.title)}</div><div class="mm">${I.heartF.replace('<svg', '<svg style="width:11px;height:11px;vertical-align:-1px;color:var(--bad)"')} ${(c.cheers || []).length} · ${esc(profileOf(c.owner).nickname)}</div></div></button>`; }).join('')}</div></div>`;
    if (!wants.length) {
      h += `<div class="group">${emptyBox('target', '찾는 물건을 알려주세요', '등록하면 딱 맞는 교환 상대를 찾아드려요.', '<button class="btn btn-primary btn-sm" data-act="openWants">찾는 것 등록하기</button>')}</div>`;
    } else {
      h += `<div class="section"><div class="section-head"><h2>서로 찾던 물건</h2><span class="more num">${perfect.length}개</span></div>${perfect.length ? `<div class="hscroll">${perfect.map(i => matchCard(i, true)).join('')}</div>` : `<div class="note contrast">${I.sparkle}<span>내 물건을 찾는 사람이 아직 없어요. 물건을 더 등록하면 매칭될 가능성이 커져요.</span></div>`}</div>`;
      h += `<div class="section"><div class="section-head"><h2>내가 찾던 물건</h2><span class="more num">${oneway.length}개</span></div>${oneway.length ? `<div class="group">${oneway.map(itemRow).join('')}</div>` : `<div class="group">${emptyBox('search', '아직 없어요', '새 물건이 올라오면 여기에 보여드릴게요.')}</div>`}</div>`;
      h += `<div class="chips" style="padding-top:0">${wants.map(w => `<span class="chip">${esc(wantLabel(w))}</span>`).join('')}<button class="chip" data-act="openWants">${I.edit}편집</button></div>`;
    }
    h += '</div>';
  } else {
    h += `<div class="chips"><button class="chip ${!UI.filterCat ? 'on' : ''}" data-act="fCat" data-v="0">전체</button>${CATS.map(c => `<button class="chip ${UI.filterCat === c.id ? 'on' : ''}" data-act="fCat" data-v="${c.id}">${c.n}</button>`).join('')}</div>`;
    h += `<div class="chips" style="margin-top:-4px"><button class="chip ${!UI.filterMethod ? 'on-accent' : ''}" data-act="fMethod" data-v="">모든 방식</button>${Object.entries(METHODS).map(([k, v]) => `<button class="chip ${UI.filterMethod === k ? 'on-accent' : ''}" data-act="fMethod" data-v="${k}">${I[k]}${v}</button>`).join('')}</div>`;
    let list = allItems().filter(i => i.status !== 'traded');
    if (UI.filterCat) list = list.filter(i => parentOf(i.cat) === UI.filterCat);
    if (UI.filterMethod) list = list.filter(i => !i.methods || !i.methods.length || i.methods.includes(UI.filterMethod));
    list.sort((a, b) => b.createdAt - a.createdAt);
    h += `<div class="stagger">${list.length ? `<div class="group">${list.map(itemRow).join('')}</div>` : `<div class="group">${emptyBox('search', '조건에 맞는 물건이 없어요', '필터를 바꾸거나 첫 물건을 등록해 보세요.')}</div>`}</div>`;
  }
  return h;
}

/* ---- 챌린지 탭 ---- */
function stepImg(s) { return s && s.img ? `<img src="${s.img}" alt="">` : phBox(s ? s.cat : 3); }
function viewChallenges() {
  const mine = myActiveChallenge();
  let h = navBar('빨간 클립 챌린지') + '<div class="large-title">빨간 클립 챌린지</div>';
  h += `<div class="stagger"><div class="banner"><div class="bicon">${I.clip}</div><div style="flex:1"><div class="bt">볼펜 하나로 어디까지 갈 수 있을까?</div><div class="bs">작은 물건에서 시작해 교환을 이어가 보세요</div></div></div>`;
  h += `<div style="padding:0 16px 18px">${mine ? `<button class="btn btn-tint btn-block" data-act="openChallenge" data-id="${mine.id}">${I.clip}내 챌린지 이어가기 · ${mine.steps.length}단계</button>` : `<button class="btn btn-primary btn-block" data-act="startChallenge">${I.plus}나도 챌린지 시작하기</button>`}</div>`;
  h += `<div class="seg"><button class="${UI.chalSeg === 'active' ? 'on' : ''}" data-act="chalSeg" data-v="active">진행 중</button><button class="${UI.chalSeg === 'finished' ? 'on' : ''}" data-act="chalSeg" data-v="finished">완주</button></div>`;
  const list = challenges().filter(c => c.status === UI.chalSeg).sort((a, b) => (b.cheers || []).length - (a.cheers || []).length || b.createdAt - a.createdAt);
  h += list.length ? `<div class="group">${list.map(chalRow).join('')}</div>` : `<div class="group">${emptyBox('clip', UI.chalSeg === 'active' ? '진행 중인 챌린지가 없어요' : '아직 완주한 챌린지가 없어요', '첫 번째 주인공이 되어 보세요.')}</div>`;
  return h + '</div>';
}
function chalRow(c) {
  const first = c.steps[0], last = c.steps[c.steps.length - 1];
  return `<button class="ccard" data-act="openChallenge" data-id="${c.id}"><div class="cpath"><div class="cp">${stepImg(first)}</div><span class="arr">${I.chev}</span><div class="cp">${stepImg(last)}</div></div><div class="ct"><b>${esc(c.title)}</b><span>${esc(first.title)} → ${esc(last.title)} · ${c.steps.length}단계</span></div><span class="cheer-n">${I.heartF.replace('<svg', '<svg style="color:var(--bad)"')}${(c.cheers || []).length}</span></button>`;
}

/* ---- 제안함 ---- */
function viewOffers() {
  const all = myOffers();
  const recv = all.filter(o => o.to === App.me), sent = all.filter(o => o.from === App.me);
  const list = UI.offerSeg === 'recv' ? recv : sent;
  let h = navBar('제안함') + '<div class="large-title">제안함</div>';
  h += `<div class="seg"><button class="${UI.offerSeg === 'recv' ? 'on' : ''}" data-act="offerSeg" data-v="recv">받은 제안 ${recv.filter(o => o.status === 'pending').length ? '· ' + recv.filter(o => o.status === 'pending').length : ''}</button><button class="${UI.offerSeg === 'sent' ? 'on' : ''}" data-act="offerSeg" data-v="sent">보낸 제안</button></div>`;
  const order = {accepted:0, pending:1, completed:2, rejected:3, cancelled:4};
  list.sort((a, b) => order[a.status] - order[b.status] || (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
  h += list.length ? list.map(offerCard).join('') : `<div class="group">${emptyBox('inbox', UI.offerSeg === 'recv' ? '받은 제안이 없어요' : '보낸 제안이 없어요', UI.offerSeg === 'recv' ? '물건을 등록하면 교환 제안이 들어와요.' : '마음에 드는 물건에 교환을 제안해 보세요.')}</div>`;
  return h;
}
const STATUS_LABEL = {pending:'대기 중', accepted:'교환 진행 중', completed:'교환 완료', rejected:'거절됨', cancelled:'취소됨'};
function offerCard(o) {
  const mineIsFrom = o.from === App.me; const other = mineIsFrom ? o.to : o.from;
  const myItem = itemById(mineIsFrom ? o.offered : o.target) || {title:'삭제된 물건', cat:3};
  const theirItem = itemById(mineIsFrom ? o.target : o.offered) || {title:'삭제된 물건', cat:3};
  const p = profileOf(other);
  let acts = '';
  if (o.status === 'pending' && !mineIsFrom) acts = `<button class="btn btn-gray" data-act="rejectOffer" data-id="${o.id}">거절</button><button class="btn btn-primary" data-act="acceptOffer" data-id="${o.id}">수락하기</button>`;
  else if (o.status === 'pending' && mineIsFrom) acts = `<button class="btn btn-gray" data-act="cancelOffer" data-id="${o.id}">제안 취소</button>`;
  else if (o.status === 'accepted') {
    const myDone = mineIsFrom ? o.fromDone : o.toDone;
    acts = `${o.openchat ? `<a class="btn btn-contrast" href="${esc(o.openchat)}" target="_blank" rel="noopener">${I.chat}오픈채팅</a>` : ''}${myDone ? '<button class="btn btn-gray" disabled>상대 확인 대기</button>' : `<button class="btn btn-primary" data-act="completeOffer" data-id="${o.id}">${I.check}교환 완료했어요</button>`}`;
  } else if (o.status === 'completed') {
    const reviewed = S.reviews[o.id + '_' + App.me];
    const chal = challenges().find(c => c.owner === App.me && c.status === 'active' && c.awaitingNext && c.awaitingOffer === o.id);
    acts = `${reviewed ? '<button class="btn btn-gray" disabled>후기 작성 완료</button>' : `<button class="btn btn-tint" data-act="reviewOffer" data-id="${o.id}">후기 남기기</button>`}${chal ? `<button class="btn btn-primary" data-act="continueChallenge" data-id="${chal.id}">${I.clip}챌린지 이어가기</button>` : ''}`;
  }
  const meet = o.method === 'meet' && o.meet;
  return `<div class="ocard"><div class="ocard-top">${avatar(other, 'sm')}<button class="on" data-act="openUser" data-id="${other}" style="text-align:left">${esc(p.nickname)}<small>${mineIsFrom ? '내가 보낸 제안' : '나에게 온 제안'} · ${ago(o.updatedAt || o.createdAt)}</small></button><span class="pill ${o.status}">${STATUS_LABEL[o.status]}</span></div>
    <div class="swap"><button class="swap-item" data-act="openItem" data-id="${mineIsFrom ? o.offered : o.target}"><div class="si-img">${itemImg(myItem)}</div><div class="si-l">내 물건</div><div class="si-t">${esc(myItem.title)}</div></button><span class="swap-ic">${I.swap}</span><button class="swap-item" data-act="openItem" data-id="${mineIsFrom ? o.target : o.offered}"><div class="si-img">${itemImg(theirItem)}</div><div class="si-l">${esc(p.nickname)}님 물건</div><div class="si-t">${esc(theirItem.title)}</div></button></div>
    ${o.message ? `<div class="omsg">${esc(o.message)}</div>` : ''}
    <div class="ometa">${o.method ? `<span class="tag contrast">${I[o.method]}${METHODS[o.method]}</span>` : '<span class="tag">방식 협의</span>'}${o.method === 'door' || o.method === 'parcel' ? '<span class="tag">주소는 오픈채팅에서</span>' : ''}${o.autoRejected ? '<span class="tag">다른 교환이 성사돼 자동 거절</span>' : ''}</div>
    ${meet ? `<div class="place"><div class="pmap">${miniMap(o.meet)}</div><div class="pinfo"><div class="pn">${esc(o.meet.name)}<small>만남 장소</small></div>${o.status === 'accepted' ? `<a href="${kakaoRouteUrl(o.meet)}" target="_blank" rel="noopener">길찾기</a>` : `<a href="${kakaoMapUrl(o.meet)}" target="_blank" rel="noopener">카카오맵</a>`}</div></div>` : ''}
    ${acts ? `<div class="oact">${acts}</div>` : ''}</div>`;
}

/* ---- 마이 ---- */
function profileBlock(id, own) {
  const p = profileOf(id); const t = tempOf(id); const reviews = reviewsFor(id);
  let h = `<div class="profile-head">${avatar(id, 'lg')}<div style="flex:1;min-width:0"><div class="pn">${esc(p.nickname)}</div><div class="pr">${esc(p.region)} · ${p.createdAt ? dateStr(p.createdAt) + ' 가입' : ''}</div></div>${own ? `<button class="btn btn-gray btn-sm" data-act="editProfile">프로필 수정</button>` : ''}</div>`;
  h += `<div class="tempcard"><div class="th"><span>교환온도</span><b class="num" style="color:${tempColor(t)}">${t.toFixed(1)}°C</b></div><div class="tbar"><i style="width:${Math.min(100, t)}%;background:${tempColor(t)}"></i></div><div class="tfoot"><span>첫 온도 36.5°C</span><span>좋아요 후기 +0.5° · 별로예요 −1°</span></div></div>`;
  h += `<div class="stats"><div><b class="num">${tradeCount(id)}</b><span>교환 완료</span></div><div><b class="num">${itemsOf(id).filter(i => i.status !== 'traded').length}</b><span>교환 가능 물건</span></div><div><b class="num">${reviews.length}</b><span>받은 후기</span></div></div>`;
  return h;
}
function gridCards(items) {
  return `<div class="grid2">${items.map(it => `<button class="gcard" data-act="openItem" data-id="${it.id}"><div class="gi">${itemImg(it)}${it.status === 'reserved' ? '<div class="veil">예약중</div>' : it.status === 'traded' ? '<div class="veil">교환완료</div>' : ''}</div><div class="gt">${esc(it.title)}</div><div class="gm">${it.value ? won(it.value) : '가치 비공개'}</div></button>`).join('')}</div>`;
}
function reviewList(id) {
  const rs = reviewsFor(id);
  if (!rs.length) return `<div class="group">${emptyBox('chat', '아직 받은 후기가 없어요', '')}</div>`;
  const lbl = {good:'좋아요', soso:'보통이에요', bad:'별로예요'};
  return `<div class="group">${rs.map(r => `<div class="review"><div class="rh">${avatar(r.from, 'sm')}${esc(profileOf(r.from).nickname)}<small>· ${lbl[r.score]} · ${ago(r.at)}</small></div>${r.text ? `<p>${esc(r.text)}</p>` : ''}</div>`).join('')}</div>`;
}
function viewMe() {
  let h = navBar('나의 바꿀래') + '<div class="large-title">나의 바꿀래</div><div class="stagger">';
  h += profileBlock(App.me, true);
  const wants = wantsOf(App.me);
  h += `<div class="section"><div class="section-head"><h2>찾는 것</h2><button class="more" data-act="openWants">편집 ${wants.length}/5</button></div><div class="chips">${wants.length ? wants.map(w => `<span class="chip">${esc(wantLabel(w))}</span>`).join('') : '<button class="chip" data-act="openWants">' + I.plus + '찾는 것 등록</button>'}</div></div>`;
  h += `<div class="seg"><button class="${UI.meSeg === 'items' ? 'on' : ''}" data-act="meSeg" data-v="items">내 물건</button><button class="${UI.meSeg === 'reviews' ? 'on' : ''}" data-act="meSeg" data-v="reviews">받은 후기</button></div>`;
  if (UI.meSeg === 'items') { const its = itemsOf(App.me); h += its.length ? gridCards(its) : `<div class="group">${emptyBox('camera', '등록한 물건이 없어요', '안 쓰는 물건을 올리고 필요한 물건과 바꿔 보세요.', '<button class="btn btn-primary btn-sm" data-act="newItem">물건 등록하기</button>')}</div>`; }
  else h += reviewList(App.me);
  h += `<div class="group-label" style="margin-top:12px">설정</div><div class="group">
    <button class="menu-row" data-act="editProfile"><span class="mi" style="background:var(--accent)">${I.pin}</span><span class="ml">내 동네</span><span class="mv">${esc(profileOf(App.me).region)}</span><span class="chev">${I.chev}</span></button>
    <button class="menu-row" data-act="showPolicy"><span class="mi" style="background:var(--contrast)">${I.shield}</span><span class="ml">안전한 교환 가이드</span><span class="chev">${I.chev}</span></button>
    <button class="menu-row danger" data-act="logout"><span class="mi" style="background:var(--bad)">${I.logout}</span><span class="ml">로그아웃</span></button></div></div>`;
  return h;
}

/* ============ 푸시 페이지 ============ */
function pushPage(p) {
  UI.stack.push(p);
  const el = document.createElement('div'); el.className = 'page'; el.dataset.key = p.key = newId();
  $('#pages').appendChild(el);
  renderPage(p, true);
  $('#main').classList.add('under', 'pushed');
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));
  if (p.type === 'challenge') try { history.replaceState(null, '', '#challenge-' + p.id); } catch (e) {}
  $('#fab').classList.add('hidden'); $('#tabbar').classList.add('hidden');
}
function popPage() {
  const p = UI.stack.pop(); if (!p) return;
  const el = $(`.page[data-key="${p.key}"]`);
  if (el) { el.classList.remove('in'); el.classList.add('out'); setTimeout(() => el.remove(), 480); }
  if (!UI.stack.length) { $('#main').classList.remove('pushed'); try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} }
  scheduleRender();
}
function renderPage(p, first) {
  const el = $(`.page[data-key="${p.key}"]`); if (!el) return;
  const old = $('.view', el); const st = old ? old.scrollTop : 0;
  const fn = {item:pageItem, challenge:pageChallenge, user:pageUser}[p.type];
  const out = fn(p.id);
  if (out == null) { el.innerHTML = navBar('', {back:true}) + emptyBox('info', '찾을 수 없어요', '삭제되었거나 아직 불러오는 중이에요.'); return; }
  el.innerHTML = out;
  const v = $('.view', el); if (v) { v.scrollTop = first ? 0 : st; bindScroll(v); initSegs(v); bindGallery(v); }
}
function bindGallery(root) {
  const tr = $('.gallery-track', root); if (!tr) return;
  tr.addEventListener('scroll', () => { const i = Math.round(tr.scrollLeft / tr.clientWidth); $$('.dots i', root).forEach((d, k) => d.classList.toggle('on', k === i)); }, {passive:true});
}

function pageItem(id) {
  const it = itemById(id); if (!it) return null;
  const mine = it.owner === App.me; const p = profileOf(it.owner); const t = tempOf(it.owner);
  const ch = challengeOf(it);
  const photos = it.photos && it.photos.length ? it.photos : null;
  let h = `<div class="view no-tab">${navBar(it.title, {back:true, right: mine ? `<button class="nav-btn" data-act="itemMenu" data-id="${id}" aria-label="더보기">${I.more}</button>` : `<button class="nav-btn" data-act="reportUser" data-id="${it.owner}" aria-label="신고">${I.flag}</button>`})}`;
  h += `<div class="gallery"><div class="gallery-track">${photos ? photos.map(s => `<img src="${s}" alt="">`).join('') : phBox(it.cat)}</div>${photos && photos.length > 1 ? `<div class="dots">${photos.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>` : ''}</div>`;
  h += `<button class="seller" data-act="openUser" data-id="${it.owner}">${avatar(it.owner)}<div><div class="sn">${esc(p.nickname)}${isExample(it.owner) ? ' <span class="tag">예시</span>' : ''}</div><div class="sr">${esc(p.region)}</div></div><div class="temp"><div class="tv num" style="color:${tempColor(t)}">${t.toFixed(1)}°C</div><div class="tb"><i style="width:${Math.min(100, t)}%;background:${tempColor(t)}"></i></div><div class="tl">교환온도</div></div></button>`;
  h += `<div class="detail">`;
  if (ch) h += `<button class="note" style="margin:0 0 14px;width:calc(100%);text-align:left" data-act="openChallenge" data-id="${it.challengeId}">${I.clip}<span>빨간 클립 챌린지 <b>${ch.steps.length}단계</b> 물건이에요. “${esc(ch.title)}” 타임라인 보기</span></button>`;
  h += `<h1>${esc(it.title)}</h1><div class="dm">${CAT_NAME[parentOf(it.cat)]} › ${CAT_NAME[it.cat]} · ${ago(it.createdAt)}</div>`;
  if (it.desc) h += `<div class="dd">${esc(it.desc)}</div>`;
  h += `<div class="specs"><div class="spec"><span class="k">상태</span><span class="v">${COND[it.cond]}</span></div><div class="spec"><span class="k">가치</span><span class="v num">${it.value ? won(it.value) + ' 상당' : '비공개'}</span></div><div class="spec"><span class="k">교환 성향</span><span class="v">${PREF[it.pref] || '가치 상관없음'}</span></div><div class="spec"><span class="k">교환 방식</span><span class="v">${it.methods && it.methods.length ? it.methods.map(m => METHODS[m]).join(' · ') : '협의 가능'}</span></div></div>`;
  if (it.meet) h += `<div class="place"><div class="pmap">${miniMap(it.meet)}</div><div class="pinfo"><div class="pn">${esc(it.meet.name)}<small>대면 교환 희망 장소</small></div><a href="${kakaoMapUrl(it.meet)}" target="_blank" rel="noopener">카카오맵</a></div></div>`;
  const wants = wantsOf(it.owner);
  if (wants.length && !mine) h += `<div style="margin-top:18px"><div class="lbl" style="font-size:14px;font-weight:700;margin:0 4px 8px">${esc(p.nickname)}님이 찾는 것</div><div class="chips wrap">${wants.map(w => `<span class="chip ${itemsOf(App.me).some(mi => mi.status === 'available' && wantMatches(mi, w)) ? 'on-accent' : ''}">${esc(wantLabel(w))}</span>`).join('')}</div></div>`;
  h += `</div></div>`;
  // bottom
  if (mine) {
    const pend = offersFor(id).filter(o => o.target === id && o.status === 'pending').length;
    h += `<div class="bottom-bar"><div class="bb-info"><b>${it.status === 'available' ? '교환 가능' : it.status === 'reserved' ? '예약중' : '교환완료'}</b><span>받은 제안 ${pend}건</span></div><button class="btn btn-gray" data-act="editItem" data-id="${id}">수정</button><button class="btn btn-primary" data-act="tabFromPage" data-tab="offers">제안함 보기</button></div>`;
  } else {
    const sent = offersFor(id).find(o => o.target === id && o.from === App.me && (o.status === 'pending' || o.status === 'accepted'));
    const disabled = it.status !== 'available' || App.readOnly;
    const ex = isExample(it.owner);
    h += `<div class="bottom-bar"><div class="bb-info"><b class="num">${it.value ? won(it.value) : '가치 비공개'}</b><span>${ex ? '예시 물건이라 실제 교환은 안 돼요' : PREF[it.pref] || ''}</span></div>${sent ? '<button class="btn btn-gray" data-act="tabFromPage" data-tab="offers">제안 보냄 · 제안함</button>' : `<button class="btn btn-primary" data-act="proposeOffer" data-id="${id}" ${disabled || ex ? 'disabled' : ''}>${I.swap}교환 제안하기</button>`}</div>`;
  }
  return h;
}

function pageChallenge(id) {
  const c = S.challenges[id]; if (!c) return null;
  const own = c.owner === App.me; const cheered = (c.cheers || []).includes(App.me);
  const cur = itemById(c.currentItemId);
  let h = `<div class="view no-tab">${navBar(c.title, {back:true, right:`<button class="nav-btn" data-act="shareChallenge" data-id="${id}" aria-label="공유 카드">${I.share}</button>`})}`;
  h += `<div class="chero"><span class="tag ${c.status === 'finished' ? 'solid-contrast' : 'accent'}">${c.status === 'finished' ? '완주' : '진행 중'}</span><h1 style="margin-top:10px">${esc(c.title)}</h1>${c.goal ? `<div class="cg">목표 · ${esc(c.goal)}</div>` : ''}<div class="cs"><div><b class="num">${c.steps.length}</b><span>단계</span></div><div><b class="num">${(c.cheers || []).length}</b><span>응원</span></div><div><b class="num">${Math.max(0, Math.ceil((now() - c.createdAt) / 86400000))}</b><span>일째</span></div></div>
    <button class="seller" style="padding:14px 0 0;border:0" data-act="openUser" data-id="${c.owner}">${avatar(c.owner, 'sm')}<div><div class="sn" style="font-size:14px">${esc(profileOf(c.owner).nickname)}</div></div></button></div>`;
  h += `<div class="section-head"><h2>교환 타임라인</h2></div><div class="timeline">`;
  c.steps.forEach((s, i) => {
    h += `<div class="tstep ${i === 0 ? 'start' : ''}" style="animation-delay:${i * 0.06}s"><div class="tnum num">${i + 1}</div><div class="tbody"><div class="ti">${stepImg(s)}</div><div class="tt"><b>${esc(s.title)}</b><span>${i === 0 ? '시작 물건' : esc(profileOf(s.from).nickname) + '님과 교환'} · ${dateStr(s.at)}</span>${s.note ? `<p>${esc(s.note)}</p>` : ''}${own && i > 0 ? `<button class="btn btn-ghost btn-sm" style="padding:0;min-height:28px" data-act="noteStep" data-id="${id}" data-i="${i}">${s.note ? '소감 수정' : '소감 남기기'}</button>` : ''}</div></div></div>`;
  });
  if (c.status === 'active') h += `<div class="tstep"><div class="tnum num" style="background:var(--surface-2);color:var(--muted)">${c.steps.length + 1}</div><div class="tbody tnext"><div class="tt"><b>다음엔 무엇으로 바뀔까요?</b><span>${cur ? '아래 물건에 교환을 제안해 보세요' : own ? '받은 물건을 등록하면 챌린지가 이어져요' : '진행자가 다음 물건을 준비하고 있어요'}</span></div></div></div>`;
  h += `</div>`;
  if (cur && c.status === 'active') h += `<div class="section-head" style="margin-top:6px"><h2>지금 교환할 수 있는 물건</h2></div><div class="group">${itemRow(cur)}</div>`;
  if (own && c.status === 'active') h += `<div style="padding:18px 16px 0;display:flex;flex-direction:column;gap:8px">${c.awaitingNext ? `<button class="btn btn-primary btn-block" data-act="continueChallenge" data-id="${id}">${I.plus}받은 물건으로 이어가기</button>` : ''}<button class="btn btn-gray btn-block" data-act="finishChallenge" data-id="${id}">${I.trophy}챌린지 완주하기</button></div>`;
  h += `</div><div class="bottom-bar"><button class="icon-btn ${cheered ? 'on' : ''}" data-act="cheer" data-id="${id}" aria-label="응원하기">${cheered ? I.heartF : I.heart}</button><div class="bb-info"><b class="num">응원 ${(c.cheers || []).length}</b><span>${cheered ? '응원하고 있어요' : '하트로 응원해 주세요'}</span></div>${cur && !own && c.status === 'active' && cur.status === 'available' ? `<button class="btn btn-primary" data-act="proposeOffer" data-id="${cur.id}" ${App.readOnly ? 'disabled' : ''}>${I.swap}교환 제안하기</button>` : ''}</div>`;
  return h;
}

function pageUser(id) {
  if (!S.profiles[id]) return null;
  const own = id === App.me; const p = profileOf(id);
  let h = `<div class="view no-tab">${navBar(p.nickname, {back:true, right: own ? '' : `<button class="nav-btn" data-act="reportUser" data-id="${id}" aria-label="신고">${I.flag}</button>`})}`;
  h += profileBlock(id, false);
  const wants = wantsOf(id);
  if (wants.length) h += `<div class="section"><div class="section-head"><h2>찾는 것</h2></div><div class="chips">${wants.map(w => `<span class="chip">${esc(wantLabel(w))}</span>`).join('')}</div></div>`;
  const its = itemsOf(id);
  h += `<div class="section"><div class="section-head"><h2>교환 물건</h2><span class="more">${its.length}개</span></div>${its.length ? gridCards(its) : `<div class="group">${emptyBox('camera', '등록한 물건이 없어요', '')}</div>`}</div>`;
  h += `<div class="section"><div class="section-head"><h2>받은 후기</h2></div>${reviewList(id)}</div></div>`;
  return h;
}

/* ============ 시트 / 다이얼로그 / 토스트 ============ */
function openSheet({title, body, foot = '', full = false, onMount, left = '', right = ''}) {
  const bd = document.createElement('div'); bd.className = 'backdrop';
  const sh = document.createElement('div'); sh.className = 'sheet' + (full ? ' full' : '');
  sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-label', title || '');
  sh.innerHTML = `<div class="sheet-grab"><i></i></div><div class="sheet-head">${left || `<button class="nav-btn" data-act="closeSheet" aria-label="닫기">${I.close}</button>`}<h3>${esc(title || '')}</h3>${right || '<span class="nav-spacer"></span>'}</div><div class="sheet-body">${body}</div>${foot ? `<div class="sheet-foot">${foot}</div>` : ''}`;
  $('#app').append(bd, sh);
  sh._bd = bd;
  requestAnimationFrame(() => requestAnimationFrame(() => { bd.classList.add('in'); sh.classList.add('in'); }));
  bd.addEventListener('click', () => closeSheet(sh));
  // drag to dismiss
  const grab = $('.sheet-grab', sh); let y0 = null, dy = 0;
  grab.addEventListener('pointerdown', e => { y0 = e.clientY; dy = 0; sh.classList.add('dragging'); grab.setPointerCapture(e.pointerId); });
  grab.addEventListener('pointermove', e => { if (y0 == null) return; dy = Math.max(0, e.clientY - y0); sh.style.transform = `translateY(${dy}px)`; });
  const end = () => { if (y0 == null) return; y0 = null; sh.classList.remove('dragging'); sh.style.transform = ''; if (dy > 110) closeSheet(sh); };
  grab.addEventListener('pointerup', end); grab.addEventListener('pointercancel', end);
  if (onMount) onMount(sh);
  return sh;
}
function closeSheet(sh) {
  sh = sh || $$('.sheet').pop(); if (!sh || sh._closing) return; sh._closing = true;
  sh.classList.remove('in'); sh._bd.classList.remove('in');
  if (sh._onClose) sh._onClose();
  setTimeout(() => { sh.remove(); sh._bd.remove(); }, 450);
}
function confirmDialog(title, msg, okLabel = '확인', danger = false) {
  return new Promise(res => {
    const bd = document.createElement('div'); bd.className = 'backdrop'; bd.style.zIndex = 90;
    const d = document.createElement('div'); d.className = 'dialog'; d.setAttribute('role', 'alertdialog');
    d.innerHTML = `<div class="dt">${esc(title)}</div>${msg ? `<div class="dm">${esc(msg)}</div>` : ''}<div class="da"><button data-r="0">취소</button><button data-r="1" class="strong ${danger ? 'danger' : ''}">${esc(okLabel)}</button></div>`;
    $('#app').append(bd, d);
    requestAnimationFrame(() => { bd.classList.add('in'); d.classList.add('in'); });
    const done = v => { d.classList.remove('in'); bd.classList.remove('in'); setTimeout(() => { d.remove(); bd.remove(); }, 300); res(v); };
    d.addEventListener('click', e => { const b = e.target.closest('button'); if (b) done(b.dataset.r === '1'); });
    bd.addEventListener('click', () => done(false));
    setTimeout(() => $('button.strong', d).focus(), 50);
  });
}
let toastT;
function toast(msg) {
  let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); $('#app').appendChild(t); }
  t.textContent = msg; requestAnimationFrame(() => t.classList.add('in'));
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('in'), 2600);
}
function guardWrite() { if (App.readOnly) { toast('보기 전용이라 저장할 수 없어요.'); return false; } return true; }

/* ============ 인증 (로그인 · 회원가입 · 온보딩) ============ */
const OB = {step:0, nickname:'', region:'', wants:[], agree:[false, false, false]};
function renderAuth() {
  let a = $('#auth'); if (!a) { a = document.createElement('div'); a.id = 'auth'; a.className = 'auth'; $('#app').appendChild(a); }
  $('#fab').classList.add('hidden'); $('#tabbar').classList.add('hidden');
  if (a.dataset.mode === 'onboard' || a.dataset.mode === 'form') return;
  a.dataset.mode = 'welcome';
  a.innerHTML = `<div class="auth-hero"><div class="logo">${I.swap}</div><h1>돈 말고 물건으로,<br>딱 맞는 교환 상대</h1><p class="lead" style="margin:0">가진 것과 찾는 것을 등록하면<br>서로 원하는 사람을 이어드려요.</p>
    <div class="auth-feats"><div class="auth-feat"><i style="background:var(--accent-soft);color:var(--accent-text)">${I.sparkle}</i>서로 찾던 물건끼리 자동 매칭</div><div class="auth-feat"><i style="background:var(--contrast-soft);color:var(--contrast-text)">${I.pin}</i>대면 · 문고리 · 택배, 원하는 방식으로</div><div class="auth-feat"><i style="background:var(--surface-2);color:var(--text)">${I.clip}</i>볼펜 하나로 시작하는 빨간 클립 챌린지</div></div></div>
    <div class="auth-actions"><button class="btn btn-primary btn-block" data-act="signup">시작하기 · 회원가입</button><button class="btn btn-gray btn-block" data-act="login">이미 가입했어요 · 로그인</button></div>
    <div class="auth-foot">로그인은 Supabase 인증으로 안전하게 처리돼요.</div>`;
}
function renderAuthForm(kind) {
  let a = $('#auth'); if (!a) { renderAuth(); a = $('#auth'); }
  a.dataset.mode = 'form';
  const up = kind === 'signup';
  a.innerHTML = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:22px"><button class="nav-btn" data-act="authBack" aria-label="뒤로">${I.back}</button></div>
    <div class="ob-step" style="flex:1"><h2>${up ? '이메일로<br>가입하기' : '다시 만나서<br>반가워요'}</h2><p class="lead">${up ? '로그인할 때 쓸 이메일과 비밀번호를 정해 주세요.' : '가입한 이메일과 비밀번호를 입력해 주세요.'}</p>
    <form id="authForm" novalidate>
      <div class="field"><label for="aEmail">이메일</label><input class="input" id="aEmail" type="email" inputmode="email" autocomplete="email" placeholder="name@example.com"></div>
      <div class="field"><label for="aPw">비밀번호${up ? ' <small>8자 이상</small>' : ''}</label><input class="input" id="aPw" type="password" autocomplete="${up ? 'new-password' : 'current-password'}"></div>
      ${up ? '<div class="field"><label for="aPw2">비밀번호 확인</label><input class="input" id="aPw2" type="password" autocomplete="new-password"></div>' : ''}
      <div class="hint err" id="aErr" role="alert"></div>
      <button class="btn btn-primary btn-block" type="submit" id="aSubmit" style="margin-top:14px">${up ? '가입하고 프로필 만들기' : '로그인'}</button>
    </form>
    <button class="btn btn-ghost btn-block" data-act="${up ? 'login' : 'signup'}" style="margin-top:8px">${up ? '이미 가입했어요 · 로그인' : '처음이에요 · 회원가입'}</button></div>`;
  setTimeout(() => { const el = $('#aEmail'); el && el.focus(); }, 300);
  $('#authForm').addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('#aEmail').value.trim(), pw = $('#aPw').value, err = $('#aErr');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = '이메일 형식을 확인해 주세요.'; return; }
    if (pw.length < 8) { err.textContent = '비밀번호는 8자 이상이어야 해요.'; return; }
    if (up && pw !== $('#aPw2').value) { err.textContent = '비밀번호가 서로 달라요.'; return; }
    const btn = $('#aSubmit'); btn.disabled = true; err.textContent = '';
    try {
      let user;
      if (up) {
        const data = await q(sb.auth.signUp({email, password:pw, options:{emailRedirectTo:location.origin + location.pathname}}));
        if (data.user && Array.isArray(data.user.identities) && !data.user.identities.length) throw new Error('User already registered');
        if (!data.session) {
          $('#authForm').innerHTML = `<div class="note contrast" style="margin:0">${I.info}<span><b>${esc(email)}</b>로 인증 메일을 보냈어요. 메일의 링크를 누르면 이 화면으로 돌아와 프로필 만들기를 이어서 할 수 있어요.</span></div>`;
          return;
        }
        user = data.user;
      } else {
        user = (await q(sb.auth.signInWithPassword({email, password:pw}))).user;
      }
      await enterSession(user);
      if (S.profiles[App.me]) leaveAuth(`${profileOf(App.me).nickname}님, 반가워요!`);
      else { OB.step = 0; renderOnboard(); }
    } catch (ex) { err.textContent = krError(ex); btn.disabled = false; }
  });
}
function leaveAuth(msg) {
  const a = $('#auth'); UI.tab = 'home'; UI.enterTab = true;
  if (!a) { render(); if (msg) toast(msg); return; }
  a.dataset.leaving = '1'; a.style.transition = 'opacity .4s, transform .5s var(--spring)'; a.style.opacity = 0; a.style.transform = 'scale(1.04)';
  render();
  setTimeout(() => { a.remove(); render(); if (msg) toast(msg); }, 350);
}
function renderOnboard() {
  const a = $('#auth'); a.dataset.mode = 'onboard';
  const s = OB.step;
  let body = '';
  if (s === 0) body = `<h2>반가워요!<br>어떻게 불러드릴까요?</h2><p class="lead">교환할 때 상대에게 보이는 닉네임이에요.</p><div class="field"><input class="input" id="obNick" maxlength="10" placeholder="2~10자 닉네임" value="${esc(OB.nickname)}" autocomplete="nickname"><div class="hint" id="obNickHint">한글, 영문, 숫자로 2~10자</div></div>`;
  else if (s === 1) body = `<h2>어느 동네에서<br>교환하시나요?</h2><p class="lead">가까운 이웃의 물건을 먼저 보여드려요.</p><div class="region-grid">${REGIONS.map(r => `<button class="chip ${OB.region === r ? 'on-accent' : ''}" data-act="obRegion" data-v="${esc(r)}">${esc(r)}</button>`).join('')}</div>`;
  else if (s === 2) body = `<h2>찾고 있는 물건이<br>있나요?</h2><p class="lead">나중에 등록해도 괜찮아요. 최대 5개까지 고를 수 있어요.</p><div class="chips wrap">${CATS.map(c => c.subs.map(([id, n]) => { const on = OB.wants.some(w => w.c === id); return `<button class="chip ${on ? 'on-accent' : ''}" data-act="obWant" data-v="${id}">${n}</button>`; }).join('')).join('')}</div>`;
  else body = `<h2>마지막으로<br>약속해 주세요</h2><p class="lead">모두가 믿고 교환할 수 있도록 지켜야 할 것들이에요.</p>${[['이용약관 동의 (필수)', '교환은 당사자 간 거래이며 바꿀래는 중개하지 않아요.'], ['개인정보 처리 동의 (필수)', '닉네임·동네·등록 물건만 저장해요. 주소는 저장하지 않아요.'], ['안전 교환 약속 (필수)', '대면은 역·카페 같은 공공장소에서, 현금 거래는 하지 않아요.']].map(([b, t], i) => `<button class="check-row ${OB.agree[i] ? 'on' : ''}" data-act="obAgree" data-i="${i}"><span class="cbox">${I.check}</span><span><b>${b}</b><span>${t}</span></span></button>`).join('')}`;
  const can = s === 0 ? validNick(OB.nickname) === '' : s === 1 ? !!OB.region : s === 2 ? true : OB.agree.every(Boolean);
  a.innerHTML = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px"><button class="nav-btn" data-act="obBack" aria-label="뒤로">${I.back}</button></div><div class="steps-dots">${[0, 1, 2, 3].map(i => `<i class="${i <= s ? 'on' : ''}"></i>`).join('')}</div><div class="ob-step" style="flex:1">${body}</div><div class="auth-actions" style="margin-top:20px;animation:none">${s === 2 ? `<button class="btn btn-primary btn-block" data-act="obNext">${OB.wants.length ? OB.wants.length + '개 선택 · 다음' : '건너뛰기'}</button>` : `<button class="btn btn-primary btn-block" data-act="obNext" ${can ? '' : 'disabled'}>${s === 3 ? '가입 완료' : '다음'}</button>`}</div>`;
  if (s === 0) { const inp = $('#obNick'); setTimeout(() => inp.focus(), 300); inp.addEventListener('input', () => { OB.nickname = inp.value; const err = validNick(inp.value); const h = $('#obNickHint'); h.textContent = err || '좋은 닉네임이에요!'; h.classList.toggle('err', !!err && inp.value.length > 0); $('[data-act="obNext"]').disabled = !!err; }); inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !validNick(inp.value)) ACT.obNext(); }); }
}
function validNick(v, self) {
  v = (v || '').trim();
  if (v.length < 2 || v.length > 10) return '2~10자로 입력해 주세요';
  if (!/^[가-힣a-zA-Z0-9]+$/.test(v)) return '한글, 영문, 숫자만 쓸 수 있어요';
  if (Object.entries(S.profiles).some(([id, p]) => id !== self && p.nickname === v)) return '이미 쓰고 있는 닉네임이에요';
  return '';
}

/* ============ 액션 ============ */
const ACT = {
  tab(d) { if (UI.tab !== d.tab) { UI.tab = d.tab; UI.enterTab = true; } render(); },
  tabFromPage(d) { while (UI.stack.length) popPage(); UI.tab = d.tab; UI.enterTab = true; render(); },
  back() { popPage(); },
  closeSheet(d, el) { closeSheet(el.closest('.sheet')); },
  homeSeg(d) { UI.homeSeg = d.v; UI.enterTab = true; render(); },
  offerSeg(d) { UI.offerSeg = d.v; render(); },
  chalSeg(d) { UI.chalSeg = d.v; render(); },
  meSeg(d) { UI.meSeg = d.v; render(); },
  fCat(d) { UI.filterCat = +d.v; render(); },
  fMethod(d) { UI.filterMethod = d.v; render(); },
  openItem(d) { if (!S.items[d.id]) return toast('삭제된 물건이에요.'); pushPage({type:'item', id:d.id}); },
  openChallenge(d) { pushPage({type:'challenge', id:d.id}); },
  openUser(d) { if (d.id === App.me && !UI.stack.length) { UI.tab = 'me'; render(); return; } pushPage({type:'user', id:d.id}); },
  newItem() { if (guardWrite()) openItemForm(); },
  editItem(d) { openItemForm(itemById(d.id)); },
  openWants() { openWantsSheet(); },
  editProfile() { openProfileSheet(); },
  proposeOffer(d) { if (guardWrite()) openOfferSheet(d.id); },
  acceptOffer(d) { openAcceptSheet(d.id); },
  async rejectOffer(d) { if (await confirmDialog('제안을 거절할까요?', '상대에게 거절됐다고 표시돼요.', '거절', true)) { await Store.patch('offers', d.id, {status:'rejected', updatedAt:now()}); toast('제안을 거절했어요.'); } },
  async cancelOffer(d) { if (await confirmDialog('제안을 취소할까요?', '', '제안 취소', true)) { await Store.patch('offers', d.id, {status:'cancelled', updatedAt:now()}); toast('제안을 취소했어요.'); } },
  async completeOffer(d) { if (await confirmDialog('교환을 마쳤나요?', '양쪽 모두 완료를 누르면 교환이 확정돼요.', '교환 완료')) completeOffer(d.id); },
  reviewOffer(d) { openReviewSheet(d.id); },
  itemMenu(d) { openItemMenu(d.id); },
  reportUser(d) { openReportSheet(d.id); },
  startChallenge() { if (!guardWrite()) return; if (myActiveChallenge()) return toast('진행 중인 챌린지는 하나만 가질 수 있어요.'); openItemForm(null, {newChallenge:true}); },
  continueChallenge(d) { const c = S.challenges[d.id]; const last = c.steps[c.steps.length - 1]; openItemForm(null, {challengeId:d.id, prefill:{title:last.title, cat:last.cat, photos:last.full ? [last.full] : []}}); },
  async finishChallenge(d) { if (await confirmDialog('챌린지를 완주할까요?', '완주하면 더 이상 단계를 이어갈 수 없어요.', '완주하기')) { await Store.patch('challenges', d.id, {status:'finished', finishedAt:now()}); celebrate(); toast('완주를 축하해요!'); } },
  async cheer(d, el) { if (!guardWrite()) return; const c = S.challenges[d.id]; const ch = new Set(c.cheers || []); ch.has(App.me) ? ch.delete(App.me) : ch.add(App.me); el.classList.add('beat'); putLocal('challenges', d.id, {...c, cheers:[...ch]}); try { await Store.rpc('toggle_cheer', {p_challenge:d.id}); } catch (e) { putLocal('challenges', d.id, c); } },
  noteStep(d) { openStepNote(d.id, +d.i); },
  shareChallenge(d) { openShareCard(d.id); },
  showPolicy() { openSheet({title:'안전한 교환 가이드', body:`<div class="group" style="margin:0">${[['대면은 공공장소에서', '역 출구, 카페처럼 사람이 많은 곳에서 만나요. 지도에서 고른 장소가 그대로 공유돼요.'], ['주소는 오픈채팅에서만', '문고리·택배 주소는 앱에 저장하지 않아요. 수락 후 오픈채팅에서 주고받아요.'], ['기프티콘·현금은 교환하지 않아요', '현금과 같은 가치의 교환권은 현재 등록할 수 없어요.'], ['이상하면 신고하기', '프로필이나 물건 상세의 깃발 버튼으로 신고할 수 있어요.']].map(([b, t]) => `<div class="spec" style="display:block"><b style="display:block;font-size:15px">${b}</b><span style="color:var(--muted);font-size:14px">${t}</span></div>`).join('')}</div>`}); },
  async logout() { if (await confirmDialog('로그아웃할까요?', '', '로그아웃', true)) { await signOut(); toast('로그아웃했어요.'); } },
  login() { renderAuthForm('login'); },
  signup() { renderAuthForm('signup'); },
  authBack() { const a = $('#auth'); if (a) a.dataset.mode = ''; renderAuth(); },
  async obBack() {
    if (OB.step > 0) { OB.step--; renderOnboard(); return; }
    if (await confirmDialog('가입을 그만둘까요?', '로그아웃되고, 다음에 로그인하면 프로필 만들기부터 이어서 할 수 있어요.', '그만두기', true)) { await signOut(); }
  },
  obRegion(d) { OB.region = d.v; renderOnboard(); },
  obWant(d) { const c = +d.v; const i = OB.wants.findIndex(w => w.c === c); if (i >= 0) OB.wants.splice(i, 1); else if (OB.wants.length < 5) OB.wants.push({t:'cat', c}); else toast('최대 5개까지 고를 수 있어요.'); renderOnboard(); },
  obAgree(d) { OB.agree[+d.i] = !OB.agree[+d.i]; renderOnboard(); },
  async obNext() {
    if (OB.step < 3) { OB.step++; renderOnboard(); return; }
    const btn = $('[data-act="obNext"]'); btn.disabled = true; btn.textContent = '가입하는 중…';
    try {
      const nick = OB.nickname.trim();
      await Store.set('profiles', App.me, {nickname:nick, region:OB.region, wants:OB.wants, tradeCount:0, createdAt:now(), agreedAt:now()});
      leaveAuth(`${nick}님, 환영해요!`);
    } catch (e) { btn.disabled = false; btn.textContent = '가입 완료'; }
  }
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = ACT[el.dataset.act]; if (!fn) return;
  e.preventDefault(); fn(el.dataset, el);
});
document.addEventListener('click', e => { const t = e.target.closest('.tab'); if (t) ACT.tab({tab:t.dataset.tab}); });

/* ============ 이미지 ============ */
function loadImage(src) { return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; }); }
async function shrink(src, max, q = 0.72) {
  const im = await loadImage(src);
  const r = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
  const c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * r); c.height = Math.round(im.naturalHeight * r);
  c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', q);
}
async function fileToData(file) { const url = URL.createObjectURL(file); try { return await shrink(url, 560, 0.7); } finally { URL.revokeObjectURL(url); } }

/* ============ 물건 등록·수정 ============ */
function openItemForm(item, opts = {}) {
  const editing = !!item;
  const f = editing ? {...item, photos:[...(item.photos || [])], methods:[...(item.methods || [])]} : {title:'', desc:'', cat:0, cond:'used', value:'', hideValue:false, pref:'any', methods:[], meet:null, photos:[], ...(opts.prefill || {})};
  if (editing) f.hideValue = !item.value;
  if (opts.prefill && opts.prefill.cat) f.cat = opts.prefill.cat;
  const chal = opts.newChallenge;
  const title = editing ? '물건 수정' : chal ? '챌린지 시작하기' : opts.challengeId ? '챌린지 다음 물건' : '물건 등록';
  const body = `
    ${chal ? `<div class="note">${I.clip}<span>작은 물건 하나로 시작해요. 교환이 완료될 때마다 받은 물건이 타임라인에 자동으로 쌓여요.</span></div>
    <div class="field"><label for="fChTitle">챌린지 이름</label><input class="input" id="fChTitle" maxlength="30" placeholder="예: 볼펜 한 자루로 에어팟까지"></div>
    <div class="field"><label for="fChGoal">목표 물건 <small>선택</small></label><input class="input" id="fChGoal" maxlength="30" placeholder="예: 에어팟"></div>
    <div class="lbl" style="font-size:17px;font-weight:800;margin:26px 4px 14px">시작 물건</div>` : ''}
    ${opts.challengeId ? `<div class="note">${I.clip}<span>교환으로 받은 물건이에요. 등록하면 챌린지의 지금 교환할 물건이 돼요.</span></div>` : ''}
    <div class="field"><div class="lbl">사진 <small><span id="pCount">${f.photos.length}</span>/4 · 첫 장이 대표</small></div><div class="photos" id="fPhotos"></div><input type="file" id="fFile" accept="image/*" multiple hidden></div>
    <div class="field"><label for="fTitle">제목</label><input class="input" id="fTitle" maxlength="40" placeholder="예: 미개봉 쿠션 팩트 21호" value="${esc(f.title)}"></div>
    <div class="field"><div class="lbl">카테고리</div><div class="chips wrap" id="fCatTop">${CATS.map(c => `<button class="chip" data-top="${c.id}">${c.n}</button>`).join('')}</div><div class="chips wrap" id="fCatSub" style="margin-top:8px"></div></div>
    <div class="field"><div class="lbl">상태</div><div class="seg in-form" id="fCond">${Object.entries(COND).map(([k, v]) => `<button type="button" data-v="${k}" class="${f.cond === k ? 'on' : ''}">${v}</button>`).join('')}</div></div>
    <div class="field"><div class="lbl">가치</div><div class="toggle-row" style="margin-bottom:8px"><span>가치 표기 안 함</span><button type="button" class="switch ${f.hideValue ? 'on' : ''}" id="fHide" role="switch" aria-checked="${f.hideValue}" aria-label="가치 표기 안 함"></button></div><div class="input-wrap" id="fValueWrap" style="${f.hideValue ? 'display:none' : ''}"><input class="input num" id="fValue" inputmode="numeric" placeholder="예상 가치" value="${f.value ? Number(f.value).toLocaleString('ko-KR') : ''}"><span class="suffix">원</span></div></div>
    <div class="field"><div class="lbl">교환 성향</div><div class="seg in-form" id="fPref">${Object.entries(PREF).map(([k, v]) => `<button type="button" data-v="${k}" class="${f.pref === k ? 'on' : ''}">${v}</button>`).join('')}</div></div>
    <div class="field"><div class="lbl">교환 방식 <small>선택 사항 · 여러 개 가능</small></div><div class="method-cards" id="fMethods">${Object.entries(METHODS).map(([k, v]) => `<button type="button" class="mc ${f.methods.includes(k) ? 'on' : ''}" data-v="${k}" aria-pressed="${f.methods.includes(k)}">${I[k]}${v}<small>${METHOD_DESC[k]}</small></button>`).join('')}</div><div id="fMeetBox"></div><div class="hint" id="fMethodHint"></div></div>
    <div class="field"><label for="fDesc">설명 <small>선택</small></label><textarea class="textarea" id="fDesc" maxlength="1000" placeholder="물건 상태, 구매 시기, 원하는 교환 물건을 적어 주세요.">${esc(f.desc)}</textarea></div>`;
  const sh = openSheet({title, body, full:true, foot:`<button class="btn btn-primary btn-block" id="fSave">${editing ? '수정 완료' : chal ? '챌린지 시작' : '등록하기'}</button>`, onMount(sh) {
    const drawPhotos = () => {
      $('#fPhotos', sh).innerHTML = (f.photos.length < 4 ? `<button type="button" class="photo-add" id="fAdd">${I.camera}<span>${f.photos.length}/4</span></button>` : '') + f.photos.map((p, i) => `<div class="photo"><img src="${p}" alt="사진 ${i + 1}"><button type="button" data-rm="${i}" aria-label="사진 삭제">${I.close}</button>${i === 0 ? '<span class="cover">대표</span>' : ''}</div>`).join('');
      $('#pCount', sh).textContent = f.photos.length;
    };
    drawPhotos();
    $('#fPhotos', sh).addEventListener('click', e => { if (e.target.closest('#fAdd')) $('#fFile', sh).click(); const rm = e.target.closest('[data-rm]'); if (rm) { f.photos.splice(+rm.dataset.rm, 1); drawPhotos(); } });
    $('#fFile', sh).addEventListener('change', async e => { const files = [...e.target.files].slice(0, 4 - f.photos.length); for (const file of files) { try { f.photos.push(await fileToData(file)); drawPhotos(); } catch (er) { toast('사진을 읽지 못했어요. 다른 사진을 골라 주세요.'); } } e.target.value = ''; });
    let top = f.cat ? parentOf(f.cat) : 0;
    const drawCat = () => {
      $$('#fCatTop .chip', sh).forEach(b => b.classList.toggle('on', +b.dataset.top === top));
      const c = CATS.find(x => x.id === top);
      $('#fCatSub', sh).innerHTML = c ? c.subs.map(([id, n]) => `<button type="button" class="chip ${f.cat === id ? 'on-accent' : ''}" data-sub="${id}">${n}</button>`).join('') : '<span class="hint" style="margin:0">대분류를 먼저 골라 주세요</span>';
    };
    drawCat();
    $('#fCatTop', sh).addEventListener('click', e => { const b = e.target.closest('[data-top]'); if (b) { top = +b.dataset.top; if (parentOf(f.cat) !== top) f.cat = 0; drawCat(); } });
    $('#fCatSub', sh).addEventListener('click', e => { const b = e.target.closest('[data-sub]'); if (b) { f.cat = +b.dataset.sub; drawCat(); } });
    const segPick = (id, key) => $(id, sh).addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; f[key] = b.dataset.v; $$('button', $(id, sh)).forEach(x => x.classList.toggle('on', x === b)); initSegs(sh); });
    segPick('#fCond', 'cond'); segPick('#fPref', 'pref'); initSegs(sh);
    $('#fHide', sh).addEventListener('click', e => { f.hideValue = !f.hideValue; e.currentTarget.classList.toggle('on', f.hideValue); e.currentTarget.setAttribute('aria-checked', f.hideValue); $('#fValueWrap', sh).style.display = f.hideValue ? 'none' : ''; });
    $('#fValue', sh).addEventListener('input', e => { const n = e.target.value.replace(/[^0-9]/g, '').slice(0, 9); e.target.value = n ? Number(n).toLocaleString('ko-KR') : ''; });
    const drawMeet = () => {
      const box = $('#fMeetBox', sh);
      if (!f.methods.includes('meet')) { box.innerHTML = ''; $('#fMethodHint', sh).textContent = f.methods.length ? '' : '고르지 않으면 ‘협의 가능’으로 표시돼요.'; return; }
      $('#fMethodHint', sh).textContent = '';
      box.innerHTML = `<button type="button" class="place-pick" id="fMeetPick"><span class="pp-ic">${I.pin}</span><span style="flex:1;min-width:0"><b>${f.meet ? esc(f.meet.name) : '만남 장소를 지도에서 고르기'}</b><span>${f.meet ? '탭해서 다시 고를 수 있어요' : '역·카페 같은 공공장소를 추천해요'}</span></span><span class="chev" style="color:var(--muted)">${I.chev}</span></button>${f.meet ? `<div class="place" style="margin-top:8px"><div class="pmap" style="height:120px">${miniMap(f.meet)}</div></div>` : ''}`;
      $('#fMeetPick', sh).addEventListener('click', () => openMapPicker(f.meet, profileOf(App.me).region, m => { f.meet = m; drawMeet(); }));
    };
    drawMeet();
    $('#fMethods', sh).addEventListener('click', e => { const b = e.target.closest('.mc'); if (!b) return; const k = b.dataset.v; const i = f.methods.indexOf(k); if (i >= 0) f.methods.splice(i, 1); else f.methods.push(k); b.classList.toggle('on', i < 0); b.setAttribute('aria-pressed', i < 0); if (k === 'meet' && i < 0 && !f.meet) setTimeout(() => openMapPicker(null, profileOf(App.me).region, m => { f.meet = m; drawMeet(); }), 150); drawMeet(); });
    $('#fSave', sh).addEventListener('click', async () => {
      f.title = $('#fTitle', sh).value.trim(); f.desc = $('#fDesc', sh).value.trim();
      const val = f.hideValue ? 0 : +($('#fValue', sh).value.replace(/[^0-9]/g, '') || 0);
      const chTitle = chal ? $('#fChTitle', sh).value.trim() : '';
      if (chal && !chTitle) return toast('챌린지 이름을 입력해 주세요.');
      if (!f.title) return toast('제목을 입력해 주세요.');
      if (!f.cat) return toast('카테고리를 골라 주세요.');
      if (f.methods.includes('meet') && !f.meet) return toast('대면 교환 장소를 지도에서 골라 주세요.');
      const btn = $('#fSave', sh); btn.disabled = true; btn.textContent = '저장하는 중…';
      const data = {owner:editing ? item.owner : App.me, title:f.title, desc:f.desc, cat:f.cat, cond:f.cond, value:val || 0, pref:f.pref, methods:f.methods, meet:f.methods.includes('meet') ? f.meet : null, photos:f.photos, region:profileOf(App.me).region, status:editing ? item.status : 'available', createdAt:editing ? item.createdAt : now(), challengeId:editing ? (item.challengeId || null) : (opts.challengeId || null)};
      try {
        if (editing) { await Store.set('items', item.id, data); toast('수정했어요.'); closeSheet(sh); return; }
        const id = newId();
        if (chal) {
          const cid = newId(); data.challengeId = cid;
          const img = f.photos[0] ? await shrink(f.photos[0], 160, 0.7) : null;
          await Store.set('challenges', cid, {owner:App.me, title:chTitle, goal:$('#fChGoal', sh).value.trim(), status:'active', createdAt:now(), cheers:[], currentItemId:id, awaitingNext:false, steps:[{title:f.title, cat:f.cat, img, at:now(), from:App.me}]});
          await Store.set('items', id, data);
          closeSheet(sh); toast('챌린지를 시작했어요!'); UI.tab = 'challenge'; setTimeout(() => pushPage({type:'challenge', id:cid}), 350); return;
        }
        await Store.set('items', id, data);
        if (opts.challengeId) { await Store.patch('challenges', opts.challengeId, {currentItemId:id, awaitingNext:false, awaitingOffer:null}); toast('챌린지가 다음 단계로 이어졌어요!'); }
        else toast('등록했어요!');
        closeSheet(sh);
        setTimeout(() => pushPage({type:'item', id}), 300);
      } catch (e) { btn.disabled = false; btn.textContent = editing ? '수정 완료' : '등록하기'; }
    });
  }});
  return sh;
}
function openItemMenu(id) {
  const it = itemById(id);
  const sh = openSheet({title:'물건 관리', body:`<div class="group" style="margin:0">
    <button class="menu-row" data-m="edit"><span class="mi" style="background:var(--contrast)">${I.edit}</span><span class="ml">수정하기</span></button>
    ${it.status === 'available' ? `<button class="menu-row danger" data-m="del"><span class="mi" style="background:var(--bad)">${I.close}</span><span class="ml">삭제하기</span></button>` : ''}</div>`, onMount(sh) {
      sh.addEventListener('click', async e => {
        const b = e.target.closest('[data-m]'); if (!b) return;
        if (b.dataset.m === 'edit') { closeSheet(sh); openItemForm(it); }
        if (b.dataset.m === 'del') {
          if (it.challengeId && S.challenges[it.challengeId] && S.challenges[it.challengeId].currentItemId === id) return toast('챌린지 진행 중인 물건은 삭제할 수 없어요.');
          if (!(await confirmDialog('물건을 삭제할까요?', '대기 중인 제안은 모두 취소돼요.', '삭제', true))) return;
          closeSheet(sh);
          for (const o of offersFor(id).filter(o => o.status === 'pending')) { try { await Store.patch('offers', o.id, {status:o.from === App.me ? 'cancelled' : 'rejected', updatedAt:now()}); } catch (e) {} }
          await Store.del('items', id); popPage(); toast('삭제했어요.');
        }
      });
    }});
}

/* ============ 지도 선택 (카카오맵, 방문자 브라우저에서 그림) ============ */
function openMapPicker(initial, region, onPick) {
  let pick = initial ? {...initial} : null; let nameEdited = false;
  const center = initial ? [initial.lat, initial.lng] : CENT[region] || SEOUL_CENTER;
  openSheet({title:'만남 장소 선택', full:true, body:'', onMount(sh) {
    const b = $('.sheet-body', sh); b.style.cssText = 'padding:0;display:flex;flex-direction:column;overflow:hidden';
    b.innerHTML = `<div class="map-wrap"><div id="pickmap" aria-label="지도에서 위치를 눌러 고르세요"></div><div class="map-search"><span class="si">${I.search}</span><input class="input" id="mapQ" placeholder="${KAKAO_READY ? '장소, 역, 주소로 검색' : '역 이름이나 구 이름으로 찾기'}" autocomplete="off"><div class="map-results" id="mapR" hidden></div></div><div class="map-hint" id="mapHint">${KAKAO_READY ? '지도를 눌러 위치를 고르세요' : '간이 지도예요 · 지도를 눌러 위치를 고르세요'}</div></div>
      <div class="map-panel"><div class="field" style="margin-bottom:12px"><label for="mapName">장소 이름 <small>상대에게 보여요</small></label><input class="input" id="mapName" maxlength="30" placeholder="지도를 누르면 자동으로 채워져요" value="${pick ? esc(pick.name) : ''}"></div><button class="btn btn-primary btn-block" id="mapOk" ${pick ? '' : 'disabled'}>이 위치로 정하기</button></div>`;
    const setPick = (lat, lng, name) => {
      const guess = placeName(lat, lng);
      pick = {lat, lng, name:name || guess}; nameEdited = false;
      $('#mapName', sh).value = pick.name; $('#mapOk', sh).disabled = false; $('#mapHint', sh).textContent = '핀을 끌어서 옮길 수도 있어요';
      api.setPin(lat, lng);
      // 역 근처가 아니면 카카오 주소 변환으로 이름을 다듬어요
      if (!name && !guess.endsWith('역 근처') && api.lookupName) api.lookupName(lat, lng, n => { if (n && !nameEdited && pick && pick.lat === lat && pick.lng === lng) { pick.name = n; $('#mapName', sh).value = n; } });
    };
    const api = KAKAO_READY ? kakaoPicker($('#pickmap', sh), center, initial, setPick) : svgPicker($('#pickmap', sh), center, initial, setPick);
    sh._onClose = () => api.destroy && api.destroy();
    setTimeout(() => api.resize && api.resize(), 520);
    const q = $('#mapQ', sh), r = $('#mapR', sh); let qt = null;
    const show = hits => { r.innerHTML = hits.length ? hits.map((h, i) => `<button data-i="${i}">${esc(h.n)}<small>${esc(h.sub)}</small></button>`).join('') : '<button disabled>검색 결과가 없어요</button>'; r.hidden = false; r._hits = hits; };
    q.addEventListener('input', () => {
      clearTimeout(qt); const v = q.value.trim(); if (!v) { r.hidden = true; return; }
      qt = setTimeout(() => {
        if (api.search) api.search(v, hits => { if (q.value.trim() === v) show(hits); });
        else show([...STATIONS.filter(st => st[0].includes(v)).map(st => ({n:st[0], sub:'지하철역', lat:st[1], lng:st[2], k:'역'})), ...SEOUL_GU.filter(g => g.includes(v)).map(g => ({n:g, sub:'서울', lat:CENT[g][0], lng:CENT[g][1], k:'구'}))].slice(0, 8));
      }, api.search ? 280 : 0);
    });
    r.addEventListener('click', e => {
      const bt = e.target.closest('[data-i]'); if (!bt) return; const h = r._hits[+bt.dataset.i];
      r.hidden = true; q.value = ''; q.blur(); api.fly(h.lat, h.lng);
      if (h.k === '역') setPick(h.lat, h.lng, h.n + ' 근처'); else if (h.k === 'place') setPick(h.lat, h.lng, h.n);
    });
    $('#mapName', sh).addEventListener('input', e => { nameEdited = true; if (pick) pick.name = e.target.value; });
    $('#mapOk', sh).addEventListener('click', () => { if (!pick) return; pick.name = ($('#mapName', sh).value.trim() || placeName(pick.lat, pick.lng)); onPick({lat:+pick.lat.toFixed(6), lng:+pick.lng.toFixed(6), name:pick.name}); closeSheet(sh); });
  }});
}
function kakaoPicker(el, center, initial, setPick) {
  const K = kakao.maps;
  const map = new K.Map(el, {center:new K.LatLng(center[0], center[1]), level:initial ? 3 : 5});
  map.addControl(new K.ZoomControl(), K.ControlPosition.RIGHT);
  const geocoder = new K.services.Geocoder(); const places = new K.services.Places();
  const image = kakaoPinImage(); let marker = null;
  K.event.addListener(map, 'click', e => setPick(e.latLng.getLat(), e.latLng.getLng()));
  const api = {
    setPin(lat, lng) {
      const pos = new K.LatLng(lat, lng);
      if (!marker) { marker = new K.Marker({position:pos, image, draggable:true}); marker.setMap(map); K.event.addListener(marker, 'dragend', () => { const p = marker.getPosition(); setPick(p.getLat(), p.getLng()); }); }
      else marker.setPosition(pos);
    },
    fly(lat, lng) { map.setLevel(3); map.panTo(new K.LatLng(lat, lng)); },
    resize() { map.relayout(); map.setCenter(marker ? marker.getPosition() : new K.LatLng(center[0], center[1])); },
    lookupName(lat, lng, cb) {
      geocoder.coord2Address(lng, lat, (res, st) => {
        if (st !== K.services.Status.OK || !res[0]) return;
        const road = res[0].road_address, addr = res[0].address;
        cb(road && road.building_name ? road.building_name : road ? road.address_name : addr ? addr.address_name : '');
      });
    },
    search(q, cb) {
      places.keywordSearch(q, (data, st) => {
        if (st !== K.services.Status.OK) return cb([]);
        cb(data.slice(0, 8).map(d => ({n:d.place_name, sub:d.road_address_name || d.address_name, lat:+d.y, lng:+d.x, k:'place'})));
      }, {location:map.getCenter(), sort:K.services.SortBy.ACCURACY});
    }
  };
  if (initial) api.setPin(initial.lat, initial.lng);
  return api;
}
function svgPicker(el, center, initial, setPick) {
  // 카카오맵을 불러오지 못했을 때(키가 없거나 도메인 미등록) 쓰는 간이 지도
  let span = 0.05; let c = [...center];
  const draw = () => {
    const [x, y] = proj(c[1], c[0]); const w = span * COSL * K, h = span * K * 1.1;
    el.innerHTML = `<svg viewBox="${x - w / 2} ${y - h / 2} ${w} ${h}" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block"><g fill="var(--map-land)" stroke="var(--map-line)" stroke-width="${span * 6}">${GEO_PATHS}</g>${STATIONS.map(([n, a, b]) => { const [sx, sy] = proj(b, a); return `<circle cx="${sx}" cy="${sy}" r="${span * 25}" fill="var(--surface)" stroke="var(--contrast)" stroke-width="${span * 12}"/><text x="${sx + span * 40}" y="${sy + span * 20}" font-size="${span * 60}" font-weight="700" fill="var(--contrast-text)">${n}</text>`; }).join('')}<g id="svgPin"></g></svg>`;
    if (pin) api.setPin(pin[0], pin[1]);
  };
  let pin = null;
  const api = {
    setPin(lat, lng) { pin = [lat, lng]; const [px, py] = proj(lng, lat); const g = el.querySelector('#svgPin'); const s = span * 1.6; if (g) g.innerHTML = `<g transform="translate(${px} ${py}) scale(${s}) translate(-20 -46)">${PIN_SVG.replace(/<\/?svg[^>]*>/g, '')}</g>`; },
    fly(lat, lng) { c = [lat, lng]; span = 0.03; draw(); },
    resize() {}
  };
  el.addEventListener('click', e => { const svg = el.querySelector('svg'); const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const p = pt.matrixTransform(svg.getScreenCTM().inverse()); const lng = p.x / (COSL * K) + LNG0, lat = -p.y / K + LAT0; setPick(lat, lng); });
  draw(); if (initial) api.setPin(initial.lat, initial.lng);
  return api;
}

/* ============ 찾는 것 ============ */
function openWantsSheet() {
  let wants = [...wantsOf(App.me)]; let mode = 'cat'; let top = 1;
  const sh = openSheet({title:'찾는 것', full:true, foot:'<button class="btn btn-primary btn-block" id="wSave">저장하기</button>', body:'', onMount(sh) {
    const draw = () => {
      $('.sheet-body', sh).innerHTML = `<p style="margin:0 4px 16px;color:var(--muted);font-size:15px">등록한 것과 맞는 물건이 홈의 추천 매칭에 떠요. 최대 5개까지 등록할 수 있어요.</p>
        <div class="field"><div class="lbl">등록한 항목 <small class="num">${wants.length}/5</small></div><div class="chips wrap">${wants.length ? wants.map((w, i) => `<button class="chip on" data-rm="${i}">${esc(wantLabel(w))}<span class="x">${I.close.replace('<svg', '<svg style="width:12px;height:12px"')}</span></button>`).join('') : '<span class="hint" style="margin:0">아직 없어요</span>'}</div></div>
        <div class="seg in-form" id="wMode" style="margin-bottom:16px"><button data-v="cat" class="${mode === 'cat' ? 'on' : ''}">카테고리로</button><button data-v="kw" class="${mode === 'kw' ? 'on' : ''}">키워드로</button></div>
        ${mode === 'cat' ? `<div class="chips wrap" id="wTop" style="margin-bottom:10px">${CATS.map(c => `<button class="chip ${top === c.id ? 'on' : ''}" data-top="${c.id}">${c.n}</button>`).join('')}</div><div class="chips wrap" id="wSub"><button class="chip" data-add="${top}">${CAT_NAME[top]} 전체</button>${CATS.find(c => c.id === top).subs.map(([id, n]) => `<button class="chip ${wants.some(w => w.t === 'cat' && w.c === id) ? 'on-accent' : ''}" data-add="${id}">${n}</button>`).join('')}</div>`
        : `<div style="display:flex;gap:8px"><input class="input" id="wKw" maxlength="20" placeholder="예: 아이브 안유진 포카"><button class="btn btn-tint" id="wKwAdd">추가</button></div><div class="hint">물건 제목에 이 단어가 들어가면 매칭돼요.</div>`}`;
      initSegs(sh);
      const kw = $('#wKw', sh); if (kw) { const add = () => { const v = kw.value.trim(); if (!v) return; if (wants.length >= 5) return toast('최대 5개까지 등록할 수 있어요.'); wants.push({t:'kw', k:v}); draw(); }; $('#wKwAdd', sh).addEventListener('click', add); kw.addEventListener('keydown', e => { if (e.key === 'Enter') add(); }); }
    };
    draw();
    $('.sheet-body', sh).addEventListener('click', e => {
      const rm = e.target.closest('[data-rm]'); if (rm) { wants.splice(+rm.dataset.rm, 1); draw(); return; }
      const m = e.target.closest('#wMode button'); if (m) { mode = m.dataset.v; draw(); return; }
      const t = e.target.closest('[data-top]'); if (t) { top = +t.dataset.top; draw(); return; }
      const a = e.target.closest('[data-add]'); if (a) { const c = +a.dataset.add; const i = wants.findIndex(w => w.t === 'cat' && w.c === c); if (i >= 0) wants.splice(i, 1); else if (wants.length >= 5) return toast('최대 5개까지 등록할 수 있어요.'); else wants.push({t:'cat', c}); draw(); }
    });
    $('#wSave', sh).addEventListener('click', async () => { if (!guardWrite()) return; try { await Store.patch('profiles', App.me, {wants}); closeSheet(sh); toast('찾는 것을 저장했어요.'); } catch (e) {} });
  }});
}

/* ============ 프로필 ============ */
function openProfileSheet() {
  const p = profileOf(App.me); let region = p.region;
  openSheet({title:'프로필 수정', full:true, foot:'<button class="btn btn-primary btn-block" id="pSave">저장하기</button>', body:`<div class="field"><label for="pNick">닉네임</label><input class="input" id="pNick" maxlength="10" value="${esc(p.nickname)}"><div class="hint" id="pHint"></div></div><div class="field"><div class="lbl">내 동네</div><div class="region-grid" id="pRegion">${REGIONS.map(r => `<button class="chip ${region === r ? 'on-accent' : ''}" data-v="${esc(r)}">${esc(r)}</button>`).join('')}</div></div>`, onMount(sh) {
    $('#pRegion', sh).addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (!b) return; region = b.dataset.v; $$('#pRegion .chip', sh).forEach(x => x.classList.toggle('on-accent', x === b)); });
    $('#pSave', sh).addEventListener('click', async () => { if (!guardWrite()) return; const n = $('#pNick', sh).value.trim(); const err = validNick(n, App.me); if (err) { $('#pHint', sh).textContent = err; $('#pHint', sh).classList.add('err'); return; } try { await Store.patch('profiles', App.me, {nickname:n, region}); closeSheet(sh); toast('프로필을 저장했어요.'); } catch (e) {} });
  }});
}

/* ============ 교환 제안 ============ */
function openOfferSheet(targetId) {
  const target = itemById(targetId);
  const mine = itemsOf(App.me).filter(i => i.status === 'available');
  if (!mine.length) { confirmDialog('교환할 내 물건이 없어요', '먼저 물건을 등록해야 제안할 수 있어요.', '물건 등록').then(ok => ok && openItemForm()); return; }
  const theirW = wantsOf(target.owner);
  mine.sort((a, b) => matchesWants(b, theirW) - matchesWants(a, theirW));
  const methods = target.methods && target.methods.length ? target.methods : Object.keys(METHODS);
  const st = {item: mine[0].id, method: methods.length === 1 ? methods[0] : '', meet: target.meet || null, msg:''};
  openSheet({title:'교환 제안', full:true, foot:'<button class="btn btn-primary btn-block" id="oSend">제안 보내기</button>', body:'', onMount(sh) {
    const draw = () => {
      const tgtEqual = target.pref === 'equal';
      const picked = itemById(st.item);
      $('.sheet-body', sh).innerHTML = `
        <div class="field"><div class="lbl">내 물건 고르기</div><div class="radio-list">${mine.map(i => `<button class="radio-item ${st.item === i.id ? 'on' : ''}" data-item="${i.id}"><span class="ri-thumb">${itemImg(i)}</span><span class="ri-t">${esc(i.title)}<small>${i.value ? won(i.value) + ' 상당' : '가치 비공개'}${matchesWants(i, theirW) ? ' · <b style="color:var(--contrast-text)">상대가 찾는 물건</b>' : ''}</small></span><span class="radio-dot"></span></button>`).join('')}</div>
        ${tgtEqual && picked && !picked.value ? `<div class="note" style="margin:10px 0 0">${I.info}<span>상대는 비슷한 가치의 교환을 원해요. 메모에 물건 가치를 알려 주면 좋아요.</span></div>` : ''}</div>
        <div class="field"><div class="lbl">교환 방식 <small>${target.methods && target.methods.length ? '상대가 가능한 방식' : '상대가 협의 가능으로 열어뒀어요'} · 선택 사항</small></div><div class="method-cards">${Object.keys(METHODS).map(k => `<button class="mc ${st.method === k ? 'on' : ''}" data-method="${k}" ${methods.includes(k) ? '' : 'disabled style="opacity:.35"'}>${I[k]}${METHODS[k]}<small>${METHOD_DESC[k]}</small></button>`).join('')}</div>
        ${st.method === 'meet' ? `<button type="button" class="place-pick" id="oMeet"><span class="pp-ic">${I.pin}</span><span style="flex:1;min-width:0"><b>${st.meet ? esc(st.meet.name) : '만남 장소 고르기'}</b><span>${st.meet && target.meet && st.meet.lat === target.meet.lat && st.meet.lng === target.meet.lng ? '상대가 정한 장소 · 탭해서 다른 장소 제안' : st.meet ? '내가 제안한 장소 · 탭해서 바꾸기' : '지도를 눌러 장소를 골라 주세요'}</span></span><span class="chev" style="color:var(--muted)">${I.chev}</span></button>${st.meet ? `<div class="place" style="margin-top:8px"><div class="pmap" style="height:120px">${miniMap(st.meet)}</div></div>` : ''}` : ''}
        ${st.method === 'door' || st.method === 'parcel' ? `<div class="note contrast" style="margin:10px 0 0">${I.shield}<span>주소는 수락 후 오픈채팅에서만 주고받아요. 앱에는 저장되지 않아요.</span></div>` : ''}
        ${!st.method ? '<div class="hint">고르지 않으면 수락 후 오픈채팅에서 정해요.</div>' : ''}</div>
        <div class="field"><label for="oMsg">한 줄 메모 <small>선택 · 100자</small></label><input class="input" id="oMsg" maxlength="100" placeholder="예: 주말 오후에 교환 가능해요" value="${esc(st.msg)}"></div>`;
      $('#oMsg', sh).addEventListener('input', e => { st.msg = e.target.value; });
      const om = $('#oMeet', sh); if (om) om.addEventListener('click', () => openMapPicker(st.meet, profileOf(App.me).region, m => { st.meet = m; draw(); }));
    };
    draw();
    $('.sheet-body', sh).addEventListener('click', e => {
      const it = e.target.closest('[data-item]'); if (it) { st.item = it.dataset.item; draw(); return; }
      const m = e.target.closest('[data-method]'); if (m && !m.disabled) { st.method = st.method === m.dataset.method ? '' : m.dataset.method; if (st.method === 'meet' && !st.meet) setTimeout(() => openMapPicker(null, profileOf(App.me).region, mm => { st.meet = mm; draw(); }), 150); draw(); }
    });
    $('#oSend', sh).addEventListener('click', async () => {
      if (st.method === 'meet' && !st.meet) return toast('만남 장소를 골라 주세요.');
      const dup = Object.values(S.offers).find(o => o.from === App.me && o.target === targetId && o.offered === st.item && o.status === 'pending');
      if (dup) return toast('이미 같은 물건으로 제안했어요.');
      const btn = $('#oSend', sh); btn.disabled = true;
      try {
        await Store.set('offers', newId(), {from:App.me, to:target.owner, target:targetId, offered:st.item, message:st.msg.trim(), method:st.method || null, meet:st.method === 'meet' ? st.meet : null, status:'pending', fromDone:false, toDone:false, createdAt:now(), updatedAt:now()});
        closeSheet(sh); toast('교환을 제안했어요!');
      } catch (e) { btn.disabled = false; }
    });
  }});
}
function openAcceptSheet(offerId) {
  const o = S.offers[offerId];
  openSheet({title:'제안 수락', foot:'<button class="btn btn-primary btn-block" id="aOk">수락하기</button>', body:`<p style="margin:0 4px 16px;color:var(--muted);font-size:15px">수락하면 두 물건이 ‘예약중’이 되고, 같은 물건에 걸린 다른 제안은 자동으로 거절돼요.</p>
    <div class="field"><label for="aLink">내 카카오톡 오픈채팅 링크</label><input class="input" id="aLink" inputmode="url" placeholder="https://open.kakao.com/o/..." autocomplete="off"><div class="hint" id="aHint">상대에게만 보여요. 오픈채팅방을 만든 뒤 링크를 붙여 넣어 주세요.</div></div>
    ${o.method === 'meet' && o.meet ? `<div class="place"><div class="pmap" style="height:120px">${miniMap(o.meet)}</div><div class="pinfo"><div class="pn">${esc(o.meet.name)}<small>제안된 만남 장소</small></div></div></div>` : ''}`, onMount(sh) {
    $('#aOk', sh).addEventListener('click', async () => {
      const link = $('#aLink', sh).value.trim();
      if (!/^https:\/\/open\.kakao\.com\//.test(link)) { const h = $('#aHint', sh); h.textContent = 'https://open.kakao.com/ 으로 시작하는 링크를 넣어 주세요.'; h.classList.add('err'); return; }
      const btn = $('#aOk', sh); btn.disabled = true;
      try { await acceptOffer(offerId, link); closeSheet(sh); toast('교환을 수락했어요. 오픈채팅에서 이야기해 보세요!'); }
      catch (e) { btn.disabled = false; }
    });
  }});
}
async function acceptOffer(id, link) {
  // 두 물건 예약, 다른 대기 제안 자동 거절은 DB 함수(accept_offer)가 한 번에 처리해요.
  await Store.rpc('accept_offer', {p_offer:id, p_openchat:link});
  await loadState(['offers', 'items']);
}
async function completeOffer(id) {
  // 양쪽 완료 확인, 교환완료 처리, 교환 횟수, 챌린지 단계 추가는 DB 함수(complete_offer)가 처리해요.
  let r; try { r = await Store.rpc('complete_offer', {p_offer:id}); } catch (e) { return; }
  await loadState(['offers', 'items', 'challenges', 'profiles']);
  if (r !== 'completed') { toast('상대가 완료를 누르면 교환이 확정돼요.'); return; }
  celebrate(); toast('교환이 완료됐어요! 후기를 남겨 주세요.');
  setTimeout(() => openReviewSheet(id), 900);
}
function openReviewSheet(offerId) {
  const o = S.offers[offerId]; const other = o.from === App.me ? o.to : o.from; let score = '';
  openSheet({title:'교환 후기', foot:'<button class="btn btn-primary btn-block" id="rOk" disabled>후기 보내기</button>', body:`<p style="margin:0 4px 16px;font-size:17px;font-weight:700">${esc(profileOf(other).nickname)}님과의 교환은 어땠나요?</p>
    <div class="scores">${[['good', '좋아요'], ['soso', '보통이에요'], ['bad', '별로예요']].map(([k, l]) => `<button class="score" data-s="${k}">${I[k]}${l}</button>`).join('')}</div>
    <div class="field" style="margin-top:18px"><label for="rText">한 줄 후기 <small>선택</small></label><input class="input" id="rText" maxlength="80" placeholder="예: 시간 약속을 잘 지켜주셨어요"></div><div class="hint">좋아요 +0.5°C, 별로예요 −1°C가 상대의 교환온도에 반영돼요.</div>`, onMount(sh) {
    $('.scores', sh).addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (!b) return; score = b.dataset.s; $$('.score', sh).forEach(x => x.classList.toggle('on', x === b)); $('#rOk', sh).disabled = false; });
    $('#rOk', sh).addEventListener('click', async () => { try { await Store.set('reviews', offerId + '_' + App.me, {offer:offerId, from:App.me, to:other, score, text:$('#rText', sh).value.trim(), at:now()}); closeSheet(sh); toast('후기를 보냈어요.'); } catch (e) {} });
  }});
}
function openReportSheet(uid) {
  if (uid === App.me) return;
  let reason = '';
  openSheet({title:'신고하기', foot:'<button class="btn btn-block" style="background:var(--bad);color:#fff" id="rpOk" disabled>신고하기</button>', body:`<p style="margin:0 4px 14px;color:var(--muted)">${esc(profileOf(uid).nickname)}님을 신고하는 이유를 골라 주세요.</p><div class="radio-list">${['사기가 의심돼요', '약속 장소에 나오지 않았어요', '부적절한 물건이에요', '기타'].map(r => `<button class="radio-item" data-r="${r}" style="padding:14px"><span class="ri-t">${r}</span><span class="radio-dot"></span></button>`).join('')}</div>`, onMount(sh) {
    $('.radio-list', sh).addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (!b) return; reason = b.dataset.r; $$('.radio-item', sh).forEach(x => x.classList.toggle('on', x === b)); $('#rpOk', sh).disabled = false; });
    $('#rpOk', sh).addEventListener('click', async () => { try { await Store.set('reports', newId(), {from:App.me, to:uid, reason, at:now()}); closeSheet(sh); toast('신고가 접수됐어요.'); } catch (e) {} });
  }});
}
function openStepNote(cid, i) {
  const c = S.challenges[cid];
  openSheet({title:(i + 1) + '단계 소감', foot:'<button class="btn btn-primary btn-block" id="nOk">저장하기</button>', body:`<div class="field"><input class="input" id="nText" maxlength="60" placeholder="예: 핸드크림이 무드등이 될 줄이야" value="${esc(c.steps[i].note || '')}"></div>`, onMount(sh) {
    $('#nOk', sh).addEventListener('click', async () => { const steps = c.steps.map((s, k) => k === i ? {...s, note:$('#nText', sh).value.trim()} : s); try { await Store.patch('challenges', cid, {steps}); closeSheet(sh); } catch (e) {} });
  }});
}

/* ============ 공유 카드 ============ */
async function openShareCard(cid) {
  const c = S.challenges[cid]; const cs = getComputedStyle(document.documentElement);
  const v = n => cs.getPropertyValue(n).trim();
  const W = 1080, H = 1920; const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  g.fillStyle = v('--bg'); g.fillRect(0, 0, W, H);
  g.fillStyle = v('--contrast'); g.beginPath(); g.roundRect(60, 60, W - 120, 300, 48); g.fill();
  g.fillStyle = '#fff'; g.font = '700 40px ' + v('--font'); g.fillText('빨간 클립 챌린지', 120, 150);
  g.font = '800 64px ' + v('--font'); wrapText(g, c.title, 120, 240, W - 240, 76, 2);
  const steps = c.steps; const show = steps.length > 6 ? [...steps.slice(0, 2), null, ...steps.slice(-3)] : steps;
  let y = 430; const fg = v('--text'), muted = v('--muted'), acc = v('--accent');
  for (let i = 0; i < show.length; i++) {
    const s = show[i];
    if (!s) { g.fillStyle = muted; g.font = '700 44px ' + v('--font'); g.fillText('⋯', 180, y + 60); y += 120; continue; }
    const idx = steps.indexOf(s);
    g.fillStyle = v('--surface'); g.beginPath(); g.roundRect(60, y, W - 120, 180, 36); g.fill();
    g.save(); g.beginPath(); g.roundRect(90, y + 25, 130, 130, 24); g.clip();
    if (s.img) { try { const im = await loadImage(s.img); const r = Math.max(130 / im.width, 130 / im.height); g.drawImage(im, 90 + (130 - im.width * r) / 2, y + 25 + (130 - im.height * r) / 2, im.width * r, im.height * r); } catch (e) {} }
    else { g.fillStyle = v('--surface-2'); g.fillRect(90, y + 25, 130, 130); }
    g.restore();
    g.fillStyle = idx === 0 ? v('--contrast') : acc; g.beginPath(); g.arc(W - 150, y + 90, 40, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff'; g.font = '800 38px ' + v('--font'); g.textAlign = 'center'; g.fillText(String(idx + 1), W - 150, y + 104); g.textAlign = 'left';
    g.fillStyle = fg; g.font = '700 44px ' + v('--font'); wrapText(g, s.title, 250, y + 85, W - 470, 52, 1);
    g.fillStyle = muted; g.font = '500 32px ' + v('--font'); g.fillText(idx === 0 ? '시작 물건' : dateStr(s.at), 250, y + 135);
    y += 180;
    if (i < show.length - 1 && show[i + 1]) { g.strokeStyle = acc; g.lineWidth = 6; g.setLineDash([14, 14]); g.beginPath(); g.moveTo(155, y + 6); g.lineTo(155, y + 54); g.stroke(); g.setLineDash([]); y += 60; }
  }
  g.fillStyle = muted; g.font = '600 36px ' + v('--font'); g.textAlign = 'center';
  g.fillText(`${steps.length}단계 · 응원 ${(c.cheers || []).length} · ${c.status === 'finished' ? '완주!' : '진행 중'}`, W / 2, H - 170);
  g.fillStyle = acc; g.font = '800 48px ' + v('--font'); g.fillText('바꿀래', W / 2, H - 100);
  const url = cv.toDataURL('image/png');
  const text = `[바꿀래 빨간 클립 챌린지] ${c.title}\n${steps.map(s => s.title).join(' → ')} (${steps.length}단계)`;
  openSheet({title:'공유 카드', full:true, body:`<img class="share-img" src="${url}" alt="챌린지 공유 카드"><p class="hint" style="text-align:center;margin-top:14px">이미지를 길게 눌러 저장하거나 공유하세요.</p>`, foot:`<button class="btn btn-tint btn-block" id="cpTxt">${I.share}챌린지 소개 문구 복사</button>`, onMount(sh) {
    $('#cpTxt', sh).addEventListener('click', async () => { try { await navigator.clipboard.writeText(text); toast('문구를 복사했어요.'); } catch (e) { toast('복사하지 못했어요. 이미지를 저장해 공유해 주세요.'); } });
  }});
}
function wrapText(g, t, x, y, maxW, lh, maxLines) {
  let line = '', lines = 0;
  for (const ch of t) { if (g.measureText(line + ch).width > maxW) { g.fillText(line, x, y); y += lh; line = ch; if (++lines >= maxLines) { return; } } else line += ch; }
  if (line && lines < maxLines) g.fillText(line, x, y);
}
function celebrate() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = document.createElement('canvas'); cv.style.cssText = 'position:absolute;inset:0;z-index:300;pointer-events:none;width:100%;height:100%'; $('#app').appendChild(cv);
  const r = cv.getBoundingClientRect(); cv.width = r.width * 2; cv.height = r.height * 2; const g = cv.getContext('2d');
  const cs = getComputedStyle(document.documentElement); const cols = [cs.getPropertyValue('--accent'), cs.getPropertyValue('--contrast'), '#F2C14E', '#2C9564'];
  const ps = Array.from({length:90}, () => ({x:cv.width / 2, y:cv.height * .45, vx:(Math.random() - .5) * 26, vy:-Math.random() * 30 - 8, s:Math.random() * 10 + 6, c:cols[Math.floor(Math.random() * 4)], r:Math.random() * 6}));
  let t = 0; (function f() { g.clearRect(0, 0, cv.width, cv.height); ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 1.1; p.r += .15; g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.restore(); }); if (++t < 90) requestAnimationFrame(f); else cv.remove(); })();
}

/* ============ 시작 ============ */
async function boot() {
  buildGeoPaths(); initKakao();
  if (!sb) {
    $('#loading').remove();
    $('#app').insertAdjacentHTML('beforeend', `<div class="auth"><div class="auth-hero"><div class="logo">${I.swap}</div><h1>설정이 필요해요</h1><p class="lead" style="margin:0">Supabase 주소와 anon 키가 페이지에 들어가지 않았어요. GitHub 저장소의 Secrets에 SUPABASE_URL, SUPABASE_ANON_KEY를 넣고 다시 배포해 주세요.</p></div></div>`);
    return;
  }
  try {
    const {data} = await sb.auth.getSession();
    if (data && data.session) await enterSession(data.session.user);
  } catch (e) { toast(krError(e)); }
  sb.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' && App.session) signOutLocal();
    if (event === 'SIGNED_IN' && !App.session && session && !App.loading && !$('#authForm')) enterSession(session.user).then(() => render());
  });
  App.loading = false;
  $('#loading').remove();
  render();
  const m = location.hash.match(/^#challenge-([A-Za-z0-9_-]+)$/);
  if (m && S.challenges[m[1]] && App.session && S.profiles[App.me]) pushPage({type:'challenge', id:m[1]});
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') { const sh = $$('.sheet').pop(); if (sh) closeSheet(sh); else if (UI.stack.length) popPage(); } });
setInterval(() => { if (!$('.sheet') && !$('.dialog')) scheduleRender(); }, 60000);
boot();
