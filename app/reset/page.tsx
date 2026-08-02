"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError("이메일을 입력해주세요");
      return;
    }

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset/confirm`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="bg-surface rounded-xl border border-border shadow-[0_1px_3px_rgba(23,27,35,0.045)] p-8 w-full max-w-[400px]">
        <h1 className="text-xl font-bold text-ink text-center mb-1">The PMPO</h1>
        <p className="text-sm text-ink-soft text-center mb-6">비밀번호 재설정</p>
        <p className="text-sm text-ink-soft text-center mb-4">
          재설정 링크를 이메일로 보내드렸어요. 메일함을 확인해주세요.
        </p>
        <a
          href="/login"
          className="block text-sm text-accent hover:text-accent-hover text-center font-medium"
        >
          로그인하러 가기
        </a>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border shadow-[0_1px_3px_rgba(23,27,35,0.045)] p-8 w-full max-w-[400px]">
      <h1 className="text-xl font-bold text-ink text-center mb-1">The PMPO</h1>
      <p className="text-sm text-ink-soft text-center mb-6">비밀번호 재설정</p>

      <p className="text-sm text-ink-soft mb-5">
        가입 시 사용한 이메일을 입력하시면 재설정 링크를 보내드립니다.
      </p>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">이메일</label>
          <input
            placeholder="이메일 입력"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        {error && <p className="text-sm text-red-500 m-0">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-accent text-white text-sm font-medium shadow-[0_2px_0_rgba(23,27,35,0.15)] hover:bg-accent-hover disabled:bg-border disabled:text-ink-soft cursor-pointer"
        >
          {loading ? "전송 중..." : "재설정 링크 전송"}
        </button>

        <a href="/login" className="text-sm text-ink-soft hover:text-accent text-center">
          로그인으로 돌아가기
        </a>
      </div>
    </div>
  );
}
