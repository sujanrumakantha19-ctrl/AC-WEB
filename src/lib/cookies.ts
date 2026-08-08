import type { NextResponse } from "next/server";

export const AUTH_COOKIE_NAME = "token";
export const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

/**
 * Stores the JWT in an httpOnly, same-site cookie — never exposed to JS.
 * Sensitive tokens are kept out of localStorage on purpose.
 */
export function setAuthCookie(
  response: NextResponse,
  token: string,
  secure = false
): NextResponse {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
  return response;
}

export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
