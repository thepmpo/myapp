"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { ProfileIcon } from "@/app/components/icons";
import { useWorkspaceData } from "@/app/components/home/WorkspaceDataContext";
import ProfileMenu from "@/app/components/ProfileMenu";

export const WORKSPACE_NAV_ITEMS = [
    { label: "Home", href: "/", icon: "home", navKey: null },
    { label: "Circle", href: "/circle", icon: "circle", navKey: "circle" },
    { label: "Product", href: "/insights/product", icon: "document", navKey: "product" },
    { label: "Trends", href: "/insights/trend", icon: "chart", navKey: "trend" },
    { label: "AI", href: "/insights/ai", icon: "spark", navKey: "ai" },
] as const;

type WorkspaceFrameProps = {
    children: React.ReactNode;
    searchQuery?: string;
    onSearchChange?: (value: string) => void;
};

function NavIcon({ icon }: { icon: (typeof WORKSPACE_NAV_ITEMS)[number]["icon"] }) {
    if (icon === "home") return <><path d="m4 11 8-7 8 7" /><path d="M6.5 10v10h11V10M10 20v-6h4v6" /></>;
    if (icon === "circle") return <path d="M20 11.5a7.8 7.8 0 0 1-8 7.5 8.5 8.5 0 0 1-3.5-.8L4 20l1.4-4.2A7.8 7.8 0 1 1 20 11.5Z" />;
    if (icon === "document") return <><rect x="4.5" y="4.5" width="15" height="15" rx="4.5" /><path d="m12 9 .9 1.9 2.1.3-1.5 1.5.35 2.1L12 13.8l-1.85 1 .35-2.1-1.5-1.5 2.1-.3Z" /></>;
    if (icon === "chart") return <><path d="M5 20v-6h3v6M11 20V9h3v11M17 20V4h3v16" /><path d="M3 20h19" /></>;
    return <path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5ZM18.5 15l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7Z" />;
}

