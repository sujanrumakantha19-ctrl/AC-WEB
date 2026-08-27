import { syncPendingPayments, syncRefundSettlements } from "@/lib/razorpay-sync";

const CRON_INTERVAL_MS = 15 * 60 * 1000;

let cronStarted = false;

export function startPaymentStatusCron(): void {
  if (cronStarted) return;
  cronStarted = true;

  console.log("[payment-cron] scheduler started (every 15 minutes)");

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
  };

  run();
  setInterval(run, CRON_INTERVAL_MS);
}