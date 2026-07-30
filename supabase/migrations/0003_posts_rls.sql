-- posts 테이블 RLS 설정
-- 읽기는 비로그인 포함 누구나 가능, 쓰기/수정/삭제는 본인 글만 가능 (IA 문서 "로그인 필요 여부" 표 기준)
-- 참고: posts.user_id 컬럼은 text 타입이라 auth.uid()(uuid)와 비교 시 ::text 캐스팅 필요

alter table posts enable row level security;

-- 예전에 만들어졌던 "전체 허용" 정책 정리 (이름은 own_post 등으로 되어 있어도
-- 조건이 true라서 실제로는 아무나 쓰기/삭제 가능한 상태였음. Postgres RLS는
-- 같은 종류(INSERT/UPDATE/DELETE) 정책을 OR로 합치기 때문에, 이런 정책이
-- 하나라도 남아있으면 아래에서 만드는 제한 정책이 무력화됨)
drop policy if exists "Enable read access for all users" on posts;
drop policy if exists "allow_insert" on posts;
drop policy if exists "allow_select" on posts;
drop policy if exists "delete_all" on posts;
drop policy if exists "delete_own_post" on posts;
drop policy if exists "insert_all" on posts;
drop policy if exists "update_all" on posts;
drop policy if exists "update_own_post" on posts;

drop policy if exists "posts are publicly readable" on posts;
create policy "posts are publicly readable"
  on posts for select
  using (true);

drop policy if exists "users can insert their own posts" on posts;
create policy "users can insert their own posts"
  on posts for insert
  with check (auth.uid()::text = user_id);

drop policy if exists "users can update their own posts" on posts;
create policy "users can update their own posts"
  on posts for update
  using (auth.uid()::text = user_id);

drop policy if exists "users can delete their own posts" on posts;
create policy "users can delete their own posts"
  on posts for delete
  using (auth.uid()::text = user_id);

-- 주의: 기존 posts 데이터는 전부 개발 중 만든 더미 데이터라
-- user_id가 비어있거나("null") 실제 존재하지 않는 값("test-user-123")입니다.
-- 이 정책 적용 후에는 이 더미 글들은 앱에서 수정/삭제가 불가능해집니다
-- (실제 로그인 유저와 매칭되지 않으므로). 정리하려면 Supabase 대시보드
-- Table Editor에서 직접 삭제해주세요 (RLS는 대시보드 관리자 작업에는 적용되지 않습니다).
