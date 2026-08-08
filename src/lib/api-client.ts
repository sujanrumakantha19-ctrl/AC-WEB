import { API_BASE_URL } from "@/config/env";
import { errorMessage } from "@/lib/helpers";

interface ApiClientOptions extends Omit<RequestInit, "body"> {
  json?: unknown;
  formData?: FormData;
  params?: Record<string, string | number | boolean | undefined | null>;
}

/**
 * Thin, shared fetch wrapper used for one-off/non-RTK calls.
 * Always sends credentials (cookies) and normalizes errors.
 */
export async function apiClient<T = unknown>(
  path: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { json, formData, params, headers, ...rest } = options;

  const query = params
    ? Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join("&")
    : "";

  const url = `${API_BASE_URL}${path}${query ? `?${query}` : ""}`;

  const res = await fetch(url, {
    ...rest,
    credentials: "include",
    headers: {
      ...(formData ? {} : json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: formData ?? (json !== undefined ? JSON.stringify(json) : undefined),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(errorMessage(data));
  }

  return data as T;
}
