import React from "react";
import { PublicAuctionDetailsClient } from "@/components/pages/public-auction-details-client";

export const dynamic = "force-dynamic";

export default async function PublicAuctionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PublicAuctionDetailsClient id={id} />;
}
