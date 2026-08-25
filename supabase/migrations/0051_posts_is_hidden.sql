-- Circle 게시글 "비공개 처리" 기능(관리자 전용). is_hidden=true인 글은 작성자 본인과
-- 관리자에게만 보이고, 그 외에는 목록/상세 전부에서 완전히 숨겨짐 — RLS 레벨에서
-- 강제해서 REST API를 직접 호출해도 우회할 수 없게 함(기존 모더레이션 정책과 동일한 원칙).

alter table posts
  add column if not exists is_hidden boolean not null default false;

drop policy if exists "posts are publicly readable" on posts;
create policy "posts are publicly readable"
  on posts for select
  using (
    is_hidden = false
    or (auth.uid())::text = user_id
    or exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

-- 관리자가 "정상처리"(비공개 해제)하려면 본인 글이 아니어도 UPDATE할 수 있어야 함
-- (기존엔 DELETE만 관리자 오버라이드가 있었고 UPDATE는 본인 글만 가능했음).
drop policy if exists "admins can update any post" on posts;
create policy "admins can update any post"
  on posts for update
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true));
