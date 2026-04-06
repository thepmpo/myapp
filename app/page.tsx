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
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("id", { ascending: false });

    console.log("🔥 가져온 데이터:", data);

    if (error) {
      console.log("❌ 조회 에러:", error);
      alert(error.message);
    }

    setPosts((data as Post[]) || []);
  };

  useEffect(() => {
    getPosts();
  }, []);

  // 🔥 글 추가
  const addPost = async () => {
    const { data, error } = await supabase.from("posts").insert([
      {
        title: title,
        author: "test@test.com",
        user_id: "test-user",
      },
    ]);

    console.log("🔥 insert 결과:", data);

    if (error) {
      console.log("❌ insert 에러:", error);
      alert(error.message);
    } else {
      alert("성공");
      setTitle("");
      getPosts();
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

      <hr />

      {posts.length === 0 && <p>❌ 데이터 없음</p>}

      {posts.map((post) => (
        <div key={post.id}>
          <b>{post.title}</b>
          <p>{post.author}</p>
        </div>
      ))}
    </div>
  );
}