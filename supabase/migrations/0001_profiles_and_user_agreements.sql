-- 회원가입 화면(화면 6) 구현에 필요한 테이블
-- Supabase 대시보드 > SQL Editor 에서 실행해주세요.

-- 1. profiles: 닉네임 저장/중복확인용 (auth.users에는 닉네임 컬럼이 없음)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  nickname text unique not null,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles are publicly readable"
  on profiles for select
  using (true);

create policy "users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- 2. user_agreements: 약관 동의 시각 기록 (법적 근거 보관용)
create table if not exists user_agreements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  age_over_14 boolean not null,
  terms_of_service boolean not null,
  privacy_policy boolean not null,
  marketing boolean not null default false,
  agreed_at timestamptz not null default now()
);

alter table user_agreements enable row level security;

create policy "users can insert their own agreement record"
  on user_agreements for insert
  with check (auth.uid() = user_id);

create policy "users can view their own agreement record"
  on user_agreements for select
  using (auth.uid() = user_id);
