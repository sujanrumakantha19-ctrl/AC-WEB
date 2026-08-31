import { NextRequest } from "next/server";
import Auction from "@/models/Auction";
import { sendAuctionWhatsAppReminders } from "@/lib/auction-notifications";
import { ok, route } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export const GET = route(async (request: NextRequest) => {
  const now = new Date();

  // Get current date range in Indian Standard Time (Asia/Kolkata)
  // or local server date range (00:00:00 to 23:59:59)
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  // Find all auctions (both regular live auctions & parking sales) that:
  // 1. Have start time today (or are currently LIVE)
  // 2. Are not yet ENDED
  // 3. Haven't had WhatsApp reminder sent yet
  const auctions = await Auction.find({
    status: { $ne: "ENDED" },
    reminderSent: { $ne: true },
    $or: [
      { startTime: { $gte: startOfToday, $lte: endOfToday } },
      { status: "LIVE" },
    ],
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
