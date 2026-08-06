-- 진단 전용 RPC. authenticator 커넥션을 끊어도 동일 에러가 재현돼서
-- "PL/pgSQL 세션 캐싱" 가설이 무너짐 — REST API가 애초에 우리가 확인한 최신 함수 본문을
-- 안 부르고 있을 가능성(중복 함수, 트리거/컬럼 기본값의 unqualified digest() 등)을 의심 중.
-- 이 함수를 만들어두면 SQL Editor 스크린샷 왕복 없이 REST API(curl)로 직접 결과를 받아
-- 진단 속도를 높일 수 있음. service_role만 실행 가능.

create or replace function diagnose_digest_issue()
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_result jsonb;
begin
  select jsonb_build_object(
    'verification_functions', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'schema', n.nspname,
        'name', p.proname,
        'args', pg_get_function_arguments(p.oid),
        'oid', p.oid::text,
        'source', pg_get_functiondef(p.oid)
      )), '[]'::jsonb)
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where p.proname in ('request_email_verification_code', 'verify_email_verification_code')
    ),
    'digest_functions', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'schema', n.nspname,
        'name', p.proname,
        'args', pg_get_function_arguments(p.oid),
        'oid', p.oid::text
      )), '[]'::jsonb)
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where p.proname = 'digest'
    ),
    'column_defaults', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'column', column_name,
        'default', column_default
      )), '[]'::jsonb)
      from information_schema.columns
      where table_name = 'email_verifications'
    ),
    'triggers', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'trigger_name', tgname,
        'function_called', p.proname,
        'function_schema', n.nspname
      )), '[]'::jsonb)
      from pg_trigger t
      join pg_proc p on p.oid = t.tgfoid
      join pg_namespace n on n.oid = p.pronamespace
      where t.tgrelid = 'email_verifications'::regclass
        and not t.tgisinternal
    ),
    'current_role', current_user,
    'current_search_path', current_setting('search_path'),
    'db_schemas_setting', current_setting('pgrst.db_schemas', true)
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function diagnose_digest_issue() to service_role;
