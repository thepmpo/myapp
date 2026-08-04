"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";

type ListItem = {
  userId: string;
  nickname: string;
};

export default function FollowList() {
  const params = useParams();
  const userId = params.userId as string;
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "following" ? "following" : "followers";

  const [tab, setTab] = useState<"followers" | "following">(initialTab);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const me = userData.user ? { id: userData.user.id } : null;
      setCurrentUser(me);

      const { data: relations } = await supabase
        .from("follows")
        .select("follower_id, following_id")
        .eq(tab === "followers" ? "following_id" : "follower_id", userId);

      const otherIds = (relations || []).map((r) =>
        tab === "followers" ? r.follower_id : r.following_id
      );

      if (otherIds.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nickname")
        .in("id", otherIds);

      setItems(
        otherIds.map((id) => ({
          userId: id,
          nickname: profiles?.find((p) => p.id === id)?.nickname ?? "(알 수 없는 유저)",
        }))
      );

      if (me) {
        const { data: myFollowing } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", me.id);

        setFollowingIds(new Set((myFollowing || []).map((f) => f.following_id)));
      }

      setLoading(false);
    };

    load();
  }, [userId, tab]);

  const toggleFollow = async (targetId: string) => {
    if (!currentUser) {
      alert("로그인이 필요합니다");
      window.location.href = "/login";
      return;
    }

    const alreadyFollowing = followingIds.has(targetId);

    if (alreadyFollowing) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUser.id)
        .eq("following_id", targetId);

      if (error) {
        alert(error.message);
      } else {
        setFollowingIds((prev) => {
          const next = new Set(prev);
          next.delete(targetId);
          return next;
        });
      }
    } else {
      const { error } = await supabase
        .from("follows")
        .insert([{ follower_id: currentUser.id, following_id: targetId }]);

      if (error) {
        alert(error.message);
      } else {
        setFollowingIds((prev) => new Set(prev).add(targetId));
      }
    }
  };

  return (
    <div className="px-5 py-8 sm:px-8">
    <div className="max-w-[480px] mx-auto bg-surface rounded-xl border border-border shadow-[0_1px_3px_rgba(23,27,35,0.045)] p-8">
      <div className="flex gap-6 border-b border-border mb-5">
        <button
          onClick={() => setTab("followers")}
          className={`pb-3 text-sm cursor-pointer ${
            tab === "followers"
              ? "text-ink font-bold border-b-2 border-accent"
              : "text-ink-soft"
          }`}
        >
          팔로워
        </button>
        <button
          onClick={() => setTab("following")}
          className={`pb-3 text-sm cursor-pointer ${
            tab === "following"
              ? "text-ink font-bold border-b-2 border-accent"
              : "text-ink-soft"
          }`}
        >
          팔로잉
        </button>
      </div>

      {loading && <p className="text-sm text-ink-soft">로딩중...</p>}

      {!loading && items.length === 0 && (
        <p className="text-sm text-ink-soft">아직 팔로워/팔로잉이 없어요</p>
      )}

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.userId} className="flex items-center justify-between">
            <span className="flex items-center gap-3 text-sm font-medium text-ink">
              <span className="w-9 h-9 rounded-full bg-border shrink-0" />
              {item.nickname}
            </span>

            {currentUser?.id !== item.userId && (
              <button
                onClick={() => toggleFollow(item.userId)}
                className={`px-3 py-1.5 rounded-md border text-xs font-medium cursor-pointer ${
                  followingIds.has(item.userId)
                    ? "border-border bg-surface text-ink-soft hover:bg-black/[0.03]"
                    : "border-accent text-accent hover:bg-accent/5"
                }`}
              >
                {followingIds.has(item.userId) ? "팔로잉" : "팔로우"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}
