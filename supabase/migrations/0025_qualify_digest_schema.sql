-- 0022/0023에서 search_path에 "public, extensions"를 정확히 설정했고,
-- pgcrypto/digest 함수도 실제로 extensions 스키마에 있는 것을 진단 쿼리로 확인했는데도
-- 여전히 "function digest(text, unknown) does not exist" 에러가 발생함
-- (원인 불명 — 커넥션 풀러의 플랜 캐싱 등으로 추정).
-- search_path 해석에 의존하지 않도록 digest() 호출을 extensions.digest(...)로
-- 스키마 직접 명시하는 방식으로 변경해 근본적으로 회피.

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
  values (lower(p_email), encode(extensions.digest(v_code, 'sha256'), 'hex'), now() + interval '5 minutes');

  return v_code;
end;
$$;

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

  if v_row.code_hash <> encode(extensions.digest(p_code, 'sha256'), 'hex') then
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
