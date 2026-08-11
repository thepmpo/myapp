"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useAdminChanges, NavMenuKey, Visibility } from "../AdminChangesContext";

type NavMenuSetting = { key: NavMenuKey; visibility: Visibility };

const MENU_LABELS: Record<NavMenuKey, string> = {
  circle: "Circle",
  product: "Product",
  trend: "Trends",
  ai: "AI",
};

const MENU_ORDER: NavMenuKey[] = ["circle", "product", "trend", "ai"];

export default function AdminMenuSettingsPage() {
  const { pendingNavVisibility, setNavVisibility, version } = useAdminChanges();
  const [settings, setSettings] = useState<NavMenuSetting[]>([]);
  const [loading, setLoading] = useState(true);
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
    // 저장이 성공하면 version이 바뀌는데, 그때 DB에 반영된 최신 값을 다시 불러와야
    // pending이 비워진 뒤에도 화면에 옳은 값(방금 저장한 값)이 남아있음.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  return (
    <section className="bg-surface border border-border rounded-xl p-5 shadow-[0_1px_3px_rgba(23,27,35,0.045)]">
      <h2 className="text-base font-bold text-ink mb-1">메뉴 공개 설정</h2>
      <p className="text-sm text-ink-soft mb-4">
        "관리자만 공개"로 설정한 메뉴는 사이드바에서 숨겨지고, 관리자가 아닌 유저는 해당 페이지에 직접 URL로 접근해도
        볼 수 없어요. 체크박스를 바꾼 뒤 우측 하단 저장 버튼을 눌러야 실제로 반영돼요.
      </p>

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="text-sm text-ink-soft">로딩중...</p>
      ) : (
        <div className="flex flex-col">
          {settings.map((setting, i) => {
            const displayedVisibility = pendingNavVisibility[setting.key] ?? setting.visibility;
            const isPending = setting.key in pendingNavVisibility;

            return (
              <div
                key={setting.key}
                className={`flex items-center justify-between gap-3 py-3 ${
                  i !== settings.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className={`text-sm ${isPending ? "font-bold text-accent" : "font-medium text-ink"}`}>
                  {MENU_LABELS[setting.key]}
                  {isPending && <span className="ml-1.5 text-xs font-normal text-accent">저장 안 됨</span>}
                </span>

                <label className="flex items-center gap-2 text-xs text-ink-soft cursor-pointer">
                  <span className={displayedVisibility === "public" ? "font-bold text-ink" : ""}>전체 공개</span>
                  <input
                    type="checkbox"
                    checked={displayedVisibility === "admin_only"}
                    onChange={() =>
                      setNavVisibility(
                        setting.key,
                        displayedVisibility === "public" ? "admin_only" : "public",
                        setting.visibility
                      )
                    }
                    className="h-4 w-4 cursor-pointer accent-accent"
                  />
                  <span className={displayedVisibility === "admin_only" ? "font-bold text-ink" : ""}>관리자만 공개</span>
                </label>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
