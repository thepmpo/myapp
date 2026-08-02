"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

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
    return <div className="text-sm text-ink-soft">로딩중...</div>;
  }

  if (status === "denied") {
    return (
      <div>
        <p className="text-sm text-ink-soft mb-3">관리자만 접근할 수 있습니다</p>
        <Link href="/" className="text-sm text-accent hover:underline">
          ← 홈으로
        </Link>
      </div>
    );
  }

  const isInsights = pathname.startsWith("/admin/insights");

  return (
    <div className="max-w-[720px] mx-auto">
      <div className="mb-5">
        <Link href="/" className="text-sm text-ink-soft hover:text-accent">
          ← Circle로
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-ink mb-6">관리자 페이지</h1>

      <div className="flex gap-6 border-b border-border mb-6">
        <Link
          href="/admin"
          className={`-mb-px pb-3 text-sm font-medium border-b-2 ${
            !isInsights ? "text-accent border-accent" : "text-ink-soft border-transparent hover:text-ink"
          }`}
        >
          신고/유저 관리
        </Link>
        <Link
          href="/admin/insights"
          className={`-mb-px pb-3 text-sm font-medium border-b-2 ${
            isInsights ? "text-accent border-accent" : "text-ink-soft border-transparent hover:text-ink"
          }`}
        >
          Insights 관리
        </Link>
      </div>

      {children}
    </div>
  );
}
