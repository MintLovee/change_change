-- =====================================================================
-- 바꿀래 Supabase 스키마
-- Supabase 대시보드 > SQL Editor에 이 파일 전체를 붙여 넣고 Run 하세요.
-- 여러 번 실행해도 안전해요. 실행하면 기존 바꿀래 테이블은 지우고 다시 만들어요.
-- =====================================================================

drop table if exists reports, reviews, offers, challenges, items, profiles cascade;

-- 현재 시각(밀리초). 앱의 createdAt 값과 같은 단위예요.
create or replace function now_ms() returns bigint language sql stable as $$
  select (extract(epoch from now()) * 1000)::bigint
$$;

-- ---------- 테이블 ----------
-- 앱 데이터는 data(jsonb)에 그대로 저장하고, 권한 검사에 필요한 값만 컬럼으로 뽑아 둬요.
create table profiles (
  id text primary key,
  data jsonb not null,
  constraint nickname_format check ((data->>'nickname') ~ '^[가-힣a-zA-Z0-9]{2,10}$')
);
create unique index profiles_nickname_key on profiles ((data->>'nickname'));

create table items (
  id text primary key check (id ~ '^[A-Za-z0-9_-]{1,80}$'),
  data jsonb not null,
  owner text generated always as (data->>'owner') stored,
  status text generated always as (data->>'status') stored,
  constraint item_status check (data->>'status' in ('available', 'reserved', 'traded'))
);

create table offers (
  id text primary key check (id ~ '^[A-Za-z0-9_-]{1,80}$'),
  data jsonb not null,
  from_user text generated always as (data->>'from') stored,
  to_user text generated always as (data->>'to') stored,
  status text generated always as (data->>'status') stored
);

create table challenges (
  id text primary key check (id ~ '^[A-Za-z0-9_-]{1,80}$'),
  data jsonb not null,
  owner text generated always as (data->>'owner') stored
);

create table reviews (
  id text primary key,
  data jsonb not null,
  reviewer text generated always as (data->>'from') stored,
  reviewee text generated always as (data->>'to') stored,
  offer_id text generated always as (data->>'offer') stored,
  constraint review_score check (data->>'score' in ('good', 'soso', 'bad'))
);

create table reports (
  id text primary key,
  data jsonb not null,
  reporter text generated always as (data->>'from') stored
);

-- ---------- 보안 규칙 (Row Level Security) ----------
alter table profiles enable row level security;
alter table items enable row level security;
alter table offers enable row level security;
alter table challenges enable row level security;
alter table reviews enable row level security;
alter table reports enable row level security;

-- 프로필: 로그인한 사람은 모두 볼 수 있고, 내 것만 만들고 고칠 수 있어요.
create policy "profiles read" on profiles for select to authenticated using (true);
create policy "profiles insert own" on profiles for insert to authenticated with check (id = auth.uid()::text);
create policy "profiles update own" on profiles for update to authenticated using (id = auth.uid()::text) with check (id = auth.uid()::text);

-- 물건: 모두 볼 수 있고, 주인만 등록·수정·삭제해요. 새 물건은 '교환 가능' 상태로만 등록돼요.
-- 교환 진행에 따른 상태 변경(예약중·교환완료)은 아래 함수가 대신 처리해요.
create policy "items read" on items for select to authenticated using (true);
create policy "items insert own" on items for insert to authenticated with check (owner = auth.uid()::text and status = 'available');
create policy "items update own" on items for update to authenticated using (owner = auth.uid()::text) with check (owner = auth.uid()::text);
create policy "items delete own" on items for delete to authenticated using (owner = auth.uid()::text and status = 'available');

-- 교환 제안: 당사자만 볼 수 있어요. 오픈채팅 링크가 다른 사람에게 보이지 않아요.
create policy "offers read parties" on offers for select to authenticated using (auth.uid()::text in (from_user, to_user));
create policy "offers insert" on offers for insert to authenticated with check (
  from_user = auth.uid()::text
  and status = 'pending'
  and exists (select 1 from items i where i.id = offers.data->>'target' and i.owner = offers.to_user and i.owner <> auth.uid()::text and i.status = 'available')
  and exists (select 1 from items i where i.id = offers.data->>'offered' and i.owner = auth.uid()::text and i.status = 'available')
);
-- 당사자는 거절·취소만 직접 할 수 있고, 수락·완료는 함수로만 해요.
create policy "offers update parties" on offers for update to authenticated
  using (auth.uid()::text in (from_user, to_user) and status = 'pending')
  with check (
    (status = 'rejected' and to_user = auth.uid()::text) or
    (status = 'cancelled' and from_user = auth.uid()::text)
  );

-- 챌린지: 모두 볼 수 있고, 진행자만 만들고 고쳐요. 응원과 단계 추가는 함수로 해요.
create policy "challenges read" on challenges for select to authenticated using (true);
create policy "challenges insert own" on challenges for insert to authenticated with check (owner = auth.uid()::text);
create policy "challenges update own" on challenges for update to authenticated using (owner = auth.uid()::text) with check (owner = auth.uid()::text);

-- 후기: 모두 볼 수 있고, 완료된 교환의 당사자만 상대에게 한 번 남길 수 있어요.
create policy "reviews read" on reviews for select to authenticated using (true);
create policy "reviews insert" on reviews for insert to authenticated with check (
  reviewer = auth.uid()::text
  and id = offer_id || '_' || auth.uid()::text
  and exists (
    select 1 from offers o where o.id = reviews.offer_id and o.status = 'completed'
      and ((o.from_user = auth.uid()::text and o.to_user = reviews.reviewee) or (o.to_user = auth.uid()::text and o.from_user = reviews.reviewee))
  )
);

