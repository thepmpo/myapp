"use client";

import { useState } from "react";
import { createClientInstance } from "@/app/lib/supabase";

export default function Home() {
  const supabase = createClientInstance();

  const [title, setTitle] = useState("");

  const addPost = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("로그인 먼저 해주세요");
      return;
    }

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

      <input
        placeholder="글 제목 입력"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <button onClick={addPost}>추가</button>
    </div>
  );
}