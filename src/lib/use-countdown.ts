"use client";

import { useState, useEffect, useRef } from "react";

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
  const [now, setNow] = useState(Date.now());
  const serverOffsetRef = useRef(0);
  const syncedRef = useRef(false);

  useEffect(() => {
    const sync = async () => {
      const t0 = Date.now();
      const res = await fetch("/api/time");
      const data = await res.json();
      const t1 = Date.now();
      const rtt = t1 - t0;
      const serverTime = data.timestamp + rtt / 2;
      serverOffsetRef.current = serverTime - Date.now();
      syncedRef.current = true;
    };
    sync();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!targetDate) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, hasStarted: false, hasEnded: false, display: "" };
  }

  const serverNow = now + serverOffsetRef.current;
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
