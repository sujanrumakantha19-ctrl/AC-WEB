import { NextRequest } from "next/server";
import Auction from "@/models/Auction";
import { sendAuctionWhatsAppReminders } from "@/lib/auction-notifications";
import { ok, route } from "@/lib/api-helpers";
import { getISTDayRange } from "@/lib/auction-status";

export const dynamic = "force-dynamic";

export const GET = route(async (request: NextRequest) => {
  const now = new Date();
  const { startOfToday, endOfToday } = getISTDayRange(now);

  // Find all auctions (both regular live auctions & parking sales) that:
  // 1. Have start time today in Indian Standard Time (Asia/Kolkata)
  // 2. Are not yet ENDED
  // 3. Haven't had WhatsApp reminder sent yet
  const auctions = await Auction.find({
    status: { $ne: "ENDED" },
    reminderSent: { $ne: true },
    startTime: { $gte: startOfToday, $lte: endOfToday },
  }).exec();

  let sentCount = 0;
  for (const auction of auctions) {
    await sendAuctionWhatsAppReminders(auction);
    sentCount++;
  }

  return ok({
    success: true,
    processed: sentCount,
    totalMatchingAuctions: auctions.length,
    timestamp: now.toISOString(),
  });
});
