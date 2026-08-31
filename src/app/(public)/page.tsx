import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { DomainAuctionCard } from "@/components/domain/auction/auction-card";
import { PublicHero } from "@/components/layout/public/public-hero-carousel";
import { getAuctions } from "@/lib/data";
import type { SerializedAuction } from "@/types";

export const dynamic = "force-dynamic";

export default async function PublicHomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = token ? await verifyToken(token) : null;

  if (payload) {
    if (payload.role === "admin" || payload.role === "superadmin") {
      redirect("/admin/dashboard");
    } else {
      redirect("/user/dashboard");
    }
  }

  const auctions: SerializedAuction[] = await getAuctions({ limit: 50 });

  const liveAuctions = auctions.filter((a) => a.status === "LIVE" && !a.isParkingSale);
  const parkingAuctions = auctions.filter((a) => a.isParkingSale && a.status === "LIVE");
  const upcomingAuctions = auctions.filter((a) => a.status === "UPCOMING");

  const hasAnyAuctions = liveAuctions.length > 0 || parkingAuctions.length > 0 || upcomingAuctions.length > 0;

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Section */}
      <PublicHero />

      <div className="max-w-container-max mx-auto px-4 md:px-8 space-y-14">
        {/* 2. Live Auctions Section */}
        {liveAuctions.length > 0 && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                  <span className="text-[11px] font-extrabold text-red-600 uppercase tracking-widest">
                    Happening Right Now
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
                  Featured Live Auctions ({liveAuctions.length})
                </h2>
              </div>

              <Link
                href="/auctions"
                className="text-xs sm:text-sm font-bold text-primary hover:text-secondary flex items-center gap-1 transition-colors"
              >
                <span>View All Auctions</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveAuctions.slice(0, 6).map((auction) => (
                <DomainAuctionCard
                  key={auction.id || auction._id}
                  auction={auction}
                  targetHref={`/login?redirect=/user/live/${auction.id || auction._id}`}
                  ctaText="Login to Offer"
                />
              ))}
            </div>
          </section>
        )}

        {/* 3. Parking Sales Section */}
        {parkingAuctions.length > 0 && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-[11px] font-extrabold text-purple-700 uppercase tracking-widest">
                  Direct Parking Sales
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight mt-1">
                  Exclusive Parking Sales ({parkingAuctions.length})
                </h2>
              </div>

              <Link
                href="/auctions"
                className="text-xs sm:text-sm font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 transition-colors"
              >
                <span>View All Parking Sales</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parkingAuctions.slice(0, 6).map((auction) => (
                <DomainAuctionCard
                  key={auction.id || auction._id}
                  auction={auction}
                  targetHref={`/auctions/${auction.id || auction._id}`}
                  ctaText="Free Quote"
                />
              ))}
            </div>
          </section>
        )}

        {/* 4. Upcoming Auctions Section */}
        {upcomingAuctions.length > 0 && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-amber-600 text-sm">calendar_month</span>
                  <span className="text-[11px] font-extrabold text-amber-600 uppercase tracking-widest">
                    Scheduled Lots
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
                  Upcoming Auctions ({upcomingAuctions.length})
                </h2>
              </div>

              <Link
                href="/auctions"
                className="text-xs sm:text-sm font-bold text-primary hover:text-secondary flex items-center gap-1 transition-colors"
              >
                <span>Browse Scheduled Lots</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingAuctions.slice(0, 6).map((auction) => (
                <DomainAuctionCard
                  key={auction.id || auction._id}
                  auction={auction}
                  targetHref={`/auctions/${auction.id || auction._id}`}
                  ctaText="View Details"
                />
              ))}
            </div>
          </section>
        )}

        {/* 5. Empty State (if no live or upcoming vehicles) */}
        {!hasAnyAuctions && (
          <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-outline-variant/30 shadow-xs max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-xs">
              <span className="material-symbols-outlined text-3xl">directions_car</span>
            </div>
            <h3 className="text-xl font-extrabold text-on-surface">Vehicle Lots Coming Soon</h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              There are currently no active auctions published in the database. New verified vehicle lots are cataloged and listed regularly.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link href="/register">
                <button className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-sm hover:bg-secondary transition-all">
                  Register for Alerts
                </button>
              </Link>
              <Link href="/about">
                <button className="px-5 py-2.5 bg-surface-container-low text-on-surface text-xs font-bold rounded-xl hover:bg-surface-container transition-all">
                  About Platform
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* 6. Why Choose Us / Trust Badges */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-outline-variant/30 shadow-xs space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-extrabold text-primary uppercase tracking-widest">
              Built on Trust &amp; Transparency
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface">
              Why Buyers Choose VKS Autoservices
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              We provide complete peace of mind with detailed vehicle diagnostics, verified documentation, and secure transaction workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">fact_check</span>
              </div>
              <h3 className="text-sm font-extrabold text-on-surface">150-Point Inspection</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Every vehicle undergoes rigorous multi-point mechanical, structural, and electrical diagnostics.
              </p>
            </div>

            <div className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">verified_user</span>
              </div>
              <h3 className="text-sm font-extrabold text-on-surface">Verified Documents</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                RC status, insurance validity, hypothecation clearances, and owner details verified before listing.
              </p>
            </div>

            <div className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">gavel</span>
              </div>
              <h3 className="text-sm font-extrabold text-on-surface">Fair Multi-Round Bidding</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Transparent round-by-round offering structure ensures genuine offers and honest market pricing.
              </p>
            </div>

            <div className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">support_agent</span>
              </div>
              <h3 className="text-sm font-extrabold text-on-surface">Buyer Coordination</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                End-to-end guidance from our dedicated automotive team for smooth vehicle inspection and transfer.
              </p>
            </div>
          </div>
        </section>

        {/* 7. How It Works Section */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-extrabold text-primary uppercase tracking-widest">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface">
              How to Participate in Auctions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-outline-variant/30 shadow-xs relative space-y-3">
              <div className="w-8 h-8 rounded-full bg-primary text-white text-xs font-extrabold flex items-center justify-center">
                1
              </div>
              <h3 className="text-base font-bold text-on-surface">Create Verified Account</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Sign up in minutes with your name, WhatsApp number, and contact details to get your unique Customer ID.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-outline-variant/30 shadow-xs relative space-y-3">
              <div className="w-8 h-8 rounded-full bg-primary text-white text-xs font-extrabold flex items-center justify-center">
                2
              </div>
              <h3 className="text-base font-bold text-on-surface">Inspect &amp; Unlock Access</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Browse high-resolution photo galleries, view 150-point inspection scores, and unlock live offer rooms.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-outline-variant/30 shadow-xs relative space-y-3">
              <div className="w-8 h-8 rounded-full bg-primary text-white text-xs font-extrabold flex items-center justify-center">
                3
              </div>
              <h3 className="text-base font-bold text-on-surface">Place Offers &amp; Win</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Submit competitive offers during timed rounds. Highest verified offers secure vehicle allotment with support.
              </p>
            </div>
          </div>
        </section>

        {/* 8. Call to Action Banner */}
        <section className="bg-gradient-to-r from-primary via-primary/95 to-secondary rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">
              Ready to Discover Your Next Vehicle?
            </h2>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-xl mx-auto">
              Join thousands of buyers exploring certified used vehicles and luxury road icons across India.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/register">
              <button className="px-8 py-3 bg-white text-primary font-extrabold text-xs sm:text-sm rounded-xl shadow-lg hover:bg-white/90 transition-all active:scale-95">
                Register for Free
              </button>
            </Link>
            <Link href="/auctions">
              <button className="px-8 py-3 bg-white/15 text-white font-extrabold text-xs sm:text-sm rounded-xl border border-white/30 backdrop-blur-sm hover:bg-white/25 transition-all active:scale-95">
                Explore Vehicle Lots
              </button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}