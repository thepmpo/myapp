-- ============================================================================
-- Circle seed 댓글 추가 (2026-08-14) — 기존 seed 4계정 재사용, 신규 계정 없음
-- 미답변으로 남기기로 한 질문 2개(id 61, 64)는 이 스크립트가 건드리지 않음
-- ============================================================================

begin;

-- ---- post 45: 점심 먹고 나른할 때 다들 뭐 하세요? ----
insert into comments (post_id, user_id, author, content, created_at) values (45, '206fe57f-e9fc-4373-87dc-6caf8b050cf6', 'seed-po-sua@pmpo-seed.local', '저는 오후에 그냥 눈 감고 5분만 있어도 좀 낫더라고요', '2026-08-02 09:20:00+00');
insert into likes (user_id, comment_id) values ('5432ecad-2b73-4d2f-90f2-8f026f721813', (select id from comments where post_id = 45 and user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6' and content = '저는 오후에 그냥 눈 감고 5분만 있어도 좀 낫더라고요'));
insert into likes (user_id, comment_id) values ('79b2fd81-824a-472e-8151-bb332da29970', (select id from comments where post_id = 45 and user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6' and content = '저는 오후에 그냥 눈 감고 5분만 있어도 좀 낫더라고요'));
insert into likes (user_id, comment_id) values ('3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', (select id from comments where post_id = 45 and user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6' and content = '저는 오후에 그냥 눈 감고 5분만 있어도 좀 낫더라고요'));
insert into comments (post_id, user_id, author, content, created_at) values (45, '79b2fd81-824a-472e-8151-bb332da29970', 'seed-junior-hyunwoo@pmpo-seed.local', '맞아요 저도 오후엔 뭘 해도 집중이 잘 안돼서 짧게라도 움직이려고 해요', '2026-08-02 12:40:00+00');

-- ---- post 46: 노션으로 로드맵 관리하는 방식 공유해봐요 ----
insert into comments (post_id, user_id, author, content, created_at) values (46, '206fe57f-e9fc-4373-87dc-6caf8b050cf6', 'seed-po-sua@pmpo-seed.local', '@취준생_지훈 저도 궁금해요 템플릿 공유해주시면 저장해두고 싶어요', '2026-08-02 14:30:00+00');
insert into likes (user_id, comment_id) values ('5432ecad-2b73-4d2f-90f2-8f026f721813', (select id from comments where post_id = 46 and user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6' and content = '@취준생_지훈 저도 궁금해요 템플릿 공유해주시면 저장해두고 싶어요'));
insert into likes (user_id, comment_id) values ('79b2fd81-824a-472e-8151-bb332da29970', (select id from comments where post_id = 46 and user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6' and content = '@취준생_지훈 저도 궁금해요 템플릿 공유해주시면 저장해두고 싶어요'));
insert into likes (user_id, comment_id) values ('3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', (select id from comments where post_id = 46 and user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6' and content = '@취준생_지훈 저도 궁금해요 템플릿 공유해주시면 저장해두고 싶어요'));
insert into comments (post_id, user_id, author, content, created_at) values (46, '5432ecad-2b73-4d2f-90f2-8f026f721813', 'seed-senior-minji@pmpo-seed.local', '@PO_수아 저도 나중에 같이 참고할게요', '2026-08-02 18:10:00+00');

-- ---- post 47: RICE 프레임워크 처음 써봤는데 생각보다 괜찮네요 ----
insert into comments (post_id, user_id, author, content, created_at) values (47, '5432ecad-2b73-4d2f-90f2-8f026f721813', 'seed-senior-minji@pmpo-seed.local', 'RICE 저도 도입해보려고 하는데 Effort 산정이 제일 헷갈리더라고요', '2026-08-03 09:00:00+00');
insert into comments (post_id, user_id, author, content, created_at) values (47, '206fe57f-e9fc-4373-87dc-6caf8b050cf6', 'seed-po-sua@pmpo-seed.local', '저흰 아직 감으로 하는데 이번 기회에 저희도 한번 써봐야겠어요', '2026-08-03 15:20:00+00');
insert into comments (post_id, user_id, author, content, created_at) values (47, '79b2fd81-824a-472e-8151-bb332da29970', 'seed-junior-hyunwoo@pmpo-seed.local', '@시니어PM_민지 Effort는 그냥 감으로 1/2/3 정도로만 나눠도 충분하더라고요', '2026-08-03 20:05:00+00');

-- ---- post 48: 데일리 스크럼 5분이라더니 왜 30분이 되죠 ㅋㅋ ----
insert into comments (post_id, user_id, author, content, created_at) values (48, '5432ecad-2b73-4d2f-90f2-8f026f721813', 'seed-senior-minji@pmpo-seed.local', '웃프네요 ㅋㅋ 저희도 안건 있으면 15분씩은 기본으로 넘어가요', '2026-08-03 09:40:00+00');
insert into comments (post_id, user_id, author, content, created_at) values (48, '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', 'seed-jobseeker-jihoon@pmpo-seed.local', '취준 스터디할 때도 데일리 흉내내봤는데 그것도 금방 길어지더라고요', '2026-08-03 21:15:00+00');

-- ---- post 49: PM 이직 준비할 때 포트폴리오 어떻게 구성하세요? ----
insert into comments (post_id, user_id, author, content, created_at) values (49, '79b2fd81-824a-472e-8151-bb332da29970', 'seed-junior-hyunwoo@pmpo-seed.local', '@시니어PM_민지 회고까지 넣는 아이디어 좋네요, 저도 다음에 그렇게 써봐야겠어요', '2026-08-04 08:00:00+00');
insert into likes (user_id, comment_id) values ('206fe57f-e9fc-4373-87dc-6caf8b050cf6', (select id from comments where post_id = 49 and user_id = '79b2fd81-824a-472e-8151-bb332da29970' and content = '@시니어PM_민지 회고까지 넣는 아이디어 좋네요, 저도 다음에 그렇게 써봐야겠어요'));
insert into comments (post_id, user_id, author, content, created_at) values (49, '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', 'seed-jobseeker-jihoon@pmpo-seed.local', '@주니어PM_현우 맞아요 저도 숫자 위주로 정리해보려고요', '2026-08-04 10:30:00+00');
insert into comments (post_id, user_id, author, content, created_at) values (49, '5432ecad-2b73-4d2f-90f2-8f026f721813', 'seed-senior-minji@pmpo-seed.local', '@취준생_지훈 화이팅이에요, 준비 중이시면 케이스 스터디도 같이 정리해두면 좋아요', '2026-08-04 19:45:00+00');

-- ---- post 50: 스프린트 회고 템플릿 이렇게 써봤어요 ----
insert into comments (post_id, user_id, author, content, created_at) values (50, '5432ecad-2b73-4d2f-90f2-8f026f721813', 'seed-senior-minji@pmpo-seed.local', 'Keep/Problem/Try 저도 쓰는데 타임박스 아이디어는 안 해봤네요, 좋은데요', '2026-08-04 09:10:00+00');
insert into comments (post_id, user_id, author, content, created_at) values (50, '79b2fd81-824a-472e-8151-bb332da29970', 'seed-junior-hyunwoo@pmpo-seed.local', '액션 아이템까지 정리하는 거 진짜 중요한 것 같아요, 저흰 자꾸 흐지부지돼서', '2026-08-04 14:50:00+00');
insert into comments (post_id, user_id, author, content, created_at) values (50, '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', 'seed-jobseeker-jihoon@pmpo-seed.local', '회고 템플릿 저도 하나 정해두고 싶었는데 참고할게요', '2026-08-04 22:00:00+00');
insert into comments (post_id, user_id, author, content, created_at) values (50, '5432ecad-2b73-4d2f-90f2-8f026f721813', 'seed-senior-minji@pmpo-seed.local', '@PO_수아 혹시 회고 진행할 때 퍼실리테이터는 따로 정하세요?', '2026-08-05 08:20:00+00');

-- ---- post 51: PM 스터디 카페에서 하시는 분 계세요? ----
insert into comments (post_id, user_id, author, content, created_at) values (51, '5432ecad-2b73-4d2f-90f2-8f026f721813', 'seed-senior-minji@pmpo-seed.local', '저도 카페에서 공부하다가 PM 얘기 들리면 괜히 집중돼요 ㅋㅋ', '2026-08-04 20:10:00+00');
insert into comments (post_id, user_id, author, content, created_at) values (51, '79b2fd81-824a-472e-8151-bb332da29970', 'seed-junior-hyunwoo@pmpo-seed.local', '저는 집이 더 편해서 주로 집에서 하는데 스터디카페도 한번 가볼까 싶네요', '2026-08-05 09:30:00+00');
insert into comments (post_id, user_id, author, content, created_at) values (51, '206fe57f-e9fc-4373-87dc-6caf8b050cf6', 'seed-po-sua@pmpo-seed.local', '강남 쪽 스터디카페 조용해서 좋더라고요', '2026-08-05 13:15:00+00');

-- ---- post 52: 유저 인터뷰 질문 리스트 정리해봤어요 ----
insert into comments (post_id, user_id, author, content, created_at) values (52, '79b2fd81-824a-472e-8151-bb332da29970', 'seed-junior-hyunwoo@pmpo-seed.local', '질문 은행 아이디어 좋네요, 저도 카테고리별로 나눠서 정리해봐야겠어요', '2026-08-05 11:00:00+00');
insert into likes (user_id, comment_id) values ('5432ecad-2b73-4d2f-90f2-8f026f721813', (select id from comments where post_id = 52 and user_id = '79b2fd81-824a-472e-8151-bb332da29970' and content = '질문 은행 아이디어 좋네요, 저도 카테고리별로 나눠서 정리해봐야겠어요'));
insert into likes (user_id, comment_id) values ('3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', (select id from comments where post_id = 52 and user_id = '79b2fd81-824a-472e-8151-bb332da29970' and content = '질문 은행 아이디어 좋네요, 저도 카테고리별로 나눠서 정리해봐야겠어요'));
insert into likes (user_id, comment_id) values ('206fe57f-e9fc-4373-87dc-6caf8b050cf6', (select id from comments where post_id = 52 and user_id = '79b2fd81-824a-472e-8151-bb332da29970' and content = '질문 은행 아이디어 좋네요, 저도 카테고리별로 나눠서 정리해봐야겠어요'));
insert into comments (post_id, user_id, author, content, created_at) values (52, '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', 'seed-jobseeker-jihoon@pmpo-seed.local', '@주니어PM_현우 저도요, 매번 새로 짜는 거 진짜 비효율적이었어요', '2026-08-05 15:40:00+00');
insert into comments (post_id, user_id, author, content, created_at) values (52, '206fe57f-e9fc-4373-87dc-6caf8b050cf6', 'seed-po-sua@pmpo-seed.local', '행동 질문 먼저 하는 순서 저도 적용해봐야겠어요', '2026-08-06 09:00:00+00');

-- ---- post 53: 스타트업 vs 대기업 PM, 첫 커리어로 뭐가 나을까요? ----
insert into comments (post_id, user_id, author, content, created_at) values (53, '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', 'seed-jobseeker-jihoon@pmpo-seed.local', '취준생 입장에서는 둘 다 장단점이 있어서 더 고민되네요, 좋은 얘기 감사해요', '2026-08-06 10:20:00+00');
insert into likes (user_id, comment_id) values ('5432ecad-2b73-4d2f-90f2-8f026f721813', (select id from comments where post_id = 53 and user_id = '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae' and content = '취준생 입장에서는 둘 다 장단점이 있어서 더 고민되네요, 좋은 얘기 감사해요'));
insert into comments (post_id, user_id, author, content, created_at) values (53, '79b2fd81-824a-472e-8151-bb332da29970', 'seed-junior-hyunwoo@pmpo-seed.local', '저도 이직한다면 스타트업 쪽도 한번 겪어보고 싶긴 해요', '2026-08-06 14:00:00+00');
insert into comments (post_id, user_id, author, content, created_at) values (53, '206fe57f-e9fc-4373-87dc-6caf8b050cf6', 'seed-po-sua@pmpo-seed.local', '대기업 프로세스 배우는 것도 나쁘지 않다는 말 공감돼요', '2026-08-06 20:30:00+00');

-- ---- post 54: PRD 쓸 때 자주 빠뜨리는 항목 정리 ----
insert into comments (post_id, user_id, author, content, created_at) values (54, '5432ecad-2b73-4d2f-90f2-8f026f721813', 'seed-senior-minji@pmpo-seed.local', '실패 시나리오 항목 저도 꼭 넣어야겠어요, 매번 나중에 추가하게 되더라고요', '2026-08-06 09:50:00+00');
insert into comments (post_id, user_id, author, content, created_at) values (54, '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', 'seed-jobseeker-jihoon@pmpo-seed.local', 'PRD 템플릿 저도 하나 정리해두고 싶었는데 참고할게요', '2026-08-06 16:30:00+00');
insert into comments (post_id, user_id, author, content, created_at) values (54, '206fe57f-e9fc-4373-87dc-6caf8b050cf6', 'seed-po-sua@pmpo-seed.local', '엣지 케이스는 진짜 늘 뒤늦게 떠오르죠 ㅋㅋ', '2026-08-07 08:40:00+00');
insert into comments (post_id, user_id, author, content, created_at) values (54, '5432ecad-2b73-4d2f-90f2-8f026f721813', 'seed-senior-minji@pmpo-seed.local', '@PO_수아 맞아요, 그래서 요즘은 아예 체크리스트로 만들어뒀어요', '2026-08-07 12:10:00+00');

-- ---- post 55: 재택 3일차인데 집중이 하나도 안 되네요 ----
insert into comments (post_id, user_id, author, content, created_at) values (55, '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', 'seed-jobseeker-jihoon@pmpo-seed.local', '저도 재택할 때 딴짓 진짜 많이 하는데 포모도로 한번 써봐야겠어요', '2026-08-07 09:00:00+00');
insert into comments (post_id, user_id, author, content, created_at) values (55, '5432ecad-2b73-4d2f-90f2-8f026f721813', 'seed-senior-minji@pmpo-seed.local', '@취준생_지훈 저도 처음엔 안 맞았는데 며칠 하니까 적응되더라고요', '2026-08-07 13:20:00+00');

-- ---- post 56: A/B 테스트 샘플 수 계산기 써보신 분? ----
insert into comments (post_id, user_id, author, content, created_at) values (56, '79b2fd81-824a-472e-8151-bb332da29970', 'seed-junior-hyunwoo@pmpo-seed.local', '저도 샘플 수 계산 안 하고 돌렸다가 애매했던 적 있어요, 이제 꼭 확인해요', '2026-08-07 15:00:00+00');
insert into likes (user_id, comment_id) values ('5432ecad-2b73-4d2f-90f2-8f026f721813', (select id from comments where post_id = 56 and user_id = '79b2fd81-824a-472e-8151-bb332da29970' and content = '저도 샘플 수 계산 안 하고 돌렸다가 애매했던 적 있어요, 이제 꼭 확인해요'));
insert into likes (user_id, comment_id) values ('3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', (select id from comments where post_id = 56 and user_id = '79b2fd81-824a-472e-8151-bb332da29970' and content = '저도 샘플 수 계산 안 하고 돌렸다가 애매했던 적 있어요, 이제 꼭 확인해요'));
insert into likes (user_id, comment_id) values ('206fe57f-e9fc-4373-87dc-6caf8b050cf6', (select id from comments where post_id = 56 and user_id = '79b2fd81-824a-472e-8151-bb332da29970' and content = '저도 샘플 수 계산 안 하고 돌렸다가 애매했던 적 있어요, 이제 꼭 확인해요'));
insert into comments (post_id, user_id, author, content, created_at) values (56, '5432ecad-2b73-4d2f-90f2-8f026f721813', 'seed-senior-minji@pmpo-seed.local', '@주니어PM_현우 그쵸, 결과 믿을 수 있으려면 이 과정이 꼭 필요한 것 같아요', '2026-08-07 18:40:00+00');
insert into comments (post_id, user_id, author, content, created_at) values (56, '206fe57f-e9fc-4373-87dc-6caf8b050cf6', 'seed-po-sua@pmpo-seed.local', '온라인 계산기 링크 있으면 공유해주실 수 있나요?', '2026-08-08 09:10:00+00');
insert into comments (post_id, user_id, author, content, created_at) values (56, '79b2fd81-824a-472e-8151-bb332da29970', 'seed-junior-hyunwoo@pmpo-seed.local', '저는 보통 사내 계산기 쓰는데 온라인 것도 한번 찾아볼게요', '2026-08-08 14:20:00+00');

-- ---- post 57: PO랑 PM 역할 구분, 여기는 어떻게 나누세요? ----
insert into comments (post_id, user_id, author, content, created_at) values (57, '206fe57f-e9fc-4373-87dc-6caf8b050cf6', 'seed-po-sua@pmpo-seed.local', '저희 회사는 PO가 따로 없어서 PM이 둘 다 하는 느낌이에요', '2026-08-08 11:30:00+00');
insert into comments (post_id, user_id, author, content, created_at) values (57, '5432ecad-2b73-4d2f-90f2-8f026f721813', 'seed-senior-minji@pmpo-seed.local', '@PO_수아 오히려 그게 더 명확할 수도 있겠네요', '2026-08-08 20:00:00+00');

-- ---- post 58: 스테이크홀더 설득할 때 쓰는 자료 형식 공유 ----
insert into comments (post_id, user_id, author, content, created_at) values (58, '5432ecad-2b73-4d2f-90f2-8f026f721813', 'seed-senior-minji@pmpo-seed.local', '한 장 요약 슬라이드 저도 써봐야겠어요, 숫자 먼저 배치하는 것도 좋은 팁이네요', '2026-08-09 09:20:00+00');
insert into comments (post_id, user_id, author, content, created_at) values (58, '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', 'seed-jobseeker-jihoon@pmpo-seed.local', '취준하면서도 이런 자료 형식 알아두면 도움될 것 같아요, 감사합니다', '2026-08-09 15:40:00+00');

-- ---- post 59: PM 첫 명함 받았을 때 기억나세요? ----
insert into comments (post_id, user_id, author, content, created_at) values (59, '79b2fd81-824a-472e-8151-bb332da29970', 'seed-junior-hyunwoo@pmpo-seed.local', '저도 첫 명함 받았을 때 괜히 두근거렸던 기억 나요 ㅎㅎ', '2026-08-09 12:00:00+00');
insert into comments (post_id, user_id, author, content, created_at) values (59, '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', 'seed-jobseeker-jihoon@pmpo-seed.local', '저는 아직 못 받아봐서 부러워요, 빨리 받아보고 싶네요', '2026-08-09 18:30:00+00');
insert into comments (post_id, user_id, author, content, created_at) values (59, '206fe57f-e9fc-4373-87dc-6caf8b050cf6', 'seed-po-sua@pmpo-seed.local', '지금도 첫 명함은 서랍에 보관하고 있어요 ㅋㅋ', '2026-08-10 09:00:00+00');

-- ---- post 60: 출시 전 체크리스트 만들어봤어요 ----
insert into comments (post_id, user_id, author, content, created_at) values (60, '79b2fd81-824a-472e-8151-bb332da29970', 'seed-junior-hyunwoo@pmpo-seed.local', '체크리스트 진짜 필요했는데 양식 공유해주시면 감사하겠습니다', '2026-08-10 10:20:00+00');
insert into comments (post_id, user_id, author, content, created_at) values (60, '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', 'seed-jobseeker-jihoon@pmpo-seed.local', '출시 경험이 없어서 이런 글 도움 많이 돼요, 감사합니다', '2026-08-10 16:00:00+00');
insert into comments (post_id, user_id, author, content, created_at) values (60, '206fe57f-e9fc-4373-87dc-6caf8b050cf6', 'seed-po-sua@pmpo-seed.local', 'CS 항목까지 넣으신 거 좋네요, 저흰 그 부분을 자주 놓치더라고요', '2026-08-10 21:30:00+00');
insert into comments (post_id, user_id, author, content, created_at) values (60, '79b2fd81-824a-472e-8151-bb332da29970', 'seed-junior-hyunwoo@pmpo-seed.local', '@시니어PM_민지 혹시 양식 노션 링크로 공유 가능하신가요?', '2026-08-11 09:10:00+00');
insert into likes (user_id, comment_id) values ('3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', (select id from comments where post_id = 60 and user_id = '79b2fd81-824a-472e-8151-bb332da29970' and content = '@시니어PM_민지 혹시 양식 노션 링크로 공유 가능하신가요?'));
insert into comments (post_id, user_id, author, content, created_at) values (60, '206fe57f-e9fc-4373-87dc-6caf8b050cf6', 'seed-po-sua@pmpo-seed.local', '저도 하나 받아서 저희 팀에 맞게 수정해봐야겠어요', '2026-08-11 14:50:00+00');

-- ---- post 62: 경쟁사 리서치할 때 쓰는 툴 추천해요 ----
insert into comments (post_id, user_id, author, content, created_at) values (62, '5432ecad-2b73-4d2f-90f2-8f026f721813', 'seed-senior-minji@pmpo-seed.local', '저도 앱 리뷰 모니터링 툴 하나 써보고 싶었는데 추천 감사해요', '2026-08-11 10:40:00+00');
insert into comments (post_id, user_id, author, content, created_at) values (62, '206fe57f-e9fc-4373-87dc-6caf8b050cf6', 'seed-po-sua@pmpo-seed.local', '기능 비교표 분기마다만 업데이트해도 충분하다는 말 공감돼요', '2026-08-11 16:20:00+00');
insert into comments (post_id, user_id, author, content, created_at) values (62, '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', 'seed-jobseeker-jihoon@pmpo-seed.local', '@주니어PM_현우 저도 답변 기다리고 있었어요 ㅎㅎ', '2026-08-11 20:00:00+00');

-- ---- post 63: 대시보드 지표 우선순위 어떻게 정하세요? ----
insert into comments (post_id, user_id, author, content, created_at) values (63, '5432ecad-2b73-4d2f-90f2-8f026f721813', 'seed-senior-minji@pmpo-seed.local', '북극성 지표 하나 정하는 거 저도 동의해요, 나머지는 보조로 두는 게 훨씬 명확하더라고요', '2026-08-12 20:00:00+00');
insert into likes (user_id, comment_id) values ('206fe57f-e9fc-4373-87dc-6caf8b050cf6', (select id from comments where post_id = 63 and user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and content = '북극성 지표 하나 정하는 거 저도 동의해요, 나머지는 보조로 두는 게 훨씬 명확하더라고요'));
insert into comments (post_id, user_id, author, content, created_at) values (63, '79b2fd81-824a-472e-8151-bb332da29970', 'seed-junior-hyunwoo@pmpo-seed.local', '저희도 지표가 너무 많아서 회의 때마다 헷갈렸는데 참고할게요', '2026-08-13 08:30:00+00');
insert into comments (post_id, user_id, author, content, created_at) values (63, '206fe57f-e9fc-4373-87dc-6caf8b050cf6', 'seed-po-sua@pmpo-seed.local', '보조지표로 빼는 기준이 궁금하네요, 혹시 기준 있으신가요?', '2026-08-13 13:00:00+00');

commit;