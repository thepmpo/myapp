"use client";

import Link from "next/link";
import { CATEGORY_LABELS } from "@/app/lib/insightsCategories";
import { useCategoryArticles } from "./useCategoryArticles";
import { AI_FALLBACK_ARTICLES } from "./categoryFallbackArticles";
import CategoryHeroStagger from "./CategoryHeroStagger";
import CategoryCardRow from "./CategoryCardRow";
import CategoryCirclePreview from "./CategoryCirclePreview";

export default function AiLandingPage() {
  const { articles, isAdmin } = useCategoryArticles("ai");
  const displayArticles = articles.length > 0 ? articles : AI_FALLBACK_ARTICLES;

  return (
    <div className="max-w-[1320px] mx-auto px-5 sm:px-8 xl:pl-24">
      <div className="flex items-center justify-between pt-[66px] mb-2">
        <h1 className="text-2xl font-bold text-ink">{CATEGORY_LABELS.ai}</h1>

        {isAdmin && (
          <Link
            href="/admin/insights/new"
            className="px-3 py-1.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover"
          >
            + 새 글 작성
          </Link>
        )}
      </div>

      <CategoryHeroStagger articles={displayArticles.slice(0, 2)} />
      <CategoryCardRow articles={displayArticles.slice(2, 6)} />
      <CategoryCirclePreview />
    </div>
  );
}
