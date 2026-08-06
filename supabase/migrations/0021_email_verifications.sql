-- 회원가입 이메일 인증(6자리 코드) 기능에 필요한 테이블/RPC.
-- Supabase 대시보드 > SQL Editor 에서 실행해주세요.
--
-- 설계 원칙:
-- 1) email_verifications 테이블은 RLS만 켜두고 정책은 하나도 만들지 않음
--    → anon/authenticated 모두 이 테이블에 직접 접근 불가, 아래 SECURITY DEFINER
--      함수를 통해서만 다뤄지도록 강제함
-- 2) 인증번호 발급 함수(request_email_verification_code)는 평문 코드를 반환하므로
--    anon/authenticated 실행 권한을 주지 않고 service_role에게만 줌
--    → 반드시 서버(Next.js API 라우트, service_role 키)를 거쳐야만 호출 가능
-- 3) 인증번호 확인 함수(verify_email_verification_code)는 코드가 맞을 때만
--    그 시점에 계정 존재 여부(new/existing)를 알려줌 → 이메일 무차별 확인 방지

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

-- 인증번호 발급
create or replace function request_email_verification_code(p_email text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_recent_count int;
begin
  -- 60초 이내 재요청 방지 (재전송 스팸/남발 방지 목적, 존재 여부와 무관하게 동일 규칙 적용)
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

-- 인증번호 확인
create or replace function verify_email_verification_code(p_email text, p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
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
