"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

function CommunityIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "#2E4A8F" : "#5B6472"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function BoardIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "#2E4A8F" : "#5B6472"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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

  const isCommunity = pathname === "/" || pathname.startsWith("/post");
  const isBoard = pathname.startsWith("/articles");

  return (
    <aside className="w-[200px] shrink-0 px-5 py-8 flex flex-col justify-between">
      <div>
        <Link href="/" className="block font-bold text-xl text-ink mb-8">
          The PMPO
        </Link>

        <nav className="flex flex-col gap-1">
          <Link
            href="/"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
              isCommunity ? "bg-cobalt/10 text-cobalt" : "text-ink-soft hover:bg-black/[0.03]"
            }`}
          >
            <CommunityIcon active={isCommunity} />
            커뮤니티
          </Link>

          <Link
            href="/articles"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
              isBoard ? "bg-cobalt/10 text-cobalt" : "text-ink-soft hover:bg-black/[0.03]"
            }`}
          >
            <BoardIcon active={isBoard} />
            정보게시판
          </Link>
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
