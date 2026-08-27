import { NextRequest } from "next/server";
import Auction from "@/models/Auction";
import { ok, created, badRequest, route, requireAdmin } from "@/lib/api-helpers";
import { processAuctionRefunds } from "@/lib/auction-refunds";
import { isSameMonth, isInNextMonth } from "@/lib/auction-status";
import { notifyWinnerViaEmail } from "@/lib/winner-notify";

export const GET = route(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const parkingSale = searchParams.get("parkingSale") === "true";
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
    const roundOneStart = a.roundTimes?.[0]?.start ? new Date(a.roundTimes[0].start) : firstStart;
    const liveStart = roundOneStart && !isNaN(roundOneStart.getTime()) ? roundOneStart : firstStart;
    if (firstStart && a.status !== "ENDED") {
      if (a.isParkingSale) {
        if (liveStart && !isNaN(liveStart.getTime()) && now >= liveStart) newStatus = "LIVE";
        else newStatus = "UPCOMING";
      } else if (lastEnd) {
        if (now > lastEnd) newStatus = "ENDED";
        else if (isSameMonth(now, liveStart)) newStatus = "LIVE";
        else newStatus = "UPCOMING";
      }
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

    if (newStatus === "ENDED") {
      try {
        const result = await processAuctionRefunds(String(a._id));
        if (result.failed > 0) {
          console.error(`[auction-refunds] list route: ${result.failed} refund(s) failed`, a._id);
        }
      } catch (err) {
        console.error("[auction-refunds] list route: failed to process", a._id, err);
      }

      try {
        await notifyWinnerViaEmail(a);
      } catch (err) {
        console.error("[winner-notify] list route: failed to notify winner", a._id, err);
      }
    }

    if (newStatus !== "ENDED" && newStatus === "UPCOMING" && !isInNextMonth(now, liveStart)) {
      continue;
    }

    if (!status || a.status === status) {
      if (parkingSale && !a.isParkingSale) continue;
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
