"use client";

// 상단 카드(히어로+카드로우)에 이미 노출 중인 글을 뺀 "일반 글 목록".
// 처음엔 7개만 보여주고, 스크롤이 하단에 닿으면 3개씩 더 불러온다(전부 클라이언트 사이드 슬라이스 —
// useCategoryArticles가 이미 카테고리 전체를 한 번에 fetch해오기 때문에 별도 서버 페이지네이션 불필요).
// 카드 시각 스타일은 Circle 게시글 카드(CirclePostCard)와 비슷한 느낌으로 맞췄지만,
// 데이터는 이 컴포넌트에 props로 넘어온 카테고리 아티클뿐 — Circle(posts) 데이터는 전혀 조회하지 않음.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { HomeArticle } from "@/app/components/home/types";
import { LikeIcon } from "@/app/components/icons";
import { buildArticleSlug } from "@/app/lib/articleSlug";

const INITIAL_COUNT = 7;
const LOAD_MORE_COUNT = 3;

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric" }).format(date);
}

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
        {visibleArticles.map((article) => {
          const authorName = nicknames[article.author_id] ?? article.author;
          const formattedDate = formatDate(article.created_at);

          return (
            <Link
              key={article.id}
              href={`/insights/${buildArticleSlug(article.id, article.title)}`}
              className="block py-6 border-b border-border last:border-b-0 border-l-2 border-l-transparent pl-4 -ml-4 transition-colors hover:border-l-accent"
            >
              <div className="mb-2 flex items-center gap-2 text-xs text-ink-soft">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-border text-[10px] font-bold text-ink">
                  {authorName.slice(0, 1).toUpperCase()}
                </span>
                <span className="max-w-40 truncate font-medium text-ink">{authorName}</span>
                {formattedDate && (
                  <>
                    <span aria-hidden="true">·</span>
                    <time>{formattedDate}</time>
                  </>
                )}
              </div>

              <h3 className="text-base font-bold leading-snug text-ink">{article.title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft line-clamp-2">{article.content}</p>

              <div className="mt-3 flex items-center gap-4 text-xs text-ink-soft">
                <span className="flex items-center gap-1" aria-label={`좋아요 ${likeCounts[article.id] || 0}개`}>
                  <LikeIcon />
                  {likeCounts[article.id] || 0}
                </span>
                <span className="flex items-center gap-1" aria-label={`댓글 ${commentCounts[article.id] || 0}개`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
                  </svg>
                  {commentCounts[article.id] || 0}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {visibleCount < articles.length && <div ref={sentinelRef} className="h-1" />}
    </section>
  );
}
