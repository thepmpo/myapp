"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabase";

type Profile = { id: string; nickname: string; email: string; is_admin: boolean; is_seed: boolean; created_at: string };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error: fetchError } = await supabase.rpc("admin_list_profiles");

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setUsers((data as Profile[]) || []);
      }

      setLoading(false);
    };

    load();
  }, []);

  const nonAdminCount = users.filter((u) => !u.is_admin).length;

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) => u.nickname.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  return (
    <section className="bg-surface border border-border rounded-xl p-5 shadow-[0_1px_3px_rgba(23,27,35,0.045)]">
      <h2 className="text-base font-bold text-ink mb-1">유저 목록</h2>
      <p className="text-sm text-ink-soft mb-4">가입자 수: {nonAdminCount}명 (관리자 계정 제외)</p>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="닉네임 또는 이메일로 검색"
        className="w-full mb-4 px-3 py-2 rounded-lg border border-border bg-paper text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent/30"
      />

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="text-sm text-ink-soft">로딩중...</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-ink-soft">가입한 유저가 없습니다</p>
      ) : filteredUsers.length === 0 ? (
        <p className="text-sm text-ink-soft">검색 결과가 없어요</p>
      ) : (
        <div className="flex flex-col">
          {filteredUsers.map((u, i) => (
            <div
              key={u.id}
              className={`flex items-center justify-between gap-3 py-3 ${
                i !== filteredUsers.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="text-sm text-ink truncate">
                  {u.nickname}
                  {u.is_admin && <span className="ml-1.5 text-xs font-medium text-accent">관리자</span>}
                  {u.is_seed && <span className="ml-1.5 text-xs font-medium text-ink-soft">시드 계정</span>}
                </p>
                <p className="text-xs text-ink-soft truncate">{u.email}</p>
              </div>
              <span className="shrink-0 text-xs font-mono text-ink-soft">
                {new Date(u.created_at).toLocaleDateString("ko-KR")}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
