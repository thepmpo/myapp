-- ============================================================================
-- Circle 시연용 seed 데이터 (더미 계정 4명 + 글 20개 + 댓글 + 좋아요)
-- 2026-08-14 생성 — 실제 회원가입/이메일 OTP 플로우를 태우지 않고 DB에 직접 삽입
-- 계정 4개는 이 트랜잭션 전에 Auth Admin API로 이미 생성 완료(auth.users, profiles, user_agreements)
-- 아래 트랜잭션은 그 계정들에 is_seed 표시를 하고, posts/comments/likes를 채워넣음
-- ============================================================================

begin;

-- 0) seed 계정 표시 (0045_profiles_is_seed.sql로 추가된 컬럼)
update profiles set is_seed = true where id in (
  '5432ecad-2b73-4d2f-90f2-8f026f721813', '79b2fd81-824a-472e-8151-bb332da29970', '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', '206fe57f-e9fc-4373-87dc-6caf8b050cf6'
);

-- ---- post 1/20 (시니어PM_민지, 일반) ----
insert into posts (title, author, user_id, is_question, content, created_at) values (
  '점심 먹고 나른할 때 다들 뭐 하세요?',
  'seed-senior-minji@pmpo-seed.local',
  '5432ecad-2b73-4d2f-90f2-8f026f721813',
  false,
  '오늘따라 유독 졸린데 커피 리필하고 왔어요. 다들 오후에 집중력 어떻게 유지하세요? 저는 요즘 산책 한바퀴가 그나마 효과 있더라고요.',
  '2026-08-01 09:14:00+00'
);
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '점심 먹고 나른할 때 다들 뭐 하세요?' and user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813'), '79b2fd81-824a-472e-8151-bb332da29970', 'seed-junior-hyunwoo@pmpo-seed.local', '저도 완전 공감이에요 ㅋㅋ 오후엔 커피보다 스트레칭이 더 낫더라고요', '2026-08-01 11:20:00+00');
insert into likes (user_id, comment_id) values ('5432ecad-2b73-4d2f-90f2-8f026f721813', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '점심 먹고 나른할 때 다들 뭐 하세요?' and pp.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.user_id = '79b2fd81-824a-472e-8151-bb332da29970' and cm.content = '저도 완전 공감이에요 ㅋㅋ 오후엔 커피보다 스트레칭이 더 낫더라고요'));
insert into likes (user_id, comment_id) values ('206fe57f-e9fc-4373-87dc-6caf8b050cf6', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '점심 먹고 나른할 때 다들 뭐 하세요?' and pp.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.user_id = '79b2fd81-824a-472e-8151-bb332da29970' and cm.content = '저도 완전 공감이에요 ㅋㅋ 오후엔 커피보다 스트레칭이 더 낫더라고요'));
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '점심 먹고 나른할 때 다들 뭐 하세요?' and user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813'), '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', 'seed-jobseeker-jihoon@pmpo-seed.local', '산책 좋죠 저도 오후에 15분 정도 나갔다 오면 훨씬 나아요', '2026-08-01 15:45:00+00');
insert into likes (user_id, comment_id) values ('5432ecad-2b73-4d2f-90f2-8f026f721813', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '점심 먹고 나른할 때 다들 뭐 하세요?' and pp.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.user_id = '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae' and cm.content = '산책 좋죠 저도 오후에 15분 정도 나갔다 오면 훨씬 나아요'));

