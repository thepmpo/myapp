"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import MobileTabBar from "@/app/components/MobileTabBar";

const STANDALONE_ROUTES = ["/login", "/signup", "/reset", "/reset/confirm"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalone = STANDALONE_ROUTES.includes(pathname);

  if (isStandalone) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen max-w-[1280px] mx-auto w-full">
      <Sidebar />
      <main className="flex-1 min-w-0 pt-8 px-6 pb-24 lg:pb-8">{children}</main>
      <MobileTabBar />
    </div>
  );
}
