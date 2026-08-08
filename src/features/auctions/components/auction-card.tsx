import React from "react";
import Link from "next/link";
import { AuctionItem } from "@/data/mock/auctions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import { ImageWithGallery } from "@/components/ui/image-with-gallery";

export interface AuctionCardProps {
  auction: AuctionItem;
}

export function AuctionCard({ auction }: AuctionCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden card-shadow flex flex-col justify-between group">
      {/* Top Image Box */}
      <div className="relative h-56 w-full overflow-hidden bg-surface-container-high">
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-center pointer-events-none">
          <Badge variant={auction.status === "LIVE" ? "live" : "secondary"} pulse={auction.status === "LIVE"}>
            {auction.status === "LIVE" ? `LIVE: ${auction.endTime}` : auction.status}
          </Badge>
        </div>

        <ImageWithGallery
          src={auction.image}
          alt={auction.title}
          images={auction.images}
          imgClassName="group-hover:scale-105 transition-transform duration-300"
        />

        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-1 pointer-events-none">
          <span className="material-symbols-outlined text-sm text-emerald-400">verified</span>
          <span>Score: {auction.inspectionScore}/10</span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-unit-lg flex-1 flex flex-col justify-between space-y-unit-md">
        <div>
          <div className="flex justify-between items-center text-xs text-on-surface-variant mb-1">
            <span className="font-semibold text-primary-container">{auction.lotNumber}</span>
            <span>{auction.location}</span>
          </div>

          <h3 className="text-headline-md font-headline-md text-on-surface line-clamp-1 group-hover:text-primary-container transition-colors">
            {auction.title}
          </h3>

          <p className="text-label-sm text-on-surface-variant mt-1 line-clamp-1">
            {auction.variant}
          </p>

          {/* Key Specs Pills */}
          <div className="flex flex-wrap gap-2 mt-3 text-xs text-on-surface-variant">
            <span className="bg-surface-container px-2.5 py-1 rounded-md flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-sm">speed</span>
              {auction.mileage.toLocaleString()} km
            </span>
            <span className="bg-surface-container px-2.5 py-1 rounded-md flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-sm">local_gas_station</span>
              {auction.fuelType}
            </span>
            <span className="bg-surface-container px-2.5 py-1 rounded-md flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-sm">settings</span>
              {auction.transmission}
            </span>
          </div>
        </div>

        {/* Offering & Price Info Footer */}
        <div className="pt-unit-md border-t border-outline-variant/20 flex items-center justify-between">
          <div>
            <p className="text-label-sm text-on-surface-variant">Starting offer price</p>
            <p className="text-headline-md font-bold text-primary">
              {formatINR(auction.currentOffer || auction.startingOffer)}
            </p>
            <p className="text-xs text-outline">{auction.totalOffers} Offers Placed</p>
          </div>

          <Link href={auction.status === "LIVE" ? `/live/${auction.id}` : `/auctions/${auction.id}`}>
            <Button variant={auction.status === "LIVE" ? "primary" : "outline"} size="md">
              {auction.status === "LIVE" ? "Offer Now" : "View Auction"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
