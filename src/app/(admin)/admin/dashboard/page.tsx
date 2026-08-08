"use client";

import React from "react";
import Link from "next/link";
import { useGetAuctionsQuery } from "@/services/auctions-api";
import { useGetAdminUsersQuery } from "@/services/admin-api";
import { LiveAuctionGraph } from "@/components/ui/live-auction-graph";

export default function AdminExecutiveDashboardPage() {
  const { data: auctionsData } = useGetAuctionsQuery({ limit: 100 });
  const { data: usersData } = useGetAdminUsersQuery();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const allAuctions = auctionsData?.auctions || [];
  const allUsers = usersData?.users || [];

  const monthAuctions = allAuctions.filter(
    (a) => a.createdAt && new Date(a.createdAt) >= monthStart
  );
  const monthUsers = allUsers.filter(
    (u) => u.createdAt && new Date(u.createdAt) >= monthStart
  );

  const liveCount = allAuctions.filter((a) => a.status === "LIVE").length;
  const upcomingCount = allAuctions.filter((a) => a.status === "UPCOMING").length;
  const endedCount = allAuctions.filter((a) => a.status === "ENDED").length;
  const metrics = {
    newUsers: monthUsers.length,
    liveAuctions: liveCount,
    upcomingAuctions: upcomingCount,
    endedAuctions: endedCount,
    totalAuctions: allAuctions.length,
  };

  const topMetrics = [
    { title: "Live Auctions", value: metrics.liveAuctions.toString(), icon: "sensors", iconBg: "bg-red-50 text-red-600", href: "/admin/auctions?status=LIVE" },
    { title: "Upcoming", value: metrics.upcomingAuctions.toString(), icon: "event", iconBg: "bg-purple-50 text-purple-600", href: "/admin/auctions?status=UPCOMING" },
    { title: "Ended", value: metrics.endedAuctions.toString(), icon: "check_circle", iconBg: "bg-emerald-50 text-emerald-600", href: "/admin/auctions?status=ENDED" },
    { title: "Total Auctions", value: metrics.totalAuctions.toString(), icon: "gavel", iconBg: "bg-amber-50 text-amber-600", href: "/admin/auctions" },
    { title: "New Users", value: metrics.newUsers.toLocaleString(), icon: "group", iconBg: "bg-blue-50 text-blue-600", href: "/admin/users" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">Dashboard</h1>
          <p className="text-xs text-on-surface-variant mt-1">{monthLabel} analytics for VKS Autoservices</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {topMetrics.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className="bg-white p-4 rounded-2xl shadow-xs space-y-2 hover:shadow-md hover:ring-1 hover:ring-primary/20 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.iconBg}`}>
                <span className="material-symbols-outlined text-base">{item.icon}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant">{item.title}</p>
              <p className="text-lg font-extrabold">{item.value}</p>
              <p className="text-[10px] text-on-surface-variant font-medium">{monthLabel}</p>
            </div>
          </Link>
        ))}
      </div>

      <LiveAuctionGraph />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/auctions/create" className="p-4 bg-surface-container-low rounded-xl hover:bg-primary/5 text-center">
              <span className="material-symbols-outlined text-2xl text-primary">add_circle</span>
              <p className="text-xs font-bold mt-2">Create Auction</p>
            </Link>
            <Link href="/admin/auctions" className="p-4 bg-surface-container-low rounded-xl hover:bg-primary/5 text-center">
              <span className="material-symbols-outlined text-2xl text-primary">gavel</span>
              <p className="text-xs font-bold mt-2">All Auctions</p>
            </Link>
            <Link href="/admin/users" className="p-4 bg-surface-container-low rounded-xl hover:bg-primary/5 text-center">
              <span className="material-symbols-outlined text-2xl text-primary">group</span>
              <p className="text-xs font-bold mt-2">Users</p>
            </Link>
            <Link href="/admin/profile" className="p-4 bg-surface-container-low rounded-xl hover:bg-primary/5 text-center">
              <span className="material-symbols-outlined text-2xl text-primary">settings</span>
              <p className="text-xs font-bold mt-2">Settings</p>
            </Link>
          </div>
        </div>

        <div className="bg-primary text-white p-6 rounded-2xl shadow-lg space-y-4">
          <h3 className="text-sm font-extrabold">Auction Status · {monthLabel}</h3>
          <div className="space-y-3">
            {[
              { label: "Live", value: metrics.liveAuctions, color: "bg-red-500" },
              { label: "Upcoming", value: metrics.upcomingAuctions, color: "bg-purple-400" },
              { label: "Ended", value: metrics.endedAuctions, color: "bg-emerald-400" },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs">
                  <span className="text-white/70">{s.label}</span>
                  <span className="font-extrabold">{s.value}</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full mt-1">
                  <div className={`${s.color} h-2 rounded-full`} style={{ width: `${metrics.totalAuctions > 0 ? (s.value / metrics.totalAuctions) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
