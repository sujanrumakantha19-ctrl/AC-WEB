import Notification from "@/models/Notification";
import Offer from "@/models/Offer";
import { isSameMonth } from "@/lib/auction-status";
import { notifyAdmins, notifyAuctionParticipants, notifyAllCustomers } from "@/lib/auction-notifications";
import { notifyWinnerViaEmail } from "@/lib/winner-notify";

const fmt = (n?: number) => (n ?? 0).toLocaleString("en-IN");

/**
 * Time-based round lifecycle synchronization.
 *
 * Mutates `auction` in place so the caller can read the final state and then
 * persist with `save()`. Also fires one-time notifications (guarded by
 * persisted flags) when:
 *  - an auction becomes live / a round starts,
 *  - a round ends, or
 *  - an auction completes automatically.
 *
 * Round status transitions only happen once the time criterion is actually
 * met (now >= round start / now >= round end), matching the "round starts
 * only at its start time" rule.
 */
export async function syncAuctionRoundStates(auction: any, nowInput?: Date): Promise<boolean> {
  if (!auction || auction.status === "ENDED") {
    return false;
  }

  const now = nowInput || new Date();
  let changed = false;

  if (!auction.roundStates || auction.roundStates.length === 0) {
    auction.roundStates = Array.from({ length: auction.rounds || 1 }, (_, i) => ({
      round: i + 1,
      status: "pending",
      highestOffer: i === 0 ? auction.startingOffer : 0,
      highestBuyer: undefined,
      startNotified: false,
      endNotified: false,
    }));
    auction.currentRound = auction.currentRound || 1;
    changed = true;
  }

  if (auction.startTime && auction.status !== "ENDED") {
    const firstStart = new Date(auction.startTime);
    if (auction.isParkingSale) {
      if (now >= firstStart && auction.status !== "LIVE") {
        auction.status = "LIVE";
        changed = true;
      }
    } else if (auction.endTime) {
      const lastEnd = new Date(auction.endTime);
      if (now > lastEnd) {
        if (auction.status !== "ENDED") {
          auction.status = "ENDED";
          changed = true;
        }
      } else if (isSameMonth(now, firstStart) && auction.status !== "LIVE") {
        auction.status = "LIVE";
        changed = true;
      }
    }
  }

  const totalRounds = auction.rounds || (Array.isArray(auction.roundTimes) ? auction.roundTimes.length : 1);
  if (!auction.isParkingSale && auction.status !== "ENDED" && Array.isArray(auction.roundTimes) && auction.roundTimes.length > 0) {
    let allCompleted = true;

    for (let i = 0; i < totalRounds; i++) {
      const rs = auction.roundStates[i];
      if (!rs) continue;
      const startMs = new Date(auction.roundTimes[i]?.start || auction.startTime).getTime();
      const endMs = new Date(auction.roundTimes[i]?.end || auction.endTime).getTime();
      const t = now.getTime();

      if (t < startMs) {
        allCompleted = false;
      } else if (t >= startMs && t < endMs) {
        allCompleted = false;
        if (rs.status !== "active" && rs.status !== "paused") {
          rs.status = "active";
          rs.startedAt = rs.startedAt || now;
          const prevHighest = i > 0 ? auction.roundStates[i - 1]?.highestOffer : auction.startingOffer;
          const prevBuyer = i > 0 ? auction.roundStates[i - 1]?.highestBuyer : undefined;
          rs.highestOffer = rs.highestOffer || prevHighest || auction.startingOffer;
          if (!rs.highestBuyer && prevBuyer) rs.highestBuyer = prevBuyer;
          auction.currentRound = i + 1;
          changed = true;
          await notifyRoundStarted(auction, i + 1);
        }
      } else if (t >= endMs) {
        if (rs.status !== "completed") {
          rs.status = "completed";
          rs.endedAt = rs.endedAt || now;
          changed = true;
          await notifyRoundEnded(auction, i + 1);
        }
      }
    }

    const lastRoundIdx = totalRounds - 1;
    const lastEndMs = new Date(auction.roundTimes[lastRoundIdx]?.end || auction.endTime).getTime();
    if (now.getTime() >= lastEndMs || allCompleted) {
      if (auction.status !== "ENDED") {
        // Look up highest offer in database across all rounds
        const topOffer = (await Offer.findOne({ auction: auction._id }).sort({ amount: -1 }).lean()) as any;
        auction.status = "ENDED";
        if (topOffer && topOffer.amount > 0) {
          auction.winner = topOffer.buyer;
          auction.winningOffer = topOffer.amount;
          auction.currentOffer = topOffer.amount;
        } else {
          const lastRs = auction.roundStates[lastRoundIdx];
          auction.winner = lastRs?.highestBuyer || undefined;
          auction.winningOffer = lastRs?.highestOffer || auction.startingOffer;
        }
        changed = true;
        await notifyAuctionEnded(auction);
      }
    }
  }

  if (auction.isParkingSale && auction.status === "LIVE") {
    const rs = auction.roundStates[0];
    if (rs && rs.status !== "active") {
      rs.status = "active";
      rs.startedAt = rs.startedAt || now;
      rs.highestOffer = rs.highestOffer || auction.startingOffer;
      auction.currentRound = 1;
      changed = true;
    }
  }

  return changed;
}

export async function notifyRoundStarted(auction: any, roundNumber: number) {
  const rs = auction.roundStates[roundNumber - 1];
  if (rs?.startNotified) return;
  rs.startNotified = true;

  await notifyAdmins(
    `Round ${roundNumber} started`,
    `Round ${roundNumber} of "${auction.title}" has started.`,
    auction._id
  );
  await notifyAuctionParticipants(
    auction,
    "Round started",
    `Round ${roundNumber} of "${auction.title}" has started. Place your offer now!`
  );

  if (roundNumber === 1 && !auction.liveNotified) {
    auction.liveNotified = true;
    await notifyAllCustomers(
      "New auction is live",
      `"${auction.title}" is now live. Round 1 has started — participate now!`,
      auction._id
    );
  }
}

export async function notifyRoundEnded(auction: any, roundNumber: number) {
  const rs = auction.roundStates[roundNumber - 1];
  if (rs?.endNotified) return;
  rs.endNotified = true;

  await notifyAdmins(
    `Round ${roundNumber} ended`,
    `Round ${roundNumber} of "${auction.title}" has ended.`,
    auction._id
  );
  await notifyAuctionParticipants(
    auction,
    "Round ended",
    `Round ${roundNumber} of "${auction.title}" has ended.`
  );
}

export async function notifyAuctionEnded(auction: any) {
  await notifyAdmins(
    "Auction ended",
    `"${auction.title}" has ended. Winner: ${
      typeof auction.winner === "object" && auction.winner?.name
        ? auction.winner.name
        : "awaiting confirmation"
    } · Final offer ₹${fmt(auction.winningOffer)}`,
    auction._id
  );
  await notifyAuctionParticipants(
    auction,
    "Auction completed",
    `The auction "${auction.title}" has ended with a final offer of ₹${fmt(auction.winningOffer)}.`
  );

  if (auction.winner) {
    const winnerId = auction.winner._id || auction.winner;
    await Notification.create({
      user: winnerId,
      title: "You won the auction!",
      message: `Congratulations! You won ${auction.title} with an offer of ₹${fmt(auction.winningOffer)}`,
      type: "win",
      relatedAuction: auction._id,
    });
  }

  await notifyWinnerViaEmail(auction);
}