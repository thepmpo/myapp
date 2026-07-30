-- 회원 탈퇴 기능 (화면설계 화면9)
-- 정책: 닉네임 유지, 작성한 게시글/댓글은 삭제하지 않고 유지 (탈퇴해도 남의 눈엔 그대로 보여야 함)
--
-- 문제: profiles.id가 auth.users(id)를 "on delete cascade"로 참조하고 있어서,
-- 그냥 auth.users 행을 지우면 profiles 행도 같이 지워져 닉네임이 사라짐(정책 위반).
-- 그래서 1) profiles -> auth.users 참조 제약을 제거해 profiles가 살아남게 하고,
-- 2) 클라이언트에는 auth.users를 직접 지울 권한이 없으므로(서비스 롤 키 필요),
--    "본인 계정만 지울 수 있는" DB 함수를 만들어 그 함수를 통해서만 삭제되게 함.

do $$
declare
  fk_name text;
begin
  select tc.constraint_name into fk_name
  from information_schema.table_constraints tc
  where tc.table_name = 'profiles' and tc.constraint_type = 'FOREIGN KEY';

  if fk_name is not null then
    execute format('alter table profiles drop constraint %I', fk_name);
  end if;
end $$;

create or replace function delete_own_account()
returns void as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$ language plpgsql security definer set search_path = public, auth;

grant execute on function delete_own_account() to authenticated;
