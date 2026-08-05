"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";

export default function EditCirclePostPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [post, setPost] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isQuestion, setIsQuestion] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setCurrentUser({ id: data.user.id, email: data.user.email ?? "" });
      }

      const { data: postData } = await supabase.from("posts").select("*").eq("id", id).single();

      if (postData) {
        setPost(postData);
        setTitle(postData.title);
        setContent(postData.content ?? "");
        setIsQuestion(!!postData.is_question);
      }

      setCheckingAuth(false);
    };

    init();
  }, [id]);

  const submit = async () => {
    if (!currentUser) {
      setError("로그인이 필요합니다");
      return;
    }

    if (!title) {
      setError("제목을 입력하세요");
      return;
    }

    setError("");

    let imageUrl: string | null = post?.image_url ?? null;

    if (imageFile) {
      setUploading(true);

      const extension = imageFile.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
      const path = `${currentUser.id}/${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("post-images").upload(path, imageFile);

      setUploading(false);

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      imageUrl = supabase.storage.from("post-images").getPublicUrl(path).data.publicUrl;
    }

    const { error: updateError } = await supabase
      .from("posts")
      .update({
        title,
        content: content || null,
        is_question: isQuestion,
        image_url: imageUrl,
      })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push(`/post/${id}`);
  };

  if (checkingAuth) return <div className="px-5 py-8 text-sm text-ink-soft sm:px-8">로딩중...</div>;

  if (!currentUser) {
    return (
      <div className="px-5 py-8 sm:px-8">
        <p className="text-sm text-ink-soft mb-3">로그인이 필요합니다</p>
        <Link href="/login" className="text-sm text-accent hover:underline">
          로그인하러 가기
        </Link>
      </div>
    );
  }

  if (!post || post.user_id !== currentUser.id) {
    return (
      <div className="px-5 py-8 sm:px-8">
        <p className="text-sm text-ink-soft mb-3">수정 권한이 없습니다</p>
        <Link href="/" className="text-sm text-accent hover:underline">
          Circle로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1320px]">
      <section className="min-w-0 px-5 sm:px-8 xl:pl-24" aria-label="Circle 게시글 수정">
        <h1 className="pt-6 text-2xl font-bold text-ink">Circle</h1>

        <Link href={`/post/${id}`} className="mt-4 inline-block text-sm text-ink-soft hover:text-accent">
          ← 게시글로
        </Link>

        <div className="mt-4 pb-24 lg:pb-8">
          <div className="bg-surface rounded-xl border border-border p-6 shadow-[0_1px_3px_rgba(23,27,35,0.045)]">
            <label className="flex items-center gap-1.5 mb-3 text-sm text-ink-soft">
              <input type="checkbox" checked={isQuestion} onChange={(e) => setIsQuestion(e.target.checked)} />
              🙋 질문있어요
            </label>

            <input
              placeholder="글 제목 입력"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft mb-2 focus:outline-none focus:ring-2 focus:ring-accent/30"
            />

            <textarea
              placeholder="본문 내용 입력"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft mb-2 h-[360px] resize-none overflow-y-auto focus:outline-none focus:ring-2 focus:ring-accent/30"
            />

            <div className="flex items-center gap-2 mb-3 text-xs text-ink-soft">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="text-xs text-ink-soft file:mr-2 file:px-2.5 file:py-1.5 file:rounded-md file:border file:border-border file:bg-surface file:text-xs file:text-ink-soft file:cursor-pointer cursor-pointer"
              />
              {imageFile ? <span>{imageFile.name}</span> : post.image_url && <span>기존 이미지 유지 중</span>}
              {uploading && <span>업로드 중...</span>}
            </div>

            <div className="flex justify-end">
              <button
                onClick={submit}
                className="px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium shadow-[0_2px_0_rgba(23,27,35,0.15)] hover:bg-accent-hover cursor-pointer"
              >
                저장
              </button>
            </div>

            {error && <p className="mt-3 text-sm text-red-500 text-right">{error}</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
