"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { ImageWithGallery } from "@/components/ui/image-with-gallery";
import { AuctionGridSkeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { useGetAuctionsQuery } from "@/services/auctions-api";
import type { SerializedAuction } from "@/types";

const PAGE_SIZE = 12;

export default function AdminCompletedAuctionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [parkingOnly, setParkingOnly] = useState(false);
  const [page, setPage] = useState(1);

  const queryParams = useMemo(() => {
    return {
      status: "ENDED",
      parkingSale: parkingOnly ? true : undefined,
      search: searchQuery.trim() || undefined,
      page,
      limit: PAGE_SIZE,
    };
  }, [parkingOnly, searchQuery, page]);

  const { data, isLoading } = useGetAuctionsQuery(queryParams);
  const auctions = data?.auctions || [];
  const totalItems = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);
  };

  const handleParkingToggle = () => {
    setParkingOnly((v) => !v);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <input
            className="h-9 rounded-xl px-3 text-xs font-medium max-w-xs w-full border border-primary focus:outline-none focus:border-primary"
            placeholder="Search by title or lot ID..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <button
            onClick={handleParkingToggle}
            className={`h-9 px-3 rounded-xl text-xs font-bold border transition-all whitespace-nowrap cursor-pointer ${parkingOnly ? "border-primary bg-primary/10 text-primary" : "border-outline-variant/40 text-on-surface-variant hover:border-primary"}`}
          >
            Parking Sale
          </button>
        </div>
        <Badge variant="secondary" className="!bg-primary !text-white border border-primary">{totalItems} Completed</Badge>
      </div>

      {isLoading ? (
        <AuctionGridSkeleton count={6} />
      ) : auctions.length === 0 ? (
        <div className="p-10 text-center text-sm text-on-surface-variant bg-white rounded-2xl">No completed auctions found</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((a: SerializedAuction) => (
              <div key={a._id || a.id} className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
                <div className="relative h-48 w-full overflow-hidden bg-black/5">
                  <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none flex flex-col items-start gap-1.5">
                    <Badge variant="secondary">ENDED</Badge>
                    {a.isParkingSale && <Badge variant="new">Parking Sale</Badge>}
                  </div>
                  <ImageWithGallery src={a.image || ""} alt={a.title} images={a.images} imgClassName="group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors" title={a.title}>{a.title}</h3>
                    <div className="flex justify-between items-center mt-1.5">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-primary text-white rounded-lg shadow-sm font-semibold">
                        <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Lot ID :</span>
                        <span className="font-mono text-sm font-extrabold">{a.lotNumber}</span>
                      </span>
                      <span className="bg-surface-container-low px-2 py-0.5 rounded-md flex items-center gap-1 text-[11px] text-on-surface-variant font-medium">
                        <span className="material-symbols-outlined text-xs">location_on</span>
                        {a.location}
                      </span>
                    </div>
                  </div>
                  <div className="pt-3 mt-3 border-t border-outline-variant/20 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Winning Offer</p>
                      <p className="text-base font-extrabold text-primary leading-tight">{formatINR(a.currentOffer || a.startingOffer)}</p>
                      <p className="text-[10px] text-outline mt-0.5">{a.totalOffers} Offers Placed</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Ended On</p>
                        <p className="text-sm font-bold text-on-surface">
                          {a.endTime ? new Date(a.endTime).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </p>
                      </div>
                      <Link href={`/admin/auctions/${a._id || a.id}/details?from=/admin/auctions/completed`}>
                        <button className="px-4 py-2 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer">
                          Details
                        </button>
                      </Link>
                    </div>
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
