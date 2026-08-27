"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { UpcomingCountdown } from "@/components/ui/upcoming-countdown";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAuctionQuery } from "@/services/auctions-api";
import { useGetMeQuery } from "@/services/auth-api";

export function AuctionDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  const [selectedImg, setSelectedImg] = useState("");

  const { data: auctionData, isLoading } = useGetAuctionQuery(id);
  const { data: meData } = useGetMeQuery();

  const auction = auctionData?.auction;
  const registered = !!meData?.user?.paidAccessAuctions?.some((a) => a.toString() === id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-24" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="text-center py-20">
        <span className="material-symbols-outlined text-5xl text-outline">directions_car</span>
        <p className="mt-3 text-sm font-bold text-on-surface">Vehicle not found</p>
        <Link href="/user/auctions" className="inline-block mt-4 text-xs text-primary font-bold">
          ← Back to Auctions
        </Link>
      </div>
    );
  }

  const isParkingSale = !!auction.isParkingSale;
  const isLive = auction.status === "LIVE";
  const hasAccess = isParkingSale || registered || !!auction.hasAccess;

  const allImages: string[] = [...(auction.images || [])];
  if (allImages.length === 0 && auction.image) allImages.push(auction.image);
  const activeImg = selectedImg || allImages[0] || "";

  const currentRound = auction.currentRound || 1;
  const roundOneStart = auction.roundTimes?.[0]?.start || auction.startTime;
  const roundEnd = auction.roundTimes?.[currentRound - 1]?.end || auction.endTime;

  const specs: { label: string; value: string; icon: string }[] = [
    { label: "Model", value: `${auction.make || "-"} ${auction.model || "-"}`, icon: "directions_car" },
    { label: "Year", value: String(auction.year || "-"), icon: "calendar_month" },
    { label: "Mileage", value: `${(auction.mileage || 0).toLocaleString("en-IN")} km`, icon: "speed" },
    { label: "Fuel Type", value: auction.fuelType || "-", icon: "local_gas_station" },
    { label: "Transmission", value: auction.transmission || "-", icon: "settings" },
    { label: "Location", value: auction.location || "-", icon: "location_on" },
    { label: "Engine", value: auction.engine || "-", icon: "power" },
    { label: "Colour", value: auction.color || "-", icon: "palette" },
    { label: "Ownership", value: auction.ownership || "-", icon: "person" },
    { label: "Insurance", value: auction.insurance || "-", icon: "verified_user" },
    { label: "Inspection", value: auction.inspectionScore ? `${auction.inspectionScore}/10` : "-", icon: "fact_check" },
    { label: "Seller", value: auction.verifiedSeller ? `${auction.seller || "VKS Autoservices"} ✓` : auction.seller || "-", icon: "storefront" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/user/auctions" className="flex items-center gap-1 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors shrink-0">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back
        </Link>
        <h1 className="text-lg font-extrabold text-on-surface truncate">{auction.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image gallery */}
        <div className="bg-white rounded-2xl shadow-xs p-3">
          <div className="relative h-72 md:h-80 rounded-xl overflow-hidden bg-black/5">
            <img src={activeImg} alt={auction.title} className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 z-10">
              <Badge variant={isLive ? "live" : "warning"} pulse={isLive}>
                {isLive ? "LIVE" : "UPCOMING"}
              </Badge>
            </div>
            {allImages.length > 1 && (
              <span className="absolute bottom-3 right-3 z-10 bg-black/70 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                {allImages.indexOf(activeImg) + 1} / {allImages.length}
              </span>
            )}
          </div>

          {allImages.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
              {allImages.map((img) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setSelectedImg(img)}
                  className={`h-16 w-24 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    activeImg === img ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={auction.title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl shadow-xs p-6 flex flex-col">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-primary text-white rounded-lg shadow-sm font-semibold">
              <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Lot ID :</span>
              <span className="font-mono text-sm font-extrabold">{auction.lotNumber}</span>
            </span>
          </div>

          <h1 className="text-xl font-extrabold text-on-surface mt-3">{auction.title}</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
            {specs.map((s) => (
              <div key={s.label} className="flex items-center gap-2.5 bg-surface-container-low rounded-lg px-3 py-2">
                <span className="material-symbols-outlined text-primary text-lg shrink-0">{s.icon}</span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{s.label}</p>
                  <p className="text-xs font-bold text-on-surface mt-0.5 truncate" title={s.value}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {auction.description && (
            <p className="text-xs text-on-surface-variant leading-relaxed mt-4">{auction.description}</p>
          )}

          {isLive ? (
            <div className="mt-3 flex items-center justify-between bg-error/5 border border-error/20 rounded-lg px-3 py-2.5">
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Round {currentRound} ends in
                </p>
                <UpcomingCountdown startTime={roundEnd} className="text-sm text-error" />
              </div>
              <span className="material-symbols-outlined text-error text-xl">timer</span>
            </div>
          ) : (
            <div className="mt-3 flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-3 py-2.5">
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Starts in</p>
                <UpcomingCountdown startTime={roundOneStart} className="text-sm text-primary" />
              </div>
              <span className="material-symbols-outlined text-primary text-xl">schedule</span>
            </div>
          )}

          <div className="flex-1" />

          <div className="border-t border-outline-variant/30 pt-4 mt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-on-surface-variant mb-0.5">Starting offer price</p>
                <p className="text-xl font-extrabold text-primary">{formatINR(auction.currentOffer || auction.startingOffer)}</p>
              </div>
              {!isParkingSale && (
                <div className="text-right">
                  <p className="text-[10px] text-on-surface-variant mb-0.5">Registration fee</p>
                  <p className="text-sm font-bold text-on-surface">{formatINR(auction.registrationFee || 0)}</p>
                </div>
              )}
            </div>

            {hasAccess ? (
              isLive ? (
                <button
                  onClick={() => router.push(`/user/live/${id}`)}
                  className="w-full py-3 bg-primary hover:bg-secondary text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  Place Offer
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3 bg-surface-container-high text-on-surface-variant rounded-xl text-xs font-bold cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Registered
                </button>
              )
            ) : (
              <button
                onClick={() => router.push(`/register/payment?redirect=/user/live/${id}`)}
                className="w-full py-3 bg-primary hover:bg-secondary text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
              >
                {isLive ? "Participate" : "Register"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
