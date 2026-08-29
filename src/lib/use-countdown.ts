"use client";

import { useState, useEffect } from "react";
import { getServerNow, subscribeServerTime } from "@/lib/server-time";

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  hasStarted: boolean;
  hasEnded: boolean;
  display: string;
}

export function useCountdown(targetDate: Date | string | null | undefined): CountdownResult {
  const [serverNow, setServerNow] = useState<number>(() => getServerNow());

  useEffect(() => {
    // Immediately update on mount
    setServerNow(getServerNow());

    // Subscribe to server time sync events
    const unsubscribe = subscribeServerTime(() => {
      setServerNow(getServerNow());
    });

    // Update every second using monotonic server clock
    const interval = setInterval(() => {
      setServerNow(getServerNow());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  if (!targetDate) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, hasStarted: false, hasEnded: false, display: "" };
  }

  const target = typeof targetDate === "string" ? new Date(targetDate).getTime() : new Date(targetDate).getTime();
  const diff = target - serverNow;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, hasStarted: true, hasEnded: true, display: "Auction Started" };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const d = days;
  const h = hours.toString().padStart(2, "0");
  const m = minutes.toString().padStart(2, "0");
  const s = seconds.toString().padStart(2, "0");

  let display = "";
  if (d > 0) {
    display = `${d}d ${h}h ${m}m ${s}s`;
  } else if (hours > 0) {
    display = `${hours}h ${m}m ${s}s`;
  } else {
    display = `${minutes}m ${s}s`;
  }

  return { days, hours, minutes, seconds, hasStarted: false, hasEnded: false, display };
}
