import { NextRequest } from "next/server";
import Auction from "@/models/Auction";
import { ok, badRequest, route, requireAdmin, notFound } from "@/lib/api-helpers";
import { processAuctionRefunds } from "@/lib/auction-refunds";
import { broadcastAuctionEvent } from "@/lib/auction-ws";
import { notifyRoundStarted, notifyRoundEnded, notifyAuctionEnded } from "@/lib/round-state-sync";

const VALID_ACTIONS = ["start", "pause", "resume", "end", "cancel"] as const;

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
    auction.roundStates = Array.from({ length: auction.rounds }, (_, i) => ({
      round: i + 1,
      status: "pending" as const,
      highestOffer: i === 0 ? auction.startingOffer : 0,
      highestBuyer: undefined,
    }));
  }

  const roundIdx = auction.currentRound - 1;

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

      const isLastRound = auction.currentRound >= auction.rounds;
      if (isLastRound) {
        auction.status = "ENDED";
        auction.winner = auction.roundStates[roundIdx].highestBuyer;
        auction.winningOffer = auction.roundStates[roundIdx].highestOffer;

        await notifyRoundEnded(auction, auction.currentRound);
        await notifyAuctionEnded(auction);
      } else {
        await notifyRoundEnded(auction, auction.currentRound);
        auction.currentRound += 1;
        const nextIdx = auction.currentRound - 1;
        const prevHighest = auction.roundStates[roundIdx].highestOffer;
        auction.roundStates[nextIdx].status = "active";
        auction.roundStates[nextIdx].highestOffer = prevHighest;
        auction.roundStates[nextIdx].startedAt = new Date();

        const nextRt = auction.roundTimes?.[nextIdx];
        if (nextRt && (!nextRt.start || new Date(nextRt.start) > new Date())) {
          nextRt.start = new Date().toISOString();
        }

        await notifyRoundStarted(auction, auction.currentRound);
      }
      break;
    }
    case "cancel": {
      auction.status = "ENDED";
      auction.roundStates[roundIdx].status = "completed";
      auction.roundStates[roundIdx].endedAt = new Date();
      auction.winner = undefined;
      auction.winningOffer = undefined;
      auction.cancelReason = typeof reason === "string" && reason.trim() ? reason.trim() : undefined;
      break;
    }
  }

  await auction.save();

  if (auction.status === "ENDED" && auction.winner) {
    try {
      await processAuctionRefunds(id);
    } catch (err) {
      console.error("[auction-refunds] round-control: failed to process", id, err);
    }
  }

  broadcastAuctionEvent(id, { type: "round-control" });

  return ok({ auction });
});
