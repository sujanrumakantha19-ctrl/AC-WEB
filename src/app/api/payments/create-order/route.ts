import { NextRequest } from "next/server";
import mongoose from "mongoose";
import Auction from "@/models/Auction";
import User from "@/models/User";
import Setting from "@/models/Setting";
import Payment from "@/models/Payment";
import { ok, badRequest, notFound, route, requireUser } from "@/lib/api-helpers";
import {
  fetchRazorpayOrder,
  fetchRazorpayOrderPayments,
} from "@/lib/razorpay-sync";
import { sendInvoiceForPayment } from "@/lib/invoice-email";

const getRazorpayKeys = () => {
  const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_TNJwP7qOIAy8zV";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "UBVj1SwMjuZynLqSUNWOKq2W";
  return { keyId, keySecret };
};

const DEFAULT_FEE = 500;

/** How many minutes before we consider an unattempted order abandoned */
const ABANDON_MINUTES = 15;

/**
 * Attempt to reconcile a PENDING payment record against Razorpay's real status.
 * Returns:
 *  - { resolved: true, paid: true }  → user already paid, access granted
 *  - { resolved: true, paid: false } → old record cleaned up, caller should create new order
 *  - { resolved: false, reuse: { orderId, amount, ... } } → reuse the same Razorpay order
 */
async function reconcilePending(
  payment: any,
  user: any,
  auctionId: string
) {
  const order = await fetchRazorpayOrder(payment.orderId);

  // If we can't reach Razorpay, check age. Very old records get expired anyway.
  if (!order) {
    const ageMin = Math.floor(
      (Date.now() - new Date(payment.createdAt).getTime()) / 60000
    );
    if (ageMin >= ABANDON_MINUTES) {
      await Payment.updateOne(
        { _id: payment._id },
        {
          $set: {
            status: "FAILED",
            failureReason: "Order abandoned (could not verify with Razorpay).",
            updatedAt: new Date(),
          },
        }
      );
      return { resolved: true, paid: false };
    }
    // Recent and can't reach Razorpay → reuse existing order to be safe
    return {
      resolved: false,
      reuse: {
        orderId: payment.orderId,
        amount: payment.amount,
        currency: payment.currency || "INR",
      },
    };
  }

  const orderStatus = order.status || "";

  // ── CASE 1: Razorpay says PAID ──
  if (orderStatus === "paid" || (order.amount_paid && order.amount_paid > 0)) {
    const rzpPayments = await fetchRazorpayOrderPayments(payment.orderId);
    const captured = rzpPayments.find(
      (p) => p.status === "captured" || p.status === "authorized"
    );
    const paymentId = captured?.id || payment.paymentId || "";

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

    // Grant auction access
    if (
      !(user.paidAccessAuctions || []).some(
        (aid: mongoose.Types.ObjectId) => String(aid) === auctionId
      )
    ) {
      user.paidAccessAuctions = [...(user.paidAccessAuctions || []), auctionId];
      await user.save();
    }

    await sendInvoiceForPayment(payment);

    return { resolved: true, paid: true };
  }

  // ── CASE 2: Razorpay says ATTEMPTED (user tried but may have failed) ──
  if (orderStatus === "attempted") {
    const rzpPayments = await fetchRazorpayOrderPayments(payment.orderId);

    // Check if one of the attempts actually succeeded
    const captured = rzpPayments.find(
      (p) => p.status === "captured" || p.status === "authorized"
    );
    if (captured) {
      await Payment.updateOne(
        { _id: payment._id },
        { $set: { status: "PAID", paymentId: captured.id, updatedAt: new Date() } }
      );
      if (
        !(user.paidAccessAuctions || []).some(
          (aid: mongoose.Types.ObjectId) => String(aid) === auctionId
        )
      ) {
        user.paidAccessAuctions = [...(user.paidAccessAuctions || []), auctionId];
        await user.save();
      }
      await sendInvoiceForPayment(payment);
      return { resolved: true, paid: true };
    }

    // All attempts failed → mark record FAILED so user can retry
    const failedPay = rzpPayments.find((p) => p.status === "failed");
    await Payment.updateOne(
      { _id: payment._id },
      {
        $set: {
          status: "FAILED",
          paymentId: failedPay?.id || undefined,
          failureReason: `Payment attempt failed (${failedPay?.method || "unknown"}).`,
          updatedAt: new Date(),
        },
      }
    );
    return { resolved: true, paid: false };
  }

  // ── CASE 3: Razorpay says CREATED (no payment attempt at all) ──
  const ageMin = Math.floor(
    (Date.now() - new Date(payment.createdAt).getTime()) / 60000
  );

  if (ageMin < ABANDON_MINUTES) {
    // Order is recent — reuse the same Razorpay order instead of creating a new one.
    // Razorpay allows reopening checkout with the same order_id.
    return {
      resolved: false,
      reuse: {
        orderId: payment.orderId,
        amount: payment.amount,
        currency: order.currency || payment.currency || "INR",
      },
    };
  }

  // Old unattempted order → abandon it
  await Payment.updateOne(
    { _id: payment._id },
    {
      $set: {
        status: "FAILED",
        failureReason:
          "Payment not completed. The order was abandoned and has expired.",
        updatedAt: new Date(),
      },
    }
  );
  return { resolved: true, paid: false };
}

