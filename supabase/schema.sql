-- =====================================================================
-- 바꿀래 Supabase 스키마 (채팅 · Storage · 알림 · 회원탈퇴 포함)
-- Supabase 대시보드 > SQL Editor에 이 파일 전체를 붙여 넣고 Run 하세요.
-- 여러 번 실행해도 안전해요. 실행하면 기존 바꿀래 테이블은 지우고 다시 만들어요.
-- =====================================================================

drop table if exists notifications, messages, favorites, reports, reviews, offers, challenges, items, profiles cascade;

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

create table favorites (
  id text primary key check (id ~ '^[A-Za-z0-9_-]{1,120}$'),
  data jsonb not null,
  owner text generated always as (data->>'owner') stored,
  item_id text generated always as (data->>'item') stored
);

create table messages (
  id text primary key check (id ~ '^[A-Za-z0-9_-]{1,80}$'),
  data jsonb not null,
  offer_id text generated always as (data->>'offer') stored,
  sender text generated always as (data->>'sender') stored,
  receiver text generated always as (data->>'receiver') stored
);
create index messages_offer_idx on messages (offer_id);

create table notifications (
  id text primary key check (id ~ '^[A-Za-z0-9_-]{1,120}$'),
  data jsonb not null,
  recipient text generated always as (data->>'to') stored
);
create index notifications_recipient_idx on notifications (recipient);

-- ---------- 보안 규칙 (Row Level Security) ----------
alter table profiles enable row level security;
alter table items enable row level security;
alter table offers enable row level security;
alter table challenges enable row level security;
alter table reviews enable row level security;
alter table reports enable row level security;
alter table favorites enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;

-- 프로필: 로그인한 사람은 모두 볼 수 있고, 내 것만 만들고 고칠 수 있어요.
create policy "profiles read" on profiles for select to authenticated using (true);
create policy "profiles insert own" on profiles for insert to authenticated with check (id = auth.uid()::text);
create policy "profiles update own" on profiles for update to authenticated using (id = auth.uid()::text) with check (id = auth.uid()::text);

-- 물건: 모두 볼 수 있고, 주인만 등록·수정·삭제해요. 새 물건은 '교환 가능' 상태로만 등록돼요.
create policy "items read" on items for select to authenticated using (true);
create policy "items insert own" on items for insert to authenticated with check (owner = auth.uid()::text and status = 'available');
create policy "items update own" on items for update to authenticated using (owner = auth.uid()::text) with check (owner = auth.uid()::text);
create policy "items delete own" on items for delete to authenticated using (owner = auth.uid()::text and status = 'available');

-- 교환 제안: 당사자만 볼 수 있어요.
create policy "offers read parties" on offers for select to authenticated using (auth.uid()::text in (from_user, to_user));
create policy "offers insert" on offers for insert to authenticated with check (
  from_user = auth.uid()::text
  and status = 'pending'
  and exists (select 1 from items i where i.id = offers.data->>'target' and i.owner = offers.to_user and i.owner <> auth.uid()::text and i.status = 'available')
  and exists (select 1 from items i where i.id = offers.data->>'offered' and i.owner = auth.uid()::text and i.status = 'available')
);
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

-- 신고: 접수만 할 수 있고, 아무도 앱에서 읽을 수 없어요.
create policy "reports insert" on reports for insert to authenticated with check (reporter = auth.uid()::text);

-- 찜: 본인만 조회·추가·삭제해요.
create policy "favorites read own" on favorites for select to authenticated using (owner = auth.uid()::text);
create policy "favorites insert own" on favorites for insert to authenticated with check (owner = auth.uid()::text and id = auth.uid()::text || '_' || item_id);
create policy "favorites delete own" on favorites for delete to authenticated using (owner = auth.uid()::text);

-- 채팅 메시지: 당사자만 읽고 쓸 수 있고, 보낸 사람은 auth.uid()로 강제해요.
-- 교환 완료나 거절/취소 이후 7일(604,800,000ms)이 지나면 새 메시지를 쓸 수 없어요(읽기 전용).
create policy "messages read parties" on messages for select to authenticated
  using (
    auth.uid()::text in (sender, receiver)
    and exists (select 1 from offers o where o.id = messages.offer_id and auth.uid()::text in (o.from_user, o.to_user))
  );

