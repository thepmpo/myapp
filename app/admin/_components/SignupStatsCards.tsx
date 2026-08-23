"use client";

type Props = {
  loading: boolean;
  error: string;
  todayCount: number;
  last7DaysCount: number;
  totalCount: number;
  articleViewCount: number;
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <section className="flex h-full flex-col bg-surface border border-border rounded-xl p-6 shadow-[0_1px_3px_rgba(23,27,35,0.045)]">
      <h2 className="text-sm font-bold text-ink mb-1">{label}</h2>
      <p className="text-3xl font-bold text-ink">{value}</p>
    </section>
  );
}

export default function SignupStatsCards({
  loading,
  error,
  todayCount,
  last7DaysCount,
  totalCount,
  articleViewCount,
}: Props) {
  if (loading) {
    return <p className="text-sm text-ink-soft">로딩중...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  return (
    <>
      <StatCard label="오늘 신규 가입" value={`${todayCount}명`} />
      <StatCard label="최근 7일 신규 가입" value={`${last7DaysCount}명`} />
      <StatCard label="누적 가입자 수(관리자 제외)" value={`${totalCount}명`} />
      <StatCard label="아티클 조회수" value={`${articleViewCount}회`} />
    </>
  );
}
