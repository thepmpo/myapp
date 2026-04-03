"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";

export default function Home() {
  const [title, setTitle] = useState("");

  // 🔥 임시 로그인 유저
  const user = {
    id: "test-user-123",
    email: "test@test.com",
  };

  const addPost = async () => {
    const { error } = await supabase.from("posts").insert([
      {
        title: title,
        author: user.email,
        user_id: user.id,
      },
    ]);

    if (error) {
      console.error(error);
      alert("실패");
    } else {
      alert("성공");
      location.reload();
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>게시글 목록</h1>

      <p>현재 로그인: {user.email} (임시)</p>

      <input
        placeholder="글 제목 입력"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <button onClick={addPost}>추가</button>
    </div>
  );
} 
/