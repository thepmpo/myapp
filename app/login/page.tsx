"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");

  const handleLogin = async () => {
    if (!email) {
      alert("이메일 입력해주세요");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("이메일 확인하세요");
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
/