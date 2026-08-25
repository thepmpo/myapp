"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useAdminChanges } from "../AdminChangesContext";

type HiddenPost = {
  id: number;
  title: string;
  author: string;
  user_id: string;
  created_at: string;
  hidden_by: string | null;
  hidden_at: string | null;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// /admin/users의 표 형태(고정 grid 컬럼 + 헤더 행)를 그대로 재사용.
const ROW_GRID = "grid grid-cols-[minmax(0,1.4fr)_140px_130px_140px_120px] gap-3 items-center";

export default function AdminCirclePage() {
  const { pendingUnhidePostIds, stagePostUnhide, version } = useAdminChanges();
  const [posts, setPosts] = useState<HiddenPost[]>([]);
  const [nicknames, setNicknames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("posts")
      .select("id, title, author, user_id, created_at, hidden_by, hidden_at")
      .eq("is_hidden", true)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    const rows = (data as HiddenPost[]) || [];
    setPosts(rows);

    // 작성자(user_id)와 비공개 처리한 관리자(hidden_by) 닉네임을 한 번에 조회.
    const userIds = Array.from(
      new Set(
        rows
          .flatMap((p) => [p.user_id, p.hidden_by])
          .filter((id): id is string => !!id && UUID_REGEX.test(id))
      )
    );
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from("profiles").select("id, nickname").in("id", userIds);
      const map: Record<string, string> = {};
      (profiles || []).forEach((p: { id: string; nickname: string }) => {
        map[p.id] = p.nickname;
      });
      setNicknames(map);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
    // 저장 성공 후(version 변경) 목록을 다시 불러와야 방금 정상처리된 글이 사라짐.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const filteredPosts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return posts;
    return posts.filter((p) => {
      const authorName = (nicknames[p.user_id] ?? p.author).toLowerCase();
      return p.title.toLowerCase().includes(term) || authorName.includes(term);
    });
  }, [posts, nicknames, searchTerm]);

  return (
    <section className="bg-surface border border-border rounded-xl p-5 shadow-[0_1px_3px_rgba(23,27,35,0.045)]">
      <h2 className="text-base font-bold text-ink mb-1">Circle 글 관리</h2>
      <p className="text-sm text-ink-soft mb-4">
        비공개 처리된 글만 모아서 보여줘요. "정상처리"는 예약만 되고, 우측 하단 저장 버튼을 눌러야 실제로 반영돼요.
      </p>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="제목 또는 작성자 닉네임으로 검색"
        className="w-full mb-4 px-3 py-2 rounded-lg border border-border bg-paper text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent/30"
      />

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="text-sm text-ink-soft">로딩중...</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-ink-soft">비공개 처리된 글이 없습니다</p>
      ) : filteredPosts.length === 0 ? (
        <p className="text-sm text-ink-soft">검색 결과가 없어요</p>
      ) : (
        <div className="flex flex-col overflow-x-auto">
          <div className={`${ROW_GRID} min-w-[720px] border-b border-border pb-2 text-xs font-medium text-ink-soft`}>
            <span>제목</span>
            <span>작성자</span>
            <span className="text-right">비공개 처리일</span>
            <span>처리한 관리자</span>
            <span className="text-right">액션</span>
          </div>

          {filteredPosts.map((post, i) => {
            const isStaged = post.id in pendingUnhidePostIds;

            return (
              <div
                key={post.id}
                className={`${ROW_GRID} min-w-[720px] py-3 ${
                  i !== filteredPosts.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <a
                  href={`/post/${post.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 truncate text-sm text-ink hover:text-accent hover:underline"
                >
                  {post.title}
                </a>

                <span className="min-w-0 truncate text-xs text-ink-soft">
                  {nicknames[post.user_id] ?? post.author}
                </span>

                <span className="text-right text-xs font-mono text-ink-soft">
                  {post.hidden_at ? new Date(post.hidden_at).toLocaleDateString("ko-KR") : "-"}
                </span>

                <span className="min-w-0 truncate text-xs text-ink-soft">
                  {post.hidden_by ? nicknames[post.hidden_by] ?? "알 수 없음" : "-"}
                </span>

                <div className="flex items-center justify-end gap-2">
                  {isStaged && <span className="text-xs font-bold text-accent">정상처리 예정</span>}

                  <details className="relative shrink-0">
                    <summary className="cursor-pointer list-none px-2 text-lg leading-none text-ink-soft hover:text-ink [&::-webkit-details-marker]:hidden">
                      ⋯
                    </summary>
                    <div className="absolute right-0 top-full z-10 mt-1 w-28 rounded-lg border border-border bg-surface shadow-[0_2px_8px_rgba(23,27,35,0.1)]">
                      {isStaged ? (
                        <button
                          type="button"
                          onClick={() => stagePostUnhide(post.id, false)}
                          className="w-full px-3 py-2 text-left text-xs text-ink-soft hover:bg-black/[0.03] cursor-pointer"
                        >
                          취소
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => stagePostUnhide(post.id, true)}
                          className="w-full px-3 py-2 text-left text-xs text-ink-soft hover:bg-black/[0.03] cursor-pointer"
                        >
                          정상처리
                        </button>
                      )}
                    </div>
                  </details>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
