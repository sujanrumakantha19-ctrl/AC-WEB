import { formatDate } from "./format";

export function getInitials(name?: string, fallback = "User"): string {
  return (name || fallback)
    .split(" ")
    .map((w) => w.charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatDateTime(
  value?: string | Date | null,
  opts?: Intl.DateTimeFormatOptions
): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    ...opts,
  });
}

export function timeAgo(value?: string | Date | null): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "—";
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDate(value);
}

export function errorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message || fallback;
  if (typeof error === "object") {
    const e = error as { data?: { error?: unknown }; message?: unknown };
    if (e?.data && typeof e.data === "object") {
      const dataErr = (e.data as { error?: unknown }).error;
      if (typeof dataErr === "string") return dataErr;
    }
    if (e?.data && typeof e.data === "string") return e.data;
    if (typeof e?.message === "string") return e.message;
  }
  return fallback;
}

export function debounce<A extends unknown[]>(fn: (...args: A) => void, wait = 300) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: A) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function isNumeric(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

export function getErrorMessageFromResponse(error: unknown): string {
  return errorMessage(error);
}
