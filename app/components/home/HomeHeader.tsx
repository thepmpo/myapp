// Circle 페이지에서만 사용하는 Medium형 상단 헤더입니다.
"use client";

import Link from "next/link";

type HomeHeaderProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  currentUser: { id: string; email: string } | null;
  nickname?: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export default function HomeHeader({
  searchQuery,
  onSearchChange,
  currentUser,
  nickname,
  isSidebarOpen,
  onToggleSidebar,
}: HomeHeaderProps) {
  return (
    <header className="sticky top-0 z-50 h-[57px] border-t-[3px] border-t-ink border-b border-[#f1efed] bg-surface">
      <div className="flex h-[54px] items-center">
        <div className="flex h-full w-auto shrink-0 items-center gap-3 px-5 lg:w-[218px]">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-controls="circle-left-navigation"
            aria-expanded={isSidebarOpen}
            aria-label={isSidebarOpen ? "왼쪽 내비게이션 닫기" : "왼쪽 내비게이션 열기"}
            className="hidden h-8 w-8 shrink-0 items-center justify-center text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink lg:flex"
          >
            <span className="flex h-5 w-5 flex-col justify-center gap-1" aria-hidden="true">
              <span className="block h-px w-4 bg-current" />
              <span className="block h-px w-4 bg-current" />
              <span className="block h-px w-4 bg-current" />
            </span>
          </button>
          <Link href="/" className="font-serif text-[24px] font-bold leading-none tracking-[-0.04em] text-ink">
            The PMPO
          </Link>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-between gap-4 px-4 lg:px-5">
          <label className="relative hidden sm:block">
            <span className="sr-only">Circle 글 검색</span>
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.4-3.4" />
            </svg>
            <input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Circle 검색"
              className="h-9 w-[220px] rounded-full bg-black/[0.035] pl-9 pr-4 text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-1 focus:ring-ink/20"
            />
          </label>

          <nav className="ml-auto flex items-center gap-4 text-sm" aria-label="Circle 사용자 메뉴">
            <Link
              href={currentUser ? "/profile/" + currentUser.id : "/login"}
              className="flex h-8 max-w-32 items-center gap-2 rounded-full text-ink-soft hover:text-ink"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-border text-xs font-bold text-ink">
                {(nickname || currentUser?.email || "로그인").slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden max-w-20 truncate xl:inline">
                {currentUser ? nickname || "마이페이지" : "로그인"}
              </span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
