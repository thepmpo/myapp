"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

export default function AdminKeywordsPage() {
  const [keywords, setKeywords] = useState<{ id: number; keyword: string }[]>([]);
  const [newKeyword, setNewKeyword] = useState("");

  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    const { data, error } = await supabase
      .from("banned_keywords")
      .select("id, keyword")
      .order("created_at", { ascending: false });

    if (!error) setKeywords(data || []);
  };

  const addKeyword = async () => {
    if (!newKeyword.trim()) return;

    const { error } = await supabase.from("banned_keywords").insert([{ keyword: newKeyword.trim() }]);

    if (error) {
      alert(error.code === "23505" ? "이미 등록된 키워드입니다" : error.message);
    } else {
      setNewKeyword("");
      await fetchKeywords();
    }
  };

  const deleteKeyword = async (keywordId: number) => {
    const { error } = await supabase.from("banned_keywords").delete().eq("id", keywordId);

    if (error) {
      alert(error.message);
    } else {
      await fetchKeywords();
    }
  };

  return (
    <div>
      <section className="bg-surface border border-border rounded-xl p-5 shadow-[0_1px_3px_rgba(23,27,35,0.045)]">
        <h2 className="text-base font-bold text-ink mb-4">금지 키워드 ({keywords.length})</h2>

        <div className="flex gap-2 mb-4">
          <input
            placeholder="새 금지 키워드"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <button
            onClick={addKeyword}
            className="px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium shadow-[0_2px_0_rgba(23,27,35,0.15)] hover:bg-accent-hover cursor-pointer"
          >
            추가
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {keywords.map((k) => (
            <span
              key={k.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-surface text-xs text-ink-soft"
            >
              {k.keyword}
              <button
                onClick={() => deleteKeyword(k.id)}
                className="border-none bg-transparent cursor-pointer text-ink-soft hover:text-red-500"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
