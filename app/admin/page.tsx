"use client";

import { useState } from "react";
import { useAnswerRateStats } from "./_lib/useAnswerRateStats";
import { useSignupStats } from "./_lib/useSignupStats";
import AnswerRateCards from "./_components/AnswerRateCards";
import SignupStatsCards from "./_components/SignupStatsCards";
import SeedDataToggle from "./_components/SeedDataToggle";

export default function AdminDashboardPage() {
  const [includeSeedData, setIncludeSeedData] = useState(false);
  const answerRateStats = useAnswerRateStats(includeSeedData);
  const signupStats = useSignupStats(includeSeedData);

  return (
    <div>
      <SeedDataToggle checked={includeSeedData} onChange={setIncludeSeedData} showNotice={false} />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <AnswerRateCards {...answerRateStats} showSeedCaption={false} />
        <SignupStatsCards {...signupStats} />
      </div>
    </div>
  );
}
