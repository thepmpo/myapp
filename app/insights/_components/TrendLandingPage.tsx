"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORY_LABELS } from "@/app/lib/insightsCategories";
import { useCategoryArticles } from "./useCategoryArticles";
import { useSubcategories } from "./useSubcategories";
import { TREND_FALLBACK_ARTICLES } from "./categoryFallbackArticles";
import CategoryHeroSplit from "./CategoryHeroSplit";
import CategoryCardRow from "./CategoryCardRow";
import CategoryCirclePreview from "./CategoryCirclePreview";

export default function TrendLandingPage() {
  const { articles, isAdmin } = useCategoryArticles("trend");
  const { subcategories } = useSubcategories("trend");
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);

  const isFiltering = selectedSubcategory !== null;
  const filteredArticles = isFiltering
    ? articles.filter((a) => a.subcategory_id === selectedSubcategory)
    : articles;

  // 세부 카테고리로 필터링 중일 땐 결과가 0건이어도 더미 콘텐츠로 채우지 않음
  // (실제로 글이 있는 것처럼 보이면 안 되니까) — 그 카테고리엔 없다는 안내만 보여줌.
  const displayArticles = isFiltering ? filteredArticles : articles.length > 0 ? articles : TREND_FALLBACK_ARTICLES;
  const showEmptyFilterMessage = isFiltering && filteredArticles.length === 0;

  return (
    <div className="max-w-[1320px] mx-auto px-5 sm:px-8 xl:pl-24">
      <div className="flex items-center justify-between pt-[66px] mb-2">
        <h1 className="text-2xl font-bold text-ink">{CATEGORY_LABELS.trend}</h1>

        {isAdmin && (
          <Link
            href="/admin/insights/new"
            className="px-3 py-1.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover"
          >
            + 새 글 작성
          </Link>
        )}
      </div>

      {subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={() => setSelectedSubcategory(null)}
            className={`px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-colors ${
              !isFiltering ? "border-accent bg-accent text-white" : "border-border bg-surface text-ink-soft hover:bg-black/[0.03]"
            }`}
          >
            전체
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => setSelectedSubcategory(sub.id)}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-colors ${
                selectedSubcategory === sub.id
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-surface text-ink-soft hover:bg-black/[0.03]"
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {showEmptyFilterMessage ? (
        <p className="py-16 text-center text-sm text-ink-soft">이 세부 카테고리엔 아직 글이 없어요.</p>
      ) : (
        <>
          <CategoryHeroSplit articles={displayArticles.slice(0, 3)} />
          <CategoryCardRow articles={displayArticles.slice(3, 7)} />
        </>
      )}

      <CategoryCirclePreview />
    </div>
  );
}
