"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { SkeletonText } from "@/components/ui/skeleton";
import { useGetAdminUsersQuery, useUpdateUserRefundMutation } from "@/services/admin-api";
import { formatINR, getCusId } from "@/lib/utils";

type FilterTab = "ALL" | "LOT_WISE" | "WINNERS" | "NOT_REGISTERED" | "REFUNDED" | "NON_REFUNDED";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [selectedAuctionId, setSelectedAuctionId] = useState<string>("");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Draft filter state inside drawer
  const [draftTab, setDraftTab] = useState<FilterTab>("ALL");
  const [draftAuctionId, setDraftAuctionId] = useState<string>("");

  const { data, isLoading } = useGetAdminUsersQuery(
    search.trim() ? { search: search.trim() } : undefined
  );
  const [updateUserRefund, { isLoading: isUpdatingRefund }] = useUpdateUserRefundMutation();

  const rawUsers = data?.users || [];
  const auctions = data?.auctions || [];

  // Filter users based on search & active tab & selected lot
  const filteredUsers = rawUsers.filter((u) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const nameMatch = u.name?.toLowerCase().includes(q);
      const cusIdMatch = u.cusId?.toLowerCase().includes(q) || getCusId(u).toLowerCase().includes(q);
      const phoneMatch = u.phone?.toLowerCase().includes(q);
      if (!nameMatch && !cusIdMatch && !phoneMatch) return false;
    }

    if (activeTab === "ALL") return true;

    if (activeTab === "NOT_REGISTERED") {
      return (u.participatedCount || 0) === 0;
    }

    if (activeTab === "LOT_WISE") {
      if (!selectedAuctionId) return false;
      return (u.participatedAuctions || []).some((pa: any) => pa._id === selectedAuctionId);
    }

    if (activeTab === "WINNERS") {
      if (selectedAuctionId) {
        return (u.participatedAuctions || []).some((pa: any) => pa._id === selectedAuctionId && pa.won);
      }
      return (u.winningCount || 0) > 0;
    }

    if (activeTab === "REFUNDED") {
      if (selectedAuctionId) {
        return (u.participatedAuctions || []).some((pa: any) => pa._id === selectedAuctionId && !pa.won && pa.refunded);
      }
      return (u.participatedCount || 0) > 0 && (u.winningCount || 0) === 0 && u.hasRefunded;
    }

    if (activeTab === "NON_REFUNDED") {
      if (selectedAuctionId) {
        return (u.participatedAuctions || []).some((pa: any) => pa._id === selectedAuctionId && !pa.won && !pa.refunded);
      }
      return (u.participatedCount || 0) > 0 && (u.winningCount || 0) === 0 && u.hasNonRefunded;
    }

    return true;
  });

  const selectedAuction = auctions.find((a) => a._id === selectedAuctionId);

  const openFilterDrawer = () => {
    setDraftTab(activeTab);
    setDraftAuctionId(selectedAuctionId);
    setFilterDrawerOpen(true);
  };

  const applyFilters = () => {
    if (draftTab === "LOT_WISE" && !draftAuctionId) {
      return;
    }
    setActiveTab(draftTab);
    setSelectedAuctionId(draftAuctionId);
    setFilterDrawerOpen(false);
  };

  const resetFilters = () => {
    setDraftTab("ALL");
    setDraftAuctionId("");
    setActiveTab("ALL");
    setSelectedAuctionId("");
    setFilterDrawerOpen(false);
  };

  const getFilterLabel = () => {
    if (activeTab === "ALL") return "All Customers";
    if (activeTab === "LOT_WISE") {
      return selectedAuction ? `Lot: ${selectedAuction.lotNumber}` : "Auction Lot Wise";
    }
    if (activeTab === "WINNERS") {
      return selectedAuction ? `Winners (Lot: ${selectedAuction.lotNumber})` : "🏆 Winners List";
    }
    if (activeTab === "NOT_REGISTERED") return "Not Registered";
    if (activeTab === "REFUNDED") {
      return selectedAuction ? `Refunded (Lot: ${selectedAuction.lotNumber})` : "💸 Refunded";
    }
    if (activeTab === "NON_REFUNDED") {
      return selectedAuction ? `Pending / No Refund (Lot: ${selectedAuction.lotNumber})` : "⏳ Pending / No Refund";
    }
    return "All";
  };

  const handleToggleRefund = async (userId: string, auctionId: string, currentRefundState: boolean) => {
    try {
      await updateUserRefund({
        userId,
        auctionId,
        refundState: !currentRefundState,
      }).unwrap();
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser((prev: any) => {
          if (!prev) return null;
          const updatedAuctions = (prev.participatedAuctions || []).map((pa: any) =>
            pa._id === auctionId ? { ...pa, refunded: !currentRefundState } : pa
          );
          return { ...prev, participatedAuctions: updatedAuctions };
        });
      }
    } catch (err) {
      console.error("Failed to toggle refund status:", err);
    }
  };

  const exportCSV = () => {
    const headers = [
      "Customer ID",
      "Full Name",
      "WhatsApp Number",
      "Email",
      "City",
      "State",
      "Joined Date",
      "Participated Count",
      "Winning Count",
      "Won Lot Numbers",
    ];
    const rows = filteredUsers.map((u) => [
      getCusId(u),
      u.name || "",
      u.phone || "",
      u.email || "",
      u.city || "",
      u.state || "",
      u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "",
      u.participatedCount || 0,
      u.winningCount || 0,
      (u.wonLotNumbers || []).join("; "),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c: any) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `users-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const showLotSelectorInDrawer =
    draftTab === "LOT_WISE" ||
    draftTab === "WINNERS" ||
    draftTab === "REFUNDED" ||
    draftTab === "NON_REFUNDED";

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">Customer Directory</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Manage customers, track auction participation, winners, and refund status.
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
            {filteredUsers.length} Customers
          </Badge>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-outline-variant/30 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-base">search</span>
          <input
            className="w-full h-9 pl-9 pr-3 rounded-xl text-xs font-medium border border-outline-variant/40 bg-white focus:outline-none focus:border-primary"
            placeholder="Search by Name, Customer ID, or WhatsApp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {activeTab !== "ALL" && (
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-xl text-xs font-bold flex items-center gap-1">
              <span>Filter: {getFilterLabel()}</span>
              <button onClick={resetFilters} className="hover:text-error transition-colors" title="Clear filter">
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </span>
          )}

          <button
            onClick={openFilterDrawer}
            className="group px-4 py-2 bg-surface-container-low hover:bg-primary hover:text-white border border-outline-variant/40 text-on-surface rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base text-primary group-hover:text-white transition-colors">tune</span>
            Filter
          </button>
        </div>
      </div>

      {/* Lot Wise Info Banner */}
      {activeTab === "LOT_WISE" && selectedAuction && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl text-emerald-600">gavel</span>
            <div>
              <p className="text-xs font-bold text-emerald-900">
                Viewing Participants for Lot: <span className="font-mono text-primary font-extrabold">{selectedAuction.lotNumber}</span> — {selectedAuction.title}
              </p>
              <p className="text-[10px] text-emerald-700 mt-0.5">
                Winner row is highlighted in green color. Click any row to view customer details.
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="!bg-emerald-100 !text-emerald-800 border border-emerald-300">
            {filteredUsers.length} Participants
          </Badge>
        </div>
      )}

      {/* Customers Data Table */}
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
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-on-surface-variant space-y-2">
            <span className="material-symbols-outlined text-3xl text-outline">group_off</span>
            <p className="font-bold">No customers found matching your criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30 text-[10px] font-bold text-outline uppercase tracking-wider">
                  <th className="py-3 px-4">Customer ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">WhatsApp Number</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-center">Participated</th>
                  <th className="py-3 px-4 text-center">Winning Count</th>
                  {(activeTab === "WINNERS" || activeTab === "ALL") && (
                    <th className="py-3 px-4">Won Lot Numbers</th>
                  )}
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredUsers.map((user) => {
                  const cusId = getCusId(user);
                  const isAuctionWinner =
                    activeTab === "LOT_WISE" &&
                    selectedAuction &&
                    (user.participatedAuctions || []).some(
                      (pa: any) => pa._id === selectedAuctionId && pa.won
                    );

                  const rawPhone = user.phone ? user.phone.replace(/\D/g, "") : "";
                  const waLink = rawPhone ? `https://wa.me/${rawPhone}` : null;
                  const wonLots: string[] = user.wonLotNumbers || [];

                  return (
                    <tr
                      key={user._id}
                      onClick={() => setSelectedUser(user)}
                      className={`cursor-pointer transition-colors ${
                        isAuctionWinner
                          ? "bg-emerald-50/90 border-l-4 border-l-emerald-500 font-medium hover:bg-emerald-100/90"
                          : "hover:bg-surface-container-low/60"
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-extrabold text-primary">
                        {cusId}
                        {isAuctionWinner && (
                          <span className="ml-2 px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[9px] font-bold uppercase tracking-wider">
                            Winner 🏆
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-on-surface">{user.name}</td>
                      <td className="py-3.5 px-4">
                        {waLink ? (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-emerald-700 hover:underline inline-flex items-center gap-1 font-bold"
                          >
                            <span className="material-symbols-outlined text-xs">chat</span>
                            {user.phone}
                          </a>
                        ) : (
                          user.phone || "—"
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-on-surface-variant">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-1 bg-surface-container-low rounded-lg font-extrabold text-on-surface">
                          {user.participatedCount || 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-1 rounded-lg font-extrabold ${
                            (user.winningCount || 0) > 0
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-surface-container-low text-on-surface-variant"
                          }`}
                        >
                          {user.winningCount || 0}
                        </span>
                      </td>

                      {(activeTab === "WINNERS" || activeTab === "ALL") && (
                        <td className="py-3.5 px-4">
                          {wonLots.length === 0 ? (
                            <span className="text-on-surface-variant/60">—</span>
                          ) : (
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono text-[10px] font-bold">
                                {wonLots[0]}
                              </span>
                              {wonLots.length > 1 && (
                                <span
                                  title={wonLots.join(", ")}
                                  className="px-1.5 py-0.5 bg-primary text-white rounded text-[9px] font-extrabold"
                                >
                                  +{wonLots.length - 1} more
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      )}

                      <td className="py-3.5 px-4 text-on-surface-variant font-medium">
                        {user.city || "—"}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
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

      {/* Right-Side Slide-Over Filter Drawer */}
      {filterDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity"
          onClick={() => setFilterDrawerOpen(false)}
        >
          <div
            className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl p-6 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">tune</span>
                  <h2 className="text-base font-extrabold text-on-surface">
                    Filter Customers
                  </h2>
                </div>
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  className="p-1 rounded-lg text-outline hover:bg-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Filter Category Options */}
              <div className="space-y-3">
                <label className="text-xs font-extrabold text-on-surface-variant block">
                  Select Category Filter
                </label>

                <div className="space-y-2">
                  {[
                    { id: "ALL", label: "All Customers", count: rawUsers.length },
                    { id: "LOT_WISE", label: "Auction Lot Wise (Mandatory Lot ID)", count: null },
                    { id: "WINNERS", label: "🏆 Winners List", count: rawUsers.filter((u) => u.winningCount > 0).length },
                    { id: "NOT_REGISTERED", label: "Not Registered for Any", count: rawUsers.filter((u) => u.participatedCount === 0).length },
                    { id: "REFUNDED", label: "💸 Refunded", count: rawUsers.filter((u) => u.participatedCount > 0 && u.winningCount === 0 && u.hasRefunded).length },
                    { id: "NON_REFUNDED", label: "⏳ Pending / No Refund", count: rawUsers.filter((u) => u.participatedCount > 0 && u.winningCount === 0 && u.hasNonRefunded).length },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      onClick={() => setDraftTab(opt.id as FilterTab)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        draftTab === opt.id
                          ? "bg-primary/10 border-primary ring-1 ring-primary/30"
                          : "bg-surface-container-low/50 border-outline-variant/20 hover:border-outline-variant/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="filterTab"
                          checked={draftTab === opt.id}
                          onChange={() => setDraftTab(opt.id as FilterTab)}
                          className="accent-primary"
                        />
                        <span className="text-xs font-bold text-on-surface">{opt.label}</span>
                      </div>
                      {opt.count !== null && (
                        <span className="px-2 py-0.5 bg-white border rounded-lg text-[10px] font-extrabold text-primary">
                          {opt.count}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Auction Lot Selection Dropdown */}
              {showLotSelectorInDrawer && (
                <div className="space-y-2 pt-3 border-t border-outline-variant/20">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-on-surface-variant block">
                      Select Auction Lot ID {draftTab === "LOT_WISE" && <span className="text-error">*</span>}
                    </label>
                    {draftTab !== "LOT_WISE" && (
                      <span className="text-[10px] text-on-surface-variant font-medium">(Optional for specific lot)</span>
                    )}
                  </div>
                  <select
                    className="w-full h-10 px-3 rounded-xl text-xs font-bold border border-outline-variant/40 bg-surface-container-low text-primary focus:outline-none focus:border-primary"
                    value={draftAuctionId}
                    onChange={(e) => setDraftAuctionId(e.target.value)}
                  >
                    <option value="">-- All Auction Lots --</option>
                    {auctions.map((auc) => (
                      <option key={auc._id} value={auc._id}>
                        {auc.lotNumber} — {auc.title}
                      </option>
                    ))}
                  </select>
                  {draftTab === "LOT_WISE" && !draftAuctionId && (
                    <p className="text-[11px] font-semibold text-error">
                      ⚠️ Please select an Auction Lot ID to apply Auction Lot Wise filter.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer Action Buttons */}
            <div className="pt-4 border-t border-outline-variant/20 flex items-center gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 py-2.5 border border-outline-variant/40 hover:bg-surface-container-low text-on-surface rounded-xl text-xs font-bold transition-all"
              >
                Reset Filters
              </button>
              <button
                onClick={applyFilters}
                disabled={draftTab === "LOT_WISE" && !draftAuctionId}
                className="flex-1 py-2.5 bg-primary hover:bg-secondary text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Slide-over Drawer / Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white w-full max-w-xl h-full overflow-y-auto shadow-2xl p-6 space-y-6 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-start justify-between border-b border-outline-variant/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-primary text-white text-xl font-extrabold flex items-center justify-center shadow-md">
                    {(selectedUser.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-on-surface">{selectedUser.name}</h2>
                    <p className="text-xs font-mono font-extrabold text-primary mt-0.5">
                      Customer ID: {getCusId(selectedUser)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1 rounded-lg text-outline hover:bg-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 bg-surface-container-low rounded-2xl text-center">
                <div>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Participated</p>
                  <p className="text-lg font-extrabold text-primary">{selectedUser.participatedCount || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Won</p>
                  <p className="text-lg font-extrabold text-emerald-600">{selectedUser.winningCount || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Joined Date</p>
                  <p className="text-xs font-bold text-on-surface mt-1">
                    {selectedUser.createdAt
                      ? new Date(selectedUser.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-outline uppercase tracking-wider">Contact &amp; Address Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-surface-container-low/50 rounded-xl space-y-1">
                    <span className="text-[10px] text-outline font-bold block">WhatsApp Number</span>
                    <span className="font-bold text-on-surface flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-emerald-600">chat</span>
                      {selectedUser.phone || "—"}
                    </span>
                  </div>

                  <div className="p-3 bg-surface-container-low/50 rounded-xl space-y-1">
                    <span className="text-[10px] text-outline font-bold block">Email Address</span>
                    <span className="font-bold text-on-surface break-all">{selectedUser.email || "—"}</span>
                  </div>

                  <div className="p-3 bg-surface-container-low/50 rounded-xl space-y-1 sm:col-span-2">
                    <span className="text-[10px] text-outline font-bold block">Address</span>
                    <span className="font-bold text-on-surface">
                      {[
                        selectedUser.addressLine1,
                        selectedUser.addressLine2,
                        selectedUser.city,
                        selectedUser.state,
                        selectedUser.pincode,
                        selectedUser.country,
                      ]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-outline uppercase tracking-wider">
                    Auction Participation History ({selectedUser.participatedAuctions?.length || 0})
                  </h3>
                </div>

                {(!selectedUser.participatedAuctions || selectedUser.participatedAuctions.length === 0) ? (
                  <p className="text-xs text-on-surface-variant text-center py-6 bg-surface-container-low rounded-2xl">
                    No auction participation records found for this customer.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {selectedUser.participatedAuctions.map((pa: any) => (
                      <div
                        key={pa._id}
                        className={`p-3.5 rounded-2xl border space-y-2.5 transition-all ${
                          pa.won
                            ? "bg-emerald-50/80 border-emerald-200"
                            : "bg-surface-container-low/60 border-outline-variant/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-xs font-extrabold text-primary">{pa.lotNumber}</span>
                            <h4 className="text-xs font-bold text-on-surface mt-0.5">{pa.title}</h4>
                          </div>

                          {pa.won ? (
                            <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold">
                              🏆 Winner
                            </span>
                          ) : pa.refunded ? (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">
                              💸 Refunded
                            </span>
                          ) : pa.refundEligible ? (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">
                              ⏳ Refund Pending
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-[10px] font-bold">
                              ✗ No Refund
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] border-t border-outline-variant/20 pt-2 text-on-surface-variant font-medium">
                          <span>Reg. Fee: {pa.isParkingSale ? "Free" : formatINR(pa.registrationFee)}</span>
                          <span>Highest Offer: {formatINR(pa.highestUserOffer)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/20 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
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
