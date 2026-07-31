"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

export default function ResetPasswordConfirm() {
  const [checking, setChecking] = useState(true);
  const [validSession, setValidSession] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      setValidSession(!!data.session);
      setChecking(false);
    };

    check();
  }, []);

  const handleSubmit = async () => {
    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다");
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다");
      return;
    }

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setDone(true);
    }
  };

  if (checking) {
    return (
      <div className="bg-surface rounded-xl border border-border shadow-[0_1px_3px_rgba(23,27,35,0.045)] p-8 w-full max-w-[400px]">
        <p className="text-sm text-ink-soft text-center">확인 중...</p>
      </div>
    );
  }

  if (!validSession) {
    return (
      <div className="bg-surface rounded-xl border border-border shadow-[0_1px_3px_rgba(23,27,35,0.045)] p-8 w-full max-w-[400px]">
        <h1 className="text-xl font-bold text-ink text-center mb-6">The PMPO</h1>
        <p className="text-sm text-ink-soft text-center mb-4">
          유효하지 않거나 만료된 링크입니다. 재설정을 다시 요청해주세요.
        </p>
        <a
          href="/reset"
          className="block text-sm text-cobalt hover:text-cobalt-dark text-center font-medium"
        >
          다시 요청하기
        </a>
      </div>
    );
  }

  if (done) {
    return (
      <div className="bg-surface rounded-xl border border-border shadow-[0_1px_3px_rgba(23,27,35,0.045)] p-8 w-full max-w-[400px]">
        <h1 className="text-xl font-bold text-ink text-center mb-6">The PMPO</h1>
        <p className="text-sm text-ink-soft text-center mb-4">
          비밀번호가 변경되었습니다.
        </p>
        <a
          href="/login"
          className="block text-sm text-cobalt hover:text-cobalt-dark text-center font-medium"
        >
          로그인하러 가기
        </a>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border shadow-[0_1px_3px_rgba(23,27,35,0.045)] p-8 w-full max-w-[400px]">
      <h1 className="text-xl font-bold text-ink text-center mb-1">The PMPO</h1>
      <p className="text-sm text-ink-soft text-center mb-6">새 비밀번호 설정</p>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">새 비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호 입력 (8자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-cobalt/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">새 비밀번호 확인</label>
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-cobalt/30"
          />
        </div>

        {error && <p className="text-sm text-red-500 m-0">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-cobalt text-white text-sm font-medium shadow-[0_2px_0_rgba(23,27,35,0.15)] hover:bg-cobalt-dark disabled:opacity-60 cursor-pointer"
        >
          {loading ? "변경 중..." : "비밀번호 변경"}
        </button>
      </div>
    </div>
  );
}
