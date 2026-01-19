"use client";

import { useState } from "react";
import CandlestickChart from "./CandlestickChart";

interface CoinChartClientProps {
  initialData: OHLCData[];
  coinId: string;
  children: React.ReactNode;
}

export default function CoinChartClient({
  initialData,
  coinId,
  children,
}: CoinChartClientProps) {
  // We manage the interval state here so we can pass it down
  const [liveInterval, setLiveInterval] = useState<LiveInterval>("1m");

  return (
    <CandlestickChart
      liveInterval={liveInterval}
      setLiveInterval={setLiveInterval}
      data={initialData}
      coinId={coinId}
    >
      {children}
    </CandlestickChart>
  );
}
