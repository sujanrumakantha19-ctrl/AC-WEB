"use client";

import React from "react";
import Link from "next/link";
import { useGetMyPaymentsQuery } from "@/services/user-api";

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: string; color: string; bg: string; border: string }
> = {
  PAID: {
    label: "Paid",
    icon: "check_circle",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  PENDING: {
    label: "Pending",
    icon: "schedule",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  REFUND_PENDING: {
    label: "Refund Pending",
    icon: "schedule",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  FAILED: {
    label: "Failed",
    icon: "cancel",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  REFUNDED: {
    label: "Refunded",
    icon: "undo",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function UserPaymentHistoryPage() {
  const { data, isLoading, error } = useGetMyPaymentsQuery();
  const payments = data?.payments || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-xl">
            payments
          </span>
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-on-surface">
            Payment History
          </h1>
          <p className="text-xs text-on-surface-variant">
            All your auction registration fee payments
          </p>
        </div>
      </div>

      {/* Summary cards */}
      {!isLoading && payments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(["PAID", "PENDING", "REFUND_PENDING", "FAILED", "REFUNDED"] as const).map((s) => {
            const cfg = STATUS_CONFIG[s];
            const count = payments.filter(
              (p: any) => p.status === s
            ).length;
            return (
              <div
                key={s}
                className={`rounded-2xl p-4 ${cfg.bg} border ${cfg.border}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`material-symbols-outlined text-base ${cfg.color}`}
                  >
                    {cfg.icon}
                  </span>
                  <span className={`text-xs font-bold ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
                <p className={`text-2xl font-extrabold ${cfg.color}`}>
                  {count}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <span className="material-symbols-outlined animate-spin text-3xl text-primary">
            progress_activity
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 font-medium">
          Failed to load payment history. Please try again.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && payments.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <span className="material-symbols-outlined text-5xl text-outline/40">
            receipt_long
          </span>
          <p className="text-sm font-bold text-on-surface-variant">
            No payments yet
          </p>
          <p className="text-xs text-outline">
            Your auction registration fee payments will appear here.
          </p>
          <Link
            href="/user/auctions"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline mt-2"
          >
            <span className="material-symbols-outlined text-sm">gavel</span>
            Browse Auctions
          </Link>
        </div>
      )}

      {/* Payment list */}
      {!isLoading && payments.length > 0 && (
        <div className="space-y-3">
          {payments.map((payment: any) => {
            const cfg = STATUS_CONFIG[payment.status] || STATUS_CONFIG.PENDING;
            const auction = payment.auction;
            return (
              <div
                key={payment._id}
                className="bg-white rounded-2xl border border-outline-variant/15 shadow-sm hover:shadow-md transition-shadow p-4 sm:p-5"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Auction image */}
                  {auction?.image ? (
                    <img
                      src={auction.image}
                      alt={auction.title || ""}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover flex-shrink-0 bg-surface-container-low"
                    />
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-surface-container-low flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-outline/40 text-2xl">
                        directions_car
                      </span>
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-on-surface truncate">
                          {auction?.title || "Auction"}
                        </h3>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">
                          {auction?.lotNumber
                            ? `Lot #${auction.lotNumber}`
                            : ""}
                          {auction?.lotNumber ? " · " : ""}
                          {formatDate(payment.createdAt)}
                        </p>
                      </div>

                      {/* Status badge */}
                      <div
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold flex-shrink-0 ${cfg.bg} ${cfg.color} border ${cfg.border}`}
                      >
                        <span className="material-symbols-outlined text-xs">
                          {cfg.icon}
                        </span>
                        {cfg.label}
                      </div>
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-[11px]">
                      <div className="flex items-center gap-1">
                        <span className="text-on-surface-variant">Amount:</span>
                        <span className="font-extrabold text-on-surface">
                          ₹{(payment.amount || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                      {payment.orderId && (
                        <div className="flex items-center gap-1">
                          <span className="text-on-surface-variant">
                            Order:
                          </span>
                          <span className="font-mono font-bold text-on-surface">
                            {payment.orderId.slice(-12)}
                          </span>
                        </div>
                      )}
                      {payment.paymentId && (
                        <div className="flex items-center gap-1">
                          <span className="text-on-surface-variant">
                            Payment:
                          </span>
                          <span className="font-mono font-bold text-on-surface">
                            {payment.paymentId.slice(-12)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Failure reason */}
                    {payment.failureReason && (
                      <p className="text-[11px] text-red-500 mt-1.5 leading-tight">
                        {payment.failureReason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
