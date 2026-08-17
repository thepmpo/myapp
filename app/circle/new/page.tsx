"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";

export default function NewCirclePostPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

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

      setCheckingAuth(false);
    };

    init();
  }, []);

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

    let imageUrl: string | null = null;

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

    const { error: insertError } = await supabase.from("posts").insert([
      {
        title,
        content: content || null,
        author: currentUser.email,
        user_id: currentUser.id,
        is_question: isQuestion,
        image_url: imageUrl,
      },
    ]);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push("/circle");
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

  return (
    <div className="w-full max-w-[680px] mx-auto px-5 sm:px-8 pt-8 pb-24 lg:pb-8">
      <Link href="/circle" className="inline-block mb-4 text-sm text-ink-soft hover:text-accent">
        ← Circle로
      </Link>

      <h1 className="text-2xl font-bold text-ink mb-5">질문하기</h1>

      <div className="bg-surface rounded-xl border border-border p-5 shadow-[0_1px_3px_rgba(23,27,35,0.045)]">
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
          {imageFile && <span>{imageFile.name}</span>}
          {uploading && <span>업로드 중...</span>}
        </div>

        <div className="flex justify-end">
          <button
            onClick={submit}
            className="px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium shadow-[0_2px_0_rgba(23,27,35,0.15)] hover:bg-accent-hover cursor-pointer"
          >
            등록
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-500 text-right">{error}</p>}
      </div>
    </div>
  );
}
