import type { HomeArticle } from "@/app/components/home/types";

const TONE_BY_CATEGORY: Record<HomeArticle["category"], string> = {
  product: "from-[#b7442d] via-[#e9aa6a] to-[#f1ddd0]",
  trend: "from-[#244d61] via-[#74a2a1] to-[#d9e2d9]",
  ai: "from-[#4a355f] via-[#9a6f9f] to-[#e6d5df]",
};

export default function ArticleArtwork({ article, large = false }: { article: HomeArticle; large?: boolean }) {
  if (article.image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={article.image_url}
        alt=""
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      />
    );
  }

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-gradient-to-br ${TONE_BY_CATEGORY[article.category]}`}
      aria-hidden="true"
    >
      <div className="absolute -right-[12%] -top-[18%] h-[65%] w-[65%] rounded-full border border-white/50 bg-white/10" />
      <div className="absolute bottom-[9%] left-[9%] h-[34%] w-[44%] border border-white/55 bg-black/10 backdrop-blur-[1px]" />
      <span
        className={`absolute bottom-[10%] right-[9%] font-serif font-bold tracking-[-0.06em] text-white/90 ${large ? "text-5xl md:text-6xl" : "text-3xl"}`}
      >
        P
      </span>
    </div>
  );
}
