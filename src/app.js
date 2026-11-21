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
const CHAT_GRACE_MS = 7 * 86400000;
const PHOTO_BUCKET = 'item-photos';

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
  send:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
  bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 16.5h11l-1.4-2V10a4.1 4.1 0 1 0-8.2 0v4.5zM10 19a2 2 0 0 0 4 0"/></svg>',
  lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 1 1 8 0v3"/></svg>',
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 17 20l1-13M9 7V4.5A1 1 0 0 1 10 3.5h4a1 1 0 0 1 1 1V7"/></svg>',
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
  cat3:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M5 9h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17M9 3.5c0 1.5 1.5 1.5 1.5 3M13 3.5c0 1.5 1.5 1.5 1.5 3"/></svg>',
  eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A9.8 9.8 0 0 1 12 5c6 0 9.5 7 9.5 7a16.8 16.8 0 0 1-3.3 4.3M6.6 6.6C4.1 8.4 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.5 0 2.9-.3 4.1-.9"/></svg>',
  gps:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>',
  map:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z"/><path d="M9 4v13.5M15 6.5V20"/></svg>'
};
const PIN_SVG = '<svg viewBox="0 0 40 48"><path d="M20 46s15-14 15-26A15 15 0 0 0 5 20c0 12 15 26 15 26z" fill="var(--accent)" stroke="#fff" stroke-width="2.5"/><circle cx="20" cy="20" r="5.5" fill="#fff"/></svg>';
const LOC = window.BaggullaeLoc || {};

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
const timeStr = ts => { const d = new Date(ts); const h = d.getHours(); const ap = h < 12 ? '오전' : '오후'; const hh = h % 12 || 12; return `${ap} ${hh}:${String(d.getMinutes()).padStart(2, '0')}`; };
const dateStr = ts => { const d = new Date(ts); return d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0'); };
const dateDayKey = ts => { const d = new Date(ts); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
const dateKorean = ts => { const d = new Date(ts); return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`; };
const AV_COLORS = ['#E8762E','#23406D','#238556','#B0567A','#7A5BC4','#B57A14','#2E7D9B','#8C6A4F'];
function avatarColor(id) { let h = 0; for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return AV_COLORS[h % AV_COLORS.length]; }
function avatar(id, size = '') { const p = profileOf(id); const ch = (p.nickname || '?').trim().charAt(0); return `<span class="avatar ${size}" style="background:${avatarColor(id)}" aria-hidden="true">${esc(ch)}</span>`; }
const IS_VITE_DEV = !!(typeof document !== 'undefined' && document.querySelector('script[src="/src/app.js"]'));
function assetUrl(u) {
  const s = String(u || '');
  return IS_VITE_DEV && s.startsWith('./assets/') ? '/src/' + s.slice(2) : s;
}
function phBox(cat) { const p = parentOf(cat); const bg = p === 1 ? 'var(--contrast-soft)' : p === 2 ? 'var(--accent-soft)' : 'var(--surface-2)'; const fg = p === 1 ? 'var(--contrast-text)' : p === 2 ? 'var(--accent-text)' : 'var(--muted)'; return `<div class="ph" style="background:${bg};color:${fg}">${I['cat' + (p || 3)]}</div>`; }
function itemImg(item) { return item && item.photos && item.photos[0] ? `<img src="${esc(assetUrl(item.photos[0]))}" alt="${esc(item.title || '물건 사진')}" loading="lazy" referrerpolicy="no-referrer">` : phBox(item ? item.cat : 3); }
function haversine(a, b, c, d) { return LOC.haversineMeters ? LOC.haversineMeters(a, b, c, d) : 0; }
function guAt(lat, lng) { return LOC.guAt ? LOC.guAt(lat, lng, GEO) : null; }
function formatDist(m) { return LOC.formatDistance ? LOC.formatDistance(m) : ''; }
function myGeoCoords() { return LOC.userCoords ? LOC.userCoords(profileOf(App.me), CENT) : null; }
function itemDistStr(it) {
  const me = myGeoCoords();
  if (!me || !LOC.itemDistanceMeters) return '';
  const d = LOC.itemDistanceMeters(it, profileOf(it.owner), me, CENT);
  return d != null ? formatDist(d) : '';
}
function placeName(lat, lng) {
  let best = null, bd = 1e9;
  for (const [n, a, b] of STATIONS) { const d = haversine(lat, lng, a, b); if (d != null && d < bd) { bd = d; best = n; } }
  if (bd < 450) return best + ' 근처';
  const gu = guAt(lat, lng);
  if (gu) return bd < 1100 ? `${gu} · ${best} 부근` : gu + ' 부근';
  return '선택한 위치';
}
const kakaoMapUrl = m => `https://map.kakao.com/link/map/${encodeURIComponent(m.name)},${m.lat.toFixed(6)},${m.lng.toFixed(6)}`;
const kakaoRouteUrl = m => `https://map.kakao.com/link/to/${encodeURIComponent(m.name)},${m.lat.toFixed(6)},${m.lng.toFixed(6)}`;
function tempColor(t) { return t < 30 ? '#3A8AA8' : t < 36.5 ? '#2E8B63' : t < 40 ? '#C27D12' : t < 50 ? '#D9641E' : '#C83B32'; }

/* 개인정보(전화번호·주소) 탐지 */
function detectPrivateInfo(text) {
  const s = String(text || '').trim();
  if (!s) return false;
  const phoneRe = /(?:\b01[016789][-\s.]?\d{3,4}[-\s.]?\d{4}\b)|(?:\b0\d{1,2}[-\s.]\d{3,4}[-\s.]\d{4}\b)/;
  const addrRe = /([가-힣]{1,6}(시|도)\s+[가-힣]{1,6}(구|군|시))|([가-힣0-9]{1,10}(로|길)\s*\d{1,5})|([가-힣]{1,6}동\s+\d{1,4}(-\d{1,4})?)|(\d{1,4}동\s*\d{1,4}호)|((아파트|오피스텔|빌라)\s*\d{1,4}동?)/;
  return phoneRe.test(s) || addrRe.test(s);
}

/* ============ 스켈레톤 HTML ============ */
function skeletonListHtml(count = 4) {
  return `<div class="skel-view" aria-hidden="true">
    <div class="skel skel-line w45" style="height:26px;margin-bottom:4px"></div>
    ${Array.from({length:count}, () => `<div class="skel-row"><div class="skel skel-thumb"></div><div class="skel-lines"><div class="skel skel-line w70"></div><div class="skel skel-line w45"></div><div class="skel skel-line w55"></div></div></div>`).join('')}
  </div>`;
}
function skeletonDetailHtml() {
  return `<div class="skel-detail" aria-hidden="true">
    <div class="skel skel-hero"></div>
    <div class="skel-view"><div class="skel skel-line w70" style="height:22px"></div><div class="skel skel-line w45"></div><div class="skel skel-line" style="height:90px"></div></div>
  </div>`;
}

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

/* ============ 카카오맵 SDK & 현재 위치 탐색 ============ */
let KAKAO_READY = false;
let KAKAO_STATUS = 'init';
function initKakao() {
  const kScript = document.querySelector && document.querySelector('script[src*="dapi.kakao.com/v2/maps/sdk.js"]');
  if (!kScript) { KAKAO_STATUS = 'missing_key'; return; }
  const loadMaps = () => {
    if (!(window.kakao && window.kakao.maps && typeof window.kakao.maps.load === 'function')) {
      KAKAO_STATUS = 'sdk_error';
      return;
    }
    try {
      kakao.maps.load(() => {
        KAKAO_READY = true;
        KAKAO_STATUS = 'ready';
        hydrateMiniMaps(document.getElementById('app'));
      });
    } catch (e) { KAKAO_READY = false; KAKAO_STATUS = 'sdk_error'; }
  };
  if (!initKakao._obs && document.getElementById('app') && typeof MutationObserver === 'function') {
    initKakao._obs = true;
    new MutationObserver(muts => {
      if (!KAKAO_READY) return;
      for (const m of muts) m.addedNodes.forEach(n => { if (n.nodeType === 1) hydrateMiniMaps(n); });
    }).observe(document.getElementById('app'), {childList:true, subtree:true});
  }
  if (window.kakao && window.kakao.maps && typeof window.kakao.maps.load === 'function') {
    loadMaps();
  } else {
    KAKAO_STATUS = 'loading';
    kScript.addEventListener('load', loadMaps, {once:true});
    kScript.addEventListener('error', () => { KAKAO_READY = false; KAKAO_STATUS = 'sdk_error'; }, {once:true});
    setTimeout(() => { if (!KAKAO_READY && KAKAO_STATUS === 'loading') KAKAO_STATUS = 'sdk_error'; }, 5000);
  }
}
function kakaoStatusNote() {
  if (KAKAO_READY) return '';
  if (KAKAO_STATUS === 'missing_key') return '카카오맵 키(KAKAO_JS_KEY)가 설정되지 않아 간이 지도로 보여드려요. GitHub Secrets에 키를 넣으면 실제 카카오맵이 열려요.';
  if (KAKAO_STATUS === 'sdk_error') return '카카오맵을 불러오지 못해 간이 지도로 보여드려요. 카카오 디벨로퍼스 Web 플랫폼 도메인 등록을 확인해 주세요.';
  return '';
}
function hydrateMiniMaps(root, tries = 0) {
  if (!KAKAO_READY || !root) return;
  const els = root.classList && root.classList.contains('kmini') ? [root] : [...root.querySelectorAll('.kmini')];
  els.forEach(el => {
    if (el.dataset.k) return;
    if ((!el.offsetWidth || !el.offsetHeight) && tries < 10) {
      requestAnimationFrame(() => hydrateMiniMaps(el, tries + 1));
      return;
    }
    el.dataset.k = '1';
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
function getGpsPosition() {
  return new Promise((res, rej) => {
    if (!navigator.geolocation) { rej(new Error('이 브라우저에서는 위치 기능을 쓸 수 없어요. 아래에서 동네를 직접 골라 주세요.')); return; }
    navigator.geolocation.getCurrentPosition(
      pos => res({lat:pos.coords.latitude, lng:pos.coords.longitude}),
      err => {
        if (err && err.code === 1) rej(new Error('위치 권한이 꺼져 있어요. 브라우저 설정에서 위치 접근을 허용하거나 아래에서 동네를 골라 주세요.'));
        else if (err && err.code === 3) rej(new Error('위치 확인 시간이 지났어요. 잠시 후 다시 시도해 주세요.'));
        else rej(new Error('현재 위치를 찾지 못했어요. 아래에서 동네를 직접 골라 주세요.'));
      },
      {enableHighAccuracy:true, timeout:8000, maximumAge:60000}
    );
  });
}
async function detectCurrentNeighborhood() {
  const {lat, lng} = await getGpsPosition();
  const fallback = () => {
    const f = LOC.nearestRegionAndStation(lat, lng, CENT, STATIONS, GEO, REGIONS);
    return {
      region:f.region,
      dong:f.dong,
      fullLabel:f.dong ? `${f.region} · ${f.dong}` : f.region,
      lat:LOC.roundPublicCoord(lat),
      lng:LOC.roundPublicCoord(lng),
      rawLat:lat,
      rawLng:lng,
      viaKakao:false
    };
  };
  if (KAKAO_READY && window.kakao && kakao.maps && kakao.maps.services) {
    return await new Promise(resolve => {
      try {
        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.coord2RegionCode(lng, lat, (results, status) => {
          if (status === kakao.maps.services.Status.OK) {
            const parsed = LOC.parseKakaoRegionResult(results, REGIONS);
            if (parsed) {
              resolve({
                region:parsed.region,
                dong:parsed.dong,
                fullLabel:parsed.fullLabel,
                lat:LOC.roundPublicCoord(lat),
                lng:LOC.roundPublicCoord(lng),
                rawLat:lat,
                rawLng:lng,
                viaKakao:true
              });
              return;
            }
          }
          resolve(fallback());
        });
      } catch (e) { resolve(fallback()); }
    });
  }
  return fallback();
}

/* ============ 데이터 저장소 (Supabase + 로컬 미리보기 지원) ============ */
const CONFIG = window.APP_CONFIG || {};
function normalizeSupabaseUrl(raw) {
  const s = String(raw || '').trim();
  if (!s || /\{\{/.test(s)) return '';
  try {
    const u = new URL(s);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return '';
    return u.origin;
  } catch (e) { return ''; }
}
const SUPABASE_URL = normalizeSupabaseUrl(CONFIG.supabaseUrl);
const CONFIG_OK = !!SUPABASE_URL && !!CONFIG.supabaseAnonKey && !/\{\{/.test(CONFIG.supabaseAnonKey);
const AUTOSTART = new URLSearchParams(location.search).get('autostart') === '1';
const sb = CONFIG_OK && window.supabase ? window.supabase.createClient(SUPABASE_URL, CONFIG.supabaseAnonKey) : null;
const S = {profiles:{}, items:{}, offers:{}, challenges:{}, reviews:{}, favorites:{}, messages:{}, notifications:{}};
const App = {me:null, email:'', session:false, loading:true, fetching:false, readOnly:false, demo:false, recovery:false, ch:null, online:navigator.onLine !== false};
const PendingOps = new Map();

function krError(e) {
  const m = (e && (e.message || e.error_description)) || '';
  if (/Invalid login credentials/i.test(m)) return '이메일 또는 비밀번호가 맞지 않아요. 다시 확인한 뒤 입력해 주세요.';
  if (/Email not confirmed/i.test(m)) return '메일 인증이 끝나지 않았어요. 받은편지함의 인증 링크를 먼저 눌러 주세요.';
  if (/already registered/i.test(m)) return '이미 가입한 이메일이에요. 로그인 화면에서 로그인해 주세요.';
  if (/Password should be/i.test(m)) return '비밀번호가 너무 짧아요. 8자 이상으로 입력해 주세요.';
  if (/same password/i.test(m)) return '지금 쓰고 있는 비밀번호와 같아요. 다른 비밀번호를 입력해 주세요.';
  if (/rate limit|too many/i.test(m)) return '요청을 너무 자주 보냈어요. 1분 정도 기다린 뒤 다시 시도해 주세요.';
  if (e && e.code === '23505') {
    if (/nickname/i.test(m) || /nickname/i.test((e && e.details) || '')) return '이미 다른 사람이 쓰고 있는 닉네임이에요. 다른 이름을 입력해 주세요.';
    return '이미 저장된 정보예요. 새로고침한 뒤 다시 확인해 주세요.';
  }
  if (e && e.code === '42501') {
    if (/permission denied for table/i.test(m)) return '데이터베이스 테이블 권한이 설정되지 않았어요. Supabase SQL Editor에서 schema.sql을 다시 실행해 주세요.';
    return '권한이 없어 처리하지 못했어요. 로그인 상태를 확인해 주세요.';
  }
  if (e && e.code === 'NO_ROWS') return '권한이 없어 처리하지 못했어요. 로그인 상태를 확인해 주세요.';
  if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return '인터넷 연결이 불안정해 저장하지 못했어요. 연결을 확인한 뒤 다시 시도해 주세요.';
  if (/[가-힣]/.test(m)) return m;
  return '작업을 완료하지 못했어요. 잠시 후 다시 시도해 주세요.';
}

function putLocal(col, id, data) {
  if (!S[col]) return;
  const n = {...S[col]};
  if (data == null) delete n[id];
  else n[id] = data;
  S[col] = n;
  scheduleRender();
}

async function q(promise) { const {data, error} = await promise; if (error) throw error; return data; }

const Store = {
  async set(col, id, data) {
    if (App.demo) {
      if (col === 'reports') return data;
      putLocal(col, id, data);
      if (col === 'offers' && data.status === 'pending') {
        putLocal('notifications', 'nt_' + newId(), {to:data.to, type:'new_offer', offerId:id, actor:data.from, itemId:data.target, read:false, at:now()});
      }
      return data;
    }
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
    if (App.demo) { putLocal(col, id, null); return; }
    try {
      const rows = await q(sb.from(col).delete().eq('id', id).select('id'));
      if (!rows || !rows.length) { const err = new Error('no rows'); err.code = 'NO_ROWS'; throw err; }
      putLocal(col, id, null);
    } catch (e) { handleWriteError(e); throw e; }
  },
  async rpc(fn, args) {
    if (App.demo) return demoRpc(fn, args);
    try { return await q(sb.rpc(fn, args)); } catch (e) { handleWriteError(e); throw e; }
  }
};

function handleWriteError(e) {
  console.error('[바꿀래 저장 오류]', e);
  if (e && (e.status === 401 || /JWT expired/i.test(e.message || ''))) { toast('로그인이 만료됐어요. 다시 로그인해 주세요.'); signOutLocal(); return; }
  toast(krError(e));
}

async function loadState(cols = Object.keys(S)) {
  if (App.demo) { scheduleRender(); return; }
  App.fetching = true;
  try {
    await Promise.all(cols.map(async col => {
      const rows = await q(sb.from(col).select('id,data').limit(5000));
      const m = {}; rows.forEach(r => { m[r.id] = r.data; }); S[col] = m;
    }));
  } finally {
    App.fetching = false;
    scheduleRender();
  }
}

function connectLive() {
  if (App.demo || !sb) return;
  if (App.ch) sb.removeChannel(App.ch);
  let first = true;
  App.ch = sb.channel('baggullae-live')
    .on('postgres_changes', {event:'*', schema:'public'}, p => {
      if (!S[p.table]) return;
      if (p.eventType === 'DELETE') putLocal(p.table, p.old && p.old.id, null);
      else if (p.new && p.new.id) {
        putLocal(p.table, p.new.id, p.new.data);
        if (p.table === 'messages' && p.new.data && p.new.data.receiver === App.me && !p.new.data.readAt) {
          const topPage = UI.stack[UI.stack.length - 1];
          if (topPage && topPage.type === 'chat' && topPage.id === p.new.data.offer) {
            markChatRead(topPage.id);
          }
        }
      }
    })
    .subscribe(status => { if (status === 'SUBSCRIBED') { if (!first) loadState().catch(() => {}); first = false; } });
}

async function enterSession(user) {
  App.me = user.id; App.email = user.email || ''; App.session = true;
  await loadState(); connectLive();
}
async function signOut() { if (!App.demo && sb) { try { await sb.auth.signOut(); } catch (e) {} } signOutLocal(); }
function signOutLocal() {
  flushPendingOps();
  if (App.ch && sb) { sb.removeChannel(App.ch); App.ch = null; }
  App.session = false; App.me = null; App.recovery = false; Object.keys(S).forEach(c => { S[c] = {}; });
  while (UI.stack.length) popPage();
  $$('.sheet').forEach(sh => closeSheet(sh, {force:true}));
  const a = $('#auth'); if (a) a.remove();
  OB.step = 0; OB.nickname = ''; OB.region = ''; OB.wants = []; OB.agree = [false, false, false];
  render();
}

/* ============ 로컬 미리보기 데모 어댑터 (?autostart=1 전용) ============ */
function initDemoData() {
  const t = now();
  App.demo = true; App.me = 'demo-me'; App.email = 'demo@baggullae.kr'; App.session = true; App.loading = false;
  S.profiles = {
    'demo-me': {nickname:'민트귤', region:'마포구', dong:'서교동', loc:{lat:37.556, lng:126.924}, locVerified:true, wants:[{t:'cat', c:11}, {t:'kw', k:'무드등'}], tradeCount:1, createdAt:t - 864000000},
    'ex-pocamo': {nickname:'포카모아', region:'마포구', dong:'합정동', loc:{lat:37.549, lng:126.914}, wants:[{t:'cat', c:22}], example:false, tradeCount:2, createdAt:t - 3456000000},
    'ex-sora': {nickname:'소라향기', region:'마포구', dong:'망원동', loc:{lat:37.556, lng:126.910}, wants:[{t:'kw', k:'포카'}, {t:'cat', c:11}], example:false, tradeCount:1, createdAt:t - 2160000000},
    'ex-jun': {nickname:'준이네살림', region:'성동구', dong:'성수동1가', loc:{lat:37.545, lng:127.056}, wants:[{t:'cat', c:31}], example:false, tradeCount:1, createdAt:t - 5184000000},
    'ex-hana': {nickname:'하나둘클립', region:'성동구', dong:'성수동2가', loc:{lat:37.544, lng:127.058}, wants:[{t:'cat', c:3}], example:false, tradeCount:2, createdAt:t - 1555200000}
  };
  S.items = {
    'demo-my1': {owner:'demo-me', title:'미개봉 립 틴트 로즈 컬러', cat:22, cond:'sealed', value:18000, pref:'any', methods:['meet','door'], meet:{lat:37.5572, lng:126.9245, name:'홍대입구역 근처'}, photos:['./assets/images/beauty_cushion_tint_1795281152556.jpg'], desc:'선물 받아 보관만 했어요.', region:'마포구', status:'available', createdAt:t - 3600000, challengeId:null},
    'ex-i1': {owner:'ex-pocamo', title:'아이브 안유진 일레븐 포카 (미공포)', cat:11, cond:'used', value:8000, pref:'any', methods:['parcel','door'], meet:null, photos:['./assets/images/kpop_photocard_sleeve_1795281152320.jpg'], desc:'슬리브 보관만 했어요. 메이크업 제품이랑 바꾸고 싶어요.', region:'마포구', status:'available', createdAt:t - 10800000, challengeId:null},
    'ex-i2': {owner:'ex-sora', title:'미개봉 쿠션 팩트 21호', cat:22, cond:'sealed', value:32000, pref:'equal', methods:['meet'], meet:{lat:37.5572, lng:126.9245, name:'홍대입구역 근처'}, photos:['./assets/images/beauty_cushion_tint_1795281152556.jpg'], desc:'선물 받았는데 색이 안 맞아요. 포카 교환 원해요!', region:'마포구', status:'available', createdAt:t - 18000000, challengeId:null},
    'ex-i3': {owner:'ex-jun', title:'디퓨저 200ml 새상품 (우드 향)', cat:33, cond:'new', value:0, pref:'any', methods:[], meet:null, photos:['./assets/images/reed_diffuser_interior_1795281152902.jpg'], desc:'', region:'성동구', status:'available', createdAt:t - 32400000, challengeId:null},
    'ex-i6': {owner:'ex-hana', title:'무드등 (원목 받침)', cat:33, cond:'used', value:15000, pref:'any', methods:['meet'], meet:{lat:37.5446, lng:127.0559, name:'성수역 근처'}, photos:['./assets/images/wood_mood_lamp_1795281152852.jpg'], desc:'빨간 클립 챌린지 3단계 물건이에요. 더 큰 물건으로 바꿔 주세요!', region:'성동구', status:'available', createdAt:t - 72000000, challengeId:'ex-c1'}
  };
  S.offers = {
    'demo-o1': {from:'ex-pocamo', to:'demo-me', target:'demo-my1', offered:'ex-i1', message:'마포구에서 직거래 가능해요!', method:'meet', meet:{lat:37.5572, lng:126.9245, name:'홍대입구역 근처'}, status:'accepted', fromDone:false, toDone:false, acceptedAt:t - 3500000, createdAt:t - 4000000, updatedAt:t - 3500000},
    'demo-o2': {from:'ex-sora', to:'demo-me', target:'demo-my1', offered:'ex-i2', message:'이번 주말에 가능할까요?', method:'meet', meet:{lat:37.5572, lng:126.9245, name:'홍대입구역 근처'}, status:'pending', fromDone:false, toDone:false, createdAt:t - 1800000, updatedAt:t - 1800000}
  };
  S.messages = {
    'demo-m1': {offer:'demo-o1', sender:'ex-pocamo', receiver:'demo-me', text:'안녕하세요! 홍대입구역 8번 출구 쪽 괜찮으실까요?', at:t - 3200000, readAt:null}
  };
  S.notifications = {
    'demo-n1': {to:'demo-me', type:'new_offer', offerId:'demo-o2', actor:'ex-sora', itemId:'demo-my1', read:false, at:t - 1800000}
  };
  S.challenges = {
    'ex-c1': {owner:'ex-hana', title:'볼펜 한 자루로 에어팟까지', goal:'에어팟', status:'active', cheers:['ex-sora','ex-jun','ex-pocamo'], currentItemId:'ex-i6', awaitingNext:false, createdAt:t - 777600000, steps:[
      {title:'만년필 & 모눈노트 세트', cat:32, img:'./assets/images/wireless_earbuds_stationery_1795281152251.jpg', from:'ex-hana', at:t - 777600000},
      {title:'핸드크림 & 세럼 세트', cat:24, img:'./assets/images/skincare_handcream_set_1795281152407.jpg', from:'ex-sora', note:'문구 세트가 핸드크림이 됐어요', at:t - 518400000},
      {title:'무드등 (원목 받침)', cat:33, img:'./assets/images/wood_mood_lamp_1795281152852.jpg', from:'ex-jun', at:t - 172800000}
    ]}
  };
  S.reviews = {
    'ex-o1_ex-sora': {offer:'ex-o1', from:'ex-sora', to:'ex-hana', score:'good', text:'친절하게 설명해 주셨어요', at:t - 518400000}
  };
  S.favorites = {};
}
function demoRpc(fn, args) {
  if (fn === 'accept_offer') {
    const o = S.offers[args.p_offer]; if (!o) throw new Error('제안을 찾을 수 없어요.');
    putLocal('offers', args.p_offer, {...o, status:'accepted', openchat:args.p_openchat || null, acceptedAt:now(), updatedAt:now()});
    return null;
  }
  if (fn === 'complete_offer') {
    const o = S.offers[args.p_offer]; if (!o) throw new Error('교환을 찾을 수 없어요.');
    putLocal('offers', args.p_offer, {...o, fromDone:true, toDone:true, status:'completed', completedAt:now(), updatedAt:now()});
    return 'completed';
  }
  if (fn === 'toggle_cheer') {
    const c = S.challenges[args.p_challenge]; if (!c) return;
    const ch = new Set(c.cheers || []); ch.has(App.me) ? ch.delete(App.me) : ch.add(App.me);
    putLocal('challenges', args.p_challenge, {...c, cheers:[...ch]});
    return null;
  }
  if (fn === 'mark_chat_read') {
    const ts = now();
    Object.entries(S.messages).forEach(([id, m]) => {
      if (m.offer === args.p_offer && m.receiver === App.me && !m.readAt) putLocal('messages', id, {...m, readAt:ts});
    });
    return null;
  }
  if (fn === 'delete_my_account') {
    if (Object.values(S.offers).some(o => o.status === 'accepted' && (o.from === App.me || o.to === App.me))) {
      throw new Error('진행 중인 교환이 있어 탈퇴할 수 없어요. 교환을 먼저 완료해 주세요.');
    }
    return null;
  }
}

/* ============ 파생 데이터 ============ */
const profileOf = id => S.profiles[id] || {nickname:'알 수 없음', region:''};
const isExample = id => !App.demo && String(id).startsWith('ex-');
function reviewsFor(id) { return Object.values(S.reviews).filter(r => r.to === id).sort((a, b) => b.at - a.at); }
function tempOf(id) { let t = 36.5; for (const r of reviewsFor(id)) t += r.score === 'good' ? 0.5 : r.score === 'bad' ? -1 : 0; return Math.max(0, Math.min(99, Math.round(t * 10) / 10)); }
function tradeCount(id) { return (S.profiles[id] && S.profiles[id].tradeCount) || 0; }
const itemsOf = id => Object.entries(S.items).filter(([, it]) => it.owner === id).map(([k, v]) => ({...v, id:k})).sort((a, b) => b.createdAt - a.createdAt);
const allItems = () => Object.entries(S.items).map(([k, v]) => ({...v, id:k}));
const itemById = id => S.items[id] ? {...S.items[id], id} : null;
const offerById = id => S.offers[id] ? {...S.offers[id], id} : null;
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

/* 찜 파생 */
const favKey = itemId => `${App.me}_${itemId}`;
const isFavorite = itemId => !!S.favorites[favKey(itemId)];
function favoriteItems() {
  return Object.values(S.favorites)
    .filter(f => f.owner === App.me)
    .sort((a, b) => b.at - a.at)
    .map(f => itemById(f.item))
    .filter(Boolean);
}

/* 채팅 파생 */
function chatMessagesOf(offerId) {
  return Object.entries(S.messages)
    .map(([id, m]) => ({...m, id}))
    .filter(m => m.offer === offerId)
    .sort((a, b) => a.at - b.at);
}
function hasChatRoom(o) {
  if (!o) return false;
  if (o.status === 'accepted') return true;
  if (o.status === 'completed') return true;
  if ((o.status === 'rejected' || o.status === 'cancelled') && (o.acceptedAt || chatMessagesOf(o.id).length > 0)) return true;
  return false;
}
function chatWriteState(o, currentMs = now()) {
  if (!o) return 'readonly';
  if (o.status === 'accepted') return 'open';
  if (hasChatRoom(o)) {
    const endAt = o.completedAt || o.updatedAt || o.createdAt || 0;
    return (currentMs - endAt) <= CHAT_GRACE_MS ? 'grace' : 'readonly';
  }
  return 'readonly';
}
function canWriteChat(o, currentMs = now()) {
  const st = chatWriteState(o, currentMs);
  return st === 'open' || st === 'grace';
}
function myChatRooms() {
  return myOffers().filter(hasChatRoom).map(o => {
    const msgs = chatMessagesOf(o.id);
    const last = msgs[msgs.length - 1] || null;
    const unread = msgs.filter(m => m.receiver === App.me && !m.readAt).length;
    const lastAt = last ? last.at : (o.acceptedAt || o.updatedAt || o.createdAt);
    return {offer:o, last, unread, lastAt};
  }).sort((a, b) => b.lastAt - a.lastAt);
}
function unreadChatCount() {
  return Object.values(S.messages).filter(m => m.receiver === App.me && !m.readAt && offerById(m.offer) && hasChatRoom(offerById(m.offer))).length;
}

/* 알림 파생 */
function myNotifications() {
  return Object.entries(S.notifications)
    .map(([id, n]) => ({...n, id}))
    .filter(n => n.to === App.me)
    .sort((a, b) => b.at - a.at);
}
function unreadNotifCount() {
  return myNotifications().filter(n => !n.read).length;
}

/* 온보딩 3단계 체크리스트 & 홈 인사말 */
function onboardingProgress(meId = App.me) {
  const step1 = wantsOf(meId).length > 0;
  const step2 = itemsOf(meId).length > 0;
  const step3 = Object.values(S.offers).some(o => o.from === meId);
  const steps = [
    {done:step1, label:'찾는 것 등록하기', sub:'원하는 물건을 고르면 자동 매칭돼요', act:'openWants'},
    {done:step2, label:'첫 물건 등록하기', sub:'안 쓰는 물건 1개만 올려도 교환이 시작돼요', act:'newItem'},
    {done:step3, label:'첫 교환 제안하기', sub:'마음에 드는 물건에 제안을 보내 보세요', act:'browseAll'}
  ];
  const doneCount = steps.filter(s => s.done).length;
  return {steps, doneCount, allDone:doneCount === 3};
}
function homeGreeting(me, currentMs = now()) {
  const startOfDay = new Date(currentMs); startOfDay.setHours(0, 0, 0, 0);
  const todayCount = allItems().filter(i => i.owner !== App.me && i.status === 'available' && (i.region === me.region || profileOf(i.owner).region === me.region) && i.createdAt >= startOfDay.getTime()).length;
  if (todayCount > 0) return `오늘 ${me.region}에 새 물건 ${todayCount}개가 올라왔어요`;
  const pend = pendingReceived();
  if (pend > 0) return `도착한 교환 제안 ${pend}건이 기다리고 있어요`;
  const h = new Date(currentMs).getHours();
  if (h < 11) return `좋은 아침이에요, ${me.nickname}님! 오늘 바꿀 물건을 찾아볼까요?`;
  if (h < 17) return `${me.region} 이웃들과 가벼운 물물교환 어때요?`;
  return `편안한 저녁이에요, ${me.nickname}님. 새로운 매칭을 확인해 보세요`;
}

/* ============ 렌더링 ============ */
const UI = {tab:'home', homeSeg:'match', filterCat:0, filterMethod:'', rangeKm:0, sortBy:'recent', offerSeg:'recv', chalSeg:'active', meSeg:'items', stack:[], enterTab:true, scroll:{}, renderedTab:'home', _segPrev:{}};
let renderQueued = false;
function scheduleRender() { if (renderQueued) return; renderQueued = true; requestAnimationFrame(() => { renderQueued = false; render(); }); }

function syncNavBadges() {
  const totalOfferBadge = pendingReceived() + unreadChatCount();
  $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === UI.tab));
  const b = $('#offerBadge');
  if (totalOfferBadge) {
    if (!b || b.textContent !== String(totalOfferBadge)) {
      b && b.remove();
      const ot = $('.tab[data-tab="offers"]');
      if (ot) ot.insertAdjacentHTML('beforeend', `<span class="badge" id="offerBadge">${totalOfferBadge}</span>`);
    }
  } else if (b) b.remove();
  renderSidebar(totalOfferBadge);
}

function renderSidebar(totalOfferBadge) {
  const sbEl = $('#sidebar'); if (!sbEl) return;
  const show = App.session && !App.loading && !!S.profiles[App.me];
  sbEl.classList.toggle('hidden', !show);
  if (!show) return;
  const me = profileOf(App.me);
  const regTxt = LOC.userRegionLabel ? LOC.userRegionLabel(me) : me.region;
  const tabs = [
    ['home', '홈', I.home, 0],
    ['challenge', '챌린지', I.clip, 0],
    ['offers', '제안함 · 채팅', I.inbox, totalOfferBadge],
    ['me', '마이', I.user, 0]
  ];
  sbEl.innerHTML = `<div class="sb-brand"><span class="sb-logo">${I.swap}</span><b>바꿀래</b></div>
    <nav class="sb-nav" aria-label="데스크톱 메뉴">${tabs.map(([id, label, icon, badge]) => `<button class="sb-tab ${UI.tab === id ? 'on' : ''}" data-act="tab" data-tab="${id}">${icon}<span>${label}</span>${badge ? `<span class="sb-badge">${badge}</span>` : ''}</button>`).join('')}
      <button class="btn btn-primary btn-block sb-cta" data-act="newItem">${I.plus}물건 등록</button>
    </nav>
    <button class="sb-user" data-act="tab" data-tab="me" style="text-align:left">${avatar(App.me, 'sm')}<div><b>${esc(me.nickname)}</b><span>${esc(regTxt)} · ${tempOf(App.me).toFixed(1)}°C</span></div></button>`;
}

function render() {
  if (App.loading) return;
  if (App.recovery) { renderNewPassword(); return; }
  if (!App.session) { $('#sidebar').classList.add('hidden'); renderAuth(); return; }
  if (!S.profiles[App.me]) {
    $('#sidebar').classList.add('hidden');
    const a = $('#auth'); if (!a || a.dataset.mode !== 'onboard') { renderAuth(); OB.step = 0; renderOnboard(); }
    return;
  }
  const au = $('#auth'); if (au && !au.dataset.leaving) au.remove();
  const main = $('#main');
  const prev = $('#tabview');
  if (prev) UI.scroll[UI.renderedTab] = prev.scrollTop;
  const html = ({home:viewHome, challenge:viewChallenges, offers:viewOffers, me:viewMe})[UI.tab]();
  main.innerHTML = `<div class="view" id="tabview"><div class="ptr" id="ptr"><span class="ptr-spin"></span><span id="ptrTxt">당겨서 새로고침</span></div>${html}</div>`;
  const tv = $('#tabview');
  if (UI.enterTab) {
    tv.classList.add('tab-enter');
    tv.querySelectorAll('.stagger, .group, .grid2, .hscroll').forEach(el => el.classList.add('enter'));
    UI.enterTab = false;
    tv.scrollTop = 0;
  } else {
    tv.scrollTop = UI.scroll[UI.tab] || 0;
  }
  UI.renderedTab = UI.tab;
  bindScroll(tv);
  bindPullToRefresh(tv);
  initSegs(tv);
  syncNavBadges();
  $('#fab').classList.toggle('hidden', UI.tab !== 'home' || UI.stack.length > 0);
  $('#tabbar').classList.toggle('hidden', UI.stack.length > 0);
  UI.stack.forEach(p => renderPage(p));
}

function bindScroll(v) {
  const on = () => v.classList.toggle('scrolled', v.scrollTop > 36);
  v.addEventListener('scroll', on, {passive:true}); on();
}

function bindPullToRefresh(v) {
  const ptr = $('#ptr', v); if (!ptr) return;
  const txt = $('#ptrTxt', v);
  let y0 = null, pulling = false, dy = 0, busy = false;
  v.addEventListener('touchstart', e => {
    if (busy || v.scrollTop > 2 || e.touches.length !== 1) return;
    y0 = e.touches[0].clientY; pulling = false; dy = 0;
  }, {passive:true});
  v.addEventListener('touchmove', e => {
    if (y0 == null || busy) return;
    const diff = e.touches[0].clientY - y0;
    if (diff > 8 && v.scrollTop <= 0) {
      pulling = true;
      dy = Math.min(82, (diff - 8) * 0.55);
      ptr.classList.add('pulling');
      ptr.style.height = dy + 'px';
      const ready = dy >= 52;
      ptr.classList.toggle('ready', ready);
      txt.textContent = ready ? '놓으면 새로고침돼요' : '당겨서 새로고침';
    }
  }, {passive:true});
  const end = async () => {
    if (y0 == null) return;
    y0 = null;
    if (!pulling) return;
    pulling = false;
    ptr.classList.remove('pulling');
    if (dy >= 52 && !busy) {
      busy = true;
      ptr.classList.add('refreshing');
      ptr.style.height = '';
      txt.textContent = '불러오는 중…';
      try { await loadState(); } catch (e) {}
      setTimeout(() => { ptr.classList.remove('refreshing', 'ready'); busy = false; }, 350);
    } else {
      ptr.style.height = '0px';
      ptr.classList.remove('ready');
    }
  };
  v.addEventListener('touchend', end, {passive:true});
  v.addEventListener('touchcancel', end, {passive:true});
}

function initSegs(root) {
  $$('.seg', root).forEach(seg => {
    const btns = $$('button', seg);
    const on = Math.max(0, btns.findIndex(b => b.classList.contains('on')));
    let ind = $('.seg-ind', seg);
    if (!ind) { ind = document.createElement('i'); ind.className = 'seg-ind'; seg.prepend(ind); }
    const w = 100 / Math.max(1, btns.length);
    ind.style.width = `calc(${w}% - ${8 / Math.max(1, btns.length)}px)`;
    const key = seg.dataset.seg || seg.id;
    const prevIdx = key && UI._segPrev[key] != null ? UI._segPrev[key] : on;
    if (key) UI._segPrev[key] = on;
    if (key && prevIdx !== on && prevIdx < btns.length) {
      ind.style.transition = 'none';
      ind.style.transform = `translateX(${prevIdx * 100}%)`;
      void ind.offsetWidth;
      ind.style.transition = '';
      requestAnimationFrame(() => { ind.style.transform = `translateX(${on * 100}%)`; });
    } else {
      ind.style.transform = `translateX(${on * 100}%)`;
    }
  });
}

function navBar(title, {back = false, right = '', glassy = false, showTitle = false} = {}) {
  return `<div class="nav ${glassy ? 'glassy' : ''}">${back ? `<button class="nav-btn" data-act="back" aria-label="뒤로 가기">${I.back}</button>` : '<span class="nav-spacer"></span>'}<div class="nav-title ${showTitle ? 'show' : ''}">${esc(title)}</div>${right || '<span class="nav-spacer"></span>'}</div>`;
}
function emptyBox(icon, title, text, btn = '') { return `<div class="empty"><div class="ei">${I[icon]}</div><b>${esc(title)}</b>${text ? `<p style="margin:0">${esc(text)}</p>` : ''}${btn}</div>`; }
function methodTags(methods) { if (!methods || !methods.length) return '<span class="tag">협의 가능</span>'; return methods.map(m => `<span class="tag">${I[m]}${METHODS[m]}</span>`).join(''); }

function itemRow(it) {
  const ch = challengeOf(it);
  const veil = it.status === 'reserved' ? '<div class="veil">예약중</div>' : it.status === 'traded' ? '<div class="veil">교환완료</div>' : '';
  const p = profileOf(it.owner);
  const regLabel = LOC.userRegionLabel ? LOC.userRegionLabel(p.region ? p : {region:it.region || ''}) : (p.region || it.region || '');
  const dist = it.owner !== App.me ? itemDistStr(it) : '';
  return `<button class="row" data-act="openItem" data-id="${it.id}" aria-label="${esc(it.title)} 상세 보기">
    <div class="thumb">${itemImg(it)}${veil}</div>
    <div class="row-body">
      <div class="row-title">${esc(it.title)}</div>
      <div class="row-meta">${esc(regLabel)}${dist ? ' · ' + esc(dist) : ''} · ${ago(it.createdAt)}</div>
      ${it.value ? `<div class="row-value num">${won(it.value)}</div>` : '<div class="row-value muted">가치 비공개</div>'}
      <div class="row-tags">${ch ? `<span class="tag accent">${I.clip}챌린지 ${ch.steps.length}단계</span>` : ''}<span class="tag">${COND[it.cond]}</span>${methodTags(it.methods)}</div>
    </div></button>`;
}
function matchCard(it, perfect) {
  const p = profileOf(it.owner);
  const dist = it.owner !== App.me ? itemDistStr(it) : '';
  return `<button class="mcard" data-act="openItem" data-id="${it.id}" aria-label="${esc(it.title)} 보기"><div class="mimg">${itemImg(it)}${perfect ? '<span class="mbadge tag solid-contrast">서로 찾던 물건</span>' : ''}</div><div class="mbody"><div class="mt">${esc(it.title)}</div><div class="mm">${esc(p.nickname)} · ${esc(dist || p.region || '')}</div></div></button>`;
}

/* ---- 홈 ---- */
function viewHome() {
  const me = profileOf(App.me);
  const nUnread = unreadNotifCount();
  const regionLabel = LOC.userRegionLabel ? LOC.userRegionLabel(me) : me.region;
  const right = `<div class="nav-actions">
    <button class="nav-btn" data-act="openNearbyMap" aria-label="주변 물건 지도로 보기">${I.map}</button>
    <button class="nav-btn" data-act="openNotifs" aria-label="알림${nUnread ? ' (' + nUnread + '개 안 읽음)' : ''}">${I.bell}${nUnread ? `<span class="bell-badge">${nUnread > 99 ? '99+' : nUnread}</span>` : ''}</button>
    <button class="nav-btn" data-act="openWants" aria-label="찾는 것 관리">${I.target}</button>
  </div>`;
  let h = `<div class="nav"><button class="region-btn" data-act="openRegion" aria-label="내 동네 설정 (${esc(regionLabel)})">${me.locVerified ? '<span class="region-dot" aria-hidden="true"></span>' : ''}<span class="rb-txt">${esc(regionLabel)}</span>${I.down}</button><div class="nav-title">홈</div>${right}</div>`;
  h += `<div class="home-sub">${esc(homeGreeting(me))}</div>`;
  h += `<div class="seg" data-seg="homeSeg" role="tablist" aria-label="홈 보기 방식"><button role="tab" aria-selected="${UI.homeSeg === 'match'}" class="${UI.homeSeg === 'match' ? 'on' : ''}" data-act="homeSeg" data-v="match">추천 매칭</button><button role="tab" aria-selected="${UI.homeSeg === 'all'}" class="${UI.homeSeg === 'all' ? 'on' : ''}" data-act="homeSeg" data-v="all">전체 물건</button></div>`;
  if (App.readOnly) h += `<div class="note">${I.info}<span>보기 전용으로 열렸어요. 물건을 등록하거나 제안하려면 공유 설정에서 참여자 권한이 필요해요.</span></div>`;

  const prog = onboardingProgress(App.me);
  const chkCard = !prog.allDone ? `<div class="checklist" aria-label="시작 가이드">
    <div class="chk-top"><b>바꿀래 시작하기 3단계</b><span class="num">${prog.doneCount}/3 완료</span></div>
    <div class="chk-bar"><i style="width:${Math.round((prog.doneCount / 3) * 100)}%"></i></div>
    ${prog.steps.map((st, idx) => `<button class="chk-row ${st.done ? 'done' : ''}" data-act="${st.act}"><span class="chk-ic">${st.done ? I.check : (idx + 1)}</span><span class="chk-txt"><span class="chk-title">${esc(st.label)}</span><small style="display:block;font-weight:500;color:var(--muted);font-size:.78rem">${esc(st.sub)}</small></span><span class="chev" style="color:var(--muted)">${I.chev}</span></button>`).join('')}
  </div>` : '';

  if (UI.homeSeg === 'match') {
    const wants = wantsOf(App.me);
    const {perfect, oneway} = matchFeed();
    if (perfect.length && !localStorage.getItem('baggullae_first_match_' + App.me)) {
      localStorage.setItem('baggullae_first_match_' + App.me, '1');
      setTimeout(() => { celebrate('mini'); toast('첫 "서로 찾던 물건" 매칭이 생겼어요!'); }, 350);
    }
    const hot = challenges().filter(c => c.status === 'active').sort((a, b) => (b.cheers || []).length - (a.cheers || []).length).slice(0, 8);
    const leftCol = `${chkCard}
      ${!wants.length
        ? `<div class="group">${emptyBox('target', '찾는 물건을 알려주세요', '등록하면 딱 맞는 교환 상대를 찾아드려요.', '<button class="btn btn-primary btn-sm" data-act="openWants">찾는 것 등록하기</button>')}</div>`
        : `<div class="section"><div class="section-head"><h2>서로 찾던 물건</h2><span class="more num">${perfect.length}개</span></div>${perfect.length ? `<div class="hscroll">${perfect.map(i => matchCard(i, true)).join('')}</div>` : `<div class="note contrast">${I.sparkle}<span>내 물건을 찾는 사람이 아직 없어요. 물건을 더 등록하면 매칭될 가능성이 커져요.</span></div>`}</div>
           <div class="section"><div class="section-head"><h2>내가 찾던 물건</h2><span class="more num">${oneway.length}개</span></div>${oneway.length ? `<div class="group">${oneway.map(itemRow).join('')}</div>` : `<div class="group">${emptyBox('search', '아직 찾는 물건이 올라오지 않았어요', '전체 물건에서 이웃들이 올린 물건을 둘러볼까요?', '<button class="btn btn-tint btn-sm" data-act="browseAll">전체 물건 둘러보기</button>')}</div>`}</div>`}`;
    const rightCol = `${hot.length ? `<div class="section"><div class="section-head"><h2>요즘 뜨는 챌린지</h2><button class="more" data-act="tab" data-tab="challenge">전체보기</button></div><div class="hscroll">${hot.map(c => { const cur = itemById(c.currentItemId); return `<button class="mcard" data-act="openChallenge" data-id="${c.id}"><div class="mimg">${cur ? itemImg(cur) : stepImg(c.steps[c.steps.length - 1])}<span class="mbadge tag solid-contrast">${c.steps.length}단계</span></div><div class="mbody"><div class="mt">${esc(c.title)}</div><div class="mm">${I.heartF.replace('<svg', '<svg style="width:11px;height:11px;vertical-align:-1px;color:var(--bad)"')} ${(c.cheers || []).length} · ${esc(profileOf(c.owner).nickname)}</div></div></button>`; }).join('')}</div></div>` : ''}
      ${wants.length ? `<div class="section"><div class="section-head"><h2>내가 찾는 것</h2><button class="more" data-act="openWants">편집 ${wants.length}/5</button></div><div class="chips wrap" style="padding:0 16px">${wants.map(w => `<span class="chip">${esc(wantLabel(w))}</span>`).join('')}<button class="chip" data-act="openWants">${I.edit}편집</button></div></div>` : ''}`;
    h += `<div class="stagger desktop-2col"><div>${leftCol}</div><div>${rightCol}</div></div>`;
  } else {
    h += `<div class="chips" role="group" aria-label="카테고리 필터"><button class="chip ${!UI.filterCat ? 'on' : ''}" data-act="fCat" data-v="0">전체</button>${CATS.map(c => `<button class="chip ${UI.filterCat === c.id ? 'on' : ''}" data-act="fCat" data-v="${c.id}">${c.n}</button>`).join('')}</div>`;
    h += `<div class="chips" style="margin-top:-4px" role="group" aria-label="교환 방식 및 거리 필터"><button class="chip ${!UI.filterMethod ? 'on-accent' : ''}" data-act="fMethod" data-v="">모든 방식</button>${Object.entries(METHODS).map(([k, v]) => `<button class="chip ${UI.filterMethod === k ? 'on-accent' : ''}" data-act="fMethod" data-v="${k}">${I[k]}${v}</button>`).join('')}<button class="chip ${UI.sortBy === 'distance' ? 'on' : ''}" data-act="toggleSort" aria-pressed="${UI.sortBy === 'distance'}">${I.pin}가까운 순</button></div>`;
    let rawList = allItems().filter(i => i.status !== 'traded');
    if (UI.filterCat) rawList = rawList.filter(i => parentOf(i.cat) === UI.filterCat);
    if (UI.filterMethod) rawList = rawList.filter(i => !i.methods || !i.methods.length || i.methods.includes(UI.filterMethod));
    const entries = LOC.filterAndSortItems
      ? LOC.filterAndSortItems(rawList, {rangeKm:UI.rangeKm, sortBy:UI.sortBy, myCoords:myGeoCoords(), getOwner:profileOf, cent:CENT})
      : rawList.sort((a, b) => b.createdAt - a.createdAt).map(item => ({item, dist:null}));
    const list = entries.map(e => e.item);
    const hasFilter = UI.filterCat || UI.filterMethod || UI.rangeKm > 0;
    const emptyBtn = hasFilter ? '<button class="btn btn-gray btn-sm" data-act="resetFilter">필터 초기화하기</button>' : '<button class="btn btn-primary btn-sm" data-act="newItem">첫 물건 등록하기</button>';
    h += `<div class="map-toolbar"><span class="mt-info">${UI.rangeKm ? `${esc(me.region)} 반경 ${UI.rangeKm}km · ` : ''}${list.length}개${UI.sortBy === 'distance' ? ' (가까운 순)' : ''}</span><button class="map-pill-btn" data-act="openNearbyMap">${I.map}지도로 보기</button></div>`;
    h += `<div class="stagger">${list.length ? `<div class="group">${list.map(itemRow).join('')}</div>` : `<div class="group">${emptyBox('search', '조건에 맞는 물건이 없어요', UI.rangeKm ? `반경 ${UI.rangeKm}km 범위를 넓히거나 필터를 초기화해 보세요.` : '필터를 초기화하거나 새 물건을 등록해 보세요.', emptyBtn)}</div>`}</div>`;
  }
  return h;
}

/* ---- 챌린지 탭 ---- */
function stepImg(s) { return s && s.img ? `<img src="${esc(assetUrl(s.img))}" alt="" referrerpolicy="no-referrer">` : phBox(s ? s.cat : 3); }
function viewChallenges() {
  const mine = myActiveChallenge();
  let h = navBar('빨간 클립 챌린지') + '<div class="large-title">빨간 클립 챌린지</div>';
  h += `<div class="stagger desktop-2col"><div>
    <div class="banner"><div class="bicon">${I.clip}</div><div style="flex:1"><div class="bt">볼펜 하나로 어디까지 갈 수 있을까?</div><div class="bs">작은 물건에서 시작해 교환을 이어가 보세요</div></div></div>
    <div style="padding:0 16px 18px">${mine ? `<button class="btn btn-tint btn-block" data-act="openChallenge" data-id="${mine.id}">${I.clip}내 챌린지 이어가기 · ${mine.steps.length}단계</button>` : `<button class="btn btn-primary btn-block" data-act="startChallenge">${I.plus}나도 챌린지 시작하기</button>`}</div>
  </div><div>`;
  h += `<div class="seg" data-seg="chalSeg"><button class="${UI.chalSeg === 'active' ? 'on' : ''}" data-act="chalSeg" data-v="active">진행 중</button><button class="${UI.chalSeg === 'finished' ? 'on' : ''}" data-act="chalSeg" data-v="finished">완주</button></div>`;
  const list = challenges().filter(c => c.status === UI.chalSeg).sort((a, b) => (b.cheers || []).length - (a.cheers || []).length || b.createdAt - a.createdAt);
  const empBtn = UI.chalSeg === 'active'
    ? '<button class="btn btn-primary btn-sm" data-act="startChallenge">챌린지 시작하기</button>'
    : '<button class="btn btn-tint btn-sm" data-act="chalSeg" data-v="active">진행 중 챌린지 보기</button>';
  h += list.length ? `<div class="group">${list.map(chalRow).join('')}</div>` : `<div class="group">${emptyBox('clip', UI.chalSeg === 'active' ? '진행 중인 챌린지가 없어요' : '아직 완주한 챌린지가 없어요', '첫 번째 주인공이 되어 보세요.', empBtn)}</div>`;
  return h + '</div></div>';
}
function chalRow(c) {
  const first = c.steps[0], last = c.steps[c.steps.length - 1];
  return `<button class="ccard" data-act="openChallenge" data-id="${c.id}"><div class="cpath"><div class="cp">${stepImg(first)}</div><span class="arr">${I.chev}</span><div class="cp">${stepImg(last)}</div></div><div class="ct"><b>${esc(c.title)}</b><span>${esc(first.title)} → ${esc(last.title)} · ${c.steps.length}단계</span></div><span class="cheer-n">${I.heartF.replace('<svg', '<svg style="color:var(--bad)"')}${(c.cheers || []).length}</span></button>`;
}

/* ---- 제안함 + 채팅 목록 ---- */
function viewOffers() {
  const all = myOffers();
  const recv = all.filter(o => o.to === App.me), sent = all.filter(o => o.from === App.me);
  const rooms = myChatRooms();
  const pendN = recv.filter(o => o.status === 'pending').length;
  const chatN = unreadChatCount();
  let h = navBar('제안함') + '<div class="large-title">제안함</div>';
  h += `<div class="seg" data-seg="offerSeg" role="tablist">
    <button role="tab" class="${UI.offerSeg === 'recv' ? 'on' : ''}" data-act="offerSeg" data-v="recv">받은 제안${pendN ? ' · ' + pendN : ''}</button>
    <button role="tab" class="${UI.offerSeg === 'sent' ? 'on' : ''}" data-act="offerSeg" data-v="sent">보낸 제안</button>
    <button role="tab" class="${UI.offerSeg === 'chat' ? 'on' : ''}" data-act="offerSeg" data-v="chat">채팅${chatN ? ' · ' + chatN : ''}</button>
  </div>`;

  if (UI.offerSeg === 'chat') {
    if (!rooms.length) {
      h += `<div class="group">${emptyBox('chat', '아직 열린 채팅방이 없어요', '교환 제안이 수락되면 1:1 채팅방이 자동으로 열려요.', '<button class="btn btn-primary btn-sm" data-act="browseAll">물건 둘러보기</button>')}</div>`;
      return h;
    }
    h += `<div class="group">${rooms.map(r => {
      const o = r.offer; const other = o.from === App.me ? o.to : o.from;
      const p = profileOf(other);
      const item = itemById(o.from === App.me ? o.target : o.offered) || {title:'물건', cat:3};
      const lastText = r.last ? (r.last.text ? r.last.text : '사진을 보냈어요') : '대화를 시작해 보세요';
      return `<button class="chat-row" data-act="openChat" data-id="${o.id}" aria-label="${esc(p.nickname)}님과의 채팅방 열기">
        <div class="chat-row-thumb">${itemImg(item)}</div>
        <div class="chat-row-body">
          <div class="chat-row-top"><b>${esc(p.nickname)}</b><span>${ago(r.lastAt)}</span></div>
          <div class="chat-row-msg">${esc(lastText)}</div>
        </div>
        ${r.unread ? `<span class="chat-unread num" aria-label="안 읽은 메시지 ${r.unread}개">${r.unread}</span>` : ''}
      </button>`;
    }).join('')}</div>`;
    return h;
  }

  const list = UI.offerSeg === 'recv' ? recv : sent;
  const order = {accepted:0, pending:1, completed:2, rejected:3, cancelled:4};
  list.sort((a, b) => order[a.status] - order[b.status] || (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
  const emp = UI.offerSeg === 'recv'
    ? emptyBox('inbox', '받은 제안이 없어요', '물건을 등록해 두면 이웃이 교환 제안을 보내요.', '<button class="btn btn-primary btn-sm" data-act="newItem">내 물건 등록하기</button>')
    : emptyBox('inbox', '보낸 제안이 없어요', '마음에 드는 물건을 찾아 교환을 제안해 보세요.', '<button class="btn btn-primary btn-sm" data-act="browseAll">물건 둘러보기</button>');
  h += list.length ? list.map(offerCard).join('') : `<div class="group">${emp}</div>`;
  return h;
}

const STATUS_LABEL = {pending:'대기 중', accepted:'교환 진행 중', completed:'교환 완료', rejected:'거절됨', cancelled:'취소됨'};
function offerCard(o) {
  const mineIsFrom = o.from === App.me; const other = mineIsFrom ? o.to : o.from;
  const myItem = itemById(mineIsFrom ? o.offered : o.target) || {title:'삭제된 물건', cat:3};
  const theirItem = itemById(mineIsFrom ? o.target : o.offered) || {title:'삭제된 물건', cat:3};
  const p = profileOf(other);
  const canChat = hasChatRoom(o);
  const unread = chatMessagesOf(o.id).filter(m => m.receiver === App.me && !m.readAt).length;
  let acts = '';
  if (o.status === 'pending' && !mineIsFrom) acts = `<button class="btn btn-gray" data-act="rejectOffer" data-id="${o.id}">거절</button><button class="btn btn-primary" data-act="acceptOffer" data-id="${o.id}">수락하기</button>`;
  else if (o.status === 'pending' && mineIsFrom) acts = `<button class="btn btn-gray" data-act="cancelOffer" data-id="${o.id}">제안 취소</button>`;
  else if (o.status === 'accepted') {
    const myDone = mineIsFrom ? o.fromDone : o.toDone;
    acts = `<button class="btn btn-contrast" data-act="openChat" data-id="${o.id}">${I.chat}채팅하기${unread ? ' (' + unread + ')' : ''}</button>${o.openchat ? `<a class="btn btn-gray" href="${esc(o.openchat)}" target="_blank" rel="noopener">오픈채팅</a>` : ''}${myDone ? '<button class="btn btn-gray" disabled>상대 확인 대기</button>' : `<button class="btn btn-primary" data-act="completeOffer" data-id="${o.id}">${I.check}교환 완료</button>`}`;
  } else if (o.status === 'completed') {
    const reviewed = S.reviews[o.id + '_' + App.me];
    const chal = challenges().find(c => c.owner === App.me && c.status === 'active' && c.awaitingNext && c.awaitingOffer === o.id);
    acts = `<button class="btn btn-gray" data-act="openChat" data-id="${o.id}">${I.chat}채팅 보기</button>${reviewed ? '<button class="btn btn-gray" disabled>후기 작성 완료</button>' : `<button class="btn btn-tint" data-act="reviewOffer" data-id="${o.id}">후기 남기기</button>`}${chal ? `<button class="btn btn-primary" data-act="continueChallenge" data-id="${chal.id}">${I.clip}챌린지 이어가기</button>` : ''}`;
  } else if (canChat) {
    acts = `<button class="btn btn-gray" data-act="openChat" data-id="${o.id}">${I.chat}지난 채팅 보기</button>`;
  }
  const meet = o.method === 'meet' && o.meet;
  return `<div class="ocard"><div class="ocard-top">${avatar(other, 'sm')}<button class="on" data-act="openUser" data-id="${other}" style="text-align:left">${esc(p.nickname)}<small>${mineIsFrom ? '내가 보낸 제안' : '나에게 온 제안'} · ${ago(o.updatedAt || o.createdAt)}</small></button><span class="pill ${o.status}">${STATUS_LABEL[o.status]}</span></div>
    <div class="swap"><button class="swap-item" data-act="openItem" data-id="${mineIsFrom ? o.offered : o.target}"><div class="si-img">${itemImg(myItem)}</div><div class="si-l">내 물건</div><div class="si-t">${esc(myItem.title)}</div></button><span class="swap-ic">${I.swap}</span><button class="swap-item" data-act="openItem" data-id="${mineIsFrom ? o.target : o.offered}"><div class="si-img">${itemImg(theirItem)}</div><div class="si-l">${esc(p.nickname)}님 물건</div><div class="si-t">${esc(theirItem.title)}</div></button></div>
    ${o.message ? `<div class="omsg">${esc(o.message)}</div>` : ''}
    <div class="ometa">${o.method ? `<span class="tag contrast">${I[o.method]}${METHODS[o.method]}</span>` : '<span class="tag">방식 협의</span>'}${o.method === 'door' || o.method === 'parcel' ? '<span class="tag">주소는 채팅에서</span>' : ''}${o.autoRejected ? '<span class="tag">다른 교환이 성사돼 자동 거절</span>' : ''}</div>
    ${meet ? `<div class="place"><div class="pmap">${miniMap(o.meet)}</div><div class="pinfo"><div class="pn">${esc(o.meet.name)}<small>만남 장소</small></div>${o.status === 'accepted' ? `<a href="${kakaoRouteUrl(o.meet)}" target="_blank" rel="noopener">길찾기</a>` : `<a href="${kakaoMapUrl(o.meet)}" target="_blank" rel="noopener">카카오맵</a>`}</div></div>` : ''}
    ${acts ? `<div class="oact">${acts}</div>` : ''}</div>`;
}

/* ---- 마이 ---- */
function profileBlock(id, own) {
  const p = profileOf(id); const t = tempOf(id); const reviews = reviewsFor(id);
  let h = `<div class="profile-head">${avatar(id, 'lg')}<div style="flex:1;min-width:0"><div class="pn">${esc(p.nickname)}</div><div class="pr">${esc(p.region)} · ${p.createdAt ? dateStr(p.createdAt) + ' 가입' : ''}</div></div>${own ? `<button class="btn btn-gray btn-sm" data-act="editProfile">프로필 수정</button>` : ''}</div>`;
  h += `<div class="tempcard"><div class="th"><span>교환온도</span><b class="num" style="color:${tempColor(t)}">${t.toFixed(1)}°C</b></div><div class="tbar"><i style="width:${Math.min(100, t)}%;background:${tempColor(t)}"></i></div><div class="tfoot"><span>첫 온도 36.5°C</span><span>좋아요 +0.5° · 별로예요 −1°</span></div></div>`;
  h += `<div class="stats"><div><b class="num">${tradeCount(id)}</b><span>교환 완료</span></div><div><b class="num">${itemsOf(id).filter(i => i.status !== 'traded').length}</b><span>교환 가능 물건</span></div><div><b class="num">${reviews.length}</b><span>받은 후기</span></div></div>`;
  return h;
}
function gridCards(items) {
  return `<div class="grid2">${items.map(it => `<button class="gcard" data-act="openItem" data-id="${it.id}"><div class="gi">${itemImg(it)}${it.status === 'reserved' ? '<div class="veil">예약중</div>' : it.status === 'traded' ? '<div class="veil">교환완료</div>' : ''}</div><div class="gt">${esc(it.title)}</div><div class="gm">${it.value ? won(it.value) : '가치 비공개'}</div></button>`).join('')}</div>`;
}
function reviewList(id, self = false) {
  const rs = reviewsFor(id);
  if (!rs.length) return `<div class="group">${emptyBox('chat', '아직 받은 후기가 없어요', self ? '교환을 완료하면 따뜻한 후기가 쌓여요.' : '', self ? '<button class="btn btn-tint btn-sm" data-act="browseAll">물건 둘러보기</button>' : '')}</div>`;
  const lbl = {good:'좋아요', soso:'보통이에요', bad:'별로예요'};
  return `<div class="group">${rs.map(r => `<div class="review"><div class="rh">${avatar(r.from, 'sm')}${esc(profileOf(r.from).nickname)}<small>· ${lbl[r.score]} · ${ago(r.at)}</small></div>${r.text ? `<p>${esc(r.text)}</p>` : ''}</div>`).join('')}</div>`;
}
function viewMe() {
  let h = navBar('나의 바꿀래') + '<div class="large-title">나의 바꿀래</div><div class="stagger desktop-2col"><div>';
  h += profileBlock(App.me, true);
  const wants = wantsOf(App.me);
  const myRegionTxt = LOC.userRegionLabel ? LOC.userRegionLabel(profileOf(App.me)) : profileOf(App.me).region;
  h += `<div class="section"><div class="section-head"><h2>찾는 것</h2><button class="more" data-act="openWants">편집 ${wants.length}/5</button></div><div class="chips">${wants.length ? wants.map(w => `<span class="chip">${esc(wantLabel(w))}</span>`).join('') : '<button class="chip" data-act="openWants">' + I.plus + '찾는 것 등록</button>'}</div></div>`;
  h += `<div class="group-label">설정</div><div class="group">
    <button class="menu-row" data-act="openRegion"><span class="mi" style="background:var(--accent)">${I.pin}</span><span class="ml">내 동네 설정</span><span class="mv">${esc(myRegionTxt)}</span><span class="chev">${I.chev}</span></button>
    <button class="menu-row" data-act="changePassword"><span class="mi" style="background:var(--contrast)">${I.lock}</span><span class="ml">비밀번호 변경</span><span class="chev">${I.chev}</span></button>
    <button class="menu-row" data-act="showPolicy"><span class="mi" style="background:var(--good)">${I.shield}</span><span class="ml">안전한 교환 가이드</span><span class="chev">${I.chev}</span></button>
    <button class="menu-row danger" data-act="logout"><span class="mi" style="background:var(--bad)">${I.logout}</span><span class="ml">로그아웃</span></button>
    <button class="menu-row danger" data-act="deleteAccount"><span class="mi" style="background:var(--muted)">${I.trash}</span><span class="ml">회원 탈퇴</span></button></div></div><div>`;
  h += `<div class="seg" data-seg="meSeg"><button class="${UI.meSeg === 'items' ? 'on' : ''}" data-act="meSeg" data-v="items">내 물건</button><button class="${UI.meSeg === 'favs' ? 'on' : ''}" data-act="meSeg" data-v="favs">찜한 물건</button><button class="${UI.meSeg === 'reviews' ? 'on' : ''}" data-act="meSeg" data-v="reviews">받은 후기</button></div>`;
  if (UI.meSeg === 'items') {
    const its = itemsOf(App.me);
    h += its.length ? gridCards(its) : `<div class="group">${emptyBox('camera', '등록한 물건이 없어요', '안 쓰는 물건을 올리고 필요한 물건과 바꿔 보세요.', '<button class="btn btn-primary btn-sm" data-act="newItem">물건 등록하기</button>')}</div>`;
  } else if (UI.meSeg === 'favs') {
    const favs = favoriteItems();
    h += favs.length ? gridCards(favs) : `<div class="group">${emptyBox('heart', '찜한 물건이 없어요', '마음에 드는 물건의 하트를 눌러 저장해 두세요.', '<button class="btn btn-primary btn-sm" data-act="browseAll">물건 둘러보기</button>')}</div>`;
  } else {
    h += reviewList(App.me, true);
  }
  return h + '</div></div>';
}

/* ============ 푸시 페이지 + iOS 좌측 가장자리 스와이프 뒤로가기 ============ */
function pushPage(p) {
  UI.stack.push(p);
  const el = document.createElement('div'); el.className = 'page'; el.dataset.key = p.key = newId();
  $('#pages').appendChild(el);
  renderPage(p, true);
  bindEdgeSwipe(el);
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
function bindEdgeSwipe(pageEl) {
  let sx = null, sy = null, dx = 0, swiping = false;
  const under = () => $('#main');
  pageEl.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    const rect = pageEl.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    if (x <= 28) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; dx = 0; swiping = false; }
  }, {passive:true});
  pageEl.addEventListener('touchmove', e => {
    if (sx == null) return;
    const curX = e.touches[0].clientX, curY = e.touches[0].clientY;
    const dX = curX - sx, dY = curY - sy;
    if (!swiping) {
      if (Math.abs(dY) > Math.abs(dX) && Math.abs(dY) > 10) { sx = null; return; }
      if (dX > 10) { swiping = true; pageEl.classList.add('swiping'); under().classList.add('swiping'); }
    }
    if (swiping) {
      dx = Math.max(0, dX);
      const w = pageEl.clientWidth || 390;
      const pct = Math.min(1, dx / w);
      pageEl.style.transform = `translateX(${dx}px)`;
      under().style.transform = `translateX(${-24 * (1 - pct)}%)`;
      under().style.filter = `brightness(${0.92 + 0.08 * pct})`;
    }
  }, {passive:true});
  const end = () => {
    if (sx == null) return;
    sx = null;
    if (!swiping) return;
    swiping = false;
    pageEl.classList.remove('swiping'); under().classList.remove('swiping');
    pageEl.style.transform = ''; under().style.transform = ''; under().style.filter = '';
    const w = pageEl.clientWidth || 390;
    if (dx > Math.min(100, w * 0.28)) popPage();
  };
  pageEl.addEventListener('touchend', end, {passive:true});
  pageEl.addEventListener('touchcancel', end, {passive:true});
}

function renderPage(p, first) {
  const el = $(`.page[data-key="${p.key}"]`); if (!el) return;
  if (p.type === 'chat') {
    renderChatPage(el, p, first);
    return;
  }
  const old = $('.view', el); const st = old ? old.scrollTop : 0;
  if (App.fetching && !first) { el.innerHTML = navBar('', {back:true}) + skeletonDetailHtml(); return; }
  const fn = {item:pageItem, challenge:pageChallenge, user:pageUser}[p.type];
  const out = fn(p.id);
  if (out == null) { el.innerHTML = navBar('', {back:true}) + emptyBox('info', '찾을 수 없어요', '삭제되었거나 아직 불러오는 중이에요.', '<button class="btn btn-tint btn-sm" data-act="back">돌아가기</button>'); return; }
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
  const fav = isFavorite(id);
  let h = `<div class="view no-tab">${navBar(it.title, {back:true, right: mine ? `<button class="nav-btn" data-act="itemMenu" data-id="${id}" aria-label="물건 관리 메뉴">${I.more}</button>` : `<button class="nav-btn" data-act="reportUser" data-id="${it.owner}" aria-label="사용자 신고">${I.flag}</button>`})}`;
  h += `<div class="gallery">${photos ? `<div class="gallery-track">${photos.map((s, i) => `<img src="${esc(assetUrl(s))}" alt="${esc(it.title)} 사진 ${i + 1}" data-act="viewPhoto" data-id="${id}" data-idx="${i}" referrerpolicy="no-referrer">`).join('')}</div>` : `<div class="gallery-track">${phBox(it.cat)}</div>`}${photos && photos.length > 1 ? `<div class="dots">${photos.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>` : ''}</div>`;
  h += `<button class="seller" data-act="openUser" data-id="${it.owner}">${avatar(it.owner)}<div><div class="sn">${esc(p.nickname)}${isExample(it.owner) ? ' <span class="tag">예시</span>' : ''}</div><div class="sr">${esc(LOC.userRegionLabel ? LOC.userRegionLabel(p) : p.region)}${!mine && itemDistStr(it) ? ' · ' + esc(itemDistStr(it)) : ''}</div></div><div class="temp"><div class="tv num" style="color:${tempColor(t)}">${t.toFixed(1)}°C</div><div class="tb"><i style="width:${Math.min(100, t)}%;background:${tempColor(t)}"></i></div><div class="tl">교환온도</div></div></button>`;
  h += `<div class="detail">`;
  if (ch) h += `<button class="note" style="margin:0 0 14px;width:100%;text-align:left" data-act="openChallenge" data-id="${it.challengeId}">${I.clip}<span>빨간 클립 챌린지 <b>${ch.steps.length}단계</b> 물건이에요. “${esc(ch.title)}” 타임라인 보기</span></button>`;
  h += `<h1>${esc(it.title)}</h1><div class="dm">${CAT_NAME[parentOf(it.cat)]} › ${CAT_NAME[it.cat]} · ${ago(it.createdAt)}</div>`;
  if (it.desc) h += `<div class="dd">${esc(it.desc)}</div>`;
  h += `<div class="specs"><div class="spec"><span class="k">상태</span><span class="v">${COND[it.cond]}</span></div><div class="spec"><span class="k">가치</span><span class="v num">${it.value ? won(it.value) + ' 상당' : '비공개'}</span></div><div class="spec"><span class="k">교환 성향</span><span class="v">${PREF[it.pref] || '가치 상관없음'}</span></div><div class="spec"><span class="k">교환 방식</span><span class="v">${it.methods && it.methods.length ? it.methods.map(m => METHODS[m]).join(' · ') : '협의 가능'}</span></div></div>`;
  if (it.meet) {
    const mc = myGeoCoords();
    const md = mc ? formatDist(haversine(mc.lat, mc.lng, it.meet.lat, it.meet.lng)) : '';
    h += `<div class="place"><div class="pmap">${miniMap(it.meet)}</div><div class="pinfo"><div class="pn">${esc(it.meet.name)}<small>대면 교환 희망 장소${md ? ' · 내 동네에서 약 ' + esc(md) : ''}</small></div><a href="${kakaoMapUrl(it.meet)}" target="_blank" rel="noopener">카카오맵</a></div></div>`;
  }
  const wants = wantsOf(it.owner);
  if (wants.length && !mine) h += `<div style="margin-top:18px"><div class="lbl" style="font-size:.9rem;font-weight:700;margin:0 4px 8px">${esc(p.nickname)}님이 찾는 것</div><div class="chips wrap">${wants.map(w => `<span class="chip ${itemsOf(App.me).some(mi => mi.status === 'available' && wantMatches(mi, w)) ? 'on-accent' : ''}">${esc(wantLabel(w))}</span>`).join('')}</div></div>`;
  h += `</div></div>`;

  const relatedOffers = offersFor(id).filter(o => o.from === App.me || o.to === App.me);
  const chatOffer = relatedOffers.find(hasChatRoom);
  if (mine) {
    const pend = offersFor(id).filter(o => o.target === id && o.status === 'pending').length;
    h += `<div class="bottom-bar"><div class="bb-info"><b>${it.status === 'available' ? '교환 가능' : it.status === 'reserved' ? '예약중' : '교환완료'}</b><span>받은 제안 ${pend}건</span></div><button class="btn btn-gray" data-act="editItem" data-id="${id}">수정</button>${chatOffer ? `<button class="btn btn-primary" data-act="openChat" data-id="${chatOffer.id}">${I.chat}채팅하기</button>` : `<button class="btn btn-primary" data-act="tabFromPage" data-tab="offers">제안함 보기</button>`}</div>`;
  } else {
    const sent = relatedOffers.find(o => o.target === id && o.from === App.me && (o.status === 'pending' || o.status === 'accepted'));
    const disabled = it.status !== 'available' || App.readOnly;
    const ex = isExample(it.owner);
    h += `<div class="bottom-bar">
      <button class="icon-btn ${fav ? 'on' : ''}" data-act="toggleFav" data-id="${id}" aria-label="${fav ? '찜 해제' : '찜하기'}" aria-pressed="${fav}">${fav ? I.heartF : I.heart}</button>
      <div class="bb-info"><b class="num">${it.value ? won(it.value) : '가치 비공개'}</b><span>${ex ? '예시 물건이라 실제 교환은 안 돼요' : PREF[it.pref] || ''}</span></div>
      ${chatOffer ? `<button class="btn btn-contrast" data-act="openChat" data-id="${chatOffer.id}">${I.chat}채팅하기</button>` : sent ? '<button class="btn btn-gray" data-act="tabFromPage" data-tab="offers">제안 보냄 · 제안함</button>' : `<button class="btn btn-primary" data-act="proposeOffer" data-id="${id}" ${disabled || ex ? 'disabled' : ''}>${I.swap}교환 제안하기</button>`}
    </div>`;
  }
  return h;
}

/* ============ 1:1 채팅 페이지 (iMessage 스타일) ============ */
function renderChatPage(el, p, first) {
  const o = offerById(p.id);
  if (!o) { el.innerHTML = navBar('채팅', {back:true}) + emptyBox('info', '채팅방을 찾을 수 없어요', '교환 제안이 삭제되었거나 권한이 없어요.', '<button class="btn btn-tint btn-sm" data-act="back">돌아가기</button>'); return; }
  const mineIsFrom = o.from === App.me;
  const other = mineIsFrom ? o.to : o.from;
  const op = profileOf(other);
  const myItem = itemById(mineIsFrom ? o.offered : o.target) || {title:'물건', cat:3};
  const theirItem = itemById(mineIsFrom ? o.target : o.offered) || {title:'물건', cat:3};
  const msgs = chatMessagesOf(o.id);
  const writable = canWriteChat(o);

  const msgListEl = $('#chatMsgs', el);
  const prevIds = p._seenMsgIds || new Set();
  const buildMessagesHtml = () => {
    if (!msgs.length) {
      return emptyBox('chat', `${op.nickname}님과 대화를 시작해 보세요`, '약속 장소와 시간을 정하고 즐겁게 교환해요.');
    }
    let out = ''; let lastDay = '';
    for (let i = 0; i < msgs.length; i++) {
      const m = msgs[i];
      const day = dateDayKey(m.at);
      if (day !== lastDay) { out += `<div class="chat-date">${dateKorean(m.at)}</div>`; lastDay = day; }
      const isMe = m.sender === App.me;
      const prev = msgs[i - 1], next = msgs[i + 1];
      const grouped = prev && prev.sender === m.sender && dateDayKey(prev.at) === day && (m.at - prev.at) < 120000;
      const tail = !next || next.sender !== m.sender || dateDayKey(next.at) !== day || (next.at - m.at) >= 120000;
      const anim = !first && !prevIds.has(m.id);
      prevIds.add(m.id);
      out += `<div class="msg-row ${isMe ? 'me' : ''} ${grouped ? 'grouped' : ''} ${tail ? 'tail' : ''} ${anim ? 'anim' : ''}"><div class="msg-bubble ${m.photo ? 'has-photo' : ''}">${m.photo ? `<img class="msg-photo" src="${esc(assetUrl(m.photo))}" alt="채팅 사진" data-act="viewChatPhoto" data-src="${esc(m.photo)}" referrerpolicy="no-referrer">` : ''}${m.text ? `<div class="msg-text">${esc(m.text)}</div>` : ''}</div>${tail ? `<div class="msg-meta">${isMe && m.readAt ? '<span class="msg-read">읽음</span>' : ''}<span>${timeStr(m.at)}</span></div>` : ''}</div>`;
    }
    return out;
  };

  if (!first && msgListEl && el.dataset.offerStatus === `${o.status}_${writable}`) {
    const atBottom = (msgListEl.scrollHeight - msgListEl.scrollTop - msgListEl.clientHeight) < 80;
    msgListEl.innerHTML = buildMessagesHtml();
    if (atBottom) msgListEl.scrollTop = msgListEl.scrollHeight;
    return;
  }

  p._seenMsgIds = prevIds;
  el.dataset.offerStatus = `${o.status}_${writable}`;
  const rightBtn = o.openchat ? `<a class="nav-btn" href="${esc(o.openchat)}" target="_blank" rel="noopener" aria-label="카카오 오픈채팅 열기">${I.share}</a>` : `<button class="nav-btn" data-act="openUser" data-id="${other}" aria-label="${esc(op.nickname)} 프로필">${I.user}</button>`;

  el.innerHTML = `<div class="chat-shell">
    ${navBar(op.nickname, {back:true, glassy:true, showTitle:true, right:rightBtn})}
    <button class="chat-banner" data-act="openItem" data-id="${mineIsFrom ? o.target : o.offered}">
      <div class="chat-banner-img">${itemImg(theirItem)}</div>
      <div class="chat-banner-info"><b>${esc(theirItem.title)} ↔ ${esc(myItem.title)}</b><span>${STATUS_LABEL[o.status]} · ${o.method ? METHODS[o.method] : '방식 협의'}</span></div>
      <span class="chev" style="color:var(--muted)">${I.chev}</span>
    </button>
    <div class="chat-msgs" id="chatMsgs" role="log" aria-live="polite" aria-label="대화 내용">${buildMessagesHtml()}</div>
    ${writable
      ? `<div class="chat-compose">
          <div class="chat-preview hidden" id="chatPreview"><img id="chatPrevImg" alt="보낼 사진 미리보기"><button type="button" id="chatPrevDel" aria-label="사진 취소">${I.close}</button></div>
          <div class="chat-bar">
            <button type="button" class="nav-btn" id="chatPickPhoto" aria-label="사진 보내기">${I.camera}</button>
            <input type="file" id="chatFile" accept="image/*" hidden>
            <textarea class="chat-input" id="chatInput" rows="1" maxlength="1000" placeholder="메시지 보내기" aria-label="메시지 입력"></textarea>
            <button type="button" class="chat-send" id="chatSend" disabled aria-label="전송">${I.send}</button>
          </div>
        </div>`
      : `<div class="chat-compose"><div class="chat-readonly">교환이 끝난 지 7일이 지나 읽기 전용이에요.</div></div>`}
  </div>`;

  const sc = $('#chatMsgs', el);
  requestAnimationFrame(() => { sc.scrollTop = sc.scrollHeight; });
  markChatRead(o.id);

  if (!writable) return;
  let pendingFile = null, pendingPreviewUrl = '';
  const inp = $('#chatInput', el), sendBtn = $('#chatSend', el), prevWrap = $('#chatPreview', el), prevImg = $('#chatPrevImg', el), fileInp = $('#chatFile', el);
  const syncSend = () => { sendBtn.disabled = !inp.value.trim() && !pendingFile; };
  const clearPhoto = () => {
    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    pendingFile = null; pendingPreviewUrl = '';
    prevWrap.classList.add('hidden'); prevImg.removeAttribute('src'); syncSend();
  };
  $('#chatPickPhoto', el).addEventListener('click', () => fileInp.click());
  $('#chatPrevDel', el).addEventListener('click', clearPhoto);
  fileInp.addEventListener('change', e => {
    const file = e.target.files[0]; e.target.value = '';
    if (!file) return;
    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    pendingFile = file; pendingPreviewUrl = URL.createObjectURL(file);
    prevImg.src = pendingPreviewUrl; prevWrap.classList.remove('hidden'); syncSend();
  });
  inp.addEventListener('input', () => {
    inp.style.height = 'auto';
    inp.style.height = Math.min(110, inp.scrollHeight) + 'px';
    syncSend();
  });
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); if (!sendBtn.disabled) doSend(); }
  });
  const doSend = async () => {
    const text = inp.value.trim();
    if (!text && !pendingFile) return;
    if (text && detectPrivateInfo(text)) {
      const ok = await confirmDialog('개인정보가 포함돼 있어요', '전화번호나 주소가 포함된 것 같아요. 정말 보낼까요?\n대면 교환은 역·카페 같은 공공장소를 추천해요.', '보내기');
      if (!ok) return;
    }
    sendBtn.disabled = true;
    const msgId = newId();
    const fileToUpload = pendingFile;
    inp.value = ''; inp.style.height = 'auto';
    clearPhoto();
    try {
      let photoUrl = null;
      if (fileToUpload) {
        const tmpUrl = URL.createObjectURL(fileToUpload);
        try {
          const blob = await shrinkBlob(tmpUrl, 1080, 0.8);
          photoUrl = await uploadPhotoBlob(`chat_${o.id}`, msgId, blob);
        } finally { URL.revokeObjectURL(tmpUrl); }
      }
      await Store.set('messages', msgId, {offer:o.id, sender:App.me, receiver:other, text, photo:photoUrl, at:now(), readAt:null});
      requestAnimationFrame(() => { sc.scrollTop = sc.scrollHeight; });
    } catch (e) {
      if (text && !inp.value) inp.value = text;
      syncSend();
    }
  };
  sendBtn.addEventListener('click', doSend);
}

async function markChatRead(offerId) {
  const unread = chatMessagesOf(offerId).some(m => m.receiver === App.me && !m.readAt);
  if (!unread) return;
  try { await Store.rpc('mark_chat_read', {p_offer:offerId}); } catch (e) {}
}

function pageChallenge(id) {
  const c = S.challenges[id]; if (!c) return null;
  const own = c.owner === App.me; const cheered = (c.cheers || []).includes(App.me);
  const cur = itemById(c.currentItemId);
  let h = `<div class="view no-tab">${navBar(c.title, {back:true, right:`<button class="nav-btn" data-act="shareChallenge" data-id="${id}" aria-label="공유 카드 만들기">${I.share}</button>`})}`;
  h += `<div class="chero"><span class="tag ${c.status === 'finished' ? 'solid-contrast' : 'accent'}">${c.status === 'finished' ? '완주' : '진행 중'}</span><h1 style="margin-top:10px">${esc(c.title)}</h1>${c.goal ? `<div class="cg">목표 · ${esc(c.goal)}</div>` : ''}<div class="cs"><div><b class="num">${c.steps.length}</b><span>단계</span></div><div><b class="num">${(c.cheers || []).length}</b><span>응원</span></div><div><b class="num">${Math.max(0, Math.ceil((now() - c.createdAt) / 86400000))}</b><span>일째</span></div></div>
    <button class="seller" style="padding:14px 0 0;border:0" data-act="openUser" data-id="${c.owner}">${avatar(c.owner, 'sm')}<div><div class="sn" style="font-size:.92rem">${esc(profileOf(c.owner).nickname)}</div></div></button></div>`;
  h += `<div class="section-head"><h2>교환 타임라인</h2></div><div class="timeline">`;
  c.steps.forEach((s, i) => {
    h += `<div class="tstep ${i === 0 ? 'start' : ''}" style="animation-delay:${i * 0.06}s"><div class="tnum num">${i + 1}</div><div class="tbody"><div class="ti">${stepImg(s)}</div><div class="tt"><b>${esc(s.title)}</b><span>${i === 0 ? '시작 물건' : esc(profileOf(s.from).nickname) + '님과 교환'} · ${dateStr(s.at)}</span>${s.note ? `<p>${esc(s.note)}</p>` : ''}${own && i > 0 ? `<button class="btn btn-ghost btn-sm" style="padding:0;min-height:36px" data-act="noteStep" data-id="${id}" data-i="${i}">${s.note ? '소감 수정' : '소감 남기기'}</button>` : ''}</div></div></div>`;
  });
  if (c.status === 'active') h += `<div class="tstep"><div class="tnum num" style="background:var(--surface-2);color:var(--muted)">${c.steps.length + 1}</div><div class="tbody tnext"><div class="tt"><b>다음엔 무엇으로 바뀔까요?</b><span>${cur ? '아래 물건에 교환을 제안해 보세요' : own ? '받은 물건을 등록하면 챌린지가 이어져요' : '진행자가 다음 물건을 준비하고 있어요'}</span></div></div></div>`;
  h += `</div>`;
  if (cur && c.status === 'active') h += `<div class="section-head" style="margin-top:6px"><h2>지금 교환할 수 있는 물건</h2></div><div class="group">${itemRow(cur)}</div>`;
  if (own && c.status === 'active') h += `<div style="padding:18px 16px 0;display:flex;flex-direction:column;gap:8px">${c.awaitingNext ? `<button class="btn btn-primary btn-block" data-act="continueChallenge" data-id="${id}">${I.plus}받은 물건으로 이어가기</button>` : ''}<button class="btn btn-gray btn-block" data-act="finishChallenge" data-id="${id}">${I.trophy}챌린지 완주하기</button></div>`;
  h += `</div><div class="bottom-bar"><button class="icon-btn ${cheered ? 'on' : ''}" data-act="cheer" data-id="${id}" aria-label="응원하기" aria-pressed="${cheered}">${cheered ? I.heartF : I.heart}</button><div class="bb-info"><b class="num">응원 ${(c.cheers || []).length}</b><span>${cheered ? '응원하고 있어요' : '하트로 응원해 주세요'}</span></div>${cur && !own && c.status === 'active' && cur.status === 'available' ? `<button class="btn btn-primary" data-act="proposeOffer" data-id="${cur.id}" ${App.readOnly ? 'disabled' : ''}>${I.swap}교환 제안하기</button>` : ''}</div>`;
  return h;
}

function pageUser(id) {
  if (!S.profiles[id]) return null;
  const own = id === App.me; const p = profileOf(id);
  let h = `<div class="view no-tab">${navBar(p.nickname, {back:true, right: own ? '' : `<button class="nav-btn" data-act="reportUser" data-id="${id}" aria-label="사용자 신고">${I.flag}</button>`})}`;
  h += profileBlock(id, false);
  const wants = wantsOf(id);
  if (wants.length) h += `<div class="section"><div class="section-head"><h2>찾는 것</h2></div><div class="chips">${wants.map(w => `<span class="chip">${esc(wantLabel(w))}</span>`).join('')}</div></div>`;
  const its = itemsOf(id);
  h += `<div class="section"><div class="section-head"><h2>교환 물건</h2><span class="more">${its.length}개</span></div>${its.length ? gridCards(its) : `<div class="group">${emptyBox('camera', '등록한 물건이 없어요', '이웃이 아직 물건을 올리지 않았어요.', '<button class="btn btn-tint btn-sm" data-act="back">돌아가기</button>')}</div>`}</div>`;
  h += `<div class="section"><div class="section-head"><h2>받은 후기</h2></div>${reviewList(id, false)}</div></div>`;
  return h;
}

/* ============ 전체 화면 사진 뷰어 (스와이프 · 핀치 줌 · 아래로 닫기) ============ */
function openPhotoViewer(photos, startIdx = 0) {
  if (!photos || !photos.length) return;
  const v = document.createElement('div');
  v.className = 'viewer'; v.setAttribute('role', 'dialog'); v.setAttribute('aria-label', '사진 확대 보기');
  v.innerHTML = `<div class="viewer-top"><span class="viewer-count num" id="vCount">${startIdx + 1} / ${photos.length}</span><button class="viewer-close" id="vClose" aria-label="사진 닫기">${I.close}</button></div>
    <div class="viewer-track" id="vTrack">${photos.map((src, i) => `<div class="viewer-slide"><img src="${esc(assetUrl(src))}" alt="사진 ${i + 1}" referrerpolicy="no-referrer"></div>`).join('')}</div>
    ${photos.length > 1 ? `<div class="viewer-dots" id="vDots">${photos.map((_, i) => `<i class="${i === startIdx ? 'on' : ''}"></i>`).join('')}</div>` : ''}`;
  document.body.appendChild(v);
  requestAnimationFrame(() => v.classList.add('in'));

  const track = $('#vTrack', v);
  const count = $('#vCount', v);
  const close = () => { v.classList.remove('in'); setTimeout(() => v.remove(), 260); };
  $('#vClose', v).addEventListener('click', close);
  const keyH = e => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', keyH); } };
  document.addEventListener('keydown', keyH);

  requestAnimationFrame(() => { track.scrollLeft = startIdx * track.clientWidth; });
  track.addEventListener('scroll', () => {
    const idx = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    count.textContent = `${idx + 1} / ${photos.length}`;
    $$('#vDots i', v).forEach((d, k) => d.classList.toggle('on', k === idx));
  }, {passive:true});

  // 핀치 줌 + 더블탭 줌 + 아래로 내려 닫기
  let scale = 1, startDist = 0, startScale = 1, lastTap = 0, dragY0 = null, dragDy = 0;
  const activeImg = () => {
    const idx = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    return $$('.viewer-slide img', v)[idx];
  };
  const applyScale = (s, img) => {
    scale = Math.max(1, Math.min(3.5, s));
    if (img) img.style.transform = `scale(${scale})`;
    track.style.overflowX = scale > 1.05 ? 'hidden' : 'auto';
  };
  track.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      startDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      startScale = scale; dragY0 = null;
    } else if (e.touches.length === 1) {
      const tNow = Date.now();
      if (tNow - lastTap < 280) {
        const img = activeImg();
        applyScale(scale > 1.2 ? 1 : 2.2, img);
        lastTap = 0;
        return;
      }
      lastTap = tNow;
      if (scale <= 1.05) { dragY0 = e.touches[0].clientY; dragDy = 0; }
    }
  }, {passive:true});
  track.addEventListener('touchmove', e => {
    const img = activeImg();
    if (e.touches.length === 2 && startDist > 0) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      applyScale(startScale * (dist / startDist), img);
    } else if (e.touches.length === 1 && dragY0 != null && scale <= 1.05) {
      const dy = e.touches[0].clientY - dragY0;
      if (dy > 12) {
        dragDy = dy;
        track.style.transform = `translateY(${dy}px)`;
        v.style.background = `rgba(10,9,8,${Math.max(0.3, 0.96 - dy / 450)})`;
      }
    }
  }, {passive:true});
  track.addEventListener('touchend', () => {
    if (dragY0 != null) {
      dragY0 = null;
      if (dragDy > 110) { close(); return; }
      track.style.transform = ''; v.style.background = ''; dragDy = 0;
    }
    if (scale < 1.05) applyScale(1, activeImg());
  }, {passive:true});
}

/* ============ 시트 / 다이얼로그 / 토스트(되돌리기) / 버튼 잠금 ============ */
function openSheet({title, body, foot = '', full = false, onMount, onBeforeClose, left = '', right = ''}) {
  const bd = document.createElement('div'); bd.className = 'backdrop';
  const sh = document.createElement('div'); sh.className = 'sheet' + (full ? ' full' : '');
  sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true'); sh.setAttribute('aria-label', title || '');
  sh.innerHTML = `<div class="sheet-grab" aria-label="시트 크기 조절 및 닫기"><i></i></div><div class="sheet-head">${left || `<button class="nav-btn" data-act="closeSheet" aria-label="닫기">${I.close}</button>`}<h3>${esc(title || '')}</h3>${right || '<span class="nav-spacer"></span>'}</div><div class="sheet-body">${body}</div>${foot ? `<div class="sheet-foot">${foot}</div>` : ''}`;
  $('#stage').append(bd, sh);
  sh._bd = bd; sh._onBeforeClose = onBeforeClose;
  requestAnimationFrame(() => requestAnimationFrame(() => { bd.classList.add('in'); sh.classList.add('in'); }));
  bd.addEventListener('click', () => closeSheet(sh));

  // 바텀시트 위로 끌면 커지고(.full), 아래로 끌면 닫힘
  const grab = $('.sheet-grab', sh); let y0 = null, dy = 0;
  grab.addEventListener('pointerdown', e => { y0 = e.clientY; dy = 0; sh.classList.add('dragging'); grab.setPointerCapture(e.pointerId); });
  grab.addEventListener('pointermove', e => {
    if (y0 == null) return;
    dy = e.clientY - y0;
    if (dy > 0) sh.style.transform = `translateY(${dy}px)`;
    else sh.style.transform = `translateY(${Math.max(-36, dy * 0.3)}px)`;
  });
  const end = () => {
    if (y0 == null) return;
    y0 = null; sh.classList.remove('dragging'); sh.style.transform = '';
    if (dy < -55) { sh.classList.add('full'); }
    else if (dy > 110) { closeSheet(sh); }
  };
  grab.addEventListener('pointerup', end); grab.addEventListener('pointercancel', end);
  if (onMount) onMount(sh);
  return sh;
}
async function closeSheet(sh, {force = false} = {}) {
  sh = sh || $$('.sheet').pop(); if (!sh || sh._closing) return;
  if (!force && sh._onBeforeClose) {
    const ok = await sh._onBeforeClose();
    if (!ok) return;
  }
  sh._closing = true;
  sh.classList.remove('in'); sh._bd.classList.remove('in');
  if (sh._onClose) sh._onClose();
  setTimeout(() => { sh.remove(); sh._bd.remove(); }, 450);
}
function confirmDialog(title, msg, okLabel = '확인', danger = false) {
  return new Promise(res => {
    const bd = document.createElement('div'); bd.className = 'backdrop'; bd.style.zIndex = 90;
    const d = document.createElement('div'); d.className = 'dialog'; d.setAttribute('role', 'alertdialog'); d.setAttribute('aria-modal', 'true');
    d.innerHTML = `<div class="dt">${esc(title)}</div>${msg ? `<div class="dm">${esc(msg)}</div>` : ''}<div class="da"><button data-r="0">취소</button><button data-r="1" class="strong ${danger ? 'danger' : ''}">${esc(okLabel)}</button></div>`;
    $('#stage').append(bd, d);
    requestAnimationFrame(() => { bd.classList.add('in'); d.classList.add('in'); });
    const done = v => { d.classList.remove('in'); bd.classList.remove('in'); setTimeout(() => { d.remove(); bd.remove(); }, 300); res(v); };
    d.addEventListener('click', e => { const b = e.target.closest('button'); if (b) done(b.dataset.r === '1'); });
    bd.addEventListener('click', () => done(false));
    setTimeout(() => $('button.strong', d).focus(), 50);
  });
}

let toastT, toastActionHandler = null;
function toast(msg, opts = {}) {
  let t = $('#toast');
  if (!t) {
    t = document.createElement('div'); t.id = 'toast'; t.className = 'toast';
    t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite');
    $('#stage').appendChild(t);
  }
  toastActionHandler = opts.onAction || null;
  t.innerHTML = `<span>${esc(msg)}</span>${opts.actionLabel ? `<button type="button" class="toast-undo" id="toastUndo">${esc(opts.actionLabel)}</button>` : ''}`;
  const ub = $('#toastUndo', t);
  if (ub) ub.addEventListener('click', () => { const fn = toastActionHandler; toastActionHandler = null; clearTimeout(toastT); t.classList.remove('in'); if (fn) fn(); });
  requestAnimationFrame(() => t.classList.add('in'));
  clearTimeout(toastT);
  toastT = setTimeout(() => { t.classList.remove('in'); toastActionHandler = null; }, opts.duration || (opts.actionLabel ? 5000 : 2800));
}

function scheduleUndoableOp(key, {msg, delay = 5000, onUndo, onCommit}) {
  if (PendingOps.has(key)) { clearTimeout(PendingOps.get(key).timer); PendingOps.delete(key); }
  const entry = {
    commit: async () => {
      if (!PendingOps.has(key)) return;
      PendingOps.delete(key);
      await onCommit();
    },
    timer: setTimeout(async () => {
      if (!PendingOps.has(key)) return;
      PendingOps.delete(key);
      try { await onCommit(); } catch (e) {}
    }, delay)
  };
  PendingOps.set(key, entry);
  toast(msg, {
    actionLabel:'되돌리기',
    duration:delay,
    onAction:() => {
      const p = PendingOps.get(key);
      if (p) { clearTimeout(p.timer); PendingOps.delete(key); }
      if (onUndo) onUndo();
      toast('실행을 되돌렸어요.');
    }
  });
}
function flushPendingOps() {
  for (const [k, op] of PendingOps.entries()) {
    clearTimeout(op.timer); PendingOps.delete(k);
    try { op.commit(); } catch (e) {}
  }
}
window.addEventListener('pagehide', flushPendingOps);

async function withLock(btn, busyText, fn) {
  if (!btn || btn.dataset.busy === '1') return;
  const orig = btn.innerHTML;
  btn.dataset.busy = '1'; btn.disabled = true;
  if (busyText) btn.textContent = busyText;
  try { return await fn(); }
  finally {
    if (document.body.contains(btn)) { btn.dataset.busy = '0'; btn.disabled = false; btn.innerHTML = orig; }
  }
}

function guardWrite() { if (App.readOnly) { toast('보기 전용이라 저장할 수 없어요. 참여자 권한을 확인해 주세요.'); return false; } return true; }

/* ============ 인증 (로그인 · 회원가입 · 비밀번호 찾기/재설정 · 온보딩) ============ */
const OB = {step:0, nickname:'', region:'', dong:'', loc:null, locVerified:false, wants:[], agree:[false, false, false]};
function renderAuth() {
  let a = $('#auth'); if (!a) { a = document.createElement('div'); a.id = 'auth'; a.className = 'auth'; $('#stage').appendChild(a); }
  $('#fab').classList.add('hidden'); $('#tabbar').classList.add('hidden');
  if (a.dataset.mode === 'onboard' || a.dataset.mode === 'form' || a.dataset.mode === 'reset') return;
  a.dataset.mode = 'welcome';
  a.innerHTML = `<div class="auth-hero"><div class="logo">${I.swap}</div><h1>돈 말고 물건으로,<br>딱 맞는 교환 상대</h1><p class="lead" style="margin:0">가진 것과 찾는 것을 등록하면<br>서로 원하는 사람을 이어드려요.</p>
    <div class="auth-feats"><div class="auth-feat"><i style="background:var(--accent-soft);color:var(--accent-text)">${I.sparkle}</i>서로 찾던 물건끼리 자동 매칭</div><div class="auth-feat"><i style="background:var(--contrast-soft);color:var(--contrast-text)">${I.pin}</i>대면 · 문고리 · 택배, 원하는 방식으로</div><div class="auth-feat"><i style="background:var(--surface-2);color:var(--text)">${I.clip}</i>볼펜 하나로 시작하는 빨간 클립 챌린지</div></div></div>
    <div class="auth-actions"><button class="btn btn-primary btn-block" data-act="signup">시작하기 · 회원가입</button><button class="btn btn-gray btn-block" data-act="login">이미 가입했어요 · 로그인</button></div>
    <div class="auth-foot">로그인은 Supabase 인증으로 안전하게 처리돼요.</div>`;
}

function leaveAuth(msg) {
  const a = $('#auth'); UI.tab = 'home'; UI.enterTab = true;
  if (!a) { render(); if (msg) toast(msg); return; }
  a.dataset.leaving = '1';
  a.style.pointerEvents = 'none';
  a.style.transition = 'opacity .34s var(--spring), transform .42s var(--spring)';
  a.style.opacity = '0';
  a.style.transform = 'scale(1.03)';
  render();
  setTimeout(() => {
    if (document.body.contains(a)) a.remove();
    if (msg) toast(msg);
  }, 360);
}

function renderOnboard(animate = true) {
  const a = $('#auth'); a.dataset.mode = 'onboard';
  const s = OB.step;
  let body = '';
  if (s === 0) body = `<h2>반가워요!<br>어떻게 불러드릴까요?</h2><p class="lead">교환할 때 상대에게 보이는 닉네임이에요.</p><div class="field"><label for="obNick">닉네임</label><input class="input" id="obNick" maxlength="10" placeholder="2~10자 닉네임" value="${esc(OB.nickname)}" autocomplete="nickname"><div class="hint" id="obNickHint">한글, 영문, 숫자로 2~10자</div></div>`;
  else if (s === 1) body = `<h2>어느 동네에서<br>교환하시나요?</h2><p class="lead">현재 위치로 찾거나 아래에서 직접 고를 수 있어요.</p>
    <button type="button" class="loc-btn" data-act="obGps" id="obGpsBtn" style="margin-bottom:12px">${I.gps}<span>현재 위치로 내 동네 찾기</span></button>
    <div id="obGpsStatus" style="margin-bottom:12px">${OB.locVerified && OB.region ? `<div class="loc-verified">${I.check}<span>${esc(OB.dong ? `${OB.region} · ${OB.dong}` : OB.region)} 확인됨</span></div>` : ''}</div>
    <div class="region-grid">${REGIONS.map(r => `<button class="chip ${OB.region === r ? 'on-accent' : ''}" data-act="obRegion" data-v="${esc(r)}">${esc(r)}</button>`).join('')}</div>`;
  else if (s === 2) body = `<h2>찾고 있는 물건이<br>있나요?</h2><p class="lead">나중에 등록해도 괜찮아요. 최대 5개까지 고를 수 있어요.</p><div class="chips wrap">${CATS.map(c => c.subs.map(([id, n]) => { const on = OB.wants.some(w => w.c === id); return `<button class="chip ${on ? 'on-accent' : ''}" data-act="obWant" data-v="${id}">${n}</button>`; }).join('')).join('')}</div>`;
  else body = `<h2>마지막으로<br>약속해 주세요</h2><p class="lead">모두가 믿고 교환할 수 있도록 지켜야 할 것들이에요.</p>${[['이용약관 동의 (필수)', '교환은 당사자 간 거래이며 바꿀래는 중개하지 않아요.'], ['개인정보 처리 동의 (필수)', '닉네임·동네·등록 물건만 저장해요. 주소는 저장하지 않아요.'], ['안전 교환 약속 (필수)', '대면은 역·카페 같은 공공장소에서, 현금 거래는 하지 않아요.']].map(([b, t], i) => `<button class="check-row ${OB.agree[i] ? 'on' : ''}" data-act="obAgree" data-i="${i}"><span class="cbox">${I.check}</span><span><b>${b}</b><span>${t}</span></span></button>`).join('')}`;
  const can = s === 0 ? validNick(OB.nickname) === '' : s === 1 ? !!OB.region : s === 2 ? true : OB.agree.every(Boolean);
  a.innerHTML = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px"><button class="nav-btn" data-act="obBack" aria-label="뒤로">${I.back}</button></div><div class="steps-dots">${[0, 1, 2, 3].map(i => `<i class="${i <= s ? 'on' : ''}"></i>`).join('')}</div><div class="ob-step ${animate ? 'anim' : ''}" style="flex:1">${body}</div><div class="auth-actions" style="margin-top:20px;animation:none">${s === 2 ? `<button class="btn btn-primary btn-block" data-act="obNext">${OB.wants.length ? OB.wants.length + '개 선택 · 다음' : '건너뛰기'}</button>` : `<button class="btn btn-primary btn-block" data-act="obNext" ${can ? '' : 'disabled'}>${s === 3 ? '가입 완료' : '다음'}</button>`}</div>`;
  if (s === 0) { const inp = $('#obNick'); setTimeout(() => inp.focus(), 300); inp.addEventListener('input', () => { OB.nickname = inp.value; const err = validNick(inp.value); const h = $('#obNickHint'); h.textContent = err || '좋은 닉네임이에요!'; h.classList.toggle('err', !!err && inp.value.length > 0); $('[data-act="obNext"]').disabled = !!err; }); inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !validNick(inp.value)) ACT.obNext(); }); }
}
function validNick(v, self) {
  v = (v || '').trim();
  if (v.length < 2 || v.length > 10) return '닉네임 길이가 맞지 않아요. 2~10자로 입력해 주세요.';
  if (!/^[가-힣a-zA-Z0-9]+$/.test(v)) return '사용할 수 없는 글자가 있어요. 한글, 영문, 숫자만 써 주세요.';
  if (Object.entries(S.profiles).some(([id, p]) => id !== self && p.nickname === v)) return '이미 쓰고 있는 닉네임이에요. 다른 닉네임을 입력해 주세요.';
  return '';
}

