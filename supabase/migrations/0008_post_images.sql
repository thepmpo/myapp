-- 게시글 이미지 첨부 기능 (PRD Must-have 6)
-- Supabase Storage 기반, 버킷은 공개 읽기 / 업로드는 로그인 유저 본인 폴더에만 가능
-- 이미지 있는 글은 목록에서 썸네일 우선 노출, 이미지만 있어도 제목은 필수(기존 title not null 유지로 자동 보장)

alter table posts
  add column if not exists image_url text;

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

drop policy if exists "post images are publicly readable" on storage.objects;
create policy "post images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'post-images');

drop policy if exists "users can upload their own post images" on storage.objects;
create policy "users can upload their own post images"
  on storage.objects for insert
  with check (bucket_id = 'post-images' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "users can delete their own post images" on storage.objects;
create policy "users can delete their own post images"
  on storage.objects for delete
  using (bucket_id = 'post-images' and auth.uid()::text = (storage.foldername(name))[1]);
