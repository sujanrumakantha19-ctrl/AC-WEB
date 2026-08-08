"use client";

import React from "react";
import { useCountdown } from "@/lib/use-countdown";

interface UpcomingCountdownProps {
  startTime: string | Date | null | undefined;
  className?: string;
}

export function UpcomingCountdown({ startTime, className = "" }: UpcomingCountdownProps) {
  const { display, hasStarted } = useCountdown(startTime);

  return (
    <span className={`font-bold ${className}`}>
      {hasStarted ? "Starting soon" : display}
    </span>
  );
}
