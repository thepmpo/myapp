import { supabase } from "@/app/lib/supabase";

// profiles.is_seed 플래그로 시드(더미) 계정을 식별함 — 유저 검색/라벨 기능(/admin/users)에서
// 이미 쓰던 기준을 그대로 재사용. 이메일 도메인(@pmpo-seed.local) 패턴 매칭이 아니라
// 명시적 플래그 컬럼이 기준임에 유의. 다른 관리자 통계 화면에서도 이 함수로
// "시드 계정이 쓴 데이터 제외" 로직을 재사용할 수 있음.
export async function getSeedUserIds(): Promise<Set<string>> {
  const { data, error } = await supabase.from("profiles").select("id").eq("is_seed", true);

  if (error) throw error;

  return new Set((data ?? []).map((row: { id: string }) => row.id));
}
