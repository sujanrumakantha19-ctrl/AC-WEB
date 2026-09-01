import { NextRequest } from "next/server";
import Auction from "@/models/Auction";
import { ok, created, badRequest, route, requireAdmin } from "@/lib/api-helpers";
import { processAuctionRefunds } from "@/lib/auction-refunds";
import { isSameMonth, isInNextMonth } from "@/lib/auction-status";
import { syncAuctionRoundStates } from "@/lib/round-state-sync";
import { notifyWinnerViaEmail } from "@/lib/winner-notify";

export const GET = route(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const parkingSale = searchParams.get("parkingSale") === "true";
  const search = searchParams.get("search")?.toLowerCase().trim();
  const excludeEnded = searchParams.get("excludeEnded") === "true";
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50") || 50, 1), 100);
  const page = Math.max(parseInt(searchParams.get("page") || "1") || 1, 1);

  const now = new Date();
  const allAuctions = await Auction.find({}).sort({ createdAt: -1 });

  const matches: typeof allAuctions = [];
  for (const a of allAuctions) {
    if (a.status !== "ENDED") {
      const changed = await syncAuctionRoundStates(a, now);
      if (changed) await a.save();
    }

    if (a.status === "ENDED") {
      try {
        await processAuctionRefunds(String(a._id));
      } catch (err) {
        console.error("[auction-refunds] list route: failed to process", a._id, err);
      }
    }

    if (excludeEnded && a.status === "ENDED") continue;

    if (parkingSale) {
      if (!a.isParkingSale) continue;
      if (!status && a.status !== "LIVE") continue;
    } else if (status === "LIVE") {
      if (a.isParkingSale) continue;
    }

    if (status && a.status !== status) {
      continue;
    }

    if (search) {
      const matchesSearch =
        (a.title && a.title.toLowerCase().includes(search)) ||
        (a.lotNumber && a.lotNumber.toLowerCase().includes(search)) ||
        (a.make && a.make.toLowerCase().includes(search)) ||
        (a.model && a.model.toLowerCase().includes(search)) ||
        (a.location && a.location.toLowerCase().includes(search));
      if (!matchesSearch) continue;
    }

    matches.push(a);
  }

  const total = matches.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const auctions = matches.slice(start, start + limit);

  return ok({ auctions, total, page, totalPages, limit });
});

async function generateLotNumber(): Promise<string> {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear()).slice(-2);
  const prefix = "vksA";
  const suffix = `${month}${year}`;
  const count = await Auction.countDocuments({
    lotNumber: { $regex: new RegExp(`^${prefix}\\d+${suffix}$`) },
  });
  return `${prefix}${count + 1}${suffix}`;
}

export const POST = route(async (request: NextRequest) => {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  const body = await request.json();
  body.variant = typeof body.variant === "string" ? body.variant.trim() : "";
  body.lotNumber = await generateLotNumber();

  const invalidAmount = ["startingOffer", "registrationFee", "offerUnlockFee", "thresholdAmount"].find(
    (f) => typeof body[f] === "number" && (!Number.isFinite(body[f]) || body[f] < 0 || !Number.isInteger(body[f]))
  );
  if (invalidAmount) {
    return badRequest(`${invalidAmount} must be a whole number (no decimals)`);
  }

  const isParkingSale = !!body.isParkingSale;
  if (isParkingSale) {
    body.registrationFee = 0;
    const start = body.startTime ? new Date(body.startTime) : null;
    if (!start || isNaN(start.getTime())) {
      return badRequest("Parking Sale requires a start date & time");
    }
    const end = new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000);
    body.startTime = start.toISOString();
    body.endTime = end.toISOString();
    body.rounds = 1;
    body.roundTimes = [{ start: start.toISOString(), end: end.toISOString() }];
  }

  const rounds = body.rounds || 1;
  body.roundStates = Array.from({ length: rounds }, (_, i) => ({
    round: i + 1,
    status: "pending",
    highestOffer: i === 0 ? body.startingOffer || 0 : 0,
  }));
  body.currentRound = 1;
  body.currentOffer = body.startingOffer || 0;

  const auction = await Auction.create(body);

  if (auction.image && (!auction.images || auction.images.length === 0)) {
    auction.images = [auction.image];
    await auction.save();
  }

  return created({ auction });
});
