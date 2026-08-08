"use client";

import React from "react";
import { useCountdown } from "@/lib/use-countdown";

interface RoundCountdownProps {
  roundTimes?: { start: string; end: string }[];
  currentRound?: number;
  status?: string;
  className?: string;
}

export function RoundCountdown({ roundTimes, currentRound = 1, status, className = "" }: RoundCountdownProps) {
  if (status !== "LIVE" || !roundTimes || roundTimes.length === 0) return null;

  const roundIdx = currentRound - 1;
  const roundEnd = roundTimes[roundIdx]?.end;
  const { display, hasEnded } = useCountdown(roundEnd);

  if (hasEnded) return null;

  return (
    <span className={`flex items-center gap-1 text-error font-bold ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
      Round {currentRound} ends in {display}
    </span>
  );
}