create policy "messages insert parties" on messages for insert to authenticated
  with check (
    sender = auth.uid()::text
    and (coalesce(length(trim(data->>'text')), 0) > 0 or coalesce(data->>'photo', '') <> '')
    and exists (
      select 1 from offers o
      where o.id = messages.offer_id
        and (
          (o.from_user = auth.uid()::text and o.to_user = messages.receiver)
          or (o.to_user = auth.uid()::text and o.from_user = messages.receiver)
        )
        and (
          o.status = 'accepted'
          or (
            o.status in ('completed', 'rejected', 'cancelled')
            and (o.data ? 'acceptedAt' or exists (select 1 from messages m2 where m2.offer_id = o.id))
            and (now_ms() - coalesce((o.data->>'completedAt')::bigint, (o.data->>'updatedAt')::bigint, (o.data->>'createdAt')::bigint)) <= 604800000
          )
        )
    )
  );

-- 알림: 받는 사람만 읽고·읽음 처리·삭제할 수 있어요. 생성은 DB 트리거로만 해요.
create policy "notifications read own" on notifications for select to authenticated using (recipient = auth.uid()::text);
create policy "notifications update own" on notifications for update to authenticated using (recipient = auth.uid()::text) with check (recipient = auth.uid()::text);
create policy "notifications delete own" on notifications for delete to authenticated using (recipient = auth.uid()::text);

-- ---------- 함수 (두 사람의 데이터를 함께 바꾸는 동작) ----------
-- 제안 수락: 오픈채팅 링크는 선택 사항(비워 두면 앱 내 채팅을 기본으로 사용).
create or replace function accept_offer(p_offer text, p_openchat text default '') returns void
language plpgsql security definer set search_path = public as $$
declare
  o jsonb; uid text := auth.uid()::text; t text; f text; link text := coalesce(trim(p_openchat), '');
begin
  select data into o from offers where id = p_offer for update;
  if o is null or o->>'to' is distinct from uid or o->>'status' <> 'pending' then
    raise exception '수락할 수 없는 제안이에요.';
  end if;
  if link <> '' and link !~ '^https://open\.kakao\.com/' then
    raise exception '오픈채팅 링크 형식이 맞지 않아요. https://open.kakao.com/ 으로 시작하는 주소를 넣거나 비워 두세요.';
  end if;
  t := o->>'target'; f := o->>'offered';
  perform 1 from items where id in (t, f) for update;
  if (select count(*) from items where id in (t, f) and status = 'available') < 2 then
    raise exception '이미 다른 교환이 진행 중인 물건이에요.';
  end if;
  update offers set data = data || jsonb_build_object('status', 'accepted', 'openchat', nullif(link, ''), 'acceptedAt', now_ms(), 'updatedAt', now_ms()) where id = p_offer;
  update items set data = data || '{"status":"reserved"}'::jsonb where id in (t, f);
  update offers set data = data || jsonb_build_object('status', 'rejected', 'autoRejected', true, 'updatedAt', now_ms())
    where id <> p_offer and status = 'pending' and (data->>'target' in (t, f) or data->>'offered' in (t, f));
end $$;

-- 교환 완료
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

-- 채팅 읽음 처리: 내가 받은 안 읽은 메시지의 readAt을 기록해요.
create or replace function mark_chat_read(p_offer text) returns void
language plpgsql security definer set search_path = public as $$
declare uid text := auth.uid()::text; ts bigint := now_ms();
begin
  if uid is null then raise exception '로그인이 필요해요.'; end if;
  update messages
  set data = data || jsonb_build_object('readAt', ts)
  where offer_id = p_offer
    and receiver = uid
    and data->>'readAt' is null;
end $$;

-- 회원 탈퇴: 진행 중인 교환(accepted)이 있으면 막고, 없으면 프로필·물건·찜·알림·대기 제안을 정리한 뒤 계정을 삭제해요.
create or replace function delete_my_account() returns void
language plpgsql security definer set search_path = public, auth as $$
declare
  uid_uuid uuid := auth.uid();
  uid text := auth.uid()::text;
begin
  if uid_uuid is null then
    raise exception '로그인이 필요해요.';
  end if;
  if exists (select 1 from offers where status = 'accepted' and uid in (from_user, to_user)) then
    raise exception '진행 중인 교환이 있어 탈퇴할 수 없어요. 교환을 먼저 완료해 주세요.';
  end if;

  update offers
    set data = data || jsonb_build_object('status', case when from_user = uid then 'cancelled' else 'rejected' end, 'updatedAt', now_ms())
    where status = 'pending' and uid in (from_user, to_user);

  delete from favorites where owner = uid;
  delete from notifications where recipient = uid;
  delete from items where owner = uid;
  delete from challenges where owner = uid and status = 'active';
  delete from profiles where id = uid;
  delete from auth.users where id = uid_uuid;
end $$;

