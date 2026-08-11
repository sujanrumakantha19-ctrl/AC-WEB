import { NextRequest } from "next/server";
import mongoose from "mongoose";
import Auction from "@/models/Auction";
import User from "@/models/User";
import Setting from "@/models/Setting";
import Payment from "@/models/Payment";
import { ok, badRequest, notFound, route, requireUser } from "@/lib/api-helpers";

const getRazorpayKeys = () => {
  const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_TNJwP7qOIAy8zV";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "UBVj1SwMjuZynLqSUNWOKq2W";
  return { keyId, keySecret };
};

const DEFAULT_FEE = 500;

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

  const alreadyPaid = (user.paidAccessAuctions || []).some((id: mongoose.Types.ObjectId) => id.toString() === auction._id.toString());
  if (alreadyPaid) {
    return ok({ success: true, alreadyPaid: true, amount: 0 });
  }

  const pendingPayment = await Payment.findOne({
    user: user._id,
    auction: auction._id,
    status: "PENDING",
  })
    .sort({ createdAt: -1 })
    .lean() as any;

  if (pendingPayment) {
    return ok({
      success: false,
      paymentPending: true,
      amount: pendingPayment.amount || 0,
      error: "A payment for this auction is already pending. Please complete the pending payment or wait for it to be confirmed before trying again.",
    });
  }

  const feeSetting = await Setting.findOne({ key: { $in: ["registrationFee", "registration-fee"] } }).select("value").lean() as any;
  const settingFee = feeSetting?.value ? parseInt(feeSetting.value) : NaN;
  const amount = auction.registrationFee || (!isNaN(settingFee) && settingFee > 0 ? settingFee : DEFAULT_FEE);

  const { keyId: RAZORPAY_KEY_ID, keySecret: RAZORPAY_KEY_SECRET } = getRazorpayKeys();

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return ok({ success: false, error: "Razorpay is not configured", amount });
  }

  const authHeader = "Basic " + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
  const receipt = `AUC-${auction.lotNumber || auction._id.toString().slice(-6)}-${Date.now().toString().slice(-8)}`;

  const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt,
      notes: {
        auctionId: auction._id.toString(),
        lotNumber: auction.lotNumber || "",
        userId: user._id.toString(),
        cusId: user.cusId || "",
      },
    }),
  });

  if (!razorpayRes.ok) {
    const text = await razorpayRes.text();
    console.error("[razorpay] order creation failed", razorpayRes.status, text);
    return ok({ success: false, error: "Razorpay order creation failed", amount });
  }

  const order = await razorpayRes.json();

  try {
    await Payment.create({
      user: user._id,
      auction: auction._id,
      orderId: order.id,
      amount,
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
    amount,
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