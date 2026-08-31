import dbConnect from "@/lib/db";
import Auction from "@/models/Auction";
import Offer from "@/models/Offer";
import User from "@/models/User";
import Payment from "@/models/Payment";
import Notification from "@/models/Notification";
import { notifyAdmins } from "@/lib/auction-notifications";
import { refundRazorpayPayment } from "@/lib/razorpay-sync";
import { sendRefundInitiatedEmail } from "@/lib/email";

export interface RefundStatusByUser {
  buyerId: string;
  name?: string;
  cusId?: string;
  phone?: string;
  email?: string;
  lastRoundOffer: number;
  highestOffer?: number;
  hasQuoted?: boolean;
  isWithin1Percent?: boolean;
  inTop50: boolean;
  refundEligible: boolean;
  refunded: boolean;
}

const fmt = (n?: number) => (n ?? 0).toLocaleString("en-IN");

/**
 * Computes the refund status for every participant of an ENDED auction.
 *
 * Rules:
 *  1. Winners do not receive a registration fee refund.
 *  2. Users who paid the registration fee but never placed any quote receive NO refund.
 *  3. Non-winning users who placed a quote must have their quote within 1% of the winning offer
 *     (i.e. winningOffer - userQuote <= 0.01 * winningOffer).
 *  4. If multiple/all users quote within 1%, only the top 50% highest quoters among them
 *     receive the refund (sorted by highest quote descending).
 *  5. For unsold/cancelled auctions with no bids, all paid participants are refunded.
 */
