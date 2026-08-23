"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { AdminChangesProvider } from "./AdminChangesContext";
import AdminSaveBar from "./AdminSaveBar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [status, setStatus] = useState<"loading" | "admin" | "denied">("loading");

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        setStatus("denied");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", data.user.id)
        .maybeSingle();

      setStatus(profile?.is_admin ? "admin" : "denied");
    };

    check();
  }, []);

  if (status === "loading") {
    return <div className="px-5 py-8 text-sm text-ink-soft sm:px-8">로딩중...</div>;
  }

  if (status === "denied") {
    return (
      <div className="px-5 py-8 sm:px-8">
        <p className="text-sm text-ink-soft mb-3">관리자만 접근할 수 있습니다</p>
        <Link href="/" className="text-sm text-accent hover:underline">
          ← 홈으로
        </Link>
      </div>
    );
  }

  const dashboardTab = { href: "/admin", label: "대시보드", active: pathname === "/admin" };

  const tabGroups = [
    {
      title: "콘텐츠 관리",
      items: [
        { href: "/admin/insights", label: "Insights 글 관리", active: pathname.startsWith("/admin/insights") },
        { href: "/admin/categories", label: "Insights 카테고리 관리", active: pathname.startsWith("/admin/categories") },
        { href: "/admin/products", label: "Product 관리", active: pathname.startsWith("/admin/products") },
        {
          href: "/admin/product-categories",
          label: "Product 카테고리 관리",
          active: pathname.startsWith("/admin/product-categories"),
        },
        { href: "/admin/circle", label: "Circle 글 관리", active: pathname.startsWith("/admin/circle") },
        { href: "/admin/home-content", label: "홈 화면 관리", active: pathname.startsWith("/admin/home-content") },
      ],
    },
    {
      title: "운영 관리",
      items: [
        { href: "/admin/reports", label: "신고/유저 관리", active: pathname.startsWith("/admin/reports") },
        { href: "/admin/users", label: "유저 목록", active: pathname.startsWith("/admin/users") },
        { href: "/admin/keywords", label: "금지 키워드 관리", active: pathname.startsWith("/admin/keywords") },
      ],
    },
    {
      title: "설정",
      items: [
        { href: "/admin/menu-settings", label: "메뉴 공개 설정", active: pathname.startsWith("/admin/menu-settings") },
        { href: "/admin/permissions", label: "관리자 권한 설정", active: pathname.startsWith("/admin/permissions") },
      ],
    },
  ];

  const allTabs = [dashboardTab, ...tabGroups.flatMap((group) => group.items)];

  const tabLinkClass = (active: boolean) =>
    `block rounded-md px-2 py-2 text-sm leading-snug ${active ? "bg-white font-bold text-black" : "text-white hover:bg-white/10"}`;

  return (
    <AdminChangesProvider>
      <div className="flex min-w-0">
        <aside className="hidden shrink-0 bg-black px-4 py-8 lg:block lg:w-[200px]">
          <p className="mb-3 px-2 text-xs font-bold uppercase tracking-wide text-white/60">관리자 메뉴</p>
          <nav>
            <ul className="space-y-0.5">
              <li>
                <Link href={dashboardTab.href} className={tabLinkClass(dashboardTab.active)}>
                  {dashboardTab.label}
                </Link>
              </li>
            </ul>

            {tabGroups.map((group) => (
              <div key={group.title} className="mt-4">
                <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-white/40">
                  {group.title}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className={tabLinkClass(item.active)}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 mx-auto max-w-[1400px] px-5 sm:px-8 pt-8 pb-24 lg:pb-8">
          <h1 className="text-2xl font-bold text-ink mb-6">관리자 페이지</h1>

          <div className="mb-6 flex flex-wrap gap-x-6 gap-y-2 border-b border-border lg:hidden">
            {allTabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`-mb-px pb-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                  tab.active ? "text-accent border-accent" : "text-ink-soft border-transparent hover:text-ink"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {children}
        </div>
      </div>

      <AdminSaveBar />
    </AdminChangesProvider>
  );
}
