"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { ImageWithGallery } from "@/components/ui/image-with-gallery";
import { RoundCountdown } from "@/components/ui/round-countdown";
import { UpcomingCountdown } from "@/components/ui/upcoming-countdown";
import { AuctionGridSkeleton } from "@/components/ui/skeleton";
import { useLazyGetAuctionsQuery, useGetAuctionsQuery } from "@/services/auctions-api";
import { useGetMeQuery } from "@/services/auth-api";

const PAGE_SIZE = 12;

type Tab = "live" | "upcoming";

export default function UserAuctionsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("live");
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [getAuctions] = useLazyGetAuctionsQuery();
  const { data: liveCountData } = useGetAuctionsQuery({ status: "LIVE", limit: 1 });
  const { data: upcomingCountData } = useGetAuctionsQuery({ status: "UPCOMING", limit: 1 });
  const { data: meData } = useGetMeQuery();

  const tabCounts: Record<Tab, number> = {
    live: liveCountData?.total || 0,
    upcoming: upcomingCountData?.total || 0,
  };

  const accessedAuctions = useMemo(
    () => (meData?.user?.paidAccessAuctions || []).map((a) => a.toString()),
    [meData]
  );

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t === "upcoming" || t === "live") setTab(t);
  }, []);

  const loadPage = useCallback(
    async (t: Tab, p: number) => {
      const res = await getAuctions({ status: t.toUpperCase(), limit: PAGE_SIZE, page: p });
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
    loadPage(tab, 1)
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
  }, [tab, loadPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const list = await loadPage(tab, nextPage);
      setItems((prev) => {
        const seen = new Set(prev.map((i: any) => String(i._id || i.id)));
        return [...prev, ...list.filter((i: any) => !seen.has(String(i._id || i.id)))];
      });
      setPage(nextPage);
      setHasMore(list.length === PAGE_SIZE);
    } catch {
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, loading, page, tab, loadPage]);

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
  }, [hasMore, loadingMore, loading, page, tab, loadMore]);

  const renderCard = (a: any) => {
    const id = a._id || a.id;
    const isLive = tab === "live";
    const registered = accessedAuctions.includes(String(id)) || !!a.hasAccess;
    return (
      <div
        key={String(id)}
        onClick={() => router.push(`/user/auctions/${id}`)}
        className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
      >
        <div className="relative h-44 w-full overflow-hidden bg-black/5">
          <ImageWithGallery
            src={a.image}
            alt={a.title}
            images={a.images}
            imgClassName="group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2.5 left-2.5 z-10">
            <Badge variant={isLive ? "live" : "warning"} pulse={isLive}>
              {isLive ? "LIVE" : "UPCOMING"}
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
            {isLive && (
              <RoundCountdown
                roundTimes={a.roundTimes}
                currentRound={a.currentRound}
                status="LIVE"
                className="mt-2 text-xs"
              />
            )}
          </div>

          <div className="flex items-center justify-between pt-3 mt-3 border-t border-outline-variant/30">
            {isLive ? (
              <>
                <div>
                  <p className="text-[10px] text-on-surface-variant mb-0.5">Starting offer price</p>
                  <p className="text-sm font-extrabold text-primary">{formatINR(a.currentOffer || a.startingOffer)}</p>
                </div>
                {registered ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push(`/user/live/${id}`); }}
                    className="bg-primary text-white text-xs px-4 py-1.5 rounded-lg font-bold hover:bg-secondary transition-colors shadow-xs"
                  >
                    Place Offer
                  </button>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push(`/register/payment?redirect=/user/live/${id}`); }}
                    className="bg-primary text-white text-xs px-4 py-1.5 rounded-lg font-bold hover:bg-secondary transition-colors shadow-xs"
                  >
                    Participate
                  </button>
                )}
              </>
            ) : (
              <>
                <div>
                  <p className="text-[10px] text-on-surface-variant mb-0.5">Starts in</p>
                  <UpcomingCountdown startTime={a.startTime} className="text-xs text-on-surface" />
                </div>
                {registered ? (
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
                    onClick={(e) => { e.stopPropagation(); router.push(`/register/payment?redirect=/user/live/${id}`); }}
                    className="bg-primary text-white text-xs px-4 py-1.5 rounded-lg font-bold hover:bg-secondary transition-colors shadow-xs"
                  >
                    Register
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">Auctions</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Live and upcoming automotive auctions. Browse curated premium vehicles and place your offers.
          </p>
        </div>
        <div className="flex gap-1.5 bg-surface-container-low p-1 rounded-xl w-fit">
          {(["live", "upcoming"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={[
                "px-5 py-2 rounded-lg text-xs font-bold transition-all",
                tab === t ? "bg-primary text-white shadow-xs" : "text-on-surface-variant hover:text-on-surface",
              ].join(" ")}
            >
              {t === "live" ? "Live" : "Upcoming"} <span className="opacity-60">({tabCounts[t]})</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <AuctionGridSkeleton count={6} />
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-outline">directions_car</span>
          <p className="mt-3 text-sm font-bold text-on-surface">No {tab} auctions right now</p>
          <p className="text-xs text-on-surface-variant mt-1">
            {tab === "live"
              ? "New live auctions will appear here as soon as they start."
              : "Check back soon for upcoming auctions."}
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((a: any) => renderCard(a))}
        </section>
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
