"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useAdminChanges, HomeSlotKey, HomeSlotValue } from "../AdminChangesContext";

type ArticleOption = { id: number; title: string; category: string };
type PostOption = { id: number; title: string };

type SlotDef = { key: HomeSlotKey; label: string; contentType: "article" | "post" };

const SLOT_DEFS: SlotDef[] = [
  { key: "left_1", label: "좌측 아티클 1", contentType: "article" },
  { key: "left_2", label: "좌측 아티클 2", contentType: "article" },
  { key: "hero", label: "중앙 대표 콘텐츠", contentType: "article" },
  { key: "circle_1", label: "우측 인기글 1", contentType: "post" },
  { key: "circle_2", label: "우측 인기글 2", contentType: "post" },
  { key: "circle_3", label: "우측 인기글 3", contentType: "post" },
  { key: "circle_4", label: "우측 인기글 4", contentType: "post" },
  { key: "circle_5", label: "우측 인기글 5", contentType: "post" },
];

const EMPTY_SLOT: HomeSlotValue = { content_type: null, content_id: null };

export default function AdminHomeContentPage() {
  const { pendingHomeSlots, setHomeSlot, version } = useAdminChanges();
  const [slots, setSlots] = useState<Record<HomeSlotKey, HomeSlotValue>>(() => {
    const initial = {} as Record<HomeSlotKey, HomeSlotValue>;
    SLOT_DEFS.forEach((slot) => (initial[slot.key] = EMPTY_SLOT));
    return initial;
  });
  const [articles, setArticles] = useState<ArticleOption[]>([]);
  const [posts, setPosts] = useState<PostOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);

    const [{ data: slotRows, error: slotError }, { data: articleRows }, { data: postRows }] = await Promise.all([
      supabase.from("home_slots").select("slot_key, content_type, content_id"),
      supabase.from("articles").select("id, title, category").order("id", { ascending: false }),
      supabase.from("posts").select("id, title").order("id", { ascending: false }),
    ]);

    if (slotError) {
      setError(slotError.message);
      setLoading(false);
      return;
    }

    const nextSlots = {} as Record<HomeSlotKey, HomeSlotValue>;
    SLOT_DEFS.forEach((slot) => {
      const row = (slotRows || []).find((r: { slot_key: string }) => r.slot_key === slot.key);
      nextSlots[slot.key] = row
        ? { content_type: row.content_type, content_id: row.content_id }
        : EMPTY_SLOT;
    });

    setSlots(nextSlots);
    setArticles((articleRows as ArticleOption[]) || []);
    setPosts((postRows as PostOption[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // 저장 성공 후(version 변경) 최신 슬롯 상태를 다시 불러와야 pending이 비워진 뒤에도
    // 방금 저장한 값이 화면에 남아있음.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const optionsFor = (slot: SlotDef) => (slot.contentType === "article" ? articles : posts);

  const labelFor = (slot: SlotDef, id: number) => {
    if (slot.contentType === "article") {
      const article = articles.find((a) => a.id === id);
      return article ? article.title : `(삭제된 아티클, id=${id})`;
    }
    const post = posts.find((p) => p.id === id);
    return post ? post.title : `(삭제된 게시글, id=${id})`;
  };

  return (
    <section className="bg-surface border border-border rounded-xl p-5 shadow-[0_1px_3px_rgba(23,27,35,0.045)]">
      <h2 className="text-base font-bold text-ink mb-1">홈 화면 관리</h2>
      <p className="text-sm text-ink-soft mb-4">
        `/home` 화면의 8개 영역에 노출할 콘텐츠를 직접 지정해요. "선택 안 함"으로 두면 기본 안내 콘텐츠가 대신
        노출돼요. 드롭다운을 바꾼 뒤 우측 하단 저장 버튼을 눌러야 실제로 반영돼요.
      </p>

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="text-sm text-ink-soft">로딩중...</p>
      ) : (
        <div className="flex flex-col">
          {SLOT_DEFS.map((slot, i) => {
            const original = slots[slot.key];
            const current = pendingHomeSlots[slot.key] ?? original;
            const isPending = slot.key in pendingHomeSlots;
            const options = optionsFor(slot);

            return (
              <div
                key={slot.key}
                className={`flex items-center justify-between gap-3 py-3 ${
                  i !== SLOT_DEFS.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="min-w-0">
                  <span className={`text-sm ${isPending ? "font-bold text-accent" : "font-medium text-ink"}`}>
                    {slot.label}
                    <span className="ml-1.5 text-xs font-normal text-ink-soft">
                      ({slot.contentType === "article" ? "Insights 아티클" : "Circle 게시글"})
                    </span>
                    {isPending && <span className="ml-1.5 text-xs font-normal text-accent">저장 안 됨</span>}
                  </span>
                  {current.content_id != null && (
                    <p className="mt-0.5 truncate text-xs text-ink-soft">{labelFor(slot, current.content_id)}</p>
                  )}
                </div>

                <select
                  value={current.content_id ?? ""}
                  onChange={(e) => {
                    const id = e.target.value === "" ? null : Number(e.target.value);
                    setHomeSlot(
                      slot.key,
                      id === null ? { content_type: null, content_id: null } : { content_type: slot.contentType, content_id: id },
                      original
                    );
                  }}
                  className="shrink-0 max-w-[220px] px-2.5 py-2 rounded-lg border border-border bg-surface text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/30"
                >
                  <option value="">선택 안 함</option>
                  {options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.title}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
