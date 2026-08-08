import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import { signToken } from "@/lib/auth";
import { ok, badRequest, route } from "@/lib/api-helpers";
import { setAuthCookie } from "@/lib/cookies";

function toURL(path: string, base: string): URL {
  return new URL(path.startsWith("/") ? path : "/" + path, base);
}

export const POST = route(async (request: NextRequest) => {
  const ct = request.headers.get("content-type") || "";
  const isFormSubmit = !ct.includes("application/json");

  let email: string, password: string;
  if (!isFormSubmit) {
    const body = await request.json();
    email = body.email;
    password = body.password;
  } else {
    const formData = await request.formData();
    email = formData.get("email") as string;
    password = formData.get("password") as string;
  }

  const formErrorRedirect = (msg: string) =>
    NextResponse.redirect(toURL(`/login?error=${encodeURIComponent(msg)}`, request.url), 302);

  if (!email || !password) {
    return isFormSubmit
      ? formErrorRedirect("Email and password are required")
      : badRequest("Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  const isValid = user ? await user.comparePassword(password) : false;
  if (!user || !isValid) {
    return isFormSubmit
      ? formErrorRedirect("Invalid email or password")
      : badRequest("Invalid email or password");
  }

  const token = await signToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  const target = user.role === "admin" ? "/admin/dashboard" : "/user/dashboard";
  const response = isFormSubmit
    ? NextResponse.redirect(toURL(target, request.url), 302)
    : ok({
        message: "Login successful",
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          cusId: user.cusId,
          accountType: user.accountType,
          kycVerified: user.kycVerified,
          paidAccessAuctions: user.paidAccessAuctions,
          avatar: user.avatar,
        },
      });

  return setAuthCookie(response, token, request.nextUrl.protocol === "https:");
});
