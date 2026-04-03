'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function PostDetail() {
  const params = useParams();
  const id = Number(params.id);

  const [post, setPost] = useState<any>(null);
  const [user, setUser] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');

    if (!savedUser) {
      window.location.href = '/login';
      return;
    }

    setUser(savedUser);
    fetchPost();
  }, []);

  const fetchPost = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (data) {
      setPost(data);
      setTitle(data.title);
    }
  };

  const deletePost = async () => {
    await supabase.from('posts').delete().eq('id', id);
    window.location.href = '/';
  };

  const updatePost = async () => {
    await supabase
      .from('posts')
      .update({ title })
      .eq('id', id);

    setEditMode(false);
    fetchPost();
  };

  if (!post) return <div>로딩중...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>게시글 상세</h1>

      <p>글 ID: {post.id}</p>

      {editMode ? (
        <>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button onClick={updatePost}>저장</button>
        </>
      ) : (
        <p>제목: {post.title}</p>
      )}

      <p>작성자: {post.author}</p>

      {user === post.author && (
        <>
          <button onClick={() => setEditMode(true)}>수정</button>
          <button onClick={deletePost}>삭제</button>
        </>
      )}
    </div>
  );
}
// test