import type { HomeArticle } from "@/app/components/home/types";

// Trends/AI는 컬러시스템 v1.1의 "단일 액센트 계열 유지" 원칙에 맞춰 accent(#C8464D) 톤 하나만
// 쓰고, 명도/채도만 다르게 구분함(Trends는 accent~accent-hover 그대로, AI는 더 옅은 톤에서 시작).
// 흰색 "P" 마크가 항상 우측 하단(진한 색 지점)에 오도록 두 그라디언트의 to-스톱을 동일하게 맞춰서
// 대비(흰 글자 기준 10.4:1)를 보장함 — from-스톱만 달라 전체적인 톤 차이가 드러남.
// Product는 이번 변경 범위 밖이라 그대로 유지.
const TONE_BY_CATEGORY: Record<HomeArticle["category"], string> = {
  product: "from-[#b7442d] via-[#e9aa6a] to-[#f1ddd0]",
  trend: "from-[#C8464D] via-[#A83840] to-[#6B2B30]",
  ai: "from-[#CE686D] via-[#C8464D] to-[#6B2B30]",
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
