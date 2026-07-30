'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

type Comment = {
  id: number;
  article_id: number;
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

const CATEGORY_LABELS: Record<string, string> = {
  product: '프로덕트',
  trend: 'PM·PO 트렌드',
  ai: 'AI',
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ANON_ID_COOKIE = 'pmpo_anon_id';

const getAnonId = () => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${ANON_ID_COOKIE}=([^;]+)`));

  if (match) return match[1];

  const newId = crypto.randomUUID();
  const twoYears = 60 * 60 * 24 * 365 * 2;
  document.cookie = `${ANON_ID_COOKIE}=${newId}; path=/; max-age=${twoYears}`;
  return newId;
};

export default function ArticleDetail() {
  const params = useParams();
  const id = Number(params.id);

  const [article, setArticle] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
  const [authorNickname, setAuthorNickname] = useState('');

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentNicknames, setCommentNicknames] = useState<Record<string, string>>({});

  const [articleLikes, setArticleLikes] = useState<Like[]>([]);
  const [commentLikes, setCommentLikes] = useState<Like[]>([]);

  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      const viewerKey = data.user ? data.user.id : getAnonId();

      if (data.user) {
        setCurrentUser({ id: data.user.id, email: data.user.email ?? '' });
      }

      await recordView(viewerKey);
      await fetchViewCount();
    };

    loadUser();
    fetchArticle();
    fetchComments();
    fetchArticleLikes();
  }, []);

  const recordView = async (viewerKey: string) => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: existing } = await supabase
      .from('article_views')
      .select('id')
      .eq('article_id', id)
      .eq('viewer_key', viewerKey)
      .gte('created_at', since)
      .maybeSingle();

    if (!existing) {
      await supabase.from('article_views').insert([{ article_id: id, viewer_key: viewerKey }]);
    }
  };

  const fetchViewCount = async () => {
    const { count } = await supabase
      .from('article_views')
      .select('id', { count: 'exact', head: true })
      .eq('article_id', id);

    setViewCount(count ?? 0);
  };

  const fetchArticle = async () => {
    const { data } = await supabase.from('articles').select('*').eq('id', id).single();

    if (data) {
      setArticle(data);

      if (UUID_REGEX.test(data.author_id)) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('id', data.author_id)
          .maybeSingle();

        setAuthorNickname(profile?.nickname ?? data.author);
      } else {
        setAuthorNickname(data.author);
      }
    }
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('article_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      alert(error.message);
    } else {
      const fetchedComments = (data as Comment[]) || [];
      setComments(fetchedComments);
      await fetchCommentLikes(fetchedComments.map((c) => c.id));
      await fetchCommentNicknames(fetchedComments.map((c) => c.user_id));
    }
  };

  const fetchCommentNicknames = async (userIds: string[]) => {
    const uniqueIds = Array.from(new Set(userIds.filter((uid) => uid && UUID_REGEX.test(uid))));

    if (uniqueIds.length === 0) {
      setCommentNicknames({});
      return;
    }

    const { data, error } = await supabase.from('profiles').select('id, nickname').in('id', uniqueIds);

    if (!error) {
      const map: Record<string, string> = {};
      (data || []).forEach((p: { id: string; nickname: string }) => {
        map[p.id] = p.nickname;
      });
      setCommentNicknames(map);
    }
  };

  const fetchArticleLikes = async () => {
    const { data, error } = await supabase.from('likes').select('id, user_id, comment_id').eq('article_id', id);

    if (error) {
      alert(error.message);
    } else {
      setArticleLikes((data as Like[]) || []);
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

  const toggleArticleLike = async () => {
    if (!currentUser) {
      alert('로그인이 필요합니다');
      window.location.href = '/login';
      return;
    }

    const existing = articleLikes.find((l) => l.user_id === currentUser.id);

    const { error } = existing
      ? await supabase.from('likes').delete().eq('id', existing.id)
      : await supabase.from('likes').insert([{ user_id: currentUser.id, article_id: id }]);

    if (error) {
      alert(error.message);
    } else {
      await fetchArticleLikes();
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
        article_id: id,
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

  const reportArticle = async () => {
    if (!currentUser) {
      alert('로그인이 필요합니다');
      window.location.href = '/login';
      return;
    }

    if (!confirm('이 글을 신고하시겠습니까?')) return;

    const { error } = await supabase
      .from('reports')
      .insert([{ reporter_id: currentUser.id, article_id: id }]);

    if (error) {
      alert(error.code === '23505' ? '이미 신고한 글입니다' : error.message);
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

  if (!article) return <div>로딩중...</div>;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 12 }}>
        <Link href="/articles">← 정보게시판으로</Link>
      </div>

      <span
        style={{
          display: 'inline-block',
          marginBottom: 8,
          padding: '2px 8px',
          borderRadius: 4,
          background: '#EAEEF7',
          color: '#2E4A8F',
          fontSize: 12,
          fontWeight: 'bold',
        }}
      >
        {CATEGORY_LABELS[article.category]}
      </span>

      <h1>{article.title}</h1>

      {article.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.image_url}
          alt=""
          style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 12 }}
        />
      )}

      <p style={{ whiteSpace: 'pre-wrap' }}>{article.content}</p>

      <p>
        작성자: <Link href={`/profile/${article.author_id}`}>{authorNickname}</Link>
      </p>

      <p style={{ color: '#999', fontSize: 13 }}>조회 {viewCount}회</p>

      <button onClick={toggleArticleLike}>
        {articleLikes.some((l) => l.user_id === currentUser?.id) ? '❤️' : '🤍'} 좋아요 {articleLikes.length}
      </button>

      {currentUser && currentUser.id !== article.author_id && (
        <button onClick={reportArticle} style={{ marginLeft: 8 }}>🚨 신고</button>
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
              <span>{commentNicknames[comment.user_id] ?? comment.author}</span>
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
