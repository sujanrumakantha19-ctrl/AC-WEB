import React from "react";
import Link from "next/link";
import type { SerializedAuction } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { ImageWithGallery } from "@/components/ui/image-with-gallery";
import { SpecChip } from "@/components/ui/spec-chip";

export interface DomainAuctionCardProps {
  auction: SerializedAuction;
  targetHref?: string;
  ctaText?: string;
  description?: string;
}

export function DomainAuctionCard({
  auction,
  targetHref,
  ctaText,
  description,
}: DomainAuctionCardProps) {
  const id = auction.id || auction._id;
  const defaultHref =
    auction.status === "LIVE" ? `/user/live/${id}` : `/auctions/${id}`;
  const href = targetHref || defaultHref;
  const buttonText = ctaText || "Offer Now";

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div className="relative h-48 w-full overflow-hidden bg-black/5">
        <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex justify-between items-center pointer-events-none">
          <Badge variant={auction.status === "LIVE" ? "live" : "secondary"} pulse={auction.status === "LIVE"}>
            {auction.status}
          </Badge>
        </div>

        <ImageWithGallery
          src={auction.image || ""}
          alt={auction.title}
          images={auction.images}
          imgClassName="group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 pointer-events-none">
          <span className="material-symbols-outlined text-xs text-emerald-400">verified</span>
          <span>Score: {auction.inspectionScore ?? 0}/10</span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="text-sm font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors" title={auction.title}>
            {auction.title}
          </h3>

          <div className="flex justify-between items-center mt-1.5">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-primary text-white rounded-lg shadow-sm font-semibold">
              <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Lot ID :</span>
              <span className="font-mono text-sm font-extrabold">{auction.lotNumber}</span>
            </span>
            {auction.location && (
              <SpecChip icon="location_on">{auction.location}</SpecChip>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2.5 text-[11px] text-on-surface-variant font-medium">
            {typeof auction.mileage === "number" && (
              <SpecChip icon="speed">{auction.mileage.toLocaleString("en-IN")} km</SpecChip>
            )}
            {auction.fuelType && <SpecChip icon="local_gas_station">{auction.fuelType}</SpecChip>}
            {auction.transmission && <SpecChip icon="settings">{auction.transmission}</SpecChip>}
          </div>
          {description && (
            <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mt-2">{description}</p>
          )}
        </div>

        <div className="pt-3 mt-3 border-t border-outline-variant/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Starting offer price</p>
            <p className="text-base font-extrabold text-primary leading-tight">
              {formatINR(auction.currentOffer || auction.startingOffer)}
            </p>
            {typeof auction.totalOffers === "number" && (
              <p className="text-[10px] text-outline mt-0.5">{auction.totalOffers} Offers Placed</p>
            )}
          </div>

          <Link href={href}>
            <button className="px-4 py-2 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95">
              {buttonText}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
