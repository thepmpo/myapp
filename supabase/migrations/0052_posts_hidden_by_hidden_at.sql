-- /admin/circle에서 "누가/언제 비공개 처리했는지" 표시하기 위한 감사 컬럼.
-- hidden_at은 애플리케이션 코드가 new Date().toISOString()으로 채우는 값이라
-- posts.created_at(timestamp without time zone)의 UTC 파싱 버그를 반복하지 않도록
-- 처음부터 timestamptz로 만듦.

alter table posts
  add column if not exists hidden_by uuid references profiles(id),
  add column if not exists hidden_at timestamptz;
