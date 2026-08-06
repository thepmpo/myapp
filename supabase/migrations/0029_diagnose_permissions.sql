-- 진단 전용 (변경 없음). 결과를 한 번에 보기 위해 한 표로 합침.
-- SQL Editor(postgres 롤)에서는 함수 호출이 성공하지만, REST API(service_role 롤)로 호출하면
-- 여전히 "digest 없음" 에러가 남 — 두 경로의 유일한 차이는 실행 롤이므로 권한 문제로 의심됨.

select 'function_owner' as check_name, r.rolname as result
from pg_proc p
join pg_roles r on r.oid = p.proowner
where p.proname = 'request_email_verification_code'

union all

select 'extensions_schema_acl' as check_name, coalesce(nspacl::text, '(no explicit acl / default)') as result
from pg_namespace where nspname = 'extensions'

union all

select 'service_role_can_execute_function' as check_name,
  has_function_privilege('service_role', 'request_email_verification_code(text)', 'execute')::text as result

union all

select 'service_role_can_use_extensions_schema' as check_name,
  has_schema_privilege('service_role', 'extensions', 'usage')::text as result

union all

select 'postgres_can_use_extensions_schema' as check_name,
  has_schema_privilege('postgres', 'extensions', 'usage')::text as result;
