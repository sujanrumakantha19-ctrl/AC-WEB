export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startPaymentStatusCron } = await import("@/lib/payment-cron");
    startPaymentStatusCron();
  }
}
