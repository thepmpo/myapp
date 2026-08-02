-- 닉네임 변경을 한 달에 1번으로 제한 (마이페이지 내 정보 수정 기능 보강)
-- 클라이언트에서 UI로 비활성화 처리만 하면 REST API 직접 호출로 우회 가능하므로,
-- 0013의 is_blocked 보호 패턴과 동일하게 DB 트리거로 실제 방어선을 둠

alter table profiles
  add column if not exists nickname_changed_at timestamptz;

create or replace function enforce_nickname_change_limit()
returns trigger as $$
begin
  if new.nickname is distinct from old.nickname then
    if old.nickname_changed_at is not null and old.nickname_changed_at > now() - interval '30 days' then
      raise exception '닉네임은 한 달에 한 번만 변경할 수 있습니다';
    end if;

    new.nickname_changed_at = now();
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_enforce_nickname_change_limit on profiles;
create trigger trg_enforce_nickname_change_limit
  before update on profiles
  for each row execute function enforce_nickname_change_limit();
