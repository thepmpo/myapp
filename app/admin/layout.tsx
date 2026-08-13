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

  const isInsights = pathname.startsWith("/admin/insights");
  const isProducts = pathname.startsWith("/admin/products");
  const isHomeContent = pathname.startsWith("/admin/home-content");
  const isKeywords = pathname.startsWith("/admin/keywords");
  const isCircle = pathname.startsWith("/admin/circle");
  const isStats = pathname.startsWith("/admin/stats");
  const isAnswerRate = pathname.startsWith("/admin/answer-rate");
  const isMenuSettings = pathname.startsWith("/admin/menu-settings");
  const isPermissions = pathname.startsWith("/admin/permissions");
  const isUsers = pathname.startsWith("/admin/users");
  const isCategories = pathname.startsWith("/admin/categories");
  // 좌우 분할 마크다운 미리보기가 있는 글쓰기/수정 화면은 다른 관리자 탭보다 더 넓은 폭이 필요함.
  const isInsightsWriteForm = pathname === "/admin/insights/new" || /^\/admin\/insights\/[^/]+\/edit$/.test(pathname);
  const isReports =
    !isInsights &&
    !isProducts &&
    !isHomeContent &&
    !isKeywords &&
    !isCircle &&
    !isStats &&
    !isAnswerRate &&
    !isMenuSettings &&
    !isPermissions &&
    !isUsers &&
    !isCategories;

  const tabs = [
    { href: "/admin/insights", label: "Insights 글 관리", active: isInsights },
    { href: "/admin/categories", label: "카테고리 관리", active: isCategories },
    { href: "/admin/products", label: "Product 관리", active: isProducts },
    { href: "/admin", label: "신고/유저 관리", active: isReports },
    { href: "/admin/home-content", label: "홈 화면 관리", active: isHomeContent },
    { href: "/admin/keywords", label: "금지 키워드 관리", active: isKeywords },
    { href: "/admin/circle", label: "Circle 글 관리", active: isCircle },
    { href: "/admin/stats", label: "가입 유저 통계", active: isStats },
    { href: "/admin/answer-rate", label: "답변률/응답시간 대시보드", active: isAnswerRate },
    { href: "/admin/menu-settings", label: "메뉴 공개 설정", active: isMenuSettings },
    { href: "/admin/permissions", label: "관리자 권한 설정", active: isPermissions },
    { href: "/admin/users", label: "유저 목록", active: isUsers },
  ];

  return (
    <AdminChangesProvider>
      <div className={`mx-auto px-5 sm:px-8 pt-8 pb-24 lg:pb-8 ${isInsightsWriteForm ? "max-w-[1100px]" : "max-w-[720px]"}`}>
        <div className="mb-5">
          <Link href="/" className="text-sm text-ink-soft hover:text-accent">
            ← Circle로
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-ink mb-6">관리자 페이지</h1>

        <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-border mb-6">
          {tabs.map((tab) => (
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

      <AdminSaveBar />
    </AdminChangesProvider>
  );
}
