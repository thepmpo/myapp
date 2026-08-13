-- 0043에는 세부 카테고리 삭제 경로가 없었음(ON DELETE 미지정 = RESTRICT, DELETE RLS 정책 없음).
-- 관리자 "카테고리 관리" 화면에서 실제로 삭제할 수 있도록 보완.

alter table articles
  drop constraint if exists articles_subcategory_id_fkey;

alter table articles
  add constraint articles_subcategory_id_fkey
  foreign key (subcategory_id) references article_subcategories(id) on delete set null;

drop policy if exists "admins can delete article subcategories" on article_subcategories;
create policy "admins can delete article subcategories"
  on article_subcategories for delete
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
