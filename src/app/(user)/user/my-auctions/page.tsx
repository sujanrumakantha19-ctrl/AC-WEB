"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { ImageWithGallery } from "@/components/ui/image-with-gallery";
import { ListSkeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { useGetMyAuctionsQuery } from "@/services/user-api";
import type { MyAuctionSummary } from "@/services/user-api";

const PAGE_SIZE = 12;

export default function MyAuctionsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetMyAuctionsQuery();

  const auctions: MyAuctionSummary[] = data?.auctions || [];
  const totalItems = auctions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const paginatedAuctions = auctions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const won = auctions.filter((a) => a.isWon).length;
  const lost = auctions.filter((a) => a.status === "ENDED" && !a.isWon).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-on-surface">My Auctions</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Auctions you have participated in or unlocked access to.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="success">{won} Won</Badge>
          <Badge variant="secondary">{lost} Not Won</Badge>
        </div>
      </div>

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : auctions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <span className="material-symbols-outlined text-4xl text-outline">history</span>
          <h3 className="text-base font-extrabold text-on-surface">No Auctions Yet</h3>
          <p className="text-xs text-on-surface-variant">
            Auctions you participate in will show up here with your offer history.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedAuctions.map((a) => (
              <div
                key={a.id}
                onClick={() => router.push(`/user/my-auctions/${a.id}`)}
                className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
              >
                <div className="relative h-44 overflow-hidden bg-black/5">
                  <ImageWithGallery
                    src={a.image}
                    alt={a.title}
                    images={a.images}
                    imgClassName="group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 z-10">
                    {a.status === "LIVE" ? (
                      <Badge variant="live" pulse>LIVE</Badge>
                    ) : a.isWon ? (
                      <Badge variant="success">WON</Badge>
                    ) : a.status === "ENDED" ? (
                      <Badge variant="secondary">NOT WON</Badge>
                    ) : (
                      <Badge variant="warning">UPCOMING</Badge>
                    )}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                      {a.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between mt-1.5">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-primary text-white rounded-lg shadow-sm font-semibold">
                      <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Lot ID :</span>
                      <span className="font-mono text-sm font-extrabold">{a.lotNumber}</span>
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-medium">
                      {new Date(a.startTime || a.endTime || Date.now()).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2.5 text-[11px] text-on-surface-variant font-medium">
                    <span className="bg-surface-container-low px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">speed</span>
                      {a.rounds} Round{a.rounds > 1 ? "s" : ""}
                    </span>
                    <span className="bg-surface-container-low px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">gavel</span>
                      {a.totalOffers} Offers
                    </span>
                  </div>

                  <div className="pt-3 mt-3 border-t border-outline-variant/30 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Current Offer</p>
                      <p className="text-base font-extrabold text-primary leading-tight">{formatINR(a.currentOffer || a.startingOffer)}</p>
                    </div>
                    {a.isWon && a.winningOffer ? (
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Winning Offer</p>
                        <p className="text-sm font-extrabold text-emerald-700 leading-tight">{formatINR(a.winningOffer)}</p>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                        View Details <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            onPageChange={(newPage) => {
              setPage(newPage);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </>
      )}
    </div>
  );
}