-- ---- post 2/20 (주니어PM_현우, 일반) ----
insert into posts (title, author, user_id, is_question, content, created_at) values (
  '노션으로 로드맵 관리하는 방식 공유해봐요',
  'seed-junior-hyunwoo@pmpo-seed.local',
  '79b2fd81-824a-472e-8151-bb332da29970',
  false,
  '타임라인 뷰에 분기별로 테마 나눠서 정리했더니 훨씬 보기 편해졌어요. 필터도 팀별로 걸어두니까 회의 때 바로 보여주기 좋더라고요. 혹시 다른 방식 쓰시는 분 있으면 궁금해요.',
  '2026-08-01 20:41:00+00'
);
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '노션으로 로드맵 관리하는 방식 공유해봐요' and user_id = '79b2fd81-824a-472e-8151-bb332da29970'), '5432ecad-2b73-4d2f-90f2-8f026f721813', 'seed-senior-minji@pmpo-seed.local', '저도 타임라인 뷰 쓰는데 팀별 필터는 안 걸어봤네요 좋은 팁이에요', '2026-08-02 08:10:00+00');
insert into likes (user_id, comment_id) values ('79b2fd81-824a-472e-8151-bb332da29970', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '노션으로 로드맵 관리하는 방식 공유해봐요' and pp.user_id = '79b2fd81-824a-472e-8151-bb332da29970' and cm.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.content = '저도 타임라인 뷰 쓰는데 팀별 필터는 안 걸어봤네요 좋은 팁이에요'));
insert into likes (user_id, comment_id) values ('206fe57f-e9fc-4373-87dc-6caf8b050cf6', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '노션으로 로드맵 관리하는 방식 공유해봐요' and pp.user_id = '79b2fd81-824a-472e-8151-bb332da29970' and cm.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.content = '저도 타임라인 뷰 쓰는데 팀별 필터는 안 걸어봤네요 좋은 팁이에요'));
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '노션으로 로드맵 관리하는 방식 공유해봐요' and user_id = '79b2fd81-824a-472e-8151-bb332da29970'), '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', 'seed-jobseeker-jihoon@pmpo-seed.local', '혹시 템플릿 공유 가능하신가요? 저도 정리하고 싶었는데', '2026-08-02 09:35:00+00');
insert into likes (user_id, comment_id) values ('79b2fd81-824a-472e-8151-bb332da29970', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '노션으로 로드맵 관리하는 방식 공유해봐요' and pp.user_id = '79b2fd81-824a-472e-8151-bb332da29970' and cm.user_id = '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae' and cm.content = '혹시 템플릿 공유 가능하신가요? 저도 정리하고 싶었는데'));
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '노션으로 로드맵 관리하는 방식 공유해봐요' and user_id = '79b2fd81-824a-472e-8151-bb332da29970'), '206fe57f-e9fc-4373-87dc-6caf8b050cf6', 'seed-po-sua@pmpo-seed.local', '분기별 테마 나누는 거 저희 팀도 도입해봐야겠어요', '2026-08-02 12:00:00+00');

-- ---- post 3/20 (취준생_지훈, 일반) ----
insert into posts (title, author, user_id, is_question, content, created_at) values (
  'RICE 프레임워크 처음 써봤는데 생각보다 괜찮네요',
  'seed-jobseeker-jihoon@pmpo-seed.local',
  '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae',
  false,
  '우선순위 정할 때 감으로만 하다가 이번에 RICE로 점수 매겨봤어요. Reach랑 Confidence 넣는 게 은근 헷갈리긴 하는데, 팀 안에서 근거 있는 대화가 되는 게 좋더라고요.',
  '2026-08-02 13:07:00+00'
);
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = 'RICE 프레임워크 처음 써봤는데 생각보다 괜찮네요' and user_id = '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae'), '79b2fd81-824a-472e-8151-bb332da29970', 'seed-junior-hyunwoo@pmpo-seed.local', '저도 Confidence 점수 매길 때마다 매번 애매하더라고요 ㅋㅋ', '2026-08-02 16:20:00+00');

-- ---- post 4/20 (주니어PM_현우, 일반) ----
insert into posts (title, author, user_id, is_question, content, created_at) values (
  '데일리 스크럼 5분이라더니 왜 30분이 되죠 ㅋㅋ',
  'seed-junior-hyunwoo@pmpo-seed.local',
  '79b2fd81-824a-472e-8151-bb332da29970',
  false,
  '저희 팀만 그런 건 아니겠죠? 어제도 데일리가 30분 넘게 갔어요. 다들 이런 경험 있으신가요.',
  '2026-08-02 22:18:00+00'
);
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '데일리 스크럼 5분이라더니 왜 30분이 되죠 ㅋㅋ' and user_id = '79b2fd81-824a-472e-8151-bb332da29970'), '206fe57f-e9fc-4373-87dc-6caf8b050cf6', 'seed-po-sua@pmpo-seed.local', '저희도요 ㅠㅠ 타이머 켜놓고 하는데도 꼭 넘기더라고요', '2026-08-03 08:05:00+00');

