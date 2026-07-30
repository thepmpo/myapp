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
    <div style={{ maxWidth: 720, padding: 24 }}>
      <h1 style={{ marginBottom: 20 }}>정보게시판</h1>

      {currentUser?.isAdmin && (
        <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 16, marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, marginBottom: 8 }}>새 글 작성 (관리자)</h2>

          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as Article["category"])}
            style={{ marginBottom: 8, padding: 6 }}
          >
            <option value="product">프로덕트</option>
            <option value="trend">PM·PO 트렌드</option>
            <option value="ai">AI</option>
          </select>

          <input
            placeholder="글 제목 입력"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 8, marginBottom: 8 }}
          />

          <textarea
            placeholder="글 내용 입력"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 8, marginBottom: 8, minHeight: 80 }}
          />

          <div style={{ marginBottom: 8 }}>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
            {imageFile && <span style={{ marginLeft: 8 }}>{imageFile.name}</span>}
            {uploading && <span style={{ marginLeft: 8 }}>업로드 중...</span>}
          </div>

          <button
            onClick={addArticle}
            style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: "#000", color: "#fff", border: "none", cursor: "pointer" }}
          >
            발행
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["all", "product", "trend", "ai"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: category === c ? "1px solid #2E4A8F" : "1px solid #ccc",
              background: category === c ? "#EAEEF7" : "#f9f9f9",
              color: category === c ? "#2E4A8F" : "#000",
              cursor: "pointer",
            }}
          >
            {c === "all" ? "전체" : CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {filteredArticles.length === 0 && <p>❌ 게시글 없음</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filteredArticles.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.id}`}
            style={{
              display: "block",
              border: "1px solid #eee",
              borderRadius: 12,
              padding: 16,
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <span
              style={{
                display: "inline-block",
                marginBottom: 8,
                padding: "2px 8px",
                borderRadius: 4,
                background: "#EAEEF7",
                color: "#2E4A8F",
                fontSize: 12,
                fontWeight: "bold",
              }}
            >
              {CATEGORY_LABELS[article.category]}
            </span>

            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              {article.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={article.image_url}
                  alt=""
                  style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                />
              )}

              <div style={{ fontWeight: "bold", fontSize: 16 }}>{article.title}</div>
            </div>

            <div style={{ color: "#666", marginTop: 6, fontSize: 13 }}>
              {nicknames[article.author_id] ?? article.author}
            </div>

            <div style={{ color: "#999", marginTop: 6, fontSize: 12 }}>
              ❤️ {likeCounts[article.id] || 0} · 💬 {commentCounts[article.id] || 0}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
