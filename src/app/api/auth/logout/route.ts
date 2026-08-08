import { ok } from "@/lib/api-helpers";
import { clearAuthCookie } from "@/lib/cookies";

export async function POST() {
  return clearAuthCookie(ok({ message: "Logged out" }));
}
