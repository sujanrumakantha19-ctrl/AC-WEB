import { NextRequest } from "next/server";
import User from "@/models/User";
import dbConnect from "@/lib/db";
import { ok, badRequest, route, notFound } from "@/lib/api-helpers";
import { sendResetOtpEmail } from "@/lib/email";

export const POST = route(async (request: NextRequest) => {
  await dbConnect();
  const body = await request.json();
  const email = body?.email?.toString().trim().toLowerCase();

  if (!email) {
    return badRequest("Email address is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    return notFound("No registered account found with this email address");
  }

  // Generate 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.resetOtp = otp;
  user.resetOtpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity
  await user.save();

  try {
    await sendResetOtpEmail({
      to: user.email,
      name: user.name || "Member",
      otp,
    });
  } catch (err: any) {
    console.error("[forgot-password] Email sending error:", err);
    return badRequest("Failed to send verification email. Please check your email address or try again later.");
  }

  return ok({
    success: true,
    message: "Verification code sent to your email address.",
  });
});
