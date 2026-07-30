-- 커뮤니티 "질문있어요" 태그 기능
-- PRD Must-have 1: 게시글 작성 시 "질문있어요" 태그 선택 가능 (선택사항)
-- IA 화면1 필터: 질문 태그된 글만 보기

alter table posts
  add column if not exists is_question boolean not null default false;
