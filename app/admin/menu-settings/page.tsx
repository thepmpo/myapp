"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

type NavMenuKey = "circle" | "product" | "trend" | "ai";
type Visibility = "public" | "admin_only";
type NavMenuSetting = { key: NavMenuKey; visibility: Visibility };

const MENU_LABELS: Record<NavMenuKey, string> = {
  circle: "Circle",
  product: "Product",
  trend: "Trends",
  ai: "AI",
};

const MENU_ORDER: NavMenuKey[] = ["circle", "product", "trend", "ai"];

export default function AdminMenuSettingsPage() {
  const [settings, setSettings] = useState<NavMenuSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<NavMenuKey | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);

    const { data, error: fetchError } = await supabase.from("nav_menu_settings").select("key, visibility");

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    const rows = (data as NavMenuSetting[]) || [];
    setSettings(MENU_ORDER.map((key) => rows.find((r) => r.key === key) ?? { key, visibility: "public" }));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleVisibility = async (key: NavMenuKey, current: Visibility) => {
    const next: Visibility = current === "public" ? "admin_only" : "public";

    setError("");
    setSavingKey(key);

    const { data, error: updateError } = await supabase
      .from("nav_menu_settings")
      .update({ visibility: next, updated_at: new Date().toISOString() })
      .eq("key", key)
      .select();

    setSavingKey(null);

    if (updateError || !data || data.length === 0) {
      setError(updateError?.message ?? "설정을 찾을 수 없어 저장하지 못했습니다");
      return;
    }

    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, visibility: next } : s)));
  };

  return (
    <section className="bg-surface border border-border rounded-xl p-5 shadow-[0_1px_3px_rgba(23,27,35,0.045)]">
      <h2 className="text-base font-bold text-ink mb-1">메뉴 공개 설정</h2>
      <p className="text-sm text-ink-soft mb-4">
        "관리자만 공개"로 설정한 메뉴는 사이드바에서 숨겨지고, 관리자가 아닌 유저는 해당 페이지에 직접 URL로 접근해도
        볼 수 없어요.
      </p>

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="text-sm text-ink-soft">로딩중...</p>
      ) : (
        <div className="flex flex-col">
          {settings.map((setting, i) => (
            <div
              key={setting.key}
              className={`flex items-center justify-between gap-3 py-3 ${
                i !== settings.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="text-sm font-medium text-ink">{MENU_LABELS[setting.key]}</span>

              <label className="flex items-center gap-2 text-xs text-ink-soft cursor-pointer">
                <span className={setting.visibility === "public" ? "font-bold text-ink" : ""}>전체 공개</span>
                <input
                  type="checkbox"
                  checked={setting.visibility === "admin_only"}
                  disabled={savingKey === setting.key}
                  onChange={() => toggleVisibility(setting.key, setting.visibility)}
                  className="h-4 w-4 cursor-pointer accent-accent"
                />
                <span className={setting.visibility === "admin_only" ? "font-bold text-ink" : ""}>관리자만 공개</span>
              </label>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