function evalPasswordSecurity(pw, pw2 = '') {
  const s = String(pw || '');
  const s2 = String(pw2 || '');
  const len = s.length >= 8;
  const mix = /[a-zA-Z]/.test(s) && /\d/.test(s);
  const special = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]/.test(s) || s.length >= 12;
  let level = 0;
  let label = '';
  if (s.length > 0) {
    if (!len) { level = 1; label = '보안 약함 · 8자 이상 필요해요'; }
    else if (mix && special) { level = 4; label = '매우 안전해요'; }
    else if (mix || special) { level = 3; label = '안전해요 · 좋은 비밀번호예요'; }
    else { level = 2; label = '보통 · 영문과 숫자를 섞어 보세요'; }
  }
  const match = !s2 ? 'empty' : (s.length > 0 && s === s2 ? 'match' : 'mismatch');
  return {level, label, rules:{len, mix, special}, match, length:s.length};
}
function pwFieldHtml(id, label, auto, small = '') {
  return `<div class="field"><label for="${id}">${label}${small ? ` <small>${small}</small>` : ''}</label><div class="input-wrap pw-wrap"><input class="input" id="${id}" type="password" autocomplete="${auto}"><button type="button" class="pw-eye" data-pw-for="${id}" aria-label="${label} 보기" aria-pressed="false">${I.eye}</button></div></div>`;
}
function pwMeterHtml(prefix) {
  return `<div class="pw-collapse" id="${prefix}Collapse"><div><div class="pw-sec-card" id="${prefix}Card" data-lvl="0">
    <div class="pw-sec-head"><span class="pw-shield">${I.shield}</span><span class="pw-sec-lbl" id="${prefix}Lbl">비밀번호 보안</span><span class="pw-sec-cnt" id="${prefix}Cnt">0자</span></div>
    <div class="pw-bars" aria-hidden="true"><span class="pw-bar"><i></i></span><span class="pw-bar"><i></i></span><span class="pw-bar"><i></i></span><span class="pw-bar"><i></i></span></div>
    <div class="pw-rules">
      <span class="pw-rule" data-rule="len"><span class="pw-dot">${I.check}</span>8자 이상</span>
      <span class="pw-rule" data-rule="mix"><span class="pw-dot">${I.check}</span>영문·숫자</span>
      <span class="pw-rule" data-rule="special"><span class="pw-dot">${I.check}</span>특수문자 또는 12자+</span>
    </div>
  </div></div></div>`;
}
function bindPwToggles(root) {
  $$('.pw-eye', root).forEach(btn => {
    btn.addEventListener('click', () => {
      const inp = $('#' + btn.dataset.pwFor, root);
      if (!inp) return;
      const show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      btn.setAttribute('aria-pressed', show ? 'true' : 'false');
      btn.setAttribute('aria-label', show ? '비밀번호 숨기기' : '비밀번호 보기');
      btn.innerHTML = show ? I.eyeOff : I.eye;
      inp.focus();
    });
  });
}
function bindPasswordSecurity(root, pwSel, pw2Sel, prefix) {
  const pwEl = $(pwSel, root), pw2El = $(pw2Sel, root);
  const col = $(`#${prefix}Collapse`, root), card = $(`#${prefix}Card`, root);
  const lbl = $(`#${prefix}Lbl`, root), cnt = $(`#${prefix}Cnt`, root);
  const matchEl = $(`#${prefix}Match`, root);
  if (!pwEl || !col || !card) return;
  let prevLvl = 0;
  const sync = () => {
    const res = evalPasswordSecurity(pwEl.value, pw2El ? pw2El.value : '');
    const open = res.length > 0 || document.activeElement === pwEl;
    col.classList.toggle('open', open);
    card.dataset.lvl = String(res.level);
    lbl.textContent = res.label || '안전한 비밀번호를 입력해 주세요';
    cnt.textContent = `${res.length}자`;
    $$('.pw-bar', card).forEach((b, i) => b.classList.toggle('on', i < res.level));
    $$('.pw-rule', card).forEach(r => r.classList.toggle('ok', !!res.rules[r.dataset.rule]));
    if (res.level >= 3 && prevLvl < 3) {
      card.classList.remove('pulse'); void card.offsetWidth; card.classList.add('pulse');
    }
    prevLvl = res.level;
    if (pw2El && matchEl) {
      pw2El.classList.toggle('is-good', res.match === 'match');
      pw2El.classList.toggle('is-bad', res.match === 'mismatch');
      matchEl.classList.toggle('show', res.match !== 'empty');
      matchEl.classList.toggle('ok', res.match === 'match');
      matchEl.classList.toggle('bad', res.match === 'mismatch');
      matchEl.innerHTML = res.match === 'match' ? `${I.check}<span>비밀번호가 일치해요</span>` : (res.match === 'mismatch' ? `${I.close}<span>비밀번호가 서로 달라요</span>` : '');
    }
  };
  pwEl.addEventListener('focus', sync);
  pwEl.addEventListener('blur', sync);
  pwEl.addEventListener('input', sync);
  if (pw2El) pw2El.addEventListener('input', sync);
}
function shakeEl(el) {
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
}

