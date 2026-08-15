"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

type CategoryRow = { id: number; name: string };
type SubcategoryRow = { id: number; name: string; category_id: number };

type DeleteTarget =
  | { kind: "category"; id: number; name: string }
  | { kind: "subcategory"; id: number; name: string };

export default function AdminProductCategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryRow[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<number, number>>({});
  const [subcategoryCounts, setSubcategoryCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [newSubNames, setNewSubNames] = useState<Record<number, string>>({});
  const [addingSubFor, setAddingSubFor] = useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);

    const [{ data: cats }, { data: subs }, { data: products }] = await Promise.all([
      supabase.from("product_categories").select("id, name").order("name"),
      supabase.from("product_subcategories").select("id, name, category_id").order("name"),
      supabase.from("products").select("category_id, subcategory_id"),
    ]);

    setCategories((cats as CategoryRow[]) || []);
    setSubcategories((subs as SubcategoryRow[]) || []);

    const catCounts: Record<number, number> = {};
    const subCounts: Record<number, number> = {};
    (products || []).forEach((p: { category_id: number | null; subcategory_id: number | null }) => {
      if (p.category_id != null) catCounts[p.category_id] = (catCounts[p.category_id] || 0) + 1;
      if (p.subcategory_id != null) subCounts[p.subcategory_id] = (subCounts[p.subcategory_id] || 0) + 1;
    });
    setCategoryCounts(catCounts);
    setSubcategoryCounts(subCounts);

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const addCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;

    setAddingCategory(true);
    setError("");

    const { error: insertError } = await supabase.from("product_categories").insert([{ name }]);

    setAddingCategory(false);

    if (insertError) {
      setError(insertError.code === "23505" ? "이미 있는 카테고리 이름이에요" : insertError.message);
      return;
    }

    setNewCategoryName("");
    await load();
  };

  const addSubcategory = async (categoryId: number) => {
    const name = (newSubNames[categoryId] || "").trim();
    if (!name) return;

    setAddingSubFor(categoryId);
    setError("");

    const { error: insertError } = await supabase
      .from("product_subcategories")
      .insert([{ category_id: categoryId, name }]);

    setAddingSubFor(null);

    if (insertError) {
      setError(insertError.code === "23505" ? "이미 있는 세부 카테고리 이름이에요" : insertError.message);
      return;
    }

    setNewSubNames((prev) => ({ ...prev, [categoryId]: "" }));
    await load();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    const table = deleteTarget.kind === "category" ? "product_categories" : "product_subcategories";
    const { error: deleteError } = await supabase.from(table).delete().eq("id", deleteTarget.id);
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

      <section className="bg-surface border border-border rounded-xl p-5 shadow-[0_1px_3px_rgba(23,27,35,0.045)]">
        <h2 className="text-base font-bold text-ink mb-4">Product 카테고리 관리</h2>

        {categories.length === 0 && <p className="text-sm text-ink-soft mb-4">아직 카테고리가 없어요</p>}

        <div className="flex flex-col gap-5 mb-5">
          {categories.map((cat) => {
            const catSubs = subcategories.filter((s) => s.category_id === cat.id);

            return (
              <div key={cat.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-bold text-ink truncate">{cat.name}</span>
                    <span className="text-xs font-mono text-ink-soft shrink-0">
                      사용 중 {categoryCounts[cat.id] || 0}개 상품
                    </span>
                  </div>
                  <button
                    onClick={() => setDeleteTarget({ kind: "category", id: cat.id, name: cat.name })}
                    className="px-2.5 py-1.5 rounded-md bg-red-500 text-white text-xs cursor-pointer hover:bg-red-600 shrink-0"
                  >
                    삭제
                  </button>
                </div>

                {catSubs.length > 0 && (
                  <div className="flex flex-col mb-3 pl-3 border-l-2 border-border">
                    {catSubs.map((sub, i) => (
                      <div
                        key={sub.id}
                        className={`flex items-center justify-between gap-3 py-2 ${
                          i !== catSubs.length - 1 ? "border-b border-border" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm text-ink truncate">{sub.name}</span>
                          <span className="text-xs font-mono text-ink-soft shrink-0">
                            사용 중 {subcategoryCounts[sub.id] || 0}개 상품
                          </span>
                        </div>
                        <button
                          onClick={() => setDeleteTarget({ kind: "subcategory", id: sub.id, name: sub.name })}
                          className="px-2.5 py-1.5 rounded-md bg-red-500 text-white text-xs cursor-pointer hover:bg-red-600 shrink-0"
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pl-3">
                  <input
                    value={newSubNames[cat.id] || ""}
                    onChange={(e) => setNewSubNames((prev) => ({ ...prev, [cat.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addSubcategory(cat.id);
                    }}
                    placeholder="새 세부 카테고리 이름"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                  <button
                    onClick={() => addSubcategory(cat.id)}
                    disabled={addingSubFor === cat.id || !(newSubNames[cat.id] || "").trim()}
                    className="px-3 py-1.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:bg-border disabled:text-ink-soft cursor-pointer disabled:cursor-not-allowed"
                  >
                    추가
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addCategory();
            }}
            placeholder="새 메인 카테고리 이름"
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <button
            onClick={addCategory}
            disabled={addingCategory || !newCategoryName.trim()}
            className="px-3 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:bg-border disabled:text-ink-soft cursor-pointer disabled:cursor-not-allowed"
          >
            메인 카테고리 추가
          </button>
        </div>
      </section>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[380px] bg-surface rounded-xl border border-border shadow-[0_1px_3px_rgba(23,27,35,0.045)] p-6">
            <div className="flex items-center gap-2 text-red-500 mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <h2 className="text-base font-bold">&quot;{deleteTarget.name}&quot; 삭제할까요?</h2>
            </div>

            <p className="text-sm text-ink-soft mb-6">
              이 카테고리는{" "}
              <strong className="text-ink">
                {(deleteTarget.kind === "category" ? categoryCounts[deleteTarget.id] : subcategoryCounts[deleteTarget.id]) || 0}
                개 상품
              </strong>
              에서 사용 중이에요.
              {deleteTarget.kind === "category" && (
                <>
                  {" "}
                  하위 세부 카테고리{" "}
                  <strong className="text-ink">
                    {subcategories.filter((s) => s.category_id === deleteTarget.id).length}개
                  </strong>
                  도 함께 삭제됩니다.
                </>
              )}{" "}
              삭제하면 해당 상품들의 분류가 사라져요.
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
