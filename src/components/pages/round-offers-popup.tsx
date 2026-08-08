"use client";

import React from "react";
import { formatINR, getCusId } from "@/lib/utils";
import type { Offer } from "@/types";

const buyerOf = (offer: Offer) => (typeof offer.buyer === "object" ? offer.buyer : undefined);

export function RoundOffersPopup({
  round,
  offers,
  onClose,
}: {
  round: number;
  offers: Offer[];
  onClose: () => void;
}) {
  const sorted = [...offers].sort((a, b) => b.amount - a.amount);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-primary px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-2xl">gavel</span>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Round {round} Offers</h3>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors" aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {sorted.length === 0 ? (
            <p className="text-center text-xs text-on-surface-variant py-6">No offers in this round</p>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 text-[10px] font-bold text-outline uppercase tracking-wider">
                  <th className="py-2 pr-2 w-8">Sl No</th>
                  <th className="py-2 pr-2">Customer ID</th>
                  <th className="py-2 pr-2">Name</th>
                  <th className="py-2 pr-2">WhatsApp</th>
                  <th className="py-2 pr-2 text-right">Offer Price</th>
                  <th className="py-2 text-right">Date &amp; Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {sorted.map((offer, idx) => {
                  const buyer = buyerOf(offer);
                  const cusId = getCusId(buyer);
                  const rawPhone = buyer?.phone ? buyer.phone.replace(/\D/g, "") : "";
                  const waLink = rawPhone ? `https://wa.me/${rawPhone}` : null;
                  return (
                    <tr key={offer._id || idx} className={idx === 0 ? "bg-emerald-50/50" : ""}>
                      <td className="py-2.5 pr-2 font-medium text-on-surface">{idx + 1}</td>
                      <td className="py-2.5 pr-2 font-mono font-extrabold text-primary">
                        {cusId}
                      </td>
                      <td className="py-2.5 pr-2 font-bold text-on-surface">{buyer?.name || "—"}</td>
                      <td className="py-2.5 pr-2 font-medium text-on-surface-variant">
                        {waLink ? (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:underline inline-flex items-center gap-0.5 font-semibold"
                          >
                            <span className="material-symbols-outlined text-xs">chat</span>
                            {buyer?.phone}
                          </a>
                        ) : (
                          buyer?.phone || "—"
                        )}
                      </td>
                      <td className="py-2.5 pr-2 text-right font-extrabold font-mono text-primary">
                        {formatINR(offer.amount)}
                      </td>
                      <td className="py-2.5 text-right text-on-surface-variant">
                        {offer.createdAt
                          ? new Date(offer.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })
                          : "—"}
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