export async function computeRefundStatus(
  auction: any,
  isAlreadyProcessed = false
): Promise<RefundStatusByUser[]> {
  let winnerId = auction.winner?.toString?.() || (auction.winner ? String(auction.winner._id || auction.winner) : "");
  let winningOffer = Number(auction.winningOffer || 0);

  // If winner is not explicitly saved on auction document, look up the highest offer across the auction
  if (!winnerId || winningOffer === 0) {
    const topOffer = (await Offer.findOne({ auction: auction._id }).sort({ amount: -1 }).lean()) as any;
    if (topOffer && topOffer.amount > 0) {
      winnerId = String(topOffer.buyer?._id || topOffer.buyer || "");
      winningOffer = Number(topOffer.amount);
    }
  }

  // Fetch all payments made for this auction (PAID / REFUND_PENDING / REFUNDED)
  const paidPayments = await Payment.find({
    auction: auction._id,
    status: { $in: ["PAID", "REFUND_PENDING", "REFUNDED"] },
  })
    .populate("user", "name cusId phone email")
    .lean();

  const paidUsersMap = new Map<string, any>();
  for (const p of paidPayments) {
    const user = p.user as any;
    if (!user || typeof user !== "object") continue;
    const uid = user._id?.toString?.();
    if (!uid) continue;
    if (!paidUsersMap.has(uid)) {
      paidUsersMap.set(uid, {
        buyerId: uid,
        name: user.name,
        cusId: user.cusId,
        phone: user.phone,
        email: user.email,
        quotes: [] as number[],
        highestOffer: 0,
        lastRoundOffer: 0,
      });
    }
  }

  // Fetch all offers for this auction
  const allOffers = await Offer.find({ auction: auction._id })
    .populate("buyer", "name cusId phone email")
    .lean();

  const lastRoundNum = auction.rounds || auction.roundStates?.length || 1;

  for (const o of allOffers) {
    const buyer = o.buyer as any;
    if (!buyer || typeof buyer !== "object") continue;
    const uid = buyer._id?.toString?.();
    if (!uid) continue;

    const amount = Number(o.amount) || 0;
    const isLastRound = Number(o.round) === Number(lastRoundNum);

    let participant = paidUsersMap.get(uid);
    if (!participant) {
      participant = {
        buyerId: uid,
        name: buyer.name,
        cusId: buyer.cusId,
        phone: buyer.phone,
        email: buyer.email,
        quotes: [],
        highestOffer: 0,
        lastRoundOffer: 0,
      };
      paidUsersMap.set(uid, participant);
    }

    participant.quotes.push(amount);
    if (amount > participant.highestOffer) {
      participant.highestOffer = amount;
    }
    if (isLastRound && amount > participant.lastRoundOffer) {
      participant.lastRoundOffer = amount;
    }
  }

  const allParticipants = Array.from(paidUsersMap.values());

  if (winnerId && winningOffer > 0) {
    const nonWinners = allParticipants.filter((p) => p.buyerId !== winnerId);

    // Filter users who quoted vs users who never quoted
    const quotingNonWinners = nonWinners.filter((p) => p.highestOffer > 0);
    const nonQuotingNonWinners = nonWinners.filter((p) => p.highestOffer === 0);

    // Sort quoting users by highest quote descending
    quotingNonWinners.sort((a, b) => b.highestOffer - a.highestOffer);

    // 1% margin of the winning offer
    const margin1Percent = winningOffer * 0.01;

    // Top 50% cap of quoting participants
    const top50Count = Math.max(1, Math.round(quotingNonWinners.length * 0.5));

    quotingNonWinners.forEach((u, index) => {
      const diffFromWinning = winningOffer - u.highestOffer;
      // Quote is within 1% of final winning amount
      const isWithin1Percent = diffFromWinning >= 0 && diffFromWinning <= margin1Percent;
      const inTop50 = index < top50Count;

      u.inTop50 = inTop50;
      u.hasQuoted = true;
      u.isWithin1Percent = isWithin1Percent;
      // Eligible ONLY if quoted within 1% AND in the top 50% of quoting users
      u.refundEligible = isWithin1Percent && inTop50;
      u.refunded = false;
    });

    nonQuotingNonWinners.forEach((u) => {
      u.inTop50 = false;
      u.hasQuoted = false;
      u.isWithin1Percent = false;
      u.refundEligible = false; // No quote = No refund
      u.refunded = false;
    });
  } else {
    // Unsold or cancelled auction without any bids: all paid participants are refunded
    for (const u of allParticipants) {
      u.inTop50 = true;
      u.hasQuoted = false;
      u.isWithin1Percent = false;
      u.refundEligible = true;
      u.refunded = false;
    }
  }

  if (isAlreadyProcessed && allParticipants.length > 0) {
    const users = await User.find({ _id: { $in: allParticipants.map((u) => u.buyerId) } })
      .select("_id refundedAuctions")
      .lean();
    const refundSet = new Map<string, Set<string>>();
    for (const u of users as any[]) {
      refundSet.set(
        u._id.toString(),
        new Set((u.refundedAuctions || []).map((r: any) => r.toString()))
      );
    }
    for (const u of allParticipants) {
      u.refunded = !!refundSet.get(u.buyerId)?.has(String(auction._id));
    }
  }

  return allParticipants.map(
    (u): RefundStatusByUser => ({
      buyerId: u.buyerId,
      name: u.name,
      cusId: u.cusId,
      phone: u.phone,
      email: u.email,
      lastRoundOffer: u.lastRoundOffer || u.highestOffer || 0,
      highestOffer: u.highestOffer || 0,
      hasQuoted: !!u.hasQuoted,
      isWithin1Percent: !!u.isWithin1Percent,
      inTop50: !!u.inTop50,
      refundEligible: !!u.refundEligible,
      refunded: !!u.refunded,
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

    // Calculate refundable amount:
    // Only the base registration fee entered by admin is refunded (18% GST is non-refundable).
    const paidAmount = Number(payment.amount) || 0;
    const baseFee = auction.registrationFee && auction.registrationFee > 0
      ? Number(auction.registrationFee)
      : (paidAmount > 10 ? Number((paidAmount / 1.18).toFixed(2)) : paidAmount);
    const refundAmountINR = Math.min(baseFee, paidAmount);
    const refundAmountPaise = Math.round(refundAmountINR * 100);

    let refundId = "";

    if (payment.paymentId) {
      const refund = await refundRazorpayPayment(payment.paymentId, refundAmountPaise, {
        auctionId: auction._id.toString(),
        lotNumber: auction.lotNumber || "",
        userId: s.buyerId,
        cusId: s.cusId || "",
        baseRefundAmount: String(refundAmountINR),
      });
      if (refund?.id) {
        refundId = refund.id;
      }
    }

    if (!refundId) {
      // If Razorpay refund initiation failed or no paymentId, log error and flag
      console.warn("[auction-refunds] Razorpay refund initiation failed for", payment.paymentId || payment._id);
      await Payment.updateOne(
        { _id: payment._id },
        {
          $set: {
            refundError: "Razorpay refund initiation failed. Gateway returned error.",
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
          refundId,
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
        ? `Your registration deposit refund of ₹${refundAmountINR} (excluding 18% GST) for ${auction.title} has been initiated and is being processed. It will be credited to your payment method. (Final offer ₹${fmt(s.lastRoundOffer)})`
        : `Your registration deposit refund of ₹${refundAmountINR} (excluding 18% GST) for ${auction.title} has been initiated and is being processed. It will be credited to your payment method.`,
      type: "system",
      relatedAuction: auction._id,
    });

    // Send refund initiated email to user's registered email
    const userDoc = (await User.findById(s.buyerId).select("name email").lean()) as any;
    if (userDoc?.email) {
      try {
        const emailClaim = await Payment.updateOne(
          { _id: payment._id, refundInitiatedEmailSentAt: { $exists: false } },
          { $set: { refundInitiatedEmailSentAt: new Date() } }
        );
        if (emailClaim.modifiedCount > 0) {
          await sendRefundInitiatedEmail({
            to: userDoc.email,
            customerName: userDoc.name || s.name || "Customer",
            auctionTitle: auction.title || "Vehicle Auction",
            amount: `₹${refundAmountINR}`,
            refundId,
            date: new Date().toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
          });
        }
      } catch (emailErr) {
        console.error("[refund-initiated] failed to email refund initiated notice", userDoc.email, emailErr);
      }
    }

    refunded += 1;
    refundedAmount += refundAmountINR;
  }

  const allSucceeded = failed === 0;
  auction.refundsProcessed = true;
  await auction.save();

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