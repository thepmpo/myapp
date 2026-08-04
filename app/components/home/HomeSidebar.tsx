// Circle의 실제 게시글만 사용하는 오른쪽 사이드바입니다.
"use client";

import { useState } from "react";
import Link from "next/link";
import { INSIGHTS_CATEGORIES } from "@/app/lib/insightsCategories";
import type { HomePost } from "@/app/components/home/types";
import LoginPromptModal from "@/app/components/LoginPromptModal";

type HomeSidebarProps = {
  posts: HomePost[];
  commentCounts: Record<number, number>;
  reactionCounts: Record<number, number>;
  nicknames: Record<string, string>;
  isLoggedIn: boolean;
};

export default function HomeSidebar({ posts, commentCounts, reactionCounts, nicknames, isLoggedIn }: HomeSidebarProps) {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handlePostClick = (event: React.MouseEvent) => {
    if (!isLoggedIn) {
      event.preventDefault();
      setShowLoginPrompt(true);
    }
  };

  const popularPosts = [...posts]
    .sort((a, b) => {
      const scoreA = (commentCounts[a.id] || 0) * 2 + (reactionCounts[a.id] || 0);
      const scoreB = (commentCounts[b.id] || 0) * 2 + (reactionCounts[b.id] || 0);
      return scoreB - scoreA || b.id - a.id;
    })
    .slice(0, 4);

  return (
    <aside className="hidden w-[360px] shrink-0 xl:block">
      <div className="sticky top-[76px] py-9 pr-8">
        <section className="grid grid-cols-[max-content] pb-8" aria-labelledby="circle-question-title">
          <h2 id="circle-question-title" className="whitespace-nowrap text-[15px] font-bold text-ink">
            함께 풀고 싶은 고민이 있나요?
          </h2>
          <Link
            href="/circle/new"
            className="mt-4 flex items-center justify-center rounded-md border border-ink px-4 py-2 text-xs font-medium text-ink hover:bg-ink hover:text-white"
          >
            질문 작성하기
          </Link>
        </section>

        <section className="border-t border-[#f1efed] pt-8" aria-labelledby="popular-circle-title">
          <h2 id="popular-circle-title" className="mb-5 text-[15px] font-bold text-ink">
            지금 많이 이야기하는 글
          </h2>
          {popularPosts.length > 0 ? (
            <ol className="space-y-5">
              {popularPosts.map((post) => (
                <li key={post.id}>
                  <p className="mb-1.5 truncate text-xs text-ink-soft">{nicknames[post.user_id] ?? post.author}</p>
                  <Link
                    href={"/post/" + post.id}
                    onClick={handlePostClick}
                    className="line-clamp-2 block text-sm font-bold leading-5 text-ink hover:text-accent"
                  >
                    {post.title}
                  </Link>
                  <p className="mt-1.5 text-xs text-ink-soft">
                    댓글 {commentCounts[post.id] || 0} · 반응 {reactionCounts[post.id] || 0}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-ink-soft">아직 소개할 글이 없어요.</p>
          )}
        </section>

        <section className="mt-9 border-t border-[#f1efed] pt-8" aria-labelledby="recommended-topics-title">
          <h2 id="recommended-topics-title" className="mb-4 text-[15px] font-bold text-ink">
            추천 주제
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/" className="rounded-full border border-[#f1efed] px-3.5 py-2 text-xs text-ink hover:border-ink">
              Circle
            </Link>
            {INSIGHTS_CATEGORIES.map((category) => (
              <Link
                key={category.key}
                href={category.href}
                className="rounded-full border border-[#f1efed] px-3.5 py-2 text-xs text-ink hover:border-ink"
              >
                {category.label}
              </Link>
            ))}
          </div>
        </section>
      </div>

      {showLoginPrompt && <LoginPromptModal onClose={() => setShowLoginPrompt(false)} />}
    </aside>
  );
}
