-- 0046에서 늘렸던 우측 Circle 슬롯(circle_6/circle_7)을 5개로 되돌림.
-- 두 슬롯 다 비어있는 상태(content_id null)였음을 확인한 뒤 실행.

delete from home_slots where slot_key in ('circle_6', 'circle_7');

alter table home_slots
  drop constraint if exists home_slots_slot_key_check;
alter table home_slots
  add constraint home_slots_slot_key_check check (
    slot_key in ('left_1', 'left_2', 'hero', 'circle_1', 'circle_2', 'circle_3', 'circle_4', 'circle_5')
  );
