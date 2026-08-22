import Notification from "@/models/Notification";
import { isSameMonth } from "@/lib/auction-status";
import { notifyAdmins, notifyAuctionParticipants, notifyAllCustomers, sendAuctionWhatsAppReminders } from "@/lib/auction-notifications";
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
  const now = nowInput || new Date();
  let changed = false;

  if (!auction.roundStates || auction.roundStates.length === 0) {
    auction.roundStates = Array.from({ length: auction.rounds || 1 }, (_, i) => ({
      round: i + 1,
      status: "pending",
      highestOffer: i === 0 ? auction.startingOffer : 0,
      startNotified: false,
      endNotified: false,
    }));
    auction.currentRound = auction.currentRound || 1;
    changed = true;
  }

  if (auction.startTime && auction.status !== "ENDED") {
    const firstStart = new Date(auction.startTime);
    const roundOneStart = auction.roundTimes?.[0]?.start ? new Date(auction.roundTimes[0].start) : firstStart;
    const liveStart = roundOneStart && !isNaN(roundOneStart.getTime()) ? roundOneStart : firstStart;

    // ── Send WhatsApp reminder 15 minutes before auction start (Only to registered buyers) ──
    if (liveStart && !auction.reminderSent && auction.status !== "ENDED") {
      const diffMs = liveStart.getTime() - now.getTime();
      if (diffMs > 0 && diffMs <= 15 * 60 * 1000) {
        sendAuctionWhatsAppReminders(auction).catch((err) =>
          console.error("[whatsapp] sync reminder trigger failed", err)
        );
      }
    }

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

  const rounds = auction.rounds || 1;
  if (auction.status === "LIVE" && rounds > 1 && Array.isArray(auction.roundTimes) && auction.roundTimes.length >= rounds) {
    for (let i = 0; i < rounds; i++) {
      const rs = auction.roundStates[i];
      if (!rs) continue;
      const startMs = new Date(auction.roundTimes[i]?.start || auction.startTime).getTime();
      const endMs = new Date(auction.roundTimes[i]?.end).getTime();
      const t = now.getTime();

      if (rs.status === "pending" && t >= startMs && t < endMs) {
        rs.status = "active";
        rs.startedAt = now;
        rs.highestOffer = rs.highestOffer || auction.startingOffer;
        auction.currentRound = i + 1;
        changed = true;
        await notifyRoundStarted(auction, i + 1);
      } else if (rs.status === "active" && t >= endMs) {
        rs.status = "completed";
        rs.endedAt = now;
        changed = true;
        const next = auction.roundStates[i + 1];
        if (next) {
          next.status = "active";
          next.startedAt = now;
          next.highestOffer = rs.highestOffer;
          auction.currentRound = i + 2;
          await notifyRoundEnded(auction, i + 1);
          await notifyRoundStarted(auction, i + 2);
        } else {
          const winnerId =
            rs.highestBuyer && typeof rs.highestBuyer === "object" && rs.highestBuyer._id
              ? rs.highestBuyer._id
              : rs.highestBuyer;
          auction.status = "ENDED";
          auction.winner = winnerId;
          auction.winningOffer = rs.highestOffer;
          await notifyRoundEnded(auction, i + 1);
          await notifyAuctionEnded(auction);
        }
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