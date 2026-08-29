"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { ImageWithGallery } from "@/components/ui/image-with-gallery";
import { RoundCountdown } from "@/components/ui/round-countdown";
import { AuctionGridSkeleton } from "@/components/ui/skeleton";
import { useGetAuctionsQuery } from "@/services/auctions-api";
import type { SerializedAuction } from "@/types";

export default function AdminLivePage() {
  const { data, isLoading } = useGetAuctionsQuery({ status: "LIVE", limit: 20 });
  const liveAuctions = (data?.auctions || []).filter((a) => a.status === "LIVE" && !a.isParkingSale);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-xs text-on-surface-variant">{liveAuctions.length} active</span>
      </div>

      {isLoading ? (
        <AuctionGridSkeleton count={6} />
      ) : liveAuctions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center space-y-2">
          <span className="material-symbols-outlined text-4xl text-outline">sensors_off</span>
          <p className="text-sm font-bold text-on-surface">No live auctions</p>
          <p className="text-xs text-on-surface-variant">Create and start auctions from the admin panel</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {liveAuctions.map((a: SerializedAuction) => (
          <div key={a._id} className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
            <div className="relative h-48 w-full overflow-hidden bg-black/5">
              <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
                <Badge variant="live" pulse>LIVE</Badge>
              </div>
              <ImageWithGallery
                src={a.image || ""}
                alt={a.title}
                images={a.images}
                imgClassName="group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors" title={a.title}>
                  {a.title}
                </h3>

                <div className="flex justify-between items-center mt-1.5">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-primary text-white rounded-lg shadow-sm font-semibold">
                    <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Lot ID :</span>
                    <span className="font-mono text-sm font-extrabold">{a.lotNumber}</span>
                  </span>
                  <span className="bg-surface-container-low px-2 py-0.5 rounded-md flex items-center gap-1 text-[11px] text-on-surface-variant font-medium">
                    <span className="material-symbols-outlined text-xs">location_on</span>
                    {a.location}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2.5 text-[11px] text-on-surface-variant font-medium">
                  <span className="bg-surface-container-low px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">speed</span>
                    {a.mileage?.toLocaleString()} km
                  </span>
                  <span className="bg-surface-container-low px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">local_gas_station</span>
                    {a.fuelType}
                  </span>
                  <span className="bg-surface-container-low px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">settings</span>
                    {a.transmission}
                  </span>
                </div>
                <RoundCountdown roundTimes={a.roundTimes} currentRound={a.currentRound} status={a.status} className="mt-2 text-xs" />
              </div>

              <div className="pt-3 mt-3 border-t border-outline-variant/20 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Current Offer</p>
                  <p className="text-base font-extrabold text-primary leading-tight">{formatINR(a.currentOffer || a.startingOffer)}</p>
                  <p className="text-[10px] text-outline mt-0.5">{a.totalOffers} Offers Placed</p>
                </div>

                <div className="flex gap-2">
                  <Link href={`/admin/auctions/live/${a._id}`}>
                    <button className="px-4 py-2 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95">
                      Details
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
