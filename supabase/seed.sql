-- =====================================================================
-- 바꿀래 시연용 목업 & 데모 계정 통합 시드 (Supabase SQL Editor에서 실행)
--
-- 사전 준비: 먼저 최신 supabase/schema.sql 을 실행해 테이블과 보안 정책/함수를 만들어 주세요.
-- 여러 번 실행해도 안전하도록 기존 시드/데모 데이터를 정리한 뒤 다시 넣어요.
--
-- [포함된 데이터]
--  - 시연용 로그인 계정 3개 (공통 비밀번호: Baggullae1!)
--      1) demo1@baggullae.kr  (민트귤 · 마포구 서교동) : 받은/보낸 제안, 진행 중 채팅, 완료·후기 전체 체험
--      2) demo2@baggullae.kr  (포카모아 · 마포구 합정동) : 민트귤과 2인 실시간 채팅 · 제안 수락 · 챌린지 이어가기
--      3) demo3@baggullae.kr  (새싹클립 · 강남구 역삼동) : 완주 챌린지 공유카드 · 무료 나눔 체험
--  - 이웃 프로필 7명 (총 10명)
--  - AI 사진이 연결된 다양한 카테고리 물건 36개 (교환 가능 28 · 예약/진행 중 4 · 교환 완료 4)
--  - 빨간 클립 챌린지 5개 (진행 중 4 · 완주 1)
--  - 교환 제안 11건 (대기/진행 중/완료/거절/취소 전체 상태)
--  - 1:1 채팅 메시지 16개 (사진 메시지 · 읽음/안읽음 포함)
--  - 교환 후기 5개, 찜 5개, 알림 9개
-- =====================================================================

set search_path = public, auth, extensions;

-- 1. 기존 예시·목업·데모 데이터 정리 (재실행 시 충돌 방지)
delete from notifications where id like 'mock-%' or (id like 'nt_%' and recipient in (
  'a1000000-0000-4000-8000-000000000001',
  'a1000000-0000-4000-8000-000000000002',
  'a1000000-0000-4000-8000-000000000003'
));
delete from messages where id like 'ex-%' or id like 'mock-%';
delete from favorites where id like 'ex-%' or id like 'a1000000-0000-4000-8000-00000000000%';
delete from reviews where id like 'ex-%' or id like 'mock-%';
delete from offers where id like 'ex-%' or id like 'mock-%';
delete from challenges where id like 'ex-%' or id like 'mock-%';
delete from items where id like 'ex-%' or id like 'mock-%';
delete from profiles where id like 'ex-%' or id like 'mock-%' or id in (
  'a1000000-0000-4000-8000-000000000001',
  'a1000000-0000-4000-8000-000000000002',
  'a1000000-0000-4000-8000-000000000003'
);

delete from auth.identities where user_id in (
  'a1000000-0000-4000-8000-000000000001'::uuid,
  'a1000000-0000-4000-8000-000000000002'::uuid,
  'a1000000-0000-4000-8000-000000000003'::uuid
);
delete from auth.users where id in (
  'a1000000-0000-4000-8000-000000000001'::uuid,
  'a1000000-0000-4000-8000-000000000002'::uuid,
  'a1000000-0000-4000-8000-000000000003'::uuid
) or email in ('demo1@baggullae.kr', 'demo2@baggullae.kr', 'demo3@baggullae.kr');

-- 2. 시연용 Supabase Auth 계정 3개 생성 (이메일 인증 완료 상태, 비밀번호: Baggullae1!)
do $$
declare
  v_pw text := extensions.crypt('Baggullae1!', extensions.gen_salt('bf'));
  v_rec record;
begin
  for v_rec in
    select * from (values
      ('a1000000-0000-4000-8000-000000000001'::uuid, 'demo1@baggullae.kr'),
      ('a1000000-0000-4000-8000-000000000002'::uuid, 'demo2@baggullae.kr'),
      ('a1000000-0000-4000-8000-000000000003'::uuid, 'demo3@baggullae.kr')
    ) as t(uid, email)
  loop
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_rec.uid,
      'authenticated',
      'authenticated',
      v_rec.email,
      v_pw,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now(),
      '', '', '', ''
    );

    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(),
      v_rec.uid,
      v_rec.uid::text,
      jsonb_build_object('sub', v_rec.uid::text, 'email', v_rec.email, 'email_verified', true, 'phone_verified', false),
      'email',
      now(),
      now(),
      now()
    );
  end loop;
end $$;

-- 3. 사용자 프로필 10명 (데모 계정 3 + 이웃 7)
-- 닉네임 규칙: 한글/영문/숫자 2~10자, 공백 없음
insert into profiles (id, data) values
  (
    'a1000000-0000-4000-8000-000000000001',
    '{"nickname":"민트귤","region":"마포구","dong":"서교동","loc":{"lat":37.5562,"lng":126.9238},"locVerified":true,"wants":[{"t":"cat","c":11},{"t":"kw","k":"무드등"},{"t":"cat","c":31}],"tradeCount":1,"example":false}'::jsonb
      || jsonb_build_object('createdAt', now_ms() - 1296000000, 'agreedAt', now_ms() - 1296000000)
  ),
  (
    'a1000000-0000-4000-8000-000000000002',
    '{"nickname":"포카모아","region":"마포구","dong":"합정동","loc":{"lat":37.5495,"lng":126.9139},"locVerified":true,"wants":[{"t":"cat","c":22},{"t":"cat","c":23},{"t":"kw","k":"핸드크림"}],"tradeCount":2,"example":false}'::jsonb
      || jsonb_build_object('createdAt', now_ms() - 2592000000, 'agreedAt', now_ms() - 2592000000)
  ),
  (
    'a1000000-0000-4000-8000-000000000003',
    '{"nickname":"새싹클립","region":"강남구","dong":"역삼동","loc":{"lat":37.5006,"lng":127.0364},"locVerified":true,"wants":[{"t":"cat","c":34},{"t":"kw","k":"텀블러"},{"t":"cat","c":14}],"tradeCount":3,"example":false}'::jsonb
      || jsonb_build_object('createdAt', now_ms() - 3024000000, 'agreedAt', now_ms() - 3024000000)
  ),
  (
    'mock-u04',
    '{"nickname":"소라향기","region":"마포구","dong":"망원동","loc":{"lat":37.5560,"lng":126.9101},"locVerified":true,"wants":[{"t":"cat","c":22},{"t":"kw","k":"포카"},{"t":"cat","c":11}],"tradeCount":2,"example":false}'::jsonb
      || jsonb_build_object('createdAt', now_ms() - 2160000000)
  ),
  (
    'mock-u05',
    '{"nickname":"준이네살림","region":"성동구","dong":"성수동1가","loc":{"lat":37.5450,"lng":127.0550},"locVerified":true,"wants":[{"t":"cat","c":31},{"t":"cat","c":33},{"t":"kw","k":"향수"}],"tradeCount":3,"example":false}'::jsonb
      || jsonb_build_object('createdAt', now_ms() - 5184000000)
  ),
  (
    'mock-u06',
    '{"nickname":"하나둘클립","region":"성동구","dong":"성수동2가","loc":{"lat":37.5446,"lng":127.0579},"locVerified":true,"wants":[{"t":"cat","c":3},{"t":"cat","c":34}],"tradeCount":4,"example":false}'::jsonb
      || jsonb_build_object('createdAt', now_ms() - 1814400000)
  ),
  (
    'mock-u07',
    '{"nickname":"달빛라떼","region":"용산구","dong":"한강로동","loc":{"lat":37.5298,"lng":126.9648},"locVerified":false,"wants":[{"t":"cat","c":13},{"t":"cat","c":21},{"t":"kw","k":"머그컵"}],"tradeCount":1,"example":false}'::jsonb
      || jsonb_build_object('createdAt', now_ms() - 1555200000)
  ),
  (
    'mock-u08',
    '{"nickname":"연남다람쥐","region":"서대문구","dong":"연희동","loc":{"lat":37.5680,"lng":126.9310},"locVerified":true,"wants":[{"t":"cat","c":32},{"t":"cat","c":14}],"tradeCount":2,"example":false}'::jsonb
      || jsonb_build_object('createdAt', now_ms() - 950400000)
  ),
  (
    'mock-u09',
    '{"nickname":"판교고양이","region":"경기도","dong":"정자동","loc":{"lat":37.3670,"lng":127.1080},"locVerified":false,"wants":[{"t":"cat","c":34},{"t":"cat","c":24}],"tradeCount":1,"example":false}'::jsonb
      || jsonb_build_object('createdAt', now_ms() - 1728000000)
  ),
  (
    'mock-u10',
    '{"nickname":"송도바다","region":"인천","dong":"송도동","loc":{"lat":37.3860,"lng":126.6430},"locVerified":false,"wants":[{"t":"cat","c":12},{"t":"cat","c":25}],"tradeCount":0,"example":false}'::jsonb
      || jsonb_build_object('createdAt', now_ms() - 604800000)
  );

