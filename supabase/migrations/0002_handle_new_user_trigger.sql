-- 0001에 이어서 실행해주세요.
-- 문제: 이메일 확인이 필요한 프로젝트에서는 회원가입 직후 로그인 세션이 없어
-- auth.uid()가 비어있는 상태가 되고, 클라이언트에서 profiles/user_agreements에
-- 직접 insert하면 RLS 정책 위반으로 실패함.
-- 해결: signUp 시 닉네임/약관 동의 정보를 auth 메타데이터로 같이 보내고,
-- auth.users에 row가 생성되는 즉시(이메일 확인 여부와 무관하게) 트리거가
-- profiles/user_agreements를 대신 채워넣도록 함 (RLS 우회 권한으로 실행됨).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, new.raw_user_meta_data->>'nickname');

  insert into public.user_agreements (user_id, age_over_14, terms_of_service, privacy_policy, marketing)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'age_over_14')::boolean, false),
    coalesce((new.raw_user_meta_data->>'terms_of_service')::boolean, false),
    coalesce((new.raw_user_meta_data->>'privacy_policy')::boolean, false),
    coalesce((new.raw_user_meta_data->>'marketing')::boolean, false)
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
