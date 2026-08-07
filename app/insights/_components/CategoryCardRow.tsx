// Trends/AI 공용: 균일한 크기의 카드 4개를 한 줄로 나열.
import Link from "next/link";
import { CATEGORY_LABELS } from "@/app/lib/insightsCategories";
import type { HomeArticle } from "@/app/components/home/types";
import ArticleArtwork from "./ArticleArtwork";
import { excerpt } from "./excerpt";

function UniformCard({ article }: { article: HomeArticle }) {
  return (
    <Link href={`/insights/${article.id}`} className="group block">
      <div className="aspect-[4/3] overflow-hidden bg-[#eceae5]">
        <ArticleArtwork article={article} />
      </div>
      <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-soft">
        {CATEGORY_LABELS[article.category]}
      </p>
      <h3 className="mt-1.5 line-clamp-2 text-[15px] font-bold leading-snug text-ink transition-colors group-hover:text-accent">
        {article.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-ink-soft">{excerpt(article.content, 70)}</p>
    </Link>
  );
}

function EmptyCard() {
  return (
    <div className="opacity-50">
      <div className="aspect-[4/3] bg-[#eceae5]" />
      <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-soft">준비 중</p>
      <h3 className="mt-1.5 text-[15px] font-bold leading-snug text-ink-soft">곧 새로운 글로 채워질 자리예요</h3>
    </div>
  );
}

export default function CategoryCardRow({ articles }: { articles: HomeArticle[] }) {
  const slots = Array.from({ length: 4 }, (_, index) => articles[index]);

  return (
    <section className="grid grid-cols-2 gap-x-6 gap-y-8 border-b border-border py-10 lg:grid-cols-4">
      {slots.map((article, index) =>
        article ? <UniformCard key={article.id} article={article} /> : <EmptyCard key={`empty-${index}`} />
      )}
    </section>
  );
}
