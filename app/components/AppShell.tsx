"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import MobileTabBar from "@/app/components/MobileTabBar";
import Footer from "@/app/components/Footer";

const STANDALONE_ROUTES = ["/login", "/signup", "/reset", "/reset/confirm"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalone = STANDALONE_ROUTES.includes(pathname);

  if (isStandalone) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4">{children}</div>
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
