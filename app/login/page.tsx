"use client";

import { useState } from "react";
import { createClientInstance } from "@/app/lib/supabase";

export default function Login() {
  const supabase = createClientInstance();

  const [email, setEmail] = useState("");

  const handleLogin = async () => {
    alert("클릭됨");

    if (!email) {
      alert("이메일 입력해주세요");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error(error);
      alert("로그인 실패");
    } else {
      alert("이메일 확인 후 링크 클릭하면 로그인됩니다");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>로그인</h1>

      <input
        placeholder="이메일 입력"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button onClick={handleLogin}>로그인</button>
    </div>
  );
}