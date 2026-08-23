-- /admin/users에서 시드(더미) 계정을 구분 표시하려면 admin_list_profiles()가
-- profiles.is_seed도 함께 내려줘야 함. 0041의 명시적 별칭(caller) 패턴은 그대로 유지.
-- 반환 타입(컬럼 구성) 자체가 바뀌므로 create or replace로는 안 되고 drop 후 재생성 필요.

drop function if exists admin_list_profiles(text);

create function admin_list_profiles(search_term text default null)
returns table (id uuid, nickname text, email text, is_admin boolean, is_seed boolean, created_at timestamptz)
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
    select p.id, p.nickname, u.email::text, p.is_admin, p.is_seed, p.created_at
    from profiles p
    join auth.users u on u.id = p.id
    where search_term is null or p.nickname ilike '%' || search_term || '%'
    order by p.created_at desc;
end;
$$;
