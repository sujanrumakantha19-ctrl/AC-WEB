import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");

export interface JWTPayload {
  userId: string;
  email: string;
  role: "user" | "admin";
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  const cookie = request.cookies.get("token");
  return cookie?.value || null;
}

export async function getUserFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}
