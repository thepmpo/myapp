"use client";

import { useState } from "react";
import { createClient } from "@/app/lib/supabase";

export default function Home() {
  const supabase = createClient();

  const [title, setTitle] = useState("");

  const addPost = async () => {
    // 🔥 로그인 유저 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("로그인 먼저 해주세요");
      return;
    }

    // 🔥 DB 저장 (user_id 포함)
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
// test