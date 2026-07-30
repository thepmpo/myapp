-- 버그 수정: 관리자 페이지에서 신고된 정보게시판 글을 삭제할 때, 삭제 시도한 관리자가
-- 그 글의 작성자 본인이 아니면 조용히 실패하는 문제 발견 (에러 없이 0건 삭제, 라이브 테스트로 재현 확인)
--
-- 원인: articles의 delete 정책이 "auth.uid() = author_id AND is_admin"으로,
-- 작성자 본인 관리자만 삭제 가능했음. 0013에서 posts/comments에는 "관리자는 누구나 삭제 가능" 정책을
-- 별도로 추가했는데(관리자가 신고 검토 후 콘텐츠를 지울 수 있어야 하므로) articles만 빠뜨렸음.
-- posts/comments와 동일한 패턴으로 맞춤 (기존 "본인 글만" 정책은 그대로 두고 OR로 합쳐짐).

drop policy if exists "admins can delete any article" on articles;
create policy "admins can delete any article"
  on articles for delete
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
