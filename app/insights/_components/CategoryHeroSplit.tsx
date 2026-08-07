// Trends 상단 레이아웃: 큰 카드 1개 + 작은 카드 2개(세로).
import Link from "next/link";
import { CATEGORY_LABELS } from "@/app/lib/insightsCategories";
import type { HomeArticle } from "@/app/components/home/types";
import ArticleArtwork from "./ArticleArtwork";
import { excerpt } from "./excerpt";

function BigCard({ article }: { article: HomeArticle }) {
  return (
    <Link href={`/insights/${article.id}`} className="group block">
      <div className="aspect-[16/10] overflow-hidden bg-[#eceae5]">
        <ArticleArtwork article={article} large />
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.1em] text-ink-soft">
        {CATEGORY_LABELS[article.category]}
      </p>
      <h2 className="mt-2 text-[26px] leading-[1.2] font-bold tracking-[-0.02em] text-ink transition-colors group-hover:text-accent sm:text-[28px]">
        {article.title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-ink-soft line-clamp-3">{excerpt(article.content, 140)}</p>
    </Link>
  );
}

function SmallCard({ article }: { article: HomeArticle }) {
  return (
    <Link href={`/insights/${article.id}`} className="group flex items-start gap-4">
      <div className="h-24 w-24 shrink-0 overflow-hidden bg-[#eceae5]">
        <ArticleArtwork article={article} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-soft">
          {CATEGORY_LABELS[article.category]}
        </p>
        <h3 className="mt-1 line-clamp-2 text-base font-bold leading-snug text-ink transition-colors group-hover:text-accent">
          {article.title}
        </h3>
      </div>
    </Link>
  );
}

function EmptySmallCard() {
  return (
    <div className="flex items-start gap-4 opacity-50">
      <div className="h-24 w-24 shrink-0 bg-[#eceae5]" />
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-soft">준비 중</p>
        <h3 className="mt-1 text-base font-bold leading-snug text-ink-soft">곧 새로운 글로 채워질 자리예요</h3>
      </div>
    </div>
  );
}

export default function CategoryHeroSplit({ articles }: { articles: HomeArticle[] }) {
  const [big, small1, small2] = articles;
  if (!big) return null;

  return (
    <section className="grid gap-8 border-b border-border py-8 lg:grid-cols-[1fr_360px] lg:gap-10">
      <BigCard article={big} />
      <div className="flex flex-col gap-6 lg:gap-8">
        {small1 ? <SmallCard article={small1} /> : <EmptySmallCard />}
        {small2 ? <SmallCard article={small2} /> : <EmptySmallCard />}
      </div>
    </section>
  );
}
