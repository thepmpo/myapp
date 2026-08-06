-- 진단 전용 쿼리 (스키마 변경 없음). 결과 그리드를 그대로 알려주세요.
-- 한 번에 보기 위해 UNION ALL로 합침.

select 'pgcrypto_extension_schema' as check_name, coalesce(n.nspname, '(설치 안 됨)') as result
from pg_extension e
join pg_namespace n on n.oid = e.extnamespace
where e.extname = 'pgcrypto'

union all

select 'digest_function_schema' as check_name, n.nspname as result
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where p.proname = 'digest'

union all

select 'extensions_schema_exists' as check_name,
  case when exists (select 1 from pg_namespace where nspname = 'extensions')
    then 'true' else 'false' end as result;
