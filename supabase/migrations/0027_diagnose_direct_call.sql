-- 진단 전용. 두 가지 확인:
-- 1) request_email_verification_code라는 이름의 함수가 여러 스키마/시그니처로 중복 존재하는지
-- 2) 함수를 SQL Editor에서 직접 호출했을 때도 같은 에러가 나는지 (REST API/커넥션 풀러 캐시 배제)
--    (테스트용 인증 코드 row가 하나 생깁니다 — email_verifications 테이블에 diagnose-test@example.com으로 남음, 문제 없으면 나중에 지워도 됨)

select n.nspname as schema, p.proname, pg_get_function_identity_arguments(p.oid) as args, p.oid
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where p.proname = 'request_email_verification_code';

select request_email_verification_code('diagnose-test@example.com') as direct_call_result;
