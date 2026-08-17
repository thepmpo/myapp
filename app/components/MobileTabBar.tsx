"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { CircleIcon, InsightsIcon, ProfileIcon, ProductIcon, TrendsIcon, AiIcon } from "@/app/components/icons";
import { INSIGHTS_CATEGORIES } from "@/app/lib/insightsCategories";
import { useWorkspaceData } from "@/app/components/home/WorkspaceDataContext";

const CATEGORY_ICONS: Record<string, (props: { className?: string }) => React.ReactElement> = {
  product: ProductIcon,
  trend: TrendsIcon,
  ai: AiIcon,
};

export default function MobileTabBar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [isInsightsMenuOpen, setIsInsightsMenuOpen] = useState(false);
  const insightsLabelRef = useRef<HTMLSpanElement>(null);
  const [popupLeft, setPopupLeft] = useState(0);
  const { isAdmin, navVisibility } = useWorkspaceData();

  const visibleInsightsCategories = INSIGHTS_CATEGORIES.filter(
    (cat) => navVisibility[cat.key] === "public" || isAdmin
  );
  const showCircleTab = navVisibility.circle === "public" || isAdmin;

  useEffect(() => {
    if (isInsightsMenuOpen && insightsLabelRef.current) {
      // 드롭업 항목의 좌측 내부 여백(px-4 = 16px)만큼 빼서, 항목 글자의 왼쪽 선이
      // "Insights" 글자의 왼쪽 선과 정확히 같은 위치에 오도록 맞춥니다.
      setPopupLeft(insightsLabelRef.current.getBoundingClientRect().left - 16);
    }
  }, [isInsightsMenuOpen]);

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

  const isCircle = pathname === "/circle" || pathname.startsWith("/post");
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
        {visibleInsightsCategories.length > 0 && (
        <div className="relative flex-1">
          {isInsightsMenuOpen && (
            <div
              className="absolute bottom-full mb-2 flex w-[140px] flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-[0_4px_16px_rgba(23,27,35,0.12)]"
              style={{ left: popupLeft }}
            >
              {visibleInsightsCategories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.key];
                return (
                  <Link
                    key={cat.key}
                    href={cat.href}
                    onClick={() => setIsInsightsMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm border-b border-border last:border-b-0 ${
                      pathname === cat.href ? "font-bold text-accent" : "text-ink hover:bg-black/[0.03]"
                    }`}
                  >
                    <Icon />
                    {cat.label}
                  </Link>
                );
              })}
            </div>
          )}

          <button type="button" onClick={() => setIsInsightsMenuOpen((open) => !open)} className={tabClass(isInsights) + " w-full"}>
            <InsightsIcon />
            <span ref={insightsLabelRef}>Insights</span>
          </button>
        </div>
        )}

        {showCircleTab && (
        <Link href="/circle" className={tabClass(isCircle)}>
          <CircleIcon />
          Circle
        </Link>
        )}

        <Link href={currentUser ? `/profile/${currentUser.id}` : "/login"} className={tabClass(isProfile)}>
          <ProfileIcon />
          마이페이지
        </Link>
      </nav>
    </>
  );
}
