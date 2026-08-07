"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import type { ArticleCategory } from "@/app/lib/insightsCategories";
import type { HomeArticle } from "@/app/components/home/types";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function useCategoryArticles(category: ArticleCategory) {
  const [articles, setArticles] = useState<HomeArticle[]>([]);
  const [nicknames, setNicknames] = useState<Record<string, string>>({});
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchNicknames = async (userIds: string[]) => {
      const uniqueIds = Array.from(new Set(userIds.filter((id) => id && UUID_REGEX.test(id))));
      if (uniqueIds.length === 0) {
        if (active) setNicknames({});
        return;
      }

      const { data, error } = await supabase.from("profiles").select("id, nickname").in("id", uniqueIds);
      if (!active || error) return;

      const map: Record<string, string> = {};
      (data || []).forEach((p: { id: string; nickname: string }) => {
        map[p.id] = p.nickname;
      });
      setNicknames(map);
    };

    const fetchCounts = async (articleIds: number[]) => {
      if (articleIds.length === 0) {
        if (active) {
          setCommentCounts({});
          setLikeCounts({});
        }
        return;
      }

      const [{ data: comments }, { data: likes }] = await Promise.all([
        supabase.from("comments").select("article_id").in("article_id", articleIds),
        supabase.from("likes").select("article_id").in("article_id", articleIds),
      ]);
      if (!active) return;

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

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!active || !data.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", data.user.id)
        .maybeSingle();

      if (active) setIsAdmin(!!profile?.is_admin);
    };

    const getArticles = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("category", category)
        .order("id", { ascending: false });

      if (!active) return;
      if (error) {
        alert(error.message);
        return;
      }

      const fetchedArticles = (data as HomeArticle[]) || [];
      setArticles(fetchedArticles);
      await Promise.all([
        fetchNicknames(fetchedArticles.map((a) => a.author_id)),
        fetchCounts(fetchedArticles.map((a) => a.id)),
      ]);
    };

    void loadUser();
    void getArticles();

    return () => {
      active = false;
    };
  }, [category]);

  return { articles, nicknames, commentCounts, likeCounts, isAdmin };
}
