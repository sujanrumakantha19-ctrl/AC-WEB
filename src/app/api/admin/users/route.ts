import { NextRequest } from "next/server";
import User from "@/models/User";
import Auction from "@/models/Auction";
import Offer from "@/models/Offer";
import { ok, route, requireAdmin, badRequest } from "@/lib/api-helpers";
import { getCusId } from "@/lib/utils";
import { computeRefundStatus } from "@/lib/auction-refunds";

export const GET = route(async (request: NextRequest) => {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  const query: Record<string, unknown> = { role: "user" };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { cusId: { $regex: search, $options: "i" } },
    ];
  }

  const rawUsers = await User.find(query).select("-password").sort({ createdAt: -1 }).lean();
  const auctions = await Auction.find({}).select("lotNumber title status winner winningOffer registrationFee image location").sort({ createdAt: -1 }).lean();
  const offers = await Offer.find({}).select("auction buyer amount round createdAt").sort({ amount: -1 }).lean();

  // Map auctionById and userOffersMap
  const auctionById = new Map<string, any>();
  for (const a of auctions) {
    auctionById.set(String((a as any)._id), a);
  }

  const userOffersMap = new Map<string, any[]>();
  for (const o of offers) {
    const buyerId = typeof o.buyer === "object" ? (o.buyer as any)?._id?.toString() : o.buyer?.toString();
    if (buyerId) {
      if (!userOffersMap.has(buyerId)) userOffersMap.set(buyerId, []);
      userOffersMap.get(buyerId)!.push(o);
    }
  }

  // Eligible refund users per ENDED auction (refundEligible without considering
  // whether the refund has already been issued).
  const eligibleByAuction = new Map<string, Set<string>>();
  for (const a of auctions) {
    if (a.status !== "ENDED") continue;
    try {
      const statuses = await computeRefundStatus(a);
      eligibleByAuction.set(
        String((a as any)._id),
        new Set(statuses.filter((s) => s.refundEligible).map((s) => s.buyerId))
      );
    } catch (err) {
      console.error("[admin/users] refund eligibility failed", (a as any)._id, err);
    }
  }

  const richUsers = rawUsers.map((u: any) => {
    const userIdStr = u._id.toString();
    const paidIds = new Set<string>((u.paidAccessAuctions || []).map((id: any) => id.toString()));
    const refundedIds = new Set<string>((u.refundedAuctions || []).map((id: any) => id.toString()));

    const userOffers = userOffersMap.get(userIdStr) || [];
    const offeredAuctionIds = new Set<string>(userOffers.map((o) => o.auction?.toString()).filter(Boolean));

    // Combine paid & offered auctions
    const allParticipatedIds = new Set<string>([...paidIds, ...offeredAuctionIds]);

    const participatedAuctions: any[] = [];
    const wonLotNumbers: string[] = [];
    let winningCount = 0;
    let hasRefunded = false;
    let hasNonRefunded = false;

    allParticipatedIds.forEach((aucId) => {
      const auc = auctionById.get(aucId);
      if (!auc) return;

      const isWinner = auc.winner?.toString() === userIdStr;
      const isRefunded = refundedIds.has(aucId);
      const isPaid = paidIds.has(aucId);
      const isRefundEligible = eligibleByAuction.get(aucId)?.has(userIdStr) ?? false;

      if (isWinner) {
        winningCount++;
        wonLotNumbers.push(auc.lotNumber || `#LOT-${aucId.slice(-4).toUpperCase()}`);
      } else if (isPaid) {
        if (isRefunded) {
          hasRefunded = true;
        } else {
          hasNonRefunded = true;
        }
      }

      const auctionUserOffers = userOffers.filter((o) => o.auction?.toString() === aucId);
      const highestUserOffer = auctionUserOffers[0]?.amount || 0;

      participatedAuctions.push({
        _id: auc._id.toString(),
        lotNumber: auc.lotNumber,
        title: auc.title,
        status: auc.status,
        image: auc.image,
        location: auc.location,
        registrationFee: auc.registrationFee || 0,
        winningOffer: auc.winningOffer || 0,
        won: isWinner,
        refunded: isRefunded,
        refundEligible: isRefundEligible,
        highestUserOffer,
        offerCount: auctionUserOffers.length,
      });
    });

    return {
      ...u,
      cusId: getCusId(u),
      participatedCount: allParticipatedIds.size,
      winningCount,
      wonLotNumbers,
      participatedAuctions,
      hasRefunded,
      hasNonRefunded,
    };
  });

  const simpleAuctionList = auctions.map((a: any) => ({
    _id: a._id.toString(),
    lotNumber: a.lotNumber,
    title: a.title,
    winnerId: a.winner?.toString(),
    status: a.status,
  }));

  return ok({ users: richUsers, auctions: simpleAuctionList });
});

export const POST = route(async (request: NextRequest) => {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  const body = await request.json();
  const { userId, auctionId, refundState } = body;

  if (!userId || !auctionId) {
    return badRequest("userId and auctionId are required");
  }

  const user = await User.findById(userId);
  if (!user) return badRequest("User not found");

  const refundedSet = new Set((user.refundedAuctions || []).map((id: any) => id.toString()));

  if (refundState === true) {
    refundedSet.add(auctionId.toString());
  } else {
    refundedSet.delete(auctionId.toString());
  }

  user.refundedAuctions = Array.from(refundedSet) as any;
  await user.save();

  return ok({ message: "Refund status updated", refundedAuctions: user.refundedAuctions });
});
