"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";

export default function ProfileEdit() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [nicknameSaving, setNicknameSaving] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const [withdrawing, setWithdrawing] = useState(false);

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
        .select("nickname")
        .eq("id", data.user.id)
        .maybeSingle();

      setNickname(profile?.nickname ?? "");
      setLoading(false);
    };

    load();
  }, []);

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

    const { error } = await supabase.from("profiles").update({ nickname }).eq("id", userId);

    setNicknameSaving(false);

    if (error) {
      setNicknameError(error.message);
    } else {
      alert("닉네임이 변경되었습니다");
    }
  };

  const savePassword = async () => {
    if (newPassword.length < 8) {
      setPasswordError("비밀번호는 8자 이상이어야 합니다");
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
    const confirmed = window.confirm(
      "정말 탈퇴하시겠습니까?\n닉네임과 작성한 게시글/댓글은 삭제되지 않고 그대로 유지됩니다."
    );

    if (!confirmed) return;

    setWithdrawing(true);

    const { error } = await supabase.rpc("delete_own_account");

    if (error) {
      setWithdrawing(false);
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
        className="inline-block mb-5 text-sm text-ink-soft hover:text-cobalt"
      >
        ← 프로필로
      </Link>

      <h1 className="text-xl font-bold text-ink mb-6">내 정보 수정</h1>

      <section className="mb-8">
        <h2 className="text-sm font-medium text-ink mb-2">닉네임 변경</h2>

        <div className="flex gap-2">
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-cobalt/30"
          />
          <button
            onClick={saveNickname}
            disabled={nicknameSaving}
            className="px-4 py-2.5 rounded-lg border border-border bg-surface text-sm font-medium text-ink cursor-pointer hover:bg-black/[0.03] disabled:opacity-60"
          >
            {nicknameSaving ? "저장 중..." : "저장"}
          </button>
        </div>

        {nicknameError && <p className="mt-1.5 text-sm text-red-500">{nicknameError}</p>}
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-medium text-ink mb-2">비밀번호 변경</h2>

        <div className="flex flex-col gap-2">
          <input
            type="password"
            placeholder="새 비밀번호 (8자 이상)"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setPasswordSaved(false);
            }}
            className="px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-cobalt/30"
          />
          <input
            type="password"
            placeholder="새 비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setPasswordSaved(false);
            }}
            className="px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-cobalt/30"
          />
          <button
            onClick={savePassword}
            disabled={passwordSaving}
            className="self-start px-4 py-2.5 rounded-lg bg-cobalt text-white text-sm font-medium shadow-[0_2px_0_rgba(23,27,35,0.15)] hover:bg-cobalt-dark disabled:opacity-60 cursor-pointer"
          >
            {passwordSaving ? "변경 중..." : "비밀번호 변경"}
          </button>
        </div>

        {passwordError && <p className="mt-1.5 text-sm text-red-500">{passwordError}</p>}
        {passwordSaved && <p className="mt-1.5 text-sm text-sage">비밀번호가 변경되었습니다</p>}
      </section>

      <div className="mt-14 pt-4 border-t border-border flex justify-end">
        <button
          onClick={withdraw}
          disabled={withdrawing}
          className="text-xs text-ink-soft/70 bg-transparent border-none cursor-pointer hover:text-red-500 disabled:opacity-60"
        >
          {withdrawing ? "탈퇴 처리 중..." : "회원 탈퇴"}
        </button>
      </div>
    </div>
  );
}
