import dbConnect from "@/lib/db";
import Auction from "@/models/Auction";
import Offer from "@/models/Offer";
import User from "@/models/User";
import Payment from "@/models/Payment";
import Notification from "@/models/Notification";
import { notifyAdmins } from "@/lib/auction-notifications";
import { refundRazorpayPayment } from "@/lib/razorpay-sync";

export interface RefundStatusByUser {
  buyerId: string;
  name?: string;
  cusId?: string;
  phone?: string;
  email?: string;
  lastRoundOffer: number;
  inTop50: boolean;
  refundEligible: boolean;
  refunded: boolean;
}

const fmt = (n?: number) => (n ?? 0).toLocaleString("en-IN");

/**
 * Computes the refund status for every participant of an ENDED auction.
 *
 * With a winner (normal end):
 *  1. Only the last round's offer submitters participate in the evaluation.
 *  2. The winner is excluded (winners do not get a refund).
 *  3. Only the top 50% of offer submitters (by last-round offer amount, desc) are
 *     considered eligible for a refund.
 *  4. Within that top 50%, a refund is issued only if the customer's last-round
 *     offer is at least 1% of the winner's final offer price.
 *
 * Without a winner (cancelled / no offers in the final round):
 *  every paid participant is eligible for a full registration-fee refund.
 */
export async function computeRefundStatus(
  auction: any,
  isAlreadyProcessed = false
): Promise<RefundStatusByUser[]> {
  const winningOffer = Number(auction.winningOffer || 0);
  const winnerId = auction.winner?.toString?.() || String(auction.winner || "");

  let list: any[] = [];

  if (winnerId) {
    const lastRound = auction.rounds || auction.roundStates?.length || 1;
    const offers = await Offer.find({ auction: auction._id, round: lastRound })
      .populate("buyer", "name cusId phone email")
      .lean();

    const byUser = new Map<string, any>();
    for (const o of offers) {
      const buyer = o.buyer as any;
      if (!buyer || typeof buyer !== "object") continue;
      const id = buyer._id?.toString?.();
      if (!id) continue;
      const prev = byUser.get(id);
      const amount = Number(o.amount) || 0;
      if (!prev || amount > prev.lastRoundOffer) {
        byUser.set(id, {
          buyerId: id,
          lastRoundOffer: amount,
          name: buyer.name,
          cusId: buyer.cusId,
          phone: buyer.phone,
          email: buyer.email,
        });
      }
    }

    list = Array.from(byUser.values())
      .filter((u) => u.buyerId !== winnerId)
      .sort((a, b) => b.lastRoundOffer - a.lastRoundOffer);

    const topCount = Math.round(list.length * 0.5);
    list.forEach((u, i) => {
      u.inTop50 = i < topCount;
    });

    const threshold = winningOffer * 0.01;
    for (const u of list) {
      u.refundEligible = u.inTop50 && threshold > 0 ? u.lastRoundOffer >= threshold : false;
      u.refunded = false;
    }
  } else {
    const paidPayments = await Payment.find({ auction: auction._id, status: { $in: ["PAID", "REFUND_PENDING", "REFUNDED"] } })
      .populate("user", "name cusId phone email")
      .lean();
    const seen = new Set<string>();
    for (const p of paidPayments) {
      const user = p.user as any;
      if (!user || typeof user !== "object") continue;
      const id = user._id?.toString?.();
      if (!id || seen.has(id)) continue;
      seen.add(id);
      list.push({
        buyerId: id,
        lastRoundOffer: 0,
        name: user.name,
        cusId: user.cusId,
        phone: user.phone,
        email: user.email,
        inTop50: true,
        refundEligible: true,
        refunded: false,
      });
    }
  }

  if (isAlreadyProcessed && list.length > 0) {
    const users = await User.find({ _id: { $in: list.map((u) => u.buyerId) } })
      .select("_id refundedAuctions")
      .lean();
    const refundSet = new Map<string, Set<string>>();
    for (const u of users as any[]) {
      refundSet.set(
        u._id.toString(),
        new Set((u.refundedAuctions || []).map((r: any) => r.toString()))
      );
    }
    for (const u of list) {
      u.refunded = !!refundSet.get(u.buyerId)?.has(String(auction._id));
    }
  }

  return list.map(
    (u): RefundStatusByUser => ({
      buyerId: u.buyerId,
      name: u.name,
      cusId: u.cusId,
      phone: u.phone,
      email: u.email,
      lastRoundOffer: u.lastRoundOffer,
      inTop50: u.inTop50,
      refundEligible: u.refundEligible,
      refunded: u.refunded,
    })
  );
}

/**
 * Runs the refund process for an ENDED auction. Idempotent — guarded by the
 * auction's `refundsProcessed` flag so it never double-processes, and per-user
 * via the Payment status (a user whose refund is already initiated is
 * REFUND_PENDING/REFUNDED and is skipped).
 *
 * Actually initiates a real money refund through the Razorpay refund API.
 * - Marks the eligible users' Payment records as REFUND_PENDING only when
 *   Razorpay accepted the refund (stores refundId / refundInitiatedAt). The
 *   status flips to REFUNDED only after the money is actually credited to the
 *   customer (see `syncRefundSettlements`).
 * - `refundsProcessed` is set only when every eligible refund initiation
 *   succeeded; partial failures are retried automatically on the next trigger.
 */
