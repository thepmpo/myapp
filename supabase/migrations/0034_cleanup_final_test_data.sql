-- 이메일 인증 기능 종단 테스트(RPC 직접 호출 + 실제 브라우저 회원가입 화면)에서
-- 쌓인 테스트용 email_verifications 행 정리.
-- thepmpo.official@gmail.com은 실제 관리자 계정이라 verified=true 상태로 남기지 않고 삭제.

delete from email_verifications
where email in (
  'flow-test-new@example.com',
  'thepmpo.official@gmail.com'
);
