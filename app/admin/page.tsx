"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";

type Report = {
  id: number;
  reporter_id: string;
  post_id: number | null;
  comment_id: number | null;
  article_id: number | null;
  reason: string | null;
  created_at: string;
};

type ReportView = Report & {
  targetLabel: string;
  targetType: "게시글" | "댓글" | "Insights 글";
  targetAuthorId: string | null;
  targetLink: string | null;
};

type BlockedProfile = {
  id: string;
  nickname: string;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function AdminPage() {
  const [reports, setReports] = useState<ReportView[]>([]);
  const [nicknames, setNicknames] = useState<Record<string, string>>({});

  const [blockedUsers, setBlockedUsers] = useState<BlockedProfile[]>([]);
  const [blockSearch, setBlockSearch] = useState("");

  useEffect(() => {
    fetchReports();
    fetchBlockedUsers();
  }, []);

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    const rows = (data as Report[]) || [];

    const postIds = rows.filter((r) => r.post_id).map((r) => r.post_id as number);
    const commentIds = rows.filter((r) => r.comment_id).map((r) => r.comment_id as number);
    const articleIds = rows.filter((r) => r.article_id).map((r) => r.article_id as number);

    const [{ data: posts }, { data: comments }, { data: articles }] = await Promise.all([
      postIds.length
        ? supabase.from("posts").select("id, title, user_id").in("id", postIds)
        : Promise.resolve({ data: [] as any[] }),
      commentIds.length
        ? supabase.from("comments").select("id, content, user_id").in("id", commentIds)
        : Promise.resolve({ data: [] as any[] }),
      articleIds.length
        ? supabase.from("articles").select("id, title, author_id").in("id", articleIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const postMap = new Map((posts || []).map((p: any) => [p.id, p]));
    const commentMap = new Map((comments || []).map((c: any) => [c.id, c]));
    const articleMap = new Map((articles || []).map((a: any) => [a.id, a]));

    const views: ReportView[] = rows.map((r) => {
      if (r.post_id) {
        const p = postMap.get(r.post_id);
        return {
          ...r,
          targetType: "게시글",
          targetLabel: p ? p.title : "(삭제된 게시글)",
          targetAuthorId: p ? p.user_id : null,
          targetLink: `/post/${r.post_id}`,
        };
      }

      if (r.comment_id) {
        const c = commentMap.get(r.comment_id);
        return {
          ...r,
          targetType: "댓글",
          targetLabel: c ? c.content : "(삭제된 댓글)",
          targetAuthorId: c ? c.user_id : null,
          targetLink: null,
        };
      }

      const a = articleMap.get(r.article_id);
      return {
        ...r,
        targetType: "Insights 글",
        targetLabel: a ? a.title : "(삭제된 글)",
        targetAuthorId: a ? a.author_id : null,
        targetLink: `/insights/${r.article_id}`,
      };
    });

    setReports(views);

    const userIds = [
      ...rows.map((r) => r.reporter_id),
      ...views.map((v) => v.targetAuthorId).filter((v): v is string => !!v),
    ].filter((id) => UUID_REGEX.test(id));

    await fetchNicknames(userIds);
  };

  const fetchNicknames = async (userIds: string[]) => {
    const uniqueIds = Array.from(new Set(userIds));

    if (uniqueIds.length === 0) return;

    const { data, error } = await supabase.from("profiles").select("id, nickname").in("id", uniqueIds);

    if (!error) {
      setNicknames((prev) => {
        const next = { ...prev };
        (data || []).forEach((p: { id: string; nickname: string }) => {
          next[p.id] = p.nickname;
        });
        return next;
      });
    }
  };

  const fetchBlockedUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, nickname")
      .eq("is_blocked", true);

    if (!error) setBlockedUsers((data as BlockedProfile[]) || []);
  };

  const dismissReport = async (reportId: number) => {
    const { error } = await supabase.from("reports").delete().eq("id", reportId);

    if (error) {
      alert(error.message);
    } else {
      await fetchReports();
    }
  };

  const deleteReportedContent = async (report: ReportView) => {
    if (!confirm("이 콘텐츠를 삭제하시겠습니까?")) return;

    const table = report.post_id ? "posts" : report.comment_id ? "comments" : "articles";
    const targetId = report.post_id ?? report.comment_id ?? report.article_id;

    const { error } = await supabase.from(table).delete().eq("id", targetId);

    if (error) {
      alert(error.message);
      return;
    }

    await dismissReport(report.id);
  };

  const blockAuthor = async (userId: string) => {
    if (!confirm("이 유저를 차단하시겠습니까? 차단된 유저는 글/댓글을 작성할 수 없습니다")) return;

    const { error } = await supabase.rpc("set_user_blocked", { target_user_id: userId, blocked: true });

    if (error) {
      alert(error.message);
    } else {
      await fetchBlockedUsers();
    }
  };

  const unblockUser = async (userId: string) => {
    const { error } = await supabase.rpc("set_user_blocked", { target_user_id: userId, blocked: false });

    if (error) {
      alert(error.message);
    } else {
      await fetchBlockedUsers();
    }
  };

  const blockByNickname = async () => {
    if (!blockSearch.trim()) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, nickname")
      .eq("nickname", blockSearch.trim())
      .maybeSingle();

    if (error || !data) {
      alert("해당 닉네임의 유저를 찾을 수 없습니다");
      return;
    }

    await blockAuthor(data.id);
    setBlockSearch("");
  };

  return (
    <div>
      <section className="bg-surface border border-border rounded-xl p-5 shadow-[0_1px_3px_rgba(23,27,35,0.045)] mb-6">
        <h2 className="text-base font-bold text-ink mb-4">신고 목록 ({reports.length})</h2>

        {reports.length === 0 && <p className="text-sm text-ink-soft">접수된 신고가 없습니다</p>}

        <div className="flex flex-col">
          {reports.map((r, i) => (
            <div
              key={r.id}
              className={`py-3 ${i !== reports.length - 1 ? "border-b border-border" : ""}`}
            >
              <div className="text-xs font-mono text-ink-soft mb-1.5">
                {r.targetType} · 신고자: {nicknames[r.reporter_id] ?? r.reporter_id}
              </div>

              <div className="text-sm text-ink mb-2">
                {r.targetLink ? (
                  <Link href={r.targetLink} className="hover:text-accent hover:underline">
                    {r.targetLabel}
                  </Link>
                ) : (
                  r.targetLabel
                )}
              </div>

              {r.targetAuthorId && (
                <div className="text-xs font-mono text-ink-soft mb-2">
                  작성자: {nicknames[r.targetAuthorId] ?? r.targetAuthorId}
                </div>
              )}

              <div className="flex gap-2">
                {r.targetAuthorId && (
                  <button
                    onClick={() => blockAuthor(r.targetAuthorId as string)}
                    className="px-2.5 py-1.5 rounded-md bg-red-500 text-white text-xs cursor-pointer hover:bg-red-600"
                  >
                    작성자 차단
                  </button>
                )}
                <button
                  onClick={() => deleteReportedContent(r)}
                  className="px-2.5 py-1.5 rounded-md bg-red-500 text-white text-xs cursor-pointer hover:bg-red-600"
                >
                  콘텐츠 삭제
                </button>
                <button
                  onClick={() => dismissReport(r.id)}
                  className="px-2.5 py-1.5 rounded-md border border-border bg-surface text-ink-soft text-xs cursor-pointer hover:bg-black/[0.03]"
                >
                  신고 무시
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface border border-border rounded-xl p-5 shadow-[0_1px_3px_rgba(23,27,35,0.045)] mb-6">
        <h2 className="text-base font-bold text-ink mb-4">차단된 유저 ({blockedUsers.length})</h2>

        <div className="flex gap-2 mb-4">
          <input
            placeholder="닉네임으로 차단"
            value={blockSearch}
            onChange={(e) => setBlockSearch(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <button
            onClick={blockByNickname}
            className="px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium cursor-pointer hover:bg-red-600"
          >
            차단
          </button>
        </div>

        {blockedUsers.length === 0 && <p className="text-sm text-ink-soft">차단된 유저가 없습니다</p>}

        <div className="flex flex-col">
          {blockedUsers.map((u, i) => (
            <div
              key={u.id}
              className={`flex justify-between items-center py-2.5 ${
                i !== blockedUsers.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="text-sm text-ink">{u.nickname}</span>
              <button
                onClick={() => unblockUser(u.id)}
                className="px-2.5 py-1.5 rounded-md border border-border bg-surface text-ink-soft text-xs cursor-pointer hover:bg-black/[0.03]"
              >
                차단 해제
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
