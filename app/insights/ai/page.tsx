import type { Metadata } from "next";
import AiLandingPage from "../_components/AiLandingPage";

export const metadata: Metadata = {
  title: "AI | The PMPO",
  description: "AI가 프로덕트와 PM의 일하는 방식을 어떻게 바꾸고 있는지 다뤄요.",
};

export default function InsightsAiPage() {
  return <AiLandingPage />;
}
