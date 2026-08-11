-- 홈 화면(EditorialHome, `/home`) 8개 콘텐츠 영역을 관리자가 직접 지정할 수 있게 하는 테이블.
-- 좌측1/좌측2/중앙은 Insights 아티클 전용, 우측1~5는 Circle 게시글 전용
-- (디자인이 이미 그렇게 굳어져 있어 타입을 고정 — 화면설계상의 제약).
-- 비어있는(content_id가 null인) 슬롯은 프론트에서 기존 fallback 더미 콘텐츠로 대체됨.

create table if not exists home_slots (
  slot_key text primary key check (
    slot_key in ('left_1', 'left_2', 'hero', 'circle_1', 'circle_2', 'circle_3', 'circle_4', 'circle_5')
  ),
  content_type text check (content_type in ('article', 'post')),
  content_id bigint,
  updated_at timestamptz not null default now()
);

alter table home_slots
  drop constraint if exists home_slots_content_check;
alter table home_slots
  add constraint home_slots_content_check check (
    (content_type is null and content_id is null) or (content_type is not null and content_id is not null)
  );

alter table home_slots
  drop constraint if exists home_slots_type_matches_slot;
alter table home_slots
  add constraint home_slots_type_matches_slot check (
    content_type is null
    or (slot_key in ('left_1', 'left_2', 'hero') and content_type = 'article')
    or (slot_key like 'circle_%' and content_type = 'post')
  );

insert into home_slots (slot_key, content_type, content_id) values
  ('left_1', null, null),
  ('left_2', null, null),
  ('hero', null, null),
  ('circle_1', null, null),
  ('circle_2', null, null),
  ('circle_3', null, null),
  ('circle_4', null, null),
  ('circle_5', null, null)
on conflict (slot_key) do nothing;

alter table home_slots enable row level security;

drop policy if exists "anyone can view home slots" on home_slots;
create policy "anyone can view home slots"
  on home_slots for select
  using (true);

drop policy if exists "admins can update home slots" on home_slots;
create policy "admins can update home slots"
  on home_slots for update
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
