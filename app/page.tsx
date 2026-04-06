"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";

// ✅ 타입 정의 (이게 핵심)
type Post = {
  id: number;
  title: string;
  author: string;
  user_id: string;
};

export default function Home() {
  const [title, setTitle] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);

  // 임시 로그인 유저
  const user = {
    id: "test-user-123",
    email: "test@test.com",
  };

  // 🔥 글 가져오기
  const getPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("id", { ascending: false });

    // ✅ 타입 맞춰서 넣기
    setPosts((data as Post[]) || []);
  };

  // 🔥 처음 들어오면 실행
  useEffect(() => {
    getPosts();
  }, []);

  const addPost = async () => {
    const { error } = await supabase.from("posts").insert([
      {
        title: title,
        author: user.email,
        user_id: user.id,
      },
    ]);

    if (error) {
      alert("실패");
    } else {
      alert("성공");
      setTitle("");
      getPosts();
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>게시글 목록</h1>

      <p style={{ color: "red" }}>
        ※ 현재는 임시 로그인 상태입니다.
      </p>

      <p>현재 로그인: {user.email}</p>

      <input
        placeholder="글 제목 입력"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <button onClick={addPost}>추가</button>

      <hr />

      {posts.map((post) => (
        <div key={post.id}>
          <b>{post.title}</b>
          <p>{post.author}</p>
        </div>
      ))}
    </div>
  );
}