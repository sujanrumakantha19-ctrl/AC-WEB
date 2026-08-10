import dbConnect from "@/lib/db";
import Auction from "@/models/Auction";
import Offer from "@/models/Offer";
import User from "@/models/User";
import Payment from "@/models/Payment";
import Notification from "@/models/Notification";
import { notifyAdmins } from "@/lib/auction-notifications";

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
 * Computes the refund status for every last-round bidder of an ENDED auction.
 *
 * Rules:
 *  1. Only the last round's bidders participate in the evaluation.
 *  2. The winner is excluded (winners do not get a refund).
 *  3. Only the top 50% of bidders (by last-round offer amount, desc) are
 *     considered eligible for a refund.
 *  4. Within that top 50%, a refund is issued only if the bidder's last-round
 *     offer is at least 10% of the winner's final offer price.
 */
export async function computeRefundStatus(
  auction: any,
  isAlreadyProcessed = false
): Promise<RefundStatusByUser[]> {
  const lastRound = auction.rounds || auction.roundStates?.length || 1;
  const winningOffer = Number(auction.winningOffer || 0);
  const winnerId = auction.winner?.toString?.() || String(auction.winner || "");

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

  let list = Array.from(byUser.values())
    .filter((u) => u.buyerId !== winnerId)
    .sort((a, b) => b.lastRoundOffer - a.lastRoundOffer);

  const topCount = Math.round(list.length * 0.5);
  list.forEach((u, i) => {
    u.inTop50 = i < topCount;
  });

  const threshold = winningOffer * 0.1;
  for (const u of list) {
    u.refundEligible = u.inTop50 && threshold > 0 ? u.lastRoundOffer >= threshold : false;
    u.refunded = false;
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
 * auction's `refundsProcessed` flag so it never double-processes.
 *
 * - Marks the eligible users' Payment records as REFUNDED.
 * - Adds the auction to each eligible user's `refundedAuctions`.
 * - Sends a refund notification with the amount for each eligible user.
 */
export async function processAuctionRefunds(auctionId: string): Promise<{
  processed: boolean;
  checked: number;
  refunded: number;
  skipped: string;
  amount: number;
}> {
  await dbConnect();

  const auction = await Auction.findById(auctionId);
  if (!auction) {
    return { processed: false, checked: 0, refunded: 0, skipped: "Auction not found", amount: 0 };
  }
  if (auction.status !== "ENDED" || !auction.winner) {
    return { processed: false, checked: 0, refunded: 0, skipped: "Auction not ended / no winner", amount: 0 };
  }
  if (auction.refundsProcessed) {
    return { processed: false, checked: 0, refunded: 0, skipped: "Already processed", amount: 0 };
  }

  const statuses = await computeRefundStatus(auction);
  const eligible = statuses.filter((s) => s.refundEligible);
  const fee = auction.registrationFee || 0;

  for (const s of eligible) {
    await Payment.updateMany(
      { user: s.buyerId, auction: auction._id, status: "PAID" },
      { $set: { status: "REFUNDED", updatedAt: new Date() } }
    );

    await User.updateOne({ _id: s.buyerId }, { $addToSet: { refundedAuctions: auction._id } });

    await Notification.create({
      user: s.buyerId,
      title: "Registration fee refunded",
      message: `Your registration deposit of ₹${fmt(fee)} for ${auction.title} has been refunded to your payment method. (Final offer ₹${fmt(s.lastRoundOffer)})`,
      type: "system",
      relatedAuction: auction._id,
    });
  }

  auction.refundsProcessed = true;
  await auction.save();

  await notifyAdmins(
    "Refunds processed",
    `${eligible.length} user(s) refunded ₹${fmt(fee)} each for "${auction.title}".`,
    auction._id
  );

  return {
    processed: true,
    checked: statuses.length,
    refunded: eligible.length,
    skipped: "",
    amount: eligible.length * fee,
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