'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [name, setName] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (!name) return;

    localStorage.setItem('user', name);
    router.push('/');
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>로그인</h1>

      <input
        placeholder="이름 입력"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={handleLogin}>로그인</button>
    </div>
  );
}