revoke all on function accept_offer(text, text), complete_offer(text), toggle_cheer(text), mark_chat_read(text), delete_my_account() from public, anon;
grant execute on function accept_offer(text, text), complete_offer(text), toggle_cheer(text), mark_chat_read(text), delete_my_account() to authenticated;

-- ---------- 알림 자동 생성 트리거 ----------
create or replace function push_notification(
  p_to text, p_type text, p_offer text default null, p_actor text default null,
  p_item text default null, p_challenge text default null
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_to is null or p_to = '' or p_to like 'ex-%' then return; end if;
  insert into notifications (id, data) values (
    'nt_' || replace(gen_random_uuid()::text, '-', ''),
    jsonb_strip_nulls(jsonb_build_object(
      'to', p_to,
      'type', p_type,
      'offerId', p_offer,
      'actor', p_actor,
      'itemId', p_item,
      'challengeId', p_challenge,
      'read', false,
      'at', now_ms()
    ))
  );
end $$;

create or replace function trg_offers_notify() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if new.status = 'pending' then
      perform push_notification(new.to_user, 'new_offer', new.id, new.from_user, new.data->>'target', null);
    end if;
    return new;
  end if;

  if old.status = 'pending' and new.status = 'accepted' then
    perform push_notification(new.from_user, 'offer_accepted', new.id, new.to_user, new.data->>'target', null);
  elsif old.status = 'pending' and new.status = 'rejected' then
    perform push_notification(new.from_user, 'offer_rejected', new.id, new.to_user, new.data->>'target', null);
  elsif new.status = 'accepted' then
    if not coalesce((old.data->>'fromDone')::boolean, false) and coalesce((new.data->>'fromDone')::boolean, false) then
      perform push_notification(new.to_user, 'complete_requested', new.id, new.from_user, new.data->>'target', null);
    elsif not coalesce((old.data->>'toDone')::boolean, false) and coalesce((new.data->>'toDone')::boolean, false) then
      perform push_notification(new.from_user, 'complete_requested', new.id, new.to_user, new.data->>'target', null);
    end if;
  elsif old.status = 'accepted' and new.status = 'completed' then
    perform push_notification(new.from_user, 'offer_completed', new.id, new.to_user, new.data->>'target', null);
    perform push_notification(new.to_user, 'offer_completed', new.id, new.from_user, new.data->>'offered', null);
  end if;
  return new;
end $$;

drop trigger if exists offers_notify_trg on offers;
create trigger offers_notify_trg after insert or update on offers
  for each row execute function trg_offers_notify();

create or replace function trg_reviews_notify() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform push_notification(new.reviewee, 'new_review', new.offer_id, new.reviewer, null, null);
  return new;
end $$;

drop trigger if exists reviews_notify_trg on reviews;
create trigger reviews_notify_trg after insert on reviews
  for each row execute function trg_reviews_notify();

create or replace function trg_challenges_notify() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  old_cheers jsonb := coalesce(old.data->'cheers', '[]'::jsonb);
  new_cheers jsonb := coalesce(new.data->'cheers', '[]'::jsonb);
  cheerer text;
begin
  if jsonb_array_length(new_cheers) > jsonb_array_length(old_cheers) then
    select val into cheerer
    from jsonb_array_elements_text(new_cheers) as val
    where not (old_cheers ? val)
    limit 1;
    if cheerer is not null and cheerer <> new.owner then
      perform push_notification(new.owner, 'challenge_cheer', null, cheerer, null, new.id);
    end if;
  end if;
  return new;
end $$;

drop trigger if exists challenges_notify_trg on challenges;
create trigger challenges_notify_trg after update on challenges
  for each row execute function trg_challenges_notify();

-- ---------- Storage (item-photos 버킷) ----------
-- 버킷 생성 (public 읽기) 및 본인 폴더({user_id}/...)에만 업로드·수정·삭제 허용
insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "item-photos public read" on storage.objects;
drop policy if exists "item-photos insert own folder" on storage.objects;
drop policy if exists "item-photos update own folder" on storage.objects;
drop policy if exists "item-photos delete own folder" on storage.objects;

create policy "item-photos public read" on storage.objects
  for select to public
  using (bucket_id = 'item-photos');

create policy "item-photos insert own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'item-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "item-photos update own folder" on storage.objects
  for update to authenticated
  using (bucket_id = 'item-photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'item-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "item-photos delete own folder" on storage.objects
  for delete to authenticated
  using (bucket_id = 'item-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------- 실시간 반영 ----------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table profiles, items, offers, challenges, reviews, favorites, messages, notifications;
  end if;
end $$;

