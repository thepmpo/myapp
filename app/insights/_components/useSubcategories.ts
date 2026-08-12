"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

export type Subcategory = { id: number; category: "trend" | "ai"; name: string };

// Trends/AI 세부 카테고리 목록 조회 — 글쓰기 화면 드롭다운과 목록 페이지 필터 칩이 공유.
export function useSubcategories(category: "trend" | "ai") {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("article_subcategories")
      .select("id, category, name")
      .eq("category", category)
      .order("name", { ascending: true });

    setSubcategories((data as Subcategory[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      const { data } = await supabase
        .from("article_subcategories")
        .select("id, category, name")
        .eq("category", category)
        .order("name", { ascending: true });

      if (active) {
        setSubcategories((data as Subcategory[]) || []);
        setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [category]);

  return { subcategories, loading, reload };
}
