import { NextRequest } from "next/server";
import Payment from "@/models/Payment";
import Auction from "@/models/Auction";
import { ok, route, requireUser } from "@/lib/api-helpers";
import { syncRefundSettlements, syncPendingPayments } from "@/lib/razorpay-sync";
import { processAuctionRefunds } from "@/lib/auction-refunds";

export const GET = route(async (request: NextRequest) => {
  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;

  try {
    // Check if the user has paid for any ended auctions that need refund processing
    const userPayments = await Payment.find({ user: auth.userId, status: "PAID" }).select("auction").lean();
    const auctionIds = Array.from(new Set(userPayments.map((p) => String(p.auction)).filter(Boolean)));
    if (auctionIds.length > 0) {
      const endedAuctions = await Auction.find({
        _id: { $in: auctionIds },
        status: "ENDED",
        refundsProcessed: { $ne: true },
      }).select("_id").lean();
      for (const a of endedAuctions) {
        await processAuctionRefunds(String((a as any)._id));
      }
    }
  } catch (err) {
    console.error("[user-payments] processAuctionRefunds trigger error", err);
  }

  try {
    await syncPendingPayments();
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
