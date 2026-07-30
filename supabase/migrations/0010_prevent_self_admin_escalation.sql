-- 보안 패치: profiles.is_admin 셀프 승격 방지
-- "본인 프로필 수정" RLS 정책(auth.uid() = id)은 행 단위로만 체크하기 때문에,
-- 로그인한 유저가 자신의 is_admin을 클라이언트에서 직접 true로 바꿀 수 있는 구멍이 있었음.
-- 트리거로 is_admin 변경 자체를 클라이언트 요청(authenticated/anon)에서는 차단하고,
-- SQL Editor(관리자가 직접 실행) 등 JWT 없는 세션에서만 허용되도록 함.

create or replace function prevent_self_admin_escalation()
returns trigger as $$
begin
  if new.is_admin is distinct from old.is_admin then
    if auth.role() in ('authenticated', 'anon') then
      raise exception 'is_admin은 클라이언트 요청으로 변경할 수 없습니다';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists prevent_self_admin_escalation on profiles;
create trigger prevent_self_admin_escalation
  before update on profiles
  for each row execute function prevent_self_admin_escalation();
