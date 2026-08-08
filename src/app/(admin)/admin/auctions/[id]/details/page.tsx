"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatINR, getCusId } from "@/lib/utils";
import { ImageWithGallery } from "@/components/ui/image-with-gallery";
import { Skeleton, SkeletonText, SkeletonBadge } from "@/components/ui/skeleton";
import { useGetAuctionQuery, useGetAuctionParticipantsQuery } from "@/services/auctions-api";
import { useGetOffersQuery } from "@/services/offers-api";
import { useAuctionLive } from "@/hooks/use-auction-live";
import { ParticipantsPopup } from "@/components/pages/participants-popup";
import type { RoundState, Offer } from "@/types";

const buyerOf = (offer: Offer) => (typeof offer.buyer === "object" ? offer.buyer : undefined);

export default function AdminAuctionDetailsPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from") || "";
  const fromQuery = fromParam ? `?from=${encodeURIComponent(fromParam)}` : "";
  const [timelineRound, setTimelineRound] = useState<number | null>(null);
  const [participantsPopupOpen, setParticipantsPopupOpen] = useState(false);

  const { data: auctionData, isLoading } = useGetAuctionQuery(id, { skip: !id });
  const { data: offersData } = useGetOffersQuery({ auction: id }, { skip: !id });
  const { data: participantsData } = useGetAuctionParticipantsQuery(id, { skip: !id });

  const wsConnected = useAuctionLive(id);

  const auction = auctionData?.auction;
  const offers = offersData?.offers || [];
  const currentRound = auction?.currentRound || 1;

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

  if (isLoading || !auction) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
        <div className="bg-white rounded-2xl overflow-hidden shadow-xs flex flex-col md:flex-row">
          <div className="md:w-96 shrink-0 flex flex-col">
            <Skeleton className="h-56 md:h-64 w-full rounded-none" />
            <div className="px-4 py-2 border-t border-outline-variant/20 space-y-2">
              <Skeleton className="h-7 w-3/4" />
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-md" />
                <Skeleton className="h-5 w-14 rounded-md" />
              </div>
              <SkeletonText className="w-full" />
            </div>
          </div>
          <div className="px-6 pb-6 pt-2 flex-1 space-y-4">
            <div className="grid grid-cols-4 gap-3 p-4 bg-surface-container-low rounded-xl">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <SkeletonText className="w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="flex-1 h-32 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 space-y-4">
          <div className="flex justify-between">
            <SkeletonText className="w-16" />
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-16 rounded-lg" />
              ))}
            </div>
          </div>
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const isLive = auction.status === "LIVE";
  const isEnded = auction.status === "ENDED";
  const roundStates = auction.roundStates || [];

  const timelineOffers = offers
    .filter((o) => (timelineRound === null ? o.round === currentRound : o.round === timelineRound))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getRoundStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge variant="live" pulse>LIVE</Badge>;
      case "completed": return <Badge variant="success">COMPLETED</Badge>;
      case "paused": return <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">PAUSED</span>;
      default: return <span className="text-[10px] font-medium text-outline">PENDING</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin/auctions" className="flex items-center gap-1 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors shrink-0">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back
          </Link>
          <h1 className="text-lg font-extrabold text-on-surface truncate">{auction.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {!isEnded && (
            <Link href={`/admin/auctions/${id}/edit${fromQuery}`}>
              <button className="px-4 py-2 bg-surface-container-low hover:bg-primary hover:text-white text-on-surface-variant font-bold text-xs rounded-xl transition-all active:scale-95 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">edit</span>
                Edit
              </button>
            </Link>
          )}
          {isLive && (
            <Link href={`/admin/auctions/live/${id}${fromQuery}`}>
              <button className="px-4 py-2 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95">
                Go to Live Room
              </button>
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden shadow-xs group flex flex-col md:flex-row">
        <div className="md:w-96 shrink-0 flex flex-col">
          <div className="relative h-56 md:h-64 overflow-hidden bg-black/5">
            <div className="absolute top-2.5 left-2.5 z-10">
              {isLive ? <Badge variant="live" pulse>LIVE</Badge> : isEnded ? <Badge variant="secondary">ENDED</Badge> : <Badge variant="warning">UPCOMING</Badge>}
            </div>
            <ImageWithGallery
              src={auction.image || ""}
              alt={auction.title}
              images={auction.images}
              imgClassName="group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="px-4 py-2 border-t border-outline-variant/20">
            <h1 className="text-xl font-extrabold text-on-surface leading-snug flex items-center justify-between gap-2">
              <span>{auction.title}</span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg shadow-sm font-semibold">
                <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Lot ID :</span>
                <span className="font-mono text-xs font-extrabold">{auction.lotNumber}</span>
              </span>
            </h1>
            <div className="flex flex-wrap gap-1.5 mt-1.5 text-[11px] text-on-surface-variant font-medium">
              <span className="bg-surface-container-low px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">speed</span>
                {auction.mileage?.toLocaleString()} km
              </span>
              <span className="bg-surface-container-low px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">local_gas_station</span>
                {auction.fuelType}
              </span>
              <span className="bg-surface-container-low px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">settings</span>
                {auction.transmission}
              </span>
              <span className="bg-surface-container-low px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">location_on</span>
                {auction.location}
              </span>
            </div>
            {auction.description && (
              <p className="text-xs text-on-surface-variant leading-relaxed mt-2">{auction.description}</p>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 pt-2 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex flex-wrap justify-between gap-x-6 gap-y-3 p-4 bg-surface-container-low rounded-xl">
              <div>
                <p className="text-xs font-bold text-outline uppercase tracking-wider">Starting Offer</p>
                <p className="text-base font-extrabold text-primary">{formatINR(auction.startingOffer)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-outline uppercase tracking-wider">Current Offer</p>
                <p className="text-base font-extrabold text-primary">{formatINR(auction.currentOffer || auction.startingOffer)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-outline uppercase tracking-wider">Total Offers</p>
                <p className="text-base font-bold text-on-surface">{auction.totalOffers}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-outline uppercase tracking-wider">Reg. Fee</p>
                <p className="text-base font-bold text-on-surface">{formatINR(auction.registrationFee || 0)}</p>
              </div>
              <div
                onClick={() => setParticipantsPopupOpen(true)}
                className="cursor-pointer hover:bg-primary/10 px-2 py-1 -my-1 rounded-xl transition-all group/part"
                title={`Click to view ${isLive || isEnded ? "participants" : "registered users"} list`}
              >
                <p className="text-xs font-bold text-outline uppercase tracking-wider group-hover/part:text-primary">
                  {isLive || isEnded ? "Participants" : "Registered"}
                </p>
                <p className="text-base font-extrabold text-primary">
                  {allParticipants.length}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-x-6 gap-y-4 mt-4">
              {roundStates.map((rs: RoundState, i: number) => {
                const rt = auction.roundTimes?.[rs.round - 1];
                const roundWinner = offers
                  .filter((b) => b.round === rs.round)
                  .sort((a, b) => b.amount - a.amount)[0];
                let winnerBuyer = typeof roundWinner?.buyer === "object" ? roundWinner.buyer : undefined;
                if (!winnerBuyer && i === roundStates.length - 1) {
                  const prevWinner = offers
                    .filter((b) => b.round === rs.round - 1)
                    .sort((a, b) => b.amount - a.amount)[0];
                  winnerBuyer = typeof prevWinner?.buyer === "object" ? prevWinner.buyer : undefined;
                }
                const buyerLabel = winnerBuyer
                  ? `${winnerBuyer.name || "—"} (${getCusId(winnerBuyer)})`
                  : "—";
                const startLocked = rs.status === "completed" || rs.status === "active" || rs.status === "paused";
                const endLocked = rs.status === "completed";
                const fmt = (t?: string) => t ? new Date(t).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
                return (
                <div
                  key={i}
                  onClick={() => setTimelineRound((prev) => (prev === rs.round ? null : rs.round))}
                  className={`flex-1 min-w-[170px] p-4 rounded-xl border text-center flex flex-col items-center justify-between gap-2 cursor-pointer hover:shadow-md hover:ring-1 hover:ring-primary/20 transition-all ${
                    timelineRound === rs.round
                      ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                      : i + 1 === auction.currentRound
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-outline-variant/20 bg-surface-container-low"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    {getRoundStatusBadge(rs.status)}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-on-surface">Round {rs.round}</p>
                    <div>
                      <p className="text-[10px] font-bold text-outline uppercase tracking-wider">
                        {i === roundStates.length - 1 ? "Final Highest Offer" : "Highest Offer"}
                      </p>
                      <p className="text-base font-extrabold font-mono text-primary">
                        {rs.highestOffer ? formatINR(rs.highestOffer) : "--"}
                      </p>
                    </div>
                    <p className="text-[10px] font-semibold text-outline">Total Offers: {offers.filter((b) => b.round === rs.round).length}</p>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 w-full">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 rounded-full text-[10px] font-semibold text-primary">
                      {i === roundStates.length - 1 ? (
                        <span className="text-2xl leading-none">👑</span>
                      ) : (
                        <span className="material-symbols-outlined text-xs">person</span>
                      )}
                      <span>Highest Offer: {buyerLabel}</span>
                    </span>
                  </div>

                  <div className="w-full space-y-1 pt-2 mt-1 border-t border-outline-variant/20 text-[10px] font-medium text-on-surface-variant">
                    <p className="flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[9px]">timer</span>
                      Start: {fmt(rt?.start)}
                    </p>
                    <p className="flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[9px]">timer</span>
                      End: {fmt(rt?.end)}
                    </p>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {isEnded && auction.winner && (() => {
          let winnerObj: { _id?: string; name?: string; phone?: string; email?: string; cusId?: string } | undefined =
            typeof auction.winner === "object" ? auction.winner : undefined;
          if (!winnerObj || (!winnerObj.cusId && !winnerObj.name)) {
            const highestOfferObj = offers.slice().sort((a, b) => b.amount - a.amount)[0];
            if (highestOfferObj && typeof highestOfferObj.buyer === "object") {
              winnerObj = highestOfferObj.buyer;
            }
          }
          return (
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
          );
        })()}

        <div className="bg-white rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider">Offer Timeline</h3>
              <p className="text-[10px] text-on-surface-variant mt-0.5">
                {timelineRound === null
                  ? `Round ${currentRound} (current)`
                  : `Round ${timelineRound}`} · {timelineOffers.length} {timelineOffers.length === 1 ? "offer" : "offers"}
              </p>
            </div>
            {isEnded ? (
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-outline" />
                Ended
              </span>
            ) : (
              <span className={`flex items-center gap-1.5 text-[10px] font-bold ${wsConnected ? "text-emerald-600" : "text-on-surface-variant"}`}>
                <span className={`w-2 h-2 rounded-full ${wsConnected ? "bg-emerald-500 animate-pulse" : "bg-outline"}`} />
                {wsConnected ? "Live" : "Connecting..."}
              </span>
            )}
          </div>

          {timelineOffers.length === 0 ? (
            <p className="py-6 text-center text-xs text-on-surface-variant">No offers yet</p>
          ) : (
            <div className="max-h-[420px] overflow-y-auto pr-1 no-scrollbar space-y-2">
              {timelineOffers.map((offer, idx) => {
                const buyer = buyerOf(offer);
                const rawPhone = buyer?.phone ? buyer.phone.replace(/\D/g, "") : "";
                const waLink = rawPhone ? `https://wa.me/${rawPhone}` : null;
                return (
                  <div key={offer._id || idx} className="relative flex gap-3 pb-3 border-b border-outline-variant/15 last:border-0 last:pb-0">
                    <div className="flex flex-col items-center shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/10 mt-1" />
                      {idx < timelineOffers.length - 1 && <span className="w-0.5 flex-1 bg-outline-variant/30 mt-1" />}
                    </div>
                    <div className="flex-1 min-w-0 py-0.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-bold text-on-surface truncate">
                          {buyer?.name || "Unknown"}
                          <span className="font-medium text-on-surface-variant font-mono">
                            {" "}({getCusId(buyer)})
                          </span>
                          {buyer?.phone && (
                            <span className="ml-2 font-semibold text-emerald-700 text-[10px] inline-flex items-center gap-0.5">
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
                        </p>
                        <span className="shrink-0 px-2 py-0.5 bg-primary/10 rounded-md text-[10px] font-bold text-primary">
                          Round {offer.round}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs">
                        <span className="font-extrabold font-mono text-primary text-sm">{formatINR(offer.amount)}</span>
                        <span className="text-[10px] text-on-surface-variant">
                          · {offer.createdAt
                            ? new Date(offer.createdAt).toLocaleString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {(auction.rules || (auction.whatsappGroups && auction.whatsappGroups.length > 0)) && (
          <div className="bg-white rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/20">
              <span className="material-symbols-outlined text-primary text-xl">description</span>
              <h3 className="text-xs font-bold uppercase tracking-wider">Auction Rules & Groups</h3>
            </div>
            {auction.rules && <p className="text-xs text-on-surface-variant leading-relaxed">{auction.rules}</p>}
            {auction.whatsappGroups && auction.whatsappGroups.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {auction.whatsappGroups.map((g, i: number) => (
                  <div key={i} className="border border-outline-variant/30 rounded-xl p-3 space-y-1">
                    <p className="text-[10px] font-extrabold text-primary uppercase tracking-wider">WhatsApp Group {i + 1}</p>
                    <p className="text-xs text-on-surface-variant break-all">{g.link || "—"}</p>
                    <p className="text-[10px] text-outline">Members: {g.limit || "—"} · Notify: {g.notifyBefore || "—"} min before</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {participantsPopupOpen && (
        <ParticipantsPopup
          title={isLive || isEnded ? "Auction Participants" : "Registered Users"}
          participants={allParticipants}
          onClose={() => setParticipantsPopupOpen(false)}
        />
      )}
    </div>
  );
}
