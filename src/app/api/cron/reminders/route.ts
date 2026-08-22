import { NextRequest } from "next/server";
import Auction from "@/models/Auction";
import { sendAuctionWhatsAppReminders } from "@/lib/auction-notifications";
import { ok, route } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export const GET = route(async (request: NextRequest) => {
  const now = new Date();
  const fifteenMinsFromNow = new Date(now.getTime() + 15 * 60 * 1000);

  const auctions = await Auction.find({
    status: "UPCOMING",
    reminderSent: { $ne: true },
    startTime: { $lte: fifteenMinsFromNow, $gte: new Date(now.getTime() - 10 * 60 * 1000) },
  }).exec();

  let sentCount = 0;
  for (const auction of auctions) {
    await sendAuctionWhatsAppReminders(auction);
    sentCount++;
  }

  return ok({ success: true, processed: sentCount, timestamp: now.toISOString() });
});
