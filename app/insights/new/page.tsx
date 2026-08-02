"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { ArticleCategory } from "@/app/lib/insightsCategories";

export default function NewInsightArticlePage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; isAdmin: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<ArticleCategory>("product");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", data.user.id)
          .maybeSingle();

        setCurrentUser({ id: data.user.id, email: data.user.email ?? "", isAdmin: !!profile?.is_admin });
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  const addArticle = async () => {
    if (!currentUser?.isAdmin) {
      alert("관리자만 작성할 수 있습니다");
      return;
    }

    if (!title || !content) {
      alert("제목과 내용을 입력하세요");
      return;
    }

    let imageUrl: string | null = null;

    if (imageFile) {
      setUploading(true);

      const path = `${currentUser.id}/${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await supabase.storage.from("post-images").upload(path, imageFile);

      setUploading(false);

      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      imageUrl = supabase.storage.from("post-images").getPublicUrl(path).data.publicUrl;
    }

    const { error } = await supabase.from("articles").insert([
      {
        title,
        content,
        category,
        author_id: currentUser.id,
        author: currentUser.email,
        image_url: imageUrl,
      },
    ]);

    if (error) {
      alert(error.message);
    } else {
      router.push(`/insights/${category}`);
    }
  };

  if (loading) return <div className="text-sm text-ink-soft">로딩중...</div>;

  if (!currentUser?.isAdmin) {
    return (
      <div>
        <div className="mb-5">
          <Link href="/insights/product" className="text-sm text-ink-soft hover:text-accent">
            ← Insights로
          </Link>
        </div>
        <p className="text-sm text-ink-soft">관리자만 접근할 수 있습니다</p>
      </div>
    );
  }

  return (
    <div className="max-w-[640px]">
      <div className="mb-5">
        <Link href="/insights/product" className="text-sm text-ink-soft hover:text-accent">
          ← Insights로
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-ink mb-5">새 글 작성</h1>

      <div className="bg-surface rounded-xl border border-border p-4 shadow-[0_1px_3px_rgba(23,27,35,0.045)]">
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
          {imageFile && <span>{imageFile.name}</span>}
          {uploading && <span>업로드 중...</span>}
        </div>

        <button
          onClick={addArticle}
          className="px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium shadow-[0_2px_0_rgba(23,27,35,0.15)] hover:bg-accent-hover cursor-pointer"
        >
          발행
        </button>
      </div>
    </div>
  );
}
