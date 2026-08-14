"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORY_LABELS } from "@/app/lib/insightsCategories";
import { useCategoryArticles } from "./useCategoryArticles";
import { useSubcategories } from "./useSubcategories";
import { AI_FALLBACK_ARTICLES } from "./categoryFallbackArticles";
import CategoryHeroStagger from "./CategoryHeroStagger";
import CategoryCardRow from "./CategoryCardRow";
import CategoryArticleList from "./CategoryArticleList";
import CategoryCirclePreview from "./CategoryCirclePreview";

const TOP_SLOT_COUNT = 6; // 히어로 2 + 카드로우 4

export default function AiLandingPage() {
  const { articles, nicknames, commentCounts, likeCounts, isAdmin } = useCategoryArticles("ai");
  const { subcategories } = useSubcategories("ai");
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);

  const isFiltering = selectedSubcategory !== null;
  const filteredArticles = isFiltering
    ? articles.filter((a) => a.subcategory_id === selectedSubcategory)
    : articles;

  // 세부 카테고리로 필터링 중일 땐 결과가 0건이어도 더미 콘텐츠로 채우지 않음
  // (실제로 글이 있는 것처럼 보이면 안 되니까) — 그 카테고리엔 없다는 안내만 보여줌.
  const displayArticles = isFiltering ? filteredArticles : articles.length > 0 ? articles : AI_FALLBACK_ARTICLES;
  const showEmptyFilterMessage = isFiltering && filteredArticles.length === 0;

  // 상단 히어로+카드로우에 이미 노출 중인 글(더미 fallback 포함 가능)은 목록에서 제외.
  // displayArticles가 fallback일 땐 topIds가 fallback 글 id라 실제 articles와 안 겹쳐서
  // 아래 계산 결과가 자연히 빈 배열이 되고(실제 글이 없으니 목록도 없음), 별도 분기가 필요 없음.
  const topIds = new Set(displayArticles.slice(0, TOP_SLOT_COUNT).map((a) => a.id));
  const restArticles = (isFiltering ? filteredArticles : articles).filter((a) => !topIds.has(a.id));

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

      {subcategories.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <button
            type="button"
            onClick={() => setSelectedSubcategory(null)}
            className={`text-xs font-medium cursor-pointer underline-offset-4 ${
              !isFiltering ? "text-accent underline" : "text-ink-soft hover:text-ink"
            }`}
          >
            전체
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => setSelectedSubcategory(sub.id)}
              className={`text-xs font-medium cursor-pointer underline-offset-4 ${
                selectedSubcategory === sub.id ? "text-accent underline" : "text-ink-soft hover:text-ink"
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
          <CategoryHeroStagger articles={displayArticles.slice(0, 2)} />
          <CategoryCardRow articles={displayArticles.slice(2, 6)} />
          <CategoryArticleList
            articles={restArticles}
            nicknames={nicknames}
            commentCounts={commentCounts}
            likeCounts={likeCounts}
          />
        </>
      )}

      <CategoryCirclePreview />
    </div>
  );
}
