// 실제 Circle 게시글을 Medium형 가로 카드로 표시합니다.
"use client";

import { useState } from "react";
import Link from "next/link";
import type { HomePost, HomePreviewComment } from "@/app/components/home/types";
import LoginPromptModal from "@/app/components/LoginPromptModal";
import { LikeIcon } from "@/app/components/icons";

type CirclePostCardProps = {
  post: HomePost;
  authorName: string;
  authorAvatarUrl?: string;
  currentUserId?: string;
  isAdmin?: boolean;
  commentCount: number;
  reactionCount: number;
  previewComments: HomePreviewComment[];
  nicknames: Record<string, string>;
  isEditing: boolean;
  editTitle: string;
  onEditTitleChange: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
};

export default function CirclePostCard({
  post,
  authorName,
  authorAvatarUrl,
  currentUserId,
  isAdmin,
  commentCount,
  reactionCount,
  previewComments,
  nicknames,
  isEditing,
  editTitle,
  onEditTitleChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: CirclePostCardProps) {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const createdDate = post.created_at ? new Date(post.created_at) : null;
  const formattedDate =
    createdDate && !Number.isNaN(createdDate.getTime())
      ? new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric" }).format(createdDate)
      : null;

  const handlePostClick = (event: React.MouseEvent) => {
    if (!currentUserId) {
      event.preventDefault();
      setShowLoginPrompt(true);
    }
  };

  return (
    <article className="border-b border-[#f1efed] py-7 sm:py-8">
      {isEditing ? (
        <div>
          <label htmlFor={"edit-post-" + post.id} className="mb-2 block text-sm font-medium text-ink">
            제목 수정
          </label>
          <input
            id={"edit-post-" + post.id}
            value={editTitle}
            onChange={(event) => onEditTitleChange(event.target.value)}
            className="w-full border border-[#f1efed] bg-surface px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/25"
          />
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={onSaveEdit} className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-white hover:bg-accent">
              저장
            </button>
            <button type="button" onClick={onCancelEdit} className="rounded-full border border-[#f1efed] px-4 py-2 text-xs text-ink hover:border-ink">
              취소
            </button>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[152px] flex-col sm:min-h-[164px]">
          <div className="mb-3 flex items-center gap-2 text-xs text-ink-soft">
            <Link href={"/profile/" + post.user_id} className="flex min-w-0 items-center gap-2 hover:text-ink">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-border text-[10px] font-bold text-ink">
                {authorAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={authorAvatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  authorName.slice(0, 1).toUpperCase()
                )}
              </span>
              <span className="max-w-40 truncate font-medium text-ink">{authorName}</span>
            </Link>
            {formattedDate && (
              <>
                <span aria-hidden="true">·</span>
                <time dateTime={post.created_at ?? undefined}>{formattedDate}</time>
              </>
            )}
            {post.is_question && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-question">질문</span>
              </>
            )}
            {isAdmin && post.is_hidden && (
              <span className="ml-auto shrink-0 font-bold text-red-500">비공개 처리</span>
            )}
          </div>

          <div className="flex min-h-0 flex-1 items-start gap-4 sm:gap-7">
            <div className="min-w-0 flex-1">
              <Link href={"/post/" + post.id} onClick={handlePostClick} className="group block">
                <h2 className="line-clamp-2 text-[18px] font-bold leading-[1.35] tracking-[-0.02em] text-ink transition-colors group-hover:text-accent sm:text-[21px]">
                  {post.title}
                </h2>
                {post.content && (
                  <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-ink-soft sm:text-[15px] sm:leading-6">
                    {post.content}
                  </p>
                )}
              </Link>

              {previewComments.length > 0 && (
                <div className="mt-3 hidden border-l-2 border-[#f1efed] pl-3 sm:block">
                  {previewComments.map((comment) => (
                    <p key={comment.id} className="line-clamp-1 text-xs leading-5 text-ink-soft">
                      <strong className="font-medium text-ink">{nicknames[comment.user_id] ?? comment.author}</strong>{" "}
                      {comment.content}
                      {comment.likeCount > 0 && (
                        <span className="ml-1 text-ink-soft/70">· 반응 {comment.likeCount}</span>
                      )}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {post.image_url && (
              <Link
                href={"/post/" + post.id}
                onClick={handlePostClick}
                className="h-[88px] w-[88px] shrink-0 overflow-hidden bg-border sm:h-[100px] sm:w-[150px]"
                aria-label={post.title + " 이미지와 함께 읽기"}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.image_url} alt="" className="h-full w-full object-cover" />
              </Link>
            )}
          </div>

          <div className="mt-4 flex min-h-6 items-center justify-between gap-3 text-xs text-ink-soft">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1" aria-label={"반응 " + reactionCount + "개"}>
                <LikeIcon />
                {reactionCount}
              </span>
              <span className="flex items-center gap-1" aria-label={"댓글 " + commentCount + "개"}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
                </svg>
                {commentCount}
              </span>
            </div>

            {currentUserId === post.user_id && (
              <details className="relative">
                <summary className="cursor-pointer list-none px-2 text-lg leading-none text-ink-soft hover:text-ink [&::-webkit-details-marker]:hidden" aria-label="게시글 더보기">
                  ···
                </summary>
                <div className="absolute right-0 top-7 z-10 w-24 border border-[#f1efed] bg-surface py-1 shadow-sm">
                  <button type="button" onClick={onStartEdit} className="block w-full px-3 py-2 text-left text-xs hover:bg-black/[0.03]">
                    수정
                  </button>
                  <button type="button" onClick={onDelete} className="block w-full px-3 py-2 text-left text-xs text-error hover:bg-black/[0.03]">
                    삭제
                  </button>
                </div>
              </details>
            )}
          </div>
        </div>
      )}

      {showLoginPrompt && <LoginPromptModal onClose={() => setShowLoginPrompt(false)} />}
    </article>
  );
}
