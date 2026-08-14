-- 홈 화면(/home) 우측 Circle 인기글 슬롯을 5개 → 7개로 확장.

alter table home_slots
  drop constraint if exists home_slots_slot_key_check;
alter table home_slots
  add constraint home_slots_slot_key_check check (
    slot_key in (
      'left_1', 'left_2', 'hero',
      'circle_1', 'circle_2', 'circle_3', 'circle_4', 'circle_5', 'circle_6', 'circle_7'
    )
  );

-- home_slots_type_matches_slot(slot_key like 'circle_%')은 이미 circle_6/circle_7을 커버하므로 그대로 둠.

insert into home_slots (slot_key, content_type, content_id) values
  ('circle_6', null, null),
  ('circle_7', null, null)
on conflict (slot_key) do nothing;