function renderAuthForm(kind) {
  let a = $('#auth'); if (!a) { renderAuth(); a = $('#auth'); }
  a.dataset.mode = 'form';
  const up = kind === 'signup';
  a.innerHTML = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:22px"><button class="nav-btn" data-act="authBack" aria-label="뒤로">${I.back}</button></div>
    <div class="ob-step anim" style="flex:1"><h2>${up ? '이메일로<br>가입하기' : '다시 만나서<br>반가워요'}</h2><p class="lead">${up ? '로그인할 때 쓸 이메일과 비밀번호를 정해 주세요.' : '가입한 이메일과 비밀번호를 입력해 주세요.'}</p>
    <form id="authForm" novalidate>
      <div class="field"><label for="aEmail">이메일</label><input class="input" id="aEmail" type="email" inputmode="email" autocomplete="email" placeholder="name@example.com"></div>
      <div class="field"><label for="aPw">비밀번호${up ? ' <small>8자 이상</small>' : ''}</label><div class="input-wrap pw-wrap"><input class="input" id="aPw" type="password" autocomplete="${up ? 'new-password' : 'current-password'}"><button type="button" class="pw-eye" data-pw-for="aPw" aria-label="비밀번호 보기" aria-pressed="false">${I.eye}</button></div>${up ? pwMeterHtml('aPw') : ''}</div>
      ${up ? `<div class="field"><label for="aPw2">비밀번호 확인</label><div class="input-wrap pw-wrap"><input class="input" id="aPw2" type="password" autocomplete="new-password"><button type="button" class="pw-eye" data-pw-for="aPw2" aria-label="비밀번호 확인 보기" aria-pressed="false">${I.eye}</button></div><div class="pw-match" id="aPwMatch" aria-live="polite"></div></div>` : ''}
      <div class="hint err" id="aErr" role="alert"></div>
      <button class="btn btn-primary btn-block" type="submit" id="aSubmit" style="margin-top:14px">${up ? '가입하고 프로필 만들기' : '로그인'}</button>
    </form>
    ${!up ? '<button class="btn btn-ghost btn-block" data-act="forgotPw" style="margin-top:6px">비밀번호를 잊었어요</button>' : ''}
    <button class="btn btn-ghost btn-block" data-act="${up ? 'login' : 'signup'}" style="margin-top:4px">${up ? '이미 가입했어요 · 로그인' : '처음이에요 · 회원가입'}</button></div>`;
  bindPwToggles(a);
  if (up) bindPasswordSecurity(a, '#aPw', '#aPw2', 'aPw');
  else {
    $$('[data-demo-email]', a).forEach(btn => {
      btn.addEventListener('click', () => {
        $('#aEmail', a).value = btn.dataset.demoEmail;
        $('#aPw', a).value = btn.dataset.demoPw;
        $('#authForm', a).requestSubmit();
      });
    });
  }
  setTimeout(() => { const el = $('#aEmail'); el && el.focus(); }, 300);
  $('#authForm').addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('#aEmail').value.trim(), pw = $('#aPw').value, err = $('#aErr');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = '이메일 형식이 맞지 않아요. name@example.com처럼 입력해 주세요.'; shakeEl(err); $('#aEmail').focus(); return; }
    if (pw.length < 8) { err.textContent = '비밀번호가 너무 짧아요. 8자 이상으로 입력해 주세요.'; shakeEl(err); $('#aPw').focus(); return; }
    if (up && pw !== $('#aPw2').value) { err.textContent = '비밀번호 확인이 일치하지 않아요. 똑같이 다시 입력해 주세요.'; shakeEl(err); $('#aPw2').focus(); return; }
    const btn = $('#aSubmit'); err.textContent = '';
    await withLock(btn, up ? '가입하는 중…' : '로그인하는 중…', async () => {
      try {
        if (App.demo) { if (!App.session) initDemoData(); leaveAuth('로그인했어요!'); return; }
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
      } catch (ex) { err.textContent = krError(ex); shakeEl(err); }
    });
  });
}

function renderResetRequest() {
  let a = $('#auth'); if (!a) { renderAuth(); a = $('#auth'); }
  a.dataset.mode = 'reset';
  a.innerHTML = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:22px"><button class="nav-btn" data-act="login" aria-label="로그인으로 돌아가기">${I.back}</button></div>
    <div class="ob-step anim" style="flex:1"><h2>비밀번호 재설정<br>메일 보내기</h2><p class="lead">가입한 이메일 주소를 입력하면 새 비밀번호를 정할 수 있는 링크를 보내드려요.</p>
    <form id="resetForm" novalidate>
      <div class="field"><label for="rEmail">이메일</label><input class="input" id="rEmail" type="email" inputmode="email" autocomplete="email" placeholder="name@example.com"></div>
      <div class="hint err" id="rErr" role="alert"></div>
      <button class="btn btn-primary btn-block" type="submit" id="rSubmit">재설정 메일 보내기</button>
    </form></div>`;
  setTimeout(() => { const el = $('#rEmail'); el && el.focus(); }, 250);
  $('#resetForm').addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('#rEmail').value.trim(), err = $('#rErr');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = '이메일 형식이 맞지 않아요. 다시 확인해 주세요.'; shakeEl(err); return; }
    err.textContent = '';
    await withLock($('#rSubmit'), '보내는 중…', async () => {
      try {
        if (!App.demo) await q(sb.auth.resetPasswordForEmail(email, {redirectTo:location.origin + location.pathname}));
        $('#resetForm').innerHTML = `<div class="note contrast" style="margin:0">${I.info}<span><b>${esc(email)}</b>로 재설정 메일을 보냈어요. 메일 안의 링크를 누르면 새 비밀번호를 설정할 수 있어요.</span></div><button type="button" class="btn btn-gray btn-block" style="margin-top:16px" data-act="login">로그인 화면으로</button>`;
      } catch (ex) { err.textContent = krError(ex); shakeEl(err); }
    });
  });
}

