// AI 상단 레이아웃: 텍스트/이미지 위치가 엇갈리는 블록 2개.
import Link from "next/link";
import { CATEGORY_LABELS } from "@/app/lib/insightsCategories";
import { buildArticleSlug } from "@/app/lib/articleSlug";
import type { HomeArticle } from "@/app/components/home/types";
import ArticleArtwork from "./ArticleArtwork";
import { excerpt } from "./excerpt";

function StaggerBlock({ article, textFirst }: { article: HomeArticle; textFirst: boolean }) {
  return (
    <Link
      href={`/insights/${buildArticleSlug(article.id, article.title)}`}
      className={`group flex flex-col items-center gap-6 border-b border-border py-10 last:border-b-0 lg:flex-row lg:gap-12 ${
        textFirst ? "lg:flex-row-reverse" : ""
      }`}
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-[#eceae5] lg:w-1/2">
        <ArticleArtwork article={article} large />
      </div>
      <div className="w-full lg:w-1/2">
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-ink-soft">
          {CATEGORY_LABELS[article.category]}
        </p>
        <h2 className="mt-2 text-2xl font-bold leading-[1.25] tracking-[-0.02em] text-ink transition-colors group-hover:text-accent lg:text-[28px]">
          {article.title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-ink-soft line-clamp-3">{excerpt(article.content, 150)}</p>
      </div>
    </Link>
  );
}

export default function CategoryHeroStagger({ articles }: { articles: HomeArticle[] }) {
  const [first, second] = articles;
  if (!first) return null;

  return (
    <section className="border-b border-border">
      <StaggerBlock article={first} textFirst />
      {second && <StaggerBlock article={second} textFirst={false} />}
    </section>
  );
}
