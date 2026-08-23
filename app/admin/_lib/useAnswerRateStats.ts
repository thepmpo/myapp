import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { getSeedUserIds } from "./seedAccounts";

// PRD 성공 지표: 질문 태그 글 중 답변률 80% 이상, 첫 답변까지 2시간 이내
export const ANSWER_RATE_TARGET = 80;
export const RESPONSE_TIME_TARGET_MS = 2 * 60 * 60 * 1000;

type Post = { id: number; created_at: string; user_id: string };
type Comment = { post_id: number; created_at: string };

export function formatDuration(ms: number): string {
  if (ms < 60_000) return `${Math.round(ms / 1000)}초`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}분`;

  if (ms < 86_400_000) {
    const hours = Math.floor(ms / 3_600_000);
    const minutes = Math.round((ms % 3_600_000) / 60_000);
    return minutes > 0 ? `${hours}시간 ${minutes}분` : `${hours}시간`;
  }

  const days = Math.floor(ms / 86_400_000);
  const hours = Math.round((ms % 86_400_000) / 3_600_000);
  return hours > 0 ? `${days}일 ${hours}시간` : `${days}일`;
}

// posts.created_at은 "timestamp without time zone" 컬럼이라 오프셋 없이("2026-08-03T10:52:00")
// 내려오는데, DB 세션 타임존이 UTC라 실제로는 UTC 값임. new Date()에 그대로 넘기면
// 브라우저 로컬 시간대(예: KST, UTC+9)로 잘못 해석돼 응답시간이 9시간씩 어긋나므로
// 명시적으로 UTC로 파싱함(comments.created_at처럼 이미 오프셋이 있는 값은 그대로 둠).
function parseTimestamp(value: string): number {
  const hasTimezone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
  return new Date(hasTimezone ? value : `${value}Z`).getTime();
}

export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function useAnswerRateStats(includeSeedData: boolean) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [excludedSeedCount, setExcludedSeedCount] = useState(0);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");

      // "질문" 판정 기준은 Circle 목록의 "답변 없는 질문만 보기" 필터(app/circle/page.tsx)와 동일하게
      // is_question = true 로만 판단함(태그 없는 일반 공유 글은 분모에서 제외).
      const [{ data: postsData, error: postsError }, seedUserIds] = await Promise.all([
        supabase.from("posts").select("id, created_at, user_id").eq("is_question", true),
        getSeedUserIds(),
      ]);

      if (!active) return;

      if (postsError) {
        setError(postsError.message);
        setLoading(false);
        return;
      }

      const allQuestionPosts = (postsData as Post[]) || [];
      // 기본적으로는 통계를 왜곡하지 않도록 시드(더미) 계정 글을 제외하지만,
      // "데이터 표시" 토글이 켜져 있으면(포트폴리오 스크린샷용 등) 필터링을 건너뜀.
      const posts = includeSeedData ? allQuestionPosts : allQuestionPosts.filter((p) => !seedUserIds.has(p.user_id));
      setTotalQuestions(posts.length);
      setExcludedSeedCount(allQuestionPosts.length - posts.length);

      if (posts.length === 0) {
        setAnsweredQuestions(0);
        setResponseTimes([]);
        setLoading(false);
        return;
      }

      const postIds = posts.map((p) => p.id);
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("post_id, created_at")
        .in("post_id", postIds);

      if (!active) return;

      if (commentsError) {
        setError(commentsError.message);
        setLoading(false);
        return;
      }

      const comments = (commentsData as Comment[]) || [];
      const firstCommentAtByPost = new Map<number, string>();
      comments.forEach((c) => {
        const existing = firstCommentAtByPost.get(c.post_id);
        if (!existing || parseTimestamp(c.created_at) < parseTimestamp(existing)) {
          firstCommentAtByPost.set(c.post_id, c.created_at);
        }
      });

      const times: number[] = [];
      posts.forEach((p) => {
        const firstCommentAt = firstCommentAtByPost.get(p.id);
        if (firstCommentAt) {
          const diff = parseTimestamp(firstCommentAt) - parseTimestamp(p.created_at);
          if (diff >= 0) times.push(diff);
        }
      });

      setAnsweredQuestions(firstCommentAtByPost.size);
      setResponseTimes(times);
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, [includeSeedData]);

  return { loading, error, totalQuestions, answeredQuestions, responseTimes, excludedSeedCount };
}
