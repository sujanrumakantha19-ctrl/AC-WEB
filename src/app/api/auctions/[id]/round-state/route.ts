import { NextRequest } from "next/server";
import Auction from "@/models/Auction";
import Offer from "@/models/Offer";
import { ok, route, notFound } from "@/lib/api-helpers";
import { getUserFromRequest } from "@/lib/auth";

export const GET = route<{ id: string }>(async (request: NextRequest, { params }) => {
  const payload = await getUserFromRequest(request);
  const { id } = await params;

  const auction = await Auction.findById(id);
  if (!auction) return notFound("Auction not found");

  if (!auction.roundStates || auction.roundStates.length === 0) {
    auction.roundStates = Array.from({ length: auction.rounds }, (_, i) => ({
      round: i + 1,
      status: "pending" as const,
      highestOffer: i === 0 ? auction.startingOffer : 0,
    }));
  }

  const currentRound = auction.currentRound;
  const roundIdx = currentRound - 1;
  const basePrice = roundIdx > 0
    ? auction.roundStates[roundIdx - 1]?.highestOffer || auction.startingOffer
    : auction.startingOffer;

  let userHasOfferThisRound = false;
  let userLastOffer: { amount: number; createdAt: string } | null = null;

  if (payload) {
    const existingOffer = await Offer.findOne({
      auction: auction._id,
      buyer: payload.userId,
      round: currentRound,
    });
    userHasOfferThisRound = !!existingOffer;
    if (existingOffer) {
      userLastOffer = {
        amount: existingOffer.amount,
        createdAt: existingOffer.createdAt,
      };
    }
  }

  return ok({
    currentRound,
    totalRounds: auction.rounds,
    roundStates: auction.roundStates,
    basePrice,
    userHasOfferThisRound,
    userLastOffer,
  });
});
