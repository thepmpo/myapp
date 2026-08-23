"use client";

import { useState } from "react";
import { useAnswerRateStats } from "../_lib/useAnswerRateStats";
import AnswerRateCards from "../_components/AnswerRateCards";
import SeedDataToggle from "../_components/SeedDataToggle";

export default function AdminAnswerRatePage() {
  const [includeSeedData, setIncludeSeedData] = useState(false);
  const stats = useAnswerRateStats(includeSeedData);

  return (
    <div>
      <SeedDataToggle checked={includeSeedData} onChange={setIncludeSeedData} />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <AnswerRateCards {...stats} />
      </div>
    </div>
  );
}
