"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabase";

export type RecentFollow = { id: string; nickname: string };
export type NavMenuKey = "circle" | "product" | "trend" | "ai";
export type NavVisibility = Record<NavMenuKey, "public" | "admin_only">;

const DEFAULT_NAV_VISIBILITY: NavVisibility = { circle: "public", product: "public", trend: "public", ai: "public" };

type WorkspaceData = {
    currentUserId: string | null;
    recentFollows: RecentFollow[];
    followCount: number;
    isAdmin: boolean;
    // 로그인 여부/관리자 여부 조회(비동기)가 끝났는지. GA4처럼 "관리자면 아예 로드하지 않기"가
    // 필요한 소비자가, isAdmin이 아직 기본값(false)인 잠깐 사이에 잘못 판단하지 않도록 함.
    authChecked: boolean;
    navVisibility: NavVisibility;
};

const WorkspaceDataContext = createContext<WorkspaceData>({
    currentUserId: null,
    recentFollows: [],
    followCount: 0,
    isAdmin: false,
    authChecked: false,
    navVisibility: DEFAULT_NAV_VISIBILITY,
});

export function WorkspaceDataProvider({ children }: { children: React.ReactNode }) {
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [recentFollows, setRecentFollows] = useState<RecentFollow[]>([]);
    const [followCount, setFollowCount] = useState(0);
    const [isAdmin, setIsAdmin] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const [navVisibility, setNavVisibility] = useState<NavVisibility>(DEFAULT_NAV_VISIBILITY);

    useEffect(() => {
        let active = true;
        const loadNavVisibility = async () => {
            const { data } = await supabase.from("nav_menu_settings").select("key, visibility");
            if (!active || !data) return;
            setNavVisibility((prev) => {
                const next = { ...prev };
                for (const row of data as { key: NavMenuKey; visibility: "public" | "admin_only" }[]) {
                    next[row.key] = row.visibility;
                }
                return next;
            });
        };
        void loadNavVisibility();
        return () => { active = false; };
        // 로그인 여부와 무관하게 한 번만 불러오면 되는 공개 설정값이라 별도 effect로 분리.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        let active = true;
        const load = async () => {
            const { data } = await supabase.auth.getUser();
            if (!active) return;
            if (!data.user) {
                setAuthChecked(true);
                return;
            }
            setCurrentUserId(data.user.id);

            const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", data.user.id).maybeSingle();
            if (!active) return;
            setIsAdmin(!!profile?.is_admin);
            setAuthChecked(true);

            const { count } = await supabase
                .from("follows")
                .select("id", { count: "exact", head: true })
                .eq("follower_id", data.user.id);
            if (active) setFollowCount(count ?? 0);

            const { data: follows } = await supabase
                .from("follows")
                .select("following_id")
                .eq("follower_id", data.user.id)
                .order("created_at", { ascending: false })
                .limit(5);

            const ids = (follows ?? []).map((f: { following_id: string }) => f.following_id);
            if (!active || ids.length === 0) return;

            const { data: profiles } = await supabase.from("profiles").select("id, nickname").in("id", ids);
            if (!active) return;

            const nicknameById = new Map((profiles ?? []).map((p: { id: string; nickname: string }) => [p.id, p.nickname]));
            setRecentFollows(ids.map((id: string) => ({ id, nickname: nicknameById.get(id) ?? "(알 수 없는 유저)" })));
        };
        void load();
        return () => { active = false; };
        // 앱 진입 시 한 번만 불러오고, 페이지 이동 시에는 다시 불러오지 않습니다(사이드바 깜빡임 방지).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const value = useMemo(
        () => ({ currentUserId, recentFollows, followCount, isAdmin, authChecked, navVisibility }),
        [currentUserId, recentFollows, followCount, isAdmin, authChecked, navVisibility]
    );

    return <WorkspaceDataContext.Provider value={value}>{children}</WorkspaceDataContext.Provider>;
}

export function useWorkspaceData() {
    return useContext(WorkspaceDataContext);
}
