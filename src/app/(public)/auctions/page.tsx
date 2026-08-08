"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { ImageWithGallery } from "@/components/ui/image-with-gallery";
import { CountdownBadge } from "@/components/ui/countdown-badge";
import { AuctionGridSkeleton } from "@/components/ui/skeleton";
import { useGetAuctionsQuery } from "@/services/auctions-api";
import type { SerializedAuction } from "@/types";

export default function PublicAuctionsPage() {
  const [filter, setFilter] = useState<"ALL" | "VERIFIED">("ALL");

  const { data, isLoading } = useGetAuctionsQuery({ limit: 50 });
  const auctions = data?.auctions || [];

  const filteredAuctions = auctions.filter((a: SerializedAuction) => {
    if (filter === "VERIFIED") return a.verifiedSeller;
    return true;
  });

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-10 space-y-10">
      <header className="max-w-container-max mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-primary tracking-tight">
              Upcoming Auctions
            </h1>
            <p className="text-base text-on-surface-variant mt-2 max-w-2xl">
              Upcoming premium automotive auctions. Browse through our curated selection of luxury and heritage vehicles arriving soon.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-surface-container rounded-full p-1">
              <button
                onClick={() => setFilter("ALL")}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  filter === "ALL"
                    ? "bg-surface shadow-sm text-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                All Listings
              </button>
              <button
                onClick={() => setFilter("VERIFIED")}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  filter === "VERIFIED"
                    ? "bg-surface shadow-sm text-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                Verified Only
              </button>
            </div>
          </div>
        </div>
      </header>

      {isLoading ? (
        <AuctionGridSkeleton count={6} />
      ) : (
      <section className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAuctions.map((a: SerializedAuction) => (
          <div
            key={a._id || a.id}
            className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="relative h-48 w-full overflow-hidden bg-black/5">
              <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex justify-between items-center pointer-events-none">
                <Badge variant={a.status === "LIVE" ? "live" : a.status === "UPCOMING" ? "warning" : "secondary"} pulse={a.status === "LIVE"}>
                  {a.status === "LIVE" ? `LIVE` : a.status}
                </Badge>
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
                {a.description && (
                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mt-2">{a.description}</p>
                )}
                {a.status !== "LIVE" && (
                  <div className="mt-2">
                    <CountdownBadge startTime={a.startTime} className="text-xs" />
                  </div>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-outline-variant/20 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Starting offer price</p>
                  <p className="text-base font-extrabold text-primary leading-tight">
                    {formatINR(a.currentOffer || a.startingOffer)}
                  </p>
                  <p className="text-[10px] text-outline mt-0.5">{a.totalOffers} Offers Placed</p>
                </div>

                <Link href={`/login?redirect=/user/live/${a._id || a.id}`}>
                  <button className="px-4 py-2 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95">
                    Login to Offer
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>
      )}

      <div className="max-w-container-max mx-auto flex justify-center pt-4">
        <nav className="flex items-center gap-2 text-xs">
          <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-base">chevron_left</span>
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary text-on-primary font-bold">
            1
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors font-medium">
            2
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors font-medium">
            3
          </button>
          <span className="mx-1 text-on-surface-variant font-bold">...</span>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors font-medium">
            12
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