// ─── MAIN ROUTE ───

export const POST = route(async (request: NextRequest) => {
  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;

  const body = await request.json();
  const auctionId = body?.auctionId;
  if (!auctionId) return badRequest("auctionId is required");

  const auction = await Auction.findById(auctionId);
  if (!auction) return notFound("Auction not found");

  const user = await User.findById(auth.userId);
  if (!user) return notFound("User not found");

  // ── Parking Sale has no registration fee ──
  if (auction.isParkingSale) {
    return ok({ success: true, alreadyPaid: true, amount: 0 });
  }

  // ── Already paid? ──
  const alreadyPaid = (user.paidAccessAuctions || []).some(
    (id: mongoose.Types.ObjectId) => id.toString() === auction._id.toString()
  );
  if (alreadyPaid) {
    return ok({ success: true, alreadyPaid: true, amount: 0 });
  }

  // ── Reconcile any existing PENDING payment ──
  const pendingPayment = (await Payment.findOne({
    user: user._id,
    auction: auction._id,
    status: "PENDING",
  })
    .sort({ createdAt: -1 })
    .lean()) as any;

  const { keyId: RAZORPAY_KEY_ID, keySecret: RAZORPAY_KEY_SECRET } =
    getRazorpayKeys();

  if (pendingPayment) {
    const result = await reconcilePending(
      pendingPayment,
      user,
      auction._id.toString()
    );

    if (result.resolved && result.paid) {
      // Money was already collected — grant access
      return ok({ success: true, alreadyPaid: true, amount: 0 });
    }

    if (!result.resolved && result.reuse) {
      // Reuse the same Razorpay order (recent, unattempted)
      return ok({
        success: true,
        orderId: result.reuse.orderId,
        amount: result.reuse.amount,
        currency: result.reuse.currency,
        keyId: RAZORPAY_KEY_ID,
        receipt: pendingPayment.receipt || "",
        customer: {
          name: user.name,
          email: user.email,
          phone: user.phone || "",
        },
      });
    }

    // Otherwise result.resolved && !result.paid → old record cleaned up,
    // fall through to create a brand new order below.
  }

  // ── Calculate base registration fee & 18% GST with paisa precision ──
  const feeSetting = (await Setting.findOne({
    key: { $in: ["registrationFee", "registration-fee"] },
  })
    .select("value")
    .lean()) as any;
  const settingFee = feeSetting?.value ? parseFloat(feeSetting.value) : NaN;
  const baseFee = Number(
    auction.registrationFee ||
    (!isNaN(settingFee) && settingFee > 0 ? settingFee : 499)
  );
  const gstAmount = Number((baseFee * 0.18).toFixed(2));
  const totalAmount = Number((baseFee + gstAmount).toFixed(2));

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return ok({ success: false, error: "Razorpay is not configured", amount: totalAmount, baseFee, gstAmount });
  }

  // ── Create new Razorpay order ──
  const authHeader =
    "Basic " +
    Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString(
      "base64"
    );
  const receipt = `AUC-${
    auction.lotNumber || auction._id.toString().slice(-6)
  }-${Date.now().toString().slice(-8)}`;

  const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt,
      notes: {
        auctionId: auction._id.toString(),
        lotNumber: auction.lotNumber || "",
        userId: user._id.toString(),
        cusId: user.cusId || "",
        baseFee: String(baseFee),
        gstAmount: String(gstAmount),
      },
    }),
  });

  if (!razorpayRes.ok) {
    const text = await razorpayRes.text();
    console.error("[razorpay] order creation failed", razorpayRes.status, text);
    return ok({
      success: false,
      error: "Razorpay order creation failed",
      amount: totalAmount,
      baseFee,
      gstAmount,
    });
  }

  const order = await razorpayRes.json();

  try {
    await Payment.create({
      user: user._id,
      auction: auction._id,
      orderId: order.id,
      amount: totalAmount,
      currency: order.currency || "INR",
      receipt: order.receipt,
      status: "PENDING",
    });
  } catch (err) {
    console.error("[razorpay] failed to persist payment log", err);
  }

  return ok({
    success: true,
    orderId: order.id,
    amount: totalAmount,
    baseFee,
    gstAmount,
    currency: order.currency || "INR",
    keyId: RAZORPAY_KEY_ID,
    receipt: order.receipt,
    customer: {
      name: user.name,
      email: user.email,
      phone: user.phone || "",
    },
  });
});