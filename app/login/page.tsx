'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
    });

    if (!error) {
      alert('이메일로 로그인 링크가 전송되었습니다');
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