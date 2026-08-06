-- 0022에서 search_path에 "public, extensions"를 하드코딩했는데도 여전히
-- "function digest(text, unknown) does not exist" 에러가 발생함.
-- 즉 pgcrypto가 "extensions" 스키마에 있다는 가정 자체가 이 프로젝트에서는 틀렸던 것으로 보임.
-- 스키마명을 추측하지 않고, pgcrypto 확장이 실제로 설치된 스키마를 DB에서 직접 조회해
-- 그 스키마를 두 함수의 search_path에 정확히 반영하도록 수정.
-- pgcrypto가 아예 설치되어 있지 않다면 extensions 스키마(있으면)에, 없으면 public에 새로 설치.

do $$
declare
  v_schema text;
begin
  select n.nspname into v_schema
  from pg_extension e
  join pg_namespace n on n.oid = e.extnamespace
  where e.extname = 'pgcrypto';

  if v_schema is null then
    if exists (select 1 from pg_namespace where nspname = 'extensions') then
      execute 'create extension pgcrypto with schema extensions';
      v_schema := 'extensions';
    else
      execute 'create extension pgcrypto with schema public';
      v_schema := 'public';
    end if;
  end if;

  execute format('alter function request_email_verification_code(text) set search_path = public, %I', v_schema);
  execute format('alter function verify_email_verification_code(text, text) set search_path = public, %I', v_schema);

  raise notice 'pgcrypto schema resolved to: %', v_schema;
end $$;
