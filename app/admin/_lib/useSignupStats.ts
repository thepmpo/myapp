import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { getSeedUserIds } from "./seedAccounts";

type ArticleView = { viewer_key: string };

export function useSignupStats(includeSeedData: boolean) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [todayCount, setTodayCount] = useState(0);
  const [last7DaysCount, setLast7DaysCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [articleViewCount, setArticleViewCount] = useState(0);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");

      const seedUserIds = await getSeedUserIds();

      const now = Date.now();
      // "오늘"/"최근 7일"은 달력 자정 기준이 아니라 지금으로부터의 rolling 24시간/7일 기준
      // (관리자가 어느 시간대에서 보든 경계가 모호해지지 않도록 단순하게 처리).
      const todaySince = new Date(now - 24 * 60 * 60 * 1000).toISOString();
      const sevenDaysSince = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

      const buildProfileCountQuery = (sinceIso?: string) => {
        let query = supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_admin", false);
        if (!includeSeedData) query = query.eq("is_seed", false);
        if (sinceIso) query = query.gte("created_at", sinceIso);
        return query;
      };

      const [todayRes, last7Res, totalRes, viewsRes] = await Promise.all([
        buildProfileCountQuery(todaySince),
        buildProfileCountQuery(sevenDaysSince),
        buildProfileCountQuery(),
        supabase.from("article_views").select("viewer_key"),
      ]);

      if (!active) return;

      const firstError = todayRes.error || last7Res.error || totalRes.error || viewsRes.error;
      if (firstError) {
        setError(firstError.message);
        setLoading(false);
        return;
      }

      const views = (viewsRes.data as ArticleView[]) || [];
      const filteredViewCount = includeSeedData
        ? views.length
        : views.filter((v) => !seedUserIds.has(v.viewer_key)).length;

      setTodayCount(todayRes.count ?? 0);
      setLast7DaysCount(last7Res.count ?? 0);
      setTotalCount(totalRes.count ?? 0);
      setArticleViewCount(filteredViewCount);
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, [includeSeedData]);

  return { loading, error, todayCount, last7DaysCount, totalCount, articleViewCount };
}
