-- ============================================================================
-- Circle seed 글 5개 추가 (2026-08-21) — 기존 seed 4계정만 재사용, 신규 계정 없음
-- 미답변으로 남기기로 한 질문 2개(id 61, 64)는 이 스크립트가 건드리지 않음
-- ============================================================================

begin;

-- ---- post 1/5 (5432ecad-2b73-4d2f-90f2-8f026f721813, 일반) ----
insert into posts (title, author, user_id, is_question, content, created_at) values (
  '사무실 에어컨 온도 전쟁 다들 겪으시나요',
  'seed-senior-minji@pmpo-seed.local',
  '5432ecad-2b73-4d2f-90f2-8f026f721813',
  false,
  '저희 사무실은 매번 온도 갖고 은근한 신경전이 있어요. 다들 회사에서 이런 거 겪으시나요 ㅋㅋ',
  '2026-08-14 10:20:00+00'
);
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '사무실 에어컨 온도 전쟁 다들 겪으시나요' and user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813'), '79b2fd81-824a-472e-8151-bb332da29970', 'seed-junior-hyunwoo@pmpo-seed.local', '저희도요 ㅋㅋ 저는 그냥 카디건 하나 상비해뒀어요', '2026-08-14 12:05:00+00');
insert into likes (user_id, comment_id) values ('5432ecad-2b73-4d2f-90f2-8f026f721813', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '사무실 에어컨 온도 전쟁 다들 겪으시나요' and pp.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.user_id = '79b2fd81-824a-472e-8151-bb332da29970' and cm.content = '저희도요 ㅋㅋ 저는 그냥 카디건 하나 상비해뒀어요'));
insert into likes (user_id, comment_id) values ('206fe57f-e9fc-4373-87dc-6caf8b050cf6', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '사무실 에어컨 온도 전쟁 다들 겪으시나요' and pp.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.user_id = '79b2fd81-824a-472e-8151-bb332da29970' and cm.content = '저희도요 ㅋㅋ 저는 그냥 카디건 하나 상비해뒀어요'));
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '사무실 에어컨 온도 전쟁 다들 겪으시나요' and user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813'), '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', 'seed-jobseeker-jihoon@pmpo-seed.local', '취준하면서 카페 옮겨다닐 때도 그렇던데 회사도 마찬가지군요', '2026-08-14 15:40:00+00');
insert into likes (user_id, comment_id) values ('5432ecad-2b73-4d2f-90f2-8f026f721813', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '사무실 에어컨 온도 전쟁 다들 겪으시나요' and pp.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.user_id = '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae' and cm.content = '취준하면서 카페 옮겨다닐 때도 그렇던데 회사도 마찬가지군요'));
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '사무실 에어컨 온도 전쟁 다들 겪으시나요' and user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813'), '206fe57f-e9fc-4373-87dc-6caf8b050cf6', 'seed-po-sua@pmpo-seed.local', '저희 팀은 아예 투표로 온도 정했어요 ㅋㅋ 효과 있더라고요', '2026-08-14 20:10:00+00');
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '사무실 에어컨 온도 전쟁 다들 겪으시나요' and user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813'), '79b2fd81-824a-472e-8151-bb332da29970', 'seed-junior-hyunwoo@pmpo-seed.local', '투표 아이디어 좋네요 저희도 제안해봐야겠어요', '2026-08-15 08:30:00+00');

