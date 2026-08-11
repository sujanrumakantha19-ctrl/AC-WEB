import dbConnect from "@/lib/db";
import mongoose from "mongoose";
import Payment from "@/models/Payment";
import User from "@/models/User";

const getKeys = () => ({
  keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_TNJwP7qOIAy8zV",
  keySecret: process.env.RAZORPAY_KEY_SECRET || "UBVj1SwMjuZynLqSUNWOKq2W",
});

const authHeader = () => {
  const { keyId, keySecret } = getKeys();
  return "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
};

export interface RazorpayOrder {
  id: string;
  receipt?: string;
  status?: string;
  amount?: number;
  amount_paid?: number;
  currency?: string;
  attempts?: number;
  created_at?: number;
}

export async function fetchRazorpayOrder(orderId: string): Promise<RazorpayOrder | null> {
  const { keyId, keySecret } = getKeys();
  if (!keyId || !keySecret) return null;
  try {
    const res = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
      headers: { Authorization: authHeader() },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("[razorpay] fetch order failed", orderId, err);
    return null;
  }
}

export interface RazorpayPayment {
  id: string;
  order_id?: string;
  status?: string;
  amount?: number;
  method?: string;
}

export async function fetchRazorpayOrderPayments(orderId: string): Promise<RazorpayPayment[]> {
  const { keyId, keySecret } = getKeys();
  if (!keyId || !keySecret) return [];
  try {
    const res = await fetch(`https://api.razorpay.com/v1/orders/${orderId}/payments?count=100`, {
      headers: { Authorization: authHeader() },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.items || [];
  } catch (err) {
    console.error("[razorpay] fetch order payments failed", orderId, err);
    return [];
  }
}

/**
 * Cron job: every 30 minutes, find PENDING payments and refresh their status
 * from Razorpay. Only PENDING records are touched (per business rule).
 * Marks PAID / FAILED / REFUNDED accordingly, and grants auction access when paid.
 */
export async function syncPendingPayments(): Promise<{
  scanned: number;
  paid: number;
  failed: number;
  refunded: number;
  stillPending: number;
}> {
  await dbConnect();

  const pendingPayments = await Payment.find({ status: "PENDING" })
    .sort({ createdAt: 1 })
    .limit(200)
    .lean();

  let paid = 0;
  let failed = 0;
  let refunded = 0;
  let stillPending = 0;

  for (const payment of pendingPayments) {
    const order = await fetchRazorpayOrder(payment.orderId);
    if (!order) {
      stillPending += 1;
      continue;
    }

    const orderStatus = order.status || "";

    if (orderStatus === "paid" || order.amount_paid && order.amount_paid > 0) {
      const rzpPayments = await fetchRazorpayOrderPayments(payment.orderId);
      const successful = rzpPayments.find((p) => p.status === "captured" || p.status === "authorized");
      const paymentId = successful?.id || payment.paymentId || "";

      await Payment.updateOne(
        { _id: payment._id },
        {
          $set: {
            status: "PAID",
            paymentId: paymentId || undefined,
            currency: order.currency || payment.currency,
            updatedAt: new Date(),
          },
        }
      );

      if (paymentId) {
        const user = await User.findById(payment.user).select("paidAccessAuctions");
        if (user) {
          const auctionId = String(payment.auction);
          if (!(user.paidAccessAuctions || []).some((aid: mongoose.Types.ObjectId) => String(aid) === auctionId)) {
            user.paidAccessAuctions = [...(user.paidAccessAuctions || []), payment.auction];
            await user.save();
          }
        }
      }

      paid += 1;
      continue;
    }

    if (orderStatus === "attempted") {
      const rzpPayments = await fetchRazorpayOrderPayments(payment.orderId);
      const captured = rzpPayments.find((p) => p.status === "captured" || p.status === "authorized");
      if (captured) {
        await Payment.updateOne(
          { _id: payment._id },
          {
            $set: {
              status: "PAID",
              paymentId: captured.id,
              updatedAt: new Date(),
            },
          }
        );

        const user = await User.findById(payment.user).select("paidAccessAuctions");
        if (user) {
          const auctionId = String(payment.auction);
          if (!(user.paidAccessAuctions || []).some((aid: mongoose.Types.ObjectId) => String(aid) === auctionId)) {
            user.paidAccessAuctions = [...(user.paidAccessAuctions || []), payment.auction];
            await user.save();
          }
        }

        paid += 1;
        continue;
      }

      const refundedPayment = rzpPayments.find((p) => p.status === "refunded");
      if (refundedPayment) {
        await Payment.updateOne(
          { _id: payment._id },
          {
            $set: { status: "REFUNDED", paymentId: refundedPayment.id, updatedAt: new Date() },
          }
        );
        refunded += 1;
        continue;
      }

      const failedPayment = rzpPayments.find((p) => p.status === "failed");
      if (failedPayment) {
        await Payment.updateOne(
          { _id: payment._id },
          {
            $set: {
              status: "FAILED",
              paymentId: failedPayment.id,
              failureReason: `Razorpay payment failed (${failedPayment.method || "unknown method"})`,
              updatedAt: new Date(),
            },
          }
        );
        failed += 1;
        continue;
      }

      stillPending += 1;
      continue;
    }

    // Order status: created (no payment attempted yet)
    // If the order is never attempted for > 30 min since our record was created,
    // treat it as abandoned so the customer can retry.
    const abandonedMinutes = Math.floor((Date.now() - new Date(payment.createdAt).getTime()) / 60000);
    const abandoned = order.attempts === 0 && abandonedMinutes >= 30;

    if (abandoned) {
      await Payment.updateOne(
        { _id: payment._id },
        {
          $set: {
            status: "FAILED",
            failureReason: "Payment not completed. The order was abandoned and has expired. Please try again.",
            updatedAt: new Date(),
          },
        }
      );
      failed += 1;
      continue;
    }

    stillPending += 1;
  }

  return { scanned: pendingPayments.length, paid, failed, refunded, stillPending };
}