-- 프로필 사진 업로드 기능
-- Supabase Storage 기반, 버킷은 공개 URL 제공(public) / 업로드·삭제는 로그인 유저 본인 폴더에만 가능
--
-- 검토 반영(2026-08-03):
-- 1. storage.objects에 공개 SELECT 정책을 두지 않음 — public 버킷의 공개 URL(getPublicUrl)은
--    storage.objects의 RLS와 무관하게 버킷의 public 플래그만으로 서빙되므로 불필요하고,
--    SELECT 정책이 있으면 목록 조회(list)로 전체 아바타 오브젝트가 열거될 수 있어 제거함.
--    프런트엔드는 getPublicUrl()만 쓰고 list()는 쓰지 않으므로 기능에 영향 없음.
-- 2~3. 파일 크기 5MB, 이미지 MIME 타입(jpeg/png/webp)만 허용하도록 버킷 자체에 제한을 둠.
-- 4. INSERT/DELETE 정책에 to authenticated를 명시해 비로그인 요청은 정책 평가 전에 걸러지도록 함.
-- 5. avatars 버킷이 이미 존재하는 경우를 대비해 on conflict do update로 public/용량/허용 타입을
--    강제로 재적용함. avatars라는 이름은 이 마이그레이션 전용이라 이 저장소 안에서 다른 목적으로
--    쓰인 적이 없고(0001~0018 전수 확인), 오브젝트 데이터가 아니라 버킷 메타데이터만 갱신하므로
--    기존에 업로드된 파일에는 영향이 없음. do nothing으로 두면 기존 버킷이 있을 때 이번에 추가한
--    용량/타입 제한이 조용히 무시될 위험이 있어 do update가 더 안전하다고 판단함.

alter table profiles
  add column if not exists avatar_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 과거 버전의 이 마이그레이션이 이미 적용된 환경을 위한 정리(목록 조회를 허용하던 정책 제거)
drop policy if exists "avatars are publicly readable" on storage.objects;

drop policy if exists "users can upload their own avatar" on storage.objects;
create policy "users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "users can delete their own avatar" on storage.objects;
create policy "users can delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
