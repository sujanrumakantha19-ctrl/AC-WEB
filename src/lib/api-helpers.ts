import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import type { JWTPayload } from "@/lib/auth";

export type RouteContext<P extends Record<string, string> = Record<string, string>> = {
  params: Promise<P>;
};

type RouteHandler<P extends Record<string, string> = Record<string, string>> = (
  request: NextRequest,
  ctx: RouteContext<P>
) => Promise<NextResponse> | NextResponse;

/* ---------- Response helpers ---------- */

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function created<T>(data: T): NextResponse {
  return NextResponse.json(data, { status: 201 });
}

export function fail(message: string, status = 500, extra?: Record<string, unknown>): NextResponse {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function badRequest(message = "Bad request"): NextResponse {
  return fail(message, 400);
}

export function unauthorized(message = "Not authenticated"): NextResponse {
  return fail(message, 401);
}

export function forbidden(message = "Forbidden"): NextResponse {
  return fail(message, 403);
}

export function notFound(message = "Not found"): NextResponse {
  return fail(message, 404);
}

export function conflict(message = "Conflict"): NextResponse {
  return fail(message, 409);
}

/* ---------- Error handling ---------- */

export function handleError(error: unknown, fallback = "Something went wrong"): NextResponse {
  const err = error as { code?: number | string; message?: string; name?: string };
  if (err?.code === 11000) {
    return conflict("Duplicate value already exists");
  }
  if (err?.name === "ValidationError" || err?.name === "CastError") {
    return badRequest(err.message || "Invalid data provided");
  }
  return fail(err?.message || fallback, 500);
}

/**
 * Wraps a route handler with a try/catch + DB connection so every route
 * stays thin and consistent.
 */
export function route<P extends Record<string, string> = Record<string, string>>(
  handler: RouteHandler<P>
): (request: NextRequest, ctx: RouteContext<P>) => Promise<NextResponse> {
  return async (request: NextRequest, ctx: RouteContext<P>): Promise<NextResponse> => {
    try {
      await dbConnect();
      return await handler(request, ctx);
    } catch (error) {
      return handleError(error);
    }
  };
}

/* ---------- Auth guards ---------- */

export type AuthResult<P extends Record<string, string> = Record<string, string>> =
  | JWTPayload
  | NextResponse;

/**
 * Returns the authenticated JWT payload or a 401 response.
 * Callers must check `if (result instanceof NextResponse) return result;`
 * before treating the result as a payload.
 */
export async function requireUser(request: NextRequest): Promise<AuthResult> {
  const payload = await getUserFromRequest(request);
  if (!payload) return unauthorized();
  return payload;
}

export async function requireAdmin(request: NextRequest): Promise<AuthResult> {
  const result = await requireUser(request);
  if (result instanceof NextResponse) return result;
  if (result.role !== "admin") return forbidden("Admin access required");
  return result;
}

/* ---------- Body helpers ---------- */

export async function parseJson<T = Record<string, unknown>>(request: NextRequest): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
}
