-- 관리자 권한 설정(/admin/permissions)/유저 목록(/admin/users) 탭에서
-- 닉네임뿐 아니라 이메일(아이디)도 보여주기 위한 함수.
-- profiles 테이블엔 이메일이 없고 auth.users에만 있어서, 관리자 전용 SECURITY DEFINER 함수로
-- 조인해 노출(비관리자는 호출 자체가 거부됨). search_term이 없으면 전체 목록 반환.
create or replace function admin_list_profiles(search_term text default null)
returns table (id uuid, nickname text, email text, is_admin boolean, created_at timestamptz)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and is_admin = true) then
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
