"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { SpecChip } from "@/components/ui/spec-chip";
import { ImageWithGallery } from "@/components/ui/image-with-gallery";
import { RoundCountdown } from "@/components/ui/round-countdown";
import { UpcomingCountdown } from "@/components/ui/upcoming-countdown";
import { HeroCarousel } from "@/components/ui/hero-carousel";
import { AuctionGridSkeleton } from "@/components/ui/skeleton";
import { useGetAuctionsQuery } from "@/services/auctions-api";
import { useGetWinsCountQuery } from "@/services/user-api";
import { useGetMeQuery } from "@/services/auth-api";

const PROMO_SLIDES = [
  {
    image: "/uploads/carousel-1.jpg",
    title: "Live Auctions Are On",
    subtitle: "Place offers on premium pre-owned vehicles across India",
  },
  {
    image: "/uploads/carousel-2.jpg",
    title: "Verified & Inspected Vehicles",
    subtitle: "Every lot is quality-checked and certified before going live",
  },
  {
    image: "/uploads/carousel-3.jpg",
    title: "Start Offering Today",
    subtitle: "Register, get access, and place offers in transparent rounds from anywhere",
  },
];

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { data: meData } = useGetMeQuery();

  const { data: winsData, isLoading: winsLoading } = useGetWinsCountQuery();
  const { data: auctionsData, isLoading: auctionsLoading } = useGetAuctionsQuery({ limit: 20 });
  const { data: parkingData, isLoading: parkingLoading } = useGetAuctionsQuery({ parkingSale: true, limit: 10 });

  const loading = winsLoading || auctionsLoading || parkingLoading;
  const accessedAuctions = meData?.user?.paidAccessAuctions || [];

  const liveAuctions = auctionsData?.auctions.filter((a) => a.status === "LIVE" && !a.isParkingSale) || [];
  const upcomingAuctions = auctionsData?.auctions.filter((a) => a.status === "UPCOMING" && !a.isParkingSale) || [];
  const parkingAuctions = parkingData?.auctions || [];

  const liveCars = liveAuctions.map((a) => ({
    id: a.id || a._id,
    title: a.title,
    description: a.description,
    year: a.year,
    mileage: `${a.mileage?.toLocaleString("en-IN") || 0}km`,
    fuel: a.fuelType,
    currentOffer: a.currentOffer,
    startingOffer: a.startingOffer,
    image: a.image,
    images: a.images,
    roundTimes: a.roundTimes,
    currentRound: a.currentRound,
    status: a.status,
    lotNumber: a.lotNumber,
    location: a.location,
    transmission: a.transmission,
  }));

  const upcomingCars = upcomingAuctions.map((a) => ({
    id: a.id || a._id,
    title: a.title,
    description: a.description,
    year: a.year,
    mileage: `${a.mileage?.toLocaleString("en-IN") || 0}km`,
    fuel: a.fuelType,
    image: a.image,
    images: a.images,
    startTime: a.startTime,
    auctionDate: a.auctionDate || "Coming Soon",
    lotNumber: a.lotNumber,
    location: a.location,
    transmission: a.transmission,
  }));

  const parkingCars = parkingAuctions.map((a) => ({
    id: a.id || a._id,
    title: a.title,
    description: a.description,
    year: a.year,
    mileage: `${a.mileage?.toLocaleString("en-IN") || 0}km`,
    fuel: a.fuelType,
    image: a.image,
    images: a.images,
    currentOffer: a.currentOffer,
    startingOffer: a.startingOffer,
    status: a.status,
    lotNumber: a.lotNumber,
    location: a.location,
    transmission: a.transmission,
    isParkingSale: true,
  }));

  const renderSpecChips = (car: { year?: number; mileage?: string; fuel?: string; transmission?: string }) => (
    <div className="flex flex-wrap gap-1.5 mt-2.5 text-[11px] text-on-surface-variant font-medium">
      {car.year && <SpecChip icon="calendar_month">{car.year}</SpecChip>}
      {car.mileage && <SpecChip icon="speed">{car.mileage}</SpecChip>}
      {car.fuel && <SpecChip icon="local_gas_station">{car.fuel}</SpecChip>}
      {car.transmission && <SpecChip icon="settings">{car.transmission}</SpecChip>}
    </div>
  );

  const renderCardHeader = (car: { title: string; lotNumber?: string; location?: string }) => (
    <div className="flex-1">
      <h4 className="text-sm font-bold text-on-surface truncate">{car.title}</h4>
      <div className="flex justify-between items-center mt-1.5">
        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-primary text-white rounded-lg shadow-sm font-semibold">
          <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Lot ID :</span>
          <span className="font-mono text-sm font-extrabold">{car.lotNumber}</span>
        </span>
        <span className="bg-surface-container-low px-2 py-0.5 rounded-md flex items-center gap-1 text-[11px] text-on-surface-variant font-medium">
          <span className="material-symbols-outlined text-xs">location_on</span>
          {car.location || "Various"}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface">Welcome, {meData?.user?.name || "Member"} 👋</h1>
          <p className="text-xs text-on-surface-variant mt-1">Here's what's happening with your auctions today.</p>
        </div>
        <StatCard
          label="AUCTIONS WON"
          value={winsData?.count ?? 0}
          icon="workspace_premium"
          loading={winsLoading}
        />
      </div>

      {loading ? (
        <>
          <AuctionGridSkeleton count={3} />
          <AuctionGridSkeleton count={3} />
        </>
      ) : (
        <>
          {liveCars.length === 0 && upcomingCars.length === 0 && parkingCars.length === 0 && (
            <HeroCarousel slides={PROMO_SLIDES} />
          )}

          {parkingCars.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">directions_car</span>
                  <h3 className="text-base font-extrabold text-on-surface">Parking Sale ({parkingCars.length})</h3>
                </div>
                <Link href="/user/auctions?tab=parking" className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">
                  View All <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </Link>
              </div>

              <div className="flex overflow-x-auto gap-4 pb-2 scroll-smooth snap-x snap-proximity no-scrollbar scroll-container w-full">
                {parkingCars.map((car: any) => (
                  <div
                    key={car.id}
                    onClick={() => router.push(`/user/auctions/${car.id}`)}
                    className="min-w-[270px] md:min-w-[300px] max-w-[310px] bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between shrink-0 snap-start cursor-pointer"
                  >
                    <div className="relative h-44 overflow-hidden bg-black/5">
                      <ImageWithGallery
                        src={car.image}
                        alt={car.title}
                        images={car.images}
                        imgClassName="group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <Badge variant="new">Parking Sale</Badge>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      {renderCardHeader(car)}
                      {renderSpecChips(car)}
                      {car.description && (
                        <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mt-2">{car.description}</p>
                      )}

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-outline-variant/30">
                        <div>
                          <p className="text-[10px] text-on-surface-variant mb-0.5">Highest Quote</p>
                          <p className="text-sm font-extrabold text-purple-700">{formatINR(car.currentOffer || car.startingOffer)}</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); router.push(car.status === "LIVE" ? `/user/live/${car.id}` : `/user/auctions/${car.id}`); }}
                          className="bg-purple-700 text-white text-xs px-5 py-1.5 rounded-lg font-bold hover:bg-purple-800 transition-colors shadow-xs"
                        >
                          Free
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {liveCars.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  <h3 className="text-base font-extrabold text-on-surface">Live Auctions ({liveCars.length})</h3>
                </div>
                <Link href="/user/auctions?tab=live" className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">
                  View All <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </Link>
              </div>

              <div className="flex overflow-x-auto gap-4 pb-2 scroll-smooth snap-x snap-proximity no-scrollbar scroll-container w-full">
                {liveCars.map((car: any) => (
                  <div
                    key={car.id}
                    onClick={() => router.push(`/user/auctions/${car.id}`)}
                    className="min-w-[270px] md:min-w-[300px] max-w-[310px] bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between shrink-0 snap-start cursor-pointer"
                  >
                    <div className="relative h-44 overflow-hidden bg-black/5">
                      <ImageWithGallery
                        src={car.image}
                        alt={car.title}
                        images={car.images}
                        imgClassName="group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <Badge variant="live" pulse>LIVE</Badge>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      {renderCardHeader(car)}
                      {renderSpecChips(car)}
                      {car.description && (
                        <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mt-2">{car.description}</p>
                      )}
                      <RoundCountdown roundTimes={car.roundTimes} currentRound={car.currentRound} status={car.status} className="mt-2 text-xs" />

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-outline-variant/30">
                        <div>
                          <p className="text-[10px] text-on-surface-variant mb-0.5">Starting offer price</p>
                          <p className="text-sm font-extrabold text-primary">{formatINR(car.currentOffer || car.startingOffer)}</p>
                        </div>
                        {accessedAuctions.includes(car.id) ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push(`/user/live/${car.id}`); }}
                            className="bg-primary text-white text-xs px-4 py-1.5 rounded-lg font-bold hover:bg-secondary transition-colors shadow-xs"
                          >
                            Place Offer
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push(`/register/payment?redirect=/user/live/${car.id}`); }}
                            className="bg-primary text-white text-xs px-4 py-1.5 rounded-lg font-bold hover:bg-secondary transition-colors shadow-xs"
                          >
                            Participate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {upcomingCars.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">calendar_month</span>
                  <h3 className="text-base font-extrabold text-on-surface">Upcoming Auctions ({upcomingCars.length})</h3>
                </div>
                <Link href="/user/auctions?tab=upcoming" className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">
                  View All <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </Link>
              </div>

              <div className="flex overflow-x-auto gap-4 pb-2 scroll-smooth snap-x snap-proximity no-scrollbar scroll-container w-full">
                {upcomingCars.map((car: any) => (
                  <div
                    key={car.id}
                    onClick={() => router.push(`/user/auctions/${car.id}`)}
                    className="min-w-[270px] md:min-w-[300px] max-w-[310px] bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between shrink-0 snap-start cursor-pointer"
                  >
                    <div className="relative h-44 overflow-hidden bg-black/5">
                      <ImageWithGallery
                        src={car.image}
                        alt={car.title}
                        images={car.images}
                        imgClassName="group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <Badge variant="warning">UPCOMING</Badge>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      {renderCardHeader(car)}
                      {renderSpecChips(car)}
                      {car.description && (
                        <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mt-2">{car.description}</p>
                      )}

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-outline-variant/30">
                        <div>
                          <p className="text-[10px] text-on-surface-variant mb-0.5">Starts in</p>
                          <UpcomingCountdown startTime={car.startTime} className="text-xs text-on-surface" />
                        </div>
                        {accessedAuctions.includes(car.id) ? (
                          <button
                            disabled
                            onClick={(e) => e.stopPropagation()}
                            className="bg-surface-container-high text-on-surface-variant text-xs px-4 py-1.5 rounded-lg font-bold cursor-not-allowed flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Registered
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push(`/register/payment?redirect=/user/live/${car.id}`); }}
                            className="bg-primary text-white text-xs px-4 py-1.5 rounded-lg font-bold hover:bg-secondary transition-colors shadow-xs"
                          >
                            Register
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
