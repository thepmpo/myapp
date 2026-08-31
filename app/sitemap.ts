import type { MetadataRoute } from "next";
import { supabase } from "@/app/lib/supabase";
import { buildArticleSlug } from "@/app/lib/articleSlug";

const BASE_URL = "https://thepmpo.com";

// Circle 개별 게시글은 로그인해야 볼 수 있어 sitemap에서 제외(IA상 로그인 필요 페이지는
// 검색엔진 노출 대상이 아님). articles 테이블엔 비공개 상태 컬럼이 없어(Insights는 전체
// 공개 정책) 전체 아티클을 그대로 포함하면 됨.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/circle`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${BASE_URL}/insights/product`, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/insights/trend`, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/insights/ai`, changeFrequency: "daily", priority: 0.7 },
  ];

  const { data: articles } = await supabase.from("articles").select("id, title, created_at");

  const articleRoutes: MetadataRoute.Sitemap = (articles ?? []).map((article) => ({
    url: `${BASE_URL}/insights/${encodeURI(buildArticleSlug(article.id, article.title))}`,
    lastModified: article.created_at ? new Date(article.created_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...articleRoutes];
}
