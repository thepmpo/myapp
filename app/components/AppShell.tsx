"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import MobileTabBar from "@/app/components/MobileTabBar";
import Footer from "@/app/components/Footer";
import WorkspaceFrame from "@/app/components/home/WorkspaceFrame";

const STANDALONE_ROUTES = ["/login", "/signup", "/reset", "/reset/confirm"];
const EMPTY_WORKSPACE_ROUTES = ["/notice", "/insights/product", "/insights/trend", "/insights/ai"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalone = STANDALONE_ROUTES.includes(pathname);
  const isHome = pathname === "/home";
  const isCircle = pathname === "/";
  const isEmptyWorkspace = EMPTY_WORKSPACE_ROUTES.includes(pathname);

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

  if (isEmptyWorkspace) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 min-w-0">
          <WorkspaceFrame>
            <div className="min-h-[calc(100vh-57px)] bg-white" aria-label="준비 중인 빈 화면" />
          </WorkspaceFrame>
        </div>
        <MobileTabBar />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 min-w-0 px-6 pt-8 min-h-[calc(100vh-2rem)]">{children}</main>
      </div>
      <MobileTabBar />
      <Footer />
    </div>
  );
}