function renderNewPassword() {
  let a = $('#auth'); if (!a) { a = document.createElement('div'); a.id = 'auth'; a.className = 'auth'; $('#stage').appendChild(a); }
  a.dataset.mode = 'reset';
  $('#fab').classList.add('hidden'); $('#tabbar').classList.add('hidden'); $('#sidebar').classList.add('hidden');
  a.innerHTML = `<div class="ob-step anim" style="flex:1;padding-top:24px"><h2>새 비밀번호를<br>설정해 주세요</h2><p class="lead">앞으로 로그인할 때 쓸 8자 이상의 비밀번호를 입력해 주세요.</p>
    <form id="newPwForm" novalidate>
      <div class="field"><label for="np1">새 비밀번호 <small>8자 이상</small></label><div class="input-wrap pw-wrap"><input class="input" id="np1" type="password" autocomplete="new-password"><button type="button" class="pw-eye" data-pw-for="np1" aria-label="새 비밀번호 보기" aria-pressed="false">${I.eye}</button></div>${pwMeterHtml('np1')}</div>
      <div class="field"><label for="np2">새 비밀번호 확인</label><div class="input-wrap pw-wrap"><input class="input" id="np2" type="password" autocomplete="new-password"><button type="button" class="pw-eye" data-pw-for="np2" aria-label="새 비밀번호 확인 보기" aria-pressed="false">${I.eye}</button></div><div class="pw-match" id="np1Match" aria-live="polite"></div></div>
      <div class="hint err" id="npErr" role="alert"></div>
      <button class="btn btn-primary btn-block" type="submit" id="npSubmit">비밀번호 저장하기</button>
    </form></div>`;
  bindPwToggles(a);
  bindPasswordSecurity(a, '#np1', '#np2', 'np1');
  $('#newPwForm').addEventListener('submit', async e => {
    e.preventDefault();
    const p1 = $('#np1').value, p2 = $('#np2').value, err = $('#npErr');
    if (p1.length < 8) { err.textContent = '비밀번호가 너무 짧아요. 8자 이상으로 입력해 주세요.'; shakeEl(err); return; }
    if (p1 !== p2) { err.textContent = '새 비밀번호가 서로 달라요. 똑같이 다시 입력해 주세요.'; shakeEl(err); return; }
    err.textContent = '';
    await withLock($('#npSubmit'), '저장하는 중…', async () => {
      try {
        if (!App.demo) await q(sb.auth.updateUser({password:p1}));
        App.recovery = false;
        try { history.replaceState(null, '', location.pathname + location.search); } catch (er) {}
        if (!App.demo && sb) {
          const {data} = await sb.auth.getSession();
          if (data && data.session) await enterSession(data.session.user);
        }
        leaveAuth('새 비밀번호로 바꿨어요!');
      } catch (ex) { err.textContent = krError(ex); shakeEl(err); }
    });
  });
}

