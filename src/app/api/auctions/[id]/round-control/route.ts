import { NextRequest } from "next/server";
import Auction from "@/models/Auction";
import Offer from "@/models/Offer";
import { ok, badRequest, route, requireAdmin, notFound } from "@/lib/api-helpers";
import { processAuctionRefunds } from "@/lib/auction-refunds";
import { broadcastAuctionEvent } from "@/lib/auction-ws";
import { notifyRoundStarted, notifyRoundEnded, notifyAuctionEnded } from "@/lib/round-state-sync";

const VALID_ACTIONS = ["start", "pause", "resume", "end", "end_auction", "cancel"] as const;

export const POST = route<{ id: string }>(async (request: NextRequest, { params }) => {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const { action, reason } = await request.json();

  if (!action || !VALID_ACTIONS.includes(action)) {
    return badRequest("Invalid action");
  }

  const auction = await Auction.findById(id);
  if (!auction) return notFound("Auction not found");

  if (!auction.roundStates || auction.roundStates.length === 0) {
    auction.roundStates = Array.from({ length: auction.rounds || 1 }, (_, i) => ({
      round: i + 1,
      status: "pending" as const,
      highestOffer: i === 0 ? auction.startingOffer : 0,
      highestBuyer: undefined,
    }));
  }

  const roundIdx = (auction.currentRound || 1) - 1;

  switch (action) {
    case "start": {
      auction.status = "LIVE";
      auction.roundStates[roundIdx].status = "active";
      auction.roundStates[roundIdx].startedAt = new Date();
      auction.roundStates[roundIdx].highestOffer = auction.roundStates[roundIdx].highestOffer || auction.startingOffer;

      const rt = auction.roundTimes?.[roundIdx];
      if (rt && (!rt.start || new Date(rt.start) > new Date())) {
        rt.start = new Date().toISOString();
      }

      await notifyRoundStarted(auction, auction.currentRound);
      break;
    }
    case "pause": {
      auction.roundStates[roundIdx].status = "paused";
      break;
    }
    case "resume": {
      auction.roundStates[roundIdx].status = "active";
      break;
    }
    case "end": {
      auction.roundStates[roundIdx].status = "completed";
      auction.roundStates[roundIdx].endedAt = new Date();

      const isLastRound = auction.isParkingSale || auction.currentRound >= auction.rounds;
      if (isLastRound) {
        auction.status = "ENDED";
        auction.endTime = new Date();

        // Look up highest offer in the database across all rounds
        const topOffer = (await Offer.findOne({ auction: id }).sort({ amount: -1 }).lean()) as any;
        if (topOffer && topOffer.amount > 0) {
          auction.winner = topOffer.buyer;
          auction.winningOffer = topOffer.amount;
          auction.currentOffer = topOffer.amount;
        } else {
          auction.winner = auction.roundStates[roundIdx]?.highestBuyer || undefined;
          auction.winningOffer = auction.roundStates[roundIdx]?.highestOffer || auction.startingOffer;
        }

        await notifyRoundEnded(auction, auction.currentRound);
        await notifyAuctionEnded(auction);
      } else {
        await notifyRoundEnded(auction, auction.currentRound);

        // Find the current overall highest offer/buyer before advancing
        const topOffer = (await Offer.findOne({ auction: id }).sort({ amount: -1 }).lean()) as any;
        const prevHighest = topOffer?.amount || auction.roundStates[roundIdx]?.highestOffer || auction.startingOffer;
        const prevBuyer = topOffer?.buyer || auction.roundStates[roundIdx]?.highestBuyer;

        auction.currentRound += 1;
        const nextIdx = auction.currentRound - 1;
        if (auction.roundStates[nextIdx]) {
          auction.roundStates[nextIdx].status = "active";
          auction.roundStates[nextIdx].highestOffer = prevHighest;
          auction.roundStates[nextIdx].highestBuyer = prevBuyer;
          auction.roundStates[nextIdx].startedAt = new Date();
        }

        const nextRt = auction.roundTimes?.[nextIdx];
        if (nextRt && (!nextRt.start || new Date(nextRt.start) > new Date())) {
          nextRt.start = new Date().toISOString();
        }

        await notifyRoundStarted(auction, auction.currentRound);
      }
      break;
    }
    case "end_auction": {
      // Force end entire auction immediately at any round
      auction.status = "ENDED";
      auction.endTime = new Date();

      // Mark current and all previous roundStates as completed
      for (let i = 0; i < (auction.roundStates?.length || 0); i++) {
        if (auction.roundStates[i].status !== "completed") {
          auction.roundStates[i].status = "completed";
          auction.roundStates[i].endedAt = new Date();
        }
      }

      // Look up highest offer in the database across all rounds
      const topOffer = (await Offer.findOne({ auction: id }).sort({ amount: -1 }).lean()) as any;
      if (topOffer && topOffer.amount > 0) {
        auction.winner = topOffer.buyer;
        auction.winningOffer = topOffer.amount;
        auction.currentOffer = topOffer.amount;
      } else {
        auction.winner = undefined;
        auction.winningOffer = undefined;
      }

      await notifyRoundEnded(auction, auction.currentRound);
      await notifyAuctionEnded(auction);
      break;
    }
    case "cancel": {
      auction.status = "ENDED";
      auction.endTime = new Date();
      for (let i = 0; i < (auction.roundStates?.length || 0); i++) {
        auction.roundStates[i].status = "completed";
        auction.roundStates[i].endedAt = new Date();
      }
      auction.winner = undefined;
      auction.winningOffer = undefined;
      auction.cancelReason = typeof reason === "string" && reason.trim() ? reason.trim() : undefined;
      break;
    }
  }

  await auction.save();

  if (auction.status === "ENDED") {
    try {
      await processAuctionRefunds(id);
    } catch (err) {
      console.error("[auction-refunds] round-control: failed to process", id, err);
    }
  }

  broadcastAuctionEvent(id, { type: "round-control" });

  return ok({ auction });
});
