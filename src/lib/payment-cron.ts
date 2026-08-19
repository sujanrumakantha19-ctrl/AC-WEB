import { syncPendingPayments, syncRefundSettlements } from "@/lib/razorpay-sync";

const CRON_INTERVAL_MS = 30 * 60 * 1000;

let cronStarted = false;

export function startPaymentStatusCron(): void {
  if (cronStarted) return;
  cronStarted = true;

  console.log("[payment-cron] scheduler started (every 30 minutes)");

  const run = async () => {
    try {
      const result = await syncPendingPayments();
      console.log(
        `[payment-cron] scanned=${result.scanned} paid=${result.paid} failed=${result.failed} refunded=${result.refunded} stillPending=${result.stillPending}`
      );
    } catch (err) {
      console.error("[payment-cron] run failed", err);
    }
    try {
      const result = await syncRefundSettlements();
      console.log(
        `[payment-cron] refund-settle scanned=${result.scanned} settled=${result.settled} failed=${result.failed} stillPending=${result.stillPending}`
      );
    } catch (err) {
      console.error("[payment-cron] refund settlement run failed", err);
    }
  };

  run();
  setInterval(run, CRON_INTERVAL_MS);
}