-- ---- post 5/20 (PO_수아, 질문) ----
insert into posts (title, author, user_id, is_question, content, created_at) values (
  'PM 이직 준비할 때 포트폴리오 어떻게 구성하세요?',
  'seed-po-sua@pmpo-seed.local',
  '206fe57f-e9fc-4373-87dc-6caf8b050cf6',
  true,
  '이직 생각 중인데 포트폴리오를 어디서부터 정리해야 할지 감이 안 잡혀요. 프로젝트별로 문제-과정-결과 순으로 쓰면 될까요? 경험 있으신 분들 조언 부탁드려요.',
  '2026-08-03 10:52:00+00'
);
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = 'PM 이직 준비할 때 포트폴리오 어떻게 구성하세요?' and user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6'), '5432ecad-2b73-4d2f-90f2-8f026f721813', 'seed-senior-minji@pmpo-seed.local', '문제-과정-결과 순서 좋아요. 저는 거기에 회고까지 한 줄 추가했어요, 뭘 배웠는지도 보여주면 좋더라고요', '2026-08-03 12:30:00+00');
insert into likes (user_id, comment_id) values ('206fe57f-e9fc-4373-87dc-6caf8b050cf6', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = 'PM 이직 준비할 때 포트폴리오 어떻게 구성하세요?' and pp.user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6' and cm.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.content = '문제-과정-결과 순서 좋아요. 저는 거기에 회고까지 한 줄 추가했어요, 뭘 배웠는지도 보여주면 좋더라고요'));
insert into likes (user_id, comment_id) values ('79b2fd81-824a-472e-8151-bb332da29970', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = 'PM 이직 준비할 때 포트폴리오 어떻게 구성하세요?' and pp.user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6' and cm.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.content = '문제-과정-결과 순서 좋아요. 저는 거기에 회고까지 한 줄 추가했어요, 뭘 배웠는지도 보여주면 좋더라고요'));
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = 'PM 이직 준비할 때 포트폴리오 어떻게 구성하세요?' and user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6'), '79b2fd81-824a-472e-8151-bb332da29970', 'seed-junior-hyunwoo@pmpo-seed.local', '숫자로 보여줄 수 있는 성과는 꼭 넣으시는 걸 추천드려요', '2026-08-03 14:15:00+00');
insert into likes (user_id, comment_id) values ('206fe57f-e9fc-4373-87dc-6caf8b050cf6', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = 'PM 이직 준비할 때 포트폴리오 어떻게 구성하세요?' and pp.user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6' and cm.user_id = '79b2fd81-824a-472e-8151-bb332da29970' and cm.content = '숫자로 보여줄 수 있는 성과는 꼭 넣으시는 걸 추천드려요'));
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = 'PM 이직 준비할 때 포트폴리오 어떻게 구성하세요?' and user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6'), '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', 'seed-jobseeker-jihoon@pmpo-seed.local', '저도 요즘 포트폴리오 준비 중인데 도움 많이 되는 얘기네요 감사합니다', '2026-08-03 19:50:00+00');

-- ---- post 6/20 (PO_수아, 일반) ----
insert into posts (title, author, user_id, is_question, content, created_at) values (
  '스프린트 회고 템플릿 이렇게 써봤어요',
  'seed-po-sua@pmpo-seed.local',
  '206fe57f-e9fc-4373-87dc-6caf8b050cf6',
  false,
  'Keep / Problem / Try 3단으로 나누고, 마지막에 다음 스프린트 액션 아이템까지 정리하니까 흐지부지 안 끝나더라고요. 회고 시간 자체는 30분으로 타임박스 걸어뒀어요.',
  '2026-08-03 19:36:00+00'
);

-- ---- post 7/20 (취준생_지훈, 일반) ----
insert into posts (title, author, user_id, is_question, content, created_at) values (
  'PM 스터디 카페에서 하시는 분 계세요?',
  'seed-jobseeker-jihoon@pmpo-seed.local',
  '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae',
  false,
  '요즘 스터디카페에서 케이스 스터디 준비하고 있는데 옆자리에서 PM 얘기하시는 분들 보면 괜히 반갑더라고요 ㅎㅎ 다들 어디서 공부하시나요.',
  '2026-08-04 08:29:00+00'
);

-- ---- post 8/20 (시니어PM_민지, 일반) ----
insert into posts (title, author, user_id, is_question, content, created_at) values (
  '유저 인터뷰 질문 리스트 정리해봤어요',
  'seed-senior-minji@pmpo-seed.local',
  '5432ecad-2b73-4d2f-90f2-8f026f721813',
  false,
  '매번 질문 새로 짜는 게 번거로워서 카테고리별로 질문 은행을 만들어뒀어요. 행동 질문 먼저 던지고 의견은 마지막에 묻는 순서로 하니까 답변 질이 확실히 다르더라고요.',
  '2026-08-04 21:03:00+00'
);
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '유저 인터뷰 질문 리스트 정리해봤어요' and user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813'), '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', 'seed-jobseeker-jihoon@pmpo-seed.local', '행동 질문 먼저 던지는 거 진짜 중요한 것 같아요 저도 그렇게 바꿔봐야겠어요', '2026-08-05 09:12:00+00');
insert into likes (user_id, comment_id) values ('5432ecad-2b73-4d2f-90f2-8f026f721813', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '유저 인터뷰 질문 리스트 정리해봤어요' and pp.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.user_id = '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae' and cm.content = '행동 질문 먼저 던지는 거 진짜 중요한 것 같아요 저도 그렇게 바꿔봐야겠어요'));
insert into likes (user_id, comment_id) values ('79b2fd81-824a-472e-8151-bb332da29970', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '유저 인터뷰 질문 리스트 정리해봤어요' and pp.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.user_id = '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae' and cm.content = '행동 질문 먼저 던지는 거 진짜 중요한 것 같아요 저도 그렇게 바꿔봐야겠어요'));
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '유저 인터뷰 질문 리스트 정리해봤어요' and user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813'), '206fe57f-e9fc-4373-87dc-6caf8b050cf6', 'seed-po-sua@pmpo-seed.local', '질문 은행 만드는 거 저도 시작해야겠네요 매번 새로 짜느라 힘들었어요', '2026-08-05 10:40:00+00');
insert into likes (user_id, comment_id) values ('5432ecad-2b73-4d2f-90f2-8f026f721813', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '유저 인터뷰 질문 리스트 정리해봤어요' and pp.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6' and cm.content = '질문 은행 만드는 거 저도 시작해야겠네요 매번 새로 짜느라 힘들었어요'));

-- ---- post 9/20 (시니어PM_민지, 질문) ----
insert into posts (title, author, user_id, is_question, content, created_at) values (
  '스타트업 vs 대기업 PM, 첫 커리어로 뭐가 나을까요?',
  'seed-senior-minji@pmpo-seed.local',
  '5432ecad-2b73-4d2f-90f2-8f026f721813',
  true,
  '곧 첫 PM 자리를 정해야 하는데 스타트업이랑 대기업 사이에서 계속 고민 중이에요. 각각 장단점 겪어보신 분들 얘기 들어보고 싶어요.',
  '2026-08-05 12:47:00+00'
);
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '스타트업 vs 대기업 PM, 첫 커리어로 뭐가 나을까요?' and user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813'), '79b2fd81-824a-472e-8151-bb332da29970', 'seed-junior-hyunwoo@pmpo-seed.local', '저는 대기업에서 시작했는데 프로세스 배우기엔 좋았지만 의사결정 속도는 아쉬웠어요', '2026-08-05 14:05:00+00');
insert into likes (user_id, comment_id) values ('5432ecad-2b73-4d2f-90f2-8f026f721813', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '스타트업 vs 대기업 PM, 첫 커리어로 뭐가 나을까요?' and pp.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.user_id = '79b2fd81-824a-472e-8151-bb332da29970' and cm.content = '저는 대기업에서 시작했는데 프로세스 배우기엔 좋았지만 의사결정 속도는 아쉬웠어요'));
insert into likes (user_id, comment_id) values ('3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '스타트업 vs 대기업 PM, 첫 커리어로 뭐가 나을까요?' and pp.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.user_id = '79b2fd81-824a-472e-8151-bb332da29970' and cm.content = '저는 대기업에서 시작했는데 프로세스 배우기엔 좋았지만 의사결정 속도는 아쉬웠어요'));
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '스타트업 vs 대기업 PM, 첫 커리어로 뭐가 나을까요?' and user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813'), '206fe57f-e9fc-4373-87dc-6caf8b050cf6', 'seed-po-sua@pmpo-seed.local', '스타트업 쪽이었는데 범위가 넓어서 빨리 배우긴 했어요 대신 좀 힘들긴 하더라고요', '2026-08-05 20:33:00+00');
insert into likes (user_id, comment_id) values ('5432ecad-2b73-4d2f-90f2-8f026f721813', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '스타트업 vs 대기업 PM, 첫 커리어로 뭐가 나을까요?' and pp.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6' and cm.content = '스타트업 쪽이었는데 범위가 넓어서 빨리 배우긴 했어요 대신 좀 힘들긴 하더라고요'));

-- ---- post 10/20 (주니어PM_현우, 일반) ----
insert into posts (title, author, user_id, is_question, content, created_at) values (
  'PRD 쓸 때 자주 빠뜨리는 항목 정리',
  'seed-junior-hyunwoo@pmpo-seed.local',
  '79b2fd81-824a-472e-8151-bb332da29970',
  false,
  '엣지 케이스랑 실패 시나리오를 항상 뒤늦게 추가하게 되더라고요. 요즘은 아예 템플릿에 ''실패하면 어떻게 되나'' 항목을 기본으로 넣어뒀어요.',
  '2026-08-05 23:15:00+00'
);

-- ---- post 11/20 (PO_수아, 일반) ----
insert into posts (title, author, user_id, is_question, content, created_at) values (
  '재택 3일차인데 집중이 하나도 안 되네요',
  'seed-po-sua@pmpo-seed.local',
  '206fe57f-e9fc-4373-87dc-6caf8b050cf6',
  false,
  '책상 앞에 앉아있긴 한데 자꾸 딴짓하게 되네요. 재택할 때 집중 유지하는 팁 있으신 분?',
  '2026-08-06 09:38:00+00'
);
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '재택 3일차인데 집중이 하나도 안 되네요' and user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6'), '5432ecad-2b73-4d2f-90f2-8f026f721813', 'seed-senior-minji@pmpo-seed.local', '포모도로 타이머 써보세요 25분 단위로 끊으니까 좀 낫더라고요', '2026-08-06 11:02:00+00');
insert into likes (user_id, comment_id) values ('206fe57f-e9fc-4373-87dc-6caf8b050cf6', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '재택 3일차인데 집중이 하나도 안 되네요' and pp.user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6' and cm.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.content = '포모도로 타이머 써보세요 25분 단위로 끊으니까 좀 낫더라고요'));
insert into likes (user_id, comment_id) values ('3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '재택 3일차인데 집중이 하나도 안 되네요' and pp.user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6' and cm.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.content = '포모도로 타이머 써보세요 25분 단위로 끊으니까 좀 낫더라고요'));
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '재택 3일차인데 집중이 하나도 안 되네요' and user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6'), '79b2fd81-824a-472e-8151-bb332da29970', 'seed-junior-hyunwoo@pmpo-seed.local', '저는 오전에 제일 중요한 일부터 처리하고 오후엔 회의 몰아넣어요', '2026-08-06 13:47:00+00');
insert into likes (user_id, comment_id) values ('206fe57f-e9fc-4373-87dc-6caf8b050cf6', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '재택 3일차인데 집중이 하나도 안 되네요' and pp.user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6' and cm.user_id = '79b2fd81-824a-472e-8151-bb332da29970' and cm.content = '저는 오전에 제일 중요한 일부터 처리하고 오후엔 회의 몰아넣어요'));

-- ---- post 12/20 (취준생_지훈, 일반) ----
insert into posts (title, author, user_id, is_question, content, created_at) values (
  'A/B 테스트 샘플 수 계산기 써보신 분?',
  'seed-jobseeker-jihoon@pmpo-seed.local',
  '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae',
  false,
  '온라인 계산기로 최소 샘플 수 구하고 시작했는데, 처음엔 이게 왜 필요한지 몰랐다가 결과 보고서 쓸 때 이유를 알겠더라고요. 다들 어떤 툴 쓰시나요.',
  '2026-08-07 14:22:00+00'
);
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = 'A/B 테스트 샘플 수 계산기 써보신 분?' and user_id = '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae'), '5432ecad-2b73-4d2f-90f2-8f026f721813', 'seed-senior-minji@pmpo-seed.local', '저는 사내에서 만든 계산기 쓰고 있는데 온라인 계산기도 써봐야겠어요', '2026-08-07 16:08:00+00');
insert into likes (user_id, comment_id) values ('3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = 'A/B 테스트 샘플 수 계산기 써보신 분?' and pp.user_id = '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae' and cm.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.content = '저는 사내에서 만든 계산기 쓰고 있는데 온라인 계산기도 써봐야겠어요'));
insert into likes (user_id, comment_id) values ('79b2fd81-824a-472e-8151-bb332da29970', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = 'A/B 테스트 샘플 수 계산기 써보신 분?' and pp.user_id = '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae' and cm.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.content = '저는 사내에서 만든 계산기 쓰고 있는데 온라인 계산기도 써봐야겠어요'));
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = 'A/B 테스트 샘플 수 계산기 써보신 분?' and user_id = '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae'), '206fe57f-e9fc-4373-87dc-6caf8b050cf6', 'seed-po-sua@pmpo-seed.local', '샘플 수 계산 안 하고 돌렸다가 결과 믿기 애매했던 적 있어요 이제 꼭 확인하고 시작해요', '2026-08-07 22:19:00+00');
insert into likes (user_id, comment_id) values ('3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = 'A/B 테스트 샘플 수 계산기 써보신 분?' and pp.user_id = '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae' and cm.user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6' and cm.content = '샘플 수 계산 안 하고 돌렸다가 결과 믿기 애매했던 적 있어요 이제 꼭 확인하고 시작해요'));

