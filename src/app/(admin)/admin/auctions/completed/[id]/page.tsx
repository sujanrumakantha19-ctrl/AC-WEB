"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR, getCusId } from "@/lib/utils";
import { Skeleton, SkeletonText, SkeletonBadge } from "@/components/ui/skeleton";
import { useGetAuctionQuery, useGetAuctionParticipantsQuery } from "@/services/auctions-api";
import { useGetOffersQuery } from "@/services/offers-api";
import { ParticipantsPopup } from "@/components/pages/participants-popup";

const buyerOf = (offer: any) => (typeof offer.buyer === "object" ? offer.buyer : undefined);

export default function AdminCompletedAuctionDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [selectedRound, setSelectedRound] = useState(0);
  const [participantsPopupOpen, setParticipantsPopupOpen] = useState(false);

  const { data: auctionData, isLoading } = useGetAuctionQuery(id, { skip: !id });
  const { data: offersData } = useGetOffersQuery({ auction: id }, { skip: !id });
  const { data: participantsData } = useGetAuctionParticipantsQuery(id, { skip: !id });

  const auction = auctionData?.auction;
  const offers = offersData?.offers || [];

  if (isLoading || !id) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <SkeletonBadge className="w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-7 w-2/3" />
          <SkeletonText className="w-40" />
          <div className="grid grid-cols-4 gap-4 p-4 bg-surface-container-low rounded-xl">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <SkeletonText className="w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 space-y-3">
          <SkeletonText className="w-14" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 space-y-3">
          <div className="flex justify-between">
            <SkeletonText className="w-24" />
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-16 rounded-lg" />
              ))}
            </div>
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-sm text-on-surface-variant">Auction not found</p>
          <Link href="/admin/auctions/completed"><Button variant="outline" size="sm" className="mt-3">Back</Button></Link>
        </div>
      </div>
    );
  }

  const roundStates = auction.roundStates || [];
  const roundOffers = Array.from({ length: auction.rounds || 1 }, (_, i) =>
    offers.filter((b) => b.round === i + 1).sort((a, b) => b.amount - a.amount)
  );
  const currentRoundOffers = roundOffers[selectedRound] || [];

  const apiParticipants = participantsData?.participants || [];
  const participantMap = new Map<string, any>();
  for (const p of apiParticipants) {
    const key = p ? String(p._id || p.cusId || "") : "";
    if (key) participantMap.set(key, p);
  }
  for (const o of offers) {
    const buyer = buyerOf(o);
    const key = buyer ? String(buyer._id || buyer.cusId || "") : "";
    if (key && !participantMap.has(key)) participantMap.set(key, buyer);
  }
  const allParticipants = Array.from(participantMap.values());

  const refundedParticipants = allParticipants.filter((p: any) => p.refunded);
  const refundInProcessParticipants = allParticipants.filter((p: any) => !p.isWinner && p.lastRoundOffer != null && !p.refunded && p.refundEligible);
  const notRefundedParticipants = allParticipants.filter((p: any) => !p.isWinner && p.lastRoundOffer != null && !p.refunded && !p.refundEligible);

  let winnerObj: { _id?: string; name?: string; phone?: string; email?: string; cusId?: string } | undefined =
    typeof auction.winner === "object" ? auction.winner : undefined;
  if (!winnerObj || (!winnerObj.cusId && !winnerObj.name)) {
    const highestOfferObj = offers.slice().sort((a, b) => b.amount - a.amount)[0];
    if (highestOfferObj && typeof highestOfferObj.buyer === "object") {
      winnerObj = highestOfferObj.buyer;
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border p-6 space-y-4">
        <div className="flex items-center gap-2"><Badge variant="secondary">ENDED</Badge><span className="font-mono font-bold text-primary text-sm">{auction.lotNumber}</span></div>
        <h1 className="text-xl font-extrabold">{auction.title}</h1>
        <p className="text-xs text-on-surface-variant">📍 {auction.location}</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-4 bg-surface-container-low rounded-xl items-center">
          <div><p className="text-[9px] uppercase text-outline">Winning Offer</p><p className="text-lg font-extrabold text-primary">{formatINR(auction.winningOffer || 0)}</p></div>
          <div><p className="text-[9px] uppercase text-outline">Total Offers</p><p className="text-lg font-extrabold">{auction.totalOffers}</p></div>
          <div><p className="text-[9px] uppercase text-outline">Rounds</p><p className="text-lg font-extrabold">{auction.rounds}</p></div>
          <div><p className="text-[9px] uppercase text-outline">Winner</p><p className="text-sm font-bold text-emerald-600">{auction.winner ? "✓ Won" : "N/A"}</p></div>
          <div
            onClick={() => setParticipantsPopupOpen(true)}
            className="cursor-pointer hover:bg-primary/10 p-1.5 -m-1.5 rounded-xl transition-all group/part"
            title="Click to view participants list"
          >
            <p className="text-[9px] font-bold text-outline uppercase tracking-wider group-hover/part:text-primary">
              Participants
            </p>
            <p className="text-base font-extrabold text-primary">
              {allParticipants.length}
            </p>
          </div>
        </div>
      </div>

      {winnerObj && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-emerald-600">emoji_events</span>
              <h3 className="text-sm font-extrabold text-emerald-900">Auction Winner</h3>
            </div>
            <p className="text-lg font-extrabold text-emerald-700">Winning Offer: {formatINR(auction.winningOffer || 0)}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-emerald-200/60 text-xs text-emerald-900">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Customer ID</span>
              <span className="font-mono font-extrabold text-sm">{getCusId(winnerObj)}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Customer Name</span>
              <span className="font-bold text-sm">{winnerObj?.name || "—"}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">WhatsApp / Phone</span>
              <span className="font-bold text-sm">{winnerObj?.phone || "—"}</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-extrabold">Refund Summary</h2>
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider">
            Quoted · Within 1% of winning offer · Top 50% highest quoters
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Refunded Customers</p>
            <p className="text-2xl font-extrabold text-emerald-700 font-mono">{refundedParticipants.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Refund Initiated</p>
            <p className="text-2xl font-extrabold text-amber-700 font-mono">{refundInProcessParticipants.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-red-700">No Refund</p>
            <p className="text-2xl font-extrabold text-red-700 font-mono">{notRefundedParticipants.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Total Last-Round Participants</p>
            <p className="text-2xl font-extrabold text-on-surface font-mono">{allParticipants.filter((p: any) => p.lastRoundOffer != null && !p.isWinner).length}</p>
          </div>
        </div>
        {allParticipants.length === 0 && (
          <p className="text-xs text-center py-3 text-on-surface-variant">No participant data available for this auction.</p>
        )}
      </div>

      <div className="bg-white rounded-2xl border p-5 space-y-3">
        <h2 className="text-sm font-extrabold">Rounds</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {roundStates.map((rs, i: number) => {
            const topOffer = roundOffers[i]?.[0];
            const winnerBuyer = typeof topOffer?.buyer === "object" ? topOffer.buyer : undefined;
            const buyerLabel = winnerBuyer
              ? `${winnerBuyer.name || "—"} (${getCusId(winnerBuyer)})`
              : "—";
            return (
              <div
                key={i}
                onClick={() => setSelectedRound(i)}
                className={`p-4 rounded-xl border text-center flex flex-col justify-between gap-2 cursor-pointer transition-all ${
                  i === selectedRound ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "bg-surface-container-low border-outline-variant/20 hover:border-outline-variant/40"
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-on-surface">Round {rs.round}</p>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-wider mt-1">Highest Offer</p>
                  <p className="text-lg font-extrabold text-primary font-mono">{formatINR(rs.highestOffer || 0)}</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">{roundOffers[i]?.length || 0} offers</p>
                </div>
                <div className="pt-2 border-t border-outline-variant/20">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 rounded-full text-[10px] font-semibold text-primary">
                    <span className="material-symbols-outlined text-xs">person</span>
                    <span>Highest Offer: {buyerLabel}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold">Offers — Round {selectedRound + 1}</h2>
          <div className="flex gap-1">
            {roundStates.map((rs, i: number) => (
              <button key={i} onClick={() => setSelectedRound(i)} className={`px-3 py-1 rounded-lg text-[10px] font-bold ${selectedRound === i ? "bg-primary text-white" : "bg-outline/10"}`}>Round {rs.round}</button>
            ))}
          </div>
        </div>
        {currentRoundOffers.length === 0 && <p className="text-xs text-center py-4 text-on-surface-variant">No offers</p>}
        {currentRoundOffers.map((offer, idx: number) => {
          const buyer = typeof offer.buyer === "object" ? offer.buyer : undefined;
          const rawPhone = buyer?.phone ? buyer.phone.replace(/\D/g, "") : "";
          const waLink = rawPhone ? `https://wa.me/${rawPhone}` : null;
          return (
            <div key={offer._id || idx} className={`p-3 rounded-xl border flex justify-between items-center ${idx === 0 ? "bg-emerald-50 border-emerald-200" : "bg-surface-container-low"}`}>
              <div>
                <p className="text-xs font-bold text-on-surface">
                  {buyer?.name || "Buyer"}
                  <span className="font-medium text-on-surface-variant font-mono"> ({getCusId(buyer)})</span>
                </p>
                <div className="flex items-center gap-3 text-[10px] text-on-surface-variant mt-0.5">
                  <span>{new Date(offer.createdAt).toLocaleTimeString("en-IN")}</span>
                  {buyer?.phone && (
                    <span className="font-semibold text-emerald-700 flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[11px]">chat</span>
                      {waLink ? (
                        <a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {buyer.phone}
                        </a>
                      ) : (
                        buyer.phone
                      )}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs font-extrabold text-primary font-mono">{formatINR(offer.amount)}</p>
            </div>
          );
        })}
      </div>

      <Link href="/admin/auctions/completed"><Button variant="outline" size="sm">← Back</Button></Link>

      {participantsPopupOpen && (
        <ParticipantsPopup
          participants={allParticipants}
          onClose={() => setParticipantsPopupOpen(false)}
        />
      )}
    </div>
  );
}
