import Link from "next/link";
import { CATEGORY_LABELS } from "@/app/lib/insightsCategories";
import type { HomeArticle, HomePost } from "@/app/components/home/types";

type FeaturedStoryProps = {
  article?: HomeArticle;
  post?: HomePost;
  authorName?: string;
};

export default function FeaturedStory({ article, post, authorName }: FeaturedStoryProps) {
  const story = article ?? post;

  if (!story) {
    return (
      <section className="py-12 md:py-16 border-b border-border">
        <p className="text-sm text-ink-soft">아직 소개할 콘텐츠가 없어요.</p>
      </section>
    );
  }

  const isArticle = Boolean(article);
  const href = isArticle ? `/insights/${story.id}` : `/post/${story.id}`;
  const label = article ? `Insights · ${CATEGORY_LABELS[article.category]}` : "Circle";
  const imageUrl = story.image_url;
  const description = story.content?.trim();
  const date = article
    ? new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(
        new Date(article.created_at)
      )
    : null;

  return (
    <section className="grid lg:grid-cols-[minmax(0,1fr)_430px] gap-8 lg:gap-14 items-center py-11 md:py-16 border-b border-border">
      <div className="min-w-0">
        <p className="text-xs font-bold tracking-[0.08em] uppercase text-accent mb-4">오늘의 PM·PO 이야기</p>
        <Link href={href} className="group block">
          <h1 className="max-w-[720px] text-[38px] leading-[1.08] md:text-[54px] md:leading-[1.04] font-serif font-bold tracking-[-0.035em] text-ink group-hover:text-accent transition-colors line-clamp-3">
            {story.title}
          </h1>

          {description && (
            <p className="mt-5 max-w-[650px] text-base md:text-lg leading-7 text-ink-soft line-clamp-3">
              {description}
            </p>
          )}
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-soft">
          <span className="font-medium text-ink">{authorName ?? story.author}</span>
          <span aria-hidden="true">·</span>
          <span>{label}</span>
          {date && (
            <>
              <span aria-hidden="true">·</span>
              <time dateTime={article?.created_at}>{date}</time>
            </>
          )}
        </div>
      </div>

      <Link
        href={href}
        className="hidden lg:block aspect-[4/3] overflow-hidden bg-[#ece8e2]"
        aria-label={`${story.title} 읽기`}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]" />
        ) : (
          <span className="relative flex w-full h-full items-center justify-center overflow-hidden" aria-hidden="true">
            <span className="absolute -right-10 -top-12 w-52 h-52 rounded-full bg-accent/15" />
            <span className="absolute -left-10 -bottom-16 w-60 h-60 rounded-full border-[28px] border-question/20" />
            <span className="relative font-serif text-8xl font-bold text-ink/80">P</span>
          </span>
        )}
      </Link>
    </section>
  );
}
