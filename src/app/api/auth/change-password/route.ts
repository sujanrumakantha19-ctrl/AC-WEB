import { NextRequest } from "next/server";
import User from "@/models/User";
import { ok, badRequest, notFound, route, requireUser } from "@/lib/api-helpers";

export const POST = route(async (request: NextRequest) => {
  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;

  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword) {
    return badRequest("Current and new password are required");
  }

  const passwordRegex = /^.{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return badRequest("New password must be at least 8 characters long");
  }

  const user = await User.findById(auth.userId);
  if (!user) return notFound("User not found");

  const isValid = await user.comparePassword(currentPassword);
  if (!isValid) return badRequest("Current password is incorrect");

  if (currentPassword === newPassword) {
    return badRequest("New password must be different from current password");
  }

  user.password = newPassword;
  await user.save();

  return ok({ message: "Password changed successfully" });
});
