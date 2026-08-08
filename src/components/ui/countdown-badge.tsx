"use client";

import React from "react";
import { useCountdown } from "@/lib/use-countdown";

interface CountdownBadgeProps {
  startTime: string | Date | null | undefined;
  className?: string;
}

export function CountdownBadge({ startTime, className = "" }: CountdownBadgeProps) {
  const { display, hasStarted } = useCountdown(startTime);

  if (hasStarted) return null;

  return (
    <span className={`flex items-center gap-1 text-red-600 font-bold ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
      Starts in {display}
    </span>
  );
}
