-- 시연/데모용 seed 데이터(더미 계정·글·댓글)를 나중에 한 번에 식별해서 지울 수 있도록
-- profiles에 표시 컬럼을 추가함. seed 계정만 true로 표시하고, 그 계정이 쓴 posts/comments/likes는
-- 별도 컬럼 없이 posts.user_id/comments.user_id/likes.user_id가 이 seed 계정 id에 속하는지로 식별.

alter table profiles
  add column if not exists is_seed boolean not null default false;
