import { NextRequest } from "next/server";
import Auction from "@/models/Auction";
import { ok, route, requireAdmin, notFound, badRequest } from "@/lib/api-helpers";
import { processAuctionRefunds } from "@/lib/auction-refunds";
import { getUserFromRequest } from "@/lib/auth";

export const GET = route<{ id: string }>(async (request: NextRequest, { params }) => {
  const payload = await getUserFromRequest(request);
  const { id } = await params;
  const auction = await Auction.findById(id)
    .populate("winner", "name email phone cusId")
    .populate("roundStates.highestBuyer", "name email phone cusId");
  if (!auction) return notFound("Auction not found");

  if (!auction.roundStates || auction.roundStates.length === 0) {
    auction.roundStates = Array.from({ length: auction.rounds || 1 }, (_, i) => ({
      round: i + 1,
      status: "pending" as const,
      highestOffer: i === 0 ? auction.startingOffer : 0,
    }));
    auction.currentRound = auction.currentRound || 1;
  }

  const now = new Date();
  if (auction.startTime && auction.endTime && auction.status !== "ENDED") {
    const firstStart = new Date(auction.startTime);
    const lastEnd = new Date(auction.endTime);
    if (now > lastEnd) auction.status = "ENDED";
    else if (now >= firstStart) auction.status = "LIVE";
  }

  if (auction.status === "LIVE" && auction.rounds > 1 && auction.roundTimes?.length > 0) {
    for (let i = 0; i < auction.rounds; i++) {
      const rs = auction.roundStates[i];
      const rtStart = new Date(auction.roundTimes[i].start);
      const rtEnd = new Date(auction.roundTimes[i].end);
      if (rs.status === "pending" && now >= rtStart && now < rtEnd) {
        rs.status = "active";
        rs.startedAt = now;
        rs.highestOffer = rs.highestOffer || auction.startingOffer;
        auction.currentRound = i + 1;
      } else if (rs.status === "active" && now >= rtEnd) {
        rs.status = "completed";
        rs.endedAt = now;
        const nextRound = auction.roundStates[i + 1];
        if (nextRound) {
          nextRound.status = "active";
          nextRound.startedAt = now;
          nextRound.highestOffer = rs.highestOffer;
          auction.currentRound = i + 2;
        } else {
          auction.status = "ENDED";
          auction.winner = rs.highestBuyer;
          auction.winningOffer = rs.highestOffer;
        }
      }
    }
  }

  const result: Record<string, unknown> = { ...auction.toObject() };

  if (auction.status === "ENDED" && auction.winner) {
    try {
      await processAuctionRefunds(id);
    } catch (err) {
      console.error("[auction-refunds] get route: failed to process", id, err);
    }
  }

  if (auction.status === "ENDED" && payload?.role !== "admin" && auction.winner?.toString() !== payload?.userId) {
    delete result.winner;
    delete result.winningOffer;
  }

  return ok({ auction: result });
});

export const PUT = route<{ id: string }>(async (request: NextRequest, { params }) => {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const body = await request.json();

  const invalidAmount = ["startingOffer", "registrationFee", "offerUnlockFee"].find(
    (f) => typeof body[f] === "number" && (!Number.isFinite(body[f]) || body[f] < 0 || !Number.isInteger(body[f]))
  );
  if (invalidAmount) {
    return badRequest(`${invalidAmount} must be a whole number (no decimals)`);
  }

  const existing = await Auction.findById(id);
  if (existing && existing.totalOffers === 0 && body.startingOffer) {
    body.currentOffer = body.startingOffer;
  }
  const auction = await Auction.findByIdAndUpdate(id, body, { new: true });
  if (!auction) return notFound("Auction not found");

  return ok({ auction });
});

export const DELETE = route<{ id: string }>(async (request: NextRequest, { params }) => {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  await Auction.findByIdAndDelete(id);
  return ok({ message: "Auction deleted" });
});
