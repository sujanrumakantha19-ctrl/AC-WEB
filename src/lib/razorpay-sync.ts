import dbConnect from "@/lib/db";
import mongoose from "mongoose";
import Payment from "@/models/Payment";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { notifyAdmins } from "@/lib/auction-notifications";
import { sendInvoiceForPayment } from "@/lib/invoice-email";

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

export interface RazorpayRefund {
  id: string;
  payment_id?: string;
  amount?: number;
  currency?: string;
  status?: string;
  speed?: string;
  created_at?: number;
}

/**
 * Fetches the current status of an initiated Razorpay refund.
 * `status` is one of: pending | processed | failed.
 * "processed" means the refund has been processed and the money is being
 * credited back to the customer's account.
 */
export async function fetchRazorpayRefund(refundId: string): Promise<RazorpayRefund | null> {
  const { keyId, keySecret } = getKeys();
  if (!keyId || !keySecret || !refundId) return null;
  try {
    const res = await fetch(`https://api.razorpay.com/v1/refunds/${refundId}`, {
      headers: { Authorization: authHeader() },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("[razorpay] fetch refund failed", refundId, err);
    return null;
  }
}

/**
 * Initiates an actual money refund via the Razorpay refund API.
 * Tries an instant refund first (settles in under a minute for UPI payments),
 * falling back to a normal-speed refund when the payment method is not
 * eligible for instant refunds (cards, netbanking, wallets).
 * Returns the refund object on success, or null on failure.
 */
export async function refundRazorpayPayment(
  paymentId: string,
  amountInPaise: number,
  notes?: Record<string, string>
): Promise<RazorpayRefund | null> {
  const { keyId, keySecret } = getKeys();
  if (!keyId || !keySecret || !paymentId) return null;

  const base = {
    amount: Math.round(amountInPaise),
    ...(notes && Object.keys(notes).length > 0 ? { notes } : {}),
  };

  const tryRefund = async (body: Record<string, unknown>, label: string): Promise<RazorpayRefund | null> => {
    try {
      const res = await fetch(
        `https://api.razorpay.com/v1/payments/${paymentId}/refund`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader(),
          },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) {
        const text = await res.text();
        console.warn(`[razorpay] refund (${label}) failed`, paymentId, res.status, text);
        return null;
      }
      return await res.json();
    } catch (err) {
      console.error(`[razorpay] refund (${label}) error`, paymentId, err);
      return null;
    }
  };

  const instant = await tryRefund({ ...base, speed: "instant" }, "instant");
  if (instant) return instant;

  // Non-UPI payments can't use instant refunds — fall back to normal speed.
  return tryRefund(base, "normal");
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

      await sendInvoiceForPayment(payment);

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

        await sendInvoiceForPayment(payment);

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

/**
 * Refund settlement sync. For every Payment in REFUND_PENDING, check the
 * Razorpay refund status:
 *  - processed → money credited to the customer → mark Payment REFUNDED,
 *    add the auction to the user's `refundedAuctions`, and notify the customer.
 *  - failed    → mark Payment FAILED with a refundError and notify admins.
 *  - pending   → leave as REFUND_PENDING (retry next run).
 *
 * This calls the Razorpay refund status API and should therefore only be
 * invoked when a refund-status screen is being viewed (on-demand), never from
 * a background job or unrelated pages. An optional filter scopes the check to
 * only the payments being displayed.
 */
export async function syncRefundSettlements(filter?: {
  userId?: string;
  auctionId?: string;
}): Promise<{
  scanned: number;
  settled: number;
  failed: number;
  stillPending: number;
}> {
  await dbConnect();

  const query: Record<string, unknown> = {
    status: "REFUND_PENDING",
    refundId: { $exists: true, $ne: "" },
  };
  if (filter?.userId) query.user = filter.userId;
  if (filter?.auctionId) query.auction = filter.auctionId;

  const refundingPayments = await Payment.find(query)
    .sort({ refundInitiatedAt: 1 })
    .limit(200)
    .populate("auction", "title")
    .populate("user", "name cusId")
    .lean();

  let settled = 0;
  let failed = 0;
  let stillPending = 0;

  for (const payment of refundingPayments) {
    const refund = await fetchRazorpayRefund(payment.refundId || "");
    if (!refund || !refund.status) {
      stillPending += 1;
      continue;
    }

    const populatedAuction = payment.auction as unknown as { _id?: unknown; title?: string } | null;
    const populatedUser = payment.user as unknown as { _id?: unknown; name?: string; cusId?: string } | null;
    const auctionId = String(populatedAuction?._id ?? payment.auction);
    const auctionTitle = populatedAuction?.title || "Auction";
    const userName = populatedUser?.name || "";
    const userCusId = populatedUser?.cusId || "";
    const userId = String(populatedUser?._id ?? payment.user);

    if (refund.status === "processed") {
      await Payment.updateOne(
        { _id: payment._id },
        {
          $set: {
            status: "REFUNDED",
            refundedAt: new Date(),
            updatedAt: new Date(),
          },
          $unset: { refundError: 1 },
        }
      );

      await User.updateOne({ _id: userId }, { $addToSet: { refundedAuctions: auctionId } });

      await Notification.create({
        user: userId,
        title: "Registration fee refunded",
        message: `Your registration deposit of ₹${(payment.amount ?? 0).toLocaleString("en-IN")} for ${auctionTitle} has been refunded to your payment method.`,
        type: "system",
        relatedAuction: auctionId,
      });

      settled += 1;
      continue;
    }

    if (refund.status === "failed") {
      await Payment.updateOne(
        { _id: payment._id },
        {
          $set: {
            status: "FAILED",
            refundError: "Razorpay refund failed and was not credited to the customer.",
            updatedAt: new Date(),
          },
        }
      );

      await notifyAdmins(
        "Refund failed",
        `Refund ${payment.refundId} for ${auctionTitle} (₹${(payment.amount ?? 0).toLocaleString("en-IN")}, ${userName || userId}${userCusId ? ` / ${userCusId}` : ""}) failed at Razorpay. Manual action required.`,
        auctionId
      );

      failed += 1;
      continue;
    }

    stillPending += 1;
  }

  return { scanned: refundingPayments.length, settled, failed, stillPending };
}