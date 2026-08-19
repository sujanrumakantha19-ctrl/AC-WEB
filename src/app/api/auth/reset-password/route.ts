import { NextRequest } from "next/server";
import User from "@/models/User";
import dbConnect from "@/lib/db";
import { ok, badRequest, route, notFound } from "@/lib/api-helpers";

const passwordRegex = /^.{8,}$/;

export const POST = route(async (request: NextRequest) => {
  await dbConnect();
  const body = await request.json();

  const email = body?.email?.toString().trim().toLowerCase();
  const otp = body?.otp?.toString().trim();
  const newPassword = body?.newPassword;

  if (!email || !otp || !newPassword) {
    return badRequest("Email, OTP code, and new password are required");
  }

  if (!passwordRegex.test(newPassword)) {
    return badRequest("Password must be at least 8 characters long.");
  }

  const user = await User.findOne({ email });
  if (!user) {
    return notFound("User account not found");
  }

  if (!user.resetOtp || user.resetOtp !== otp) {
    return badRequest("Invalid OTP verification code. Please check and try again.");
  }

  if (!user.resetOtpExpires || new Date() > new Date(user.resetOtpExpires)) {
    return badRequest("OTP verification code has expired. Please request a new code.");
  }

  // Update password and clear OTP fields
  user.password = newPassword; // Triggers UserSchema pre-save bcrypt hash
  user.resetOtp = undefined;
  user.resetOtpExpires = undefined;

  await user.save();

  return ok({
    success: true,
    message: "Password updated successfully. You can now log in with your new password.",
  });
});
