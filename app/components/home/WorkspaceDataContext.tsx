"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabase";

export type RecentFollow = { id: string; nickname: string };

type WorkspaceData = {
    currentUserId: string | null;
    recentFollows: RecentFollow[];
};

const WorkspaceDataContext = createContext<WorkspaceData>({ currentUserId: null, recentFollows: [] });

export function WorkspaceDataProvider({ children }: { children: React.ReactNode }) {
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [recentFollows, setRecentFollows] = useState<RecentFollow[]>([]);

    useEffect(() => {
        let active = true;
        const load = async () => {
            const { data } = await supabase.auth.getUser();
            if (!active || !data.user) return;
            setCurrentUserId(data.user.id);

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

    const value = useMemo(() => ({ currentUserId, recentFollows }), [currentUserId, recentFollows]);

    return <WorkspaceDataContext.Provider value={value}>{children}</WorkspaceDataContext.Provider>;
}

export function useWorkspaceData() {
    return useContext(WorkspaceDataContext);
}
