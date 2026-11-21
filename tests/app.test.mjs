import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

function loadBaggullaeVm() {
  const noopEl = () => ({
    classList: { toggle() {}, add() {}, remove() {}, contains: () => false },
    dataset: {},
    style: {},
    children: [],
    append() {},
    appendChild() {},
    prepend() {},
    remove() {},
    insertAdjacentHTML() {},
    addEventListener() {},
    setAttribute() {},
    querySelector: () => null,
    querySelectorAll: () => [],
    focus() {},
    scrollHeight: 0,
    scrollTop: 0,
    clientHeight: 0,
    innerHTML: '',
    textContent: '',
    hidden: false,
  });

  const ls = new Map();
  const sandbox = {
    console,
    Math,
    Date,
    Number,
    String,
    Array,
    Object,
    Set,
    Map,
    JSON,
    Promise,
    Error,
    RegExp,
    URL,
    URLSearchParams,
    encodeURIComponent,
    decodeURIComponent,
    setTimeout: () => 0,
    clearTimeout: () => {},
    setInterval: () => 0,
    clearInterval: () => {},
    requestAnimationFrame: () => 0,
    matchMedia: () => ({ matches: false }),
    localStorage: {
      getItem: k => (ls.has(k) ? ls.get(k) : null),
      setItem: (k, v) => ls.set(k, String(v)),
      removeItem: k => ls.delete(k),
    },
    location: { search: '?autostart=1', hash: '', pathname: '/', origin: 'https://example.test' },
    navigator: { onLine: true },
    history: { replaceState() {} },
    document: {
      documentElement: {},
      body: { contains: () => false },
      activeElement: null,
      addEventListener() {},
      querySelector: s => (s === '#auth' || s === '.sheet' || s === '.dialog' ? null : noopEl()),
      querySelectorAll: () => [],
      getElementById: () => noopEl(),
      createElement: () => noopEl(),
    },
    APP_CONFIG: { supabaseUrl: '', supabaseAnonKey: '' },
    addEventListener() {},
  };
  sandbox.window = sandbox;

  const geoCode = fs.readFileSync(path.resolve('src/geo.js'), 'utf8');
  const locCode = fs.readFileSync(path.resolve('src/location.js'), 'utf8');
  const appCode = fs.readFileSync(path.resolve('src/app.js'), 'utf8');
  vm.createContext(sandbox);
  vm.runInContext(geoCode, sandbox, { filename: 'src/geo.js' });
  vm.runInContext(locCode, sandbox, { filename: 'src/location.js' });
  vm.runInContext(appCode, sandbox, { filename: 'src/app.js' });
  // Expose top-level lexical bindings (const/let) via helper eval inside context
  return vm.runInContext(
    '({ S, App, CENT, STATIONS, GEO, REGIONS, LOC, detectPrivateInfo, validNick, krError, normalizeSupabaseUrl, evalPasswordSecurity, offerById, chatMessagesOf, hasChatRoom, chatWriteState, canWriteChat, unreadChatCount, unreadNotifCount, myChatRooms, onboardingProgress, homeGreeting, tempOf, matchFeed, extractStoragePath, initDemoData, CHAT_GRACE_MS })',
    sandbox
  );
}

const ctx = loadBaggullaeVm();

