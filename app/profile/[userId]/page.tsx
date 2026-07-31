"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";

const BADGE_THRESHOLD = 30;

function BadgeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5" />
    </svg>
  );
}

export default function Profile() {
  const params = useParams();
  const userId = params.userId as string;

  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [nickname, setNickname] = useState("");
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const me = userData.user ? { id: userData.user.id } : null;
      setCurrentUser(me);

      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", userId)
        .maybeSingle();

      setNickname(profile?.nickname ?? "(알 수 없는 유저)");

      const { count: followers } = await supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("following_id", userId);

      const { count: following } = await supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("follower_id", userId);

      setFollowerCount(followers ?? 0);
      setFollowingCount(following ?? 0);

      if (me && me.id !== userId) {
        const { data: existing } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", me.id)
          .eq("following_id", userId)
          .maybeSingle();

        setIsFollowing(!!existing);
      }

      setLoading(false);
    };

    load();
  }, [userId]);

  const toggleFollow = async () => {
    if (!currentUser) {
      alert("로그인이 필요합니다");
      window.location.href = "/login";
      return;
    }

    if (isFollowing) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUser.id)
        .eq("following_id", userId);

      if (error) {
        alert(error.message);
      } else {
        setIsFollowing(false);
        setFollowerCount((c) => c - 1);
      }
    } else {
      const { error } = await supabase
        .from("follows")
        .insert([{ follower_id: currentUser.id, following_id: userId }]);

      if (error) {
        alert(error.message);
      } else {
        setIsFollowing(true);
        setFollowerCount((c) => c + 1);
      }
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) return <p className="text-sm text-ink-soft">로딩중...</p>;

  const hasBadge = followerCount >= BADGE_THRESHOLD;

  return (
    <div className="max-w-[480px] mx-auto bg-surface rounded-xl border border-border shadow-[0_1px_3px_rgba(23,27,35,0.045)] p-8">
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-border" />

        <h1 className="mt-4 text-lg font-bold text-ink">{nickname}</h1>

        {hasBadge ? (
          <span className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-sage text-white text-xs font-bold">
            <BadgeIcon />
            팔로우 {BADGE_THRESHOLD}명 이상 뱃지
          </span>
        ) : (
          <p className="mt-3 text-sm text-ink-soft">아직 획득한 뱃지가 없어요</p>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-border flex items-center justify-center gap-10">
        <Link
          href={`/profile/${userId}/follows?tab=followers`}
          className="text-center text-ink hover:text-cobalt"
        >
          <div className="text-base font-bold">{followerCount}</div>
          <div className="text-xs text-ink-soft">팔로워</div>
        </Link>
        <Link
          href={`/profile/${userId}/follows?tab=following`}
          className="text-center text-ink hover:text-cobalt"
        >
          <div className="text-base font-bold">{followingCount}</div>
          <div className="text-xs text-ink-soft">팔로잉</div>
        </Link>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        {isOwnProfile ? (
          <div className="flex gap-2">
            <Link
              href="/profile/edit"
              className="flex-1 py-2.5 rounded-lg border border-border bg-surface text-sm font-medium text-ink text-center hover:bg-black/[0.03]"
            >
              정보 수정
            </Link>
            <button
              onClick={logout}
              className="flex-1 py-2.5 rounded-lg border border-border bg-surface text-sm font-medium text-ink cursor-pointer hover:bg-black/[0.03]"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <button
            onClick={toggleFollow}
            className={`w-full py-2.5 rounded-lg text-sm font-medium cursor-pointer ${
              isFollowing
                ? "border border-border bg-surface text-ink-soft hover:bg-black/[0.03]"
                : "bg-cobalt text-white shadow-[0_2px_0_rgba(23,27,35,0.15)] hover:bg-cobalt-dark"
            }`}
          >
            {isFollowing ? "팔로잉" : "팔로우"}
          </button>
        )}
      </div>
    </div>
  );
}
