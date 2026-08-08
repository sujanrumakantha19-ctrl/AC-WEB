import React from "react";
import { Badge } from "@/components/ui/badge";

export type RoundStatus = "active" | "completed" | "paused" | "pending";

export function RoundStatusBadge({ status }: { status: RoundStatus | string }) {
  switch (status) {
    case "active":
      return (
        <Badge variant="live" pulse>
          LIVE
        </Badge>
      );
    case "completed":
      return <Badge variant="success">COMPLETED</Badge>;
    case "paused":
      return (
        <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
          PAUSED
        </span>
      );
    default:
      return <span className="text-[10px] font-medium text-outline">PENDING</span>;
  }
}
