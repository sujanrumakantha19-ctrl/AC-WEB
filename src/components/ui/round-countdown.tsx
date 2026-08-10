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
  const roundIdx = currentRound - 1;
  const roundStart = roundTimes?.[roundIdx]?.start;
  const roundEnd = roundTimes?.[roundIdx]?.end;

  const start = useCountdown(roundStart);
  const end = useCountdown(roundEnd);

  if (status !== "LIVE" || !roundStart || !roundEnd) return null;

  if (!start.hasStarted) {
    return (
      <span className={`flex items-center gap-1 text-primary font-bold ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        Round {currentRound} starts in {start.display || "..."}
      </span>
    );
  }

  if (end.hasEnded) return null;

  return (
    <span className={`flex items-center gap-1 text-error font-bold ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
      Round {currentRound} ends in {end.display}
    </span>
  );
}