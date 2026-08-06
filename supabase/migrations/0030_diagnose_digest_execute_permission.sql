-- 진단 전용 (변경 없음). extensions.digest 함수 자체에 대한 EXECUTE 권한을
-- service_role이 갖고 있는지 확인 (스키마 USAGE와는 별개 권한).

select 'service_role_can_execute_digest' as check_name,
  has_function_privilege('service_role', 'extensions.digest(text, text)', 'execute')::text as result

union all

select 'postgres_can_execute_digest' as check_name,
  has_function_privilege('postgres', 'extensions.digest(text, text)', 'execute')::text as result

union all

select 'digest_function_acl' as check_name, coalesce(p.proacl::text, '(no explicit acl / default owner-only)') as result
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where p.proname = 'digest' and n.nspname = 'extensions';
