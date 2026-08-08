import { NextRequest } from "next/server";
import Auction from "@/models/Auction";
import Offer from "@/models/Offer";
import { ok, route, notFound } from "@/lib/api-helpers";

export const GET = route<{ id: string }>(async (request: NextRequest, { params }) => {
  const { id } = await params;

  const auction = await Auction.findById(id).select("_id title lotNumber");
  if (!auction) return notFound("Auction not found");

  const offers = await Offer.find({ auction: auction._id })
    .select("amount round createdAt")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const timeline = offers.map((o: any) => ({
    id: String(o._id),
    amount: o.amount,
    round: o.round,
    createdAt: o.createdAt,
  }));

  return ok({ auction: { id: String(auction._id), title: auction.title, lotNumber: auction.lotNumber }, offers: timeline });
});