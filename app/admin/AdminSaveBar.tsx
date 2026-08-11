"use client";

import { useAdminChanges } from "./AdminChangesContext";

export default function AdminSaveBar() {
  const { pendingCount, saving, error, saveAll } = useAdminChanges();

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2 lg:bottom-6 lg:right-6">
      {error && <p className="max-w-[240px] rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 shadow-md">{error}</p>}

      <button
        type="button"
        onClick={saveAll}
        disabled={pendingCount === 0 || saving}
        className={`rounded-full px-5 py-3 text-sm font-medium shadow-[0_4px_16px_rgba(23,27,35,0.18)] transition-colors ${
          pendingCount === 0
            ? "bg-border text-ink-soft cursor-not-allowed"
            : "bg-accent text-white hover:bg-accent-hover cursor-pointer"
        }`}
      >
        {saving ? "저장 중..." : pendingCount > 0 ? `저장 (${pendingCount}개 변경사항)` : "변경사항 없음"}
      </button>
    </div>
  );
}
