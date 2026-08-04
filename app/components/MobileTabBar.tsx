"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { CircleIcon, InsightsIcon, ProfileIcon } from "@/app/components/icons";
import { INSIGHTS_CATEGORIES } from "@/app/lib/insightsCategories";

export default function MobileTabBar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [isInsightsMenuOpen, setIsInsightsMenuOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) setCurrentUser({ id: data.user.id });
    };

    load();
  }, []);

  useEffect(() => {
    setIsInsightsMenuOpen(false);
  }, [pathname]);

  const isCircle = pathname === "/" || pathname.startsWith("/post");
  const isInsights = pathname.startsWith("/insights");
  const isProfile = pathname.startsWith("/profile");

  const tabClass = (active: boolean) =>
    `flex flex-col items-center justify-center gap-1 flex-1 py-2 text-xs font-medium cursor-pointer ${
      active ? "text-accent" : "text-ink-soft"
    }`;

  return (
    <>
      {isInsightsMenuOpen && (
        <button
          type="button"
          aria-label="메뉴 닫기"
          onClick={() => setIsInsightsMenuOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/25"
        />
      )}

      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch bg-surface border-t border-border"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {isInsightsMenuOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-full px-4">
            <div className="mx-auto flex max-w-[280px] flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-[0_4px_16px_rgba(23,27,35,0.12)]">
              {INSIGHTS_CATEGORIES.map((cat) => (
                <Link
                  key={cat.key}
                  href={cat.href}
                  onClick={() => setIsInsightsMenuOpen(false)}
                  className={`px-4 py-3 text-sm border-b border-border last:border-b-0 ${
                    pathname === cat.href ? "font-bold text-accent" : "text-ink hover:bg-black/[0.03]"
                  }`}
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        <button type="button" onClick={() => setIsInsightsMenuOpen((open) => !open)} className={tabClass(isInsights)}>
          <InsightsIcon />
          Insights
        </button>

        <Link href="/" className={tabClass(isCircle)}>
          <CircleIcon />
          Circle
        </Link>

        <Link href={currentUser ? `/profile/${currentUser.id}` : "/login"} className={tabClass(isProfile)}>
          <ProfileIcon />
          마이페이지
        </Link>
      </nav>
    </>
  );
}
