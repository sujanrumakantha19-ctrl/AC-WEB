"use client";

let serverAnchorTime: number | null = null;
let perfAnchor: number = 0;
let isSyncing = false;
let syncPromise: Promise<number> | null = null;
const listeners = new Set<() => void>();

/**
 * Synchronizes client time with the server timestamp via /api/time.
 * Uses high-resolution monotonic performance.now() to ensure that once synced,
 * user system clock tampering (e.g. changing date/time on local OS) does NOT affect the timer.
 */
export async function syncServerTime(): Promise<number> {
  if (typeof window === "undefined") {
    return Date.now();
  }

  if (isSyncing && syncPromise) {
    return syncPromise;
  }

  isSyncing = true;
  syncPromise = (async () => {
    try {
      const t0 = performance.now();
      const res = await fetch("/api/time", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) throw new Error("Failed to fetch server time");
      const data = await res.json();
      const t1 = performance.now();
      const latency = (t1 - t0) / 2;
      const estimatedServerTime = Number(data.timestamp) + latency;

      serverAnchorTime = estimatedServerTime;
      perfAnchor = t1;

      listeners.forEach((cb) => {
        try {
          cb();
        } catch {
          // ignore callback error
        }
      });

      return estimatedServerTime;
    } catch {
      if (serverAnchorTime === null) {
        serverAnchorTime = Date.now();
        perfAnchor = performance.now();
      }
      return serverAnchorTime;
    } finally {
      isSyncing = false;
      syncPromise = null;
    }
  })();

  return syncPromise;
}

/**
 * Returns current server time in milliseconds.
 * Calculated monotonically from performance.now() so changing OS system time does not alter it.
 */
export function getServerNow(): number {
  if (typeof window === "undefined") {
    return Date.now();
  }
  if (serverAnchorTime === null) {
    // Trigger background sync if not yet initialized
    syncServerTime();
    return Date.now();
  }
  return serverAnchorTime + (performance.now() - perfAnchor);
}

/**
 * Subscribe to server time updates / syncs.
 */
export function subscribeServerTime(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Auto-initialize in browser environment
if (typeof window !== "undefined") {
  syncServerTime();

  // Periodic resync every 20 seconds to correct minor clock drifts
  setInterval(() => {
    syncServerTime();
  }, 20000);

  // Resync when tab regains focus or visibility
  window.addEventListener("focus", () => {
    syncServerTime();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      syncServerTime();
    }
  });
}
