"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { ImageWithGallery } from "@/components/ui/image-with-gallery";
import { RoundCountdown } from "@/components/ui/round-countdown";
import { AuctionGridSkeleton } from "@/components/ui/skeleton";
import { useGetAuctionsQuery } from "@/services/auctions-api";
import { useGetMeQuery } from "@/services/auth-api";

export default function UserLiveAuctionsOverviewPage() {
  const router = useRouter();

  const { data: meData } = useGetMeQuery();
  const { data: auctionsData, isLoading } = useGetAuctionsQuery({ status: "LIVE", limit: 100 });

  const accessedAuctions = useMemo(
    () => (meData?.user?.paidAccessAuctions || []).map((a) => a.toString()),
    [meData]
  );

  const liveCars = (auctionsData?.auctions || []).filter((a) => a.status === "LIVE");
  const ongoingCars = liveCars.filter(
    (car) => accessedAuctions.includes(String(car._id || car.id)) || car.hasAccess
  );
  const loading = isLoading;

  if (loading) {
    return <AuctionGridSkeleton count={6} />;
  }

  if (ongoingCars.length === 1) {
    const id = ongoingCars[0]._id || ongoingCars[0].id;
    router.replace(`/user/live/${id}`);
    return <AuctionGridSkeleton count={6} />;
  }

  const renderCard = (a: any) => {
    const id = a._id || a.id;
    return (
      <div
        key={String(id)}
        className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
      >
        <div className="relative h-44 w-full overflow-hidden bg-black/5">
          <ImageWithGallery
            src={a.image}
            alt={a.title}
            images={a.images}
            imgClassName="group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2.5 left-2.5 z-10">
            <Badge variant="live" pulse>
              LIVE
            </Badge>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <div className="flex-1">
            <h4 className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">
              {a.title}
            </h4>
            <div className="flex justify-between items-center mt-1.5">
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-primary text-white rounded-lg shadow-sm font-semibold">
                <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Lot ID :</span>
                <span className="font-mono text-sm font-extrabold">{a.lotNumber}</span>
              </span>
              <span className="bg-surface-container-low px-2 py-0.5 rounded-md flex items-center gap-1 text-[11px] text-on-surface-variant font-medium">
                <span className="material-symbols-outlined text-xs">location_on</span>
                {a.location || "Various"}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2.5 text-[11px] text-on-surface-variant font-medium">
              <span className="bg-surface-container-low px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">calendar_month</span> {a.year}
              </span>
              <span className="bg-surface-container-low px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">speed</span> {a.mileage?.toLocaleString("en-IN")} km
              </span>
              <span className="bg-surface-container-low px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">local_gas_station</span> {a.fuelType}
              </span>
              <span className="bg-surface-container-low px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">settings</span> {a.transmission}
              </span>
            </div>
            {a.description && (
              <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mt-2">{a.description}</p>
            )}
            <RoundCountdown
              roundTimes={a.roundTimes}
              currentRound={a.currentRound}
              status="LIVE"
              className="mt-2 text-xs"
            />
          </div>

          <div className="flex items-center justify-between pt-3 mt-3 border-t border-outline-variant/30">
            <div>
              <p className="text-[10px] text-on-surface-variant mb-0.5">Starting offer price</p>
              <p className="text-sm font-extrabold text-primary">{formatINR(a.currentOffer || a.startingOffer)}</p>
            </div>
            <Link href={`/user/live/${id}`}>
              <button className="bg-primary text-white text-xs px-4 py-1.5 rounded-lg font-bold hover:bg-secondary transition-colors shadow-xs">
                Place Offer
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-primary tracking-tight">Auction Room</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Ongoing auctions you are registered for. Click a lot to enter its live auction room.
        </p>
      </div>

      {ongoingCars.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-4">lock</span>
          <p className="text-on-surface-variant font-medium">No ongoing auctions right now</p>
          <p className="text-xs text-on-surface-variant mt-1">
            Auctions you register for will appear here as soon as they go live.
          </p>
          <Link href="/user/auctions?tab=live">
            <button className="mt-4 bg-primary text-white text-sm px-6 py-2.5 rounded-xl font-bold hover:bg-secondary transition-all">
              Browse Auctions
            </button>
          </Link>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {ongoingCars.map((a: any) => renderCard(a))}
        </section>
      )}
    </div>
  );
}
