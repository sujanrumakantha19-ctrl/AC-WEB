"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { SkeletonText } from "@/components/ui/skeleton";
import { formatINR, getCusId } from "@/lib/utils";

type StatusTab = "ALL" | "SUCCESS" | "REFUNDED" | "FAILED" | "PENDING";

export default function AdminPaymentHistoryPage() {
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState<StatusTab>("ALL");
  const [selectedTxn, setSelectedTxn] = useState<any | null>(null);
  const [lotFilter, setLotFilter] = useState("");

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      let url = `/api/admin/payments?status=${activeStatus}`;
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      if (lotFilter.trim()) {
        url += `&lot=${encodeURIComponent(lotFilter.trim())}`;
      }

      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [activeStatus, search, lotFilter]);

  const summary = data?.summary || {};
  const transactions = data?.transactions || [];

  const exportCSV = () => {
    if (!transactions.length) return;

    const headers = [
      "Transaction ID",
      "Customer Name",
      "Customer ID",
      "WhatsApp Phone",
      "Email",
      "Auction Lot Number",
      "Auction Title",
      "Payment Method",
      "Amount (INR)",
      "Status",
      "Date & Time",
    ];

    const rows = transactions.map((t: any) => [
      t.txnId,
      t.user?.name || "",
      t.user?.cusId || getCusId(t.user),
      t.user?.phone || "",
      t.user?.email || "",
      t.auction?.lotNumber || "",
      t.auction?.title || "",
      t.paymentMethod || "",
      t.amount || 0,
      t.status || "",
      t.date ? new Date(t.date).toLocaleString("en-IN") : "",
    ]);

    const csv = [headers, ...rows]
      .map((r) => r.map((c: any) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payment-history-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 whitespace-nowrap inline-block shadow-2xs">✓ Paid</span>;
      case "REFUNDED":
        return <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 whitespace-nowrap inline-block shadow-2xs">💸 Refunded</span>;
      case "FAILED":
        return <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 whitespace-nowrap inline-block shadow-2xs">❌ Failed</span>;
      case "PENDING":
        return <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 whitespace-nowrap inline-block shadow-2xs">⏳ Pending</span>;
      default:
        return <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-surface-container-high text-on-surface whitespace-nowrap inline-block">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">Payment History &amp; Deposit Log</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Track auction registration deposit payments, completed, refunded, failed, and pending transactions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">download</span>
            Export CSV
          </button>
          <Badge variant="secondary" className="!bg-primary !text-white border border-primary !px-4 !py-2 !rounded-xl text-xs font-bold">
            {summary.totalTransactions || 0} Transactions
          </Badge>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-outline uppercase tracking-wider">Total Collected</span>
            <span className="material-symbols-outlined text-xl text-primary">payments</span>
          </div>
          {isLoading ? (
            <SkeletonText className="w-28 h-6" />
          ) : (
            <p className="text-2xl font-extrabold text-primary font-mono">
              {formatINR(summary.totalCollected || 0)}
            </p>
          )}
          <p className="text-[10px] text-on-surface-variant font-medium">
            Gross registration deposit fees collected
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-outline uppercase tracking-wider">Total Refunded</span>
            <span className="material-symbols-outlined text-xl text-blue-600">currency_exchange</span>
          </div>
          {isLoading ? (
            <SkeletonText className="w-24 h-6" />
          ) : (
            <p className="text-2xl font-extrabold text-blue-800 font-mono">
              {formatINR(summary.totalRefunded || 0)}
            </p>
          )}
          <p className="text-[10px] text-on-surface-variant font-medium">
            {summary.refundedTransactions || 0} refunded deposit transactions
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-outline uppercase tracking-wider">Net Retained Revenue</span>
            <span className="material-symbols-outlined text-xl text-emerald-600">account_balance</span>
          </div>
          {isLoading ? (
            <SkeletonText className="w-28 h-6" />
          ) : (
            <p className="text-2xl font-extrabold text-emerald-900 font-mono">
              {formatINR(summary.netRevenue || 0)}
            </p>
          )}
          <p className="text-[10px] text-on-surface-variant font-medium">
            Net platform deposit revenue retained
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-outline uppercase tracking-wider">Transaction Breakdown</span>
            <span className="material-symbols-outlined text-xl text-primary">pie_chart</span>
          </div>
          {isLoading ? (
            <SkeletonText className="w-20 h-6" />
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-extrabold">
              <span className="text-emerald-700 font-mono">{summary.successfulTransactions || 0} Paid</span>
              <span>·</span>
              <span className="text-red-700 font-mono">{summary.failedTransactions || 0} Failed</span>
              <span>·</span>
              <span className="text-amber-700 font-mono">{summary.pendingTransactions || 0} Pending</span>
            </div>
          )}
          <p className="text-[10px] text-on-surface-variant font-medium">
            Complete transaction status summary
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-outline-variant/30 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-1 gap-3 w-full sm:w-auto flex-wrap">
          <div className="relative flex-1 sm:w-72 min-w-[220px]">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-base">search</span>
            <input
              className="w-full h-9 pl-9 pr-3 rounded-xl text-xs font-medium border border-outline-variant/40 bg-white focus:outline-none focus:border-primary"
              placeholder="Search Txn ID, Name, Customer ID, Phone, or Lot #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="relative min-w-[160px]">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-base">local_shipping</span>
            <select
              className="w-full h-9 pl-9 pr-3 rounded-xl text-xs font-medium border border-outline-variant/40 bg-white focus:outline-none focus:border-primary appearance-none"
              value={lotFilter}
              onChange={(e) => setLotFilter(e.target.value)}
            >
              <option value="">All Auction Lots</option>
              {(data?.lots || []).map((lot: string) => (
                <option key={lot} value={lot}>
                  {lot}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-outline text-sm pointer-events-none">expand_more</span>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl flex-wrap">
          <button
            onClick={() => setActiveStatus("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeStatus === "ALL" ? "bg-primary text-white shadow-xs" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            All Payments
          </button>
          <button
            onClick={() => setActiveStatus("SUCCESS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeStatus === "SUCCESS" ? "bg-primary text-white shadow-xs" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveStatus("REFUNDED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeStatus === "REFUNDED" ? "bg-primary text-white shadow-xs" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Refunded
          </button>
          <button
            onClick={() => setActiveStatus("FAILED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeStatus === "FAILED" ? "bg-primary text-white shadow-xs" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Failed
          </button>
          <button
            onClick={() => setActiveStatus("PENDING")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeStatus === "PENDING" ? "bg-primary text-white shadow-xs" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {/* Payment Transactions Table */}
      <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <SkeletonText className="w-24" />
                <SkeletonText className="w-32" />
                <SkeletonText className="w-28" />
                <SkeletonText className="w-20" />
                <SkeletonText className="w-16" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-xs text-on-surface-variant space-y-2">
            <span className="material-symbols-outlined text-3xl text-outline">receipt_long</span>
            <p className="font-bold">No payment transactions found matching your criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30 text-[10px] font-bold text-outline uppercase tracking-wider">
                  <th className="py-3 px-4 whitespace-nowrap">Transaction ID</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Auction Lot</th>
                  <th className="py-3 px-4 whitespace-nowrap">Payment Method</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Amount</th>
                  <th className="py-3 px-4 whitespace-nowrap">Date &amp; Time</th>
                  <th className="py-3 px-5 text-center whitespace-nowrap min-w-[130px]">Status</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {transactions.map((tx: any) => {
                  const rawPhone = tx.user?.phone ? tx.user.phone.replace(/\D/g, "") : "";
                  const waLink = rawPhone ? `https://wa.me/${rawPhone}` : null;

                  return (
                    <tr
                      key={tx.txnId}
                      onClick={() => setSelectedTxn(tx)}
                      className="cursor-pointer hover:bg-surface-container-low/60 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-extrabold text-primary whitespace-nowrap">
                        {tx.txnId}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-on-surface">{tx.user?.name || "Unknown"}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] text-primary font-bold">{getCusId(tx.user)}</span>
                          {waLink && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-emerald-700 hover:underline text-[10px] font-bold inline-flex items-center gap-0.5"
                            >
                              <span className="material-symbols-outlined text-[11px]">chat</span>
                              {tx.user.phone}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-extrabold text-primary block">
                          {tx.auction?.lotNumber}
                        </span>
                        <span className="text-[11px] text-on-surface-variant line-clamp-1">
                          {tx.auction?.title}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-on-surface-variant whitespace-nowrap">
                        {tx.paymentMethod}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-extrabold text-primary whitespace-nowrap">
                        {formatINR(tx.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-on-surface-variant text-[11px] whitespace-nowrap">
                        {tx.date ? new Date(tx.date).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }) : "—"}
                      </td>
                      <td className="py-3.5 px-5 text-center whitespace-nowrap min-w-[130px]">
                        {getStatusBadge(tx.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTxn(tx);
                          }}
                          className="px-2.5 py-1 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-lg text-[10px] font-bold transition-all"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Details Slide-over Drawer */}
      {selectedTxn && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity"
          onClick={() => setSelectedTxn(null)}
        >
          <div
            className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl p-6 space-y-6 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-start justify-between border-b border-outline-variant/20 pb-4">
                <div>
                  <span className="font-mono text-xs font-extrabold text-primary block">{selectedTxn.txnId}</span>
                  <h2 className="text-base font-extrabold text-on-surface mt-0.5">Transaction Details</h2>
                </div>
                <button
                  onClick={() => setSelectedTxn(null)}
                  className="p-1 rounded-lg text-outline hover:bg-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-4 bg-surface-container-low rounded-2xl space-y-2 text-center">
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Amount</span>
                <p className="text-2xl font-extrabold text-primary font-mono">
                  {formatINR(selectedTxn.amount)}
                </p>
                <div className="flex justify-center">
                  {getStatusBadge(selectedTxn.status)}
                </div>
                {selectedTxn.failureReason && (
                  <p className="text-[10px] font-medium text-error mt-1">
                    Note: {selectedTxn.failureReason}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-outline uppercase tracking-wider">Customer Details</h3>
                <div className="p-3.5 bg-surface-container-low/50 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Name:</span>
                    <span className="font-bold text-on-surface">{selectedTxn.user?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Customer ID:</span>
                    <span className="font-mono font-bold text-primary">{getCusId(selectedTxn.user)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">WhatsApp Phone:</span>
                    <span className="font-bold text-emerald-700">{selectedTxn.user?.phone || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">City:</span>
                    <span className="font-bold text-on-surface">{selectedTxn.user?.city || "—"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-outline uppercase tracking-wider">Auction Lot Details</h3>
                <div className="p-3.5 bg-surface-container-low/50 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Lot Number:</span>
                    <span className="font-mono font-extrabold text-primary">{selectedTxn.auction?.lotNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Vehicle Title:</span>
                    <span className="font-bold text-on-surface truncate max-w-[200px]">{selectedTxn.auction?.title}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-outline uppercase tracking-wider">Payment Gateway Metadata</h3>
                <div className="p-3.5 bg-surface-container-low/50 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Gateway / Method:</span>
                    <span className="font-bold text-on-surface">{selectedTxn.paymentMethod}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Date &amp; Time:</span>
                    <span className="font-bold text-on-surface">
                      {selectedTxn.date ? new Date(selectedTxn.date).toLocaleString("en-IN") : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/20 flex justify-end">
              <button
                onClick={() => setSelectedTxn(null)}
                className="px-5 py-2 bg-surface-container-low hover:bg-outline-variant/20 text-on-surface rounded-xl text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
