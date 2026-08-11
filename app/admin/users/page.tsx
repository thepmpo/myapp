"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

type Profile = { id: string; nickname: string; email: string; is_admin: boolean; created_at: string };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <section className="bg-surface border border-border rounded-xl p-5 shadow-[0_1px_3px_rgba(23,27,35,0.045)]">
      <h2 className="text-base font-bold text-ink mb-1">유저 목록</h2>
      <p className="text-sm text-ink-soft mb-4">가입자 수: {nonAdminCount}명 (관리자 계정 제외)</p>

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="text-sm text-ink-soft">로딩중...</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-ink-soft">가입한 유저가 없습니다</p>
      ) : (
        <div className="flex flex-col">
          {users.map((u, i) => (
            <div
              key={u.id}
              className={`flex items-center justify-between gap-3 py-3 ${
                i !== users.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="text-sm text-ink truncate">
                  {u.nickname}
                  {u.is_admin && <span className="ml-1.5 text-xs font-medium text-accent">관리자</span>}
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
