"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";

type Post = {
  id: number;
  title: string;
  author: string;
  user_id: string;
};

export default function Home() {
  const [title, setTitle] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);

  // 🔥 글 가져오기
  const getPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("id", { ascending: false });

    setPosts((data as Post[]) || []);
  };

  // 🔥 처음 실행
  useEffect(() => {
    getPosts();
  }, []);

  // 🔥 글 추가 (로그인 제거 버전)
  const addPost = async () => {
    const { error } = await supabase.from("posts").insert([
      {
        title: title,
        author: "test@test.com",
        user_id: "test-user",
      },
    ]);

    if (error) {
      alert(error.message); // 🔥 진짜 에러 확인
    } else {
      alert("성공");
      setTitle("");
      getPosts();
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>게시글 목록</h1>

      <p>현재 상태: 로그인 없이 테스트 중</p>

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