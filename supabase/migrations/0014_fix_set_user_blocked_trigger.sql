-- 버그 수정: 0013의 is_blocked 보호 트리거가 관리자용 set_user_blocked() RPC까지 막고 있었음
--
-- 0013은 0010(is_admin 셀프승격 방지)과 동일한 패턴을 그대로 가져와
-- "auth.role()이 authenticated/anon이면 무조건 차단"으로 만들었는데,
-- 0010은 애초에 is_admin을 바꿀 수 있는 RPC 자체가 없어서(SQL Editor 직접 실행만 허용) 문제가 없었지만,
-- 0013은 set_user_blocked() RPC(SECURITY DEFINER)로 관리자가 앱에서 직접 차단/해제할 수 있게 설계했음.
-- SECURITY DEFINER는 테이블 권한만 상위 권한으로 바꿔줄 뿐 auth.role()이 읽는 JWT 세션 정보는
-- 그대로 유지되기 때문에, RPC를 통한 변경도 트리거에서 "클라이언트 요청"으로 오인해 막혀버림.
-- (실제로 관리자 계정으로 "작성자 차단" 버튼을 눌러도 "is_blocked은 클라이언트 요청으로 변경할 수
-- 없습니다" 에러가 발생하는 것을 라이브 테스트에서 확인함)
--
-- 해결: set_user_blocked()가 UPDATE 직전에 트랜잭션 로컬 설정(app.allow_is_blocked_change)을 켜두고,
-- 트리거는 이 설정이 켜져 있으면 통과시킴. 이 설정은 RPC 함수 내부에서만 켜지고 요청이 끝나면
-- 자동으로 사라지므로, 클라이언트가 임의로 흉내낼 수 없음.

create or replace function prevent_client_is_blocked_change()
returns trigger as $$
begin
  if new.is_blocked is distinct from old.is_blocked then
    if auth.role() in ('authenticated', 'anon')
       and coalesce(current_setting('app.allow_is_blocked_change', true), 'false') <> 'true' then
      raise exception 'is_blocked은 클라이언트 요청으로 변경할 수 없습니다';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create or replace function set_user_blocked(target_user_id uuid, blocked boolean)
returns void as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and is_admin = true) then
    raise exception '관리자만 사용할 수 있습니다';
  end if;

  if target_user_id = auth.uid() then
    raise exception '본인 계정은 차단할 수 없습니다';
  end if;

  perform set_config('app.allow_is_blocked_change', 'true', true);
  update profiles set is_blocked = blocked where id = target_user_id;
end;
$$ language plpgsql security definer set search_path = public, auth;
