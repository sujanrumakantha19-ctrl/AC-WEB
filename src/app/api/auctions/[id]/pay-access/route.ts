import { NextRequest } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import Auction from "@/models/Auction";
import User from "@/models/User";
import Payment from "@/models/Payment";
import { notifyAdmins } from "@/lib/auction-notifications";
import { ok, badRequest, route, requireUser, notFound } from "@/lib/api-helpers";

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

export const POST = route<{ id: string }>(async (request: NextRequest, { params }) => {
  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const auction = await Auction.findById(id);
  if (!auction) return notFound("Auction not found");

  const user = await User.findById(auth.userId);
  if (!user) return notFound("User not found");

  const body = await request.json();
  const { orderId, paymentId, signature } = body || {};

  const alreadyPaid = (user.paidAccessAuctions || []).some((aid: mongoose.Types.ObjectId) => aid.toString() === auction._id.toString());
  if (alreadyPaid) {
    return ok({ success: true, alreadyPaid: true });
  }

  if (!orderId || !paymentId || !signature) {
    return badRequest("Missing payment details (orderId, paymentId, signature)");
  }

  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  if (signature !== expectedSignature) {
    return badRequest("Payment verification failed. Signature mismatch.");
  }

  if (!user.paidAccessAuctions) {
    user.paidAccessAuctions = [];
  }

  if (!user.paidAccessAuctions.includes(auction._id)) {
    user.paidAccessAuctions.push(auction._id);
    await user.save();
  }

  notifyAdmins(
    "New participant paid",
    `${user.name} (${user.cusId}) unlocked access to "${auction.title}".`,
    auction._id
  );

  try {
    await Payment.updateOne(
      { orderId },
      { $set: { status: "PAID", paymentId, signature, updatedAt: new Date() } }
    );
  } catch (err) {
    console.error("[razorpay] failed to mark payment paid", err);
  }

  return ok({ success: true });
});