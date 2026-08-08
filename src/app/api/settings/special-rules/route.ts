import { NextRequest } from "next/server";
import Setting from "@/models/Setting";
import { ok, route, requireAdmin } from "@/lib/api-helpers";

const KEY = "special-auction-rules";

export const GET = route(async () => {
  const setting = await Setting.findOne({ key: KEY });
  return ok({ value: setting?.value || "" });
});

export const PUT = route(async (request: NextRequest) => {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  const body = await request.json();
  const value = typeof body.value === "string" ? body.value : "";

  const setting = await Setting.findOneAndUpdate(
    { key: KEY },
    { key: KEY, value },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return ok({ value: setting?.value || "" });
});
