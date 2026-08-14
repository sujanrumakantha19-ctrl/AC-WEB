import { NextRequest } from "next/server";
import Payment from "@/models/Payment";
import { ok, route, requireUser } from "@/lib/api-helpers";

export const GET = route(async (request: NextRequest) => {
  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;

  const payments = await Payment.find({ user: auth.userId })
    .sort({ createdAt: -1 })
    .populate("auction", "title lotNumber image status")
    .lean();

  return ok({ payments });
});
