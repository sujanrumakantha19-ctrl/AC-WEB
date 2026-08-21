import dbConnect from "@/lib/db";
import Auction from "@/models/Auction";
import Offer from "@/models/Offer";
import User from "@/models/User";
import { notifyAdmins } from "@/lib/auction-notifications";
import { sendWinnerCongratulationsEmail } from "@/lib/email";

interface WinnerAuction {
  _id: unknown;
  status?: string;
  title?: string;
  make?: string;
  model?: string;
  year?: number;
  variant?: string;
  lotNumber?: string;
  location?: string;
  description?: string;
  isParkingSale?: boolean;
  endTime?: unknown;
  winner?: unknown;
  winningOffer?: number;
  rounds?: number;
  winnerNotifiedAt?: unknown;
}

interface WinnerUser {
  _id: unknown;
  name?: string;
  email?: string;
}

const winnerIdOf = (winner: unknown): string | null => {
  if (!winner) return null;
  if (typeof winner === "object" && winner !== null && "_id" in (winner as object)) {
    return String((winner as { _id: unknown })._id);
  }
  return String(winner);
};

const fmtAmount = (n?: number) => `₹${(n || 0).toLocaleString("en-IN")}`;

const fmtDateTime = (value?: unknown): string => {
  const d = value ? new Date(value as string | Date) : new Date();
  return isNaN(d.getTime()) ? new Date().toLocaleString("en-IN") : d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Resolves the winning customer of an ENDED auction when `winner` is not set
 * yet (e.g. single-round auctions that auto-end via the time fallback). The
 * winner is the buyer of the highest offer in the last round.
 */
export async function resolveAuctionWinner(
  auction: WinnerAuction
): Promise<{ winnerId: string | null; winningOffer: number }> {
  const existing = winnerIdOf(auction.winner);
  if (existing) {
    return { winnerId: existing, winningOffer: Number(auction.winningOffer) || 0 };
  }

  const lastRound = auction.rounds || 1;
  const top = await Offer.find({ auction: auction._id, round: lastRound })
    .sort({ amount: -1 })
    .limit(1)
    .select("buyer amount")
    .lean();

  const offer = top?.[0] as unknown as { buyer?: unknown; amount?: number } | undefined;
  if (!offer?.buyer) return { winnerId: null, winningOffer: 0 };

  const winnerId = String(offer.buyer);
  await Auction.updateOne(
    { _id: auction._id },
    {
      $set: {
        winner: winnerId,
        winningOffer: Number(offer.amount) || 0,
        updatedAt: new Date(),
      },
    }
  );

  if (auction && typeof auction === "object") {
    (auction as { winner?: unknown }).winner = winnerId;
    (auction as { winningOffer?: number }).winningOffer = Number(offer.amount) || 0;
  }

  return { winnerId, winningOffer: Number(offer.amount) || 0 };
}

/**
 * Sends a congratulations email to the winning customer of an auction /
 * parking sale immediately after it ends.
 *
 * Idempotent: guarded by the auction's `winnerNotifiedAt` flag so the winner
 * is only congratulated once, even when multiple code paths observe the ENDED
 * transition. Never throws — failures are logged and surfaced to admins.
 */
export async function notifyWinnerViaEmail(auction: WinnerAuction): Promise<boolean> {
  if (!auction?._id) return false;
  if (auction.winnerNotifiedAt) return false;

  await dbConnect();

  if (auction.status === "ENDED") {
    const { winnerId } = await resolveAuctionWinner(auction);
    if (!winnerId) return false;

    const user = (await User.findById(winnerId)
      .select("name email")
      .lean()) as unknown as WinnerUser | null;

    if (!user?.email) {
      console.warn("[winner-notify] no registered email for winner", winnerId);
      try {
        await notifyAdmins(
          "Winner not congratulated (no email)",
          `Auction "${auction.title || "N/A"}" ended but the winner ${user?.name || winnerId} has no registered email address.`,
          String(auction._id)
        );
      } catch {
        // ignore
      }
      await Auction.updateOne(
        { _id: auction._id },
        { $set: { winnerNotifiedAt: new Date(), updatedAt: new Date() } }
      );
      return false;
    }

    const winningOffer = Number(auction.winningOffer) || 0;

    const itemDetails = auction.isParkingSale
      ? (auction.description && auction.description.trim()
          ? auction.description.trim()
          : auction.title || "")
      : [
          auction.year ? String(auction.year) : "",
          auction.make || "",
          auction.model || "",
          auction.variant || "",
        ]
          .filter(Boolean)
          .join(" ") +
        (auction.lotNumber ? ` · Lot ${auction.lotNumber}` : "");

    try {
      await sendWinnerCongratulationsEmail({
        to: user.email,
        customerName: user.name || "Customer",
        auctionName: auction.title || "Auction",
        itemDetails: itemDetails || undefined,
        winningAmount: fmtAmount(winningOffer),
        endedAt: fmtDateTime(auction.endTime),
        isParkingSale: auction.isParkingSale,
      });
    } catch (err) {
      console.error("[winner-notify] failed to email winner", auction._id, err);
      try {
        await notifyAdmins(
          "Winner congratulations email failed",
          `Could not email the winner (${user.name || user._id}) of "${auction.title || "N/A"}" (win ₹${fmtAmount(winningOffer)}). Reason: ${err instanceof Error ? err.message : "unknown error"}`,
          String(auction._id)
        );
      } catch {
        // ignore
      }
      return false;
    }

    await Auction.updateOne(
      { _id: auction._id },
      { $set: { winnerNotifiedAt: new Date(), updatedAt: new Date() } }
    );
    return true;
  }

  return false;
}