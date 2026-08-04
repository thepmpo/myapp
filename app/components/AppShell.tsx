"use client";

import { usePathname } from "next/navigation";
import MobileTabBar from "@/app/components/MobileTabBar";
import Footer from "@/app/components/Footer";
import WorkspaceFrame from "@/app/components/home/WorkspaceFrame";

const STANDALONE_ROUTES = ["/login", "/signup", "/reset", "/reset/confirm"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalone = STANDALONE_ROUTES.includes(pathname);
  const isHome = pathname === "/home";
  const isCircle = pathname === "/" || pathname.startsWith("/post/");

  if (isStandalone) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4">{children}</div>
        <Footer />
      </div>
    );
  }

  if (isHome) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 min-w-0">{children}</div>
        <Footer />
      </div>
    );
  }

  if (isCircle) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 min-w-0">{children}</div>
        <MobileTabBar />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 min-w-0">
        <WorkspaceFrame>{children}</WorkspaceFrame>
      </div>
      <MobileTabBar />
      <Footer />
    </div>
  );
}
