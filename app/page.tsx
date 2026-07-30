"use client";

import { useState, useEffect } from "react";
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
  author: string;
  content: string;
  likeCount: number;
};

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
      .select("id, post_id, author, content")
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
      author: c.author,
      content: c.content,
      likeCount: likeCountByComment[c.id] || 0,
    }));

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
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h1 style={{ marginBottom: 20 }}>게시글 목록</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        <input
          placeholder="글 제목 입력"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            flex: 1,
            padding: 10,
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
        />

        <button
          onClick={addPost}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            backgroundColor: "#000",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          추가
        </button>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, fontSize: 14, color: "#5B6472" }}>
        <input
          type="checkbox"
          checked={isQuestion}
          onChange={(e) => setIsQuestion(e.target.checked)}
        />
        🙋 질문있어요
      </label>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button
          onClick={getPosts}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid #ccc",
            background: "#f9f9f9",
            cursor: "pointer",
          }}
        >
          🔄 새로고침
        </button>

        <button
          onClick={() => setQuestionOnly((v) => !v)}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: questionOnly ? "1px solid #E2A33B" : "1px solid #ccc",
            background: questionOnly ? "#FBF0DB" : "#f9f9f9",
            color: questionOnly ? "#8A5B0E" : "#000",
            cursor: "pointer",
          }}
        >
          🙋 질문만 보기
        </button>

        <button
          onClick={() => setUnansweredQuestionOnly((v) => !v)}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: unansweredQuestionOnly ? "1px solid #E2A33B" : "1px solid #ccc",
            background: unansweredQuestionOnly ? "#FBF0DB" : "#f9f9f9",
            color: unansweredQuestionOnly ? "#8A5B0E" : "#000",
            cursor: "pointer",
          }}
        >
          🙋 답변 없는 질문만
        </button>
      </div>

      {posts.length === 0 && <p>❌ 데이터 없음</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
            style={{
              border: "1px solid #eee",
              borderLeft: post.is_question ? "3px solid #E2A33B" : "1px solid #eee",
              borderRadius: 12,
              padding: 16,
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
          >
            {post.is_question && (
              <span
                style={{
                  display: "inline-block",
                  marginBottom: 8,
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: "#FBF0DB",
                  color: "#8A5B0E",
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              >
                🙋 질문있어요
              </span>
            )}

            {editingId === post.id ? (
              <>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 8,
                    border: "1px solid #ddd",
                    borderRadius: 6,
                  }}
                />

                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                  <button
                    onClick={() => updatePost(post.id)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "none",
                      backgroundColor: "#000",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    저장
                  </button>

                  <button
                    onClick={() => setEditingId(null)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid #ccc",
                      background: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    취소
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: "bold", fontSize: 16 }}>
                  {post.title}
                </div>

                <div style={{ color: "#666", marginTop: 6 }}>
                  <Link href={`/profile/${post.user_id}`}>{post.author}</Link>
                </div>

                {currentUser?.id === post.user_id && (
                  <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                    <button
                      onClick={() => startEdit(post)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        background: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      수정
                    </button>

                    <button
                      onClick={() => deletePost(post.id)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "none",
                        backgroundColor: "#ff4d4f",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      삭제
                    </button>
                  </div>
                )}

                {(topCommentsByPost[post.id] || []).length > 0 && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #eee", display: "flex", flexDirection: "column", gap: 6 }}>
                    {topCommentsByPost[post.id].map((c) => (
                      <div key={c.id} style={{ fontSize: 13, color: "#5B6472" }}>
                        💬 <strong>{c.author}</strong> {c.content}
                        {c.likeCount > 0 && (
                          <span style={{ color: "#999", marginLeft: 6 }}>❤️ {c.likeCount}</span>
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
  );
}