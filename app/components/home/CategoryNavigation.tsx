import Link from "next/link";

const HOME_CATEGORIES = [
  { label: "홈", href: "/", active: true },
  { label: "Circle", href: "/" },
  { label: "Product", href: "/insights/product" },
  { label: "Trends", href: "/insights/trend" },
  { label: "AI", href: "/insights/ai" },
];

export default function CategoryNavigation() {
  return (
    <div className="border-b border-border bg-paper">
      <nav
        className="max-w-[1192px] mx-auto px-6 md:px-12 xl:px-0 flex items-center gap-7 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="콘텐츠 카테고리"
      >
        {HOME_CATEGORIES.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`h-12 shrink-0 flex items-center border-b text-sm transition-colors ${
              item.active
                ? "border-ink text-ink font-medium"
                : "border-transparent text-ink-soft hover:text-ink hover:border-border"
            }`}
            aria-current={item.active ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
