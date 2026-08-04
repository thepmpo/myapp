"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { PASSWORD_RULE_MESSAGE, isValidPassword } from "@/app/lib/passwordRules";

const NICKNAME_COOLDOWN_DAYS = 30;
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ProfileEdit() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [nicknameSaving, setNicknameSaving] = useState(false);
  const [nicknameLockedUntil, setNicknameLockedUntil] = useState<Date | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const [withdrawing, setWithdrawing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      setUserId(data.user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname, nickname_changed_at, avatar_url")
        .eq("id", data.user.id)
        .maybeSingle();

      setNickname(profile?.nickname ?? "");
      setAvatarUrl(profile?.avatar_url ?? null);

      if (profile?.nickname_changed_at) {
        const changedAt = new Date(profile.nickname_changed_at);
        const unlocksAt = new Date(changedAt.getTime() + NICKNAME_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);

        if (unlocksAt > new Date()) {
          setNicknameLockedUntil(unlocksAt);
        }
      }

      setLoading(false);
    };

    load();
  }, []);

  const saveAvatar = async (file: File) => {
    if (!userId) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError("jpg, png, webp 형식의 이미지만 업로드할 수 있어요");
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setAvatarError("이미지 용량은 5MB 이하만 업로드할 수 있어요");
      return;
    }

    setAvatarError("");
    setAvatarUploading(true);

    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
    const path = `${userId}/${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file);

    if (uploadError) {
      setAvatarUploading(false);
      setAvatarError(uploadError.message);
      return;
    }

    const publicUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;

    const { data, error } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", userId)
      .select();

    setAvatarUploading(false);

    if (error || !data || data.length === 0) {
      setAvatarError(error?.message ?? "프로필 정보를 찾을 수 없어 저장하지 못했습니다");
      return;
    }

    setAvatarUrl(publicUrl);
  };

  const saveNickname = async () => {
    if (!userId) return;

    if (!nickname.trim()) {
      setNicknameError("닉네임을 입력해주세요");
      return;
    }

    setNicknameError("");
    setNicknameSaving(true);

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("nickname", nickname)
      .neq("id", userId)
      .maybeSingle();

    if (existing) {
      setNicknameSaving(false);
      setNicknameError("이미 사용 중인 닉네임입니다");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({ nickname })
      .eq("id", userId)
      .select();

    setNicknameSaving(false);

    if (error) {
      setNicknameError(
        error.message.includes("한 달에 한 번")
          ? "닉네임은 한 달에 한 번만 변경할 수 있어요"
          : error.message
      );
    } else if (!data || data.length === 0) {
      setNicknameError("프로필 정보를 찾을 수 없어 저장하지 못했습니다");
    } else {
      setNicknameLockedUntil(new Date(Date.now() + NICKNAME_COOLDOWN_DAYS * 24 * 60 * 60 * 1000));
      alert("닉네임이 변경되었습니다");
    }
  };

  const savePassword = async () => {
    if (!isValidPassword(newPassword)) {
      setPasswordError(PASSWORD_RULE_MESSAGE);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다");
      return;
    }

    setPasswordError("");
    setPasswordSaving(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setPasswordSaving(false);

    if (error) {
      setPasswordError(error.message);
    } else {
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSaved(true);
    }
  };

  const withdraw = async () => {
    setWithdrawing(true);

    const { error } = await supabase.rpc("delete_own_account");

    if (error) {
      setWithdrawing(false);
      setShowWithdrawModal(false);
      alert(error.message);
      return;
    }

    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) return <p className="text-sm text-ink-soft">로딩중...</p>;

  return (
    <div className="max-w-[480px] mx-auto bg-surface rounded-xl border border-border shadow-[0_1px_3px_rgba(23,27,35,0.045)] p-8">
      <Link
        href={`/profile/${userId}`}
        className="inline-block mb-5 text-sm text-ink-soft hover:text-accent"
      >
        ← 프로필로
      </Link>

      <h1 className="text-xl font-bold text-ink mb-6">내 정보 수정</h1>

      <section className="mb-8 flex flex-col items-center">
        <label className="relative cursor-pointer group">
          <div className="w-20 h-20 rounded-full bg-border overflow-hidden">
            {avatarUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <span className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-all">
            변경
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) saveAvatar(file);
            }}
          />
        </label>

        {avatarUploading && <p className="mt-2 text-xs text-ink-soft">업로드 중...</p>}
        {avatarError && <p className="mt-2 text-xs text-red-500">{avatarError}</p>}
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-medium text-ink mb-2">닉네임 변경</h2>

        <div className="flex gap-2">
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            disabled={!!nicknameLockedUntil}
            className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:bg-paper disabled:text-ink-soft"
          />
          <button
            onClick={saveNickname}
            disabled={nicknameSaving || !!nicknameLockedUntil}
            className="px-4 py-2.5 rounded-lg border border-border bg-surface text-sm font-medium text-ink cursor-pointer hover:bg-black/[0.03] disabled:opacity-60"
          >
            {nicknameSaving ? "저장 중..." : "저장"}
          </button>
        </div>

        {nicknameLockedUntil ? (
          <p className="mt-1.5 text-sm text-ink-soft">닉네임은 한 달에 한 번만 변경할 수 있어요</p>
        ) : (
          nicknameError && <p className="mt-1.5 text-sm text-red-500">{nicknameError}</p>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-medium text-ink mb-2">비밀번호 변경</h2>

        <div className="flex flex-col gap-2">
          <input
            type="password"
            placeholder="8자 이상, 영문+숫자 조합"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setPasswordSaved(false);
            }}
            className="px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <input
            type="password"
            placeholder="새 비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setPasswordSaved(false);
            }}
            className="px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <button
            onClick={savePassword}
            disabled={passwordSaving}
            className="self-start px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium shadow-[0_2px_0_rgba(23,27,35,0.15)] hover:bg-accent-hover disabled:bg-border disabled:text-ink-soft cursor-pointer"
          >
            {passwordSaving ? "변경 중..." : "비밀번호 변경"}
          </button>
        </div>

        {passwordError && <p className="mt-1.5 text-sm text-red-500">{passwordError}</p>}
        {passwordSaved && <p className="mt-1.5 text-sm text-ink-soft">비밀번호가 변경되었습니다</p>}
      </section>

      <div className="mt-14 pt-4 border-t border-border flex justify-end">
        <button
          onClick={() => setShowWithdrawModal(true)}
          className="text-xs text-ink-soft/70 bg-transparent border-none cursor-pointer hover:text-red-500"
        >
          회원 탈퇴
        </button>
      </div>

      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[380px] bg-surface rounded-xl border border-border shadow-[0_1px_3px_rgba(23,27,35,0.045)] p-6">
            <div className="flex items-center gap-2 text-red-500 mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <h2 className="text-base font-bold">정말 탈퇴하시겠어요?</h2>
            </div>

            <p className="text-sm text-ink-soft mb-1.5">
              이 작업은 <strong className="text-ink">되돌릴 수 없습니다.</strong>
            </p>
            <p className="text-sm text-ink-soft mb-6">
              닉네임은 그대로 유지되고, 작성하신 게시글과 댓글도 삭제되지 않습니다. 프로필 사진만 기본 이미지로 초기화됩니다.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setShowWithdrawModal(false)}
                disabled={withdrawing}
                className="flex-1 py-2.5 rounded-lg border border-border bg-surface text-sm font-medium text-ink cursor-pointer hover:bg-black/[0.03] disabled:opacity-60"
              >
                취소
              </button>
              <button
                onClick={withdraw}
                disabled={withdrawing}
                className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium cursor-pointer hover:bg-red-600 disabled:opacity-60"
              >
                {withdrawing ? "탈퇴 처리 중..." : "탈퇴하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
