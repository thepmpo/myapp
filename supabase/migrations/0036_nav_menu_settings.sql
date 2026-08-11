-- 좌측 내비게이션 메뉴(Circle/Product/Trends/AI)를 관리자가 "전체 공개"/"관리자만 공개"로
-- 토글할 수 있도록 하는 설정 테이블. 지금은 이 값을 실제로 읽어 페이지 접근을 막는 곳은
-- products 테이블(0037)뿐이고, posts/articles는 아직 이 설정을 반영하지 않음
-- (Circle/Trends/AI를 나중에 관리자 전용으로 바꾸려면 그때 해당 테이블에도 동일한 조건의
-- RLS 정책을 추가해야 함).

create table if not exists nav_menu_settings (
  key text primary key check (key in ('circle', 'product', 'trend', 'ai')),
  visibility text not null default 'public' check (visibility in ('public', 'admin_only')),
  updated_at timestamptz not null default now()
);

insert into nav_menu_settings (key, visibility) values
  ('circle', 'public'),
  ('product', 'admin_only'),
  ('trend', 'public'),
  ('ai', 'public')
on conflict (key) do nothing;

alter table nav_menu_settings enable row level security;

drop policy if exists "anyone can view nav menu settings" on nav_menu_settings;
create policy "anyone can view nav menu settings"
  on nav_menu_settings for select
  using (true);

drop policy if exists "admins can update nav menu settings" on nav_menu_settings;
create policy "admins can update nav menu settings"
  on nav_menu_settings for update
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
