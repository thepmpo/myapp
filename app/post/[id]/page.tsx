'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import WorkspaceFrame from '@/app/components/home/WorkspaceFrame';
import LoginPromptModal from '@/app/components/LoginPromptModal';

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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function PostDetail() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [post, setPost] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState('');

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  const [postLikes, setPostLikes] = useState<Like[]>([]);
  const [commentLikes, setCommentLikes] = useState<Like[]>([]);

  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [nicknames, setNicknames] = useState<Record<string, string>>({});

  const [reportTarget, setReportTarget] = useState<{ type: 'post' } | { type: 'comment'; id: number } | null>(null);
  const [reporting, setReporting] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const fetchNicknames = async (userIds: string[]) => {
    const uniqueIds = Array.from(new Set(userIds.filter((uid) => uid && UUID_REGEX.test(uid))));

    if (uniqueIds.length === 0) return;

    const { data, error } = await supabase.from('profiles').select('id, nickname').in('id', uniqueIds);

    if (!error) {
      const map: Record<string, string> = {};
      (data || []).forEach((p: { id: string; nickname: string }) => {
        map[p.id] = p.nickname;
      });
      setNicknames((prev) => ({ ...prev, ...map }));
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setCurrentUser({ id: data.user.id, email: data.user.email ?? '' });
        fetchPost();
        fetchComments();
        fetchPostLikes();
      }

      setAuthChecked(true);
    };

    init();
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
      await fetchNicknames([data.user_id]);
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
      await fetchNicknames(fetchedComments.map((c) => c.user_id));
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

  const reportPost = () => {
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }

    setReportTarget({ type: 'post' });
  };

  const reportComment = (commentId: number) => {
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }

    setReportTarget({ type: 'comment', id: commentId });
  };

  const confirmReport = async () => {
    if (!reportTarget || !currentUser) return;

    setReporting(true);

    const { error } =
      reportTarget.type === 'post'
        ? await supabase.from('reports').insert([{ reporter_id: currentUser.id, post_id: id }])
        : await supabase.from('reports').insert([{ reporter_id: currentUser.id, comment_id: reportTarget.id }]);

    setReporting(false);
    setReportTarget(null);
    setToast(error ? (error.code === '23505' ? '이미 신고했어요' : error.message) : '신고가 접수됐어요');
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

  if (!authChecked) {
    return (
      <WorkspaceFrame>
        <div className="px-5 py-8 text-sm text-ink-soft sm:px-8">로딩중...</div>
      </WorkspaceFrame>
    );
  }

  if (!currentUser) {
    return (
      <WorkspaceFrame>
        <div className="px-5 py-8 sm:px-8">
          <LoginPromptModal onClose={() => router.push('/')} />
        </div>
      </WorkspaceFrame>
    );
  }

  if (!post) {
    return (
      <WorkspaceFrame>
        <div className="px-5 py-8 text-sm text-ink-soft sm:px-8">로딩중...</div>
      </WorkspaceFrame>
    );
  }

  const isPostLiked = postLikes.some((l) => l.user_id === currentUser?.id);

  return (
    <WorkspaceFrame>
    <div className="h-[42px] border-b border-black/10 bg-accent text-white">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-center px-5 text-center text-xs sm:text-sm">
        <span className="rounded bg-white px-2 py-1 text-[11px] font-bold text-accent">Circle</span>
        <span className="ml-2 truncate">PM·PO 멤버들과 물어보고 답하며 경험을 나눠보세요.</span>
        <Link href="/circle/new" className="ml-2 shrink-0 font-bold underline underline-offset-2">글쓰기</Link>
      </div>
    </div>
    <div className="px-5 pb-24 sm:px-8 lg:pb-8">
    <div className="max-w-[1360px] mx-auto flex flex-col gap-6">
      <h1 className="pt-6 text-2xl font-bold text-ink">게시글 상세</h1>

      <div
        className={`bg-surface rounded-xl border p-6 shadow-[0_1px_3px_rgba(23,27,35,0.045)] ${
          post.is_question ? "border-border border-l-2 border-l-question" : "border-border"
        }`}
      >
        {post.is_question && (
          <span className="inline-block mb-2 text-xs font-bold text-question">
            🙋 질문있어요
          </span>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-border shrink-0" />
            <Link
              href={`/profile/${post.user_id}`}
              className="text-sm font-mono text-ink-soft hover:text-accent"
            >
              {nicknames[post.user_id] ?? post.author}
            </Link>
          </div>

          {currentUser && currentUser.id !== post.user_id && (
            <button
              onClick={toggleFollowAuthor}
              className={`px-3 py-1.5 rounded-md border text-xs font-medium cursor-pointer ${
                isFollowingAuthor
                  ? "border-border bg-surface text-ink-soft hover:bg-black/[0.03]"
                  : "border-accent bg-accent text-white hover:bg-accent-hover"
              }`}
            >
              {isFollowingAuthor ? "팔로잉" : "+ 팔로우"}
            </button>
          )}
        </div>

        {editMode ? (
          <div className="flex gap-2 mb-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <button
              onClick={updatePost}
              className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium shadow-[0_2px_0_rgba(23,27,35,0.15)] hover:bg-accent-hover cursor-pointer"
            >
              저장
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-[40px] leading-tight font-bold text-ink mb-4">{post.title}</h2>

            {post.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.image_url} alt="" className="w-full rounded-lg mb-4 object-cover" />
            )}

            {post.content && (
              <p className="text-[15px] leading-relaxed text-ink whitespace-pre-wrap mb-4">{post.content}</p>
            )}
          </>
        )}

        <div className="flex items-center gap-4 pt-3 border-t border-border">
          <button
            onClick={togglePostLike}
            className={`text-sm font-medium cursor-pointer ${
              isPostLiked ? "text-accent" : "text-ink-soft hover:text-ink"
            }`}
          >
            🙌 공감해요 {postLikes.length}
          </button>

          {currentUser?.id === post.user_id && (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="text-xs text-ink-soft hover:text-ink cursor-pointer"
              >
                수정
              </button>

              <button
                onClick={deletePost}
                className="text-xs text-red-500 hover:text-red-600 cursor-pointer"
              >
                삭제
              </button>
            </>
          )}

          {currentUser && currentUser.id !== post.user_id && (
            <button
              onClick={reportPost}
              className="ml-auto text-xs text-ink-soft/60 hover:text-ink-soft cursor-pointer"
            >
              🚨 신고
            </button>
          )}
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 shadow-[0_1px_3px_rgba(23,27,35,0.045)]">
        <h3 className="text-sm font-bold text-ink mb-4">댓글 {comments.length}개</h3>

        {comments.length === 0 && (
          <p className="text-sm text-ink-soft mb-4">아직 답변이 없어요. 첫 답변을 남겨보세요</p>
        )}

        <div className="flex flex-col mb-4">
          {comments.map((comment) => {
            const isCommentLiked = commentLikes.some(
              (l) => l.comment_id === comment.id && l.user_id === currentUser?.id
            );
            const commentLikeCount = commentLikes.filter((l) => l.comment_id === comment.id).length;

            return (
              <div key={comment.id} className="border-b border-border py-3 last:border-b-0">
                <div className="text-sm text-ink">{comment.content}</div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-mono text-ink-soft">
                    {nicknames[comment.user_id] ?? comment.author}
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleCommentLike(comment.id)}
                      className={`text-xs font-medium cursor-pointer ${
                        isCommentLiked ? "text-accent" : "text-ink-soft hover:text-ink"
                      }`}
                    >
                      🙌 {commentLikeCount}
                    </button>

                    {currentUser?.id === comment.user_id && (
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="text-xs text-ink-soft hover:text-red-500 cursor-pointer"
                      >
                        삭제
                      </button>
                    )}

                    {currentUser && currentUser.id !== comment.user_id && (
                      <button
                        onClick={() => reportComment(comment.id)}
                        className="text-xs text-ink-soft/60 hover:text-ink-soft cursor-pointer"
                      >
                        🚨 신고
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-paper text-sm text-ink-soft placeholder:text-ink-soft cursor-not-allowed"
          />
        )}
      </div>
    </div>
    </div>

    {reportTarget && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="w-full max-w-[340px] bg-surface rounded-xl border border-border shadow-[0_1px_3px_rgba(23,27,35,0.045)] p-6">
          <h2 className="text-base font-bold text-ink mb-2">
            {reportTarget.type === 'post' ? '이 게시글을 신고하시겠어요?' : '이 댓글을 신고하시겠어요?'}
          </h2>
          <p className="text-sm text-ink-soft mb-6">신고 접수 후에는 취소할 수 없어요.</p>
          <div className="flex gap-2">
            <button
              onClick={() => setReportTarget(null)}
              disabled={reporting}
              className="flex-1 py-2.5 rounded-lg border border-border bg-surface text-sm font-medium text-ink cursor-pointer hover:bg-black/[0.03] disabled:opacity-60"
            >
              취소
            </button>
            <button
              onClick={confirmReport}
              disabled={reporting}
              className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium cursor-pointer hover:bg-red-600 disabled:opacity-60"
            >
              {reporting ? '신고 중...' : '신고하기'}
            </button>
          </div>
        </div>
      </div>
    )}

    {toast && (
      <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-[0_4px_16px_rgba(23,27,35,0.2)] lg:bottom-8">
        {toast}
      </div>
    )}
    </WorkspaceFrame>
  );
}
