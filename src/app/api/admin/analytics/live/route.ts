import { NextRequest } from "next/server";
import { ok, route, requireAdmin } from "@/lib/api-helpers";
import Offer from "@/models/Offer";
import Auction from "@/models/Auction";
import User from "@/models/User";

type OfferDoc = {
  amount: number;
  createdAt: Date;
  round?: number;
  buyer?: unknown;
};

type AuctionLean = {
  _id: { toString(): string };
  title: string;
  lotNumber: string;
  startingOffer: number;
  currentOffer?: number;
  totalOffers?: number;
  currentRound?: number;
  roundStates?: { status?: string }[];
  endTime?: Date;
  image?: string;
};

export const GET = route(async (request: NextRequest) => {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  const now = new Date();

  const activeAuction = (await Auction.findOne({ status: "LIVE" })
    .select(
      "title lotNumber startingOffer currentOffer totalOffers endTime startTime roundStates currentRound image"
    )
    .sort({ totalOffers: -1 })
    .lean()) as AuctionLean | null;

  if (!activeAuction) {
    return ok({
      active: null,
      offerProgression: [],
      participantCount: 0,
      now: now.toISOString(),
    });
  }

  const auctionId = activeAuction._id.toString();

  const offers = await Offer.find({ auction: auctionId })
    .sort({ createdAt: 1 })
    .limit(300)
    .lean();

  const offerProgression = offers.map((o) => {
    const doc = o as unknown as OfferDoc;
    return {
      time: new Date(doc.createdAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }),
      amount: doc.amount,
      round: doc.round || 1,
    };
  });

  const paidUsers = (await User.find(
    { paidAccessAuctions: auctionId },
    "name email phone"
  ).lean()) as Array<{ _id: { toString(): string } }>;

  const buyerIds = new Set<string>(paidUsers.map((u) => u._id.toString()));
  for (const o of offers) {
    const buyer: unknown = (o as { buyer?: unknown }).buyer;
    if (buyer) buyerIds.add(String(buyer));
  }

  return ok({
    active: {
      id: auctionId,
      title: activeAuction.title,
      lotNumber: activeAuction.lotNumber,
      startingOffer: activeAuction.startingOffer,
      currentOffer: activeAuction.currentOffer || activeAuction.startingOffer,
      totalOffers: offers.length || activeAuction.totalOffers || 0,
      currentRound:
        activeAuction.currentRound ||
        activeAuction.roundStates?.filter((r) => r.status !== "pending").length ||
        1,
      endTime: activeAuction.endTime,
      image: activeAuction.image,
    },
    offerProgression,
    participantCount: buyerIds.size,
    now: now.toISOString(),
  });
});