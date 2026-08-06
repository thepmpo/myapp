-- 배포된 사이트(thepmpo.com)에서 이메일 인증 API가 실제로 동작하는지
-- curl로 종단 확인하며 생성된 테스트 기록 정리.

delete from email_verifications
where email in (
  'prod-deploy-check@example.com',
  'thepmpo.official+proddeploycheck@gmail.com'
);
