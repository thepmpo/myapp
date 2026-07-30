'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

type Comment = {
  id: number;
  post_id: number;
  user_id: string;
  author: string;
  content: string;
  created_at: string;
};

type Like = {
  id: number;
  user_id: string;
  comment_id: number | null;
};

export default function PostDetail() {
  const params = useParams();
  const id = Number(params.id);

  const [post, setPost] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState('');

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  const [postLikes, setPostLikes] = useState<Like[]>([]);
  const [commentLikes, setCommentLikes] = useState<Like[]>([]);

  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setCurrentUser({ id: data.user.id, email: data.user.email ?? '' });
      }
    };

    loadUser();
    fetchPost();
    fetchComments();
    fetchPostLikes();
  }, []);

  useEffect(() => {
    const checkFollowing = async () => {
      if (!currentUser || !post || currentUser.id === post.user_id) {
        setIsFollowingAuthor(false);
        return;
      }

      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUser.id)
        .eq('following_id', post.user_id)
        .maybeSingle();

      setIsFollowingAuthor(!!data);
    };

    checkFollowing();
  }, [currentUser, post]);

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

  const toggleFollowAuthor = async () => {
    if (!currentUser) {
      alert('로그인이 필요합니다');
      window.location.href = '/login';
      return;
    }

    const { error } = isFollowingAuthor
      ? await supabase.from('follows').delete().eq('follower_id', currentUser.id).eq('following_id', post.user_id)
      : await supabase.from('follows').insert([{ follower_id: currentUser.id, following_id: post.user_id }]);

    if (error) {
      alert(error.message);
    } else {
      setIsFollowingAuthor(!isFollowingAuthor);
    }
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      alert(error.message);
    } else {
      const fetchedComments = (data as Comment[]) || [];
      setComments(fetchedComments);
      await fetchCommentLikes(fetchedComments.map((c) => c.id));
    }
  };

  const fetchPostLikes = async () => {
    const { data, error } = await supabase.from('likes').select('id, user_id, comment_id').eq('post_id', id);

    if (error) {
      alert(error.message);
    } else {
      setPostLikes((data as Like[]) || []);
    }
  };

  const fetchCommentLikes = async (commentIds: number[]) => {
    if (commentIds.length === 0) {
      setCommentLikes([]);
      return;
    }

    const { data, error } = await supabase
      .from('likes')
      .select('id, user_id, comment_id')
      .in('comment_id', commentIds);

    if (error) {
      alert(error.message);
    } else {
      setCommentLikes((data as Like[]) || []);
    }
  };

  const togglePostLike = async () => {
    if (!currentUser) {
      alert('로그인이 필요합니다');
      window.location.href = '/login';
      return;
    }

    const existing = postLikes.find((l) => l.user_id === currentUser.id);

    const { error } = existing
      ? await supabase.from('likes').delete().eq('id', existing.id)
      : await supabase.from('likes').insert([{ user_id: currentUser.id, post_id: id }]);

    if (error) {
      alert(error.message);
    } else {
      await fetchPostLikes();
    }
  };

  const toggleCommentLike = async (commentId: number) => {
    if (!currentUser) {
      alert('로그인이 필요합니다');
      window.location.href = '/login';
      return;
    }

    const existing = commentLikes.find((l) => l.comment_id === commentId && l.user_id === currentUser.id);

    const { error } = existing
      ? await supabase.from('likes').delete().eq('id', existing.id)
      : await supabase.from('likes').insert([{ user_id: currentUser.id, comment_id: commentId }]);

    if (error) {
      alert(error.message);
    } else {
      await fetchCommentLikes(comments.map((c) => c.id));
    }
  };

  const addComment = async () => {
    if (!currentUser) {
      alert('로그인이 필요합니다');
      window.location.href = '/login';
      return;
    }

    if (!newComment.trim()) {
      alert('댓글 내용을 입력하세요');
      return;
    }

    const { error } = await supabase.from('comments').insert([
      {
        post_id: id,
        user_id: currentUser.id,
        author: currentUser.email,
        content: newComment,
      },
    ]);

    if (error) {
      alert(error.message);
    } else {
      setNewComment('');
      await fetchComments();
    }
  };

  const reportPost = async () => {
    if (!currentUser) {
      alert('로그인이 필요합니다');
      window.location.href = '/login';
      return;
    }

    if (!confirm('이 게시글을 신고하시겠습니까?')) return;

    const { error } = await supabase
      .from('reports')
      .insert([{ reporter_id: currentUser.id, post_id: id }]);

    if (error) {
      alert(error.code === '23505' ? '이미 신고한 게시글입니다' : error.message);
    } else {
      alert('신고가 접수되었습니다');
    }
  };

  const reportComment = async (commentId: number) => {
    if (!currentUser) {
      alert('로그인이 필요합니다');
      window.location.href = '/login';
      return;
    }

    if (!confirm('이 댓글을 신고하시겠습니까?')) return;

    const { error } = await supabase
      .from('reports')
      .insert([{ reporter_id: currentUser.id, comment_id: commentId }]);

    if (error) {
      alert(error.code === '23505' ? '이미 신고한 댓글입니다' : error.message);
    } else {
      alert('신고가 접수되었습니다');
    }
  };

  const deleteComment = async (commentId: number) => {
    const { error } = await supabase.from('comments').delete().eq('id', commentId);

    if (error) {
      alert(error.message);
    } else {
      await fetchComments();
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

      {post.is_question && (
        <span
          style={{
            display: "inline-block",
            marginBottom: 8,
            padding: "2px 8px",
            borderRadius: 4,
            background: "#FBF0DB",
            color: "#8A5B0E",
            fontSize: 12,
            fontWeight: "bold",
          }}
        >
          🙋 질문있어요
        </span>
      )}

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

      <p>
        작성자: <Link href={`/profile/${post.user_id}`}>{post.author}</Link>
        {currentUser && currentUser.id !== post.user_id && (
          <button onClick={toggleFollowAuthor} style={{ marginLeft: 8 }}>
            {isFollowingAuthor ? '팔로잉' : '팔로우'}
          </button>
        )}
      </p>

      <button onClick={togglePostLike}>
        {postLikes.some((l) => l.user_id === currentUser?.id) ? '❤️' : '🤍'} 좋아요 {postLikes.length}
      </button>

      {currentUser?.id === post.user_id && (
        <>
          <button onClick={() => setEditMode(true)}>수정</button>
          <button onClick={deletePost}>삭제</button>
        </>
      )}

      {currentUser && currentUser.id !== post.user_id && (
        <button onClick={reportPost} style={{ marginLeft: 8 }}>🚨 신고</button>
      )}

      <hr style={{ margin: '24px 0' }} />

      <h2 style={{ fontSize: 16, marginBottom: 12 }}>댓글 {comments.length}개</h2>

      {comments.length === 0 && <p>아직 답변이 없어요. 첫 답변을 남겨보세요</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {comments.map((comment) => (
          <div
            key={comment.id}
            style={{
              border: '1px solid #eee',
              borderRadius: 8,
              padding: 10,
            }}
          >
            <div>{comment.content}</div>
            <div style={{ color: '#666', fontSize: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{comment.author}</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={() => toggleCommentLike(comment.id)}>
                  {commentLikes.some((l) => l.comment_id === comment.id && l.user_id === currentUser?.id) ? '❤️' : '🤍'}{' '}
                  {commentLikes.filter((l) => l.comment_id === comment.id).length}
                </button>
                {currentUser?.id === comment.user_id && (
                  <button onClick={() => deleteComment(comment.id)}>삭제</button>
                )}
                {currentUser && currentUser.id !== comment.user_id && (
                  <button onClick={() => reportComment(comment.id)}>🚨 신고</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {currentUser ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="댓글을 입력하세요"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
          />
          <button onClick={addComment}>등록</button>
        </div>
      ) : (
        <div>
          <input placeholder="댓글을 입력하려면 로그인이 필요합니다" disabled style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 6, width: '100%' }} />
        </div>
      )}
    </div>
  );
}
