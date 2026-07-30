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
    <div style={{ padding: 40 }}>
      <h1>로그인</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 320 }}>
        <input
          placeholder="이메일 입력"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="비밀번호 입력"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}

        <button onClick={handleLogin} disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </button>

        <a href="/signup">회원가입</a>
      </div>
    </div>
  );
}