-- ---- post 13/20 (주니어PM_현우, 질문) ----
insert into posts (title, author, user_id, is_question, content, created_at) values (
  'PO랑 PM 역할 구분, 여기는 어떻게 나누세요?',
  'seed-junior-hyunwoo@pmpo-seed.local',
  '79b2fd81-824a-472e-8151-bb332da29970',
  true,
  '회사마다 PO/PM 역할이 다르다는 얘기는 들었는데 실제로 어떻게 나뉘는지 궁금해요. 여러분 회사는 어떤 기준으로 나누시나요.',
  '2026-08-07 21:59:00+00'
);
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = 'PO랑 PM 역할 구분, 여기는 어떻게 나누세요?' and user_id = '79b2fd81-824a-472e-8151-bb332da29970'), '5432ecad-2b73-4d2f-90f2-8f026f721813', 'seed-senior-minji@pmpo-seed.local', '저희는 PO가 비즈니스 쪽, PM이 실행 쪽을 좀 더 맡는 편이에요 근데 회사마다 정말 다르더라고요', '2026-08-08 08:44:00+00');
insert into likes (user_id, comment_id) values ('79b2fd81-824a-472e-8151-bb332da29970', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = 'PO랑 PM 역할 구분, 여기는 어떻게 나누세요?' and pp.user_id = '79b2fd81-824a-472e-8151-bb332da29970' and cm.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.content = '저희는 PO가 비즈니스 쪽, PM이 실행 쪽을 좀 더 맡는 편이에요 근데 회사마다 정말 다르더라고요'));
insert into likes (user_id, comment_id) values ('206fe57f-e9fc-4373-87dc-6caf8b050cf6', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = 'PO랑 PM 역할 구분, 여기는 어떻게 나누세요?' and pp.user_id = '79b2fd81-824a-472e-8151-bb332da29970' and cm.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.content = '저희는 PO가 비즈니스 쪽, PM이 실행 쪽을 좀 더 맡는 편이에요 근데 회사마다 정말 다르더라고요'));
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = 'PO랑 PM 역할 구분, 여기는 어떻게 나누세요?' and user_id = '79b2fd81-824a-472e-8151-bb332da29970'), '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', 'seed-jobseeker-jihoon@pmpo-seed.local', '취준하면서 느낀 건데 회사마다 공고에 적힌 역할이 다 달라서 헷갈리더라고요', '2026-08-08 10:12:00+00');
insert into likes (user_id, comment_id) values ('79b2fd81-824a-472e-8151-bb332da29970', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = 'PO랑 PM 역할 구분, 여기는 어떻게 나누세요?' and pp.user_id = '79b2fd81-824a-472e-8151-bb332da29970' and cm.user_id = '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae' and cm.content = '취준하면서 느낀 건데 회사마다 공고에 적힌 역할이 다 달라서 헷갈리더라고요'));

