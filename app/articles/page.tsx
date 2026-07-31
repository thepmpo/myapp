"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";

type Article = {
  id: number;
  title: string;
  content: string;
  category: "product" | "trend" | "ai";
  author: string;
  author_id: string;
  image_url: string | null;
  created_at: string;
};

const CATEGORY_LABELS: Record<Article["category"], string> = {
  product: "프로덕트",
  trend: "PM·PO 트렌드",
  ai: "AI",
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState<Article["category"] | "all">("all");
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; isAdmin: boolean } | null>(null);
  const [nicknames, setNicknames] = useState<Record<string, string>>({});
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [newCategory, setNewCategory] = useState<Article["category"]>("product");
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
    };

    loadUser();
    getArticles();
  }, []);

  const getArticles = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    const fetchedArticles = (data as Article[]) || [];
    setArticles(fetchedArticles);
    await fetchNicknames(fetchedArticles.map((a) => a.author_id));
    await fetchCounts(fetchedArticles.map((a) => a.id));
  };

  const fetchNicknames = async (userIds: string[]) => {
    const uniqueIds = Array.from(new Set(userIds.filter((id) => id && UUID_REGEX.test(id))));

    if (uniqueIds.length === 0) {
      setNicknames({});
      return;
    }

    const { data, error } = await supabase.from("profiles").select("id, nickname").in("id", uniqueIds);

    if (!error) {
      const map: Record<string, string> = {};
      (data || []).forEach((p: { id: string; nickname: string }) => {
        map[p.id] = p.nickname;
      });
      setNicknames(map);
    }
  };

  const fetchCounts = async (articleIds: number[]) => {
    if (articleIds.length === 0) {
      setCommentCounts({});
      setLikeCounts({});
      return;
    }

    const [{ data: comments }, { data: likes }] = await Promise.all([
      supabase.from("comments").select("article_id").in("article_id", articleIds),
      supabase.from("likes").select("article_id").in("article_id", articleIds),
    ]);

    const cCounts: Record<number, number> = {};
    (comments || []).forEach((c: { article_id: number }) => {
      cCounts[c.article_id] = (cCounts[c.article_id] || 0) + 1;
    });

    const lCounts: Record<number, number> = {};
    (likes || []).forEach((l: { article_id: number }) => {
      lCounts[l.article_id] = (lCounts[l.article_id] || 0) + 1;
    });

    setCommentCounts(cCounts);
    setLikeCounts(lCounts);
  };

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
        category: newCategory,
        author_id: currentUser.id,
        author: currentUser.email,
        image_url: imageUrl,
      },
    ]);

    if (error) {
      alert(error.message);
    } else {
      setTitle("");
      setContent("");
      setNewCategory("product");
      setImageFile(null);
      await getArticles();
    }
  };

  const filteredArticles = articles.filter((a) => category === "all" || a.category === category);

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-5">정보게시판</h1>

      {currentUser?.isAdmin && (
        <div className="bg-surface rounded-xl border border-border p-4 shadow-[0_1px_3px_rgba(23,27,35,0.045)] mb-6">
          <h2 className="text-sm font-bold text-ink mb-3">새 글 작성 (관리자)</h2>

          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as Article["category"])}
            className="mb-2 px-3 py-2 rounded-lg border border-border bg-surface text-sm text-ink focus:outline-none focus:ring-2 focus:ring-cobalt/30"
          >
            <option value="product">프로덕트</option>
            <option value="trend">PM·PO 트렌드</option>
            <option value="ai">AI</option>
          </select>

          <input
            placeholder="글 제목 입력"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft mb-2 focus:outline-none focus:ring-2 focus:ring-cobalt/30"
          />

          <textarea
            placeholder="글 내용 입력"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft mb-2 min-h-[96px] focus:outline-none focus:ring-2 focus:ring-cobalt/30"
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
            className="px-4 py-2.5 rounded-lg bg-cobalt text-white text-sm font-medium shadow-[0_2px_0_rgba(23,27,35,0.15)] hover:bg-cobalt-dark cursor-pointer"
          >
            발행
          </button>
        </div>
      )}

      <div className="flex gap-6 border-b border-border mb-6">
        {(["all", "product", "trend", "ai"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`-mb-px pb-3 text-sm cursor-pointer border-b-2 ${
              category === c
                ? "text-cobalt border-cobalt font-medium"
                : "text-ink-soft border-transparent hover:text-ink"
            }`}
          >
            {c === "all" ? "전체" : CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {filteredArticles.length === 0 && <p className="text-sm text-ink-soft">❌ 게시글 없음</p>}

      <div className="flex flex-col gap-3">
        {filteredArticles.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.id}`}
            className="block bg-surface rounded-xl border border-border p-4 shadow-[0_1px_3px_rgba(23,27,35,0.045)] hover:border-cobalt/30"
          >
            <span className="inline-block mb-2 px-2 py-0.5 rounded bg-cobalt/10 text-cobalt text-xs font-bold">
              {CATEGORY_LABELS[article.category]}
            </span>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-bold text-base text-ink">{article.title}</div>

                <p className="mt-1.5 text-sm text-ink-soft line-clamp-2">{article.content}</p>

                <div className="mt-2.5 text-sm font-mono text-ink-soft">
                  {nicknames[article.author_id] ?? article.author}
                </div>

                <div className="mt-1 text-xs font-mono text-ink-soft">
                  {new Date(article.created_at).toLocaleDateString("ko-KR")} · ❤️ {likeCounts[article.id] || 0} · 💬{" "}
                  {commentCounts[article.id] || 0}
                </div>
              </div>

              <div className="w-20 h-20 rounded-lg bg-border shrink-0 overflow-hidden">
                {article.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={article.image_url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
