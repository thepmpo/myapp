// Circle 페이지 전체를 Medium 피드 구조로 구성합니다.
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import WorkspaceFrame from "@/app/components/home/WorkspaceFrame";
import CirclePostCard from "@/app/components/home/CirclePostCard";
import HomeSidebar from "@/app/components/home/HomeSidebar";
import type { HomePost, HomePreviewComment } from "@/app/components/home/types";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function CirclePage() {
  const [posts, setPosts] = useState<HomePost[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
  const [nicknames, setNicknames] = useState<Record<string, string>>({});
  const [avatars, setAvatars] = useState<Record<string, string>>({});
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});
  const [reactionCounts, setReactionCounts] = useState<Record<number, number>>({});
  const [topComments, setTopComments] = useState<Record<number, HomePreviewComment[]>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [sortMode, setSortMode] = useState<"latest" | "popular">("latest");
  const [questionOnly, setQuestionOnly] = useState(false);
  const [unansweredQuestionOnly, setUnansweredQuestionOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchNicknames = async (userIds: string[]) => {
    const uniqueIds = Array.from(new Set(userIds.filter((id) => id && UUID_REGEX.test(id))));
    if (uniqueIds.length === 0) return;

    const { data, error } = await supabase.from("profiles").select("id, nickname, avatar_url").in("id", uniqueIds);
    if (error) return;

    const nextNicknames: Record<string, string> = {};
    const nextAvatars: Record<string, string> = {};
    (data || []).forEach((profile: { id: string; nickname: string; avatar_url: string | null }) => {
      nextNicknames[profile.id] = profile.nickname;
      if (profile.avatar_url) nextAvatars[profile.id] = profile.avatar_url;
    });
    setNicknames((previous) => ({ ...previous, ...nextNicknames }));
    setAvatars((previous) => ({ ...previous, ...nextAvatars }));
  };

  const fetchPostActivity = async (postIds: number[]) => {
    if (postIds.length === 0) {
      setCommentCounts({});
      setReactionCounts({});
      setTopComments({});
      return;
    }

    const [{ data: commentsData }, { data: postLikesData }] = await Promise.all([
      supabase.from("comments").select("id, post_id, user_id, author, content").in("post_id", postIds),
      supabase.from("likes").select("post_id").in("post_id", postIds),
    ]);

    const nextCommentCounts: Record<number, number> = {};
    (commentsData || []).forEach((comment) => {
      nextCommentCounts[comment.post_id] = (nextCommentCounts[comment.post_id] || 0) + 1;
    });
    setCommentCounts(nextCommentCounts);

    const nextReactionCounts: Record<number, number> = {};
    (postLikesData || []).forEach((like: { post_id: number | null }) => {
      if (like.post_id != null) {
        nextReactionCounts[like.post_id] = (nextReactionCounts[like.post_id] || 0) + 1;
      }
    });
    setReactionCounts(nextReactionCounts);

    if (!commentsData || commentsData.length === 0) {
      setTopComments({});
      return;
    }

    const commentIds = commentsData.map((comment) => comment.id);
    const { data: commentLikesData } = await supabase.from("likes").select("comment_id").in("comment_id", commentIds);
    const commentLikeCounts: Record<number, number> = {};
    (commentLikesData || []).forEach((like: { comment_id: number | null }) => {
      if (like.comment_id != null) {
        commentLikeCounts[like.comment_id] = (commentLikeCounts[like.comment_id] || 0) + 1;
      }
    });

    await fetchNicknames(commentsData.map((comment) => comment.user_id));

    const grouped: Record<number, HomePreviewComment[]> = {};
    commentsData.forEach((comment) => {
      if (!grouped[comment.post_id]) grouped[comment.post_id] = [];
      grouped[comment.post_id].push({ ...comment, likeCount: commentLikeCounts[comment.id] || 0 });
    });
    Object.values(grouped).forEach((comments) => comments.sort((a, b) => b.likeCount - a.likeCount).splice(2));
    setTopComments(grouped);
  };

  const getPosts = async () => {
    setErrorMessage("");
    const { data, error } = await supabase.from("posts").select("*").order("id", { ascending: false });

    if (error) {
      setErrorMessage("Circle 글을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      return;
    }

    const fetchedPosts = (data as HomePost[]) || [];
    setPosts(fetchedPosts);
    await Promise.all([
      fetchNicknames(fetchedPosts.map((post) => post.user_id)),
      fetchPostActivity(fetchedPosts.map((post) => post.id)),
    ]);
  };

  useEffect(() => {
    let isActive = true;
    const loadingTimer = window.setTimeout(() => {
      if (!isActive) return;
      setIsLoading(false);
      setErrorMessage((current) => current || "Circle 글을 불러오는 데 시간이 걸리고 있어요. 잠시 후 새로고침해 주세요.");
    }, 5000);

    const loadFeed = async () => {
      await getPosts();
      if (!isActive) return;
      setIsLoading(false);
      window.clearTimeout(loadingTimer);
    };

    const loadUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!isActive || !userData.user) return;
      setCurrentUser({ id: userData.user.id, email: userData.user.email ?? "" });
      await fetchNicknames([userData.user.id]);
    };

    void loadFeed();
    void loadUser();
    return () => {
      isActive = false;
      window.clearTimeout(loadingTimer);
    };
    // 공개 피드와 현재 사용자 정보는 첫 진입 시 한 번만 불러옵니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visiblePosts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase("ko-KR");
    const filtered = posts.filter((post) => {
      if (questionOnly && !post.is_question) return false;
      if (unansweredQuestionOnly && (!post.is_question || (commentCounts[post.id] || 0) > 0)) return false;
      if (!normalizedQuery) return true;
      const authorName = nicknames[post.user_id] ?? post.author;
      return [post.title, post.content ?? "", authorName].join(" ").toLocaleLowerCase("ko-KR").includes(normalizedQuery);
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === "popular") {
        const scoreA = (commentCounts[a.id] || 0) * 2 + (reactionCounts[a.id] || 0);
        const scoreB = (commentCounts[b.id] || 0) * 2 + (reactionCounts[b.id] || 0);
        return scoreB - scoreA || b.id - a.id;
      }
      return b.id - a.id;
    });
  }, [posts, searchQuery, nicknames, sortMode, questionOnly, unansweredQuestionOnly, commentCounts, reactionCounts]);

  const startEdit = (post: HomePost) => {
    setEditingId(post.id);
    setEditTitle(post.title);
  };

  const updatePost = async (id: number) => {
    if (!editTitle.trim()) {
      alert("수정할 제목을 입력하세요.");
      return;
    }
    const { error } = await supabase.from("posts").update({ title: editTitle.trim() }).eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    setEditingId(null);
    setEditTitle("");
    await getPosts();
  };

  const deletePost = async (id: number) => {
    if (!window.confirm("이 글을 삭제할까요? 삭제한 글은 되돌릴 수 없어요.")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    await getPosts();
  };

  return (
    <WorkspaceFrame searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      <div className="min-h-[calc(100vh-57px)] overflow-x-clip bg-surface">
        <div className="h-[42px] border-b border-black/10 bg-accent text-white">
          <div className="mx-auto flex h-full max-w-[1200px] items-center justify-center px-5 text-center text-xs sm:text-sm">
            <span className="rounded bg-white px-2 py-1 text-[11px] font-bold text-accent">Circle</span>
            <span className="ml-2 truncate">PM·PO 동료들과 질문하고 경험을 나눠보세요.</span>
            <Link href="/circle/new" className="ml-2 shrink-0 font-bold underline underline-offset-2">글쓰기</Link>
          </div>
        </div>

        <div className="mx-auto max-w-[1320px] xl:grid xl:grid-cols-[minmax(0,1fr)_1px_360px] xl:gap-x-10">
          <section className="min-w-0 px-5 sm:px-8 xl:pl-24" aria-label="Circle 게시글 피드">
            <h1 className="pt-6 text-2xl font-bold text-ink">Circle</h1>

            <div className="flex h-[72px] items-end gap-8 border-b border-[#f1efed]">
              <button type="button" onClick={() => setSortMode("latest")} aria-pressed={sortMode === "latest"} className={`h-full border-b pb-4 pt-5 text-sm ${sortMode === "latest" ? "border-ink font-medium text-ink" : "border-transparent text-ink-soft hover:text-ink"}`}>
                최신
              </button>
              <button type="button" onClick={() => setSortMode("popular")} aria-pressed={sortMode === "popular"} className={`h-full border-b pb-4 pt-5 text-sm ${sortMode === "popular" ? "border-ink font-medium text-ink" : "border-transparent text-ink-soft hover:text-ink"}`}>
                인기
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-b border-[#f1efed] py-3">
              <button type="button" onClick={() => setQuestionOnly((value) => !value)} aria-pressed={questionOnly} className={questionOnly ? "rounded-md border border-accent bg-accent px-3 py-1.5 text-xs text-white" : "rounded-md border border-[#e6e4e1] px-3 py-1.5 text-xs text-ink-soft hover:border-ink hover:text-ink"}>
                질문만 보기
              </button>
              <button type="button" onClick={() => setUnansweredQuestionOnly((value) => !value)} aria-pressed={unansweredQuestionOnly} className={unansweredQuestionOnly ? "rounded-md border border-accent bg-accent px-3 py-1.5 text-xs text-white" : "rounded-md border border-[#e6e4e1] px-3 py-1.5 text-xs text-ink-soft hover:border-ink hover:text-ink"}>
                답변 없는 질문만
              </button>
            </div>

            <label className="relative mt-5 block sm:hidden">
              <span className="sr-only">Circle 글 검색</span>
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Circle 검색" className="h-10 w-full rounded-full bg-black/[0.035] px-4 text-sm focus:outline-none focus:ring-1 focus:ring-ink/20" />
            </label>

            {errorMessage && <div className="my-5 border border-error/30 px-4 py-3 text-sm text-error" role="alert">{errorMessage}</div>}

            {isLoading ? (
              <div aria-label="Circle 글 불러오는 중">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="animate-pulse border-b border-[#f1efed] py-8">
                    <div className="mb-4 h-3 w-32 rounded bg-border" />
                    <div className="mb-3 h-7 w-4/5 rounded bg-border" />
                    <div className="h-4 w-3/5 rounded bg-border" />
                  </div>
                ))}
              </div>
            ) : visiblePosts.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-sm text-ink-soft">
                  {searchQuery
                    ? "검색 결과가 없어요."
                    : unansweredQuestionOnly
                      ? "답변 없는 질문이 없어요. 모든 질문에 답변이 달렸어요!"
                      : questionOnly
                        ? "질문 태그가 달린 글이 없어요."
                        : "아직 등록된 Circle 글이 없어요."}
                </p>
                <Link href="/circle/new" className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-hover">새 글 작성하기</Link>
              </div>
            ) : (
              <div>
                {visiblePosts.map((post) => (
                  <CirclePostCard
                    key={post.id}
                    post={post}
                    authorName={nicknames[post.user_id] ?? post.author}
                    authorAvatarUrl={avatars[post.user_id]}
                    currentUserId={currentUser?.id}
                    commentCount={commentCounts[post.id] || 0}
                    reactionCount={reactionCounts[post.id] || 0}
                    previewComments={topComments[post.id] || []}
                    nicknames={nicknames}
                    isEditing={editingId === post.id}
                    editTitle={editTitle}
                    onEditTitleChange={setEditTitle}
                    onStartEdit={() => startEdit(post)}
                    onCancelEdit={() => setEditingId(null)}
                    onSaveEdit={() => void updatePost(post.id)}
                    onDelete={() => void deletePost(post.id)}
                  />
                ))}
              </div>
            )}
          </section>

          <div className="hidden xl:block bg-[#f1efed]" aria-hidden="true" />

          <HomeSidebar posts={posts} commentCounts={commentCounts} reactionCounts={reactionCounts} nicknames={nicknames} isLoggedIn={!!currentUser} />
        </div>
      </div>
    </WorkspaceFrame>
  );
}
