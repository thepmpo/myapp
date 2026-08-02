export type ArticleCategory = "product" | "trend" | "ai";

export const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  product: "Product",
  trend: "Trends",
  ai: "AI",
};

export const INSIGHTS_CATEGORIES: { key: ArticleCategory; label: string; href: string }[] = [
  { key: "product", label: "Product", href: "/insights/product" },
  { key: "trend", label: "Trends", href: "/insights/trend" },
  { key: "ai", label: "AI", href: "/insights/ai" },
];
