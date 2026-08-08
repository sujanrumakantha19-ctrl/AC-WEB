import React from "react";
import { AuctionDetailsClient } from "@/components/pages/auction-details-client";

export default async function AuctionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <AuctionDetailsClient id={resolvedParams.id} />;
}
