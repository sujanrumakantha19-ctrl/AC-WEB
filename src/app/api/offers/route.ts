import { NextRequest } from "next/server";
import Offer from "@/models/Offer";
import Auction from "@/models/Auction";
import Notification from "@/models/Notification";
import { ok, created, badRequest, notFound, route, requireUser } from "@/lib/api-helpers";
import { broadcastAuctionEvent } from "@/lib/auction-ws";
import { syncAuctionRoundStates } from "@/lib/round-state-sync";
import { notifyAdmins } from "@/lib/auction-notifications";

export const GET = route(async (request: NextRequest) => {
  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(request.url);
  const auctionId = searchParams.get("auction");

  const query: Record<string, unknown> = {};
  if (auth.role === "user") {
    query.buyer = auth.userId;
  }
  if (auctionId) query.auction = auctionId;

  const offers = await Offer.find(query)
    .populate("buyer", "name email phone avatar cusId")
    .populate("auction", "title lotNumber")
    .sort({ createdAt: -1 })
    .limit(100);

  return ok({ offers });
});

export const POST = route(async (request: NextRequest) => {
  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;

  const { auctionId, amount, round } = await request.json();

  if (!auctionId || typeof amount === "undefined") {
    return badRequest("auctionId and amount are required");
  }

  const offerAmount = Number(amount);
  if (!Number.isFinite(offerAmount) || offerAmount <= 0 || !Number.isInteger(offerAmount)) {
    return badRequest("Offer amount must be a positive whole number (₹) — decimals are not allowed");
  }

  const auction = await Auction.findById(auctionId);
  if (!auction) return notFound("Auction not found");

  const syncChanged = await syncAuctionRoundStates(auction, new Date());
  if (syncChanged) await auction.save();

  if (auction.status !== "LIVE") {
    return badRequest("Auction is not accepting offers");
  }

  const isParkingSale = !!auction.isParkingSale;
  const offerRound = isParkingSale ? 1 : round || auction.currentRound;
  const roundIdx = offerRound - 1;

  const roundState = auction.roundStates?.[roundIdx];
  if (!roundState || roundState.status !== "active") {
    return badRequest(
      roundState?.status === "paused"
        ? isParkingSale
          ? "This sale is paused and is not accepting quotes"
          : "This round is paused and is not accepting offers"
        : isParkingSale
          ? "This sale is not accepting quotes"
          : "This round is not active for offering"
    );
  }

  const minRequired = auction.startingOffer || 0;
  if (offerAmount < minRequired) {
    return badRequest(
      isParkingSale
        ? `Quote must be at least the starting price of ₹${minRequired.toLocaleString("en-IN")}`
        : `Offer must be at least the starting price of ₹${minRequired.toLocaleString("en-IN")}`
    );
  }

  if (!isParkingSale) {
    const existingOffer = await Offer.findOne({ auction: auctionId, buyer: auth.userId, round: offerRound });
    if (existingOffer) {
      return badRequest("You have already placed an offer in this round");
    }
  }

  const currentHighestInRound = auction.roundStates?.[roundIdx]?.highestOffer || 0;
  const isNewHighest = offerAmount > currentHighestInRound;
  const previousHighestBuyer = auction.roundStates?.[roundIdx]?.highestBuyer;

  const offer = await Offer.create({
    auction: auctionId,
    buyer: auth.userId,
    amount: offerAmount,
    round: offerRound,
  });

  if (!auction.roundStates) {
    auction.roundStates = Array.from({ length: auction.rounds }, (_, i) => ({
      round: i + 1,
      status: i === 0 ? ("active" as const) : ("pending" as const),
      highestOffer: i === 0 ? auction.startingOffer : 0,
    }));
  }

  if (isNewHighest) {
    auction.currentOffer = offerAmount;
    auction.roundStates[roundIdx].highestOffer = offerAmount;
    auction.roundStates[roundIdx].highestBuyer = auth.userId as any;
  }

  auction.totalOffers += 1;
  await auction.save();

  if (isNewHighest && previousHighestBuyer && previousHighestBuyer.toString() !== auth.userId) {
    await Notification.create({
      user: previousHighestBuyer,
      title: "You've received a Higher Offer!",
      message: `Someone placed a higher offer of ₹${offerAmount.toLocaleString("en-IN")} on ${auction.title}`,
      type: "higher",
      relatedAuction: auction._id,
    });
  }

  await Notification.create({
    user: auth.userId as any,
    title: isParkingSale ? "Quote placed successfully" : "Offer placed successfully",
    message: isParkingSale
      ? `Your quote of ₹${offerAmount.toLocaleString("en-IN")} on ${auction.title} was submitted`
      : `Your offer of ₹${offerAmount.toLocaleString("en-IN")} on ${auction.title} (Round ${offerRound}) was submitted`,
    type: "offer",
    relatedAuction: auction._id,
  });

  const populatedOffer: any = await Offer.findById(offer._id)
    .populate("buyer", "name email phone cusId")
    .populate("auction", "title lotNumber")
    .lean();

  const buyerName =
    populatedOffer && typeof populatedOffer.buyer === "object" && populatedOffer.buyer.name
      ? String(populatedOffer.buyer.name)
      : "A buyer";

  await notifyAdmins(
    isParkingSale ? "New quote placed" : "New offer placed",
    isParkingSale
      ? `${buyerName} quoted ₹${offerAmount.toLocaleString("en-IN")} on ${auction.title}`
      : `${buyerName} placed ₹${offerAmount.toLocaleString("en-IN")} on ${auction.title} (Round ${offerRound})`,
    auction._id
  );

  if (isParkingSale && auction.thresholdAmount && offerAmount >= auction.thresholdAmount) {
    await notifyAdmins(
      "Parking sale threshold reached",
      `${buyerName} placed ₹${offerAmount.toLocaleString("en-IN")} on ${auction.title} — meeting the threshold of ₹${auction.thresholdAmount.toLocaleString("en-IN")}. You can end the sale now.`,
      auction._id
    );
  }

  broadcastAuctionEvent(String(auctionId), {
    type: "offer",
    offer: populatedOffer,
  });

  return created({ offer, auction });
});
