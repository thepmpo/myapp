'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { CATEGORY_LABELS } from '@/app/lib/insightsCategories';

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
  const router = useRouter();
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

  if (!article) return <div className="text-sm text-ink-soft">로딩중...</div>;

  return (
    <div className="max-w-[1280px] mx-auto px-5 sm:px-8 pt-8 pb-24 lg:pb-8">
      <button
        onClick={() => router.back()}
        className="inline-block mb-4 text-sm text-ink-soft hover:text-accent cursor-pointer"
      >
        ← Insights로
      </button>

      <span className="inline-block mb-3 text-xs font-bold text-ink-soft">
        {CATEGORY_LABELS[article.category as keyof typeof CATEGORY_LABELS]}
      </span>

      <h1 className="text-[48px] leading-tight font-bold text-ink mb-2">{article.title}</h1>

      <div className="flex items-center gap-1.5 mb-5 text-sm font-mono text-ink-soft">
        <Link href={`/profile/${article.author_id}`} className="hover:text-accent">
          {authorNickname}
        </Link>
        <span>·</span>
        <span>{new Date(article.created_at).toLocaleDateString('ko-KR')}</span>
        <span>·</span>
        <span>조회 {viewCount}회</span>
      </div>

      {article.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.image_url} alt="" className="w-full rounded-lg mb-4 object-cover" />
      )}

      <p className="text-[15px] leading-relaxed text-ink whitespace-pre-wrap mb-5">{article.content}</p>

      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={toggleArticleLike}
          className="px-3 py-1.5 rounded-md border border-border bg-surface text-sm text-ink-soft hover:bg-black/[0.03] cursor-pointer"
        >
          {articleLikes.some((l) => l.user_id === currentUser?.id) ? '❤️' : '🤍'} 좋아요 {articleLikes.length}
        </button>

        {currentUser && currentUser.id !== article.author_id && (
          <button
            onClick={reportArticle}
            className="px-3 py-1.5 rounded-md border border-border bg-surface text-sm text-ink-soft hover:bg-black/[0.03] cursor-pointer"
          >
            🚨 신고
          </button>
        )}
      </div>

      <hr className="border-border my-6" />

      <h2 className="text-base font-bold text-ink mb-3">댓글 {comments.length}개</h2>

      {comments.length === 0 && (
        <p className="text-sm text-ink-soft mb-4">아직 답변이 없어요. 첫 답변을 남겨보세요</p>
      )}

      <div className="flex flex-col gap-2.5 mb-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-surface rounded-lg border border-border p-3">
            <div className="text-sm text-ink">{comment.content}</div>
            <div className="mt-2 flex items-center justify-between text-xs font-mono text-ink-soft">
              <span>{commentNicknames[comment.user_id] ?? comment.author}</span>
              <div className="flex items-center gap-3">
                <button onClick={() => toggleCommentLike(comment.id)} className="cursor-pointer hover:text-accent">
                  {commentLikes.some((l) => l.comment_id === comment.id && l.user_id === currentUser?.id) ? '❤️' : '🤍'}{' '}
                  {commentLikes.filter((l) => l.comment_id === comment.id).length}
                </button>
                {currentUser?.id === comment.user_id && (
                  <button onClick={() => deleteComment(comment.id)} className="cursor-pointer hover:text-accent">
                    삭제
                  </button>
                )}
                {currentUser && currentUser.id !== comment.user_id && (
                  <button onClick={() => reportComment(comment.id)} className="cursor-pointer hover:text-accent">
                    🚨 신고
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {currentUser ? (
        <div className="flex gap-2">
          <input
            placeholder="댓글을 입력하세요"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <button
            onClick={addComment}
            className="px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium shadow-[0_2px_0_rgba(23,27,35,0.15)] hover:bg-accent-hover cursor-pointer"
          >
            등록
          </button>
        </div>
      ) : (
        <input
          placeholder="댓글을 입력하려면 로그인이 필요합니다"
          disabled
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-paper text-sm text-ink-soft placeholder:text-ink-soft"
        />
      )}
    </div>
  );
}
