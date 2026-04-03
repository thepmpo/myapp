"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";

export default function Home() {
  const [title, setTitle] = useState("");
  const [user, setUser] = useState<any>(null);

  // 🔥 로그인 유저 가져오기 (페이지 들어올 때)
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    getUser();
  }, []);

  const addPost = async () => {
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

      <p>현재 로그인: {user?.email || "없음"}</p>

      <input
        placeholder="글 제목 입력"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <button onClick={addPost}>추가</button>
    </div>
  );
}