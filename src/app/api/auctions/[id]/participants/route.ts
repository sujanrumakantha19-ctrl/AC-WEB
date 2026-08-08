import { NextRequest } from "next/server";
import Auction from "@/models/Auction";
import User from "@/models/User";
import Offer from "@/models/Offer";
import { ok, route, requireAdmin, notFound } from "@/lib/api-helpers";
import { computeAuctionRefundStatus } from "@/lib/auction-refunds";

export const GET = route<{ id: string }>(async (request: NextRequest, { params }) => {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const auction = await Auction.findById(id);
  if (!auction) return notFound("Auction not found");

  const paidUsers = await User.find({ paidAccessAuctions: id }, "name email phone cusId role").lean();

  const offers = await Offer.find({ auction: id }).populate("buyer", "name email phone cusId role").lean();
  const offerBuyers = offers
    .map((o) => (typeof o.buyer === "object" ? o.buyer : null))
    .filter((b): b is NonNullable<typeof b> => b !== null);

  const map = new Map<string, any>();
  for (const u of paidUsers) {
    if (u && u._id) map.set(u._id.toString(), u);
  }
  for (const b of offerBuyers) {
    if (b && b._id && !map.has(b._id.toString())) {
      map.set(b._id.toString(), b);
    }
  }

  let participants = Array.from(map.values());

  if (auction.status === "ENDED") {
    const refundStatus = await computeAuctionRefundStatus(id);
    const statusById = new Map<string, any>();
    for (const rs of refundStatus) statusById.set(rs.buyerId, rs);

    participants = participants.map((p) => {
      const rs = statusById.get(p._id.toString());
      const isWinner = String(auction.winner?._id || auction.winner || "") === String(p._id);
      return {
        ...p,
        isWinner,
        lastRoundOffer: rs?.lastRoundOffer ?? null,
        inTop50: rs?.inTop50 ?? false,
        refundEligible: rs?.refundEligible ?? false,
        refunded: rs?.refunded ?? false,
      };
    });
  }

  return ok({ participants });
});
