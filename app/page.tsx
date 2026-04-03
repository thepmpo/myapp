"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";

export default function Home() {
  const [title, setTitle] = useState("");

  const addPost = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("로그인 먼저 해주세요");
      return;
    }

    await supabase.from("posts").insert([
      {
        title,
        author: user.email,
        user_id: user.id,
      },
    ]);

    alert("완료");
  };

  return (
    <div style={{ padding: 40 }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목"
      />
      <button onClick={addPost}>추가</button>
    </div>
  );
}