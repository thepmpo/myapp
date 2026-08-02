-- 버그 수정: 0015에서 "관리자는 누구나 아티클 삭제 가능" 정책을 추가했지만,
-- 수정(update) 정책은 여전히 "본인이 쓴 글만"으로 남아있어 다른 관리자가 쓴 글은
-- 새 관리자 페이지(/admin/insights)에서 수정 시도하면 조용히 0건 수정되는 문제가 있었음(0015와 동일한 유형의 버그).
-- 0015와 동일한 패턴으로 "관리자는 누구나 수정 가능" 정책을 추가(기존 정책과 OR로 합쳐짐).

drop policy if exists "admins can update any article" on articles;
create policy "admins can update any article"
  on articles for update
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
