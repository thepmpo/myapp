import type { Metadata } from "next";
import TrendLandingPage from "../_components/TrendLandingPage";

export const metadata: Metadata = {
  title: "Trends | The PMPO",
  description: "PM/PO가 꼭 알아야 할 최신 트렌드와 인사이트를 모았어요.",
};

export default function InsightsTrendPage() {
  return <TrendLandingPage />;
}
