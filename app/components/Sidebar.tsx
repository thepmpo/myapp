"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { INSIGHTS_CATEGORIES } from "@/app/lib/insightsCategories";

function CircleIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "#C8464D" : "#6B6460"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function InsightsIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "#262322" : "#6B6460"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h8M8 9h2" />
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setCurrentUser({ id: data.user.id });

      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", data.user.id)
        .maybeSingle();

      setNickname(profile?.nickname ?? "");
    };

    load();
  }, []);

  const isCircle = pathname === "/" || pathname.startsWith("/post");
  const isInsights = pathname.startsWith("/insights");

  return (
    <aside className="w-[200px] shrink-0 px-5 py-8 flex flex-col justify-between">
      <div>
        <Link href="/" className="block font-bold text-xl text-ink mb-8">
          The PMPO
        </Link>

        <nav className="flex flex-col gap-1">
          <Link
            href="/"
            className={`flex items-center gap-2.5 pl-[10px] pr-3 py-2 rounded-lg border-l-2 text-sm ${
              isCircle ? "border-accent text-accent font-bold" : "border-transparent text-ink-soft font-medium hover:bg-black/[0.03]"
            }`}
          >
            <CircleIcon active={isCircle} />
            Circle
          </Link>

          <Link
            href="/insights/product"
            className={`flex items-center gap-2.5 pl-[10px] pr-3 py-2 rounded-lg border-l-2 text-sm ${
              isInsights ? "border-transparent text-ink font-bold" : "border-transparent text-ink-soft font-medium hover:bg-black/[0.03]"
            }`}
          >
            <InsightsIcon active={isInsights} />
            Insights
          </Link>

          <div className="flex flex-col gap-0.5 ml-[28px]">
            {INSIGHTS_CATEGORIES.map((cat) => {
              const active = pathname === cat.href;
              return (
                <Link
                  key={cat.key}
                  href={cat.href}
                  className={`pl-3 pr-3 py-1.5 rounded-lg border-l-2 text-sm ${
                    active ? "border-accent text-ink font-bold" : "border-transparent text-ink-soft font-medium hover:bg-black/[0.03]"
                  }`}
                >
                  {cat.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <Link
        href={currentUser ? `/profile/${currentUser.id}` : "/login"}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-black/[0.03]"
      >
        <span className="w-8 h-8 rounded-full bg-border shrink-0" />
        <span className="text-sm font-medium text-ink truncate">
          {currentUser ? nickname || "마이페이지" : "로그인"}
        </span>
      </Link>
    </aside>
  );
}