-- ---- post 14/20 (PO_수아, 일반) ----
insert into posts (title, author, user_id, is_question, content, created_at) values (
  '스테이크홀더 설득할 때 쓰는 자료 형식 공유',
  'seed-po-sua@pmpo-seed.local',
  '206fe57f-e9fc-4373-87dc-6caf8b050cf6',
  false,
  '숫자 먼저, 스토리는 그 다음으로 배치하니까 회의가 훨씬 빨리 끝나더라고요. 한 장짜리 요약 슬라이드 따로 만들어두는 것도 도움 많이 됐어요.',
  '2026-08-08 10:11:00+00'
);
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '스테이크홀더 설득할 때 쓰는 자료 형식 공유' and user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6'), '79b2fd81-824a-472e-8151-bb332da29970', 'seed-junior-hyunwoo@pmpo-seed.local', '한 장 요약 슬라이드 아이디어 좋네요 저도 다음 회의 때 써봐야겠어요', '2026-08-08 15:26:00+00');

-- ---- post 15/20 (시니어PM_민지, 일반) ----
insert into posts (title, author, user_id, is_question, content, created_at) values (
  'PM 첫 명함 받았을 때 기억나세요?',
  'seed-senior-minji@pmpo-seed.local',
  '5432ecad-2b73-4d2f-90f2-8f026f721813',
  false,
  '며칠 전 옛날 명함 정리하다가 첫 회사 명함이 나왔는데 괜히 웃기더라고요. 다들 그때 기분 기억나시나요.',
  '2026-08-09 08:44:00+00'
);