/* ============ 액션 ============ */
const ACT = {
  tab(d) { if (UI.tab !== d.tab) { UI.tab = d.tab; UI.enterTab = true; } render(); },
  tabFromPage(d) { while (UI.stack.length) popPage(); UI.tab = d.tab; UI.enterTab = true; render(); },
  startDemo() { const a = $('#stage > .auth'); if (a) a.remove(); initDemoData(); render(); },
  browseAll() { while (UI.stack.length) popPage(); UI.tab = 'home'; UI.homeSeg = 'all'; UI.enterTab = true; render(); },
  resetFilter() { UI.filterCat = 0; UI.filterMethod = ''; UI.rangeKm = 0; UI.sortBy = 'recent'; render(); },
  back() { popPage(); },
  closeSheet(d, el) { closeSheet(el.closest('.sheet')); },
  homeSeg(d) { UI.homeSeg = d.v; UI.enterTab = true; render(); },
  offerSeg(d) { UI.offerSeg = d.v; render(); },
  chalSeg(d) { UI.chalSeg = d.v; render(); },
  meSeg(d) { UI.meSeg = d.v; render(); },
  fCat(d) { UI.filterCat = +d.v; render(); },
  fMethod(d) { UI.filterMethod = d.v; render(); },
  toggleSort() { UI.sortBy = UI.sortBy === 'distance' ? 'recent' : 'distance'; render(); },
  openRegion() { openRegionSheet(); },
  openNearbyMap() { openNearbyMapSheet(); },
  openItem(d) { if (!S.items[d.id]) return toast('삭제된 물건이에요. 다른 물건을 둘러보세요.'); pushPage({type:'item', id:d.id}); },
  openChallenge(d) { pushPage({type:'challenge', id:d.id}); },
  openUser(d) { if (d.id === App.me && !UI.stack.length) { UI.tab = 'me'; render(); return; } pushPage({type:'user', id:d.id}); },
  openChat(d) { pushPage({type:'chat', id:d.id}); },
  openNotifs() { openNotificationsSheet(); },
  viewPhoto(d) { const it = itemById(d.id); if (it && it.photos && it.photos.length) openPhotoViewer(it.photos, +d.idx || 0); },
  viewChatPhoto(d) { if (d.src) openPhotoViewer([d.src], 0); },
  async toggleFav(d, el) {
    if (!guardWrite()) return;
    const id = favKey(d.id);
    if (S.favorites[id]) {
      await Store.del('favorites', id);
      toast('찜 목록에서 뺐어요.');
    } else {
      el.classList.add('beat');
      await Store.set('favorites', id, {owner:App.me, item:d.id, at:now()});
      toast('찜 목록에 저장했어요.');
    }
  },
  newItem() { if (guardWrite()) openItemForm(); },
  editItem(d) { openItemForm(itemById(d.id)); },
  openWants() { openWantsSheet(); },
  editProfile() { openProfileSheet(); },
  changePassword() { openChangePasswordSheet(); },
  deleteAccount() { handleDeleteAccount(); },
  async proposeOffer(d) {
    if (!guardWrite()) return;
    if (localStorage.getItem('baggullae_hide_safety_tip') !== '1' && !App._safetySeen) {
      openSafetyTipSheet(() => { App._safetySeen = true; openOfferSheet(d.id); });
      return;
    }
    openOfferSheet(d.id);
  },
  acceptOffer(d) { openAcceptSheet(d.id); },
  async rejectOffer(d) {
    if (!(await confirmDialog('제안을 거절할까요?', '상대에게 거절됐다고 표시돼요.', '거절', true))) return;
    const orig = S.offers[d.id];
    const next = {...orig, status:'rejected', updatedAt:now()};
    putLocal('offers', d.id, next);
    scheduleUndoableOp('offer_' + d.id, {
      msg:'제안을 거절했어요.',
      onUndo:() => putLocal('offers', d.id, orig),
      onCommit:() => Store.patch('offers', d.id, {status:'rejected', updatedAt:next.updatedAt})
    });
  },
  async cancelOffer(d) {
    if (!(await confirmDialog('제안을 취소할까요?', '', '제안 취소', true))) return;
    const orig = S.offers[d.id];
    const next = {...orig, status:'cancelled', updatedAt:now()};
    putLocal('offers', d.id, next);
    scheduleUndoableOp('offer_' + d.id, {
      msg:'제안을 취소했어요.',
      onUndo:() => putLocal('offers', d.id, orig),
      onCommit:() => Store.patch('offers', d.id, {status:'cancelled', updatedAt:next.updatedAt})
    });
  },
  async completeOffer(d, el) {
    if (await confirmDialog('교환을 마쳤나요?', '양쪽 모두 완료를 누르면 교환이 확정돼요.', '교환 완료')) {
      await withLock(el, '처리하는 중…', () => completeOffer(d.id));
    }
  },
  reviewOffer(d) { openReviewSheet(d.id); },
  itemMenu(d) { openItemMenu(d.id); },
  reportUser(d) { openReportSheet(d.id); },
  startChallenge() { if (!guardWrite()) return; if (myActiveChallenge()) return toast('진행 중인 챌린지가 이미 있어요. 기존 챌린지를 이어가거나 완주해 주세요.'); openItemForm(null, {newChallenge:true}); },
  continueChallenge(d) { const c = S.challenges[d.id]; const last = c.steps[c.steps.length - 1]; openItemForm(null, {challengeId:d.id, prefill:{title:last.title, cat:last.cat, photos:last.full ? [last.full] : []}}); },
  async finishChallenge(d, el) {
    if (!(await confirmDialog('챌린지를 완주할까요?', '완주하면 더 이상 단계를 이어갈 수 없어요.', '완주하기'))) return;
    await withLock(el, '저장하는 중…', async () => { await Store.patch('challenges', d.id, {status:'finished', finishedAt:now()}); celebrate(); toast('완주를 축하해요!'); });
  },
  async cheer(d, el) {
    if (!guardWrite()) return;
    const c = S.challenges[d.id]; const ch = new Set(c.cheers || []);
    ch.has(App.me) ? ch.delete(App.me) : ch.add(App.me);
    el.classList.add('beat'); putLocal('challenges', d.id, {...c, cheers:[...ch]});
    try { await Store.rpc('toggle_cheer', {p_challenge:d.id}); } catch (e) { putLocal('challenges', d.id, c); }
  },
  noteStep(d) { openStepNote(d.id, +d.i); },
  shareChallenge(d) { openShareCard(d.id); },
  showPolicy() { openSheet({title:'안전한 교환 가이드', body:`<div class="group" style="margin:0">${[['대면은 공공장소에서', '역 출구, 카페처럼 사람이 많은 곳에서 만나요. 지도에서 고른 장소가 그대로 공유돼요.'], ['주소는 꼭 필요할 때만', '문고리·택배 주소는 앱에 저장되지 않아요. 교환이 수락된 뒤 1:1 채팅에서 필요할 때만 나눠요.'], ['기프티콘·현금은 교환하지 않아요', '현금과 같은 가치의 교환권은 현재 등록할 수 없어요.'], ['이상하면 신고하기', '프로필이나 물건 상세의 깃발 버튼으로 신고할 수 있어요.']].map(([b, t]) => `<div class="spec" style="display:block"><b style="display:block;font-size:.94rem">${b}</b><span style="color:var(--muted);font-size:.86rem">${t}</span></div>`).join('')}</div>`}); },
  async logout() { if (await confirmDialog('로그아웃할까요?', '', '로그아웃', true)) { await signOut(); toast('로그아웃했어요.'); } },
  login() { renderAuthForm('login'); },
  signup() { renderAuthForm('signup'); },
  forgotPw() { renderResetRequest(); },
  authBack() { const a = $('#auth'); if (a) a.dataset.mode = ''; renderAuth(); },
  async obBack() {
    if (OB.step > 0) { OB.step--; renderOnboard(); return; }
    if (await confirmDialog('가입을 그만둘까요?', '로그아웃되고, 다음에 로그인하면 프로필 만들기부터 이어서 할 수 있어요.', '그만두기', true)) { await signOut(); }
  },
  obRegion(d) {
    OB.region = d.v; OB.dong = ''; OB.loc = CENT[d.v] ? {lat:CENT[d.v][0], lng:CENT[d.v][1]} : null; OB.locVerified = false;
    const a = $('#auth');
    if (a) {
      $$('[data-act="obRegion"]', a).forEach(b => b.classList.toggle('on-accent', b.dataset.v === OB.region));
      const st = $('#obGpsStatus', a); if (st) st.innerHTML = '';
      const next = $('[data-act="obNext"]', a);
      if (next) next.disabled = !OB.region;
    } else renderOnboard(false);
  },
  async obGps(d, el) {
    const a = $('#auth');
    const orig = el.innerHTML;
    el.disabled = true;
    el.innerHTML = `<span class="loc-spin"></span><span>현재 위치를 확인하는 중…</span>`;
    try {
      const res = await detectCurrentNeighborhood();
      OB.region = res.region;
      OB.dong = res.dong;
      OB.loc = {lat:res.lat, lng:res.lng};
      OB.locVerified = true;
      if (a) {
        $$('[data-act="obRegion"]', a).forEach(b => b.classList.toggle('on-accent', b.dataset.v === OB.region));
        const st = $('#obGpsStatus', a);
        if (st) st.innerHTML = `<div class="loc-verified">${I.check}<span>${esc(res.fullLabel)} 확인됨${res.viaKakao ? ' (카카오맵)' : ''}</span></div>`;
        const next = $('[data-act="obNext"]', a);
        if (next) next.disabled = !OB.region;
      }
      toast(`${res.fullLabel}으로 설정했어요!`);
    } catch (ex) {
      toast(ex.message || '현재 위치를 확인하지 못했어요.');
    } finally {
      if (document.body.contains(el)) { el.disabled = false; el.innerHTML = orig; }
    }
  },
  obWant(d, el) {
    const c = +d.v; const i = OB.wants.findIndex(w => w.c === c);
    if (i >= 0) OB.wants.splice(i, 1);
    else if (OB.wants.length < 5) OB.wants.push({t:'cat', c});
    else { toast('최대 5개까지만 고를 수 있어요. 기존 항목을 빼고 다시 골라 주세요.'); return; }
    const a = $('#auth');
    if (a && el) {
      el.classList.toggle('on-accent', i < 0);
      const next = $('[data-act="obNext"]', a);
      if (next) next.textContent = OB.wants.length ? OB.wants.length + '개 선택 · 다음' : '건너뛰기';
    } else renderOnboard(false);
  },
  obAgree(d, el) {
    const idx = +d.i;
    OB.agree[idx] = !OB.agree[idx];
    const a = $('#auth');
    if (a && el) {
      el.classList.toggle('on', OB.agree[idx]);
      const next = $('[data-act="obNext"]', a);
      if (next) next.disabled = !OB.agree.every(Boolean);
    } else renderOnboard(false);
  },
  async obNext(d, el) {
    if (OB.step < 3) { OB.step++; renderOnboard(true); return; }
    await withLock(el, '가입하는 중…', async () => {
      try {
        if (!App.demo && sb) {
          let {data:sd} = await sb.auth.getSession();
          if (!sd || !sd.session) {
            const {data:rf} = await sb.auth.refreshSession().catch(() => ({data:null}));
            sd = rf;
          }
          if (!sd || !sd.session || !sd.session.user) {
            toast('로그인 세션이 확인되지 않아요. 이메일 인증을 완료한 뒤 다시 로그인해 주세요.');
            return;
          }
          App.me = sd.session.user.id;
        }
        const nick = OB.nickname.trim();
        await Store.set('profiles', App.me, {
          nickname:nick, region:OB.region, dong:OB.dong || '', loc:OB.loc || null,
          locVerified:!!OB.locVerified, wants:OB.wants, tradeCount:0, createdAt:now(), agreedAt:now()
        });
        leaveAuth(`${nick}님, 환영해요!`);
      } catch (e) {}
    });
  }
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = ACT[el.dataset.act]; if (!fn) return;
  e.preventDefault(); fn(el.dataset, el);
});
document.addEventListener('click', e => { const t = e.target.closest('.tab'); if (t) ACT.tab({tab:t.dataset.tab}); });