-- 4. 물건 36개 (AI 이미지 연결 · 모든 카테고리 11~35 포함 · status: available 28 / reserved 4 / traded 4)
insert into items (id, data) values
  -- [demo1 민트귤 물건 4개]
  ('mock-i01', '{"owner":"a1000000-0000-4000-8000-000000000001","title":"미개봉 벨벳 립 틴트 & 글로시 쿠션","cat":22,"cond":"sealed","value":26000,"pref":"any","methods":["meet","door"],"meet":{"lat":37.5572,"lng":126.9245,"name":"홍대입구역 근처"},"photos":["./assets/images/beauty_cushion_tint_1795281152556.jpg"],"desc":"선물 받았는데 호수가 달라 미개봉 그대로 보관했어요. 포토카드나 주방 소품과 바꾸고 싶어요.","region":"마포구","status":"available","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 1800000)),
  ('mock-i02', '{"owner":"a1000000-0000-4000-8000-000000000001","title":"오 드 퍼퓸 우디 플로럴 향수 50ml","cat":23,"cond":"new","value":38000,"pref":"equal","methods":["meet","parcel"],"meet":{"lat":37.5562,"lng":126.9238,"name":"홍대입구역 근처"},"photos":["./assets/images/perfume_glass_bottle_1795281152229.jpg"],"desc":"시향만 해본 새상품이에요! 민트귤 빨간 클립 챌린지 2단계 물건입니다.","region":"마포구","status":"available","challengeId":"mock-c2"}'::jsonb || jsonb_build_object('createdAt', now_ms() - 7200000)),
  ('mock-i03', '{"owner":"a1000000-0000-4000-8000-000000000001","title":"세라믹 핸드메이드 머그컵 2종","cat":31,"cond":"new","value":22000,"pref":"any","methods":["meet"],"meet":{"lat":37.5495,"lng":126.9139,"name":"합정역 근처"},"photos":["./assets/images/ceramic_mug_tumbler_1795281152307.jpg"],"desc":"집들이 선물로 받아 상자째 있어요. 포근한 무드등이나 굿즈와 교환해요.","region":"마포구","status":"available","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 14400000)),
  ('mock-i04', '{"owner":"a1000000-0000-4000-8000-000000000001","title":"보타닉 핸드크림 & 진정 세럼 듀오","cat":21,"cond":"sealed","value":24000,"pref":"equal","methods":["meet","door"],"meet":{"lat":37.5560,"lng":126.9101,"name":"망원역 근처"},"photos":["./assets/images/skincare_handcream_set_1795281152407.jpg"],"desc":"유통기한 넉넉한 미개봉 세트예요.","region":"마포구","status":"available","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 25200000)),

  -- [demo2 포카모아 물건 3개]
  ('mock-i05', '{"owner":"a1000000-0000-4000-8000-000000000002","title":"걸그룹 미공포 슬리브 포토카드 3장 세트","cat":11,"cond":"used","value":19000,"pref":"any","methods":["meet","parcel"],"meet":{"lat":37.5495,"lng":126.9139,"name":"합정역 근처"},"photos":["./assets/images/kpop_photocard_sleeve_1795281152320.jpg"],"desc":"하드탑로더 + 슬리브 이중 보관해 하자 전혀 없어요! 립 틴트나 쿠션과 교환 원해요.","region":"마포구","status":"available","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 3600000)),
  ('mock-i06', '{"owner":"a1000000-0000-4000-8000-000000000002","title":"아이돌 정규앨범 초판 풀구성 + 포카","cat":12,"cond":"new","value":24000,"pref":"equal","methods":["meet","door"],"meet":{"lat":37.5572,"lng":126.9245,"name":"홍대입구역 근처"},"photos":["./assets/images/kpop_lightstick_album_1795281152786.jpg","./assets/images/kpop_photocard_sleeve_1795281152320.jpg"],"desc":"CD 미재생, 포스터랑 포토카드 모두 들어있어요.","region":"마포구","status":"available","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 10800000)),
  ('mock-i07', '{"owner":"a1000000-0000-4000-8000-000000000002","title":"미니 응원봉 & 아크릴 포카 홀더","cat":15,"cond":"new","value":16000,"pref":"any","methods":["parcel","door"],"meet":null,"photos":["./assets/images/kpop_lightstick_album_1795281152786.jpg"],"desc":"콘서트 굿즈 정리하면서 올려요.","region":"마포구","status":"available","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 43200000)),

  -- [mock-u04 소라향기 물건 3개]
  ('mock-i08', '{"owner":"mock-u04","title":"산들바람 투명 포카 탑로더 꾸미기 팩","cat":11,"cond":"sealed","value":12000,"pref":"any","methods":["meet","door"],"meet":{"lat":37.5560,"lng":126.9101,"name":"망원역 근처"},"photos":["./assets/images/kpop_photocard_sleeve_1795281152320.jpg"],"desc":"홀로그램 슬리브 50매와 데코 스티커 포함이에요.","region":"마포구","status":"available","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 5400000)),
  ('mock-i09', '{"owner":"mock-u04","title":"니치 향수 디스커버리 미니어처 5종","cat":25,"cond":"new","value":0,"pref":"give","methods":["door","parcel"],"meet":null,"photos":["./assets/images/perfume_glass_bottle_1795281152229.jpg"],"desc":"시향해 보고 싶은 분께 가볍게 나눔해요. 편하게 제안 주세요.","region":"마포구","status":"available","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 28800000)),
  ('mock-i10', '{"owner":"mock-u04","title":"마카롱 파스텔 복슬 곰돌이 키링","cat":14,"cond":"new","value":15000,"pref":"any","methods":["meet","parcel"],"meet":{"lat":37.5635,"lng":126.9035,"name":"마포구청역 근처"},"photos":["./assets/images/plush_keyring_charm_1795281152608.jpg"],"desc":"택 안 뗀 새상품이고 가방에 달면 귀여워요.","region":"마포구","status":"available","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 50400000)),

  -- [demo3 새싹클립 물건 3개]
  ('mock-i11', '{"owner":"a1000000-0000-4000-8000-000000000003","title":"원목 터치 스탠드 무드등 (밝기 3단)","cat":33,"cond":"new","value":29000,"pref":"equal","methods":["meet","parcel"],"meet":{"lat":37.5006,"lng":127.0364,"name":"역삼역 근처"},"photos":["./assets/images/wood_mood_lamp_1795281152852.jpg"],"desc":"책상 인테리어로 뒀다가 한 번도 안 켜본 새제품이에요. 챌린지 완주 기념 정리 중입니다!","region":"강남구","status":"available","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 9000000)),
  ('mock-i12', '{"owner":"a1000000-0000-4000-8000-000000000003","title":"시어버터 바디로션 & 헤어 에센스 세트","cat":24,"cond":"sealed","value":21000,"pref":"any","methods":["door","parcel"],"meet":null,"photos":["./assets/images/skincare_handcream_set_1795281152407.jpg"],"desc":"새상품 미개봉 박스 있어요.","region":"강남구","status":"available","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 39600000)),
  ('mock-i13', '{"owner":"a1000000-0000-4000-8000-000000000003","title":"메탈 만년필 + 데스크 스티키 메모 세트","cat":32,"cond":"new","value":0,"pref":"give","methods":["meet","door"],"meet":{"lat":37.4979,"lng":127.0276,"name":"강남역 근처"},"photos":["./assets/images/wireless_earbuds_stationery_1795281152251.jpg"],"desc":"문구류 필요하신 이웃분께 무료 나눔합니다.","region":"강남구","status":"available","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 64800000)),

  -- [mock-u05 준이네살림 물건 3개]
  ('mock-i14', '{"owner":"mock-u05","title":"화이트 스텐 보온 텀블러 & 드립 머그","cat":31,"cond":"sealed","value":28000,"pref":"any","methods":["meet","parcel"],"meet":{"lat":37.5446,"lng":127.0559,"name":"성수역 근처"},"photos":["./assets/images/ceramic_mug_tumbler_1795281152307.jpg"],"desc":"보온·보냉 잘 되는 473ml 텀블러예요.","region":"성동구","status":"available","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 6000000)),
  ('mock-i15', '{"owner":"mock-u05","title":"우드 스틱 리드 디퓨저 200ml (히노끼향)","cat":33,"cond":"sealed","value":23000,"pref":"equal","methods":["meet","door"],"meet":{"lat":37.5612,"lng":127.0371,"name":"왕십리역 근처"},"photos":["./assets/images/reed_diffuser_interior_1795281152902.jpg"],"desc":"은은한 편백나무 향이에요. 주방용품이랑 교환 좋아요.","region":"성동구","status":"available","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 21600000)),
  ('mock-i16', '{"owner":"mock-u05","title":"공식 응원봉 Ver.4 (건전지 미포함)","cat":13,"cond":"used","value":36000,"pref":"equal","methods":["meet"],"meet":{"lat":37.5404,"lng":127.0692,"name":"건대입구역 근처"},"photos":["./assets/images/kpop_lightstick_album_1795281152786.jpg"],"desc":"공연 1회 사용 후 박스 보관했어요. 발광 이상 전혀 없습니다.","region":"성동구","status":"available","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 86400000)),

  -- [mock-u06 하나둘클립 물건 3개]
  ('mock-i17', '{"owner":"mock-u06","title":"노이즈캔슬링 블루투스 이어폰 케이스+키트","cat":34,"cond":"new","value":34000,"pref":"any","methods":["meet","parcel"],"meet":{"lat":37.5446,"lng":127.0559,"name":"성수역 근처"},"photos":["./assets/images/wireless_earbuds_stationery_1795281152251.jpg"],"desc":"예비용으로 샀다가 개봉만 했어요.","region":"성동구","status":"available","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 12600000)),
  ('mock-i18', '{"owner":"mock-u06","title":"무선 데스크 린넨 무드등 (따뜻한 전구색)","cat":33,"cond":"used","value":19000,"pref":"any","methods":["meet"],"meet":{"lat":37.5446,"lng":127.0559,"name":"성수역 근처"},"photos":["./assets/images/wood_mood_lamp_1795281152852.jpg","./assets/images/reed_diffuser_interior_1795281152902.jpg"],"desc":"하나둘클립의 빨간 클립 챌린지 3단계 물건이에요! 전자기기 소품으로 이어가고 싶어요.","region":"성동구","status":"available","challengeId":"mock-c1"}'::jsonb || jsonb_build_object('createdAt', now_ms() - 72000000)),
  ('mock-i19', '{"owner":"mock-u06","title":"에코 패브릭 테이블 매트 & 코스터 4p","cat":35,"cond":"new","value":14000,"pref":"any","methods":[],"meet":null,"photos":["./assets/images/reed_diffuser_interior_1795281152902.jpg"],"desc":"거래 방식은 채팅으로 편하게 맞춰요.","region":"성동구","status":"available","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 97200000)),

  -- [mock-u07 달빛라떼 물건 3개]
  ('mock-i20', '{"owner":"mock-u07","title":"새틴 글로우 쿠션 팩트 21호 + 리필","cat":22,"cond":"sealed","value":32000,"pref":"equal","methods":["meet","door"],"meet":{"lat":37.5298,"lng":126.9648,"name":"용산역 근처"},"photos":["./assets/images/beauty_cushion_tint_1795281152556.jpg"],"desc":"면세점에서 샀는데 다른 제품을 쓰게 돼서 올려요.","region":"용산구","status":"available","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 4800000)),
  ('mock-i21', '{"owner":"mock-u07","title":"시트러스 베르가못 오 드 뚜왈렛 30ml","cat":23,"cond":"used","value":27000,"pref":"any","methods":["meet","parcel"],"meet":{"lat":37.5345,"lng":126.9946,"name":"이태원역 근처"},"photos":["./assets/images/perfume_glass_bottle_1795281152229.jpg"],"desc":"잔량 90% 이상이에요. 겨울에도 상큼하게 쓰기 좋아요.","region":"용산구","status":"available","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 32400000)),
  ('mock-i22', '{"owner":"mock-u07","title":"리유저블 콜드컵 + 스텐 빨대 브러쉬","cat":31,"cond":"new","value":12000,"pref":"any","methods":["parcel"],"meet":null,"photos":["./assets/images/ceramic_mug_tumbler_1795281152307.jpg"],"desc":"한 번 세척만 하고 보관했어요.","region":"용산구","status":"available","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 108000000)),

  -- [mock-u08 연남다람쥐 물건 3개]
  ('mock-i23', '{"owner":"mock-u08","title":"포근한 니트 가디건 인형 키링","cat":14,"cond":"new","value":16000,"pref":"any","methods":["meet","door"],"meet":{"lat":37.5552,"lng":126.9369,"name":"신촌역 근처"},"photos":["./assets/images/plush_keyring_charm_1795281152608.jpg"],"desc":"연남동 편집샵에서 구매했어요. 문구류나 굿즈와 교환 환영해요!","region":"서대문구","status":"available","challengeId":"mock-c5"}'::jsonb || jsonb_build_object('createdAt', now_ms() - 16200000)),
  ('mock-i24', '{"owner":"mock-u08","title":"다꾸 모눈 다이어리 & 젤펜 6색 세트","cat":32,"cond":"sealed","value":15000,"pref":"any","methods":["meet","parcel"],"meet":{"lat":37.5572,"lng":126.9245,"name":"홍대입구역 근처"},"photos":["./assets/images/wireless_earbuds_stationery_1795281152251.jpg"],"desc":"내년도 다이어리로 선물 받았는데 이미 쓰는 게 있어서 올려요.","region":"서대문구","status":"available","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 57600000)),
  ('mock-i25', '{"owner":"mock-u08","title":"시카 장벽 크림 & 핸드밤 미개봉 2종","cat":21,"cond":"sealed","value":25000,"pref":"equal","methods":["door","parcel"],"meet":null,"photos":["./assets/images/skincare_handcream_set_1795281152407.jpg"],"desc":"피부 순한 제품이라 아무나 쓰기 좋아요.","region":"서대문구","status":"available","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 115200000)),

  -- [mock-u09 판교고양이 & mock-u10 송도바다 물건 3개]
  ('mock-i26', '{"owner":"mock-u09","title":"마그네틱 무선 충전 보조배터리 파우치팩","cat":34,"cond":"new","value":39000,"pref":"equal","methods":["parcel"],"meet":null,"photos":["./assets/images/wireless_earbuds_stationery_1795281152251.jpg"],"desc":"테스트만 1회 해본 새상품이에요. 우체국 택배로 빠르게 보내드려요.","region":"경기도","status":"available","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 36000000)),
  ('mock-i27', '{"owner":"mock-u09","title":"라벤더 수면 필로우 미스트 & 바디오일","cat":24,"cond":"sealed","value":22000,"pref":"any","methods":["parcel"],"meet":null,"photos":["./assets/images/skincare_handcream_set_1795281152407.jpg"],"desc":"선물 세트로 받았습니다.","region":"경기도","status":"available","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 129600000)),
  ('mock-i28', '{"owner":"mock-u10","title":"한정판 미니앨범 포토북 + 스티커팩","cat":12,"cond":"new","value":18000,"pref":"any","methods":["parcel"],"meet":null,"photos":["./assets/images/kpop_lightstick_album_1795281152786.jpg"],"desc":"인천 송도 직거래 또는 반값택배 가능해요.","region":"인천","status":"available","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 144000000)),

  -- [예약 중 / 교환 진행 중(reserved) 물건 4개 - offers mock-o05, mock-o06 연결]
  ('mock-i29', '{"owner":"a1000000-0000-4000-8000-000000000002","title":"특전 미공개 포토카드 2매 (단품)","cat":11,"cond":"used","value":14000,"pref":"any","methods":["meet"],"meet":{"lat":37.5495,"lng":126.9139,"name":"합정역 근처"},"photos":["./assets/images/kpop_photocard_sleeve_1795281152320.jpg"],"desc":"민트귤님과 교환 진행 중인 포토카드입니다.","region":"마포구","status":"reserved","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 172800000)),
  ('mock-i30', '{"owner":"a1000000-0000-4000-8000-000000000001","title":"매트 벨벳 립밤 & 블러셔 듀오","cat":22,"cond":"sealed","value":16000,"pref":"any","methods":["meet"],"meet":{"lat":37.5572,"lng":126.9245,"name":"홍대입구역 근처"},"photos":["./assets/images/beauty_cushion_tint_1795281152556.jpg"],"desc":"포카모아님과 교환 진행 중이에요.","region":"마포구","status":"reserved","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 180000000)),
  ('mock-i31', '{"owner":"mock-u07","title":"라탄 우드 무드등 스몰 사이즈","cat":33,"cond":"new","value":20000,"pref":"any","methods":["meet"],"meet":{"lat":37.5298,"lng":126.9648,"name":"용산역 근처"},"photos":["./assets/images/wood_mood_lamp_1795281152852.jpg"],"desc":"진행 중인 교환 물건이에요.","region":"용산구","status":"reserved","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 216000000)),
  ('mock-i32', '{"owner":"a1000000-0000-4000-8000-000000000001","title":"모카 스톤웨어 머그 350ml","cat":31,"cond":"new","value":18000,"pref":"any","methods":["meet"],"meet":{"lat":37.5547,"lng":126.9707,"name":"서울역 근처"},"photos":["./assets/images/ceramic_mug_tumbler_1795281152307.jpg"],"desc":"달빛라떼님과 완료 확인만 남았어요.","region":"마포구","status":"reserved","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 220000000)),

  -- [교환 완료(traded) 물건 4개 - completed offers 연결]
  ('mock-i33', '{"owner":"a1000000-0000-4000-8000-000000000001","title":"코튼 린넨 룸스프레이 100ml","cat":35,"cond":"new","value":17000,"pref":"any","methods":["door"],"meet":null,"photos":["./assets/images/reed_diffuser_interior_1795281152902.jpg"],"desc":"준이네살림님과 교환을 마친 물건이에요.","region":"마포구","status":"traded","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 432000000)),
  ('mock-i34', '{"owner":"mock-u05","title":"도자기 티팟 & 거름망 세트","cat":31,"cond":"new","value":19000,"pref":"any","methods":["door"],"meet":null,"photos":["./assets/images/ceramic_mug_tumbler_1795281152307.jpg"],"desc":"교환 완료된 물건입니다.","region":"성동구","status":"traded","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 440000000)),
  ('mock-i35', '{"owner":"a1000000-0000-4000-8000-000000000002","title":"프리지아 화이트 머스크 핸드크림","cat":24,"cond":"sealed","value":15000,"pref":"any","methods":["parcel"],"meet":null,"photos":["./assets/images/skincare_handcream_set_1795281152407.jpg"],"desc":"챌린지 2단계 교환으로 전달했어요.","region":"마포구","status":"traded","challengeId":"mock-c4"}'::jsonb || jsonb_build_object('createdAt', now_ms() - 518400000)),
  ('mock-i36', '{"owner":"a1000000-0000-4000-8000-000000000003","title":"소프트 패브릭 곰돌이 키링","cat":14,"cond":"new","value":16000,"pref":"any","methods":["parcel"],"meet":null,"photos":["./assets/images/plush_keyring_charm_1795281152608.jpg"],"desc":"포카모아님과 교환 완료했어요.","region":"강남구","status":"traded","challengeId":null}'::jsonb || jsonb_build_object('createdAt', now_ms() - 525000000));

-- 5. 빨간 클립 챌린지 5개 (진행 중 4 · 완주 1)
insert into challenges (id, data) values
  (
    'mock-c1',
    '{"owner":"mock-u06","title":"볼펜 한 자루로 에어팟까지","goal":"블루투스 이어폰","status":"active","cheers":["a1000000-0000-4000-8000-000000000001","a1000000-0000-4000-8000-000000000002","mock-u04","mock-u05","mock-u07","mock-u08"],"currentItemId":"mock-i18","awaitingNext":false}'::jsonb
      || jsonb_build_object(
        'createdAt', now_ms() - 864000000,
        'steps', jsonb_build_array(
          '{"title":"모나미 만년필 & 모눈노트","cat":32,"img":"./assets/images/wireless_earbuds_stationery_1795281152251.jpg","full":"./assets/images/wireless_earbuds_stationery_1795281152251.jpg","from":"mock-u06"}'::jsonb || jsonb_build_object('at', now_ms() - 864000000),
          '{"title":"보타닉 핸드크림 미니 3종","cat":24,"img":"./assets/images/skincare_handcream_set_1795281152407.jpg","full":"./assets/images/skincare_handcream_set_1795281152407.jpg","from":"mock-u04","note":"문구가 핸드크림 세트로 커졌어요"}'::jsonb || jsonb_build_object('at', now_ms() - 604800000),
          '{"title":"무선 데스크 린넨 무드등","cat":33,"img":"./assets/images/wood_mood_lamp_1795281152852.jpg","full":"./assets/images/wood_mood_lamp_1795281152852.jpg","from":"mock-u05"}'::jsonb || jsonb_build_object('at', now_ms() - 259200000)
        )
      )
  ),
  (
    'mock-c2',
    '{"owner":"a1000000-0000-4000-8000-000000000001","title":"키링 하나로 커피머신 도전","goal":"캡슐 커피머신","status":"active","cheers":["a1000000-0000-4000-8000-000000000002","a1000000-0000-4000-8000-000000000003","mock-u04","mock-u06"],"currentItemId":"mock-i02","awaitingNext":false}'::jsonb
      || jsonb_build_object(
        'createdAt', now_ms() - 691200000,
        'steps', jsonb_build_array(
          '{"title":"복슬복슬 미니 곰돌이 키링","cat":14,"img":"./assets/images/plush_keyring_charm_1795281152608.jpg","full":"./assets/images/plush_keyring_charm_1795281152608.jpg","from":"a1000000-0000-4000-8000-000000000001"}'::jsonb || jsonb_build_object('at', now_ms() - 691200000),
          '{"title":"오 드 퍼퓸 우디 플로럴 향수 50ml","cat":23,"img":"./assets/images/perfume_glass_bottle_1795281152229.jpg","full":"./assets/images/perfume_glass_bottle_1795281152229.jpg","from":"mock-u07","note":"키링이 새 향수로 변신!"}'::jsonb || jsonb_build_object('at', now_ms() - 345600000)
        )
      )
  ),
  (
    'mock-c3',
    '{"owner":"a1000000-0000-4000-8000-000000000003","title":"머그컵에서 데스크 조명 완주","goal":"원목 스탠드 무드등","status":"finished","cheers":["a1000000-0000-4000-8000-000000000001","a1000000-0000-4000-8000-000000000002","mock-u04","mock-u05","mock-u06","mock-u07","mock-u08","mock-u09"],"currentItemId":null,"awaitingNext":false}'::jsonb
      || jsonb_build_object(
        'createdAt', now_ms() - 1814400000,
        'finishedAt', now_ms() - 172800000,
        'steps', jsonb_build_array(
          '{"title":"스톤웨어 에스프레소 잔","cat":31,"img":"./assets/images/ceramic_mug_tumbler_1795281152307.jpg","full":"./assets/images/ceramic_mug_tumbler_1795281152307.jpg","from":"a1000000-0000-4000-8000-000000000003"}'::jsonb || jsonb_build_object('at', now_ms() - 1814400000),
          '{"title":"히노끼 리드 디퓨저 200ml","cat":33,"img":"./assets/images/reed_diffuser_interior_1795281152902.jpg","full":"./assets/images/reed_diffuser_interior_1795281152902.jpg","from":"mock-u05"}'::jsonb || jsonb_build_object('at', now_ms() - 1296000000),
          '{"title":"미니 응원봉 & 아크릴 홀더","cat":13,"img":"./assets/images/kpop_lightstick_album_1795281152786.jpg","full":"./assets/images/kpop_lightstick_album_1795281152786.jpg","from":"mock-u07"}'::jsonb || jsonb_build_object('at', now_ms() - 691200000),
          '{"title":"원목 터치 스탠드 무드등","cat":33,"img":"./assets/images/wood_mood_lamp_1795281152852.jpg","full":"./assets/images/wood_mood_lamp_1795281152852.jpg","from":"mock-u09","note":"드디어 목표 무드등 완주!"}'::jsonb || jsonb_build_object('at', now_ms() - 172800000)
        )
      )
  ),
  (
    'mock-c4',
    '{"owner":"a1000000-0000-4000-8000-000000000002","title":"포카 슬리브로 콘서트 응원봉까지","goal":"공식 응원봉 풀박스","status":"active","cheers":["a1000000-0000-4000-8000-000000000001","mock-u04","mock-u08"],"currentItemId":null,"awaitingNext":true,"awaitingOffer":"mock-o08"}'::jsonb
      || jsonb_build_object(
        'createdAt', now_ms() - 604800000,
        'steps', jsonb_build_array(
          '{"title":"포토카드 홀로그램 슬리브","cat":11,"img":"./assets/images/kpop_photocard_sleeve_1795281152320.jpg","full":"./assets/images/kpop_photocard_sleeve_1795281152320.jpg","from":"a1000000-0000-4000-8000-000000000002"}'::jsonb || jsonb_build_object('at', now_ms() - 604800000),
          '{"title":"프리지아 화이트 머스크 핸드크림","cat":24,"img":"./assets/images/skincare_handcream_set_1795281152407.jpg","full":"./assets/images/skincare_handcream_set_1795281152407.jpg","from":"mock-u04"}'::jsonb || jsonb_build_object('at', now_ms() - 432000000),
          '{"title":"소프트 패브릭 곰돌이 키링","cat":14,"img":"./assets/images/plush_keyring_charm_1795281152608.jpg","full":"./assets/images/plush_keyring_charm_1795281152608.jpg","from":"a1000000-0000-4000-8000-000000000003","offerId":"mock-o08"}'::jsonb || jsonb_build_object('at', now_ms() - 172800000)
        )
      )
  ),
  (
    'mock-c5',
    '{"owner":"mock-u08","title":"다이어리 세트로 필름카메라 도전","goal":"토이 필름카메라","status":"active","cheers":["a1000000-0000-4000-8000-000000000001","mock-u06"],"currentItemId":"mock-i23","awaitingNext":false}'::jsonb
      || jsonb_build_object(
        'createdAt', now_ms() - 432000000,
        'steps', jsonb_build_array(
          '{"title":"모눈 노트 & 젤펜 세트","cat":32,"img":"./assets/images/wireless_earbuds_stationery_1795281152251.jpg","full":"./assets/images/wireless_earbuds_stationery_1795281152251.jpg","from":"mock-u08"}'::jsonb || jsonb_build_object('at', now_ms() - 432000000),
          '{"title":"포근한 니트 가디건 인형 키링","cat":14,"img":"./assets/images/plush_keyring_charm_1795281152608.jpg","full":"./assets/images/plush_keyring_charm_1795281152608.jpg","from":"mock-u04"}'::jsonb || jsonb_build_object('at', now_ms() - 259200000)
        )
      )
  );

-- 6. 교환 제안 11건 (pending, accepted, completed, rejected, cancelled 모두 포함)
insert into offers (id, data) values
  -- 받은 대기 제안 (demo1에게 온 제안 2건)
  ('mock-o01', '{"from":"mock-u04","to":"a1000000-0000-4000-8000-000000000001","target":"mock-i01","offered":"mock-i08","message":"망원역이나 홍대입구역에서 퇴근 후 교환 가능해요!","method":"meet","meet":{"lat":37.5572,"lng":126.9245,"name":"홍대입구역 근처"},"status":"pending","fromDone":false,"toDone":false}'::jsonb || jsonb_build_object('createdAt', now_ms() - 1200000, 'updatedAt', now_ms() - 1200000)),
  ('mock-o02', '{"from":"a1000000-0000-4000-8000-000000000003","to":"a1000000-0000-4000-8000-000000000001","target":"mock-i03","offered":"mock-i12","message":"세라믹 머그컵 너무 예뻐요. 편하신 날 반값택배 교환 어떠세요?","method":"parcel","meet":null,"status":"pending","fromDone":false,"toDone":false}'::jsonb || jsonb_build_object('createdAt', now_ms() - 3600000, 'updatedAt', now_ms() - 3600000)),

  -- 보낸 대기 제안 (demo1 -> demo2, demo1 -> mock-u07)
  ('mock-o03', '{"from":"a1000000-0000-4000-8000-000000000001","to":"a1000000-0000-4000-8000-000000000002","target":"mock-i06","offered":"mock-i04","message":"초판 앨범이랑 미개봉 스킨케어 세트 교환하고 싶어요!","method":"meet","meet":{"lat":37.5495,"lng":126.9139,"name":"합정역 근처"},"status":"pending","fromDone":false,"toDone":false}'::jsonb || jsonb_build_object('createdAt', now_ms() - 2400000, 'updatedAt', now_ms() - 2400000)),
  ('mock-o04', '{"from":"a1000000-0000-4000-8000-000000000001","to":"mock-u05","target":"mock-i15","offered":"mock-i03","message":"디퓨저랑 머그컵 교환 가능할까요?","method":"door","meet":null,"status":"pending","fromDone":false,"toDone":false}'::jsonb || jsonb_build_object('createdAt', now_ms() - 7200000, 'updatedAt', now_ms() - 7200000)),

  -- 진행 중인 교환 (demo2 <-> demo1 활발한 채팅, demo1은 안 읽은 메시지 확인 가능)
  ('mock-o05', '{"from":"a1000000-0000-4000-8000-000000000002","to":"a1000000-0000-4000-8000-000000000001","target":"mock-i30","offered":"mock-i29","message":"합정역 2번 출구 앞 직거래 원해요.","method":"meet","meet":{"lat":37.5495,"lng":126.9139,"name":"합정역 근처"},"status":"accepted","fromDone":false,"toDone":false}'::jsonb || jsonb_build_object('createdAt', now_ms() - 10800000, 'acceptedAt', now_ms() - 9600000, 'updatedAt', now_ms() - 9600000)),

  -- 진행 중인 교환 (mock-u07이 먼저 완료 눌러서 demo1이 교환 완료 버튼 누르면 바로 완료+후기 체험)
  ('mock-o06', '{"from":"mock-u07","to":"a1000000-0000-4000-8000-000000000001","target":"mock-i32","offered":"mock-i31","message":"용산역에서 뵙고 교환해요!","method":"meet","meet":{"lat":37.5298,"lng":126.9648,"name":"용산역 근처"},"status":"accepted","fromDone":true,"toDone":false}'::jsonb || jsonb_build_object('createdAt', now_ms() - 86400000, 'acceptedAt', now_ms() - 80000000, 'updatedAt', now_ms() - 1800000)),

  -- 완료된 교환 1 (demo1이 아직 후기 미작성 -> '후기 남기기' 테스트 가능)
  ('mock-o07', '{"from":"a1000000-0000-4000-8000-000000000001","to":"mock-u05","target":"mock-i34","offered":"mock-i33","message":"문고리 교환 가능해요!","method":"door","meet":null,"status":"completed","fromDone":true,"toDone":true}'::jsonb || jsonb_build_object('createdAt', now_ms() - 259200000, 'acceptedAt', now_ms() - 250000000, 'completedAt', now_ms() - 86400000, 'updatedAt', now_ms() - 86400000)),

  -- 완료된 교환 2 (demo2 <-> demo3, 양측 후기 완료 & demo2 챌린지 awaitingOffer 연결)
  ('mock-o08', '{"from":"a1000000-0000-4000-8000-000000000002","to":"a1000000-0000-4000-8000-000000000003","target":"mock-i36","offered":"mock-i35","message":"편의점 반값택배 교환 신청해요!","method":"parcel","meet":null,"status":"completed","fromDone":true,"toDone":true}'::jsonb || jsonb_build_object('createdAt', now_ms() - 345600000, 'acceptedAt', now_ms() - 330000000, 'completedAt', now_ms() - 172800000, 'updatedAt', now_ms() - 172800000)),

  -- 완료된 교환 3 (이웃 간 완료 이력)
  ('mock-o11', '{"from":"mock-u04","to":"mock-u06","target":"mock-i19","offered":"mock-i10","message":"성수역에서 뵐 수 있을까요?","method":"meet","meet":{"lat":37.5446,"lng":127.0559,"name":"성수역 근처"},"status":"completed","fromDone":true,"toDone":true}'::jsonb || jsonb_build_object('createdAt', now_ms() - 604800000, 'acceptedAt', now_ms() - 590000000, 'completedAt', now_ms() - 518400000, 'updatedAt', now_ms() - 518400000)),

  -- 거절됨 / 취소됨 상태 예시
  ('mock-o09', '{"from":"mock-u08","to":"a1000000-0000-4000-8000-000000000001","target":"mock-i02","offered":"mock-i24","message":"다이어리 세트와 향수 교환 가능할까요?","method":"meet","meet":{"lat":37.5572,"lng":126.9245,"name":"홍대입구역 근처"},"status":"rejected","fromDone":false,"toDone":false}'::jsonb || jsonb_build_object('createdAt', now_ms() - 259200000, 'updatedAt', now_ms() - 216000000)),
  ('mock-o10', '{"from":"a1000000-0000-4000-8000-000000000003","to":"mock-u06","target":"mock-i17","offered":"mock-i11","message":"무드등과 이어폰 교환 제안드려요.","method":"parcel","meet":null,"status":"cancelled","fromDone":false,"toDone":false}'::jsonb || jsonb_build_object('createdAt', now_ms() - 302400000, 'updatedAt', now_ms() - 280000000));

-- 7. 1:1 채팅 메시지 16건 (사진 메시지, 읽음/안읽음 포함)
insert into messages (id, data) values
  -- mock-o05 (demo2 포카모아 <-> demo1 민트귤 실시간 채팅 테스트용)
  ('mock-m01', '{"offer":"mock-o05","sender":"a1000000-0000-4000-8000-000000000002","receiver":"a1000000-0000-4000-8000-000000000001","text":"수락해 주셔서 감사해요! 합정역 2번 출구 앞 어떠신가요?"}'::jsonb || jsonb_build_object('at', now_ms() - 9000000, 'readAt', now_ms() - 8800000)),
  ('mock-m02', '{"offer":"mock-o05","sender":"a1000000-0000-4000-8000-000000000001","receiver":"a1000000-0000-4000-8000-000000000002","text":"좋아요! 내일 저녁 7시쯤 괜찮으세요? 포장 미리 해둘게요."}'::jsonb || jsonb_build_object('at', now_ms() - 8400000, 'readAt', now_ms() - 8200000)),
  ('mock-m03', '{"offer":"mock-o05","sender":"a1000000-0000-4000-8000-000000000002","receiver":"a1000000-0000-4000-8000-000000000001","text":"포토카드 탑로더에 넣어둔 사진 먼저 보내드려요!","photo":"./assets/images/kpop_photocard_sleeve_1795281152320.jpg"}'::jsonb || jsonb_build_object('at', now_ms() - 4200000, 'readAt', null)),
  ('mock-m04', '{"offer":"mock-o05","sender":"a1000000-0000-4000-8000-000000000002","receiver":"a1000000-0000-4000-8000-000000000001","text":"내일 7시 합정역 2번 출구 앞에서 봬요 :)"}'::jsonb || jsonb_build_object('at', now_ms() - 3900000, 'readAt', null)),

  -- mock-o06 (mock-u07 달빛라떼 <-> demo1 민트귤, 완료 확인 대기 채팅)
  ('mock-m05', '{"offer":"mock-o06","sender":"mock-u07","receiver":"a1000000-0000-4000-8000-000000000001","text":"안녕하세요! 용산역 1번 출구 쪽에 도착해 있어요."}'::jsonb || jsonb_build_object('at', now_ms() - 5400000, 'readAt', now_ms() - 5200000)),
  ('mock-m06', '{"offer":"mock-o06","sender":"a1000000-0000-4000-8000-000000000001","receiver":"mock-u07","text":"금방 나가요! 민트색 에코백 들고 있습니다."}'::jsonb || jsonb_build_object('at', now_ms() - 4800000, 'readAt', now_ms() - 4700000)),
  ('mock-m07', '{"offer":"mock-o06","sender":"mock-u07","receiver":"a1000000-0000-4000-8000-000000000001","text":"방금 잘 받았습니다! 무드등 너무 예쁘네요. 저 먼저 교환 완료 눌렀어요~"}'::jsonb || jsonb_build_object('at', now_ms() - 1800000, 'readAt', null)),

  -- mock-o07 (demo1 민트귤 <-> mock-u05 준이네살림, 완료된 채팅 유예기간 중)
  ('mock-m08', '{"offer":"mock-o07","sender":"mock-u05","receiver":"a1000000-0000-4000-8000-000000000001","text":"티팟 뽁뽁이로 꼼꼼하게 감싸서 문 앞에 두었어요!"}'::jsonb || jsonb_build_object('at', now_ms() - 96000000, 'readAt', now_ms() - 95000000)),
  ('mock-m09', '{"offer":"mock-o07","sender":"a1000000-0000-4000-8000-000000000001","receiver":"mock-u05","text":"확인했어요! 저도 룸스프레이 전달 완료했습니다.","photo":"./assets/images/reed_diffuser_interior_1795281152902.jpg"}'::jsonb || jsonb_build_object('at', now_ms() - 90000000, 'readAt', now_ms() - 89000000)),
  ('mock-m10', '{"offer":"mock-o07","sender":"mock-u05","receiver":"a1000000-0000-4000-8000-000000000001","text":"향 너무 좋아요! 좋은 교환 감사합니다 :)"}'::jsonb || jsonb_build_object('at', now_ms() - 86400000, 'readAt', now_ms() - 86000000)),

  -- mock-o08 (demo2 포카모아 <-> demo3 새싹클립, 완료된 택배 교환)
  ('mock-m11', '{"offer":"mock-o08","sender":"a1000000-0000-4000-8000-000000000003","receiver":"a1000000-0000-4000-8000-000000000002","text":"반값택배 방금 접수했어요! 키링 안전하게 포장했습니다."}'::jsonb || jsonb_build_object('at', now_ms() - 260000000, 'readAt', now_ms() - 259000000)),
  ('mock-m12', '{"offer":"mock-o08","sender":"a1000000-0000-4000-8000-000000000002","receiver":"a1000000-0000-4000-8000-000000000003","text":"저도 오늘 오후에 편의점 접수하고 송장 번호 공유드릴게요."}'::jsonb || jsonb_build_object('at', now_ms() - 255000000, 'readAt', now_ms() - 254000000)),
  ('mock-m13', '{"offer":"mock-o08","sender":"a1000000-0000-4000-8000-000000000002","receiver":"a1000000-0000-4000-8000-000000000003","text":"키링 무사히 도착했어요! 덕분에 챌린지 다음 단계로 갈 수 있겠어요."}'::jsonb || jsonb_build_object('at', now_ms() - 173000000, 'readAt', now_ms() - 172900000)),

  -- mock-o11 (mock-u04 소라향기 <-> mock-u06 하나둘클립)
  ('mock-m14', '{"offer":"mock-o11","sender":"mock-u04","receiver":"mock-u06","text":"성수역 3번 출구 카페 앞에서 뵈어요!"}'::jsonb || jsonb_build_object('at', now_ms() - 550000000, 'readAt', now_ms() - 549000000)),
  ('mock-m15', '{"offer":"mock-o11","sender":"mock-u06","receiver":"mock-u04","text":"네 지금 도착했습니다!"}'::jsonb || jsonb_build_object('at', now_ms() - 540000000, 'readAt', now_ms() - 539000000)),
  ('mock-m16', '{"offer":"mock-o11","sender":"mock-u04","receiver":"mock-u06","text":"깔끔한 거래 감사드려요 :)"}'::jsonb || jsonb_build_object('at', now_ms() - 518500000, 'readAt', now_ms() - 518400000));

-- 8. 교환 후기 5건 (id 형식: offerId || '_' || reviewerId)
insert into reviews (id, data) values
  ('mock-o07_mock-u05', '{"offer":"mock-o07","from":"mock-u05","to":"a1000000-0000-4000-8000-000000000001","score":"good","text":"포장도 깔끔하고 답장이 빨라서 편하게 교환했어요!"}'::jsonb || jsonb_build_object('at', now_ms() - 82800000)),
  ('mock-o08_a1000000-0000-4000-8000-000000000002', '{"offer":"mock-o08","from":"a1000000-0000-4000-8000-000000000002","to":"a1000000-0000-4000-8000-000000000003","score":"good","text":"택배 발송이 정말 빨랐고 물건 상태도 새것 같아요."}'::jsonb || jsonb_build_object('at', now_ms() - 170000000)),
  ('mock-o08_a1000000-0000-4000-8000-000000000003', '{"offer":"mock-o08","from":"a1000000-0000-4000-8000-000000000003","to":"a1000000-0000-4000-8000-000000000002","score":"good","text":"챌린지 응원합니다! 다음 교환도 기대돼요."}'::jsonb || jsonb_build_object('at', now_ms() - 168000000)),
  ('mock-o11_mock-u04', '{"offer":"mock-o11","from":"mock-u04","to":"mock-u06","score":"good","text":"시간 약속을 잘 지켜주시고 친절하셨어요."}'::jsonb || jsonb_build_object('at', now_ms() - 510000000)),
  ('mock-o11_mock-u06', '{"offer":"mock-o11","from":"mock-u06","to":"mock-u04","score":"good","text":"좋은 물건 교환 감사해요!"}'::jsonb || jsonb_build_object('at', now_ms() - 508000000));

-- 9. 찜 5건 (id 형식: ownerId || '_' || itemId)
insert into favorites (id, data) values
  ('a1000000-0000-4000-8000-000000000001_mock-i05', '{"owner":"a1000000-0000-4000-8000-000000000001","item":"mock-i05"}'::jsonb || jsonb_build_object('at', now_ms() - 5000000)),
  ('a1000000-0000-4000-8000-000000000001_mock-i11', '{"owner":"a1000000-0000-4000-8000-000000000001","item":"mock-i11"}'::jsonb || jsonb_build_object('at', now_ms() - 12000000)),
  ('a1000000-0000-4000-8000-000000000001_mock-i14', '{"owner":"a1000000-0000-4000-8000-000000000001","item":"mock-i14"}'::jsonb || jsonb_build_object('at', now_ms() - 18000000)),
  ('a1000000-0000-4000-8000-000000000002_mock-i01', '{"owner":"a1000000-0000-4000-8000-000000000002","item":"mock-i01"}'::jsonb || jsonb_build_object('at', now_ms() - 6000000)),
  ('a1000000-0000-4000-8000-000000000003_mock-i17', '{"owner":"a1000000-0000-4000-8000-000000000003","item":"mock-i17"}'::jsonb || jsonb_build_object('at', now_ms() - 9000000));

-- 10. 알림 정리 및 큐레이션 (offers/reviews insert 트리거로 생성된 시드용 알림을 깔끔한 9건으로 정리)
delete from notifications where recipient in (
  'a1000000-0000-4000-8000-000000000001',
  'a1000000-0000-4000-8000-000000000002',
  'a1000000-0000-4000-8000-000000000003',
  'mock-u04', 'mock-u05', 'mock-u06', 'mock-u07', 'mock-u08', 'mock-u09', 'mock-u10'
);

insert into notifications (id, data) values
  -- demo1 민트귤 알림 5건
  ('mock-n01', '{"to":"a1000000-0000-4000-8000-000000000001","type":"new_offer","offerId":"mock-o01","actor":"mock-u04","itemId":"mock-i01","read":false}'::jsonb || jsonb_build_object('at', now_ms() - 1200000)),
  ('mock-n02', '{"to":"a1000000-0000-4000-8000-000000000001","type":"complete_requested","offerId":"mock-o06","actor":"mock-u07","itemId":"mock-i32","read":false}'::jsonb || jsonb_build_object('at', now_ms() - 1800000)),
  ('mock-n03', '{"to":"a1000000-0000-4000-8000-000000000001","type":"new_offer","offerId":"mock-o02","actor":"a1000000-0000-4000-8000-000000000003","itemId":"mock-i03","read":false}'::jsonb || jsonb_build_object('at', now_ms() - 3600000)),
  ('mock-n04', '{"to":"a1000000-0000-4000-8000-000000000001","type":"challenge_cheer","actor":"a1000000-0000-4000-8000-000000000002","challengeId":"mock-c2","read":true}'::jsonb || jsonb_build_object('at', now_ms() - 21600000)),
  ('mock-n05', '{"to":"a1000000-0000-4000-8000-000000000001","type":"new_review","offerId":"mock-o07","actor":"mock-u05","read":true}'::jsonb || jsonb_build_object('at', now_ms() - 82800000)),

  -- demo2 포카모아 알림 2건
  ('mock-n06', '{"to":"a1000000-0000-4000-8000-000000000002","type":"new_offer","offerId":"mock-o03","actor":"a1000000-0000-4000-8000-000000000001","itemId":"mock-i06","read":false}'::jsonb || jsonb_build_object('at', now_ms() - 2400000)),
  ('mock-n07', '{"to":"a1000000-0000-4000-8000-000000000002","type":"offer_completed","offerId":"mock-o08","actor":"a1000000-0000-4000-8000-000000000003","itemId":"mock-i36","read":true}'::jsonb || jsonb_build_object('at', now_ms() - 172800000)),

  -- demo3 새싹클립 알림 2건
  ('mock-n08', '{"to":"a1000000-0000-4000-8000-000000000003","type":"challenge_cheer","actor":"a1000000-0000-4000-8000-000000000001","challengeId":"mock-c3","read":false}'::jsonb || jsonb_build_object('at', now_ms() - 7200000)),
  ('mock-n09', '{"to":"a1000000-0000-4000-8000-000000000003","type":"new_review","offerId":"mock-o08","actor":"a1000000-0000-4000-8000-000000000002","read":true}'::jsonb || jsonb_build_object('at', now_ms() - 170000000));

-- =====================================================================
-- 시드 데이터만 깨끗하게 지우고 싶을 때는 아래 블록을 별도로 실행하세요:
-- delete from notifications where id like 'mock-%';
-- delete from messages where id like 'mock-%';
-- delete from favorites where id like 'a1000000-0000-4000-8000-00000000000%';
-- delete from reviews where id like 'mock-%';
-- delete from offers where id like 'mock-%';
-- delete from challenges where id like 'mock-%';
-- delete from items where id like 'mock-%';
-- delete from profiles where id like 'mock-%' or id in (
--   'a1000000-0000-4000-8000-000000000001',
--   'a1000000-0000-4000-8000-000000000002',
--   'a1000000-0000-4000-8000-000000000003'
-- );
-- delete from auth.users where email in ('demo1@baggullae.kr', 'demo2@baggullae.kr', 'demo3@baggullae.kr');
-- =====================================================================
