-- digest() 에러 원인 확정 및 해결 완료 후 정리.
-- 1) 디버깅 과정에서 쌓인 테스트용 email_verifications 행 삭제
-- 2) 더 이상 필요 없는 진단용 RPC(diagnose_digest_issue) 삭제

delete from email_verifications
where email in (
  'diagnose-test@example.com',
  'curl-diagnose-test@example.com',
  'curl-diagnose-test-2@example.com',
  'curl-diagnose-test-3@example.com'
);

drop function if exists diagnose_digest_issue();
