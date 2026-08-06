-- 진단 전용 (변경 없음). digest 라는 단어가 등장하는 위치 앞뒤 40자만 잘라서 확인.

select
  substring(src from greatest(pos - 40, 1) for 80) as digest_context
from (
  select pg_get_functiondef(p.oid) as src,
         position('digest' in pg_get_functiondef(p.oid)) as pos
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where p.proname = 'request_email_verification_code'
    and n.nspname = 'public'
) t;
