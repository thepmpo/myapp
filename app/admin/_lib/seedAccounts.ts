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

// 관리자 본인이 아티클을 열람해서 생긴 조회수처럼, "실제 유저 지표"를 왜곡하는 관리자
// 계정 데이터를 제외하기 위한 헬퍼. getSeedUserIds()와 동일한 패턴으로 SeedDataToggle의
// "데이터 표시" 체크박스가 켜졌을 때만 이 계정들의 데이터도 함께 집계하도록 사용.
export async function getAdminUserIds(): Promise<Set<string>> {
  const { data, error } = await supabase.from("profiles").select("id").eq("is_admin", true);

  if (error) throw error;

  return new Set((data ?? []).map((row: { id: string }) => row.id));
}
