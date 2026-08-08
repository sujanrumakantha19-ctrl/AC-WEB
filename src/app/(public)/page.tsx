import React from "react";
import Link from "next/link";
import Image from "next/image";
import { DomainAuctionCard } from "@/components/domain/auction/auction-card";
import { getAuctions } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PublicHomePage() {
  const auctions = await getAuctions({ limit: 20 });
  const liveAuctions = auctions.filter((a: any) => a.status === "LIVE");
  const upcomingAuctions = auctions.filter((a: any) => a.status === "UPCOMING");

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative min-h-[380px] md:min-h-[460px] w-full overflow-hidden flex items-center py-6 sm:py-8 md:py-10">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-primary/95 via-primary/90 to-primary/75 md:from-primary/95 md:via-primary/85 md:to-primary/40 z-10" />
          <Image
            className="w-full h-full object-cover object-center"
            src="/uploads/auction-9.jpg"
            alt="Mahindra Thar and Tata Harrier"
            priority
            fill
            sizes="100vw"
          />
        </div>

        <div className="relative z-20 max-w-container-max mx-auto px-4 md:px-8 w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-3 sm:space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-white border border-white/20 text-[10px] font-extrabold uppercase tracking-widest backdrop-blur-md">
              Premium Automotive Marketplace
            </span>

            <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Your Gateway to <br />
              <span className="text-on-primary-container">Luxury Road Icons</span>
            </h1>

            <p className="text-xs md:text-sm text-white/90 max-w-md leading-relaxed">
              Experience the thrill of acquiring premium SUVs, luxury sedans, and executive vehicles through India&apos;s most trusted offering platform.
            </p>

            {/* CTA */}
            <div className="pt-1">
              <Link href="/login?redirect=/auctions">
                <button className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white hover:bg-white/90 text-primary font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all active:scale-95">
                  Explore Auctions
                </button>
              </Link>
            </div>
          </div>

          <div className="self-end pt-2 md:pt-0">
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1.5 sm:gap-2.5 p-2 sm:p-3 bg-white/10 sm:bg-white backdrop-blur-md sm:backdrop-blur-none border border-white/15 sm:border-none rounded-xl text-white sm:text-on-surface shadow-xs">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white/20 sm:bg-primary-container/10 flex items-center justify-center text-white sm:text-primary-container shrink-0">
                  <span className="material-symbols-outlined text-sm sm:text-base">gavel</span>
                </div>
                <div>
                  <p className="text-xs sm:text-lg font-extrabold text-white sm:text-primary leading-tight">2,500+</p>
                  <p className="text-[9px] sm:text-[10px] text-white/80 sm:text-on-surface-variant font-medium leading-tight">Auctions</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1.5 sm:gap-2.5 p-2 sm:p-3 bg-white/10 sm:bg-white backdrop-blur-md sm:backdrop-blur-none border border-white/15 sm:border-none rounded-xl text-white sm:text-on-surface shadow-xs">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white/20 sm:bg-primary-container/10 flex items-center justify-center text-white sm:text-primary-container shrink-0">
                  <span className="material-symbols-outlined text-sm sm:text-base">payments</span>
                </div>
                <div>
                  <p className="text-xs sm:text-lg font-extrabold text-white sm:text-primary leading-tight">₹450 Cr+</p>
                  <p className="text-[9px] sm:text-[10px] text-white/80 sm:text-on-surface-variant font-medium leading-tight">Volume</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1.5 sm:gap-2.5 p-2 sm:p-3 bg-white/10 sm:bg-white backdrop-blur-md sm:backdrop-blur-none border border-white/15 sm:border-none rounded-xl text-white sm:text-on-surface shadow-xs">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white/20 sm:bg-primary-container/10 flex items-center justify-center text-white sm:text-primary-container shrink-0">
                  <span className="material-symbols-outlined text-sm sm:text-base">verified_user</span>
                </div>
                <div>
                  <p className="text-xs sm:text-lg font-extrabold text-white sm:text-primary leading-tight">99.8%</p>
                  <p className="text-[9px] sm:text-[10px] text-white/80 sm:text-on-surface-variant font-medium leading-tight">Inspection</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Auction Room */}
      <section className="py-10 max-w-container-max mx-auto px-4 md:px-8">
        <div className="mb-6">
          <span className="text-[11px] font-bold text-tertiary-container uppercase tracking-wider">
            Happening Right Now
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold text-on-surface mt-0.5">
            Featured Auctions
          </h2>
        </div>

        {liveAuctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveAuctions.map((auction: any) => (
              <DomainAuctionCard key={auction.id} auction={auction} targetHref={`/login?redirect=/user/live/${auction.id}`} ctaText="Login to Offer" />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center border border-outline-variant/30 shadow-xs max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">gavel</span>
            </div>
            <h3 className="text-base font-extrabold text-on-surface">No Live Auctions Right Now</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              There are currently no active live auctions in the database. Check back soon or create new lots from the Admin Panel!
            </p>
          </div>
        )}
      </section>

      {/* Upcoming Auctions */}
      {upcomingAuctions.length > 0 && (
        <section className="pb-10 max-w-container-max mx-auto px-4 md:px-8">
          <div className="mb-6">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
              Coming Soon
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-on-surface mt-0.5">
              Upcoming Auctions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingAuctions.map((auction: any) => (
              <DomainAuctionCard key={auction.id} auction={auction} targetHref={`/login?redirect=/auctions/${auction.id}`} ctaText="View Details" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
