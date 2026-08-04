-- 홈 화면 "지금 인기 있는 Circle 글"을 반응/댓글 자동 집계 대신
-- 관리자가 직접 고른 글만 노출하기 위한 컬럼.
-- 기본값 false라 기존 게시글에는 영향 없음.

alter table posts
  add column if not exists is_featured boolean not null default false;

-- posts의 update 정책은 기존에 "본인 글만"으로 되어 있어서, 관리자가 남의 글의
-- is_featured를 켜려고 하면 0건 수정으로 조용히 실패함(0017과 동일한 유형의 문제).
-- 관리자용 정책을 추가로 얹어줌(기존 정책과 OR로 합쳐지므로 본인 글 수정 권한은 그대로 유지됨).
drop policy if exists "admins can update any post" on posts;
create policy "admins can update any post"
  on posts for update
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
