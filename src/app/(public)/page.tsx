import React from "react";
import { DomainAuctionCard } from "@/components/domain/auction/auction-card";
import { PublicHero } from "@/components/layout/public/public-hero-carousel";
import { getAuctions } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PublicHomePage() {
  const auctions = await getAuctions({ limit: 20 });
  const liveAuctions = auctions.filter((a: any) => a.status === "LIVE");
  const upcomingAuctions = auctions.filter((a: any) => a.status === "UPCOMING");

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <PublicHero />

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
