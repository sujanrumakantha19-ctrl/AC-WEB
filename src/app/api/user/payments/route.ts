import { NextRequest } from "next/server";
import Payment from "@/models/Payment";
import { ok, route, requireUser } from "@/lib/api-helpers";
import { syncRefundSettlements } from "@/lib/razorpay-sync";

export const GET = route(async (request: NextRequest) => {
  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;

  try {
    await syncRefundSettlements({ userId: auth.userId });
  } catch (err) {
    console.error("[user-payments] refund settlement sync failed", err);
  }

  const payments = await Payment.find({ user: auth.userId })
    .sort({ createdAt: -1 })
    .populate("auction", "title lotNumber image status")
    .lean();

  return ok({ payments });
});
