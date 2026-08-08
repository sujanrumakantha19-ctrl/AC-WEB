const rawEnv = process.env.NEXT_PUBLIC_ENV;

/**
 * Environment detection rule:
 *   NEXT_PUBLIC_ENV === "1" (or "true") => TEST environment
 *   anything else / missing            => LIVE environment
 */
export const IS_TEST_ENV =
  rawEnv === "1" || rawEnv === "true" || rawEnv === "TEST";

export const APP_ENV: "test" | "live" = IS_TEST_ENV ? "test" : "live";

export const IS_DEV = process.env.NODE_ENV === "development";

export const IS_LIVE_ENV = !IS_TEST_ENV;

/**
 * Base URL for API requests. Defaults to the same origin (empty string),
 * so all endpoints are relative to the app itself. Override for a
 * separate API host in production if needed.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "";
