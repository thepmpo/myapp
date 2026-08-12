-- 마이페이지 "소개" 필드 + Insights 아티클 상세의 작성자 소개 노출용.
-- 기존 "본인 프로필 수정" RLS 정책(auth.uid() = id)이 이미 모든 컬럼에 적용되므로
-- is_admin/is_blocked 같은 별도 보호 트리거는 필요 없음(민감한 값이 아님).
alter table profiles
  add column if not exists bio text;
