// Trends/AI 하단 공용: Circle 목록과 동일한 카드 UI로 최신 Circle 글을 보여줌
// (필터링 없이 최신순 — 카테고리 콘텐츠와 실제로 연관될 필요는 없음, UI 패턴만 재사용).
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import CirclePostCard from "@/app/components/home/CirclePostCard";
import type { HomePost } from "@/app/components/home/types";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PREVIEW_COUNT = 5;

const noop = () => {};

export default function CategoryCirclePreview() {
  const [posts, setPosts] = useState<HomePost[]>([]);
  const [nicknames, setNicknames] = useState<Record<string, string>>({});
  const [avatars, setAvatars] = useState<Record<string, string>>({});
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});
  const [reactionCounts, setReactionCounts] = useState<Record<number, number>>({});
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  useEffect(() => {
    let active = true;

    const fetchNicknames = async (userIds: string[]) => {
      const uniqueIds = Array.from(new Set(userIds.filter((id) => id && UUID_REGEX.test(id))));
      if (uniqueIds.length === 0) return;

      const { data } = await supabase.from("profiles").select("id, nickname, avatar_url").in("id", uniqueIds);
      if (!active) return;

      const nextNicknames: Record<string, string> = {};
      const nextAvatars: Record<string, string> = {};
      (data || []).forEach((profile: { id: string; nickname: string; avatar_url: string | null }) => {
        nextNicknames[profile.id] = profile.nickname;
        if (profile.avatar_url) nextAvatars[profile.id] = profile.avatar_url;
      });
      setNicknames((previous) => ({ ...previous, ...nextNicknames }));
      setAvatars((previous) => ({ ...previous, ...nextAvatars }));
    };

    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (active && userData.user) setCurrentUserId(userData.user.id);

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("id", { ascending: false })
        .limit(PREVIEW_COUNT);

      if (!active || error) return;

      const fetchedPosts = (data as HomePost[]) || [];
      setPosts(fetchedPosts);
      await fetchNicknames(fetchedPosts.map((post) => post.user_id));

      const postIds = fetchedPosts.map((post) => post.id);
      if (postIds.length === 0) return;

      const [{ data: commentsData }, { data: likesData }] = await Promise.all([
        supabase.from("comments").select("post_id").in("post_id", postIds),
        supabase.from("likes").select("post_id").in("post_id", postIds),
      ]);
      if (!active) return;

      const nextCommentCounts: Record<number, number> = {};
      (commentsData || []).forEach((c: { post_id: number }) => {
        nextCommentCounts[c.post_id] = (nextCommentCounts[c.post_id] || 0) + 1;
      });
      setCommentCounts(nextCommentCounts);

      const nextReactionCounts: Record<number, number> = {};
      (likesData || []).forEach((l: { post_id: number | null }) => {
        if (l.post_id != null) nextReactionCounts[l.post_id] = (nextReactionCounts[l.post_id] || 0) + 1;
      });
      setReactionCounts(nextReactionCounts);
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="py-10" aria-label="Circle에서 지금 나누는 이야기">
      <h2 className="mb-2 text-xl font-bold text-ink">Circle에서 지금 나누는 이야기</h2>
      <div>
        {posts.map((post) => (
          <CirclePostCard
            key={post.id}
            post={post}
            authorName={nicknames[post.user_id] ?? post.author}
            authorAvatarUrl={avatars[post.user_id]}
            currentUserId={currentUserId}
            commentCount={commentCounts[post.id] || 0}
            reactionCount={reactionCounts[post.id] || 0}
            previewComments={[]}
            nicknames={nicknames}
            isEditing={false}
            editTitle=""
            onEditTitleChange={noop}
            onStartEdit={noop}
            onCancelEdit={noop}
            onSaveEdit={noop}
            onDelete={noop}
          />
        ))}
      </div>
    </section>
  );
}
