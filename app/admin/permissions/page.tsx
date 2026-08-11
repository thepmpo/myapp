"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useAdminChanges } from "../AdminChangesContext";

type Profile = { id: string; nickname: string; email: string; is_admin: boolean };

export default function AdminPermissionsPage() {
  const { pendingAdminFlags, setAdminFlag, version } = useAdminChanges();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [admins, setAdmins] = useState<Profile[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const loadAdmins = async () => {
    setLoadingAdmins(true);

    const { data, error: fetchError } = await supabase.rpc("admin_list_profiles");

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setAdmins(((data as Profile[]) || []).filter((p) => p.is_admin));
    }

    setLoadingAdmins(false);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    loadAdmins();
    // 저장 성공 후(version 변경) 관리자 목록을 다시 불러와야 방금 켜거나 끈 유저가
    // 목록에 정확히 반영됨.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const search = async () => {
    const term = searchTerm.trim();
    if (!term) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setError("");

    const { data, error: searchError } = await supabase.rpc("admin_list_profiles", { search_term: term });

    setSearching(false);

    if (searchError) {
      setError(searchError.message);
    } else {
      setSearchResults((data as Profile[]) || []);
    }
  };

  const displayedIsAdmin = (profile: Profile) => pendingAdminFlags[profile.id] ?? profile.is_admin;

  const renderRow = (profile: Profile) => {
    const isSelf = profile.id === currentUserId;
    const checked = displayedIsAdmin(profile);
    const isPending = profile.id in pendingAdminFlags;

    return (
      <div
        key={profile.id}
        className="flex items-center justify-between gap-3 py-3 border-b border-border last:border-b-0"
      >
        <div className="min-w-0">
          <p className={`text-sm truncate ${isPending ? "font-bold text-accent" : "text-ink"}`}>
            {profile.nickname}
            {isSelf && <span className="ml-1.5 text-xs font-normal text-ink-soft">(나)</span>}
            {isPending && <span className="ml-1.5 text-xs font-normal text-accent">저장 안 됨</span>}
          </p>
          <p className="text-xs text-ink-soft truncate">{profile.email}</p>
        </div>

        <label
          className={`flex items-center gap-2 text-xs shrink-0 ${
            isSelf ? "text-ink-soft/50 cursor-not-allowed" : "text-ink-soft cursor-pointer"
          }`}
        >
          관리자
          <input
            type="checkbox"
            checked={checked}
            disabled={isSelf}
            onChange={() => setAdminFlag(profile.id, !checked, profile.is_admin)}
            className="h-4 w-4 accent-accent cursor-pointer disabled:cursor-not-allowed"
          />
        </label>
      </div>
    );
  };

  return (
    <section className="bg-surface border border-border rounded-xl p-5 shadow-[0_1px_3px_rgba(23,27,35,0.045)]">
      <h2 className="text-base font-bold text-ink mb-1">관리자 권한 설정</h2>
      <p className="text-sm text-ink-soft mb-4">
        닉네임으로 유저를 검색해 관리자 권한을 켜거나 끌 수 있어요. 체크박스를 바꾼 뒤 우측 하단 저장 버튼을 눌러야
        실제로 반영돼요.
      </p>

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      <div className="flex gap-2 mb-6">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="닉네임 검색"
          className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        <button
          type="button"
          onClick={search}
          disabled={searching}
          className="px-3 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover cursor-pointer disabled:opacity-50"
        >
          검색
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-xs font-bold text-ink-soft">검색 결과</p>
          <div className="flex flex-col">{searchResults.map(renderRow)}</div>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-bold text-ink-soft">현재 관리자 ({admins.length})</p>
        {loadingAdmins ? (
          <p className="text-sm text-ink-soft">로딩중...</p>
        ) : admins.length === 0 ? (
          <p className="text-sm text-ink-soft">관리자가 없습니다</p>
        ) : (
          <div className="flex flex-col">{admins.map(renderRow)}</div>
        )}
      </div>
    </section>
  );
}
