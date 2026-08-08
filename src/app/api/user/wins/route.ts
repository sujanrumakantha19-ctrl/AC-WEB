import { NextRequest } from "next/server";
import Auction from "@/models/Auction";
import { ok, route, requireUser } from "@/lib/api-helpers";

export const GET = route(async (request: NextRequest) => {
  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;

  const count = await Auction.countDocuments({ status: "ENDED", winner: auth.userId });

  return ok({ count });
});
