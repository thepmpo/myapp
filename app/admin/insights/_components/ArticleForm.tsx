"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { ArticleCategory } from "@/app/lib/insightsCategories";

export default function ArticleForm({ articleId }: { articleId?: number }) {
  const router = useRouter();
  const isEdit = articleId != null;

  const [loading, setLoading] = useState(isEdit);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<ArticleCategory>("trend");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [insertingBodyImage, setInsertingBodyImage] = useState(false);
  const [error, setError] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bodyImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setCurrentUser({ id: data.user.id, email: data.user.email ?? "" });
      }

      if (isEdit) {
        const { data: article, error: fetchError } = await supabase
          .from("articles")
          .select("*")
          .eq("id", articleId)
          .single();

        if (fetchError) {
          setError(fetchError.message);
        } else if (article) {
          setTitle(article.title);
          setContent(article.content);
          setCategory(article.category);
          setExistingImageUrl(article.image_url);
        }

        setLoading(false);
      }
    };

    init();
  }, [articleId, isEdit]);

  // 굵게/기울임/밑줄/하이라이트: 선택한 텍스트를 기호로 감싸고, 선택이 없으면 기호 사이에 커서를 둠.
  const wrapSelection = (before: string, after: string = before) => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? content.length;
    const end = textarea?.selectionEnd ?? content.length;
    const selected = content.slice(start, end);
    const nextContent = `${content.slice(0, start)}${before}${selected}${after}${content.slice(end)}`;

    setContent(nextContent);

    const selectionStart = start + before.length;
    const selectionEnd = selectionStart + selected.length;
    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(selectionStart, selectionEnd);
    });
  };

  // 소제목: 커서가 있는 줄 맨 앞에 "## "를 붙임(이미 붙어있으면 중복 삽입하지 않음).
  const insertHeadingPrefix = () => {
    const textarea = textareaRef.current;
    const cursor = textarea?.selectionStart ?? content.length;
    const lineStart = content.lastIndexOf("\n", cursor - 1) + 1;

    if (content.slice(lineStart, lineStart + 3) === "## ") return;

    const nextContent = `${content.slice(0, lineStart)}## ${content.slice(lineStart)}`;
    setContent(nextContent);

    const cursorPos = cursor + 3;
    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(cursorPos, cursorPos);
    });
  };

  // 링크: URL을 입력받아 선택한 텍스트를 [텍스트](URL) 형태로 감쌈(선택 없으면 안내 텍스트 사용).
  const insertLink = () => {
    const url = window.prompt("링크 URL을 입력하세요");
    if (!url) return;

    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? content.length;
    const end = textarea?.selectionEnd ?? content.length;
    const selected = content.slice(start, end) || "링크 텍스트";
    const markdown = `[${selected}](${url})`;
    const nextContent = `${content.slice(0, start)}${markdown}${content.slice(end)}`;

    setContent(nextContent);

    const cursorPos = start + markdown.length;
    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(cursorPos, cursorPos);
    });
  };

  const insertImageIntoContent = async (file: File) => {
    if (!currentUser) {
      setError("로그인이 필요합니다");
      return;
    }

    setInsertingBodyImage(true);

    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
    const path = `${currentUser.id}/${Date.now()}-body.${extension}`;
    const { error: uploadError } = await supabase.storage.from("post-images").upload(path, file);

    setInsertingBodyImage(false);

    if (uploadError) {
      setError(uploadError.message);
      return;
    }

    const url = supabase.storage.from("post-images").getPublicUrl(path).data.publicUrl;
    const markdown = `![이미지](${url})`;

    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? content.length;
    const end = textarea?.selectionEnd ?? content.length;
    const before = content.slice(0, start);
    const after = content.slice(end);
    const leadingNewline = before.length > 0 && !before.endsWith("\n") ? "\n" : "";
    const trailingNewline = after.length > 0 && !after.startsWith("\n") ? "\n" : "";
    const insertText = `${leadingNewline}${markdown}${trailingNewline}`;
    const nextContent = `${before}${insertText}${after}`;

    setContent(nextContent);

    const cursorPos = before.length + insertText.length;
    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(cursorPos, cursorPos);
    });
  };

  const submit = async () => {
    if (!currentUser) {
      setError("로그인이 필요합니다");
      return;
    }

    if (!title || !content) {
      setError("제목과 내용을 입력하세요");
      return;
    }

    setError("");

    let imageUrl = existingImageUrl;

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

    if (isEdit) {
      const { error: updateError } = await supabase
        .from("articles")
        .update({ title, content, category, image_url: imageUrl })
        .eq("id", articleId);

      if (updateError) {
        setError(updateError.message);
        return;
      }
    } else {
      const { error: insertError } = await supabase.from("articles").insert([
        {
          title,
          content,
          category,
          author_id: currentUser.id,
          author: currentUser.email,
          image_url: imageUrl,
        },
      ]);

      if (insertError) {
        setError(insertError.message);
        return;
      }
    }

    router.push("/admin/insights");
  };

  if (loading) return <div className="text-sm text-ink-soft">로딩중...</div>;

  return (
    <div className="bg-surface rounded-xl border border-border p-5 shadow-[0_1px_3px_rgba(23,27,35,0.045)]">
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as ArticleCategory)}
        className="mb-2 px-3 py-2 rounded-lg border border-border bg-surface text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/30"
      >
        <option value="trend">Trends</option>
        <option value="ai">AI</option>
      </select>

      <input
        placeholder="글 제목 입력"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft mb-2 focus:outline-none focus:ring-2 focus:ring-accent/30"
      />

      <div className="flex flex-wrap gap-1.5 mb-2">
        <button type="button" onClick={() => wrapSelection("**")} className="px-2.5 py-1.5 rounded-md border border-border bg-surface text-xs font-bold text-ink-soft hover:bg-black/[0.03] cursor-pointer">
          굵게
        </button>
        <button type="button" onClick={() => wrapSelection("*")} className="px-2.5 py-1.5 rounded-md border border-border bg-surface text-xs italic text-ink-soft hover:bg-black/[0.03] cursor-pointer">
          기울임
        </button>
        <button type="button" onClick={() => wrapSelection("++")} className="px-2.5 py-1.5 rounded-md border border-border bg-surface text-xs underline text-ink-soft hover:bg-black/[0.03] cursor-pointer">
          밑줄
        </button>
        <button type="button" onClick={() => wrapSelection("==")} className="px-2.5 py-1.5 rounded-md border border-border bg-surface text-xs text-ink-soft hover:bg-black/[0.03] cursor-pointer">
          하이라이트
        </button>
        <button type="button" onClick={insertHeadingPrefix} className="px-2.5 py-1.5 rounded-md border border-border bg-surface text-xs font-bold text-ink-soft hover:bg-black/[0.03] cursor-pointer">
          소제목
        </button>
        <button type="button" onClick={insertLink} className="px-2.5 py-1.5 rounded-md border border-border bg-surface text-xs text-ink-soft hover:bg-black/[0.03] cursor-pointer">
          링크
        </button>
      </div>

      <textarea
        ref={textareaRef}
        placeholder="글 내용 입력 (굵게 **텍스트**, 기울임 *텍스트*, 밑줄 ++텍스트++, 하이라이트 ==텍스트==, 소제목 ## 텍스트, 링크 [텍스트](URL) 직접 입력도 가능해요)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft mb-2 min-h-[96px] focus:outline-none focus:ring-2 focus:ring-accent/30"
      />

      <input
        ref={bodyImageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) insertImageIntoContent(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => bodyImageInputRef.current?.click()}
        disabled={insertingBodyImage}
        className="mb-3 px-3 py-1.5 rounded-md border border-border bg-surface text-xs text-ink-soft hover:bg-black/[0.03] cursor-pointer disabled:opacity-50"
      >
        {insertingBodyImage ? "이미지 업로드 중..." : "+ 본문에 이미지 삽입"}
      </button>

      <div className="flex items-center gap-2 mb-3 text-xs text-ink-soft">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          className="text-xs text-ink-soft file:mr-2 file:px-2.5 file:py-1.5 file:rounded-md file:border file:border-border file:bg-surface file:text-xs file:text-ink-soft file:cursor-pointer cursor-pointer"
        />
        {imageFile ? (
          <span>{imageFile.name}</span>
        ) : (
          existingImageUrl && <span>기존 이미지 유지</span>
        )}
        {uploading && <span>업로드 중...</span>}
      </div>

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      <button
        onClick={submit}
        className="px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium shadow-[0_2px_0_rgba(23,27,35,0.15)] hover:bg-accent-hover cursor-pointer"
      >
        {isEdit ? "저장" : "발행"}
      </button>
    </div>
  );
}
