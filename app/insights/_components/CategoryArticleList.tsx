"use client";

// 상단 카드(히어로+카드로우)에 이미 노출 중인 글을 뺀 "일반 글 목록".
// 처음엔 7개만 보여주고, 스크롤이 하단에 닿으면 3개씩 더 불러온다(전부 클라이언트 사이드 슬라이스 —
// useCategoryArticles가 이미 카테고리 전체를 한 번에 fetch해오기 때문에 별도 서버 페이지네이션 불필요).

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CATEGORY_LABELS } from "@/app/lib/insightsCategories";
import type { HomeArticle } from "@/app/components/home/types";

const INITIAL_COUNT = 7;
const LOAD_MORE_COUNT = 3;

export default function CategoryArticleList({
  articles,
  nicknames,
  commentCounts,
  likeCounts,
}: {
  articles: HomeArticle[];
  nicknames: Record<string, string>;
  commentCounts: Record<number, number>;
  likeCounts: Record<number, number>;
}) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, articles.length));
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [articles.length]);

  if (articles.length === 0) return null;

  const visibleArticles = articles.slice(0, visibleCount);

  return (
    <section className="border-b border-border py-10">
      <div className="flex flex-col">
        {visibleArticles.map((article) => (
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

                <div className="mt-1 text-xs font-mono text-ink-soft">
                  {new Date(article.created_at).toLocaleDateString("ko-KR")} · ❤️ {likeCounts[article.id] || 0} · 💬{" "}
                  {commentCounts[article.id] || 0}
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

      {visibleCount < articles.length && <div ref={sentinelRef} className="h-1" />}
    </section>
  );
}
