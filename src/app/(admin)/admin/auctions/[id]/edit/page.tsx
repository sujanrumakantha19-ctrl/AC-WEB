"use client";

import React from "react";
import AuctionForm from "@/components/pages/auction-form";

export default function EditAuctionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <AuctionForm auctionId={id} />;
}
