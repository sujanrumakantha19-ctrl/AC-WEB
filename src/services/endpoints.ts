import { API_BASE_URL } from "@/config/env";

const api = (path: string) => `${API_BASE_URL}${path}`;

type QueryParams = Record<string, string | number | boolean | undefined | null>;

export function toQuery(params?: QueryParams): string {
  if (!params) return "";
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return qs ? `?${qs}` : "";
}

/**
 * Single source of truth for every API endpoint in the app.
 * All API methods (RTK Query slices and raw fetches) must reference these.
 */
export const ENDPOINTS = {
  auth: {
    login: api("/api/auth/login"),
    register: api("/api/auth/register"),
    logout: api("/api/auth/logout"),
    me: api("/api/auth/me"),
    changePassword: api("/api/auth/change-password"),
  },
  auctions: {
    list: (params?: { status?: string; limit?: number; page?: number } | void) =>
      `${api("/api/auctions")}${toQuery(params ?? undefined)}`,
    create: api("/api/auctions"),
    get: (id: string) => api(`/api/auctions/${id}`),
    update: (id: string) => api(`/api/auctions/${id}`),
    delete: (id: string) => api(`/api/auctions/${id}`),
    roundState: (id: string) => api(`/api/auctions/${id}/round-state`),
    roundControl: (id: string) => api(`/api/auctions/${id}/round-control`),
    payAccess: (id: string) => api(`/api/auctions/${id}/pay-access`),
    participants: (id: string) => api(`/api/auctions/${id}/participants`),
    offerTimeline: (id: string) => api(`/api/auctions/${id}/offer-timeline`),
  },
  offers: {
    list: (params?: { auction?: string; limit?: number } | void) =>
      `${api("/api/offers")}${toQuery(params ?? undefined)}`,
    create: api("/api/offers"),
  },
  admin: {
    users: (params?: { search?: string } | void) =>
      `${api("/api/admin/users")}${toQuery(params ?? undefined)}`,
    analyticsLive: (params?: { auction?: string } | void) =>
      `${api("/api/admin/analytics/live")}${toQuery(params ?? undefined)}`,
  },
  notifications: {
    list: api("/api/notifications"),
    update: api("/api/notifications"),
  },
  settings: {
    specialRules: api("/api/settings/special-rules"),
    registrationFee: api("/api/settings/registration-fee"),
  },
  user: {
    wins: api("/api/user/wins"),
    myAuctions: api("/api/user/my-auctions"),
  },
  upload: {
    image: api("/api/upload"),
  },
} as const;
