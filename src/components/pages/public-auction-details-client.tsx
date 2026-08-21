"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import { AuctionDetailSkeleton } from "@/components/ui/skeleton";
import { useGetAuctionQuery } from "@/services/auctions-api";

export function PublicAuctionDetailsClient({ id }: { id: string }) {
  const { data, isLoading } = useGetAuctionQuery(id);
  const auction = data?.auction;

  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    if (auction?.image) setSelectedImage(auction.image);
  }, [auction?.image]);

  if (isLoading) {
    return <AuctionDetailSkeleton />;
  }

  if (!auction) {
    return <AuctionDetailSkeleton />;
  }

  const isParkingSale = !!auction.isParkingSale;

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-unit-lg w-full space-y-unit-lg">
      <div className="flex items-center gap-2 text-label-sm text-on-surface-variant">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link href="/auctions" className="hover:text-primary">Auctions</Link>
        <span>/</span>
        <span className="text-on-surface font-semibold truncate">{auction.title}</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/20 pb-unit-md">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {isParkingSale ? (
              <Badge variant={auction.status === "LIVE" ? "live" : "warning"} pulse={auction.status === "LIVE"}>
                {auction.status === "LIVE" ? "PARKING SALE LIVE" : "PARKING SALE"}
              </Badge>
            ) : (
              <>
                <Badge variant="live" pulse>LIVE AUCTION</Badge>
                <Badge variant="success">Reserve Met</Badge>
              </>
            )}
            <span className="text-label-sm text-outline">{auction.lotNumber}</span>
          </div>
          <h1 className="text-2xl md:text-headline-lg font-bold text-on-surface">
            {auction.title}
          </h1>
          <p className="text-body-md text-on-surface-variant">
            📍 {auction.location} • Verified Seller: {auction.seller}
          </p>
        </div>

        <Link href={`/user/live/${auction.id}`}>
          <Button variant="primary" size="lg" className="w-full md:w-auto">
            <span className="material-symbols-outlined mr-2">sensors</span>
            Enter Live Offer Room
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-unit-xl">
        <div className="lg:col-span-2 space-y-unit-lg">
          <div className="space-y-3">
            <div className="h-[420px] w-full rounded-2xl overflow-hidden bg-black/5 card-shadow">
              <img
                src={selectedImage}
                alt={auction.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {(auction.images || []).map((imgUrl: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`w-24 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === imgUrl
                      ? "border-primary-container scale-95"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-unit-lg rounded-2xl card-shadow space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">verified</span>
                <span>150-Point Inspection Report</span>
              </h3>
              <span className="text-display-md font-bold text-emerald-600">
                {auction.inspectionScore}/10
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Engine & Transmission", score: "9.6/10" },
                { label: "Body & Paintwork", score: "9.2/10" },
                { label: "Brakes & Suspension", score: "9.5/10" },
                { label: "Electricals & AC", score: "9.4/10" },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-surface-container-low rounded-xl text-center space-y-1">
                  <p className="text-xs text-outline">{item.label}</p>
                  <p className="text-label-md font-bold text-on-surface">{item.score}</p>
                </div>
              ))}
            </div>
          </div>

          {auction.description && (
            <div className="bg-white p-unit-lg rounded-2xl card-shadow space-y-3">
              <h3 className="text-headline-md font-bold text-on-surface">Description</h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed">{auction.description}</p>
            </div>
          )}

          <div className="bg-white p-unit-lg rounded-2xl card-shadow">
            <h3 className="text-headline-md font-bold text-on-surface mb-4">Vehicle Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Variant", value: auction.variant },
                { label: "Fuel Type", value: auction.fuelType },
                { label: "Transmission", value: auction.transmission },
                { label: "Mileage", value: auction.mileage ? `${auction.mileage.toLocaleString("en-IN")} km` : undefined },
                { label: "Year", value: auction.year?.toString() },
                { label: "Make", value: auction.make },
                { label: "Model", value: auction.model },
                { label: "Registration Fee", value: auction.registrationFee ? formatINR(auction.registrationFee) : undefined },
                { label: "Offer Access Fee", value: auction.offerUnlockFee ? formatINR(auction.offerUnlockFee) : undefined },
                { label: "Starting Offer", value: auction.startingOffer ? formatINR(auction.startingOffer) : undefined },
              ].filter(s => s.value).map((spec, idx) => (
                <div key={idx} className="p-3.5 bg-surface-container-low rounded-xl space-y-1">
                  <p className="text-[10px] font-bold uppercase text-outline">{spec.label}</p>
                  <p className="text-sm font-bold text-on-surface">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>

          {auction.rules && (
            <div className="bg-white p-unit-lg rounded-2xl card-shadow space-y-3">
              <h3 className="text-headline-md font-bold text-on-surface">Auction Rules</h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-line">{auction.rules}</p>
            </div>
          )}

          {isParkingSale ? (
            <div className="bg-white p-unit-lg rounded-2xl card-shadow space-y-3">
              <h3 className="text-headline-md font-bold text-on-surface">Parking Sale</h3>
              <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
                <span className="text-sm font-bold text-on-surface">
                  {auction.status === "LIVE" ? "Sale in progress" : "Sale starts"}
                </span>
                <span className="text-xs text-on-surface-variant">
                  {auction.startTime ? new Date(auction.startTime).toLocaleString() : "—"}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Quotes are accepted until the admin ends the sale.
              </p>
            </div>
          ) : auction.rounds && auction.roundTimes && auction.roundTimes.length > 0 && (
            <div className="bg-white p-unit-lg rounded-2xl card-shadow space-y-3">
              <h3 className="text-headline-md font-bold text-on-surface">Round Schedule ({auction.rounds} Rounds)</h3>
              <div className="space-y-2">
                {auction.roundTimes.map((round: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
                    <span className="text-sm font-bold text-on-surface">Round {idx + 1}</span>
                    <span className="text-xs text-on-surface-variant">
                      {round.start ? new Date(round.start).toLocaleString() : "TBA"} — {round.end ? new Date(round.end).toLocaleString() : "TBA"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {auction.whatsappGroups && auction.whatsappGroups.length > 0 && (
            <div className="bg-white p-unit-lg rounded-2xl card-shadow space-y-3">
              <h3 className="text-headline-md font-bold text-on-surface">WhatsApp Groups</h3>
              <div className="space-y-2">
                {auction.whatsappGroups.map((group: any, idx: number) => (
                  <a
                    key={idx}
                    href={group.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-green-600">groups</span>
                      <span className="text-sm font-bold text-on-surface">Group {idx + 1}</span>
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {group.limit ? `Up to ${group.limit} members` : ""}
                      {group.notifyBefore ? ` • Notify ${group.notifyBefore} min before` : ""}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-unit-md">
          <div className="bg-white p-unit-lg rounded-2xl card-shadow space-y-6 sticky top-24">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
              <div>
                <p className="text-xs text-outline">Starting offer price</p>
                <p className="text-3xl font-extrabold text-primary">
                  {formatINR(auction.currentOffer || auction.startingOffer)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-outline">
                  {isParkingSale ? (auction.status === "LIVE" ? "Sale Status" : "Sale Starts") : "Time Remaining"}
                </p>
                <p className="text-label-md font-bold text-tertiary-container animate-pulse-accent">
                  {isParkingSale
                    ? auction.status === "LIVE"
                      ? "In Progress"
                      : auction.startTime
                        ? new Date(auction.startTime).toLocaleString()
                        : "—"
                    : `⏱ ${auction.endTime}`}
                </p>
              </div>
            </div>

            <Link href={`/user/live/${auction.id}`}>
              <Button variant="primary" size="lg" className="w-full text-base font-bold shadow-lg">
                {isParkingSale ? "Sign In & Quote Now" : "Sign In & Offer Now"} ({formatINR((auction.currentOffer || auction.startingOffer) + 10000)})
              </Button>
            </Link>

            <div className="text-xs text-outline text-center">
              Protected by VKS Autoservices Escrow Guarantee
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
