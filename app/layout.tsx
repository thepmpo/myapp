import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import AppShell from "@/app/components/AppShell";
import { WorkspaceDataProvider } from "@/app/components/home/WorkspaceDataContext";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "The PMPO",
  description: "PM·PO를 위한 질문·정보 커뮤니티",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <WorkspaceDataProvider>
          <AppShell>{children}</AppShell>
        </WorkspaceDataProvider>
      </body>
    </html>
  );
}
