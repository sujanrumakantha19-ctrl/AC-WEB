import dbConnect from "./db";
import Auction from "@/models/Auction";
import Offer from "@/models/Offer";
import Notification from "@/models/Notification";
import { MOCK_AUCTIONS } from "@/data/mock/auctions";
import type { AuctionItem } from "@/data/mock/auctions";

function normalizeAuction(auction: any) {
  const obj = auction.toObject ? auction.toObject() : { ...auction };
  obj.id = obj._id?.toString() || obj.id;
  return obj;
}

function mockToAuctionFormat(mock: AuctionItem) {
  return normalizeAuction({
    _id: mock.id,
    id: mock.id,
    title: mock.title,
    make: mock.make,
    model: mock.model,
    year: mock.year,
    variant: mock.variant,
    fuelType: mock.fuelType,
    transmission: mock.transmission,
    mileage: mock.mileage,
    location: mock.location,
    image: mock.image,
    images: mock.images,
    startingOffer: mock.startingOffer,
    currentOffer: mock.currentOffer,
    totalOffers: mock.totalOffers,
    reserveMet: mock.reserveMet,
    status: mock.status,
    endTime: mock.endTime,
    seller: mock.seller,
    verifiedSeller: mock.verifiedSeller,
    inspectionScore: mock.inspectionScore,
    lotNumber: mock.lotNumber,
    engine: mock.engine,
    color: mock.color,
    ownership: mock.ownership,
    insurance: mock.insurance,
  });
}

export async function getAuctions(options?: { status?: string; limit?: number }) {
  const conn = await dbConnect();
  let auctions: any[] = [];
  if (conn) {
    try {
      const query: any = {};
      if (options?.status) query.status = options.status;
      auctions = await Auction.find(query)
        .sort({ createdAt: -1 })
        .limit(options?.limit || 50);
      if (auctions.length > 0) return JSON.parse(JSON.stringify(auctions)).map(normalizeAuction);
    } catch {}
  }
  let filtered = MOCK_AUCTIONS;
  if (options?.status) {
    filtered = filtered.filter((a) => a.status === options.status);
  }
  if (options?.limit) {
    filtered = filtered.slice(0, options.limit);
  }
  return filtered.map(mockToAuctionFormat);
}

export async function getAuctionById(id: string) {
  const conn = await dbConnect();
  if (conn && id.match(/^[0-9a-fA-F]{24}$/)) {
    try {
      const auction = await Auction.findById(id);
      if (auction) return normalizeAuction(JSON.parse(JSON.stringify(auction)));
    } catch {}
  }
  const mock = MOCK_AUCTIONS.find((a) => a.id === id);
  if (mock) return mockToAuctionFormat(mock);
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