/* ============ 이미지 압축 및 Supabase Storage ============ */
function loadImage(src) { return new Promise((res, rej) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => res(im); im.onerror = rej; im.src = src; }); }

async function shrinkBlob(src, max = 1080, q = 0.8) {
  const im = await loadImage(src);
  const r = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
  const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(im.naturalWidth * r)); c.height = Math.max(1, Math.round(im.naturalHeight * r));
  c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
  return new Promise((res, rej) => c.toBlob(b => b ? res(b) : rej(new Error('blob fail')), 'image/jpeg', q));
}

async function shrink(src, max = 1080, q = 0.8) {
  const im = await loadImage(src);
  const r = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
  const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(im.naturalWidth * r)); c.height = Math.max(1, Math.round(im.naturalHeight * r));
  c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', q);
}

async function fileToPreview(file) {
  const url = URL.createObjectURL(file);
  try {
    const blob = await shrinkBlob(url, 1080, 0.8);
    const dataUrl = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(blob); });
    return {blob, preview:dataUrl};
  } finally { URL.revokeObjectURL(url); }
}

async function uploadPhotoBlob(folderId, seq, blob) {
  if (App.demo || !sb) {
    return await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(blob); });
  }
  const path = `${App.me}/${folderId}/${seq}.jpg`;
  const {error} = await sb.storage.from(PHOTO_BUCKET).upload(path, blob, {contentType:'image/jpeg', upsert:true});
  if (error) throw error;
  const {data} = sb.storage.from(PHOTO_BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

function extractStoragePath(url) {
  if (!url || !url.includes(`/object/public/${PHOTO_BUCKET}/`)) return null;
  return decodeURIComponent(url.split(`/object/public/${PHOTO_BUCKET}/`)[1].split('?')[0]);
}

async function deleteItemStoragePhotos(itemId, urls = []) {
  if (App.demo || !sb) return;
  const paths = new Set(urls.map(extractStoragePath).filter(Boolean));
  try {
    const {data} = await sb.storage.from(PHOTO_BUCKET).list(`${App.me}/${itemId}`);
    if (data) data.forEach(f => paths.add(`${App.me}/${itemId}/${f.name}`));
  } catch (e) {}
  if (paths.size) {
    try { await sb.storage.from(PHOTO_BUCKET).remove([...paths]); } catch (e) {}
  }
}

/* ============ 물건 등록·수정 (임시 저장 · Storage 업로드) ============ */
const draftKey = () => `baggullae_draft_${App.me}`;
function readDraft() { try { return JSON.parse(localStorage.getItem(draftKey()) || 'null'); } catch (e) { return null; } }
function writeDraft(d) { try { localStorage.setItem(draftKey(), JSON.stringify(d)); } catch (e) {} }
function clearDraft() { try { localStorage.removeItem(draftKey()); } catch (e) {} }

function openItemForm(item, opts = {}) {
  const editing = !!item;
  const isNewPlain = !editing && !opts.newChallenge && !opts.challengeId;
  const savedDraft = isNewPlain ? readDraft() : null;
  const base = editing
    ? {...item, photos:(item.photos || []).map(url => ({url, blob:null})), methods:[...(item.methods || [])]}
    : savedDraft
      ? {...savedDraft, photos:(savedDraft.photos || []).map(url => ({url, blob:null})), methods:[...(savedDraft.methods || [])]}
      : {title:'', desc:'', cat:0, cond:'used', value:'', hideValue:false, pref:'any', methods:[], meet:null, photos:[], ...(opts.prefill || {})};
  if (!editing && !savedDraft && opts.prefill && opts.prefill.photos) {
    base.photos = opts.prefill.photos.map(url => ({url, blob:null}));
  }
  const f = base;
  if (editing) f.hideValue = !item.value;
  if (opts.prefill && opts.prefill.cat) f.cat = opts.prefill.cat;
  const chal = opts.newChallenge;
  const title = editing ? '물건 수정' : chal ? '챌린지 시작하기' : opts.challengeId ? '챌린지 다음 물건' : '물건 등록';

  let dirty = false, savedSuccess = false;
  const syncDraft = () => {
    dirty = true;
    if (!isNewPlain) return;
    const curTitle = ($('#fTitle', sh) ? $('#fTitle', sh).value : f.title).trim();
    const curDesc = ($('#fDesc', sh) ? $('#fDesc', sh).value : f.desc).trim();
    const curVal = $('#fValue', sh) ? $('#fValue', sh).value.replace(/[^0-9]/g, '') : f.value;
    writeDraft({
      title:curTitle, desc:curDesc, cat:f.cat, cond:f.cond, value:curVal, hideValue:f.hideValue,
      pref:f.pref, methods:f.methods, meet:f.meet,
      photos:f.photos.map(p => p.url).filter(u => u && u.length < 300000)
    });
  };

  const body = `
    ${savedDraft ? `<div class="note contrast" id="draftBanner" style="margin:0 0 14px;align-items:center;justify-content:space-between"><span>작성 중이던 내용을 불러왔어요.</span><button type="button" class="btn btn-gray btn-sm" id="clearDraftBtn" style="min-height:36px">새로 쓰기</button></div>` : ''}
    ${chal ? `<div class="note">${I.clip}<span>작은 물건 하나로 시작해요. 교환이 완료될 때마다 받은 물건이 타임라인에 자동으로 쌓여요.</span></div>
    <div class="field"><label for="fChTitle">챌린지 이름</label><input class="input" id="fChTitle" maxlength="30" placeholder="예: 볼펜 한 자루로 에어팟까지"></div>
    <div class="field"><label for="fChGoal">목표 물건 <small>선택</small></label><input class="input" id="fChGoal" maxlength="30" placeholder="예: 에어팟"></div>
    <div class="lbl" style="font-size:1.05rem;font-weight:800;margin:24px 4px 12px">시작 물건</div>` : ''}
    ${opts.challengeId ? `<div class="note">${I.clip}<span>교환으로 받은 물건이에요. 등록하면 챌린지의 지금 교환할 물건이 돼요.</span></div>` : ''}
    <div class="field"><div class="lbl">사진 <small><span id="pCount">${f.photos.length}</span>/4 · 첫 장이 대표</small></div><div class="photos" id="fPhotos"></div><input type="file" id="fFile" accept="image/*" multiple hidden></div>
    <div class="field"><label for="fTitle">제목</label><input class="input" id="fTitle" maxlength="40" placeholder="예: 미개봉 쿠션 팩트 21호" value="${esc(f.title)}"></div>
    <div class="field"><div class="lbl">카테고리</div><div class="chips wrap" id="fCatTop">${CATS.map(c => `<button type="button" class="chip" data-top="${c.id}">${c.n}</button>`).join('')}</div><div class="chips wrap" id="fCatSub" style="margin-top:8px"></div></div>
    <div class="field"><div class="lbl">상태</div><div class="seg in-form" id="fCond">${Object.entries(COND).map(([k, v]) => `<button type="button" data-v="${k}" class="${f.cond === k ? 'on' : ''}">${v}</button>`).join('')}</div></div>
    <div class="field"><div class="lbl">가치</div><div class="toggle-row" style="margin-bottom:8px"><span>가치 표기 안 함</span><button type="button" class="switch ${f.hideValue ? 'on' : ''}" id="fHide" role="switch" aria-checked="${f.hideValue}" aria-label="가치 표기 안 함"></button></div><div class="input-wrap" id="fValueWrap" style="${f.hideValue ? 'display:none' : ''}"><input class="input num" id="fValue" inputmode="numeric" placeholder="예상 가치" aria-label="예상 가치 원 단위" value="${f.value ? Number(f.value).toLocaleString('ko-KR') : ''}"><span class="suffix">원</span></div></div>
    <div class="field"><div class="lbl">교환 성향</div><div class="seg in-form" id="fPref">${Object.entries(PREF).map(([k, v]) => `<button type="button" data-v="${k}" class="${f.pref === k ? 'on' : ''}">${v}</button>`).join('')}</div></div>
    <div class="field"><div class="lbl">교환 방식 <small>선택 사항 · 여러 개 가능</small></div><div class="method-cards" id="fMethods">${Object.entries(METHODS).map(([k, v]) => `<button type="button" class="mc ${f.methods.includes(k) ? 'on' : ''}" data-v="${k}" aria-pressed="${f.methods.includes(k)}">${I[k]}${v}<small>${METHOD_DESC[k]}</small></button>`).join('')}</div><div id="fMeetBox"></div><div class="hint" id="fMethodHint"></div></div>
    <div class="field"><label for="fDesc">설명 <small>선택</small></label><textarea class="textarea" id="fDesc" maxlength="1000" placeholder="물건 상태, 구매 시기, 원하는 교환 물건을 적어 주세요.">${esc(f.desc)}</textarea></div>`;

  const sh = openSheet({
    title, body, full:true,
    foot:`<button class="btn btn-primary btn-block" id="fSave">${editing ? '수정 완료' : chal ? '챌린지 시작' : '등록하기'}</button>`,
    onBeforeClose: async () => {
      if (savedSuccess || editing || !dirty) return true;
      const hasContent = ($('#fTitle', sh) && $('#fTitle', sh).value.trim()) || ($('#fDesc', sh) && $('#fDesc', sh).value.trim()) || f.photos.length || f.cat;
      if (!hasContent) return true;
      syncDraft();
      return await confirmDialog('작성 중인 내용이 있어요. 나갈까요?', '임시 저장되어 다음에 물건 등록을 열면 이어서 쓸 수 있어요.', '나가기');
    },
    onMount(sh) {
      if ($('#clearDraftBtn', sh)) {
        $('#clearDraftBtn', sh).addEventListener('click', () => {
          clearDraft(); $('#draftBanner', sh).remove();
          f.title = ''; f.desc = ''; f.cat = 0; f.cond = 'used'; f.value = ''; f.hideValue = false; f.pref = 'any'; f.methods = []; f.meet = null; f.photos = []; dirty = false;
          $('#fTitle', sh).value = ''; $('#fDesc', sh).value = ''; $('#fValue', sh).value = '';
          drawPhotos(); top = 0; drawCat(); drawMeet();
          toast('임시 저장된 글을 지웠어요.');
        });
      }
      const drawPhotos = () => {
        $('#fPhotos', sh).innerHTML = (f.photos.length < 4 ? `<button type="button" class="photo-add" id="fAdd" aria-label="사진 추가">${I.camera}<span>${f.photos.length}/4</span></button>` : '') + f.photos.map((p, i) => `<div class="photo"><img src="${esc(assetUrl(p.url))}" alt="사진 ${i + 1}" referrerpolicy="no-referrer"><button type="button" data-rm="${i}" aria-label="사진 ${i + 1} 삭제">${I.close}</button>${i === 0 ? '<span class="cover">대표</span>' : ''}</div>`).join('');
        $('#pCount', sh).textContent = f.photos.length;
      };
      drawPhotos();
      $('#fPhotos', sh).addEventListener('click', e => {
        if (e.target.closest('#fAdd')) $('#fFile', sh).click();
        const rm = e.target.closest('[data-rm]');
        if (rm) { f.photos.splice(+rm.dataset.rm, 1); drawPhotos(); syncDraft(); }
      });
      $('#fFile', sh).addEventListener('change', async e => {
        const files = [...e.target.files].slice(0, 4 - f.photos.length);
        for (const file of files) {
          try {
            const p = await fileToPreview(file);
            f.photos.push({url:p.preview, blob:p.blob});
            drawPhotos(); syncDraft();
          } catch (er) { toast('사진을 불러오지 못했어요. JPG나 PNG 형식의 다른 사진을 골라 주세요.'); }
        }
        e.target.value = '';
      });

      let top = f.cat ? parentOf(f.cat) : 0;
      const drawCat = () => {
        $$('#fCatTop .chip', sh).forEach(b => b.classList.toggle('on', +b.dataset.top === top));
        const c = CATS.find(x => x.id === top);
        $('#fCatSub', sh).innerHTML = c ? c.subs.map(([id, n]) => `<button type="button" class="chip ${f.cat === id ? 'on-accent' : ''}" data-sub="${id}">${n}</button>`).join('') : '<span class="hint" style="margin:0">대분류를 먼저 골라 주세요</span>';
      };
      drawCat();
      $('#fCatTop', sh).addEventListener('click', e => { const b = e.target.closest('[data-top]'); if (b) { top = +b.dataset.top; if (parentOf(f.cat) !== top) f.cat = 0; drawCat(); syncDraft(); } });
      $('#fCatSub', sh).addEventListener('click', e => { const b = e.target.closest('[data-sub]'); if (b) { f.cat = +b.dataset.sub; drawCat(); syncDraft(); } });
      const segPick = (id, key) => $(id, sh).addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; f[key] = b.dataset.v; $$('button', $(id, sh)).forEach(x => x.classList.toggle('on', x === b)); initSegs(sh); syncDraft(); });
      segPick('#fCond', 'cond'); segPick('#fPref', 'pref'); initSegs(sh);
      $('#fHide', sh).addEventListener('click', e => { f.hideValue = !f.hideValue; e.currentTarget.classList.toggle('on', f.hideValue); e.currentTarget.setAttribute('aria-checked', f.hideValue); $('#fValueWrap', sh).style.display = f.hideValue ? 'none' : ''; syncDraft(); });
      $('#fValue', sh).addEventListener('input', e => { const n = e.target.value.replace(/[^0-9]/g, '').slice(0, 9); e.target.value = n ? Number(n).toLocaleString('ko-KR') : ''; syncDraft(); });
      $('#fTitle', sh).addEventListener('input', syncDraft);
      $('#fDesc', sh).addEventListener('input', syncDraft);

      const drawMeet = () => {
        const box = $('#fMeetBox', sh);
        if (!f.methods.includes('meet')) { box.innerHTML = ''; $('#fMethodHint', sh).textContent = f.methods.length ? '' : '고르지 않으면 ‘협의 가능’으로 표시돼요.'; return; }
        $('#fMethodHint', sh).textContent = '';
        box.innerHTML = `<button type="button" class="place-pick" id="fMeetPick"><span class="pp-ic">${I.pin}</span><span style="flex:1;min-width:0"><b>${f.meet ? esc(f.meet.name) : '만남 장소를 지도에서 고르기'}</b><span>${f.meet ? '탭해서 다시 고를 수 있어요' : '역·카페 같은 공공장소를 추천해요'}</span></span><span class="chev" style="color:var(--muted)">${I.chev}</span></button>${f.meet ? `<div class="place" style="margin-top:8px"><div class="pmap" style="height:120px">${miniMap(f.meet)}</div></div>` : ''}`;
        $('#fMeetPick', sh).addEventListener('click', () => openMapPicker(f.meet, profileOf(App.me).region, m => { f.meet = m; drawMeet(); syncDraft(); }));
      };
      drawMeet();
      $('#fMethods', sh).addEventListener('click', e => {
        const b = e.target.closest('.mc'); if (!b) return;
        const k = b.dataset.v; const i = f.methods.indexOf(k);
        if (i >= 0) f.methods.splice(i, 1); else f.methods.push(k);
        b.classList.toggle('on', i < 0); b.setAttribute('aria-pressed', i < 0);
        if (k === 'meet' && i < 0 && !f.meet) setTimeout(() => openMapPicker(null, profileOf(App.me).region, m => { f.meet = m; drawMeet(); syncDraft(); }), 150);
        drawMeet(); syncDraft();
      });

      $('#fSave', sh).addEventListener('click', async e => {
        const btn = e.currentTarget;
        f.title = $('#fTitle', sh).value.trim(); f.desc = $('#fDesc', sh).value.trim();
        const val = f.hideValue ? 0 : +($('#fValue', sh).value.replace(/[^0-9]/g, '') || 0);
        const chTitle = chal ? $('#fChTitle', sh).value.trim() : '';
        if (chal && !chTitle) return toast('챌린지 이름을 입력하지 않았어요. 이름을 적어 주세요.');
        if (!f.title) return toast('제목을 입력하지 않았어요. 물건 이름을 적어 주세요.');
        if (!f.cat) return toast('카테고리를 고르지 않았어요. 대분류와 소분류를 선택해 주세요.');
        if (f.methods.includes('meet') && !f.meet) return toast('대면 교환 장소를 고르지 않았어요. 지도에서 장소를 지정해 주세요.');

        await withLock(btn, '저장하는 중…', async () => {
          const itemId = editing ? item.id : newId();
          const finalPhotos = [];
          try {
            for (let i = 0; i < f.photos.length; i++) {
              const ph = f.photos[i];
              if (ph.blob) {
                finalPhotos.push(await uploadPhotoBlob(itemId, i + 1, ph.blob));
              } else if (ph.url && ph.url.startsWith('data:image/') && !App.demo && sb) {
                // 임시 저장에 data URL이 남아 있거나 이전 data URL을 Storage로 전환
                const blob = await shrinkBlob(ph.url, 1080, 0.8);
                finalPhotos.push(await uploadPhotoBlob(itemId, i + 1, blob));
              } else if (ph.url) {
                finalPhotos.push(ph.url);
              }
            }
          } catch (upErr) {
            toast('사진을 올리지 못했어요. 잠시 후 다시 시도해 주세요.');
            return;
          }

          const data = {
            owner:editing ? item.owner : App.me, title:f.title, desc:f.desc, cat:f.cat, cond:f.cond,
            value:val || 0, pref:f.pref, methods:f.methods, meet:f.methods.includes('meet') ? f.meet : null,
            photos:finalPhotos, region:profileOf(App.me).region, status:editing ? item.status : 'available',
            createdAt:editing ? item.createdAt : now(), challengeId:editing ? (item.challengeId || null) : (opts.challengeId || null)
          };
          try {
            if (editing) {
              await Store.set('items', itemId, data);
              savedSuccess = true;
              toast('수정했어요.'); closeSheet(sh, {force:true}); return;
            }
            if (chal) {
              const cid = newId(); data.challengeId = cid;
              let stepImgUrl = finalPhotos[0] || null;
              if (f.photos[0] && f.photos[0].blob && !App.demo && sb) {
                try { stepImgUrl = await uploadPhotoBlob(`ch_${cid}`, 1, f.photos[0].blob); } catch (er) {}
              }
              await Store.set('challenges', cid, {owner:App.me, title:chTitle, goal:$('#fChGoal', sh).value.trim(), status:'active', createdAt:now(), cheers:[], currentItemId:itemId, awaitingNext:false, steps:[{title:f.title, cat:f.cat, img:stepImgUrl, full:stepImgUrl, at:now(), from:App.me}]});
              await Store.set('items', itemId, data);
              savedSuccess = true; clearDraft();
              closeSheet(sh, {force:true}); toast('챌린지를 시작했어요!'); UI.tab = 'challenge'; setTimeout(() => pushPage({type:'challenge', id:cid}), 350); return;
            }
            await Store.set('items', itemId, data);
            savedSuccess = true; if (isNewPlain) clearDraft();
            if (opts.challengeId) { await Store.patch('challenges', opts.challengeId, {currentItemId:itemId, awaitingNext:false, awaitingOffer:null}); toast('챌린지가 다음 단계로 이어졌어요!'); }
            else toast('물건을 등록했어요!');
            closeSheet(sh, {force:true});
            setTimeout(() => pushPage({type:'item', id:itemId}), 300);
          } catch (err) {}
        });
      });
    }
  });
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
          if (it.challengeId && S.challenges[it.challengeId] && S.challenges[it.challengeId].currentItemId === id) return toast('챌린지가 진행 중인 물건은 삭제할 수 없어요. 챌린지를 먼저 완주해 주세요.');
          if (!(await confirmDialog('물건을 삭제할까요?', '대기 중인 제안은 모두 취소돼요.', '삭제', true))) return;
          closeSheet(sh);
          const origItem = S.items[id];
          const pendOffers = offersFor(id).filter(o => o.status === 'pending').map(o => ({id:o.id, orig:S.offers[o.id]}));
          putLocal('items', id, null);
          pendOffers.forEach(({id:oid, orig}) => putLocal('offers', oid, {...orig, status:orig.from === App.me ? 'cancelled' : 'rejected', updatedAt:now()}));
          if (UI.stack[UI.stack.length - 1]?.id === id) popPage();
          scheduleUndoableOp('item_' + id, {
            msg:'물건을 삭제했어요.',
            onUndo:() => {
              putLocal('items', id, origItem);
              pendOffers.forEach(({id:oid, orig}) => putLocal('offers', oid, orig));
            },
            onCommit:async () => {
              for (const {id:oid, orig} of pendOffers) {
                try { await Store.patch('offers', oid, {status:orig.from === App.me ? 'cancelled' : 'rejected', updatedAt:now()}); } catch (er) {}
              }
              await Store.del('items', id);
              await deleteItemStoragePhotos(id, origItem.photos || []);
            }
          });
        }
      });
    }});
}

