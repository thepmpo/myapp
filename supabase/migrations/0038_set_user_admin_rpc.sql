-- 버그 예방: 0010의 is_admin 셀프승격 방지 트리거는 "클라이언트 요청이면 무조건 차단"이라
-- 새로 만드는 관리자 권한 설정 화면(관리자가 남의 계정 is_admin을 켜고 끄는 기능)까지 막아버림
-- (0013/0014에서 is_blocked에 겪었던 것과 동일한 유형의 문제 — 이번엔 라이브에 배포되기 전에 미리 방지).
--
-- 해결: 0014와 동일한 패턴으로, set_user_admin() RPC가 UPDATE 직전에 트랜잭션 로컬 설정을
-- 켜두고, 트리거는 이 설정이 켜져 있으면 통과시킴.

create or replace function prevent_self_admin_escalation()
returns trigger as $$
begin
  if new.is_admin is distinct from old.is_admin then
    if auth.role() in ('authenticated', 'anon')
       and coalesce(current_setting('app.allow_is_admin_change', true), 'false') <> 'true' then
      raise exception 'is_admin은 클라이언트 요청으로 변경할 수 없습니다';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create or replace function set_user_admin(target_user_id uuid, make_admin boolean)
returns void as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and is_admin = true) then
    raise exception '관리자만 사용할 수 있습니다';
  end if;

  if target_user_id = auth.uid() then
    raise exception '본인 계정의 관리자 권한은 스스로 바꿀 수 없습니다';
  end if;

  perform set_config('app.allow_is_admin_change', 'true', true);
  update profiles set is_admin = make_admin where id = target_user_id;
end;
$$ language plpgsql security definer set search_path = public, auth;
