import React from "react";
import Link from "next/link";
import { getAuctions } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const auctions = await getAuctions({ limit: 50 });

  return (
    <div className="space-y-unit-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">Dashboard</h1>
          <p className="text-body-md text-on-surface-variant">
            Platform control center for managing live auctions, dealer KYC approvals, and escrow payouts.
          </p>
        </div>
        <Link href="/admin/auctions/create">
          <Button variant="primary">
            <span className="material-symbols-outlined mr-2">add_circle</span>
            Create New Auction
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl card-shadow space-y-1">
          <p className="text-label-md font-medium text-on-surface-variant">Gross Sales Volume</p>
          <p className="text-display-md font-bold text-primary">₹48.2 Cr</p>
          <span className="text-xs text-emerald-600 font-medium">↑ +18.4% this month</span>
        </div>
        <div className="bg-white p-5 rounded-2xl card-shadow space-y-1">
          <p className="text-label-md font-medium text-on-surface-variant">Active Live Rooms</p>
          <p className="text-display-md font-bold text-on-surface">
            {auctions.filter((a: any) => a.status === "LIVE").length}
          </p>
          <span className="text-xs text-outline">Across Multiple Hubs</span>
        </div>
        <div className="bg-white p-5 rounded-2xl card-shadow space-y-1">
          <p className="text-label-md font-medium text-on-surface-variant">Total Auctions</p>
          <p className="text-display-md font-bold text-primary">{auctions.length}</p>
          <span className="text-xs text-outline">All time listings</span>
        </div>
        <div className="bg-white p-5 rounded-2xl card-shadow space-y-1">
          <p className="text-label-md font-medium text-on-surface-variant">Platform Fee Revenue</p>
          <p className="text-display-md font-bold text-emerald-700">₹1.44 Cr</p>
          <span className="text-xs text-outline">3% Commission Rate</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-unit-lg space-y-unit-md card-shadow">
        <div className="flex justify-between items-center">
          <h2 className="text-headline-md font-bold text-on-surface">Manage Platform Auctions</h2>
          <Button variant="outline" size="sm">
            <span className="material-symbols-outlined text-sm mr-1">download</span>
            Export CSV
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 text-label-md font-semibold text-on-surface-variant bg-surface-container-low">
                <th className="py-3 px-4">Lot ID</th>
                <th className="py-3 px-4">Vehicle Title</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Starting offer price</th>
                <th className="py-3 px-4">Offers</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-body-md text-on-surface">
              {auctions.map((auction: any) => (
                <tr key={auction._id || auction.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-4 px-4 font-bold text-primary-container">{auction.lotNumber}</td>
                  <td className="py-4 px-4 font-semibold">{auction.title}</td>
                  <td className="py-4 px-4 text-on-surface-variant text-sm">{auction.location}</td>
                  <td className="py-4 px-4 font-bold text-primary">{formatINR(auction.currentOffer || auction.startingOffer)}</td>
                  <td className="py-4 px-4 text-sm">{auction.totalOffers}</td>
                  <td className="py-4 px-4">
                    <Badge variant={auction.status === "LIVE" ? "live" : "secondary"} pulse={auction.status === "LIVE"}>
                      {auction.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <Link href={`/auctions/${auction.id || auction._id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
