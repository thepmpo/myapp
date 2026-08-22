'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { LikeIcon } from '@/app/components/icons';

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

type Props = {
  articleId: number;
  articleAuthorId: string;
  initialComments: Comment[];
  initialCommentNicknames: Record<string, string>;
  initialArticleLikes: Like[];
  initialCommentLikes: Like[];
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function ArticleEngagement({
  articleId,
  articleAuthorId,
  initialComments,
  initialCommentNicknames,
  initialArticleLikes,
  initialCommentLikes,
}: Props) {
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);

  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [commentNicknames, setCommentNicknames] = useState<Record<string, string>>(initialCommentNicknames);

  const [articleLikes, setArticleLikes] = useState<Like[]>(initialArticleLikes);
  const [commentLikes, setCommentLikes] = useState<Like[]>(initialCommentLikes);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUser({ id: data.user.id, email: data.user.email ?? '' });
    });
  }, []);

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

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('article_id', articleId)
      .order('created_at', { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }

    const fetchedComments = (data as Comment[]) || [];
    setComments(fetchedComments);
    await fetchCommentNicknames(fetchedComments.map((c) => c.user_id));
    await fetchCommentLikes(fetchedComments.map((c) => c.id));
  };

  const fetchArticleLikes = async () => {
    const { data, error } = await supabase.from('likes').select('id, user_id, comment_id').eq('article_id', articleId);

    if (error) {
      alert(error.message);
    } else {
      setArticleLikes((data as Like[]) || []);
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
      : await supabase.from('likes').insert([{ user_id: currentUser.id, article_id: articleId }]);

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
        article_id: articleId,
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

    const { error } = await supabase.from('reports').insert([{ reporter_id: currentUser.id, article_id: articleId }]);

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

    const { error } = await supabase.from('reports').insert([{ reporter_id: currentUser.id, comment_id: commentId }]);

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

  return (
    <>
      <div className="flex items-center justify-between gap-2 mb-5">
        <div />
        <div className="flex items-center gap-2">
          <button
            onClick={toggleArticleLike}
            className={`flex items-center gap-1.5 text-sm font-medium cursor-pointer ${
              articleLikes.some((l) => l.user_id === currentUser?.id) ? 'text-accent' : 'text-ink-soft hover:text-ink'
            }`}
          >
            <LikeIcon />
            공감해요 {articleLikes.length}
          </button>

          {currentUser && currentUser.id !== articleAuthorId && (
            <button
              onClick={reportArticle}
              className="px-3 py-1.5 rounded-md border border-border bg-surface text-sm text-ink-soft hover:bg-black/[0.03] cursor-pointer"
            >
              🚨 신고
            </button>
          )}
        </div>
      </div>

      {/* 좌측 작성자 영역(160px)+간격(64px)만큼 왼쪽 여백을 줘서, 본문 컬럼과 정확히 같은 폭으로 정렬 */}
      <div className="ml-[224px]">
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
                  <button
                    onClick={() => toggleCommentLike(comment.id)}
                    className={`flex items-center gap-1 cursor-pointer ${
                      commentLikes.some((l) => l.comment_id === comment.id && l.user_id === currentUser?.id)
                        ? 'text-accent'
                        : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    <LikeIcon />
                    공감해요 {commentLikes.filter((l) => l.comment_id === comment.id).length}
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
    </>
  );
}
