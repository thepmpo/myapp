-- 0021 실행 시 "relation email_verifications does not exist" 에러로 테이블 생성까지
-- 반영되지 않았던 것으로 보임(Supabase SQL Editor는 스크립트 전체를 한 트랜잭션으로 실행하므로,
-- 중간에 하나라도 실패하면 전체가 롤백됨). 이 파일은 0021 전체를 다시 포함하되 전부
-- if not exists/or replace로 작성해 이미 일부가 반영되어 있어도 안전하게 재실행 가능하도록 함.
-- 추가로, pgcrypto가 public이 아닌 extensions 스키마에 설치된 경우
-- "function digest(text, unknown) does not exist" 에러가 나던 문제도 함께 수정
-- (search_path에 public, extensions 둘 다 포함).

create extension if not exists pgcrypto;

create table if not exists email_verifications (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists email_verifications_email_idx on email_verifications (email);

alter table email_verifications enable row level security;

create or replace function request_email_verification_code(p_email text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_code text;
  v_recent_count int;
begin
  select count(*) into v_recent_count
  from email_verifications
  where email = lower(p_email)
    and created_at > now() - interval '60 seconds';

  if v_recent_count > 0 then
    raise exception 'rate_limited';
  end if;

  v_code := lpad(floor(random() * 1000000)::text, 6, '0');

  insert into email_verifications (email, code_hash, expires_at)
  values (lower(p_email), encode(digest(v_code, 'sha256'), 'hex'), now() + interval '5 minutes');

  return v_code;
end;
$$;

revoke execute on function request_email_verification_code(text) from public;
grant execute on function request_email_verification_code(text) to service_role;

create or replace function verify_email_verification_code(p_email text, p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_row email_verifications%rowtype;
  v_exists boolean;
begin
  select * into v_row
  from email_verifications
  where email = lower(p_email)
    and verified = false
    and expires_at > now()
  order by created_at desc
  limit 1;

  if v_row.id is null then
    return jsonb_build_object('valid', false, 'reason', 'expired_or_not_found');
  end if;

  if v_row.attempts >= 5 then
    return jsonb_build_object('valid', false, 'reason', 'too_many_attempts');
  end if;

  if v_row.code_hash <> encode(digest(p_code, 'sha256'), 'hex') then
    update email_verifications
    set attempts = attempts + 1
    where id = v_row.id;

    return jsonb_build_object('valid', false, 'reason', 'mismatch');
  end if;

  update email_verifications
  set verified = true
  where id = v_row.id;

  select exists (
    select 1 from auth.users where lower(email) = lower(p_email)
  ) into v_exists;

  return jsonb_build_object(
    'valid', true,
    'status', case when v_exists then 'existing' else 'new' end
  );
end;
$$;

revoke execute on function verify_email_verification_code(text, text) from public;
grant execute on function verify_email_verification_code(text, text) to anon, authenticated;
