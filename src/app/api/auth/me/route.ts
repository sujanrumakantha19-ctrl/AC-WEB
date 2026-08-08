import { NextRequest } from "next/server";
import User from "@/models/User";
import { ok, conflict, notFound, route, requireUser } from "@/lib/api-helpers";

export const GET = route(async (request: NextRequest) => {
  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;
  const user = await User.findById(auth.userId).select("-password");
  if (!user) return notFound("User not found");
  return ok({ user });
});

export const PUT = route(async (request: NextRequest) => {
  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;

  const body = await request.json();
  const fields = [
    "name",
    "phone",
    "addressLine1",
    "addressLine2",
    "city",
    "state",
    "country",
    "pincode",
    "avatar",
  ] as const;

  const updateData: Record<string, unknown> = {};
  for (const field of fields) {
    if (body[field] !== undefined) updateData[field] = body[field];
  }

  if (updateData.phone) {
    const normalizedPhone = String(updateData.phone).replace(/[^\d]/g, "");
    const taken = await User.findOne({
      phone: { $regex: `${normalizedPhone}$` },
      _id: { $ne: auth.userId },
    });
    if (taken) return conflict("WhatsApp number already registered");
  }

  const user = await User.findByIdAndUpdate(auth.userId, updateData, { new: true }).select("-password");
  if (!user) return notFound("User not found");

  return ok({ user });
});