/* ============ 지도 선택 + 내 동네 설정 + 주변 물건 지도 ============ */
function openMapPicker(initial, region, onPick) {
  let pick = initial ? {...initial} : null; let nameEdited = false;
  const meCoord = myGeoCoords();
  const center = initial ? [initial.lat, initial.lng] : meCoord ? [meCoord.lat, meCoord.lng] : (CENT[region] || SEOUL_CENTER);
  const kNote = kakaoStatusNote();
  openSheet({title:'만남 장소 선택', full:true, body:'', onMount(sh) {
    const b = $('.sheet-body', sh); b.style.cssText = 'padding:0;display:flex;flex-direction:column;overflow:hidden';
    b.innerHTML = `<div class="map-wrap"><div id="pickmap" aria-label="지도에서 위치를 눌러 고르세요"></div><div class="map-search"><span class="si">${I.search}</span><input class="input" id="mapQ" placeholder="${KAKAO_READY ? '장소, 역, 주소로 검색' : '역 이름이나 구 이름으로 찾기'}" aria-label="만남 장소 검색" autocomplete="off"><div class="map-results" id="mapR" hidden></div></div><div class="map-hint" id="mapHint">${KAKAO_READY ? '지도를 눌러 위치를 고르세요' : '간이 지도예요 · 지도를 눌러 위치를 고르세요'}</div><button type="button" class="map-gps-btn" id="mapGpsBtn" aria-label="내 위치로 이동">${I.gps}</button></div>
      <div class="map-panel">${kNote ? `<div class="note" style="margin:0 0 10px">${I.info}<span>${esc(kNote)}</span></div>` : ''}<div class="field" style="margin-bottom:12px"><label for="mapName">장소 이름 <small>상대에게 보여요</small></label><input class="input" id="mapName" maxlength="30" placeholder="지도를 누르면 자동으로 채워져요" value="${pick ? esc(pick.name) : ''}"></div><button class="btn btn-primary btn-block" id="mapOk" ${pick ? '' : 'disabled'}>이 위치로 정하기</button></div>`;
    const setPick = (lat, lng, name) => {
      const guess = placeName(lat, lng);
      pick = {lat, lng, name:name || guess}; nameEdited = false;
      $('#mapName', sh).value = pick.name; $('#mapOk', sh).disabled = false; $('#mapHint', sh).textContent = '핀을 끌어서 옮길 수도 있어요';
      api.setPin(lat, lng);
      if (!name && !guess.endsWith('역 근처') && api.lookupName) api.lookupName(lat, lng, n => { if (n && !nameEdited && pick && pick.lat === lat && pick.lng === lng) { pick.name = n; $('#mapName', sh).value = n; } });
    };
    const api = KAKAO_READY ? kakaoPicker($('#pickmap', sh), center, initial, setPick) : svgPicker($('#pickmap', sh), center, initial, setPick);
    sh._onClose = () => api.destroy && api.destroy();
    setTimeout(() => api.resize && api.resize(), 520);
    $('#mapGpsBtn', sh).addEventListener('click', async e => {
      const gpsBtn = e.currentTarget;
      gpsBtn.disabled = true;
      try {
        const pos = await getGpsPosition();
        api.fly(pos.lat, pos.lng);
        setPick(pos.lat, pos.lng);
        toast('현재 위치로 이동했어요.');
      } catch (ex) {
        toast(ex.message || '현재 위치를 확인하지 못했어요.');
      } finally { gpsBtn.disabled = false; }
    });
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

/* 당근마켓 스타일: 내 동네 설정 & 반경 지도 시트 */
function openRegionSheet() {
  const me = profileOf(App.me);
  let state = {
    region:me.region || '마포구',
    dong:me.dong || '',
    loc:me.loc ? {...me.loc} : (CENT[me.region] ? {lat:CENT[me.region][0], lng:CENT[me.region][1]} : {lat:SEOUL_CENTER[0], lng:SEOUL_CENTER[1]}),
    locVerified:!!me.locVerified,
    rangeKm:UI.rangeKm || 0
  };
  const kNote = kakaoStatusNote();
  let kMap = null, kCircle = null, kMarker = null;

  openSheet({
    title:'내 동네 설정', full:true,
    foot:'<button class="btn btn-primary btn-block" id="rSave">이 동네로 적용하기</button>',
    body:`<div class="region-map-box"><div id="regionMapCanvas"></div><div class="region-map-badge" id="rMapBadge">${esc(LOC.userRegionLabel ? LOC.userRegionLabel(state) : state.region)}</div></div>
      ${kNote ? `<div class="note" style="margin:0 0 12px">${I.info}<span>${esc(kNote)}</span></div>` : ''}
      <button type="button" class="loc-btn" id="rGpsBtn" style="margin-bottom:12px">${I.gps}<span>현재 위치로 동네 인증하기</span></button>
      <div class="field"><div class="lbl">주변 탐색 범위 <small>선택한 거리 안의 물건만 볼 수 있어요</small></div>
        <div class="seg in-form" id="rRange" data-seg="rRange">
          <button type="button" data-v="2" class="${state.rangeKm === 2 ? 'on' : ''}">가까운 2km</button>
          <button type="button" data-v="5" class="${state.rangeKm === 5 ? 'on' : ''}">주변 5km</button>
          <button type="button" data-v="0" class="${state.rangeKm === 0 ? 'on' : ''}">전체 지역</button>
        </div>
      </div>
      <div class="field"><div class="lbl">직접 동네 고르기</div>
        <div class="region-grid" id="rGrid">${REGIONS.map(r => `<button type="button" class="chip ${state.region === r ? 'on-accent' : ''}" data-v="${esc(r)}">${esc(r)}</button>`).join('')}</div>
      </div>`,
    onMount(sh) {
      const drawMap = () => {
        const badge = $('#rMapBadge', sh);
        const lbl = LOC.userRegionLabel ? LOC.userRegionLabel(state) : state.region;
        badge.textContent = `${lbl}${state.locVerified ? ' · 인증됨' : ''}${state.rangeKm ? ' · 반경 ' + state.rangeKm + 'km' : ''}`;
        const el = $('#regionMapCanvas', sh);
        if (!el) return;
        const lat = (state.loc && state.loc.lat) || SEOUL_CENTER[0];
        const lng = (state.loc && state.loc.lng) || SEOUL_CENTER[1];
        if (KAKAO_READY && window.kakao && kakao.maps) {
          const K = kakao.maps;
          const pos = new K.LatLng(lat, lng);
          const lvl = state.rangeKm === 2 ? 6 : state.rangeKm === 5 ? 7 : 8;
          if (!kMap) {
            kMap = new K.Map(el, {center:pos, level:lvl});
            kMarker = new K.Marker({position:pos, image:kakaoPinImage()});
            kMarker.setMap(kMap);
            setTimeout(() => { kMap && kMap.relayout(); kMap && kMap.setCenter(pos); }, 460);
          } else {
            kMap.setLevel(lvl);
            kMap.panTo(pos);
            kMarker.setPosition(pos);
          }
          if (kCircle) { kCircle.setMap(null); kCircle = null; }
          if (state.rangeKm > 0) {
            const acc = cssVar('--accent') || '#E8762E';
            kCircle = new K.Circle({
              center:pos,
              radius:state.rangeKm * 1000,
              strokeWeight:2,
              strokeColor:acc,
              strokeOpacity:0.85,
              fillColor:acc,
              fillOpacity:0.14
            });
            kCircle.setMap(kMap);
          }
          return;
        }
        // 간이 지도(SVG) + 반경 표시
        const [px, py] = proj(lng, lat);
        const span = state.rangeKm === 2 ? 0.06 : 0.11;
        const w = span * COSL * 4000, h = span * 4000 * 0.65;
        const radiusPx = state.rangeKm > 0 ? (state.rangeKm / 111) * 4000 : 0;
        el.innerHTML = `<svg viewBox="${(px - w / 2).toFixed(1)} ${(py - h / 2).toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block"><g fill="var(--map-land)" stroke="var(--map-line)" stroke-width="1.2">${GEO_PATHS}</g>${radiusPx ? `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${radiusPx.toFixed(1)}" fill="var(--accent)" fill-opacity=".16" stroke="var(--accent)" stroke-width="1.4" stroke-dasharray="4 3"/>` : ''}<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4.5" fill="var(--accent)" stroke="#fff" stroke-width="1.5"/></svg>`;
      };

      drawMap();
      initSegs(sh);

      $('#rRange', sh).addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        state.rangeKm = +b.dataset.v;
        $$('#rRange button', sh).forEach(x => x.classList.toggle('on', x === b));
        initSegs(sh);
        drawMap();
      });

      $('#rGrid', sh).addEventListener('click', e => {
        const b = e.target.closest('[data-v]'); if (!b) return;
        state.region = b.dataset.v;
        state.dong = '';
        state.loc = CENT[state.region] ? {lat:CENT[state.region][0], lng:CENT[state.region][1]} : {lat:SEOUL_CENTER[0], lng:SEOUL_CENTER[1]};
        state.locVerified = false;
        $$('#rGrid .chip', sh).forEach(x => x.classList.toggle('on-accent', x === b));
        drawMap();
      });

      $('#rGpsBtn', sh).addEventListener('click', async e => {
        const btn = e.currentTarget;
        const orig = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="loc-spin"></span><span>현재 위치를 확인하는 중…</span>';
        try {
          const res = await detectCurrentNeighborhood();
          state.region = res.region;
          state.dong = res.dong;
          state.loc = {lat:res.lat, lng:res.lng};
          state.locVerified = true;
          $$('#rGrid .chip', sh).forEach(x => x.classList.toggle('on-accent', x.dataset.v === state.region));
          drawMap();
          toast(`${res.fullLabel} 인증이 완료됐어요!`);
        } catch (ex) {
          toast(ex.message || '현재 위치를 확인하지 못했어요.');
        } finally {
          if (document.body.contains(btn)) { btn.disabled = false; btn.innerHTML = orig; }
        }
      });

      $('#rSave', sh).addEventListener('click', async e => {
        if (!guardWrite()) return;
        await withLock(e.currentTarget, '저장하는 중…', async () => {
          try {
            await Store.patch('profiles', App.me, {
              region:state.region,
              dong:state.dong,
              loc:state.loc,
              locVerified:state.locVerified
            });
            UI.rangeKm = state.rangeKm;
            if (UI.rangeKm > 0) UI.sortBy = 'distance';
            closeSheet(sh);
            render();
            toast('내 동네 설정을 적용했어요.');
          } catch (err) {}
        });
      });
    }
  });
}

/* 당근마켓 스타일: 내 주변 물건 카카오맵 보기 */
function openNearbyMapSheet() {
  const meCoord = myGeoCoords() || {lat:SEOUL_CENTER[0], lng:SEOUL_CENTER[1]};
  const candidates = allItems().filter(i => i.status === 'available');
  const entries = (LOC.filterAndSortItems
    ? LOC.filterAndSortItems(candidates, {rangeKm:UI.rangeKm, sortBy:'distance', myCoords:meCoord, getOwner:profileOf, cent:CENT})
    : candidates.map(item => ({item, dist:null}))
  ).map(e => ({
    ...e,
    coords:LOC.itemCoords ? LOC.itemCoords(e.item, profileOf(e.item.owner), CENT) : null
  })).filter(e => e.coords);

  let selectedId = entries[0] ? entries[0].item.id : null;
  const kNote = kakaoStatusNote(true);

  openSheet({
    title:`주변 물건 지도 (${entries.length}개)`, full:true,
    body:'',
    onMount(sh) {
      const b = $('.sheet-body', sh);
      b.style.cssText = 'padding:0;display:flex;flex-direction:column;overflow:hidden;position:relative';
      b.innerHTML = `<div class="map-wrap" style="min-height:0">
          <div id="nearbyMapCanvas"></div>
          ${kNote ? `<div class="map-hint" style="top:10px;bottom:auto;max-width:calc(100% - 28px);white-space:nowrap">${esc(kNote)}</div>` : ''}
          <button type="button" class="map-gps-btn" id="nearbyGpsBtn" aria-label="내 위치로 중심 이동" style="bottom:${selectedId ? '132px' : '98px'}">${I.gps}</button>
          <div id="nearbyPreviewWrap"></div>
        </div>`;

      const renderPreview = () => {
        const wrap = $('#nearbyPreviewWrap', sh);
        const gpsBtn = $('#nearbyGpsBtn', sh);
        const found = entries.find(e => e.item.id === selectedId);
        if (gpsBtn) gpsBtn.style.bottom = found ? '132px' : '98px';
        if (!found) {
          wrap.innerHTML = `<div class="nearby-preview" style="padding:14px 16px;text-align:center"><div style="color:var(--muted);font-size:.88rem;margin-bottom:8px">현재 범위에 지도로 볼 수 있는 물건이 없어요.</div>${UI.rangeKm > 0 ? '<button type="button" class="btn btn-tint btn-sm" id="nearbyAllRange">전체 지역 물건 보기</button>' : ''}</div>`;
          const allBtn = $('#nearbyAllRange', wrap);
          if (allBtn) allBtn.addEventListener('click', () => { UI.rangeKm = 0; closeSheet(sh); render(); setTimeout(() => openNearbyMapSheet(), 200); });
          return;
        }
        const it = found.item;
        const p = profileOf(it.owner);
        const distTxt = found.dist != null ? formatDist(found.dist) : '';
        wrap.innerHTML = `<div class="nearby-preview"><button type="button" class="row" id="nearbyOpenItem" style="width:100%">
          <div class="thumb">${itemImg(it)}</div>
          <div class="row-body">
            <div class="row-title">${esc(it.title)}</div>
            <div class="row-meta">${esc(p.nickname)} · ${esc(LOC.userRegionLabel ? LOC.userRegionLabel(p) : p.region)}${distTxt ? ' · ' + esc(distTxt) : ''}</div>
            <div class="row-value ${it.value ? 'num' : 'muted'}">${it.value ? won(it.value) : '가치 비공개'}</div>
          </div>
          <span class="chev" style="align-self:center;color:var(--muted)">${I.chev}</span>
        </button></div>`;
        $('#nearbyOpenItem', wrap).addEventListener('click', () => {
          closeSheet(sh);
          setTimeout(() => pushPage({type:'item', id:it.id}), 180);
        });
      };

      const canvas = $('#nearbyMapCanvas', sh);
      let kMap = null;
      const pinEls = new Map();

      const highlightPin = id => {
        selectedId = id;
        for (const [pid, el] of pinEls.entries()) el.classList.toggle('on', pid === id);
        if (!KAKAO_READY) drawSvg(curCenter.lat, curCenter.lng);
        renderPreview();
      };

      let curCenter = {lat:meCoord.lat, lng:meCoord.lng};
      const drawSvg = (cLat, cLng) => {
        curCenter = {lat:cLat, lng:cLng};
        const [cx, cy] = proj(cLng, cLat);
        const span = 0.085, w = span * COSL * 4000, h = span * 4000 * 1.15;
        const svgMarks = entries.map(({item, coords}) => {
          const [ix, iy] = proj(coords.lng, coords.lat);
          return `<g class="svg-item-pin" data-item-pin="${item.id}" style="cursor:pointer"><circle cx="${ix.toFixed(1)}" cy="${iy.toFixed(1)}" r="4.8" fill="${item.id === selectedId ? 'var(--accent)' : 'var(--contrast)'}" stroke="#fff" stroke-width="1.4"/><text x="${ix.toFixed(1)}" y="${(iy - 7).toFixed(1)}" text-anchor="middle" font-size="4.6" font-weight="700" fill="var(--text)">${esc(item.title.slice(0, 8))}</text></g>`;
        }).join('');
        canvas.innerHTML = `<svg viewBox="${(cx - w / 2).toFixed(1)} ${(cy - h / 2).toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block"><g fill="var(--map-land)" stroke="var(--map-line)" stroke-width=".9">${GEO_PATHS}</g><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="4" fill="var(--good)" stroke="#fff" stroke-width="1.4"/>${svgMarks}</svg>`;
      };

      if (KAKAO_READY && window.kakao && kakao.maps) {
        const K = kakao.maps;
        const centerPos = new K.LatLng(meCoord.lat, meCoord.lng);
        kMap = new K.Map(canvas, {center:centerPos, level:UI.rangeKm === 2 ? 5 : 6});
        kMap.addControl(new K.ZoomControl(), K.ControlPosition.RIGHT);
        if (UI.rangeKm > 0) {
          const acc = cssVar('--accent') || '#E8762E';
          new K.Circle({center:centerPos, radius:UI.rangeKm * 1000, strokeWeight:2, strokeColor:acc, strokeOpacity:.8, fillColor:acc, fillOpacity:.1}).setMap(kMap);
        }
        entries.forEach(({item, coords}) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = `nearby-pin ${item.id === selectedId ? 'on' : ''}`;
          btn.textContent = item.value ? won(item.value) : item.title.slice(0, 7);
          btn.addEventListener('click', e => {
            e.stopPropagation();
            highlightPin(item.id);
            kMap.panTo(new K.LatLng(coords.lat, coords.lng));
          });
          pinEls.set(item.id, btn);
          new K.CustomOverlay({position:new K.LatLng(coords.lat, coords.lng), content:btn, yAnchor:1.2}).setMap(kMap);
        });
        setTimeout(() => { kMap && kMap.relayout(); kMap && kMap.setCenter(centerPos); }, 460);
      } else {
        drawSvg(meCoord.lat, meCoord.lng);
        canvas.addEventListener('click', e => {
          const g = e.target.closest('[data-item-pin]');
          if (!g) return;
          highlightPin(g.dataset.itemPin);
        });
      }

      renderPreview();

      $('#nearbyGpsBtn', sh).addEventListener('click', async e => {
        const btn = e.currentTarget;
        btn.disabled = true;
        try {
          const pos = await getGpsPosition();
          if (kMap && window.kakao) kMap.panTo(new kakao.maps.LatLng(pos.lat, pos.lng));
          else drawSvg(pos.lat, pos.lng);
          toast('현재 위치로 지도를 옮겼어요.');
        } catch (ex) {
          toast(ex.message || '현재 위치를 확인하지 못했어요.');
        } finally { btn.disabled = false; }
      });
    }
  });
}

/* ============ 찾는 것 ============ */
function openWantsSheet() {
  let wants = [...wantsOf(App.me)]; let mode = 'cat'; let top = 1;
  openSheet({title:'찾는 것', full:true, foot:'<button class="btn btn-primary btn-block" id="wSave">저장하기</button>', body:'', onMount(sh) {
    const draw = () => {
      $('.sheet-body', sh).innerHTML = `<p style="margin:0 4px 16px;color:var(--muted);font-size:.94rem">등록한 것과 맞는 물건이 홈의 추천 매칭에 떠요. 최대 5개까지 등록할 수 있어요.</p>
        <div class="field"><div class="lbl">등록한 항목 <small class="num">${wants.length}/5</small></div><div class="chips wrap">${wants.length ? wants.map((w, i) => `<button type="button" class="chip on" data-rm="${i}" aria-label="${esc(wantLabel(w))} 삭제">${esc(wantLabel(w))}<span class="x">${I.close.replace('<svg', '<svg style="width:12px;height:12px"')}</span></button>`).join('') : '<span class="hint" style="margin:0">아직 없어요</span>'}</div></div>
        <div class="seg in-form" id="wMode" data-seg="wMode" style="margin-bottom:16px"><button type="button" data-v="cat" class="${mode === 'cat' ? 'on' : ''}">카테고리로</button><button type="button" data-v="kw" class="${mode === 'kw' ? 'on' : ''}">키워드로</button></div>
        ${mode === 'cat' ? `<div class="chips wrap" id="wTop" style="margin-bottom:10px">${CATS.map(c => `<button type="button" class="chip ${top === c.id ? 'on' : ''}" data-top="${c.id}">${c.n}</button>`).join('')}</div><div class="chips wrap" id="wSub"><button type="button" class="chip" data-add="${top}">${CAT_NAME[top]} 전체</button>${CATS.find(c => c.id === top).subs.map(([id, n]) => `<button type="button" class="chip ${wants.some(w => w.t === 'cat' && w.c === id) ? 'on-accent' : ''}" data-add="${id}">${n}</button>`).join('')}</div>`
        : `<div style="display:flex;gap:8px"><input class="input" id="wKw" maxlength="20" placeholder="예: 아이브 안유진 포카" aria-label="찾는 키워드 입력"><button type="button" class="btn btn-tint" id="wKwAdd" style="flex:none">추가</button></div><div class="hint">물건 제목에 이 단어가 들어가면 매칭돼요.</div>`}`;
      initSegs(sh);
      const kw = $('#wKw', sh); if (kw) { const add = () => { const v = kw.value.trim(); if (!v) return toast('키워드를 입력하지 않았어요. 찾고 싶은 물건 이름을 적어 주세요.'); if (wants.length >= 5) return toast('최대 5개까지만 등록할 수 있어요. 기존 항목을 하나 지운 뒤 추가해 주세요.'); wants.push({t:'kw', k:v}); draw(); }; $('#wKwAdd', sh).addEventListener('click', add); kw.addEventListener('keydown', e => { if (e.key === 'Enter') add(); }); }
    };
    draw();
    $('.sheet-body', sh).addEventListener('click', e => {
      const rm = e.target.closest('[data-rm]'); if (rm) { wants.splice(+rm.dataset.rm, 1); draw(); return; }
      const m = e.target.closest('#wMode button'); if (m) { mode = m.dataset.v; draw(); return; }
      const t = e.target.closest('[data-top]'); if (t) { top = +t.dataset.top; draw(); return; }
      const a = e.target.closest('[data-add]'); if (a) { const c = +a.dataset.add; const i = wants.findIndex(w => w.t === 'cat' && w.c === c); if (i >= 0) wants.splice(i, 1); else if (wants.length >= 5) return toast('최대 5개까지만 등록할 수 있어요. 기존 항목을 하나 지운 뒤 선택해 주세요.'); else wants.push({t:'cat', c}); draw(); }
    });
    $('#wSave', sh).addEventListener('click', async e => {
      if (!guardWrite()) return;
      await withLock(e.currentTarget, '저장하는 중…', async () => {
        try { await Store.patch('profiles', App.me, {wants}); closeSheet(sh); toast('찾는 것을 저장했어요.'); } catch (err) {}
      });
    });
  }});
}

/* ============ 프로필 · 비밀번호 변경 · 회원 탈퇴 ============ */
function openProfileSheet() {
  const p = profileOf(App.me);
  let region = p.region, dong = p.dong || '', loc = p.loc || null, locVerified = !!p.locVerified;
  openSheet({title:'프로필 수정', full:true, foot:'<button class="btn btn-primary btn-block" id="pSave">저장하기</button>', body:`<div class="field"><label for="pNick">닉네임</label><input class="input" id="pNick" maxlength="10" value="${esc(p.nickname)}"><div class="hint" id="pHint"></div></div><div class="field"><div class="lbl">내 동네</div><button type="button" class="loc-btn" id="pGpsBtn" style="margin-bottom:10px">${I.gps}<span>현재 위치로 내 동네 찾기</span></button><div id="pGpsStatus" style="margin-bottom:10px">${locVerified && region ? `<div class="loc-verified">${I.check}<span>${esc(dong ? `${region} · ${dong}` : region)} 확인됨</span></div>` : ''}</div><div class="region-grid" id="pRegion">${REGIONS.map(r => `<button type="button" class="chip ${region === r ? 'on-accent' : ''}" data-v="${esc(r)}">${esc(r)}</button>`).join('')}</div></div>`, onMount(sh) {
    $('#pRegion', sh).addEventListener('click', e => {
      const b = e.target.closest('[data-v]'); if (!b) return;
      region = b.dataset.v; dong = ''; loc = CENT[region] ? {lat:CENT[region][0], lng:CENT[region][1]} : null; locVerified = false;
      $$('#pRegion .chip', sh).forEach(x => x.classList.toggle('on-accent', x === b));
      $('#pGpsStatus', sh).innerHTML = '';
    });
    $('#pGpsBtn', sh).addEventListener('click', async e => {
      const btn = e.currentTarget, orig = btn.innerHTML;
      btn.disabled = true; btn.innerHTML = '<span class="loc-spin"></span><span>현재 위치를 확인하는 중…</span>';
      try {
        const res = await detectCurrentNeighborhood();
        region = res.region; dong = res.dong; loc = {lat:res.lat, lng:res.lng}; locVerified = true;
        $$('#pRegion .chip', sh).forEach(x => x.classList.toggle('on-accent', x.dataset.v === region));
        $('#pGpsStatus', sh).innerHTML = `<div class="loc-verified">${I.check}<span>${esc(res.fullLabel)} 확인됨</span></div>`;
        toast(`${res.fullLabel}으로 설정했어요!`);
      } catch (ex) { toast(ex.message || '현재 위치를 확인하지 못했어요.'); }
      finally { if (document.body.contains(btn)) { btn.disabled = false; btn.innerHTML = orig; } }
    });
    $('#pSave', sh).addEventListener('click', async e => {
      if (!guardWrite()) return;
      const n = $('#pNick', sh).value.trim(); const err = validNick(n, App.me);
      if (err) { $('#pHint', sh).textContent = err; $('#pHint', sh).classList.add('err'); return; }
      await withLock(e.currentTarget, '저장하는 중…', async () => {
        try { await Store.patch('profiles', App.me, {nickname:n, region, dong, loc, locVerified}); closeSheet(sh); toast('프로필을 저장했어요.'); } catch (er) {}
      });
    });
  }});
}

function openChangePasswordSheet() {
  openSheet({title:'비밀번호 변경', foot:'<button class="btn btn-primary btn-block" id="cpSave">비밀번호 바꾸기</button>', body:`<div class="field"><label for="cp1">새 비밀번호 <small>8자 이상</small></label><input class="input" id="cp1" type="password" autocomplete="new-password"></div>
    <div class="field"><label for="cp2">새 비밀번호 확인</label><input class="input" id="cp2" type="password" autocomplete="new-password"></div>
    <div class="hint err" id="cpErr" role="alert"></div>`, onMount(sh) {
      $('#cpSave', sh).addEventListener('click', async e => {
        const p1 = $('#cp1', sh).value, p2 = $('#cp2', sh).value, err = $('#cpErr', sh);
        if (p1.length < 8) { err.textContent = '비밀번호가 너무 짧아요. 8자 이상으로 입력해 주세요.'; return; }
        if (p1 !== p2) { err.textContent = '새 비밀번호가 서로 달라요. 똑같이 다시 입력해 주세요.'; return; }
        err.textContent = '';
        await withLock(e.currentTarget, '저장하는 중…', async () => {
          try {
            if (!App.demo && sb) await q(sb.auth.updateUser({password:p1}));
            closeSheet(sh); toast('비밀번호를 바꿨어요.');
          } catch (ex) { err.textContent = krError(ex); }
        });
      });
    }});
}

async function handleDeleteAccount() {
  if (!guardWrite()) return;
  const active = myOffers().some(o => o.status === 'accepted');
  if (active) {
    toast('진행 중인 교환이 있어 탈퇴할 수 없어요. 교환을 먼저 완료해 주세요.');
    return;
  }
  const ok = await confirmDialog('정말 탈퇴할까요?', '프로필, 등록한 물건, 찜 목록이 모두 삭제되며 되돌릴 수 없어요.', '회원 탈퇴', true);
  if (!ok) return;
  try {
    for (const it of itemsOf(App.me)) {
      await deleteItemStoragePhotos(it.id, it.photos || []);
    }
    await Store.rpc('delete_my_account');
    if (!App.demo && sb) { try { await sb.auth.signOut(); } catch (e) {} }
    signOutLocal();
    toast('회원 탈퇴가 완료됐어요. 그동안 감사했어요.');
  } catch (e) {}
}

/* ============ 안전 교환 팁 카드 + 교환 제안 + 수락 ============ */
function openSafetyTipSheet(onContinue) {
  let hideNext = false;
  openSheet({title:'안전한 교환 팁', body:`<div class="note contrast" style="margin:0 0 14px">${I.shield}<span>첫 교환 제안 전에 아래 3가지만 기억해 주세요.</span></div>
    <div class="group" style="margin:0 0 14px">
      <div class="spec" style="display:block"><b style="display:block;margin-bottom:2px">1. 대면은 사람 많은 공공장소에서</b><span style="color:var(--muted);font-size:.86rem">지하철역 개찰구, 밝은 카페 앞에서 만나는 걸 추천해요.</span></div>
      <div class="spec" style="display:block"><b style="display:block;margin-bottom:2px">2. 주소·연락처는 꼭 필요할 때만</b><span style="color:var(--muted);font-size:.86rem">택배·문고리 교환이 수락된 뒤 앱 채팅에서 조심스럽게 나눠요.</span></div>
      <div class="spec" style="display:block"><b style="display:block;margin-bottom:2px">3. 선입금·외부 결제 요구는 주의</b><span style="color:var(--muted);font-size:.86rem">물물교환 외에 금전 요구가 있으면 바로 신고해 주세요.</span></div>
    </div>
    <button type="button" class="check-row" id="tipDontShow"><span class="cbox">${I.check}</span><span><b>다시 보지 않기</b><span>다음 교환 제안부터는 바로 제안 화면으로 넘어가요.</span></span></button>`,
    foot:'<button class="btn btn-primary btn-block" id="tipOk">확인하고 제안하기</button>',
    onMount(sh) {
      $('#tipDontShow', sh).addEventListener('click', e => { hideNext = !hideNext; e.currentTarget.classList.toggle('on', hideNext); });
      $('#tipOk', sh).addEventListener('click', () => {
        if (hideNext) localStorage.setItem('baggullae_hide_safety_tip', '1');
        closeSheet(sh);
        setTimeout(() => onContinue(), 180);
      });
    }
  });
}

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
        <div class="field"><div class="lbl">내 물건 고르기</div><div class="radio-list">${mine.map(i => `<button type="button" class="radio-item ${st.item === i.id ? 'on' : ''}" data-item="${i.id}"><span class="ri-thumb">${itemImg(i)}</span><span class="ri-t">${esc(i.title)}<small>${i.value ? won(i.value) + ' 상당' : '가치 비공개'}${matchesWants(i, theirW) ? ' · <b style="color:var(--contrast-text)">상대가 찾는 물건</b>' : ''}</small></span><span class="radio-dot"></span></button>`).join('')}</div>
        ${tgtEqual && picked && !picked.value ? `<div class="note" style="margin:10px 0 0">${I.info}<span>상대는 비슷한 가치의 교환을 원해요. 메모에 물건 가치를 알려 주면 좋아요.</span></div>` : ''}</div>
        <div class="field"><div class="lbl">교환 방식 <small>${target.methods && target.methods.length ? '상대가 가능한 방식' : '상대가 협의 가능으로 열어뒀어요'} · 선택 사항</small></div><div class="method-cards">${Object.keys(METHODS).map(k => `<button type="button" class="mc ${st.method === k ? 'on' : ''}" data-method="${k}" ${methods.includes(k) ? '' : 'disabled style="opacity:.35"'}>${I[k]}${METHODS[k]}<small>${METHOD_DESC[k]}</small></button>`).join('')}</div>
        ${st.method === 'meet' ? `<button type="button" class="place-pick" id="oMeet"><span class="pp-ic">${I.pin}</span><span style="flex:1;min-width:0"><b>${st.meet ? esc(st.meet.name) : '만남 장소 고르기'}</b><span>${st.meet && target.meet && st.meet.lat === target.meet.lat && st.meet.lng === target.meet.lng ? '상대가 정한 장소 · 탭해서 다른 장소 제안' : st.meet ? '내가 제안한 장소 · 탭해서 바꾸기' : '지도를 눌러 장소를 골라 주세요'}</span></span><span class="chev" style="color:var(--muted)">${I.chev}</span></button>${st.meet ? `<div class="place" style="margin-top:8px"><div class="pmap" style="height:120px">${miniMap(st.meet)}</div></div>` : ''}` : ''}
        ${st.method === 'door' || st.method === 'parcel' ? `<div class="note contrast" style="margin:10px 0 0">${I.shield}<span>주소는 수락 후 1:1 채팅에서만 주고받아요. 필요할 때만 알려 주세요.</span></div>` : ''}
        ${!st.method ? '<div class="hint">고르지 않으면 수락 후 채팅에서 정해요.</div>' : ''}</div>
        <div class="field"><label for="oMsg">한 줄 메모 <small>선택 · 100자</small></label><input class="input" id="oMsg" maxlength="100" placeholder="예: 주말 오후에 교환 가능해요" value="${esc(st.msg)}"></div>`;
      $('#oMsg', sh).addEventListener('input', e => { st.msg = e.target.value; });
      const om = $('#oMeet', sh); if (om) om.addEventListener('click', () => openMapPicker(st.meet, profileOf(App.me).region, m => { st.meet = m; draw(); }));
    };
    draw();
    $('.sheet-body', sh).addEventListener('click', e => {
      const it = e.target.closest('[data-item]'); if (it) { st.item = it.dataset.item; draw(); return; }
      const m = e.target.closest('[data-method]'); if (m && !m.disabled) { st.method = st.method === m.dataset.method ? '' : m.dataset.method; if (st.method === 'meet' && !st.meet) setTimeout(() => openMapPicker(null, profileOf(App.me).region, mm => { st.meet = mm; draw(); }), 150); draw(); }
    });
    $('#oSend', sh).addEventListener('click', async e => {
      if (st.method === 'meet' && !st.meet) return toast('만남 장소를 정하지 않았어요. 지도에서 장소를 골라 주세요.');
      const dup = Object.values(S.offers).find(o => o.from === App.me && o.target === targetId && o.offered === st.item && o.status === 'pending');
      if (dup) return toast('이미 같은 물건으로 제안했어요. 제안함에서 확인해 보세요.');
      await withLock(e.currentTarget, '저장하는 중…', async () => {
        try {
          await Store.set('offers', newId(), {from:App.me, to:target.owner, target:targetId, offered:st.item, message:st.msg.trim(), method:st.method || null, meet:st.method === 'meet' ? st.meet : null, status:'pending', fromDone:false, toDone:false, createdAt:now(), updatedAt:now()});
          closeSheet(sh); toast('교환을 제안했어요!');
        } catch (err) {}
      });
    });
  }});
}

function openAcceptSheet(offerId) {
  const o = S.offers[offerId];
  openSheet({title:'제안 수락', foot:'<button class="btn btn-primary btn-block" id="aOk">수락하고 채팅 시작하기</button>', body:`<p style="margin:0 4px 16px;color:var(--muted);font-size:.94rem">수락하면 두 사람만의 1:1 채팅방이 열리고 두 물건이 ‘예약중’이 돼요. 같은 물건에 걸린 다른 제안은 자동으로 거절돼요.</p>
    <div class="field"><label for="aLink">카카오 오픈채팅 링크 <small>선택 사항</small></label><input class="input" id="aLink" inputmode="url" placeholder="비워 두면 앱 채팅으로 대화해요" autocomplete="off"><div class="hint" id="aHint">카카오톡으로 대화하고 싶을 때만 https://open.kakao.com/ 주소를 넣어 주세요.</div></div>
    ${o.method === 'meet' && o.meet ? `<div class="place"><div class="pmap" style="height:120px">${miniMap(o.meet)}</div><div class="pinfo"><div class="pn">${esc(o.meet.name)}<small>제안된 만남 장소</small></div></div></div>` : ''}`, onMount(sh) {
    $('#aOk', sh).addEventListener('click', async e => {
      const link = $('#aLink', sh).value.trim();
      if (link && !/^https:\/\/open\.kakao\.com\//.test(link)) {
        const h = $('#aHint', sh); h.textContent = '링크 형식이 맞지 않아요. https://open.kakao.com/ 으로 시작하는 주소를 넣거나 비워 두세요.'; h.classList.add('err');
        return;
      }
      await withLock(e.currentTarget, '저장하는 중…', async () => {
        try {
          await acceptOffer(offerId, link);
          closeSheet(sh);
          toast('교환을 수락했어요. 채팅방이 열렸어요!');
          setTimeout(() => pushPage({type:'chat', id:offerId}), 250);
        } catch (err) {}
      });
    });
  }});
}

async function acceptOffer(id, link = '') {
  await Store.rpc('accept_offer', {p_offer:id, p_openchat:link});
  await loadState(['offers', 'items']);
}
async function completeOffer(id) {
  let r; try { r = await Store.rpc('complete_offer', {p_offer:id}); } catch (e) { return; }
  await loadState(['offers', 'items', 'challenges', 'profiles']);
  if (r !== 'completed') { toast('상대가 완료를 누르면 교환이 확정돼요.'); return; }
  celebrate(); toast('교환이 완료됐어요! 후기를 남겨 주세요.');
  setTimeout(() => openReviewSheet(id), 900);
}

function openReviewSheet(offerId) {
  const o = S.offers[offerId]; const other = o.from === App.me ? o.to : o.from; let score = '';
  openSheet({title:'교환 후기', foot:'<button class="btn btn-primary btn-block" id="rOk" disabled>후기 보내기</button>', body:`<p style="margin:0 4px 16px;font-size:1.05rem;font-weight:700">${esc(profileOf(other).nickname)}님과의 교환은 어땠나요?</p>
    <div class="scores">${[['good', '좋아요'], ['soso', '보통이에요'], ['bad', '별로예요']].map(([k, l]) => `<button type="button" class="score" data-s="${k}">${I[k]}${l}</button>`).join('')}</div>
    <div class="field" style="margin-top:18px"><label for="rText">한 줄 후기 <small>선택</small></label><input class="input" id="rText" maxlength="80" placeholder="예: 시간 약속을 잘 지켜주셨어요"></div><div class="hint">좋아요 +0.5°C, 별로예요 −1°C가 상대의 교환온도에 반영돼요.</div>`, onMount(sh) {
    $('.scores', sh).addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (!b) return; score = b.dataset.s; $$('.score', sh).forEach(x => x.classList.toggle('on', x === b)); $('#rOk', sh).disabled = false; });
    $('#rOk', sh).addEventListener('click', async e => {
      await withLock(e.currentTarget, '저장하는 중…', async () => {
        try { await Store.set('reviews', offerId + '_' + App.me, {offer:offerId, from:App.me, to:other, score, text:$('#rText', sh).value.trim(), at:now()}); closeSheet(sh); toast('후기를 보냈어요.'); } catch (err) {}
      });
    });
  }});
}

function openReportSheet(uid) {
  if (uid === App.me) return;
  let reason = '';
  openSheet({title:'신고하기', foot:'<button class="btn btn-block" style="background:var(--bad);color:#fff" id="rpOk" disabled>신고하기</button>', body:`<p style="margin:0 4px 14px;color:var(--muted)">${esc(profileOf(uid).nickname)}님을 신고하는 이유를 골라 주세요.</p><div class="radio-list">${['사기가 의심돼요', '약속 장소에 나오지 않았어요', '부적절한 물건이에요', '기타'].map(r => `<button type="button" class="radio-item" data-r="${r}" style="padding:14px"><span class="ri-t">${r}</span><span class="radio-dot"></span></button>`).join('')}</div>`, onMount(sh) {
    $('.radio-list', sh).addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (!b) return; reason = b.dataset.r; $$('.radio-item', sh).forEach(x => x.classList.toggle('on', x === b)); $('#rpOk', sh).disabled = false; });
    $('#rpOk', sh).addEventListener('click', async e => {
      await withLock(e.currentTarget, '접수하는 중…', async () => {
        try { await Store.set('reports', newId(), {from:App.me, to:uid, reason, at:now()}); closeSheet(sh); toast('신고가 접수됐어요.'); } catch (err) {}
      });
    });
  }});
}

