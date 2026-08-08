export { formatINR, formatNumber } from "./format";

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getCusId(user?: string | { _id?: string; cusId?: string } | null): string {
  if (!user) return "—";
  if (typeof user === "object") {
    if (user.cusId) return user.cusId;
    if (user._id) return `CUS-${user._id.slice(-6).toUpperCase()}`;
    return "—";
  }
  if (typeof user === "string") {
    if (user.startsWith("CUS-")) return user;
    if (user.length === 24) return `CUS-${user.slice(-6).toUpperCase()}`;
    return user;
  }
  return "—";
}
