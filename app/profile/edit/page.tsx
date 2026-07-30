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

  if (loading) return <div style={{ padding: 40 }}>로딩중...</div>;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 40 }}>
      <div style={{ marginBottom: 20 }}>
        <Link href={`/profile/${userId}`}>← 프로필로</Link>
      </div>

      <h1 style={{ marginBottom: 24 }}>내 정보 수정</h1>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 14, marginBottom: 8 }}>닉네임 변경</h2>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={{ flex: 1, padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
          />
          <button onClick={saveNickname} disabled={nicknameSaving}>
            {nicknameSaving ? "저장 중..." : "저장"}
          </button>
        </div>

        {nicknameError && <p style={{ color: "red", fontSize: 13 }}>{nicknameError}</p>}
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 14, marginBottom: 8 }}>비밀번호 변경</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input
            type="password"
            placeholder="새 비밀번호 (8자 이상)"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setPasswordSaved(false);
            }}
            style={{ padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
          />
          <input
            type="password"
            placeholder="새 비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setPasswordSaved(false);
            }}
            style={{ padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
          />
          <button onClick={savePassword} disabled={passwordSaving} style={{ alignSelf: "flex-start" }}>
            {passwordSaving ? "변경 중..." : "비밀번호 변경"}
          </button>
        </div>

        {passwordError && <p style={{ color: "red", fontSize: 13 }}>{passwordError}</p>}
        {passwordSaved && <p style={{ color: "#5C8A72", fontSize: 13 }}>비밀번호가 변경되었습니다</p>}
      </section>

      <div style={{ marginTop: 60, display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={withdraw}
          disabled={withdrawing}
          style={{
            fontSize: 12,
            color: "#999",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          {withdrawing ? "탈퇴 처리 중..." : "회원 탈퇴"}
        </button>
      </div>
    </div>
  );
}
