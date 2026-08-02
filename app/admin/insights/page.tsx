"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { ArticleCategory, CATEGORY_LABELS } from "@/app/lib/insightsCategories";

type Article = {
  id: number;
  title: string;
  category: ArticleCategory;
  created_at: string;
};

export default function AdminInsightsPage() {
  const [articles, setArticles] = useState<Article[]>([]);

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("id, title, category, created_at")
      .order("id", { ascending: false });

    if (!error) setArticles((data as Article[]) || []);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const deleteArticle = async (id: number) => {
    if (!confirm("이 글을 삭제하시겠습니까?")) return;

    const { error } = await supabase.from("articles").delete().eq("id", id);

    if (error) {
      alert(error.message);
    } else {
      await fetchArticles();
    }
  };

  return (
    <section className="bg-surface border border-border rounded-xl p-5 shadow-[0_1px_3px_rgba(23,27,35,0.045)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-ink">Insights 글 ({articles.length})</h2>
        <Link
          href="/admin/insights/new"
          className="px-3 py-1.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover"
        >
          + 새 글 작성
        </Link>
      </div>

      {articles.length === 0 && <p className="text-sm text-ink-soft">등록된 글이 없습니다</p>}

      <div className="flex flex-col">
        {articles.map((a, i) => (
          <div
            key={a.id}
            className={`flex items-center justify-between gap-3 py-3 ${
              i !== articles.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div className="min-w-0">
              <div className="text-xs font-mono text-ink-soft">{CATEGORY_LABELS[a.category]}</div>
              <div className="text-sm text-ink truncate">{a.title}</div>
            </div>

            <div className="flex gap-2 shrink-0">
              <Link
                href={`/admin/insights/${a.id}/edit`}
                className="px-2.5 py-1.5 rounded-md border border-border bg-surface text-ink-soft text-xs cursor-pointer hover:bg-black/[0.03]"
              >
                수정
              </Link>
              <button
                onClick={() => deleteArticle(a.id)}
                className="px-2.5 py-1.5 rounded-md bg-red-500 text-white text-xs cursor-pointer hover:bg-red-600"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
