"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요");
      return;
    }

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다");
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-border shadow-[0_1px_3px_rgba(23,27,35,0.045)] p-8 w-full max-w-[400px]">
      <h1 className="text-xl font-bold text-ink text-center mb-6">The PMPO</h1>

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

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        {error && <p className="text-sm text-red-500 m-0">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-accent text-white text-sm font-medium shadow-[0_2px_0_rgba(23,27,35,0.15)] hover:bg-accent-hover disabled:bg-border disabled:text-ink-soft cursor-pointer"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>

        <div className="flex items-center justify-between text-sm">
          <a href="/reset" className="text-ink-soft hover:text-accent">
            비밀번호를 잊으셨나요?
          </a>
          <a href="/signup" className="text-ink-soft hover:text-accent">
            회원가입
          </a>
        </div>
      </div>
    </div>
  );
}
