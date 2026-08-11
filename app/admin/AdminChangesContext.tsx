"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabase";

export type NavMenuKey = "circle" | "product" | "trend" | "ai";
export type Visibility = "public" | "admin_only";

type AdminChanges = {
  pendingNavVisibility: Partial<Record<NavMenuKey, Visibility>>;
  pendingAdminFlags: Record<string, boolean>;
  pendingCount: number;
  saving: boolean;
  error: string;
  version: number;
  setNavVisibility: (key: NavMenuKey, value: Visibility, original: Visibility) => void;
  setAdminFlag: (userId: string, value: boolean, original: boolean) => void;
  saveAll: () => Promise<void>;
};

const AdminChangesContext = createContext<AdminChanges | null>(null);

export function AdminChangesProvider({ children }: { children: React.ReactNode }) {
  const [pendingNavVisibility, setPendingNavVisibilityState] = useState<Partial<Record<NavMenuKey, Visibility>>>({});
  const [pendingAdminFlags, setPendingAdminFlagsState] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);

  const setNavVisibility = useCallback((key: NavMenuKey, value: Visibility, original: Visibility) => {
    setPendingNavVisibilityState((prev) => {
      const next = { ...prev };
      if (value === original) delete next[key];
      else next[key] = value;
      return next;
    });
  }, []);

  const setAdminFlag = useCallback((userId: string, value: boolean, original: boolean) => {
    setPendingAdminFlagsState((prev) => {
      const next = { ...prev };
      if (value === original) delete next[userId];
      else next[userId] = value;
      return next;
    });
  }, []);

  // 관리자 페이지의 여러 탭(메뉴 설정/관리자 권한)에서 예약해둔 변경사항을 한 번에 반영.
  // 일부만 실패해도 성공한 항목은 pending에서 지우고, 실패한 항목만 남겨 재시도할 수 있게 함.
  const saveAll = useCallback(async () => {
    setSaving(true);
    setError("");

    const navEntries = Object.entries(pendingNavVisibility) as [NavMenuKey, Visibility][];
    const adminEntries = Object.entries(pendingAdminFlags);

    const navResults = await Promise.all(
      navEntries.map(async ([key, visibility]) => {
        const { error: updateError } = await supabase
          .from("nav_menu_settings")
          .update({ visibility, updated_at: new Date().toISOString() })
          .eq("key", key);
        return { key, ok: !updateError };
      })
    );

    const adminResults = await Promise.all(
      adminEntries.map(async ([userId, isAdmin]) => {
        // profiles.is_admin은 셀프승격 방지 트리거 때문에 직접 update가 아니라
        // 전용 RPC(0038_set_user_admin_rpc.sql)를 통해서만 변경 가능.
        const { error: updateError } = await supabase.rpc("set_user_admin", {
          target_user_id: userId,
          make_admin: isAdmin,
        });
        return { userId, ok: !updateError };
      })
    );

    setPendingNavVisibilityState((prev) => {
      const next = { ...prev };
      navResults.filter((r) => r.ok).forEach((r) => delete next[r.key]);
      return next;
    });

    setPendingAdminFlagsState((prev) => {
      const next = { ...prev };
      adminResults.filter((r) => r.ok).forEach((r) => delete next[r.userId]);
      return next;
    });

    const hasFailure = navResults.some((r) => !r.ok) || adminResults.some((r) => !r.ok);
    setError(hasFailure ? "일부 변경사항 저장에 실패했어요. 다시 시도해주세요." : "");
    setVersion((v) => v + 1);
    setSaving(false);
  }, [pendingNavVisibility, pendingAdminFlags]);

  const pendingCount = Object.keys(pendingNavVisibility).length + Object.keys(pendingAdminFlags).length;

  const value = useMemo(
    () => ({
      pendingNavVisibility,
      pendingAdminFlags,
      pendingCount,
      saving,
      error,
      version,
      setNavVisibility,
      setAdminFlag,
      saveAll,
    }),
    [pendingNavVisibility, pendingAdminFlags, pendingCount, saving, error, version, setNavVisibility, setAdminFlag, saveAll]
  );

  return <AdminChangesContext.Provider value={value}>{children}</AdminChangesContext.Provider>;
}

export function useAdminChanges() {
  const ctx = useContext(AdminChangesContext);
  if (!ctx) throw new Error("useAdminChanges must be used within AdminChangesProvider");
  return ctx;
}
