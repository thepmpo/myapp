"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

type Post = {
  id: number;
  title: string;
  author: string;
  user_id: string;
  is_featured: boolean;
  created_at: string;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function AdminFeaturedPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nicknames, setNicknames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);

    const { data, error: fetchError } = await supabase
      .from("posts")
      .select("id, title, author, user_id, is_featured, created_at")
      .order("id", { ascending: false })
      .limit(100);

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    const fetchedPosts = (data as Post[]) || [];
    setPosts(fetchedPosts);

    const uniqueIds = Array.from(new Set(fetchedPosts.map((p) => p.user_id).filter((id) => id && UUID_REGEX.test(id))));

    if (uniqueIds.length > 0) {
      const { data: profiles } = await supabase.from("profiles").select("id, nickname").in("id", uniqueIds);
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
  }, []);

  const toggleFeatured = async (post: Post) => {
    setError("");
    setSavingId(post.id);

    const { data, error: updateError } = await supabase
      .from("posts")
      .update({ is_featured: !post.is_featured })
      .eq("id", post.id)
      .select();

    setSavingId(null);

    if (updateError || !data || data.length === 0) {
      setError(updateError?.message ?? "게시글을 찾을 수 없어 저장하지 못했습니다");
      return;
    }

    setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, is_featured: !p.is_featured } : p)));
  };

  const featuredCount = posts.filter((p) => p.is_featured).length;

  return (
    <div>
      <p className="text-sm text-ink-soft mb-4">
        여기서 켠 글만 홈 화면 "지금 인기 있는 Circle 글"에 노출됩니다. 현재 {featuredCount}개 선택됨.
      </p>

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="text-sm text-ink-soft">로딩중...</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-ink-soft">Circle 게시글이 없어요.</p>
      ) : (
        <div className="flex flex-col">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{post.title}</p>
                <p className="text-xs text-ink-soft">{nicknames[post.user_id] ?? post.author}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleFeatured(post)}
                disabled={savingId === post.id}
                className={`shrink-0 px-3 py-1.5 rounded-md border text-xs font-medium cursor-pointer ${
                  post.is_featured
                    ? "border-accent bg-accent text-white hover:bg-accent-hover"
                    : "border-border bg-surface text-ink-soft hover:bg-black/[0.03]"
                }`}
              >
                {savingId === post.id ? "저장 중..." : post.is_featured ? "추천 중" : "추천하기"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
