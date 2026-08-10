"use client";

import React, { useState } from "react";
import { getCusId } from "@/lib/utils";

export interface ParticipantUser {
  _id?: string;
  cusId?: string;
  name?: string;
  phone?: string;
  email?: string;
  isWinner?: boolean;
  lastRoundOffer?: number | null;
  inTop50?: boolean;
  refundEligible?: boolean;
  refunded?: boolean;
}

export function ParticipantsPopup({
  participants,
  onClose,
  title = "Auction Participants",
}: {
  participants: ParticipantUser[];
  onClose: () => void;
  title?: string;
}) {
  const [search, setSearch] = useState("");

  const showRefund = participants.some((p) => "refunded" in p || "refundEligible" in p);

  const filtered = participants.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.cusId?.toLowerCase().includes(q) ||
      p._id?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-primary px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-2xl">group</span>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              {title} ({participants.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-4 border-b border-outline-variant/20 bg-surface-container-low shrink-0">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-base">
              search
            </span>
            <input
              type="text"
              className="w-full h-9 pl-9 pr-3 rounded-xl text-xs font-medium border border-outline-variant/40 bg-white focus:outline-none focus:border-primary"
              placeholder="Search by Customer Name, ID, or WhatsApp number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-on-surface-variant py-8">
              {participants.length === 0
                ? "No registered participants yet for this auction"
                : "No matching participants found"}
            </p>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 text-[10px] font-bold text-outline uppercase tracking-wider">
                  <th className="py-2.5 pr-3 w-10">Sl No</th>
                  <th className="py-2.5 pr-3">Customer ID</th>
                  <th className="py-2.5 pr-3">Customer Name</th>
                  <th className="py-2.5 pr-3">WhatsApp / Phone</th>
                  {showRefund && <th className="py-2.5 pr-3">Refund Status</th>}
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filtered.map((user, idx) => {
                  const rawPhone = user.phone ? user.phone.replace(/\D/g, "") : "";
                  const waLink = rawPhone ? `https://wa.me/${rawPhone}` : null;
                  return (
                    <tr key={user._id || idx} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-3 pr-3 font-medium text-on-surface-variant">{idx + 1}</td>
                      <td className="py-3 pr-3 font-mono font-extrabold text-primary">
                        {getCusId(user)}
                      </td>
                      <td className="py-3 pr-3 font-bold text-on-surface">
                        {user.name || "—"}
                        {user.isWinner && (
                          <span className="ml-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[9px] font-extrabold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[10px]">emoji_events</span> Winner
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-3 font-medium text-on-surface-variant">
                        {user.phone || "—"}
                      </td>
                      {showRefund && (
                        <td className="py-3 pr-3">
                          {user.isWinner ? (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                              Winner
                            </span>
                          ) : user.refunded ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                              ✓ Refunded
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                              ✗ Not Refunded
                            </span>
                          )}
                        </td>
                      )}
                      <td className="py-3 text-right">
                        {waLink ? (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[10px] font-bold transition-all active:scale-95"
                          >
                            <span className="material-symbols-outlined text-xs text-emerald-600">chat</span>
                            WhatsApp
                          </a>
                        ) : (
                          <span className="text-[10px] text-outline">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
