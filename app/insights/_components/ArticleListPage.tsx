"use client";

import Link from "next/link";
import { ArticleCategory, CATEGORY_LABELS } from "@/app/lib/insightsCategories";
import { useCategoryArticles } from "./useCategoryArticles";
import { LikeIcon } from "@/app/components/icons";

export default function ArticleListPage({ category }: { category: ArticleCategory }) {
  const { articles, nicknames, commentCounts, likeCounts, isAdmin } = useCategoryArticles(category);

  return (
    <div className="max-w-[1320px] mx-auto px-5 sm:px-8 xl:pl-24">
      <div className="flex items-center justify-between pt-[66px] mb-5">
        <h1 className="text-2xl font-bold text-ink">{CATEGORY_LABELS[category]}</h1>

        {isAdmin && (
          <Link
            href="/admin/insights/new"
            className="px-3 py-1.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover"
          >
            + 새 글 작성
          </Link>
        )}
      </div>

      <div className="lg:hidden border-b border-border mb-5" />

      {articles.length === 0 && <p className="text-sm text-ink-soft">아직 등록된 글이 없어요</p>}

      <div className="flex flex-col">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/insights/${article.id}`}
            className="block py-6 border-b border-border last:border-b-0 border-l-2 border-l-transparent pl-4 -ml-4 transition-colors hover:border-l-accent"
          >
            <span className="inline-block mb-2 text-xs font-bold text-ink-soft">
              {CATEGORY_LABELS[article.category]}
            </span>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-bold text-base text-ink">{article.title}</div>

                <p className="mt-1.5 text-sm text-ink-soft line-clamp-2">{article.content}</p>

                <div className="mt-2.5 text-sm font-mono text-ink-soft">
                  {nicknames[article.author_id] ?? article.author}
                </div>

                <div className="mt-1 flex items-center gap-1.5 text-xs font-mono text-ink-soft">
                  <span>{new Date(article.created_at).toLocaleDateString("ko-KR")}</span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <LikeIcon className="h-3.5 w-3.5" />
                    {likeCounts[article.id] || 0}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
                    </svg>
                    {commentCounts[article.id] || 0}
                  </span>
                </div>
              </div>

              <div className="w-20 h-20 rounded-lg bg-border shrink-0 overflow-hidden">
                {article.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={article.image_url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
