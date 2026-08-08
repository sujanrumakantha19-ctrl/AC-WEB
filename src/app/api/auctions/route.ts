import { NextRequest } from "next/server";
import Auction from "@/models/Auction";
import { ok, created, badRequest, route, requireAdmin } from "@/lib/api-helpers";
import { processAuctionRefunds } from "@/lib/auction-refunds";

export const GET = route(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50") || 50, 1), 100);
  const page = Math.max(parseInt(searchParams.get("page") || "1") || 1, 1);

  const now = new Date();
  const allAuctions = await Auction.find({}).sort({ createdAt: -1 });

  const matches: typeof allAuctions = [];
  for (const a of allAuctions) {
    let newStatus = a.status;
    let changed = false;

    const firstStart = a.startTime ? new Date(a.startTime) : null;
    const lastEnd = a.endTime ? new Date(a.endTime) : null;
    if (firstStart && lastEnd && a.status !== "ENDED") {
      const roundOneStart = a.roundTimes?.[0]?.start ? new Date(a.roundTimes[0].start) : firstStart;
      const liveStart = roundOneStart && !isNaN(roundOneStart.getTime()) ? roundOneStart : firstStart;
      if (now > lastEnd) newStatus = "ENDED";
      else if (now >= liveStart) newStatus = "LIVE";
      else newStatus = "UPCOMING";
    }

    if (newStatus === "LIVE" && a.roundTimes?.length > 0) {
      if (!a.roundStates || a.roundStates.length === 0) {
        a.roundStates = Array.from({ length: a.rounds }, (_, i) => ({
          round: i + 1,
          status: "pending" as const,
          highestOffer: i === 0 ? a.startingOffer : 0,
        }));
        changed = true;
      }
      for (let i = 0; i < a.rounds; i++) {
        const rs = a.roundStates[i];
        const rt = a.roundTimes[i];
        if (!rs || !rt) continue;
        const rtStart = new Date(rt.start);
        const rtEnd = new Date(rt.end);
        if (rs.status === "pending" && now >= rtStart && now < rtEnd) {
          rs.status = "active";
          rs.startedAt = now;
          rs.highestOffer = rs.highestOffer || a.startingOffer;
          a.currentRound = i + 1;
          changed = true;
        } else if (rs.status === "active" && now >= rtEnd) {
          rs.status = "completed";
          rs.endedAt = now;
          const nextRound = a.roundStates[i + 1];
          if (nextRound) {
            nextRound.status = "active";
            nextRound.startedAt = now;
            nextRound.highestOffer = rs.highestOffer;
            a.currentRound = i + 2;
          } else {
            newStatus = "ENDED";
            a.winner = rs.highestBuyer;
            a.winningOffer = rs.highestOffer;
            a.currentOffer = a.winningOffer || a.currentOffer;
          }
          changed = true;
        }
      }
    }

    if (a.status !== newStatus) {
      a.status = newStatus;
      if (newStatus === "ENDED") {
        a.currentOffer = a.winningOffer || a.currentOffer;
      }
      changed = true;
    }

    if (changed) await a.save();

    if (newStatus === "ENDED" && a.winner) {
      try {
        await processAuctionRefunds(String(a._id));
      } catch (err) {
        console.error("[auction-refunds] list route: failed to process", a._id, err);
      }
    }

    if (!status || a.status === status) {
      matches.push(a);
    }
  }

  const total = matches.length;
  const start = (page - 1) * limit;
  const auctions = matches.slice(start, start + limit);

  return ok({ auctions, total, page, totalPages: Math.ceil(total / limit) });
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
  body.lotNumber = await generateLotNumber();

  const invalidAmount = ["startingOffer", "registrationFee", "offerUnlockFee"].find(
    (f) => typeof body[f] === "number" && (!Number.isFinite(body[f]) || body[f] < 0 || !Number.isInteger(body[f]))
  );
  if (invalidAmount) {
    return badRequest(`${invalidAmount} must be a whole number (no decimals)`);
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
