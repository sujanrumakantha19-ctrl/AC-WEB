"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { useGetLiveAnalyticsQuery } from "@/services/admin-api";
import { formatINR } from "@/lib/utils";
import { useCountdown } from "@/lib/use-countdown";

export function LiveAuctionGraph() {
  const { data, isLoading } = useGetLiveAnalyticsQuery(undefined, {
    pollingInterval: 8000,
  });

  const active = data?.active;
  const progression = data?.offerProgression || [];

  const endTime = active?.endTime;
  const countdown = useCountdown(endTime);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xs p-6 space-y-4">
        <div className="h-4 w-52 bg-surface-container-low rounded-md animate-pulse" />
        <div className="h-56 w-full bg-surface-container-low rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!active) {
    return (
      <div className="bg-white rounded-2xl shadow-xs p-8 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-2xl">sensors_off</span>
        </div>
        <h3 className="text-sm font-extrabold">No Live Auction Right Now</h3>
        <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
          When an auction goes live, its real-time offer activity will appear here.
        </p>
      </div>
    );
  }

  const chartData = progression.length > 0
    ? progression.map((p, idx) => ({
        ...p,
        idx,
      }))
    : [{ time: "—", amount: active.startingOffer, round: 1, idx: 0 }];

  const previousOffer = progression[progression.length - 1]?.amount || active.startingOffer;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      {/* Active auction card */}
      <div className="bg-white rounded-2xl shadow-xs overflow-hidden">
        {active.image && (
          <div className="h-32 w-full relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={active.image} alt={active.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-red-500 text-white text-[9px] font-extrabold tracking-widest uppercase flex items-center gap-1 shadow">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-accent" />
              LIVE
            </span>
            <div className="absolute bottom-2 left-3 right-3 text-white">
              <p className="text-[9px] font-bold text-white/80 font-mono">{active.lotNumber}</p>
              <p className="text-sm font-extrabold leading-tight">{active.title}</p>
            </div>
          </div>
        )}

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Current Highest</p>
              <p className="text-lg font-extrabold text-primary">{formatINR(active.currentOffer)}</p>
              <p className="text-[10px] text-on-surface-variant">from {formatINR(active.startingOffer)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Total Offers</p>
              <p className="text-lg font-extrabold">{active.totalOffers}</p>
              <p className="text-[10px] text-on-surface-variant">by {data?.participantCount || 0} players</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-outline-variant/20 pt-3">
            <div>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Ends In</p>
              {countdown ? (
                <p className="text-base font-extrabold text-red-600 font-mono">
                  {String(countdown.hours).padStart(2, "0")}:
                  {String(countdown.minutes).padStart(2, "0")}:
                  {String(countdown.seconds).padStart(2, "0")}
                </p>
              ) : (
                <p className="text-sm font-bold">--:--:--</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Round</p>
              <p className="text-base font-extrabold">R{active.currentRound}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Offer progression graph */}
      <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-extrabold">Offer Progression · Live Now</h3>
            <p className="text-[11px] text-on-surface-variant">Latest offer every time a participant places one</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-extrabold text-primary">{formatINR(previousOffer)}</p>
            <p className="text-[10px] text-on-surface-variant font-medium">Highest Offer</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 8, left: -6, bottom: 0 }}>
              <defs>
                <linearGradient id="offerLineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                domain={["dataMin - 50000", "dataMax + 50000"]}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `₹${(v / 100000).toFixed(1)}L`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                  boxShadow: "0 4px 12px rgba(15,76,129,0.08)",
                }}
                labelStyle={{ fontWeight: 700 }}
                formatter={(value) => [formatINR(Number(value)), "Offer"]}
                labelFormatter={(label, payload) => {
                  const p = payload?.[0]?.payload as { round?: number } | undefined;
                  return `${label} · ${p?.round ? `Round ${p.round}` : ""}`;
                }}
              />
              <ReferenceLine
                y={active.startingOffer}
                stroke="#94a3b8"
                strokeDasharray="4 4"
                label={{ value: "Base", position: "insideBottomRight", fontSize: 9, fill: "#94a3b8" }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#f43f5e"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#f43f5e", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                fill="url(#offerLineGrad)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap gap-2">
          {progression.slice(-4).map((p, i) => (
            <div key={i} className="px-3 py-1.5 bg-surface-container-low rounded-lg flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-[10px] font-bold text-on-surface-variant">{p.time}</span>
              <span className="text-[10px] font-extrabold text-primary">{formatINR(p.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}