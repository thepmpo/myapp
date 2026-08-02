"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";

type Post = {
  id: number;
  title: string;
  author: string;
  user_id: string;
  is_question: boolean;
};

type PreviewComment = {
  id: number;
  post_id: number;
  user_id: string;
  author: string;
  content: string;
  likeCount: number;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function Home() {
  const [title, setTitle] = useState("");
  const [isQuestion, setIsQuestion] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
  const [questionOnly, setQuestionOnly] = useState(false);
  const [unansweredQuestionOnly, setUnansweredQuestionOnly] = useState(false);
  const [topCommentsByPost, setTopCommentsByPost] = useState<Record<number, PreviewComment[]>>({});
  const [commentCountByPost, setCommentCountByPost] = useState<Record<number, number>>({});
  const [nicknames, setNicknames] = useState<Record<string, string>>({});
  const titleInputRef = useRef<HTMLInputElement>(null);

  const fetchNicknames = async (userIds: string[]) => {
    const uniqueIds = Array.from(new Set(userIds.filter((id) => id && UUID_REGEX.test(id))));

    if (uniqueIds.length === 0) return;

    const { data, error } = await supabase.from("profiles").select("id, nickname").in("id", uniqueIds);

    if (!error) {
      const map: Record<string, string> = {};
      (data || []).forEach((p: { id: string; nickname: string }) => {
        map[p.id] = p.nickname;
      });
      setNicknames((prev) => ({ ...prev, ...map }));
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setCurrentUser({ id: data.user.id, email: data.user.email ?? "" });
      }
    };

    loadUser();
  }, []);

  const getPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      alert(error.message);
    } else {
      const fetchedPosts = (data as Post[]) || [];
      setPosts(fetchedPosts);
      await fetchNicknames(fetchedPosts.map((p) => p.user_id));
      await fetchTopComments(fetchedPosts.map((p) => p.id));
    }
  };

  const fetchTopComments = async (postIds: number[]) => {
    if (postIds.length === 0) {
      setTopCommentsByPost({});
      setCommentCountByPost({});
      return;
    }

    const { data: commentsData, error: commentsError } = await supabase
      .from("comments")
      .select("id, post_id, user_id, author, content")
      .in("post_id", postIds);

    if (commentsError || !commentsData || commentsData.length === 0) {
      setTopCommentsByPost({});
      setCommentCountByPost({});
      return;
    }

    const counts: Record<number, number> = {};
    commentsData.forEach((c) => {
      counts[c.post_id] = (counts[c.post_id] || 0) + 1;
    });
    setCommentCountByPost(counts);

    const commentIds = commentsData.map((c) => c.id);

    const { data: likesData } = await supabase
      .from("likes")
      .select("comment_id")
      .in("comment_id", commentIds);

    const likeCountByComment: Record<number, number> = {};
    (likesData || []).forEach((l: { comment_id: number | null }) => {
      if (l.comment_id != null) {
        likeCountByComment[l.comment_id] = (likeCountByComment[l.comment_id] || 0) + 1;
      }
    });

    const withCounts: PreviewComment[] = commentsData.map((c) => ({
      id: c.id,
      post_id: c.post_id,
      user_id: c.user_id,
      author: c.author,
      content: c.content,
      likeCount: likeCountByComment[c.id] || 0,
    }));

    await fetchNicknames(commentsData.map((c) => c.user_id));

    const grouped: Record<number, PreviewComment[]> = {};
    withCounts.forEach((c) => {
      if (!grouped[c.post_id]) grouped[c.post_id] = [];
      grouped[c.post_id].push(c);
    });

    Object.keys(grouped).forEach((key) => {
      const postId = Number(key);
      grouped[postId] = grouped[postId]
        .sort((a, b) => b.likeCount - a.likeCount)
        .slice(0, 2);
    });

    setTopCommentsByPost(grouped);
  };

  useEffect(() => {
    getPosts();
  }, []);

  const addPost = async () => {
    if (!currentUser) {
      alert("로그인이 필요합니다");
      window.location.href = "/login";
      return;
    }

    if (!title) {
      alert("제목을 입력하세요");
      return;
    }

    const { error } = await supabase.from("posts").insert([
      {
        title: title,
        author: currentUser.email,
        user_id: currentUser.id,
        is_question: isQuestion,
      },
    ]);

    if (error) {
      alert(error.message);
    } else {
      setTitle("");
      setIsQuestion(false);
      await getPosts();
    }
  };

  const deletePost = async (id: number) => {
    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (error) {
      alert(error.message);
    } else {
      await getPosts();
    }
  };

  const startEdit = (post: Post) => {
    setEditingId(post.id);
    setEditTitle(post.title);
  };

  const updatePost = async (id: number) => {
    if (!editTitle) {
      alert("수정할 내용을 입력하세요");
      return;
    }

    const { error } = await supabase
      .from("posts")
      .update({ title: editTitle })
      .eq("id", id);

    if (error) {
      alert(error.message);
    } else {
      setEditingId(null);
      setEditTitle("");
      await getPosts();
    }
  };

  return (
    <div className="flex gap-8 items-start">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold text-ink mb-1.5">Circle</h1>
        <p className="text-sm text-ink-soft mb-5">질문하고 답하며 함께 성장하는 자리예요</p>

        <div className="flex gap-2 mb-3">
          <input
            ref={titleInputRef}
            placeholder="글 제목 입력"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent/30"
          />

          <button
            onClick={addPost}
            className="px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium shadow-[0_2px_0_rgba(23,27,35,0.15)] hover:bg-accent-hover cursor-pointer"
          >
            + 글쓰기
          </button>
        </div>

        <label className="flex items-center gap-1.5 mb-5 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={isQuestion}
            onChange={(e) => setIsQuestion(e.target.checked)}
          />
          🙋 질문있어요
        </label>

        <div className="flex items-center gap-2 mb-5">
          <button
            onClick={getPosts}
            className="px-3 py-1.5 rounded-md border border-border bg-surface text-xs text-ink-soft hover:bg-black/[0.03] cursor-pointer"
          >
            🔄 새로고침
          </button>

          <button
            onClick={() => setQuestionOnly((v) => !v)}
            className={`px-3 py-1.5 rounded-md border text-xs cursor-pointer ${
              questionOnly
                ? "border-accent bg-surface text-accent font-bold"
                : "border-border bg-surface text-ink-soft font-medium hover:bg-black/[0.03]"
            }`}
          >
            🙋 질문만 보기
          </button>

          <button
            onClick={() => setUnansweredQuestionOnly((v) => !v)}
            className={`px-3 py-1.5 rounded-md border text-xs cursor-pointer ${
              unansweredQuestionOnly
                ? "border-accent bg-surface text-accent font-bold"
                : "border-border bg-surface text-ink-soft font-medium hover:bg-black/[0.03]"
            }`}
          >
            🙋 답변 없는 질문만
          </button>
        </div>

        {posts.length === 0 && <p className="text-sm text-ink-soft">❌ 데이터 없음</p>}

        <div className="flex flex-col gap-3">
          {posts
            .filter((post) => !questionOnly || post.is_question)
            .filter(
              (post) =>
                !unansweredQuestionOnly ||
                (post.is_question && (commentCountByPost[post.id] || 0) === 0)
            )
            .map((post) => (
            <div
              key={post.id}
              className={`bg-surface rounded-xl border p-4 shadow-[0_1px_3px_rgba(23,27,35,0.045)] ${
                post.is_question ? "border-border border-l-2 border-l-question" : "border-border"
              }`}
            >
              {post.is_question && (
                <span className="inline-block mb-2 text-xs font-bold text-question">
                  🙋 질문있어요
                </span>
              )}

              {editingId === post.id ? (
                <>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-md border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />

                  <div className="mt-2.5 flex gap-2">
                    <button
                      onClick={() => updatePost(post.id)}
                      className="px-2.5 py-1.5 rounded-md bg-accent text-white text-xs font-medium cursor-pointer hover:bg-accent-hover"
                    >
                      저장
                    </button>

                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2.5 py-1.5 rounded-md border border-border bg-surface text-xs cursor-pointer hover:bg-black/[0.03]"
                    >
                      취소
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href={`/post/${post.id}`}
                    className="block font-bold text-base text-ink hover:text-accent"
                  >
                    {post.title}
                  </Link>

                  <Link
                    href={`/profile/${post.user_id}`}
                    className="inline-block mt-1.5 text-sm font-mono text-ink-soft hover:text-accent"
                  >
                    {nicknames[post.user_id] ?? post.author}
                  </Link>

                  {currentUser?.id === post.user_id && (
                    <div className="mt-2.5 flex gap-2">
                      <button
                        onClick={() => startEdit(post)}
                        className="px-2.5 py-1.5 rounded-md border border-border bg-surface text-xs cursor-pointer hover:bg-black/[0.03]"
                      >
                        수정
                      </button>

                      <button
                        onClick={() => deletePost(post.id)}
                        className="px-2.5 py-1.5 rounded-md bg-red-500 text-white text-xs cursor-pointer hover:bg-red-600"
                      >
                        삭제
                      </button>
                    </div>
                  )}

                  {(topCommentsByPost[post.id] || []).length > 0 && (
                    <div className="mt-2.5 pt-2.5 border-t border-border flex flex-col gap-1.5">
                      {topCommentsByPost[post.id].map((c) => (
                        <div key={c.id} className="text-[13px] text-ink-soft">
                          <span className="text-ink-soft">✦</span>{" "}
                          <strong className="text-ink">{nicknames[c.user_id] ?? c.author}</strong> {c.content}
                          {c.likeCount > 0 && (
                            <span className="text-ink-soft/70 ml-1.5">❤️ {c.likeCount}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col gap-3 bg-surface border border-border rounded-xl p-5 shadow-[0_1px_3px_rgba(23,27,35,0.045)] sticky top-8">
        <p className="font-bold text-ink">궁금한 게 있으신가요?</p>
        <p className="text-sm text-ink-soft">질문을 올리면 답변자들이 확인해요.</p>
        <button
          onClick={() => titleInputRef.current?.focus()}
          className="px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium shadow-[0_2px_0_rgba(23,27,35,0.15)] hover:bg-accent-hover cursor-pointer"
        >
          질문하기
        </button>
      </aside>
    </div>
  );
}