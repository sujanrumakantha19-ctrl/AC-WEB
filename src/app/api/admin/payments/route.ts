import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Payment from "@/models/Payment";

type PopulatedPayment = {
  _id: unknown;
  orderId: string;
  paymentId?: string;
  amount?: number;
  status?: string;
  failureReason?: string;
  refundId?: string;
  refundInitiatedAt?: Date;
  refundedAt?: Date;
  refundError?: string;
  createdAt: Date;
  user?: { _id?: unknown; name?: string; cusId?: string; phone?: string; email?: string; city?: string };
  auction?: { _id?: unknown; title?: string; lotNumber?: string };
};

type AdminPaymentTransaction = {
  txnId: string;
  user: { _id?: unknown; name?: string; cusId?: string; phone?: string; email?: string; city?: string };
  auction: { _id?: unknown; lotNumber: string; title: string };
  amount: number;
  paymentMethod: string;
  status: string;
  date: string;
  failureReason?: string;
  orderId?: string;
  paymentId?: string;
  refundId?: string;
  refundInitiatedAt?: Date;
  refundedAt?: Date;
};

const fmtTxnId = (orderId: string, suffix: string) =>
  `TXN-${suffix}${orderId.replace(/^order_/, "").slice(-8).toUpperCase()}`;

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const statusFilter = searchParams.get("status") || "ALL"; // ALL | PAID | REFUND_PENDING | REFUNDED | FAILED | PENDING
    const lotFilter = searchParams.get("lot") || ""; // auction lot number filter

    const payments = (await Payment.find({})
      .populate("user", "name cusId phone email city")
      .populate("auction", "title lotNumber")
      .sort({ createdAt: -1 })
      .lean()) as unknown as PopulatedPayment[];

    const paymentTransactions: AdminPaymentTransaction[] = [];

    payments.forEach((p, idx) => {
      const user = p.user || {};
      const auction = p.auction || {};
      const status = p.status || "PENDING";

      const txDate =
        status === "REFUNDED"
          ? p.refundedAt || p.createdAt
          : status === "REFUND_PENDING"
            ? p.refundInitiatedAt || p.createdAt
            : p.createdAt;

      paymentTransactions.push({
        txnId: fmtTxnId(p.orderId || "", String(idx + 1)),
        user: {
          _id: user._id,
          name: user.name,
          cusId: user.cusId,
          phone: user.phone,
          email: user.email,
          city: user.city,
        },
        auction: {
          _id: auction._id,
          lotNumber: auction.lotNumber || "LOT-XXXX",
          title: auction.title || "Vehicle Auction",
        },
        amount: p.amount || 0,
        paymentMethod: "Razorpay Online",
        status,
        date: txDate ? new Date(txDate).toISOString() : new Date(p.createdAt).toISOString(),
        failureReason: status === "FAILED" ? p.failureReason || p.refundError || "Payment failed" : p.refundError,
        orderId: p.orderId,
        paymentId: p.paymentId,
        refundId: p.refundId,
        refundInitiatedAt: p.refundInitiatedAt,
        refundedAt: p.refundedAt,
      });
    });

    // Filter transactions
    const filteredTxns = paymentTransactions.filter((tx) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const nameMatch = tx.user.name?.toLowerCase().includes(q);
        const cusIdMatch = tx.user.cusId?.toLowerCase().includes(q);
        const phoneMatch = tx.user.phone?.toLowerCase().includes(q);
        const emailMatch = tx.user.email?.toLowerCase().includes(q);
        const lotMatch = tx.auction.lotNumber?.toLowerCase().includes(q);
        const txnMatch = tx.txnId.toLowerCase().includes(q);
        const orderMatch = (tx.orderId || "").toLowerCase().includes(q);
        const paymentMatch = (tx.paymentId || "").toLowerCase().includes(q);
        if (!nameMatch && !cusIdMatch && !phoneMatch && !emailMatch && !lotMatch && !txnMatch && !orderMatch && !paymentMatch)
          return false;
      }

      if (lotFilter.trim()) {
        const lotQ = lotFilter.trim().toLowerCase();
        const lotMatch = (tx.auction.lotNumber || "").toLowerCase().includes(lotQ);
        if (!lotMatch) return false;
      }

      if (statusFilter !== "ALL" && tx.status !== statusFilter) return false;

      return true;
    });

    const totalCollected = paymentTransactions
      .filter((t) => t.status === "PAID" || t.status === "REFUND_PENDING" || t.status === "REFUNDED")
      .reduce((acc, t) => acc + t.amount, 0);

    const totalRefunded = paymentTransactions
      .filter((t) => t.status === "REFUNDED")
      .reduce((acc, t) => acc + t.amount, 0);

    const netRevenue = totalCollected - totalRefunded;

    const lotList = Array.from(
      new Set(paymentTransactions.map((t) => t.auction.lotNumber).filter(Boolean))
    ).sort();

    return NextResponse.json({
      success: true,
      lots: lotList,
      summary: {
        totalTransactions: paymentTransactions.length,
        successfulTransactions: paymentTransactions.filter((t) => t.status === "PAID").length,
        refundedTransactions: paymentTransactions.filter((t) => t.status === "REFUNDED").length,
        refundPendingTransactions: paymentTransactions.filter((t) => t.status === "REFUND_PENDING").length,
        failedTransactions: paymentTransactions.filter((t) => t.status === "FAILED").length,
        pendingTransactions: paymentTransactions.filter((t) => t.status === "PENDING").length,
        totalCollected,
        totalRefunded,
        netRevenue,
      },
      transactions: filteredTxns,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}