-- ---- post 16/20 (시니어PM_민지, 일반) ----
insert into posts (title, author, user_id, is_question, content, created_at) values (
  '출시 전 체크리스트 만들어봤어요',
  'seed-senior-minji@pmpo-seed.local',
  '5432ecad-2b73-4d2f-90f2-8f026f721813',
  false,
  'QA, 마케팅, CS까지 팀별로 확인할 항목을 나눠서 체크리스트로 만들었더니 출시 당일 우왕좌왕하는 게 줄었어요. 필요하신 분 있으면 양식 공유해드릴게요.',
  '2026-08-09 20:27:00+00'
);

-- ---- post 17/20 (취준생_지훈, 질문) ----
insert into posts (title, author, user_id, is_question, content, created_at) values (
  '신입 PM 1년차인데 매일 뭘 해야 할지 모르겠어요',
  'seed-jobseeker-jihoon@pmpo-seed.local',
  '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae',
  true,
  '입사한 지 얼마 안 됐는데 하루하루 뭘 우선적으로 해야 할지 감이 안 잡혀요. 비슷한 시기 겪으신 분들 어떻게 하루를 보내셨나요.',
  '2026-08-10 13:33:00+00'
);

-- ---- post 18/20 (주니어PM_현우, 일반) ----
insert into posts (title, author, user_id, is_question, content, created_at) values (
  '경쟁사 리서치할 때 쓰는 툴 추천해요',
  'seed-junior-hyunwoo@pmpo-seed.local',
  '79b2fd81-824a-472e-8151-bb332da29970',
  false,
  '요즘은 앱 리뷰 모니터링 툴 하나 깔아두고 주기적으로 확인하고 있어요. 기능 비교표는 분기마다 업데이트하는 정도로도 충분한 것 같아요.',
  '2026-08-11 09:52:00+00'
);
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '경쟁사 리서치할 때 쓰는 툴 추천해요' and user_id = '79b2fd81-824a-472e-8151-bb332da29970'), '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', 'seed-jobseeker-jihoon@pmpo-seed.local', '툴 이름 여쭤봐도 될까요? 저도 하나 알아보고 있었어요', '2026-08-11 14:07:00+00');

-- ---- post 19/20 (취준생_지훈, 일반) ----
insert into posts (title, author, user_id, is_question, content, created_at) values (
  '대시보드 지표 우선순위 어떻게 정하세요?',
  'seed-jobseeker-jihoon@pmpo-seed.local',
  '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae',
  false,
  '지표가 너무 많아지니까 오히려 뭘 봐야 할지 헷갈리더라고요. 요즘은 북극성 지표 하나 정하고 나머지는 보조지표로 빼는 식으로 정리하고 있어요.',
  '2026-08-12 19:08:00+00'
);

-- ---- post 20/20 (PO_수아, 질문) ----
insert into posts (title, author, user_id, is_question, content, created_at) values (
  '이직할 때 연봉 협상 어떻게들 하세요?',
  'seed-po-sua@pmpo-seed.local',
  '206fe57f-e9fc-4373-87dc-6caf8b050cf6',
  true,
  '다음 이직에서는 연봉 협상을 좀 더 잘해보고 싶은데 다들 어떤 식으로 준비하시나요. 팁 있으면 나눠주세요.',
  '2026-08-13 21:47:00+00'
);

commit;