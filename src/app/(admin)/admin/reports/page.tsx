"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { SkeletonText } from "@/components/ui/skeleton";
import { formatINR, getCusId } from "@/lib/utils";

type FilterMode = "month" | "year" | "custom";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function AdminReportsPage() {
  const currentDate = new Date();
  const [mode, setMode] = useState<FilterMode>("month");
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [fromDate, setFromDate] = useState<string>(
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().slice(0, 10)
  );
  const [toDate, setToDate] = useState<string>(currentDate.toISOString().slice(0, 10));

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      let url = `/api/admin/reports?mode=${mode}`;
      if (mode === "month") {
        url += `&month=${selectedMonth}&year=${selectedYear}`;
      } else if (mode === "year") {
        url += `&year=${selectedYear}`;
      } else if (mode === "custom") {
        url += `&fromDate=${fromDate}&toDate=${toDate}`;
      }

      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [mode, selectedMonth, selectedYear]);

  const handleApplyCustomDate = () => {
    if (mode === "custom") {
      fetchReport();
    }
  };

  const exportCSV = () => {
    if (!data?.auctionsList) return;

    const headers = [
      "Lot Number",
      "Title",
      "Make",
      "Model",
      "Year",
      "Location",
      "Status",
      "Starting Offer",
      "Final / Winning Offer",
      "Total Offers",
      "Winner Name",
      "Winner Customer ID",
    ];

    const rows = data.auctionsList.map((a: any) => [
      a.lotNumber || "",
      a.title || "",
      a.make || "",
      a.model || "",
      a.year || "",
      a.location || "",
      a.status || "",
      a.startingOffer || 0,
      a.winningOffer || a.currentOffer || 0,
      a.totalOffers || 0,
      a.winner?.name || "N/A",
      a.winner ? getCusId(a.winner) : "N/A",
    ]);

    const csv = [headers, ...rows]
      .map((r) => r.map((c: any) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vks-auction-report-${mode}-${selectedYear}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  const summary = data?.summary || {};
  const topLots = data?.topLots || [];
  const topBuyers = data?.topBuyers || [];
  const auctionsList = data?.auctionsList || [];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">Enterprise Reports & Analytics</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Comprehensive financial, auction sales, and customer activity metrics filtered by month, year, or custom date range.
          </p>
        </div>
        <div className="flex items-center gap-2.5 print:hidden">
          <button
            onClick={printReport}
            className="px-3.5 py-2 border border-outline-variant/40 hover:bg-surface-container-low text-on-surface rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">print</span>
            Print PDF
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-primary text-white hover:bg-secondary rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">download</span>
            Export CSV Report
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-outline-variant/30 space-y-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">filter_alt</span>
            <span className="text-xs font-extrabold text-on-surface uppercase tracking-wider">Select Filter Mode:</span>
          </div>

          <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-xl">
            <button
              onClick={() => setMode("month")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === "month" ? "bg-primary text-white shadow-xs" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Month Wise
            </button>
            <button
              onClick={() => setMode("year")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === "year" ? "bg-primary text-white shadow-xs" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Year Wise
            </button>
            <button
              onClick={() => setMode("custom")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === "custom" ? "bg-primary text-white shadow-xs" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Custom Date Range
            </button>
          </div>
        </div>

        {/* Dynamic Filter Selectors */}
        <div className="flex flex-wrap items-center gap-4">
          {mode === "month" && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-on-surface-variant">Select Month:</label>
                <select
                  className="h-9 px-3 rounded-xl text-xs font-bold border border-outline-variant/40 bg-surface-container-low text-primary focus:outline-none focus:border-primary"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={idx} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-on-surface-variant">Select Year:</label>
                <select
                  className="h-9 px-3 rounded-xl text-xs font-bold border border-outline-variant/40 bg-surface-container-low text-primary focus:outline-none focus:border-primary"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {mode === "year" && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-on-surface-variant">Select Year:</label>
              <select
                className="h-9 px-3 rounded-xl text-xs font-bold border border-outline-variant/40 bg-surface-container-low text-primary focus:outline-none focus:border-primary"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          {mode === "custom" && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-on-surface-variant">From Date:</label>
                <input
                  type="date"
                  className="h-9 px-3 rounded-xl text-xs font-bold border border-outline-variant/40 bg-surface-container-low text-primary focus:outline-none focus:border-primary"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-on-surface-variant">To Date:</label>
                <input
                  type="date"
                  className="h-9 px-3 rounded-xl text-xs font-bold border border-outline-variant/40 bg-surface-container-low text-primary focus:outline-none focus:border-primary"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>

              <button
                onClick={handleApplyCustomDate}
                className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Apply Range
              </button>
            </>
          )}

          <div className="ml-auto text-xs font-bold text-on-surface-variant">
            Viewing Period:{" "}
            <span className="text-primary font-mono font-extrabold">
              {mode === "month"
                ? `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`
                : mode === "year"
                ? `Year ${selectedYear}`
                : `${fromDate} to ${toDate}`}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-outline uppercase tracking-wider">Total Sales Volume</span>
            <span className="material-symbols-outlined text-xl text-emerald-600">payments</span>
          </div>
          {isLoading ? (
            <SkeletonText className="w-28 h-6" />
          ) : (
            <p className="text-2xl font-extrabold text-primary font-mono">
              {formatINR(summary.totalSalesValue || 0)}
            </p>
          )}
          <p className="text-[10px] text-on-surface-variant font-medium">
            Winning offer total of {summary.completedAuctionsCount || 0} completed auctions
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-outline uppercase tracking-wider">Auctions Conducted</span>
            <span className="material-symbols-outlined text-xl text-primary">gavel</span>
          </div>
          {isLoading ? (
            <SkeletonText className="w-20 h-6" />
          ) : (
            <p className="text-2xl font-extrabold text-on-surface">
              {summary.totalAuctions || 0}
            </p>
          )}
          <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant">
            <span className="text-emerald-700">{summary.completedAuctionsCount || 0} Ended</span>
            <span>·</span>
            <span className="text-primary">{summary.liveAuctionsCount || 0} Live</span>
            <span>·</span>
            <span className="text-amber-700">{summary.upcomingAuctionsCount || 0} Upcoming</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-outline uppercase tracking-wider">Total Offers</span>
            <span className="material-symbols-outlined text-xl text-secondary">trending_up</span>
          </div>
          {isLoading ? (
            <SkeletonText className="w-16 h-6" />
          ) : (
            <p className="text-2xl font-extrabold text-on-surface">
              {summary.totalOffersCount || 0}
            </p>
          )}
          <p className="text-[10px] text-on-surface-variant font-medium">
            Placed by {summary.activeBiddersCount || 0} active customers
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-outline uppercase tracking-wider">Net Retained Fee</span>
            <span className="material-symbols-outlined text-xl text-blue-600">account_balance_wallet</span>
          </div>
          {isLoading ? (
            <SkeletonText className="w-24 h-6" />
          ) : (
            <p className="text-2xl font-extrabold text-blue-900 font-mono">
              {formatINR(summary.netRetainedRevenue || 0)}
            </p>
          )}
          <p className="text-[10px] text-on-surface-variant font-medium">
            Deposits ({formatINR(summary.totalRegDepositsCollected || 0)}) - Refunds ({formatINR(summary.totalRefundsIssued || 0)})
          </p>
        </div>
      </div>

      {/* Financial & Deposit Summary Breakdown Table */}
      <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-on-surface uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base">receipt_long</span>
            Financial &amp; Deposit Summary
          </h2>
          <Badge variant="outline" className="text-xs font-mono font-bold">
            Fee Deposit: ₹5,000 / Auction
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-surface-container-low rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Total Deposits Collected</span>
            <span className="text-lg font-extrabold text-primary font-mono block">
              {formatINR(summary.totalRegDepositsCollected || 0)}
            </span>
            <span className="text-[10px] text-on-surface-variant font-medium">
              Gross registration fees paid by customers
            </span>
          </div>

          <div className="p-4 bg-surface-container-low rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Total Refunds Issued</span>
            <span className="text-lg font-extrabold text-blue-700 font-mono block">
              {formatINR(summary.totalRefundsIssued || 0)}
            </span>
            <span className="text-[10px] text-on-surface-variant font-medium">
              Refunds processed for non-winning participants
            </span>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Net Platform Retained Revenue</span>
            <span className="text-lg font-extrabold text-emerald-900 font-mono block">
              {formatINR(summary.netRetainedRevenue || 0)}
            </span>
            <span className="text-[10px] text-emerald-700 font-medium">
              Net revenue retained after processing refunds
            </span>
          </div>
        </div>
      </div>

      {/* Top Winning Auctions & Top Buyers Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Winning Lots */}
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-on-surface uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-base">emoji_events</span>
              Top Selling Vehicle Lots
            </h3>
            <span className="text-[10px] font-bold text-outline">Highest winning offers</span>
          </div>

          {topLots.length === 0 ? (
            <p className="text-xs text-on-surface-variant text-center py-6">No completed sales recorded in this period.</p>
          ) : (
            <div className="space-y-2.5">
              {topLots.map((lot: any) => (
                <div key={lot._id} className="p-3 bg-surface-container-low/60 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-[10px] font-extrabold text-primary">{lot.lotNumber}</span>
                    <p className="text-xs font-bold text-on-surface line-clamp-1">{lot.title}</p>
                    <p className="text-[10px] text-on-surface-variant">
                      Winner: <span className="font-bold text-on-surface">{lot.winner?.name || "N/A"}</span> ({getCusId(lot.winner)})
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold font-mono text-emerald-700 block">
                      {formatINR(lot.winningOffer || lot.currentOffer || 0)}
                    </span>
                    <span className="text-[9px] text-outline font-bold">{lot.totalOffers || 0} total offers</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Buyers */}
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-on-surface uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">military_tech</span>
              Top Winning Buyers
            </h3>
            <span className="text-[10px] font-bold text-outline">Highest value purchasers</span>
          </div>

          {topBuyers.length === 0 ? (
            <p className="text-xs text-on-surface-variant text-center py-6">No winning buyers recorded in this period.</p>
          ) : (
            <div className="space-y-2.5">
              {topBuyers.map((tb: any, idx: number) => {
                const u = tb.user;
                const rawPhone = u?.phone ? u.phone.replace(/\D/g, "") : "";
                const waLink = rawPhone ? `https://wa.me/${rawPhone}` : null;
                return (
                  <div key={idx} className="p-3 bg-surface-container-low/60 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary text-white text-xs font-extrabold flex items-center justify-center">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-on-surface">{u?.name || "Unknown"}</p>
                        <p className="text-[10px] text-on-surface-variant font-mono">
                          {getCusId(u)} {u?.city ? `· ${u.city}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold font-mono text-primary block">
                        {formatINR(tb.totalSpent)}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                        {tb.wonCount} Lots Won
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Auctions Performance Table */}
      <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xs">
        <div className="p-4 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-on-surface uppercase tracking-wider">
            Detailed Auction Performance Log ({auctionsList.length})
          </h3>
          <Badge variant="secondary" className="!bg-primary !text-white text-[10px] font-bold">
            Period Report
          </Badge>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonText key={i} className="w-full h-8" />
            ))}
          </div>
        ) : auctionsList.length === 0 ? (
          <div className="p-12 text-center text-xs text-on-surface-variant">
            No auctions recorded for the selected filter period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low/80 border-b border-outline-variant/30 text-[10px] font-bold text-outline uppercase tracking-wider">
                  <th className="py-3 px-4">Lot ID</th>
                  <th className="py-3 px-4">Vehicle Title</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Starting Offer</th>
                  <th className="py-3 px-4 text-right">Winning / Highest Offer</th>
                  <th className="py-3 px-4 text-center">Offers</th>
                  <th className="py-3 px-4">Winner Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {auctionsList.map((a: any) => (
                  <tr key={a._id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-extrabold text-primary">
                      {a.lotNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-on-surface">{a.title}</td>
                    <td className="py-3.5 px-4 text-on-surface-variant font-medium">{a.location}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          a.status === "ENDED"
                            ? "bg-emerald-100 text-emerald-800"
                            : a.status === "LIVE"
                            ? "bg-primary/10 text-primary"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-on-surface-variant">
                      {formatINR(a.startingOffer)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-emerald-700">
                      {formatINR(a.winningOffer || a.currentOffer || 0)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-extrabold text-on-surface">
                      {a.totalOffers || 0}
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant font-medium">
                      {a.winner ? (
                        <div>
                          <span className="font-bold text-on-surface block">{a.winner.name}</span>
                          <span className="font-mono text-[10px] text-primary">{getCusId(a.winner)}</span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
