"use client";

import { ANSWER_RATE_TARGET, RESPONSE_TIME_TARGET_MS, formatDuration, median } from "../_lib/useAnswerRateStats";

type Props = {
  loading: boolean;
  error: string;
  totalQuestions: number;
  answeredQuestions: number;
  responseTimes: number[];
  excludedSeedCount: number;
  // 대시보드처럼 여러 카드가 한 화면에 모여 있을 땐 시드 제외 안내 문구를 생략해 깔끔하게 유지.
  showSeedCaption?: boolean;
};

export default function AnswerRateCards({
  loading,
  error,
  totalQuestions,
  answeredQuestions,
  responseTimes,
  excludedSeedCount,
  showSeedCaption = true,
}: Props) {
  if (loading) {
    return <p className="text-sm text-ink-soft">로딩중...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  const answerRate = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  const averageMs = responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : null;
  const medianMs = responseTimes.length > 0 ? median(responseTimes) : null;

  const meetsRateTarget = totalQuestions > 0 && answerRate >= ANSWER_RATE_TARGET;
  const meetsTimeTarget = medianMs !== null && medianMs <= RESPONSE_TIME_TARGET_MS;

  return (
    <>
      <section className="flex h-full flex-col bg-surface border border-border rounded-xl p-6 shadow-[0_1px_3px_rgba(23,27,35,0.045)]">
        <h2 className="text-sm font-bold text-ink mb-1">답변률</h2>
        <p className="text-3xl font-bold text-ink">{totalQuestions > 0 ? `${answerRate.toFixed(1)}%` : "-"}</p>
        <p className="mt-1 text-xs text-ink-soft">
          {totalQuestions > 0
            ? `${totalQuestions}개 중 ${answeredQuestions}개 답변됨`
            : excludedSeedCount > 0
              ? "아직 답변할 실제 질문이 없어요"
              : "질문 태그가 붙은 글이 아직 없어요"}
        </p>
        {showSeedCaption && excludedSeedCount > 0 && (
          <p className="mt-0.5 text-[11px] text-ink-soft">시드 데이터 {excludedSeedCount}개 제외</p>
        )}
        {totalQuestions > 0 && (
          <>
            <p className={`mt-2 text-xs font-medium ${meetsRateTarget ? "text-emerald-600" : "text-red-500"}`}>
              목표(80% 이상) {meetsRateTarget ? "달성" : "미달성"}
            </p>

            <div className="relative mt-5 pb-5">
              <div className="relative h-2.5 w-full rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.min(answerRate, 100)}%` }}
                />
                <div className="absolute inset-y-0 w-0.5 bg-red-500" style={{ left: `${ANSWER_RATE_TARGET}%` }} />
              </div>
              <span
                className="absolute top-4 -translate-x-1/2 whitespace-nowrap text-[11px] font-medium text-red-500"
                style={{ left: `${ANSWER_RATE_TARGET}%` }}
              >
                목표 {ANSWER_RATE_TARGET}%
              </span>
            </div>
          </>
        )}
      </section>

      <section className="flex h-full flex-col bg-surface border border-border rounded-xl p-6 shadow-[0_1px_3px_rgba(23,27,35,0.045)]">
        <h2 className="text-sm font-bold text-ink mb-1">응답 시간</h2>
        {medianMs !== null ? (
          <>
            <p className="text-3xl font-bold text-ink">{formatDuration(medianMs)}</p>
            <p className="mt-1 text-xs text-ink-soft">
              중앙값 기준 · 평균 {formatDuration(averageMs ?? 0)} · 답변된 질문 {responseTimes.length}개 기준
            </p>
            <p className={`mt-2 text-xs font-medium ${meetsTimeTarget ? "text-emerald-600" : "text-red-500"}`}>
              목표(2시간 이내) {meetsTimeTarget ? "달성" : "미달성"}
            </p>
          </>
        ) : (
          <p className="text-sm text-ink-soft">아직 답변된 질문이 없어요</p>
        )}
      </section>
    </>
  );
}
