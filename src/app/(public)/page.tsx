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
      <section className="relative min-h-[400px] lg:min-h-[460px] w-full overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/40 z-10" />
<Image
            className="w-full h-full object-cover"
            src="/uploads/auction-9.jpg"
            alt="Mahindra Thar and Tata Harrier"
            priority
            fill
            sizes="100vw"
          />
        </div>

        <div className="relative z-20 max-w-container-max mx-auto px-4 md:px-8 w-full grid grid-cols-1 md:grid-cols-2 gap-8 py-8 pb-0">
          <div className="space-y-4">
            <span className="inline-block px-3.5 py-1 rounded-full bg-white/10 text-white border border-white/20 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
              Premium Automotive Marketplace
            </span>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
              Your Gateway to <br />
              <span className="text-on-primary-container">Luxury Road Icons</span>
            </h1>

            <p className="text-xs md:text-sm text-white/90 max-w-md leading-relaxed">
              Experience the thrill of acquiring premium SUVs, luxury sedans, and executive vehicles through India&apos;s most trusted offering platform.
            </p>

            {/* CTA */}
            <div className="mt-2">
              <Link href="/login?redirect=/auctions">
                <button className="px-8 py-3 bg-white hover:bg-white/90 text-primary font-extrabold text-sm rounded-xl shadow-lg transition-all active:scale-95">
                  Explore Auctions
                </button>
              </Link>
            </div>
          </div>

          <div className="self-end">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary-container shrink-0">
                  <span className="material-symbols-outlined text-base">gavel</span>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-primary">2,500+</p>
                  <p className="text-[9px] text-on-surface-variant font-medium">Successful Auctions</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary-container shrink-0">
                  <span className="material-symbols-outlined text-base">payments</span>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-primary">₹450 Cr+</p>
                  <p className="text-[9px] text-on-surface-variant font-medium">Transaction Volume</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary-container shrink-0">
                  <span className="material-symbols-outlined text-base">verified_user</span>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-primary">99.8%</p>
                  <p className="text-[9px] text-on-surface-variant font-medium">Certified Inspection Score</p>
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
            Featured Auction
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveAuctions.map((auction: any) => (
            <DomainAuctionCard key={auction.id} auction={auction} targetHref={`/login?redirect=/user/live/${auction.id}`} ctaText="Login to Offer" />
          ))}
        </div>
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