function openStepNote(cid, i) {
  const c = S.challenges[cid];
  openSheet({title:(i + 1) + '단계 소감', foot:'<button class="btn btn-primary btn-block" id="nOk">저장하기</button>', body:`<div class="field"><label for="nText">소감 한 줄</label><input class="input" id="nText" maxlength="60" placeholder="예: 핸드크림이 무드등이 될 줄이야" value="${esc(c.steps[i].note || '')}"></div>`, onMount(sh) {
    $('#nOk', sh).addEventListener('click', async e => {
      await withLock(e.currentTarget, '저장하는 중…', async () => {
        const steps = c.steps.map((s, k) => k === i ? {...s, note:$('#nText', sh).value.trim()} : s);
        try { await Store.patch('challenges', cid, {steps}); closeSheet(sh); toast('소감을 저장했어요.'); } catch (err) {}
      });
    });
  }});
}

/* ============ 앱 내 알림 시트 ============ */
function notifCopy(n) {
  const nick = profileOf(n.actor).nickname;
  const item = n.itemId ? itemById(n.itemId) : null;
  const itemTitle = item ? `“${item.title}”` : '물건';
  switch (n.type) {
    case 'new_offer': return {ic:I.swap, cls:'accent', title:`${nick}님이 ${itemTitle}에 교환을 제안했어요`, sub:'제안함에서 확인해 보세요'};
    case 'offer_accepted': return {ic:I.check, cls:'contrast', title:`${nick}님이 내 제안을 수락했어요`, sub:'1:1 채팅방이 열렸어요'};
    case 'offer_rejected': return {ic:I.close, cls:'', title:`${nick}님이 제안을 거절했어요`, sub:'다른 물건도 둘러볼까요?'};
    case 'complete_requested': return {ic:I.swap, cls:'accent', title:`${nick}님이 교환 완료를 눌렀어요`, sub:'나도 교환 완료를 누르면 확정돼요'};
    case 'offer_completed': return {ic:I.trophy, cls:'contrast', title:`${nick}님과의 교환이 완료됐어요!`, sub:'따뜻한 후기를 남겨 보세요'};
    case 'new_review': return {ic:I.chat, cls:'accent', title:`${nick}님이 교환 후기를 남겼어요`, sub:'나의 바꿀래에서 확인해 보세요'};
    case 'challenge_cheer': return {ic:I.heartF, cls:'accent', title:`${nick}님이 내 챌린지를 응원했어요`, sub:'챌린지 타임라인 보기'};
    default: return {ic:I.bell, cls:'', title:'새 알림이 도착했어요', sub:''};
  }
}

function openNotificationsSheet() {
  openSheet({
    title:'알림', full:true,
    right:`<button class="btn btn-ghost btn-sm" id="nReadAll" style="font-size:.82rem">모두 읽음</button>`,
    body:'',
    onMount(sh) {
      const draw = () => {
        const list = myNotifications();
        const hasRead = list.some(n => n.read);
        $('.sheet-body', sh).innerHTML = !list.length
          ? `<div class="group" style="margin:0">${emptyBox('bell', '아직 알림이 없어요', '교환 제안이나 후기, 챌린지 응원이 오면 알려드려요.', '<button class="btn btn-primary btn-sm" id="nBrowse">물건 둘러보기</button>')}</div>`
          : `${hasRead ? `<div style="display:flex;justify-content:flex-end;margin-bottom:10px"><button type="button" class="btn btn-gray btn-sm" id="nClearRead">${I.trash}읽은 알림 지우기</button></div>` : ''}
            <div class="group" style="margin:0">${list.map(n => {
              const info = notifCopy(n);
              return `<div class="notif-row ${n.read ? '' : 'unread'}">
                <button type="button" style="display:flex;align-items:flex-start;gap:12px;flex:1;min-width:0;text-align:left" data-open="${n.id}">
                  <span class="notif-ic ${info.cls}">${info.ic}</span>
                  <span class="notif-body"><b>${esc(info.title)}</b><span>${esc(info.sub)} · ${ago(n.at)}</span></span>
                </button>
                <button type="button" class="notif-del" data-del="${n.id}" aria-label="알림 삭제">${I.close}</button>
              </div>`;
            }).join('')}</div>`;
      };
      draw();

      const readAllBtn = $('#nReadAll', sh);
      if (readAllBtn) readAllBtn.addEventListener('click', async () => {
        const unread = myNotifications().filter(n => !n.read);
        if (!unread.length) return toast('이미 모두 읽었어요.');
        await withLock(readAllBtn, '처리 중…', async () => {
          await Promise.all(unread.map(n => Store.patch('notifications', n.id, {read:true}).catch(() => {})));
          draw(); toast('모든 알림을 읽음으로 표시했어요.');
        });
      });

      $('.sheet-body', sh).addEventListener('click', async e => {
        if (e.target.closest('#nBrowse')) { closeSheet(sh); ACT.browseAll(); return; }
        const clr = e.target.closest('#nClearRead');
        if (clr) {
          const targets = myNotifications().filter(n => n.read);
          await withLock(clr, '삭제하는 중…', async () => {
            await Promise.all(targets.map(n => Store.del('notifications', n.id).catch(() => {})));
            draw(); toast('읽은 알림을 모두 지웠어요.');
          });
          return;
        }
        const delBtn = e.target.closest('[data-del]');
        if (delBtn) {
          await Store.del('notifications', delBtn.dataset.del).catch(() => {});
          draw(); return;
        }
        const openBtn = e.target.closest('[data-open]');
        if (openBtn) {
          const n = S.notifications[openBtn.dataset.open];
          if (!n) return;
          if (!n.read) Store.patch('notifications', openBtn.dataset.open, {read:true}).catch(() => {});
          closeSheet(sh);
          if (n.type === 'challenge_cheer' && n.challengeId) pushPage({type:'challenge', id:n.challengeId});
          else if (n.type === 'new_review') { UI.tab = 'me'; UI.meSeg = 'reviews'; render(); }
          else if ((n.type === 'offer_accepted' || n.type === 'complete_requested' || n.type === 'offer_completed') && n.offerId && S.offers[n.offerId]) {
            pushPage({type:'chat', id:n.offerId});
          } else {
            UI.tab = 'offers'; UI.offerSeg = n.type === 'new_offer' ? 'recv' : 'sent'; render();
          }
        }
      });
    }
  });
}

/* ============ 공유 카드 & 축하 ============ */
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
    if (s.img) { try { const im = await loadImage(assetUrl(s.img)); const r = Math.max(130 / im.width, 130 / im.height); g.drawImage(im, 90 + (130 - im.width * r) / 2, y + 25 + (130 - im.height * r) / 2, im.width * r, im.height * r); } catch (e) {} }
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
function celebrate(kind = 'full') {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = document.createElement('canvas'); cv.style.cssText = 'position:absolute;inset:0;z-index:300;pointer-events:none;width:100%;height:100%'; $('#stage').appendChild(cv);
  const r = cv.getBoundingClientRect(); cv.width = r.width * 2; cv.height = r.height * 2; const g = cv.getContext('2d');
  const cs = getComputedStyle(document.documentElement); const cols = [cs.getPropertyValue('--accent'), cs.getPropertyValue('--contrast'), '#F2C14E', '#2C9564'];
  const n = kind === 'mini' ? 40 : 90; const dur = kind === 'mini' ? 60 : 90;
  const ps = Array.from({length:n}, () => ({x:cv.width / 2, y:cv.height * (kind === 'mini' ? .3 : .45), vx:(Math.random() - .5) * 24, vy:-Math.random() * 24 - 6, s:Math.random() * 9 + 5, c:cols[Math.floor(Math.random() * 4)], r:Math.random() * 6}));
  let t = 0; (function f() { g.clearRect(0, 0, cv.width, cv.height); ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 1.05; p.r += .15; g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.restore(); }); if (++t < dur) requestAnimationFrame(f); else cv.remove(); })();
}

/* ============ 네트워크 상태 & 키보드 가림 방지 ============ */
function syncOnlineState() {
  const bar = $('#offlineBar'); if (!bar) return;
  const online = navigator.onLine !== false;
  if (online && !App.online && App.session) { loadState().catch(() => {}); }
  App.online = online;
  bar.hidden = online;
}
window.addEventListener('online', syncOnlineState);
window.addEventListener('offline', syncOnlineState);

document.addEventListener('focusin', e => {
  const el = e.target;
  if (!el || !el.matches('input, textarea, select')) return;
  setTimeout(() => {
    try { el.scrollIntoView({block:'center', behavior:'smooth'}); } catch (er) {}
  }, 260);
});
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => {
    const el = document.activeElement;
    if (el && el.matches('input, textarea, select')) {
      setTimeout(() => { try { el.scrollIntoView({block:'nearest', behavior:'smooth'}); } catch (er) {} }, 80);
    }
  });
}

/* ============ 시작 ============ */
async function boot() {
  buildGeoPaths(); initKakao(); syncOnlineState();
  const ld = $('#loading');
  if (ld) ld.innerHTML = skeletonListHtml(4);

  const params = new URLSearchParams(location.search);
  if (AUTOSTART) {
    initDemoData();
    if (ld) ld.remove();
    if (params.get('recovery') === '1') App.recovery = true;
    else if (params.get('auth') === '1') { App.session = false; App.me = null; }
    render();
    return;
  }

  if (!sb) {
    if (ld) ld.remove();
    $('#stage').insertAdjacentHTML('beforeend', `<div class="auth"><div class="auth-hero"><div class="logo">${I.swap}</div><h1>설정이 필요해요</h1><p class="lead" style="margin:0">현재 페이지에는 Supabase 키가 들어가 있지 않아요. GitHub 저장소의 Secrets에 SUPABASE_URL, SUPABASE_ANON_KEY를 넣으셨다면 <b>main</b>에 push하거나 GitHub <b>Actions → GitHub Pages 배포</b>를 실행해 배포 주소에서 열어 주세요.</p></div><div class="auth-actions"><button class="btn btn-primary btn-block" data-act="startDemo">데모 데이터로 먼저 둘러보기</button></div><div class="auth-foot">실제 회원가입과 데이터 저장은 GitHub Pages 배포 주소 또는 .env 빌드에서 동작해요.</div></div>`);
    return;
  }

  const hashRecovery = /type=recovery/.test(location.hash || '');
  if (hashRecovery) App.recovery = true;

  sb.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      App.recovery = true; App.loading = false;
      const l = $('#loading'); if (l) l.remove();
      render(); return;
    }
    if (event === 'SIGNED_OUT' && App.session) signOutLocal();
    if (event === 'SIGNED_IN' && !App.session && !App.recovery && session && !App.loading && !$('#authForm')) {
      enterSession(session.user).then(() => render());
    }
  });

  try {
    const {data} = await sb.auth.getSession();
    if (!App.recovery && data && data.session) await enterSession(data.session.user);
  } catch (e) { toast(krError(e)); }

  App.loading = false;
  if (ld) ld.remove();
  render();
  const m = location.hash.match(/^#challenge-([A-Za-z0-9_-]+)$/);
  if (m && S.challenges[m[1]] && App.session && S.profiles[App.me]) pushPage({type:'challenge', id:m[1]});
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') { const sh = $$('.sheet').pop(); if (sh) closeSheet(sh); else if (UI.stack.length) popPage(); } });
setInterval(() => { if (!$('.sheet') && !$('.dialog') && App.session && S.profiles[App.me]) scheduleRender(); }, 60000);
boot();