describe('바꿀래 핵심 로직 단위 테스트', () => {
  it('detectPrivateInfo: 전화번호와 주소를 탐지하고 일반 대화는 통과시킨다', () => {
    assert.equal(ctx.detectPrivateInfo('010-1234-5678로 연락 주세요'), true);
    assert.equal(ctx.detectPrivateInfo('010 9876 5432 입니다'), true);
    assert.equal(ctx.detectPrivateInfo('서울시 마포구 양화로 123 앞에서 만나요'), true);
    assert.equal(ctx.detectPrivateInfo('101동 1203호로 보내주세요'), true);
    assert.equal(ctx.detectPrivateInfo('홍대입구역 8번 출구 앞에서 오후 3시에 봬요!'), false);
    assert.equal(ctx.detectPrivateInfo('선물 받은 새상품이라 상태 좋아요'), false);
  });

  it('validNick: 길이, 문자, 중복 닉네임을 검증한다', () => {
    ctx.initDemoData();
    assert.match(ctx.validNick('ㄱ'), /2~10자/);
    assert.match(ctx.validNick('아주긴닉네임열글자넘음'), /2~10자/);
    assert.match(ctx.validNick('민트 귤!'), /한글, 영문, 숫자만/);
    assert.match(ctx.validNick('포카모아', 'demo-me'), /이미 쓰고 있는 닉네임/);
    assert.equal(ctx.validNick('민트귤', 'demo-me'), '');
    assert.equal(ctx.validNick('새닉네임2', 'demo-me'), '');
  });

  it('krError: 영어 오류를 원인과 해결 방법 안내로 바꾼다', () => {
    const loginErr = ctx.krError({ message: 'Invalid login credentials' });
    assert.match(loginErr, /맞지 않아요/);
    assert.match(loginErr, /다시 확인/);

    const pwErr = ctx.krError({ message: 'Password should be at least 6 characters' });
    assert.match(pwErr, /8자 이상/);

    const netErr = ctx.krError({ message: 'Failed to fetch' });
    assert.match(netErr, /인터넷 연결/);

    const tableGrantErr = ctx.krError({ code: '42501', message: 'permission denied for table profiles' });
    assert.match(tableGrantErr, /schema\.sql/);

    const rlsErr = ctx.krError({ code: '42501', message: 'new row violates row-level security policy' });
    assert.match(rlsErr, /로그인 상태/);
  });

  it('채팅방 열림 여부 및 완료/거절 후 7일 읽기 전용 전환을 계산한다', () => {
    const base = 1_700_000_000_000;
    const grace = ctx.CHAT_GRACE_MS; // 7 days in ms

    const pendingOffer = { id: 'o-pend', status: 'pending', createdAt: base };
    assert.equal(ctx.hasChatRoom(pendingOffer), false);
    assert.equal(ctx.canWriteChat(pendingOffer, base), false);

    const acceptedOffer = { id: 'o-acc', status: 'accepted', acceptedAt: base };
    assert.equal(ctx.hasChatRoom(acceptedOffer), true);
    assert.equal(ctx.chatWriteState(acceptedOffer, base + grace * 2), 'open');
    assert.equal(ctx.canWriteChat(acceptedOffer, base + grace * 2), true);

    const completedRecent = { id: 'o-done1', status: 'completed', completedAt: base };
    assert.equal(ctx.chatWriteState(completedRecent, base + grace - 1000), 'grace');
    assert.equal(ctx.canWriteChat(completedRecent, base + grace - 1000), true);

    const completedExpired = { id: 'o-done2', status: 'completed', completedAt: base };
    assert.equal(ctx.chatWriteState(completedExpired, base + grace + 1000), 'readonly');
    assert.equal(ctx.canWriteChat(completedExpired, base + grace + 1000), false);
  });

  it('extractStoragePath: public Storage URL에서 파일 경로를 뽑아낸다', () => {
    const path1 = ctx.extractStoragePath(
      'https://abc.supabase.co/storage/v1/object/public/item-photos/user1/item9/1.jpg?v=12345'
    );
    assert.equal(path1, 'user1/item9/1.jpg');
    assert.equal(ctx.extractStoragePath('data:image/jpeg;base64,/9j/4AAQ'), null);
  });

  it('온보딩 3단계 진행도, 홈 인사말, 안 읽은 채팅·알림 수, 매칭과 온도를 계산한다', () => {
    ctx.initDemoData();
    const progBefore = ctx.onboardingProgress('demo-me');
    assert.equal(progBefore.doneCount, 2); // wants & item exist, no outgoing offer from demo-me yet
    assert.equal(progBefore.allDone, false);

    // Outgoing offer completes onboarding 3/3
    ctx.S.offers['demo-sent'] = {
      from: 'demo-me',
      to: 'ex-jun',
      target: 'ex-i3',
      offered: 'demo-my1',
      status: 'pending',
      createdAt: Date.now(),
    };
    const progAfter = ctx.onboardingProgress('demo-me');
    assert.equal(progAfter.doneCount, 3);
    assert.equal(progAfter.allDone, true);

    assert.equal(ctx.unreadChatCount(), 1);
    assert.equal(ctx.unreadNotifCount(), 1);
    assert.equal(ctx.myChatRooms().length, 1);
    const chatOffer = ctx.offerById('demo-o1');
    assert.equal(chatOffer.id, 'demo-o1');
    assert.equal(ctx.chatMessagesOf(chatOffer.id).length, 1);

    const feed = ctx.matchFeed();
    assert.ok(feed.perfect.some(i => i.id === 'ex-i1')); // 포카모아 wants cat 22 (lip tint) & has cat 11 (photocard)
    assert.equal(ctx.tempOf('ex-hana'), 37.0); // 36.5 + 0.5 good review

    const greet = ctx.homeGreeting(ctx.S.profiles['demo-me'], Date.now());
    assert.ok(greet.length > 0);
  });

  it('normalizeSupabaseUrl: /rest/v1 등 경로를 제거하고 origin만 반환한다', () => {
    assert.equal(
      ctx.normalizeSupabaseUrl('https://rqldmrnvmjesizljfkhc.supabase.co/rest/v1'),
      'https://rqldmrnvmjesizljfkhc.supabase.co'
    );
    assert.equal(
      ctx.normalizeSupabaseUrl('https://rqldmrnvmjesizljfkhc.supabase.co/'),
      'https://rqldmrnvmjesizljfkhc.supabase.co'
    );
    assert.equal(ctx.normalizeSupabaseUrl('{{SUPABASE_URL}}'), '');
    assert.equal(ctx.normalizeSupabaseUrl('not-a-url'), '');
  });

  it('evalPasswordSecurity: 비밀번호 강도 단계, 규칙 충족, 확인 일치 여부를 계산한다', () => {
    const empty = ctx.evalPasswordSecurity('', '');
    assert.equal(empty.level, 0);
    assert.equal(empty.match, 'empty');

    const weak = ctx.evalPasswordSecurity('abc123', 'abc123');
    assert.equal(weak.level, 1);
    assert.equal(weak.rules.len, false);
    assert.equal(weak.match, 'match');

    const fair = ctx.evalPasswordSecurity('abcdefgh', 'abcd');
    assert.equal(fair.level, 2);
    assert.equal(fair.rules.len, true);
    assert.equal(fair.match, 'mismatch');

    const good = ctx.evalPasswordSecurity('abcde123', 'abcde123');
    assert.equal(good.level, 3);
    assert.equal(good.rules.mix, true);

    const strong = ctx.evalPasswordSecurity('abcde123!', 'abcde123!');
    assert.equal(strong.level, 4);
    assert.equal(strong.rules.special, true);
    assert.equal(strong.match, 'match');
  });

  it('LOC: 거리 포맷, 좌표 반올림, 동네 라벨을 정확히 계산한다', () => {
    const LOC = ctx.LOC;
    assert.equal(LOC.roundPublicCoord(37.556349), 37.556);
    assert.equal(LOC.formatDistance(45), '100m 이내');
    assert.equal(LOC.formatDistance(640), '650m');
    assert.equal(LOC.formatDistance(1480), '1.5km');
    assert.equal(LOC.userRegionLabel({ region: '마포구', dong: '서교동' }), '마포구 · 서교동');
    assert.equal(LOC.userRegionLabel({ region: '마포구', dong: '서교동' }, true), '서교동');
    assert.equal(LOC.userRegionLabel({ region: '그 외 지역', dong: '부산 해운대구' }), '부산 해운대구');
  });

  it('LOC.parseKakaoRegionResult: 카카오 coord2RegionCode 결과를 서울 구/경기/인천/기타로 매핑한다', () => {
    const LOC = ctx.LOC;
    const seoulRes = {...LOC.parseKakaoRegionResult([
      { region_type: 'B', region_1depth_name: '서울특별시', region_2depth_name: '마포구', region_3depth_name: '서교동' },
      { region_type: 'H', region_1depth_name: '서울특별시', region_2depth_name: '마포구', region_3depth_name: '서교동' },
    ], ctx.REGIONS)};
    assert.deepEqual(seoulRes, { region: '마포구', dong: '서교동', fullLabel: '마포구 서교동' });

    const ggRes = {...LOC.parseKakaoRegionResult([
      { region_type: 'H', region_1depth_name: '경기도', region_2depth_name: '성남시 분당구', region_3depth_name: '정자동' },
    ], ctx.REGIONS)};
    assert.deepEqual(ggRes, { region: '경기도', dong: '성남시 분당구 정자동', fullLabel: '경기도 성남시 분당구 정자동' });

    const icRes = {...LOC.parseKakaoRegionResult([
      { region_type: 'H', region_1depth_name: '인천광역시', region_2depth_name: '연수구', region_3depth_name: '송도동' },
    ], ctx.REGIONS)};
    assert.deepEqual(icRes, { region: '인천', dong: '연수구 송도동', fullLabel: '인천 연수구 송도동' });
  });

  it('LOC.nearestRegionAndStation & filterAndSortItems: GPS 폴백과 반경·가까운순 필터가 동작한다', () => {
    const LOC = ctx.LOC;
    // 홍대입구역 좌표
    const fb = LOC.nearestRegionAndStation(37.5563, 126.9236, ctx.CENT, ctx.STATIONS, ctx.GEO, ctx.REGIONS);
    assert.equal(fb.region, '마포구');
    assert.equal(fb.nearestStation, '홍대입구역');
    assert.match(fb.dong, /홍대입구역/);

    const myCoords = { lat: 37.5563, lng: 126.9236 };
    const items = [
      { id: 'near', owner: 'u1', region: '마포구', meet: { lat: 37.557, lng: 126.924 }, createdAt: 100 },
      { id: 'mid', owner: 'u2', region: '용산구', meet: { lat: 37.530, lng: 126.964 }, createdAt: 300 },
      { id: 'far', owner: 'u3', region: '송파구', meet: { lat: 37.513, lng: 127.100 }, createdAt: 200 },
    ];
    const sorted = LOC.filterAndSortItems(items, { rangeKm: 0, sortBy: 'distance', myCoords, cent: ctx.CENT });
    assert.deepEqual(sorted.map(x => x.item.id), ['near', 'mid', 'far']);

    const within2km = LOC.filterAndSortItems(items, { rangeKm: 2, sortBy: 'recent', myCoords, cent: ctx.CENT });
    assert.deepEqual(within2km.map(x => x.item.id), ['near']);
  });
});
