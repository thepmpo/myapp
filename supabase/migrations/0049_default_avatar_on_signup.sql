-- 신규 가입 시 profiles.avatar_url을 비워두지 않고, 미리 만들어둔 seed 계정용
-- 아바타 4개 중 하나를 무작위로 기본 지정함. 유저는 마이페이지(/profile/edit)에서
-- 언제든 직접 업로드해서 바꿀 수 있음(기존 아바타 변경 기능은 그대로 유지, 여기서는
-- "가입 시점의 초기값"만 null 대신 랜덤 기본 이미지로 바꾸는 것).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_avatars text[] := array[
    'https://api.dicebear.com/7.x/avataaars/png?seed=minji-senior',
    'https://api.dicebear.com/7.x/avataaars/png?seed=hyunwoo-junior',
    'https://api.dicebear.com/7.x/avataaars/png?seed=jihoon-jobseeker',
    'https://api.dicebear.com/7.x/avataaars/png?seed=sua-po'
  ];
begin
  insert into public.profiles (id, nickname, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'nickname',
    default_avatars[1 + floor(random() * array_length(default_avatars, 1))::int]
  );

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
