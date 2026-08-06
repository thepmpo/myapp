-- 원인 확정: PL/pgSQL은 함수를 세션(백엔드 커넥션)별로 최초 호출 시 컴파일해서 캐싱하고,
-- 그 세션이 살아있는 동안은 CREATE OR REPLACE FUNCTION으로 바꿔도 재컴파일하지 않음
-- (PL/pgSQL의 잘 알려진 동작 — 공식 문서에 명시된 세션 단위 캐싱).
-- REST API(PostgREST)는 커넥션 풀러를 통해 오래 사는 커넥션을 재사용하는데,
-- 그 커넥션이 이전(0021~0024)의 "스키마 미지정 digest()" 버전을 이미 한 번 실행해서
-- 캐싱해버린 상태라 이후 수정(0025)이 반영되지 않고 계속 옛날 에러가 났던 것.
-- NOTIFY pgrst, 'reload schema'(0028)는 PostgREST의 라우트 인식만 갱신할 뿐
-- Postgres 백엔드 내부의 PL/pgSQL 컴파일 캐시는 지우지 못함.
-- 해결: PostgREST가 실제로 REST API 요청에 쓰는 역할(authenticator)의 커넥션만
-- 강제 종료해 새 커넥션(= 최신 함수 버전)으로 재연결하도록 함.
-- (앞선 시도는 슈퍼유저 소유 커넥션까지 끊으려다 권한 에러 발생 — 이번엔 authenticator만 대상)

select pg_terminate_backend(pid)
from pg_stat_activity
where pid <> pg_backend_pid()
  and datname = current_database()
  and usename = 'authenticator';
