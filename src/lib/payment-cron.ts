import { syncPendingPayments, syncRefundSettlements } from "@/lib/razorpay-sync";
import Auction from "@/models/Auction";
import { sendAuctionWhatsAppReminders } from "@/lib/auction-notifications";
import { getISTDayRange } from "@/lib/auction-status";

const CRON_INTERVAL_MS = 15 * 60 * 1000;

let cronStarted = false;

export function startPaymentStatusCron(): void {
  if (cronStarted) return;
  cronStarted = true;

  console.log("[background-cron] scheduler started (payments, refunds, and whatsapp reminders every 15 minutes)");

  const run = async () => {
    try {
      const payResult = await syncPendingPayments();
      const refResult = await syncRefundSettlements();
      console.log(
        `[payment-cron] Payments: scanned=${payResult.scanned} paid=${payResult.paid} failed=${payResult.failed} | Refunds: scanned=${refResult.scanned} settled=${refResult.settled} failed=${refResult.failed} stillPending=${refResult.stillPending}`
      );
    } catch (err) {
      console.error("[payment-cron] run failed", err);
    }

    try {
      const now = new Date();
      const { startOfToday, endOfToday } = getISTDayRange(now);

      const auctions = await Auction.find({
        status: { $ne: "ENDED" },
        reminderSent: { $ne: true },
        startTime: { $gte: startOfToday, $lte: endOfToday },
      }).exec();

      for (const auction of auctions) {
        await sendAuctionWhatsAppReminders(auction);
      }
    } catch (err) {
      console.error("[whatsapp-cron] auto reminder run failed", err);
    }
  };

  run();
  setInterval(run, CRON_INTERVAL_MS);
}