import { NextRequest } from "next/server";
import Auction from "@/models/Auction";
import Offer from "@/models/Offer";
import { ok, route, requireAdmin, notFound, badRequest } from "@/lib/api-helpers";
import { processAuctionRefunds } from "@/lib/auction-refunds";
import { getUserFromRequest } from "@/lib/auth";
import { deleteImage, imageIdFromUrl } from "@/lib/gridfs";
import { syncAuctionRoundStates } from "@/lib/round-state-sync";

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

  const changed = await syncAuctionRoundStates(auction, new Date());
  if (changed) await auction.save();

  const result: Record<string, unknown> = { ...auction.toObject() };

  if (auction.status === "ENDED") {
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

  const invalidAmount = ["startingOffer", "registrationFee", "offerUnlockFee", "thresholdAmount"].find(
    (f) => typeof body[f] === "number" && (!Number.isFinite(body[f]) || body[f] < 0 || !Number.isInteger(body[f]))
  );
  if (invalidAmount) {
    return badRequest(`${invalidAmount} must be a whole number (no decimals)`);
  }

  const existing = await Auction.findById(id);
  if (!existing) return notFound("Auction not found");

  if (existing.status === "ENDED") {
    return badRequest("Completed auctions cannot be edited");
  }

  // Preserve existing transaction & offer history
  if (existing.totalOffers > 0) {
    delete body.currentOffer;
    delete body.totalOffers;
    delete body.winner;
    delete body.winningOffer;
  }

  if (body.isParkingSale) {
    body.registrationFee = 0;
    const start = body.startTime ? new Date(body.startTime) : new Date(existing.startTime);
    if (!start || isNaN(start.getTime())) {
      return badRequest("Parking Sale requires a start date & time");
    }
    const end = new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000);
    body.startTime = start.toISOString();
    body.endTime = end.toISOString();
    body.rounds = 1;
    body.roundTimes = [{ start: start.toISOString(), end: end.toISOString() }];
    const topOffer = existing.totalOffers > 0
      ? ((await Offer.findOne({ auction: id }).sort({ amount: -1 }).lean()) as any)
      : null;
    const prevTop = existing.roundStates?.[0];
    body.currentRound = 1;
    body.roundStates = [{
      round: 1,
      status: prevTop?.status || (existing.status === "LIVE" ? "active" : "pending"),
      highestOffer: topOffer?.amount || prevTop?.highestOffer || existing.currentOffer || existing.startingOffer || 0,
      highestBuyer: topOffer?.buyer || prevTop?.highestBuyer || null,
      startedAt: prevTop?.startedAt || null,
      pausedAt: prevTop?.pausedAt || null,
    }];
  } else if (existing.roundStates && existing.roundStates.length > 0) {
    const numRounds = body.rounds || existing.rounds || 1;
    body.roundStates = Array.from({ length: numRounds }, (_, i) => {
      const prev = existing.roundStates[i];
      return {
        round: i + 1,
        status: prev?.status || (i === 0 && existing.status === "LIVE" ? "active" : "pending"),
        highestOffer: prev?.highestOffer || (i === 0 ? body.startingOffer || existing.startingOffer : 0),
        highestBuyer: prev?.highestBuyer || null,
        startedAt: prev?.startedAt || null,
        endedAt: prev?.endedAt || null,
        pausedAt: prev?.pausedAt || null,
      };
    });
  }

  if (existing.totalOffers === 0 && body.startingOffer) {
    body.currentOffer = body.startingOffer;
  }

  const kept = new Set(
    [body.image, ...(body.images || [])].map(imageIdFromUrl).filter(Boolean) as string[]
  );
  const removed = [existing.image, ...(existing.images || [])]
    .map(imageIdFromUrl)
    .filter((ref): ref is string => !!ref && !kept.has(ref));
  await Promise.all(removed.map(deleteImage));

  const auction = await Auction.findByIdAndUpdate(id, body, { new: true });
  if (!auction) return notFound("Auction not found");

  return ok({ auction });
});

export const DELETE = route<{ id: string }>(async (request: NextRequest, { params }) => {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const auction = await Auction.findById(id);
  if (!auction) return notFound("Auction not found");

  const refs = [auction.image, ...(auction.images || [])]
    .map(imageIdFromUrl)
    .filter((ref): ref is string => !!ref);
  await Promise.all(refs.map(deleteImage));

  await Auction.findByIdAndDelete(id);
  return ok({ message: "Auction deleted" });
});
