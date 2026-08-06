-- 함수 자체(0025)는 SQL Editor에서 직접 호출 시 정상 동작 확인됨(진단 쿼리 0027).
-- 그런데도 REST API(브라우저의 supabase.rpc() 호출)에서는 계속 이전 에러가 남 —
-- PostgREST가 함수 시그니처를 메모리에 캐시해두고 DDL 변경 후 자동으로 갱신하지 않는
-- 경우가 있어서로 추정. NOTIFY로 캐시 강제 갱신을 요청.

notify pgrst, 'reload schema';