export async function processAuctionRefunds(auctionId: string): Promise<{
  processed: boolean;
  checked: number;
  refunded: number;
  failed: number;
  skipped: string;
  amount: number;
}> {
  await dbConnect();

  const auction = await Auction.findById(auctionId);
  if (!auction) {
    return { processed: false, checked: 0, refunded: 0, failed: 0, skipped: "Auction not found", amount: 0 };
  }
  if (auction.status !== "ENDED") {
    return { processed: false, checked: 0, refunded: 0, failed: 0, skipped: "Auction not ended", amount: 0 };
  }
  if (auction.refundsProcessed) {
    return { processed: false, checked: 0, refunded: 0, failed: 0, skipped: "Already processed", amount: 0 };
  }

  const statuses = await computeRefundStatus(auction);
  const eligible = statuses.filter((s) => s.refundEligible);

  const payments = await Payment.find({
    auction: auction._id,
    user: { $in: eligible.map((s) => s.buyerId) },
    status: { $in: ["PAID", "REFUND_PENDING", "REFUNDED"] },
  }).sort({ createdAt: -1 });

  const latestPaymentByUser = new Map<string, any>();
  for (const p of payments) {
    const uid = String(p.user);
    if (!latestPaymentByUser.has(uid)) latestPaymentByUser.set(uid, p);
  }

  let refunded = 0;
  let failed = 0;
  let refundedAmount = 0;
  const failedUsers: string[] = [];

  for (const s of eligible) {
    const payment = latestPaymentByUser.get(s.buyerId);

    if (!payment) {
      failed += 1;
      failedUsers.push(`${s.name || s.buyerId} (no paid payment record)`);
      continue;
    }

    if (payment.status === "REFUND_PENDING" || payment.status === "REFUNDED") {
      continue;
    }

    if (!payment.paymentId) {
      await Payment.updateOne(
        { _id: payment._id },
        {
          $set: {
            refundError: "Missing Razorpay paymentId; refund must be issued manually.",
            updatedAt: new Date(),
          },
        }
      );
      failed += 1;
      failedUsers.push(`${s.name || s.buyerId} (missing paymentId)`);
      continue;
    }

    // Only the ₹499 base registration fee is refundable (18% GST of ₹89 is non-refundable)
    const REFUND_BASE_AMOUNT = 499;
    const refund = await refundRazorpayPayment(payment.paymentId, REFUND_BASE_AMOUNT * 100, {
      auctionId: auction._id.toString(),
      lotNumber: auction.lotNumber || "",
      userId: s.buyerId,
      cusId: s.cusId || "",
    });

    if (!refund) {
      await Payment.updateOne(
        { _id: payment._id },
        {
          $set: {
            refundError: "Razorpay refund API failed",
            updatedAt: new Date(),
          },
        }
      );
      failed += 1;
      failedUsers.push(`${s.name || s.buyerId} (Razorpay refund failed)`);
      continue;
    }

    await Payment.updateOne(
      { _id: payment._id },
      {
        $set: {
          status: "REFUND_PENDING",
          refundId: refund.id,
          refundInitiatedAt: new Date(),
          updatedAt: new Date(),
        },
        $unset: { refundError: 1 },
      }
    );

    await Notification.create({
      user: s.buyerId,
      title: "Registration fee refund initiated",
      message: auction.winner
        ? `Your registration deposit refund of ₹499 (excluding ₹89 GST) for ${auction.title} is being processed. It will be credited to your payment method once completed. (Final offer ₹${fmt(s.lastRoundOffer)})`
        : `Your registration deposit refund of ₹499 (excluding ₹89 GST) for ${auction.title} is being processed. It will be credited to your payment method once completed.`,
      type: "system",
      relatedAuction: auction._id,
    });

    refunded += 1;
    refundedAmount += REFUND_BASE_AMOUNT;
  }

  const allSucceeded = failed === 0;
  if (allSucceeded) {
    auction.refundsProcessed = true;
    await auction.save();
  }

  await notifyAdmins(
    allSucceeded ? "Refunds initiated" : "Refund initiation partially failed",
    allSucceeded
      ? `${refunded} user(s) had refunds initiated, ₹${fmt(refundedAmount)} total for "${auction.title}".`
      : `${refunded} user(s) had refunds initiated, ₹${fmt(refundedAmount)} total, ${failed} failed for "${auction.title}". Failed: ${failedUsers.join(", ")}`,
    auction._id
  );

  return {
    processed: allSucceeded,
    checked: statuses.length,
    refunded,
    failed,
    skipped: allSucceeded ? "" : "Some refunds failed; will retry",
    amount: refundedAmount,
  };
}

/**
 * Read-only computed refund status for the participants list of a completed
 * auction (browser endpoint helper).
 */
export async function computeAuctionRefundStatus(auctionId: string): Promise<RefundStatusByUser[]> {
  await dbConnect();
  const auction = await Auction.findById(auctionId);
  if (!auction) return [];
  const processed = !!auction.refundsProcessed;
  return computeRefundStatus(auction, processed);
}