export function WorkspaceNavigation({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname();
    const { currentUserId, recentFollows, followCount, isAdmin, navVisibility } = useWorkspaceData();

    const visibleNavItems = WORKSPACE_NAV_ITEMS.filter(
        (item) => item.navKey === null || navVisibility[item.navKey] === "public" || isAdmin
    );

    return (
        <nav aria-label="The PMPO 주요 메뉴">
            <ul className="space-y-1">
                {visibleNavItems.map((item) => {
                    const active = item.href === "/" ? pathname === "/" : pathname === item.href;
                    return (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                onClick={onNavigate}
                                aria-current={active ? "page" : undefined}
                                className={`relative flex h-10 items-center gap-3 rounded-md px-2.5 text-sm transition-colors ${active ? "bg-black/[0.04] font-bold text-ink" : "text-ink-soft hover:text-ink"}`}
                            >
                                {active && <span className="absolute -left-5 h-6 w-0.5 bg-ink" aria-hidden="true" />}
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <NavIcon icon={item.icon} />
                                </svg>
                                {item.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>

            {currentUserId && (
                <div className="mt-4 border-t border-[#f1efed] pt-4">
                    <p className="px-2.5 mb-1 text-sm font-bold text-ink-soft">팔로잉</p>

                    {recentFollows.length > 0 ? (
                        <ul className="space-y-1">
                            {recentFollows.map((follow) => (
                                <li key={follow.id}>
                                    <span className="flex h-10 items-center gap-3 rounded-md px-2.5 text-sm text-ink-soft">
                                        <ProfileIcon />
                                        <span className="truncate">{follow.nickname}</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="px-2.5 text-xs text-ink-soft">아직 팔로우한 사람이 없어요</p>
                    )}

                    {followCount > 5 && (
                        <Link
                            href={"/profile/" + currentUserId + "/follows?tab=following"}
                            onClick={onNavigate}
                            className="mt-1 block px-2.5 text-right text-xs text-ink-soft hover:text-ink"
                        >
                            더보기
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}

export default function WorkspaceFrame({ children, searchQuery = "", onSearchChange }: WorkspaceFrameProps) {
    const [isDesktopNavOpen, setIsDesktopNavOpen] = useState(true);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
    const [nickname, setNickname] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        let active = true;
        const loadUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (!active || !data.user) return;
            setCurrentUser({ id: data.user.id, email: data.user.email ?? "" });
            const { data: profile } = await supabase.from("profiles").select("nickname, avatar_url, is_admin").eq("id", data.user.id).maybeSingle();
            if (active) {
                setNickname(profile?.nickname ?? "");
                setAvatarUrl(profile?.avatar_url ?? null);
                setIsAdmin(!!profile?.is_admin);
            }
        };
        void loadUser();
        return () => { active = false; };
    }, []);

    return (
        <div className="min-h-screen overflow-x-clip bg-surface">
            <header className="sticky top-0 z-50 h-[57px] border-t-[3px] border-t-ink border-b border-[#f1efed] bg-surface">
                <div className="flex h-[54px] items-center">
                    <div className="flex h-full shrink-0 items-center gap-3 px-4 lg:w-[218px] lg:px-5">
                        <button
                            type="button"
                            onClick={() => {
                                if (window.matchMedia("(min-width: 1024px)").matches) setIsDesktopNavOpen((open) => !open);
                                else setIsMobileNavOpen((open) => !open);
                            }}
                            aria-controls="workspace-left-navigation"
                            aria-expanded={isDesktopNavOpen || isMobileNavOpen}
                            aria-label="왼쪽 내비게이션 열기 또는 닫기"
                            className="flex h-8 w-8 shrink-0 items-center justify-center text-ink-soft hover:text-ink"
                        >
                            <span className="flex h-5 w-5 flex-col justify-center gap-1" aria-hidden="true">
                                <span className="block h-px w-4 bg-current" />
                                <span className="block h-px w-4 bg-current" />
                                <span className="block h-px w-4 bg-current" />
                            </span>
                        </button>
                        <Link href="/" className="whitespace-nowrap font-serif text-[24px] font-bold leading-none tracking-[-0.04em] text-ink">
                            The PMPO
                        </Link>
                    </div>

                    <div className="flex min-w-0 flex-1 items-center justify-between gap-4 px-4 lg:px-5">
                        {onSearchChange && (
                            <label className="relative hidden sm:block">
                                <span className="sr-only">Circle 글 검색</span>
                                <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                                    <circle cx="11" cy="11" r="7" /><path d="m20 20-3.4-3.4" />
                                </svg>
                                <input value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} placeholder="Circle 검색" className="h-9 w-[220px] rounded-full bg-black/[0.035] pl-9 pr-4 text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-1 focus:ring-ink/20" />
                            </label>
                        )}

                        {currentUser ? (
                            <ProfileMenu userId={currentUser.id} isAdmin={isAdmin} className="ml-auto">
                                <span className="flex h-8 max-w-32 items-center gap-2 rounded-full text-ink-soft hover:text-ink">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-border text-xs font-bold text-ink">
                                        {avatarUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            (nickname || currentUser.email || "").slice(0, 1).toUpperCase()
                                        )}
                                    </span>
                                    <span className="hidden max-w-20 truncate xl:inline">{nickname || "마이페이지"}</span>
                                </span>
                            </ProfileMenu>
                        ) : (
                            <Link href="/login" className="ml-auto text-sm font-medium text-ink-soft hover:text-ink">
                                Sign in
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex min-w-0">
                <aside
                    id="workspace-left-navigation"
                    aria-hidden={!isDesktopNavOpen}
                    inert={!isDesktopNavOpen}
                    className={`sticky top-[57px] hidden h-[calc(100vh-57px)] shrink-0 overflow-y-auto bg-surface transition-[width,border-color] duration-300 ease-in-out lg:block ${isDesktopNavOpen ? "w-[218px] border-r border-[#f1efed]" : "w-0 border-r border-transparent"}`}
                >
                    <div className={`h-full w-[218px] px-5 py-7 transition-transform duration-300 ease-in-out ${isDesktopNavOpen ? "translate-x-0" : "-translate-x-full"}`}>
                        <WorkspaceNavigation />
                    </div>
                </aside>

                <main className="min-w-0 flex-1 bg-surface">{children}</main>
            </div>

            <div className={`fixed inset-0 z-[60] lg:hidden ${isMobileNavOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!isMobileNavOpen}>
                <button type="button" aria-label="내비게이션 닫기" onClick={() => setIsMobileNavOpen(false)} className={`absolute inset-0 bg-black/25 transition-opacity duration-300 ${isMobileNavOpen ? "opacity-100" : "opacity-0"}`} />
                <aside className={`absolute inset-y-0 left-0 w-[min(82vw,290px)] border-r border-[#f1efed] bg-surface px-5 py-6 shadow-xl transition-transform duration-300 ${isMobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}>
                    <div className="mb-8 flex items-center justify-between">
                        <Link href="/" onClick={() => setIsMobileNavOpen(false)} className="font-serif text-2xl font-bold tracking-[-0.04em]">The PMPO</Link>
                        <button type="button" onClick={() => setIsMobileNavOpen(false)} aria-label="내비게이션 닫기" className="h-9 w-9 text-xl text-ink-soft">×</button>
                    </div>
                    <WorkspaceNavigation onNavigate={() => setIsMobileNavOpen(false)} />
                </aside>
            </div>
        </div>
    );
}
