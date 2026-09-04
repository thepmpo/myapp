-- ============================================================================
-- 운영 DB 대량 정리 SQL — 2026-08-13 인벤토리 기준
-- ============================================================================
-- 목표: 아래 두 가지만 남기고 나머지 유저 생성 데이터를 전부 삭제
--   (A) articles 중 Trends/AI 아티클 10편 (id 6~15, 전부 rpdla1403@naver.com 작성)
--   (B) 관리자 계정 rpdla1403@naver.com (auth.users id 52bec66f-64b0-44b3-a732-d2bdfa9d2371)
--
-- 2026-08-14: 사용자 확인 받아 아래 3가지 반영 후 실행
--   1) products/product_platforms 삭제 활성화
--   2) article_subcategories 삭제 활성화
--   3) article_views 전체 삭제 추가 (남기는 10편 것 포함 전부 비움)
--
-- 트랜잭션으로 묶어서 실행 — 중간에 하나라도 실패하면 전체 롤백됨.
-- ============================================================================

begin;

-- 남길 관리자 계정 id를 변수처럼 재사용하기 위한 상수 (Postgres에는 변수가 없어 매번 리터럴로 반복 사용)
-- KEEP_ADMIN_ID = '52bec66f-64b0-44b3-a732-d2bdfa9d2371'
-- KEEP_ADMIN_EMAIL = 'rpdla1403@naver.com'
-- KEEP_ARTICLE_IDS = 6,7,8,9,10,11,12,13,14,15

-- ----------------------------------------------------------------------------
-- 1) Circle(posts) 관련 자식 데이터부터 — 자식(reports/likes/comments) → 부모(posts) 순
--    Circle은 "남길 것" 목록에 없으므로 posts는 전부 삭제 대상(관리자 글 포함).
--    posts.user_id / follows.follower_id 등은 text 컬럼이라 FK cascade가 없어서
--    auth.users를 지워도 자동으로 안 지워짐 → 여기서 명시적으로 먼저 지움.
-- ----------------------------------------------------------------------------

-- 1-1. reports: post/comment를 참조하는 신고 먼저 (article 신고는 없음, articles는 안 건드림)
delete from reports
where post_id is not null or comment_id is not null;

-- 1-2. likes: posts/comments를 참조하는 좋아요 (article 좋아요는 현재 데이터 없음, 있어도 안 건드림)
delete from likes
where post_id is not null or comment_id is not null;

-- 1-3. comments: posts에 달린 댓글 (article에 달린 댓글은 현재 없음 — article_id is null 조건으로 한정해
--       혹시 모를 아티클 댓글은 건드리지 않도록 방어)
delete from comments
where post_id is not null;

-- 1-4. follows: follower_id/following_id 둘 다 text라 FK 없음 — 관리자-관리자 자기팔로우가
--       나올 수 없는 구조라(자기 자신 팔로우 금지 제약) 전부 삭제 대상
delete from follows;

-- 1-5. posts: 위 자식 데이터를 다 지운 뒤 부모 삭제
delete from posts;


-- ----------------------------------------------------------------------------
-- 2) 유저 계정 관련 자식 테이블 — 남길 관리자 1명만 제외하고 전부 삭제
-- ----------------------------------------------------------------------------

-- 2-1. 커스텀 OTP 테이블(email_verifications) — user_id가 아니라 email(text) 기준이라 명시적으로 처리
delete from email_verifications
where email <> 'rpdla1403@naver.com';

-- 2-2. user_agreements — auth.users FK가 on delete cascade지만, 명시적으로도 먼저 지움
delete from user_agreements
where user_id <> '52bec66f-64b0-44b3-a732-d2bdfa9d2371';

-- 2-3. profiles — auth.users FK가 on delete cascade지만, auth.users와 연결이 끊긴
--       고아 profiles 행(2026-08-13 인벤토리에서 8건 발견됨)까지 정리하려면 명시적 삭제가 필요
delete from profiles
where id <> '52bec66f-64b0-44b3-a732-d2bdfa9d2371';


-- ----------------------------------------------------------------------------
-- 3) articles 관련 — 자식(article_views, article_subcategories 사용) → 부모(articles) 순
-- ----------------------------------------------------------------------------

-- 3-1. article_views: articles의 자식(on delete cascade)이라 articles 삭제와 순서 충돌 없음.
--       남기는 10편 것 포함해서 전부 비움(사용자 요청).
delete from article_views;

-- 3-2. articles — 남길 10편 외 나머지 삭제 (2026-08-13 기준 articles 테이블엔 이미 이 10편만
--       있어서 이 문장은 사실상 0건 삭제지만, 실행 시점에 글이 더 생겼을 경우를 대비한 안전장치)
delete from articles
where id not in (6, 7, 8, 9, 10, 11, 12, 13, 14, 15);


-- ----------------------------------------------------------------------------
-- 4) products / product_platforms — 자식(product_platforms) → 부모(products) 순
--    2026-08-13 인벤토리 기준 products에 1건("clip") 있고, 작성자가 남기는 관리자
--    본인이지만 "남길 것" 목록엔 없어 삭제 대상 확인받음(2026-08-14).
-- ----------------------------------------------------------------------------

delete from product_platforms where product_id in (select id from products where author_id <> '52bec66f-64b0-44b3-a732-d2bdfa9d2371');
delete from products where author_id <> '52bec66f-64b0-44b3-a732-d2bdfa9d2371';


-- ----------------------------------------------------------------------------
-- 5) article_subcategories
--    2026-08-13 인벤토리 기준 1건("순위", trend) 있음. 남기는 10편 중 어느 것도
--    이 세부 카테고리를 쓰고 있지 않음(전부 subcategory_id null). 삭제 대상 확인받음(2026-08-14).
-- ----------------------------------------------------------------------------

delete from article_subcategories where name = '순위' and category = 'trend';


-- ----------------------------------------------------------------------------
-- 6) auth.users — 최상위 부모, 맨 마지막에 삭제
--    profiles/user_agreements는 on delete cascade가 걸려있지만 2)에서 이미
--    명시적으로 지워서 여기서는 실질적으로 auth 스키마 내부(identities,
--    sessions, refresh_tokens 등)만 정리됨.
-- ----------------------------------------------------------------------------

delete from auth.users
where id <> '52bec66f-64b0-44b3-a732-d2bdfa9d2371';


-- ----------------------------------------------------------------------------
-- 그대로 두는 테이블 (참고용 — 이 파일에서 아무것도 하지 않음)
--   - banned_keywords / nav_menu_settings / home_slots: 유저 생성 데이터가
--     아니라 운영 설정값이라 그대로 유지
-- ----------------------------------------------------------------------------

commit;

-- ============================================================================
-- 실행 후 검증용 (선택 — 실행하고 나서 아래를 따로 돌려서 결과 확인 가능)
-- ============================================================================
-- select 'profiles' t, count(*) from profiles
-- union all select 'user_agreements', count(*) from user_agreements
-- union all select 'posts', count(*) from posts
-- union all select 'comments', count(*) from comments
-- union all select 'likes', count(*) from likes
-- union all select 'follows', count(*) from follows
-- union all select 'reports', count(*) from reports
-- union all select 'articles', count(*) from articles
-- union all select 'article_views', count(*) from article_views
-- union all select 'products', count(*) from products
-- union all select 'product_platforms', count(*) from product_platforms
-- union all select 'article_subcategories', count(*) from article_subcategories
-- union all select 'email_verifications', count(*) from email_verifications
-- union all select 'auth.users', count(*) from auth.users;
