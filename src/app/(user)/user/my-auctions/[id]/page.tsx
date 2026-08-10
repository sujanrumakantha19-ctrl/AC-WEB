"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { ImageWithGallery } from "@/components/ui/image-with-gallery";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { useGetAuctionQuery } from "@/services/auctions-api";
import { useGetOffersQuery } from "@/services/offers-api";

export default function MyAuctionDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: auctionData, isLoading } = useGetAuctionQuery(id, { skip: !id });
  const { data: offersData } = useGetOffersQuery({ auction: id }, { skip: !id });

  const auction = auctionData?.auction;
  const offers = offersData?.offers || [];

  if (isLoading || !id) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 space-y-4">
          <SkeletonText className="w-40" />
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <div className="bg-white rounded-2xl p-5 space-y-3">
          <SkeletonText className="w-14" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="text-center py-20">
        <span className="material-symbols-outlined text-5xl text-outline">directions_car</span>
        <p className="mt-3 text-sm font-bold text-on-surface">Auction not found</p>
        <Link href="/user/my-auctions" className="inline-block mt-4 text-xs text-primary font-bold">
          ← Back to My Auctions
        </Link>
      </div>
    );
  }

  const roundStates = auction.roundStates || [];
  const rounds = Array.from({ length: auction.rounds || 1 }, (_, i) => {
    const offersInRound = offers.filter((o) => o.round === i + 1);
    const myOffer = offersInRound.length > 0 ? Math.max(...offersInRound.map((o) => Number(o.amount))) : null;
    return {
      round: i + 1,
      state: roundStates[i],
      rt: auction.roundTimes?.[i],
      myOffer,
    };
  });

  const fmt = (t?: string) => t ? new Date(t).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

  const isEnded = auction.status === "ENDED";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/user/my-auctions" className="flex items-center gap-1 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors shrink-0">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          My Auctions
        </Link>
        <h1 className="text-lg font-extrabold text-on-surface truncate">{auction.title}</h1>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden shadow-xs group flex flex-col md:flex-row">
        <div className="md:w-96 shrink-0 flex flex-col">
          <div className="relative h-56 md:h-64 overflow-hidden bg-black/5">
            <div className="absolute top-2.5 left-2.5 z-10">
              {auction.status === "LIVE" ? (
                <Badge variant="live" pulse>LIVE</Badge>
              ) : isEnded ? (
                <Badge variant="secondary">ENDED</Badge>
              ) : (
                <Badge variant="warning">UPCOMING</Badge>
              )}
            </div>
            <ImageWithGallery
              src={auction.image || ""}
              alt={auction.title}
              images={auction.images}
              imgClassName="group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="px-4 py-2 border-t border-outline-variant/20">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-primary text-white rounded-lg shadow-sm font-semibold">
                <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Lot ID :</span>
                <span className="font-mono text-sm font-extrabold">{auction.lotNumber}</span>
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">location_on</span>
              {auction.location}
            </p>
          </div>
        </div>

        <div className="px-6 pb-6 pt-2 flex-1 flex flex-col justify-between space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-surface-container-low rounded-xl">
            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Starting Offer</p>
              <p className="text-sm font-extrabold text-primary">{formatINR(auction.startingOffer)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Current Offer</p>
              <p className="text-sm font-extrabold text-primary">{formatINR(auction.currentOffer || auction.startingOffer)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Rounds</p>
              <p className="text-sm font-extrabold">{auction.rounds}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-wider">My Offers</p>
              <p className="text-sm font-extrabold">{offers.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Start</p>
              <p className="text-sm font-bold text-on-surface mt-0.5">{fmt(auction.roundTimes?.[0]?.start || auction.startTime)}</p>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <p className="text-[10px] font-bold uppercase tracking-wider text-outline">End</p>
              <p className="text-sm font-bold text-on-surface mt-0.5">{fmt(auction.endTime)}</p>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Result</p>
              <p className="text-sm font-bold text-on-surface mt-0.5">
                {isEnded ? (auction.winner ? "✓ Won" : "Not Won") : auction.status === "LIVE" ? "In Progress" : "Upcoming"}
              </p>
            </div>
          </div>

          {auction.description && (
            <p className="text-xs text-on-surface-variant leading-relaxed">{auction.description}</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold">My Offers by Round</h2>
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider">{rounds.length} Round{rounds.length > 1 ? "s" : ""}</span>
        </div>
        {rounds.length === 0 ? (
          <p className="text-xs text-center py-4 text-on-surface-variant">No round data available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {rounds.map((r) => (
              <div
                key={r.round}
                className={`p-4 rounded-xl border text-center flex flex-col justify-between gap-2 ${
                  r.state?.status === "active"
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "bg-surface-container-low border-outline-variant/20"
                }`}
              >
                <div>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-xs font-bold text-on-surface">Round {r.round}</p>
                    {r.state && (
                      <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                        {r.state.status}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-wider mt-2">My Offer</p>
                  <p className={`text-lg font-extrabold font-mono ${r.myOffer ? "text-primary" : "text-outline"}`}>
                    {r.myOffer ? formatINR(r.myOffer) : "No Offer"}
                  </p>
                </div>
                <div className="pt-2 border-t border-outline-variant/20 space-y-1 text-[10px] text-on-surface-variant font-medium">
                  <p>Start: {fmt(r.rt?.start)}</p>
                  <p>End: {fmt(r.rt?.end)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}