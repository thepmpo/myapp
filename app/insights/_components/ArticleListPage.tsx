"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { ArticleCategory, CATEGORY_LABELS } from "@/app/lib/insightsCategories";

type Article = {
  id: number;
  title: string;
  content: string;
  category: ArticleCategory;
  author: string;
  author_id: string;
  image_url: string | null;
  created_at: string;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function ArticleListPage({ category }: { category: ArticleCategory }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [nicknames, setNicknames] = useState<Record<string, string>>({});
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", data.user.id)
        .maybeSingle();

      setIsAdmin(!!profile?.is_admin);
    };

    loadUser();
    getArticles();
  }, [category]);

  const getArticles = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("category", category)
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

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-ink">Insights</h1>

        {isAdmin && (
          <Link
            href="/insights/new"
            className="px-3 py-1.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover"
          >
            + 새 글 작성
          </Link>
        )}
      </div>

      {articles.length === 0 && <p className="text-sm text-ink-soft">아직 등록된 글이 없어요</p>}

      <div className="flex flex-col gap-3">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/insights/${article.id}`}
            className="block bg-surface rounded-xl border border-border p-4 shadow-[0_1px_3px_rgba(23,27,35,0.045)] hover:border-accent/30"
          >
            <span className="inline-block mb-2 text-xs font-bold text-ink-soft">
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