-- ---- post 2/5 (79b2fd81-824a-472e-8151-bb332da29970, 일반) ----
insert into posts (title, author, user_id, is_question, content, created_at) values (
  '슬랙 알림 끄고 일하면 죄책감 드는 거 저만 그런가요',
  'seed-junior-hyunwoo@pmpo-seed.local',
  '79b2fd81-824a-472e-8151-bb332da29970',
  false,
  '집중 좀 하려고 슬랙 알림 꺼놨는데 괜히 불안하더라고요. 다들 어떻게 하시나요',
  '2026-08-15 19:40:00+00'
);
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '슬랙 알림 끄고 일하면 죄책감 드는 거 저만 그런가요' and user_id = '79b2fd81-824a-472e-8151-bb332da29970'), '5432ecad-2b73-4d2f-90f2-8f026f721813', 'seed-senior-minji@pmpo-seed.local', '저도 그랬는데 상태메시지에 ''집중 중'' 써두니까 마음이 편해지더라고요', '2026-08-16 09:00:00+00');
insert into likes (user_id, comment_id) values ('79b2fd81-824a-472e-8151-bb332da29970', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '슬랙 알림 끄고 일하면 죄책감 드는 거 저만 그런가요' and pp.user_id = '79b2fd81-824a-472e-8151-bb332da29970' and cm.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.content = '저도 그랬는데 상태메시지에 ''집중 중'' 써두니까 마음이 편해지더라고요'));
insert into likes (user_id, comment_id) values ('206fe57f-e9fc-4373-87dc-6caf8b050cf6', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '슬랙 알림 끄고 일하면 죄책감 드는 거 저만 그런가요' and pp.user_id = '79b2fd81-824a-472e-8151-bb332da29970' and cm.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.content = '저도 그랬는데 상태메시지에 ''집중 중'' 써두니까 마음이 편해지더라고요'));
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '슬랙 알림 끄고 일하면 죄책감 드는 거 저만 그런가요' and user_id = '79b2fd81-824a-472e-8151-bb332da29970'), '206fe57f-e9fc-4373-87dc-6caf8b050cf6', 'seed-po-sua@pmpo-seed.local', '저는 아예 특정 시간대만 알림 켜두는 식으로 타협했어요', '2026-08-16 13:15:00+00');
insert into likes (user_id, comment_id) values ('79b2fd81-824a-472e-8151-bb332da29970', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '슬랙 알림 끄고 일하면 죄책감 드는 거 저만 그런가요' and pp.user_id = '79b2fd81-824a-472e-8151-bb332da29970' and cm.user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6' and cm.content = '저는 아예 특정 시간대만 알림 켜두는 식으로 타협했어요'));
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '슬랙 알림 끄고 일하면 죄책감 드는 거 저만 그런가요' and user_id = '79b2fd81-824a-472e-8151-bb332da29970'), '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', 'seed-jobseeker-jihoon@pmpo-seed.local', '취준생 입장에서도 알림 꺼두고 공부하는데 괜히 뭔가 놓칠까봐 불안하긴 해요', '2026-08-16 21:50:00+00');

-- ---- post 3/5 (3d4feccb-8d35-41fa-9992-cf1b98c3e1ae, 일반) ----
insert into posts (title, author, user_id, is_question, content, created_at) values (
  '면접 스터디원분들 다들 어디서 구하세요',
  'seed-jobseeker-jihoon@pmpo-seed.local',
  '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae',
  false,
  'PM 면접 준비하려는데 같이 스터디할 사람을 어디서 구해야 할지 감이 안 잡혀요. 다들 어떻게 구하셨나요',
  '2026-08-17 09:15:00+00'
);
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '면접 스터디원분들 다들 어디서 구하세요' and user_id = '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae'), '5432ecad-2b73-4d2f-90f2-8f026f721813', 'seed-senior-minji@pmpo-seed.local', '커뮤니티 카페나 오픈채팅방 쪽에 꽤 있더라고요, 저도 그렇게 시작했어요', '2026-08-17 11:20:00+00');
insert into likes (user_id, comment_id) values ('79b2fd81-824a-472e-8151-bb332da29970', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '면접 스터디원분들 다들 어디서 구하세요' and pp.user_id = '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae' and cm.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.content = '커뮤니티 카페나 오픈채팅방 쪽에 꽤 있더라고요, 저도 그렇게 시작했어요'));
insert into likes (user_id, comment_id) values ('206fe57f-e9fc-4373-87dc-6caf8b050cf6', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '면접 스터디원분들 다들 어디서 구하세요' and pp.user_id = '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae' and cm.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.content = '커뮤니티 카페나 오픈채팅방 쪽에 꽤 있더라고요, 저도 그렇게 시작했어요'));
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '면접 스터디원분들 다들 어디서 구하세요' and user_id = '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae'), '79b2fd81-824a-472e-8151-bb332da29970', 'seed-junior-hyunwoo@pmpo-seed.local', '@시니어PM_민지 오 저도 그런 데 있는 줄 몰랐어요, 이름 여쭤봐도 될까요', '2026-08-17 13:00:00+00');
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '면접 스터디원분들 다들 어디서 구하세요' and user_id = '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae'), '206fe57f-e9fc-4373-87dc-6caf8b050cf6', 'seed-po-sua@pmpo-seed.local', '저는 예전 스터디원들이랑 아직도 가끔 모여요, 인연이 오래가더라고요', '2026-08-17 18:40:00+00');
insert into likes (user_id, comment_id) values ('79b2fd81-824a-472e-8151-bb332da29970', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '면접 스터디원분들 다들 어디서 구하세요' and pp.user_id = '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae' and cm.user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6' and cm.content = '저는 예전 스터디원들이랑 아직도 가끔 모여요, 인연이 오래가더라고요'));
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '면접 스터디원분들 다들 어디서 구하세요' and user_id = '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae'), '5432ecad-2b73-4d2f-90f2-8f026f721813', 'seed-senior-minji@pmpo-seed.local', '@주니어PM_현우 저는 ''프로덕트 스터디''로 검색해서 찾았어요', '2026-08-17 20:05:00+00');
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '면접 스터디원분들 다들 어디서 구하세요' and user_id = '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae'), '79b2fd81-824a-472e-8151-bb332da29970', 'seed-junior-hyunwoo@pmpo-seed.local', '감사해요! 한번 찾아볼게요', '2026-08-18 08:10:00+00');
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '면접 스터디원분들 다들 어디서 구하세요' and user_id = '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae'), '206fe57f-e9fc-4373-87dc-6caf8b050cf6', 'seed-po-sua@pmpo-seed.local', '화이팅이에요, 스터디 하다 보면 생각보다 빨리 친해져요', '2026-08-18 09:30:00+00');

