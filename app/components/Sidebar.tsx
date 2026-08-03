"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { INSIGHTS_CATEGORIES } from "@/app/lib/insightsCategories";
import { CircleIcon, InsightsIcon, HomeIcon, NoticeIcon } from "@/app/components/icons";

export default function Sidebar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [nickname, setNickname] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setCurrentUser({ id: data.user.id });

      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname, avatar_url")
        .eq("id", data.user.id)
        .maybeSingle();

      setNickname(profile?.nickname ?? "");
      setAvatarUrl(profile?.avatar_url ?? null);
    };

    load();
  }, []);

  const isHome = pathname === "/home";
  const isCircle = pathname === "/" || pathname.startsWith("/post");
  const isInsights = pathname.startsWith("/insights");
  const isNotice = pathname === "/notice";

  return (
    <aside className="hidden lg:flex w-[200px] shrink-0 px-5 py-8 flex-col justify-between border-r border-border">
      <div>
        <Link href="/" className="block font-bold text-xl text-ink mb-8">
          The PMPO
        </Link>

        <nav className="flex flex-col gap-1">
          <Link
            href="/home"
            className={`flex items-center gap-2.5 pl-[10px] pr-3 py-2 rounded-lg border-l-2 text-sm ${
              isHome ? "border-accent text-accent font-bold" : "border-transparent text-ink-soft font-medium hover:bg-black/[0.03]"
            }`}
          >
            <HomeIcon />
            Home
          </Link>

          <Link
            href="/"
            className={`flex items-center gap-2.5 pl-[10px] pr-3 py-2 rounded-lg border-l-2 text-sm ${
              isCircle ? "border-accent text-accent font-bold" : "border-transparent text-ink-soft font-medium hover:bg-black/[0.03]"
            }`}
          >
            <CircleIcon />
            Circle
          </Link>

          <Link
            href="/insights/product"
            className={`flex items-center gap-2.5 pl-[10px] pr-3 py-2 rounded-lg border-l-2 text-sm ${
              isInsights ? "border-transparent text-ink font-bold" : "border-transparent text-ink-soft font-medium hover:bg-black/[0.03]"
            }`}
          >
            <InsightsIcon />
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

          <Link
            href="/notice"
            className={`flex items-center gap-2.5 pl-[10px] pr-3 py-2 rounded-lg border-l-2 text-sm ${
              isNotice ? "border-accent text-accent font-bold" : "border-transparent text-ink-soft font-medium hover:bg-black/[0.03]"
            }`}
          >
            <NoticeIcon />
            Notice
          </Link>
        </nav>
      </div>

      <Link
        href={currentUser ? `/profile/${currentUser.id}` : "/login"}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-black/[0.03]"
      >
        <span className="w-8 h-8 rounded-full bg-border shrink-0 overflow-hidden">
          {avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          )}
        </span>
        <span className="text-sm font-medium text-ink truncate">
          {currentUser ? nickname || "마이페이지" : "로그인"}
        </span>
      </Link>
    </aside>
  );
}
