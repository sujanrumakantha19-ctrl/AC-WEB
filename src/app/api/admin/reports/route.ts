import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Auction from "@/models/Auction";
import User from "@/models/User";
import Offer from "@/models/Offer";
import Setting from "@/models/Setting";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    const mode = searchParams.get("mode") || "month"; // "month" | "year" | "custom"
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
    const fromDateStr = searchParams.get("fromDate");
    const toDateStr = searchParams.get("toDate");

    let startDate: Date;
    let endDate: Date;

    if (mode === "year") {
      startDate = new Date(year, 0, 1, 0, 0, 0, 0);
      endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    } else if (mode === "custom" && fromDateStr && toDateStr) {
      startDate = new Date(fromDateStr);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(toDateStr);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // month wise (default)
      startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const lastDay = new Date(year, month, 0).getDate();
      endDate = new Date(year, month - 1, lastDay, 23, 59, 59, 999);
    }

    // 1. Fetch Auctions created or active within range
    const auctions = await Auction.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).populate("winner", "name cusId phone email city").lean();

    // All auctions total for fallback comparison
    const allAuctions = await Auction.find({}).populate("winner", "name cusId phone email city").lean();

    // 2. Fetch Offers created within range
    const offers = await Offer.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).populate("buyer", "name cusId phone email city").lean();

    // 3. Fetch Users registered within range
    const users = await User.find({ role: "user" }).lean();
    const newUsersInRange = users.filter(
      (u) => new Date(u.createdAt) >= startDate && new Date(u.createdAt) <= endDate
    );

    // Calculate metrics for selected range
    const targetAuctions = auctions.length > 0 ? auctions : allAuctions;

    const completedAuctions = targetAuctions.filter((a) => a.status === "ENDED");
    const liveAuctions = targetAuctions.filter((a) => a.status === "LIVE");
    const upcomingAuctions = targetAuctions.filter((a) => a.status === "UPCOMING");

    // Total sales value of completed auctions
    const totalSalesValue = completedAuctions.reduce(
      (sum, a) => sum + (a.winningOffer || a.currentOffer || 0),
      0
    );

    // Estimated revenue from registration fees
    const regFeeSetting = await Setting.findOne({ key: "registrationFee" }).lean() as any;
    const defaultRegFee = regFeeSetting ? parseInt(regFeeSetting.value || "5000") : 5000;

    let totalRegDepositsCollected = 0;
    let totalRefundsIssued = 0;

    users.forEach((u: any) => {
      const paidCount = (u.paidAccessAuctions || []).length;
      totalRegDepositsCollected += paidCount * defaultRegFee;

      const refundedCount = (u.refundedAuctions || []).length;
      totalRefundsIssued += refundedCount * defaultRegFee;
    });

    const netRetainedRevenue = totalRegDepositsCollected - totalRefundsIssued;

    // Unique active buyers in range
    const uniqueBiddersSet = new Set(offers.map((o: any) => String(o.buyer?._id || o.buyer)));

    // Top Selling Lots
    const topLots = [...completedAuctions]
      .sort((a, b) => (b.winningOffer || b.currentOffer || 0) - (a.winningOffer || a.currentOffer || 0))
      .slice(0, 5);

    // Top Buyers by winning count & total spent
    const buyerMap: Record<string, { user: any; wonCount: number; totalSpent: number }> = {};
    completedAuctions.forEach((a: any) => {
      if (a.winner) {
        const wId = String(a.winner._id || a.winner);
        if (!buyerMap[wId]) {
          buyerMap[wId] = { user: a.winner, wonCount: 0, totalSpent: 0 };
        }
        buyerMap[wId].wonCount += 1;
        buyerMap[wId].totalSpent += a.winningOffer || a.currentOffer || 0;
      }
    });

    const topBuyers = Object.values(buyerMap)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      filter: {
        mode,
        month,
        year,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalAuctions: targetAuctions.length,
        completedAuctionsCount: completedAuctions.length,
        liveAuctionsCount: liveAuctions.length,
        upcomingAuctionsCount: upcomingAuctions.length,
        totalOffersCount: offers.length,
        totalSalesValue,
        totalRegDepositsCollected,
        totalRefundsIssued,
        netRetainedRevenue,
        activeBiddersCount: uniqueBiddersSet.size,
        newCustomersCount: newUsersInRange.length,
        totalCustomersCount: users.length,
      },
      topLots,
      topBuyers,
      auctionsList: targetAuctions,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