-- ---- post 4/5 (206fe57f-e9fc-4373-87dc-6caf8b050cf6, 일반) ----
insert into posts (title, author, user_id, is_question, content, created_at) values (
  '노트북 스티커 붙이는 편이신가요 안 붙이는 편이신가요',
  'seed-po-sua@pmpo-seed.local',
  '206fe57f-e9fc-4373-87dc-6caf8b050cf6',
  false,
  '요즘 노트북에 스티커 붙이시는 분들 보면 괜히 부럽더라고요. 다들 어떠신가요',
  '2026-08-18 21:05:00+00'
);
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '노트북 스티커 붙이는 편이신가요 안 붙이는 편이신가요' and user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6'), '5432ecad-2b73-4d2f-90f2-8f026f721813', 'seed-senior-minji@pmpo-seed.local', '저는 깔끔한 걸 좋아해서 하나도 안 붙여요', '2026-08-19 09:20:00+00');
insert into likes (user_id, comment_id) values ('206fe57f-e9fc-4373-87dc-6caf8b050cf6', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '노트북 스티커 붙이는 편이신가요 안 붙이는 편이신가요' and pp.user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6' and cm.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.content = '저는 깔끔한 걸 좋아해서 하나도 안 붙여요'));
insert into likes (user_id, comment_id) values ('3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '노트북 스티커 붙이는 편이신가요 안 붙이는 편이신가요' and pp.user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6' and cm.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.content = '저는 깔끔한 걸 좋아해서 하나도 안 붙여요'));
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '노트북 스티커 붙이는 편이신가요 안 붙이는 편이신가요' and user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6'), '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', 'seed-jobseeker-jihoon@pmpo-seed.local', '저는 회사 굿즈 스티커만 살짝 붙여뒀어요', '2026-08-19 14:00:00+00');
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '노트북 스티커 붙이는 편이신가요 안 붙이는 편이신가요' and user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6'), '79b2fd81-824a-472e-8151-bb332da29970', 'seed-junior-hyunwoo@pmpo-seed.local', '저는 완전 도배파예요 ㅋㅋ 개성 표현이라고 생각해요', '2026-08-19 19:45:00+00');
insert into likes (user_id, comment_id) values ('206fe57f-e9fc-4373-87dc-6caf8b050cf6', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '노트북 스티커 붙이는 편이신가요 안 붙이는 편이신가요' and pp.user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6' and cm.user_id = '79b2fd81-824a-472e-8151-bb332da29970' and cm.content = '저는 완전 도배파예요 ㅋㅋ 개성 표현이라고 생각해요'));
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '노트북 스티커 붙이는 편이신가요 안 붙이는 편이신가요' and user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6'), '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', 'seed-jobseeker-jihoon@pmpo-seed.local', '도배파도 멋있어 보이더라고요, 저도 하나둘 늘려볼까 봐요', '2026-08-20 08:00:00+00');

-- ---- post 5/5 (79b2fd81-824a-472e-8151-bb332da29970, 질문) ----
insert into posts (title, author, user_id, is_question, content, created_at) values (
  '동료들한테 피드백 요청할 때 어떻게 물어보세요?',
  'seed-junior-hyunwoo@pmpo-seed.local',
  '79b2fd81-824a-472e-8151-bb332da29970',
  true,
  '제 업무 방식에 대한 피드백을 받고 싶은데, 무작정 ''피드백 주세요'' 하면 다들 애매해하시더라고요. 다들 어떤 식으로 물어보시나요.',
  '2026-08-20 14:30:00+00'
);
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '동료들한테 피드백 요청할 때 어떻게 물어보세요?' and user_id = '79b2fd81-824a-472e-8151-bb332da29970'), '5432ecad-2b73-4d2f-90f2-8f026f721813', 'seed-senior-minji@pmpo-seed.local', '저는 구체적으로 ''이 부분 어땠어요?'' 하고 범위를 좁혀서 물어봐요', '2026-08-20 16:10:00+00');
insert into likes (user_id, comment_id) values ('206fe57f-e9fc-4373-87dc-6caf8b050cf6', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '동료들한테 피드백 요청할 때 어떻게 물어보세요?' and pp.user_id = '79b2fd81-824a-472e-8151-bb332da29970' and cm.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.content = '저는 구체적으로 ''이 부분 어땠어요?'' 하고 범위를 좁혀서 물어봐요'));
insert into likes (user_id, comment_id) values ('3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '동료들한테 피드백 요청할 때 어떻게 물어보세요?' and pp.user_id = '79b2fd81-824a-472e-8151-bb332da29970' and cm.user_id = '5432ecad-2b73-4d2f-90f2-8f026f721813' and cm.content = '저는 구체적으로 ''이 부분 어땠어요?'' 하고 범위를 좁혀서 물어봐요'));
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '동료들한테 피드백 요청할 때 어떻게 물어보세요?' and user_id = '79b2fd81-824a-472e-8151-bb332da29970'), '206fe57f-e9fc-4373-87dc-6caf8b050cf6', 'seed-po-sua@pmpo-seed.local', '@시니어PM_민지 그거 진짜 도움돼요, 저도 최근에 그렇게 바꿨어요', '2026-08-20 18:30:00+00');
insert into likes (user_id, comment_id) values ('3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', (select cm.id from comments cm join posts pp on pp.id = cm.post_id where pp.title = '동료들한테 피드백 요청할 때 어떻게 물어보세요?' and pp.user_id = '79b2fd81-824a-472e-8151-bb332da29970' and cm.user_id = '206fe57f-e9fc-4373-87dc-6caf8b050cf6' and cm.content = '@시니어PM_민지 그거 진짜 도움돼요, 저도 최근에 그렇게 바꿨어요'));
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '동료들한테 피드백 요청할 때 어떻게 물어보세요?' and user_id = '79b2fd81-824a-472e-8151-bb332da29970'), '3d4feccb-8d35-41fa-9992-cf1b98c3e1ae', 'seed-jobseeker-jihoon@pmpo-seed.local', '취준하면서 모의 피드백 받을 때도 범위 좁혀서 물어보니까 답변 질이 다르더라고요', '2026-08-20 20:00:00+00');
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '동료들한테 피드백 요청할 때 어떻게 물어보세요?' and user_id = '79b2fd81-824a-472e-8151-bb332da29970'), '5432ecad-2b73-4d2f-90f2-8f026f721813', 'seed-senior-minji@pmpo-seed.local', '@취준생_지훈 오 취준 단계에서도 그렇게 하시는군요, 좋은 습관이네요', '2026-08-21 08:15:00+00');
insert into comments (post_id, user_id, author, content, created_at) values ((select id from posts where title = '동료들한테 피드백 요청할 때 어떻게 물어보세요?' and user_id = '79b2fd81-824a-472e-8151-bb332da29970'), '206fe57f-e9fc-4373-87dc-6caf8b050cf6', 'seed-po-sua@pmpo-seed.local', '저는 1:1 자리에서 편하게 여쭤보는 편이에요, 공개적으로 물어보면 다들 부담스러워하시더라고요', '2026-08-21 10:40:00+00');

commit;