import dbConnect from "./db";
import Auction from "@/models/Auction";
import Offer from "@/models/Offer";
import Notification from "@/models/Notification";

function normalizeAuction(auction: any) {
  const obj = auction.toObject ? auction.toObject() : { ...auction };
  obj.id = obj._id?.toString() || obj.id;
  return obj;
}

export async function getAuctions(options?: { status?: string; limit?: number }) {
  const conn = await dbConnect();
  if (conn) {
    try {
      const query: any = {};
      if (options?.status) query.status = options.status;
      const auctions = await Auction.find(query)
        .sort({ createdAt: -1 })
        .limit(options?.limit || 50);
      return JSON.parse(JSON.stringify(auctions)).map(normalizeAuction);
    } catch (err) {
      console.error("[getAuctions] Error fetching from DB:", err);
    }
  }
  return [];
}

export async function getAuctionById(id: string) {
  const conn = await dbConnect();
  if (conn && id.match(/^[0-9a-fA-F]{24}$/)) {
    try {
      const auction = await Auction.findById(id);
      if (auction) return normalizeAuction(JSON.parse(JSON.stringify(auction)));
    } catch (err) {
      console.error("[getAuctionById] Error fetching from DB:", err);
    }
  }
  return null;
}

export async function getAuctionsByStatus(status: string) {
  return getAuctions({ status });
}

export async function getOffersForAuction(auctionId: string) {
  const conn = await dbConnect();
  if (conn) {
    try {
      const offers = await Offer.find({ auction: auctionId })
        .populate("buyer", "name email")
        .sort({ createdAt: -1 })
        .limit(100);
      if (offers.length > 0) return JSON.parse(JSON.stringify(offers));
    } catch {}
  }
  return [];
}

export async function getNotificationsForUser(userId: string) {
  const conn = await dbConnect();
  if (conn) {
    try {
      const notifications = await Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(50);
      return JSON.parse(JSON.stringify(notifications));
    } catch {}
  }
  return [];
}
