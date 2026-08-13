"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

type SubcategoryRow = { id: number; category: "trend" | "ai"; name: string };

const GROUPS: { key: "trend" | "ai"; label: string }[] = [
  { key: "trend", label: "Trends" },
  { key: "ai", label: "AI" },
];

export default function AdminCategoriesPage() {
  const [subcategories, setSubcategories] = useState<SubcategoryRow[]>([]);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [newNames, setNewNames] = useState<Record<"trend" | "ai", string>>({ trend: "", ai: "" });
  const [adding, setAdding] = useState<"trend" | "ai" | null>(null);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<SubcategoryRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);

    const [{ data: subs }, { data: articles }] = await Promise.all([
      supabase.from("article_subcategories").select("id, category, name").order("category").order("name"),
      supabase.from("articles").select("subcategory_id").not("subcategory_id", "is", null),
    ]);

    setSubcategories((subs as SubcategoryRow[]) || []);

    const countMap: Record<number, number> = {};
    (articles || []).forEach((a: { subcategory_id: number }) => {
      countMap[a.subcategory_id] = (countMap[a.subcategory_id] || 0) + 1;
    });
    setCounts(countMap);

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const addSubcategory = async (category: "trend" | "ai") => {
    const name = newNames[category].trim();
    if (!name) return;

    setAdding(category);
    setError("");

    const { error: insertError } = await supabase.from("article_subcategories").insert([{ category, name }]);

    setAdding(null);

    if (insertError) {
      setError(
        insertError.code === "23505" ? "이미 있는 세부 카테고리 이름이에요" : insertError.message
      );
      return;
    }

    setNewNames((prev) => ({ ...prev, [category]: "" }));
    await load();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    const { error: deleteError } = await supabase.from("article_subcategories").delete().eq("id", deleteTarget.id);
    setDeleting(false);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setDeleteTarget(null);
    await load();
  };

  if (loading) return <p className="text-sm text-ink-soft">로딩중...</p>;

  return (
    <div className="flex flex-col gap-6">
      {error && <p className="text-sm text-red-500">{error}</p>}

      {GROUPS.map((group) => {
        const groupSubs = subcategories.filter((s) => s.category === group.key);

        return (
          <section
            key={group.key}
            className="bg-surface border border-border rounded-xl p-5 shadow-[0_1px_3px_rgba(23,27,35,0.045)]"
          >
            <h2 className="text-base font-bold text-ink mb-4">{group.label}</h2>

            {groupSubs.length === 0 && (
              <p className="text-sm text-ink-soft mb-4">아직 세부 카테고리가 없어요</p>
            )}

            <div className="flex flex-col mb-4">
              {groupSubs.map((sub, i) => (
                <div
                  key={sub.id}
                  className={`flex items-center justify-between gap-3 py-2.5 ${
                    i !== groupSubs.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm text-ink truncate">{sub.name}</span>
                    <span className="text-xs font-mono text-ink-soft shrink-0">
                      사용 중 {counts[sub.id] || 0}개 글
                    </span>
                  </div>

                  <button
                    onClick={() => setDeleteTarget(sub)}
                    className="px-2.5 py-1.5 rounded-md bg-red-500 text-white text-xs cursor-pointer hover:bg-red-600 shrink-0"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={newNames[group.key]}
                onChange={(e) => setNewNames((prev) => ({ ...prev, [group.key]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addSubcategory(group.key);
                }}
                placeholder="새 세부 카테고리 이름"
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
              <button
                onClick={() => addSubcategory(group.key)}
                disabled={adding === group.key || !newNames[group.key].trim()}
                className="px-3 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:bg-border disabled:text-ink-soft cursor-pointer disabled:cursor-not-allowed"
              >
                추가
              </button>
            </div>
          </section>
        );
      })}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[380px] bg-surface rounded-xl border border-border shadow-[0_1px_3px_rgba(23,27,35,0.045)] p-6">
            <div className="flex items-center gap-2 text-red-500 mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <h2 className="text-base font-bold">"{deleteTarget.name}" 삭제할까요?</h2>
            </div>

            <p className="text-sm text-ink-soft mb-6">
              이 카테고리는 <strong className="text-ink">{counts[deleteTarget.id] || 0}개 글</strong>에서 사용 중이에요.
              삭제하면 해당 글들의 분류가 사라져요.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg border border-border bg-surface text-sm font-medium text-ink cursor-pointer hover:bg-black/[0.03] disabled:opacity-60"
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium cursor-pointer hover:bg-red-600 disabled:opacity-60"
              >
                {deleting ? "삭제 중..." : "삭제하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
