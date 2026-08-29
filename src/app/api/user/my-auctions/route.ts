import { NextRequest } from "next/server";
import Auction from "@/models/Auction";
import Offer from "@/models/Offer";
import User from "@/models/User";
import { ok, route, requireUser } from "@/lib/api-helpers";

export const GET = route(async (request: NextRequest) => {
  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;
  if (auth.role !== "user") return ok({ auctions: [] });

  const userId = auth.userId;

  const [user, offers] = await Promise.all([
    User.findById(userId).select("paidAccessAuctions").lean() as Promise<any>,
    Offer.find({ buyer: userId }).select("auction").lean(),
  ]);

  const ids = new Set<string>();
  for (const o of offers) {
    if (o.auction) ids.add(String(o.auction));
  }
  for (const a of (user?.paidAccessAuctions || [])) {
    ids.add(String(a));
  }

  if (ids.size === 0) return ok({ auctions: [] });

  const auctions = await Auction.find({ _id: { $in: [...ids] } })
    .sort({ createdAt: -1 })
    .lean();

  const result = auctions.map((a: any) => {
    const isWon = String(a.winner || "") === String(userId);
    const data: Record<string, unknown> = {
      id: String(a._id),
      _id: String(a._id),
      lotNumber: a.lotNumber,
      title: a.title,
      image: a.image,
      images: a.images || [],
      status: a.status,
      startTime: a.startTime,
      endTime: a.endTime,
      currentRound: a.currentRound,
      rounds: a.rounds,
      roundTimes: a.roundTimes,
      roundStates: a.roundStates,
      currentOffer: a.currentOffer,
      startingOffer: a.startingOffer,
      totalOffers: a.totalOffers,
      isParkingSale: a.isParkingSale,
      thresholdAmount: a.thresholdAmount,
      isWon,
    };
    if (isWon) {
      data.winningOffer = a.winningOffer;
    }
    return data;
  });

  return ok({ auctions: result });
});