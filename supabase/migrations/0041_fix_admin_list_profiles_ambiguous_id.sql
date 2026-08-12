-- 버그 수정: admin_list_profiles()가 "column reference is ambiguous" 에러로 항상 실패했음.
--
-- 원인: RETURNS TABLE(id uuid, ..., is_admin boolean, ...)로 선언하면 Postgres가 그 반환
-- 컬럼명(id/is_admin 등)을 함수 본문 전체에서 암묵적 변수로 취급함. 관리자 확인 부분에서
-- "where id = auth.uid() and is_admin = true"처럼 테이블 이름 없이 썼더니, 이 id/is_admin이
-- profiles 테이블의 컬럼인지 반환 테이블의 변수인지 Postgres가 구분하지 못해 매 호출마다
-- "column reference \"id\" is ambiguous" 에러가 발생했음(라이브 /admin/permissions, /admin/users
-- 양쪽에서 재현 확인됨).
--
-- 해결: 관리자 확인 서브쿼리의 profiles 테이블에 별도 별칭(caller)을 주고 전부 명시적으로
-- 한정(qualify)해서 반환 테이블 변수명과 절대 겹치지 않게 함.

create or replace function admin_list_profiles(search_term text default null)
returns table (id uuid, nickname text, email text, is_admin boolean, created_at timestamptz)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not exists (
    select 1 from profiles caller
    where caller.id = auth.uid() and caller.is_admin = true
  ) then
    raise exception '관리자만 사용할 수 있습니다';
  end if;

  return query
    select p.id, p.nickname, u.email::text, p.is_admin, p.created_at
    from profiles p
    join auth.users u on u.id = p.id
    where search_term is null or p.nickname ilike '%' || search_term || '%'
    order by p.created_at desc;
end;
$$;