-- 신고: 접수만 할 수 있고, 아무도 앱에서 읽을 수 없어요. (대시보드에서 확인)
create policy "reports insert" on reports for insert to authenticated with check (reporter = auth.uid()::text);

-- ---------- 함수 (두 사람의 데이터를 함께 바꾸는 동작) ----------
-- 제안 수락: 두 물건을 '예약중'으로 바꾸고, 같은 물건에 걸린 다른 대기 제안을 자동 거절해요.
create or replace function accept_offer(p_offer text, p_openchat text) returns void
language plpgsql security definer set search_path = public as $$
declare
  o jsonb; uid text := auth.uid()::text; t text; f text;
begin
  select data into o from offers where id = p_offer for update;
  if o is null or o->>'to' is distinct from uid or o->>'status' <> 'pending' then
    raise exception '수락할 수 없는 제안이에요.';
  end if;
  if p_openchat is null or p_openchat !~ '^https://open\.kakao\.com/' then
    raise exception 'https://open.kakao.com/ 으로 시작하는 오픈채팅 링크를 넣어 주세요.';
  end if;
  t := o->>'target'; f := o->>'offered';
  perform 1 from items where id in (t, f) for update;
  if (select count(*) from items where id in (t, f) and status = 'available') < 2 then
    raise exception '이미 다른 교환이 진행 중인 물건이에요.';
  end if;
  update offers set data = data || jsonb_build_object('status', 'accepted', 'openchat', p_openchat, 'updatedAt', now_ms()) where id = p_offer;
  update items set data = data || '{"status":"reserved"}'::jsonb where id in (t, f);
  update offers set data = data || jsonb_build_object('status', 'rejected', 'autoRejected', true, 'updatedAt', now_ms())
    where id <> p_offer and status = 'pending' and (data->>'target' in (t, f) or data->>'offered' in (t, f));
end $$;

-- 교환 완료: 양쪽이 모두 누르면 확정돼요. 확정되면 물건은 '교환완료', 교환 횟수 +1,
-- 챌린지 물건이었다면 받은 물건이 타임라인에 다음 단계로 추가돼요.
create or replace function complete_offer(p_offer text) returns text
language plpgsql security definer set search_path = public as $$
declare
  o jsonb; uid text := auth.uid()::text; is_from boolean; other_done boolean;
  t text; f text; rec record; gi jsonb; ri jsonb; c jsonb;
begin
  select data into o from offers where id = p_offer for update;
  if o is null or o->>'status' <> 'accepted' or uid not in (o->>'from', o->>'to') then
    raise exception '완료할 수 없는 교환이에요.';
  end if;
  is_from := (o->>'from') = uid;
  other_done := coalesce((o->>(case when is_from then 'toDone' else 'fromDone' end))::boolean, false);
  if not other_done then
    update offers set data = data || jsonb_build_object(case when is_from then 'fromDone' else 'toDone' end, true, 'updatedAt', now_ms()) where id = p_offer;
    return 'waiting';
  end if;

  update offers set data = data || jsonb_build_object('fromDone', true, 'toDone', true, 'status', 'completed', 'completedAt', now_ms(), 'updatedAt', now_ms()) where id = p_offer;
  t := o->>'target'; f := o->>'offered';
  update items set data = data || '{"status":"traded"}'::jsonb where id in (t, f);
  update profiles set data = data || jsonb_build_object('tradeCount', coalesce((data->>'tradeCount')::int, 0) + 1) where id in (o->>'from', o->>'to');

  for rec in select * from (values (t, f), (f, t)) as v(give, received) loop
    select data into gi from items where id = rec.give;
    if gi is null or gi->>'challengeId' is null then continue; end if;
    select data into c from challenges where id = gi->>'challengeId' for update;
    if c is null or c->>'status' <> 'active' or c->>'currentItemId' is distinct from rec.give then continue; end if;
    select data into ri from items where id = rec.received;
    update challenges set data = data || jsonb_build_object(
      'steps', coalesce(data->'steps', '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
        'title', coalesce(ri->>'title', '받은 물건'), 'cat', coalesce((ri->>'cat')::int, 35),
        'img', ri->'photos'->0, 'full', ri->'photos'->0,
        'at', now_ms(), 'from', ri->>'owner', 'offerId', p_offer)),
      'currentItemId', null, 'awaitingNext', true, 'awaitingOffer', p_offer)
    where id = gi->>'challengeId';
  end loop;
  return 'completed';
end $$;

-- 챌린지 응원 켜기/끄기
create or replace function toggle_cheer(p_challenge text) returns void
language plpgsql security definer set search_path = public as $$
declare uid text := auth.uid()::text;
begin
  if uid is null then raise exception '로그인이 필요해요.'; end if;
  update challenges set data = jsonb_set(data, '{cheers}',
    case when coalesce(data->'cheers', '[]'::jsonb) ? uid
      then coalesce(data->'cheers', '[]'::jsonb) - uid
      else coalesce(data->'cheers', '[]'::jsonb) || to_jsonb(uid) end)
  where id = p_challenge;
end $$;

revoke all on function accept_offer(text, text), complete_offer(text), toggle_cheer(text) from public, anon;
grant execute on function accept_offer(text, text), complete_offer(text), toggle_cheer(text) to authenticated;

-- ---------- 실시간 반영 ----------
-- 다른 사람이 바꾼 내용이 새로고침 없이 화면에 들어와요. (보안 규칙이 그대로 적용돼요)
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table profiles, items, offers, challenges, reviews;
  end if;
end $$;
