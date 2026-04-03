'use client';

import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

export default function Home() {
  const [title, setTitle] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
    fetchPosts();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = '/login';
      return;
    }

    setUser(user);
  };

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('id', { ascending: false });

    if (data) setPosts(data);
  };

  const addPost = async () => {
    if (!title || !user) return;

    await supabase.from('posts').insert([
      {
        title,
        author: user.email,
        user_id: user.id,
      },
    ]);

    setTitle('');
    fetchPosts();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>게시글 목록</h1>

      <p>현재 사용자: {user?.email}</p>

      <button onClick={logout}>로그아웃</button>

      <div style={{ marginTop: 20 }}>
        <input
          placeholder="글 제목 입력"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button onClick={addPost}>추가</button>
      </div>

      <ul style={{ marginTop: 20 }}>
        {posts.map((post) => (
          <li key={post.id}>
            <a href={`/post/${post.id}`}>
              {post.title} ({post.author})
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}