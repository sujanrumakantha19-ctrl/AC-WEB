import React from "react";
import { UserLiveRoomClient } from "@/components/pages/user-live-room-client";

export default async function UserLiveOfferingRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <UserLiveRoomClient id={resolvedParams.id} />;
}
