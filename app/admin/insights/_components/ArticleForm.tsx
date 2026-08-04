"use client";

import { useEffect, useState } from "react";
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
  const [category, setCategory] = useState<ArticleCategory>("product");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

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
        <option value="product">Product</option>
        <option value="trend">Trends</option>
        <option value="ai">AI</option>
      </select>

      <input
        placeholder="글 제목 입력"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft mb-2 focus:outline-none focus:ring-2 focus:ring-accent/30"
      />

      <textarea
        placeholder="글 내용 입력"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft mb-2 min-h-[96px] focus:outline-none focus:ring-2 focus:ring-accent/30"
      />

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
