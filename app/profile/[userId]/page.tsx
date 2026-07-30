"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";

const BADGE_THRESHOLD = 30;

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

  if (loading) return <div style={{ padding: 40 }}>로딩중...</div>;

  const hasBadge = followerCount >= BADGE_THRESHOLD;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 40 }}>
      <h1 style={{ marginBottom: 16 }}>{nickname}</h1>

      {hasBadge ? (
        <span
          style={{
            display: "inline-block",
            marginBottom: 16,
            padding: "4px 10px",
            borderRadius: 4,
            background: "#5C8A72",
            color: "#fff",
            fontSize: 12,
            fontWeight: "bold",
          }}
        >
          🏅 팔로우 {BADGE_THRESHOLD}명 이상 뱃지
        </span>
      ) : (
        <p style={{ color: "#666", fontSize: 13, marginBottom: 16 }}>아직 획득한 뱃지가 없어요</p>
      )}

      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <Link href={`/profile/${userId}/follows?tab=followers`}>
          팔로워 {followerCount}
        </Link>
        <Link href={`/profile/${userId}/follows?tab=following`}>
          팔로잉 {followingCount}
        </Link>
      </div>

      {isOwnProfile ? (
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/profile/edit">정보 수정</Link>
          <button onClick={logout}>로그아웃</button>
        </div>
      ) : (
        <button onClick={toggleFollow}>{isFollowing ? "팔로잉" : "팔로우"}</button>
      )}
    </div>
  );
}
