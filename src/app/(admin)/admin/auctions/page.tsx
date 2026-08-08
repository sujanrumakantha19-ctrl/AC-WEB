"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import { ImageWithGallery } from "@/components/ui/image-with-gallery";
import { AuctionGridSkeleton } from "@/components/ui/skeleton";
import { useLazyGetAuctionsQuery, useGetAuctionsQuery } from "@/services/auctions-api";
import type { SerializedAuction } from "@/types";

const PAGE_SIZE = 12;

type FilterStatus = "ALL" | "LIVE" | "UPCOMING";

export default function AdminAllAuctionsPage() {
  const searchParams = useSearchParams();
  const initialStatus = (searchParams.get("status") || "ALL").toUpperCase();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>(
    ["ALL", "LIVE", "UPCOMING"].includes(initialStatus) ? (initialStatus as FilterStatus) : "ALL"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<SerializedAuction[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [getAuctions] = useLazyGetAuctionsQuery();
  const { data: liveCountData } = useGetAuctionsQuery({ status: "LIVE", limit: 1 });
  const { data: upcomingCountData } = useGetAuctionsQuery({ status: "UPCOMING", limit: 1 });

  const tabCounts = {
    ALL: (liveCountData?.total || 0) + (upcomingCountData?.total || 0),
    LIVE: liveCountData?.total || 0,
    UPCOMING: upcomingCountData?.total || 0,
  };

  const loadPage = useCallback(
    async (s: FilterStatus, p: number) => {
      const res = await getAuctions({ status: s === "ALL" ? undefined : s, limit: PAGE_SIZE, page: p });
      return res.data?.auctions || [];
    },
    [getAuctions]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setItems([]);
    setPage(1);
    setHasMore(false);
    loadPage(filterStatus, 1)
      .then((list) => {
        if (cancelled) return;
        setItems(list);
        setHasMore(list.length === PAGE_SIZE);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filterStatus, loadPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const list = await loadPage(filterStatus, nextPage);
      setItems((prev) => {
        const seen = new Set(prev.map((i) => String(i._id || i.id)));
        return [...prev, ...list.filter((i) => !seen.has(String(i._id || i.id)))];
      });
      setPage(nextPage);
      setHasMore(list.length === PAGE_SIZE);
    } catch {
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, loading, page, filterStatus, loadPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "300px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loadingMore, loading, page, filterStatus, loadMore]);

  const filtered = items.filter((item: SerializedAuction) => {
    if (item.status === "ENDED") return false;
    return !searchQuery || item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || item.lotNumber?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-primary tracking-tight">All Auctions</h1>
        <p className="text-sm text-on-surface-variant mt-1">Browse and manage live and upcoming auctions.</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-nowrap bg-surface-container rounded-full p-1 whitespace-nowrap overflow-x-auto">
          {(["ALL", "LIVE", "UPCOMING"] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filterStatus === s ? "bg-white shadow-sm text-primary" : "text-on-surface-variant hover:text-primary"}`}>
              {s === "ALL" ? "All" : s} <span className="opacity-60">({tabCounts[s]})</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input className="h-9 rounded-xl px-3 text-xs font-medium max-w-xs w-full border border-outline-variant/40 focus:outline-none focus:border-primary" placeholder="Search by title or lot ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <Link href="/admin/auctions/create">
            <Button variant="primary" size="sm" className="rounded-full whitespace-nowrap">
              <span className="material-symbols-outlined text-sm mr-1">add_circle</span>
              Create New
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <AuctionGridSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <div className="p-10 text-center text-sm text-on-surface-variant bg-white rounded-2xl">No auctions found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((a: SerializedAuction) => (
            <div key={a._id || a.id} className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
              <div className="relative h-48 w-full overflow-hidden bg-black/5">
                <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
                  <Badge variant={a.status === "LIVE" ? "live" : a.status === "UPCOMING" ? "warning" : "secondary"} pulse={a.status === "LIVE"}>{a.status}</Badge>
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
                  <div className="flex flex-wrap gap-1.5 mt-2.5 text-[11px] text-on-surface-variant font-medium">
                    <span className="bg-surface-container-low px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">speed</span>
                      {a.mileage?.toLocaleString()} km
                    </span>
                    <span className="bg-surface-container-low px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">local_gas_station</span>
                      {a.fuelType}
                    </span>
                    <span className="bg-surface-container-low px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">settings</span>
                      {a.transmission}
                    </span>
                  </div>
                  {a.description && (
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mt-2">{a.description}</p>
                  )}
                </div>
                <div className="pt-3 mt-3 border-t border-outline-variant/20 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Starting offer price</p>
                    <p className="text-base font-extrabold text-primary leading-tight">{formatINR(a.currentOffer || a.startingOffer)}</p>
                    <p className="text-[10px] text-outline mt-0.5">{a.totalOffers} Offers Placed</p>
                  </div>
                  <Link href={a.status === "LIVE" ? `/admin/auctions/live/${a._id || a.id}?from=/admin/auctions` : `/admin/auctions/${a._id || a.id}/details?from=/admin/auctions`}>
                    <button className="px-4 py-2 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95">
                      Details
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="flex justify-center py-4">
        {loadingMore && (
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Loading more...
          </div>
        )}
      </div>
    </div>
  );
}
