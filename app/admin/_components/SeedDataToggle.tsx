"use client";

// 관리자 통계 화면 공용 토글 — 시드(더미) 계정 데이터를 계산에 포함할지 여부.
// 상태는 이 컴포넌트를 쓰는 페이지의 useState로 관리하므로 새로고침하면 항상
// 기본값(체크 해제)으로 돌아감 — 실수로 켜둔 채 넘어가는 걸 방지하기 위해 의도적으로
// 저장하지 않음. 다른 통계 화면(가입 유입 통계 등)에서도 그대로 재사용 가능.
type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function SeedDataToggle({ checked, onChange }: Props) {
  return (
    <div className="mb-5">
      <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-ink-soft">
        데이터 표시
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-border accent-accent"
        />
      </label>
      {checked && <p className="mt-2 text-xs font-medium text-amber-600">시드 데이터 포함 중</p>}
    </div>
  );
}
