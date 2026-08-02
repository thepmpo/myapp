-- Circle 게시글에 본문(content) 컬럼 추가
-- 지금까지 posts는 title만 있고 content가 없어서(0013 주석 참고) 사실상 "제목만 있는 글"이었음.
-- Reddit 스타일 전용 글쓰기 화면(/circle/new) 도입에 맞춰 본문을 받을 수 있도록 nullable로 추가
-- (기존 글은 본문 없이 제목만 있으므로 not null로 걸면 안 됨).

alter table posts
  add column if not exists content text;

-- 0013의 enforce_post_moderation()은 title만 검사했음(당시엔 content가 없었으므로).
-- content가 생겼으니 금지 키워드 필터를 우회할 수 없도록 content도 함께 검사하도록 갱신.
create or replace function enforce_post_moderation()
returns trigger as $$
begin
  if exists (select 1 from profiles where id::text = new.user_id and is_blocked = true) then
    raise exception '차단된 계정은 글을 작성할 수 없습니다';
  end if;

  if exists (
    select 1 from banned_keywords
    where new.title ilike '%' || keyword || '%'
       or (new.content is not null and new.content ilike '%' || keyword || '%')
  ) then
    raise exception '금지된 단어가 포함되어 있습니다';
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;
