"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { CircleIcon, InsightsIcon, ProfileIcon } from "@/app/components/icons";

export default function MobileTabBar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) setCurrentUser({ id: data.user.id });
    };

    load();
  }, []);

  const isCircle = pathname === "/" || pathname.startsWith("/post");
  const isInsights = pathname.startsWith("/insights");
  const isProfile = pathname.startsWith("/profile");

  const tabClass = (active: boolean) =>
    `flex flex-col items-center justify-center gap-1 flex-1 py-2 text-xs font-medium ${
      active ? "text-accent" : "text-ink-soft"
    }`;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch bg-surface border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <Link href="/" className={tabClass(isCircle)}>
        <CircleIcon />
        Circle
      </Link>

      <Link href="/insights/product" className={tabClass(isInsights)}>
        <InsightsIcon />
        Insights
      </Link>

      <Link href={currentUser ? `/profile/${currentUser.id}` : "/login"} className={tabClass(isProfile)}>
        <ProfileIcon />
        마이페이지
      </Link>
    </nav>
  );
}
